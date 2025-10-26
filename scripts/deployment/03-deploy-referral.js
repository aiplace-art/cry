// ========================================
// HypeAI Referral System Deployment Script
// Chain: BNB Chain Mainnet
// ========================================

const hre = require("hardhat");
const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

const TOKEN_FILE = path.join(__dirname, "../../deployments/mainnet/token-deployment.json");
const DEPLOYMENT_FILE = path.join(__dirname, "../../deployments/mainnet/referral-deployment.json");

const CONFIG = {
  level1Percent: process.env.REFERRAL_LEVEL1_PERCENT || 500, // 5%
  level2Percent: process.env.REFERRAL_LEVEL2_PERCENT || 300, // 3%
  level3Percent: process.env.REFERRAL_LEVEL3_PERCENT || 200, // 2%
  treasuryWallet: process.env.TREASURY_WALLET,
  gasPrice: process.env.GAS_PRICE_GWEI ? ethers.parseUnits(process.env.GAS_PRICE_GWEI, "gwei") : undefined,
  gasLimit: process.env.GAS_LIMIT || 8000000,
};

function log(message, level = "INFO") {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] [${level}] ${message}`);
}

function loadTokenDeployment() {
  if (!fs.existsSync(TOKEN_FILE)) {
    throw new Error("Token not deployed yet! Run 01-deploy-token.js first");
  }
  return JSON.parse(fs.readFileSync(TOKEN_FILE, "utf8"));
}

function saveDeployment(data) {
  const dir = path.dirname(DEPLOYMENT_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(DEPLOYMENT_FILE, JSON.stringify(data, null, 2));
  log(`Deployment data saved to ${DEPLOYMENT_FILE}`);
}

async function deployReferralSystem(deployer, tokenAddress) {
  log("Starting Referral System deployment...");

  log(`Token Address: ${tokenAddress}`);
  log(`Level 1 Reward: ${CONFIG.level1Percent / 100}%`);
  log(`Level 2 Reward: ${CONFIG.level2Percent / 100}%`);
  log(`Level 3 Reward: ${CONFIG.level3Percent / 100}%`);
  log(`Treasury: ${CONFIG.treasuryWallet}`);

  const ReferralSystem = await ethers.getContractFactory("ReferralSystem", deployer);

  const deployOptions = {
    gasLimit: CONFIG.gasLimit,
  };

  if (CONFIG.gasPrice) {
    deployOptions.gasPrice = CONFIG.gasPrice;
  }

  log("Deploying Referral System contract...");
  const referralSystem = await ReferralSystem.deploy(
    tokenAddress,
    CONFIG.treasuryWallet,
    deployOptions
  );

  await referralSystem.waitForDeployment();

  const referralAddress = await referralSystem.getAddress();
  log(`✓ Referral System deployed at: ${referralAddress}`);

  // Set referral percentages
  log("Setting referral reward percentages...");
  const tx1 = await referralSystem.setReferralRewardPercentage(1, CONFIG.level1Percent);
  await tx1.wait();
  log("✓ Level 1 percentage set");

  const tx2 = await referralSystem.setReferralRewardPercentage(2, CONFIG.level2Percent);
  await tx2.wait();
  log("✓ Level 2 percentage set");

  const tx3 = await referralSystem.setReferralRewardPercentage(3, CONFIG.level3Percent);
  await tx3.wait();
  log("✓ Level 3 percentage set");

  return {
    address: referralAddress,
    tokenAddress,
    level1Percent: CONFIG.level1Percent,
    level2Percent: CONFIG.level2Percent,
    level3Percent: CONFIG.level3Percent,
    treasuryWallet: CONFIG.treasuryWallet,
    deploymentTx: referralSystem.deploymentTransaction().hash,
  };
}

async function main() {
  try {
    log("========================================");
    log("HypeAI Referral System Deployment");
    log("Network: BNB Chain Mainnet");
    log("========================================");

    const tokenDeployment = loadTokenDeployment();
    log(`Token loaded: ${tokenDeployment.token.address}`);

    const [deployer] = await ethers.getSigners();
    log(`Deployer: ${deployer.address}`);

    if (process.env.DEPLOY_WITH_DELAY === "true") {
      const delay = parseInt(process.env.DEPLOY_DELAY_SECONDS || "10");
      log(`Waiting ${delay} seconds before deployment...`);
      await new Promise(resolve => setTimeout(resolve, delay * 1000));
    }

    const referralData = await deployReferralSystem(deployer, tokenDeployment.token.address);

    const deploymentData = {
      network: "bsc",
      chainId: 56,
      referralSystem: referralData,
      deployer: deployer.address,
      timestamp: new Date().toISOString(),
      blockNumber: await ethers.provider.getBlockNumber(),
    };

    saveDeployment(deploymentData);

    log("========================================");
    log("✓ Referral System Deployment Complete!");
    log("========================================");
    log(`Referral System Address: ${referralData.address}`);
    log(`Deployment TX: ${referralData.deploymentTx}`);
    log("========================================");

    return deploymentData;

  } catch (error) {
    log(`Deployment failed: ${error.message}`, "ERROR");
    log(error.stack, "ERROR");
    process.exit(1);
  }
}

if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

module.exports = { main, deployReferralSystem };
