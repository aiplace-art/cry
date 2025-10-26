/**
 * HypeAI Auto-Poster Safety System
 * Comprehensive protection against over-posting and API abuse
 */

const fs = require('fs').promises;
const path = require('path');

// Safety configuration
const SAFETY_CONFIG = {
  // Rate limits
  MAX_POSTS_PER_HOUR: 1,
  MAX_POSTS_PER_DAY: 3,
  MAX_POSTS_PER_WEEK: 18,
  MAX_POSTS_PER_MONTH: 90,
  MIN_INTERVAL_HOURS: 4,

  // Buffer and warnings
  MONTHLY_WARNING_THRESHOLD: 0.8, // 80% = 72 posts
  MONTHLY_HARD_LIMIT: 0.9, // 90% = 81 posts
  BUFFER_POSTS: 9, // Reserve 9 posts for manual use

  // Error handling
  MAX_CONSECUTIVE_ERRORS: 3,
  ERROR_COOLDOWN_HOURS: 24,
  BACKOFF_MULTIPLIER: 2,
  MAX_BACKOFF_HOURS: 48,

  // Time restrictions (Moscow timezone UTC+3)
  QUIET_HOURS_START: 1, // 1am
  QUIET_HOURS_END: 6, // 6am
  WEEKEND_REDUCTION_FACTOR: 0.5,

  // Health check intervals
  HEALTH_CHECK_INTERVAL_MS: 300000, // 5 minutes
  API_TIMEOUT_MS: 10000, // 10 seconds
};

// History storage
const HISTORY_FILE = path.join(__dirname, '../data/posting-history.json');
const ERROR_LOG_FILE = path.join(__dirname, '../data/error-log.json');

class PostingSafetySystem {
  constructor() {
    this.history = null;
    this.errorLog = null;
    this.lastHealthCheck = null;
    this.isPaused = false;
    this.pauseReason = null;
  }

  /**
   * Initialize safety system
   */
  async initialize() {
    try {
      await this.loadHistory();
      await this.loadErrorLog();
      await this.performHealthCheck();
      console.log('✅ Safety system initialized');
      return true;
    } catch (error) {
      console.error('❌ Failed to initialize safety system:', error.message);
      return false;
    }
  }

  /**
   * Load posting history
   */
  async loadHistory() {
    try {
      const data = await fs.readFile(HISTORY_FILE, 'utf8');
      this.history = JSON.parse(data);
    } catch (error) {
      // Initialize empty history
      this.history = {
        posts: [],
        lastPost: null,
        monthlyCount: 0,
        weeklyCount: 0,
        dailyCount: 0,
        hourlyCount: 0,
        lastReset: {
          month: new Date().getMonth(),
          week: this.getWeekNumber(new Date()),
          day: new Date().getDate(),
          hour: new Date().getHours(),
        }
      };
      await this.saveHistory();
    }
  }

  /**
   * Load error log
   */
  async loadErrorLog() {
    try {
      const data = await fs.readFile(ERROR_LOG_FILE, 'utf8');
      this.errorLog = JSON.parse(data);
    } catch (error) {
      // Initialize empty error log
      this.errorLog = {
        errors: [],
        consecutiveErrors: 0,
        lastError: null,
        isPaused: false,
        pausedUntil: null,
      };
      await this.saveErrorLog();
    }
  }

  /**
   * Save posting history
   */
  async saveHistory() {
    const dir = path.dirname(HISTORY_FILE);
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(HISTORY_FILE, JSON.stringify(this.history, null, 2));
  }

  /**
   * Save error log
   */
  async saveErrorLog() {
    const dir = path.dirname(ERROR_LOG_FILE);
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(ERROR_LOG_FILE, JSON.stringify(this.errorLog, null, 2));
  }

  /**
   * Main safety check - can we post now?
   */
  async canPostNow() {
    try {
      // Refresh counters
      await this.refreshCounters();

      // Check 1: System paused?
      if (this.isPaused || this.errorLog.isPaused) {
        return {
          safe: false,
          reason: this.pauseReason || 'System is paused due to errors',
          nextAllowed: this.errorLog.pausedUntil || null
        };
      }

      // Check 2: Health check
      const healthCheck = await this.performHealthCheck();
      if (!healthCheck.healthy) {
        return {
          safe: false,
          reason: 'Health check failed: ' + healthCheck.issues.join(', '),
          nextAllowed: null
        };
      }

      // Check 3: Quiet hours
      const quietHours = this.isQuietHours();
      if (quietHours) {
        return {
          safe: false,
          reason: 'Quiet hours (1am-6am Moscow time)',
          nextAllowed: this.getQuietHoursEnd()
        };
      }

      // Check 4: Minimum interval since last post
      const intervalCheck = this.checkMinimumInterval();
      if (!intervalCheck.ok) {
        return {
          safe: false,
          reason: `Minimum ${SAFETY_CONFIG.MIN_INTERVAL_HOURS}h interval not met`,
          nextAllowed: intervalCheck.nextAllowed
        };
      }

      // Check 5: Hourly limit
      if (this.history.hourlyCount >= SAFETY_CONFIG.MAX_POSTS_PER_HOUR) {
        return {
          safe: false,
          reason: 'Hourly limit reached (1 post/hour)',
          nextAllowed: this.getNextHourStart()
        };
      }

      // Check 6: Daily limit
      if (this.history.dailyCount >= SAFETY_CONFIG.MAX_POSTS_PER_DAY) {
        return {
          safe: false,
          reason: 'Daily limit reached (3 posts/day)',
          nextAllowed: this.getNextDayStart()
        };
      }

      // Check 7: Weekly limit
      if (this.history.weeklyCount >= SAFETY_CONFIG.MAX_POSTS_PER_WEEK) {
        return {
          safe: false,
          reason: 'Weekly limit reached (18 posts/week)',
          nextAllowed: this.getNextWeekStart()
        };
      }

      // Check 8: Monthly limit
      const monthlyCheck = this.checkMonthlyLimit();
      if (!monthlyCheck.canPost) {
        return {
          safe: false,
          reason: monthlyCheck.reason,
          nextAllowed: this.getNextMonthStart(),
          usage: monthlyCheck.usage
        };
      }

      // All checks passed!
      return {
        safe: true,
        reason: 'All safety checks passed',
        remainingToday: SAFETY_CONFIG.MAX_POSTS_PER_DAY - this.history.dailyCount,
        remainingWeek: SAFETY_CONFIG.MAX_POSTS_PER_WEEK - this.history.weeklyCount,
        remainingMonth: SAFETY_CONFIG.MAX_POSTS_PER_MONTH - this.history.monthlyCount,
        usage: monthlyCheck.usage
      };

    } catch (error) {
      console.error('Error in canPostNow:', error);
      return {
        safe: false,
        reason: 'Safety check error: ' + error.message,
        nextAllowed: null
      };
    }
  }

  /**
   * Check monthly limits and warnings
   */
  checkMonthlyLimit() {
    const current = this.history.monthlyCount;
    const max = SAFETY_CONFIG.MAX_POSTS_PER_MONTH;
    const usage = current / max;
    const warningThreshold = max * SAFETY_CONFIG.MONTHLY_WARNING_THRESHOLD;
    const hardLimit = max * SAFETY_CONFIG.MONTHLY_HARD_LIMIT;

    // Hard limit check
    if (current >= hardLimit) {
      return {
        canPost: false,
        reason: `Monthly hard limit reached (${current}/${max} posts, 90% quota used)`,
        usage: {
          current,
          max,
          percentage: Math.round(usage * 100),
          warning: true,
          critical: true
        }
      };
    }

    // Warning threshold
    if (current >= warningThreshold) {
      console.warn(`⚠️ WARNING: ${current}/${max} posts used this month (${Math.round(usage * 100)}%)`);
    }

    return {
      canPost: true,
      usage: {
        current,
        max,
        percentage: Math.round(usage * 100),
        warning: current >= warningThreshold,
        critical: false
      }
    };
  }

  /**
   * Check minimum interval since last post
   */
  checkMinimumInterval() {
    if (!this.history.lastPost) {
      return { ok: true };
    }

    const lastPostTime = new Date(this.history.lastPost);
    const now = new Date();
    const hoursSinceLastPost = (now - lastPostTime) / (1000 * 60 * 60);
    const minInterval = SAFETY_CONFIG.MIN_INTERVAL_HOURS;

    if (hoursSinceLastPost < minInterval) {
      const nextAllowed = new Date(lastPostTime.getTime() + minInterval * 60 * 60 * 1000);
      return {
        ok: false,
        hoursSince: hoursSinceLastPost,
        minRequired: minInterval,
        nextAllowed
      };
    }

    return { ok: true };
  }

  /**
   * Check if currently in quiet hours
   */
  isQuietHours() {
    const now = new Date();
    // Convert to Moscow time (UTC+3)
    const moscowHour = (now.getUTCHours() + 3) % 24;

    return moscowHour >= SAFETY_CONFIG.QUIET_HOURS_START &&
           moscowHour < SAFETY_CONFIG.QUIET_HOURS_END;
  }

  /**
   * Get end time of quiet hours
   */
  getQuietHoursEnd() {
    const now = new Date();
    const moscowHour = (now.getUTCHours() + 3) % 24;

    if (moscowHour >= SAFETY_CONFIG.QUIET_HOURS_START &&
        moscowHour < SAFETY_CONFIG.QUIET_HOURS_END) {
      const hoursUntilEnd = SAFETY_CONFIG.QUIET_HOURS_END - moscowHour;
      return new Date(now.getTime() + hoursUntilEnd * 60 * 60 * 1000);
    }

    return null;
  }

  /**
   * Record successful post
   */
  async recordPost(postId, content) {
    const now = new Date();

    this.history.posts.push({
      id: postId,
      timestamp: now.toISOString(),
      content: content.substring(0, 100),
      success: true
    });

    this.history.lastPost = now.toISOString();
    this.history.hourlyCount++;
    this.history.dailyCount++;
    this.history.weeklyCount++;
    this.history.monthlyCount++;

    // Reset consecutive errors on success
    this.errorLog.consecutiveErrors = 0;
    await this.saveErrorLog();

    await this.saveHistory();

    console.log(`✅ Post recorded. Usage: ${this.history.dailyCount}/${SAFETY_CONFIG.MAX_POSTS_PER_DAY} today, ${this.history.monthlyCount}/${SAFETY_CONFIG.MAX_POSTS_PER_MONTH} this month`);
  }

  /**
   * Record error
   */
  async recordError(error, context = {}) {
    const now = new Date();

    const errorRecord = {
      timestamp: now.toISOString(),
      error: error.message,
      code: error.code,
      context,
      consecutiveCount: this.errorLog.consecutiveErrors + 1
    };

    this.errorLog.errors.push(errorRecord);
    this.errorLog.consecutiveErrors++;
    this.errorLog.lastError = now.toISOString();

    // Check if should pause
    if (this.errorLog.consecutiveErrors >= SAFETY_CONFIG.MAX_CONSECUTIVE_ERRORS) {
      const pauseHours = Math.min(
        SAFETY_CONFIG.ERROR_COOLDOWN_HOURS * Math.pow(SAFETY_CONFIG.BACKOFF_MULTIPLIER, this.errorLog.consecutiveErrors - SAFETY_CONFIG.MAX_CONSECUTIVE_ERRORS),
        SAFETY_CONFIG.MAX_BACKOFF_HOURS
      );

      this.errorLog.isPaused = true;
      this.errorLog.pausedUntil = new Date(now.getTime() + pauseHours * 60 * 60 * 1000).toISOString();

      console.error(`❌ SYSTEM PAUSED: ${this.errorLog.consecutiveErrors} consecutive errors. Paused for ${pauseHours}h until ${this.errorLog.pausedUntil}`);
    }

    await this.saveErrorLog();

    return {
      isPaused: this.errorLog.isPaused,
      pausedUntil: this.errorLog.pausedUntil,
      consecutiveErrors: this.errorLog.consecutiveErrors
    };
  }

  /**
   * Check if system should be paused
   */
  shouldPause() {
    if (!this.errorLog.isPaused) {
      return { paused: false };
    }

    const now = new Date();
    const pausedUntil = new Date(this.errorLog.pausedUntil);

    if (now >= pausedUntil) {
      // Pause period over
      this.errorLog.isPaused = false;
      this.errorLog.pausedUntil = null;
      this.saveErrorLog();
      return { paused: false };
    }

    return {
      paused: true,
      until: pausedUntil,
      reason: `${this.errorLog.consecutiveErrors} consecutive errors`,
      hoursRemaining: Math.ceil((pausedUntil - now) / (1000 * 60 * 60))
    };
  }

  /**
   * Perform health check
   */
  async performHealthCheck() {
    const now = new Date();
    const issues = [];

    try {
      // Check 1: History file accessible
      try {
        await fs.access(HISTORY_FILE);
      } catch (error) {
        issues.push('Cannot access history file');
      }

      // Check 2: Error log accessible
      try {
        await fs.access(ERROR_LOG_FILE);
      } catch (error) {
        issues.push('Cannot access error log');
      }

      // Check 3: Twitter credentials present
      if (!process.env.TWITTER_API_KEY || !process.env.TWITTER_API_SECRET) {
        issues.push('Twitter credentials missing');
      }

      // Check 4: Recent error rate
      const recentErrors = this.errorLog.errors.filter(e => {
        const errorTime = new Date(e.timestamp);
        const hoursSince = (now - errorTime) / (1000 * 60 * 60);
        return hoursSince < 24;
      });

      if (recentErrors.length > 10) {
        issues.push(`High error rate: ${recentErrors.length} errors in last 24h`);
      }

      this.lastHealthCheck = now;

      return {
        healthy: issues.length === 0,
        issues,
        timestamp: now.toISOString()
      };

    } catch (error) {
      return {
        healthy: false,
        issues: ['Health check failed: ' + error.message],
        timestamp: now.toISOString()
      };
    }
  }

  /**
   * Refresh time-based counters
   */
  async refreshCounters() {
    const now = new Date();
    let modified = false;

    // Reset hourly counter
    if (now.getHours() !== this.history.lastReset.hour) {
      this.history.hourlyCount = 0;
      this.history.lastReset.hour = now.getHours();
      modified = true;
    }

    // Reset daily counter
    if (now.getDate() !== this.history.lastReset.day) {
      this.history.dailyCount = 0;
      this.history.lastReset.day = now.getDate();
      modified = true;
    }

    // Reset weekly counter
    const currentWeek = this.getWeekNumber(now);
    if (currentWeek !== this.history.lastReset.week) {
      this.history.weeklyCount = 0;
      this.history.lastReset.week = currentWeek;
      modified = true;
    }

    // Reset monthly counter
    if (now.getMonth() !== this.history.lastReset.month) {
      this.history.monthlyCount = 0;
      this.history.lastReset.month = now.getMonth();
      modified = true;
    }

    if (modified) {
      await this.saveHistory();
    }
  }

  /**
   * Get week number
   */
  getWeekNumber(date) {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
  }

  /**
   * Get next allowed posting time
   */
  getNextAllowedTime() {
    const now = new Date();
    const nextTimes = [];

    // Check interval requirement
    if (this.history.lastPost) {
      const lastPostTime = new Date(this.history.lastPost);
      const nextInterval = new Date(lastPostTime.getTime() + SAFETY_CONFIG.MIN_INTERVAL_HOURS * 60 * 60 * 1000);
      if (nextInterval > now) {
        nextTimes.push(nextInterval);
      }
    }

    // Check quiet hours
    if (this.isQuietHours()) {
      const quietEnd = this.getQuietHoursEnd();
      if (quietEnd) {
        nextTimes.push(quietEnd);
      }
    }

    // Check hourly limit
    if (this.history.hourlyCount >= SAFETY_CONFIG.MAX_POSTS_PER_HOUR) {
      nextTimes.push(this.getNextHourStart());
    }

    return nextTimes.length > 0 ? new Date(Math.max(...nextTimes.map(t => t.getTime()))) : now;
  }

  /**
   * Get start of next hour
   */
  getNextHourStart() {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours() + 1, 0, 0, 0);
  }

  /**
   * Get start of next day
   */
  getNextDayStart() {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0, 0);
  }

  /**
   * Get start of next week
   */
  getNextWeekStart() {
    const now = new Date();
    const daysUntilMonday = (8 - now.getDay()) % 7 || 7;
    return new Date(now.getFullYear(), now.getMonth(), now.getDate() + daysUntilMonday, 0, 0, 0, 0);
  }

  /**
   * Get start of next month
   */
  getNextMonthStart() {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth() + 1, 1, 0, 0, 0, 0);
  }

  /**
   * Get safety status report
   */
  async getStatusReport() {
    await this.refreshCounters();
    const monthlyCheck = this.checkMonthlyLimit();
    const pauseStatus = this.shouldPause();
    const healthCheck = await this.performHealthCheck();

    return {
      timestamp: new Date().toISOString(),
      healthy: healthCheck.healthy,
      paused: pauseStatus.paused,
      pauseReason: pauseStatus.reason,
      pausedUntil: pauseStatus.until,
      usage: {
        hourly: `${this.history.hourlyCount}/${SAFETY_CONFIG.MAX_POSTS_PER_HOUR}`,
        daily: `${this.history.dailyCount}/${SAFETY_CONFIG.MAX_POSTS_PER_DAY}`,
        weekly: `${this.history.weeklyCount}/${SAFETY_CONFIG.MAX_POSTS_PER_WEEK}`,
        monthly: `${this.history.monthlyCount}/${SAFETY_CONFIG.MAX_POSTS_PER_MONTH}`,
        monthlyPercentage: monthlyCheck.usage.percentage + '%',
        warning: monthlyCheck.usage.warning,
        critical: monthlyCheck.usage.critical
      },
      lastPost: this.history.lastPost,
      consecutiveErrors: this.errorLog.consecutiveErrors,
      recentErrors: this.errorLog.errors.slice(-5),
      healthIssues: healthCheck.issues,
      nextAllowedPost: this.getNextAllowedTime().toISOString()
    };
  }

  /**
   * Manual pause/resume
   */
  async setPaused(paused, reason = null) {
    this.isPaused = paused;
    this.pauseReason = reason;

    if (paused) {
      console.log(`⏸️ System manually paused: ${reason}`);
    } else {
      console.log('▶️ System manually resumed');
    }
  }

  /**
   * Reset error counter (admin function)
   */
  async resetErrors() {
    this.errorLog.consecutiveErrors = 0;
    this.errorLog.isPaused = false;
    this.errorLog.pausedUntil = null;
    await this.saveErrorLog();
    console.log('✅ Error counter reset');
  }
}

// Export singleton instance
const safetySystem = new PostingSafetySystem();

module.exports = {
  safetySystem,
  SAFETY_CONFIG,

  // Convenience functions
  async canPostNow() {
    return await safetySystem.canPostNow();
  },

  async checkDailyLimit() {
    await safetySystem.refreshCounters();
    return {
      current: safetySystem.history.dailyCount,
      max: SAFETY_CONFIG.MAX_POSTS_PER_DAY,
      canPost: safetySystem.history.dailyCount < SAFETY_CONFIG.MAX_POSTS_PER_DAY
    };
  },

  async checkMonthlyLimit() {
    await safetySystem.refreshCounters();
    return safetySystem.checkMonthlyLimit();
  },

  async checkLastPostTime() {
    return safetySystem.checkMinimumInterval();
  },

  async getNextAllowedTime() {
    return safetySystem.getNextAllowedTime();
  },

  async recordError(error, context) {
    return await safetySystem.recordError(error, context);
  },

  async recordPost(postId, content) {
    return await safetySystem.recordPost(postId, content);
  },

  async shouldPause() {
    return safetySystem.shouldPause();
  },

  async getStatusReport() {
    return await safetySystem.getStatusReport();
  },

  async performHealthCheck() {
    return await safetySystem.performHealthCheck();
  }
};
