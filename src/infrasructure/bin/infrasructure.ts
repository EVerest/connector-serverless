#!/usr/bin/env node
import "source-map-support/register";

import { OcppServices as OcppCentralSystemStack } from "../lib/ocpp-services";
import { OcppCloudfrontStack } from "../lib/ocpp-cloud-front";
import { App, Stack, StackProps, Stage, StageProps } from "aws-cdk-lib";
import { Construct } from "constructs/lib/construct";
import {
  CodePipeline,
  CodePipelineSource,
  ShellStep,
} from "aws-cdk-lib/pipelines";

// Must bootstrap region us-east-1 for this to deploy properly
// cdk bootstrap aws://aws-account-number/us-east-1

const ocpp = new App();

class OcppPipeline extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const pipeline = new CodePipeline(this, "Pipeline", {
      synth: new ShellStep("Synth", {
        input: CodePipelineSource.gitHub(
          "ocpp-cloud-connector/connector-serverless",
          "main",
        ),
        commands: ["npm ci", "npm run build", "npx cdk synth"],
        primaryOutputDirectory: 'src/infrastructure/cdk.out',
      }),
    });

    pipeline.addStage(
      new OcppServicesApp(this, "ocpp-cc", {
        env: props?.env,
        stage: "dev",
      })
    );
  }
}

interface OcppStageProps extends StageProps {
  stage: string;
}

class OcppServicesApp extends Stage {
  constructor(scope: Construct, id: string, props: OcppStageProps) {
    super(scope, id, props);

    new OcppCentralSystemStack(this, "ocpp-services", {
      env: props.env,
      stage: props.stage,
    });

    new OcppCloudfrontStack(this, "ocpp-cloudfront", {
      env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: "us-east-1" },
      stage: props.stage,
    });
  }
}

new OcppPipeline(ocpp, "ocpp-pipeline", {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: "us-east-1",
  },
});
