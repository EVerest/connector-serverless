/**
 * Copyright 2022 Charge Net Stations and Contributors.
 * SPDX-License-Identifier: Apache-2.0
 */
import { Fn, Stack, StackProps } from "aws-cdk-lib";
import {
  OriginRequestPolicy,
  OriginRequestCookieBehavior,
  OriginRequestHeaderBehavior,
  OriginRequestQueryStringBehavior,
  experimental,
  Distribution,
  CachePolicy,
  LambdaEdgeEventType,
} from "aws-cdk-lib/aws-cloudfront";
import { HttpOrigin } from "aws-cdk-lib/aws-cloudfront-origins";
import { Runtime, AssetCode } from "aws-cdk-lib/aws-lambda";
import { RetentionDays } from "aws-cdk-lib/aws-logs";
import { Construct } from "constructs";

const NODE_RUNTIME_VERSION = Runtime.NODEJS_14_X;
const HANDLER = "app.handler";

export interface OcppCloudfrontStackProps extends StackProps {
  stage: string;
}

export class OcppCloudfrontStack extends Stack {
  constructor(scope: Construct, id: string, props: OcppCloudfrontStackProps) {
    super(scope, id, props);

    const ocppOriginRequestPolicy = new OriginRequestPolicy(
      this,
      "ocpp-websocket-policy",
      {
        originRequestPolicyName: "ocpp-websocket-policy",
        cookieBehavior: OriginRequestCookieBehavior.none(),
        headerBehavior: OriginRequestHeaderBehavior.allowList(
          "Sec-WebSocket-Key",
          "Sec-WebSocket-Version",
          "Sec-WebSocket-Protocol",
          "Sec-WebSocket-Accept"
        ),
        queryStringBehavior: OriginRequestQueryStringBehavior.all(),
      }
    );

    const pathToQueryParam = new experimental.EdgeFunction(
      this,
      "path-to-query-param-edge-lambda-stack-us-east-1",
      {
        runtime: NODE_RUNTIME_VERSION,
        handler: HANDLER,
        code: new AssetCode("../functions/path-to-query-param"),
        stackId: "path-to-query-param-edge-lambda-stack-us-east-1",
        logRetention: RetentionDays.ONE_DAY
      }
    );

    const ocppCloudFrontDistribution = new Distribution(
      this,
      "ocpp-cloud-front-distribution",
      {
        defaultBehavior: {
          origin: new HttpOrigin(
            Fn.select(2, Fn.split("/", Fn.importValue("websocket-callback-url")))
          ),
          cachePolicy: CachePolicy.CACHING_DISABLED,
          originRequestPolicy: ocppOriginRequestPolicy,
          edgeLambdas: [
            {
              functionVersion: pathToQueryParam.currentVersion,
              eventType: LambdaEdgeEventType.VIEWER_REQUEST,
              includeBody: true,
            },
          ],
        },
      }
    );
  }
}
