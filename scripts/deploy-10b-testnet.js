const hre = require("hardhat");
const fs = require('fs');

/**
 * BSC TESTNET DEPLOYMENT SCRIPT - 10B TOKENOMICS
 *
 * Deploys:
 * 1. HypeAI Token (10B supply)
 * 2. PrivateSale Contract (1.1B allocation, $0.00008 price)
 * 3. ReferralSystem Contract (2-tier rewards)
 * 4. PrivateSaleWithReferral Contract (integrated referral)
 *
 * Network: BSC Testnet (Chain ID: 97)
 * Gas: ~0.05 BNB (~$30 at $600/BNB)
 */

async function main() {
  const [deployer] = await hre.ethers.getSigners();

  console.log("\n" + "=".repeat(80));
  console.log("🚀 DEPLOYING HYPEAI 10B TOKENOMICS TO BSC TESTNET");
  console.log("=".repeat(80));
  console.log("📍 Deployer Address:", deployer.address);
  console.log("💰 Balance:", hre.ethers.formatEther(await hre.ethers.provider.getBalance(deployer.address)), "BNB");
  console.log("🌐 Network:", (await hre.ethers.provider.getNetwork()).name);
  console.log("🔗 Chain ID:", (await hre.ethers.provider.getNetwork()).chainId);
  console.log("=".repeat(80) + "\n");

  // Check balance
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  const minBalance = hre.ethers.parseEther("0.1"); // 0.1 BNB minimum

  if (balance < minBalance) {
    throw new Error(`❌ Insufficient balance! Need at least 0.1 BNB, have ${hre.ethers.formatEther(balance)} BNB

Get testnet BNB from faucet: https://testnet.bnbchain.org/faucet-smart`);
  }

  // BSC Testnet USDT address (or deploy mock)
  const USDT_ADDRESS = "0x337610d27c682E347C9cD60BD4b3b107C9d34dDd";

  // Treasury and liquidity wallets (using deployer for testing)
  const TREASURY_WALLET = deployer.address;
  const LIQUIDITY_WALLET = deployer.address;

  // Sale parameters
  const SALE_START = Math.floor(Date.now() / 1000) + 300; // Starts in 5 minutes
  const SALE_DURATION = 30 * 24 * 60 * 60; // 30 days

  // ============================================================
  // STEP 1: Deploy HypeAI Token (10B supply)
  // ============================================================
  console.log("📦 [1/4] Deploying HypeAI Token (10B supply)...");

  const HypeAI = await hre.ethers.getContractFactory("HypeAI");
  const hypeaiToken = await HypeAI.deploy(
    TREASURY_WALLET,
    LIQUIDITY_WALLET
  );
  await hypeaiToken.waitForDeployment();
  const hypeaiAddress = await hypeaiToken.getAddress();

  console.log("✅ HypeAI Token deployed to:", hypeaiAddress);
  console.log("   Total Supply: 10,000,000,000 HYPE");

  // Wait for confirmations
  console.log("   ⏳ Waiting for 3 confirmations...");
  await hypeaiToken.deploymentTransaction().wait(3);
  console.log("   ✅ Confirmed!\n");

  // ============================================================
  // STEP 2: Deploy PrivateSale Contract (1.1B allocation)
  // ============================================================
  console.log("📦 [2/4] Deploying PrivateSale Contract...");

  const PrivateSale = await hre.ethers.getContractFactory("HypeAIPrivateSale");
  const privateSale = await PrivateSale.deploy(
    hypeaiAddress,
    USDT_ADDRESS,
    SALE_START,
    SALE_DURATION
  );
  await privateSale.waitForDeployment();
  const privateSaleAddress = await privateSale.getAddress();

  console.log("✅ PrivateSale deployed to:", privateSaleAddress);
  console.log("   Allocation: 1,100,000,000 HYPE (1.1B)");
  console.log("   Price: $0.00008 per HYPE");
  console.log("   Min Purchase: $40");
  console.log("   Max Purchase: $800");
  console.log("   Hard Cap: $80,000");

  console.log("   ⏳ Waiting for 3 confirmations...");
  await privateSale.deploymentTransaction().wait(3);
  console.log("   ✅ Confirmed!\n");

  // ============================================================
  // STEP 3: Deploy ReferralSystem Contract
  // ============================================================
  console.log("📦 [3/4] Deploying ReferralSystem Contract...");

  const ReferralSystem = await hre.ethers.getContractFactory("HypeAIReferralSystem");
  const referralSystem = await ReferralSystem.deploy(
    hypeaiAddress,
    USDT_ADDRESS,
    privateSaleAddress
  );
  await referralSystem.waitForDeployment();
  const referralSystemAddress = await referralSystem.getAddress();

  console.log("✅ ReferralSystem deployed to:", referralSystemAddress);
  console.log("   Direct Reward: 5% + 2% (in HYPE or USDT)");
  console.log("   Second-tier Reward: 2% + 1%");
  console.log("   Max Cap: $10,000 per referrer");

  console.log("   ⏳ Waiting for 3 confirmations...");
  await referralSystem.deploymentTransaction().wait(3);
  console.log("   ✅ Confirmed!\n");

  // ============================================================
  // STEP 4: Deploy PrivateSaleWithReferral Contract
  // ============================================================
  console.log("📦 [4/4] Deploying PrivateSaleWithReferral Contract...");

  const PrivateSaleWithReferral = await hre.ethers.getContractFactory("HypeAIPrivateSaleWithReferral");
  const privateSaleWithReferral = await PrivateSaleWithReferral.deploy(
    hypeaiAddress,
    USDT_ADDRESS,
    referralSystemAddress,
    SALE_START,
    SALE_DURATION
  );
  await privateSaleWithReferral.waitForDeployment();
  const privateSaleWithReferralAddress = await privateSaleWithReferral.getAddress();

  console.log("✅ PrivateSaleWithReferral deployed to:", privateSaleWithReferralAddress);
  console.log("   Integrated referral tracking");
  console.log("   Same parameters as PrivateSale");

  console.log("   ⏳ Waiting for 3 confirmations...");
  await privateSaleWithReferral.deploymentTransaction().wait(3);
  console.log("   ✅ Confirmed!\n");

  // ============================================================
  // STEP 5: Transfer Tokens to Contracts
  // ============================================================
  console.log("💸 Transferring tokens to contracts...");

  // Transfer 1.1B to PrivateSale contract
  const tokensForPrivateSale = hre.ethers.parseUnits("1100000000", 18); // 1.1B
  console.log("   📤 Transferring 1.1B HYPE to PrivateSale...");
  const transferTx1 = await hypeaiToken.transfer(privateSaleAddress, tokensForPrivateSale);
  await transferTx1.wait();
  console.log("   ✅ Transferred 1,100,000,000 HYPE");

  // Transfer 1.1B to PrivateSaleWithReferral contract
  console.log("   📤 Transferring 1.1B HYPE to PrivateSaleWithReferral...");
  const transferTx2 = await hypeaiToken.transfer(privateSaleWithReferralAddress, tokensForPrivateSale);
  await transferTx2.wait();
  console.log("   ✅ Transferred 1,100,000,000 HYPE");

  // Transfer 500M to ReferralSystem for rewards (adjustable)
  const tokensForReferrals = hre.ethers.parseUnits("500000000", 18); // 500M
  console.log("   📤 Transferring 500M HYPE to ReferralSystem (for rewards)...");
  const transferTx3 = await hypeaiToken.transfer(referralSystemAddress, tokensForReferrals);
  await transferTx3.wait();
  console.log("   ✅ Transferred 500,000,000 HYPE\n");

  // ============================================================
  // STEP 6: Configure Contracts
  // ============================================================
  console.log("⚙️  Configuring contracts...");

  // Add deployer to whitelist for testing
  console.log("   📋 Adding deployer to PrivateSale whitelist...");
  const whitelistTx1 = await privateSale.addToWhitelist([deployer.address]);
  await whitelistTx1.wait();
  console.log("   ✅ Deployer whitelisted");

  console.log("   📋 Adding deployer to PrivateSaleWithReferral whitelist...");
  const whitelistTx2 = await privateSaleWithReferral.addToWhitelist([deployer.address]);
  await whitelistTx2.wait();
  console.log("   ✅ Deployer whitelisted\n");

  // ============================================================
  // FINAL SUMMARY
  // ============================================================
  console.log("=".repeat(80));
  console.log("🎉 DEPLOYMENT SUCCESSFUL!");
  console.log("=".repeat(80));
  console.log("\n📄 CONTRACT ADDRESSES:");
  console.log("   HypeAI Token:              ", hypeaiAddress);
  console.log("   PrivateSale:               ", privateSaleAddress);
  console.log("   ReferralSystem:            ", referralSystemAddress);
  console.log("   PrivateSaleWithReferral:   ", privateSaleWithReferralAddress);
  console.log("   USDT (Testnet):            ", USDT_ADDRESS);
  console.log("\n⏰ SALE TIMES:");
  console.log("   Start:", new Date(SALE_START * 1000).toLocaleString());
  console.log("   End:  ", new Date((SALE_START + SALE_DURATION) * 1000).toLocaleString());
  console.log("\n💰 TOKEN ALLOCATION:");
  console.log("   Total Supply:              10,000,000,000 HYPE");
  console.log("   PrivateSale:               1,100,000,000 HYPE (11%)");
  console.log("   PrivateSaleWithReferral:   1,100,000,000 HYPE (11%)");
  console.log("   ReferralSystem Rewards:    500,000,000 HYPE (5%)");
  console.log("   Deployer Balance:          ~7,300,000,000 HYPE (73%)");
  console.log("=".repeat(80));

  // ============================================================
  // SAVE DEPLOYMENT INFO
  // ============================================================
  const deploymentInfo = {
    network: "BSC Testnet",
    chainId: 97,
    deployedAt: new Date().toISOString(),
    deployer: deployer.address,
    contracts: {
      hypeaiToken: hypeaiAddress,
      privateSale: privateSaleAddress,
      referralSystem: referralSystemAddress,
      privateSaleWithReferral: privateSaleWithReferralAddress,
      usdt: USDT_ADDRESS
    },
    saleParams: {
      startTime: SALE_START,
      startDate: new Date(SALE_START * 1000).toISOString(),
      endTime: SALE_START + SALE_DURATION,
      endDate: new Date((SALE_START + SALE_DURATION) * 1000).toISOString(),
      duration: SALE_DURATION,
      price: "$0.00008",
      minPurchase: "$40",
      maxPurchase: "$800",
      hardCap: "$80,000"
    },
    tokenomics: {
      totalSupply: "10,000,000,000",
      privateSaleAllocation: "1,100,000,000",
      referralRewards: "500,000,000"
    }
  };

  // Save to JSON
  const deploymentsDir = './deployments';
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }
  fs.writeFileSync(
    `${deploymentsDir}/bsc-testnet-10b.json`,
    JSON.stringify(deploymentInfo, null, 2)
  );
  console.log("\n💾 Deployment info saved to: deployments/bsc-testnet-10b.json");

  // Save .env.testnet for frontend
  const envContent = `# BSC Testnet Deployment - 10B Tokenomics
NEXT_PUBLIC_HYPEAI_TOKEN=${hypeaiAddress}
NEXT_PUBLIC_PRIVATE_SALE=${privateSaleAddress}
NEXT_PUBLIC_REFERRAL_SYSTEM=${referralSystemAddress}
NEXT_PUBLIC_PRIVATE_SALE_WITH_REFERRAL=${privateSaleWithReferralAddress}
NEXT_PUBLIC_USDT_TOKEN=${USDT_ADDRESS}
NEXT_PUBLIC_BSC_RPC_URL=https://data-seed-prebsc-1-s1.binance.org:8545
NEXT_PUBLIC_CHAIN_ID=97
NEXT_PUBLIC_NETWORK_NAME=BSC Testnet
NEXT_PUBLIC_SALE_START=${SALE_START}
NEXT_PUBLIC_SALE_END=${SALE_START + SALE_DURATION}
`;

  if (!fs.existsSync('./src/frontend')) {
    fs.mkdirSync('./src/frontend', { recursive: true });
  }
  fs.writeFileSync('./src/frontend/.env.testnet', envContent);
  console.log("💾 Frontend config saved to: src/frontend/.env.testnet");

  // ============================================================
  // NEXT STEPS
  // ============================================================
  console.log("\n📝 NEXT STEPS:");
  console.log("   1️⃣  Verify contracts on BSCScan Testnet:");
  console.log("       npx hardhat verify --network bscTestnet <contract_address> <constructor_args>");
  console.log("\n   2️⃣  Get testnet USDT:");
  console.log("       - Swap testnet BNB to USDT on PancakeSwap Testnet");
  console.log("       - Or deploy mock USDT");
  console.log("\n   3️⃣  Test purchase flow:");
  console.log("       - Use scripts/test-purchase.js");
  console.log("       - Test both BNB and USDT purchases");
  console.log("\n   4️⃣  Frontend setup:");
  console.log("       - Copy .env.testnet to .env.local");
  console.log("       - Restart dev server");
  console.log("       - Connect MetaMask to BSC Testnet");
  console.log("\n   5️⃣  Community testing (7 days minimum)");
  console.log("\n   6️⃣  Mainnet deployment when ready!");
  console.log("\n" + "=".repeat(80) + "\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ DEPLOYMENT FAILED:", error);
    console.error("\nError details:", error.message);
    process.exit(1);
  });
