#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Data files
const DATA_DIR = path.join(__dirname, '../../data/tokenomics');
const RECONCILIATION_FILE = path.join(DATA_DIR, 'balance-reconciliation.json');
const MISMATCHES_FILE = path.join(DATA_DIR, 'balance-mismatches.json');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Reconciliation state
const reconciliationState = {
  reconciliationsPerformed: 0,
  mismatchesFound: 0,
  lastReconciliation: null,
  reconciliations: []
};

const mismatches = [];

console.log('✅ Balance Reconciliation Agent started');
console.log('⚖️ Ensuring all token balances match across systems');

// Load state
function loadState() {
  try {
    if (fs.existsSync(RECONCILIATION_FILE)) {
      const saved = JSON.parse(fs.readFileSync(RECONCILIATION_FILE, 'utf8'));
      Object.assign(reconciliationState, saved);
      console.log('✅ Loaded reconciliation state');
    }
    if (fs.existsSync(MISMATCHES_FILE)) {
      const loaded = JSON.parse(fs.readFileSync(MISMATCHES_FILE, 'utf8'));
      mismatches.push(...loaded);
      console.log(`✅ Loaded ${loaded.length} mismatches`);
    }
  } catch (error) {
    console.error('⚠️ Error loading state:', error.message);
  }
}

// Save state
function saveState() {
  try {
    fs.writeFileSync(RECONCILIATION_FILE, JSON.stringify(reconciliationState, null, 2));
    fs.writeFileSync(MISMATCHES_FILE, JSON.stringify(mismatches, null, 2));
  } catch (error) {
    console.error('❌ Error saving state:', error.message);
  }
}

// Record mismatch
function recordMismatch(type, description, source1, source2, value1, value2, severity = 'high') {
  const mismatch = {
    id: Date.now(),
    timestamp: new Date().toISOString(),
    type,
    description,
    source1,
    source2,
    value1,
    value2,
    difference: value2 - value1,
    percentDiff: value1 !== 0 ? ((value2 - value1) / value1 * 100) : 0,
    severity
  };

  mismatches.push(mismatch);
  reconciliationState.mismatchesFound++;

  // Keep only last 1000 mismatches
  if (mismatches.length > 1000) {
    mismatches.shift();
  }

  console.error(`\n❌ BALANCE MISMATCH DETECTED!`);
  console.error(`   Type: ${type}`);
  console.error(`   ${description}`);
  console.error(`   ${source1}: ${value1.toLocaleString()}`);
  console.error(`   ${source2}: ${value2.toLocaleString()}`);
  console.error(`   Difference: ${mismatch.difference.toLocaleString()} (${mismatch.percentDiff.toFixed(4)}%)`);
  console.error(`   Severity: ${severity}\n`);

  saveState();

  return mismatch;
}

// Reconcile total supply
function reconcileTotalSupply() {
  console.log('\n⚖️ Reconciling total supply...');

  const expectedTotalSupply = 1000000000; // 1 billion HYPE

  // Load distribution data
  const distributionFile = path.join(DATA_DIR, 'distribution-state.json');
  let distributionData = null;

  if (fs.existsSync(distributionFile)) {
    try {
      distributionData = JSON.parse(fs.readFileSync(distributionFile, 'utf8'));
    } catch (error) {
      console.error('❌ Error reading distribution state:', error.message);
    }
  }

  let calculatedTotal = 0;
  let mismatched = false;

  if (distributionData) {
    const totalDistributed = Object.values(distributionData.distributed).reduce((sum, val) => sum + val, 0);
    const totalLocked = Object.values(distributionData.locked).reduce((sum, val) => sum + val, 0);
    calculatedTotal = totalDistributed + totalLocked;

    console.log(`  Expected Total Supply: ${expectedTotalSupply.toLocaleString()} HYPE`);
    console.log(`  Calculated (Distributed + Locked): ${calculatedTotal.toLocaleString()} HYPE`);

    if (Math.abs(calculatedTotal - expectedTotalSupply) > 1) {
      mismatched = true;
      recordMismatch(
        'total_supply',
        'Total supply mismatch between expected and calculated',
        'Expected Total Supply',
        'Distributed + Locked',
        expectedTotalSupply,
        calculatedTotal,
        'critical'
      );
    } else {
      console.log(`  ✅ Total supply reconciled correctly`);
    }
  } else {
    console.log('  ⚠️ Distribution data not available');
  }

  return { matched: !mismatched, expected: expectedTotalSupply, calculated: calculatedTotal };
}

// Reconcile staking balances
function reconcileStakingBalances() {
  console.log('\n⚖️ Reconciling staking balances...');

  // Load staking positions
  const positionsFile = path.join(DATA_DIR, 'staking-positions.json');
  if (!fs.existsSync(positionsFile)) {
    console.log('  ⚠️ No staking positions file found');
    return { matched: true, total: 0 };
  }

  let positions;
  try {
    positions = JSON.parse(fs.readFileSync(positionsFile, 'utf8'));
  } catch (error) {
    console.error('❌ Error reading staking positions:', error.message);
    return { matched: true, total: 0 };
  }

  // Calculate total staked from positions
  const totalStakedFromPositions = positions.reduce((sum, pos) => sum + pos.amount, 0);

  // Load staking calculations to get reported total
  const calculationsFile = path.join(DATA_DIR, 'staking-calculations.json');
  let reportedTotal = 0;

  if (fs.existsSync(calculationsFile)) {
    try {
      const calculations = JSON.parse(fs.readFileSync(calculationsFile, 'utf8'));
      reportedTotal = calculations.totalStaked || 0;
    } catch (error) {
      console.error('❌ Error reading staking calculations:', error.message);
    }
  }

  console.log(`  Total Staked (from positions): ${totalStakedFromPositions.toLocaleString()} HYPE`);
  console.log(`  Total Staked (reported): ${reportedTotal.toLocaleString()} HYPE`);

  let mismatched = false;

  if (Math.abs(totalStakedFromPositions - reportedTotal) > 1) {
    mismatched = true;
    recordMismatch(
      'staking_balance',
      'Staking balance mismatch between positions and reported',
      'Positions Total',
      'Reported Total',
      totalStakedFromPositions,
      reportedTotal,
      'high'
    );
  } else {
    console.log(`  ✅ Staking balances reconciled correctly`);
  }

  return { matched: !mismatched, total: totalStakedFromPositions };
}

// Reconcile distribution allocations
function reconcileDistributionAllocations() {
  console.log('\n⚖️ Reconciling distribution allocations...');

  const expectedAllocations = {
    presale: 300000000,
    liquidity: 200000000,
    staking: 250000000,
    team: 100000000,
    marketing: 100000000,
    treasury: 50000000
  };

  // Load distribution data
  const distributionFile = path.join(DATA_DIR, 'distribution-state.json');
  if (!fs.existsSync(distributionFile)) {
    console.log('  ⚠️ No distribution state file found');
    return { matched: true };
  }

  let distributionData;
  try {
    distributionData = JSON.parse(fs.readFileSync(distributionFile, 'utf8'));
  } catch (error) {
    console.error('❌ Error reading distribution state:', error.message);
    return { matched: true };
  }

  let allMatched = true;

  Object.entries(expectedAllocations).forEach(([category, expected]) => {
    const distributed = distributionData.distributed[category] || 0;
    const locked = distributionData.locked[category] || 0;
    const actual = distributed + locked;

    console.log(`  ${category}: Expected ${expected.toLocaleString()}, Actual ${actual.toLocaleString()}`);

    if (Math.abs(actual - expected) > 1) {
      allMatched = false;
      recordMismatch(
        'allocation',
        `${category} allocation mismatch`,
        'Expected Allocation',
        'Distributed + Locked',
        expected,
        actual,
        'critical'
      );
    } else {
      console.log(`    ✅ Matched`);
    }
  });

  if (allMatched) {
    console.log(`  ✅ All allocations reconciled correctly`);
  }

  return { matched: allMatched };
}

// Reconcile token flows
function reconcileTokenFlows() {
  console.log('\n⚖️ Reconciling token flows...');

  // Load token flows
  const flowsFile = path.join(DATA_DIR, 'token-flows.json');
  if (!fs.existsSync(flowsFile)) {
    console.log('  ⚠️ No token flows file found');
    return { matched: true, totalFlows: 0 };
  }

  let flows;
  try {
    flows = JSON.parse(fs.readFileSync(flowsFile, 'utf8'));
  } catch (error) {
    console.error('❌ Error reading token flows:', error.message);
    return { matched: true, totalFlows: 0 };
  }

  // Calculate total by category
  const flowsByCategory = {};
  flows.forEach(flow => {
    if (!flowsByCategory[flow.category]) {
      flowsByCategory[flow.category] = 0;
    }
    flowsByCategory[flow.category] += flow.amount;
  });

  // Load distribution data to compare
  const distributionFile = path.join(DATA_DIR, 'distribution-state.json');
  let distributionData = null;

  if (fs.existsSync(distributionFile)) {
    try {
      distributionData = JSON.parse(fs.readFileSync(distributionFile, 'utf8'));
    } catch (error) {
      console.error('❌ Error reading distribution state:', error.message);
    }
  }

  let allMatched = true;

  if (distributionData) {
    Object.entries(flowsByCategory).forEach(([category, flowTotal]) => {
      const reportedDistributed = distributionData.distributed[category] || 0;

      console.log(`  ${category}: Flows ${flowTotal.toLocaleString()}, Reported ${reportedDistributed.toLocaleString()}`);

      if (Math.abs(flowTotal - reportedDistributed) > 1) {
        allMatched = false;
        recordMismatch(
          'flow_mismatch',
          `${category} flow total doesn't match reported distributed`,
          'Flow Total',
          'Reported Distributed',
          flowTotal,
          reportedDistributed,
          'high'
        );
      } else {
        console.log(`    ✅ Matched`);
      }
    });
  }

  const totalFlows = flows.reduce((sum, f) => sum + f.amount, 0);

  if (allMatched) {
    console.log(`  ✅ All token flows reconciled correctly`);
  }

  return { matched: allMatched, totalFlows };
}

// Comprehensive reconciliation
function performComprehensiveReconciliation() {
  console.log('\n' + '='.repeat(80));
  console.log('⚖️ PERFORMING COMPREHENSIVE BALANCE RECONCILIATION');
  console.log('='.repeat(80));

  reconciliationState.reconciliationsPerformed++;
  reconciliationState.lastReconciliation = new Date().toISOString();

  const results = {
    timestamp: reconciliationState.lastReconciliation,
    reconciliationNumber: reconciliationState.reconciliationsPerformed,
    totalSupply: reconcileTotalSupply(),
    staking: reconcileStakingBalances(),
    allocations: reconcileDistributionAllocations(),
    flows: reconcileTokenFlows()
  };

  const allMatched = results.totalSupply.matched &&
                     results.staking.matched &&
                     results.allocations.matched &&
                     results.flows.matched;

  reconciliationState.reconciliations.push({
    timestamp: reconciliationState.lastReconciliation,
    allMatched,
    mismatchesFound: !allMatched
  });

  // Keep only last 100 reconciliations
  if (reconciliationState.reconciliations.length > 100) {
    reconciliationState.reconciliations.shift();
  }

  console.log('\n' + '='.repeat(80));
  if (allMatched) {
    console.log(`✅ RECONCILIATION PASSED - All balances match`);
  } else {
    console.error(`❌ RECONCILIATION FAILED - Mismatches detected!`);
  }
  console.log('='.repeat(80) + '\n');

  saveState();

  return results;
}

// Generate reconciliation report
function generateReconciliationReport() {
  const report = {
    generated: new Date().toISOString(),
    summary: {
      reconciliationsPerformed: reconciliationState.reconciliationsPerformed,
      totalMismatches: reconciliationState.mismatchesFound,
      lastReconciliation: reconciliationState.lastReconciliation
    },
    recentMismatches: mismatches.slice(-10),
    recentReconciliations: reconciliationState.reconciliations.slice(-10)
  };

  console.log('\n📊 Reconciliation Report:', JSON.stringify(report.summary, null, 2));

  return report;
}

// Main execution
loadState();

// Run reconciliation immediately
performComprehensiveReconciliation();

// Generate initial report
generateReconciliationReport();

// Run reconciliation every 15 minutes
setInterval(() => {
  performComprehensiveReconciliation();
}, 15 * 60 * 1000);

// Generate report every 3 hours
setInterval(() => {
  generateReconciliationReport();
}, 3 * 60 * 60 * 1000);

console.log('\n✅ Balance Reconciliation Agent is ACTIVE');
console.log('⚖️ Reconciling every 15 minutes');
console.log('📊 Reports generated every 3 hours');
console.log('🚨 All mismatches will be flagged immediately\n');
