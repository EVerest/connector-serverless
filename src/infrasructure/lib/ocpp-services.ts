/**
 * Copyright 2022 Charge Net Stations and Contributors.
 * SPDX-License-Identifier: Apache-2.0
 */
import { Duration, RemovalPolicy, Stack, StackProps } from "aws-cdk-lib";
import { CfnOutput } from "aws-cdk-lib";
import {
  AttributeType,
  BillingMode,
  ProjectionType,
  Table,
  StreamViewType,
} from "aws-cdk-lib/aws-dynamodb";
import {
  Code,
  LayerVersion,
  Runtime,
  StartingPosition,
} from "aws-cdk-lib/aws-lambda";
import { RetentionDays } from "aws-cdk-lib/aws-logs";
import { Construct } from "constructs";
import { WebSocketApi, WebSocketStage } from "@aws-cdk/aws-apigatewayv2-alpha";
import { WebSocketLambdaIntegration } from "@aws-cdk/aws-apigatewayv2-integrations-alpha";
import { Topic } from "aws-cdk-lib/aws-sns";
import {
  SqsSubscription,
  SqsSubscriptionProps,
} from "aws-cdk-lib/aws-sns-subscriptions";
import { Queue } from "aws-cdk-lib/aws-sqs";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import * as path from "path";
import { DynamoEventSource } from "aws-cdk-lib/aws-lambda-event-sources";

const NODE_RUNTIME_VERSION = Runtime.NODEJS_14_X;

export interface OcppServicesStackProps extends StackProps {
  stage: string;
}

export class OcppServices extends Stack {
  constructor(scope: Construct, id: string, props: OcppServicesStackProps) {
    super(scope, id, props);
    const stage = props.stage;

    const sqsSubscriptionProps: SqsSubscriptionProps = {
      rawMessageDelivery: true,
    };

    const ocppQueue = new Queue(this, "ocpp-queue", {
      queueName: "ocpp-queue",
    });
    const ocppTopic = new Topic(this, "ocpp-topic", {
      displayName: "ocpp-topic",
    });
    const ocppSubscription: SqsSubscription = new SqsSubscription(
      ocppQueue,
      sqsSubscriptionProps
    );
    ocppTopic.addSubscription(ocppSubscription);

    const defaultLambdaQueue = new Queue(this, "default-lambda-queue", {
      queueName: "default-lambda-queue",
    });
    const defaultLambdaTopic = new Topic(this, "default-lambda-topic", {
      displayName: "default-lambda-topic",
    });
    const defaultLambdaSubscription: SqsSubscription = new SqsSubscription(
      defaultLambdaQueue,
      sqsSubscriptionProps
    );
    defaultLambdaTopic.addSubscription(defaultLambdaSubscription);

    const config = new LayerVersion(this, "config", {
      code: Code.fromAsset("../functions/layers/config"),
      compatibleRuntimes: [Runtime.NODEJS_12_X, Runtime.NODEJS_14_X],
      description: "shared config layer for service lambdas",
    });

    const evseTableName = "evse";
    const evseTable = new Table(this, evseTableName, {
      billingMode: BillingMode.PAY_PER_REQUEST,
      tableName: evseTableName,
      removalPolicy: RemovalPolicy.DESTROY,
      partitionKey: {
        name: "chargeBoxConnectorId",
        type: AttributeType.STRING,
      },
      stream: StreamViewType.NEW_AND_OLD_IMAGES,
    });
    evseTable.addGlobalSecondaryIndex({
      indexName: "GSI1",
      partitionKey: { name: "connectionId", type: AttributeType.STRING },
      projectionType: ProjectionType.ALL,
    });

    const eventProducer = new NodejsFunction(this, "event-producer", {
      entry: path.join(__dirname, "../../functions/event-producer/index.ts"),
      bundling: {
        minify: true,
        externalModules: ["aws-sdk"],
      },
      layers: [config],
      runtime: NODE_RUNTIME_VERSION,
      description: "event-producer",
      timeout: Duration.seconds(5),
      memorySize: 128,
      environment: { TOPIC_ARN: ocppTopic.topicArn },
      logRetention: RetentionDays.ONE_DAY,
    });
    eventProducer.addEventSource(
      new DynamoEventSource(evseTable, {
        startingPosition: StartingPosition.LATEST,
      })
    );
    ocppTopic.grantPublish(eventProducer);

    const connect = new NodejsFunction(this, "connect", {
      entry: path.join(__dirname, "../../functions/connect/index.ts"),
      bundling: {
        minify: true,
        externalModules: ["aws-sdk"],
      },
      layers: [config],
      runtime: NODE_RUNTIME_VERSION,
      description: "connect",
      timeout: Duration.seconds(5),
      memorySize: 256,
      environment: { TABLE_NAME: evseTableName },
      logRetention: RetentionDays.ONE_DAY,
    });
    evseTable.grantReadWriteData(connect);

    const disconnect = new NodejsFunction(this, "disconnect", {
      entry: path.join(__dirname, "../../functions/disconnect/index.ts"),
      bundling: {
        minify: true,
        externalModules: ["aws-sdk"],
      },
      runtime: NODE_RUNTIME_VERSION,
      description: "disconnect",
      timeout: Duration.seconds(5),
      memorySize: 256,
      environment: { TABLE_NAME: evseTableName },
      logRetention: RetentionDays.ONE_DAY,
    });
    evseTable.grantReadWriteData(disconnect);

    const defaultLambda = new NodejsFunction(this, "default-lambda", {
      entry: path.join(__dirname, "../../functions/default-lambda/index.ts"),
      bundling: {
        minify: true,
        externalModules: ["aws-sdk"],
      },
      runtime: NODE_RUNTIME_VERSION,
      description: "default-lambda",
      timeout: Duration.seconds(5),
      memorySize: 256,
      environment: {
        TABLE_NAME: evseTableName,
        TOPIC_ARN: defaultLambdaTopic.topicArn,
      },
      logRetention: RetentionDays.ONE_DAY,
    });
    evseTable.grantReadWriteData(defaultLambda);

    const webSocketApi = new WebSocketApi(this, "ocpp-websocket-gateway", {
      connectRouteOptions: {
        integration: new WebSocketLambdaIntegration(
          "ConnectIntegration",
          connect
        ),
      },
      disconnectRouteOptions: {
        integration: new WebSocketLambdaIntegration(
          "DisconnectIntegration",
          disconnect
        ),
      },
      defaultRouteOptions: {
        integration: new WebSocketLambdaIntegration(
          "DefaultIntegration",
          defaultLambda
        ),
      },
      routeSelectionExpression: "$request.body.[2]",
    });

    const wsStage = new WebSocketStage(this, "ws-stage", {
      webSocketApi,
      stageName: stage,
      autoDeploy: true,
    });

    const buildOcppService = (name: string, action: string): NodejsFunction => {
      const service = new NodejsFunction(this, name, {
        entry: path.join(__dirname, "../../functions/" + name + "/index.ts"),
        bundling: {
          minify: true,
          externalModules: ["aws-sdk"],
        },
        layers: [config],
        runtime: NODE_RUNTIME_VERSION,
        description: name,
        timeout: Duration.seconds(5),
        memorySize: 256,
        environment: {
          TABLE_NAME: evseTableName,
          CLIENT_ENDPOINT: wsStage.callbackUrl,
        },
        logRetention: RetentionDays.ONE_DAY,
      });
      evseTable.grantReadWriteData(service);
      webSocketApi.addRoute(action, {
        integration: new WebSocketLambdaIntegration(action, service),
      });
      webSocketApi.grantManageConnections(service);
      return service;
    };

    buildOcppService("status-notification", "StatusNotification");
    buildOcppService("stop-transaction", "StopTransaction");
    buildOcppService("start-transaction", "StartTransaction");
    buildOcppService("boot-notification", "BootNotification");

    new CfnOutput(this, 'websocket-callback-url', {
      value: wsStage.callbackUrl,
      exportName: 'websocket-callback-url'
    });

  }
}
