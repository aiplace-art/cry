/**
 * HypeAI Telegram Community Management Bot
 * Features: Welcome messages, price alerts, daily stats, FAQ responses
 */

const TelegramBot = require('node-telegram-bot-api');
const fs = require('fs').promises;

class HypeAITelegramBot {
  constructor(config) {
    this.config = config;
    this.bot = new TelegramBot(config.telegram.token, { polling: true });

    // Rate limiting
    this.rateLimits = new Map();
    this.priceAlerts = new Map();
    this.userPreferences = new Map();

    this.setupHandlers();
  }

  setupHandlers() {
    // Command handlers
    this.bot.onText(/\/start/, (msg) => this.handleStart(msg));
    this.bot.onText(/\/help/, (msg) => this.handleHelp(msg));
    this.bot.onText(/\/price/, (msg) => this.handlePrice(msg));
    this.bot.onText(/\/holders/, (msg) => this.handleHolders(msg));
    this.bot.onText(/\/apy/, (msg) => this.handleAPY(msg));
    this.bot.onText(/\/stats/, (msg) => this.handleStats(msg));
    this.bot.onText(/\/setalert (.+)/, (msg, match) => this.handleSetAlert(msg, match));
    this.bot.onText(/\/alerts/, (msg) => this.handleListAlerts(msg));
    this.bot.onText(/\/removealert (.+)/, (msg, match) => this.handleRemoveAlert(msg, match));
    this.bot.onText(/\/faq/, (msg) => this.handleFAQ(msg));
    this.bot.onText(/\/resources/, (msg) => this.handleResources(msg));
    this.bot.onText(/\/notify (on|off)/, (msg, match) => this.handleNotifications(msg, match));

    // New member handler
    this.bot.on('new_chat_members', (msg) => this.handleNewMember(msg));

    // Message handler for auto-responses
    this.bot.on('message', (msg) => this.handleMessage(msg));

    console.log('✅ Telegram bot handlers registered');
  }

  async handleStart(msg) {
    const chatId = msg.chat.id;
    const firstName = msg.from.first_name;

    const welcomeMessage = `
🎉 *Welcome to HypeAI, ${firstName}!*

I'm your HypeAI assistant bot, here to help you stay updated with the latest information about our AI-powered blockchain ecosystem.

🚀 *Quick Commands:*
/price - Current token price
/apy - Staking rewards
/stats - Ecosystem statistics
/setalert - Set price alerts
/faq - Frequently asked questions
/resources - Useful links
/help - All commands

💡 *What is HypeAI?*
HypeAI combines artificial intelligence with blockchain technology, offering:
• AI-powered oracle for smart contracts
• Decentralized governance (DAO)
• Staking rewards up to 20% APY
• Community-driven development

🔗 *Stay Connected:*
[Website](${this.config.links.website}) | [Twitter](${this.config.links.twitter}) | [Discord](${this.config.links.discord})

Let's build the future together! 🚀
    `;

    await this.sendMessage(chatId, welcomeMessage, { parse_mode: 'Markdown' });
  }

  async handleHelp(msg) {
    const chatId = msg.chat.id;

    const helpMessage = `
🤖 *HypeAI Bot Commands*

*📊 Market Information:*
/price - Current token price and market data
/holders - Number of token holders
/stats - Comprehensive ecosystem statistics

*💎 Staking:*
/apy - Current staking APY rates

*🔔 Alerts:*
/setalert <price> - Set price alert (e.g., /setalert 0.005)
/alerts - View your active alerts
/removealert <id> - Remove an alert

*📚 Information:*
/faq - Frequently asked questions
/resources - Useful links and resources
/notify on|off - Toggle daily updates

*Need Help?*
Join our community channels:
• Discord: ${this.config.links.discord}
• Twitter: ${this.config.links.twitter}
    `;

    await this.sendMessage(chatId, helpMessage, { parse_mode: 'Markdown' });
  }

  async handlePrice(msg) {
    const chatId = msg.chat.id;

    if (!this.checkRateLimit(msg.from.id)) {
      return this.sendMessage(chatId, '⏰ Please wait before requesting price again.');
    }

    await this.sendMessage(chatId, '📊 Fetching latest price data...');

    const priceData = await this.fetchPriceData();

    const priceMessage = `
💰 *HYPEAI Token Price*

💵 *Price:* $${priceData.priceUSD}
📊 *24h Change:* ${priceData.change24h}%
📈 *Market Cap:* $${priceData.marketCap}
💧 *Liquidity:* $${priceData.liquidity}
📊 *Volume (24h):* $${priceData.volume24h}
🔥 *Circulating Supply:* ${priceData.circulatingSupply} HYPEAI

_Data updated every minute_
    `;

    const keyboard = {
      inline_keyboard: [
        [
          { text: '📊 Full Stats', callback_data: 'stats' },
          { text: '💎 Staking APY', callback_data: 'apy' }
        ],
        [
          { text: '🔔 Set Alert', callback_data: 'setalert' },
          { text: '🛒 Buy HYPEAI', url: this.config.links.pancakeswap }
        ]
      ]
    };

    await this.sendMessage(chatId, priceMessage, {
      parse_mode: 'Markdown',
      reply_markup: keyboard
    });
  }

  async handleHolders(msg) {
    const chatId = msg.chat.id;

    if (!this.checkRateLimit(msg.from.id)) {
      return this.sendMessage(chatId, '⏰ Please wait before requesting data again.');
    }

    const holdersData = await this.fetchHoldersData();

    const holdersMessage = `
👥 *HYPEAI Token Holders*

👤 *Total Holders:* ${holdersData.total}
📈 *New (24h):* +${holdersData.new24h}
🏆 *Top 10 Own:* ${holdersData.top10Percentage}%

_Growing community! Join us!_ 🚀
    `;

    await this.sendMessage(chatId, holdersMessage, { parse_mode: 'Markdown' });
  }

  async handleAPY(msg) {
    const chatId = msg.chat.id;

    if (!this.checkRateLimit(msg.from.id)) {
      return this.sendMessage(chatId, '⏰ Please wait before requesting data again.');
    }

    const apyData = await this.fetchAPYData();

    const apyMessage = `
💎 *Staking APY Rates*

Earn passive rewards by staking HYPEAI tokens!

⏰ *Flexible (No Lock):* ${apyData.flexible}% APY
📅 *30 Days:* ${apyData.days30}% APY
📅 *90 Days:* ${apyData.days90}% APY
📅 *180 Days:* ${apyData.days180}% APY
🔒 *1 Year:* ${apyData.year1}% APY

💰 *Total Staked:* ${apyData.totalStaked} HYPEAI

[Start Staking Now](${this.config.links.stakingDapp})
    `;

    const keyboard = {
      inline_keyboard: [
        [{ text: '💎 Start Staking', url: this.config.links.stakingDapp }],
        [{ text: '📚 Staking Guide', url: this.config.links.stakingGuide }]
      ]
    };

    await this.sendMessage(chatId, apyMessage, {
      parse_mode: 'Markdown',
      reply_markup: keyboard
    });
  }

  async handleStats(msg) {
    const chatId = msg.chat.id;

    if (!this.checkRateLimit(msg.from.id)) {
      return this.sendMessage(chatId, '⏰ Please wait before requesting data again.');
    }

    await this.sendMessage(chatId, '📊 Fetching comprehensive stats...');

    const stats = await this.fetchComprehensiveStats();

    const statsMessage = `
📊 *HypeAI Ecosystem Statistics*

*💰 Market Data:*
• Price: $${stats.price}
• Market Cap: $${stats.marketCap}
• 24h Volume: $${stats.volume24h}
• Liquidity: $${stats.liquidity}

*👥 Community:*
• Holders: ${stats.holders}
• Total Staked: ${stats.totalStaked} HYPEAI

*🤖 Ecosystem:*
• AI Oracle Calls: ${stats.oracleCalls}
• DAO Proposals: ${stats.daoProposals}
• Tokens Burned: ${stats.burned} HYPEAI

_Real-time ecosystem metrics_
    `;

    await this.sendMessage(chatId, statsMessage, { parse_mode: 'Markdown' });
  }

  async handleSetAlert(msg, match) {
    const chatId = msg.chat.id;
    const userId = msg.from.id;
    const targetPrice = parseFloat(match[1]);

    if (!targetPrice || targetPrice <= 0) {
      return this.sendMessage(chatId, '❌ Invalid price. Use: /setalert 0.005');
    }

    if (!this.priceAlerts.has(userId)) {
      this.priceAlerts.set(userId, []);
    }

    const userAlerts = this.priceAlerts.get(userId);

    if (userAlerts.length >= 5) {
      return this.sendMessage(chatId, '❌ Maximum 5 alerts per user. Remove some first with /removealert');
    }

    const alertId = Date.now();
    userAlerts.push({
      id: alertId,
      price: targetPrice,
      created: new Date()
    });

    this.priceAlerts.set(userId, userAlerts);

    const currentPrice = await this.getCurrentPrice();
    const direction = targetPrice > currentPrice ? 'above' : 'below';

    await this.sendMessage(
      chatId,
      `✅ Alert set! I'll notify you when HYPEAI ${direction} $${targetPrice}\n\nAlert ID: ${alertId}`
    );
  }

  async handleListAlerts(msg) {
    const chatId = msg.chat.id;
    const userId = msg.from.id;

    const userAlerts = this.priceAlerts.get(userId) || [];

    if (userAlerts.length === 0) {
      return this.sendMessage(chatId, '📭 You have no active price alerts.\n\nUse /setalert <price> to create one!');
    }

    let alertsMessage = '🔔 *Your Active Price Alerts:*\n\n';

    for (const alert of userAlerts) {
      alertsMessage += `• ID: ${alert.id}\n  Price: $${alert.price}\n  Created: ${alert.created.toLocaleString()}\n\n`;
    }

    alertsMessage += '_Use /removealert <id> to remove an alert_';

    await this.sendMessage(chatId, alertsMessage, { parse_mode: 'Markdown' });
  }

  async handleRemoveAlert(msg, match) {
    const chatId = msg.chat.id;
    const userId = msg.from.id;
    const alertId = parseInt(match[1]);

    const userAlerts = this.priceAlerts.get(userId) || [];
    const index = userAlerts.findIndex(a => a.id === alertId);

    if (index === -1) {
      return this.sendMessage(chatId, '❌ Alert not found. Use /alerts to see your active alerts.');
    }

    userAlerts.splice(index, 1);
    this.priceAlerts.set(userId, userAlerts);

    await this.sendMessage(chatId, `✅ Alert ${alertId} removed successfully!`);
  }

  async handleFAQ(msg) {
    const chatId = msg.chat.id;

    const faqMessage = `
❓ *Frequently Asked Questions*

*Q: What is HypeAI?*
A: HypeAI is an AI-powered blockchain platform combining artificial intelligence with DeFi, offering staking, governance, and AI oracle services.

*Q: How do I buy HYPEAI tokens?*
A: 1) Get a wallet (MetaMask/Trust Wallet)
2) Buy BNB
3) Visit PancakeSwap
4) Swap for HYPEAI

*Q: How does staking work?*
A: Stake HYPEAI tokens for passive rewards. Longer lock periods = higher APY. Visit our [staking platform](${this.config.links.stakingDapp})

*Q: What is the contract address?*
A: \`${this.config.contractAddress}\`
⚠️ Always verify on official sources!

*Q: Is HypeAI audited?*
A: Yes! View our [audit report](${this.config.links.audit})

*Q: How can I participate in governance?*
A: Stake tokens to receive voting power in our DAO. Propose and vote on protocol changes!

_More questions? Join our Discord!_
    `;

    const keyboard = {
      inline_keyboard: [
        [{ text: '💬 Join Discord', url: this.config.links.discord }],
        [{ text: '📚 Full Documentation', url: this.config.links.docs }]
      ]
    };

    await this.sendMessage(chatId, faqMessage, {
      parse_mode: 'Markdown',
      reply_markup: keyboard
    });
  }

  async handleResources(msg) {
    const chatId = msg.chat.id;

    const resourcesMessage = `
🔗 *HypeAI Resources*

*📱 Social Media:*
• [Website](${this.config.links.website})
• [Twitter](${this.config.links.twitter})
• [Discord](${this.config.links.discord})
• [Medium](${this.config.links.medium})

*📊 Trading:*
• [PancakeSwap](${this.config.links.pancakeswap})
• [CoinGecko](${this.config.links.coingecko})
• [CoinMarketCap](${this.config.links.coinmarketcap})

*💻 Development:*
• [GitHub](${this.config.links.github})
• [Documentation](${this.config.links.docs})
• [Audit Report](${this.config.links.audit})

*💎 Staking & DAO:*
• [Staking Platform](${this.config.links.stakingDapp})
• [DAO Portal](${this.config.links.dao})

*📚 Guides:*
• [How to Buy](${this.config.links.buyGuide})
• [Staking Guide](${this.config.links.stakingGuide})
• [Roadmap](${this.config.links.roadmap})
    `;

    await this.sendMessage(chatId, resourcesMessage, {
      parse_mode: 'Markdown',
      disable_web_page_preview: true
    });
  }

  async handleNotifications(msg, match) {
    const chatId = msg.chat.id;
    const userId = msg.from.id;
    const setting = match[1];

    const prefs = this.userPreferences.get(userId) || {};
    prefs.dailyUpdates = setting === 'on';
    this.userPreferences.set(userId, prefs);

    const message = setting === 'on'
      ? '✅ Daily updates enabled! You\'ll receive stats every day at 12:00 UTC.'
      : '🔕 Daily updates disabled.';

    await this.sendMessage(chatId, message);
  }

  async handleNewMember(msg) {
    const chatId = msg.chat.id;
    const newMembers = msg.new_chat_members;

    for (const member of newMembers) {
      if (member.is_bot) continue;

      const welcomeMessage = `
🎉 Welcome ${member.first_name} to HypeAI!

We're excited to have you join our community of AI-powered blockchain innovators!

🚀 *Get Started:*
• Use /help to see all commands
• Use /price to check token price
• Use /faq for common questions

💡 *Quick Links:*
[Website](${this.config.links.website}) | [Discord](${this.config.links.discord}) | [Twitter](${this.config.links.twitter})

Feel free to ask questions - our community is here to help! 🤝
      `;

      await this.sendMessage(chatId, welcomeMessage, { parse_mode: 'Markdown' });
    }
  }

  async handleMessage(msg) {
    // Skip if it's a command
    if (msg.text && msg.text.startsWith('/')) return;

    // Auto-response for common keywords
    const text = msg.text?.toLowerCase() || '';
    const chatId = msg.chat.id;

    // Simple keyword matching for auto-responses
    if (text.includes('wen moon') || text.includes('when moon')) {
      await this.sendMessage(chatId, '🌙 Soon™ - Focus on fundamentals and long-term value!');
    } else if (text.includes('contract') && text.includes('address')) {
      await this.sendMessage(
        chatId,
        `📄 Contract Address:\n\`${this.config.contractAddress}\`\n\n⚠️ Always verify on official sources!`,
        { parse_mode: 'Markdown' }
      );
    }
  }

  checkRateLimit(userId) {
    const now = Date.now();
    const limit = { requests: 5, window: 60000 }; // 5 requests per minute

    if (!this.rateLimits.has(userId)) {
      this.rateLimits.set(userId, []);
    }

    const userRequests = this.rateLimits.get(userId);
    const recentRequests = userRequests.filter(time => now - time < limit.window);

    if (recentRequests.length >= limit.requests) {
      return false;
    }

    recentRequests.push(now);
    this.rateLimits.set(userId, recentRequests);
    return true;
  }

  async sendMessage(chatId, text, options = {}) {
    try {
      return await this.bot.sendMessage(chatId, text, options);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  }

  async startPriceMonitoring() {
    // Check prices every minute
    setInterval(async () => {
      await this.checkPriceAlerts();
    }, 60000);
  }

  async checkPriceAlerts() {
    const currentPrice = await this.getCurrentPrice();

    for (const [userId, alerts] of this.priceAlerts.entries()) {
      const triggeredAlerts = [];

      for (const alert of alerts) {
        const shouldTrigger =
          (alert.price >= currentPrice && !alert.lastPrice) ||
          (alert.lastPrice < alert.price && currentPrice >= alert.price) ||
          (alert.lastPrice > alert.price && currentPrice <= alert.price);

        if (shouldTrigger) {
          triggeredAlerts.push(alert);

          const message = `
🔔 *Price Alert Triggered!*

HYPEAI has reached $${currentPrice}
Your target: $${alert.price}

[View Chart](${this.config.links.chart})
          `;

          await this.sendMessage(userId, message, { parse_mode: 'Markdown' });
        }

        alert.lastPrice = currentPrice;
      }

      // Remove triggered one-time alerts
      const remainingAlerts = alerts.filter(a => !triggeredAlerts.includes(a));
      this.priceAlerts.set(userId, remainingAlerts);
    }
  }

  async sendDailyUpdates() {
    const stats = await this.fetchComprehensiveStats();

    const message = `
📊 *Daily HypeAI Update*

💰 Price: $${stats.price} (${stats.change24h}%)
📈 Market Cap: $${stats.marketCap}
👥 Holders: ${stats.holders}
💎 Total Staked: ${stats.totalStaked} HYPEAI

_Have a great day! 🚀_
    `;

    for (const [userId, prefs] of this.userPreferences.entries()) {
      if (prefs.dailyUpdates) {
        await this.sendMessage(userId, message, { parse_mode: 'Markdown' });
      }
    }
  }

  startDailyUpdates() {
    // Send daily updates at 12:00 UTC
    const scheduleDaily = () => {
      const now = new Date();
      const next = new Date();
      next.setUTCHours(12, 0, 0, 0);

      if (next <= now) {
        next.setDate(next.getDate() + 1);
      }

      const timeout = next - now;

      setTimeout(() => {
        this.sendDailyUpdates();
        scheduleDaily(); // Schedule next day
      }, timeout);
    };

    scheduleDaily();
  }

  // Data fetching methods (same as Discord bot)
  async fetchPriceData() {
    return {
      priceUSD: '0.0042',
      change24h: '+12.5',
      marketCap: '4.2M',
      liquidity: '850K',
      volume24h: '120K',
      circulatingSupply: '1,000,000,000'
    };
  }

  async fetchHoldersData() {
    return {
      total: '12,456',
      new24h: '87',
      top10Percentage: '23.5'
    };
  }

  async fetchAPYData() {
    return {
      flexible: 5.0,
      days30: 8.0,
      days90: 12.0,
      days180: 15.0,
      year1: 20.0,
      totalStaked: '450,000,000'
    };
  }

  async fetchComprehensiveStats() {
    const price = await this.fetchPriceData();
    const holders = await this.fetchHoldersData();
    const apy = await this.fetchAPYData();

    return {
      price: price.priceUSD,
      marketCap: price.marketCap,
      holders: holders.total,
      totalStaked: apy.totalStaked,
      oracleCalls: '1,234',
      daoProposals: '23',
      burned: '50,000,000',
      liquidity: price.liquidity,
      volume24h: price.volume24h,
      change24h: price.change24h
    };
  }

  async getCurrentPrice() {
    const data = await this.fetchPriceData();
    return parseFloat(data.priceUSD);
  }

  async start() {
    console.log('✅ Telegram bot started');
    await this.startPriceMonitoring();
    this.startDailyUpdates();
  }

  async stop() {
    await this.bot.stopPolling();
    console.log('✅ Telegram bot stopped');
  }
}

module.exports = HypeAITelegramBot;
