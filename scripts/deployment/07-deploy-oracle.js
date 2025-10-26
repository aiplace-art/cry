// ========================================
// HypeAI AI Oracle Deployment Script
// Chain: BNB Chain Mainnet
// ========================================

const hre = require("hardhat");
const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

const TOKEN_FILE = path.join(__dirname, "../../deployments/mainnet/token-deployment.json");
const DEPLOYMENT_FILE = path.join(__dirname, "../../deployments/mainnet/oracle-deployment.json");

const CONFIG = {
  // Chainlink BNB/USD Price Feed on BSC Mainnet
  priceFeed: process.env.CHAINLINK_BNB_USD_FEED || "0x0567F2323251f0Aab15c8dFb1967E4e8A7D42aeE",
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

async function deployOracle(deployer, tokenAddress) {
  log("Starting AI Oracle deployment...");

  log(`Token Address: ${tokenAddress}`);
  log(`Price Feed: ${CONFIG.priceFeed}`);
  log(`Treasury: ${CONFIG.treasuryWallet}`);

  const AIOracle = await ethers.getContractFactory("AIOracle", deployer);

  const deployOptions = {
    gasLimit: CONFIG.gasLimit,
  };

  if (CONFIG.gasPrice) {
    deployOptions.gasPrice = CONFIG.gasPrice;
  }

  log("Deploying AI Oracle contract...");
  const oracle = await AIOracle.deploy(
    tokenAddress,
    CONFIG.priceFeed,
    CONFIG.treasuryWallet,
    deployOptions
  );

  await oracle.waitForDeployment();

  const oracleAddress = await oracle.getAddress();
  log(`✓ AI Oracle deployed at: ${oracleAddress}`);

  // Verify deployment
  const deployedToken = await oracle.token();
  const deployedPriceFeed = await oracle.priceFeed();

  log(`Verified - Token: ${deployedToken}`);
  log(`Verified - Price Feed: ${deployedPriceFeed}`);

  // Test price feed
  try {
    const price = await oracle.getLatestPrice();
    log(`Current BNB/USD Price: $${ethers.formatUnits(price, 8)}`);
  } catch (error) {
    log(`Warning: Could not fetch price from oracle: ${error.message}`, "WARN");
  }

  return {
    address: oracleAddress,
    tokenAddress,
    priceFeed: deployedPriceFeed,
    treasuryWallet: CONFIG.treasuryWallet,
    deploymentTx: oracle.deploymentTransaction().hash,
  };
}

async function main() {
  try {
    log("========================================");
    log("HypeAI AI Oracle Deployment");
    log("Network: BNB Chain Mainnet");
    log("========================================");

    if (!CONFIG.treasuryWallet || !ethers.isAddress(CONFIG.treasuryWallet)) {
      throw new Error("Invalid treasury wallet address");
    }

    if (!CONFIG.priceFeed || !ethers.isAddress(CONFIG.priceFeed)) {
      throw new Error("Invalid price feed address");
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

    const oracleData = await deployOracle(deployer, tokenDeployment.token.address);

    const deploymentData = {
      network: "bsc",
      chainId: 56,
      oracle: oracleData,
      deployer: deployer.address,
      timestamp: new Date().toISOString(),
      blockNumber: await ethers.provider.getBlockNumber(),
    };

    saveDeployment(deploymentData);

    log("========================================");
    log("✓ AI Oracle Deployment Complete!");
    log("========================================");
    log(`Oracle Address: ${oracleData.address}`);
    log(`Deployment TX: ${oracleData.deploymentTx}`);
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

module.exports = { main, deployOracle };
