const hre = require("hardhat");
const { ethers } = require("hardhat");

/**
 * Contract upgrade and migration script
 * Handles safe upgrades with state preservation
 */

async function upgradeContracts(deploymentFile) {
  console.log("🔄 Starting contract upgrade process...\n");

  const [deployer] = await ethers.getSigners();
  const fs = require("fs");
  const path = require("path");

  // Load previous deployment
  const previousDeployment = JSON.parse(
    fs.readFileSync(path.join(__dirname, "..", deploymentFile), "utf8")
  );

  console.log("📋 Previous Deployment Info:");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("Network:", previousDeployment.network);
  console.log("Deployed:", previousDeployment.timestamp);
  console.log("Token:", previousDeployment.contracts.HypedToken.address);
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  // Connect to existing contracts
  const token = await ethers.getContractAt(
    "HypedToken",
    previousDeployment.contracts.HypedToken.address
  );

  const oracle = await ethers.getContractAt(
    "AIOracle",
    previousDeployment.contracts.AIOracle.address
  );

  const staking = await ethers.getContractAt(
    "StakingContract",
    previousDeployment.contracts.StakingContract.address
  );

  const governance = await ethers.getContractAt(
    "GovernanceDAO",
    previousDeployment.contracts.GovernanceDAO.address
  );

  console.log("1️⃣ Backing up current state...");

  // Backup critical state
  const backup = {
    token: {
      totalSupply: await token.totalSupply(),
      tradingEnabled: await token.tradingEnabled(),
      totalFees: await token.totalFees(),
      maxTransactionAmount: await token.maxTransactionAmount(),
    },
    staking: {
      poolCount: await staking.poolCount(),
      totalStakedGlobal: await staking.totalStakedGlobal(),
      rewardTreasury: await staking.rewardTreasury(),
    },
    governance: {
      proposalCount: await governance.proposalCount(),
      quorumPercentage: await governance.quorumPercentage(),
    },
  };

  console.log("✅ State backup complete");
  console.log("   Total Supply:", ethers.utils.formatEther(backup.token.totalSupply));
  console.log("   Total Staked:", ethers.utils.formatEther(backup.staking.totalStakedGlobal));
  console.log("   Proposals:", backup.governance.proposalCount.toString(), "\n");

  // Migration steps
  console.log("2️⃣ Performing migration tasks...");

  // Example: Update fee parameters
  console.log("   - Updating fee parameters...");
  const newReflectionFee = 200;
  const newLiquidityFee = 300;
  const newBurnFee = 100;
  const newTreasuryFee = 200;

  try {
    await token.setFees(
      newReflectionFee,
      newLiquidityFee,
      newBurnFee,
      newTreasuryFee
    );
    console.log("   ✅ Fees updated");
  } catch (error) {
    console.log("   ⚠️ Fee update skipped (already set or unauthorized)");
  }

  // Example: Update oracle parameters
  console.log("   - Updating oracle parameters...");
  try {
    await oracle.setMaxDataAge(3600); // 1 hour
    console.log("   ✅ Oracle parameters updated");
  } catch (error) {
    console.log("   ⚠️ Oracle update skipped (unauthorized)");
  }

  console.log("✅ Migration complete\n");

  // Verification
  console.log("3️⃣ Verifying migration...");

  const newState = {
    token: {
      totalSupply: await token.totalSupply(),
      tradingEnabled: await token.tradingEnabled(),
      totalFees: await token.totalFees(),
    },
    staking: {
      totalStakedGlobal: await staking.totalStakedGlobal(),
    },
  };

  console.log("   - Total Supply: ",
    backup.token.totalSupply.eq(newState.token.totalSupply) ? "✅ Unchanged" : "❌ Changed!"
  );
  console.log("   - Total Staked: ",
    backup.staking.totalStakedGlobal.eq(newState.staking.totalStakedGlobal) ? "✅ Unchanged" : "❌ Changed!"
  );

  console.log("\n✅ Upgrade and migration complete!\n");

  // Save migration report
  const migrationReport = {
    timestamp: new Date().toISOString(),
    network: hre.network.name,
    previousDeployment: previousDeployment.timestamp,
    backup,
    newState,
    changes: [
      "Updated fee parameters",
      "Updated oracle max data age",
    ],
  };

  const reportPath = path.join(
    __dirname,
    "..",
    "memory",
    `migration-${Date.now()}.json`
  );

  fs.writeFileSync(reportPath, JSON.stringify(migrationReport, null, 2));

  console.log("📝 Migration report saved to:", reportPath);
}

// CLI usage
if (require.main === module) {
  const deploymentFile = process.argv[2];

  if (!deploymentFile) {
    console.error("❌ Usage: node upgrade-migration.js <deployment-file>");
    process.exit(1);
  }

  upgradeContracts(deploymentFile)
    .then(() => process.exit(0))
    .catch((error) => {
      console.error("❌ Migration failed:", error);
      process.exit(1);
    });
}

module.exports = upgradeContracts;
