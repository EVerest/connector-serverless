/**
 * Copyright 2022 Charge Net Stations and Contributors.
 * SPDX-License-Identifier: Apache-2.0
 */
import { Duration, RemovalPolicy, Stack, StackProps } from 'aws-cdk-lib';
import { AttributeType, BillingMode, Table } from 'aws-cdk-lib/aws-dynamodb';
import { Code, LayerVersion, Runtime } from 'aws-cdk-lib/aws-lambda';
import { RetentionDays } from 'aws-cdk-lib/aws-logs';
import { Construct } from 'constructs';
import { WebSocketApi, WebSocketStage } from '@aws-cdk/aws-apigatewayv2-alpha';
import { WebSocketLambdaIntegration } from '@aws-cdk/aws-apigatewayv2-integrations-alpha';
import { Topic } from 'aws-cdk-lib/aws-sns';
import { SqsSubscription, SqsSubscriptionProps } from 'aws-cdk-lib/aws-sns-subscriptions';
import { Queue } from 'aws-cdk-lib/aws-sqs';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import * as path from 'path';

const NODE_RUNTIME_VERSION = Runtime.NODEJS_14_X;

export class OcppServices extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const sqsSubscriptionProps: SqsSubscriptionProps = { rawMessageDelivery: true }
    const connectionQueue = new Queue(this, 'connection-queue', { queueName: 'connection-queue' });
    const connectionTopic = new Topic(this, 'connection-topic', { displayName: 'connection-topic' });
    const connectionSubscription: SqsSubscription = new SqsSubscription(connectionQueue, sqsSubscriptionProps);
    connectionTopic.addSubscription(connectionSubscription);

    const loggingLayer = new LayerVersion(this, 'logging-layer', {
      code: Code.fromAsset('../functions/layers/logging'),
      compatibleRuntimes: [
        Runtime.NODEJS_12_X,
        Runtime.NODEJS_14_X
      ],
      description: 'shared logging layer for service lambdas'
    })

    const evseTableName = 'evse-table'
    const evseTable = new Table(this, evseTableName, {
      billingMode: BillingMode.PAY_PER_REQUEST,
      tableName: evseTableName,
      removalPolicy: RemovalPolicy.DESTROY,
      partitionKey: { name: "chargeBoxId", type: AttributeType.STRING }
    });

    const connect = new NodejsFunction(this, 'connect', {
      entry: path.join(__dirname, '../../functions/connect/index.ts'),
      bundling: {
        minify: true,
        externalModules: ['aws-sdk'],
      },
      layers: [loggingLayer],
      runtime: NODE_RUNTIME_VERSION,
      description: 'connect',
      timeout: Duration.seconds(5),
      memorySize: 256,
      environment: { TABLE_NAME: evseTableName, TOPIC_ARN: connectionTopic.topicArn },
      logRetention: RetentionDays.ONE_DAY
    });
    evseTable.grantReadWriteData(connect);

    const disconnect = new NodejsFunction(this, 'disconnect', {
      entry: path.join(__dirname, '../../functions/disconnect/index.ts'),
      bundling: {
        minify: true,
        externalModules: ['aws-sdk'],
      },
      runtime: NODE_RUNTIME_VERSION,
      description: 'disconnect',
      timeout: Duration.seconds(5),
      memorySize: 256,
      environment: { TABLE_NAME: evseTableName, TOPIC_ARN: connectionTopic.topicArn },
      logRetention: RetentionDays.ONE_DAY
    });
    evseTable.grantReadWriteData(disconnect);

    const webSocketApi = new WebSocketApi(this, 'ocpp-websocket-gateway', {
      connectRouteOptions: { integration: new WebSocketLambdaIntegration('ConnectIntegration', connect) },
      disconnectRouteOptions: { integration: new WebSocketLambdaIntegration('DisconnectIntegration', disconnect) },
      // defaultRouteOptions     : { integration: new WebSocketLambdaIntegration('DefaultIntegration', defaultHandler) },
      routeSelectionExpression: '$request.body.[2]'
    });

    const stage = new WebSocketStage(this, 'dev-stage', {
      webSocketApi,
      stageName: 'dev',
      autoDeploy: true,
    });

  }
}
