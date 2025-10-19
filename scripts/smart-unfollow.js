#!/usr/bin/env node

/**
 * Smart Unfollow System - Gradual unfollowing with rate limit handling
 * Unfollows non-essential accounts in batches, keeps important crypto accounts
 */

import dotenv from 'dotenv';
import { TwitterApi } from 'twitter-api-v2';
import fs from 'fs';

dotenv.config({ path: './scripts/.env.marketing' });

const BATCH_SIZE = 8; // Unfollow 8 accounts per batch (conservative)
const WAIT_TIME = 20 * 60 * 1000; // 20 minutes between batches
const MAX_ROUNDS = 15; // Up to 15 rounds (120 unfollows max per run)

// Important accounts to KEEP following
const KEEP_FOLLOWING = [
  'bnbchain',
  'BNBCHAIN',
  'PancakeSwap',
  'TrustWallet',
  'BiswapDEX',
  'BinanceChain',
  'BNBChainDev',
  'VenusProtocol',
  'bakeryswap',
  'BakeryTools',
  'alpacafinance',
  'autofarmnetwork',
  'OKXWeb3',
  'Bybit_Official',
  'cryptocom',
  'coinbase',
  'binance',
  'Coingecko',
  'CoinMarketCap',
  'defillama',
  'messaricrypto',
  'nansen_ai',
  'DuneAnalytics',
  'CryptoSlate',
  'Cointelegraph',
  'TheBlock__',
  'DecryptMedia',
  'VitalikButerin',
  'aantonop',
  'cz_binance',
  'SBF_FTX',
  'justinsuntron',
  'elonmusk'
];

const KEEP_KEYWORDS = [
  'bnb',
  'bnbchain',
  'bsc',
  'binance',
  'defi',
  'crypto',
  'blockchain',
  'web3',
  'nft',
  'dao',
  'ai',
  'trading'
];

// Track unfollowed accounts
const unfollowLog = [];

/**
 * Check if account should be kept
 */
function shouldKeepAccount(user) {
  // Keep verified accounts
  if (user.verified) return true;

  // Keep accounts in whitelist
  const username = user.username.toLowerCase();
  if (KEEP_FOLLOWING.some(keep => username.includes(keep.toLowerCase()))) {
    return true;
  }

  // Keep accounts with relevant keywords in name/bio
  const name = (user.name || '').toLowerCase();
  const bio = (user.description || '').toLowerCase();
  const hasKeyword = KEEP_KEYWORDS.some(keyword =>
    name.includes(keyword) || bio.includes(keyword)
  );
  if (hasKeyword) return true;

  // Keep accounts with high followers (likely influencers)
  if (user.public_metrics?.followers_count > 10000) return true;

  return false;
}

async function unfollowBatch(client, round = 1) {
  console.log(`\n🔄 Round ${round}/${MAX_ROUNDS} - Starting unfollow batch...`);

  try {
    const rwClient = client.readWrite;

    // Get current user
    const currentUser = await rwClient.v2.me();
    console.log(`✅ Connected to: @${currentUser.data.username}`);

    // Get following list (max 1000 per request)
    const following = await rwClient.v2.following(currentUser.data.id, {
      max_results: 1000,
      'user.fields': ['username', 'name', 'description', 'verified', 'public_metrics']
    });

    const allFollowing = following.data || [];
    console.log(`📊 Currently following: ${allFollowing.length} accounts`);

    // Filter accounts to unfollow
    const accountsToUnfollow = allFollowing.filter(user => !shouldKeepAccount(user));

    if (accountsToUnfollow.length === 0) {
      console.log('\n🎉 ALL DONE! Following list is optimized!');
      console.log(`✅ Kept important crypto accounts only`);
      return { done: true };
    }

    // Unfollow only BATCH_SIZE accounts this round
    const batchToUnfollow = accountsToUnfollow.slice(0, BATCH_SIZE);
    console.log(`\n👋 Unfollowing ${batchToUnfollow.length} accounts this round...`);
    console.log(`📋 ${accountsToUnfollow.length - batchToUnfollow.length} will remain for next round`);

    let unfollowed = 0;
    let errors = 0;

    for (const user of batchToUnfollow) {
      try {
        await rwClient.v2.unfollow(currentUser.data.id, user.id);
        unfollowed++;
        unfollowLog.push({
          username: user.username,
          name: user.name,
          timestamp: new Date().toISOString()
        });
        console.log(`✅ ${unfollowed}/${batchToUnfollow.length} - Unfollowed @${user.username}`);

        // Delay between unfollows to appear natural
        await new Promise(resolve => setTimeout(resolve, 2000));
      } catch (error) {
        if (error.code === 429) {
          console.log(`\n⚠️  Rate limit hit after ${unfollowed} unfollows`);
          break;
        }
        errors++;
        console.log(`❌ Error unfollowing @${user.username}`);
      }
    }

    console.log(`\n📊 Round ${round} Results:`);
    console.log(`   ✅ Unfollowed: ${unfollowed}`);
    console.log(`   ❌ Errors: ${errors}`);
    console.log(`   📋 Remaining: ${accountsToUnfollow.length - unfollowed}`);

    return {
      done: false,
      unfollowed,
      remaining: accountsToUnfollow.length - unfollowed,
    };

  } catch (error) {
    console.error(`\n❌ Error in round ${round}:`, error.message);
    return { done: false, error: true };
  }
}

async function autoUnfollow() {
  console.log('🤖 SMART UNFOLLOW SYSTEM STARTED');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`⚙️  Batch size: ${BATCH_SIZE} accounts per round`);
  console.log(`⏱️  Wait time: ${WAIT_TIME / 60000} minutes between rounds`);
  console.log(`🔄 Max rounds: ${MAX_ROUNDS}`);
  console.log(`🛡️  Protected accounts: ${KEEP_FOLLOWING.length} whitelisted`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  const client = new TwitterApi({
    appKey: process.env.TWITTER_API_KEY,
    appSecret: process.env.TWITTER_API_SECRET,
    accessToken: process.env.TWITTER_ACCESS_TOKEN,
    accessSecret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
  });

  let totalUnfollowed = 0;

  for (let round = 1; round <= MAX_ROUNDS; round++) {
    const result = await unfollowBatch(client, round);

    if (result.done) {
      console.log('\n🎊 UNFOLLOW COMPLETE!');
      console.log(`📊 Total accounts unfollowed: ${totalUnfollowed}`);
      break;
    }

    if (result.unfollowed) {
      totalUnfollowed += result.unfollowed;
    }

    // If there are more accounts and we haven't reached max rounds
    if (!result.done && round < MAX_ROUNDS && result.remaining > 0) {
      const nextTime = new Date(Date.now() + WAIT_TIME);
      console.log(`\n⏳ Waiting ${WAIT_TIME / 60000} minutes for rate limit reset...`);
      console.log(`   Next round at: ${nextTime.toLocaleTimeString()}`);
      console.log(`   Remaining: ${result.remaining} accounts`);

      await new Promise(resolve => setTimeout(resolve, WAIT_TIME));
    }
  }

  // Save unfollow log
  const logPath = './data/project-coordination/unfollow-log.json';
  fs.writeFileSync(logPath, JSON.stringify({
    timestamp: new Date().toISOString(),
    totalUnfollowed,
    unfollowedAccounts: unfollowLog
  }, null, 2));

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🎉 AUTO UNFOLLOW FINISHED');
  console.log(`📊 Total unfollowed: ${totalUnfollowed} accounts`);
  console.log(`💾 Log saved: ${logPath}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

// Run
autoUnfollow().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
