// ========================================
// BscScan Contract Verification Script
// Chain: BNB Chain Mainnet
// ========================================

const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

function log(message, level = "INFO") {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] [${level}] ${message}`);
}

function loadDeployment(filename) {
  const filepath = path.join(__dirname, `../../deployments/mainnet/${filename}`);
  if (!fs.existsSync(filepath)) {
    log(`Deployment file not found: ${filename}`, "WARN");
    return null;
  }
  return JSON.parse(fs.readFileSync(filepath, "utf8"));
}

async function verifyContract(address, constructorArgs, contractName = "") {
  try {
    log(`Verifying ${contractName} at ${address}...`);

    await hre.run("verify:verify", {
      address: address,
      constructorArguments: constructorArgs,
    });

    log(`✓ ${contractName} verified successfully`);
    return true;

  } catch (error) {
    if (error.message.includes("already verified")) {
      log(`Contract already verified: ${contractName}`, "INFO");
      return true;
    }

    log(`Verification failed for ${contractName}: ${error.message}`, "ERROR");
    return false;
  }
}

async function verifyWithRetry(address, constructorArgs, contractName, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    log(`Verification attempt ${i + 1}/${maxRetries} for ${contractName}`);

    const success = await verifyContract(address, constructorArgs, contractName);

    if (success) {
      return true;
    }

    if (i < maxRetries - 1) {
      const delay = parseInt(process.env.RETRY_DELAY_SECONDS || "30");
      log(`Waiting ${delay} seconds before retry...`);
      await new Promise(resolve => setTimeout(resolve, delay * 1000));
    }
  }

  log(`Failed to verify ${contractName} after ${maxRetries} attempts`, "ERROR");
  return false;
}

async function main() {
  try {
    log("========================================");
    log("BscScan Contract Verification");
    log("Network: BNB Chain Mainnet");
    log("========================================");

    if (!process.env.BSCSCAN_API_KEY) {
      throw new Error("BSCSCAN_API_KEY not set in environment");
    }

    const results = {
      verified: [],
      failed: [],
      skipped: [],
    };

    // 1. Verify Token
    log("\n[1/7] Verifying Token Contract...");
    const tokenDeployment = loadDeployment("token-deployment.json");
    if (tokenDeployment) {
      const token = tokenDeployment.token;
      const success = await verifyWithRetry(
        token.address,
        [
          token.name,
          token.symbol,
          token.totalSupply,
          token.treasuryWallet,
        ],
        "Token"
      );
      (success ? results.verified : results.failed).push("Token");
    } else {
      results.skipped.push("Token");
    }

    // 2. Verify Private Sale
    log("\n[2/7] Verifying Private Sale Contract...");
    const privateSaleDeployment = loadDeployment("private-sale-deployment.json");
    if (privateSaleDeployment) {
      const ps = privateSaleDeployment.privateSale;
      const success = await verifyWithRetry(
        ps.address,
        [
          ps.tokenAddress,
          ps.tokenPrice,
          ps.hardCap,
          ps.minPurchase,
          ps.maxPurchase,
          ps.treasuryWallet,
        ],
        "Private Sale"
      );
      (success ? results.verified : results.failed).push("Private Sale");
    } else {
      results.skipped.push("Private Sale");
    }

    // 3. Verify Referral System
    log("\n[3/7] Verifying Referral System Contract...");
    const referralDeployment = loadDeployment("referral-deployment.json");
    if (referralDeployment) {
      const ref = referralDeployment.referralSystem;
      const success = await verifyWithRetry(
        ref.address,
        [
          ref.tokenAddress,
          ref.treasuryWallet,
        ],
        "Referral System"
      );
      (success ? results.verified : results.failed).push("Referral System");
    } else {
      results.skipped.push("Referral System");
    }

    // 4. Verify Vesting
    log("\n[4/7] Verifying Vesting Contract...");
    const vestingDeployment = loadDeployment("vesting-deployment.json");
    if (vestingDeployment) {
      const vest = vestingDeployment.vesting;
      const success = await verifyWithRetry(
        vest.address,
        [
          vest.tokenAddress,
          vest.beneficiary,
          vest.cliffDuration,
          vest.totalDuration,
        ],
        "Vesting"
      );
      (success ? results.verified : results.failed).push("Vesting");
    } else {
      results.skipped.push("Vesting");
    }

    // 5. Verify Governance
    log("\n[5/7] Verifying Governance DAO Contract...");
    const governanceDeployment = loadDeployment("governance-deployment.json");
    if (governanceDeployment) {
      const gov = governanceDeployment.governance;
      const success = await verifyWithRetry(
        gov.address,
        [
          gov.tokenAddress,
          gov.quorumPercent,
          gov.votingPeriod,
        ],
        "Governance DAO"
      );
      (success ? results.verified : results.failed).push("Governance DAO");
    } else {
      results.skipped.push("Governance DAO");
    }

    // 6. Verify Staking
    log("\n[6/7] Verifying Staking Contract...");
    const stakingDeployment = loadDeployment("staking-deployment.json");
    if (stakingDeployment) {
      const stake = stakingDeployment.staking;
      const success = await verifyWithRetry(
        stake.address,
        [
          stake.tokenAddress,
          stake.minStakeAmount,
          stake.apyPercent,
          stake.treasuryWallet,
        ],
        "Staking"
      );
      (success ? results.verified : results.failed).push("Staking");
    } else {
      results.skipped.push("Staking");
    }

    // 7. Verify Oracle
    log("\n[7/7] Verifying AI Oracle Contract...");
    const oracleDeployment = loadDeployment("oracle-deployment.json");
    if (oracleDeployment) {
      const oracle = oracleDeployment.oracle;
      const success = await verifyWithRetry(
        oracle.address,
        [
          oracle.tokenAddress,
          oracle.priceFeed,
          oracle.treasuryWallet,
        ],
        "AI Oracle"
      );
      (success ? results.verified : results.failed).push("AI Oracle");
    } else {
      results.skipped.push("AI Oracle");
    }

    // Summary
    log("\n========================================");
    log("Verification Summary");
    log("========================================");
    log(`✓ Verified: ${results.verified.length} contracts`);
    results.verified.forEach(name => log(`  - ${name}`));

    if (results.failed.length > 0) {
      log(`✗ Failed: ${results.failed.length} contracts`, "ERROR");
      results.failed.forEach(name => log(`  - ${name}`, "ERROR"));
    }

    if (results.skipped.length > 0) {
      log(`⊘ Skipped: ${results.skipped.length} contracts`, "WARN");
      results.skipped.forEach(name => log(`  - ${name}`, "WARN"));
    }

    log("========================================");

    // Save verification report
    const reportPath = path.join(__dirname, "../../deployments/mainnet/verification-report.json");
    fs.writeFileSync(
      reportPath,
      JSON.stringify({
        timestamp: new Date().toISOString(),
        network: "bsc",
        chainId: 56,
        results,
      }, null, 2)
    );
    log(`Verification report saved: ${reportPath}`);

    if (results.failed.length > 0) {
      process.exit(1);
    }

  } catch (error) {
    log(`Verification process failed: ${error.message}`, "ERROR");
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

module.exports = { main, verifyContract, verifyWithRetry };
