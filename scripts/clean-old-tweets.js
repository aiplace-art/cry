#!/usr/bin/env node

/**
 * Clean Old Tweets - Remove CryptoOcean content
 * Keeps only the HypeAI announcement thread
 */

import dotenv from 'dotenv';
import { TwitterApi } from 'twitter-api-v2';

dotenv.config({ path: './scripts/.env.marketing' });

// Tweet ID to keep (announcement thread)
const KEEP_TWEET_ID = '1978837938155721036';

async function cleanOldTweets() {
  console.log('🧹 Cleaning old tweets...\n');

  try {
    const client = new TwitterApi({
      appKey: process.env.TWITTER_API_KEY,
      appSecret: process.env.TWITTER_API_SECRET,
      accessToken: process.env.TWITTER_ACCESS_TOKEN,
      accessSecret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
    });

    const rwClient = client.readWrite;

    // Get current user
    const currentUser = await rwClient.v2.me();
    console.log(`✅ Connected to: @${currentUser.data.username}\n`);

    // Get all user tweets
    console.log('📋 Fetching your tweets...');
    const tweets = await rwClient.v2.userTimeline(currentUser.data.id, {
      max_results: 100,
      'tweet.fields': 'created_at',
    });

    const allTweets = tweets.data.data || [];
    console.log(`📊 Found ${allTweets.length} tweets\n`);

    if (allTweets.length === 0) {
      console.log('✅ No tweets to delete!');
      return;
    }

    // Filter tweets to delete (all except announcement thread)
    const tweetsToDelete = allTweets.filter(tweet => {
      // Keep announcement thread (first tweet)
      if (tweet.id === KEEP_TWEET_ID) return false;

      // Keep tweets from thread (replies to announcement)
      // Note: Thread tweets were posted in sequence, we'll keep recent ones
      const tweetDate = new Date(tweet.created_at);
      const now = new Date();
      const hoursSincePost = (now - tweetDate) / (1000 * 60 * 60);

      // Keep tweets posted in last hour (likely part of announcement thread)
      if (hoursSincePost < 1) return false;

      return true;
    });

    console.log(`🗑️  Tweets to delete: ${tweetsToDelete.length}`);
    console.log(`✅ Tweets to keep: ${allTweets.length - tweetsToDelete.length}\n`);

    if (tweetsToDelete.length === 0) {
      console.log('✅ Nothing to delete! Profile is clean.');
      return;
    }

    // Ask for confirmation (in production, this would be automatic)
    console.log('⚠️  About to delete old CryptoOcean tweets...');
    console.log('   This will keep only the HypeAI announcement thread.\n');

    // Delete tweets one by one
    let deleted = 0;
    let errors = 0;

    for (const tweet of tweetsToDelete) {
      try {
        await rwClient.v2.deleteTweet(tweet.id);
        deleted++;
        console.log(`✅ Deleted tweet ${deleted}/${tweetsToDelete.length}: ${tweet.id}`);

        // Rate limiting: wait 1 second between deletions
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        errors++;
        console.log(`❌ Error deleting ${tweet.id}: ${error.message}`);
      }
    }

    console.log(`\n🎉 Cleanup complete!`);
    console.log(`   ✅ Deleted: ${deleted} tweets`);
    console.log(`   ❌ Errors: ${errors}`);
    console.log(`   ✅ Kept: ${allTweets.length - deleted} tweets (HypeAI thread)`);

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

// Run
cleanOldTweets();
