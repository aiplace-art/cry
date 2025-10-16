/**
 * Mention Monitor Bot for HypeAI
 *
 * Ethical monitoring bot that:
 * - Tracks mentions of HypeAI and related keywords
 * - Only engages when organically relevant
 * - Requires human approval for responses
 * - Provides value, never spam
 */

const TelegramBot = require('node-telegram-bot-api');
const fs = require('fs').promises;
const path = require('path');

class MentionMonitorBot {
  constructor(config) {
    this.config = config;
    this.bot = new TelegramBot(config.botToken, { polling: true });
    this.monitoredGroups = new Set(config.monitoredGroups || []);
    this.keywords = config.keywords || this.getDefaultKeywords();
    this.blacklist = new Set(config.blacklist || []);
    this.responseQueue = [];
    this.metrics = {
      mentionsDetected: 0,
      responsesApproved: 0,
      responsesRejected: 0,
      engagementScore: 0
    };
    this.rateLimiter = {
      hourlyResponses: 0,
      lastResetTime: Date.now()
    };

    this.setupHandlers();
    this.startRateLimitReset();
  }

  getDefaultKeywords() {
    return {
      direct: [
        'HypeAI',
        '@HypeAI',
        'Hype AI',
        'hypeai.fun'
      ],
      related: [
        'AI tokens',
        'Solana AI',
        'AI agents',
        'pump.fun',
        '15 agents',
        'autonomous agents',
        'AI meme coins',
        'Solana memes'
      ],
      questions: [
        'best AI token',
        'AI crypto projects',
        'autonomous agent tokens',
        'which AI tokens',
        'AI token recommendations'
      ]
    };
  }

  setupHandlers() {
    // Monitor all messages in allowed groups
    this.bot.on('message', async (msg) => {
      await this.handleMessage(msg);
    });

    // Admin commands (for human operators)
    this.bot.onText(/\/approve (\d+)/, async (msg, match) => {
      await this.approveResponse(msg, match[1]);
    });

    this.bot.onText(/\/reject (\d+)/, async (msg, match) => {
      await this.rejectResponse(msg, match[1]);
    });

    this.bot.onText(/\/queue/, async (msg) => {
      await this.showQueue(msg);
    });

    this.bot.onText(/\/stats/, async (msg) => {
      await this.showStats(msg);
    });

    this.bot.onText(/\/blacklist (\-?\d+)/, async (msg, match) => {
      await this.addToBlacklist(msg, match[1]);
    });

    console.log('✅ Mention Monitor Bot handlers initialized');
  }

  async handleMessage(msg) {
    try {
      // Skip if not in monitored group or blacklisted
      if (!this.shouldMonitorChat(msg.chat.id)) {
        return;
      }

      const text = msg.text || msg.caption || '';
      if (!text) return;

      // Analyze mention
      const mention = this.analyzeMention(text, msg);

      if (mention.detected) {
        this.metrics.mentionsDetected++;

        // Log mention
        await this.logMention(mention);

        // Generate response suggestion if high value
        if (mention.opportunityScore >= 70) {
          await this.queueResponse(mention, msg);
        }

        // Notify admins
        await this.notifyAdmins(mention);
      }
    } catch (error) {
      console.error('Error handling message:', error);
    }
  }

  shouldMonitorChat(chatId) {
    // If no specific groups configured, monitor all non-blacklisted
    if (this.monitoredGroups.size === 0) {
      return !this.blacklist.has(chatId.toString());
    }

    // Only monitor whitelisted groups
    return this.monitoredGroups.has(chatId.toString()) &&
           !this.blacklist.has(chatId.toString());
  }

  analyzeMention(text, msg) {
    const textLower = text.toLowerCase();

    // Detect mention type
    const mentionType = this.detectMentionType(textLower);

    // Sentiment analysis
    const sentiment = this.analyzeSentiment(textLower);

    // Context analysis
    const context = this.analyzeContext(text, msg);

    // Opportunity scoring (0-100)
    const opportunityScore = this.calculateOpportunityScore({
      mentionType,
      sentiment,
      context,
      msg
    });

    return {
      detected: mentionType !== 'none',
      mentionType,
      sentiment,
      context,
      opportunityScore,
      text,
      chatId: msg.chat.id,
      chatTitle: msg.chat.title,
      messageId: msg.message_id,
      userId: msg.from?.id,
      username: msg.from?.username,
      timestamp: new Date()
    };
  }

  detectMentionType(text) {
    // Direct mention (highest priority)
    if (this.keywords.direct.some(kw => text.includes(kw.toLowerCase()))) {
      return 'direct';
    }

    // Question about related topics
    if (this.keywords.questions.some(kw => text.includes(kw.toLowerCase()))) {
      // Check if it's actually a question
      if (text.includes('?') || text.match(/\b(what|which|how|where|when|who|why)\b/i)) {
        return 'question';
      }
    }

    // Related topic discussion
    if (this.keywords.related.some(kw => text.includes(kw.toLowerCase()))) {
      return 'related';
    }

    return 'none';
  }

  analyzeSentiment(text) {
    // Simple sentiment analysis
    const positiveWords = ['best', 'great', 'amazing', 'awesome', 'good', 'love', 'innovative', 'promising'];
    const negativeWords = ['scam', 'rug', 'bad', 'worst', 'terrible', 'shit', 'garbage', 'fake'];
    const neutralWords = ['what', 'which', 'how', 'when', 'where'];

    let score = 0;
    const words = text.toLowerCase().split(/\s+/);

    words.forEach(word => {
      if (positiveWords.some(pw => word.includes(pw))) score += 1;
      if (negativeWords.some(nw => word.includes(nw))) score -= 2; // Negative is stronger
      if (neutralWords.some(nw => word.includes(nw))) score += 0.5; // Questions are opportunities
    });

    if (score > 1) return 'positive';
    if (score < -1) return 'negative';
    return 'neutral';
  }

  analyzeContext(text, msg) {
    return {
      isQuestion: text.includes('?'),
      isReply: !!msg.reply_to_message,
      hasLinks: /https?:\/\//.test(text),
      messageLength: text.length,
      chatType: msg.chat.type,
      isNewMember: !!msg.new_chat_members
    };
  }

  calculateOpportunityScore(data) {
    let score = 0;

    // Mention type scoring
    if (data.mentionType === 'direct') score += 50;
    else if (data.mentionType === 'question') score += 40;
    else if (data.mentionType === 'related') score += 20;

    // Sentiment scoring
    if (data.sentiment === 'positive') score += 20;
    else if (data.sentiment === 'neutral') score += 10;
    else if (data.sentiment === 'negative') score -= 30; // Don't engage with negative

    // Context scoring
    if (data.context.isQuestion) score += 15;
    if (data.context.isReply) score += 5;
    if (data.context.chatType === 'group' || data.context.chatType === 'supergroup') score += 5;

    // Message quality
    if (data.context.messageLength > 50) score += 5; // Thoughtful message
    if (data.context.messageLength > 200) score += 5; // Very engaged user

    return Math.max(0, Math.min(100, score)); // Clamp 0-100
  }

  async queueResponse(mention, msg) {
    // Check rate limit
    if (this.rateLimiter.hourlyResponses >= this.config.maxResponsesPerHour) {
      console.log('⚠️ Rate limit reached, skipping response queue');
      return;
    }

    // Generate response suggestion
    const responseSuggestion = this.generateResponse(mention);

    const queueItem = {
      id: Date.now(),
      mention,
      response: responseSuggestion,
      status: 'pending',
      createdAt: new Date()
    };

    this.responseQueue.push(queueItem);

    // Auto-notify admins about high-value opportunities
    if (mention.opportunityScore >= 80) {
      await this.notifyAdminsAboutHighValueOpportunity(queueItem);
    }

    return queueItem;
  }

  generateResponse(mention) {
    const responses = {
      direct: [
        "Hey! Yes, HypeAI is our project. We're building 15 autonomous AI agents on Solana. What would you like to know?",
        "Thanks for mentioning us! HypeAI features 15 specialized AI agents working autonomously. Happy to answer any questions!",
        "Hi! HypeAI here - we're creating an ecosystem of 15 AI agents on Solana. What aspects are you most interested in?"
      ],
      question: [
        "If you're looking for AI token projects, you might be interested in HypeAI - we have 15 autonomous agents on Solana. Would love to share more details if you're interested!",
        "For AI agents on Solana, check out HypeAI - we're building 15 specialized autonomous agents. Happy to answer any questions!",
        "HypeAI might be relevant to your question - we're developing 15 AI agents on Solana with unique capabilities. Want to learn more?"
      ],
      related: [
        "Interesting discussion! We're building something similar with HypeAI - 15 autonomous AI agents on Solana. Feel free to check us out if you're interested in this space!",
        "If you're into AI agents, you might find HypeAI interesting - 15 specialized agents working autonomously on Solana. Happy to share more!",
        "This is exactly what we're working on with HypeAI! 15 AI agents, each with unique capabilities. Would love to hear your thoughts!"
      ]
    };

    // Select appropriate response based on mention type
    const responseList = responses[mention.mentionType] || responses.related;
    const randomResponse = responseList[Math.floor(Math.random() * responseList.length)];

    // Add context-specific adjustments
    if (mention.context.isQuestion) {
      return randomResponse;
    } else if (mention.sentiment === 'positive') {
      return randomResponse + " 🚀";
    }

    return randomResponse;
  }

  async approveResponse(msg, queueId) {
    // Only admins can approve
    if (!this.config.adminIds.includes(msg.from.id)) {
      await this.bot.sendMessage(msg.chat.id, '❌ Only admins can approve responses');
      return;
    }

    const item = this.responseQueue.find(i => i.id === parseInt(queueId));
    if (!item) {
      await this.bot.sendMessage(msg.chat.id, '❌ Queue item not found');
      return;
    }

    if (item.status !== 'pending') {
      await this.bot.sendMessage(msg.chat.id, '❌ Item already processed');
      return;
    }

    // Check rate limit again
    if (this.rateLimiter.hourlyResponses >= this.config.maxResponsesPerHour) {
      await this.bot.sendMessage(msg.chat.id, '⚠️ Rate limit reached, cannot send response');
      return;
    }

    try {
      // Send the response
      await this.bot.sendMessage(item.mention.chatId, item.response, {
        reply_to_message_id: item.mention.messageId
      });

      item.status = 'approved';
      this.metrics.responsesApproved++;
      this.rateLimiter.hourlyResponses++;

      await this.bot.sendMessage(msg.chat.id, '✅ Response sent successfully!');

      // Log the interaction
      await this.logInteraction(item, 'approved');
    } catch (error) {
      await this.bot.sendMessage(msg.chat.id, `❌ Error sending response: ${error.message}`);
    }
  }

  async rejectResponse(msg, queueId) {
    // Only admins can reject
    if (!this.config.adminIds.includes(msg.from.id)) {
      await this.bot.sendMessage(msg.chat.id, '❌ Only admins can reject responses');
      return;
    }

    const item = this.responseQueue.find(i => i.id === parseInt(queueId));
    if (!item) {
      await this.bot.sendMessage(msg.chat.id, '❌ Queue item not found');
      return;
    }

    item.status = 'rejected';
    this.metrics.responsesRejected++;

    await this.bot.sendMessage(msg.chat.id, '✅ Response rejected');
    await this.logInteraction(item, 'rejected');
  }

  async showQueue(msg) {
    // Only admins can view queue
    if (!this.config.adminIds.includes(msg.from.id)) {
      return;
    }

    const pending = this.responseQueue.filter(i => i.status === 'pending');

    if (pending.length === 0) {
      await this.bot.sendMessage(msg.chat.id, '📭 Response queue is empty');
      return;
    }

    let queueText = '📋 *Pending Responses*\n\n';

    pending.forEach(item => {
      queueText += `*ID:* ${item.id}\n`;
      queueText += `*Chat:* ${item.mention.chatTitle}\n`;
      queueText += `*Score:* ${item.mention.opportunityScore}/100\n`;
      queueText += `*Type:* ${item.mention.mentionType}\n`;
      queueText += `*Sentiment:* ${item.mention.sentiment}\n`;
      queueText += `*Mention:* "${item.mention.text.substring(0, 100)}..."\n`;
      queueText += `*Suggested Response:* "${item.response.substring(0, 150)}..."\n`;
      queueText += `\n/approve ${item.id} | /reject ${item.id}\n\n`;
      queueText += '─────────────────\n\n';
    });

    await this.bot.sendMessage(msg.chat.id, queueText, { parse_mode: 'Markdown' });
  }

  async showStats(msg) {
    // Only admins can view stats
    if (!this.config.adminIds.includes(msg.from.id)) {
      return;
    }

    const stats = `📊 *Mention Monitor Stats*

*Mentions Detected:* ${this.metrics.mentionsDetected}
*Responses Approved:* ${this.metrics.responsesApproved}
*Responses Rejected:* ${this.metrics.responsesRejected}
*Hourly Rate Limit:* ${this.rateLimiter.hourlyResponses}/${this.config.maxResponsesPerHour}
*Pending Queue:* ${this.responseQueue.filter(i => i.status === 'pending').length}
*Monitored Groups:* ${this.monitoredGroups.size}
*Blacklisted Chats:* ${this.blacklist.size}

*Engagement Score:* ${this.calculateEngagementScore()}/100`;

    await this.bot.sendMessage(msg.chat.id, stats, { parse_mode: 'Markdown' });
  }

  async addToBlacklist(msg, chatId) {
    // Only admins can blacklist
    if (!this.config.adminIds.includes(msg.from.id)) {
      await this.bot.sendMessage(msg.chat.id, '❌ Only admins can manage blacklist');
      return;
    }

    this.blacklist.add(chatId);
    await this.saveConfig();
    await this.bot.sendMessage(msg.chat.id, `✅ Chat ${chatId} added to blacklist`);
  }

  calculateEngagementScore() {
    if (this.metrics.mentionsDetected === 0) return 0;

    const approvalRate = this.metrics.responsesApproved /
                        (this.metrics.responsesApproved + this.metrics.responsesRejected || 1);
    const responseRate = (this.metrics.responsesApproved + this.metrics.responsesRejected) /
                        this.metrics.mentionsDetected;

    return Math.round((approvalRate * 50) + (responseRate * 50));
  }

  async notifyAdmins(mention) {
    const notification = `🔔 *New Mention Detected*

*Chat:* ${mention.chatTitle}
*Type:* ${mention.mentionType}
*Score:* ${mention.opportunityScore}/100
*Sentiment:* ${mention.sentiment}
*Message:* "${mention.text.substring(0, 200)}..."

*Context:*
- Question: ${mention.context.isQuestion ? 'Yes' : 'No'}
- Reply: ${mention.context.isReply ? 'Yes' : 'No'}
- Chat Type: ${mention.context.chatType}`;

    // Send to all admins
    for (const adminId of this.config.adminIds) {
      try {
        await this.bot.sendMessage(adminId, notification, { parse_mode: 'Markdown' });
      } catch (error) {
        console.error(`Failed to notify admin ${adminId}:`, error.message);
      }
    }
  }

  async notifyAdminsAboutHighValueOpportunity(queueItem) {
    const notification = `⚡ *HIGH VALUE OPPORTUNITY*

*Score:* ${queueItem.mention.opportunityScore}/100 🔥
*Chat:* ${queueItem.mention.chatTitle}
*Type:* ${queueItem.mention.mentionType}

*Mention:* "${queueItem.mention.text}"

*Suggested Response:*
"${queueItem.response}"

/approve ${queueItem.id} | /reject ${queueItem.id}`;

    for (const adminId of this.config.adminIds) {
      try {
        await this.bot.sendMessage(adminId, notification, { parse_mode: 'Markdown' });
      } catch (error) {
        console.error(`Failed to notify admin ${adminId}:`, error.message);
      }
    }
  }

  async logMention(mention) {
    const logEntry = {
      timestamp: mention.timestamp,
      chatId: mention.chatId,
      chatTitle: mention.chatTitle,
      mentionType: mention.mentionType,
      sentiment: mention.sentiment,
      opportunityScore: mention.opportunityScore,
      text: mention.text.substring(0, 500)
    };

    const logFile = path.join(__dirname, '../../logs/mentions.jsonl');
    await fs.appendFile(logFile, JSON.stringify(logEntry) + '\n');
  }

  async logInteraction(item, action) {
    const logEntry = {
      timestamp: new Date(),
      action,
      queueId: item.id,
      chatId: item.mention.chatId,
      chatTitle: item.mention.chatTitle,
      opportunityScore: item.mention.opportunityScore,
      response: item.response
    };

    const logFile = path.join(__dirname, '../../logs/interactions.jsonl');
    await fs.appendFile(logFile, JSON.stringify(logEntry) + '\n');
  }

  async saveConfig() {
    const configPath = path.join(__dirname, '../../config/mention-monitor-config.json');
    const config = {
      ...this.config,
      blacklist: Array.from(this.blacklist),
      monitoredGroups: Array.from(this.monitoredGroups)
    };
    await fs.writeFile(configPath, JSON.stringify(config, null, 2));
  }

  startRateLimitReset() {
    // Reset hourly counter every hour
    setInterval(() => {
      this.rateLimiter.hourlyResponses = 0;
      this.rateLimiter.lastResetTime = Date.now();
      console.log('🔄 Rate limit reset');
    }, 60 * 60 * 1000); // 1 hour
  }

  async start() {
    console.log('🤖 Mention Monitor Bot started');
    console.log(`📊 Monitoring ${this.monitoredGroups.size || 'all'} groups`);
    console.log(`⚡ Max responses per hour: ${this.config.maxResponsesPerHour}`);
    console.log(`👥 Admins: ${this.config.adminIds.length}`);
  }

  async stop() {
    await this.bot.stopPolling();
    await this.saveConfig();
    console.log('🛑 Mention Monitor Bot stopped');
  }
}

// Export
module.exports = MentionMonitorBot;

// CLI execution
if (require.main === module) {
  const configPath = path.join(__dirname, '../../config/mention-monitor-config.json');

  fs.readFile(configPath, 'utf8')
    .then(data => {
      const config = JSON.parse(data);
      const bot = new MentionMonitorBot(config);
      bot.start();

      // Graceful shutdown
      process.on('SIGINT', async () => {
        console.log('\n👋 Shutting down...');
        await bot.stop();
        process.exit(0);
      });
    })
    .catch(error => {
      console.error('❌ Failed to load config:', error);
      console.log('💡 Create config/mention-monitor-config.json first');
      process.exit(1);
    });
}
