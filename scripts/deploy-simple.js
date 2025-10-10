import hre from "hardhat";
import { writeFileSync } from "fs";
import { join } from "path";

async function main() {
  console.log("Starting contract deployment...\n");

  try {
    // Get deployer account
    const [deployer] = await hre.ethers.getSigners();
    console.log("Deploying contracts with account:", deployer.address);
    console.log("Account balance:", hre.ethers.formatEther(await hre.ethers.provider.getBalance(deployer.address)), "ETH\n");

    // 1. Deploy HypeAI Token Contract
    console.log("🤖 Deploying HypeAI Token contract...");
    console.log("   'Where Hype Meets Intelligence'\n");
    const Token = await hre.ethers.getContractFactory("HypeAI");
    const token = await Token.deploy();
    await token.waitForDeployment();
    const tokenAddress = await token.getAddress();
    console.log("✓ HypeAI Token deployed to:", tokenAddress, "\n");

    // 2. Deploy Staking Contract
    console.log("Deploying Staking contract...");
    const Staking = await hre.ethers.getContractFactory("Staking");
    const staking = await Staking.deploy(tokenAddress);
    await staking.waitForDeployment();
    const stakingAddress = await staking.getAddress();
    console.log("✓ Staking deployed to:", stakingAddress, "\n");

    // 3. Deploy Governance Contract
    console.log("Deploying Governance contract...");
    const Governance = await hre.ethers.getContractFactory("Governance");
    const governance = await Governance.deploy(tokenAddress);
    await governance.waitForDeployment();
    const governanceAddress = await governance.getAddress();
    console.log("✓ Governance deployed to:", governanceAddress, "\n");

    // 4. Prepare deployment data
    const deploymentData = {
      network: hre.network.name,
      deployer: deployer.address,
      timestamp: new Date().toISOString(),
      contracts: {
        Token: tokenAddress,
        Staking: stakingAddress,
        Governance: governanceAddress
      }
    };

    // 5. Save addresses to file
    const outputPath = join(process.cwd(), "deployed-addresses.json");
    writeFileSync(outputPath, JSON.stringify(deploymentData, null, 2));
    console.log("✓ Deployment addresses saved to:", outputPath, "\n");

    // 6. Display summary
    console.log("=".repeat(60));
    console.log("DEPLOYMENT SUMMARY");
    console.log("=".repeat(60));
    console.log("Network:    ", deploymentData.network);
    console.log("Deployer:   ", deploymentData.deployer);
    console.log("Token:      ", tokenAddress);
    console.log("Staking:    ", stakingAddress);
    console.log("Governance: ", governanceAddress);
    console.log("=".repeat(60));

  } catch (error) {
    console.error("\n❌ Deployment failed:");
    console.error(error.message);
    process.exit(1);
  }
}

main()
  .then(() => {
    console.log("\n✓ Deployment completed successfully");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Unexpected error:");
    console.error(error);
    process.exit(1);
  });
