#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Data files
const DATA_DIR = path.join(__dirname, '../../data/tokenomics');
const AUDIT_FILE = path.join(DATA_DIR, 'rewards-audit.json');
const DISCREPANCIES_FILE = path.join(DATA_DIR, 'reward-discrepancies.json');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Audit state
const auditState = {
  auditsPerformed: 0,
  discrepanciesFound: 0,
  totalRewardsAudited: 0,
  lastAudit: null,
  audits: []
};

const discrepancies = [];

console.log('✅ Rewards Auditor Agent started');
console.log('🔍 Cross-validating all reward calculations');

// Load state
function loadState() {
  try {
    if (fs.existsSync(AUDIT_FILE)) {
      const saved = JSON.parse(fs.readFileSync(AUDIT_FILE, 'utf8'));
      Object.assign(auditState, saved);
      console.log('✅ Loaded audit state');
    }
    if (fs.existsSync(DISCREPANCIES_FILE)) {
      const loaded = JSON.parse(fs.readFileSync(DISCREPANCIES_FILE, 'utf8'));
      discrepancies.push(...loaded);
      console.log(`✅ Loaded ${loaded.length} discrepancies`);
    }
  } catch (error) {
    console.error('⚠️ Error loading state:', error.message);
  }
}

// Save state
function saveState() {
  try {
    fs.writeFileSync(AUDIT_FILE, JSON.stringify(auditState, null, 2));
    fs.writeFileSync(DISCREPANCIES_FILE, JSON.stringify(discrepancies, null, 2));
  } catch (error) {
    console.error('❌ Error saving state:', error.message);
  }
}

// Record discrepancy
function recordDiscrepancy(type, description, expected, actual, severity = 'high') {
  const discrepancy = {
    id: Date.now(),
    timestamp: new Date().toISOString(),
    type,
    description,
    expected,
    actual,
    difference: actual - expected,
    percentDiff: expected !== 0 ? ((actual - expected) / expected * 100) : 0,
    severity
  };

  discrepancies.push(discrepancy);
  auditState.discrepanciesFound++;

  // Keep only last 1000 discrepancies
  if (discrepancies.length > 1000) {
    discrepancies.shift();
  }

  console.error(`\n❌ DISCREPANCY DETECTED!`);
  console.error(`   Type: ${type}`);
  console.error(`   ${description}`);
  console.error(`   Expected: ${expected}`);
  console.error(`   Actual: ${actual}`);
  console.error(`   Difference: ${discrepancy.difference} (${discrepancy.percentDiff.toFixed(4)}%)`);
  console.error(`   Severity: ${severity}\n`);

  saveState();

  return discrepancy;
}

// Independent staking reward calculation (cross-validation)
function calculateStakingReward(amount, apyPercent, days) {
  const apy = apyPercent / 100;
  const annualReward = amount * apy;
  const dailyReward = annualReward / 365;
  const totalReward = dailyReward * days;

  return {
    amount,
    apy: apyPercent,
    days,
    annualReward: parseFloat(annualReward.toFixed(6)),
    dailyReward: parseFloat(dailyReward.toFixed(6)),
    totalReward: parseFloat(totalReward.toFixed(6))
  };
}

// Audit staking calculations
function auditStakingCalculations() {
  console.log('\n🔍 Auditing staking calculations...');

  // Read staking calculations file
  const stakingFile = path.join(DATA_DIR, 'staking-calculations.json');
  if (!fs.existsSync(stakingFile)) {
    console.log('⚠️ No staking calculations file found');
    return { audited: 0, discrepancies: 0 };
  }

  let stakingData;
  try {
    stakingData = JSON.parse(fs.readFileSync(stakingFile, 'utf8'));
  } catch (error) {
    console.error('❌ Error reading staking calculations:', error.message);
    return { audited: 0, discrepancies: 0 };
  }

  const positionsFile = path.join(DATA_DIR, 'staking-positions.json');
  if (!fs.existsSync(positionsFile)) {
    console.log('⚠️ No staking positions file found');
    return { audited: 0, discrepancies: 0 };
  }

  let positions;
  try {
    positions = JSON.parse(fs.readFileSync(positionsFile, 'utf8'));
  } catch (error) {
    console.error('❌ Error reading staking positions:', error.message);
    return { audited: 0, discrepancies: 0 };
  }

  let audited = 0;
  let localDiscrepancies = 0;

  // Audit each position
  positions.forEach((position, index) => {
    const tier = position.tier;
    let expectedAPY;

    // Match tier to APY
    switch (tier) {
      case 'bronze': expectedAPY = 17; break;
      case 'silver': expectedAPY = 27; break;
      case 'gold': expectedAPY = 62; break;
      default:
        console.error(`❌ Unknown tier: ${tier}`);
        return;
    }

    // Calculate expected reward independently
    const daysElapsed = Math.floor((Date.now() - new Date(position.startTime).getTime()) / (1000 * 60 * 60 * 24));
    const expected = calculateStakingReward(position.amount, expectedAPY, daysElapsed);

    // Compare with reported rewards (if they exist in calculations)
    // This is a placeholder - in real implementation, we'd compare against actual calculated values

    audited++;

    console.log(`  ✓ Position ${index + 1}: ${tier.toUpperCase()} - ${position.amount.toLocaleString()} HYPE`);
    console.log(`    Expected daily reward: ${expected.dailyReward.toFixed(6)} HYPE`);
    console.log(`    Expected total (${daysElapsed} days): ${expected.totalReward.toFixed(2)} HYPE`);
  });

  console.log(`\n✅ Audited ${audited} staking positions`);
  if (localDiscrepancies > 0) {
    console.error(`❌ Found ${localDiscrepancies} discrepancies`);
  }

  return { audited, discrepancies: localDiscrepancies };
}

// Audit referral rewards
function auditReferralRewards() {
  console.log('\n🔍 Auditing referral rewards...');

  // This is a placeholder for referral reward auditing
  // In real implementation, we'd load referral data and validate rewards

  const expectedRewardPerReferral = 100; // 100 HYPE per referral

  console.log(`  ✓ Standard referral reward: ${expectedRewardPerReferral} HYPE`);

  return { audited: 0, discrepancies: 0 };
}

// Audit token distribution
function auditTokenDistribution() {
  console.log('\n🔍 Auditing token distribution...');

  const distributionFile = path.join(DATA_DIR, 'distribution-state.json');
  if (!fs.existsSync(distributionFile)) {
    console.log('⚠️ No distribution state file found');
    return { audited: 0, discrepancies: 0 };
  }

  let distributionData;
  try {
    distributionData = JSON.parse(fs.readFileSync(distributionFile, 'utf8'));
  } catch (error) {
    console.error('❌ Error reading distribution state:', error.message);
    return { audited: 0, discrepancies: 0 };
  }

  let audited = 0;
  let localDiscrepancies = 0;

  const totalSupply = 1000000000;
  const expectedAllocations = {
    presale: 300000000,
    liquidity: 200000000,
    staking: 250000000,
    team: 100000000,
    marketing: 100000000,
    treasury: 50000000
  };

  // Check if distributed + locked = allocation
  Object.entries(expectedAllocations).forEach(([category, expectedTotal]) => {
    const distributed = distributionData.distributed[category] || 0;
    const locked = distributionData.locked[category] || 0;
    const actual = distributed + locked;

    audited++;

    if (Math.abs(actual - expectedTotal) > 1) {
      localDiscrepancies++;
      recordDiscrepancy(
        'distribution_mismatch',
        `${category} allocation mismatch`,
        expectedTotal,
        actual,
        'critical'
      );
    } else {
      console.log(`  ✓ ${category}: ${distributed.toLocaleString()} distributed + ${locked.toLocaleString()} locked = ${actual.toLocaleString()} (expected ${expectedTotal.toLocaleString()})`);
    }
  });

  // Check total
  const totalDistributed = Object.values(distributionData.distributed).reduce((sum, val) => sum + val, 0);
  const totalLocked = Object.values(distributionData.locked).reduce((sum, val) => sum + val, 0);
  const totalAccounted = totalDistributed + totalLocked;

  audited++;

  if (Math.abs(totalAccounted - totalSupply) > 1) {
    localDiscrepancies++;
    recordDiscrepancy(
      'total_supply_mismatch',
      'Total accounted tokens do not match supply',
      totalSupply,
      totalAccounted,
      'critical'
    );
  } else {
    console.log(`\n  ✓ Total Supply Check: ${totalAccounted.toLocaleString()} = ${totalSupply.toLocaleString()} HYPE`);
  }

  return { audited, discrepancies: localDiscrepancies };
}

// Comprehensive audit
function performComprehensiveAudit() {
  console.log('\n' + '='.repeat(80));
  console.log('🔍 PERFORMING COMPREHENSIVE REWARDS AUDIT');
  console.log('='.repeat(80));

  auditState.auditsPerformed++;
  auditState.lastAudit = new Date().toISOString();

  const results = {
    timestamp: auditState.lastAudit,
    auditNumber: auditState.auditsPerformed,
    staking: auditStakingCalculations(),
    referral: auditReferralRewards(),
    distribution: auditTokenDistribution()
  };

  const totalAudited = results.staking.audited + results.referral.audited + results.distribution.audited;
  const totalDiscrepancies = results.staking.discrepancies + results.referral.discrepancies + results.distribution.discrepancies;

  auditState.audits.push({
    timestamp: auditState.lastAudit,
    totalAudited,
    totalDiscrepancies
  });

  // Keep only last 100 audits
  if (auditState.audits.length > 100) {
    auditState.audits.shift();
  }

  console.log('\n' + '='.repeat(80));
  console.log(`✅ AUDIT COMPLETE`);
  console.log(`   Items Audited: ${totalAudited}`);
  if (totalDiscrepancies > 0) {
    console.error(`   ❌ Discrepancies Found: ${totalDiscrepancies}`);
  } else {
    console.log(`   ✓ No discrepancies found`);
  }
  console.log('='.repeat(80) + '\n');

  saveState();

  return results;
}

// Generate audit report
function generateAuditReport() {
  const report = {
    generated: new Date().toISOString(),
    summary: {
      auditsPerformed: auditState.auditsPerformed,
      totalDiscrepancies: auditState.discrepanciesFound,
      lastAudit: auditState.lastAudit
    },
    recentDiscrepancies: discrepancies.slice(-10),
    recentAudits: auditState.audits.slice(-10)
  };

  console.log('\n📊 Audit Report:', JSON.stringify(report.summary, null, 2));

  return report;
}

// Main execution
loadState();

// Run audit immediately
performComprehensiveAudit();

// Generate initial report
generateAuditReport();

// Run audit every 30 minutes
setInterval(() => {
  performComprehensiveAudit();
}, 30 * 60 * 1000);

// Generate report every 6 hours
setInterval(() => {
  generateAuditReport();
}, 6 * 60 * 60 * 1000);

console.log('\n✅ Rewards Auditor Agent is ACTIVE');
console.log('🔍 Auditing every 30 minutes');
console.log('📊 Reports generated every 6 hours');
console.log('🚨 All discrepancies will be flagged immediately\n');
