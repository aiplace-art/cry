const hre = require("hardhat");
const { ethers } = require("hardhat");

/**
 * Complete deployment script for all contracts
 * Deploys: Token, Staking, AIOracle, GovernanceDAO
 */
async function main() {
  console.log("🚀 Starting deployment of all contracts...\n");

  const [deployer, treasury, liquidity] = await ethers.getSigners();

  console.log("📋 Deployment Configuration:");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("Deployer address:", deployer.address);
  console.log("Treasury address:", treasury.address);
  console.log("Liquidity address:", liquidity.address);
  console.log("Network:", hre.network.name);
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  // 1. Deploy HypedToken
  console.log("1️⃣ Deploying HypedToken...");
  const HypedToken = await ethers.getContractFactory("HypedToken");
  const token = await HypedToken.deploy(treasury.address, liquidity.address);
  await token.deployed();
  console.log("✅ HypedToken deployed to:", token.address);
  console.log("   Total Supply:", ethers.utils.formatEther(await token.totalSupply()), "HYPE\n");

  // 2. Deploy AIOracle
  console.log("2️⃣ Deploying AIOracle...");
  const AIOracle = await ethers.getContractFactory("AIOracle");
  const oracle = await AIOracle.deploy();
  await oracle.deployed();
  console.log("✅ AIOracle deployed to:", oracle.address, "\n");

  // 3. Deploy Staking Contract
  console.log("3️⃣ Deploying StakingContract...");
  const StakingContract = await ethers.getContractFactory("StakingContract");
  const staking = await StakingContract.deploy(token.address, token.address);
  await staking.deployed();
  console.log("✅ StakingContract deployed to:", staking.address);
  console.log("   Number of pools:", (await staking.poolCount()).toString(), "\n");

  // 4. Deploy GovernanceDAO
  console.log("4️⃣ Deploying GovernanceDAO...");
  const GovernanceDAO = await ethers.getContractFactory("GovernanceDAO");
  const governance = await GovernanceDAO.deploy(token.address);
  await governance.deployed();
  console.log("✅ GovernanceDAO deployed to:", governance.address, "\n");

  // 5. Setup configurations
  console.log("5️⃣ Configuring contracts...");

  // Exclude staking contract from fees
  console.log("   - Excluding staking contract from fees...");
  await token.excludeFromFees(staking.address, true);
  await token.excludeFromLimits(staking.address, true);

  // Exclude governance contract from fees
  console.log("   - Excluding governance contract from fees...");
  await token.excludeFromFees(governance.address, true);
  await token.excludeFromLimits(governance.address, true);

  // Authorize oracle data sources
  console.log("   - Authorizing oracle data sources...");
  await oracle.setAuthorizedSource(deployer.address, true);

  // Fund staking rewards (10% of supply)
  const rewardAmount = ethers.utils.parseEther("100000000"); // 100M tokens
  console.log("   - Funding staking rewards:", ethers.utils.formatEther(rewardAmount), "HYPE");
  await token.transfer(staking.address, rewardAmount);
  await staking.fundRewardTreasury(rewardAmount);

  console.log("✅ Configuration complete\n");

  // 6. Enable trading
  console.log("6️⃣ Enabling trading...");
  await token.enableTrading();
  console.log("✅ Trading enabled\n");

  // 7. Verification information
  console.log("📝 Contract Verification Commands:");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log(`npx hardhat verify --network ${hre.network.name} ${token.address} "${treasury.address}" "${liquidity.address}"`);
  console.log(`npx hardhat verify --network ${hre.network.name} ${oracle.address}`);
  console.log(`npx hardhat verify --network ${hre.network.name} ${staking.address} "${token.address}" "${token.address}"`);
  console.log(`npx hardhat verify --network ${hre.network.name} ${governance.address} "${token.address}"`);
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  // 8. Save deployment info
  const deploymentInfo = {
    network: hre.network.name,
    timestamp: new Date().toISOString(),
    deployer: deployer.address,
    contracts: {
      HypedToken: {
        address: token.address,
        treasury: treasury.address,
        liquidity: liquidity.address,
      },
      AIOracle: {
        address: oracle.address,
      },
      StakingContract: {
        address: staking.address,
        rewardsFunded: ethers.utils.formatEther(rewardAmount),
      },
      GovernanceDAO: {
        address: governance.address,
      },
    },
  };

  console.log("💾 Deployment Summary:");
  console.log(JSON.stringify(deploymentInfo, null, 2));

  // Save to file
  const fs = require("fs");
  const path = require("path");
  const deploymentsDir = path.join(__dirname, "..", "memory");

  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }

  fs.writeFileSync(
    path.join(deploymentsDir, `deployment-${hre.network.name}-${Date.now()}.json`),
    JSON.stringify(deploymentInfo, null, 2)
  );

  console.log("\n✅ Deployment complete! All contract addresses saved to memory/\n");

  return {
    token: token.address,
    oracle: oracle.address,
    staking: staking.address,
    governance: governance.address,
  };
}

// Execute deployment
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });

module.exports = main;
