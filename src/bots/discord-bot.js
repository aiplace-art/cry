/**
 * HypeAI Discord Community Management Bot
 * Features: Welcome messages, auto-roles, FAQ, price/stats commands, moderation
 */

const { Client, GatewayIntentBits, EmbedBuilder, PermissionFlagsBits, AttachmentBuilder } = require('discord.js');
const fs = require('fs').promises;
const path = require('path');

class HypeAIDiscordBot {
  constructor(config) {
    this.config = config;
    this.client = new Client({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMessageReactions,
      ]
    });

    // Rate limiting per user
    this.rateLimits = new Map();
    this.spamTracking = new Map();
    this.moderationQueue = [];

    // Scam patterns
    this.scamPatterns = [
      /free\s*(airdrop|token|crypto)/i,
      /dm\s*me/i,
      /double\s*your/i,
      /guaranteed\s*profit/i,
      /admin.*dm/i,
      /verify.*wallet/i,
      /metamask.*phrase/i,
      /seed\s*phrase/i,
    ];

    this.setupEventHandlers();
  }

  setupEventHandlers() {
    this.client.once('ready', () => this.onReady());
    this.client.on('guildMemberAdd', (member) => this.onMemberJoin(member));
    this.client.on('messageCreate', (message) => this.onMessage(message));
    this.client.on('interactionCreate', (interaction) => this.onInteraction(interaction));
  }

  async onReady() {
    console.log(`✅ HypeAI Discord Bot ready! Logged in as ${this.client.user.tag}`);
    console.log(`📊 Monitoring ${this.client.guilds.cache.size} servers`);

    // Set bot status
    this.client.user.setActivity('!help for commands', { type: 'WATCHING' });

    // Register slash commands
    await this.registerCommands();

    // Start periodic tasks
    this.startPeriodicTasks();
  }

  async registerCommands() {
    const commands = [
      {
        name: 'price',
        description: 'Get current HYPEAI token price and market stats'
      },
      {
        name: 'holders',
        description: 'Get current number of token holders'
      },
      {
        name: 'apy',
        description: 'Get current staking APY rates'
      },
      {
        name: 'rewards',
        description: 'Calculate staking rewards',
        options: [
          {
            name: 'amount',
            type: 4, // INTEGER
            description: 'Amount of HYPEAI tokens to stake',
            required: true
          },
          {
            name: 'duration',
            type: 4,
            description: 'Staking duration in days',
            required: true
          }
        ]
      },
      {
        name: 'stats',
        description: 'Get comprehensive HypeAI ecosystem statistics'
      },
      {
        name: 'help',
        description: 'Show all available commands and bot features'
      }
    ];

    try {
      for (const guild of this.client.guilds.cache.values()) {
        await guild.commands.set(commands);
      }
      console.log('✅ Slash commands registered successfully');
    } catch (error) {
      console.error('❌ Error registering commands:', error);
    }
  }

  async onMemberJoin(member) {
    try {
      const welcomeChannel = member.guild.channels.cache.find(
        ch => ch.name === this.config.discord.welcomeChannel || ch.name === 'general'
      );

      if (welcomeChannel) {
        const embed = new EmbedBuilder()
          .setColor('#00D4FF')
          .setTitle(`🎉 Welcome to HypeAI, ${member.user.username}!`)
          .setDescription(
            `We're excited to have you join our community of AI-powered blockchain innovators!\n\n` +
            `🚀 **Get Started:**\n` +
            `• Read our <#rules-channel> and <#faq-channel>\n` +
            `• Introduce yourself in <#introductions>\n` +
            `• Check out our [Website](${this.config.links.website})\n` +
            `• Follow us on [Twitter](${this.config.links.twitter})\n\n` +
            `💡 **Quick Commands:**\n` +
            `• \`/price\` - Current token price\n` +
            `• \`/apy\` - Staking rewards\n` +
            `• \`/help\` - All commands\n\n` +
            `React below to get your roles!`
          )
          .setThumbnail(member.user.displayAvatarURL())
          .setFooter({ text: 'HypeAI - AI Meets Blockchain' })
          .setTimestamp();

        const welcomeMsg = await welcomeChannel.send({ embeds: [embed] });

        // Add reaction roles
        await welcomeMsg.react('🎯'); // Investor
        await welcomeMsg.react('💻'); // Developer
        await welcomeMsg.react('📢'); // News
      }

      // Auto-assign base role
      const memberRole = member.guild.roles.cache.find(role => role.name === 'Community Member');
      if (memberRole) {
        await member.roles.add(memberRole);
      }

      // Send DM with welcome info
      try {
        await member.send(
          `👋 Welcome to HypeAI!\n\n` +
          `Thanks for joining our community. Here are some useful links:\n` +
          `🌐 Website: ${this.config.links.website}\n` +
          `📚 Docs: ${this.config.links.docs}\n` +
          `💬 Telegram: ${this.config.links.telegram}\n\n` +
          `Feel free to ask questions in the server. Our community is here to help!`
        );
      } catch (err) {
        // User has DMs disabled
        console.log(`Could not DM new member ${member.user.tag}`);
      }

    } catch (error) {
      console.error('Error in member join handler:', error);
    }
  }

  async onMessage(message) {
    // Ignore bot messages
    if (message.author.bot) return;

    // Check for spam
    if (await this.checkSpam(message)) {
      return;
    }

    // Check for scam content
    if (await this.checkScam(message)) {
      return;
    }

    // Rate limiting
    if (!this.checkRateLimit(message.author.id)) {
      return;
    }

    // Handle commands with prefix
    if (message.content.startsWith(this.config.discord.prefix)) {
      await this.handlePrefixCommand(message);
    }

    // Auto-responses for common questions
    await this.handleAutoResponse(message);
  }

  async handlePrefixCommand(message) {
    const args = message.content.slice(this.config.discord.prefix.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();

    try {
      switch (command) {
        case 'price':
          await this.sendPriceInfo(message);
          break;
        case 'holders':
          await this.sendHoldersInfo(message);
          break;
        case 'apy':
          await this.sendAPYInfo(message);
          break;
        case 'stats':
          await this.sendStatsInfo(message);
          break;
        case 'help':
          await this.sendHelp(message);
          break;
        case 'rewards':
          await this.calculateRewards(message, args);
          break;
        default:
          // Unknown command - do nothing
          break;
      }
    } catch (error) {
      console.error(`Error executing command ${command}:`, error);
      await message.reply('❌ An error occurred while processing your command. Please try again.');
    }
  }

  async onInteraction(interaction) {
    if (!interaction.isChatInputCommand()) return;

    try {
      switch (interaction.commandName) {
        case 'price':
          await this.sendPriceInfo(interaction);
          break;
        case 'holders':
          await this.sendHoldersInfo(interaction);
          break;
        case 'apy':
          await this.sendAPYInfo(interaction);
          break;
        case 'stats':
          await this.sendStatsInfo(interaction);
          break;
        case 'help':
          await this.sendHelp(interaction);
          break;
        case 'rewards':
          const amount = interaction.options.getInteger('amount');
          const duration = interaction.options.getInteger('duration');
          await this.calculateRewardsInteraction(interaction, amount, duration);
          break;
      }
    } catch (error) {
      console.error('Error handling interaction:', error);
      await interaction.reply({ content: '❌ An error occurred. Please try again.', ephemeral: true });
    }
  }

  async sendPriceInfo(ctx) {
    // Fetch price from API or blockchain
    const priceData = await this.fetchPriceData();

    const embed = new EmbedBuilder()
      .setColor('#00D4FF')
      .setTitle('💰 HYPEAI Token Price')
      .addFields(
        { name: '💵 Price (USD)', value: `$${priceData.priceUSD}`, inline: true },
        { name: '📊 24h Change', value: `${priceData.change24h}%`, inline: true },
        { name: '📈 Market Cap', value: `$${priceData.marketCap}`, inline: true },
        { name: '💧 Liquidity', value: `$${priceData.liquidity}`, inline: true },
        { name: '📊 Volume 24h', value: `$${priceData.volume24h}`, inline: true },
        { name: '🔥 Circulating Supply', value: `${priceData.circulatingSupply} HYPEAI`, inline: true }
      )
      .setFooter({ text: 'Data updated every minute' })
      .setTimestamp();

    if (ctx.reply) {
      await ctx.reply({ embeds: [embed] });
    } else {
      await ctx.channel.send({ embeds: [embed] });
    }
  }

  async sendHoldersInfo(ctx) {
    const holdersData = await this.fetchHoldersData();

    const embed = new EmbedBuilder()
      .setColor('#00D4FF')
      .setTitle('👥 HYPEAI Token Holders')
      .addFields(
        { name: '👤 Total Holders', value: `${holdersData.total}`, inline: true },
        { name: '📈 New (24h)', value: `+${holdersData.new24h}`, inline: true },
        { name: '🏆 Top 10 Own', value: `${holdersData.top10Percentage}%`, inline: true }
      )
      .setFooter({ text: 'Holder data updated hourly' })
      .setTimestamp();

    if (ctx.reply) {
      await ctx.reply({ embeds: [embed] });
    } else {
      await ctx.channel.send({ embeds: [embed] });
    }
  }

  async sendAPYInfo(ctx) {
    const apyData = await this.fetchAPYData();

    const embed = new EmbedBuilder()
      .setColor('#00D4FF')
      .setTitle('💎 Staking APY Rates')
      .setDescription('Earn passive rewards by staking HYPEAI tokens!')
      .addFields(
        { name: '⏰ Flexible (No Lock)', value: `${apyData.flexible}% APY`, inline: true },
        { name: '📅 30 Days', value: `${apyData.days30}% APY`, inline: true },
        { name: '📅 90 Days', value: `${apyData.days90}% APY`, inline: true },
        { name: '📅 180 Days', value: `${apyData.days180}% APY`, inline: true },
        { name: '🔒 1 Year', value: `${apyData.year1}% APY`, inline: true },
        { name: '💰 Total Staked', value: `${apyData.totalStaked} HYPEAI`, inline: true }
      )
      .setFooter({ text: 'Use /rewards to calculate your earnings' })
      .setTimestamp();

    if (ctx.reply) {
      await ctx.reply({ embeds: [embed] });
    } else {
      await ctx.channel.send({ embeds: [embed] });
    }
  }

  async sendStatsInfo(ctx) {
    const stats = await this.fetchComprehensiveStats();

    const embed = new EmbedBuilder()
      .setColor('#00D4FF')
      .setTitle('📊 HypeAI Ecosystem Statistics')
      .addFields(
        { name: '💰 Token Price', value: `$${stats.price}`, inline: true },
        { name: '📈 Market Cap', value: `$${stats.marketCap}`, inline: true },
        { name: '👥 Holders', value: `${stats.holders}`, inline: true },
        { name: '💎 Total Staked', value: `${stats.totalStaked} HYPEAI`, inline: true },
        { name: '🤖 AI Oracle Calls', value: `${stats.oracleCalls}`, inline: true },
        { name: '🗳️ DAO Proposals', value: `${stats.daoProposals}`, inline: true },
        { name: '🔥 Tokens Burned', value: `${stats.burned} HYPEAI`, inline: true },
        { name: '💧 Liquidity', value: `$${stats.liquidity}`, inline: true },
        { name: '📊 24h Volume', value: `$${stats.volume24h}`, inline: true }
      )
      .setFooter({ text: 'Real-time ecosystem metrics' })
      .setTimestamp();

    if (ctx.reply) {
      await ctx.reply({ embeds: [embed] });
    } else {
      await ctx.channel.send({ embeds: [embed] });
    }
  }

  async calculateRewards(message, args) {
    const amount = parseFloat(args[0]);
    const duration = parseFloat(args[1]);

    if (!amount || !duration || amount <= 0 || duration <= 0) {
      return message.reply('❌ Usage: `!rewards <amount> <duration_in_days>`\nExample: `!rewards 10000 90`');
    }

    await this.performRewardsCalculation(message, amount, duration);
  }

  async calculateRewardsInteraction(interaction, amount, duration) {
    await this.performRewardsCalculation(interaction, amount, duration);
  }

  async performRewardsCalculation(ctx, amount, duration) {
    const apyData = await this.fetchAPYData();
    let apy = apyData.flexible;

    // Determine APY based on duration
    if (duration >= 365) apy = apyData.year1;
    else if (duration >= 180) apy = apyData.days180;
    else if (duration >= 90) apy = apyData.days90;
    else if (duration >= 30) apy = apyData.days30;

    const dailyRate = apy / 365 / 100;
    const rewards = amount * dailyRate * duration;
    const total = amount + rewards;

    const embed = new EmbedBuilder()
      .setColor('#00D4FF')
      .setTitle('🧮 Staking Rewards Calculator')
      .setDescription(`**Staking ${amount.toLocaleString()} HYPEAI for ${duration} days**`)
      .addFields(
        { name: '💎 Initial Stake', value: `${amount.toLocaleString()} HYPEAI`, inline: true },
        { name: '⏰ Duration', value: `${duration} days`, inline: true },
        { name: '📈 APY Rate', value: `${apy}%`, inline: true },
        { name: '💰 Estimated Rewards', value: `${rewards.toLocaleString(undefined, { maximumFractionDigits: 2 })} HYPEAI`, inline: true },
        { name: '🎯 Total After Staking', value: `${total.toLocaleString(undefined, { maximumFractionDigits: 2 })} HYPEAI`, inline: true },
        { name: '📊 Daily Earnings', value: `~${(rewards / duration).toLocaleString(undefined, { maximumFractionDigits: 4 })} HYPEAI`, inline: true }
      )
      .setFooter({ text: 'Estimates based on current APY rates. Actual rewards may vary.' })
      .setTimestamp();

    if (ctx.reply) {
      await ctx.reply({ embeds: [embed] });
    } else {
      await ctx.channel.send({ embeds: [embed] });
    }
  }

  async sendHelp(ctx) {
    const embed = new EmbedBuilder()
      .setColor('#00D4FF')
      .setTitle('🤖 HypeAI Bot Commands')
      .setDescription('Here are all the available commands:')
      .addFields(
        {
          name: '💰 Price & Market',
          value: '`/price` or `!price` - Current token price and market stats\n' +
                 '`/holders` or `!holders` - Number of token holders\n' +
                 '`/stats` or `!stats` - Comprehensive ecosystem statistics',
          inline: false
        },
        {
          name: '💎 Staking',
          value: '`/apy` or `!apy` - Current staking APY rates\n' +
                 '`/rewards <amount> <days>` or `!rewards <amount> <days>` - Calculate staking rewards',
          inline: false
        },
        {
          name: '📚 Resources',
          value: `[Website](${this.config.links.website}) | [Docs](${this.config.links.docs}) | [Twitter](${this.config.links.twitter})`,
          inline: false
        },
        {
          name: '❓ Support',
          value: 'Have questions? Ask in <#support-channel> or DM a moderator!',
          inline: false
        }
      )
      .setFooter({ text: 'HypeAI - AI Meets Blockchain' })
      .setTimestamp();

    if (ctx.reply) {
      await ctx.reply({ embeds: [embed], ephemeral: true });
    } else {
      await ctx.channel.send({ embeds: [embed] });
    }
  }

  async handleAutoResponse(message) {
    const content = message.content.toLowerCase();

    // FAQ auto-responses
    const faqResponses = {
      'how to buy': {
        title: '🛒 How to Buy HYPEAI',
        description: `1. Get a wallet (MetaMask, Trust Wallet)\n` +
                     `2. Buy ETH/BNB\n` +
                     `3. Visit [PancakeSwap](${this.config.links.pancakeswap})\n` +
                     `4. Swap for HYPEAI\n\n` +
                     `📚 Full guide: ${this.config.links.buyGuide}`
      },
      'how to stake': {
        title: '💎 How to Stake HYPEAI',
        description: `1. Visit ${this.config.links.stakingDapp}\n` +
                     `2. Connect your wallet\n` +
                     `3. Choose staking duration\n` +
                     `4. Approve and stake\n\n` +
                     `Use \`/apy\` to see current rates!`
      },
      'contract address': {
        title: '📄 Contract Address',
        description: `**HYPEAI Token:**\n\`\`\`${this.config.contractAddress}\`\`\`\n` +
                     `⚠️ Always verify on official sources!`
      },
      'roadmap': {
        title: '🗺️ HypeAI Roadmap',
        description: `Check our latest roadmap: ${this.config.links.roadmap}\n\n` +
                     `**Key Milestones:**\n` +
                     `✅ Token Launch\n` +
                     `✅ Staking Platform\n` +
                     `🔄 AI Oracle Integration\n` +
                     `🔄 DAO Governance\n` +
                     `📅 Exchange Listings`
      }
    };

    for (const [trigger, response] of Object.entries(faqResponses)) {
      if (content.includes(trigger)) {
        const embed = new EmbedBuilder()
          .setColor('#00D4FF')
          .setTitle(response.title)
          .setDescription(response.description)
          .setFooter({ text: 'Need more help? Ask in #support' });

        await message.reply({ embeds: [embed] });
        return;
      }
    }
  }

  async checkSpam(message) {
    const userId = message.author.id;
    const now = Date.now();

    if (!this.spamTracking.has(userId)) {
      this.spamTracking.set(userId, []);
    }

    const userMessages = this.spamTracking.get(userId);
    userMessages.push(now);

    // Remove messages older than 10 seconds
    const recentMessages = userMessages.filter(time => now - time < 10000);
    this.spamTracking.set(userId, recentMessages);

    // If more than 5 messages in 10 seconds, it's spam
    if (recentMessages.length > 5) {
      await this.handleSpam(message);
      return true;
    }

    return false;
  }

  async handleSpam(message) {
    try {
      await message.delete();

      const warning = await message.channel.send(
        `⚠️ ${message.author}, please slow down! Avoid spamming.`
      );

      setTimeout(() => warning.delete().catch(() => {}), 5000);

      // Add to moderation queue for review
      this.moderationQueue.push({
        type: 'spam',
        user: message.author.tag,
        userId: message.author.id,
        content: message.content,
        timestamp: new Date(),
        action: 'message_deleted'
      });

      await this.notifyModerators('spam', message);

    } catch (error) {
      console.error('Error handling spam:', error);
    }
  }

  async checkScam(message) {
    const content = message.content.toLowerCase();

    // Check for scam patterns
    for (const pattern of this.scamPatterns) {
      if (pattern.test(content)) {
        await this.handleScam(message, pattern);
        return true;
      }
    }

    // Check for suspicious links
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const urls = content.match(urlRegex);
    if (urls) {
      for (const url of urls) {
        if (await this.isSuspiciousURL(url)) {
          await this.handleScam(message, 'suspicious_link');
          return true;
        }
      }
    }

    return false;
  }

  async handleScam(message, pattern) {
    try {
      await message.delete();

      const warning = await message.channel.send(
        `🚨 ${message.author}, your message was flagged as potential scam content and removed.`
      );

      setTimeout(() => warning.delete().catch(() => {}), 10000);

      // Add to moderation queue for human review
      this.moderationQueue.push({
        type: 'scam_detection',
        user: message.author.tag,
        userId: message.author.id,
        content: message.content,
        pattern: pattern.toString(),
        timestamp: new Date(),
        action: 'message_deleted',
        requiresReview: true
      });

      await this.notifyModerators('scam', message, pattern);

    } catch (error) {
      console.error('Error handling scam:', error);
    }
  }

  isSuspiciousURL(url) {
    const whitelist = [
      'hypeai.io',
      'twitter.com',
      'telegram.org',
      'discord.gg',
      'pancakeswap.finance',
      'etherscan.io',
      'bscscan.com'
    ];

    const urlLower = url.toLowerCase();
    return !whitelist.some(domain => urlLower.includes(domain));
  }

  checkRateLimit(userId) {
    const now = Date.now();
    const limit = this.config.discord.rateLimit || { requests: 10, window: 60000 }; // 10 requests per minute

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

  async notifyModerators(type, message, details = null) {
    const modChannel = message.guild.channels.cache.find(
      ch => ch.name === 'mod-logs' || ch.name === 'moderator-logs'
    );

    if (modChannel) {
      const embed = new EmbedBuilder()
        .setColor('#FF0000')
        .setTitle(`🚨 Moderation Alert: ${type.toUpperCase()}`)
        .addFields(
          { name: 'User', value: `${message.author.tag} (${message.author.id})`, inline: true },
          { name: 'Channel', value: `<#${message.channel.id}>`, inline: true },
          { name: 'Time', value: new Date().toLocaleString(), inline: true },
          { name: 'Content', value: message.content.substring(0, 1000) || 'No content', inline: false }
        );

      if (details) {
        embed.addFields({ name: 'Details', value: details.toString(), inline: false });
      }

      await modChannel.send({ embeds: [embed] });
    }
  }

  startPeriodicTasks() {
    // Send daily stats every 24 hours
    setInterval(async () => {
      await this.sendDailyStats();
    }, 24 * 60 * 60 * 1000);

    // Clean up old rate limit data every hour
    setInterval(() => {
      this.cleanupRateLimits();
    }, 60 * 60 * 1000);
  }

  async sendDailyStats() {
    const stats = await this.fetchComprehensiveStats();

    for (const guild of this.client.guilds.cache.values()) {
      const channel = guild.channels.cache.find(
        ch => ch.name === 'announcements' || ch.name === 'general'
      );

      if (channel) {
        const embed = new EmbedBuilder()
          .setColor('#00D4FF')
          .setTitle('📊 Daily HypeAI Stats Update')
          .addFields(
            { name: '💰 Price', value: `$${stats.price}`, inline: true },
            { name: '📈 24h Change', value: `${stats.change24h}%`, inline: true },
            { name: '👥 Holders', value: `${stats.holders}`, inline: true }
          )
          .setFooter({ text: 'Daily stats update' })
          .setTimestamp();

        await channel.send({ embeds: [embed] });
      }
    }
  }

  cleanupRateLimits() {
    const now = Date.now();
    const window = 60000;

    for (const [userId, requests] of this.rateLimits.entries()) {
      const recent = requests.filter(time => now - time < window);
      if (recent.length === 0) {
        this.rateLimits.delete(userId);
      } else {
        this.rateLimits.set(userId, recent);
      }
    }
  }

  // Data fetching methods (mock implementations - replace with real API calls)
  async fetchPriceData() {
    // TODO: Replace with actual API call to DEX/price oracle
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
    // TODO: Replace with blockchain query
    return {
      total: '12,456',
      new24h: '87',
      top10Percentage: '23.5'
    };
  }

  async fetchAPYData() {
    // TODO: Replace with smart contract query
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
    // TODO: Combine multiple data sources
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

  async start() {
    try {
      await this.client.login(this.config.discord.token);
    } catch (error) {
      console.error('❌ Failed to start Discord bot:', error);
      throw error;
    }
  }

  async stop() {
    await this.client.destroy();
    console.log('✅ Discord bot stopped');
  }
}

module.exports = HypeAIDiscordBot;
