// ========================================
// Data Migration Plan for Mainnet Deployment
// Chain: BNB Chain Mainnet
// ========================================

const fs = require("fs");
const path = require("path");

/**
 * Data Migration Strategy for HypeAI Mainnet Deployment
 *
 * This plan outlines how to migrate data from testnet to mainnet
 * or handle fresh mainnet deployment without prior data.
 */

const MIGRATION_PLAN = {
  version: "1.0.0",
  network: {
    from: "bscTestnet",
    to: "bsc",
  },

  // Phase 1: Pre-Migration Assessment
  assessment: {
    description: "Evaluate what data needs migration",
    steps: [
      {
        id: "assess-1",
        task: "Identify testnet contracts and deployed addresses",
        command: "ls deployments/testnet/",
        automated: true,
      },
      {
        id: "assess-2",
        task: "Check if testnet has active users/data",
        command: "npx hardhat run scripts/migration/check-testnet-activity.js --network bscTestnet",
        automated: true,
      },
      {
        id: "assess-3",
        task: "Determine data that needs migration",
        items: [
          "User whitelists (if any)",
          "Referral relationships",
          "Governance proposals",
          "Staking positions (unlikely for testnet)",
        ],
        automated: false,
      },
    ],
  },

  // Phase 2: Data Export (if needed)
  export: {
    description: "Export data from testnet contracts",
    required: "Only if testnet has real user data to preserve",
    steps: [
      {
        id: "export-1",
        task: "Export private sale participants",
        script: "scripts/migration/export-private-sale-data.js",
        outputFile: "deployments/migration/private-sale-participants.json",
      },
      {
        id: "export-2",
        task: "Export referral relationships",
        script: "scripts/migration/export-referral-data.js",
        outputFile: "deployments/migration/referral-data.json",
      },
      {
        id: "export-3",
        task: "Export governance proposals",
        script: "scripts/migration/export-governance-data.js",
        outputFile: "deployments/migration/governance-data.json",
      },
      {
        id: "export-4",
        task: "Export whitelist addresses",
        script: "scripts/migration/export-whitelist.js",
        outputFile: "deployments/migration/whitelist.json",
      },
    ],
  },

  // Phase 3: Data Validation
  validation: {
    description: "Validate exported data before migration",
    steps: [
      {
        id: "validate-1",
        task: "Verify data integrity",
        checks: [
          "All addresses are valid",
          "No duplicate entries",
          "Data schema is correct",
          "Checksums match",
        ],
      },
      {
        id: "validate-2",
        task: "Create data backup",
        command: "cp -r deployments/migration deployments/migration-backup-$(date +%Y%m%d)",
      },
    ],
  },

  // Phase 4: Mainnet Deployment
  deployment: {
    description: "Deploy fresh contracts to mainnet",
    steps: [
      {
        id: "deploy-1",
        task: "Deploy all smart contracts to mainnet",
        command: "./scripts/deployment/mainnet-deploy.sh",
      },
      {
        id: "deploy-2",
        task: "Verify all contracts on BscScan",
        command: "npx hardhat run scripts/deployment/08-verify-contracts.js --network bsc",
      },
    ],
  },

  // Phase 5: Data Import (if needed)
  import: {
    description: "Import data to mainnet contracts",
    required: "Only if there's data to migrate",
    caution: "⚠️ This costs gas and should be batched efficiently",
    steps: [
      {
        id: "import-1",
        task: "Import whitelist addresses (batched)",
        script: "scripts/migration/import-whitelist.js",
        estimatedGas: "~50,000 per 100 addresses",
        batching: true,
      },
      {
        id: "import-2",
        task: "Import referral relationships (if needed)",
        script: "scripts/migration/import-referral-data.js",
        estimatedGas: "~100,000 per 50 relationships",
        batching: true,
      },
      {
        id: "import-3",
        task: "Restore governance state (if needed)",
        script: "scripts/migration/import-governance-data.js",
        manual: true,
      },
    ],
  },

  // Phase 6: Post-Migration Verification
  verification: {
    description: "Verify migration completed successfully",
    steps: [
      {
        id: "verify-1",
        task: "Compare testnet vs mainnet data",
        script: "scripts/migration/verify-migration.js",
      },
      {
        id: "verify-2",
        task: "Test all contract functions",
        script: "tests/integration/mainnet-integration-test.js",
      },
      {
        id: "verify-3",
        task: "Verify user balances and relationships",
        manual: true,
      },
    ],
  },

  // Special Cases
  specialCases: {
    freshDeployment: {
      description: "If this is a fresh mainnet deployment with no prior testnet data",
      required: false,
      steps: [
        "Skip Phase 2 (Export)",
        "Skip Phase 5 (Import)",
        "Proceed directly to deployment",
        "Configure initial parameters only",
      ],
    },

    testnetWithUsers: {
      description: "If testnet has active users who need their data migrated",
      required: true,
      steps: [
        "Execute all phases sequentially",
        "Notify users about migration timeline",
        "Provide migration status updates",
        "Verify each user's data after migration",
      ],
    },

    airdropApproach: {
      description: "Alternative: Use airdrop for testnet users instead of migration",
      recommended: true,
      steps: [
        "Export testnet user addresses and balances",
        "Deploy fresh mainnet contracts",
        "Execute mainnet airdrop to testnet users",
        "Much simpler and gas-efficient than complex migration",
      ],
    },
  },

  // Rollback Plan
  rollback: {
    description: "What to do if migration fails",
    steps: [
      {
        id: "rollback-1",
        task: "Pause mainnet contracts",
        command: "npx hardhat run scripts/emergency/pause-all-contracts.js --network bsc",
      },
      {
        id: "rollback-2",
        task: "Keep testnet contracts active",
        action: "Don't shut down testnet until mainnet is proven stable",
      },
      {
        id: "rollback-3",
        task: "Document issues and plan fix",
        action: "Create incident report with failure details",
      },
      {
        id: "rollback-4",
        task: "Communicate to users",
        action: "Announce migration delay and revised timeline",
      },
    ],
  },

  // Gas Cost Estimates
  gasCosts: {
    description: "Estimated gas costs for data migration",
    estimates: {
      whitelistImport: {
        per100Addresses: "~50,000 gas",
        costAt5Gwei: "~0.00025 BNB per 100 addresses",
      },
      referralImport: {
        per50Relationships: "~100,000 gas",
        costAt5Gwei: "~0.0005 BNB per 50 relationships",
      },
      governanceImport: {
        perProposal: "~200,000 gas",
        costAt5Gwei: "~0.001 BNB per proposal",
      },
    },
    recommendation: "For large datasets (>1000 items), consider using off-chain storage with Merkle proofs",
  },

  // Timeline Estimate
  timeline: {
    assessment: "1-2 days",
    exportAndValidation: "1 day",
    deployment: "1 day",
    import: "1-3 days (depends on data volume)",
    verification: "2-3 days",
    total: "6-11 days",
    buffer: "+3 days for unexpected issues",
  },

  // Recommended Approach for HypeAI
  recommendation: {
    approach: "FRESH_DEPLOYMENT",
    reason: "Most projects don't have significant testnet user data to migrate",
    plan: [
      "Deploy fresh mainnet contracts",
      "Start with clean state",
      "No data migration needed",
      "If testnet users exist, offer mainnet airdrop as gesture",
      "Much simpler and lower risk than complex migration",
    ],
    alternatives: {
      ifTestnetHasRealUsers: "Use airdrop approach instead of migration",
      ifGovernanceProposals: "Recreate proposals manually on mainnet",
      ifReferralTree: "Export and import only if critical to preserve",
    },
  },
};

// Generate migration plan document
function generateMigrationPlanDocument() {
  const outputPath = path.join(__dirname, "../../deployments/migration/migration-plan.json");
  const outputDir = path.dirname(outputPath);

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  fs.writeFileSync(outputPath, JSON.stringify(MIGRATION_PLAN, null, 2));

  console.log("✓ Migration plan generated:");
  console.log(`  ${outputPath}`);
  console.log("");
  console.log("Recommended Approach:", MIGRATION_PLAN.recommendation.approach);
  console.log("Reason:", MIGRATION_PLAN.recommendation.reason);
  console.log("");
  console.log("Timeline Estimate:", MIGRATION_PLAN.timeline.total);
}

// Execute if run directly
if (require.main === module) {
  generateMigrationPlanDocument();
}

module.exports = MIGRATION_PLAN;
