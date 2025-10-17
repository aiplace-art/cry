#!/usr/bin/env node

/**
 * Auto-Poster System - Automated Twitter posting from content bank
 * Posts 2-3 tweets per day on schedule with smart timing
 */

import dotenv from 'dotenv';
import { TwitterApi } from 'twitter-api-v2';
import fs from 'fs';

dotenv.config({ path: './scripts/.env.marketing' });

// Posting schedule (times in 24h format, UTC+3 Moscow time)
const POSTING_SCHEDULE = {
  morning: '09:00',    // 9 AM - Good morning engagement
  afternoon: '15:00',  // 3 PM - Midday peak
  evening: '21:00'     // 9 PM - Evening peak
};

// Load content bank
function loadContentBank() {
  const content = fs.readFileSync('./scripts/twitter-content/tweets-bank.json', 'utf8');
  return JSON.parse(content);
}

// Load posting history
function loadPostingHistory() {
  const historyPath = './data/project-coordination/posting-history.json';
  if (fs.existsSync(historyPath)) {
    return JSON.parse(fs.readFileSync(historyPath, 'utf8'));
  }
  return { posted: [], lastIndex: 0 };
}

// Save posting history
function savePostingHistory(history) {
  const historyPath = './data/project-coordination/posting-history.json';
  fs.writeFileSync(historyPath, JSON.stringify(history, null, 2));
}

// Get next tweet to post
function getNextTweet(contentBank, history) {
  const tweets = contentBank.tweets;

  // Filter out already posted tweets
  const availableTweets = tweets.filter(tweet =>
    !history.posted.includes(tweet.id)
  );

  if (availableTweets.length === 0) {
    console.log('📝 All tweets posted! Resetting history...');
    history.posted = [];
    history.lastIndex = 0;
    return tweets[0];
  }

  // Get next tweet in sequence
  const nextTweet = availableTweets[0];
  return nextTweet;
}

// Format tweet with hashtags
function formatTweet(tweet) {
  let text = tweet.text;

  // Add hashtags if they fit
  const hashtagText = '\n\n' + tweet.hashtags.join(' ');
  if ((text + hashtagText).length <= 280) {
    text += hashtagText;
  }

  return text;
}

// Upload media to Twitter
async function uploadMedia(client, tweetData) {
  try {
    // Dynamic import of media generator
    const { getMediaForTweet } = await import('./media-generator.js');

    // Get AI-generated or downloaded media
    const mediaPath = await getMediaForTweet(tweetData);

    if (!mediaPath) {
      console.log(`   ⚠️  No media generated, using default logo`);
      const defaultPath = './website/logo-icon-only.svg';
      const mediaId = await client.v1.uploadMedia(defaultPath);
      return mediaId;
    }

    console.log(`   📷 Uploading media: ${mediaPath}`);

    const mediaId = await client.v1.uploadMedia(mediaPath);

    console.log(`   ✅ Media uploaded: ${mediaId}`);
    return mediaId;
  } catch (error) {
    console.error(`   ⚠️  Media upload failed: ${error.message}`);
    // Fallback to logo (OFFICIAL LOGO - see docs/OFFICIAL_LOGO_PATH.md)
    try {
      const defaultPath = './website/logo-icon-only.svg';
      return await client.v1.uploadMedia(defaultPath);
    } catch (fallbackError) {
      return null;
    }
  }
}

// Post tweet
async function postTweet(client, tweetData) {
  try {
    const rwClient = client.readWrite;

    const tweetText = formatTweet(tweetData);
    console.log(`\n📤 Posting tweet #${tweetData.id}:`);
    console.log(`Category: ${tweetData.category}`);
    console.log(`Text: ${tweetText.substring(0, 100)}...`);

    // Upload media with tweet context
    const mediaId = await uploadMedia(client, tweetData);

    // Build tweet payload
    const tweetPayload = { text: tweetText };

    if (mediaId) {
      tweetPayload.media = { media_ids: [mediaId] };
      console.log(`   🖼️  Media attached to tweet`);
    }

    const result = await rwClient.v2.tweet(tweetPayload);

    console.log(`✅ Posted successfully!`);
    console.log(`   Tweet ID: ${result.data.id}`);
    console.log(`   URL: https://twitter.com/HypeAIProject/status/${result.data.id}`);

    return {
      success: true,
      tweetId: result.data.id,
      url: `https://twitter.com/HypeAIProject/status/${result.data.id}`
    };

  } catch (error) {
    console.error(`❌ Error posting tweet:`, error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

// Main posting function
async function autoPost() {
  console.log('🤖 AUTO-POSTER STARTED');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`⏰ Time: ${new Date().toLocaleString('ru-RU', { timeZone: 'Europe/Moscow' })}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  try {
    // Initialize Twitter client
    const client = new TwitterApi({
      appKey: process.env.TWITTER_API_KEY,
      appSecret: process.env.TWITTER_API_SECRET,
      accessToken: process.env.TWITTER_ACCESS_TOKEN,
      accessSecret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
    });

    // Load content and history
    const contentBank = loadContentBank();
    const history = loadPostingHistory();

    console.log(`📊 Content Bank Status:`);
    console.log(`   Total tweets: ${contentBank.meta.total_tweets}`);
    console.log(`   Posted: ${history.posted.length}`);
    console.log(`   Remaining: ${contentBank.meta.total_tweets - history.posted.length}\n`);

    // Get next tweet
    const nextTweet = getNextTweet(contentBank, history);

    // Post tweet
    const result = await postTweet(client, nextTweet);

    if (result.success) {
      // Update history
      history.posted.push(nextTweet.id);
      history.lastIndex = nextTweet.id;
      history.lastPosted = {
        tweetId: result.tweetId,
        contentId: nextTweet.id,
        category: nextTweet.category,
        timestamp: new Date().toISOString(),
        url: result.url
      };
      savePostingHistory(history);

      console.log(`\n✅ SUCCESS!`);
      console.log(`   Progress: ${history.posted.length}/${contentBank.meta.total_tweets}`);
      console.log(`   Next tweet in queue: #${contentBank.tweets.find(t => !history.posted.includes(t.id))?.id || 'Reset needed'}`);
    }

  } catch (error) {
    if (error.code === 429) {
      console.error('\n⚠️  Rate limit hit. Try again in 15-30 minutes.');
    } else {
      console.error('\n❌ Fatal error:', error.message);
    }
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🎉 AUTO-POSTER FINISHED');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

// Run
autoPost().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
