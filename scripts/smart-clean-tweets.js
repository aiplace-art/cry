#!/usr/bin/env node

/**
 * Smart Tweet Cleanup - Auto-runs with rate limit handling
 * Deletes old tweets in batches, waits for rate limits, continues automatically
 */

import dotenv from 'dotenv';
import { TwitterApi } from 'twitter-api-v2';

dotenv.config({ path: './scripts/.env.marketing' });

const KEEP_TWEET_ID = '1978837938155721036';
const BATCH_SIZE = 15; // Delete 15 tweets per batch
const WAIT_TIME = 15 * 60 * 1000; // 15 minutes in milliseconds
const MAX_ROUNDS = 10;

async function cleanTweetsBatch(round = 1) {
  console.log(`\n🔄 Round ${round}/${MAX_ROUNDS} - Starting cleanup...`);

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
    console.log(`✅ Connected to: @${currentUser.data.username}`);

    // Get tweets
    const tweets = await rwClient.v2.userTimeline(currentUser.data.id, {
      max_results: 100,
      'tweet.fields': 'created_at',
    });

    const allTweets = tweets.data.data || [];
    console.log(`📊 Found ${allTweets.length} tweets total`);

    // Filter tweets to delete
    const tweetsToDelete = allTweets.filter(tweet => {
      if (tweet.id === KEEP_TWEET_ID) return false;

      const tweetDate = new Date(tweet.created_at);
      const now = new Date();
      const hoursSincePost = (now - tweetDate) / (1000 * 60 * 60);

      if (hoursSincePost < 1) return false;

      return true;
    });

    if (tweetsToDelete.length === 0) {
      console.log('\n🎉 ALL DONE! No more tweets to delete!');
      console.log(`✅ Profile is clean: https://twitter.com/${currentUser.data.username}`);
      return { done: true };
    }

    // Delete only BATCH_SIZE tweets this round
    const batchToDelete = tweetsToDelete.slice(0, BATCH_SIZE);
    console.log(`\n🗑️  Deleting ${batchToDelete.length} tweets this round...`);
    console.log(`📋 ${tweetsToDelete.length - batchToDelete.length} will remain for next round`);

    let deleted = 0;
    let errors = 0;

    for (const tweet of batchToDelete) {
      try {
        await rwClient.v2.deleteTweet(tweet.id);
        deleted++;
        console.log(`✅ ${deleted}/${batchToDelete.length} - Deleted ${tweet.id}`);

        // Small delay between deletions
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        if (error.code === 429) {
          console.log(`\n⚠️  Rate limit hit after ${deleted} deletions`);
          break;
        }
        errors++;
        console.log(`❌ Error: ${tweet.id}`);
      }
    }

    console.log(`\n📊 Round ${round} Results:`);
    console.log(`   ✅ Deleted: ${deleted}`);
    console.log(`   ❌ Errors: ${errors}`);
    console.log(`   📋 Remaining: ${tweetsToDelete.length - deleted}`);

    return {
      done: false,
      deleted,
      remaining: tweetsToDelete.length - deleted,
    };

  } catch (error) {
    console.error(`\n❌ Error in round ${round}:`, error.message);
    return { done: false, error: true };
  }
}

async function autoCleanup() {
  console.log('🤖 SMART TWEET CLEANUP STARTED');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`⚙️  Batch size: ${BATCH_SIZE} tweets per round`);
  console.log(`⏱️  Wait time: ${WAIT_TIME / 60000} minutes between rounds`);
  console.log(`🔄 Max rounds: ${MAX_ROUNDS}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  let totalDeleted = 0;

  for (let round = 1; round <= MAX_ROUNDS; round++) {
    const result = await cleanTweetsBatch(round);

    if (result.done) {
      console.log('\n🎊 CLEANUP COMPLETE!');
      console.log(`📊 Total tweets deleted: ${totalDeleted}`);
      break;
    }

    if (result.deleted) {
      totalDeleted += result.deleted;
    }

    // If there are more tweets and we haven't reached max rounds
    if (!result.done && round < MAX_ROUNDS && result.remaining > 0) {
      const nextTime = new Date(Date.now() + WAIT_TIME);
      console.log(`\n⏳ Waiting ${WAIT_TIME / 60000} minutes for rate limit reset...`);
      console.log(`   Next round at: ${nextTime.toLocaleTimeString()}`);
      console.log(`   Remaining: ${result.remaining} tweets`);

      await new Promise(resolve => setTimeout(resolve, WAIT_TIME));
    }
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🎉 AUTO CLEANUP FINISHED');
  console.log(`📊 Total deleted: ${totalDeleted} tweets`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

// Run
autoCleanup().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
