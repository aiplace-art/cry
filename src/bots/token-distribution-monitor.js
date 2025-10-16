#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const config = {
  totalSupply: 1000000000, // 1 billion HYPE
  allocations: {
    presale: { amount: 300000000, vested: false, cliff: 0, vestingDays: 0 },
    liquidity: { amount: 200000000, vested: false, cliff: 0, vestingDays: 0 },
    staking: { amount: 250000000, vested: false, cliff: 0, vestingDays: 0 },
    team: { amount: 100000000, vested: true, cliff: 180, vestingDays: 720 }, // 6 month cliff, 2 year vest
    marketing: { amount: 100000000, vested: true, cliff: 0, vestingDays: 365 }, // 1 year vest
    treasury: { amount: 50000000, vested: true, cliff: 90, vestingDays: 365 } // 3 month cliff, 1 year vest
  }
};

// Data files
const DATA_DIR = path.join(__dirname, '../../data/tokenomics');
const STATE_FILE = path.join(DATA_DIR, 'distribution-state.json');
const FLOWS_FILE = path.join(DATA_DIR, 'token-flows.json');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Distribution state
const distributionState = {
  launchDate: new Date('2025-11-15T00:00:00Z'),
  flows: [],
  distributed: {
    presale: 0,
    liquidity: 0,
    staking: 0,
    team: 0,
    marketing: 0,
    treasury: 0
  },
  locked: {
    presale: config.allocations.presale.amount,
    liquidity: config.allocations.liquidity.amount,
    staking: config.allocations.staking.amount,
    team: config.allocations.team.amount,
    marketing: config.allocations.marketing.amount,
    treasury: config.allocations.treasury.amount
  },
  lastUpdate: null
};

console.log('✅ Token Distribution Monitor started');
console.log('📊 Tracking all token flows and distributions');

// Load state
function loadState() {
  try {
    if (fs.existsSync(STATE_FILE)) {
      const saved = JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
      Object.assign(distributionState, saved);
      distributionState.launchDate = new Date(distributionState.launchDate);
      console.log('✅ Loaded distribution state');
    }
    if (fs.existsSync(FLOWS_FILE)) {
      const flows = JSON.parse(fs.readFileSync(FLOWS_FILE, 'utf8'));
      distributionState.flows = flows;
      console.log(`✅ Loaded ${flows.length} token flows`);
    }
  } catch (error) {
    console.error('⚠️ Error loading state:', error.message);
  }
}

// Save state
function saveState() {
  try {
    fs.writeFileSync(STATE_FILE, JSON.stringify(distributionState, null, 2));
    fs.writeFileSync(FLOWS_FILE, JSON.stringify(distributionState.flows, null, 2));
  } catch (error) {
    console.error('❌ Error saving state:', error.message);
  }
}

// Record token flow
function recordFlow(category, amount, toAddress, reason, txHash = null) {
  const flow = {
    id: Date.now(),
    timestamp: new Date().toISOString(),
    category,
    amount,
    toAddress,
    reason,
    txHash
  };

  distributionState.flows.push(flow);
  distributionState.distributed[category] += amount;
  distributionState.locked[category] -= amount;

  // Keep only last 10000 flows
  if (distributionState.flows.length > 10000) {
    distributionState.flows.shift();
  }

  console.log(`📤 Flow recorded: ${amount.toLocaleString()} HYPE from ${category} to ${toAddress}`);
  console.log(`   Reason: ${reason}`);

  saveState();

  return flow;
}

// Calculate vested amount for a category
function calculateVestedAmount(category) {
  const allocation = config.allocations[category];
  if (!allocation.vested) {
    return allocation.amount; // Fully available immediately
  }

  const now = new Date();
  const launchDate = distributionState.launchDate;
  const daysElapsed = Math.floor((now - launchDate) / (1000 * 60 * 60 * 24));

  // Before cliff, nothing is vested
  if (daysElapsed < allocation.cliff) {
    return 0;
  }

  // After vesting period, everything is vested
  if (daysElapsed >= allocation.vestingDays) {
    return allocation.amount;
  }

  // Linear vesting after cliff
  const vestingProgress = (daysElapsed - allocation.cliff) / (allocation.vestingDays - allocation.cliff);
  const vestedAmount = allocation.amount * vestingProgress;

  return Math.floor(vestedAmount);
}

// Check distribution limits
function checkDistributionLimits(category, amount) {
  const errors = [];
  const warnings = [];

  // Check if category exists
  if (!config.allocations[category]) {
    errors.push(`Invalid category: ${category}`);
    return { valid: false, errors, warnings };
  }

  const allocation = config.allocations[category];
  const currentDistributed = distributionState.distributed[category];
  const currentLocked = distributionState.locked[category];
  const vestedAmount = calculateVestedAmount(category);
  const availableAmount = vestedAmount - currentDistributed;

  // Check if exceeds total allocation
  if (currentDistributed + amount > allocation.amount) {
    errors.push({
      code: 'EXCEEDS_ALLOCATION',
      message: `Distribution would exceed ${category} allocation`,
      requested: amount,
      allocated: allocation.amount,
      alreadyDistributed: currentDistributed,
      remaining: allocation.amount - currentDistributed
    });
  }

  // Check if exceeds vested amount
  if (allocation.vested && currentDistributed + amount > vestedAmount) {
    errors.push({
      code: 'EXCEEDS_VESTED',
      message: `Distribution would exceed vested amount for ${category}`,
      requested: amount,
      vested: vestedAmount,
      alreadyDistributed: currentDistributed,
      available: availableAmount
    });
  }

  // Warning if distributing large percentage at once
  const percentageOfAllocation = (amount / allocation.amount) * 100;
  if (percentageOfAllocation > 10) {
    warnings.push({
      code: 'LARGE_DISTRIBUTION',
      message: `Distributing ${percentageOfAllocation.toFixed(1)}% of ${category} allocation at once`,
      amount,
      percentage: percentageOfAllocation
    });
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    allocation: allocation.amount,
    distributed: currentDistributed,
    locked: currentLocked,
    vested: vestedAmount,
    available: availableAmount
  };
}

// Monitor distribution status
function monitorDistribution() {
  console.log('\n📊 Token Distribution Status');
  console.log('='.repeat(80));

  distributionState.lastUpdate = new Date().toISOString();

  const now = new Date();
  const launchDate = distributionState.launchDate;
  const daysElapsed = Math.floor((now - launchDate) / (1000 * 60 * 60 * 24));

  console.log(`\n🚀 Launch Date: ${launchDate.toISOString()}`);
  console.log(`📅 Days Elapsed: ${daysElapsed}`);
  console.log(`💰 Total Supply: ${config.totalSupply.toLocaleString()} HYPE\n`);

  let totalDistributed = 0;
  let totalLocked = 0;
  let totalAvailable = 0;

  Object.entries(config.allocations).forEach(([category, allocation]) => {
    const distributed = distributionState.distributed[category];
    const locked = distributionState.locked[category];
    const vested = calculateVestedAmount(category);
    const available = vested - distributed;

    totalDistributed += distributed;
    totalLocked += locked;
    totalAvailable += available;

    const distributedPercent = (distributed / allocation.amount) * 100;
    const availablePercent = (available / allocation.amount) * 100;

    console.log(`${category.toUpperCase()}:`);
    console.log(`  Total Allocation: ${allocation.amount.toLocaleString()} HYPE`);

    if (allocation.vested) {
      console.log(`  Vesting: ${allocation.cliff} day cliff, ${allocation.vestingDays} days total`);
      console.log(`  Vested: ${vested.toLocaleString()} HYPE`);
    }

    console.log(`  Distributed: ${distributed.toLocaleString()} HYPE (${distributedPercent.toFixed(2)}%)`);
    console.log(`  Locked: ${locked.toLocaleString()} HYPE`);
    console.log(`  Available: ${available.toLocaleString()} HYPE (${availablePercent.toFixed(2)}%)`);
    console.log('');
  });

  console.log('='.repeat(80));
  console.log(`TOTALS:`);
  console.log(`  Distributed: ${totalDistributed.toLocaleString()} HYPE (${(totalDistributed / config.totalSupply * 100).toFixed(2)}%)`);
  console.log(`  Locked: ${totalLocked.toLocaleString()} HYPE (${(totalLocked / config.totalSupply * 100).toFixed(2)}%)`);
  console.log(`  Available: ${totalAvailable.toLocaleString()} HYPE (${(totalAvailable / config.totalSupply * 100).toFixed(2)}%)`);
  console.log('='.repeat(80));

  // Validate totals
  const totalAccounted = totalDistributed + totalLocked;
  if (Math.abs(totalAccounted - config.totalSupply) > 1) {
    console.error(`\n❌ TOKEN ACCOUNTING ERROR!`);
    console.error(`   Total Supply: ${config.totalSupply.toLocaleString()}`);
    console.error(`   Accounted: ${totalAccounted.toLocaleString()}`);
    console.error(`   Difference: ${(totalAccounted - config.totalSupply).toLocaleString()}`);
  }

  saveState();
}

// Analyze token flows
function analyzeFlows() {
  console.log('\n📈 Token Flow Analysis');
  console.log('='.repeat(80));

  if (distributionState.flows.length === 0) {
    console.log('No token flows recorded yet');
    return;
  }

  // Group by category
  const flowsByCategory = {};
  distributionState.flows.forEach(flow => {
    if (!flowsByCategory[flow.category]) {
      flowsByCategory[flow.category] = [];
    }
    flowsByCategory[flow.category].push(flow);
  });

  Object.entries(flowsByCategory).forEach(([category, flows]) => {
    const totalAmount = flows.reduce((sum, f) => sum + f.amount, 0);
    const avgAmount = totalAmount / flows.length;

    console.log(`\n${category.toUpperCase()}:`);
    console.log(`  Total Flows: ${flows.length}`);
    console.log(`  Total Amount: ${totalAmount.toLocaleString()} HYPE`);
    console.log(`  Average Flow: ${avgAmount.toLocaleString()} HYPE`);
    console.log(`  Latest Flow: ${new Date(flows[flows.length - 1].timestamp).toISOString()}`);
  });

  console.log('\n' + '='.repeat(80));
}

// Main execution
loadState();

// Initial monitoring
monitorDistribution();
analyzeFlows();

// Monitor every 30 minutes
setInterval(() => {
  monitorDistribution();
}, 30 * 60 * 1000);

// Analyze flows every 6 hours
setInterval(() => {
  analyzeFlows();
}, 6 * 60 * 60 * 1000);

console.log('\n✅ Token Distribution Monitor is ACTIVE');
console.log('📊 Monitoring distributions every 30 minutes');
console.log('📈 Flow analysis every 6 hours\n');
