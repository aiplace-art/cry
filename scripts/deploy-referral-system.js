/**
 * HypeAI Referral System Deployment Script
 *
 * Deploys and configures:
 * 1. ReferralSystem.sol
 * 2. PrivateSaleWithReferral.sol
 *
 * Usage:
 *   npx hardhat run scripts/deploy-referral-system.js --network bscTestnet
 *   npx hardhat run scripts/deploy-referral-system.js --network bscMainnet
 */

const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

// Configuration
const CONFIG = {
  bscTestnet: {
    USDT_ADDRESS: "0x337610d27c682E347C9cD60BD4b3b107C9d34dDd", // BSC Testnet USDT
    SALE_DURATION_DAYS: 30,
    INITIAL_HYPE_FUNDING: ethers.utils.parseEther("10000000"), // 10M HYPE for rewards
    INITIAL_USDT_FUNDING: ethers.utils.parseEther("50000"), // 50K USDT for rewards
    SALE_HYPE_ALLOCATION: ethers.utils.parseEther("100000000"), // 100M HYPE for sale
  },
  bscMainnet: {
    USDT_ADDRESS: "0x55d398326f99059fF775485246999027B3197955", // BSC Mainnet USDT
    SALE_DURATION_DAYS: 30,
    INITIAL_HYPE_FUNDING: ethers.utils.parseEther("10000000"),
    INITIAL_USDT_FUNDING: ethers.utils.parseEther("50000"),
    SALE_HYPE_ALLOCATION: ethers.utils.parseEther("100000000"),
  }
};

async function main() {
  console.log("🚀 HypeAI Referral System Deployment Started\n");

  // Get network
  const network = await ethers.provider.getNetwork();
  const networkName = network.chainId === 56 ? "bscMainnet" : "bscTestnet";
  const config = CONFIG[networkName];

  console.log(`📡 Network: ${networkName} (Chain ID: ${network.chainId})`);

  // Get deployer
  const [deployer] = await ethers.getSigners();
  const deployerAddress = await deployer.getAddress();
  const balance = await deployer.getBalance();

  console.log(`👤 Deployer: ${deployerAddress}`);
  console.log(`💰 Balance: ${ethers.utils.formatEther(balance)} BNB\n`);

  // Check if HYPE token is deployed
  console.log("🔍 Checking for existing HYPEAI token...");
  const hypeTokenAddress = await findHypeTokenAddress(networkName);

  if (!hypeTokenAddress) {
    console.log("❌ HYPEAI token not found. Please deploy it first.");
    console.log("   Run: npx hardhat run scripts/deploy-hype-token.js --network " + networkName);
    process.exit(1);
  }

  console.log(`✅ HYPEAI Token found at: ${hypeTokenAddress}\n`);

  // ============ STEP 1: Deploy ReferralSystem ============
  console.log("📦 Step 1: Deploying ReferralSystem...");

  const ReferralSystem = await ethers.getContractFactory("HypeAIReferralSystem");

  // Deploy with temporary private sale address (will update later)
  const referralSystem = await ReferralSystem.deploy(
    hypeTokenAddress,
    config.USDT_ADDRESS,
    deployerAddress // Temporary, will be updated to PrivateSale address
  );

  await referralSystem.deployed();
  console.log(`✅ ReferralSystem deployed at: ${referralSystem.address}`);
  console.log(`   Transaction: ${referralSystem.deployTransaction.hash}\n`);

  // Wait for confirmations
  console.log("⏳ Waiting for 3 confirmations...");
  await referralSystem.deployTransaction.wait(3);
  console.log("✅ Confirmed!\n");

  // ============ STEP 2: Deploy PrivateSaleWithReferral ============
  console.log("📦 Step 2: Deploying PrivateSaleWithReferral...");

  const PrivateSale = await ethers.getContractFactory("HypeAIPrivateSaleWithReferral");

  const saleStartTime = Math.floor(Date.now() / 1000) + 300; // Start in 5 minutes
  const saleDuration = config.SALE_DURATION_DAYS * 24 * 60 * 60; // 30 days

  const privateSale = await PrivateSale.deploy(
    hypeTokenAddress,
    config.USDT_ADDRESS,
    referralSystem.address,
    saleStartTime,
    saleDuration
  );

  await privateSale.deployed();
  console.log(`✅ PrivateSaleWithReferral deployed at: ${privateSale.address}`);
  console.log(`   Transaction: ${privateSale.deployTransaction.hash}`);
  console.log(`   Sale Start: ${new Date(saleStartTime * 1000).toLocaleString()}`);
  console.log(`   Sale End: ${new Date((saleStartTime + saleDuration) * 1000).toLocaleString()}\n`);

  // Wait for confirmations
  console.log("⏳ Waiting for 3 confirmations...");
  await privateSale.deployTransaction.wait(3);
  console.log("✅ Confirmed!\n");

  // ============ STEP 3: Configure ReferralSystem ============
  console.log("⚙️  Step 3: Configuring ReferralSystem...");

  console.log("   → Setting PrivateSale contract address...");
  const setPrivateSaleTx = await referralSystem.setPrivateSaleContract(privateSale.address);
  await setPrivateSaleTx.wait();
  console.log("   ✅ PrivateSale contract set\n");

  // ============ STEP 4: Fund Contracts ============
  console.log("💰 Step 4: Funding Contracts...");

  const hypeToken = await ethers.getContractAt("IERC20", hypeTokenAddress);

  // Check deployer's HYPE balance
  const deployerHypeBalance = await hypeToken.balanceOf(deployerAddress);
  const totalHypeNeeded = config.INITIAL_HYPE_FUNDING.add(config.SALE_HYPE_ALLOCATION);

  console.log(`   Your HYPE balance: ${ethers.utils.formatEther(deployerHypeBalance)}`);
  console.log(`   Total HYPE needed: ${ethers.utils.formatEther(totalHypeNeeded)}`);

  if (deployerHypeBalance.lt(totalHypeNeeded)) {
    console.log("   ⚠️  WARNING: Insufficient HYPE tokens");
    console.log("   Skipping funding steps. Please fund manually later.\n");
  } else {
    // Fund ReferralSystem with HYPE
    console.log(`   → Approving ${ethers.utils.formatEther(config.INITIAL_HYPE_FUNDING)} HYPE for ReferralSystem...`);
    const approveReferralTx = await hypeToken.approve(referralSystem.address, config.INITIAL_HYPE_FUNDING);
    await approveReferralTx.wait();

    console.log("   → Funding ReferralSystem with HYPE...");
    const fundReferralTx = await referralSystem.fundHypeRewards(config.INITIAL_HYPE_FUNDING);
    await fundReferralTx.wait();
    console.log(`   ✅ ReferralSystem funded with ${ethers.utils.formatEther(config.INITIAL_HYPE_FUNDING)} HYPE\n`);

    // Fund PrivateSale with HYPE
    console.log(`   → Transferring ${ethers.utils.formatEther(config.SALE_HYPE_ALLOCATION)} HYPE to PrivateSale...`);
    const fundSaleTx = await hypeToken.transfer(privateSale.address, config.SALE_HYPE_ALLOCATION);
    await fundSaleTx.wait();
    console.log(`   ✅ PrivateSale funded with ${ethers.utils.formatEther(config.SALE_HYPE_ALLOCATION)} HYPE\n`);
  }

  // Check USDT funding
  const usdtToken = await ethers.getContractAt("IERC20", config.USDT_ADDRESS);
  const deployerUsdtBalance = await usdtToken.balanceOf(deployerAddress);

  console.log(`   Your USDT balance: ${ethers.utils.formatEther(deployerUsdtBalance)}`);
  console.log(`   USDT needed for rewards: ${ethers.utils.formatEther(config.INITIAL_USDT_FUNDING)}`);

  if (deployerUsdtBalance.lt(config.INITIAL_USDT_FUNDING)) {
    console.log("   ⚠️  WARNING: Insufficient USDT for reward funding");
    console.log("   Skipping USDT funding. Please fund manually later.\n");
  } else {
    console.log("   → Approving USDT for ReferralSystem...");
    const approveUsdtTx = await usdtToken.approve(referralSystem.address, config.INITIAL_USDT_FUNDING);
    await approveUsdtTx.wait();

    console.log("   → Funding ReferralSystem with USDT...");
    const fundUsdtTx = await referralSystem.fundUsdtRewards(config.INITIAL_USDT_FUNDING);
    await fundUsdtTx.wait();
    console.log(`   ✅ ReferralSystem funded with ${ethers.utils.formatEther(config.INITIAL_USDT_FUNDING)} USDT\n`);
  }

  // ============ STEP 5: Save Deployment Info ============
  console.log("💾 Step 5: Saving deployment information...");

  const deploymentInfo = {
    network: networkName,
    chainId: network.chainId,
    timestamp: new Date().toISOString(),
    deployer: deployerAddress,
    contracts: {
      HypeToken: hypeTokenAddress,
      UsdtToken: config.USDT_ADDRESS,
      ReferralSystem: referralSystem.address,
      PrivateSale: privateSale.address
    },
    configuration: {
      saleStartTime: saleStartTime,
      saleEndTime: saleStartTime + saleDuration,
      saleDuration: config.SALE_DURATION_DAYS + " days",
      tokensForSale: ethers.utils.formatEther(config.SALE_HYPE_ALLOCATION),
      referralRewardsFunded: ethers.utils.formatEther(config.INITIAL_HYPE_FUNDING),
      usdtRewardsFunded: ethers.utils.formatEther(config.INITIAL_USDT_FUNDING)
    },
    transactionHashes: {
      referralSystem: referralSystem.deployTransaction.hash,
      privateSale: privateSale.deployTransaction.hash
    }
  };

  const deploymentsDir = path.join(__dirname, "../deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }

  const filename = `referral-system-${networkName}-${Date.now()}.json`;
  const filepath = path.join(deploymentsDir, filename);

  fs.writeFileSync(filepath, JSON.stringify(deploymentInfo, null, 2));
  console.log(`✅ Deployment info saved to: ${filepath}\n`);

  // ============ STEP 6: Verification Instructions ============
  console.log("🔍 Step 6: Contract Verification\n");
  console.log("To verify contracts on BscScan, run:\n");

  console.log(`npx hardhat verify --network ${networkName} ${referralSystem.address} "${hypeTokenAddress}" "${config.USDT_ADDRESS}" "${deployerAddress}"`);
  console.log();
  console.log(`npx hardhat verify --network ${networkName} ${privateSale.address} "${hypeTokenAddress}" "${config.USDT_ADDRESS}" "${referralSystem.address}" ${saleStartTime} ${saleDuration}`);
  console.log();

  // ============ DEPLOYMENT SUMMARY ============
  console.log("═══════════════════════════════════════════════════════════");
  console.log("🎉 DEPLOYMENT COMPLETE!");
  console.log("═══════════════════════════════════════════════════════════");
  console.log();
  console.log("📋 Contract Addresses:");
  console.log(`   HYPEAI Token:    ${hypeTokenAddress}`);
  console.log(`   USDT Token:      ${config.USDT_ADDRESS}`);
  console.log(`   ReferralSystem:  ${referralSystem.address}`);
  console.log(`   PrivateSale:     ${privateSale.address}`);
  console.log();
  console.log("📅 Sale Schedule:");
  console.log(`   Start: ${new Date(saleStartTime * 1000).toLocaleString()}`);
  console.log(`   End:   ${new Date((saleStartTime + saleDuration) * 1000).toLocaleString()}`);
  console.log();
  console.log("📊 Configuration:");
  console.log(`   Tokens for Sale:       ${ethers.utils.formatEther(config.SALE_HYPE_ALLOCATION)} HYPE`);
  console.log(`   Referral Rewards Pool: ${ethers.utils.formatEther(config.INITIAL_HYPE_FUNDING)} HYPE`);
  console.log(`   USDT Rewards Pool:     ${ethers.utils.formatEther(config.INITIAL_USDT_FUNDING)} USDT`);
  console.log();
  console.log("📝 Next Steps:");
  console.log("   1. Verify contracts on BscScan (see commands above)");
  console.log("   2. Add users to whitelist: privateSale.addToWhitelist([addresses])");
  console.log("   3. Test referral flow with testnet addresses");
  console.log("   4. Update frontend with new contract addresses");
  console.log("   5. Monitor reward pool balances");
  console.log();
  console.log("═══════════════════════════════════════════════════════════");
}

/**
 * Helper function to find HYPE token address
 */
async function findHypeTokenAddress(network) {
  const deploymentsDir = path.join(__dirname, "../deployments");

  if (!fs.existsSync(deploymentsDir)) {
    return null;
  }

  const files = fs.readdirSync(deploymentsDir);
  const deploymentFiles = files
    .filter(f => f.includes(network) && f.endsWith('.json'))
    .sort()
    .reverse(); // Latest first

  for (const file of deploymentFiles) {
    try {
      const content = JSON.parse(fs.readFileSync(path.join(deploymentsDir, file), 'utf8'));
      if (content.contracts && content.contracts.HypeToken) {
        return content.contracts.HypeToken;
      }
    } catch (e) {
      // Skip invalid files
    }
  }

  return null;
}

// Execute deployment
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Deployment failed:");
    console.error(error);
    process.exit(1);
  });
