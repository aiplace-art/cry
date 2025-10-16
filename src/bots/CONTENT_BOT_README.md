# 🤖 HypeAI Content Creator Bot

**Automated, intelligent content generation for your Telegram community**

---

## ⚡ Quick Start (5 Minutes)

### 1. Set Environment Variables

```bash
# In your .env file
TELEGRAM_BOT_TOKEN=your_bot_token_here
TELEGRAM_GROUP_ID=your_group_chat_id
ADMIN_USER_IDS=123456789,987654321  # Your Telegram user ID(s)
```

### 2. Install Dependencies

```bash
npm install
# Dependencies already installed: node-telegram-bot-api
```

### 3. Start the Bot

```bash
# Option A: Direct start
node src/bots/start-content-bot.js

# Option B: With PM2
pm2 start src/bots/start-content-bot.js --name content-bot

# Option C: Add to package.json scripts
npm run content-bot
```

---

## 🎯 What It Does

### Automated Content Generation
- ☀️ **Good morning posts** (8 AM)
- 📊 **Market updates** (12 PM)
- 🤖 **Agent spotlights** (4 PM)
- 🎓 **Educational content** (Midday)
- 💪 **Motivational posts** (8 PM)
- 🎉 **Milestone celebrations** (As they happen)
- 📊 **Polls & engagement** (Evening)
- 💡 **Fun facts** (Afternoon)
- 😂 **Memes** (Random)

### 5 AI Agent Personalities
Each agent has a unique voice:
1. **Marcus** - Data-driven market analyst
2. **Luna** - Friendly community manager
3. **Tech** - Technical blockchain expert
4. **Meme Lord** - Creative content genius
5. **Vision** - Strategic mastermind

### Safety Features
- ✅ Max 10 posts per day
- ✅ 1 hour minimum between posts
- ✅ Human approval for sensitive content
- ✅ No spam keywords
- ✅ Authentic, varied voice

---

## 🎮 Admin Commands

Send these commands to the bot via direct message:

```
/content_status        - View bot statistics
/content_queue         - See posts awaiting approval
/content_approve 0     - Approve queued content by index
/content_reject 0      - Reject content with reason
/content_create type   - Manually create specific content
/content_help          - Show all commands
```

---

## 📝 Manual Content Creation

### From Code

```javascript
const ContentCreatorBot = require('./content-creator-bot');
const bot = new ContentCreatorBot(config);

// Good morning post
await bot.createPost('goodMorning');

// Agent spotlight (cycles through all 15 agents)
await bot.createPost('agentSpotlight', { agentIndex: 0 });

// Market update
await bot.createPost('marketUpdate');

// Educational post
await bot.createPost('educational', {
  topic: 'What is Staking?'
});

// Countdown
await bot.createPost('countdown', {
  eventName: 'Exchange Listing',
  targetDate: '2025-11-15',
  description: 'Major milestone ahead!'
});

// Milestone
await bot.createPost('communityMilestone', {
  achievement: '20,000 holders!',
  details: 'Amazing growth!'
});

// Poll
await bot.createPost('poll', {
  question: 'What feature next?',
  context: 'Help us decide!'
});

// Fun fact
await bot.createPost('funFact');

// Motivational
await bot.createPost('motivational');

// Meme
await bot.createPost('memeIdea');
```

### Via Bot Command

```
/content_create goodMorning
/content_create agentSpotlight
/content_create marketUpdate
/content_create educational
```

---

## 🔧 Configuration

### Posting Schedule

Default times (UTC):
- **8:00 AM** - Good morning posts
- **12:00 PM** - Market updates or educational
- **4:00 PM** - Agent spotlights or fun facts
- **8:00 PM** - Motivational or polls

**Change in code:**
```javascript
this.optimalTimes = [
  { hour: 9, minute: 0, type: 'morning' },     // 9 AM
  { hour: 14, minute: 30, type: 'midday' },    // 2:30 PM
  { hour: 17, minute: 0, type: 'afternoon' },  // 5 PM
  { hour: 21, minute: 0, type: 'evening' }     // 9 PM
];
```

### Rate Limits

```javascript
this.maxPostsPerDay = 10;           // Maximum daily posts
this.minPostInterval = 3600000;     // 1 hour (in ms)
```

### Links & Resources

Update in `start-content-bot.js`:
```javascript
config.links = {
  website: 'https://your-website.com',
  twitter: 'https://twitter.com/yourproject',
  discord: 'https://discord.gg/yourproject',
  // ... more links
};
```

---

## 📊 Monitoring & Analytics

### View Stats

```javascript
const analytics = await bot.getAnalytics();
console.log(analytics);

// Returns:
{
  totalPosts: 145,
  todayPosts: 4,
  queueSize: 2,
  historySize: 145,
  averageEngagement: 23.45
}
```

### Check Queue

```javascript
const queue = await bot.getApprovalQueue();
queue.forEach((item, index) => {
  console.log(`[${index}] ${item.type} by ${item.agent}`);
  console.log(item.content);
});
```

---

## 🎨 Customization Examples

### Add Your Own Templates

```javascript
// In initializeTemplates()
this.templates.customType = [
  "🎯 {title}\n\n{content}\n\n{callToAction}",
  "✨ {headline}\n\n{body}\n\n{footer}"
];
```

### Add New Agent Personality

```javascript
this.agents.push({
  name: 'Nova',
  role: 'Growth Strategist',
  style: 'ambitious, data-focused'
});
```

### Create Custom Content Type

```javascript
async generateCustomContent(params) {
  return await this.generateContent('customType', {
    title: params.title,
    content: params.content,
    callToAction: 'Join us! 🚀'
  });
}
```

---

## 🛡️ Approval System

### What Gets Flagged

Content containing these keywords needs approval:
- "guarantee", "promise"
- "moon", "100x", "lambo"
- "financial advice"
- "invest now", "buy now"
- "risk-free", "sure thing"

### Approve/Reject

```javascript
// Approve by index
await bot.approveContent(0);

// Reject with reason
await bot.rejectContent(0, "Too promotional");
```

---

## 📁 File Structure

```
src/bots/
├── content-creator-bot.js       # Main bot class
├── start-content-bot.js         # Startup script
└── CONTENT_BOT_README.md        # This file

docs/
├── content-bot-guide.md         # Comprehensive guide
└── content-examples.md          # Real content examples

data/
└── content-history.json         # Generated content history
```

---

## 🚀 Deployment Options

### Local Development

```bash
node src/bots/start-content-bot.js
```

### PM2 (Production)

```bash
pm2 start src/bots/start-content-bot.js --name content-bot
pm2 save
pm2 startup
```

### Docker

```dockerfile
FROM node:18
WORKDIR /app
COPY . .
RUN npm install
CMD ["node", "src/bots/start-content-bot.js"]
```

### Systemd Service

```ini
[Unit]
Description=HypeAI Content Bot
After=network.target

[Service]
Type=simple
User=youruser
WorkingDirectory=/path/to/project
ExecStart=/usr/bin/node src/bots/start-content-bot.js
Restart=always

[Install]
WantedBy=multi-user.target
```

---

## 🔍 Troubleshooting

### Bot not posting?

```bash
# Check rate limits
# Send: /content_status

# Check approval queue
# Send: /content_queue

# Check logs
pm2 logs content-bot
```

### Can't get group ID?

```javascript
// Add temporary logging to your bot
bot.on('message', (msg) => {
  console.log('Chat ID:', msg.chat.id);
});
```

### Content feels repetitive?

1. Add more templates to each type
2. Integrate trending topics API
3. Increase agent personality variations
4. Add seasonal/event-based content

---

## 📚 Documentation

- **Full Guide**: `/docs/content-bot-guide.md`
- **Examples**: `/docs/content-examples.md`
- **Main Code**: `/src/bots/content-creator-bot.js`

---

## 💡 Pro Tips

1. **Start small**: Test with 4 posts/day first
2. **Monitor engagement**: Track what content works best
3. **Ask community**: Poll about preferred content types
4. **Stay authentic**: Don't over-automate - add human posts too
5. **Update templates**: Refresh content monthly
6. **Seasonal content**: Add holiday-themed posts
7. **Respond to trends**: Create timely content manually
8. **Community highlights**: Spotlight members occasionally

---

## ✅ Daily Workflow

### Morning
1. Check `/content_status`
2. Review `/content_queue`
3. Approve pending content

### Afternoon
- Monitor community reactions
- Adjust schedule if needed

### Evening
- Review analytics
- Plan custom posts for tomorrow

---

## 🎯 Success Metrics

Track these over time:
- Daily active users
- Average post engagement
- New member retention
- Message count in group
- Best performing content types

---

## 🤝 Need Help?

- **Code issues**: Check inline comments
- **Strategy questions**: Read the full guide
- **Customization**: See examples file
- **Bugs**: Create an issue

---

## 📄 License

MIT License - Customize freely!

---

**Built with ❤️ by 15 AI Agents working together**

🤖 HypeAI - Where Hype Meets Intelligence
