# HypeAI Content Creator Bot Guide

## 🤖 Overview

The Content Creator Bot is an intelligent automation system that generates engaging, varied, and authentic content for your HypeAI Telegram community. Built with safety features, rate limiting, and human oversight, it helps maintain consistent community engagement without spam.

---

## 🎯 Key Features

### ✨ Automated Content Generation
- **8 Content Types**: Good morning posts, agent spotlights, market updates, educational content, milestones, countdowns, polls, and fun facts
- **AI Personality Variation**: 5 different agent personalities provide unique perspectives
- **Template System**: Multiple templates per type ensure content never feels repetitive
- **Context-Aware**: Adapts content based on time of day, trending topics, and community milestones

### 🛡️ Safety Features
- **Rate Limiting**: Maximum 10 posts per day
- **Minimum Interval**: 1 hour between posts
- **Approval Queue**: Sensitive content requires human review
- **Spam Prevention**: No spam keywords, authentic voice
- **Content History**: Track what's been posted

### 📊 Analytics & Tracking
- Total posts count
- Engagement metrics
- Best posting times
- Top-performing content types
- Historical data storage

---

## 🚀 Quick Start

### Installation

```bash
# Install dependencies (already installed)
npm install

# Create data directory for history
mkdir -p data
```

### Configuration

```javascript
// In your main bot file or index.js
const ContentCreatorBot = require('./src/bots/content-creator-bot');

const config = {
  telegram: {
    token: process.env.TELEGRAM_BOT_TOKEN,
    groupId: process.env.TELEGRAM_GROUP_ID  // Your group chat ID
  },
  links: {
    website: 'https://hypeai.io',
    twitter: 'https://twitter.com/hypeai',
    discord: 'https://discord.gg/hypeai',
    docs: 'https://docs.hypeai.io',
    stakingDapp: 'https://stake.hypeai.io',
    pancakeswap: 'https://pancakeswap.finance/swap',
    chart: 'https://dexscreener.com/solana/hypeai'
  },
  contractAddress: 'YOUR_CONTRACT_ADDRESS_HERE'
};

const contentBot = new ContentCreatorBot(config);
await contentBot.start();
```

### Starting the Bot

```bash
# Start as standalone service
node src/bots/content-creator-bot.js

# Or integrate with existing bot infrastructure
# (See Integration section below)
```

---

## 📝 Content Types

### 1. Good Morning Posts
**When**: 8 AM UTC daily
**Purpose**: Start the day with positivity and engagement

**Example**:
```
☀️ Good morning, HypeAI family! 🚀

Luna here with your morning brief:

Hope you're having an amazing day!

Today's focus: AI Innovation in Blockchain

💰 Price: Stable | 📈 Volume: Up 15% | 🔥 Trending on pump.fun

Let's make today count! 💪
```

### 2. Agent Spotlight
**When**: 4 PM UTC daily
**Purpose**: Educate community about the 15 AI agents

**Example**:
```
🤖 **Agent Spotlight: Marcus**

Role: Market Analyst

✨ Superpower: Real-time market analysis and predictive modeling

💡 Fun fact: Analyzes 10,000+ data points per minute

🎯 How it helps YOU: Get insights before the market moves

👉 Learn more in our docs!
```

### 3. Market Updates
**When**: 12 PM UTC daily
**Purpose**: Keep community informed on market status

**Example**:
```
📊 **Market Pulse Check**

Last 24 hours

• Price: $0.0042 (+12%)
• Holders: 12,456 (+87)
• Volume: $120K
• Staked: 45% of supply

Marcus's take: Strong support levels holding. Volume indicates growing interest.

🎯 Short-term: Consolidation expected
🚀 Long-term: Major growth potential

💬 What's your prediction? Vote below! 👇
```

### 4. Educational Content
**When**: Midday (12 PM UTC)
**Purpose**: Educate community about crypto/DeFi

**Example**:
```
🎓 **Learn & Earn: What is Staking?**

Staking means locking your tokens to earn passive rewards.
Think of it like a savings account for crypto!

💡 Key takeaway: Knowledge is power in crypto.
The more you learn, the better your decisions! 🧠

🧠 Quiz: What's the main benefit of staking?
A) Passive income B) Voting power C) Both D) Neither

Comment your answer! 👇
```

### 5. Community Milestones
**When**: As achievements occur
**Purpose**: Celebrate wins together

**Example**:
```
🎉 **MILESTONE ALERT!** 🎉

We just hit 10,000 holders!

🎯 10,000+ holders
📈 $5M+ market cap
💎 40%+ tokens staked
🌍 Community in 50+ countries

👏 This is all thanks to YOU, our amazing community!

🎊 You're all absolute legends!

Next goal: 15,000 holders 🎯
```

### 6. Countdown Posts
**When**: Leading up to major events
**Purpose**: Build anticipation

**Example**:
```
⏰ **Major Launch Countdown**

🗓️ 5d 12h remaining

Something big is coming!

The anticipation is REAL! 🚀

Are you ready? React below! 🔥
```

### 7. Polls
**When**: Evening (8 PM UTC)
**Purpose**: Engage community in decisions

**Example**:
```
📊 **Community Vote**

What feature should we prioritize?

Help shape the future of HypeAI!

Your voice matters! 🗳️

[Poll options via Telegram poll feature]
```

### 8. Fun Facts
**When**: Afternoon (4 PM UTC)
**Purpose**: Educate and entertain

**Example**:
```
🎯 **Did You Know?**

HypeAI uses 15 specialized AI agents, each with unique expertise!

From market analysis to content creation, our AI swarm works 24/7.

Tech: "We never sleep!"

Each agent learns and improves from community interactions.

🤓 Mind = Blown!
```

### 9. Motivational Posts
**When**: Monday mornings, as needed
**Purpose**: Inspire and uplift

**Example**:
```
💪 **Monday Motivation**

"Innovation distinguishes between a leader and a follower."

- Vision

This applies to crypto, life, and everything in between.

Today's challenge: Spread positivity in the community! 💚

You got this! 🔥
```

### 10. Meme Ideas
**When**: Random, for engagement
**Purpose**: Lighthearted community bonding

**Example**:
```
😂 **Meme of the Day**

When you check your HypeAI bag after staking

*Chef's kiss* More tokens appeared! 😘👌

#Staking #PassiveIncome #HypeAI

Tag a friend who needs to see this! 👇
```

---

## ⚙️ Customization

### Change Posting Schedule

Edit the `optimalTimes` array in the constructor:

```javascript
this.optimalTimes = [
  { hour: 8, minute: 0, type: 'morning' },      // Good morning
  { hour: 12, minute: 0, type: 'midday' },      // Lunch update
  { hour: 16, minute: 0, type: 'afternoon' },   // Afternoon content
  { hour: 20, minute: 0, type: 'evening' }      // Evening post
];
```

### Adjust Rate Limits

```javascript
this.maxPostsPerDay = 10;                // Maximum posts per day
this.minPostInterval = 3600000;          // 1 hour in milliseconds
```

### Add Custom Templates

```javascript
this.templates.yourNewType = [
  "Template 1 with {placeholders}",
  "Template 2 with {different} style",
  "Template 3 for {variation}"
];
```

### Add New Agent Personalities

```javascript
this.agents.push({
  name: 'Nova',
  role: 'Growth Strategist',
  style: 'ambitious, results-focused'
});
```

---

## 🔒 Approval System

### How It Works

1. **Automatic Detection**: Content with sensitive keywords (guarantee, promise, 100x, etc.) is flagged
2. **Queue Addition**: Flagged content goes to approval queue instead of posting
3. **Human Review**: Admin reviews queue and approves/rejects
4. **Safe Posting**: Only approved content gets posted

### Managing Approval Queue

```javascript
// Get pending approvals
const queue = await contentBot.getApprovalQueue();
console.log(queue);

// Approve content (by index)
await contentBot.approveContent(0);

// Reject content with reason
await contentBot.rejectContent(0, "Too promotional");
```

### Sensitive Keywords List

The bot flags content containing:
- "guarantee", "promise"
- "moon", "100x", "lambo"
- "financial advice"
- "invest now", "buy now"
- "risk-free", "sure thing", "can't lose"

**You can customize this list** in the `needsHumanApproval()` method.

---

## 📊 Analytics Dashboard

### Get Analytics

```javascript
const analytics = await contentBot.getAnalytics();
console.log(analytics);

/*
{
  totalPosts: 145,
  todayPosts: 4,
  queueSize: 2,
  historySize: 145,
  averageEngagement: 23.45,
  engagement: {},
  bestTimes: [],
  topContent: []
}
*/
```

### Track Engagement

The bot tracks:
- **Views**: How many people saw the post
- **Reactions**: Emoji reactions count
- **Comments**: Reply count

*Note: Telegram API has limitations on engagement metrics. Consider using your own tracking.*

---

## 🎨 Content Creation Examples

### Manual Post Creation

```javascript
// Create a good morning post
await contentBot.createPost('goodMorning');

// Create agent spotlight for specific agent
await contentBot.createPost('agentSpotlight', { agentIndex: 2 });

// Create educational post on specific topic
await contentBot.createPost('educational', {
  topic: 'Understanding Liquidity Pools'
});

// Create countdown with custom date
await contentBot.createPost('countdown', {
  eventName: 'Major Exchange Listing',
  targetDate: '2025-11-01',
  description: 'Our biggest milestone yet!',
  expectations: 'Massive volume and new holders!'
});

// Create milestone post
await contentBot.createPost('communityMilestone', {
  achievement: '20,000 holders reached!',
  details: 'Incredible growth in just 2 weeks!'
});
```

---

## 🔧 Integration with Existing Bots

### Option 1: Standalone Service

Run content bot separately:

```javascript
// content-bot-service.js
const ContentCreatorBot = require('./src/bots/content-creator-bot');
const config = require('./config');

const bot = new ContentCreatorBot(config);
bot.start();
```

### Option 2: Integrated with Main Bot

```javascript
// index.js
const TelegramBot = require('./telegram-bot');
const ContentCreatorBot = require('./content-creator-bot');

// Start main bot
const mainBot = new TelegramBot(config);
await mainBot.start();

// Start content bot (uses same token)
const contentBot = new ContentCreatorBot(config);
await contentBot.start();
```

### Option 3: Controlled via Commands

```javascript
// In your main bot
bot.onText(/\/createpost (.+)/, async (msg, match) => {
  const type = match[1];
  await contentBot.createPost(type);
  bot.sendMessage(msg.chat.id, '✅ Post created!');
});

bot.onText(/\/approvalqueue/, async (msg) => {
  const queue = await contentBot.getApprovalQueue();
  // Display queue to admin
});

bot.onText(/\/approve (\d+)/, async (msg, match) => {
  const index = parseInt(match[1]);
  await contentBot.approveContent(index);
  bot.sendMessage(msg.chat.id, '✅ Content approved!');
});
```

---

## 🛠️ Advanced Features

### Dynamic Trending Topics

```javascript
// Fetch trending topics from external API
async updateTrendingTopics() {
  try {
    const response = await fetch('https://api.trending-topics.com/crypto');
    const data = await response.json();
    this.trendingTopics = data.topics;
    this.lastTrendingUpdate = Date.now();
  } catch (error) {
    console.error('Error fetching trends:', error);
  }
}

// Use in content generation
getTrendingTopic() {
  if (this.trendingTopics.length > 0) {
    return this.trendingTopics[Math.floor(Math.random() * this.trendingTopics.length)];
  }
  // Fallback to default topics
  return 'AI Innovation in Blockchain';
}
```

### A/B Testing Content

```javascript
async createABTest(type, variations) {
  // Create multiple versions
  const contentA = await this.generateContent(type, variations.A);
  const contentB = await this.generateContent(type, variations.B);

  // Post A to group, B to channel
  await this.postContent(contentA);

  // Track engagement
  setTimeout(async () => {
    const engagementA = await this.getEngagement(contentA.id);
    const engagementB = await this.getEngagement(contentB.id);

    // Use winner for future posts
    if (engagementA > engagementB) {
      this.preferredVariation = 'A';
    }
  }, 3600000); // Check after 1 hour
}
```

### Content Scheduling via UI

```javascript
// Schedule custom post
async scheduleCustomPost(content, dateTime) {
  const now = new Date();
  const scheduled = new Date(dateTime);
  const timeout = scheduled - now;

  if (timeout > 0) {
    setTimeout(async () => {
      await this.postContent({
        content,
        type: 'custom',
        agent: 'Admin',
        timestamp: new Date(),
        needsApproval: false
      });
    }, timeout);

    this.scheduledPosts.push({
      content,
      scheduledFor: scheduled,
      status: 'pending'
    });
  }
}
```

---

## 📈 Best Practices

### Content Strategy

1. **Consistency**: Post at regular times (bot handles this automatically)
2. **Variety**: Mix content types (good morning, education, updates, fun)
3. **Quality**: Always prioritize value over quantity
4. **Engagement**: Ask questions, run polls, encourage interaction
5. **Authenticity**: Let agent personalities shine through

### What Works

✅ **Educational content** - Community loves learning
✅ **Agent spotlights** - Unique to HypeAI, builds brand
✅ **Market updates** - Keeps investors informed
✅ **Memes** - Increases shareability
✅ **Polls** - Direct community engagement
✅ **Milestones** - Celebrates wins together

### What to Avoid

❌ **Over-posting** - Respect the rate limits
❌ **Pure hype** - Balance enthusiasm with substance
❌ **Financial advice** - Always add disclaimers
❌ **Spam keywords** - "guaranteed", "can't lose", etc.
❌ **Aggressive selling** - Focus on community value

---

## 🔍 Troubleshooting

### Bot not posting?

```bash
# Check rate limits
console.log('Posts today:', contentBot.postsToday);
console.log('Last post time:', new Date(contentBot.lastPostTime));

# Check approval queue
const queue = await contentBot.getApprovalQueue();
console.log('Queue size:', queue.length);
```

### Content feels repetitive?

- Add more templates to each content type
- Increase agent personality variations
- Integrate trending topics API
- Add seasonal content

### Approval queue backing up?

```javascript
// Auto-approve low-risk content after 24 hours
setInterval(() => {
  const oldItems = contentBot.approvalQueue.filter(item => {
    return Date.now() - item.addedToQueue > 86400000; // 24 hours
  });

  oldItems.forEach(item => {
    if (!item.content.includes('guarantee')) {
      contentBot.approveContent(contentBot.approvalQueue.indexOf(item));
    }
  });
}, 3600000); // Check every hour
```

---

## 🚀 Deployment

### Production Checklist

- [ ] Set environment variables (TELEGRAM_BOT_TOKEN, GROUP_ID)
- [ ] Configure links in config object
- [ ] Test with dry-run mode first
- [ ] Set up monitoring/alerts
- [ ] Create approval workflow for admins
- [ ] Back up content history regularly
- [ ] Set up analytics dashboard

### Using PM2

```bash
# Start with PM2
pm2 start src/bots/content-creator-bot.js --name "content-bot"

# Monitor
pm2 monit

# View logs
pm2 logs content-bot

# Restart
pm2 restart content-bot
```

### Using Docker

```dockerfile
# Add to your existing Dockerfile
COPY src/bots/content-creator-bot.js /app/src/bots/
RUN mkdir -p /app/data

CMD ["node", "src/bots/content-creator-bot.js"]
```

---

## 🤝 Contributing

### Adding New Content Types

1. Add template to `initializeTemplates()`
2. Add generation logic to `generateReplacements()`
3. Add helper methods as needed
4. Update scheduling logic in `createScheduledContent()`
5. Test thoroughly before deploying

### Improving AI Personality

1. Add new agents to `this.agents` array
2. Create personality-specific methods
3. Add voice examples to templates
4. Test variation quality

---

## 📞 Support

### Need Help?

- **Documentation**: This guide + inline code comments
- **Issues**: Create issue in repo
- **Community**: Ask in HypeAI Discord
- **Custom Features**: Contact dev team

---

## 🎉 Success Metrics

Track these to measure bot effectiveness:

- **Daily Active Users**: Are more people engaging?
- **Message Count**: Is community more active?
- **Retention**: Are members staying?
- **New Members**: Growing community size?
- **Post Engagement**: Reactions + comments per post
- **Best Content**: Which types perform best?

---

## 📄 License

MIT License - Feel free to customize for your project!

---

## 🌟 Tips for Maximum Impact

1. **Launch Announcement**: Tell community about the new content system
2. **Feedback Loop**: Ask what content they want to see
3. **Iterate**: Adjust based on what works
4. **Human Touch**: Occasionally post manually to keep it real
5. **Celebrate**: Share bot success metrics with community

---

**Happy Content Creating! 🚀**

*Built with ❤️ by the HypeAI AI Agent Team*
