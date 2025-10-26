#!/usr/bin/env node

/**
 * Auto-Poster System - Automated Twitter posting from content bank
 * Posts 2-3 tweets per day on schedule with smart timing
 */

import dotenv from 'dotenv';
import { TwitterApi } from 'twitter-api-v2';
import fs from 'fs';
import PremiumImageGenerator from './twitter-media/premium-image-generator.js';
import ProfessionalImageGenerator from './twitter-media/professional-image-generator.js';

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

// Map tweet categories to premium styles
const PREMIUM_STYLE_MAP = {
  introduction: 'glassmorphism',
  features: '3DGradient',
  technical: 'neonCyberpunk',
  community: 'abstractGeo',
  launch: 'cinematic',
  education: 'glassmorphism',
  engagement: 'neonCyberpunk',
  viral: 'cinematic'
};

// Map tweet categories to BNB Chain templates (Tier 3 fallback)
const BNB_TEMPLATE_MAP = {
  technical: './scripts/twitter-media/bnb-templates/technical.png',
  features: './scripts/twitter-media/bnb-templates/features.png',
  community: './scripts/twitter-media/bnb-templates/community.png',
  education: './scripts/twitter-media/bnb-templates/education.png',
  launch: './scripts/twitter-media/bnb-templates/launch.png',
  engagement: './scripts/twitter-media/bnb-templates/engagement.png',
  viral: './scripts/twitter-media/bnb-templates/viral.png',
  introduction: './scripts/twitter-media/bnb-templates/introduction.png'
};

// Track recently used styles to keep feed diverse
let recentStyles = [];

/**
 * Select premium style intelligently (rotate to avoid repetition)
 */
function selectPremiumStyle(category) {
  const baseStyle = PREMIUM_STYLE_MAP[category] || 'glassmorphism';

  // All available styles
  const allStyles = ['glassmorphism', '3DGradient', 'neonCyberpunk', 'abstractGeo', 'cinematic'];

  // If base style wasn't used recently, use it
  if (!recentStyles.includes(baseStyle)) {
    return baseStyle;
  }

  // Otherwise, find alternative that wasn't used recently
  const availableStyles = allStyles.filter(s => !recentStyles.includes(s));

  if (availableStyles.length > 0) {
    return availableStyles[0];
  }

  // All styles used, reset and use base
  recentStyles = [];
  return baseStyle;
}

/**
 * Extract content data from tweet for image generation
 */
function extractContentData(tweetData) {
  const text = tweetData.text;

  // Try to extract title (first line or sentence)
  const firstLine = text.split('\n')[0] || text.split('.')[0] || 'HypeAI';
  const title = firstLine.length > 50 ? firstLine.substring(0, 47) + '...' : firstLine;

  // Extract subtitle (second line or category)
  const lines = text.split('\n').filter(l => l.trim());
  const subtitle = lines[1] || `${tweetData.category.charAt(0).toUpperCase() + tweetData.category.slice(1)}`;

  // Look for stats or numbers
  const numberMatch = text.match(/\$[\d,.]+[KMB]?|\d+[%+]/);
  const stats = numberMatch ? numberMatch[0] : null;

  return {
    title: title.replace(/[#@]/g, '').trim(),
    subtitle: subtitle.replace(/[#@]/g, '').trim().substring(0, 60),
    stats,
    category: tweetData.category,
    hashtags: tweetData.hashtags?.join(' ') || ''
  };
}

/**
 * Generate premium image (Tier 1)
 */
async function generatePremiumImage(tweetData, style) {
  try {
    console.log(`   ✨ Generating PREMIUM image (${style})...`);

    const generator = new PremiumImageGenerator();
    const contentData = extractContentData(tweetData);

    let buffer;
    switch (style) {
      case 'glassmorphism':
        buffer = await generator.generateGlassmorphism(contentData);
        break;
      case '3DGradient':
        buffer = await generator.generate3DGradient(contentData);
        break;
      case 'neonCyberpunk':
        buffer = await generator.generateNeonCyberpunk(contentData);
        break;
      case 'abstractGeo':
        buffer = await generator.generateAbstractGeo(contentData);
        break;
      case 'cinematic':
        buffer = await generator.generateCinematic(contentData);
        break;
      default:
        buffer = await generator.generateGlassmorphism(contentData);
    }

    // Save to cache
    const filename = `./scripts/twitter-media/premium-${tweetData.id}-${style}.png`;
    fs.writeFileSync(filename, buffer);

    console.log(`   ✅ Premium image generated: ${style}`);
    return filename;

  } catch (error) {
    console.log(`   ⚠️  Premium generation failed: ${error.message}`);
    return null;
  }
}

/**
 * Generate professional image (Tier 2)
 */
async function generateProfessionalImage(tweetData) {
  try {
    console.log(`   🎨 Generating PROFESSIONAL image...`);

    const generator = new ProfessionalImageGenerator();
    const contentData = extractContentData(tweetData);

    // Choose professional style based on category
    let buffer;
    if (tweetData.category === 'launch' || tweetData.category === 'viral') {
      buffer = await generator.generateTechGradient(contentData);
    } else if (tweetData.category === 'features') {
      buffer = await generator.generateDataViz(contentData);
    } else {
      buffer = await generator.generateMinimalist(contentData);
    }

    const filename = `./scripts/twitter-media/professional-${tweetData.id}.png`;
    fs.writeFileSync(filename, buffer);

    console.log(`   ✅ Professional image generated`);
    return filename;

  } catch (error) {
    console.log(`   ⚠️  Professional generation failed: ${error.message}`);
    return null;
  }
}

// Upload media to Twitter with 3-tier fallback system
async function uploadMedia(client, tweetData) {
  try {
    let mediaPath = null;

    // TIER 1: Premium Generator (NEW!)
    const selectedStyle = selectPremiumStyle(tweetData.category);
    mediaPath = await generatePremiumImage(tweetData, selectedStyle);

    if (mediaPath && fs.existsSync(mediaPath)) {
      // Track style usage
      recentStyles.push(selectedStyle);
      if (recentStyles.length > 3) recentStyles.shift(); // Keep last 3
      console.log(`   🌟 Using PREMIUM image (${selectedStyle})`);
    } else {
      // TIER 2: Professional Generator
      console.log(`   🔄 Trying PROFESSIONAL generator...`);
      mediaPath = await generateProfessionalImage(tweetData);
    }

    if (!mediaPath || !fs.existsSync(mediaPath)) {
      // TIER 3: BNB Chain Templates
      console.log(`   🔄 Trying BNB Chain template...`);
      const templatePath = BNB_TEMPLATE_MAP[tweetData.category];
      if (templatePath && fs.existsSync(templatePath)) {
        console.log(`   🎨 Using BNB Chain template: ${tweetData.category}`);
        mediaPath = templatePath;
      }
    }

    if (!mediaPath || !fs.existsSync(mediaPath)) {
      console.log(`   ⚠️  No media available, using default logo`);
      const defaultPath = './website/logo-icon-only.svg';
      if (fs.existsSync(defaultPath)) {
        const mediaId = await client.v1.uploadMedia(defaultPath);
        return mediaId;
      }
      return null;
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
      if (fs.existsSync(defaultPath)) {
        return await client.v1.uploadMedia(defaultPath);
      }
    } catch (fallbackError) {
      console.error(`   ⚠️  Fallback failed: ${fallbackError.message}`);
    }
    return null;
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
