#!/usr/bin/env node

/**
 * Instagram Smart Scheduler
 * Optimal posting times and safety limits for Instagram
 *
 * Instagram Best Practices:
 * - 1-2 posts per day (vs Twitter's 2-3)
 * - Optimal times: 11:00, 14:00, 19:00 (Moscow)
 * - Stories: 3-5 per day
 * - Rate limits: 25 posts/day, 50 stories/day
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
  // Instagram-optimized schedule
  SCHEDULE: {
    morning: { hour: 11, minute: 0, days: [1, 2, 3, 4, 5, 6, 0] },    // 11:00 daily
    afternoon: { hour: 14, minute: 0, days: [1, 2, 3, 4, 5, 6, 0] },  // 14:00 daily
    evening: { hour: 19, minute: 0, days: [1, 2, 3, 4, 5, 6, 0] }     // 19:00 daily (best time)
  },

  // Instagram-specific safety limits
  LIMITS: {
    MAX_POSTS_PER_DAY: 2,        // Conservative (Instagram limit: 25)
    MAX_POSTS_PER_WEEK: 12,      // ~2/day
    MAX_POSTS_PER_MONTH: 60,     // Well under Instagram's limits
    MIN_HOURS_BETWEEN_POSTS: 6,  // Longer gap than Twitter
    MAX_RETRY_ATTEMPTS: 3,
    MAX_CONSECUTIVE_ERRORS: 3
  },

  // Time window
  WINDOW: {
    BEFORE: 5,
    AFTER: 15
  },

  // Paths
  PATHS: {
    HISTORY: './data/project-coordination/instagram-history.json',
    SCHEDULER_LOG: './data/project-coordination/instagram-scheduler-log.json',
    AUTO_POSTER: './scripts/instagram-auto-poster.js'
  }
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function getMoscowTime() {
  return new Date(new Date().toLocaleString('en-US', { timeZone: 'Europe/Moscow' }));
}

function loadHistory() {
  try {
    if (fs.existsSync(CONFIG.PATHS.HISTORY)) {
      return JSON.parse(fs.readFileSync(CONFIG.PATHS.HISTORY, 'utf8'));
    }
  } catch (error) {
    console.error('⚠️  Error loading history:', error.message);
  }
  return { posted: [], lastIndex: 0, stats: {} };
}

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

function saveSchedulerLog(log) {
  const dir = path.dirname(CONFIG.PATHS.SCHEDULER_LOG);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(CONFIG.PATHS.SCHEDULER_LOG, JSON.stringify(log, null, 2));
}

function getPostsInPeriod(history, hours) {
  if (!history.posted || history.posted.length === 0) return [];

  const now = new Date();
  const cutoff = new Date(now.getTime() - (hours * 60 * 60 * 1000));

  return history.posted.filter(post =>
    new Date(post.timestamp) > cutoff
  );
}

function isWithinScheduledWindow() {
  const now = getMoscowTime();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  const currentDay = now.getDay();

  for (const [slot, schedule] of Object.entries(CONFIG.SCHEDULE)) {
    if (!schedule.days.includes(currentDay)) continue;

    const scheduledMinutes = schedule.hour * 60 + schedule.minute;
    const currentMinutes = currentHour * 60 + currentMinute;
    const diff = currentMinutes - scheduledMinutes;

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

function checkSafetyLimits(history) {
  const issues = [];

  // Check last post time
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

function executeAutoPoster(dryRun = false) {
  if (dryRun) {
    console.log('🧪 DRY RUN: Would execute Instagram auto-poster here');
    return { success: true, dryRun: true };
  }

  try {
    console.log('🚀 Executing Instagram auto-poster...\n');

    const output = execSync(`node ${CONFIG.PATHS.AUTO_POSTER}`, {
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

function getNextScheduledTime() {
  const now = getMoscowTime();
  const times = [];

  for (const [slot, schedule] of Object.entries(CONFIG.SCHEDULE)) {
    const scheduledTime = new Date(now);
    scheduledTime.setHours(schedule.hour, schedule.minute, 0, 0);

    if (scheduledTime <= now) {
      scheduledTime.setDate(scheduledTime.getDate() + 1);
    }

    while (!schedule.days.includes(scheduledTime.getDay())) {
      scheduledTime.setDate(scheduledTime.getDate() + 1);
    }

    times.push({ slot, time: scheduledTime });
  }

  times.sort((a, b) => a.time - b.time);
  return times[0];
}

// ============================================================================
// MAIN SCHEDULER
// ============================================================================

async function runScheduler(options = {}) {
  console.log('╔════════════════════════════════════════════════════════════════╗');
  console.log('║         📸 INSTAGRAM SMART SCHEDULER v1.0                     ║');
  console.log('╚════════════════════════════════════════════════════════════════╝\n');

  const now = getMoscowTime();
  console.log(`⏰ Current Time: ${now.toLocaleString('ru-RU')}`);
  console.log(`📅 Day: ${now.toLocaleDateString('ru-RU', { weekday: 'long' })}\n`);

  // Load data
  const history = loadHistory();
  const log = loadSchedulerLog();

  // Display statistics
  console.log('📊 INSTAGRAM STATISTICS:');
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
  console.log('🚀 EXECUTING INSTAGRAM AUTO-POSTER');
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
// CLI
// ============================================================================

const args = process.argv.slice(2);
const options = {
  force: args.includes('--force'),
  dryRun: args.includes('--dry-run')
};

if (args.includes('--help') || args.includes('-h')) {
  console.log(`
Instagram Smart Scheduler - Automated posting with optimal timing

USAGE:
  node instagram-scheduler.js           Check if should post now
  node instagram-scheduler.js --force   Force post regardless of schedule
  node instagram-scheduler.js --dry-run Test without posting
  node instagram-scheduler.js --help    Show this help

SCHEDULE:
  Daily: 11:00, 14:00, 19:00 (Moscow Time)
  Best engagement: 19:00 (evening)

LIMITS:
  - Max 2 posts per day
  - Max 12 posts per week
  - Max 60 posts per month
  - Minimum 6 hours between posts
  - Stop after 3 consecutive errors
`);
  process.exit(0);
}

runScheduler(options).catch(error => {
  console.error('💥 Fatal error:', error);
  process.exit(1);
});
