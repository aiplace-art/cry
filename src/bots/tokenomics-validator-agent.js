#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const config = {
  token: {
    name: 'HYPE',
    symbol: 'HYPE',
    totalSupply: 1000000000, // 1 billion
    decimals: 18
  },
  distribution: {
    presale: 0.30,        // 30% - 300M
    liquidity: 0.20,      // 20% - 200M
    staking: 0.25,        // 25% - 250M
    team: 0.10,           // 10% - 100M (vested)
    marketing: 0.10,      // 10% - 100M
    treasury: 0.05        // 5% - 50M
  },
  stakingTiers: {
    bronze: { apy: 0.17, lockDays: 30, minAmount: 1000 },
    silver: { apy: 0.27, lockDays: 90, minAmount: 10000 },
    gold: { apy: 0.62, lockDays: 180, minAmount: 50000 }
  },
  burnRate: 0.01,         // 1% per transaction
  maxWalletPercent: 0.02  // 2% anti-whale
};

// Data files
const DATA_DIR = path.join(__dirname, '../../data/tokenomics');
const STATE_FILE = path.join(DATA_DIR, 'validator-state.json');
const AUDIT_LOG = path.join(DATA_DIR, 'audit-log.json');
const ALERTS_FILE = path.join(DATA_DIR, 'validation-alerts.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Validation state
const validationState = {
  lastCheck: null,
  checksPerformed: 0,
  errorsFound: 0,
  warningsIssued: 0,
  currentSupply: config.token.totalSupply,
  distributedTokens: 0,
  burnedTokens: 0,
  stakedTokens: 0,
  validationResults: []
};

// Audit log
const auditLog = [];

// Active alerts
const alerts = [];

console.log('✅ Tokenomics Validator Agent started');
console.log('🔍 Monitoring ALL tokenomics with ZERO error tolerance');
console.log('📊 Configuration:', JSON.stringify(config, null, 2));

// Load previous state
function loadState() {
  try {
    if (fs.existsSync(STATE_FILE)) {
      const saved = JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
      Object.assign(validationState, saved);
      console.log('✅ Loaded previous validation state');
    }
  } catch (error) {
    console.error('⚠️ Error loading state:', error.message);
  }
}

// Save state
function saveState() {
  try {
    fs.writeFileSync(STATE_FILE, JSON.stringify(validationState, null, 2));
  } catch (error) {
    console.error('❌ Error saving state:', error.message);
  }
}

// Add audit entry
function addAuditEntry(type, message, data = {}) {
  const entry = {
    id: Date.now(),
    timestamp: new Date().toISOString(),
    type,
    message,
    data,
    severity: type === 'error' ? 'critical' : type === 'warning' ? 'high' : 'info'
  };

  auditLog.push(entry);

  // Keep only last 1000 entries
  if (auditLog.length > 1000) {
    auditLog.shift();
  }

  // Save audit log
  try {
    fs.writeFileSync(AUDIT_LOG, JSON.stringify(auditLog, null, 2));
  } catch (error) {
    console.error('❌ Error saving audit log:', error.message);
  }

  console.log(`📝 [${type.toUpperCase()}] ${message}`);

  return entry;
}

// Create alert
function createAlert(severity, message, data = {}) {
  const alert = {
    id: Date.now(),
    timestamp: new Date().toISOString(),
    severity, // critical, high, medium, low
    message,
    data,
    acknowledged: false
  };

  alerts.push(alert);

  // Save alerts
  try {
    fs.writeFileSync(ALERTS_FILE, JSON.stringify(alerts, null, 2));
  } catch (error) {
    console.error('❌ Error saving alerts:', error.message);
  }

  console.log(`🚨 [${severity.toUpperCase()} ALERT] ${message}`);

  // Add to audit log
  addAuditEntry('error', message, data);

  return alert;
}

// Validate token distribution
function validateDistribution() {
  console.log('\n🔍 Validating token distribution...');

  const results = {
    valid: true,
    errors: [],
    warnings: []
  };

  // Check distribution percentages sum to 1.0
  const totalPercent = Object.values(config.distribution).reduce((sum, val) => sum + val, 0);

  if (Math.abs(totalPercent - 1.0) > 0.0001) {
    results.valid = false;
    results.errors.push({
      code: 'DISTRIBUTION_SUM_ERROR',
      message: `Distribution percentages sum to ${totalPercent}, must be 1.0`,
      expected: 1.0,
      actual: totalPercent
    });
    createAlert('critical', 'Token distribution percentages do not sum to 100%', {
      totalPercent,
      distribution: config.distribution
    });
  }

  // Check each allocation
  Object.entries(config.distribution).forEach(([category, percent]) => {
    const tokens = config.token.totalSupply * percent;

    if (tokens < 0) {
      results.valid = false;
      results.errors.push({
        code: 'NEGATIVE_ALLOCATION',
        message: `${category} has negative allocation`,
        category,
        tokens
      });
      createAlert('critical', `Negative token allocation detected: ${category}`, { category, tokens });
    }

    console.log(`  ✓ ${category}: ${percent * 100}% = ${tokens.toLocaleString()} HYPE`);
  });

  addAuditEntry('validation', 'Distribution validation completed', results);

  return results;
}

// Validate staking calculations
function validateStaking() {
  console.log('\n🔍 Validating staking calculations...');

  const results = {
    valid: true,
    errors: [],
    warnings: [],
    calculations: []
  };

  Object.entries(config.stakingTiers).forEach(([tier, params]) => {
    const { apy, lockDays, minAmount } = params;

    // Calculate expected rewards for minimum stake
    const annualReward = minAmount * apy;
    const dailyReward = annualReward / 365;
    const lockPeriodReward = dailyReward * lockDays;

    // Validate APY is positive
    if (apy <= 0) {
      results.valid = false;
      results.errors.push({
        code: 'INVALID_APY',
        message: `${tier} tier has invalid APY: ${apy}`,
        tier,
        apy
      });
      createAlert('critical', `Invalid APY for ${tier} tier`, { tier, apy });
    }

    // Validate lock period
    if (lockDays <= 0) {
      results.valid = false;
      results.errors.push({
        code: 'INVALID_LOCK_PERIOD',
        message: `${tier} tier has invalid lock period: ${lockDays}`,
        tier,
        lockDays
      });
      createAlert('critical', `Invalid lock period for ${tier} tier`, { tier, lockDays });
    }

    // Validate minimum amount
    if (minAmount <= 0) {
      results.valid = false;
      results.errors.push({
        code: 'INVALID_MIN_AMOUNT',
        message: `${tier} tier has invalid minimum amount: ${minAmount}`,
        tier,
        minAmount
      });
      createAlert('critical', `Invalid minimum amount for ${tier} tier`, { tier, minAmount });
    }

    const calculation = {
      tier,
      apy: `${(apy * 100).toFixed(2)}%`,
      lockDays,
      minAmount,
      annualReward: annualReward.toFixed(2),
      dailyReward: dailyReward.toFixed(6),
      lockPeriodReward: lockPeriodReward.toFixed(2)
    };

    results.calculations.push(calculation);

    console.log(`  ✓ ${tier.toUpperCase()}: ${(apy * 100)}% APY, ${lockDays} days, min ${minAmount} HYPE`);
    console.log(`    → Annual: ${annualReward.toFixed(2)} HYPE, Lock Period: ${lockPeriodReward.toFixed(2)} HYPE`);
  });

  addAuditEntry('validation', 'Staking validation completed', results);

  return results;
}

// Validate supply constraints
function validateSupply() {
  console.log('\n🔍 Validating supply constraints...');

  const results = {
    valid: true,
    errors: [],
    warnings: []
  };

  // Total supply must never exceed max
  if (validationState.currentSupply > config.token.totalSupply) {
    results.valid = false;
    results.errors.push({
      code: 'SUPPLY_EXCEEDED',
      message: 'Current supply exceeds total supply',
      currentSupply: validationState.currentSupply,
      maxSupply: config.token.totalSupply
    });
    createAlert('critical', 'Token supply exceeded maximum!', {
      currentSupply: validationState.currentSupply,
      maxSupply: config.token.totalSupply
    });
  }

  // Distributed + burned + staked should equal total supply
  const accountedTokens = validationState.distributedTokens + validationState.burnedTokens + validationState.stakedTokens;
  const unaccountedTokens = config.token.totalSupply - accountedTokens;

  if (Math.abs(unaccountedTokens) > 1) { // Allow 1 token tolerance for rounding
    results.warnings.push({
      code: 'UNACCOUNTED_TOKENS',
      message: 'Tokens not properly accounted for',
      unaccountedTokens,
      distributed: validationState.distributedTokens,
      burned: validationState.burnedTokens,
      staked: validationState.stakedTokens
    });
    createAlert('high', 'Token accounting mismatch detected', {
      unaccountedTokens,
      totalSupply: config.token.totalSupply,
      accountedTokens
    });
  }

  console.log(`  ✓ Total Supply: ${config.token.totalSupply.toLocaleString()} HYPE`);
  console.log(`  ✓ Current Supply: ${validationState.currentSupply.toLocaleString()} HYPE`);
  console.log(`  ✓ Distributed: ${validationState.distributedTokens.toLocaleString()} HYPE`);
  console.log(`  ✓ Burned: ${validationState.burnedTokens.toLocaleString()} HYPE`);
  console.log(`  ✓ Staked: ${validationState.stakedTokens.toLocaleString()} HYPE`);

  addAuditEntry('validation', 'Supply validation completed', results);

  return results;
}

// Validate burn mechanism
function validateBurnMechanism() {
  console.log('\n🔍 Validating burn mechanism...');

  const results = {
    valid: true,
    errors: [],
    warnings: []
  };

  // Burn rate must be between 0 and 1
  if (config.burnRate < 0 || config.burnRate > 1) {
    results.valid = false;
    results.errors.push({
      code: 'INVALID_BURN_RATE',
      message: 'Burn rate must be between 0 and 1',
      burnRate: config.burnRate
    });
    createAlert('critical', 'Invalid burn rate configuration', { burnRate: config.burnRate });
  }

  // Simulate burn on 1000 token transaction
  const testAmount = 1000;
  const burnAmount = testAmount * config.burnRate;
  const receivedAmount = testAmount - burnAmount;

  console.log(`  ✓ Burn Rate: ${(config.burnRate * 100)}%`);
  console.log(`  ✓ Test: ${testAmount} HYPE transfer → ${burnAmount} burned, ${receivedAmount} received`);

  addAuditEntry('validation', 'Burn mechanism validated', results);

  return results;
}

// Validate anti-whale mechanism
function validateAntiWhale() {
  console.log('\n🔍 Validating anti-whale mechanism...');

  const results = {
    valid: true,
    errors: [],
    warnings: []
  };

  const maxWalletTokens = config.token.totalSupply * config.maxWalletPercent;

  // Max wallet percent must be reasonable (0.1% to 10%)
  if (config.maxWalletPercent < 0.001 || config.maxWalletPercent > 0.10) {
    results.warnings.push({
      code: 'UNUSUAL_MAX_WALLET',
      message: 'Max wallet percentage is unusual',
      maxWalletPercent: config.maxWalletPercent
    });
    createAlert('medium', 'Unusual max wallet configuration', {
      maxWalletPercent: config.maxWalletPercent,
      maxWalletTokens
    });
  }

  console.log(`  ✓ Max Wallet: ${(config.maxWalletPercent * 100)}% = ${maxWalletTokens.toLocaleString()} HYPE`);

  addAuditEntry('validation', 'Anti-whale mechanism validated', results);

  return results;
}

// Comprehensive validation
function runFullValidation() {
  console.log('\n' + '='.repeat(80));
  console.log('🔍 RUNNING COMPREHENSIVE TOKENOMICS VALIDATION');
  console.log('='.repeat(80));

  validationState.lastCheck = new Date().toISOString();
  validationState.checksPerformed++;

  const allResults = {
    timestamp: validationState.lastCheck,
    checkNumber: validationState.checksPerformed,
    distribution: validateDistribution(),
    staking: validateStaking(),
    supply: validateSupply(),
    burn: validateBurnMechanism(),
    antiWhale: validateAntiWhale()
  };

  // Aggregate results
  const allValid = Object.values(allResults)
    .filter(r => r && typeof r === 'object' && 'valid' in r)
    .every(r => r.valid);

  const totalErrors = Object.values(allResults)
    .filter(r => r && typeof r === 'object' && 'errors' in r)
    .reduce((sum, r) => sum + r.errors.length, 0);

  const totalWarnings = Object.values(allResults)
    .filter(r => r && typeof r === 'object' && 'warnings' in r)
    .reduce((sum, r) => sum + r.warnings.length, 0);

  validationState.errorsFound += totalErrors;
  validationState.warningsIssued += totalWarnings;
  validationState.validationResults.push({
    timestamp: validationState.lastCheck,
    allValid,
    totalErrors,
    totalWarnings
  });

  // Keep only last 100 results
  if (validationState.validationResults.length > 100) {
    validationState.validationResults.shift();
  }

  console.log('\n' + '='.repeat(80));
  if (allValid) {
    console.log('✅ VALIDATION PASSED - All tokenomics are correct');
  } else {
    console.log('❌ VALIDATION FAILED - Errors detected!');
    console.log(`   Total Errors: ${totalErrors}`);
    console.log(`   Total Warnings: ${totalWarnings}`);
  }
  console.log('='.repeat(80));

  saveState();

  return allResults;
}

// Generate validation report
function generateReport() {
  const report = {
    generated: new Date().toISOString(),
    summary: {
      checksPerformed: validationState.checksPerformed,
      totalErrors: validationState.errorsFound,
      totalWarnings: validationState.warningsIssued,
      lastCheck: validationState.lastCheck
    },
    currentState: validationState,
    recentAlerts: alerts.slice(-10),
    recentAudit: auditLog.slice(-20)
  };

  console.log('\n📊 Validation Report:', JSON.stringify(report.summary, null, 2));

  return report;
}

// Main execution
loadState();

// Run validation immediately
runFullValidation();

// Generate initial report
generateReport();

// Run validation every 5 minutes
setInterval(() => {
  runFullValidation();
}, 5 * 60 * 1000);

// Generate report every hour
setInterval(() => {
  generateReport();
}, 60 * 60 * 1000);

console.log('\n✅ Tokenomics Validator Agent is ACTIVE');
console.log('🔍 Validating every 5 minutes');
console.log('📊 Reports generated every hour');
console.log('🚨 ZERO error tolerance - all issues will trigger alerts\n');
