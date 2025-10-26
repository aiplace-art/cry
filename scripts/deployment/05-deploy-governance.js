// ========================================
// HypeAI Governance DAO Deployment Script
// Chain: BNB Chain Mainnet
// ========================================

const hre = require("hardhat");
const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

const TOKEN_FILE = path.join(__dirname, "../../deployments/mainnet/token-deployment.json");
const DEPLOYMENT_FILE = path.join(__dirname, "../../deployments/mainnet/governance-deployment.json");

const CONFIG = {
  quorumPercent: process.env.GOVERNANCE_QUORUM_PERCENT || 400, // 4%
  votingPeriod: process.env.GOVERNANCE_VOTING_PERIOD || 259200, // 3 days in seconds
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

async function deployGovernance(deployer, tokenAddress) {
  log("Starting Governance DAO deployment...");

  log(`Token Address: ${tokenAddress}`);
  log(`Quorum Percentage: ${CONFIG.quorumPercent / 100}%`);
  log(`Voting Period: ${CONFIG.votingPeriod / 86400} days`);

  const GovernanceDAO = await ethers.getContractFactory("GovernanceDAO", deployer);

  const deployOptions = {
    gasLimit: CONFIG.gasLimit,
  };

  if (CONFIG.gasPrice) {
    deployOptions.gasPrice = CONFIG.gasPrice;
  }

  log("Deploying Governance DAO contract...");
  const governance = await GovernanceDAO.deploy(
    tokenAddress,
    CONFIG.quorumPercent,
    CONFIG.votingPeriod,
    deployOptions
  );

  await governance.waitForDeployment();

  const governanceAddress = await governance.getAddress();
  log(`✓ Governance DAO deployed at: ${governanceAddress}`);

  // Verify deployment
  const deployedToken = await governance.governanceToken();
  const deployedQuorum = await governance.quorumPercentage();
  const deployedVotingPeriod = await governance.votingPeriod();

  log(`Verified - Token: ${deployedToken}`);
  log(`Verified - Quorum: ${deployedQuorum}%`);
  log(`Verified - Voting Period: ${deployedVotingPeriod} seconds`);

  return {
    address: governanceAddress,
    tokenAddress,
    quorumPercent: deployedQuorum.toString(),
    votingPeriod: deployedVotingPeriod.toString(),
    deploymentTx: governance.deploymentTransaction().hash,
  };
}

async function main() {
  try {
    log("========================================");
    log("HypeAI Governance DAO Deployment");
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

    const governanceData = await deployGovernance(deployer, tokenDeployment.token.address);

    const deploymentData = {
      network: "bsc",
      chainId: 56,
      governance: governanceData,
      deployer: deployer.address,
      timestamp: new Date().toISOString(),
      blockNumber: await ethers.provider.getBlockNumber(),
    };

    saveDeployment(deploymentData);

    log("========================================");
    log("✓ Governance DAO Deployment Complete!");
    log("========================================");
    log(`Governance Address: ${governanceData.address}`);
    log(`Deployment TX: ${governanceData.deploymentTx}`);
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

module.exports = { main, deployGovernance };
