/**
 * Static values that do not depend on resources defined in our project are defined here and used from each stack.
 * Dynamic variables that depend on resources should be passed to each stack as props.
 */

import * as cdk from "aws-cdk-lib";

export const app = new cdk.App();

// Define common configuration values for the project.
export const projectName: string = "stunning-autumn-foliage";

export const envCodes = ["dev", "tst", "prd"] as const;
export type EnvCode = (typeof envCodes)[number];

const getDeployEnv = () => {
  const env = app.node.tryGetContext("deployEnv");
  if (envCodes.includes(env as EnvCode)) {
    return env as EnvCode;
  }
  return "dev";
};
export let deployEnv: EnvCode = getDeployEnv();

// Define different settings for each deployment environment in the project.
export interface EnvConfig {
  branch: string;
  apiDomain: string;
  certificateArn: string;
  githubToken: string;
  googleMapsApiKey: string;
}

export const envConfig: Record<EnvCode, EnvConfig> = {
  dev: {
    branch: "main",
    apiDomain: "pesh-igpjt.com",
    certificateArn:
      "arn:aws:acm:ap-northeast-1:551152530614:certificate/78e1479b-2bb2-4f89-8836-a8ff91227dfb",
    githubToken: "",
    googleMapsApiKey: "",
  },
  tst: {
    branch: "main",
    apiDomain: "pesh-igpjt.com",
    certificateArn:
      "arn:aws:acm:ap-northeast-1:551152530614:certificate/78e1479b-2bb2-4f89-8836-a8ff91227dfb",
    githubToken: "",
    googleMapsApiKey: "",
  },
  prd: {
    branch: "main",
    apiDomain: "pesh-igpjt.com",
    certificateArn:
      "arn:aws:acm:ap-northeast-1:551152530614:certificate/78e1479b-2bb2-4f89-8836-a8ff91227dfb",
    githubToken: "",
    googleMapsApiKey: "",
  },
};

export const config: EnvConfig = envConfig[deployEnv];

// Get Value from context
config.githubToken = app.node.tryGetContext("githubToken");
config.googleMapsApiKey = app.node.tryGetContext("googleMapsApiKey");
