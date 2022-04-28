#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';

import { OcppServices as OcppCentralSystemStack } from '../lib/ocpp-services';
import { OcppCloudfrontStack } from '../lib/ocpp-cloud-front';

const ocpp = new cdk.App();

const ocppConnector = new OcppCentralSystemStack(ocpp, 'ocpp-services', {
  env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.CDK_DEFAULT_REGION },
});

// Must bootstrap region us-east-1 for this to deploy properly
// cdk bootstrap aws://aws-account-number/us-east-1

const ocppCloudFront = new OcppCloudfrontStack(ocpp, 'ocpp-cloudfront', {
  env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: "us-east-1" },
  endpoint: 'ottk3t1xll', // domain fragment for now
});

//  