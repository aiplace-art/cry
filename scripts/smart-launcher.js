#!/usr/bin/env node

/**
 * Smart Launcher - Monitors API status and auto-launches when ready
 * Checks every 15 minutes, launches all systems when API is unblocked
 */

import dotenv from 'dotenv';
import { TwitterApi } from 'twitter-api-v2';
import { exec } from 'child_process';
import { promisify } from 'util';

dotenv.config({ path: './scripts/.env.marketing' });

const execAsync = promisify(exec);

const CHECK_INTERVAL = 15 * 60 * 1000; // 15 minutes
const MAX_CHECKS = 100; // Stop after ~25 hours

/**
 * Check if API is ready
 */
async function checkAPIStatus() {
  try {
    const client = new TwitterApi({
      appKey: process.env.TWITTER_API_KEY,
      appSecret: process.env.TWITTER_API_SECRET,
      accessToken: process.env.TWITTER_ACCESS_TOKEN,
      accessSecret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
    });

    const me = await client.v2.me();

    return {
      ready: true,
      username: me.data.username,
      id: me.data.id
    };

  } catch (error) {
    if (error.code === 429) {
      // Still rate limited
      if (error.rateLimit?.userDay) {
        const resetTime = new Date(error.rateLimit.userDay.reset * 1000);
        const remaining = error.rateLimit.userDay.remaining;

        return {
          ready: false,
          reason: 'User daily limit',
          remaining,
          resetTime: resetTime.toLocaleString('ru-RU', { timeZone: 'Europe/Moscow' }),
          resetTimestamp: error.rateLimit.userDay.reset
        };
      }

      return {
        ready: false,
        reason: 'Rate limited',
        resetTime: 'Unknown'
      };
    }

    return {
      ready: false,
      reason: error.message
    };
  }
}

/**
 * Launch all Twitter automation
 */
async function launchAllSystems() {
  console.log('\n🚀 LAUNCHING ALL TWITTER AUTOMATION SYSTEMS...\n');

  try {
    // Launch master script
    const { stdout, stderr } = await execAsync('bash scripts/launch-all-twitter-automation.sh');

    console.log(stdout);
    if (stderr) console.error(stderr);

    console.log('\n✅ ALL SYSTEMS LAUNCHED SUCCESSFULLY!\n');

    return true;

  } catch (error) {
    console.error('\n❌ Error launching systems:', error.message);
    return false;
  }
}

/**
 * Main monitoring loop
 */
async function smartLauncher() {
  console.log('🤖 SMART LAUNCHER STARTED');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`⏰ Started: ${new Date().toLocaleString('ru-RU', { timeZone: 'Europe/Moscow' })}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  console.log('📋 Mission: Monitor API and auto-launch when ready');
  console.log(`⏱️  Check interval: ${CHECK_INTERVAL / 60000} minutes`);
  console.log(`🔄 Max checks: ${MAX_CHECKS} (~${Math.round(MAX_CHECKS * CHECK_INTERVAL / 3600000)} hours)\n`);

  let checks = 0;

  while (checks < MAX_CHECKS) {
    checks++;

    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`🔍 Check #${checks}/${MAX_CHECKS}`);
    console.log(`⏰ Time: ${new Date().toLocaleString('ru-RU', { timeZone: 'Europe/Moscow' })}`);
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);

    const status = await checkAPIStatus();

    if (status.ready) {
      console.log('✅ API IS READY!');
      console.log(`   Account: @${status.username}`);
      console.log(`   ID: ${status.id}\n`);

      console.log('🚀 Launching all automation systems...\n');

      const success = await launchAllSystems();

      if (success) {
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('🎉 MISSION ACCOMPLISHED!');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

        console.log('📊 All systems are now running:');
        console.log('   1️⃣  Auto-posting (3x daily)');
        console.log('   2️⃣  Engagement bot (24/7)');
        console.log('   3️⃣  Analytics (automated)');
        console.log('   4️⃣  Marketing specialist (6h intervals)\n');

        console.log('💡 Monitor with: pm2 list\n');

        process.exit(0);
      } else {
        console.log('⚠️  Launch failed, will retry on next check...\n');
      }

    } else {
      console.log('⏳ API still blocked');
      console.log(`   Reason: ${status.reason}`);
      if (status.remaining !== undefined) {
        console.log(`   Remaining: ${status.remaining}/25 requests`);
      }
      if (status.resetTime) {
        console.log(`   Reset at: ${status.resetTime}`);
      }
      console.log('');

      if (status.resetTimestamp) {
        const now = Date.now() / 1000;
        const timeUntilReset = status.resetTimestamp - now;
        const hours = Math.floor(timeUntilReset / 3600);
        const minutes = Math.floor((timeUntilReset % 3600) / 60);

        if (timeUntilReset > 0) {
          console.log(`⏱️  Time until reset: ${hours}h ${minutes}m\n`);
        }
      }

      if (checks < MAX_CHECKS) {
        const nextCheck = new Date(Date.now() + CHECK_INTERVAL);
        console.log(`🔄 Next check: ${nextCheck.toLocaleString('ru-RU', { timeZone: 'Europe/Moscow' })}`);
        console.log(`💤 Sleeping for ${CHECK_INTERVAL / 60000} minutes...\n`);

        await new Promise(resolve => setTimeout(resolve, CHECK_INTERVAL));
      }
    }
  }

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('⏰ MAX CHECKS REACHED');
  console.log('   Manual launch required');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

// Run
smartLauncher().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
