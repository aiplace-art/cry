#!/usr/bin/env node

/**
 * HypeAI Twitter Analytics Collector
 * Tracks and collects comprehensive Twitter metrics using Twitter API v2
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

class TwitterAnalytics {
  constructor() {
    this.bearerToken = process.env.TWITTER_BEARER_TOKEN;
    this.accountId = process.env.TWITTER_ACCOUNT_ID || 'HypeAI_Official';
    this.dataDir = path.join(__dirname, '../.twitter/analytics');
    this.apiBase = 'https://api.twitter.com/2';

    if (!this.bearerToken) {
      console.warn('⚠️  TWITTER_BEARER_TOKEN not set. Running in demo mode.');
    }
  }

  /**
   * Make authenticated request to Twitter API v2
   */
  async makeRequest(endpoint, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const url = `${this.apiBase}${endpoint}${queryString ? '?' + queryString : ''}`;

    return new Promise((resolve, reject) => {
      const options = {
        headers: {
          'Authorization': `Bearer ${this.bearerToken}`,
          'User-Agent': 'HypeAI-Analytics/1.0'
        }
      };

      https.get(url, options, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try {
            const parsed = JSON.parse(data);
            if (res.statusCode === 200) {
              resolve(parsed);
            } else {
              reject(new Error(`API Error: ${res.statusCode} - ${parsed.detail || data}`));
            }
          } catch (e) {
            reject(e);
          }
        });
      }).on('error', reject);
    });
  }

  /**
   * Get user profile metrics
   */
  async getUserMetrics(username = null) {
    try {
      const user = username || this.accountId;
      const data = await this.makeRequest(`/users/by/username/${user}`, {
        'user.fields': 'public_metrics,created_at,description,verified'
      });

      return {
        timestamp: new Date().toISOString(),
        username: data.data.username,
        followers: data.data.public_metrics.followers_count,
        following: data.data.public_metrics.following_count,
        tweets: data.data.public_metrics.tweet_count,
        listed: data.data.public_metrics.listed_count,
        verified: data.data.verified || false,
        accountAge: this.calculateAccountAge(data.data.created_at)
      };
    } catch (error) {
      console.error('Error fetching user metrics:', error.message);
      return this.getDemoUserMetrics();
    }
  }

  /**
   * Get recent tweets with engagement metrics
   */
  async getTweetMetrics(userId, maxResults = 100) {
    try {
      const data = await this.makeRequest(`/users/${userId}/tweets`, {
        max_results: maxResults,
        'tweet.fields': 'created_at,public_metrics,entities,referenced_tweets',
        expansions: 'referenced_tweets.id'
      });

      return data.data.map(tweet => ({
        id: tweet.id,
        text: tweet.text,
        created_at: tweet.created_at,
        likes: tweet.public_metrics.like_count,
        retweets: tweet.public_metrics.retweet_count,
        replies: tweet.public_metrics.reply_count,
        impressions: tweet.public_metrics.impression_count || 0,
        engagementRate: this.calculateEngagementRate(tweet.public_metrics),
        hashtags: this.extractHashtags(tweet),
        isReply: tweet.referenced_tweets?.some(ref => ref.type === 'replied_to'),
        isRetweet: tweet.referenced_tweets?.some(ref => ref.type === 'retweeted')
      }));
    } catch (error) {
      console.error('Error fetching tweet metrics:', error.message);
      return this.getDemoTweetMetrics();
    }
  }

  /**
   * Calculate follower growth rate
   */
  async calculateGrowthRate() {
    const metricsDir = path.join(this.dataDir, 'metrics');
    const files = fs.readdirSync(metricsDir).filter(f => f.startsWith('user-metrics-')).sort();

    if (files.length < 2) {
      return { daily: 0, weekly: 0, monthly: 0 };
    }

    const latest = JSON.parse(fs.readFileSync(path.join(metricsDir, files[files.length - 1])));
    const yesterday = files.length > 1 ? JSON.parse(fs.readFileSync(path.join(metricsDir, files[files.length - 2]))) : latest;

    const weekAgo = files.length > 7 ? JSON.parse(fs.readFileSync(path.join(metricsDir, files[files.length - 8]))) : yesterday;
    const monthAgo = files.length > 30 ? JSON.parse(fs.readFileSync(path.join(metricsDir, files[files.length - 31]))) : weekAgo;

    return {
      daily: this.calculatePercentChange(yesterday.followers, latest.followers),
      weekly: this.calculatePercentChange(weekAgo.followers, latest.followers),
      monthly: this.calculatePercentChange(monthAgo.followers, latest.followers),
      absoluteDaily: latest.followers - yesterday.followers,
      absoluteWeekly: latest.followers - weekAgo.followers,
      absoluteMonthly: latest.followers - monthAgo.followers
    };
  }

  /**
   * Analyze best performing content
   */
  analyzeTopContent(tweets, limit = 10) {
    const sorted = tweets
      .filter(t => !t.isRetweet)
      .sort((a, b) => b.engagementRate - a.engagementRate)
      .slice(0, limit);

    return {
      topTweets: sorted,
      averageEngagement: this.average(tweets.map(t => t.engagementRate)),
      bestHashtags: this.analyzeHashtags(tweets),
      contentTypes: this.categorizeContent(tweets)
    };
  }

  /**
   * Determine optimal posting times
   */
  analyzeOptimalTimes(tweets) {
    const hourlyPerformance = {};
    const dayOfWeekPerformance = {};

    tweets.forEach(tweet => {
      const date = new Date(tweet.created_at);
      const hour = date.getUTCHours();
      const dayOfWeek = date.getUTCDay();

      if (!hourlyPerformance[hour]) {
        hourlyPerformance[hour] = { count: 0, totalEngagement: 0 };
      }
      if (!dayOfWeekPerformance[dayOfWeek]) {
        dayOfWeekPerformance[dayOfWeek] = { count: 0, totalEngagement: 0 };
      }

      hourlyPerformance[hour].count++;
      hourlyPerformance[hour].totalEngagement += tweet.engagementRate;

      dayOfWeekPerformance[dayOfWeek].count++;
      dayOfWeekPerformance[dayOfWeek].totalEngagement += tweet.engagementRate;
    });

    const bestHours = Object.entries(hourlyPerformance)
      .map(([hour, data]) => ({
        hour: parseInt(hour),
        avgEngagement: data.totalEngagement / data.count,
        tweetCount: data.count
      }))
      .sort((a, b) => b.avgEngagement - a.avgEngagement)
      .slice(0, 5);

    const bestDays = Object.entries(dayOfWeekPerformance)
      .map(([day, data]) => ({
        day: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][day],
        avgEngagement: data.totalEngagement / data.count,
        tweetCount: data.count
      }))
      .sort((a, b) => b.avgEngagement - a.avgEngagement);

    return { bestHours, bestDays };
  }

  /**
   * Analyze hashtag performance
   */
  analyzeHashtags(tweets) {
    const hashtagStats = {};

    tweets.forEach(tweet => {
      tweet.hashtags.forEach(tag => {
        if (!hashtagStats[tag]) {
          hashtagStats[tag] = { count: 0, totalEngagement: 0, totalImpressions: 0 };
        }
        hashtagStats[tag].count++;
        hashtagStats[tag].totalEngagement += tweet.engagementRate;
        hashtagStats[tag].totalImpressions += tweet.impressions;
      });
    });

    return Object.entries(hashtagStats)
      .map(([tag, stats]) => ({
        hashtag: tag,
        uses: stats.count,
        avgEngagement: stats.totalEngagement / stats.count,
        totalImpressions: stats.totalImpressions,
        avgImpressionsPerUse: stats.totalImpressions / stats.count
      }))
      .sort((a, b) => b.avgEngagement - a.avgEngagement)
      .slice(0, 20);
  }

  /**
   * Track competitor metrics
   */
  async trackCompetitors(competitors = []) {
    const defaultCompetitors = [
      'SolanaAI',
      'PhantomWallet',
      'SolanaFloor',
      'MagicEden',
      'JupiterExchange'
    ];

    const competitorList = competitors.length > 0 ? competitors : defaultCompetitors;
    const results = [];

    for (const competitor of competitorList) {
      try {
        const metrics = await this.getUserMetrics(competitor);
        results.push(metrics);
      } catch (error) {
        console.error(`Failed to fetch metrics for ${competitor}:`, error.message);
      }
    }

    return results;
  }

  /**
   * Save metrics to file
   */
  saveMetrics(type, data) {
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = path.join(this.dataDir, 'metrics', `${type}-${timestamp}.json`);

    fs.writeFileSync(filename, JSON.stringify(data, null, 2));
    console.log(`✅ Saved ${type} metrics to ${filename}`);
  }

  /**
   * Run complete analytics collection
   */
  async collectAll() {
    console.log('🚀 Starting HypeAI Twitter Analytics Collection...\n');

    try {
      // Collect user metrics
      console.log('📊 Collecting user metrics...');
      const userMetrics = await this.getUserMetrics();
      this.saveMetrics('user-metrics', userMetrics);

      // Calculate growth rate
      console.log('📈 Calculating growth rates...');
      const growthRate = await this.calculateGrowthRate();
      this.saveMetrics('growth-rate', growthRate);

      // Collect tweet metrics
      console.log('🐦 Collecting tweet metrics...');
      const tweets = await this.getTweetMetrics(userMetrics.id || 'demo');
      this.saveMetrics('tweets', tweets);

      // Analyze content performance
      console.log('🎯 Analyzing content performance...');
      const topContent = this.analyzeTopContent(tweets);
      this.saveMetrics('top-content', topContent);

      // Analyze posting times
      console.log('⏰ Analyzing optimal posting times...');
      const optimalTimes = this.analyzeOptimalTimes(tweets);
      this.saveMetrics('optimal-times', optimalTimes);

      // Track competitors
      console.log('🔍 Tracking competitors...');
      const competitors = await this.trackCompetitors();
      this.saveMetrics('competitors', competitors);

      console.log('\n✅ Analytics collection complete!');

      return {
        userMetrics,
        growthRate,
        tweets: tweets.length,
        topContent,
        optimalTimes,
        competitors: competitors.length
      };
    } catch (error) {
      console.error('❌ Error during analytics collection:', error);
      throw error;
    }
  }

  // Helper methods
  calculateEngagementRate(metrics) {
    const total = metrics.like_count + metrics.retweet_count + metrics.reply_count;
    const impressions = metrics.impression_count || 1;
    return (total / impressions) * 100;
  }

  extractHashtags(tweet) {
    return tweet.entities?.hashtags?.map(h => h.tag) || [];
  }

  calculateAccountAge(createdAt) {
    const created = new Date(createdAt);
    const now = new Date();
    const days = Math.floor((now - created) / (1000 * 60 * 60 * 24));
    return { days, years: (days / 365).toFixed(1) };
  }

  calculatePercentChange(old, current) {
    return ((current - old) / old * 100).toFixed(2);
  }

  average(arr) {
    return arr.reduce((a, b) => a + b, 0) / arr.length;
  }

  categorizeContent(tweets) {
    return {
      original: tweets.filter(t => !t.isReply && !t.isRetweet).length,
      replies: tweets.filter(t => t.isReply).length,
      retweets: tweets.filter(t => t.isRetweet).length,
      withHashtags: tweets.filter(t => t.hashtags.length > 0).length,
      withMedia: tweets.filter(t => t.entities?.media?.length > 0).length
    };
  }

  // Demo data for testing without API access
  getDemoUserMetrics() {
    return {
      timestamp: new Date().toISOString(),
      username: 'HypeAI_Official',
      followers: 1250,
      following: 342,
      tweets: 89,
      listed: 15,
      verified: false,
      accountAge: { days: 45, years: 0.1 }
    };
  }

  getDemoTweetMetrics() {
    return Array.from({ length: 20 }, (_, i) => ({
      id: `demo-${i}`,
      text: `Demo tweet ${i} #HypeAI #Solana #AI`,
      created_at: new Date(Date.now() - i * 86400000).toISOString(),
      likes: Math.floor(Math.random() * 100),
      retweets: Math.floor(Math.random() * 30),
      replies: Math.floor(Math.random() * 20),
      impressions: Math.floor(Math.random() * 5000),
      engagementRate: Math.random() * 5,
      hashtags: ['HypeAI', 'Solana', 'AI'],
      isReply: Math.random() > 0.7,
      isRetweet: Math.random() > 0.8
    }));
  }
}

// CLI execution
if (require.main === module) {
  const analytics = new TwitterAnalytics();
  analytics.collectAll()
    .then(results => {
      console.log('\n📊 COLLECTION SUMMARY:');
      console.log(`   Followers: ${results.userMetrics.followers}`);
      console.log(`   Growth (daily): ${results.growthRate.daily}%`);
      console.log(`   Tweets analyzed: ${results.tweets}`);
      console.log(`   Competitors tracked: ${results.competitors}`);
    })
    .catch(error => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}

module.exports = TwitterAnalytics;
