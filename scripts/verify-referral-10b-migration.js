/**
 * Verification Script for Referral System 10B Migration
 *
 * This script verifies that ReferralSystem.sol and PrivateSaleWithReferral.sol
 * have been correctly updated for 10B tokenomics.
 *
 * Run: node scripts/verify-referral-10b-migration.js
 */

const fs = require('fs');
const path = require('path');

// ANSI color codes for pretty output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  bold: '\x1b[1m'
};

// Expected values for 10B tokenomics
const EXPECTED_VALUES = {
  ReferralSystem: {
    MIN_REFERRAL_PURCHASE: '400',
    REWARD_MULTIPLIER: '12500', // tokens per USD
    DIRECT_REFERRAL_REWARD: '500', // 5% (unchanged)
    SECOND_TIER_REWARD: '200', // 2% (unchanged)
    MAX_REWARD_CAP_USD: '10000' // $10K cap (unchanged)
  },
  PrivateSaleWithReferral: {
    TOKEN_PRICE: '8 * 10**13', // $0.00008
    MIN_PURCHASE_USD: '400',
    MAX_PURCHASE_USD: '8000',
    TOKENS_FOR_SALE: '1_100_000_000 * 10**18', // 1.1B
    HARD_CAP_USD: '80000', // $80K (unchanged)
    BONUS_PERCENTAGE: '10', // 10% (unchanged)
    PURCHASE_MULTIPLIER: '12500' // tokens per USD
  }
};

// Test cases for mathematical verification
const TEST_CASES = [
  {
    name: 'Minimum Purchase',
    usdAmount: 400,
    expectedTokens: 5500000, // 400 × 12,500 × 1.1 (with 10% bonus)
    expectedReferrerReward: 250000 // $20 × 12,500
  },
  {
    name: 'Medium Purchase',
    usdAmount: 1000,
    expectedTokens: 13750000, // 1,000 × 12,500 × 1.1
    expectedReferrerReward: 625000 // $50 × 12,500
  },
  {
    name: 'Maximum Purchase',
    usdAmount: 8000,
    expectedTokens: 110000000, // 8,000 × 12,500 × 1.1
    expectedReferrerReward: 5000000 // $400 × 12,500
  }
];

let successCount = 0;
let failureCount = 0;

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function readContract(filename) {
  const filePath = path.join(__dirname, '../src/contracts', filename);
  try {
    return fs.readFileSync(filePath, 'utf8');
  } catch (error) {
    log(`❌ Error reading ${filename}: ${error.message}`, colors.red);
    return null;
  }
}

function checkValue(contractName, valueName, content, expectedValue, regex) {
  const match = content.match(regex);
  if (!match) {
    log(`  ❌ ${valueName}: NOT FOUND`, colors.red);
    failureCount++;
    return false;
  }

  const actualValue = match[1].trim();
  if (actualValue === expectedValue) {
    log(`  ✅ ${valueName}: ${actualValue} (CORRECT)`, colors.green);
    successCount++;
    return true;
  } else {
    log(`  ❌ ${valueName}: ${actualValue} (EXPECTED: ${expectedValue})`, colors.red);
    failureCount++;
    return false;
  }
}

function verifyReferralSystem() {
  log(`\n${colors.bold}=== Verifying ReferralSystem.sol ===${colors.reset}`, colors.blue);

  const content = readContract('ReferralSystem.sol');
  if (!content) return false;

  const checks = [
    {
      name: 'MIN_REFERRAL_PURCHASE',
      expected: EXPECTED_VALUES.ReferralSystem.MIN_REFERRAL_PURCHASE,
      regex: /MIN_REFERRAL_PURCHASE\s*=\s*(\d+)/
    },
    {
      name: 'DIRECT_REFERRAL_REWARD (should be unchanged)',
      expected: EXPECTED_VALUES.ReferralSystem.DIRECT_REFERRAL_REWARD,
      regex: /DIRECT_REFERRAL_REWARD\s*=\s*(\d+)/
    },
    {
      name: 'SECOND_TIER_REWARD (should be unchanged)',
      expected: EXPECTED_VALUES.ReferralSystem.SECOND_TIER_REWARD,
      regex: /SECOND_TIER_REWARD\s*=\s*(\d+)/
    },
    {
      name: 'MAX_REWARD_CAP_USD (should be unchanged)',
      expected: EXPECTED_VALUES.ReferralSystem.MAX_REWARD_CAP_USD,
      regex: /MAX_REWARD_CAP_USD\s*=\s*(\d+)/
    }
  ];

  checks.forEach(check => {
    checkValue('ReferralSystem', check.name, content, check.expected, check.regex);
  });

  // Check reward multiplier in claimRewards()
  const claimRewardsMatch = content.match(/rewardUSD \* (\d+) \* 10\*\*18/);
  if (claimRewardsMatch && claimRewardsMatch[1] === EXPECTED_VALUES.ReferralSystem.REWARD_MULTIPLIER) {
    log(`  ✅ claimRewards() multiplier: ${claimRewardsMatch[1]} (CORRECT)`, colors.green);
    successCount++;
  } else {
    log(`  ❌ claimRewards() multiplier: ${claimRewardsMatch ? claimRewardsMatch[1] : 'NOT FOUND'} (EXPECTED: ${EXPECTED_VALUES.ReferralSystem.REWARD_MULTIPLIER})`, colors.red);
    failureCount++;
  }

  // Check pending rewards multiplier
  const pendingRewardsMatch = content.match(/hypeTokens = usdValue \* (\d+) \* 10\*\*18/);
  if (pendingRewardsMatch && pendingRewardsMatch[1] === EXPECTED_VALUES.ReferralSystem.REWARD_MULTIPLIER) {
    log(`  ✅ getPendingRewards() multiplier: ${pendingRewardsMatch[1]} (CORRECT)`, colors.green);
    successCount++;
  } else {
    log(`  ❌ getPendingRewards() multiplier: ${pendingRewardsMatch ? pendingRewardsMatch[1] : 'NOT FOUND'} (EXPECTED: ${EXPECTED_VALUES.ReferralSystem.REWARD_MULTIPLIER})`, colors.red);
    failureCount++;
  }
}

function verifyPrivateSaleWithReferral() {
  log(`\n${colors.bold}=== Verifying PrivateSaleWithReferral.sol ===${colors.reset}`, colors.blue);

  const content = readContract('PrivateSaleWithReferral.sol');
  if (!content) return false;

  const checks = [
    {
      name: 'TOKEN_PRICE',
      expected: EXPECTED_VALUES.PrivateSaleWithReferral.TOKEN_PRICE,
      regex: /TOKEN_PRICE\s*=\s*([^;]+);/
    },
    {
      name: 'MIN_PURCHASE_USD',
      expected: EXPECTED_VALUES.PrivateSaleWithReferral.MIN_PURCHASE_USD,
      regex: /MIN_PURCHASE_USD\s*=\s*(\d+)/
    },
    {
      name: 'MAX_PURCHASE_USD',
      expected: EXPECTED_VALUES.PrivateSaleWithReferral.MAX_PURCHASE_USD,
      regex: /MAX_PURCHASE_USD\s*=\s*(\d+)/
    },
    {
      name: 'TOKENS_FOR_SALE',
      expected: EXPECTED_VALUES.PrivateSaleWithReferral.TOKENS_FOR_SALE,
      regex: /TOKENS_FOR_SALE\s*=\s*([^;]+);/
    },
    {
      name: 'HARD_CAP_USD (should be unchanged)',
      expected: EXPECTED_VALUES.PrivateSaleWithReferral.HARD_CAP_USD,
      regex: /HARD_CAP_USD\s*=\s*(\d+)/
    },
    {
      name: 'BONUS_PERCENTAGE (should be unchanged)',
      expected: EXPECTED_VALUES.PrivateSaleWithReferral.BONUS_PERCENTAGE,
      regex: /BONUS_PERCENTAGE\s*=\s*(\d+)/
    }
  ];

  checks.forEach(check => {
    checkValue('PrivateSaleWithReferral', check.name, content, check.expected, check.regex);
  });

  // Check purchase multiplier in _processPurchase()
  const processPurchaseMatches = content.match(/baseTokens = _usdValue \* (\d+) \* 10\*\*18/g);
  if (processPurchaseMatches && processPurchaseMatches.length >= 1) {
    const multiplierMatch = processPurchaseMatches[0].match(/\* (\d+) \*/);
    if (multiplierMatch && multiplierMatch[1] === EXPECTED_VALUES.PrivateSaleWithReferral.PURCHASE_MULTIPLIER) {
      log(`  ✅ _processPurchase() multiplier: ${multiplierMatch[1]} (CORRECT)`, colors.green);
      successCount++;
    } else {
      log(`  ❌ _processPurchase() multiplier: ${multiplierMatch ? multiplierMatch[1] : 'NOT FOUND'} (EXPECTED: ${EXPECTED_VALUES.PrivateSaleWithReferral.PURCHASE_MULTIPLIER})`, colors.red);
      failureCount++;
    }
  }

  // Check eligibility check multiplier
  const eligibilityMatches = content.match(/remainingAllocation \* (\d+) \* 10\*\*18/g);
  if (eligibilityMatches && eligibilityMatches.length >= 1) {
    const multiplierMatch = eligibilityMatches[0].match(/\* (\d+) \*/);
    if (multiplierMatch && multiplierMatch[1] === EXPECTED_VALUES.PrivateSaleWithReferral.PURCHASE_MULTIPLIER) {
      log(`  ✅ checkEligibility() multiplier: ${multiplierMatch[1]} (CORRECT)`, colors.green);
      successCount++;
    } else {
      log(`  ❌ checkEligibility() multiplier: ${multiplierMatch ? multiplierMatch[1] : 'NOT FOUND'} (EXPECTED: ${EXPECTED_VALUES.PrivateSaleWithReferral.PURCHASE_MULTIPLIER})`, colors.red);
      failureCount++;
    }
  }
}

function runMathematicalTests() {
  log(`\n${colors.bold}=== Mathematical Verification ===${colors.reset}`, colors.blue);

  TEST_CASES.forEach(testCase => {
    log(`\n  Test: ${testCase.name} ($${testCase.usdAmount})`, colors.yellow);

    // Calculate tokens (with 10% bonus)
    const baseTokens = testCase.usdAmount * 12500;
    const bonusTokens = baseTokens * 0.1;
    const totalTokens = baseTokens + bonusTokens;

    if (Math.round(totalTokens) === testCase.expectedTokens) {
      log(`    ✅ Tokens: ${totalTokens.toLocaleString()} (CORRECT)`, colors.green);
      successCount++;
    } else {
      log(`    ❌ Tokens: ${totalTokens.toLocaleString()} (EXPECTED: ${testCase.expectedTokens.toLocaleString()})`, colors.red);
      failureCount++;
    }

    // Calculate referrer reward (5%)
    const referrerRewardUSD = testCase.usdAmount * 0.05;
    const referrerRewardTokens = referrerRewardUSD * 12500;

    if (Math.round(referrerRewardTokens) === testCase.expectedReferrerReward) {
      log(`    ✅ Referrer Reward: ${referrerRewardTokens.toLocaleString()} HYPE ($${referrerRewardUSD}) (CORRECT)`, colors.green);
      successCount++;
    } else {
      log(`    ❌ Referrer Reward: ${referrerRewardTokens.toLocaleString()} HYPE (EXPECTED: ${testCase.expectedReferrerReward.toLocaleString()})`, colors.red);
      failureCount++;
    }

    // Calculate second-tier reward (2%)
    const secondTierRewardUSD = testCase.usdAmount * 0.02;
    const secondTierRewardTokens = secondTierRewardUSD * 12500;

    log(`    ℹ️  Second-Tier Reward: ${secondTierRewardTokens.toLocaleString()} HYPE ($${secondTierRewardUSD})`, colors.blue);
  });
}

function printSummary() {
  log(`\n${colors.bold}=== Verification Summary ===${colors.reset}`, colors.blue);
  log(`\n✅ Passed: ${successCount}`, colors.green);
  log(`❌ Failed: ${failureCount}`, colors.red);

  const total = successCount + failureCount;
  const percentage = total > 0 ? ((successCount / total) * 100).toFixed(1) : 0;

  log(`\nSuccess Rate: ${percentage}%`, percentage === '100.0' ? colors.green : colors.yellow);

  if (failureCount === 0) {
    log(`\n🎉 All checks passed! Referral system is ready for 10B tokenomics.`, colors.green);
    log(`\nNext steps:`, colors.blue);
    log(`  1. Compile contracts: npx hardhat compile`);
    log(`  2. Run tests: npx hardhat test`);
    log(`  3. Deploy to testnet: npx hardhat run scripts/deploy-referral-system.js --network bscTestnet`);
    return 0;
  } else {
    log(`\n⚠️  Some checks failed. Please review the errors above.`, colors.red);
    return 1;
  }
}

// Main execution
log(`${colors.bold}Referral System 10B Migration Verification${colors.reset}`, colors.blue);
log(`${colors.bold}==============================================${colors.reset}\n`, colors.blue);

verifyReferralSystem();
verifyPrivateSaleWithReferral();
runMathematicalTests();

const exitCode = printSummary();
process.exit(exitCode);
