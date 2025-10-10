/**
 * HypeAI Twitter Engagement Bot
 * Features: Auto-reply to mentions, sentiment tracking, viral post alerts
 * IMPORTANT: All auto-replies require human review before posting
 */

const { TwitterApi } = require('twitter-api-v2');
const fs = require('fs').promises;
const path = require('path');

class HypeAITwitterBot {
  constructor(config) {
    this.config = config;

    // Initialize Twitter client
    this.client = new TwitterApi({
      appKey: config.twitter.apiKey,
      appSecret: config.twitter.apiSecret,
      accessToken: config.twitter.accessToken,
      accessSecret: config.twitter.accessSecret,
    });

    this.readWriteClient = this.client.readWrite;

    // Tracking
    this.mentionsSeen = new Set();
    this.sentimentData = [];
    this.viralPosts = [];
    this.partnershipOpportunities = [];
    this.pendingReplies = [];

    // Rate limiting
    this.rateLimits = {
      mentions: { limit: 15, window: 900000, requests: [] }, // 15 per 15 min
      tweets: { limit: 50, window: 86400000, requests: [] }, // 50 per day
      search: { limit: 180, window: 900000, requests: [] }  // 180 per 15 min
    };
  }

  async start() {
    console.log('🐦 Starting HypeAI Twitter Engagement Bot...');

    // Start monitoring streams
    this.startMentionsMonitoring();
    this.startKeywordMonitoring();
    this.startSentimentAnalysis();
    this.startViralTracking();

    // Start periodic tasks
    this.startPeriodicTasks();

    console.log('✅ Twitter bot started successfully');
  }

  async startMentionsMonitoring() {
    console.log('📡 Starting mentions monitoring...');

    // Poll for mentions every 2 minutes
    setInterval(async () => {
      await this.checkMentions();
    }, 120000);

    // Initial check
    await this.checkMentions();
  }

  async checkMentions() {
    if (!this.checkRateLimit('mentions')) {
      console.log('⏰ Rate limit reached for mentions check');
      return;
    }

    try {
      const mentions = await this.readWriteClient.v2.mentionTimeline(
        this.config.twitter.userId,
        {
          max_results: 10,
          'tweet.fields': ['created_at', 'public_metrics', 'author_id'],
          'user.fields': ['username', 'verified', 'public_metrics']
        }
      );

      for (const mention of mentions.data?.data || []) {
        if (this.mentionsSeen.has(mention.id)) continue;

        this.mentionsSeen.add(mention.id);
        await this.processMention(mention, mentions.includes?.users);
      }

    } catch (error) {
      console.error('Error checking mentions:', error);
    }
  }

  async processMention(mention, users) {
    console.log(`📨 New mention from @${users?.find(u => u.id === mention.author_id)?.username}`);

    const text = mention.text.toLowerCase();
    const author = users?.find(u => u.id === mention.author_id);

    // Analyze sentiment
    const sentiment = this.analyzeSentiment(text);
    this.recordSentiment(sentiment, mention);

    // Check if it's a question or needs response
    const needsResponse = this.needsResponse(text);

    if (needsResponse) {
      const reply = this.generateReply(text, sentiment);

      // Add to pending replies for human review
      this.pendingReplies.push({
        id: mention.id,
        author: author?.username,
        text: mention.text,
        generatedReply: reply,
        sentiment,
        timestamp: new Date(),
        approved: false,
        status: 'pending'
      });

      console.log(`💬 Reply queued for review: ${reply.substring(0, 50)}...`);

      // Save pending replies
      await this.savePendingReplies();

      // Notify admins
      await this.notifyAdminsNewReply(mention, reply);
    }

    // Check for partnership opportunities
    if (this.isPartnershipOpportunity(mention, author)) {
      await this.flagPartnershipOpportunity(mention, author);
    }
  }

  needsResponse(text) {
    const responseKeywords = [
      'how', 'what', 'when', 'where', 'why', 'help', 'question',
      'buy', 'stake', 'apy', 'contract', 'price', 'audit'
    ];

    return responseKeywords.some(keyword => text.includes(keyword));
  }

  generateReply(text, sentiment) {
    const textLower = text.toLowerCase();

    // Price questions
    if (textLower.includes('price') || textLower.includes('chart')) {
      return `Check out our current price and charts here: ${this.config.links.chart}\n\nFor real-time updates, use our Discord/Telegram bots! 📊`;
    }

    // How to buy
    if (textLower.includes('how') && textLower.includes('buy')) {
      return `You can buy HYPEAI on PancakeSwap: ${this.config.links.pancakeswap}\n\nFull guide: ${this.config.links.buyGuide} 🛒`;
    }

    // Staking questions
    if (textLower.includes('stake') || textLower.includes('apy')) {
      return `Stake HYPEAI for up to 20% APY! 💎\n\nStart here: ${this.config.links.stakingDapp}\nGuide: ${this.config.links.stakingGuide}`;
    }

    // Contract address
    if (textLower.includes('contract') && textLower.includes('address')) {
      return `Contract: ${this.config.contractAddress}\n\n⚠️ Always verify on official sources!`;
    }

    // Audit questions
    if (textLower.includes('audit') || textLower.includes('safe')) {
      return `Yes, HypeAI is fully audited! 🛡️\n\nView audit: ${this.config.links.audit}\nDocs: ${this.config.links.docs}`;
    }

    // Partnership inquiries
    if (textLower.includes('partner') || textLower.includes('collab')) {
      return `Interested in partnering? We'd love to hear from you! 🤝\n\nReach out via DM or email: ${this.config.partnershipEmail}`;
    }

    // General positive engagement
    if (sentiment === 'positive') {
      return `Thank you for your support! 🚀 Join our community to stay updated:\n\nDiscord: ${this.config.links.discord}\nTelegram: ${this.config.links.telegram}`;
    }

    // Default helpful response
    return `Thanks for reaching out! Check our resources:\n\n📚 Docs: ${this.config.links.docs}\n💬 Discord: ${this.config.links.discord}\n\nOur community is here to help!`;
  }

  analyzeSentiment(text) {
    const positiveWords = [
      'great', 'awesome', 'love', 'amazing', 'good', 'excellent',
      'best', 'excited', 'bullish', 'moon', 'gem'
    ];

    const negativeWords = [
      'scam', 'rug', 'fake', 'bad', 'terrible', 'hate',
      'worst', 'dump', 'bearish', 'dead'
    ];

    const textLower = text.toLowerCase();

    const positiveCount = positiveWords.filter(word => textLower.includes(word)).length;
    const negativeCount = negativeWords.filter(word => textLower.includes(word)).length;

    if (positiveCount > negativeCount) return 'positive';
    if (negativeCount > positiveCount) return 'negative';
    return 'neutral';
  }

  recordSentiment(sentiment, mention) {
    this.sentimentData.push({
      sentiment,
      tweetId: mention.id,
      timestamp: new Date(),
      metrics: mention.public_metrics
    });

    // Keep only last 1000 entries
    if (this.sentimentData.length > 1000) {
      this.sentimentData = this.sentimentData.slice(-1000);
    }
  }

  async startKeywordMonitoring() {
    console.log('🔍 Starting keyword monitoring...');

    // Monitor keywords every 5 minutes
    setInterval(async () => {
      await this.monitorKeywords();
    }, 300000);

    // Initial check
    await this.monitorKeywords();
  }

  async monitorKeywords() {
    if (!this.checkRateLimit('search')) {
      console.log('⏰ Rate limit reached for search');
      return;
    }

    const keywords = [
      'HypeAI',
      '$HYPEAI',
      this.config.contractAddress,
      'AI blockchain',
      'AI DeFi'
    ];

    try {
      for (const keyword of keywords) {
        const results = await this.readWriteClient.v2.search(keyword, {
          max_results: 10,
          'tweet.fields': ['created_at', 'public_metrics', 'author_id'],
          'user.fields': ['username', 'verified', 'public_metrics']
        });

        for (const tweet of results.data?.data || []) {
          await this.analyzeTweetReach(tweet, results.includes?.users);
        }

        // Avoid hitting rate limits
        await this.sleep(2000);
      }
    } catch (error) {
      console.error('Error monitoring keywords:', error);
    }
  }

  async analyzeTweetReach(tweet, users) {
    const metrics = tweet.public_metrics;
    const author = users?.find(u => u.id === tweet.author_id);

    // Check if tweet is going viral
    const isViral =
      metrics.retweet_count > 50 ||
      metrics.like_count > 100 ||
      metrics.reply_count > 20;

    if (isViral) {
      await this.flagViralPost(tweet, author, metrics);
    }
  }

  async flagViralPost(tweet, author, metrics) {
    const viralPost = {
      id: tweet.id,
      author: author?.username,
      text: tweet.text,
      metrics,
      timestamp: new Date(),
      url: `https://twitter.com/${author?.username}/status/${tweet.id}`
    };

    // Check if already tracked
    if (this.viralPosts.some(p => p.id === tweet.id)) return;

    this.viralPosts.push(viralPost);

    console.log(`🔥 VIRAL POST DETECTED: ${metrics.like_count} likes, ${metrics.retweet_count} RTs`);

    // Notify admins
    await this.notifyAdminsViralPost(viralPost);
  }

  isPartnershipOpportunity(mention, author) {
    if (!author) return false;

    // Check if author is verified or has significant following
    const isInfluential =
      author.verified ||
      author.public_metrics?.followers_count > 10000;

    const text = mention.text.toLowerCase();
    const partnershipKeywords = [
      'partner', 'collab', 'collaboration', 'integrate',
      'work together', 'joint venture', 'alliance'
    ];

    const hasPartnershipIntent = partnershipKeywords.some(
      keyword => text.includes(keyword)
    );

    return isInfluential && hasPartnershipIntent;
  }

  async flagPartnershipOpportunity(mention, author) {
    const opportunity = {
      id: mention.id,
      author: author.username,
      authorMetrics: author.public_metrics,
      verified: author.verified,
      text: mention.text,
      timestamp: new Date(),
      url: `https://twitter.com/${author.username}/status/${mention.id}`
    };

    this.partnershipOpportunities.push(opportunity);

    console.log(`🤝 Partnership opportunity from @${author.username}`);

    // Notify admins immediately
    await this.notifyAdminsPartnership(opportunity);
  }

  async startSentimentAnalysis() {
    console.log('📊 Starting sentiment analysis...');

    // Generate sentiment report every hour
    setInterval(async () => {
      await this.generateSentimentReport();
    }, 3600000);
  }

  async generateSentimentReport() {
    const lastHour = this.sentimentData.filter(
      s => Date.now() - s.timestamp < 3600000
    );

    const sentiment = {
      positive: lastHour.filter(s => s.sentiment === 'positive').length,
      neutral: lastHour.filter(s => s.sentiment === 'neutral').length,
      negative: lastHour.filter(s => s.sentiment === 'negative').length,
      total: lastHour.length
    };

    if (sentiment.total > 0) {
      console.log(`
📊 Hourly Sentiment Report:
   Positive: ${sentiment.positive} (${(sentiment.positive/sentiment.total*100).toFixed(1)}%)
   Neutral: ${sentiment.neutral} (${(sentiment.neutral/sentiment.total*100).toFixed(1)}%)
   Negative: ${sentiment.negative} (${(sentiment.negative/sentiment.total*100).toFixed(1)}%)
      `);

      // Alert if sentiment is very negative
      if (sentiment.negative / sentiment.total > 0.5) {
        await this.notifyAdminsNegativeSentiment(sentiment);
      }
    }
  }

  async startViralTracking() {
    console.log('🚀 Starting viral content tracking...');

    // Check our own tweets for virality every 30 minutes
    setInterval(async () => {
      await this.checkOwnTweets();
    }, 1800000);
  }

  async checkOwnTweets() {
    try {
      const tweets = await this.readWriteClient.v2.userTimeline(
        this.config.twitter.userId,
        {
          max_results: 10,
          'tweet.fields': ['created_at', 'public_metrics']
        }
      );

      for (const tweet of tweets.data?.data || []) {
        const metrics = tweet.public_metrics;

        // Check if performing well
        const isPerforming =
          metrics.like_count > 50 ||
          metrics.retweet_count > 20;

        if (isPerforming) {
          console.log(`✨ High-performing tweet: ${metrics.like_count} likes, ${metrics.retweet_count} RTs`);
        }
      }
    } catch (error) {
      console.error('Error checking own tweets:', error);
    }
  }

  async startPeriodicTasks() {
    // Save data every 5 minutes
    setInterval(async () => {
      await this.saveData();
    }, 300000);

    // Clean up old data daily
    setInterval(async () => {
      await this.cleanupOldData();
    }, 86400000);
  }

  async approveReply(replyId) {
    const reply = this.pendingReplies.find(r => r.id === replyId);

    if (!reply) {
      console.log(`❌ Reply ${replyId} not found`);
      return false;
    }

    if (!this.checkRateLimit('tweets')) {
      console.log('⏰ Rate limit reached for tweets');
      return false;
    }

    try {
      await this.readWriteClient.v2.reply(
        reply.generatedReply,
        replyId
      );

      reply.approved = true;
      reply.status = 'sent';
      reply.sentAt = new Date();

      console.log(`✅ Reply sent to ${reply.author}`);

      await this.savePendingReplies();
      return true;

    } catch (error) {
      console.error('Error sending reply:', error);
      reply.status = 'failed';
      reply.error = error.message;
      return false;
    }
  }

  async rejectReply(replyId, reason = 'Not appropriate') {
    const reply = this.pendingReplies.find(r => r.id === replyId);

    if (!reply) {
      console.log(`❌ Reply ${replyId} not found`);
      return false;
    }

    reply.status = 'rejected';
    reply.rejectionReason = reason;
    reply.rejectedAt = new Date();

    console.log(`❌ Reply rejected: ${reason}`);

    await this.savePendingReplies();
    return true;
  }

  async customReply(replyId, customText) {
    const reply = this.pendingReplies.find(r => r.id === replyId);

    if (!reply) {
      console.log(`❌ Reply ${replyId} not found`);
      return false;
    }

    if (!this.checkRateLimit('tweets')) {
      console.log('⏰ Rate limit reached for tweets');
      return false;
    }

    try {
      await this.readWriteClient.v2.reply(customText, replyId);

      reply.approved = true;
      reply.status = 'sent';
      reply.customReply = customText;
      reply.sentAt = new Date();

      console.log(`✅ Custom reply sent to ${reply.author}`);

      await this.savePendingReplies();
      return true;

    } catch (error) {
      console.error('Error sending custom reply:', error);
      reply.status = 'failed';
      reply.error = error.message;
      return false;
    }
  }

  getPendingReplies() {
    return this.pendingReplies.filter(r => r.status === 'pending');
  }

  getSentimentSummary() {
    const last24h = this.sentimentData.filter(
      s => Date.now() - s.timestamp < 86400000
    );

    return {
      positive: last24h.filter(s => s.sentiment === 'positive').length,
      neutral: last24h.filter(s => s.sentiment === 'neutral').length,
      negative: last24h.filter(s => s.sentiment === 'negative').length,
      total: last24h.length
    };
  }

  getViralPosts() {
    return this.viralPosts.slice(-20); // Last 20 viral posts
  }

  getPartnershipOpportunities() {
    return this.partnershipOpportunities;
  }

  checkRateLimit(type) {
    const limit = this.rateLimits[type];
    if (!limit) return true;

    const now = Date.now();
    limit.requests = limit.requests.filter(time => now - time < limit.window);

    if (limit.requests.length >= limit.limit) {
      return false;
    }

    limit.requests.push(now);
    return true;
  }

  async notifyAdminsNewReply(mention, reply) {
    // This would integrate with Discord/Telegram to notify admins
    console.log(`📬 New reply pending review for @${mention.author_id}`);
  }

  async notifyAdminsViralPost(post) {
    console.log(`🔥 Viral post alert: ${post.url}`);
  }

  async notifyAdminsPartnership(opportunity) {
    console.log(`🤝 Partnership opportunity from @${opportunity.author}`);
  }

  async notifyAdminsNegativeSentiment(sentiment) {
    console.log(`⚠️ High negative sentiment: ${sentiment.negative}/${sentiment.total}`);
  }

  async savePendingReplies() {
    const dataPath = path.join(__dirname, 'data', 'pending-replies.json');
    await fs.mkdir(path.dirname(dataPath), { recursive: true });
    await fs.writeFile(dataPath, JSON.stringify(this.pendingReplies, null, 2));
  }

  async saveData() {
    const dataDir = path.join(__dirname, 'data');
    await fs.mkdir(dataDir, { recursive: true });

    await Promise.all([
      fs.writeFile(
        path.join(dataDir, 'sentiment.json'),
        JSON.stringify(this.sentimentData.slice(-1000), null, 2)
      ),
      fs.writeFile(
        path.join(dataDir, 'viral-posts.json'),
        JSON.stringify(this.viralPosts.slice(-100), null, 2)
      ),
      fs.writeFile(
        path.join(dataDir, 'partnerships.json'),
        JSON.stringify(this.partnershipOpportunities, null, 2)
      )
    ]);
  }

  async loadData() {
    const dataDir = path.join(__dirname, 'data');

    try {
      const [sentiment, viral, partnerships, replies] = await Promise.all([
        fs.readFile(path.join(dataDir, 'sentiment.json'), 'utf8').catch(() => '[]'),
        fs.readFile(path.join(dataDir, 'viral-posts.json'), 'utf8').catch(() => '[]'),
        fs.readFile(path.join(dataDir, 'partnerships.json'), 'utf8').catch(() => '[]'),
        fs.readFile(path.join(dataDir, 'pending-replies.json'), 'utf8').catch(() => '[]')
      ]);

      this.sentimentData = JSON.parse(sentiment);
      this.viralPosts = JSON.parse(viral);
      this.partnershipOpportunities = JSON.parse(partnerships);
      this.pendingReplies = JSON.parse(replies);

      console.log('✅ Historical data loaded');
    } catch (error) {
      console.error('Error loading data:', error);
    }
  }

  async cleanupOldData() {
    const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);

    this.sentimentData = this.sentimentData.filter(
      s => new Date(s.timestamp) > thirtyDaysAgo
    );

    this.viralPosts = this.viralPosts.filter(
      p => new Date(p.timestamp) > thirtyDaysAgo
    );

    // Keep all partnership opportunities

    await this.saveData();
    console.log('✅ Old data cleaned up');
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async stop() {
    await this.saveData();
    console.log('✅ Twitter bot stopped');
  }
}

module.exports = HypeAITwitterBot;
