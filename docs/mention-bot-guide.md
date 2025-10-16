# Mention Monitor Bot - Setup & Best Practices Guide

## 🎯 Overview

The Mention Monitor Bot is an **ethical engagement tool** that monitors public crypto groups for mentions of HypeAI and related keywords. It operates with strict safety guidelines to ensure compliance, value-driven engagement, and zero spam.

## ⚖️ Legal & Ethical Guidelines

### ✅ ALWAYS:
- Only monitor public groups where the bot has permission
- Provide genuine value in responses
- Require human approval for all responses
- Respect rate limits (max 5 responses/hour)
- Honor blacklist requests immediately
- Be transparent about being a bot
- Follow Telegram's Terms of Service

### ❌ NEVER:
- Spam unsolicited messages
- Join groups without permission
- Send automated responses without approval
- Ignore rate limits
- Engage in negative/toxic discussions
- Pretend to be a human user
- Share misleading information

## 🚀 Setup Instructions

### 1. Create Telegram Bot

```bash
# Talk to @BotFather on Telegram
/newbot
# Follow prompts to create bot
# Save the bot token
```

### 2. Get Your Admin ID

```bash
# Talk to @userinfobot on Telegram
# It will reply with your user ID
```

### 3. Configure the Bot

```bash
# Copy example config
cp config/mention-monitor-config.example.json config/mention-monitor-config.json

# Edit with your details
nano config/mention-monitor-config.json
```

**Configuration Fields:**

```json
{
  "botToken": "1234567890:ABCdefGHIjklMNOpqrsTUVwxyz",  // From @BotFather
  "adminIds": [123456789],                              // Your Telegram user ID
  "monitoredGroups": [                                  // Optional: specific groups
    "-1001234567890"                                    // Leave empty to monitor all
  ],
  "blacklist": [],                                      // Groups to ignore
  "maxResponsesPerHour": 5,                            // Rate limit
  "keywords": {                                         // Customize as needed
    "direct": [...],
    "related": [...],
    "questions": [...]
  }
}
```

### 4. Install Dependencies

```bash
npm install node-telegram-bot-api
```

### 5. Add Bot to Groups

1. Add your bot to the groups you want to monitor
2. Make sure bot has permission to read messages
3. Use `/setprivacy` with @BotFather and set to `DISABLED` so bot can see all messages

### 6. Start the Bot

```bash
# From project root
node src/bots/mention-monitor-bot.js

# Or with PM2 for production
pm2 start src/bots/mention-monitor-bot.js --name mention-monitor
pm2 save
```

## 📊 Bot Commands

### Admin Commands (DM the bot):

- `/queue` - View pending response queue
- `/approve <id>` - Approve and send a response
- `/reject <id>` - Reject a response suggestion
- `/stats` - View bot statistics
- `/blacklist <chat_id>` - Add group to blacklist

## 🎯 How It Works

### 1. Mention Detection

The bot analyzes messages in real-time:

```javascript
Direct Mention: "Has anyone tried HypeAI?"
↓
Score: 90/100 (High priority)
↓
Queue response for admin approval
```

### 2. Opportunity Scoring (0-100)

| Factor | Score |
|--------|-------|
| Direct mention | +50 |
| Question asked | +40 |
| Related topic | +20 |
| Positive sentiment | +20 |
| Is a question | +15 |
| Message quality | +10 |
| Negative sentiment | -30 |

**Score Ranges:**
- 80-100: High value (instant admin notification)
- 60-79: Medium value (queued)
- 40-59: Low value (logged only)
- <40: Ignored

### 3. Sentiment Analysis

```javascript
Positive: "What's the best AI token?"
Neutral: "Which AI projects are on Solana?"
Negative: "AI tokens are all scams" ❌ (Bot won't engage)
```

### 4. Human Approval Queue

```
New mention detected
↓
Opportunity score calculated
↓
If score >= 70: Add to queue
↓
Admin receives notification
↓
Admin approves/rejects
↓
If approved: Send response (respecting rate limits)
```

## 🎨 Response Types

### Direct Mention
```
"Hey! Yes, HypeAI is our project. We're building 15 autonomous
AI agents on Solana. What would you like to know?"
```

### Question About AI Tokens
```
"If you're looking for AI token projects, you might be interested
in HypeAI - we have 15 autonomous agents on Solana. Would love to
share more details if you're interested!"
```

### Related Discussion
```
"Interesting discussion! We're building something similar with
HypeAI - 15 autonomous AI agents on Solana. Feel free to check
us out if you're interested in this space!"
```

## 🛡️ Safety Features

### Rate Limiting
- Maximum 5 responses per hour
- Automatically resets hourly
- Prevents spam even if admin approves too many

### Blacklist System
- Groups can request to be blacklisted
- Instant removal from monitoring
- Persistent across restarts

### Human Approval Required
- NO automated responses
- Every response reviewed by human
- Context provided for informed decisions

### Sentiment Protection
- Won't engage in negative discussions
- Skips toxic conversations
- Maintains positive brand image

## 📈 Analytics Dashboard

View stats with `/stats` command:

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

**Engagement Score Formula:**
```javascript
Approval Rate × 50 + Response Rate × 50 = Engagement Score
```

## 🎯 Best Practices

### DO:
1. **Review Queue Regularly** - Check `/queue` every few hours
2. **Approve High-Value Only** - Focus on genuine opportunities
3. **Personalize Responses** - Edit suggestions before approving
4. **Track Patterns** - Monitor which keywords work best
5. **Respect Communities** - Honor blacklist requests immediately
6. **Stay Professional** - Maintain helpful, non-pushy tone

### DON'T:
1. **Auto-Approve** - Every response needs human review
2. **Exceed Rate Limits** - Stay under 5 responses/hour
3. **Engage Negatively** - Skip toxic or hostile discussions
4. **Over-Promote** - Focus on answering questions, not pushing
5. **Ignore Context** - Read full conversation before responding
6. **Spam Low-Value** - Only respond to genuine opportunities

## 🔧 Customization

### Adding Custom Keywords

Edit `config/mention-monitor-config.json`:

```json
"keywords": {
  "direct": [
    "HypeAI",
    "YourBrandName"
  ],
  "related": [
    "your niche keywords",
    "industry terms"
  ],
  "questions": [
    "questions people ask",
    "help requests"
  ]
}
```

### Adjusting Opportunity Scoring

Edit `calculateOpportunityScore()` in the code:

```javascript
// Make questions higher priority
if (data.context.isQuestion) score += 25; // Was 15

// Reduce related topic priority
else if (data.mentionType === 'related') score += 10; // Was 20
```

### Custom Response Templates

Edit `generateResponse()`:

```javascript
direct: [
  "Your custom direct mention response...",
  "Another variation...",
  "Third option..."
]
```

## 📝 Logging

The bot logs all activity:

```
logs/
  mentions.jsonl      # All detected mentions
  interactions.jsonl  # Approved/rejected responses
```

### Analyzing Logs

```bash
# Count mentions by type
cat logs/mentions.jsonl | jq '.mentionType' | sort | uniq -c

# Average opportunity score
cat logs/mentions.jsonl | jq '.opportunityScore' | awk '{sum+=$1; n++} END {print sum/n}'

# Most active groups
cat logs/mentions.jsonl | jq -r '.chatTitle' | sort | uniq -c | sort -rn
```

## 🚨 Troubleshooting

### Bot Not Receiving Messages
```bash
# Check privacy settings with @BotFather
/setprivacy
# Select your bot
# Choose "Disable" - Privacy mode disabled
```

### Rate Limit Issues
```bash
# Increase limit in config (use responsibly!)
"maxResponsesPerHour": 10  # Default is 5
```

### Admin Commands Not Working
```bash
# Verify your admin ID
# Talk to @userinfobot
# Update config with correct ID
```

### Bot Crashes
```bash
# Use PM2 for auto-restart
pm2 start src/bots/mention-monitor-bot.js --name mention-monitor
pm2 logs mention-monitor  # View logs
```

## 🔄 Workflow Example

**Day 1:**
1. Start bot in morning
2. Check `/queue` every 2-3 hours
3. Approve 2-3 high-value responses
4. Review `/stats` at end of day
5. Adjust keywords based on patterns

**Week 1:**
1. Monitor engagement score
2. Refine response templates
3. Add successful keywords
4. Remove low-performing keywords
5. Blacklist any problematic groups

**Month 1:**
1. Analyze logs for trends
2. Optimize opportunity scoring
3. Build rapport in active groups
4. Expand to new groups (with permission)
5. Document successful response patterns

## 📞 Support

If you encounter issues:
1. Check logs: `logs/mentions.jsonl`
2. Review configuration
3. Verify Telegram bot settings
4. Test in private group first
5. Monitor console output for errors

## 🎓 Training Team Members

When onboarding new admins:

1. **Share this guide**
2. **Add their admin ID to config**
3. **Train on approval criteria:**
   - Only approve scores 70+
   - Verify context before approving
   - Respect rate limits
   - Personalize responses
4. **Monitor their approvals** for first week
5. **Review metrics** together weekly

## 🌟 Success Metrics

Track these KPIs:

- **Engagement Score**: Target 75+
- **Approval Rate**: Target 60%+ (quality over quantity)
- **Response Rate**: Target 25%+ of mentions
- **Hourly Rate Usage**: Stay under limit
- **Community Feedback**: Monitor group reactions

## 📜 Legal Compliance

This bot is designed to comply with:
- ✅ Telegram Terms of Service
- ✅ Anti-spam regulations
- ✅ Crypto marketing guidelines
- ✅ Data privacy (no user data stored)
- ✅ Ethical marketing practices

**Remember:** When in doubt, be more conservative. It's better to miss an opportunity than to spam or annoy community members.

---

**Built with care for ethical crypto marketing** 🚀
