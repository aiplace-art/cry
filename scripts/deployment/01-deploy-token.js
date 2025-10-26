// ========================================
// HypeAI Token Deployment Script
// Chain: BNB Chain Mainnet
// ========================================

const hre = require("hardhat");
const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

// Configuration
const CONFIG = {
  tokenName: process.env.TOKEN_NAME || "HypeAI",
  tokenSymbol: process.env.TOKEN_SYMBOL || "HYPEAI",
  totalSupply: process.env.TOTAL_SUPPLY || "10000000000", // 10B tokens
  treasuryWallet: process.env.TREASURY_WALLET,
  gasPrice: process.env.GAS_PRICE_GWEI ? ethers.parseUnits(process.env.GAS_PRICE_GWEI, "gwei") : undefined,
  gasLimit: process.env.GAS_LIMIT || 8000000,
};

// Deployment state file
const DEPLOYMENT_FILE = path.join(__dirname, "../../deployments/mainnet/token-deployment.json");

// Logger
function log(message, level = "INFO") {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] [${level}] ${message}`);
}

// Save deployment data
function saveDeployment(data) {
  const dir = path.dirname(DEPLOYMENT_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(DEPLOYMENT_FILE, JSON.stringify(data, null, 2));
  log(`Deployment data saved to ${DEPLOYMENT_FILE}`);
}

// Load existing deployment
function loadDeployment() {
  if (fs.existsSync(DEPLOYMENT_FILE)) {
    return JSON.parse(fs.readFileSync(DEPLOYMENT_FILE, "utf8"));
  }
  return null;
}

// Verify configuration
function verifyConfig() {
  log("Verifying deployment configuration...");

  const required = ["treasuryWallet"];
  const missing = required.filter(key => !CONFIG[key]);

  if (missing.length > 0) {
    throw new Error(`Missing required configuration: ${missing.join(", ")}`);
  }

  // Validate treasury wallet address
  if (!ethers.isAddress(CONFIG.treasuryWallet)) {
    throw new Error(`Invalid treasury wallet address: ${CONFIG.treasuryWallet}`);
  }

  log("✓ Configuration verified");
}

// Check deployer balance
async function checkBalance(deployer) {
  log("Checking deployer balance...");

  const balance = await ethers.provider.getBalance(deployer.address);
  const balanceBNB = ethers.formatEther(balance);

  log(`Deployer address: ${deployer.address}`);
  log(`Deployer balance: ${balanceBNB} BNB`);

  const minBalance = process.env.MIN_DEPLOYER_BALANCE_BNB || 0.5;
  if (parseFloat(balanceBNB) < parseFloat(minBalance)) {
    throw new Error(`Insufficient balance. Need at least ${minBalance} BNB, have ${balanceBNB} BNB`);
  }

  log("✓ Balance check passed");
}

// Deploy Token contract
async function deployToken(deployer) {
  log("Starting Token deployment...");

  const tokenSupply = ethers.parseEther(CONFIG.totalSupply);

  log(`Token Name: ${CONFIG.tokenName}`);
  log(`Token Symbol: ${CONFIG.tokenSymbol}`);
  log(`Total Supply: ${CONFIG.totalSupply} tokens`);
  log(`Treasury Wallet: ${CONFIG.treasuryWallet}`);

  const Token = await ethers.getContractFactory("Token", deployer);

  const deployOptions = {
    gasLimit: CONFIG.gasLimit,
  };

  if (CONFIG.gasPrice) {
    deployOptions.gasPrice = CONFIG.gasPrice;
    log(`Custom gas price: ${ethers.formatUnits(CONFIG.gasPrice, "gwei")} Gwei`);
  }

  log("Deploying Token contract...");
  const token = await Token.deploy(
    CONFIG.tokenName,
    CONFIG.tokenSymbol,
    tokenSupply,
    CONFIG.treasuryWallet,
    deployOptions
  );

  log("Waiting for deployment transaction to be mined...");
  await token.waitForDeployment();

  const tokenAddress = await token.getAddress();
  log(`✓ Token deployed at: ${tokenAddress}`);

  // Verify deployment
  const deployedSupply = await token.totalSupply();
  const deployedName = await token.name();
  const deployedSymbol = await token.symbol();

  log(`Verified - Name: ${deployedName}`);
  log(`Verified - Symbol: ${deployedSymbol}`);
  log(`Verified - Total Supply: ${ethers.formatEther(deployedSupply)} tokens`);

  return {
    address: tokenAddress,
    name: deployedName,
    symbol: deployedSymbol,
    totalSupply: deployedSupply.toString(),
    treasuryWallet: CONFIG.treasuryWallet,
    deploymentTx: token.deploymentTransaction().hash,
  };
}

// Main deployment function
async function main() {
  try {
    log("========================================");
    log("HypeAI Token Deployment");
    log("Network: BNB Chain Mainnet");
    log("========================================");

    // Check if already deployed
    const existing = loadDeployment();
    if (existing && existing.address) {
      log("⚠️  Token already deployed!", "WARN");
      log(`Existing deployment: ${existing.address}`);

      const response = await new Promise((resolve) => {
        process.stdin.once("data", (data) => {
          resolve(data.toString().trim().toLowerCase());
        });
        console.log("Do you want to redeploy? (yes/no): ");
      });

      if (response !== "yes") {
        log("Deployment cancelled");
        return existing;
      }
    }

    // Verify configuration
    verifyConfig();

    // Get deployer
    const [deployer] = await ethers.getSigners();

    // Check balance
    await checkBalance(deployer);

    // Deploy with delay if configured
    if (process.env.DEPLOY_WITH_DELAY === "true") {
      const delay = parseInt(process.env.DEPLOY_DELAY_SECONDS || "10");
      log(`Waiting ${delay} seconds before deployment...`);
      await new Promise(resolve => setTimeout(resolve, delay * 1000));
    }

    // Deploy Token
    const tokenData = await deployToken(deployer);

    // Save deployment data
    const deploymentData = {
      network: "bsc",
      chainId: 56,
      token: tokenData,
      deployer: deployer.address,
      timestamp: new Date().toISOString(),
      blockNumber: await ethers.provider.getBlockNumber(),
    };

    saveDeployment(deploymentData);

    log("========================================");
    log("✓ Token Deployment Complete!");
    log("========================================");
    log(`Token Address: ${tokenData.address}`);
    log(`Deployment TX: ${tokenData.deploymentTx}`);
    log("========================================");

    // Verification reminder
    if (process.env.VERIFY_CONTRACTS === "true") {
      log("Run verification script: npm run verify:mainnet");
    }

    return deploymentData;

  } catch (error) {
    log(`Deployment failed: ${error.message}`, "ERROR");
    log(error.stack, "ERROR");
    process.exit(1);
  }
}

// Execute deployment
if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

module.exports = { main, deployToken };
