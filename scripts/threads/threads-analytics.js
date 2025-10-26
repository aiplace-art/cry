#!/usr/bin/env node

/**
 * Threads Analytics Tracker
 * Unified analytics system for monitoring Threads performance
 * Tracks engagement, reach, and provides insights
 */

require('dotenv').config({ path: require('path').join(__dirname, '../.env.marketing') });
const ThreadsAPIClient = require('./threads-api-client');
const fs = require('fs').promises;
const path = require('path');

class ThreadsAnalytics {
  constructor(options = {}) {
    this.client = new ThreadsAPIClient(options);
    this.analyticsFile = path.join(__dirname, '../../data/project-coordination/threads-analytics.json');
    this.historyFile = path.join(__dirname, '../../data/project-coordination/posting-history.json');
  }

  /**
   * Initialize analytics system
   */
  async initialize() {
    console.log('📊 Initializing Threads Analytics');

    await this.client.initialize();
    this.data = await this.loadAnalytics();

    return { initialized: true, mode: this.client.mode };
  }

  /**
   * Collect metrics for all posts
   */
  async collectAllMetrics() {
    console.log('📈 Collecting metrics for all posts');

    if (this.client.mode !== 'api') {
      console.warn('⚠️  Metrics collection only available in API mode');
      return await this.collectManualMetrics();
    }

    const history = await this.loadHistory();
    const threadsPosts = history.threads || [];

    let collected = 0;
    let failed = 0;

    for (const post of threadsPosts) {
      if (!post.result?.postId) continue;

      try {
        const insights = await this.client.getPostInsights(post.result.postId);

        // Store insights
        post.insights = {
          ...insights,
          collectedAt: new Date().toISOString()
        };

        collected++;

        // Rate limiting delay
        await new Promise(resolve => setTimeout(resolve, 1000));

      } catch (error) {
        console.error(`❌ Failed to get insights for post ${post.result.postId}:`, error.message);
        failed++;
      }
    }

    // Save updated history
    await this.saveHistory(history);

    // Update analytics
    await this.updateAnalytics(threadsPosts);

    console.log(`✅ Collected metrics: ${collected} successful, ${failed} failed`);

    return { collected, failed };
  }

  /**
   * Collect manual metrics (for non-API mode)
   */
  async collectManualMetrics() {
    console.log('📋 Manual metrics collection mode');

    const instructions = {
      message: 'Metrics collection requires manual data entry',
      steps: [
        '1. Visit each Threads post in the app',
        '2. Note the engagement metrics (views, likes, replies, reposts)',
        '3. Update posting-history.json with insights data',
        '4. Run analytics update: node threads-analytics.js update'
      ],
      template: {
        insights: {
          views: 0,
          likes: 0,
          replies: 0,
          reposts: 0,
          quotes: 0
        }
      }
    };

    console.log(JSON.stringify(instructions, null, 2));
    return instructions;
  }

  /**
   * Update analytics data
   */
  async updateAnalytics(posts) {
    console.log('🔄 Updating analytics data');

    const analytics = {
      overview: this.calculateOverview(posts),
      trends: this.analyzeTrends(posts),
      topPosts: this.findTopPosts(posts, 10),
      engagementByHour: this.analyzeEngagementByHour(posts),
      engagementByDay: this.analyzeEngagementByDay(posts),
      contentTypePerformance: this.analyzeContentTypes(posts),
      lastUpdated: new Date().toISOString()
    };

    this.data = analytics;
    await this.saveAnalytics();

    return analytics;
  }

  /**
   * Calculate overview metrics
   */
  calculateOverview(posts) {
    const postsWithInsights = posts.filter(p => p.insights);

    if (postsWithInsights.length === 0) {
      return {
        totalPosts: posts.length,
        postsWithMetrics: 0,
        message: 'No metrics available yet'
      };
    }

    const totals = postsWithInsights.reduce((acc, post) => ({
      views: acc.views + (post.insights.views || 0),
      likes: acc.likes + (post.insights.likes || 0),
      replies: acc.replies + (post.insights.replies || 0),
      reposts: acc.reposts + (post.insights.reposts || 0),
      quotes: acc.quotes + (post.insights.quotes || 0)
    }), { views: 0, likes: 0, replies: 0, reposts: 0, quotes: 0 });

    return {
      totalPosts: posts.length,
      postsWithMetrics: postsWithInsights.length,
      totals,
      averages: {
        views: Math.round(totals.views / postsWithInsights.length),
        likes: Math.round(totals.likes / postsWithInsights.length),
        replies: Math.round(totals.replies / postsWithInsights.length),
        reposts: Math.round(totals.reposts / postsWithInsights.length),
        engagementRate: this.calculateEngagementRate(totals)
      }
    };
  }

  /**
   * Calculate engagement rate
   */
  calculateEngagementRate(metrics) {
    const totalEngagements = metrics.likes + metrics.replies + metrics.reposts + metrics.quotes;
    const engagementRate = (totalEngagements / metrics.views) * 100;
    return Math.round(engagementRate * 100) / 100;
  }

  /**
   * Analyze trends over time
   */
  analyzeTrends(posts) {
    const last7Days = posts.filter(p =>
      Date.now() - new Date(p.timestamp) < 7 * 24 * 60 * 60 * 1000
    );
    const prev7Days = posts.filter(p => {
      const age = Date.now() - new Date(p.timestamp);
      return age >= 7 * 24 * 60 * 60 * 1000 && age < 14 * 24 * 60 * 60 * 1000;
    });

    const currentMetrics = this.calculateOverview(last7Days);
    const previousMetrics = this.calculateOverview(prev7Days);

    const trends = {};
    for (const metric of ['views', 'likes', 'replies', 'reposts']) {
      const current = currentMetrics.averages?.[metric] || 0;
      const previous = previousMetrics.averages?.[metric] || 0;
      const change = previous > 0 ? ((current - previous) / previous) * 100 : 0;

      trends[metric] = {
        current,
        previous,
        change: Math.round(change * 10) / 10,
        trend: change > 0 ? 'up' : change < 0 ? 'down' : 'stable'
      };
    }

    return trends;
  }

  /**
   * Find top performing posts
   */
  findTopPosts(posts, limit = 10) {
    return posts
      .filter(p => p.insights)
      .map(p => ({
        content: p.content?.substring(0, 100) + '...',
        timestamp: p.timestamp,
        metrics: p.insights,
        score: this.calculatePostScore(p.insights)
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }

  /**
   * Calculate post score for ranking
   */
  calculatePostScore(insights) {
    return (
      (insights.views || 0) * 1 +
      (insights.likes || 0) * 10 +
      (insights.replies || 0) * 20 +
      (insights.reposts || 0) * 30 +
      (insights.quotes || 0) * 25
    );
  }

  /**
   * Analyze engagement by hour of day
   */
  analyzeEngagementByHour(posts) {
    const byHour = {};

    for (const post of posts.filter(p => p.insights)) {
      const hour = new Date(post.timestamp).getHours();

      if (!byHour[hour]) {
        byHour[hour] = { count: 0, totalEngagement: 0 };
      }

      byHour[hour].count++;
      byHour[hour].totalEngagement += this.calculatePostScore(post.insights);
    }

    // Calculate averages
    for (const hour in byHour) {
      byHour[hour].avgEngagement = Math.round(byHour[hour].totalEngagement / byHour[hour].count);
    }

    return byHour;
  }

  /**
   * Analyze engagement by day of week
   */
  analyzeEngagementByDay(posts) {
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const byDay = {};

    for (const post of posts.filter(p => p.insights)) {
      const day = new Date(post.timestamp).getDay();

      if (!byDay[day]) {
        byDay[day] = { name: dayNames[day], count: 0, totalEngagement: 0 };
      }

      byDay[day].count++;
      byDay[day].totalEngagement += this.calculatePostScore(post.insights);
    }

    // Calculate averages
    for (const day in byDay) {
      byDay[day].avgEngagement = Math.round(byDay[day].totalEngagement / byDay[day].count);
    }

    return byDay;
  }

  /**
   * Analyze performance by content type
   */
  analyzeContentTypes(posts) {
    const types = ['educational', 'news', 'engagement', 'promotional', 'general'];
    const byType = {};

    for (const post of posts.filter(p => p.insights)) {
      // Detect content type (simplified)
      const type = this.detectContentType(post.content) || 'general';

      if (!byType[type]) {
        byType[type] = { count: 0, totalEngagement: 0 };
      }

      byType[type].count++;
      byType[type].totalEngagement += this.calculatePostScore(post.insights);
    }

    // Calculate averages
    for (const type in byType) {
      byType[type].avgEngagement = Math.round(byType[type].totalEngagement / byType[type].count);
    }

    return byType;
  }

  /**
   * Detect content type
   */
  detectContentType(content) {
    const lower = content.toLowerCase();

    if (lower.match(/\b(learn|guide|how to|tutorial|tip)\b/)) return 'educational';
    if (lower.match(/\b(breaking|announce|launch|new|update)\b/)) return 'news';
    if (lower.match(/\b(join|participate|comment|share|what do you)\b/)) return 'engagement';
    if (lower.match(/\b(buy|sale|offer|discount|limited)\b/)) return 'promotional';

    return 'general';
  }

  /**
   * Generate analytics report
   */
  generateReport(format = 'text') {
    if (format === 'json') {
      return JSON.stringify(this.data, null, 2);
    }

    // Text format
    let report = '\n📊 THREADS ANALYTICS REPORT\n';
    report += '═'.repeat(50) + '\n\n';

    // Overview
    if (this.data.overview) {
      report += '📈 OVERVIEW\n';
      report += `Total Posts: ${this.data.overview.totalPosts}\n`;
      report += `Posts with Metrics: ${this.data.overview.postsWithMetrics}\n\n`;

      if (this.data.overview.averages) {
        report += 'Average Engagement:\n';
        report += `  Views: ${this.data.overview.averages.views}\n`;
        report += `  Likes: ${this.data.overview.averages.likes}\n`;
        report += `  Replies: ${this.data.overview.averages.replies}\n`;
        report += `  Reposts: ${this.data.overview.averages.reposts}\n`;
        report += `  Engagement Rate: ${this.data.overview.averages.engagementRate}%\n\n`;
      }
    }

    // Trends
    if (this.data.trends) {
      report += '📊 7-DAY TRENDS\n';
      for (const [metric, trend] of Object.entries(this.data.trends)) {
        const emoji = trend.trend === 'up' ? '📈' : trend.trend === 'down' ? '📉' : '➡️';
        report += `  ${emoji} ${metric}: ${trend.change > 0 ? '+' : ''}${trend.change}%\n`;
      }
      report += '\n';
    }

    // Top Posts
    if (this.data.topPosts && this.data.topPosts.length > 0) {
      report += `🏆 TOP ${this.data.topPosts.length} POSTS\n`;
      this.data.topPosts.forEach((post, i) => {
        report += `  ${i + 1}. Score: ${post.score} - ${post.content}\n`;
      });
      report += '\n';
    }

    report += `\nLast Updated: ${this.data.lastUpdated}\n`;

    return report;
  }

  /**
   * Load analytics data
   */
  async loadAnalytics() {
    try {
      const data = await fs.readFile(this.analyticsFile, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      return {};
    }
  }

  /**
   * Save analytics data
   */
  async saveAnalytics() {
    await fs.writeFile(this.analyticsFile, JSON.stringify(this.data, null, 2));
  }

  /**
   * Load posting history
   */
  async loadHistory() {
    try {
      const data = await fs.readFile(this.historyFile, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      return { threads: [] };
    }
  }

  /**
   * Save posting history
   */
  async saveHistory(history) {
    await fs.writeFile(this.historyFile, JSON.stringify(history, null, 2));
  }
}

module.exports = ThreadsAnalytics;

// CLI usage
if (require.main === module) {
  (async () => {
    const analytics = new ThreadsAnalytics();
    await analytics.initialize();

    const command = process.argv[2];

    switch (command) {
      case 'collect':
        await analytics.collectAllMetrics();
        break;

      case 'update':
        const history = await analytics.loadHistory();
        await analytics.updateAnalytics(history.threads || []);
        console.log('✅ Analytics updated');
        break;

      case 'report':
        const format = process.argv[3] || 'text';
        console.log(analytics.generateReport(format));
        break;

      default:
        console.log('Commands: collect, update, report [text|json]');
    }
  })();
}
