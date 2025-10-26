// ========================================
// HypeAI Staking Contract Deployment Script
// Chain: BNB Chain Mainnet
// ========================================

const hre = require("hardhat");
const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

const TOKEN_FILE = path.join(__dirname, "../../deployments/mainnet/token-deployment.json");
const DEPLOYMENT_FILE = path.join(__dirname, "../../deployments/mainnet/staking-deployment.json");

const CONFIG = {
  minStakeAmount: process.env.STAKING_MIN_AMOUNT || ethers.parseEther("1").toString(),
  apyPercent: process.env.STAKING_APY_PERCENT || 1200, // 12% APY
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

async function deployStaking(deployer, tokenAddress) {
  log("Starting Staking Contract deployment...");

  log(`Token Address: ${tokenAddress}`);
  log(`Min Stake Amount: ${ethers.formatEther(CONFIG.minStakeAmount)} tokens`);
  log(`APY: ${CONFIG.apyPercent / 100}%`);
  log(`Treasury: ${CONFIG.treasuryWallet}`);

  const Staking = await ethers.getContractFactory("Staking", deployer);

  const deployOptions = {
    gasLimit: CONFIG.gasLimit,
  };

  if (CONFIG.gasPrice) {
    deployOptions.gasPrice = CONFIG.gasPrice;
  }

  log("Deploying Staking contract...");
  const staking = await Staking.deploy(
    tokenAddress,
    CONFIG.minStakeAmount,
    CONFIG.apyPercent,
    CONFIG.treasuryWallet,
    deployOptions
  );

  await staking.waitForDeployment();

  const stakingAddress = await staking.getAddress();
  log(`✓ Staking Contract deployed at: ${stakingAddress}`);

  // Verify deployment
  const deployedToken = await staking.stakingToken();
  const deployedMinAmount = await staking.minStakeAmount();
  const deployedAPY = await staking.apyPercent();

  log(`Verified - Token: ${deployedToken}`);
  log(`Verified - Min Stake: ${ethers.formatEther(deployedMinAmount)} tokens`);
  log(`Verified - APY: ${deployedAPY / 100}%`);

  return {
    address: stakingAddress,
    tokenAddress,
    minStakeAmount: deployedMinAmount.toString(),
    apyPercent: deployedAPY.toString(),
    treasuryWallet: CONFIG.treasuryWallet,
    deploymentTx: staking.deploymentTransaction().hash,
  };
}

async function main() {
  try {
    log("========================================");
    log("HypeAI Staking Contract Deployment");
    log("Network: BNB Chain Mainnet");
    log("========================================");

    if (!CONFIG.treasuryWallet || !ethers.isAddress(CONFIG.treasuryWallet)) {
      throw new Error("Invalid treasury wallet address");
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

    const stakingData = await deployStaking(deployer, tokenDeployment.token.address);

    const deploymentData = {
      network: "bsc",
      chainId: 56,
      staking: stakingData,
      deployer: deployer.address,
      timestamp: new Date().toISOString(),
      blockNumber: await ethers.provider.getBlockNumber(),
    };

    saveDeployment(deploymentData);

    log("========================================");
    log("✓ Staking Contract Deployment Complete!");
    log("========================================");
    log(`Staking Address: ${stakingData.address}`);
    log(`Deployment TX: ${stakingData.deploymentTx}`);
    log("========================================");

    log("");
    log("IMPORTANT: Next steps:");
    log("1. Transfer reward tokens to Staking contract");
    log("2. Configure staking parameters if needed");
    log("3. Verify contract on BscScan");
    log("4. Test staking functionality");

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

module.exports = { main, deployStaking };
