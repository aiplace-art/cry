const hre = require("hardhat");
const fs = require('fs');

/**
 * VERIFY CONTRACTS ON BSCSCAN TESTNET
 *
 * This script verifies all deployed contracts on BSCScan Testnet
 * Requires: BSCSCAN_API_KEY in .env
 *
 * Usage:
 *   node scripts/verify-contracts.js
 *
 * Or individual contract:
 *   npx hardhat verify --network bscTestnet <address> <constructor_args>
 */

async function main() {
  console.log("\n" + "=".repeat(80));
  console.log("🔍 VERIFYING CONTRACTS ON BSCSCAN TESTNET");
  console.log("=".repeat(80) + "\n");

  // Load deployment info
  const deploymentPath = './deployments/bsc-testnet-10b.json';

  if (!fs.existsSync(deploymentPath)) {
    throw new Error(`❌ Deployment file not found: ${deploymentPath}

Run deployment script first: node scripts/deploy-10b-testnet.js`);
  }

  const deployment = JSON.parse(fs.readFileSync(deploymentPath, 'utf8'));
  const { contracts, saleParams } = deployment;

  console.log("📄 Loaded deployment info:");
  console.log("   Network:", deployment.network);
  console.log("   Deployed at:", deployment.deployedAt);
  console.log("   Deployer:", deployment.deployer);
  console.log("\n");

  // Get deployer address
  const [deployer] = await hre.ethers.getSigners();
  const TREASURY_WALLET = deployer.address;
  const LIQUIDITY_WALLET = deployer.address;

  try {
    // ============================================================
    // 1. Verify HypeAI Token
    // ============================================================
    console.log("🔍 [1/4] Verifying HypeAI Token...");
    console.log("   Address:", contracts.hypeaiToken);

    await hre.run("verify:verify", {
      address: contracts.hypeaiToken,
      constructorArguments: [
        TREASURY_WALLET,
        LIQUIDITY_WALLET
      ],
      contract: "src/contracts/Token.sol:HypeAI"
    });

    console.log("   ✅ HypeAI Token verified!\n");

    // ============================================================
    // 2. Verify PrivateSale Contract
    // ============================================================
    console.log("🔍 [2/4] Verifying PrivateSale Contract...");
    console.log("   Address:", contracts.privateSale);

    await hre.run("verify:verify", {
      address: contracts.privateSale,
      constructorArguments: [
        contracts.hypeaiToken,
        contracts.usdt,
        saleParams.startTime,
        saleParams.duration
      ],
      contract: "src/contracts/PrivateSale.sol:HypeAIPrivateSale"
    });

    console.log("   ✅ PrivateSale verified!\n");

    // ============================================================
    // 3. Verify ReferralSystem Contract
    // ============================================================
    console.log("🔍 [3/4] Verifying ReferralSystem Contract...");
    console.log("   Address:", contracts.referralSystem);

    await hre.run("verify:verify", {
      address: contracts.referralSystem,
      constructorArguments: [
        contracts.hypeaiToken,
        contracts.usdt,
        contracts.privateSale
      ],
      contract: "src/contracts/ReferralSystem.sol:HypeAIReferralSystem"
    });

    console.log("   ✅ ReferralSystem verified!\n");

    // ============================================================
    // 4. Verify PrivateSaleWithReferral Contract
    // ============================================================
    console.log("🔍 [4/4] Verifying PrivateSaleWithReferral Contract...");
    console.log("   Address:", contracts.privateSaleWithReferral);

    await hre.run("verify:verify", {
      address: contracts.privateSaleWithReferral,
      constructorArguments: [
        contracts.hypeaiToken,
        contracts.usdt,
        contracts.referralSystem,
        saleParams.startTime,
        saleParams.duration
      ],
      contract: "src/contracts/PrivateSaleWithReferral.sol:HypeAIPrivateSaleWithReferral"
    });

    console.log("   ✅ PrivateSaleWithReferral verified!\n");

    // ============================================================
    // SUMMARY
    // ============================================================
    console.log("=".repeat(80));
    console.log("✅ ALL CONTRACTS VERIFIED!");
    console.log("=".repeat(80));
    console.log("\n📄 BSCScan Testnet Links:");
    console.log(`   HypeAI Token:              https://testnet.bscscan.com/address/${contracts.hypeaiToken}`);
    console.log(`   PrivateSale:               https://testnet.bscscan.com/address/${contracts.privateSale}`);
    console.log(`   ReferralSystem:            https://testnet.bscscan.com/address/${contracts.referralSystem}`);
    console.log(`   PrivateSaleWithReferral:   https://testnet.bscscan.com/address/${contracts.privateSaleWithReferral}`);
    console.log("\n" + "=".repeat(80) + "\n");

  } catch (error) {
    if (error.message.includes("Already Verified")) {
      console.log("   ℹ️  Contract already verified\n");
    } else {
      throw error;
    }
  }
}

main()
  .then(() => {
    console.log("✅ Verification complete!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ VERIFICATION FAILED:", error);
    console.error("\nPossible issues:");
    console.error("   - Missing BSCSCAN_API_KEY in .env");
    console.error("   - Wait 30-60 seconds after deployment before verifying");
    console.error("   - Constructor arguments mismatch");
    console.error("\nGet BSCScan API key from: https://bscscan.com/myapikey");
    process.exit(1);
  });
