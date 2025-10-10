/**
 * HypeAI Community Bots - Main Runner
 * Starts all community management bots (Discord, Telegram, Twitter)
 */

const DiscordBot = require('./discord-bot');
const TelegramBot = require('./telegram-bot');
const TwitterBot = require('./twitter-engagement');
const config = require('./bots-config.json');
const fs = require('fs').promises;

class BotManager {
  constructor() {
    this.discordBot = null;
    this.telegramBot = null;
    this.twitterBot = null;
    this.config = config;
  }

  async start(options = {}) {
    const {
      enableDiscord = true,
      enableTelegram = true,
      enableTwitter = true
    } = options;

    console.log('🚀 Starting HypeAI Community Bots...\n');

    try {
      // Start Discord Bot
      if (enableDiscord && this.config.features.discord) {
        console.log('📱 Initializing Discord bot...');
        this.discordBot = new DiscordBot(this.config);
        await this.discordBot.start();
        console.log('✅ Discord bot started\n');
      }

      // Start Telegram Bot
      if (enableTelegram && this.config.features.telegram) {
        console.log('📨 Initializing Telegram bot...');
        this.telegramBot = new TelegramBot(this.config);
        await this.telegramBot.start();
        console.log('✅ Telegram bot started\n');
      }

      // Start Twitter Bot
      if (enableTwitter && this.config.features.twitter) {
        console.log('🐦 Initializing Twitter bot...');
        this.twitterBot = new TwitterBot(this.config);

        // Load historical data
        await this.twitterBot.loadData();

        await this.twitterBot.start();
        console.log('✅ Twitter bot started\n');
      }

      console.log('✅ All enabled bots started successfully!\n');
      console.log('📊 Bot Status:');
      console.log(`   Discord: ${this.discordBot ? '🟢 Online' : '⚪ Disabled'}`);
      console.log(`   Telegram: ${this.telegramBot ? '🟢 Online' : '⚪ Disabled'}`);
      console.log(`   Twitter: ${this.twitterBot ? '🟢 Online' : '⚪ Disabled'}`);
      console.log('\n💡 Press Ctrl+C to stop all bots\n');

      // Handle graceful shutdown
      this.setupShutdownHandlers();

    } catch (error) {
      console.error('❌ Error starting bots:', error);
      await this.stop();
      process.exit(1);
    }
  }

  setupShutdownHandlers() {
    const shutdown = async (signal) => {
      console.log(`\n\n📥 Received ${signal}, shutting down gracefully...`);
      await this.stop();
      process.exit(0);
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));

    process.on('uncaughtException', async (error) => {
      console.error('❌ Uncaught exception:', error);
      await this.stop();
      process.exit(1);
    });

    process.on('unhandledRejection', async (error) => {
      console.error('❌ Unhandled rejection:', error);
      await this.stop();
      process.exit(1);
    });
  }

  async stop() {
    console.log('\n🛑 Stopping all bots...');

    const stopPromises = [];

    if (this.discordBot) {
      stopPromises.push(
        this.discordBot.stop().catch(err => console.error('Discord stop error:', err))
      );
    }

    if (this.telegramBot) {
      stopPromises.push(
        this.telegramBot.stop().catch(err => console.error('Telegram stop error:', err))
      );
    }

    if (this.twitterBot) {
      stopPromises.push(
        this.twitterBot.stop().catch(err => console.error('Twitter stop error:', err))
      );
    }

    await Promise.all(stopPromises);
    console.log('✅ All bots stopped');
  }

  getTwitterPendingReplies() {
    if (!this.twitterBot) {
      throw new Error('Twitter bot is not running');
    }
    return this.twitterBot.getPendingReplies();
  }

  async approveTwitterReply(replyId) {
    if (!this.twitterBot) {
      throw new Error('Twitter bot is not running');
    }
    return await this.twitterBot.approveReply(replyId);
  }

  async rejectTwitterReply(replyId, reason) {
    if (!this.twitterBot) {
      throw new Error('Twitter bot is not running');
    }
    return await this.twitterBot.rejectReply(replyId, reason);
  }

  async customTwitterReply(replyId, text) {
    if (!this.twitterBot) {
      throw new Error('Twitter bot is not running');
    }
    return await this.twitterBot.customReply(replyId, text);
  }

  getTwitterSentiment() {
    if (!this.twitterBot) {
      throw new Error('Twitter bot is not running');
    }
    return this.twitterBot.getSentimentSummary();
  }

  getTwitterViralPosts() {
    if (!this.twitterBot) {
      throw new Error('Twitter bot is not running');
    }
    return this.twitterBot.getViralPosts();
  }

  getTwitterPartnerships() {
    if (!this.twitterBot) {
      throw new Error('Twitter bot is not running');
    }
    return this.twitterBot.getPartnershipOpportunities();
  }
}

// CLI Usage
if (require.main === module) {
  const manager = new BotManager();

  // Parse command line arguments
  const args = process.argv.slice(2);
  const options = {
    enableDiscord: !args.includes('--no-discord'),
    enableTelegram: !args.includes('--no-telegram'),
    enableTwitter: !args.includes('--no-twitter')
  };

  if (args.includes('--help')) {
    console.log(`
HypeAI Community Bots

Usage: node index.js [options]

Options:
  --no-discord    Disable Discord bot
  --no-telegram   Disable Telegram bot
  --no-twitter    Disable Twitter bot
  --help          Show this help message

Examples:
  node index.js                      # Start all bots
  node index.js --no-twitter         # Start only Discord and Telegram
  node index.js --no-discord         # Start only Telegram and Twitter

Configuration:
  Edit bots-config.json to configure tokens and settings
    `);
    process.exit(0);
  }

  manager.start(options);
}

module.exports = BotManager;
