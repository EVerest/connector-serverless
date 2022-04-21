#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { InfrasructureStack } from '../lib/infrasructure-stack';

const app = new cdk.App();
new InfrasructureStack(app, 'InfrasructureStack', {
  env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.CDK_DEFAULT_REGION },
  });