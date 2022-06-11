/**
 * Copyright 2022 Charge Net Stations and Contributors.
 * SPDX-License-Identifier: Apache-2.0
 */

import * as cdk from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { OcppCloudfrontStack } from '../lib/ocpp-cloud-front';

describe('Ocpp Service Stack Tests', () => {
    const app = new cdk.App();
    const stack = new OcppCloudfrontStack(app, 'ocpp-cf-stack', { stage: "a-stage", env: { region: "us-east-1"} });
    const template = Template.fromStack(stack);

    test('has an Origin Policy and proper config', () => {
        template.hasResourceProperties('AWS::CloudFront::OriginRequestPolicy', {
            "OriginRequestPolicyConfig": {
                "CookiesConfig": {
                    "CookieBehavior": "none"
                },
                "HeadersConfig": {
                    "HeaderBehavior": "whitelist",
                    "Headers": [
                        "Sec-WebSocket-Key",
                        "Sec-WebSocket-Version",
                        "Sec-WebSocket-Protocol",
                        "Sec-WebSocket-Accept"
                    ]
                },
                "Name": "ocpp-websocket-policy",
                "QueryStringsConfig": {
                    "QueryStringBehavior": "all"
                }
            }
        });
    });

    test('has a path to query function', () => {
        template.hasResourceProperties('AWS::Lambda::Function', {
            "Handler": "app.handler",
            "Runtime": "nodejs14.x"
        });
    });

    test('one day log retention', () => {
        template.hasResourceProperties('Custom::LogRetention', {
            "RetentionInDays": 1
        });
    });

    test('has it a cloudfront distribution', () => {
        template.hasResourceProperties('AWS::CloudFront::Distribution', {
            "DistributionConfig": {
                "DefaultCacheBehavior": {
                    "Compress": true,
                    "LambdaFunctionAssociations": [
                        {
                            "EventType": "viewer-request",
                            "IncludeBody": true,
                        }
                    ],
                    "ViewerProtocolPolicy": "allow-all"
                },
                "Enabled": true,
                "HttpVersion": "http2",
                "IPV6Enabled": true,
                "Origins": [
                    {
                        "CustomOriginConfig": {
                            "OriginProtocolPolicy": "https-only",
                            "OriginSSLProtocols": [
                                "TLSv1.2"
                            ]
                        },
                    }
                ]
            }
        });
    });
});
