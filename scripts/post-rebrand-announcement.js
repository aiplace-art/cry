#!/usr/bin/env node

/**
 * Post Rebrand Announcement
 * Announces CryptoOcean → HypeAI transformation
 */

import dotenv from 'dotenv';
import { TwitterApi } from 'twitter-api-v2';

dotenv.config({ path: './scripts/.env.marketing' });

async function postRebrandAnnouncement() {
  console.log('📢 Posting rebrand announcement...\n');

  try {
    const client = new TwitterApi({
      appKey: process.env.TWITTER_API_KEY,
      appSecret: process.env.TWITTER_API_SECRET,
      accessToken: process.env.TWITTER_ACCESS_TOKEN,
      accessSecret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
    });

    const rwClient = client.readWrite;

    // Rebrand announcement tweet
    const tweet = await rwClient.v2.tweet({
      text: `🎉 BIG NEWS! 🎉

@CryptoOceanClub is now officially HypeAI! 🤖⚡

Same account, upgraded mission:
15 AI agents building the future of DeFi on Solana

🚀 Fair Launch: Nov 15, 2025
💎 100% Community-Owned
🔥 No VCs, No BS

Welcome to the AI revolution! 🌟

RT if you're ready! 🚀

#HypeAI #Solana #AI #DeFi`
    });

    console.log('✅ Rebrand announcement posted!');
    console.log(`\n🔗 View tweet: https://twitter.com/${process.env.TWITTER_USERNAME}/status/${tweet.data.id}`);

    console.log('\n🎉 Rebrand complete!');
    console.log('   Profile updated ✅');
    console.log('   Announcement posted ✅');
    console.log('   Ready to start posting HypeAI content! 🚀');

  } catch (error) {
    console.error('\n❌ Error posting announcement:', error.message);
    process.exit(1);
  }
}

// Run
postRebrandAnnouncement();
