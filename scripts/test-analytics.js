#!/usr/bin/env node

/**
 * Test script for HypeAI Twitter Analytics
 * Runs analytics collection and report generation in demo mode
 */

const TwitterAnalytics = require('./twitter-analytics');
const TwitterReporter = require('./twitter-reporter');
const fs = require('fs');
const path = require('path');

async function runTests() {
  console.log('🧪 HypeAI Twitter Analytics Test Suite\n');
  console.log('=' .repeat(60) + '\n');

  // Test 1: Analytics Collection
  console.log('TEST 1: Analytics Collection');
  console.log('-'.repeat(60));
  try {
    const analytics = new TwitterAnalytics();
    const results = await analytics.collectAll();
    console.log('✅ Analytics collection passed');
    console.log(`   - Collected ${results.tweets} tweets`);
    console.log(`   - Tracked ${results.competitors} competitors`);
    console.log(`   - Identified ${results.topContent.topTweets.length} top tweets`);
  } catch (error) {
    console.error('❌ Analytics collection failed:', error.message);
  }
  console.log('');

  // Test 2: Report Generation
  console.log('TEST 2: Report Generation');
  console.log('-'.repeat(60));
  try {
    const reporter = new TwitterReporter();

    console.log('  📊 Generating daily summary...');
    const daily = reporter.generateDailySummary();
    console.log('  ✅ Daily summary generated');

    console.log('  📈 Generating weekly report...');
    const weekly = reporter.generateWeeklyReport();
    console.log('  ✅ Weekly report generated');

    console.log('  🎯 Generating content analysis...');
    const content = reporter.generateContentAnalysis();
    console.log('  ✅ Content analysis generated');

    console.log('  🔍 Generating competitor report...');
    const competitors = reporter.generateCompetitorReport();
    console.log('  ✅ Competitor report generated');

    console.log('\n✅ All reports generated successfully');
  } catch (error) {
    console.error('❌ Report generation failed:', error.message);
  }
  console.log('');

  // Test 3: File Verification
  console.log('TEST 3: File System Verification');
  console.log('-'.repeat(60));
  const metricsDir = path.join(__dirname, '../.twitter/analytics/metrics');
  const reportsDir = path.join(__dirname, '../.twitter/analytics/reports');

  try {
    const metricsFiles = fs.readdirSync(metricsDir);
    console.log(`✅ Found ${metricsFiles.length} metrics files`);

    const reportFiles = fs.readdirSync(reportsDir);
    console.log(`✅ Found ${reportFiles.length} report files`);

    console.log('\nMetrics files:');
    metricsFiles.slice(0, 5).forEach(file => console.log(`   - ${file}`));

    console.log('\nReport files:');
    reportFiles.slice(0, 5).forEach(file => console.log(`   - ${file}`));
  } catch (error) {
    console.error('❌ File verification failed:', error.message);
  }
  console.log('');

  // Test 4: Dashboard Verification
  console.log('TEST 4: Dashboard File Verification');
  console.log('-'.repeat(60));
  const dashboardPath = path.join(__dirname, 'analytics-dashboard.html');
  try {
    const stats = fs.statSync(dashboardPath);
    console.log(`✅ Dashboard file exists (${(stats.size / 1024).toFixed(2)} KB)`);
    console.log(`   Path: ${dashboardPath}`);
    console.log('   To view: open scripts/analytics-dashboard.html');
  } catch (error) {
    console.error('❌ Dashboard verification failed:', error.message);
  }
  console.log('');

  // Summary
  console.log('=' .repeat(60));
  console.log('🎉 TEST SUITE COMPLETE');
  console.log('=' .repeat(60));
  console.log('\n📋 Next Steps:');
  console.log('   1. Set TWITTER_BEARER_TOKEN in .twitter/.env');
  console.log('   2. Run: node scripts/twitter-analytics.js');
  console.log('   3. Run: node scripts/twitter-reporter.js all');
  console.log('   4. View: open scripts/analytics-dashboard.html');
  console.log('\n💡 For automation, set up cron jobs (see .twitter/analytics/README.md)');
}

// Run tests
runTests().catch(console.error);
