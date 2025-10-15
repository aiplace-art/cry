# 🤖 HypeAI Telegram Bot - Complete Setup Guide

## 📋 Table of Contents
1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Installation](#installation)
4. [Configuration](#configuration)
5. [Bot Features](#bot-features)
6. [Database Structure](#database-structure)
7. [Commands Reference](#commands-reference)
8. [Running the Bot](#running-the-bot)
9. [Monitoring & Analytics](#monitoring--analytics)
10. [Troubleshooting](#troubleshooting)

---

## 🎯 Overview

HypeAI Telegram Bot is a comprehensive community automation system designed to:
- **Welcome new members** with onboarding information
- **Manage airdrops** with task verification and rewards
- **Track referrals** and incentivize community growth
- **Auto-post content** 24/7 to keep the community engaged
- **Moderate spam** and maintain community quality
- **Provide analytics** on community growth and engagement

**Key Stats:**
- 📊 **600+ lines of code**
- 🎁 **500 HYPE** per airdrop completion
- 💰 **100 HYPE** per referral
- 📝 **5 content types** (news, updates, memes, signals, education)
- 🛡️ **Advanced anti-spam** (5 msg/min limit)

---

## 📦 Prerequisites

### Required Software
```bash
# Node.js (v16 or higher)
node --version  # Should be v16+

# npm (comes with Node.js)
npm --version
```

### Required Accounts
1. **Telegram Account** - For creating the bot
2. **Bot Token** - From @BotFather
3. **Channel/Group** - Where the bot will operate

---

## 🚀 Installation

### Step 1: Install Dependencies

```bash
# Navigate to project directory
cd /Users/ai.place/Crypto

# Install required packages
npm install node-telegram-bot-api axios dotenv
```

### Step 2: Create Telegram Bot

1. **Open Telegram** and search for `@BotFather`
2. **Start chat** with BotFather
3. **Create new bot**:
   ```
   /newbot
   ```
4. **Follow prompts**:
   - Name: `HypeAI Community Bot`
   - Username: `hypeai_community_bot` (must end with `bot`)
5. **Save the token**: BotFather will give you a token like:
   ```
   1234567890:ABCdefGHIjklMNOpqrsTUVwxyz
   ```

### Step 3: Set Up Bot Permissions

1. **Add bot to your channel/group**
2. **Make bot admin** with these permissions:
   - ✅ Post messages
   - ✅ Delete messages
   - ✅ Restrict members
   - ✅ Pin messages
   - ✅ Invite users via link

### Step 4: Get Channel/Group IDs

**For Channel:**
```bash
# Forward any message from your channel to @userinfobot
# It will show the channel ID like: @hypeai or -1001234567890
```

**For Group:**
```bash
# Add @userinfobot to your group temporarily
# It will show the group ID like: -1001234567890
```

---

## ⚙️ Configuration

### Step 1: Copy Environment Template

```bash
cp scripts/.env.telegram.example scripts/.env.telegram
```

### Step 2: Edit Configuration

Open `scripts/.env.telegram` and fill in your credentials:

```bash
# ============================================
# TELEGRAM BOT CONFIGURATION
# ============================================

# Bot Token from @BotFather
TELEGRAM_BOT_TOKEN=1234567890:ABCdefGHIjklMNOpqrsTUVwxyz

# Channel Configuration
TELEGRAM_CHANNEL_ID=@hypeai
TELEGRAM_CHANNEL_USERNAME=hypeai

# Group Configuration
TELEGRAM_GROUP_ID=-1001234567890

# Admin User IDs (comma-separated)
TELEGRAM_ADMIN_IDS=123456789,987654321

# ============================================
# AIRDROP SETTINGS
# ============================================

AIRDROP_REWARD=500
AIRDROP_REFERRAL_REWARD=100
AIRDROP_MIN_TASKS=3
AIRDROP_TOTAL_POOL=1000000

# ============================================
# CONTENT AUTOMATION
# ============================================

AUTO_POST_ENABLED=true
AUTO_POST_INTERVAL=4  # Hours between posts
CONTENT_TYPES=news,updates,memes,signals,education

# ============================================
# MODERATION SETTINGS
# ============================================

SPAM_MAX_MESSAGES=5  # Max messages per minute
SPAM_TIME_WINDOW=60  # Seconds
BAD_WORDS=scam,fake,fraud,ponzi
AUTO_MODERATE=true
DELETE_SPAM=true

# ============================================
# ANALYTICS
# ============================================

ANALYTICS_ENABLED=true
ANALYTICS_REPORT_INTERVAL=24  # Hours
ANALYTICS_EXPORT_FORMAT=json,csv

# ============================================
# DATABASE
# ============================================

DATABASE_PATH=.telegram/database.json
BACKUP_ENABLED=true
BACKUP_INTERVAL=6  # Hours
```

### Step 3: Customize Welcome Message

Edit the welcome message in the configuration section of `telegram-community-bot.js`:

```javascript
const CONFIG = {
  welcomeMessage: `
🎉 **Welcome to HypeAI, {username}!**

We're building the future of AI-powered DeFi.

**Get Started:**
💰 Claim Airdrop: /airdrop
🔗 Invite Friends: /referral
📊 Check Price: /price
📈 View Stats: /stats

**Useful Links:**
🌐 Website: https://hypeai.io
📱 Twitter: https://twitter.com/hypeai
📖 Docs: https://docs.hypeai.io

Need help? Type /help
  `
};
```

---

## 🎮 Bot Features

### 1️⃣ Welcome System

**Triggers:** New member joins channel/group

**Actions:**
- Sends personalized welcome message
- Provides onboarding instructions
- Shows airdrop and referral info
- Records join in analytics

**Example:**
```
🎉 Welcome to HypeAI, @username!

💰 Get Started: /airdrop
🔗 Invite friends: /referral
📊 Check price: /price
```

### 2️⃣ Airdrop System

**Command:** `/airdrop`

**Features:**
- Task-based verification
- Reward tracking (500 HYPE per completion)
- Referral bonuses (100 HYPE per referral)
- Duplicate prevention
- Analytics tracking

**Tasks:**
1. ✅ Join Telegram channel
2. ✅ Follow Twitter
3. ✅ Retweet announcement
4. ✅ Join Discord
5. ✅ Refer 3 friends

**Response:**
```
🎁 HypeAI Airdrop

Complete tasks to earn 500 HYPE tokens!

Tasks:
1. ✅ Join @hypeai
2. ⬜ Follow @hypeai on Twitter
3. ⬜ Retweet pinned tweet
4. ⬜ Join Discord
5. ⬜ Refer 3 friends

Progress: 1/5
Rewards: 0 HYPE

Complete all tasks: /verify
```

### 3️⃣ Referral System

**Command:** `/referral`

**Features:**
- Unique referral links
- Real-time tracking
- Leaderboard
- Rewards (100 HYPE per referral)

**Response:**
```
🔗 Your Referral Link

https://t.me/hypeai_bot?start=ref_123456789

📊 Your Stats:
👥 Referrals: 12
💰 Earned: 1,200 HYPE

🏆 Leaderboard:
1. @user1 - 45 referrals
2. @user2 - 38 referrals
3. @you - 12 referrals
```

### 4️⃣ Price Tracking

**Command:** `/price`

**Features:**
- Real-time price data
- 24h change percentage
- Market cap
- Volume
- Chart link

**Response:**
```
💎 HYPE Price

$0.0024 (+12.5%)

24h Volume: $2.4M
Market Cap: $24M

📈 Chart: https://dexscreener.com/...
```

### 5️⃣ Statistics

**Command:** `/stats`

**Features:**
- Community size
- Growth rate
- Active users
- Total airdrops
- Total rewards distributed

**Response:**
```
📊 HypeAI Community Stats

👥 Total Members: 5,234 (+156 today)
📈 Growth Rate: +3.2% (24h)
💬 Active Users: 1,847
🎁 Airdrops Claimed: 892
💰 Rewards Distributed: 446,000 HYPE
```

### 6️⃣ Auto-Posting

**Frequency:** Every 4 hours

**Content Types:**
1. **News** - Market updates, partnerships
2. **Updates** - Development progress
3. **Memes** - Community engagement
4. **Signals** - Trading insights
5. **Education** - DeFi tutorials

**Example Posts:**
```
🚀 HypeAI News

We've partnered with ChainLink to integrate
real-time price feeds into our AI oracle!

This means more accurate predictions and
better trading signals for our community.

Read more: https://blog.hypeai.io/...
```

### 7️⃣ Moderation

**Features:**
- Spam detection (5 msg/min limit)
- Bad word filtering
- Auto-delete spam
- Warn/ban system
- Admin controls

**Actions:**
- ⚠️ Warning (1st offense)
- 🚫 Mute 1 hour (2nd offense)
- ❌ Ban (3rd offense)

---

## 💾 Database Structure

The bot stores data in `.telegram/database.json`:

```json
{
  "users": {
    "123456789": {
      "id": 123456789,
      "username": "johndoe",
      "firstName": "John",
      "lastName": "Doe",
      "joinedAt": "2025-01-15T10:30:00Z",
      "airdropCompleted": false,
      "referredBy": null,
      "referrals": [],
      "tasks": {
        "joinTelegram": true,
        "followTwitter": false,
        "retweetPost": false,
        "joinDiscord": false,
        "referFriends": false
      },
      "rewards": 0,
      "warnings": 0,
      "banned": false
    }
  },
  "analytics": {
    "totalJoins": 5234,
    "totalMessages": 12456,
    "totalAirdrops": 892,
    "totalRewards": 446000,
    "dailyStats": {
      "2025-01-15": {
        "joins": 156,
        "messages": 423,
        "airdrops": 34
      }
    }
  },
  "config": {
    "lastBackup": "2025-01-15T14:00:00Z",
    "version": "1.0.0"
  }
}
```

**Backup:**
- Automatic backup every 6 hours
- Stored in `.telegram/backups/`
- Format: `database_YYYY-MM-DD_HH-mm-ss.json`

---

## 📝 Commands Reference

### User Commands

| Command | Description | Example |
|---------|-------------|---------|
| `/start` | Start bot interaction | `/start` |
| `/help` | Show help message | `/help` |
| `/airdrop` | Check airdrop status | `/airdrop` |
| `/verify` | Verify airdrop tasks | `/verify` |
| `/referral` | Get referral link | `/referral` |
| `/price` | Check HYPE price | `/price` |
| `/stats` | View community stats | `/stats` |

### Admin Commands

| Command | Description | Example |
|---------|-------------|---------|
| `/broadcast <msg>` | Send message to all | `/broadcast New update!` |
| `/ban <user>` | Ban user | `/ban @spammer` |
| `/unban <user>` | Unban user | `/unban @spammer` |
| `/analytics` | Full analytics report | `/analytics` |
| `/export` | Export database | `/export` |
| `/backup` | Manual backup | `/backup` |

---

## 🏃 Running the Bot

### Development Mode

```bash
# Start bot with auto-reload
node scripts/telegram-community-bot.js
```

### Production Mode

```bash
# Install PM2 (process manager)
npm install -g pm2

# Start bot with PM2
pm2 start scripts/telegram-community-bot.js --name hypeai-bot

# View logs
pm2 logs hypeai-bot

# Restart bot
pm2 restart hypeai-bot

# Stop bot
pm2 stop hypeai-bot

# Auto-start on system reboot
pm2 startup
pm2 save
```

### Docker Mode

```bash
# Build Docker image
docker build -t hypeai-bot -f docker/Dockerfile.telegram .

# Run container
docker run -d \
  --name hypeai-bot \
  --env-file scripts/.env.telegram \
  --restart unless-stopped \
  hypeai-bot

# View logs
docker logs -f hypeai-bot

# Stop container
docker stop hypeai-bot
```

---

## 📊 Monitoring & Analytics

### Real-Time Monitoring

```bash
# View bot logs
pm2 logs hypeai-bot

# Monitor bot status
pm2 status

# View resource usage
pm2 monit
```

### Analytics Dashboard

Access analytics via bot commands:

```
/analytics
```

**Report includes:**
- 📈 Growth metrics (daily, weekly, monthly)
- 👥 User engagement (active users, message count)
- 🎁 Airdrop performance (completion rate, rewards)
- 🔗 Referral stats (top referrers, conversion rate)
- ⚠️ Moderation stats (spam detected, users banned)

### Export Data

```bash
# Export to JSON
/export json

# Export to CSV
/export csv

# Files saved to:
.telegram/exports/analytics_2025-01-15.json
.telegram/exports/analytics_2025-01-15.csv
```

---

## 🔧 Troubleshooting

### Common Issues

#### 1. Bot Not Responding

**Symptoms:**
- Commands don't work
- No messages from bot

**Solutions:**
```bash
# Check if bot is running
pm2 status hypeai-bot

# Restart bot
pm2 restart hypeai-bot

# Check logs for errors
pm2 logs hypeai-bot --err
```

#### 2. Airdrop Tasks Not Verifying

**Symptoms:**
- Tasks remain incomplete
- `/verify` doesn't work

**Solutions:**
- Ensure bot is admin in channel/group
- Check channel/group IDs in config
- Verify user completed tasks manually

#### 3. Auto-Posting Not Working

**Symptoms:**
- No automatic posts
- Posts stopped

**Solutions:**
```bash
# Check config
grep AUTO_POST_ENABLED scripts/.env.telegram

# Should be: AUTO_POST_ENABLED=true

# Restart bot
pm2 restart hypeai-bot
```

#### 4. Database Errors

**Symptoms:**
- "Cannot read database"
- "Database corrupted"

**Solutions:**
```bash
# Restore from backup
cd .telegram/backups
ls -lt  # Find latest backup
cp database_2025-01-15_14-00-00.json ..database.json

# Restart bot
pm2 restart hypeai-bot
```

#### 5. Permission Errors

**Symptoms:**
- "Bot was blocked by user"
- "Not enough rights"

**Solutions:**
- Ensure bot is admin in channel/group
- Check bot has all required permissions:
  - Post messages
  - Delete messages
  - Restrict members
  - Pin messages

### Debug Mode

Enable debug logging:

```bash
# Add to .env.telegram
DEBUG=true
LOG_LEVEL=debug

# Restart bot
pm2 restart hypeai-bot

# View detailed logs
pm2 logs hypeai-bot
```

---

## 🚀 Advanced Features

### Custom Content Generation

Edit content templates in `telegram-community-bot.js`:

```javascript
const CONTENT_TEMPLATES = {
  news: [
    '🚀 {title}\n\n{content}\n\nRead more: {link}',
    '📰 Breaking: {title}\n\n{content}'
  ],
  memes: [
    '😂 {caption}\n\n{content}',
    '🎭 {content}'
  ]
  // Add your own templates
};
```

### Integration with AI Marketing Bot

Connect with `ai-marketing-bot.js` for coordinated campaigns:

```javascript
// In telegram-community-bot.js
const marketingBot = require('./ai-marketing-bot');

async function syncWithMarketing() {
  const latestPost = await marketingBot.getLatestPost();
  await this.shareToTelegram(latestPost);
}
```

### Webhook Mode (for better performance)

```javascript
// Instead of polling
const bot = new TelegramBot(TOKEN, { polling: true });

// Use webhooks
const bot = new TelegramBot(TOKEN);
bot.setWebHook(`https://yourdomain.com/bot${TOKEN}`);

// Express server to handle webhooks
app.post(`/bot${TOKEN}`, (req, res) => {
  bot.processUpdate(req.body);
  res.sendStatus(200);
});
```

---

## 📞 Support

**Issues?** Open a ticket:
- GitHub: https://github.com/hypeai/bot/issues
- Telegram: @hypeai_support
- Email: support@hypeai.io

**Documentation:**
- Full docs: https://docs.hypeai.io/telegram-bot
- API reference: https://docs.hypeai.io/api
- Community: https://t.me/hypeai_dev

---

## 🎉 Success Checklist

Before going live, ensure:

- ✅ Bot token configured
- ✅ Channel/Group IDs set
- ✅ Bot is admin with all permissions
- ✅ Database directory created
- ✅ Auto-posting enabled
- ✅ Moderation rules set
- ✅ Airdrop rewards configured
- ✅ Analytics enabled
- ✅ Backups configured
- ✅ PM2 process manager installed
- ✅ Monitoring set up
- ✅ All commands tested

**Test Commands:**
```bash
# Send to bot
/start
/help
/airdrop
/price
/stats
/referral

# Should all work correctly
```

---

## 📈 Expected Results

**Week 1:**
- 500-1,000 new members
- 50-100 airdrop completions
- 200-300 referrals

**Week 2-4:**
- 2,000-5,000 new members
- 200-500 airdrop completions
- 1,000-2,000 referrals

**Month 1:**
- 10,000+ community members
- 80%+ engagement rate
- 1,000+ active daily users

**Metrics to Track:**
- Daily active users
- Airdrop completion rate
- Referral conversion rate
- Message engagement
- Member retention

---

🤖 **HypeAI Telegram Bot** - Built with ❤️ by the HypeAI team

*Last updated: January 2025*
