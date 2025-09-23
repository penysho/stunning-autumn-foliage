#!/usr/bin/env node
import "source-map-support/register";
import { app, deployEnv, projectName } from "../config/config";
import { StunningAutumnFoliageStack } from "../lib/stunning-autumn-foliage";
import { VpcStack } from "../lib/vpc";

const envProps = {
  account: process.env.CDK_DEFAULT_ACCOUNT,
  region: process.env.CDK_DEFAULT_REGION,
};

// VPC
const vpcStack = new VpcStack(app, `${projectName}-${deployEnv}-vpc`, {
  env: envProps,
});

// Create main application stack
new StunningAutumnFoliageStack(app, `${projectName}-${deployEnv}-main`, {
  env: envProps,
  vpcStack: vpcStack,
  // Stack metadata
  description: `Stunning Autumn Foliage application infrastructure for ${deployEnv} environment`,
  tags: {
    Project: projectName,
    Environment: deployEnv,
    ManagedBy: "CDK",
  },
});

// Apply CDK Nag for security best practices
// if (process.env.ENABLE_CDK_NAG !== "false") {
//   cdk.Aspects.of(app).add(new AwsSolutionsChecks({ verbose: true }));
// }

// app.synth();
