/**
 * Copyright 2022 Charge Net Stations and Contributors.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import {
  CodePipeline,
  CodePipelineSource,
  ShellStep,
} from "aws-cdk-lib/pipelines";

export class OcppPipeline extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);
  }

  pipeline = new CodePipeline(this, "Pipeline", {
    pipelineName: 'OcppPipeline',
    synth: new ShellStep("Synth", {
      input: CodePipelineSource.gitHub(
        "ocpp-cloud-connector/connector-serverless",
        "main"
      ),
      commands: ["npx cdk synth"],
    }),
  });
}
