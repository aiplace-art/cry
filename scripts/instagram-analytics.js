#!/usr/bin/env node

/**
 * Instagram Analytics Tracker
 * Track post performance, engagement metrics, and account growth
 */

import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import InstagramAPIClient from './instagram-api-client.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env.marketing') });

// ============================================================================
// CONFIGURATION
// ============================================================================

const CONFIG = {
  PATHS: {
    HISTORY: './data/project-coordination/instagram-history.json',
    ANALYTICS: './data/project-coordination/instagram-analytics.json'
  }
};

// ============================================================================
// ANALYTICS COLLECTION
// ============================================================================

async function collectPostAnalytics(client, mediaId) {
  try {
    console.log(`   📊 Collecting analytics for post ${mediaId}...`);

    const insights = await client.getMediaInsights(mediaId);

    if (!insights) {
      return null;
    }

    return {
      mediaId,
      engagement: insights.engagement || 0,
      impressions: insights.impressions || 0,
      reach: insights.reach || 0,
      saved: insights.saved || 0,
      timestamp: new Date().toISOString()
    };

  } catch (error) {
    console.error(`   ⚠️  Failed to collect analytics: ${error.message}`);
    return null;
  }
}

async function collectAccountAnalytics(client) {
  try {
    console.log('   📈 Collecting account analytics...');

    const insights = await client.getAccountInsights('day');

    if (!insights) {
      return null;
    }

    return {
      impressions: insights.impressions || 0,
      reach: insights.reach || 0,
      profileViews: insights.profile_views || 0,
      followerCount: insights.follower_count || 0,
      timestamp: new Date().toISOString()
    };

  } catch (error) {
    console.error(`   ⚠️  Failed to collect account analytics: ${error.message}`);
    return null;
  }
}

// ============================================================================
// ANALYTICS STORAGE
// ============================================================================

function loadAnalytics() {
  try {
    if (fs.existsSync(CONFIG.PATHS.ANALYTICS)) {
      return JSON.parse(fs.readFileSync(CONFIG.PATHS.ANALYTICS, 'utf8'));
    }
  } catch (error) {
    console.error('⚠️  Error loading analytics:', error.message);
  }

  return {
    posts: [],
    account: [],
    summary: {
      totalPosts: 0,
      totalEngagement: 0,
      totalImpressions: 0,
      totalReach: 0,
      averageEngagementRate: 0
    }
  };
}

function saveAnalytics(analytics) {
  try {
    const dir = path.dirname(CONFIG.PATHS.ANALYTICS);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(CONFIG.PATHS.ANALYTICS, JSON.stringify(analytics, null, 2));
    console.log('   ✅ Analytics saved');
  } catch (error) {
    console.error('⚠️  Error saving analytics:', error.message);
  }
}

function updateSummary(analytics) {
  const posts = analytics.posts;

  if (posts.length === 0) {
    return analytics.summary;
  }

  const totalEngagement = posts.reduce((sum, p) => sum + (p.engagement || 0), 0);
  const totalImpressions = posts.reduce((sum, p) => sum + (p.impressions || 0), 0);
  const totalReach = posts.reduce((sum, p) => sum + (p.reach || 0), 0);

  analytics.summary = {
    totalPosts: posts.length,
    totalEngagement,
    totalImpressions,
    totalReach,
    averageEngagementRate: totalImpressions > 0
      ? ((totalEngagement / totalImpressions) * 100).toFixed(2)
      : 0
  };

  return analytics.summary;
}

// ============================================================================
// REPORTING
// ============================================================================

function generateReport(analytics) {
  console.log('\n╔════════════════════════════════════════════════════════════════╗');
  console.log('║           📊 INSTAGRAM ANALYTICS REPORT                       ║');
  console.log('╚════════════════════════════════════════════════════════════════╝\n');

  // Summary
  const summary = analytics.summary;
  console.log('📈 OVERALL PERFORMANCE:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`   Total Posts: ${summary.totalPosts}`);
  console.log(`   Total Engagement: ${summary.totalEngagement.toLocaleString()}`);
  console.log(`   Total Impressions: ${summary.totalImpressions.toLocaleString()}`);
  console.log(`   Total Reach: ${summary.totalReach.toLocaleString()}`);
  console.log(`   Avg Engagement Rate: ${summary.averageEngagementRate}%\n`);

  // Recent posts
  if (analytics.posts.length > 0) {
    console.log('📸 RECENT POSTS (Last 5):');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    const recentPosts = analytics.posts.slice(-5).reverse();

    recentPosts.forEach((post, idx) => {
      const engagementRate = post.impressions > 0
        ? ((post.engagement / post.impressions) * 100).toFixed(2)
        : 0;

      console.log(`   ${idx + 1}. Media ID: ${post.mediaId.substring(0, 15)}...`);
      console.log(`      Engagement: ${post.engagement} | Impressions: ${post.impressions}`);
      console.log(`      Reach: ${post.reach} | Saved: ${post.saved}`);
      console.log(`      Rate: ${engagementRate}% | Posted: ${new Date(post.timestamp).toLocaleDateString()}\n`);
    });
  }

  // Account growth
  if (analytics.account.length > 0) {
    console.log('📊 ACCOUNT GROWTH:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    const latest = analytics.account[analytics.account.length - 1];
    console.log(`   Followers: ${latest.followerCount}`);
    console.log(`   Profile Views: ${latest.profileViews}`);
    console.log(`   Daily Reach: ${latest.reach}`);
    console.log(`   Daily Impressions: ${latest.impressions}`);
    console.log(`   Last Updated: ${new Date(latest.timestamp).toLocaleString()}\n`);

    // Growth trend
    if (analytics.account.length > 1) {
      const previous = analytics.account[analytics.account.length - 2];
      const followerGrowth = latest.followerCount - previous.followerCount;
      const growthSign = followerGrowth > 0 ? '📈' : followerGrowth < 0 ? '📉' : '➡️';

      console.log(`   ${growthSign} Follower Change: ${followerGrowth > 0 ? '+' : ''}${followerGrowth}\n`);
    }
  }

  // Recommendations
  console.log('💡 RECOMMENDATIONS:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  const avgEngagement = parseFloat(summary.averageEngagementRate);

  if (avgEngagement < 1) {
    console.log('   ⚠️  Low engagement rate. Consider:');
    console.log('      - More engaging captions');
    console.log('      - Better hashtag strategy');
    console.log('      - Posting at optimal times (19:00)');
  } else if (avgEngagement < 3) {
    console.log('   ✅ Good engagement rate. Keep it up!');
    console.log('      - Continue current strategy');
    console.log('      - Test new content formats');
  } else {
    console.log('   🎉 Excellent engagement rate!');
    console.log('      - Your content resonates well');
    console.log('      - Scale up posting frequency');
  }

  console.log('\n');
}

// ============================================================================
// MAIN EXECUTION
// ============================================================================

async function main(options = {}) {
  console.log('╔════════════════════════════════════════════════════════════════╗');
  console.log('║         📊 INSTAGRAM ANALYTICS TRACKER                        ║');
  console.log('╚════════════════════════════════════════════════════════════════╝\n');

  try {
    // Initialize client
    console.log('🔌 Connecting to Instagram API...');
    const client = new InstagramAPIClient();

    // Load existing analytics
    const analytics = loadAnalytics();
    console.log(`   📁 Loaded ${analytics.posts.length} post records\n`);

    // Collect account analytics
    console.log('📈 Collecting account metrics...');
    const accountData = await collectAccountAnalytics(client);

    if (accountData) {
      analytics.account.push(accountData);
      console.log('   ✅ Account analytics collected\n');
    }

    // Update recent posts (last 10 without analytics)
    console.log('📸 Updating post analytics...');

    const history = JSON.parse(fs.readFileSync(CONFIG.PATHS.HISTORY, 'utf8'));
    const recentPosts = history.posted.slice(-10);

    for (const post of recentPosts) {
      // Check if we already have analytics for this post
      const existing = analytics.posts.find(p => p.mediaId === post.instagramMediaId);

      if (!existing && post.instagramMediaId) {
        const postAnalytics = await collectPostAnalytics(client, post.instagramMediaId);

        if (postAnalytics) {
          analytics.posts.push({
            ...postAnalytics,
            contentId: post.contentId,
            category: post.category,
            postedAt: post.timestamp
          });
        }

        // Rate limit: Wait 1s between requests
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    console.log(`   ✅ Updated ${analytics.posts.length} post records\n`);

    // Update summary
    console.log('📊 Calculating summary metrics...');
    updateSummary(analytics);
    console.log('   ✅ Summary updated\n');

    // Save analytics
    saveAnalytics(analytics);

    // Generate report
    if (!options.quiet) {
      generateReport(analytics);
    }

    console.log('✅ Analytics collection complete!\n');

  } catch (error) {
    console.error(`\n💥 Fatal error: ${error.message}`);
    process.exit(1);
  }
}

// ============================================================================
// CLI
// ============================================================================

const args = process.argv.slice(2);
const options = {
  quiet: args.includes('--quiet')
};

if (args.includes('--help')) {
  console.log(`
Instagram Analytics Tracker

USAGE:
  node instagram-analytics.js          Collect and display analytics
  node instagram-analytics.js --quiet  Collect without displaying report

FEATURES:
  - Post performance tracking
  - Account growth monitoring
  - Engagement rate analysis
  - Automated recommendations

SCHEDULING:
  Run daily via cron for continuous tracking:
  0 12 * * * cd /path/to/project && node scripts/instagram-analytics.js --quiet
`);
  process.exit(0);
}

main(options).catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
