import * as cdk from "aws-cdk-lib";
import { CfnApp, CfnBranch } from "aws-cdk-lib/aws-amplify";
import { BuildSpec } from "aws-cdk-lib/aws-codebuild";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import * as ecs from "aws-cdk-lib/aws-ecs";
import * as elasticloadbalancingv2 from "aws-cdk-lib/aws-elasticloadbalancingv2";
import * as iam from "aws-cdk-lib/aws-iam";
import * as logs from "aws-cdk-lib/aws-logs";
import * as rds from "aws-cdk-lib/aws-rds";
import * as route53 from "aws-cdk-lib/aws-route53";
import * as targets from "aws-cdk-lib/aws-route53-targets";
import * as sm from "aws-cdk-lib/aws-secretsmanager";
import { Construct } from "constructs";
import { config, deployEnv, projectName } from "../config/config";
import { VpcStack } from "./vpc";

export interface StunningAutumnFoliageProps extends cdk.StackProps {
  vpcStack: VpcStack;
}

/**
 * Main application stack that orchestrates all the infrastructure components.
 * Implements cost-optimized architecture with Aurora Serverless v2, ECS Fargate (with Spot), and Amplify Hosting.
 */
export class StunningAutumnFoliageStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: StunningAutumnFoliageProps) {
    super(scope, id, props);

    const vpc = props.vpcStack.vpc;

    // Resources
    // ALB
    const loadBalancer = new elasticloadbalancingv2.ApplicationLoadBalancer(
      this,
      "LoadBalancer",
      {
        internetFacing: true,
        vpc,
        vpcSubnets: {
          subnets: vpc.publicSubnets,
        },
      }
    );

    const hostedZone = route53.HostedZone.fromLookup(this, "HostedZone", {
      domainName: config.apiDomain,
    });

    new route53.ARecord(this, "RecordSet", {
      recordName: `${projectName}-${deployEnv}-api`,
      zone: hostedZone,
      target: route53.RecordTarget.fromAlias(
        new targets.LoadBalancerTarget(loadBalancer)
      ),
      ttl: cdk.Duration.minutes(5),
    });

    const containerPort = 1337;

    // Listeners
    const elb443Listener = new elasticloadbalancingv2.ApplicationListener(
      this,
      "Elb443Listener",
      {
        loadBalancer: loadBalancer,
        // This creates a security group that allows access from the public
        open: true,
        defaultAction: elasticloadbalancingv2.ListenerAction.fixedResponse(
          403,
          { contentType: "text/plain" }
        ),
        port: 443,
        protocol: elasticloadbalancingv2.ApplicationProtocol.HTTPS,
        certificates: [
          {
            certificateArn: config.certificateArn,
          },
        ],
      }
    );

    // Target Groups
    const blueTargetGroup = new elasticloadbalancingv2.ApplicationTargetGroup(
      this,
      "BlueTargetGroup",
      {
        vpc,
        port: containerPort,
        protocol: elasticloadbalancingv2.ApplicationProtocol.HTTP,
        targetType: elasticloadbalancingv2.TargetType.IP,
        healthCheck: {
          path: "/api",
          port: containerPort.toString(),
          healthyHttpCodes: "404",
        },
      }
    );
    elb443Listener.addAction(`${projectName}-${deployEnv}-blue`, {
      priority: 1,
      conditions: [
        elasticloadbalancingv2.ListenerCondition.pathPatterns(["*"]),
      ],
      action: elasticloadbalancingv2.ListenerAction.forward([blueTargetGroup]),
    });

    // RDS
    const EXCLUDE_CHARACTERS = "\"@'%$#&().,{_?<≠^>[:;`+*!]}=~|¥/\\";
    const DATABASE_NAME = "stunning_autumn_foliage";

    // Security Group for RDS client
    const rdsClientSg = new ec2.SecurityGroup(this, `RdsClientSg`, {
      vpc,
      securityGroupName: `${projectName}-${deployEnv}-rds-client`,
      description: `${projectName}-${deployEnv} RDS Client Security Group.`,
      allowAllOutbound: true,
    });

    // RDS Admin User Secret
    const rdsAdminSecret = new sm.Secret(this, `RdsAdminSecret`, {
      secretName: `${projectName}-${deployEnv}/rds/admin-secret`,
      description: `${projectName}-${deployEnv} RDS Admin User Secret.`,
      generateSecretString: {
        excludeCharacters: EXCLUDE_CHARACTERS,
        generateStringKey: "password",
        passwordLength: 32,
        requireEachIncludedType: true,
        secretStringTemplate: '{"username": "postgresAdmin"}',
      },
    });

    // Generate additional keys for Strapi secrets
    const strapiJwtSecret = new sm.Secret(this, `StrapiJwtSecret`, {
      secretName: `${projectName}-${deployEnv}/strapi/jwt-secret`,
      description: `${projectName}-${deployEnv} Strapi JWT Secret.`,
      generateSecretString: {
        passwordLength: 64,
        requireEachIncludedType: true,
      },
    });

    const strapiAdminJwtSecret = new sm.Secret(this, `StrapiAdminJwtSecret`, {
      secretName: `${projectName}-${deployEnv}/strapi/admin-jwt-secret`,
      description: `${projectName}-${deployEnv} Strapi Admin JWT Secret.`,
      generateSecretString: {
        passwordLength: 64,
        requireEachIncludedType: true,
      },
    });

    const strapiApiTokenSalt = new sm.Secret(this, `StrapiApiTokenSalt`, {
      secretName: `${projectName}-${deployEnv}/strapi/api-token-salt`,
      description: `${projectName}-${deployEnv} Strapi API Token Salt.`,
      generateSecretString: {
        passwordLength: 64,
        requireEachIncludedType: true,
      },
    });

    const strapiTransferTokenSalt = new sm.Secret(
      this,
      `StrapiTransferTokenSalt`,
      {
        secretName: `${projectName}-${deployEnv}/strapi/transfer-token-salt`,
        description: `${projectName}-${deployEnv} Strapi Transfer Token Salt.`,
        generateSecretString: {
          passwordLength: 64,
          requireEachIncludedType: true,
        },
      }
    );

    const strapiEncryptionKey = new sm.Secret(this, `StrapiEncryptionKey`, {
      secretName: `${projectName}-${deployEnv}/strapi/encryption-key`,
      description: `${projectName}-${deployEnv} Strapi Encryption Key.`,
      generateSecretString: {
        passwordLength: 64,
        requireEachIncludedType: true,
      },
    });

    // Generate APP_KEYS as separate secrets for better management
    const strapiAppKey1 = new sm.Secret(this, `StrapiAppKey1`, {
      secretName: `${projectName}-${deployEnv}/strapi/app-key-1`,
      description: `${projectName}-${deployEnv} Strapi App Key 1.`,
      generateSecretString: {
        excludeCharacters: ",",
        passwordLength: 64,
        requireEachIncludedType: true,
      },
    });

    // RDS Subnet Group
    const subnetGroup = new rds.SubnetGroup(this, `SubnetGroup`, {
      description: `The subnet group to be used by Aurora in ${projectName}-${deployEnv}.`,
      vpc,
      subnetGroupName: `${projectName}-${deployEnv}`,
      // Make publicly accessible for development environments.
      vpcSubnets: vpc.selectSubnets({
        subnetType: ec2.SubnetType.PUBLIC,
      }),
    });

    // RDS Parameter Group
    const parameterGroupName = `${projectName}-${deployEnv}`;
    const parameterGroup = new rds.ParameterGroup(this, `ParameterGroup`, {
      engine: rds.DatabaseClusterEngine.auroraPostgres({
        version: rds.AuroraPostgresEngineVersion.VER_16_6,
      }),
      description: `${projectName}-${deployEnv} Parameter group for aurora-postgresql.`,
    });
    parameterGroup.bindToInstance({});
    const cfnParameterGroup = parameterGroup.node
      .defaultChild as rds.CfnDBParameterGroup;
    cfnParameterGroup.addPropertyOverride(
      "DBParameterGroupName",
      parameterGroupName
    );

    // RDS Cluster
    const rdsCluster = new rds.DatabaseCluster(this, `RdsCluster`, {
      engine: rds.DatabaseClusterEngine.auroraPostgres({
        version: rds.AuroraPostgresEngineVersion.VER_16_6,
      }),
      defaultDatabaseName: DATABASE_NAME,
      credentials: rds.Credentials.fromSecret(rdsAdminSecret),
      clusterIdentifier: `${projectName}-${deployEnv}-cluster`,
      deletionProtection: false,
      iamAuthentication: true,
      serverlessV2MaxCapacity: 1,
      serverlessV2MinCapacity: 0,
      storageEncrypted: true,
      subnetGroup,
      vpc,
      writer: rds.ClusterInstance.serverlessV2(`Writer`, {
        instanceIdentifier: `${projectName}-${deployEnv}-writer`,
        // Make publicly accessible for development environments.
        publiclyAccessible: true,
        parameterGroup,
      }),
      // https://docs.aws.amazon.com/AmazonRDS/latest/APIReference/API_CloudwatchLogsExportConfiguration.html
      cloudwatchLogsExports: ["postgresql"],
      cloudwatchLogsRetention: logs.RetentionDays.ONE_WEEK,
    });

    rdsCluster.connections.allowFrom(
      rdsClientSg,
      ec2.Port.tcp(5432),
      "Allow access to RDS from the RDS client security group"
    );

    // ECS
    // Cluster
    const cluster = new ecs.Cluster(this, "Cluster", {
      vpc,
      clusterName: `${projectName}-${deployEnv}`,
      containerInsightsV2: ecs.ContainerInsights.DISABLED,
    });

    // Log Group
    const logGroup = new logs.LogGroup(this, "LogGroup", {
      retention: logs.RetentionDays.THREE_MONTHS,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
    });

    // // Create EFS file system for Strapi uploads
    // const fileSystem = new efs.FileSystem(this, "StrapiFileSystem", {
    //   vpc: vpc,
    //   vpcSubnets: {
    //     subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
    //   },
    //   lifecyclePolicy: efs.LifecyclePolicy.AFTER_30_DAYS, // Cost optimization
    //   performanceMode: efs.PerformanceMode.GENERAL_PURPOSE,
    //   throughputMode: efs.ThroughputMode.BURSTING, // Cost-effective for typical usage
    //   removalPolicy:
    //     deployEnv === "prd"
    //       ? cdk.RemovalPolicy.RETAIN
    //       : cdk.RemovalPolicy.DESTROY,
    // });

    // Task definition
    const taskExecutionRole = new iam.Role(this, "TaskExecutionRole", {
      assumedBy: new iam.ServicePrincipal("ecs-tasks.amazonaws.com"),
      managedPolicies: [
        {
          managedPolicyArn:
            "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy",
        },
      ],
    });

    // Grant access to all Strapi secrets
    rdsAdminSecret.grantRead(taskExecutionRole);
    strapiJwtSecret.grantRead(taskExecutionRole);
    strapiAdminJwtSecret.grantRead(taskExecutionRole);
    strapiApiTokenSalt.grantRead(taskExecutionRole);
    strapiTransferTokenSalt.grantRead(taskExecutionRole);
    strapiEncryptionKey.grantRead(taskExecutionRole);
    strapiAppKey1.grantRead(taskExecutionRole);

    // // Add EFS volume to task definition
    // taskDefinition.addVolume({
    //   name: "strapi-uploads",
    //   efsVolumeConfiguration: {
    //     fileSystemId: fileSystem.fileSystemId,
    //     transitEncryption: "ENABLED",
    //     authorizationConfig: {
    //       iam: "ENABLED",
    //     },
    //   },
    // });

    // // Grant EFS access to task role
    // fileSystem.grant(taskExecutionRole, "elasticfilesystem:All");

    const taskDefinition = new ecs.FargateTaskDefinition(
      this,
      "TaskDefinition",
      {
        cpu: 256,
        memoryLimitMiB: 512,
        executionRole: taskExecutionRole,
        family: `${projectName}-backend-${deployEnv}`,
      }
    );
    const container = taskDefinition.addContainer("backend", {
      containerName: "backend",
      image: ecs.ContainerImage.fromAsset("../backend", {
        file: "Dockerfile.prod", // Use production-optimized Dockerfile
        buildArgs: {
          NODE_ENV: deployEnv === "prd" ? "production" : "development",
          platform: "linux/amd64",
        },
        platform: cdk.aws_ecr_assets.Platform.LINUX_AMD64,
      }),
      essential: true,
      environment: {
        NODE_ENV: deployEnv === "prd" ? "production" : "development",
        DATABASE_CLIENT: "postgres",
        DATABASE_SSL: "false",

        // // File upload configuration
        // UPLOAD_PROVIDER: "local",
        // UPLOAD_PATH: "/app/uploads",
      },
      secrets: {
        // Database secrets
        DATABASE_PASSWORD: ecs.Secret.fromSecretsManager(
          rdsAdminSecret,
          "password"
        ),
        DATABASE_HOST: ecs.Secret.fromSecretsManager(rdsAdminSecret, "host"),
        DATABASE_PORT: ecs.Secret.fromSecretsManager(rdsAdminSecret, "port"),
        DATABASE_NAME: ecs.Secret.fromSecretsManager(rdsAdminSecret, "dbname"),
        DATABASE_USERNAME: ecs.Secret.fromSecretsManager(
          rdsAdminSecret,
          "username"
        ),

        // Strapi application secrets
        JWT_SECRET: ecs.Secret.fromSecretsManager(strapiJwtSecret),
        ADMIN_JWT_SECRET: ecs.Secret.fromSecretsManager(strapiAdminJwtSecret),
        API_TOKEN_SALT: ecs.Secret.fromSecretsManager(strapiApiTokenSalt),
        TRANSFER_TOKEN_SALT: ecs.Secret.fromSecretsManager(
          strapiTransferTokenSalt
        ),
        ENCRYPTION_KEY: ecs.Secret.fromSecretsManager(strapiEncryptionKey),

        // APP_KEYS as comma-separated values
        APP_KEYS: ecs.Secret.fromSecretsManager(strapiAppKey1),
      },
      portMappings: [
        {
          containerPort: containerPort,
          hostPort: containerPort,
          protocol: ecs.Protocol.TCP,
        },
      ],
      logging: ecs.LogDrivers.awsLogs({
        logGroup,
        streamPrefix: "ecs",
      }),
    });

    // // Mount EFS volume for uploads
    // container.addMountPoints({
    //   sourceVolume: "strapi-uploads",
    //   containerPath: "/app/uploads",
    //   readOnly: false,
    // });

    // Service
    const service = new ecs.FargateService(this, "Service", {
      cluster: cluster,
      serviceName: `${projectName}-backend-${deployEnv}`,
      taskDefinition,
      desiredCount: 1,
      deploymentController: {
        type: ecs.DeploymentControllerType.ECS,
      },
      circuitBreaker: {
        rollback: true,
      },
      enableExecuteCommand: true,
      assignPublicIp: true,
      // Security groups that allow communication from the ALB to the container are automatically granted
      securityGroups: [rdsClientSg],
      vpcSubnets: {
        // To retrieve images from ECR
        subnets: vpc.publicSubnets,
      },
    });

    // Register the service with the blue target group
    blueTargetGroup.addTarget(service);

    // Amplify
    // https://docs.aws.amazon.com/ja_jp/amplify/latest/userguide/monitoring-with-cloudwatch.html#ssr-logs
    const amplifyRole = new iam.Role(this, "AmplifyRole", {
      assumedBy: new iam.ServicePrincipal("amplify.amazonaws.com"),
    });
    amplifyRole.addToPolicy(
      new iam.PolicyStatement({
        actions: [
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents",
          "logs:DescribeLogGroups",
        ],
        resources: ["*"],
      })
    );

    const amplify = new CfnApp(this, "Amplify", {
      name: `${projectName}-frontend-${deployEnv}`,
      accessToken: config.githubToken,
      iamServiceRole: amplifyRole.roleArn,
      repository: "https://github.com/penysho/stunning-autumn-foliage",
      environmentVariables: [
        {
          name: "AMPLIFY_MONOREPO_APP_ROOT",
          value: "frontend",
        },
        {
          name: "NEXT_PUBLIC_STRAPI_URL",
          value: `https://${projectName}-${deployEnv}-api.${config.apiDomain}`,
        },
        {
          name: "NEXT_PUBLIC_STRAPI_API_URL",
          value: `https://${projectName}-${deployEnv}-api.${config.apiDomain}/api`,
        },
        {
          name: "NEXT_PUBLIC_GOOGLE_MAPS_API_KEY",
          value: config.googleMapsApiKey,
        },
      ],
      buildSpec: BuildSpec.fromObjectToYaml({
        version: 1,
        applications: [
          {
            appRoot: "frontend",
            frontend: {
              phases: {
                preBuild: {
                  commands: [
                    "nvm install 22.8",
                    "nvm use 22.8",
                    "npm install -g pnpm",
                    "pnpm i",
                  ],
                },
                build: {
                  commands: ["pnpm run build"],
                },
              },
              artifacts: {
                baseDirectory: ".next",
                files: ["**/*"],
              },
              cache: {
                paths: ["node_modules/**/*"],
              },
            },
          },
        ],
      }).toBuildSpec(),
      platform: "WEB_COMPUTE",
      customRules: [
        {
          source: "/<*>",
          target: "/index.html",
          status: "404-200",
        },
      ],
    });

    new CfnBranch(this, "AmplifyBranch", {
      appId: amplify.attrAppId,
      branchName: config.branch,
      framework: "Next.js - SSR",
      enableAutoBuild: false,
      stage: "PRODUCTION",
    });
  }
}
