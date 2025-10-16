#!/usr/bin/env node

/**
 * Check Twitter API Rate Limits
 * Shows current limits, remaining requests, and reset times
 */

import dotenv from 'dotenv';
import { TwitterApi } from 'twitter-api-v2';

dotenv.config({ path: './scripts/.env.marketing' });

function formatTime(timestamp) {
  return new Date(timestamp * 1000).toLocaleString('ru-RU', {
    timeZone: 'Europe/Moscow',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
}

function formatTimeRemaining(timestamp) {
  const now = Date.now();
  const resetTime = timestamp * 1000;
  const diff = resetTime - now;

  if (diff < 0) return 'Already reset';

  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  if (hours > 0) return `${hours}h ${minutes}m ${seconds}s`;
  if (minutes > 0) return `${minutes}m ${seconds}s`;
  return `${seconds}s`;
}

async function checkRateLimits() {
  console.log('🔍 TWITTER API RATE LIMITS CHECK');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`⏰ Current Time: ${new Date().toLocaleString('ru-RU', { timeZone: 'Europe/Moscow' })}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  try {
    const client = new TwitterApi({
      appKey: process.env.TWITTER_API_KEY,
      appSecret: process.env.TWITTER_API_SECRET,
      accessToken: process.env.TWITTER_ACCESS_TOKEN,
      accessSecret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
    });

    // Try to make a simple request
    console.log('📡 Testing API connection...\n');

    try {
      const me = await client.v2.me();
      console.log('✅ API Connection: ACTIVE');
      console.log(`   Account: @${me.data.username}`);
      console.log(`   ID: ${me.data.id}\n`);
    } catch (error) {
      if (error.code === 429) {
        console.log('⚠️  API Connection: RATE LIMITED\n');

        // Parse rate limit info from headers
        if (error.rateLimit) {
          console.log('📊 Rate Limit Information:');
          console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

          console.log('App-Level Limits:');
          console.log(`   Limit:     ${error.rateLimit.limit?.toLocaleString() || 'Unknown'}`);
          console.log(`   Remaining: ${error.rateLimit.remaining?.toLocaleString() || 'Unknown'}`);
          console.log(`   Reset:     ${formatTime(error.rateLimit.reset)}`);
          console.log(`   Time Left: ${formatTimeRemaining(error.rateLimit.reset)}\n`);

          if (error.rateLimit.userDay) {
            console.log('User-Level 24-Hour Limits:');
            console.log(`   Limit:     ${error.rateLimit.userDay.limit}`);
            console.log(`   Remaining: ${error.rateLimit.userDay.remaining}`);
            console.log(`   Reset:     ${formatTime(error.rateLimit.userDay.reset)}`);
            console.log(`   Time Left: ${formatTimeRemaining(error.rateLimit.userDay.reset)}\n`);

            if (error.rateLimit.userDay.remaining === 0) {
              console.log('🚨 USER DAILY LIMIT EXHAUSTED!');
              console.log('   You have used all 24-hour requests.');
              console.log(`   Will reset at: ${formatTime(error.rateLimit.userDay.reset)}`);
              console.log(`   Time remaining: ${formatTimeRemaining(error.rateLimit.userDay.reset)}\n`);
            }
          }
        }
      } else {
        console.log('❌ API Connection: ERROR');
        console.log(`   Error: ${error.message}\n`);
      }
    }

    // Get detailed rate limit status
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📋 DETAILED RATE LIMITS BY ENDPOINT');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    try {
      const limits = await client.v1.get('application/rate_limit_status.json');

      const resources = limits.resources;

      // Important endpoints for our automation
      const importantEndpoints = {
        'Tweets (Create)': resources.statuses?.['/statuses/update'] || resources.tweets?.['/2/tweets'],
        'Tweets (Delete)': resources.statuses?.['/statuses/destroy/:id'] || resources.tweets?.['/2/tweets/:id'],
        'Timeline': resources.statuses?.['/statuses/user_timeline'] || resources.tweets?.['/2/users/:id/tweets'],
        'Search': resources.search?.['/search/tweets'] || resources.tweets?.['/2/tweets/search/recent'],
        'User Lookup': resources.users?.['/users/show/:id'] || resources.users?.['/2/users/:id'],
        'Following': resources.friends?.['/friends/ids'] || resources.users?.['/2/users/:id/following'],
        'Followers': resources.followers?.['/followers/ids'] || resources.users?.['/2/users/:id/followers'],
        'Follow': resources.friendships?.['/friendships/create'],
        'Unfollow': resources.friendships?.['/friendships/destroy'],
      };

      for (const [name, endpoint] of Object.entries(importantEndpoints)) {
        if (endpoint) {
          const remaining = endpoint.remaining;
          const limit = endpoint.limit;
          const percent = ((remaining / limit) * 100).toFixed(1);

          const status = remaining === 0 ? '🔴' :
                        remaining < limit * 0.2 ? '🟡' : '🟢';

          console.log(`${status} ${name}:`);
          console.log(`   ${remaining}/${limit} remaining (${percent}%)`);
          console.log(`   Resets: ${formatTime(endpoint.reset)}`);
          console.log(`   Time: ${formatTimeRemaining(endpoint.reset)}\n`);
        }
      }

    } catch (error) {
      console.log('⚠️  Could not fetch detailed rate limits.');
      console.log('   This might be due to rate limiting or API version.\n');
    }

  } catch (error) {
    console.error('❌ Fatal Error:', error.message);
    process.exit(1);
  }

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('💡 RECOMMENDATIONS');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  console.log('If rate limited:');
  console.log('  1. Wait for reset time (shown above)');
  console.log('  2. Reduce operation frequency');
  console.log('  3. Use smaller batch sizes');
  console.log('  4. Add longer delays between operations\n');

  console.log('Our automation already handles this:');
  console.log('  ✅ Auto-poster: 3 tweets/day (conservative)');
  console.log('  ✅ Engagement bot: Rate-limited internally');
  console.log('  ✅ Marketing specialist: 4x/day max');
  console.log('  ✅ All scripts: Exponential backoff on 429\n');

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

checkRateLimits().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
