#!/usr/bin/env node

/**
 * Mention Monitor Bot - Analytics Dashboard
 *
 * Analyzes logs to provide insights:
 * - Most effective keywords
 * - Best performing groups
 * - Sentiment trends
 * - Engagement patterns
 * - Response effectiveness
 */

const fs = require('fs');
const path = require('path');

class MentionAnalytics {
  constructor(logDir = './logs') {
    this.logDir = logDir;
    this.mentions = [];
    this.interactions = [];
  }

  async loadLogs() {
    try {
      // Load mentions
      const mentionsPath = path.join(this.logDir, 'mentions.jsonl');
      if (fs.existsSync(mentionsPath)) {
        const mentionsData = fs.readFileSync(mentionsPath, 'utf8');
        this.mentions = mentionsData
          .split('\n')
          .filter(line => line.trim())
          .map(line => JSON.parse(line));
      }

      // Load interactions
      const interactionsPath = path.join(this.logDir, 'interactions.jsonl');
      if (fs.existsSync(interactionsPath)) {
        const interactionsData = fs.readFileSync(interactionsPath, 'utf8');
        this.interactions = interactionsData
          .split('\n')
          .filter(line => line.trim())
          .map(line => JSON.parse(line));
      }

      console.log(`📊 Loaded ${this.mentions.length} mentions and ${this.interactions.length} interactions\n`);
    } catch (error) {
      console.error('❌ Error loading logs:', error.message);
    }
  }

  generateReport() {
    console.log('═══════════════════════════════════════════════════════');
    console.log('📊 MENTION MONITOR BOT - ANALYTICS REPORT');
    console.log('═══════════════════════════════════════════════════════\n');

    this.showOverview();
    this.showMentionTypeBreakdown();
    this.showSentimentAnalysis();
    this.showTopGroups();
    this.showOpportunityScoreDistribution();
    this.showEngagementMetrics();
    this.showTimeAnalysis();
    this.showKeywordPerformance();
    this.showRecommendations();
  }

  showOverview() {
    console.log('📈 OVERVIEW');
    console.log('─────────────────────────────────────────────────────────');

    const totalMentions = this.mentions.length;
    const totalInteractions = this.interactions.length;
    const approved = this.interactions.filter(i => i.action === 'approved').length;
    const rejected = this.interactions.filter(i => i.action === 'rejected').length;

    const approvalRate = totalInteractions > 0
      ? ((approved / totalInteractions) * 100).toFixed(1)
      : 0;

    const responseRate = totalMentions > 0
      ? ((totalInteractions / totalMentions) * 100).toFixed(1)
      : 0;

    console.log(`Total Mentions Detected:     ${totalMentions}`);
    console.log(`Total Interactions:          ${totalInteractions}`);
    console.log(`  ├─ Approved:               ${approved} (${approvalRate}%)`);
    console.log(`  └─ Rejected:               ${rejected}`);
    console.log(`Response Rate:               ${responseRate}%`);
    console.log(`Engagement Score:            ${this.calculateEngagementScore()}/100\n`);
  }

  showMentionTypeBreakdown() {
    console.log('🎯 MENTION TYPE BREAKDOWN');
    console.log('─────────────────────────────────────────────────────────');

    const typeCounts = {};
    this.mentions.forEach(m => {
      typeCounts[m.mentionType] = (typeCounts[m.mentionType] || 0) + 1;
    });

    const total = this.mentions.length;

    Object.entries(typeCounts)
      .sort((a, b) => b[1] - a[1])
      .forEach(([type, count]) => {
        const percentage = ((count / total) * 100).toFixed(1);
        const bar = '█'.repeat(Math.round(percentage / 2));
        console.log(`${type.padEnd(12)} ${count.toString().padStart(4)} (${percentage.toString().padStart(5)}%) ${bar}`);
      });

    console.log();
  }

  showSentimentAnalysis() {
    console.log('😊 SENTIMENT ANALYSIS');
    console.log('─────────────────────────────────────────────────────────');

    const sentimentCounts = {};
    this.mentions.forEach(m => {
      sentimentCounts[m.sentiment] = (sentimentCounts[m.sentiment] || 0) + 1;
    });

    const total = this.mentions.length;

    const sentimentEmojis = {
      positive: '😊',
      neutral: '😐',
      negative: '😠'
    };

    Object.entries(sentimentCounts)
      .sort((a, b) => b[1] - a[1])
      .forEach(([sentiment, count]) => {
        const percentage = ((count / total) * 100).toFixed(1);
        const emoji = sentimentEmojis[sentiment] || '❓';
        const bar = '█'.repeat(Math.round(percentage / 2));
        console.log(`${emoji} ${sentiment.padEnd(10)} ${count.toString().padStart(4)} (${percentage.toString().padStart(5)}%) ${bar}`);
      });

    console.log();
  }

  showTopGroups() {
    console.log('🏆 TOP GROUPS BY MENTIONS');
    console.log('─────────────────────────────────────────────────────────');

    const groupCounts = {};
    this.mentions.forEach(m => {
      const group = m.chatTitle || 'Unknown';
      groupCounts[group] = (groupCounts[group] || 0) + 1;
    });

    Object.entries(groupCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .forEach(([group, count], index) => {
        console.log(`${(index + 1).toString().padStart(2)}. ${group.substring(0, 40).padEnd(40)} ${count} mentions`);
      });

    console.log();
  }

  showOpportunityScoreDistribution() {
    console.log('📊 OPPORTUNITY SCORE DISTRIBUTION');
    console.log('─────────────────────────────────────────────────────────');

    const ranges = {
      '90-100 (Excellent)': 0,
      '80-89  (High)':      0,
      '70-79  (Good)':      0,
      '60-69  (Medium)':    0,
      '50-59  (Low)':       0,
      '0-49   (Poor)':      0
    };

    this.mentions.forEach(m => {
      const score = m.opportunityScore;
      if (score >= 90) ranges['90-100 (Excellent)']++;
      else if (score >= 80) ranges['80-89  (High)']++;
      else if (score >= 70) ranges['70-79  (Good)']++;
      else if (score >= 60) ranges['60-69  (Medium)']++;
      else if (score >= 50) ranges['50-59  (Low)']++;
      else ranges['0-49   (Poor)']++;
    });

    const total = this.mentions.length;

    Object.entries(ranges).forEach(([range, count]) => {
      const percentage = total > 0 ? ((count / total) * 100).toFixed(1) : 0;
      const bar = '█'.repeat(Math.round(percentage / 2));
      console.log(`${range.padEnd(20)} ${count.toString().padStart(4)} (${percentage.toString().padStart(5)}%) ${bar}`);
    });

    // Average score
    const avgScore = total > 0
      ? (this.mentions.reduce((sum, m) => sum + m.opportunityScore, 0) / total).toFixed(1)
      : 0;
    console.log(`\nAverage Score: ${avgScore}/100`);
    console.log();
  }

  showEngagementMetrics() {
    console.log('⚡ ENGAGEMENT METRICS');
    console.log('─────────────────────────────────────────────────────────');

    const approved = this.interactions.filter(i => i.action === 'approved');
    const avgScoreApproved = approved.length > 0
      ? (approved.reduce((sum, i) => sum + (i.opportunityScore || 0), 0) / approved.length).toFixed(1)
      : 0;

    const rejected = this.interactions.filter(i => i.action === 'rejected');
    const avgScoreRejected = rejected.length > 0
      ? (rejected.reduce((sum, i) => sum + (i.opportunityScore || 0), 0) / rejected.length).toFixed(1)
      : 0;

    console.log(`Average Score (Approved):    ${avgScoreApproved}/100`);
    console.log(`Average Score (Rejected):    ${avgScoreRejected}/100`);

    const approvalThreshold = avgScoreApproved > 0 && avgScoreRejected > 0
      ? ((parseFloat(avgScoreApproved) + parseFloat(avgScoreRejected)) / 2).toFixed(1)
      : 70;

    console.log(`Suggested Approval Threshold: ${approvalThreshold}+\n`);
  }

  showTimeAnalysis() {
    console.log('🕐 TIME ANALYSIS');
    console.log('─────────────────────────────────────────────────────────');

    const hourCounts = Array(24).fill(0);

    this.mentions.forEach(m => {
      const hour = new Date(m.timestamp).getHours();
      hourCounts[hour]++;
    });

    // Find peak hours
    const maxCount = Math.max(...hourCounts);
    const peakHours = hourCounts
      .map((count, hour) => ({ hour, count }))
      .filter(h => h.count === maxCount)
      .map(h => h.hour);

    console.log('Most Active Hours (24h format):');
    hourCounts.forEach((count, hour) => {
      if (count > 0) {
        const percentage = maxCount > 0 ? (count / maxCount) * 100 : 0;
        const bar = '█'.repeat(Math.round(percentage / 5));
        const isPeak = peakHours.includes(hour);
        const marker = isPeak ? '🔥' : '  ';
        console.log(`${marker} ${hour.toString().padStart(2)}:00 ${count.toString().padStart(3)} ${bar}`);
      }
    });

    console.log(`\nPeak Hours: ${peakHours.join(', ')}:00\n`);
  }

  showKeywordPerformance() {
    console.log('🔑 KEYWORD PERFORMANCE');
    console.log('─────────────────────────────────────────────────────────');

    // Extract keywords from mentions
    const keywordMentions = {};

    this.mentions.forEach(m => {
      const text = m.text.toLowerCase();
      const keywords = [
        'hypeai', 'ai tokens', 'solana ai', 'ai agents',
        'pump.fun', '15 agents', 'autonomous agents',
        'ai meme coins', 'best ai token'
      ];

      keywords.forEach(kw => {
        if (text.includes(kw.toLowerCase())) {
          if (!keywordMentions[kw]) {
            keywordMentions[kw] = { count: 0, scores: [] };
          }
          keywordMentions[kw].count++;
          keywordMentions[kw].scores.push(m.opportunityScore);
        }
      });
    });

    // Calculate performance
    const keywordPerformance = Object.entries(keywordMentions)
      .map(([keyword, data]) => ({
        keyword,
        count: data.count,
        avgScore: (data.scores.reduce((a, b) => a + b, 0) / data.scores.length).toFixed(1)
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    console.log('Top Keywords:');
    keywordPerformance.forEach((kw, index) => {
      console.log(`${(index + 1).toString().padStart(2)}. ${kw.keyword.padEnd(20)} ${kw.count.toString().padStart(3)} mentions (avg score: ${kw.avgScore})`);
    });

    console.log();
  }

  showRecommendations() {
    console.log('💡 RECOMMENDATIONS');
    console.log('─────────────────────────────────────────────────────────');

    const recommendations = [];

    // Approval rate check
    const approved = this.interactions.filter(i => i.action === 'approved').length;
    const rejected = this.interactions.filter(i => i.action === 'rejected').length;
    const approvalRate = (approved + rejected) > 0
      ? (approved / (approved + rejected)) * 100
      : 0;

    if (approvalRate < 50) {
      recommendations.push('⚠️  Low approval rate - Consider adjusting opportunity scoring');
    } else if (approvalRate > 80) {
      recommendations.push('⚠️  Very high approval rate - May be approving too liberally');
    } else {
      recommendations.push('✅ Approval rate is healthy (50-80%)');
    }

    // Response rate check
    const responseRate = this.mentions.length > 0
      ? ((approved + rejected) / this.mentions.length) * 100
      : 0;

    if (responseRate < 20) {
      recommendations.push('⚠️  Low response rate - Consider lowering opportunity threshold');
    } else if (responseRate > 50) {
      recommendations.push('⚠️  High response rate - May be over-engaging');
    } else {
      recommendations.push('✅ Response rate is balanced (20-50%)');
    }

    // Sentiment check
    const negative = this.mentions.filter(m => m.sentiment === 'negative').length;
    const negativeRate = this.mentions.length > 0
      ? (negative / this.mentions.length) * 100
      : 0;

    if (negativeRate > 20) {
      recommendations.push('⚠️  High negative sentiment detected - Monitor brand perception');
    } else {
      recommendations.push('✅ Sentiment is mostly positive/neutral');
    }

    // Engagement score check
    const engagementScore = this.calculateEngagementScore();
    if (engagementScore < 60) {
      recommendations.push('⚠️  Low engagement score - Review response quality');
    } else if (engagementScore > 80) {
      recommendations.push('✅ Excellent engagement score!');
    } else {
      recommendations.push('✅ Good engagement score');
    }

    recommendations.forEach(rec => console.log(rec));

    console.log('\n📚 Next Steps:');
    console.log('1. Review top-performing keywords and add similar ones');
    console.log('2. Focus efforts on peak hours identified above');
    console.log('3. Engage more in top-performing groups');
    console.log('4. Refine responses based on sentiment trends');
    console.log('5. Monitor approval threshold effectiveness\n');
  }

  calculateEngagementScore() {
    const approved = this.interactions.filter(i => i.action === 'approved').length;
    const rejected = this.interactions.filter(i => i.action === 'rejected').length;
    const total = approved + rejected;

    if (total === 0 || this.mentions.length === 0) return 0;

    const approvalRate = approved / total;
    const responseRate = total / this.mentions.length;

    return Math.round((approvalRate * 50) + (responseRate * 50));
  }

  async exportReport(filename = 'mention-analytics-report.txt') {
    const reportPath = path.join(this.logDir, filename);

    // Capture console output
    const originalLog = console.log;
    let report = '';

    console.log = (...args) => {
      const line = args.join(' ');
      report += line + '\n';
      originalLog(line);
    };

    this.generateReport();

    console.log = originalLog;

    // Save report
    fs.writeFileSync(reportPath, report);
    console.log(`\n📄 Report exported to: ${reportPath}`);
  }
}

// CLI execution
if (require.main === module) {
  const analytics = new MentionAnalytics();

  (async () => {
    await analytics.loadLogs();

    if (analytics.mentions.length === 0) {
      console.log('❌ No mention logs found. Make sure the bot has been running and detecting mentions.');
      console.log('💡 Logs are stored in logs/mentions.jsonl');
      process.exit(1);
    }

    const args = process.argv.slice(2);
    const exportFlag = args.includes('--export');

    if (exportFlag) {
      await analytics.exportReport();
    } else {
      analytics.generateReport();
      console.log('💡 Tip: Run with --export to save this report to a file');
    }
  })();
}

module.exports = MentionAnalytics;
