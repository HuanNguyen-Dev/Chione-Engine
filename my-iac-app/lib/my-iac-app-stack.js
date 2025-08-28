const cdk = require('aws-cdk-lib');
const ec2 = require('aws-cdk-lib/aws-ec2');
const s3assets = require('aws-cdk-lib/aws-s3-assets');
const path = require('path');

class MyIacAppStack extends cdk.Stack {
  constructor(scope, id, props) {
    super(scope, id, props);

    // Use the default VPC
    const vpc = ec2.Vpc.fromVpcAttributes(this, 'MyVpc', {
      vpcId: 'vpc-007bab53289655834', // <-- Use your real VPC ID
      availabilityZones: ['ap-southeast-2'] // You can include more if you want
    });

    // Create a security group
    const sg = new ec2.SecurityGroup(this, 'AppSG', {
      vpc,
      description: 'Allow SSH and app access',
      allowAllOutbound: true,
    });

    sg.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(22), 'Allow SSH');
    sg.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(3000), 'Allow app port');

    // Create an S3 asset from the app folder
    const appAsset = new s3assets.Asset(this, 'AppAsset', {
      path: path.join(__dirname, '../../app'),
    });

    // add user data
    const userDataScript = [
      'cd /Cab432',                       // Go to your repo folder
      'sudo -u ubuntu git pull origin main'          // Pull the latest code
    ].join('\n');

    // Define the EC2 instance
    const instance = new ec2.CfnInstance(this, 'AppInstanceFromLaunchTemplate', {
      launchTemplate: {
        launchTemplateId: 'lt-0c01d7d6c396fbd88', // your launch template ID
        version: '$Latest'  // or a specific version number
      },
      // Optionally, you can specify other overrides here
      // e.g., subnetId, securityGroupIds, etc.
      userData: cdk.Fn.base64(userDataScript), // Base64 encode the script
    });

  }
}

module.exports = { MyIacAppStack };
