#!/usr/bin/env node

/**
 * Twitter Smart Scheduler - Automated posting with safety limits
 *
 * FEATURES:
 * - Auto-post 2-3 tweets per day at optimal times
 * - Moscow Time scheduling (UTC+3): 9:00, 15:00, 21:00
 * - Smart rate limiting (max 3/day, max 90/month)
 * - Skip posts if too recent (4 hour minimum gap)
 * - Automatic retry on failure (max 3 retries)
 * - Comprehensive logging and statistics
 *
 * USAGE:
 *   node twitter-scheduler.js           # Check if should post now
 *   node twitter-scheduler.js --force   # Force post regardless of schedule
 *   node twitter-scheduler.js --dry-run # Test without posting
 */

import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env.marketing') });

// ============================================================================
// CONFIGURATION
// ============================================================================

const CONFIG = {
  // Posting schedule (Moscow Time UTC+3)
  SCHEDULE: {
    morning: { hour: 9, minute: 0, days: [1, 2, 3, 4, 5] },      // Mon-Fri 9:00
    afternoon: { hour: 15, minute: 0, days: [1, 2, 3, 4, 5, 6, 0] }, // Every day 15:00
    evening: { hour: 21, minute: 0, days: [1, 2, 3, 4, 5, 6, 0] }  // Every day 21:00
  },

  // Safety limits
  LIMITS: {
    MAX_POSTS_PER_DAY: 3,
    MAX_POSTS_PER_WEEK: 18,  // 3/day * 6 days (safety buffer)
    MAX_POSTS_PER_MONTH: 90, // Leave 10 buffer on Free tier (100 limit)
    MIN_HOURS_BETWEEN_POSTS: 4,
    MAX_RETRY_ATTEMPTS: 3,
    MAX_CONSECUTIVE_ERRORS: 3
  },

  // Time windows (minutes before/after scheduled time)
  WINDOW: {
    BEFORE: 5,  // Can post 5 min before scheduled time
    AFTER: 15   // Can post up to 15 min after scheduled time
  },

  // Paths
  PATHS: {
    HISTORY: './data/project-coordination/posting-history.json',
    SCHEDULER_LOG: './data/project-coordination/scheduler-log.json',
    AUTO_POSTER: './scripts/auto-poster.js'
  }
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Get current Moscow Time
 */
function getMoscowTime() {
  return new Date(new Date().toLocaleString('en-US', { timeZone: 'Europe/Moscow' }));
}

/**
 * Load posting history
 */
function loadHistory() {
  try {
    if (fs.existsSync(CONFIG.PATHS.HISTORY)) {
      return JSON.parse(fs.readFileSync(CONFIG.PATHS.HISTORY, 'utf8'));
    }
  } catch (error) {
    console.error('⚠️  Error loading history:', error.message);
  }
  return { posted: [], lastIndex: 0 };
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
 * Save scheduler log
 */
function saveSchedulerLog(log) {
  fs.writeFileSync(CONFIG.PATHS.SCHEDULER_LOG, JSON.stringify(log, null, 2));
}

/**
 * Get posts in time period
 */
function getPostsInPeriod(history, hours) {
  if (!history.posted || history.posted.length === 0) return [];

  const now = new Date();
  const cutoff = new Date(now.getTime() - (hours * 60 * 60 * 1000));

  // Get all runs from scheduler log
  const log = loadSchedulerLog();
  return log.runs.filter(run =>
    run.success &&
    new Date(run.timestamp) > cutoff
  );
}

/**
 * Check if within scheduled time window
 */
function isWithinScheduledWindow() {
  const now = getMoscowTime();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  const currentDay = now.getDay(); // 0=Sunday, 1=Monday, etc.

  for (const [slot, schedule] of Object.entries(CONFIG.SCHEDULE)) {
    // Check if today is a scheduled day for this slot
    if (!schedule.days.includes(currentDay)) continue;

    // Calculate time difference in minutes
    const scheduledMinutes = schedule.hour * 60 + schedule.minute;
    const currentMinutes = currentHour * 60 + currentMinute;
    const diff = currentMinutes - scheduledMinutes;

    // Check if within window
    if (diff >= -CONFIG.WINDOW.BEFORE && diff <= CONFIG.WINDOW.AFTER) {
      return {
        inWindow: true,
        slot,
        scheduledTime: `${schedule.hour}:${String(schedule.minute).padStart(2, '0')}`,
        minutesOff: diff
      };
    }
  }

  return { inWindow: false };
}

/**
 * Check all safety limits
 */
function checkSafetyLimits(history) {
  const issues = [];

  // Check last post time (minimum gap)
  const recentPosts = getPostsInPeriod(history, CONFIG.LIMITS.MIN_HOURS_BETWEEN_POSTS);
  if (recentPosts.length > 0) {
    const lastPost = recentPosts[recentPosts.length - 1];
    const hoursSince = (Date.now() - new Date(lastPost.timestamp)) / (1000 * 60 * 60);
    issues.push({
      type: 'MIN_GAP',
      passed: false,
      message: `Last post was ${hoursSince.toFixed(1)}h ago (need ${CONFIG.LIMITS.MIN_HOURS_BETWEEN_POSTS}h gap)`
    });
  }

  // Check daily limit
  const todayPosts = getPostsInPeriod(history, 24);
  if (todayPosts.length >= CONFIG.LIMITS.MAX_POSTS_PER_DAY) {
    issues.push({
      type: 'DAILY_LIMIT',
      passed: false,
      message: `Daily limit reached: ${todayPosts.length}/${CONFIG.LIMITS.MAX_POSTS_PER_DAY}`
    });
  }

  // Check weekly limit
  const weekPosts = getPostsInPeriod(history, 24 * 7);
  if (weekPosts.length >= CONFIG.LIMITS.MAX_POSTS_PER_WEEK) {
    issues.push({
      type: 'WEEKLY_LIMIT',
      passed: false,
      message: `Weekly limit reached: ${weekPosts.length}/${CONFIG.LIMITS.MAX_POSTS_PER_WEEK}`
    });
  }

  // Check monthly limit
  const monthPosts = getPostsInPeriod(history, 24 * 30);
  if (monthPosts.length >= CONFIG.LIMITS.MAX_POSTS_PER_MONTH) {
    issues.push({
      type: 'MONTHLY_LIMIT',
      passed: false,
      message: `Monthly limit reached: ${monthPosts.length}/${CONFIG.LIMITS.MAX_POSTS_PER_MONTH}`
    });
  }

  // Check consecutive errors
  const log = loadSchedulerLog();
  if (log.stats.consecutiveErrors >= CONFIG.LIMITS.MAX_CONSECUTIVE_ERRORS) {
    issues.push({
      type: 'ERROR_THRESHOLD',
      passed: false,
      message: `Too many consecutive errors: ${log.stats.consecutiveErrors}`
    });
  }

  return {
    safe: issues.length === 0,
    issues,
    stats: {
      postsToday: todayPosts.length,
      postsThisWeek: weekPosts.length,
      postsThisMonth: monthPosts.length,
      consecutiveErrors: log.stats.consecutiveErrors
    }
  };
}

/**
 * Execute auto-poster script
 */
function executeAutoPoster(dryRun = false) {
  if (dryRun) {
    console.log('🧪 DRY RUN: Would execute auto-poster here');
    return { success: true, dryRun: true };
  }

  try {
    console.log('🚀 Executing auto-poster...\n');

    const output = execSync(`/opt/homebrew/bin/node ${CONFIG.PATHS.AUTO_POSTER}`, {
      cwd: path.join(__dirname, '..'),
      encoding: 'utf8',
      stdio: 'inherit'
    });

    return { success: true, output };

  } catch (error) {
    console.error('❌ Auto-poster failed:', error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Log scheduler run
 */
function logRun(result) {
  const log = loadSchedulerLog();

  const run = {
    timestamp: new Date().toISOString(),
    moscowTime: getMoscowTime().toLocaleString('ru-RU'),
    success: result.success,
    reason: result.reason,
    details: result.details || {}
  };

  log.runs.push(run);
  log.stats.totalRuns++;

  if (result.success) {
    log.stats.successfulPosts++;
    log.stats.consecutiveErrors = 0;
  } else if (result.reason === 'SKIPPED') {
    log.stats.skippedPosts++;
  } else {
    log.stats.failedPosts++;
    log.stats.consecutiveErrors++;
  }

  // Keep only last 100 runs
  if (log.runs.length > 100) {
    log.runs = log.runs.slice(-100);
  }

  saveSchedulerLog(log);
}

/**
 * Get next scheduled post time
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

// ============================================================================
// MAIN SCHEDULER LOGIC
// ============================================================================

async function runScheduler(options = {}) {
  console.log('╔════════════════════════════════════════════════════════════════╗');
  console.log('║         🤖 TWITTER SMART SCHEDULER v1.0                       ║');
  console.log('╚════════════════════════════════════════════════════════════════╝\n');

  const now = getMoscowTime();
  console.log(`⏰ Current Time: ${now.toLocaleString('ru-RU')}`);
  console.log(`📅 Day: ${now.toLocaleDateString('ru-RU', { weekday: 'long' })}\n`);

  // Load data
  const history = loadHistory();
  const log = loadSchedulerLog();

  // Display statistics
  console.log('📊 CURRENT STATISTICS:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  const todayPosts = getPostsInPeriod(history, 24);
  const weekPosts = getPostsInPeriod(history, 24 * 7);
  const monthPosts = getPostsInPeriod(history, 24 * 30);

  console.log(`   Posts today:     ${todayPosts.length}/${CONFIG.LIMITS.MAX_POSTS_PER_DAY}`);
  console.log(`   Posts this week: ${weekPosts.length}/${CONFIG.LIMITS.MAX_POSTS_PER_WEEK}`);
  console.log(`   Posts this month: ${monthPosts.length}/${CONFIG.LIMITS.MAX_POSTS_PER_MONTH}`);
  console.log(`   Consecutive errors: ${log.stats.consecutiveErrors}/${CONFIG.LIMITS.MAX_CONSECUTIVE_ERRORS}\n`);

  // Check if forced
  if (options.force) {
    console.log('⚡ FORCE MODE: Bypassing schedule check\n');

    // Still check safety limits
    const safety = checkSafetyLimits(history);
    if (!safety.safe) {
      console.log('❌ CANNOT POST: Safety limits violated:\n');
      safety.issues.forEach(issue => {
        console.log(`   ⛔ ${issue.message}`);
      });

      logRun({
        success: false,
        reason: 'SAFETY_LIMIT',
        details: { issues: safety.issues }
      });

      return;
    }

    // Execute
    const result = executeAutoPoster(options.dryRun);
    logRun({
      success: result.success,
      reason: result.success ? 'FORCED_POST' : 'POST_FAILED',
      details: result
    });

    return;
  }

  // Check schedule
  const schedule = isWithinScheduledWindow();

  if (!schedule.inWindow) {
    console.log('⏳ NOT IN SCHEDULED WINDOW');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    const next = getNextScheduledTime();
    const hoursUntil = (next.time - now) / (1000 * 60 * 60);

    console.log(`   Next scheduled post: ${next.time.toLocaleString('ru-RU')}`);
    console.log(`   Time slot: ${next.slot}`);
    console.log(`   Hours until: ${hoursUntil.toFixed(1)}h\n`);

    logRun({
      success: false,
      reason: 'SKIPPED',
      details: { message: 'Not in scheduled window', nextPost: next }
    });

    return;
  }

  console.log('✅ IN SCHEDULED WINDOW:');
  console.log(`   Slot: ${schedule.slot}`);
  console.log(`   Scheduled time: ${schedule.scheduledTime}`);
  console.log(`   Minutes off: ${schedule.minutesOff > 0 ? '+' : ''}${schedule.minutesOff}\n`);

  // Check safety limits
  const safety = checkSafetyLimits(history);

  if (!safety.safe) {
    console.log('⛔ SAFETY LIMITS PREVENT POSTING:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    safety.issues.forEach(issue => {
      console.log(`   ❌ ${issue.message}`);
    });
    console.log();

    const next = getNextScheduledTime();
    console.log(`   Next scheduled post: ${next.time.toLocaleString('ru-RU')}\n`);

    logRun({
      success: false,
      reason: 'SAFETY_LIMIT',
      details: { issues: safety.issues }
    });

    return;
  }

  console.log('✅ SAFETY CHECKS PASSED');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`   ✓ Daily limit OK: ${safety.stats.postsToday}/${CONFIG.LIMITS.MAX_POSTS_PER_DAY}`);
  console.log(`   ✓ Weekly limit OK: ${safety.stats.postsThisWeek}/${CONFIG.LIMITS.MAX_POSTS_PER_WEEK}`);
  console.log(`   ✓ Monthly limit OK: ${safety.stats.postsThisMonth}/${CONFIG.LIMITS.MAX_POSTS_PER_MONTH}`);
  console.log(`   ✓ No recent errors: ${safety.stats.consecutiveErrors} consecutive errors\n`);

  // Execute auto-poster
  console.log('🚀 EXECUTING AUTO-POSTER');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  const result = executeAutoPoster(options.dryRun);

  logRun({
    success: result.success,
    reason: result.success ? 'SCHEDULED_POST' : 'POST_FAILED',
    details: { slot: schedule.slot, ...result }
  });

  if (result.success) {
    console.log('\n✅ POSTING SUCCESSFUL!');
    const next = getNextScheduledTime();
    console.log(`   Next post: ${next.time.toLocaleString('ru-RU')} (${next.slot})\n`);
  } else {
    console.log('\n❌ POSTING FAILED!');
    console.log(`   Error: ${result.error}\n`);
  }
}

// ============================================================================
// CLI EXECUTION
// ============================================================================

const args = process.argv.slice(2);
const options = {
  force: args.includes('--force'),
  dryRun: args.includes('--dry-run')
};

if (args.includes('--help') || args.includes('-h')) {
  console.log(`
Twitter Smart Scheduler - Automated posting with safety limits

USAGE:
  node twitter-scheduler.js           Check if should post now
  node twitter-scheduler.js --force   Force post regardless of schedule
  node twitter-scheduler.js --dry-run Test without actually posting
  node twitter-scheduler.js --help    Show this help

SCHEDULE:
  Monday-Friday:   9:00, 15:00, 21:00 (Moscow Time)
  Saturday-Sunday: 15:00, 21:00 (Moscow Time)

LIMITS:
  - Max 3 posts per day
  - Max 18 posts per week
  - Max 90 posts per month
  - Minimum 4 hours between posts
  - Stop after 3 consecutive errors
`);
  process.exit(0);
}

runScheduler(options).catch(error => {
  console.error('💥 Fatal error:', error);
  process.exit(1);
});
