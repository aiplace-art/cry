#!/usr/bin/env node

/**
 * HypeAI Twitter Analytics Reporter
 * Generates comprehensive reports from collected analytics data
 */

const fs = require('fs');
const path = require('path');

class TwitterReporter {
  constructor() {
    this.dataDir = path.join(__dirname, '../.twitter/analytics');
    this.reportsDir = path.join(this.dataDir, 'reports');

    // Ensure reports directory exists
    if (!fs.existsSync(this.reportsDir)) {
      fs.mkdirSync(this.reportsDir, { recursive: true });
    }
  }

  /**
   * Load latest metrics file of a specific type
   */
  loadLatestMetrics(type) {
    const metricsDir = path.join(this.dataDir, 'metrics');

    if (!fs.existsSync(metricsDir)) {
      throw new Error('No metrics directory found. Run analytics collector first.');
    }

    const files = fs.readdirSync(metricsDir)
      .filter(f => f.startsWith(type))
      .sort()
      .reverse();

    if (files.length === 0) {
      throw new Error(`No ${type} metrics found`);
    }

    const filepath = path.join(metricsDir, files[0]);
    return JSON.parse(fs.readFileSync(filepath, 'utf8'));
  }

  /**
   * Load metrics from last N days
   */
  loadHistoricalMetrics(type, days = 7) {
    const metricsDir = path.join(this.dataDir, 'metrics');
    const cutoffDate = new Date(Date.now() - days * 86400000);

    const files = fs.readdirSync(metricsDir)
      .filter(f => f.startsWith(type))
      .filter(f => {
        const match = f.match(/\d{4}-\d{2}-\d{2}/);
        if (!match) return false;
        const fileDate = new Date(match[0]);
        return fileDate >= cutoffDate;
      })
      .sort();

    return files.map(f => {
      const filepath = path.join(metricsDir, f);
      return JSON.parse(fs.readFileSync(filepath, 'utf8'));
    });
  }

  /**
   * Generate daily performance summary
   */
  generateDailySummary() {
    console.log('📊 Generating daily summary report...');

    const userMetrics = this.loadLatestMetrics('user-metrics');
    const growthRate = this.loadLatestMetrics('growth-rate');
    const tweets = this.loadLatestMetrics('tweets');
    const topContent = this.loadLatestMetrics('top-content');

    const summary = {
      date: new Date().toISOString().split('T')[0],
      type: 'daily',
      metrics: {
        followers: userMetrics.followers,
        following: userMetrics.following,
        totalTweets: userMetrics.tweets,
        growth: {
          daily: growthRate.daily,
          dailyAbsolute: growthRate.absoluteDaily
        }
      },
      engagement: {
        averageRate: topContent.averageEngagement?.toFixed(2) || 0,
        totalTweets: tweets.length,
        topPerformer: topContent.topTweets?.[0] || null
      },
      topHashtags: topContent.bestHashtags?.slice(0, 5) || [],
      contentBreakdown: topContent.contentTypes || {}
    };

    const report = this.formatDailyReport(summary);
    this.saveReport('daily', report, summary);

    return summary;
  }

  /**
   * Generate weekly growth report
   */
  generateWeeklyReport() {
    console.log('📈 Generating weekly growth report...');

    const userHistory = this.loadHistoricalMetrics('user-metrics', 7);
    const currentMetrics = userHistory[userHistory.length - 1];
    const weekAgoMetrics = userHistory[0];

    const growthRate = this.loadLatestMetrics('growth-rate');
    const tweets = this.loadLatestMetrics('tweets');
    const optimalTimes = this.loadLatestMetrics('optimal-times');
    const topContent = this.loadLatestMetrics('top-content');

    const weeklyGrowth = {
      followers: currentMetrics.followers - weekAgoMetrics.followers,
      percentage: growthRate.weekly,
      dailyAverage: (currentMetrics.followers - weekAgoMetrics.followers) / 7
    };

    const report = {
      weekEnding: new Date().toISOString().split('T')[0],
      type: 'weekly',
      growth: weeklyGrowth,
      engagement: {
        totalTweets: tweets.length,
        averageEngagement: topContent.averageEngagement?.toFixed(2) || 0,
        topPerformers: topContent.topTweets?.slice(0, 3) || []
      },
      insights: {
        bestPostingTimes: optimalTimes.bestHours?.slice(0, 3) || [],
        bestDays: optimalTimes.bestDays?.slice(0, 3) || [],
        topHashtags: topContent.bestHashtags?.slice(0, 10) || []
      },
      followerTrend: userHistory.map(m => ({
        date: m.timestamp.split('T')[0],
        followers: m.followers
      })),
      recommendations: this.generateRecommendations(report)
    };

    const formatted = this.formatWeeklyReport(report);
    this.saveReport('weekly', formatted, report);

    return report;
  }

  /**
   * Generate content performance analysis
   */
  generateContentAnalysis() {
    console.log('🎯 Generating content performance analysis...');

    const tweets = this.loadLatestMetrics('tweets');
    const topContent = this.loadLatestMetrics('top-content');
    const optimalTimes = this.loadLatestMetrics('optimal-times');

    const analysis = {
      date: new Date().toISOString().split('T')[0],
      type: 'content-analysis',
      overview: {
        totalAnalyzed: tweets.length,
        averageEngagement: topContent.averageEngagement?.toFixed(2) || 0,
        contentTypes: topContent.contentTypes
      },
      topPerformers: {
        byEngagement: topContent.topTweets?.slice(0, 10) || [],
        byImpressions: tweets.sort((a, b) => b.impressions - a.impressions).slice(0, 10)
      },
      hashtagAnalysis: topContent.bestHashtags || [],
      timingAnalysis: {
        bestHours: optimalTimes.bestHours || [],
        bestDays: optimalTimes.bestDays || []
      },
      patterns: this.identifyContentPatterns(tweets),
      recommendations: this.generateContentRecommendations(topContent, optimalTimes)
    };

    const formatted = this.formatContentAnalysis(analysis);
    this.saveReport('content-analysis', formatted, analysis);

    return analysis;
  }

  /**
   * Generate competitor comparison report
   */
  generateCompetitorReport() {
    console.log('🔍 Generating competitor analysis...');

    const userMetrics = this.loadLatestMetrics('user-metrics');
    const competitors = this.loadLatestMetrics('competitors');

    const comparison = {
      date: new Date().toISOString().split('T')[0],
      type: 'competitor-analysis',
      hypeAI: {
        username: userMetrics.username,
        followers: userMetrics.followers,
        tweets: userMetrics.tweets,
        following: userMetrics.following
      },
      competitors: competitors.map(comp => ({
        username: comp.username,
        followers: comp.followers,
        tweets: comp.tweets,
        followersRatio: (comp.followers / userMetrics.followers).toFixed(2),
        accountAge: comp.accountAge
      })),
      rankings: {
        byFollowers: this.rankByMetric([userMetrics, ...competitors], 'followers'),
        byEngagement: this.estimateEngagement([userMetrics, ...competitors])
      },
      insights: this.generateCompetitorInsights(userMetrics, competitors)
    };

    const formatted = this.formatCompetitorReport(comparison);
    this.saveReport('competitor-analysis', formatted, comparison);

    return comparison;
  }

  /**
   * Format daily report as markdown
   */
  formatDailyReport(summary) {
    return `# HypeAI Twitter Daily Summary
## ${summary.date}

### 📊 Account Metrics
- **Followers**: ${summary.metrics.followers.toLocaleString()} (${summary.metrics.growth.daily > 0 ? '+' : ''}${summary.metrics.growth.dailyAbsolute})
- **Following**: ${summary.metrics.following.toLocaleString()}
- **Total Tweets**: ${summary.metrics.totalTweets.toLocaleString()}
- **Daily Growth**: ${summary.metrics.growth.daily}%

### 🎯 Engagement Metrics
- **Average Engagement Rate**: ${summary.engagement.averageRate}%
- **Tweets Today**: ${summary.engagement.totalTweets}

${summary.engagement.topPerformer ? `
### ⭐ Top Performing Tweet
**Engagement Rate**: ${summary.engagement.topPerformer.engagementRate?.toFixed(2)}%
- Likes: ${summary.engagement.topPerformer.likes}
- Retweets: ${summary.engagement.topPerformer.retweets}
- Replies: ${summary.engagement.topPerformer.replies}
- Impressions: ${summary.engagement.topPerformer.impressions.toLocaleString()}

\`\`\`
${summary.engagement.topPerformer.text?.substring(0, 200)}
\`\`\`
` : ''}

### 🏷️ Top Hashtags
${summary.topHashtags.slice(0, 5).map((tag, i) =>
  `${i + 1}. #${tag.hashtag} - ${tag.uses} uses, ${tag.avgEngagement.toFixed(2)}% avg engagement`
).join('\n')}

### 📝 Content Breakdown
- Original Tweets: ${summary.contentBreakdown.original || 0}
- Replies: ${summary.contentBreakdown.replies || 0}
- Retweets: ${summary.contentBreakdown.retweets || 0}
- With Hashtags: ${summary.contentBreakdown.withHashtags || 0}

---
*Generated by HypeAI Analytics System*
`;
  }

  /**
   * Format weekly report as markdown
   */
  formatWeeklyReport(report) {
    return `# HypeAI Twitter Weekly Report
## Week Ending: ${report.weekEnding}

### 📈 Weekly Growth Summary
- **New Followers**: ${report.growth.followers > 0 ? '+' : ''}${report.growth.followers}
- **Growth Rate**: ${report.growth.percentage}%
- **Daily Average**: ${report.growth.dailyAverage.toFixed(1)} followers/day

### 🎯 Engagement Performance
- **Total Tweets**: ${report.engagement.totalTweets}
- **Average Engagement Rate**: ${report.engagement.averageEngagement}%

### ⭐ Top Performing Tweets This Week
${report.engagement.topPerformers.map((tweet, i) => `
#### ${i + 1}. Tweet ID: ${tweet.id}
- **Engagement Rate**: ${tweet.engagementRate?.toFixed(2)}%
- Likes: ${tweet.likes} | Retweets: ${tweet.retweets} | Replies: ${tweet.replies}
- Impressions: ${tweet.impressions?.toLocaleString() || 'N/A'}
`).join('\n')}

### ⏰ Optimal Posting Times
**Best Hours (UTC)**:
${report.insights.bestPostingTimes.map((time, i) =>
  `${i + 1}. ${time.hour}:00 - ${time.avgEngagement.toFixed(2)}% avg engagement (${time.tweetCount} tweets)`
).join('\n')}

**Best Days**:
${report.insights.bestDays.map((day, i) =>
  `${i + 1}. ${day.day} - ${day.avgEngagement.toFixed(2)}% avg engagement`
).join('\n')}

### 🏷️ Top Performing Hashtags
${report.insights.topHashtags.slice(0, 10).map((tag, i) =>
  `${i + 1}. #${tag.hashtag} - ${tag.uses} uses, ${tag.avgEngagement.toFixed(2)}% avg engagement`
).join('\n')}

### 📊 Follower Trend
${report.followerTrend.map(day =>
  `- ${day.date}: ${day.followers.toLocaleString()} followers`
).join('\n')}

### 💡 Recommendations
${report.recommendations.map(rec => `- ${rec}`).join('\n')}

---
*Generated by HypeAI Analytics System*
`;
  }

  /**
   * Format content analysis report
   */
  formatContentAnalysis(analysis) {
    return `# HypeAI Content Performance Analysis
## ${analysis.date}

### 📊 Overview
- **Tweets Analyzed**: ${analysis.overview.totalAnalyzed}
- **Average Engagement Rate**: ${analysis.overview.averageEngagement}%
- **Content Distribution**:
  - Original: ${analysis.overview.contentTypes.original || 0}
  - Replies: ${analysis.overview.contentTypes.replies || 0}
  - Retweets: ${analysis.overview.contentTypes.retweets || 0}

### ⭐ Top Performers by Engagement
${analysis.topPerformers.byEngagement.slice(0, 5).map((tweet, i) => `
#### ${i + 1}. ${tweet.engagementRate?.toFixed(2)}% Engagement
- Likes: ${tweet.likes} | Retweets: ${tweet.retweets} | Replies: ${tweet.replies}
- Impressions: ${tweet.impressions?.toLocaleString() || 'N/A'}
- Posted: ${new Date(tweet.created_at).toLocaleString()}
`).join('\n')}

### 🏷️ Hashtag Performance Analysis
${analysis.hashtagAnalysis.slice(0, 15).map((tag, i) =>
  `${i + 1}. **#${tag.hashtag}**
   - Uses: ${tag.uses}
   - Avg Engagement: ${tag.avgEngagement.toFixed(2)}%
   - Total Impressions: ${tag.totalImpressions.toLocaleString()}
   - Avg Impressions/Use: ${tag.avgImpressionsPerUse.toFixed(0)}`
).join('\n\n')}

### ⏰ Timing Insights
**Best Hours to Post (UTC)**:
${analysis.timingAnalysis.bestHours.slice(0, 5).map((hour, i) =>
  `${i + 1}. ${hour.hour}:00 - ${hour.avgEngagement.toFixed(2)}% avg engagement`
).join('\n')}

**Best Days to Post**:
${analysis.timingAnalysis.bestDays.slice(0, 5).map((day, i) =>
  `${i + 1}. ${day.day} - ${day.avgEngagement.toFixed(2)}% avg engagement`
).join('\n')}

### 🎯 Content Patterns Identified
${analysis.patterns.map(pattern => `- ${pattern}`).join('\n')}

### 💡 Content Recommendations
${analysis.recommendations.map(rec => `- ${rec}`).join('\n')}

---
*Generated by HypeAI Analytics System*
`;
  }

  /**
   * Format competitor analysis report
   */
  formatCompetitorReport(comparison) {
    return `# HypeAI Competitor Analysis
## ${comparison.date}

### 📊 HypeAI Current Standing
- **Username**: @${comparison.hypeAI.username}
- **Followers**: ${comparison.hypeAI.followers.toLocaleString()}
- **Total Tweets**: ${comparison.hypeAI.tweets.toLocaleString()}
- **Following**: ${comparison.hypeAI.following.toLocaleString()}

### 🎯 Competitor Comparison
${comparison.competitors.map((comp, i) => `
#### ${i + 1}. @${comp.username}
- Followers: ${comp.followers.toLocaleString()} (${comp.followersRatio}x our size)
- Total Tweets: ${comp.tweets.toLocaleString()}
- Account Age: ${comp.accountAge.years} years
`).join('\n')}

### 📈 Rankings by Followers
${comparison.rankings.byFollowers.map((account, i) =>
  `${i + 1}. @${account.username} - ${account.followers.toLocaleString()} followers`
).join('\n')}

### 💡 Competitive Insights
${comparison.insights.map(insight => `- ${insight}`).join('\n')}

---
*Generated by HypeAI Analytics System*
`;
  }

  /**
   * Generate recommendations based on data
   */
  generateRecommendations(report) {
    const recommendations = [];

    if (report.growth.percentage < 1) {
      recommendations.push('⚠️ Growth rate is below 1% - consider increasing posting frequency');
    }

    if (report.insights.bestPostingTimes.length > 0) {
      const topHour = report.insights.bestPostingTimes[0];
      recommendations.push(`📅 Focus posting around ${topHour.hour}:00 UTC for maximum engagement`);
    }

    if (report.insights.topHashtags.length > 0) {
      const topTags = report.insights.topHashtags.slice(0, 3).map(t => `#${t.hashtag}`).join(', ');
      recommendations.push(`🏷️ Continue using high-performing hashtags: ${topTags}`);
    }

    if (report.engagement.averageEngagement < 2) {
      recommendations.push('🎯 Engagement rate could be improved - try more interactive content (polls, questions)');
    }

    recommendations.push('✅ Maintain consistent posting schedule for sustained growth');

    return recommendations;
  }

  /**
   * Generate content-specific recommendations
   */
  generateContentRecommendations(topContent, optimalTimes) {
    const recommendations = [];

    if (topContent.topTweets && topContent.topTweets.length > 0) {
      const topTweet = topContent.topTweets[0];
      if (topTweet.hashtags && topTweet.hashtags.length > 0) {
        recommendations.push(`🏆 Your best-performing content uses hashtags like: ${topTweet.hashtags.join(', ')}`);
      }
    }

    if (optimalTimes.bestHours && optimalTimes.bestHours.length > 0) {
      recommendations.push(`⏰ Schedule tweets between ${optimalTimes.bestHours[0].hour}:00-${optimalTimes.bestHours[2]?.hour || optimalTimes.bestHours[0].hour + 2}:00 UTC`);
    }

    recommendations.push('📸 Consider adding more visual content - tweets with images/videos typically get 2-3x more engagement');
    recommendations.push('🔗 Include clear CTAs (calls-to-action) in tweets to drive specific behaviors');
    recommendations.push('💬 Engage with replies and mentions within the first hour of posting');

    return recommendations;
  }

  /**
   * Identify content patterns
   */
  identifyContentPatterns(tweets) {
    const patterns = [];

    const hasHashtagTweets = tweets.filter(t => t.hashtags.length > 0);
    if (hasHashtagTweets.length > tweets.length * 0.5) {
      patterns.push(`${((hasHashtagTweets.length / tweets.length) * 100).toFixed(0)}% of tweets use hashtags`);
    }

    const replies = tweets.filter(t => t.isReply);
    if (replies.length > 0) {
      patterns.push(`${((replies.length / tweets.length) * 100).toFixed(0)}% of activity is replies/conversations`);
    }

    const avgEngagement = tweets.reduce((sum, t) => sum + t.engagementRate, 0) / tweets.length;
    if (avgEngagement > 3) {
      patterns.push('Above-average engagement rate indicates strong audience connection');
    }

    return patterns;
  }

  /**
   * Generate competitor insights
   */
  generateCompetitorInsights(userMetrics, competitors) {
    const insights = [];
    const avgCompetitorFollowers = competitors.reduce((sum, c) => sum + c.followers, 0) / competitors.length;

    if (userMetrics.followers < avgCompetitorFollowers * 0.5) {
      insights.push('📊 Significant growth opportunity - competitors average ' + avgCompetitorFollowers.toLocaleString() + ' followers');
    }

    const youngestCompetitor = competitors.reduce((min, c) =>
      c.accountAge.days < min.accountAge.days ? c : min
    );
    if (userMetrics.accountAge.days < youngestCompetitor.accountAge.days) {
      insights.push('🚀 HypeAI is one of the newest accounts in this space - high growth potential');
    }

    insights.push('💡 Study top competitors\' content strategies and posting schedules');
    insights.push('🤝 Consider collaboration opportunities with similar-sized accounts');

    return insights;
  }

  /**
   * Helper methods
   */
  rankByMetric(accounts, metric) {
    return accounts
      .sort((a, b) => b[metric] - a[metric])
      .map(acc => ({ username: acc.username, [metric]: acc[metric] }));
  }

  estimateEngagement(accounts) {
    return accounts.map(acc => ({
      username: acc.username,
      estimatedEngagement: ((acc.tweets / acc.accountAge.days) * 100).toFixed(2)
    })).sort((a, b) => b.estimatedEngagement - a.estimatedEngagement);
  }

  /**
   * Save report to file
   */
  saveReport(type, formattedReport, rawData) {
    const timestamp = new Date().toISOString().split('T')[0];

    // Save markdown report
    const mdPath = path.join(this.reportsDir, `${type}-${timestamp}.md`);
    fs.writeFileSync(mdPath, formattedReport);
    console.log(`✅ Saved ${type} report to ${mdPath}`);

    // Save raw JSON data
    const jsonPath = path.join(this.reportsDir, `${type}-${timestamp}.json`);
    fs.writeFileSync(jsonPath, JSON.stringify(rawData, null, 2));
    console.log(`✅ Saved ${type} data to ${jsonPath}`);
  }

  /**
   * Generate all reports
   */
  generateAllReports() {
    console.log('📊 Generating all HypeAI Twitter reports...\n');

    const results = {};

    try {
      results.daily = this.generateDailySummary();
      console.log('✅ Daily summary complete\n');
    } catch (error) {
      console.error('❌ Daily summary failed:', error.message);
    }

    try {
      results.weekly = this.generateWeeklyReport();
      console.log('✅ Weekly report complete\n');
    } catch (error) {
      console.error('❌ Weekly report failed:', error.message);
    }

    try {
      results.content = this.generateContentAnalysis();
      console.log('✅ Content analysis complete\n');
    } catch (error) {
      console.error('❌ Content analysis failed:', error.message);
    }

    try {
      results.competitors = this.generateCompetitorReport();
      console.log('✅ Competitor analysis complete\n');
    } catch (error) {
      console.error('❌ Competitor analysis failed:', error.message);
    }

    console.log('✅ All reports generated successfully!');
    return results;
  }
}

// CLI execution
if (require.main === module) {
  const args = process.argv.slice(2);
  const reporter = new TwitterReporter();

  if (args.length === 0 || args[0] === 'all') {
    reporter.generateAllReports();
  } else {
    const reportType = args[0];
    switch (reportType) {
      case 'daily':
        reporter.generateDailySummary();
        break;
      case 'weekly':
        reporter.generateWeeklyReport();
        break;
      case 'content':
        reporter.generateContentAnalysis();
        break;
      case 'competitors':
        reporter.generateCompetitorReport();
        break;
      default:
        console.error('Unknown report type. Use: daily, weekly, content, competitors, or all');
        process.exit(1);
    }
  }
}

module.exports = TwitterReporter;
