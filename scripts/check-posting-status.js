#!/usr/bin/env node

/**
 * Twitter Posting Status Monitor
 *
 * Shows comprehensive statistics about automated Twitter posting:
 * - Today's posts
 * - This week's stats
 * - This month's stats
 * - Remaining quota
 * - Next scheduled post
 * - Recent activity
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configuration
const CONFIG = {
  PATHS: {
    HISTORY: './data/project-coordination/posting-history.json',
    SCHEDULER_LOG: './data/project-coordination/scheduler-log.json'
  },
  LIMITS: {
    MAX_POSTS_PER_DAY: 3,
    MAX_POSTS_PER_WEEK: 18,
    MAX_POSTS_PER_MONTH: 90
  },
  SCHEDULE: {
    morning: { hour: 9, minute: 0, days: [1, 2, 3, 4, 5] },
    afternoon: { hour: 15, minute: 0, days: [1, 2, 3, 4, 5, 6, 0] },
    evening: { hour: 21, minute: 0, days: [1, 2, 3, 4, 5, 6, 0] }
  }
};

/**
 * Get Moscow Time
 */
function getMoscowTime() {
  return new Date(new Date().toLocaleString('en-US', { timeZone: 'Europe/Moscow' }));
}

/**
 * Load scheduler log
 */
function loadSchedulerLog() {
  try {
    if (fs.existsSync(CONFIG.PATHS.SCHEDULER_LOG)) {
      return JSON.parse(fs.readFileSync(CONFIG.PATHS.SCHEDULER_LOG, 'utf8'));
    }
  } catch (error) {
    console.error('⚠️  Error loading scheduler log:', error.message);
  }
  return {
    runs: [],
    stats: {
      totalRuns: 0,
      successfulPosts: 0,
      skippedPosts: 0,
      failedPosts: 0,
      consecutiveErrors: 0
    }
  };
}

/**
 * Get posts in time period
 */
function getPostsInPeriod(log, hours) {
  const now = new Date();
  const cutoff = new Date(now.getTime() - (hours * 60 * 60 * 1000));

  return log.runs.filter(run =>
    run.success &&
    run.reason !== 'SKIPPED' &&
    new Date(run.timestamp) > cutoff
  );
}

/**
 * Get next scheduled time
 */
function getNextScheduledTime() {
  const now = getMoscowTime();
  const times = [];

  for (const [slot, schedule] of Object.entries(CONFIG.SCHEDULE)) {
    const scheduledTime = new Date(now);
    scheduledTime.setHours(schedule.hour, schedule.minute, 0, 0);

    // If time has passed today, check tomorrow
    if (scheduledTime <= now) {
      scheduledTime.setDate(scheduledTime.getDate() + 1);
    }

    // Check if it's a scheduled day
    while (!schedule.days.includes(scheduledTime.getDay())) {
      scheduledTime.setDate(scheduledTime.getDate() + 1);
    }

    times.push({ slot, time: scheduledTime });
  }

  // Sort by time and return nearest
  times.sort((a, b) => a.time - b.time);
  return times[0];
}

/**
 * Format time ago
 */
function timeAgo(date) {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);

  if (seconds < 60) return `${seconds}s ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

/**
 * Create progress bar
 */
function progressBar(current, max, width = 30) {
  const percentage = Math.min(current / max, 1);
  const filled = Math.floor(percentage * width);
  const empty = width - filled;

  const bar = '█'.repeat(filled) + '░'.repeat(empty);
  const percent = Math.floor(percentage * 100);

  let color = '🟢'; // Green
  if (percentage > 0.8) color = '🔴'; // Red
  else if (percentage > 0.6) color = '🟡'; // Yellow

  return `${color} [${bar}] ${current}/${max} (${percent}%)`;
}

/**
 * Main status display
 */
function showStatus() {
  console.log('╔════════════════════════════════════════════════════════════════╗');
  console.log('║         📊 TWITTER POSTING STATUS MONITOR                     ║');
  console.log('╚════════════════════════════════════════════════════════════════╝\n');

  const now = getMoscowTime();
  console.log(`⏰ Current Time: ${now.toLocaleString('ru-RU')}`);
  console.log(`📅 ${now.toLocaleDateString('ru-RU', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}\n`);

  // Load data
  const log = loadSchedulerLog();

  if (log.runs.length === 0) {
    console.log('⚠️  No posting activity recorded yet.\n');
    console.log('   Run the scheduler to start posting:');
    console.log('   node scripts/twitter-scheduler.js\n');
    return;
  }

  // Calculate stats
  const todayPosts = getPostsInPeriod(log, 24);
  const weekPosts = getPostsInPeriod(log, 24 * 7);
  const monthPosts = getPostsInPeriod(log, 24 * 30);

  // Usage statistics
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('POSTING QUOTA & USAGE');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  console.log('📅 TODAY:');
  console.log(`   ${progressBar(todayPosts.length, CONFIG.LIMITS.MAX_POSTS_PER_DAY)}`);
  console.log(`   Remaining: ${CONFIG.LIMITS.MAX_POSTS_PER_DAY - todayPosts.length} posts\n`);

  console.log('📅 THIS WEEK:');
  console.log(`   ${progressBar(weekPosts.length, CONFIG.LIMITS.MAX_POSTS_PER_WEEK)}`);
  console.log(`   Remaining: ${CONFIG.LIMITS.MAX_POSTS_PER_WEEK - weekPosts.length} posts\n`);

  console.log('📅 THIS MONTH:');
  console.log(`   ${progressBar(monthPosts.length, CONFIG.LIMITS.MAX_POSTS_PER_MONTH)}`);
  console.log(`   Remaining: ${CONFIG.LIMITS.MAX_POSTS_PER_MONTH - monthPosts.length} posts\n`);

  // Recent activity
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('RECENT ACTIVITY (Last 10)');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  const recentRuns = log.runs.slice(-10).reverse();

  recentRuns.forEach(run => {
    const icon = run.success ? '✅' : (run.reason === 'SKIPPED' ? '⏭️' : '❌');
    const time = new Date(run.timestamp).toLocaleString('ru-RU', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    const ago = timeAgo(run.timestamp);

    let status = run.reason || 'Unknown';
    if (run.reason === 'SCHEDULED_POST') status = 'Posted (scheduled)';
    if (run.reason === 'FORCED_POST') status = 'Posted (forced)';
    if (run.reason === 'SKIPPED') status = `Skipped: ${run.details?.message || 'Unknown'}`;
    if (run.reason === 'SAFETY_LIMIT') status = 'Blocked by safety limits';

    console.log(`${icon} ${time} (${ago})`);
    console.log(`   ${status}`);

    if (run.details?.slot) {
      console.log(`   Slot: ${run.details.slot}`);
    }

    console.log();
  });

  // Next scheduled post
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('NEXT SCHEDULED POST');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  const next = getNextScheduledTime();
  const hoursUntil = (next.time - now) / (1000 * 60 * 60);

  console.log(`⏰ Time: ${next.time.toLocaleString('ru-RU')}`);
  console.log(`📍 Slot: ${next.slot}`);
  console.log(`⏳ In: ${hoursUntil.toFixed(1)} hours`);

  if (hoursUntil < 1) {
    console.log(`   ⚡ COMING UP SOON!`);
  }

  console.log();

  // Overall statistics
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('OVERALL STATISTICS');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  const successRate = log.stats.totalRuns > 0
    ? ((log.stats.successfulPosts / log.stats.totalRuns) * 100).toFixed(1)
    : 0;

  console.log(`📊 Total scheduler runs: ${log.stats.totalRuns}`);
  console.log(`✅ Successful posts: ${log.stats.successfulPosts}`);
  console.log(`⏭️  Skipped runs: ${log.stats.skippedPosts}`);
  console.log(`❌ Failed posts: ${log.stats.failedPosts}`);
  console.log(`📈 Success rate: ${successRate}%`);
  console.log(`⚠️  Consecutive errors: ${log.stats.consecutiveErrors}/3\n`);

  // Health check
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('SYSTEM HEALTH');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  const issues = [];

  // Check for high error rate
  if (log.stats.consecutiveErrors >= 2) {
    issues.push(`⚠️  High error rate: ${log.stats.consecutiveErrors} consecutive errors`);
  }

  // Check if approaching limits
  if (todayPosts.length >= CONFIG.LIMITS.MAX_POSTS_PER_DAY) {
    issues.push('⚠️  Daily limit reached');
  }

  if (monthPosts.length >= CONFIG.LIMITS.MAX_POSTS_PER_MONTH * 0.9) {
    issues.push('⚠️  Approaching monthly limit (90% used)');
  }

  // Check if no recent posts
  const lastPost = log.runs.filter(r => r.success && r.reason !== 'SKIPPED').slice(-1)[0];
  if (lastPost) {
    const hoursSincePost = (new Date() - new Date(lastPost.timestamp)) / (1000 * 60 * 60);
    if (hoursSincePost > 48) {
      issues.push(`⚠️  No posts in ${Math.floor(hoursSincePost / 24)} days`);
    }
  }

  if (issues.length === 0) {
    console.log('✅ All systems operational\n');
  } else {
    console.log('⚠️  Issues detected:\n');
    issues.forEach(issue => console.log(`   ${issue}`));
    console.log();
  }

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

// Run status display
showStatus();
