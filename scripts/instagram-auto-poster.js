#!/usr/bin/env node

/**
 * Instagram Auto-Poster
 * Automated Instagram posting with premium image generation
 * Integrated with Twitter content bank
 */

import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import InstagramAPIClient from './instagram-api-client.js';
import InstagramContentAdapter from './instagram-content-adapter.js';
import PremiumImageGenerator from './twitter-media/premium-image-generator.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env.marketing') });

// ============================================================================
// CONFIGURATION
// ============================================================================

const CONFIG = {
  PATHS: {
    TWITTER_CONTENT: './scripts/twitter-content/tweets-bank.json',
    INSTAGRAM_HISTORY: './data/project-coordination/instagram-history.json',
    IMAGE_CACHE: './scripts/twitter-media/'
  },
  IMAGE: {
    UPLOAD_METHOD: 'url', // 'url' or 'local'
    TEMP_URL_BASE: process.env.TEMP_IMAGE_HOST || 'https://your-cdn.com/temp/',
    QUALITY: 0.95
  }
};

// ============================================================================
// HISTORY MANAGEMENT
// ============================================================================

function loadHistory() {
  try {
    if (fs.existsSync(CONFIG.PATHS.INSTAGRAM_HISTORY)) {
      return JSON.parse(fs.readFileSync(CONFIG.PATHS.INSTAGRAM_HISTORY, 'utf8'));
    }
  } catch (error) {
    console.error('⚠️  Error loading history:', error.message);
  }

  return {
    posted: [],
    lastIndex: 0,
    stats: {
      totalPosts: 0,
      successfulPosts: 0,
      failedPosts: 0
    }
  };
}

function saveHistory(history) {
  try {
    const dir = path.dirname(CONFIG.PATHS.INSTAGRAM_HISTORY);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(CONFIG.PATHS.INSTAGRAM_HISTORY, JSON.stringify(history, null, 2));
  } catch (error) {
    console.error('⚠️  Error saving history:', error.message);
  }
}

// ============================================================================
// CONTENT MANAGEMENT
// ============================================================================

function loadTwitterContent() {
  try {
    const content = fs.readFileSync(CONFIG.PATHS.TWITTER_CONTENT, 'utf8');
    return JSON.parse(content);
  } catch (error) {
    console.error('❌ Failed to load Twitter content:', error.message);
    process.exit(1);
  }
}

function getNextContent(contentBank, history) {
  const tweets = contentBank.tweets;

  // Filter out already posted
  const available = tweets.filter(tweet =>
    !history.posted.some(p => p.contentId === tweet.id)
  );

  if (available.length === 0) {
    console.log('📝 All content posted! Resetting history...');
    history.posted = [];
    history.lastIndex = 0;
    return tweets[0];
  }

  return available[0];
}

// ============================================================================
// IMAGE GENERATION
// ============================================================================

async function generateInstagramImage(tweetData, imageSpecs) {
  try {
    console.log(`   🎨 Generating image (${imageSpecs.style})...`);

    const generator = new PremiumImageGenerator();

    // Override dimensions for Instagram
    generator.width = imageSpecs.width;
    generator.height = imageSpecs.height;

    // Extract content for generation
    const contentData = {
      title: tweetData.text.split('\n')[0].substring(0, 50),
      subtitle: tweetData.category.charAt(0).toUpperCase() + tweetData.category.slice(1),
      stats: null,
      category: tweetData.category
    };

    // Generate based on style
    let buffer;
    switch (imageSpecs.style) {
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

    // Save locally
    const filename = `instagram-${tweetData.id}-${imageSpecs.ratio}.png`;
    const filepath = path.join(CONFIG.PATHS.IMAGE_CACHE, filename);
    fs.writeFileSync(filepath, buffer);

    console.log(`   ✅ Image generated: ${imageSpecs.width}x${imageSpecs.height}`);

    return {
      localPath: filepath,
      filename
    };

  } catch (error) {
    console.error(`   ❌ Image generation failed: ${error.message}`);
    throw error;
  }
}

/**
 * Get public URL for image
 * NOTE: For production, upload to CDN/cloud storage
 */
function getImageUrl(localPath) {
  // For development: Use local file path
  // For production: Upload to CDN and return URL

  if (CONFIG.IMAGE.UPLOAD_METHOD === 'url') {
    // TODO: Implement CDN upload
    // For now, return placeholder that needs implementation
    const filename = path.basename(localPath);
    console.warn('   ⚠️  Using placeholder URL. Implement CDN upload for production!');
    return `${CONFIG.IMAGE.TEMP_URL_BASE}${filename}`;
  }

  // Instagram requires publicly accessible URL
  throw new Error('Instagram requires public image URL. Configure TEMP_IMAGE_HOST or implement CDN upload.');
}

// ============================================================================
// POSTING WORKFLOW
// ============================================================================

async function postToInstagram(client, tweetData, adaptedContent, options = {}) {
  const { dryRun = false } = options;

  try {
    console.log(`\n📸 Preparing Instagram post #${tweetData.id}`);
    console.log(`   Category: ${tweetData.category}`);
    console.log(`   Caption length: ${adaptedContent.caption.length} chars`);
    console.log(`   Hashtags: ${adaptedContent.hashtags.length}`);

    // Generate image
    const imageData = await generateInstagramImage(tweetData, adaptedContent.imageSpecs);

    if (dryRun) {
      console.log('\n🧪 DRY RUN MODE - Skipping actual post');
      console.log('   Would post with:');
      console.log(`   - Image: ${imageData.localPath}`);
      console.log(`   - Caption: ${adaptedContent.caption.substring(0, 100)}...`);
      console.log(`   - Hashtags: ${adaptedContent.hashtags.slice(0, 5).join(', ')}...`);

      return {
        success: true,
        dryRun: true
      };
    }

    // Get public URL for image
    const imageUrl = getImageUrl(imageData.localPath);

    // Build caption with hashtags
    const fullCaption = adaptedContent.caption + '\n\n' +
                       adaptedContent.hashtags.join(' ');

    // Post to Instagram
    const result = await client.post({
      imageUrl,
      caption: fullCaption
    });

    if (result.success) {
      console.log(`\n✅ Posted to Instagram!`);
      console.log(`   Media ID: ${result.mediaId}`);
      console.log(`   URL: ${result.url}`);

      return {
        success: true,
        mediaId: result.mediaId,
        url: result.url,
        imageSpecs: adaptedContent.imageSpecs
      };
    } else {
      throw new Error(result.error);
    }

  } catch (error) {
    console.error(`\n❌ Posting failed: ${error.message}`);
    return {
      success: false,
      error: error.message
    };
  }
}

// ============================================================================
// MAIN EXECUTION
// ============================================================================

async function main(options = {}) {
  console.log('╔════════════════════════════════════════════════════════════════╗');
  console.log('║           📸 INSTAGRAM AUTO-POSTER                            ║');
  console.log('╚════════════════════════════════════════════════════════════════╝\n');

  const now = new Date();
  console.log(`⏰ Time: ${now.toLocaleString('en-US', { timeZone: 'Europe/Moscow' })}\n`);

  try {
    // Initialize Instagram client
    console.log('🔌 Connecting to Instagram API...');
    const client = new InstagramAPIClient();

    // Test connection
    const connectionTest = await client.testConnection();
    if (!connectionTest.success) {
      throw new Error('Instagram API connection failed. Check credentials.');
    }

    // Load content
    console.log('\n📚 Loading content bank...');
    const twitterContent = loadTwitterContent();
    const history = loadHistory();

    console.log(`   Twitter content: ${twitterContent.meta.total_tweets} tweets`);
    console.log(`   Instagram posts: ${history.posted.length}`);
    console.log(`   Remaining: ${twitterContent.meta.total_tweets - history.posted.length}\n`);

    // Get next content
    const tweetData = getNextContent(twitterContent, history);
    console.log(`📝 Selected content #${tweetData.id}: ${tweetData.category}`);

    // Adapt content for Instagram
    console.log('🔄 Adapting content for Instagram...');
    const adapter = new InstagramContentAdapter();
    const adaptedContent = adapter.adaptFromTwitter(tweetData);

    // Validate
    const validation = adapter.validate(adaptedContent);
    if (!validation.valid) {
      console.error('❌ Content validation failed:');
      validation.issues.forEach(issue => console.error(`   - ${issue}`));
      throw new Error('Content validation failed');
    }
    console.log('   ✅ Content validated');

    // Post to Instagram
    const result = await postToInstagram(client, tweetData, adaptedContent, options);

    // Update history
    if (result.success && !result.dryRun) {
      history.posted.push({
        contentId: tweetData.id,
        instagramMediaId: result.mediaId,
        instagramUrl: result.url,
        category: tweetData.category,
        timestamp: new Date().toISOString(),
        imageSpecs: result.imageSpecs
      });
      history.lastIndex = tweetData.id;
      history.stats.totalPosts++;
      history.stats.successfulPosts++;

      saveHistory(history);

      console.log(`\n📊 Progress: ${history.posted.length}/${twitterContent.meta.total_tweets}`);
    } else if (!result.success) {
      history.stats.totalPosts++;
      history.stats.failedPosts++;
      saveHistory(history);
    }

  } catch (error) {
    console.error(`\n💥 Fatal error: ${error.message}`);

    if (error.message.includes('rate limit')) {
      console.error('\n⏰ Rate limit hit. Try again later.');
    }

    process.exit(1);
  }

  console.log('\n╔════════════════════════════════════════════════════════════════╗');
  console.log('║              ✅ AUTO-POSTER COMPLETE                          ║');
  console.log('╚════════════════════════════════════════════════════════════════╝\n');
}

// ============================================================================
// CLI
// ============================================================================

const args = process.argv.slice(2);
const options = {
  dryRun: args.includes('--dry-run'),
  force: args.includes('--force')
};

if (args.includes('--help')) {
  console.log(`
Instagram Auto-Poster

USAGE:
  node instagram-auto-poster.js              Post next content
  node instagram-auto-poster.js --dry-run    Test without posting
  node instagram-auto-poster.js --force      Force post (bypass checks)

REQUIREMENTS:
  - Instagram Business/Creator account
  - Instagram credentials in .env.marketing
  - Twitter content bank
  - Premium image generator

SETUP:
  See docs/marketing/INSTAGRAM_API_SETUP.md
`);
  process.exit(0);
}

main(options).catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
