#!/usr/bin/env node

/**
 * Update Profile to HypeAI Branding
 * Automatically updates Twitter profile with HypeAI brand
 */

import dotenv from 'dotenv';
import { TwitterApi } from 'twitter-api-v2';

dotenv.config({ path: './scripts/.env.marketing' });

const HYPEAI_PROFILE = {
  name: 'HypeAI | AI Agents on Solana 🤖',
  description: `15 autonomous AI agents building the future of DeFi on Solana 🤖⚡

🚀 Fair launch: Nov 15, 2025
💎 100% community-owned, no VCs
🔥 AI-powered trading & protocols

👇 Join the revolution`,
  location: 'Solana Blockchain 🌐',
  url: 'https://hypeai.io',
};

async function updateProfile() {
  console.log('🎨 Updating profile to HypeAI branding...\n');

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

    console.log('📝 Updating profile fields...\n');

    // Update profile
    // Note: Twitter API v2 doesn't support profile updates yet
    // We'll use v1.1 endpoint
    const v1Client = client.v1;

    const updated = await v1Client.updateAccountProfile({
      name: HYPEAI_PROFILE.name,
      description: HYPEAI_PROFILE.description,
      location: HYPEAI_PROFILE.location,
      url: HYPEAI_PROFILE.url,
    });

    console.log('✅ Profile updated successfully!\n');
    console.log('📋 New profile:');
    console.log(`   Name: ${updated.name}`);
    console.log(`   Bio: ${updated.description.substring(0, 50)}...`);
    console.log(`   Location: ${updated.location}`);
    console.log(`   Website: ${updated.url}`);

    console.log('\n🎉 Profile rebrand complete!');
    console.log('\n📸 Next steps:');
    console.log('   1. Upload avatar (hypeai-avatar.png)');
    console.log('   2. Upload banner (hypeai-banner.png)');
    console.log('   3. Pin announcement tweet');
    console.log(`   4. View profile: https://twitter.com/${currentUser.data.username}`);

  } catch (error) {
    console.error('\n❌ Error updating profile:', error.message);

    if (error.code === 403) {
      console.log('\n💡 Note: Profile image updates require manual upload');
      console.log('   Go to https://twitter.com/settings/profile');
      console.log('   Upload avatar and banner manually');
    }

    process.exit(1);
  }
}

// Run
updateProfile();
