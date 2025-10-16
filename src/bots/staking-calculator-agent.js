#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Staking configuration
const config = {
  tiers: {
    bronze: { apy: 0.17, lockDays: 30, minAmount: 1000, maxSlots: 1000 },
    silver: { apy: 0.27, lockDays: 90, minAmount: 10000, maxSlots: 500 },
    gold: { apy: 0.62, lockDays: 180, minAmount: 50000, maxSlots: 100 }
  },
  rewardInterval: 86400, // Daily rewards (24 hours in seconds)
  compounding: false,
  earlyUnstakePenalty: 0.20 // 20% penalty
};

// Data files
const DATA_DIR = path.join(__dirname, '../../data/tokenomics');
const STATE_FILE = path.join(DATA_DIR, 'staking-calculations.json');
const POSITIONS_FILE = path.join(DATA_DIR, 'staking-positions.json');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Staking state
const stakingState = {
  positions: [],
  totalStaked: 0,
  rewardsDistributed: 0,
  calculationsPerformed: 0,
  lastCalculation: null
};

console.log('✅ Staking Calculator Agent started');
console.log('💎 Calculating rewards with mathematical precision');

// Load state
function loadState() {
  try {
    if (fs.existsSync(STATE_FILE)) {
      const saved = JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
      Object.assign(stakingState, saved);
      console.log('✅ Loaded staking state');
    }
    if (fs.existsSync(POSITIONS_FILE)) {
      const positions = JSON.parse(fs.readFileSync(POSITIONS_FILE, 'utf8'));
      stakingState.positions = positions;
      console.log(`✅ Loaded ${positions.length} staking positions`);
    }
  } catch (error) {
    console.error('⚠️ Error loading state:', error.message);
  }
}

// Save state
function saveState() {
  try {
    const { positions, ...stateToSave } = stakingState;
    fs.writeFileSync(STATE_FILE, JSON.stringify(stateToSave, null, 2));
    fs.writeFileSync(POSITIONS_FILE, JSON.stringify(positions, null, 2));
  } catch (error) {
    console.error('❌ Error saving state:', error.message);
  }
}

// Calculate rewards for a position
function calculateRewards(position) {
  const tier = config.tiers[position.tier];
  if (!tier) {
    throw new Error(`Invalid tier: ${position.tier}`);
  }

  const stakedAmount = position.amount;
  const apy = tier.apy;
  const lockDays = tier.lockDays;

  // Annual reward
  const annualReward = stakedAmount * apy;

  // Daily reward
  const dailyReward = annualReward / 365;

  // Total reward for lock period
  const lockPeriodReward = dailyReward * lockDays;

  // Days elapsed since start
  const now = Date.now();
  const startTime = new Date(position.startTime).getTime();
  const daysElapsed = Math.floor((now - startTime) / (1000 * 60 * 60 * 24));

  // Accumulated reward so far
  const accumulatedReward = Math.min(dailyReward * daysElapsed, lockPeriodReward);

  // Remaining reward
  const remainingReward = lockPeriodReward - accumulatedReward;

  // Days remaining
  const daysRemaining = Math.max(0, lockDays - daysElapsed);

  return {
    stakedAmount,
    apy: (apy * 100).toFixed(2) + '%',
    lockDays,
    daysElapsed,
    daysRemaining,
    annualReward: parseFloat(annualReward.toFixed(6)),
    dailyReward: parseFloat(dailyReward.toFixed(6)),
    lockPeriodReward: parseFloat(lockPeriodReward.toFixed(6)),
    accumulatedReward: parseFloat(accumulatedReward.toFixed(6)),
    remainingReward: parseFloat(remainingReward.toFixed(6)),
    isComplete: daysElapsed >= lockDays
  };
}

// Validate calculation accuracy
function validateCalculation(position, calculation) {
  const errors = [];

  // Check all numbers are positive
  if (calculation.stakedAmount <= 0) {
    errors.push(`Invalid staked amount: ${calculation.stakedAmount}`);
  }
  if (calculation.annualReward < 0) {
    errors.push(`Invalid annual reward: ${calculation.annualReward}`);
  }
  if (calculation.dailyReward < 0) {
    errors.push(`Invalid daily reward: ${calculation.dailyReward}`);
  }

  // Verify annual = daily * 365
  const expectedAnnual = calculation.dailyReward * 365;
  if (Math.abs(expectedAnnual - calculation.annualReward) > 0.01) {
    errors.push(`Annual/daily mismatch: ${calculation.annualReward} vs ${expectedAnnual}`);
  }

  // Verify lock period reward = daily * lock days
  const tier = config.tiers[position.tier];
  const expectedLockPeriod = calculation.dailyReward * tier.lockDays;
  if (Math.abs(expectedLockPeriod - calculation.lockPeriodReward) > 0.01) {
    errors.push(`Lock period calculation error: ${calculation.lockPeriodReward} vs ${expectedLockPeriod}`);
  }

  // Accumulated should never exceed lock period total
  if (calculation.accumulatedReward > calculation.lockPeriodReward + 0.01) {
    errors.push(`Accumulated exceeds total: ${calculation.accumulatedReward} > ${calculation.lockPeriodReward}`);
  }

  // Accumulated + remaining should equal lock period total
  const total = calculation.accumulatedReward + calculation.remainingReward;
  if (Math.abs(total - calculation.lockPeriodReward) > 0.01) {
    errors.push(`Accumulated + remaining mismatch: ${total} vs ${calculation.lockPeriodReward}`);
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

// Calculate all positions
function calculateAllPositions() {
  console.log('\n💎 Calculating rewards for all staking positions...');

  stakingState.calculationsPerformed++;
  stakingState.lastCalculation = new Date().toISOString();

  const results = {
    timestamp: stakingState.lastCalculation,
    totalPositions: stakingState.positions.length,
    calculations: [],
    totalRewardsAccumulated: 0,
    totalRewardsRemaining: 0,
    errors: []
  };

  stakingState.positions.forEach((position, index) => {
    try {
      const calculation = calculateRewards(position);
      const validation = validateCalculation(position, calculation);

      if (!validation.valid) {
        console.error(`❌ Position ${index} validation failed:`, validation.errors);
        results.errors.push({
          positionIndex: index,
          position,
          errors: validation.errors
        });
      }

      results.calculations.push({
        positionId: position.id,
        userId: position.userId,
        tier: position.tier,
        ...calculation
      });

      results.totalRewardsAccumulated += calculation.accumulatedReward;
      results.totalRewardsRemaining += calculation.remainingReward;

      console.log(`  ✓ Position ${index + 1}: ${position.tier.toUpperCase()} - ${calculation.accumulatedReward.toFixed(2)} HYPE earned`);
    } catch (error) {
      console.error(`❌ Error calculating position ${index}:`, error.message);
      results.errors.push({
        positionIndex: index,
        position,
        errors: [error.message]
      });
    }
  });

  console.log(`\n📊 Total Rewards Accumulated: ${results.totalRewardsAccumulated.toFixed(2)} HYPE`);
  console.log(`📊 Total Rewards Remaining: ${results.totalRewardsRemaining.toFixed(2)} HYPE`);

  if (results.errors.length > 0) {
    console.error(`\n❌ ${results.errors.length} CALCULATION ERRORS DETECTED!`);
  } else {
    console.log('✅ All calculations validated successfully');
  }

  saveState();

  return results;
}

// Calculate tier statistics
function calculateTierStats() {
  console.log('\n📊 Calculating tier statistics...');

  const stats = {
    bronze: { positions: 0, totalStaked: 0, totalRewards: 0 },
    silver: { positions: 0, totalStaked: 0, totalRewards: 0 },
    gold: { positions: 0, totalStaked: 0, totalRewards: 0 }
  };

  stakingState.positions.forEach(position => {
    const calculation = calculateRewards(position);
    const tier = position.tier;

    stats[tier].positions++;
    stats[tier].totalStaked += position.amount;
    stats[tier].totalRewards += calculation.accumulatedReward;
  });

  Object.entries(stats).forEach(([tier, data]) => {
    const tierConfig = config.tiers[tier];
    const utilization = (data.positions / tierConfig.maxSlots) * 100;

    console.log(`\n  ${tier.toUpperCase()} Tier (${tierConfig.apy * 100}% APY):`);
    console.log(`    Positions: ${data.positions}/${tierConfig.maxSlots} (${utilization.toFixed(1)}% utilized)`);
    console.log(`    Total Staked: ${data.totalStaked.toLocaleString()} HYPE`);
    console.log(`    Total Rewards: ${data.totalRewards.toFixed(2)} HYPE`);
  });

  return stats;
}

// Simulate staking scenario
function simulateStaking(amount, tier) {
  console.log(`\n🧮 Simulating ${amount} HYPE staked in ${tier.toUpperCase()} tier...`);

  const tierConfig = config.tiers[tier];
  if (!tierConfig) {
    console.error(`❌ Invalid tier: ${tier}`);
    return null;
  }

  if (amount < tierConfig.minAmount) {
    console.error(`❌ Amount below minimum for ${tier}: ${amount} < ${tierConfig.minAmount}`);
    return null;
  }

  const annualReward = amount * tierConfig.apy;
  const dailyReward = annualReward / 365;
  const lockPeriodReward = dailyReward * tierConfig.lockDays;
  const finalAmount = amount + lockPeriodReward;
  const roi = (lockPeriodReward / amount) * 100;

  console.log(`  Initial Stake: ${amount.toLocaleString()} HYPE`);
  console.log(`  APY: ${(tierConfig.apy * 100)}%`);
  console.log(`  Lock Period: ${tierConfig.lockDays} days`);
  console.log(`  Daily Reward: ${dailyReward.toFixed(4)} HYPE`);
  console.log(`  Total Reward: ${lockPeriodReward.toFixed(2)} HYPE`);
  console.log(`  Final Amount: ${finalAmount.toFixed(2)} HYPE`);
  console.log(`  ROI: ${roi.toFixed(2)}%`);

  return {
    amount,
    tier,
    apy: tierConfig.apy,
    lockDays: tierConfig.lockDays,
    annualReward: parseFloat(annualReward.toFixed(6)),
    dailyReward: parseFloat(dailyReward.toFixed(6)),
    lockPeriodReward: parseFloat(lockPeriodReward.toFixed(6)),
    finalAmount: parseFloat(finalAmount.toFixed(6)),
    roi: parseFloat(roi.toFixed(2))
  };
}

// Main execution
loadState();

// Run simulations for each tier
console.log('\n🎯 Running staking simulations...');
simulateStaking(1000, 'bronze');
simulateStaking(10000, 'silver');
simulateStaking(50000, 'gold');

// Calculate all positions if any exist
if (stakingState.positions.length > 0) {
  calculateAllPositions();
  calculateTierStats();
} else {
  console.log('\n📝 No active staking positions yet');
}

// Recalculate every 1 hour
setInterval(() => {
  if (stakingState.positions.length > 0) {
    calculateAllPositions();
    calculateTierStats();
  }
}, 60 * 60 * 1000);

console.log('\n✅ Staking Calculator Agent is ACTIVE');
console.log('💎 Monitoring all staking positions');
console.log('🔍 Recalculating every hour\n');
