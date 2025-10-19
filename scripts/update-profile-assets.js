#!/usr/bin/env node

/**
 * Twitter Profile Assets Uploader
 * Uploads avatar, banner, and updates profile settings
 * Supports BNB Chain branding with #F3BA2F accent color
 */

import dotenv from 'dotenv';
import { TwitterApi } from 'twitter-api-v2';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env.marketing') });

// BNB Chain brand colors
const BNB_COLORS = {
  gold: 'F3BA2F',        // BNB Gold (without #)
  black: '000000',
  white: 'FFFFFF'
};

/**
 * Upload avatar image
 */
async function uploadAvatar(client, imagePath) {
  console.log('\n📸 UPLOADING AVATAR');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  try {
    // Check file exists
    if (!fs.existsSync(imagePath)) {
      throw new Error(`Avatar file not found: ${imagePath}`);
    }

    // Check file size
    const stats = fs.statSync(imagePath);
    const fileSizeMB = stats.size / (1024 * 1024);
    console.log(`📊 File size: ${fileSizeMB.toFixed(2)} MB`);

    if (fileSizeMB > 2) {
      throw new Error('Avatar must be under 2MB');
    }

    console.log(`📁 Uploading: ${imagePath}`);

    // Upload image to Twitter
    const mediaId = await client.v1.uploadMedia(imagePath, {
      mimeType: 'image/png',
      target: 'tweet'
    });

    console.log(`✅ Media uploaded: ${mediaId}`);

    // Update profile image
    await client.v1.updateAccountProfileImage(mediaId);

    console.log('✅ Avatar updated successfully!');
    console.log('🔗 Check: https://twitter.com/HypeAIProject');

    return { success: true, mediaId };

  } catch (error) {
    console.error('❌ Avatar upload failed:', error.message);
    if (error.data) console.error('API Error:', error.data);
    return { success: false, error: error.message };
  }
}

/**
 * Upload banner image
 */
async function uploadBanner(client, imagePath) {
  console.log('\n🖼️  UPLOADING BANNER');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  try {
    // Check file exists
    if (!fs.existsSync(imagePath)) {
      throw new Error(`Banner file not found: ${imagePath}`);
    }

    // Check file size
    const stats = fs.statSync(imagePath);
    const fileSizeMB = stats.size / (1024 * 1024);
    console.log(`📊 File size: ${fileSizeMB.toFixed(2)} MB`);

    if (fileSizeMB > 5) {
      throw new Error('Banner must be under 5MB');
    }

    console.log(`📁 Uploading: ${imagePath}`);

    // Upload image to Twitter
    const mediaId = await client.v1.uploadMedia(imagePath, {
      mimeType: 'image/png',
      target: 'tweet'
    });

    console.log(`✅ Media uploaded: ${mediaId}`);

    // Update banner
    await client.v1.updateAccountProfileBanner(mediaId);

    console.log('✅ Banner updated successfully!');
    console.log('🔗 Check: https://twitter.com/HypeAIProject');

    return { success: true, mediaId };

  } catch (error) {
    console.error('❌ Banner upload failed:', error.message);
    if (error.data) console.error('API Error:', error.data);
    return { success: false, error: error.message };
  }
}

/**
 * Update profile settings (name, bio, colors)
 */
async function updateProfileSettings(client, options = {}) {
  console.log('\n⚙️  UPDATING PROFILE SETTINGS');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  try {
    const settings = {
      name: options.name || 'HypeAI',
      description: options.bio || '15 AI Agents powered by BNB Chain 🤖⚡\n\nFair Launch • No VCs • 100% Community\n\nBuilding the future of decentralized AI\n\n#BuildOnBNB',
      location: options.location || 'BNB Chain',
      url: options.url || 'https://hypeai.io',
      // Theme colors not supported in API v1.1 (must set manually)
    };

    console.log('📝 Settings:');
    console.log(`   Name: ${settings.name}`);
    console.log(`   Bio: ${settings.description.substring(0, 50)}...`);
    console.log(`   Location: ${settings.location}`);
    console.log(`   URL: ${settings.url}`);

    await client.v1.updateAccountProfile(settings);

    console.log('✅ Profile settings updated!');
    console.log('\n⚠️  NOTE: Theme color must be set manually:');
    console.log('   1. Go to Twitter Settings → Display');
    console.log(`   2. Set Theme Color to: #${BNB_COLORS.gold} (BNB Gold)`);
    console.log('   3. Or use Twitter app settings for accent color');

    return { success: true, settings };

  } catch (error) {
    console.error('❌ Profile update failed:', error.message);
    if (error.data) console.error('API Error:', error.data);
    return { success: false, error: error.message };
  }
}

/**
 * Main function
 */
async function main() {
  console.log('🚀 TWITTER PROFILE ASSETS UPLOADER');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  // Parse command line arguments
  const args = process.argv.slice(2);
  let avatarPath = null;
  let bannerPath = null;
  let updateSettings = false;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--avatar' && args[i + 1]) {
      avatarPath = args[i + 1];
      i++;
    } else if (args[i] === '--banner' && args[i + 1]) {
      bannerPath = args[i + 1];
      i++;
    } else if (args[i] === '--settings' || args[i] === '--all') {
      updateSettings = true;
    }
  }

  // Default paths if not specified
  if (!avatarPath && !bannerPath && !updateSettings) {
    avatarPath = path.join(__dirname, 'twitter-media/avatar-bnb.png');
    bannerPath = path.join(__dirname, 'twitter-media/banner-bnb.png');
    updateSettings = true;
    console.log('ℹ️  No arguments specified, uploading all assets...\n');
  }

  try {
    // Initialize Twitter client
    const client = new TwitterApi({
      appKey: process.env.TWITTER_API_KEY,
      appSecret: process.env.TWITTER_API_SECRET,
      accessToken: process.env.TWITTER_ACCESS_TOKEN,
      accessSecret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
    });

    const results = {
      avatar: null,
      banner: null,
      settings: null
    };

    // Upload avatar
    if (avatarPath) {
      results.avatar = await uploadAvatar(client, avatarPath);
    }

    // Upload banner
    if (bannerPath) {
      results.banner = await uploadBanner(client, bannerPath);
    }

    // Update settings
    if (updateSettings) {
      results.settings = await updateProfileSettings(client);
    }

    // Summary
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📊 UPLOAD SUMMARY');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    if (results.avatar) {
      console.log(`Avatar: ${results.avatar.success ? '✅ SUCCESS' : '❌ FAILED'}`);
    }
    if (results.banner) {
      console.log(`Banner: ${results.banner.success ? '✅ SUCCESS' : '❌ FAILED'}`);
    }
    if (results.settings) {
      console.log(`Settings: ${results.settings.success ? '✅ SUCCESS' : '❌ FAILED'}`);
    }

    const allSuccess = Object.values(results).every(r => !r || r.success);

    if (allSuccess) {
      console.log('\n✅ ALL UPDATES COMPLETED SUCCESSFULLY!');
      console.log('🔗 View profile: https://twitter.com/HypeAIProject');
      console.log(`🎨 Remember to set accent color: #${BNB_COLORS.gold}`);
    } else {
      console.log('\n⚠️  Some updates failed. Check errors above.');
    }

  } catch (error) {
    console.error('\n❌ FATAL ERROR:', error.message);
    process.exit(1);
  }
}

// Usage instructions
if (process.argv.includes('--help') || process.argv.includes('-h')) {
  console.log(`
Twitter Profile Assets Uploader

USAGE:
  node update-profile-assets.js [options]

OPTIONS:
  --avatar <path>    Upload avatar image (400x400px, <2MB)
  --banner <path>    Upload banner image (1500x500px, <5MB)
  --settings         Update profile name, bio, location, URL
  --all              Upload avatar, banner, and update settings
  --help, -h         Show this help message

EXAMPLES:
  # Upload all assets (default)
  node update-profile-assets.js

  # Upload only avatar
  node update-profile-assets.js --avatar ./twitter-media/avatar-bnb.png

  # Upload only banner
  node update-profile-assets.js --banner ./twitter-media/banner-bnb.png

  # Upload avatar and banner
  node update-profile-assets.js --avatar ./avatar.png --banner ./banner.png

  # Update settings only
  node update-profile-assets.js --settings

BNB CHAIN BRANDING:
  Avatar: Built on BNB Chain logo with gold hexagon
  Banner: HypeAI + BNB Chain branding with network visualization
  Theme Color: #F3BA2F (BNB Gold) - must be set manually in Twitter settings

REQUIREMENTS:
  - Twitter API credentials in .env.marketing
  - Write permissions enabled
  - Images in correct format and size
  `);
  process.exit(0);
}

// Run
main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
