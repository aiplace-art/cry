#!/usr/bin/env node

/**
 * HypeAI Content Creator Bot - Startup Script
 * Run with: node src/bots/start-content-bot.js
 * Or: npm run content-bot
 */

const ContentCreatorBot = require('./content-creator-bot');
require('dotenv').config();

// Configuration
const config = {
  telegram: {
    token: process.env.TELEGRAM_BOT_TOKEN,
    groupId: process.env.TELEGRAM_GROUP_ID || process.env.TELEGRAM_CHAT_ID
  },
  links: {
    website: 'https://hypeai.io',
    twitter: 'https://twitter.com/hypeai',
    discord: 'https://discord.gg/hypeai',
    medium: 'https://medium.com/@hypeai',
    docs: 'https://docs.hypeai.io',
    stakingDapp: 'https://stake.hypeai.io',
    pancakeswap: 'https://pancakeswap.finance/swap?outputCurrency=YOUR_TOKEN',
    coingecko: 'https://coingecko.com/coins/hypeai',
    coinmarketcap: 'https://coinmarketcap.com/currencies/hypeai',
    github: 'https://github.com/hypeai',
    audit: 'https://docs.hypeai.io/audit',
    dao: 'https://dao.hypeai.io',
    buyGuide: 'https://docs.hypeai.io/how-to-buy',
    stakingGuide: 'https://docs.hypeai.io/staking',
    roadmap: 'https://docs.hypeai.io/roadmap',
    chart: 'https://dexscreener.com/solana/hypeai'
  },
  contractAddress: process.env.CONTRACT_ADDRESS || 'YOUR_SOLANA_TOKEN_ADDRESS'
};

// Validate configuration
function validateConfig() {
  if (!config.telegram.token) {
    console.error('❌ Error: TELEGRAM_BOT_TOKEN not set in environment variables');
    console.log('💡 Create a .env file with: TELEGRAM_BOT_TOKEN=your_token_here');
    process.exit(1);
  }

  if (!config.telegram.groupId) {
    console.error('❌ Error: TELEGRAM_GROUP_ID not set in environment variables');
    console.log('💡 Add to .env: TELEGRAM_GROUP_ID=your_group_id');
    process.exit(1);
  }

  console.log('✅ Configuration validated');
}

// Initialize bot
async function startBot() {
  try {
    console.log('🚀 Starting HypeAI Content Creator Bot...\n');

    validateConfig();

    const bot = new ContentCreatorBot(config);

    // Graceful shutdown
    process.on('SIGINT', async () => {
      console.log('\n🛑 Shutting down gracefully...');
      await bot.stop();
      process.exit(0);
    });

    process.on('SIGTERM', async () => {
      console.log('\n🛑 Shutting down gracefully...');
      await bot.stop();
      process.exit(0);
    });

    // Start the bot
    await bot.start();

    console.log('\n✅ Content Creator Bot is running!');
    console.log('📊 Stats:');
    console.log(`   - Max posts per day: ${bot.maxPostsPerDay}`);
    console.log(`   - Min interval: ${bot.minPostInterval / 60000} minutes`);
    console.log(`   - Scheduled times: ${bot.optimalTimes.length}`);
    console.log(`   - AI Agents: ${bot.agents.length}`);
    console.log('\n💡 Press Ctrl+C to stop\n');

    // Optional: Set up admin commands via direct messages
    bot.bot.startPolling();

    bot.bot.onText(/\/content_status/, async (msg) => {
      if (!isAdmin(msg.from.id)) return;

      const analytics = await bot.getAnalytics();
      const status = `
📊 **Content Bot Status**

**Today:**
• Posts: ${analytics.todayPosts}/${bot.maxPostsPerDay}
• Queue: ${analytics.queueSize} pending approval

**Overall:**
• Total posts: ${analytics.totalPosts}
• Avg engagement: ${analytics.averageEngagement}
• History size: ${analytics.historySize}

**Last post:** ${bot.lastPostTime ? new Date(bot.lastPostTime).toLocaleString() : 'Never'}
      `;

      bot.bot.sendMessage(msg.chat.id, status, { parse_mode: 'Markdown' });
    });

    bot.bot.onText(/\/content_queue/, async (msg) => {
      if (!isAdmin(msg.from.id)) return;

      const queue = await bot.getApprovalQueue();

      if (queue.length === 0) {
        return bot.bot.sendMessage(msg.chat.id, '✅ Approval queue is empty!');
      }

      let message = '📋 **Approval Queue:**\n\n';
      queue.forEach((item, index) => {
        message += `**[${index}]** ${item.type} by ${item.agent}\n`;
        message += `${item.content.substring(0, 100)}...\n\n`;
      });

      bot.bot.sendMessage(msg.chat.id, message, { parse_mode: 'Markdown' });
    });

    bot.bot.onText(/\/content_approve (\d+)/, async (msg, match) => {
      if (!isAdmin(msg.from.id)) return;

      const index = parseInt(match[1]);
      try {
        await bot.approveContent(index);
        bot.bot.sendMessage(msg.chat.id, `✅ Content ${index} approved and posted!`);
      } catch (error) {
        bot.bot.sendMessage(msg.chat.id, `❌ Error: ${error.message}`);
      }
    });

    bot.bot.onText(/\/content_reject (\d+) (.+)/, async (msg, match) => {
      if (!isAdmin(msg.from.id)) return;

      const index = parseInt(match[1]);
      const reason = match[2];

      try {
        await bot.rejectContent(index, reason);
        bot.bot.sendMessage(msg.chat.id, `✅ Content ${index} rejected. Reason: ${reason}`);
      } catch (error) {
        bot.bot.sendMessage(msg.chat.id, `❌ Error: ${error.message}`);
      }
    });

    bot.bot.onText(/\/content_create (.+)/, async (msg, match) => {
      if (!isAdmin(msg.from.id)) return;

      const type = match[1];
      try {
        const result = await bot.createPost(type);
        if (result.needsApproval) {
          bot.bot.sendMessage(msg.chat.id, '📋 Content created and added to approval queue');
        } else {
          bot.bot.sendMessage(msg.chat.id, '✅ Content created and posted!');
        }
      } catch (error) {
        bot.bot.sendMessage(msg.chat.id, `❌ Error: ${error.message}`);
      }
    });

    bot.bot.onText(/\/content_help/, async (msg) => {
      if (!isAdmin(msg.from.id)) return;

      const help = `
🤖 **Content Bot Admin Commands**

**Monitoring:**
/content_status - View bot status
/content_queue - View approval queue

**Management:**
/content_approve <index> - Approve queued content
/content_reject <index> <reason> - Reject content
/content_create <type> - Create post manually

**Content Types:**
• goodMorning
• agentSpotlight
• marketUpdate
• educational
• communityMilestone
• countdown
• poll
• funFact
• motivational
• memeIdea

**Example:**
/content_create agentSpotlight
      `;

      bot.bot.sendMessage(msg.chat.id, help, { parse_mode: 'Markdown' });
    });

  } catch (error) {
    console.error('❌ Fatal error starting bot:', error);
    process.exit(1);
  }
}

// Admin check (configure with your admin user IDs)
function isAdmin(userId) {
  const adminIds = process.env.ADMIN_USER_IDS?.split(',').map(id => parseInt(id)) || [];
  return adminIds.includes(userId);
}

// Start the bot
startBot().catch(error => {
  console.error('❌ Unhandled error:', error);
  process.exit(1);
});
