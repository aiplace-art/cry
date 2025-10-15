#!/usr/bin/env node

/**
 * 🤖 HypeAI Telegram Community Bot
 *
 * Полностью автоматизированный бот для роста сообщества:
 * - Welcome messages
 * - Auto-posting контента
 * - Airdrop campaigns
 * - Moderation & anti-spam
 * - Referral tracking
 * - Analytics
 *
 * ЛЕГАЛЬНО привлекает РЕАЛЬНЫХ пользователей через качественный контент!
 */

const TelegramBot = require('node-telegram-bot-api');
const fs = require('fs');
const path = require('path');

// ============================================================================
// CONFIGURATION
// ============================================================================

const CONFIG = {
  // Telegram Bot API (получи у @BotFather)
  telegram: {
    botToken: process.env.TELEGRAM_BOT_TOKEN || 'YOUR_BOT_TOKEN',
    channelId: process.env.TELEGRAM_CHANNEL_ID || '@hypeai',
    groupId: process.env.TELEGRAM_GROUP_ID || '-1001234567890',
  },

  // Project Info
  project: {
    name: 'HypeAI',
    ticker: '$HYPE',
    website: 'https://hypeai.io',
    twitter: 'https://twitter.com/hypeai',
    discord: 'https://discord.gg/hypeai',
  },

  // Airdrop Settings
  airdrop: {
    enabled: true,
    tokensPerUser: 500, // HYPE tokens
    totalPool: 10000000, // 10M HYPE
    referralBonus: 100, // За каждого приглашенного
    tasks: {
      joinTelegram: 500,
      followTwitter: 200,
      retweetPost: 200,
      inviteFriends: 100, // per friend
    }
  },

  // Auto-posting
  autoPost: {
    enabled: true,
    interval: 4 * 60 * 60 * 1000, // Каждые 4 часа
    types: ['news', 'update', 'meme', 'signal', 'educational']
  },

  // Moderation
  moderation: {
    enabled: true,
    antiSpam: true,
    badWords: ['scam', 'rug', 'fake', 'ponzi'],
    maxMessagesPerMinute: 5,
    captchaEnabled: true,
  },

  // Analytics
  analytics: {
    enabled: true,
    trackJoins: true,
    trackMessages: true,
    trackEngagement: true,
  }
};

// ============================================================================
// TELEGRAM BOT
// ============================================================================

class TelegramCommunityBot {
  constructor() {
    this.bot = null;
    this.db = this.loadDatabase();
    this.messageCount = new Map(); // Anti-spam tracking
  }

  /**
   * Initialize bot
   */
  async start() {
    console.log('🤖 Starting HypeAI Telegram Community Bot...\n');

    if (!CONFIG.telegram.botToken || CONFIG.telegram.botToken === 'YOUR_BOT_TOKEN') {
      console.error('❌ Error: TELEGRAM_BOT_TOKEN not configured!');
      console.log('\nSteps to fix:');
      console.log('1. Open Telegram and find @BotFather');
      console.log('2. Send /newbot and follow instructions');
      console.log('3. Copy the token');
      console.log('4. Add to .env: TELEGRAM_BOT_TOKEN=your-token\n');
      return;
    }

    // Create bot
    this.bot = new TelegramBot(CONFIG.telegram.botToken, { polling: true });

    console.log('✅ Bot connected to Telegram API\n');

    // Setup handlers
    this.setupHandlers();

    // Start auto-posting
    if (CONFIG.autoPost.enabled) {
      this.startAutoPosting();
    }

    // Start analytics
    if (CONFIG.analytics.enabled) {
      this.startAnalytics();
    }

    console.log('🚀 Bot is running! Press Ctrl+C to stop.\n');
  }

  /**
   * Setup message handlers
   */
  setupHandlers() {
    // Welcome new members
    this.bot.on('new_chat_members', (msg) => this.handleNewMember(msg));

    // Handle commands
    this.bot.onText(/\/start/, (msg) => this.handleStart(msg));
    this.bot.onText(/\/help/, (msg) => this.handleHelp(msg));
    this.bot.onText(/\/airdrop/, (msg) => this.handleAirdrop(msg));
    this.bot.onText(/\/referral/, (msg) => this.handleReferral(msg));
    this.bot.onText(/\/price/, (msg) => this.handlePrice(msg));
    this.bot.onText(/\/stats/, (msg) => this.handleStats(msg));

    // Handle messages (moderation)
    this.bot.on('message', (msg) => this.handleMessage(msg));

    // Handle errors
    this.bot.on('polling_error', (error) => {
      console.error('Polling error:', error.message);
    });
  }

  /**
   * Handle new members joining
   */
  async handleNewMember(msg) {
    const chatId = msg.chat.id;
    const newMembers = msg.new_chat_members;

    for (const member of newMembers) {
      if (member.is_bot) continue; // Skip bots

      const username = member.username ? `@${member.username}` : member.first_name;

      // Welcome message
      const welcomeText = `
🎉 **Welcome to HypeAI, ${username}!** 🎉

You just joined the future of AI-powered crypto trading! 🚀

🤖 **What is HypeAI?**
• AI predictions with 85% accuracy
• Stake for up to 62% APY
• DAO governance
• Lightning-fast Polygon L2

💰 **Get Started:**
1. Join our airdrop: /airdrop
2. Invite friends for bonus: /referral
3. Check $HYPE price: /price

🔗 **Important Links:**
🌐 Website: ${CONFIG.project.website}
🐦 Twitter: ${CONFIG.project.twitter}
💬 Discord: ${CONFIG.project.discord}

**Let's make you a millionaire! 💎**
      `.trim();

      await this.bot.sendMessage(chatId, welcomeText, { parse_mode: 'Markdown' });

      // Track join
      if (CONFIG.analytics.enabled) {
        this.trackEvent('user_joined', {
          userId: member.id,
          username: member.username,
          firstName: member.first_name,
          timestamp: Date.now()
        });
      }
    }
  }

  /**
   * Handle /start command
   */
  async handleStart(msg) {
    const chatId = msg.chat.id;
    const userId = msg.from.id;

    const startText = `
🧠⚡ **HypeAI - Where AI Meets Opportunity**

Welcome! I'm the official HypeAI bot.

**Available Commands:**
/help - Show all commands
/airdrop - Join 10M HYPE airdrop
/referral - Get your referral link
/price - Check $HYPE price
/stats - View community stats

**Quick Links:**
🌐 Website: ${CONFIG.project.website}
📱 Trade: ${CONFIG.project.website}/trade
💰 Stake: ${CONFIG.project.website}/stake

Let's get you started! 🚀
    `.trim();

    await this.bot.sendMessage(chatId, startText, { parse_mode: 'Markdown' });
  }

  /**
   * Handle /help command
   */
  async handleHelp(msg) {
    const chatId = msg.chat.id;

    const helpText = `
📚 **HypeAI Bot Commands**

**General:**
/start - Start the bot
/help - Show this help message
/price - Check $HYPE token price
/stats - Community statistics

**Airdrop:**
/airdrop - Join the 10M HYPE airdrop
/referral - Get your referral link
/tasks - View airdrop tasks

**Trading:**
/trade - Get trading link
/stake - Get staking info
/chart - View price chart

**Community:**
/support - Get support
/rules - Group rules
/socials - All social links

Need help? Contact @HypeAI_support
    `.trim();

    await this.bot.sendMessage(chatId, helpText, { parse_mode: 'Markdown' });
  }

  /**
   * Handle /airdrop command
   */
  async handleAirdrop(msg) {
    const chatId = msg.chat.id;
    const userId = msg.from.id;
    const username = msg.from.username;

    // Check if already registered
    if (this.db.airdrop[userId]) {
      const user = this.db.airdrop[userId];
      const airdropText = `
💎 **Your Airdrop Status**

✅ Registered: Yes
🎁 Tokens Earned: **${user.tokensEarned} HYPE**
👥 Referrals: ${user.referrals.length}

**Earn More:**
• Invite friends: +${CONFIG.airdrop.referralBonus} HYPE each
• Your referral link: /referral

**Tasks:**
${user.tasks.joinedTelegram ? '✅' : '❌'} Join Telegram (+${CONFIG.airdrop.tasks.joinTelegram} HYPE)
${user.tasks.followedTwitter ? '✅' : '❌'} Follow Twitter (+${CONFIG.airdrop.tasks.followTwitter} HYPE)
${user.tasks.retweeted ? '✅' : '❌'} Retweet pinned (+${CONFIG.airdrop.tasks.retweetPost} HYPE)

Complete all tasks to maximize your rewards! 🚀
      `.trim();

      await this.bot.sendMessage(chatId, airdropText, { parse_mode: 'Markdown' });
      return;
    }

    // Register new user
    this.db.airdrop[userId] = {
      userId,
      username,
      tokensEarned: CONFIG.airdrop.tasks.joinTelegram,
      referrals: [],
      tasks: {
        joinedTelegram: true,
        followedTwitter: false,
        retweeted: false,
      },
      joinedAt: Date.now()
    };

    this.saveDatabase();

    const welcomeAirdropText = `
🎁 **Welcome to HypeAI Airdrop!**

You've been registered and earned **${CONFIG.airdrop.tasks.joinTelegram} HYPE**! 🎉

**Total Pool:** 10,000,000 HYPE
**Your Balance:** ${CONFIG.airdrop.tasks.joinTelegram} HYPE

**Complete Tasks to Earn More:**

1️⃣ Follow Twitter (+${CONFIG.airdrop.tasks.followTwitter} HYPE)
   ${CONFIG.project.twitter}

2️⃣ Retweet pinned post (+${CONFIG.airdrop.tasks.retweetPost} HYPE)

3️⃣ Invite friends (+${CONFIG.airdrop.referralBonus} HYPE each)
   Get link: /referral

**Leaderboard:**
Top 10 participants get BONUS 10,000 HYPE each! 🏆

Let's go! 🚀
    `.trim();

    await this.bot.sendMessage(chatId, welcomeAirdropText, { parse_mode: 'Markdown' });
  }

  /**
   * Handle /referral command
   */
  async handleReferral(msg) {
    const chatId = msg.chat.id;
    const userId = msg.from.id;

    // Check if registered for airdrop
    if (!this.db.airdrop[userId]) {
      await this.bot.sendMessage(chatId,
        '⚠️ Join the airdrop first: /airdrop',
        { parse_mode: 'Markdown' }
      );
      return;
    }

    const referralLink = `https://t.me/${CONFIG.telegram.botToken.split(':')[0]}?start=ref${userId}`;
    const user = this.db.airdrop[userId];

    const referralText = `
🔗 **Your Referral Link**

Share this link to earn ${CONFIG.airdrop.referralBonus} HYPE per friend:

\`${referralLink}\`

**Your Stats:**
👥 Referrals: ${user.referrals.length}
💰 Earned: ${user.referrals.length * CONFIG.airdrop.referralBonus} HYPE from referrals

**Top Referrers Leaderboard:**
${this.getTopReferrers(5)}

Share on Twitter, Discord, Reddit for maximum reach! 🚀
    `.trim();

    await this.bot.sendMessage(chatId, referralText, { parse_mode: 'Markdown' });
  }

  /**
   * Handle /price command
   */
  async handlePrice(msg) {
    const chatId = msg.chat.id;

    // Mock price data (в production - real API)
    const price = 0.001234;
    const change24h = 15.5;
    const marketCap = 1234567;
    const volume24h = 234567;

    const priceText = `
📊 **${CONFIG.project.ticker} Price**

💰 **Price:** $${price.toFixed(6)}
📈 **24h Change:** +${change24h}%
💎 **Market Cap:** $${(marketCap / 1000000).toFixed(2)}M
📊 **Volume (24h):** $${(volume24h / 1000).toFixed(0)}K

**Trade Now:**
🦄 Uniswap: ${CONFIG.project.website}/trade
🥞 PancakeSwap: ${CONFIG.project.website}/trade

**Chart:** ${CONFIG.project.website}/chart

To the moon! 🚀🌙
    `.trim();

    await this.bot.sendMessage(chatId, priceText, { parse_mode: 'Markdown' });
  }

  /**
   * Handle /stats command
   */
  async handleStats(msg) {
    const chatId = msg.chat.id;

    const stats = this.getStats();

    const statsText = `
📊 **HypeAI Community Stats**

👥 **Community:**
• Total Members: ${stats.totalMembers}
• Active Today: ${stats.activeToday}
• New This Week: ${stats.newThisWeek}

💎 **Airdrop:**
• Participants: ${stats.airdropParticipants}
• Total Distributed: ${stats.tokensDistributed.toLocaleString()} HYPE
• Avg per User: ${stats.avgPerUser} HYPE

📈 **Growth:**
• Daily Growth: +${stats.dailyGrowth}%
• Weekly Growth: +${stats.weeklyGrowth}%

🔥 **Trending:**
${stats.trending}

Join the movement! 🚀
    `.trim();

    await this.bot.sendMessage(chatId, statsText, { parse_mode: 'Markdown' });
  }

  /**
   * Handle all messages (moderation)
   */
  async handleMessage(msg) {
    if (!msg.text) return;
    if (msg.text.startsWith('/')) return; // Skip commands

    const chatId = msg.chat.id;
    const userId = msg.from.id;
    const text = msg.text.toLowerCase();

    // Anti-spam check
    if (CONFIG.moderation.enabled && CONFIG.moderation.antiSpam) {
      const now = Date.now();
      const userMessages = this.messageCount.get(userId) || [];

      // Remove old messages (older than 1 minute)
      const recentMessages = userMessages.filter(time => now - time < 60000);

      if (recentMessages.length >= CONFIG.moderation.maxMessagesPerMinute) {
        await this.bot.deleteMessage(chatId, msg.message_id);
        await this.bot.sendMessage(chatId,
          `⚠️ @${msg.from.username}, please slow down! Anti-spam protection.`,
          { parse_mode: 'Markdown' }
        );
        return;
      }

      recentMessages.push(now);
      this.messageCount.set(userId, recentMessages);
    }

    // Bad words filter
    if (CONFIG.moderation.enabled) {
      for (const badWord of CONFIG.moderation.badWords) {
        if (text.includes(badWord)) {
          await this.bot.deleteMessage(chatId, msg.message_id);
          await this.bot.sendMessage(chatId,
            `⚠️ Message removed. Please keep discussions respectful.`,
            { parse_mode: 'Markdown' }
          );
          return;
        }
      }
    }

    // Track analytics
    if (CONFIG.analytics.enabled && CONFIG.analytics.trackMessages) {
      this.trackEvent('message_sent', {
        userId,
        chatId,
        timestamp: Date.now()
      });
    }
  }

  /**
   * Auto-posting content
   */
  async startAutoPosting() {
    console.log('📢 Auto-posting enabled (every 4 hours)\n');

    const postContent = async () => {
      const postType = CONFIG.autoPost.types[
        Math.floor(Math.random() * CONFIG.autoPost.types.length)
      ];

      const content = this.generateContent(postType);

      try {
        await this.bot.sendMessage(CONFIG.telegram.channelId, content, {
          parse_mode: 'Markdown'
        });
        console.log(`✅ Posted ${postType} content to channel`);
      } catch (error) {
        console.error('Error posting to channel:', error.message);
      }
    };

    // Post immediately
    await postContent();

    // Then schedule
    setInterval(postContent, CONFIG.autoPost.interval);
  }

  /**
   * Generate content for auto-posting
   */
  generateContent(type) {
    const contents = {
      news: `
🚨 **Market Update**

${CONFIG.project.ticker} continues strong growth! 📈

• Price: $0.001234 (+15.5% 24h)
• Volume: $234K
• Holders: 5,234
• Stakers: 1,456

Our AI predictions show bullish trend for next 48h! 🎯

Trade now: ${CONFIG.project.website}/trade

#HypeAI #DeFi #AI
      `.trim(),

      update: `
🔔 **Development Update**

Great progress this week! ✅

✅ Smart contracts audited by CertiK
✅ Staking platform optimized
✅ Mobile app in beta testing
✅ New exchange listing confirmed

🔜 Coming soon:
• Advanced trading features
• Cross-chain bridge
• NFT marketplace

Stay tuned! 🚀
      `.trim(),

      meme: `
📊 When you check ${CONFIG.project.ticker} price:

Yesterday: 😴 "$0.00122"
Today: 🤯 "$0.00123"

We're going to the moon! 🚀🌙

(Just kidding, but seriously stake for 62% APY 💎)

#CryptoMemes #DeFi
      `.trim(),

      signal: `
🎯 **AI Trading Signal**

Asset: BTC/USDT
Signal: LONG
Entry: $43,200 - $43,500
Target: $45,000
Stop Loss: $42,800
Confidence: 87%

⚡ Powered by ${CONFIG.project.name} AI

*Not financial advice. DYOR.*
      `.trim(),

      educational: `
💡 **DeFi Education**

What is APY?

APY = Annual Percentage Yield

It's the REAL return on your investment, including compound interest.

Example:
• Stake 10,000 HYPE at 62% APY
• After 1 year: 16,200 HYPE
• Profit: 6,200 HYPE 💰

${CONFIG.project.name} offers up to 62% APY!

Start staking: ${CONFIG.project.website}/stake

#DeFi #Education
      `.trim()
    };

    return contents[type] || contents.news;
  }

  /**
   * Start analytics tracking
   */
  startAnalytics() {
    console.log('📊 Analytics tracking enabled\n');

    // Save analytics every hour
    setInterval(() => {
      this.saveDatabase();
      console.log('💾 Analytics saved');
    }, 60 * 60 * 1000);
  }

  /**
   * Track event
   */
  trackEvent(eventType, data) {
    if (!this.db.analytics[eventType]) {
      this.db.analytics[eventType] = [];
    }

    this.db.analytics[eventType].push({
      ...data,
      timestamp: Date.now()
    });
  }

  /**
   * Get statistics
   */
  getStats() {
    const totalMembers = Object.keys(this.db.airdrop).length;
    const tokensDistributed = Object.values(this.db.airdrop)
      .reduce((sum, user) => sum + user.tokensEarned, 0);

    return {
      totalMembers,
      activeToday: 234, // Mock
      newThisWeek: 567, // Mock
      airdropParticipants: totalMembers,
      tokensDistributed,
      avgPerUser: Math.floor(tokensDistributed / totalMembers) || 0,
      dailyGrowth: 12.5, // Mock
      weeklyGrowth: 45.2, // Mock
      trending: '🔥 AI predictions\n🔥 Staking pools\n🔥 Mobile app'
    };
  }

  /**
   * Get top referrers
   */
  getTopReferrers(limit = 5) {
    const users = Object.values(this.db.airdrop)
      .sort((a, b) => b.referrals.length - a.referrals.length)
      .slice(0, limit);

    return users
      .map((user, i) =>
        `${i + 1}. @${user.username || 'Anonymous'} - ${user.referrals.length} referrals`
      )
      .join('\n') || 'No referrals yet. Be the first!';
  }

  /**
   * Load database
   */
  loadDatabase() {
    const dbPath = path.join(__dirname, '../.telegram/database.json');

    if (fs.existsSync(dbPath)) {
      return JSON.parse(fs.readFileSync(dbPath, 'utf8'));
    }

    return {
      airdrop: {},
      analytics: {},
      users: {}
    };
  }

  /**
   * Save database
   */
  saveDatabase() {
    const dbPath = path.join(__dirname, '../.telegram/database.json');
    const dir = path.dirname(dbPath);

    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(dbPath, JSON.stringify(this.db, null, 2));
  }
}

// ============================================================================
// CLI COMMANDS
// ============================================================================

async function main() {
  const bot = new TelegramCommunityBot();
  await bot.start();

  // Graceful shutdown
  process.on('SIGINT', () => {
    console.log('\n\n🛑 Shutting down bot...');
    bot.saveDatabase();
    console.log('💾 Database saved');
    console.log('👋 Goodbye!\n');
    process.exit(0);
  });
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}

module.exports = TelegramCommunityBot;
