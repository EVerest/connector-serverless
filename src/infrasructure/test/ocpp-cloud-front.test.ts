/**
 * Copyright 2022 Charge Net Stations and Contributors.
 * SPDX-License-Identifier: Apache-2.0
 */

import * as cdk from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { OcppCloudfrontStack } from '../lib/ocpp-cloud-front';

describe('Ocpp Service Stack Tests', () => {
    const app = new cdk.App();
    const stack = new OcppCloudfrontStack(app, 'ocpp-cf-stack', { endpoint: 'an-endpoint', env: { region: "us-east-1" } });
    const template = Template.fromStack(stack);

    test('Tests', () => {

    });
});