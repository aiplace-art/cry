// ========================================
// HypeAI Vesting Contract Deployment Script
// Chain: BNB Chain Mainnet
// ========================================

const hre = require("hardhat");
const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

const TOKEN_FILE = path.join(__dirname, "../../deployments/mainnet/token-deployment.json");
const DEPLOYMENT_FILE = path.join(__dirname, "../../deployments/mainnet/vesting-deployment.json");

const CONFIG = {
  cliffDuration: process.env.VESTING_CLIFF_DURATION || 7776000, // 90 days in seconds
  totalDuration: process.env.VESTING_TOTAL_DURATION || 31536000, // 365 days in seconds
  teamWallet: process.env.TEAM_WALLET,
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

async function deployVesting(deployer, tokenAddress) {
  log("Starting Vesting Contract deployment...");

  log(`Token Address: ${tokenAddress}`);
  log(`Cliff Duration: ${CONFIG.cliffDuration / 86400} days`);
  log(`Total Duration: ${CONFIG.totalDuration / 86400} days`);
  log(`Team Wallet: ${CONFIG.teamWallet}`);

  const TeamTokenVesting = await ethers.getContractFactory("TeamTokenVesting", deployer);

  const deployOptions = {
    gasLimit: CONFIG.gasLimit,
  };

  if (CONFIG.gasPrice) {
    deployOptions.gasPrice = CONFIG.gasPrice;
  }

  log("Deploying Team Token Vesting contract...");
  const vesting = await TeamTokenVesting.deploy(
    tokenAddress,
    CONFIG.teamWallet,
    CONFIG.cliffDuration,
    CONFIG.totalDuration,
    deployOptions
  );

  await vesting.waitForDeployment();

  const vestingAddress = await vesting.getAddress();
  log(`✓ Vesting Contract deployed at: ${vestingAddress}`);

  // Verify deployment
  const deployedToken = await vesting.token();
  const deployedBeneficiary = await vesting.beneficiary();
  const deployedCliff = await vesting.cliff();
  const deployedDuration = await vesting.duration();

  log(`Verified - Token: ${deployedToken}`);
  log(`Verified - Beneficiary: ${deployedBeneficiary}`);
  log(`Verified - Cliff: ${deployedCliff} seconds`);
  log(`Verified - Duration: ${deployedDuration} seconds`);

  return {
    address: vestingAddress,
    tokenAddress,
    beneficiary: deployedBeneficiary,
    cliffDuration: deployedCliff.toString(),
    totalDuration: deployedDuration.toString(),
    deploymentTx: vesting.deploymentTransaction().hash,
  };
}

async function main() {
  try {
    log("========================================");
    log("HypeAI Vesting Contract Deployment");
    log("Network: BNB Chain Mainnet");
    log("========================================");

    // Validate team wallet
    if (!CONFIG.teamWallet || !ethers.isAddress(CONFIG.teamWallet)) {
      throw new Error("Invalid team wallet address");
    }

    const tokenDeployment = loadTokenDeployment();
    log(`Token loaded: ${tokenDeployment.token.address}`);

    const [deployer] = await ethers.getSigners();
    log(`Deployer: ${deployer.address}`);

    if (process.env.DEPLOY_WITH_DELAY === "true") {
      const delay = parseInt(process.env.DEPLOY_DELAY_SECONDS || "10");
      log(`Waiting ${delay} seconds before deployment...`);
      await new Promise(resolve => setTimeout(resolve, delay * 1000));
    }

    const vestingData = await deployVesting(deployer, tokenDeployment.token.address);

    const deploymentData = {
      network: "bsc",
      chainId: 56,
      vesting: vestingData,
      deployer: deployer.address,
      timestamp: new Date().toISOString(),
      blockNumber: await ethers.provider.getBlockNumber(),
    };

    saveDeployment(deploymentData);

    log("========================================");
    log("✓ Vesting Contract Deployment Complete!");
    log("========================================");
    log(`Vesting Address: ${vestingData.address}`);
    log(`Deployment TX: ${vestingData.deploymentTx}`);
    log("========================================");

    log("");
    log("IMPORTANT: Next steps:");
    log("1. Transfer team tokens to Vesting contract");
    log("2. Verify vesting schedule is correct");
    log("3. Verify contract on BscScan");

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

module.exports = { main, deployVesting };
