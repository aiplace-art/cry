# Content Bot Integration Guide

## 🚀 How to Add to Your Project

### Step 1: Add NPM Script

Add to your `package.json`:

```json
{
  "scripts": {
    "content-bot": "node src/bots/start-content-bot.js",
    "content-bot:pm2": "pm2 start src/bots/start-content-bot.js --name content-bot"
  }
}
```

Then run:
```bash
npm run content-bot
```

### Step 2: Environment Variables

Add to your `.env` file:

```env
# Content Creator Bot
TELEGRAM_BOT_TOKEN=your_bot_token_here
TELEGRAM_GROUP_ID=-1001234567890
ADMIN_USER_IDS=123456789,987654321

# Optional
CONTRACT_ADDRESS=YourSolanaTokenAddress
```

**How to get your Group ID:**
1. Add bot to group
2. Send a message in group
3. Visit: `https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getUpdates`
4. Look for `"chat":{"id":-1001234567890}`

**How to get your User ID:**
1. Message @userinfobot on Telegram
2. It will reply with your ID

### Step 3: Start the Bot

```bash
# Development
npm run content-bot

# Production with PM2
npm run content-bot:pm2

# Check status
pm2 status
pm2 logs content-bot
```

---

## 🔧 Integration Patterns

### Pattern 1: Standalone Service (Recommended)

Run content bot as a separate service:

```bash
# Terminal 1: Main bot
npm start

# Terminal 2: Content bot
npm run content-bot
```

**Pros:**
- Independent scaling
- Easy to restart without affecting main bot
- Separate logs and monitoring

### Pattern 2: Same Process

Integrate directly into your main bot file:

```javascript
// index.js or main bot file
const TelegramBot = require('./telegram-bot');
const ContentCreatorBot = require('./content-creator-bot');
const config = require('./config');

async function start() {
  // Start main bot
  const mainBot = new TelegramBot(config);
  await mainBot.start();

  // Start content bot
  const contentBot = new ContentCreatorBot(config);
  await contentBot.start();

  console.log('✅ All bots running!');
}

start();
```

**Pros:**
- Single process to manage
- Shared configuration

**Cons:**
- One crash affects both bots

### Pattern 3: API-Controlled

Control content bot via REST API:

```javascript
// api-server.js
const express = require('express');
const ContentCreatorBot = require('./content-creator-bot');

const app = express();
const bot = new ContentCreatorBot(config);

app.post('/api/content/create', async (req, res) => {
  const { type, params } = req.body;
  const result = await bot.createPost(type, params);
  res.json(result);
});

app.get('/api/content/analytics', async (req, res) => {
  const analytics = await bot.getAnalytics();
  res.json(analytics);
});

app.get('/api/content/queue', async (req, res) => {
  const queue = await bot.getApprovalQueue();
  res.json(queue);
});

app.post('/api/content/approve/:index', async (req, res) => {
  await bot.approveContent(parseInt(req.params.index));
  res.json({ success: true });
});

app.listen(3000);
```

---

## 📊 Monitoring Setup

### Add to PM2 Ecosystem

Create `ecosystem.config.js`:

```javascript
module.exports = {
  apps: [
    {
      name: 'telegram-bot',
      script: './telegram-bot.js',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G'
    },
    {
      name: 'content-bot',
      script: './src/bots/start-content-bot.js',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      cron_restart: '0 0 * * *' // Restart daily at midnight
    }
  ]
};
```

Then:
```bash
pm2 start ecosystem.config.js
pm2 save
```

### Logging

Add Winston logger:

```javascript
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'logs/content-bot-error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/content-bot.log' })
  ]
});

// In content bot
console.log = (...args) => logger.info(args.join(' '));
console.error = (...args) => logger.error(args.join(' '));
```

### Health Checks

Add health endpoint:

```javascript
// In start-content-bot.js
const express = require('express');
const healthApp = express();

healthApp.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    uptime: process.uptime(),
    postsToday: bot.postsToday,
    queueSize: bot.approvalQueue.length
  });
});

healthApp.listen(3001);
```

Check health:
```bash
curl http://localhost:3001/health
```

---

## 🔐 Security Best Practices

### 1. Environment Variables

Never commit tokens:

```bash
# .gitignore
.env
.env.local
.env.*.local
```

### 2. Admin Verification

Update admin check in `start-content-bot.js`:

```javascript
function isAdmin(userId) {
  const adminIds = process.env.ADMIN_USER_IDS?.split(',').map(id => parseInt(id)) || [];

  if (adminIds.length === 0) {
    console.warn('⚠️  No admin IDs configured!');
    return false;
  }

  return adminIds.includes(userId);
}
```

### 3. Rate Limiting

Already built-in, but can enhance:

```javascript
// Anti-flood protection
const floodProtection = new Map();

function checkFlood(userId) {
  const now = Date.now();
  const userFlood = floodProtection.get(userId) || [];

  // Remove old entries
  const recent = userFlood.filter(time => now - time < 10000);

  if (recent.length >= 5) {
    return false; // Blocked
  }

  recent.push(now);
  floodProtection.set(userId, recent);
  return true;
}
```

---

## 📈 Analytics Integration

### Google Analytics

```javascript
const { google } = require('googleapis');

async function trackContentPost(contentType, engagement) {
  const analytics = google.analytics('v3');

  await analytics.management.customMetrics.insert({
    accountId: process.env.GA_ACCOUNT_ID,
    propertyId: process.env.GA_PROPERTY_ID,
    resource: {
      name: 'Content Posts',
      type: 'INTEGER',
      scope: 'HIT'
    }
  });
}
```

### Database Tracking

```javascript
// Using SQLite
const sqlite3 = require('sqlite3');
const db = new sqlite3.Database('./data/analytics.db');

db.run(`CREATE TABLE IF NOT EXISTS posts (
  id INTEGER PRIMARY KEY,
  type TEXT,
  agent TEXT,
  content TEXT,
  timestamp DATETIME,
  views INTEGER DEFAULT 0,
  reactions INTEGER DEFAULT 0,
  comments INTEGER DEFAULT 0
)`);

async function savePost(post) {
  return new Promise((resolve, reject) => {
    db.run(
      'INSERT INTO posts (type, agent, content, timestamp) VALUES (?, ?, ?, ?)',
      [post.type, post.agent, post.content, new Date()],
      (err) => err ? reject(err) : resolve()
    );
  });
}
```

---

## 🎨 Customization Examples

### Custom Content Type

```javascript
// Add to templates
this.templates.weeklyRecap = [
  "📊 **Weekly Recap**\n\n{highlights}\n\n{stats}\n\n{lookAhead}"
];

// Add generation logic
case 'weeklyRecap':
  replacements.highlights = await this.getWeeklyHighlights();
  replacements.stats = await this.getWeeklyStats();
  replacements.lookAhead = "Next week: Even bigger things coming!";
  break;

// Schedule it
schedulePost(17, 0, 'weeklyRecap'); // Fridays at 5 PM
```

### Market Data Integration

```javascript
const axios = require('axios');

async getMarketSnapshot() {
  try {
    // Fetch from DexScreener or similar
    const response = await axios.get(
      `https://api.dexscreener.com/latest/dex/tokens/${this.config.contractAddress}`
    );

    const data = response.data.pairs[0];

    return `💰 Price: $${data.priceUsd} | 📈 24h: ${data.priceChange.h24}% | 💧 Liquidity: $${data.liquidity.usd}`;
  } catch (error) {
    console.error('Error fetching market data:', error);
    return '💰 Price: Stable | 📈 Growing community';
  }
}
```

### Trending Topics API

```javascript
async updateTrendingTopics() {
  try {
    // Use Twitter API, CoinGecko trending, etc.
    const response = await axios.get('https://api.coingecko.com/api/v3/search/trending');

    this.trendingTopics = response.data.coins
      .slice(0, 10)
      .map(coin => coin.item.name);

    this.lastTrendingUpdate = Date.now();
  } catch (error) {
    console.error('Error fetching trends:', error);
  }
}

// Update every hour
setInterval(() => this.updateTrendingTopics(), 3600000);
```

---

## 🧪 Testing

### Manual Testing

```javascript
// test-content-bot.js
const ContentCreatorBot = require('./content-creator-bot');

async function test() {
  const config = {
    telegram: { token: 'test', groupId: 'test' },
    links: {},
    contractAddress: 'test'
  };

  const bot = new ContentCreatorBot(config);

  // Test content generation (without posting)
  const content = await bot.generateContent('goodMorning');
  console.log('Generated content:', content);

  // Test all types
  const types = ['goodMorning', 'agentSpotlight', 'marketUpdate', 'educational'];
  for (const type of types) {
    const result = await bot.generateContent(type);
    console.log(`\n${type}:\n`, result.content);
  }
}

test();
```

Run:
```bash
node test-content-bot.js
```

### Automated Tests

```javascript
// test/content-bot.test.js
const ContentCreatorBot = require('../src/bots/content-creator-bot');

describe('ContentCreatorBot', () => {
  let bot;

  beforeEach(() => {
    bot = new ContentCreatorBot(mockConfig);
  });

  test('generates good morning content', async () => {
    const content = await bot.generateContent('goodMorning');
    expect(content.content).toContain('Good morning');
    expect(content.agent).toBeDefined();
  });

  test('respects rate limits', () => {
    bot.postsToday = 10;
    // Should not post
  });

  test('flags sensitive content', () => {
    const content = { content: 'Guaranteed 100x returns!' };
    expect(bot.needsHumanApproval(content.content)).toBe(true);
  });
});
```

---

## 🚀 Deployment Checklist

- [ ] Environment variables set
- [ ] Admin user IDs configured
- [ ] Links updated to real URLs
- [ ] Rate limits configured appropriately
- [ ] Approval system tested
- [ ] Logging set up
- [ ] Health checks working
- [ ] Monitoring dashboard ready
- [ ] Backup system for content history
- [ ] PM2 or systemd configured
- [ ] Alert system for errors
- [ ] Test all content types
- [ ] Community announcement prepared

---

## 📞 Troubleshooting

### Bot starts but doesn't post

```bash
# Check scheduled times
console.log(bot.optimalTimes);

# Check rate limits
console.log('Posts today:', bot.postsToday);
console.log('Max posts:', bot.maxPostsPerDay);

# Manually trigger
await bot.createScheduledContent('morning');
```

### Approval queue filling up

```javascript
// Auto-approve after review period
setInterval(async () => {
  const queue = await bot.getApprovalQueue();

  queue.forEach(async (item, index) => {
    const hoursSinceAdded = (Date.now() - item.addedToQueue) / 3600000;

    if (hoursSinceAdded > 24) {
      console.log(`Auto-approving old content: ${index}`);
      await bot.approveContent(index);
    }
  });
}, 3600000); // Check hourly
```

### Memory leaks

```javascript
// Clear old history
setInterval(() => {
  const oneWeekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
  bot.contentHistory = bot.contentHistory.filter(
    post => post.timestamp > oneWeekAgo
  );
}, 86400000); // Daily cleanup
```

---

## 🎯 Optimization Tips

### 1. Cache Common Content

```javascript
this.cache = {
  marketData: null,
  marketDataAge: 0,
  maxCacheAge: 300000 // 5 minutes
};

async getMarketSnapshot() {
  const now = Date.now();

  if (this.cache.marketData && (now - this.cache.marketDataAge) < this.cache.maxCacheAge) {
    return this.cache.marketData;
  }

  this.cache.marketData = await this.fetchMarketData();
  this.cache.marketDataAge = now;

  return this.cache.marketData;
}
```

### 2. Batch Database Writes

```javascript
// Instead of saving after each post
this.pendingWrites = [];

async saveHistory() {
  if (this.pendingWrites.length > 0) {
    // Write all at once
    await fs.writeFile('history.json', JSON.stringify(this.pendingWrites));
    this.pendingWrites = [];
  }
}

// Save every 5 minutes instead of every post
setInterval(() => this.saveHistory(), 300000);
```

### 3. Lazy Load Templates

```javascript
// Only load templates when needed
get templates() {
  if (!this._templates) {
    this._templates = this.initializeTemplates();
  }
  return this._templates;
}
```

---

## 🌟 Advanced Features

### A/B Testing

Track which content performs best:

```javascript
async createABTest(typeA, typeB) {
  const contentA = await this.generateContent(typeA);
  const contentB = await this.generateContent(typeB);

  // Post A to main group
  await this.postContent(contentA);

  // Post B to test channel
  await this.bot.sendMessage(testChannelId, contentB.content);

  // Compare engagement after 1 hour
  setTimeout(async () => {
    const engagementA = await this.getEngagement(contentA.id);
    const engagementB = await this.getEngagement(contentB.id);

    console.log('A/B Test Results:', { engagementA, engagementB });
  }, 3600000);
}
```

### Content Scheduling UI

Build a simple web dashboard:

```html
<!-- dashboard.html -->
<div id="scheduler">
  <select id="contentType">
    <option>goodMorning</option>
    <option>marketUpdate</option>
    <option>agentSpotlight</option>
  </select>

  <input type="datetime-local" id="scheduleTime">

  <button onclick="schedulePost()">Schedule</button>
</div>

<script>
async function schedulePost() {
  const type = document.getElementById('contentType').value;
  const time = document.getElementById('scheduleTime').value;

  await fetch('/api/schedule', {
    method: 'POST',
    body: JSON.stringify({ type, time }),
    headers: { 'Content-Type': 'application/json' }
  });

  alert('Post scheduled!');
}
</script>
```

---

**Now you're ready to automate your community engagement!** 🚀

For questions or issues, refer to:
- Main guide: `docs/content-bot-guide.md`
- Examples: `docs/content-examples.md`
- Quick start: `src/bots/CONTENT_BOT_README.md`
