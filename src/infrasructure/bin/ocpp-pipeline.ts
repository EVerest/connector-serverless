/**
 * Copyright 2022 Charge Net Stations and Contributors.
 * SPDX-License-Identifier: Apache-2.0
 */

import { App } from "aws-cdk-lib";
import { OcppPipeline } from "../lib/ocpp-pipeline-stack";

const ocpp = new App();
new OcppPipeline(ocpp, "OcppPipelineStack", {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  },
});

ocpp.synth();
