#!/usr/bin/env node

/**
 * HYPEAI TWITTER ENGAGEMENT BOT
 *
 * Automated community engagement system with:
 * - Smart mention monitoring and responses
 * - Intelligent content engagement
 * - Influencer relationship building
 * - Anti-spam protection
 * - Rate limiting and safety
 */

const { TwitterApi } = require('twitter-api-v2');
const fs = require('fs').promises;
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env.marketing') });

class TwitterEngagementBot {
  constructor() {
    // Initialize Twitter client
    this.client = new TwitterApi({
      appKey: process.env.TWITTER_API_KEY,
      appSecret: process.env.TWITTER_API_SECRET,
      accessToken: process.env.TWITTER_ACCESS_TOKEN,
      accessSecret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
    });

    this.rwClient = this.client.readWrite;

    // Load configurations
    this.config = this.loadConfig();
    this.responses = this.loadResponses();

    // Rate limiting
    this.rateLimits = {
      likes: { count: 0, resetTime: Date.now() + 3600000 },
      retweets: { count: 0, resetTime: Date.now() + 3600000 },
      replies: { count: 0, resetTime: Date.now() + 3600000 },
      follows: { count: 0, resetTime: Date.now() + 3600000 }
    };

    // Engagement tracking
    this.engagementLog = [];
    this.lastProcessedMention = null;

    // Anti-spam
    this.recentEngagements = new Map(); // userId -> timestamp
    this.blockedUsers = new Set();

    console.log('✅ Twitter Engagement Bot initialized');
  }

  loadConfig() {
    try {
      const configPath = path.join(__dirname, 'engagement-config.json');
      const data = require(configPath);
      return data;
    } catch (error) {
      console.log('⚠️  Using default configuration');
      return this.getDefaultConfig();
    }
  }

  loadResponses() {
    try {
      const responsesPath = path.join(__dirname, 'twitter-responses.json');
      const data = require(responsesPath);
      return data;
    } catch (error) {
      console.log('⚠️  Using default responses');
      return this.getDefaultResponses();
    }
  }

  getDefaultConfig() {
    return {
      monitoring: {
        checkInterval: 120000, // 2 minutes
        maxMentionsPerCheck: 20,
        includeRetweets: false
      },
      engagement: {
        autoReply: true,
        autoLike: true,
        autoRetweet: false,
        replyDelay: { min: 30, max: 180 }, // seconds
        minFollowersToEngage: 10,
        maxEngagementsPerHour: 50
      },
      rateLimits: {
        maxLikesPerHour: 20,
        maxRetweetsPerHour: 10,
        maxRepliesPerHour: 30,
        maxFollowsPerHour: 5
      },
      targeting: {
        keywords: ['bnb', 'bnbchain', 'bsc', 'ai', 'defi', 'crypto', 'web3', 'blockchain'],
        influencerMinFollowers: 1000,
        projectMinFollowers: 500,
        languages: ['en']
      },
      antiSpam: {
        minTimeBetweenEngagements: 300000, // 5 minutes per user
        maxRepliesPerUser: 3,
        blockedKeywords: ['scam', 'fake', 'ponzi', 'rug', 'airdrop claim']
      }
    };
  }

  getDefaultResponses() {
    return {
      greetings: [
        "Hey {user}! 👋 Thanks for reaching out!",
        "Hi {user}! Great to connect with you!",
        "Hello {user}! Thanks for your interest in HypeAI!"
      ],
      questions: {
        whatIsHypeAI: [
          "HypeAI is a revolutionary AI agent ecosystem on BNB Chain! We're building 15 autonomous agents for DeFi, trading, and community management. Learn more: https://hypeai.io",
          "Great question! HypeAI brings autonomous AI agents to BNB Chain - think automated trading, smart governance, and intelligent community tools. Check out our docs: https://hypeai.io"
        ],
        tokenInfo: [
          "$HYPE is our utility token powering the AI agent ecosystem. Launch is scheduled for Nov 2025. Join our Telegram for updates: {telegram}",
          "The $HYPE token will be used for agent services, governance, and staking. Stay tuned for our presale announcement!"
        ],
        howToJoin: [
          "Join our community! \n🔗 Website: {website}\n💬 Telegram: {telegram}\n🚀 More info: https://hypeai.io",
          "Welcome aboard! Here's how to get started:\n1. Follow us here\n2. Join Telegram: {telegram}\n3. Visit: {website}"
        ],
        presale: [
          "Presale details coming soon! Follow us and join our Telegram {telegram} to be first to know! 🚀",
          "We'll announce presale dates in our Telegram community {telegram}. Don't miss out!"
        ]
      },
      engagement: {
        positive: [
          "Thanks for the support! 🚀",
          "Appreciate you! 💙",
          "Love the energy! ⚡",
          "This is the way! 🔥"
        ],
        technical: [
          "Great point! Our team is always innovating. Follow along for updates! 🛠️",
          "Interesting perspective! We'd love to discuss this in our Telegram: {telegram}",
          "Thanks for the feedback! Join our Discord to dive deeper: {discord}"
        ]
      },
      autoResponses: {
        mention: "Thanks for mentioning HypeAI! We're building the future of AI on BNB Chain. 🤖⚡",
        tag: "Hey there! Thanks for tagging us! Check out what we're building: {website}",
        question: "Great question! For detailed info, visit {website} or join our community: {telegram}"
      }
    };
  }

  // ============================================
  // MENTION MONITORING
  // ============================================

  async monitorMentions() {
    try {
      console.log('🔍 Checking mentions...');

      const mentions = await this.rwClient.v2.mentionTimeline(
        process.env.TWITTER_ACCOUNT_ID,
        {
          max_results: this.config.monitoring.maxMentionsPerCheck,
          'tweet.fields': ['author_id', 'created_at', 'public_metrics'],
          'user.fields': ['username', 'public_metrics'],
          expansions: ['author_id']
        }
      );

      if (!mentions.data || mentions.data.data.length === 0) {
        console.log('  No new mentions');
        return;
      }

      const users = mentions.includes?.users || [];

      for (const tweet of mentions.data.data) {
        await this.processMention(tweet, users);
      }

      console.log(`✅ Processed ${mentions.data.data.length} mentions`);
    } catch (error) {
      console.error('❌ Error monitoring mentions:', error.message);
    }
  }

  async processMention(tweet, users) {
    try {
      // Skip if already processed
      if (this.lastProcessedMention && tweet.id <= this.lastProcessedMention) {
        return;
      }

      const author = users.find(u => u.id === tweet.author_id);
      if (!author) return;

      // Anti-spam checks
      if (this.shouldSkipEngagement(author, tweet)) {
        console.log(`  ⏭️  Skipping @${author.username} (spam protection)`);
        return;
      }

      console.log(`  📧 Processing mention from @${author.username}`);

      // Determine response type
      const response = this.generateResponse(tweet.text, author.username);

      // Execute engagement actions
      await this.engageWithTweet(tweet, author, response);

      // Update tracking
      this.lastProcessedMention = tweet.id;
      this.recentEngagements.set(author.id, Date.now());

      this.logEngagement({
        type: 'mention_reply',
        tweetId: tweet.id,
        userId: author.id,
        username: author.username,
        timestamp: Date.now()
      });

    } catch (error) {
      console.error(`  ❌ Error processing mention:`, error.message);
    }
  }

  shouldSkipEngagement(author, tweet) {
    // Check if user is blocked
    if (this.blockedUsers.has(author.id)) {
      return true;
    }

    // Check spam keywords
    const lowerText = tweet.text.toLowerCase();
    const hasSpamKeyword = this.config.antiSpam.blockedKeywords.some(
      keyword => lowerText.includes(keyword.toLowerCase())
    );
    if (hasSpamKeyword) {
      return true;
    }

    // Check recent engagement cooldown
    const lastEngagement = this.recentEngagements.get(author.id);
    if (lastEngagement) {
      const timeSince = Date.now() - lastEngagement;
      if (timeSince < this.config.antiSpam.minTimeBetweenEngagements) {
        return true;
      }
    }

    // Check minimum followers
    if (author.public_metrics.followers_count < this.config.engagement.minFollowersToEngage) {
      return true;
    }

    return false;
  }

  generateResponse(tweetText, username) {
    const lowerText = tweetText.toLowerCase();

    // Check for specific questions
    if (lowerText.includes('what is') || lowerText.includes('what\'s')) {
      return this.selectRandom(this.responses.questions.whatIsHypeAI);
    }

    if (lowerText.includes('token') || lowerText.includes('price')) {
      return this.selectRandom(this.responses.questions.tokenInfo);
    }

    if (lowerText.includes('join') || lowerText.includes('how to')) {
      return this.selectRandom(this.responses.questions.howToJoin);
    }

    if (lowerText.includes('presale') || lowerText.includes('sale')) {
      return this.selectRandom(this.responses.questions.presale);
    }

    // Check sentiment
    const hasPositive = ['great', 'awesome', 'love', 'amazing', 'excited'].some(
      word => lowerText.includes(word)
    );
    if (hasPositive) {
      return this.selectRandom(this.responses.engagement.positive);
    }

    const hasTechnical = ['how', 'why', 'tech', 'code', 'contract'].some(
      word => lowerText.includes(word)
    );
    if (hasTechnical) {
      return this.selectRandom(this.responses.engagement.technical);
    }

    // Default response
    return this.selectRandom(this.responses.greetings);
  }

  async engageWithTweet(tweet, author, responseText) {
    try {
      // Like the tweet
      if (this.config.engagement.autoLike && this.checkRateLimit('likes')) {
        await this.rwClient.v2.like(process.env.TWITTER_ACCOUNT_ID, tweet.id);
        this.incrementRateLimit('likes');
        console.log('    ❤️  Liked tweet');
      }

      // Reply with delay
      if (this.config.engagement.autoReply && this.checkRateLimit('replies')) {
        const delay = this.randomDelay(
          this.config.engagement.replyDelay.min,
          this.config.engagement.replyDelay.max
        );

        await this.sleep(delay * 1000);

        const finalResponse = this.replacePlaceholders(responseText, author.username);

        await this.rwClient.v2.reply(finalResponse, tweet.id);
        this.incrementRateLimit('replies');
        console.log(`    💬 Replied: "${finalResponse}"`);
      }

      // Retweet if high value
      if (this.config.engagement.autoRetweet &&
          this.checkRateLimit('retweets') &&
          this.isHighValueTweet(tweet, author)) {
        await this.rwClient.v2.retweet(process.env.TWITTER_ACCOUNT_ID, tweet.id);
        this.incrementRateLimit('retweets');
        console.log('    🔄 Retweeted');
      }

    } catch (error) {
      console.error('    ❌ Engagement error:', error.message);
    }
  }

  isHighValueTweet(tweet, author) {
    // High follower count
    if (author.public_metrics.followers_count > this.config.targeting.influencerMinFollowers) {
      return true;
    }

    // High engagement on the tweet
    const metrics = tweet.public_metrics;
    if (metrics.like_count > 50 || metrics.retweet_count > 20) {
      return true;
    }

    return false;
  }

  // ============================================
  // CONTENT DISCOVERY & ENGAGEMENT
  // ============================================

  async discoverAndEngage() {
    try {
      console.log('🔍 Discovering relevant content...');

      for (const keyword of this.config.targeting.keywords) {
        await this.searchAndEngage(keyword);
        await this.sleep(5000); // Rate limit protection
      }

    } catch (error) {
      console.error('❌ Discovery error:', error.message);
    }
  }

  async searchAndEngage(keyword) {
    try {
      const tweets = await this.rwClient.v2.search(
        `${keyword} -is:retweet lang:en`,
        {
          max_results: 10,
          'tweet.fields': ['author_id', 'public_metrics', 'created_at'],
          'user.fields': ['username', 'public_metrics'],
          expansions: ['author_id']
        }
      );

      if (!tweets.data || tweets.data.data.length === 0) {
        return;
      }

      const users = tweets.includes?.users || [];

      for (const tweet of tweets.data.data) {
        const author = users.find(u => u.id === tweet.author_id);
        if (!author) continue;

        // Skip our own tweets
        if (author.id === process.env.TWITTER_ACCOUNT_ID) continue;

        // Check if worth engaging
        if (this.shouldEngageWithContent(tweet, author)) {
          await this.engageWithContent(tweet, author);
          await this.sleep(this.randomDelay(10, 30) * 1000);
        }
      }

      console.log(`  ✅ Processed "${keyword}" content`);

    } catch (error) {
      console.error(`  ❌ Error searching "${keyword}":`, error.message);
    }
  }

  shouldEngageWithContent(tweet, author) {
    // Check rate limits
    if (!this.checkRateLimit('likes')) return false;

    // Skip recently engaged users
    const lastEngagement = this.recentEngagements.get(author.id);
    if (lastEngagement && (Date.now() - lastEngagement) < 600000) { // 10 min
      return false;
    }

    // Check minimum quality
    if (author.public_metrics.followers_count < 100) return false;
    if (tweet.public_metrics.like_count < 2) return false;

    // Check spam
    const lowerText = tweet.text.toLowerCase();
    const hasSpam = this.config.antiSpam.blockedKeywords.some(
      keyword => lowerText.includes(keyword.toLowerCase())
    );
    if (hasSpam) return false;

    return true;
  }

  async engageWithContent(tweet, author) {
    try {
      // Like
      if (this.checkRateLimit('likes')) {
        await this.rwClient.v2.like(process.env.TWITTER_ACCOUNT_ID, tweet.id);
        this.incrementRateLimit('likes');
        console.log(`    ❤️  Liked @${author.username}'s tweet`);
      }

      // Retweet high-value content
      if (this.checkRateLimit('retweets') && this.isHighValueTweet(tweet, author)) {
        await this.rwClient.v2.retweet(process.env.TWITTER_ACCOUNT_ID, tweet.id);
        this.incrementRateLimit('retweets');
        console.log(`    🔄 Retweeted @${author.username}`);
      }

      this.recentEngagements.set(author.id, Date.now());

      this.logEngagement({
        type: 'content_engagement',
        tweetId: tweet.id,
        userId: author.id,
        username: author.username,
        timestamp: Date.now()
      });

    } catch (error) {
      console.error(`    ❌ Engagement error:`, error.message);
    }
  }

  // ============================================
  // INFLUENCER ENGAGEMENT
  // ============================================

  async engageWithInfluencers() {
    try {
      console.log('🌟 Engaging with influencers...');

      const targetAccounts = (process.env.TARGET_ACCOUNTS || 'bnbchain,pancakeswap,binance').split(',');

      for (const username of targetAccounts) {
        await this.engageWithAccount(username.trim());
        await this.sleep(10000); // Rate limit
      }

    } catch (error) {
      console.error('❌ Influencer engagement error:', error.message);
    }
  }

  async engageWithAccount(username) {
    try {
      // Get user's recent tweets
      const user = await this.rwClient.v2.userByUsername(username);
      if (!user.data) return;

      const tweets = await this.rwClient.v2.userTimeline(user.data.id, {
        max_results: 5,
        exclude: ['retweets', 'replies']
      });

      if (!tweets.data || tweets.data.data.length === 0) return;

      // Engage with latest tweet
      const latestTweet = tweets.data.data[0];

      if (this.checkRateLimit('likes')) {
        await this.rwClient.v2.like(process.env.TWITTER_ACCOUNT_ID, latestTweet.id);
        this.incrementRateLimit('likes');
        console.log(`  ❤️  Liked @${username}'s tweet`);
      }

    } catch (error) {
      console.error(`  ❌ Error engaging with @${username}:`, error.message);
    }
  }

  // ============================================
  // RATE LIMITING
  // ============================================

  checkRateLimit(action) {
    const limit = this.rateLimits[action];

    // Reset if hour passed
    if (Date.now() > limit.resetTime) {
      limit.count = 0;
      limit.resetTime = Date.now() + 3600000;
    }

    const maxRate = this.config.rateLimits[`max${this.capitalize(action)}PerHour`];
    return limit.count < maxRate;
  }

  incrementRateLimit(action) {
    this.rateLimits[action].count++;
  }

  // ============================================
  // UTILITIES
  // ============================================

  selectRandom(array) {
    return array[Math.floor(Math.random() * array.length)];
  }

  randomDelay(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  replacePlaceholders(text, username) {
    return text
      .replace('{user}', `@${username}`)
      .replace('{website}', process.env.WEBSITE_URL || 'https://hypeai.io')
      .replace('{telegram}', process.env.TELEGRAM_URL || 'https://t.me/HypeAI_Community')
      .replace('{discord}', process.env.DISCORD_URL || 'https://discord.gg/hypeai');
  }

  capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  logEngagement(data) {
    this.engagementLog.push(data);

    // Keep only last 1000 entries
    if (this.engagementLog.length > 1000) {
      this.engagementLog = this.engagementLog.slice(-1000);
    }
  }

  // ============================================
  // ANALYTICS & REPORTING
  // ============================================

  async generateReport() {
    const now = Date.now();
    const oneHourAgo = now - 3600000;

    const recentEngagements = this.engagementLog.filter(e => e.timestamp > oneHourAgo);

    const report = {
      timestamp: new Date().toISOString(),
      period: '1 hour',
      engagements: {
        total: recentEngagements.length,
        mentions: recentEngagements.filter(e => e.type === 'mention_reply').length,
        content: recentEngagements.filter(e => e.type === 'content_engagement').length
      },
      rateLimits: {
        likes: `${this.rateLimits.likes.count}/${this.config.rateLimits.maxLikesPerHour}`,
        retweets: `${this.rateLimits.retweets.count}/${this.config.rateLimits.maxRetweetsPerHour}`,
        replies: `${this.rateLimits.replies.count}/${this.config.rateLimits.maxRepliesPerHour}`
      }
    };

    console.log('\n📊 ENGAGEMENT REPORT');
    console.log('='.repeat(50));
    console.log(`Time: ${report.timestamp}`);
    console.log(`Total Engagements: ${report.engagements.total}`);
    console.log(`  - Mention Replies: ${report.engagements.mentions}`);
    console.log(`  - Content Engagement: ${report.engagements.content}`);
    console.log(`Rate Limits:`);
    console.log(`  - Likes: ${report.rateLimits.likes}`);
    console.log(`  - Retweets: ${report.rateLimits.retweets}`);
    console.log(`  - Replies: ${report.rateLimits.replies}`);
    console.log('='.repeat(50) + '\n');

    return report;
  }

  async saveState() {
    try {
      const state = {
        lastProcessedMention: this.lastProcessedMention,
        rateLimits: this.rateLimits,
        engagementLog: this.engagementLog.slice(-100) // Save last 100
      };

      const stateDir = path.join(__dirname, '.twitter');
      await fs.mkdir(stateDir, { recursive: true });

      await fs.writeFile(
        path.join(stateDir, 'engagement-state.json'),
        JSON.stringify(state, null, 2)
      );
    } catch (error) {
      console.error('❌ Error saving state:', error.message);
    }
  }

  async loadState() {
    try {
      const statePath = path.join(__dirname, '.twitter', 'engagement-state.json');
      const data = await fs.readFile(statePath, 'utf8');
      const state = JSON.parse(data);

      this.lastProcessedMention = state.lastProcessedMention;
      this.rateLimits = state.rateLimits;
      this.engagementLog = state.engagementLog || [];

      console.log('✅ State loaded from previous session');
    } catch (error) {
      console.log('ℹ️  No previous state found, starting fresh');
    }
  }

  // ============================================
  // MAIN LOOP
  // ============================================

  async start() {
    console.log('\n🚀 HYPEAI TWITTER ENGAGEMENT BOT STARTING');
    console.log('='.repeat(50));
    console.log(`Account: @${process.env.TWITTER_USERNAME}`);
    console.log(`Check Interval: ${this.config.monitoring.checkInterval / 1000}s`);
    console.log(`Auto Reply: ${this.config.engagement.autoReply ? '✅' : '❌'}`);
    console.log(`Auto Like: ${this.config.engagement.autoLike ? '✅' : '❌'}`);
    console.log(`Auto Retweet: ${this.config.engagement.autoRetweet ? '✅' : '❌'}`);
    console.log('='.repeat(50) + '\n');

    // Load previous state
    await this.loadState();

    // Main engagement loop
    let iteration = 0;

    while (true) {
      try {
        iteration++;
        console.log(`\n🔄 Iteration ${iteration} - ${new Date().toLocaleTimeString()}`);

        // Monitor mentions (every cycle)
        await this.monitorMentions();

        // Discover content (every 3rd cycle)
        if (iteration % 3 === 0) {
          await this.discoverAndEngage();
        }

        // Engage with influencers (every 5th cycle)
        if (iteration % 5 === 0) {
          await this.engageWithInfluencers();
        }

        // Generate report (every 10th cycle)
        if (iteration % 10 === 0) {
          await this.generateReport();
          await this.saveState();
        }

        // Wait before next iteration
        await this.sleep(this.config.monitoring.checkInterval);

      } catch (error) {
        console.error('❌ Main loop error:', error.message);
        await this.sleep(60000); // Wait 1 minute on error
      }
    }
  }
}

// ============================================
// START BOT
// ============================================

if (require.main === module) {
  const bot = new TwitterEngagementBot();

  // Graceful shutdown
  process.on('SIGINT', async () => {
    console.log('\n⏹️  Shutting down gracefully...');
    await bot.saveState();
    process.exit(0);
  });

  bot.start().catch(error => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  });
}

module.exports = TwitterEngagementBot;
