#!/usr/bin/env node

/**
 * HypeAI Telegram Bot Runner for Solana Launch
 * Simplified launcher for Telegram bot only
 */

const TelegramBot = require('./telegram-bot');
const config = require('./solana-bot-config.json');

console.log('🤖 Starting HypeAI Telegram Bot for Solana Launch...\n');

// Validate configuration
if (!config.telegram.token || config.telegram.token === 'YOUR_TELEGRAM_BOT_TOKEN_HERE') {
  console.error('❌ ERROR: Please set your Telegram bot token in solana-bot-config.json');
  console.log('\n📝 How to get a token:');
  console.log('1. Open Telegram and search for @BotFather');
  console.log('2. Send: /newbot');
  console.log('3. Follow instructions to create bot');
  console.log('4. Copy the token and paste it in solana-bot-config.json');
  console.log('\nExample token: 123456789:ABCdefGHIjklMNOpqrsTUVwxyz\n');
  process.exit(1);
}

// Initialize bot
const bot = new TelegramBot(config);

// Start bot
bot.start()
  .then(() => {
    console.log('\n✅ Telegram bot is LIVE!');
    console.log('📱 Users can now interact with your bot');
    console.log('\n🔗 Bot commands:');
    console.log('   /start - Welcome message');
    console.log('   /help - Show all commands');
    console.log('   /price - Token price (mock data for now)');
    console.log('   /stats - Project stats');
    console.log('   /faq - Frequently asked questions');
    console.log('\n⏸️  Press Ctrl+C to stop\n');
  })
  .catch((error) => {
    console.error('❌ Failed to start bot:', error);
    process.exit(1);
  });

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n\n⏹️  Stopping bot...');
  await bot.stop();
  console.log('✅ Bot stopped gracefully\n');
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await bot.stop();
  process.exit(0);
});
