/**
 * Copyright 2022 Charge Net Stations and Contributors.
 * SPDX-License-Identifier: Apache-2.0
 */
import * as cdk from "aws-cdk-lib";
import { Template } from "aws-cdk-lib/assertions";
import { OcppServices } from "../lib/ocpp-services";

describe("Ocpp Service Stack Tests", () => {
  const app = new cdk.App();
  const stack = new OcppServices(app, "ocpp-stack",{stage: 'a-stage'});
  const template = Template.fromStack(stack);

  test("Dynamo DB Connection Table", () => {
    template.hasResourceProperties("AWS::DynamoDB::Table", {
      TableName: "evse",
      BillingMode: "PAY_PER_REQUEST",
      StreamSpecification: {
        StreamViewType: "NEW_AND_OLD_IMAGES",
      },
    });
  });

  test("Dynamo DB Connection Table is destroyed on update and deletion", () => {
    template.hasResource("AWS::DynamoDB::Table", {
      UpdateReplacePolicy: "Delete",
      DeletionPolicy: "Delete",
    });
  });

  test("event producer event source mappping", () => {
    template.hasResourceProperties("AWS::Lambda::EventSourceMapping", {
      FunctionName: {
        Ref: "eventproducer3422C9D4",
      },
      BatchSize: 100,
      EventSourceArn: {
        "Fn::GetAtt": ["evse0EA01ED2", "StreamArn"],
      },
      StartingPosition: "LATEST",
    });
  });

  test("connect lambda created and tagged", () => {
    template.hasResourceProperties("AWS::Lambda::Function", {
      Description: "connect",
      Timeout: 5,
      MemorySize: 256,
      Handler: "index.handler",
      Runtime: "nodejs14.x",
      Environment: {
        Variables: {
          AWS_NODEJS_CONNECTION_REUSE_ENABLED: "1",
          // TOPIC_ARN
        },
      },
    });
  });

  test("event producer lambda created", () => {
    template.hasResourceProperties("AWS::Lambda::Function", {
      Description: "event-producer",
      Timeout: 5,
      MemorySize: 128,
      Handler: "index.handler",
      Runtime: "nodejs14.x",
      Environment: {
        Variables: {
          AWS_NODEJS_CONNECTION_REUSE_ENABLED: "1",
          // TOPIC_ARN
        },
      },
    });
  });

  test("ocpp topic", () => {
    template.hasResourceProperties("AWS::SNS::Topic", {
      DisplayName: "ocpp-topic",
    });
  });

  test("ocpp queue", () => {
    template.hasResourceProperties("AWS::SQS::Queue", {
      QueueName: "ocpp-queue",
    });
  });

  test("connect topic to queue subscription", () => {
    template.hasResourceProperties("AWS::SNS::Subscription", {
      TopicArn: {
        Ref: "ocpptopicBCCCA91E",
      },
      Protocol: "sqs",
    });
  });

  test("disconnect lambda created", () => {
    template.hasResourceProperties("AWS::Lambda::Function", {
      Description: "disconnect",
      Timeout: 5,
      MemorySize: 256,
      Handler: "index.handler",
      Runtime: "nodejs14.x",
      Environment: {
        Variables: {
          AWS_NODEJS_CONNECTION_REUSE_ENABLED: "1",
        },
        // TOPIC_ARN
      },
    });
  });

  test("default-lambda created", () => {
    template.hasResourceProperties("AWS::Lambda::Function", {
      Description: "default-lambda",
      Timeout: 5,
      MemorySize: 256,
      Handler: "index.handler",
      Runtime: "nodejs14.x",
      Environment: {
        Variables: {
          AWS_NODEJS_CONNECTION_REUSE_ENABLED: "1",
        },
        // TOPIC_ARN
      },
    });
  });

  test("boot-notification lambda created", () => {
    template.hasResourceProperties("AWS::Lambda::Function", {
      Description: "boot-notification",
      Timeout: 5,
      MemorySize: 256,
      Handler: "index.handler",
      Runtime: "nodejs14.x",
      Environment: {
        Variables: {
          AWS_NODEJS_CONNECTION_REUSE_ENABLED: "1",
        },
        // TOPIC_ARN
      },
    });
  });

  test("boot-notification route created", () => {
    template.hasResourceProperties("AWS::ApiGatewayV2::Route", {
      RouteKey: "BootNotification",
    });
  });

  test("start-transaction lambda created", () => {
    template.hasResourceProperties("AWS::Lambda::Function", {
      Description: "start-transaction",
      Timeout: 5,
      MemorySize: 256,
      Handler: "index.handler",
      Runtime: "nodejs14.x",
      Environment: {
        Variables: {
          AWS_NODEJS_CONNECTION_REUSE_ENABLED: "1",
        },
        // TOPIC_ARN
      },
    });
  });

  test("start transaction route created", () => {
    template.hasResourceProperties("AWS::ApiGatewayV2::Route", {
      RouteKey: "StartTransaction",
    });
  });

  test("stop-transaction lambda created", () => {
    template.hasResourceProperties("AWS::Lambda::Function", {
      Description: "stop-transaction",
      Timeout: 5,
      MemorySize: 256,
      Handler: "index.handler",
      Runtime: "nodejs14.x",
      Environment: {
        Variables: {
          AWS_NODEJS_CONNECTION_REUSE_ENABLED: "1",
        },
        // TOPIC_ARN
      },
    });
  });

  test("stop transaction route created", () => {
    template.hasResourceProperties("AWS::ApiGatewayV2::Route", {
      RouteKey: "StopTransaction",
    });
  });

  test("API Gateway created", () => {
    template.hasResourceProperties("AWS::ApiGatewayV2::Api", {
      Name: "ocpp-websocket-gateway",
      ProtocolType: "WEBSOCKET",
      RouteSelectionExpression: "$request.body.[2]",
    });
  });
});
