#!/usr/bin/env node

/**
 * Twitter Marketing Specialist - Professional Growth Hacker
 * Monitors hashtags, trends, competitors, and growth opportunities
 * Provides actionable marketing recommendations for rapid growth
 */

import dotenv from 'dotenv';
import { TwitterApi } from 'twitter-api-v2';
import fs from 'fs';

dotenv.config({ path: './scripts/.env.marketing' });

// Load marketing config
function loadMarketingConfig() {
  const config = fs.readFileSync('./scripts/marketing-config.json', 'utf8');
  return JSON.parse(config);
}

// Save marketing insights
function saveInsights(insights) {
  const path = './data/project-coordination/marketing-insights.json';
  fs.writeFileSync(path, JSON.stringify(insights, null, 2));
}

// Load previous insights
function loadInsights() {
  const path = './data/project-coordination/marketing-insights.json';
  if (fs.existsSync(path)) {
    return JSON.parse(fs.readFileSync(path, 'utf8'));
  }
  return { hashtags: [], influencers: [], competitors: [], trends: [], recommendations: [] };
}

/**
 * Monitor trending hashtags in crypto/Solana space
 */
async function monitorTrendingHashtags(client, config) {
  console.log('\n📊 Monitoring Trending Hashtags...\n');

  const insights = [];
  const targetHashtags = config.targetHashtags;

  for (const hashtag of targetHashtags.slice(0, 5)) { // Limit to avoid rate limits
    try {
      const tweets = await client.v2.search(hashtag, {
        max_results: 10,
        'tweet.fields': ['public_metrics', 'created_at', 'author_id'],
      });

      if (tweets.data?.data) {
        const totalEngagement = tweets.data.data.reduce((sum, tweet) => {
          return sum + (tweet.public_metrics?.like_count || 0) +
                 (tweet.public_metrics?.retweet_count || 0) +
                 (tweet.public_metrics?.reply_count || 0);
        }, 0);

        const avgEngagement = totalEngagement / tweets.data.data.length;

        insights.push({
          hashtag,
          tweetCount: tweets.data.data.length,
          avgEngagement: Math.round(avgEngagement),
          trend: avgEngagement > 50 ? 'hot' : avgEngagement > 20 ? 'warm' : 'cold',
          recommendation: avgEngagement > 50 ? 'Use immediately!' : 'Monitor'
        });

        console.log(`${hashtag}: ${Math.round(avgEngagement)} avg engagement - ${avgEngagement > 50 ? '🔥 HOT' : '📊 OK'}`);
      }

      // Rate limiting delay
      await new Promise(resolve => setTimeout(resolve, 3000));

    } catch (error) {
      if (error.code === 429) {
        console.log('⚠️  Rate limit hit, pausing hashtag monitoring...');
        break;
      }
    }
  }

  return insights;
}

/**
 * Analyze competitors
 */
async function analyzeCompetitors(client, config) {
  console.log('\n🔍 Analyzing Competitors...\n');

  const competitors = [];
  const targetAccounts = config.competitorAccounts.slice(0, 5);

  for (const username of targetAccounts) {
    try {
      const user = await client.v2.userByUsername(username, {
        'user.fields': ['public_metrics', 'description', 'created_at']
      });

      if (user.data) {
        const metrics = user.data.public_metrics;

        competitors.push({
          username: user.data.username,
          followers: metrics.followers_count,
          following: metrics.following_count,
          tweets: metrics.tweet_count,
          engagementRate: ((metrics.followers_count / metrics.tweet_count) * 100).toFixed(2),
          strategy: metrics.followers_count > 10000 ? 'Established player' : 'Growing competitor'
        });

        console.log(`@${user.data.username}: ${metrics.followers_count} followers, ${metrics.tweet_count} tweets`);
      }

      await new Promise(resolve => setTimeout(resolve, 3000));

    } catch (error) {
      if (error.code === 429) {
        console.log('⚠️  Rate limit hit, pausing competitor analysis...');
        break;
      }
    }
  }

  return competitors;
}

/**
 * Find influencers to target
 */
async function findInfluencers(client, config) {
  console.log('\n🎯 Finding Key Influencers...\n');

  const influencers = [];
  const keywords = ['#Solana', '#SolanaAI', '#DeFi'];

  try {
    // Search for high-engagement tweets in our niche
    const tweets = await client.v2.search(keywords[0], {
      max_results: 20,
      'tweet.fields': ['public_metrics', 'author_id'],
      'user.fields': ['public_metrics', 'verified']
    });

    if (tweets.data?.data && tweets.includes?.users) {
      const users = tweets.includes.users;

      for (const user of users) {
        if (user.public_metrics.followers_count > 1000 &&
            user.public_metrics.followers_count < 100000) {
          influencers.push({
            username: user.username,
            followers: user.public_metrics.followers_count,
            verified: user.verified,
            priority: user.public_metrics.followers_count > 10000 ? 'high' : 'medium',
            action: 'Follow, engage with content, tag in relevant posts'
          });

          console.log(`@${user.username}: ${user.public_metrics.followers_count} followers ${user.verified ? '✓' : ''}`);
        }
      }
    }

  } catch (error) {
    if (error.code === 429) {
      console.log('⚠️  Rate limit hit, pausing influencer search...');
    }
  }

  return influencers.slice(0, 10); // Top 10
}

/**
 * Generate growth recommendations
 */
function generateRecommendations(hashtags, competitors, influencers) {
  console.log('\n💡 Generating Growth Recommendations...\n');

  const recommendations = [];

  // Hashtag recommendations
  const hotHashtags = hashtags.filter(h => h.trend === 'hot');
  if (hotHashtags.length > 0) {
    recommendations.push({
      type: 'hashtag',
      priority: 'HIGH',
      action: `Use these trending hashtags NOW: ${hotHashtags.map(h => h.hashtag).join(', ')}`,
      expectedImpact: '+50-100 impressions per tweet'
    });
  }

  // Influencer recommendations
  if (influencers.length > 0) {
    const topInfluencers = influencers.slice(0, 5);
    recommendations.push({
      type: 'influencer',
      priority: 'HIGH',
      action: `Target these influencers: ${topInfluencers.map(i => '@' + i.username).join(', ')}`,
      tactics: [
        'Reply to their tweets with value-added comments',
        'Retweet with insightful commentary',
        'Tag them in relevant content',
        'DM for collaboration (if appropriate)'
      ],
      expectedImpact: '+10-50 followers per successful engagement'
    });
  }

  // Competitor insights
  if (competitors.length > 0) {
    const topCompetitor = competitors.sort((a, b) => b.followers - a.followers)[0];
    recommendations.push({
      type: 'competitor',
      priority: 'MEDIUM',
      action: `Study @${topCompetitor.username}'s content strategy`,
      tactics: [
        'Analyze their best-performing tweets',
        'Identify their posting schedule',
        'Engage with their community',
        'Differentiate your messaging'
      ],
      expectedImpact: 'Strategic positioning improvement'
    });
  }

  // Timing recommendations
  recommendations.push({
    type: 'timing',
    priority: 'MEDIUM',
    action: 'Post during peak crypto hours',
    bestTimes: [
      '8-10 AM EST (US morning)',
      '1-3 PM EST (EU afternoon)',
      '8-10 PM EST (Asia morning)'
    ],
    expectedImpact: '+30% engagement on average'
  });

  // Content recommendations
  recommendations.push({
    type: 'content',
    priority: 'HIGH',
    action: 'Increase viral/engagement content ratio',
    tactics: [
      'Post 1 meme/day (viral reach)',
      'Run 1 poll/week (engagement boost)',
      'Create 1 thread/week (authority building)',
      'Share 1 alpha/insight daily (value provision)'
    ],
    expectedImpact: '+100-200% engagement rate'
  });

  // Growth hacks
  recommendations.push({
    type: 'growth-hack',
    priority: 'HIGH',
    action: 'Implement rapid growth tactics',
    tactics: [
      'Quote-tweet trending Solana posts with insights',
      'Reply-guy strategy on major crypto accounts (first 5 mins)',
      'Cross-promote with Telegram (mutual growth)',
      'Run small giveaway ($50-100) for follows + retweets',
      'Create AI-generated content showcase (uniqueness)',
      'Partner with 2-3 micro-influencers (1K-10K followers)'
    ],
    expectedImpact: '+50-100 followers/week'
  });

  return recommendations;
}

/**
 * Main marketing analysis
 */
async function runMarketingAnalysis() {
  console.log('🎯 TWITTER MARKETING SPECIALIST STARTED');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`⏰ Time: ${new Date().toLocaleString('ru-RU', { timeZone: 'Europe/Moscow' })}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  try {
    const client = new TwitterApi({
      appKey: process.env.TWITTER_API_KEY,
      appSecret: process.env.TWITTER_API_SECRET,
      accessToken: process.env.TWITTER_ACCESS_TOKEN,
      accessSecret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
    });

    const config = loadMarketingConfig();
    const previousInsights = loadInsights();

    // Run all analysis
    const hashtags = await monitorTrendingHashtags(client.readOnly, config);
    const competitors = await analyzeCompetitors(client.readOnly, config);
    const influencers = await findInfluencers(client.readOnly, config);
    const recommendations = generateRecommendations(hashtags, competitors, influencers);

    // Display recommendations
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🎯 ACTIONABLE RECOMMENDATIONS:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    recommendations.forEach((rec, index) => {
      console.log(`${index + 1}. [${rec.priority}] ${rec.type.toUpperCase()}`);
      console.log(`   Action: ${rec.action}`);
      if (rec.tactics) {
        console.log(`   Tactics:`);
        rec.tactics.forEach(t => console.log(`   • ${t}`));
      }
      if (rec.bestTimes) {
        console.log(`   Best Times:`);
        rec.bestTimes.forEach(t => console.log(`   • ${t}`));
      }
      console.log(`   Expected Impact: ${rec.expectedImpact}\n`);
    });

    // Save insights
    const insights = {
      timestamp: new Date().toISOString(),
      hashtags,
      competitors,
      influencers,
      recommendations,
      previousRun: previousInsights.timestamp || null
    };

    saveInsights(insights);

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ Marketing Analysis Complete!');
    console.log(`💾 Insights saved to: data/project-coordination/marketing-insights.json`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // Print quick summary
    console.log('📊 QUICK SUMMARY:');
    console.log(`   • ${hashtags.length} hashtags analyzed`);
    console.log(`   • ${competitors.length} competitors tracked`);
    console.log(`   • ${influencers.length} influencers identified`);
    console.log(`   • ${recommendations.length} recommendations generated`);
    console.log('');
    console.log('🎯 TOP PRIORITY ACTIONS:');
    recommendations
      .filter(r => r.priority === 'HIGH')
      .forEach(r => console.log(`   • ${r.action}`));
    console.log('');

  } catch (error) {
    if (error.code === 429) {
      console.error('\n⚠️  Rate limit hit. Analysis will resume automatically next run.');
      console.error('   This is normal. The system adapts to API limits.\n');
    } else {
      console.error('\n❌ Error:', error.message);
    }
  }

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🎉 Marketing Specialist Finished');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

// Run
runMarketingAnalysis().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
