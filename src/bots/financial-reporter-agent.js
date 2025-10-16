#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Data files
const DATA_DIR = path.join(__dirname, '../../data/tokenomics');
const REPORTS_DIR = path.join(DATA_DIR, 'reports');
const STATE_FILE = path.join(DATA_DIR, 'financial-reporter-state.json');

if (!fs.existsSync(REPORTS_DIR)) {
  fs.mkdirSync(REPORTS_DIR, { recursive: true });
}

// Reporter state
const reporterState = {
  reportsGenerated: 0,
  lastReport: null,
  reports: []
};

console.log('✅ Financial Reporter Agent started');
console.log('📊 Generating comprehensive financial accuracy reports');

// Load state
function loadState() {
  try {
    if (fs.existsSync(STATE_FILE)) {
      const saved = JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
      Object.assign(reporterState, saved);
      console.log('✅ Loaded reporter state');
    }
  } catch (error) {
    console.error('⚠️ Error loading state:', error.message);
  }
}

// Save state
function saveState() {
  try {
    fs.writeFileSync(STATE_FILE, JSON.stringify(reporterState, null, 2));
  } catch (error) {
    console.error('❌ Error saving state:', error.message);
  }
}

// Load data from file
function loadData(filename) {
  const filepath = path.join(DATA_DIR, filename);
  if (!fs.existsSync(filepath)) {
    return null;
  }

  try {
    return JSON.parse(fs.readFileSync(filepath, 'utf8'));
  } catch (error) {
    console.error(`❌ Error loading ${filename}:`, error.message);
    return null;
  }
}

// Generate comprehensive financial report
function generateFinancialReport() {
  console.log('\n' + '='.repeat(80));
  console.log('📊 GENERATING COMPREHENSIVE FINANCIAL REPORT');
  console.log('='.repeat(80));

  const timestamp = new Date().toISOString();
  reporterState.reportsGenerated++;
  reporterState.lastReport = timestamp;

  const report = {
    generated: timestamp,
    reportNumber: reporterState.reportsGenerated,
    sections: {}
  };

  // 1. Validation Results
  console.log('\n1️⃣ Tokenomics Validation');
  const validatorState = loadData('validator-state.json');
  if (validatorState) {
    report.sections.validation = {
      checksPerformed: validatorState.checksPerformed,
      errorsFound: validatorState.errorsFound,
      warningsIssued: validatorState.warningsIssued,
      lastCheck: validatorState.lastCheck,
      status: validatorState.errorsFound === 0 ? 'PASSED' : 'FAILED'
    };

    console.log(`   Checks Performed: ${validatorState.checksPerformed}`);
    console.log(`   Errors Found: ${validatorState.errorsFound}`);
    console.log(`   Warnings Issued: ${validatorState.warningsIssued}`);
    console.log(`   Status: ${report.sections.validation.status}`);
  } else {
    console.log('   ⚠️ Validation data not available');
    report.sections.validation = { status: 'NO_DATA' };
  }

  // 2. Staking Metrics
  console.log('\n2️⃣ Staking Metrics');
  const stakingState = loadData('staking-calculations.json');
  const stakingPositions = loadData('staking-positions.json');
  if (stakingState && stakingPositions) {
    const totalStaked = stakingPositions.reduce((sum, pos) => sum + pos.amount, 0);

    report.sections.staking = {
      totalPositions: stakingPositions.length,
      totalStaked: totalStaked,
      rewardsDistributed: stakingState.rewardsDistributed || 0,
      calculationsPerformed: stakingState.calculationsPerformed,
      lastCalculation: stakingState.lastCalculation
    };

    console.log(`   Total Positions: ${stakingPositions.length}`);
    console.log(`   Total Staked: ${totalStaked.toLocaleString()} HYPE`);
    console.log(`   Rewards Distributed: ${report.sections.staking.rewardsDistributed.toLocaleString()} HYPE`);
  } else {
    console.log('   ⚠️ Staking data not available');
    report.sections.staking = { status: 'NO_DATA' };
  }

  // 3. Distribution Status
  console.log('\n3️⃣ Token Distribution');
  const distributionState = loadData('distribution-state.json');
  if (distributionState) {
    const totalDistributed = Object.values(distributionState.distributed).reduce((sum, val) => sum + val, 0);
    const totalLocked = Object.values(distributionState.locked).reduce((sum, val) => sum + val, 0);

    report.sections.distribution = {
      totalDistributed,
      totalLocked,
      percentDistributed: (totalDistributed / 1000000000 * 100).toFixed(2),
      percentLocked: (totalLocked / 1000000000 * 100).toFixed(2),
      byCategory: distributionState.distributed
    };

    console.log(`   Total Distributed: ${totalDistributed.toLocaleString()} HYPE (${report.sections.distribution.percentDistributed}%)`);
    console.log(`   Total Locked: ${totalLocked.toLocaleString()} HYPE (${report.sections.distribution.percentLocked}%)`);
  } else {
    console.log('   ⚠️ Distribution data not available');
    report.sections.distribution = { status: 'NO_DATA' };
  }

  // 4. Audit Results
  console.log('\n4️⃣ Rewards Audit');
  const auditState = loadData('rewards-audit.json');
  const discrepancies = loadData('reward-discrepancies.json');
  if (auditState) {
    report.sections.audit = {
      auditsPerformed: auditState.auditsPerformed,
      discrepanciesFound: auditState.discrepanciesFound,
      lastAudit: auditState.lastAudit,
      status: auditState.discrepanciesFound === 0 ? 'PASSED' : 'FAILED',
      recentDiscrepancies: discrepancies ? discrepancies.slice(-5) : []
    };

    console.log(`   Audits Performed: ${auditState.auditsPerformed}`);
    console.log(`   Discrepancies Found: ${auditState.discrepanciesFound}`);
    console.log(`   Status: ${report.sections.audit.status}`);
  } else {
    console.log('   ⚠️ Audit data not available');
    report.sections.audit = { status: 'NO_DATA' };
  }

  // 5. Reconciliation Results
  console.log('\n5️⃣ Balance Reconciliation');
  const reconciliationState = loadData('balance-reconciliation.json');
  const mismatches = loadData('balance-mismatches.json');
  if (reconciliationState) {
    report.sections.reconciliation = {
      reconciliationsPerformed: reconciliationState.reconciliationsPerformed,
      mismatchesFound: reconciliationState.mismatchesFound,
      lastReconciliation: reconciliationState.lastReconciliation,
      status: reconciliationState.mismatchesFound === 0 ? 'PASSED' : 'FAILED',
      recentMismatches: mismatches ? mismatches.slice(-5) : []
    };

    console.log(`   Reconciliations Performed: ${reconciliationState.reconciliationsPerformed}`);
    console.log(`   Mismatches Found: ${reconciliationState.mismatchesFound}`);
    console.log(`   Status: ${report.sections.reconciliation.status}`);
  } else {
    console.log('   ⚠️ Reconciliation data not available');
    report.sections.reconciliation = { status: 'NO_DATA' };
  }

  // 6. Overall Health Score
  console.log('\n6️⃣ Financial Health Score');
  let healthScore = 100;
  let issues = [];

  if (report.sections.validation.status === 'FAILED') {
    healthScore -= 25;
    issues.push('Validation errors detected');
  }
  if (report.sections.audit.status === 'FAILED') {
    healthScore -= 25;
    issues.push('Audit discrepancies found');
  }
  if (report.sections.reconciliation.status === 'FAILED') {
    healthScore -= 25;
    issues.push('Balance mismatches detected');
  }

  report.healthScore = healthScore;
  report.healthStatus = healthScore === 100 ? 'EXCELLENT' :
                       healthScore >= 75 ? 'GOOD' :
                       healthScore >= 50 ? 'FAIR' : 'POOR';
  report.issues = issues;

  console.log(`   Health Score: ${healthScore}/100`);
  console.log(`   Health Status: ${report.healthStatus}`);
  if (issues.length > 0) {
    console.log(`   Issues:`);
    issues.forEach(issue => console.log(`     - ${issue}`));
  }

  // Save report
  const reportFilename = `financial-report-${Date.now()}.json`;
  const reportPath = path.join(REPORTS_DIR, reportFilename);
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

  reporterState.reports.push({
    timestamp,
    filename: reportFilename,
    healthScore,
    healthStatus: report.healthStatus
  });

  // Keep only last 100 report references
  if (reporterState.reports.length > 100) {
    reporterState.reports.shift();
  }

  console.log('\n' + '='.repeat(80));
  console.log(`✅ FINANCIAL REPORT SAVED: ${reportFilename}`);
  console.log('='.repeat(80) + '\n');

  saveState();

  return report;
}

// Generate summary report
function generateSummaryReport() {
  console.log('\n📊 Financial Summary');
  console.log('='.repeat(80));

  console.log(`Reports Generated: ${reporterState.reportsGenerated}`);
  console.log(`Last Report: ${reporterState.lastReport || 'N/A'}`);

  if (reporterState.reports.length > 0) {
    const recentReports = reporterState.reports.slice(-10);
    const avgHealthScore = recentReports.reduce((sum, r) => sum + r.healthScore, 0) / recentReports.length;

    console.log(`\nRecent Health Scores (last 10 reports):`);
    recentReports.forEach((r, i) => {
      console.log(`  ${i + 1}. ${r.healthScore}/100 (${r.healthStatus}) - ${new Date(r.timestamp).toLocaleString()}`);
    });

    console.log(`\nAverage Health Score: ${avgHealthScore.toFixed(1)}/100`);
  }

  console.log('='.repeat(80));
}

// Main execution
loadState();

// Generate initial report
generateFinancialReport();
generateSummaryReport();

// Generate full report every 1 hour
setInterval(() => {
  generateFinancialReport();
}, 60 * 60 * 1000);

// Generate summary every 15 minutes
setInterval(() => {
  generateSummaryReport();
}, 15 * 60 * 1000);

console.log('\n✅ Financial Reporter Agent is ACTIVE');
console.log('📊 Full reports generated every hour');
console.log('📝 Summaries generated every 15 minutes');
console.log('💾 Reports saved to:', REPORTS_DIR, '\n');
