#!/usr/bin/env node

/**
 * Threads Scheduler
 * Intelligent scheduling system with optimal timing algorithms
 * Analyzes engagement patterns and schedules posts for maximum reach
 */

require('dotenv').config({ path: require('path').join(__dirname, '../.env.marketing') });
const fs = require('fs').promises;
const path = require('path');

class ThreadsScheduler {
  constructor(options = {}) {
    this.timezone = options.timezone || 'America/New_York';
    this.targetAudience = options.targetAudience || 'crypto_enthusiasts';
    this.scheduleFile = path.join(__dirname, '../threads/schedule.json');
    this.analyticsFile = path.join(__dirname, '../../data/project-coordination/posting-history.json');

    // Optimal posting times based on Threads engagement data
    this.optimalTimes = {
      weekday: [
        { hour: 7, minute: 0, score: 0.85 },   // Morning commute
        { hour: 12, minute: 30, score: 0.90 }, // Lunch break
        { hour: 17, minute: 0, score: 0.95 },  // After work
        { hour: 20, minute: 0, score: 0.88 }   // Evening
      ],
      weekend: [
        { hour: 9, minute: 0, score: 0.82 },   // Late morning
        { hour: 14, minute: 0, score: 0.85 },  // Afternoon
        { hour: 19, minute: 0, score: 0.90 }   // Evening
      ]
    };

    // Content type timing preferences
    this.contentTypeScores = {
      educational: { morning: 0.9, afternoon: 0.85, evening: 0.75 },
      news: { morning: 0.95, afternoon: 0.80, evening: 0.70 },
      engagement: { morning: 0.70, afternoon: 0.85, evening: 0.95 },
      promotional: { morning: 0.75, afternoon: 0.90, evening: 0.85 }
    };
  }

  /**
   * Schedule a post with optimal timing
   */
  async schedulePost(content, options = {}) {
    console.log('📅 Scheduling post with optimal timing');

    const contentType = options.contentType || this.detectContentType(content);
    const priority = options.priority || 'normal';
    const earliestTime = options.earliestTime ? new Date(options.earliestTime) : new Date();

    // Find optimal time slot
    const optimalTime = await this.findOptimalTimeSlot(earliestTime, contentType, priority);

    // Create scheduled post entry
    const scheduledPost = {
      id: `sched_${Date.now()}`,
      content,
      scheduledTime: optimalTime.toISOString(),
      contentType,
      priority,
      score: optimalTime.score,
      createdAt: new Date().toISOString(),
      status: 'scheduled',
      options
    };

    // Save to schedule
    await this.addToSchedule(scheduledPost);

    console.log(`✅ Post scheduled for ${optimalTime.toLocaleString()}`);
    console.log(`   Engagement score: ${(optimalTime.score * 100).toFixed(1)}%`);

    return scheduledPost;
  }

  /**
   * Find optimal time slot for posting
   */
  async findOptimalTimeSlot(earliestTime, contentType, priority) {
    console.log('🔍 Finding optimal time slot');

    // Load existing schedule
    const schedule = await this.loadSchedule();

    // Generate candidate times
    const candidates = this.generateCandidateTimes(earliestTime, 7); // Next 7 days

    // Score each candidate
    const scoredCandidates = candidates.map(time => ({
      time,
      score: this.calculateTimeScore(time, contentType, schedule)
    }));

    // Sort by score
    scoredCandidates.sort((a, b) => b.score - a.score);

    // Apply priority boost
    if (priority === 'high') {
      // For high priority, prefer earlier times even if slightly lower score
      const earlyHighScore = scoredCandidates.filter(c =>
        c.time - earliestTime < 24 * 60 * 60 * 1000 && c.score > 0.7
      )[0];

      if (earlyHighScore) {
        return Object.assign(earlyHighScore.time, { score: earlyHighScore.score });
      }
    }

    // Return best time
    const best = scoredCandidates[0];
    return Object.assign(best.time, { score: best.score });
  }

  /**
   * Generate candidate posting times
   */
  generateCandidateTimes(startTime, days) {
    const candidates = [];
    const start = new Date(startTime);

    for (let day = 0; day < days; day++) {
      const date = new Date(start);
      date.setDate(date.getDate() + day);

      const isWeekend = date.getDay() === 0 || date.getDay() === 6;
      const times = isWeekend ? this.optimalTimes.weekend : this.optimalTimes.weekday;

      for (const time of times) {
        const candidate = new Date(date);
        candidate.setHours(time.hour, time.minute, 0, 0);

        if (candidate > start) {
          candidates.push(candidate);
        }
      }
    }

    return candidates;
  }

  /**
   * Calculate engagement score for a time slot
   */
  calculateTimeScore(time, contentType, existingSchedule) {
    // Base score from optimal times
    const isWeekend = time.getDay() === 0 || time.getDay() === 6;
    const times = isWeekend ? this.optimalTimes.weekend : this.optimalTimes.weekday;

    let baseScore = 0;
    for (const optimal of times) {
      if (time.getHours() === optimal.hour) {
        baseScore = optimal.score;
        break;
      }
    }

    if (baseScore === 0) {
      baseScore = 0.5; // Off-peak time
    }

    // Content type multiplier
    const hour = time.getHours();
    let periodScore = 1.0;

    if (contentType && this.contentTypeScores[contentType]) {
      if (hour >= 6 && hour < 12) {
        periodScore = this.contentTypeScores[contentType].morning;
      } else if (hour >= 12 && hour < 17) {
        periodScore = this.contentTypeScores[contentType].afternoon;
      } else {
        periodScore = this.contentTypeScores[contentType].evening;
      }
    }

    // Penalize if too close to other scheduled posts
    let proximityPenalty = 1.0;
    for (const post of existingSchedule) {
      const scheduledTime = new Date(post.scheduledTime);
      const diffMinutes = Math.abs(time - scheduledTime) / (1000 * 60);

      if (diffMinutes < 120) { // Within 2 hours
        proximityPenalty = Math.min(proximityPenalty, 0.7);
      } else if (diffMinutes < 240) { // Within 4 hours
        proximityPenalty = Math.min(proximityPenalty, 0.9);
      }
    }

    return baseScore * periodScore * proximityPenalty;
  }

  /**
   * Detect content type from content
   */
  detectContentType(content) {
    const lower = content.toLowerCase();

    if (lower.match(/\b(learn|guide|how to|tutorial|tip)\b/)) {
      return 'educational';
    }

    if (lower.match(/\b(breaking|announce|launch|new|update)\b/)) {
      return 'news';
    }

    if (lower.match(/\b(join|participate|comment|share|what do you)\b/)) {
      return 'engagement';
    }

    if (lower.match(/\b(buy|sale|offer|discount|limited)\b/)) {
      return 'promotional';
    }

    return 'general';
  }

  /**
   * Bulk schedule multiple posts
   */
  async bulkSchedule(posts, options = {}) {
    console.log(`📅 Bulk scheduling ${posts.length} posts`);

    const scheduled = [];
    const startTime = options.startTime ? new Date(options.startTime) : new Date();

    // Sort posts by priority
    posts.sort((a, b) => {
      const priorityOrder = { high: 0, normal: 1, low: 2 };
      return priorityOrder[a.priority || 'normal'] - priorityOrder[b.priority || 'normal'];
    });

    for (const post of posts) {
      try {
        const result = await this.schedulePost(post.content, {
          ...post.options,
          contentType: post.contentType,
          priority: post.priority,
          earliestTime: startTime
        });

        scheduled.push(result);

        // Update earliest time to avoid clustering
        const nextEarliest = new Date(result.scheduledTime);
        nextEarliest.setHours(nextEarliest.getHours() + 2);
        if (nextEarliest > startTime) {
          startTime.setTime(nextEarliest.getTime());
        }

      } catch (error) {
        console.error(`❌ Failed to schedule post:`, error.message);
      }
    }

    console.log(`✅ Scheduled ${scheduled.length}/${posts.length} posts`);
    return scheduled;
  }

  /**
   * Get posting schedule
   */
  async getSchedule(options = {}) {
    const schedule = await this.loadSchedule();

    // Filter by status
    if (options.status) {
      return schedule.filter(post => post.status === options.status);
    }

    // Filter by date range
    if (options.startDate || options.endDate) {
      return schedule.filter(post => {
        const postTime = new Date(post.scheduledTime);
        if (options.startDate && postTime < new Date(options.startDate)) return false;
        if (options.endDate && postTime > new Date(options.endDate)) return false;
        return true;
      });
    }

    return schedule;
  }

  /**
   * Reschedule a post
   */
  async reschedule(postId, newTime) {
    console.log(`📅 Rescheduling post ${postId}`);

    const schedule = await this.loadSchedule();
    const post = schedule.find(p => p.id === postId);

    if (!post) {
      throw new Error(`Post ${postId} not found in schedule`);
    }

    if (post.status !== 'scheduled') {
      throw new Error(`Cannot reschedule post with status: ${post.status}`);
    }

    post.scheduledTime = new Date(newTime).toISOString();
    post.rescheduledAt = new Date().toISOString();

    await this.saveSchedule(schedule);

    console.log(`✅ Post rescheduled to ${newTime}`);
    return post;
  }

  /**
   * Cancel scheduled post
   */
  async cancelPost(postId) {
    console.log(`❌ Cancelling post ${postId}`);

    const schedule = await this.loadSchedule();
    const post = schedule.find(p => p.id === postId);

    if (!post) {
      throw new Error(`Post ${postId} not found in schedule`);
    }

    post.status = 'cancelled';
    post.cancelledAt = new Date().toISOString();

    await this.saveSchedule(schedule);

    console.log(`✅ Post cancelled`);
    return post;
  }

  /**
   * Analyze posting performance
   */
  async analyzePerformance() {
    console.log('📊 Analyzing posting performance');

    // Load analytics data
    const analytics = await this.loadAnalytics();
    const threadsPosts = analytics.threads || [];

    // Group by time of day
    const byHour = {};
    const byDay = {};

    for (const post of threadsPosts) {
      const time = new Date(post.timestamp);
      const hour = time.getHours();
      const day = time.getDay();

      if (!byHour[hour]) byHour[hour] = { count: 0, engagement: 0 };
      if (!byDay[day]) byDay[day] = { count: 0, engagement: 0 };

      byHour[hour].count++;
      byDay[day].count++;

      // Add engagement metrics if available
      if (post.result?.insights) {
        byHour[hour].engagement += post.result.insights.total || 0;
        byDay[day].engagement += post.result.insights.total || 0;
      }
    }

    // Calculate averages
    for (const hour in byHour) {
      byHour[hour].avgEngagement = byHour[hour].engagement / byHour[hour].count;
    }

    for (const day in byDay) {
      byDay[day].avgEngagement = byDay[day].engagement / byDay[day].count;
    }

    return {
      byHour,
      byDay,
      totalPosts: threadsPosts.length,
      recommendation: this.generateRecommendations(byHour, byDay)
    };
  }

  /**
   * Generate scheduling recommendations
   */
  generateRecommendations(byHour, byDay) {
    const recommendations = [];

    // Find best performing hours
    const sortedHours = Object.entries(byHour)
      .sort((a, b) => b[1].avgEngagement - a[1].avgEngagement)
      .slice(0, 3);

    recommendations.push({
      type: 'best_hours',
      message: `Best performing hours: ${sortedHours.map(([h]) => `${h}:00`).join(', ')}`,
      hours: sortedHours.map(([h]) => parseInt(h))
    });

    // Find best performing days
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const sortedDays = Object.entries(byDay)
      .sort((a, b) => b[1].avgEngagement - a[1].avgEngagement)
      .slice(0, 3);

    recommendations.push({
      type: 'best_days',
      message: `Best performing days: ${sortedDays.map(([d]) => dayNames[d]).join(', ')}`,
      days: sortedDays.map(([d]) => parseInt(d))
    });

    return recommendations;
  }

  /**
   * Load schedule from file
   */
  async loadSchedule() {
    try {
      const data = await fs.readFile(this.scheduleFile, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      return [];
    }
  }

  /**
   * Save schedule to file
   */
  async saveSchedule(schedule) {
    await fs.writeFile(this.scheduleFile, JSON.stringify(schedule, null, 2));
  }

  /**
   * Add post to schedule
   */
  async addToSchedule(post) {
    const schedule = await this.loadSchedule();
    schedule.push(post);
    await this.saveSchedule(schedule);
  }

  /**
   * Load analytics data
   */
  async loadAnalytics() {
    try {
      const data = await fs.readFile(this.analyticsFile, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      return { threads: [] };
    }
  }
}

module.exports = ThreadsScheduler;

// CLI usage
if (require.main === module) {
  (async () => {
    const scheduler = new ThreadsScheduler();
    const command = process.argv[2];

    switch (command) {
      case 'schedule':
        const content = process.argv[3];
        const result = await scheduler.schedulePost(content);
        console.log(JSON.stringify(result, null, 2));
        break;

      case 'list':
        const schedule = await scheduler.getSchedule();
        console.log(JSON.stringify(schedule, null, 2));
        break;

      case 'analyze':
        const analysis = await scheduler.analyzePerformance();
        console.log(JSON.stringify(analysis, null, 2));
        break;

      default:
        console.log('Commands: schedule, list, analyze');
    }
  })();
}
