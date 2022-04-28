/**
 * Copyright 2022 Charge Net Stations and Contributors.
 * SPDX-License-Identifier: Apache-2.0
 */
import * as cdk from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { OcppServices } from '../lib/ocpp-services'

describe('Ocpp Service Stack Tests', () => {
    const app = new cdk.App();
    const stack = new OcppServices(app, 'ocpp-stack');
    const template = Template.fromStack(stack);

    test('Dynamo DB on connection Table', () => {
        template.hasResourceProperties('AWS::DynamoDB::Table', {
            TableName: 'evse-table'
        });
    });

    test('Dynamo DB Connection Table is pay per request', () => {
        template.hasResourceProperties('AWS::DynamoDB::Table', {
            "BillingMode": "PAY_PER_REQUEST",
        });
    });

    test('Dynamo DB Connection Table is destroyed on update and deletion', () => {
        template.hasResource('AWS::DynamoDB::Table', {
            "UpdateReplacePolicy": "Delete",
            "DeletionPolicy": "Delete"
        });
    });

    test('connect lambda created and tagged', () => {
        template.hasResourceProperties('AWS::Lambda::Function', {
            "Description": "connect",
            "Timeout": 5,
            "MemorySize": 256,
            "Environment": {
                "Variables": {
                    "TABLE_NAME": "evse-table"
                    // TOPIC_ARN
                }
            },
        });
    });

    test('connect topic', () => {
        template.hasResourceProperties('AWS::SNS::Topic', {
            "DisplayName": "connection-topic"
        });
    });

    test('connect queue', () => {
        template.hasResourceProperties('AWS::SQS::Queue', {
            "QueueName": "connection-queue"
        });
    });

    test('connect topic to queue subscription', () => {
        template.hasResourceProperties('AWS::SNS::Subscription', {
            "TopicArn": {
                "Ref": "connectiontopicB7751A6F"
            },
            "Protocol": "sqs",
        });
    });

    test('disconnect lambda created', () => {
        template.hasResourceProperties('AWS::Lambda::Function', {
            "Description": "disconnect",
            "Timeout": 5,
            "MemorySize": 256,
            "Environment": {
                "Variables": {
                    "TABLE_NAME": "evse-table"
                    // TOPIC_ARN
                }
            },
        });
    });

    test('API Gateway created', () => {
        template.hasResourceProperties('AWS::ApiGatewayV2::Api', {
            "Name": "ocpp-websocket-gateway",
            "ProtocolType": "WEBSOCKET",
            "RouteSelectionExpression": "$request.body.[2]"
        });
    });
});
