# Mention Monitor Bot - Quick Start

## 🎯 What This Bot Does

Ethically monitors Telegram groups for mentions of HypeAI and related keywords, then **suggests responses** that require **human approval** before sending. Zero spam, 100% value-driven.

## ⚡ Quick Setup (5 Minutes)

### Step 1: Create Telegram Bot
```bash
# 1. Open Telegram and talk to @BotFather
# 2. Send: /newbot
# 3. Follow prompts to name your bot
# 4. Copy the bot token (looks like: 1234567890:ABCdef...)
```

### Step 2: Get Your Admin ID
```bash
# 1. Talk to @userinfobot on Telegram
# 2. It will reply with your user ID (e.g., 123456789)
```

### Step 3: Configure Bot
```bash
# Copy example config
cp config/mention-monitor-config.example.json config/mention-monitor-config.json

# Edit with your details
nano config/mention-monitor-config.json
```

**Paste your bot token and admin ID:**
```json
{
  "botToken": "YOUR_BOT_TOKEN_HERE",
  "adminIds": [YOUR_USER_ID_HERE],
  "monitoredGroups": [],
  "blacklist": [],
  "maxResponsesPerHour": 5
}
```

### Step 4: Enable Bot to Read Messages
```bash
# 1. Talk to @BotFather
# 2. Send: /setprivacy
# 3. Choose your bot
# 4. Select "Disable" (so bot can read all messages)
```

### Step 5: Add Bot to Groups
```bash
# 1. Add your bot to target Telegram groups
# 2. Make sure it has permission to read messages
# 3. Test by mentioning "HypeAI" in the group
```

### Step 6: Start Bot
```bash
# Simple start
node src/bots/mention-monitor-bot.js

# OR use the start script
./scripts/start-mention-monitor.sh

# OR use PM2 for production
pm2 start src/bots/mention-monitor-bot.js --name mention-monitor
```

## 🎮 How to Use

### Monitor Mentions (Automatic)
Bot automatically detects:
- Direct mentions: "Has anyone used HypeAI?"
- Questions: "What's the best AI token on Solana?"
- Related topics: "Looking for AI agent projects"

### Approve Responses (Manual)

**Check pending queue:**
```
Send to bot: /queue
```

**You'll see:**
```
📋 Pending Responses

ID: 1701234567890
Chat: Crypto Trading Group
Score: 85/100
Type: question
Sentiment: neutral
Mention: "Anyone know good AI tokens on Solana?"
Suggested Response: "If you're looking for AI token projects..."

/approve 1701234567890 | /reject 1701234567890
```

**Approve a response:**
```
Send to bot: /approve 1701234567890
```

**Reject a response:**
```
Send to bot: /reject 1701234567890
```

### View Statistics
```
Send to bot: /stats
```

You'll see:
```
📊 Mention Monitor Stats

Mentions Detected: 47
Responses Approved: 12
Responses Rejected: 8
Hourly Rate Limit: 3/5
Pending Queue: 2
Monitored Groups: 5
Blacklisted Chats: 1

Engagement Score: 78/100
```

## 🛡️ Safety Features

### ✅ What Makes This Safe

1. **Human Approval Required**: NO automated responses
2. **Rate Limiting**: Max 5 responses per hour (configurable)
3. **Blacklist System**: Respect groups that don't want it
4. **Sentiment Protection**: Won't engage in negative discussions
5. **Opportunity Scoring**: Only suggests high-value responses
6. **Full Logging**: Track all activity

### ❌ What This Bot WON'T Do

- ❌ Send unsolicited messages
- ❌ Spam groups
- ❌ Auto-respond without approval
- ❌ Engage in toxic discussions
- ❌ Pretend to be human
- ❌ Join groups without permission

## 📊 Opportunity Scoring

Each mention gets scored 0-100:

| Score | Action |
|-------|--------|
| 80-100 | 🔥 High value - instant notification |
| 60-79 | ⚡ Medium value - added to queue |
| 40-59 | 📝 Low value - logged only |
| 0-39 | 🚫 Ignored |

**Scoring factors:**
- Direct mention of HypeAI: +50
- Question asked: +40
- Related topic: +20
- Positive sentiment: +20
- Message quality: +10
- Negative sentiment: -30

## 🎯 Best Practices

### DO:
- ✅ Review queue every 2-3 hours
- ✅ Only approve high-value opportunities (70+ score)
- ✅ Personalize responses before approving
- ✅ Stay under rate limit (5/hour)
- ✅ Honor blacklist requests immediately

### DON'T:
- ❌ Auto-approve everything
- ❌ Exceed rate limits
- ❌ Engage in negative discussions
- ❌ Send generic copy-paste responses
- ❌ Ignore context

## 🔧 Customization

### Add Custom Keywords
Edit `config/mention-monitor-config.json`:

```json
"keywords": {
  "direct": [
    "HypeAI",
    "YourBrand"
  ],
  "related": [
    "your industry keywords",
    "niche terms"
  ]
}
```

### Adjust Rate Limit
```json
"maxResponsesPerHour": 10  // Default is 5
```

### Monitor Specific Groups Only
```json
"monitoredGroups": [
  "-1001234567890",  // Group chat ID
  "-1009876543210"
]
```

**Get group chat ID:**
1. Add bot to group
2. Bot will log the chat ID in console
3. Copy and add to config

## 📝 View Logs

```bash
# All detected mentions
cat logs/mentions.jsonl

# Approved/rejected responses
cat logs/interactions.jsonl

# Count mentions by type
cat logs/mentions.jsonl | jq '.mentionType' | sort | uniq -c

# Average opportunity score
cat logs/mentions.jsonl | jq '.opportunityScore' | awk '{sum+=$1; n++} END {print sum/n}'
```

## 🚨 Troubleshooting

### Bot not receiving messages?
```bash
# Check @BotFather privacy settings
# Make sure privacy mode is DISABLED
/setprivacy -> Choose bot -> Disable
```

### Commands not working?
```bash
# Verify admin ID is correct
# Talk to @userinfobot to get your ID
# Update config/mention-monitor-config.json
```

### Bot crashes?
```bash
# Use PM2 for auto-restart
pm2 start src/bots/mention-monitor-bot.js --name mention-monitor
pm2 logs mention-monitor
```

## 📞 Commands Reference

| Command | Description |
|---------|-------------|
| `/queue` | View pending response queue |
| `/approve <id>` | Approve and send response |
| `/reject <id>` | Reject response suggestion |
| `/stats` | View bot statistics |
| `/blacklist <chat_id>` | Add group to blacklist |

## 🎓 Example Workflow

**Morning:**
```bash
# Start bot
pm2 start mention-monitor

# Check initial stats
Send to bot: /stats
```

**Throughout Day:**
```bash
# Every 2-3 hours
Send to bot: /queue

# Review each opportunity
# If high value and relevant:
/approve 1701234567890

# If low value or off-topic:
/reject 1701234567890
```

**Evening:**
```bash
# Review daily stats
Send to bot: /stats

# Analyze what worked
cat logs/mentions.jsonl | jq '.mentionType' | sort | uniq -c
```

## 📚 Full Documentation

For detailed guide including:
- Legal compliance
- Advanced customization
- Analytics
- Team training
- Success metrics

See: [docs/mention-bot-guide.md](./mention-bot-guide.md)

## 🌟 Success Tips

1. **Quality over Quantity**: Approve only genuine opportunities
2. **Personalize Responses**: Edit suggestions to fit context
3. **Track Patterns**: Monitor which keywords perform best
4. **Stay Professional**: Helpful, never pushy
5. **Respect Communities**: Honor blacklist requests

## ⚖️ Legal Compliance

This bot is designed to comply with:
- ✅ Telegram Terms of Service
- ✅ Anti-spam regulations
- ✅ Ethical marketing practices
- ✅ Data privacy (no user data stored)

**When in doubt, be conservative.** Better to miss an opportunity than to spam.

---

**Ready to start?** Follow the Quick Setup above! 🚀
