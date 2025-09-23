import { aws_ec2 as ec2, Fn, Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import { deployEnv } from "../config/config";

export interface VpcStackProps extends StackProps {}

/**
 * VPC stack with cost-optimized configuration.
 * Uses shared VPC for cost efficiency or creates a minimal VPC if needed.
 */
export class VpcStack extends Stack {
  public readonly vpc: ec2.IVpc;

  constructor(scope: Construct, id: string, props: VpcStackProps) {
    super(scope, id, props);

    // Check if shared VPC exists, otherwise create a cost-optimized VPC
    try {
      // Try to use existing shared VPC for cost efficiency
      this.vpc = ec2.Vpc.fromVpcAttributes(this, "SharedVpc", {
        vpcId: Fn.importValue(`shared-vpc-${deployEnv}-Vpc`),
        availabilityZones: ["ap-northeast-1a", "ap-northeast-1c"],
        publicSubnetIds: [
          Fn.importValue(`shared-vpc-${deployEnv}-PublicSubnet1`),
          Fn.importValue(`shared-vpc-${deployEnv}-PublicSubnet2`),
        ],
        privateSubnetIds: [
          Fn.importValue(`shared-vpc-${deployEnv}-PrivateSubnet1`),
          Fn.importValue(`shared-vpc-${deployEnv}-PrivateSubnet2`),
        ],
      });
    } catch {
      // Create cost-optimized VPC if shared VPC doesn't exist
      this.vpc = new ec2.Vpc(this, "CostOptimizedVpc", {
        ipAddresses: ec2.IpAddresses.cidr("10.0.0.0/16"),
        maxAzs: 2, // Minimize costs with 2 AZs
        natGateways: 1, // Single NAT Gateway for cost optimization
        subnetConfiguration: [
          {
            cidrMask: 24,
            name: "Public",
            subnetType: ec2.SubnetType.PUBLIC,
          },
          {
            cidrMask: 24,
            name: "Private",
            subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
          },
          {
            cidrMask: 28,
            name: "Database",
            subnetType: ec2.SubnetType.PRIVATE_ISOLATED,
          },
        ],
        // Enable flow logs for security monitoring
        flowLogs: {
          cloudWatch: {
            destination: ec2.FlowLogDestination.toCloudWatchLogs(),
            trafficType: ec2.FlowLogTrafficType.REJECT, // Only log rejected traffic to reduce costs
          },
        },
      });
    }
  }
}
