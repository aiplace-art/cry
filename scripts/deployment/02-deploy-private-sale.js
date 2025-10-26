// ========================================
// HypeAI Private Sale Deployment Script
// Chain: BNB Chain Mainnet
// ========================================

const hre = require("hardhat");
const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

// Load Token deployment
const TOKEN_FILE = path.join(__dirname, "../../deployments/mainnet/token-deployment.json");
const DEPLOYMENT_FILE = path.join(__dirname, "../../deployments/mainnet/private-sale-deployment.json");

// Configuration
const CONFIG = {
  tokenPrice: process.env.PRIVATE_SALE_TOKEN_PRICE || ethers.parseEther("0.0001").toString(),
  hardCap: process.env.PRIVATE_SALE_HARD_CAP || ethers.parseEther("1000").toString(),
  minPurchase: process.env.PRIVATE_SALE_MIN_PURCHASE || ethers.parseEther("0.01").toString(),
  maxPurchase: process.env.PRIVATE_SALE_MAX_PURCHASE || ethers.parseEther("50").toString(),
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

async function deployPrivateSale(deployer, tokenAddress) {
  log("Starting Private Sale deployment...");

  log(`Token Address: ${tokenAddress}`);
  log(`Token Price: ${ethers.formatEther(CONFIG.tokenPrice)} BNB per token`);
  log(`Hard Cap: ${ethers.formatEther(CONFIG.hardCap)} BNB`);
  log(`Min Purchase: ${ethers.formatEther(CONFIG.minPurchase)} BNB`);
  log(`Max Purchase: ${ethers.formatEther(CONFIG.maxPurchase)} BNB`);
  log(`Treasury: ${CONFIG.treasuryWallet}`);

  const PrivateSale = await ethers.getContractFactory("PrivateSale", deployer);

  const deployOptions = {
    gasLimit: CONFIG.gasLimit,
  };

  if (CONFIG.gasPrice) {
    deployOptions.gasPrice = CONFIG.gasPrice;
  }

  log("Deploying Private Sale contract...");
  const privateSale = await PrivateSale.deploy(
    tokenAddress,
    CONFIG.tokenPrice,
    CONFIG.hardCap,
    CONFIG.minPurchase,
    CONFIG.maxPurchase,
    CONFIG.treasuryWallet,
    deployOptions
  );

  await privateSale.waitForDeployment();

  const privateSaleAddress = await privateSale.getAddress();
  log(`✓ Private Sale deployed at: ${privateSaleAddress}`);

  return {
    address: privateSaleAddress,
    tokenAddress,
    tokenPrice: CONFIG.tokenPrice,
    hardCap: CONFIG.hardCap,
    minPurchase: CONFIG.minPurchase,
    maxPurchase: CONFIG.maxPurchase,
    treasuryWallet: CONFIG.treasuryWallet,
    deploymentTx: privateSale.deploymentTransaction().hash,
  };
}

async function main() {
  try {
    log("========================================");
    log("HypeAI Private Sale Deployment");
    log("Network: BNB Chain Mainnet");
    log("========================================");

    // Load token deployment
    const tokenDeployment = loadTokenDeployment();
    log(`Token loaded: ${tokenDeployment.token.address}`);

    const [deployer] = await ethers.getSigners();
    log(`Deployer: ${deployer.address}`);

    // Deploy with delay if configured
    if (process.env.DEPLOY_WITH_DELAY === "true") {
      const delay = parseInt(process.env.DEPLOY_DELAY_SECONDS || "10");
      log(`Waiting ${delay} seconds before deployment...`);
      await new Promise(resolve => setTimeout(resolve, delay * 1000));
    }

    // Deploy Private Sale
    const privateSaleData = await deployPrivateSale(deployer, tokenDeployment.token.address);

    // Save deployment data
    const deploymentData = {
      network: "bsc",
      chainId: 56,
      privateSale: privateSaleData,
      deployer: deployer.address,
      timestamp: new Date().toISOString(),
      blockNumber: await ethers.provider.getBlockNumber(),
    };

    saveDeployment(deploymentData);

    log("========================================");
    log("✓ Private Sale Deployment Complete!");
    log("========================================");
    log(`Private Sale Address: ${privateSaleData.address}`);
    log(`Deployment TX: ${privateSaleData.deploymentTx}`);
    log("========================================");

    // Post-deployment instructions
    log("");
    log("IMPORTANT: Next steps:");
    log("1. Transfer tokens to Private Sale contract");
    log("2. Verify contract on BscScan");
    log("3. Test purchase functionality");

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

module.exports = { main, deployPrivateSale };
