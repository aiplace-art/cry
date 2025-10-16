#!/usr/bin/env node

/**
 * Post First Tweet - HypeAI Announcement
 */

import dotenv from 'dotenv';
import { TwitterApi } from 'twitter-api-v2';

dotenv.config({ path: './scripts/.env.marketing' });

async function postFirstTweet() {
  console.log('🐦 Posting first HypeAI tweet...\n');

  try {
    const client = new TwitterApi({
      appKey: process.env.TWITTER_API_KEY,
      appSecret: process.env.TWITTER_API_SECRET,
      accessToken: process.env.TWITTER_ACCESS_TOKEN,
      accessSecret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
    });

    const rwClient = client.readWrite;

    // First tweet in thread
    const tweet1 = await rwClient.v2.tweet({
      text: `🚨 BIG ANNOUNCEMENT 🚨

CryptoOcean is evolving into HypeAI! 🤖

We're building something revolutionary:
15 autonomous AI agents on Solana

🔥 Fair launch on pump.fun
🎯 No VCs, 100% community
📅 Launch: November 15, 2025

Why this matters 👇

🧵 Thread (1/6)`
    });

    console.log('✅ Tweet 1/6 posted!');
    const tweet1Id = tweet1.data.id;

    // Wait a bit between tweets
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Tweet 2
    const tweet2 = await rwClient.v2.tweet({
      text: `What is HypeAI? 🤖

15 AI agents working 24/7 to:
• Trade & analyze markets
• Build DeFi protocols
• Grow the community
• Create content
• Optimize strategies

Think of it as an AI-powered DAO on steroids.

(2/6)`,
      reply: { in_reply_to_tweet_id: tweet1Id }
    });

    console.log('✅ Tweet 2/6 posted!');
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Tweet 3
    const tweet3 = await rwClient.v2.tweet({
      text: `Why Solana? ⚡

Our AI agents need:
✅ Sub-second finality
✅ Low transaction costs ($0.00025)
✅ High throughput (65k TPS)
✅ Growing AI ecosystem

Ethereum: $50 gas fees ❌
Solana: $0.00025 ✅

The choice was obvious.

(3/6)`,
      reply: { in_reply_to_tweet_id: tweet2.data.id }
    });

    console.log('✅ Tweet 3/6 posted!');
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Tweet 4
    const tweet4 = await rwClient.v2.tweet({
      text: `Why pump.fun? 🚀

Fair launch means EVERYONE gets:
• Same price from the start
• No private sales
• No VC allocations
• No team unlock dumps

100% community ownership from day 1.

This is how crypto should work.

(4/6)`,
      reply: { in_reply_to_tweet_id: tweet3.data.id }
    });

    console.log('✅ Tweet 4/6 posted!');
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Tweet 5
    const tweet5 = await rwClient.v2.tweet({
      text: `Our Roadmap 🗺️

✅ NOW: Community building
📅 Nov 15: Fair launch on pump.fun
🔜 DEX listing (bonding curve fills)
🚀 AI agents deployment
🌟 DeFi protocols launch

We're building in public. Always transparent.

(5/6)`,
      reply: { in_reply_to_tweet_id: tweet4.data.id }
    });

    console.log('✅ Tweet 5/6 posted!');
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Tweet 6 (final)
    const tweet6 = await rwClient.v2.tweet({
      text: `Join the Movement 🎯

🔗 Telegram: t.me/HypeAI_Community
💬 Discord: discord.gg/hypeai
🌐 Website: hypeai.io
🤖 Twitter: Right here!

We're going from 100 to 10,000 followers.

Be early. Be part of history.

RT to spread the word! 🚀

(6/6)`,
      reply: { in_reply_to_tweet_id: tweet5.data.id }
    });

    console.log('✅ Tweet 6/6 posted!');

    console.log('\n🎉 SUCCESS! Thread posted!');
    console.log(`\n🔗 View thread: https://twitter.com/${process.env.TWITTER_USERNAME}/status/${tweet1Id}`);

    console.log('\n📌 Next step: Pin the first tweet!');
    console.log('   Go to Twitter and pin this tweet to your profile');

  } catch (error) {
    console.error('\n❌ Error posting tweet:');
    console.error(`   ${error.message}`);

    if (error.code === 403) {
      console.error('\n💡 You may have already posted this. Check Twitter!');
    }
  }
}

// Run
postFirstTweet();
