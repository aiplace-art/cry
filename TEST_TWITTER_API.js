#!/usr/bin/env node

/**
 * Test Twitter API Connection
 * Quick test to verify API keys are working
 */

import dotenv from 'dotenv';
import { TwitterApi } from 'twitter-api-v2';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: './scripts/.env.marketing' });

async function testTwitterAPI() {
  console.log('🔍 Testing Twitter API Connection...\n');

  // Check if keys are present
  const requiredKeys = [
    'TWITTER_API_KEY',
    'TWITTER_API_SECRET',
    'TWITTER_ACCESS_TOKEN',
    'TWITTER_ACCESS_TOKEN_SECRET',
  ];

  let missingKeys = [];
  for (const key of requiredKeys) {
    if (!process.env[key]) {
      missingKeys.push(key);
    }
  }

  if (missingKeys.length > 0) {
    console.error('❌ Missing API keys:');
    missingKeys.forEach(key => console.error(`   - ${key}`));
    process.exit(1);
  }

  console.log('✅ All API keys found in config');

  try {
    // Initialize Twitter client
    const client = new TwitterApi({
      appKey: process.env.TWITTER_API_KEY,
      appSecret: process.env.TWITTER_API_SECRET,
      accessToken: process.env.TWITTER_ACCESS_TOKEN,
      accessSecret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
    });

    const rwClient = client.readWrite;

    console.log('✅ Twitter client initialized');

    // Test 1: Get current user
    console.log('\n📊 Test 1: Fetching account info...');
    const currentUser = await rwClient.v2.me();

    console.log(`✅ Connected to: @${currentUser.data.username}`);
    console.log(`   Name: ${currentUser.data.name}`);
    console.log(`   ID: ${currentUser.data.id}`);

    // Test 2: Get account metrics
    console.log('\n📊 Test 2: Fetching account metrics...');
    const user = await rwClient.v2.user(currentUser.data.id, {
      'user.fields': 'public_metrics'
    });

    if (user.data.public_metrics) {
      console.log(`✅ Account metrics:`);
      console.log(`   Followers: ${user.data.public_metrics.followers_count}`);
      console.log(`   Following: ${user.data.public_metrics.following_count}`);
      console.log(`   Tweets: ${user.data.public_metrics.tweet_count}`);
    }

    // Test 3: Check rate limits
    console.log('\n📊 Test 3: Checking API rate limits...');
    const rateLimits = await rwClient.v2.rateLimitStatuses();
    console.log('✅ Rate limits fetched successfully');

    console.log('\n🎉 SUCCESS! All tests passed!');
    console.log('\n✅ Your Twitter API is configured correctly!');
    console.log('✅ Ready to start posting!');

    console.log('\n🚀 Next steps:');
    console.log('   1. Update your profile (@CryptoOcean → HypeAI)');
    console.log('   2. Post your first tweet');
    console.log('   3. Start the marketing bot');

  } catch (error) {
    console.error('\n❌ Error connecting to Twitter API:');
    console.error(`   ${error.message}`);

    if (error.code === 401) {
      console.error('\n💡 Solution: Check that your API keys are correct');
    } else if (error.code === 429) {
      console.error('\n💡 Solution: Rate limit reached, wait a few minutes');
    } else {
      console.error('\n💡 Full error:', error);
    }

    process.exit(1);
  }
}

// Run test
testTwitterAPI();
