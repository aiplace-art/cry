# Mention Monitor Bot - Quick Reference Card

## 🚀 Setup (5 min)
```bash
cp config/mention-monitor-config.example.json config/mention-monitor-config.json
# Edit with: bot token + admin ID
npm run mention-bot
```

## 📱 Bot Commands
```
/queue           # View pending
/approve <ID>    # Send response
/reject <ID>     # Skip
/stats           # View metrics
/blacklist <ID>  # Block group
```

## 📊 NPM Scripts
```bash
npm run mention-bot              # Start
npm run mention-bot:pm2          # Production
npm run mention-analytics        # View stats
npm run mention-analytics:export # Save report
```

## 📁 Key Files
```
Implementation:  src/bots/mention-monitor-bot.js
Config:          config/mention-monitor-config.json
Quick Start:     docs/MENTION-MONITOR-README.md
Best Practices:  docs/mention-bot-guide.md
Testing:         docs/TESTING-MENTION-BOT.md
Deployment:      docs/DEPLOYMENT-CHECKLIST.md
Complete Guide:  MENTION-BOT-COMPLETE.md
```

## 🎯 Workflow
```
1. Mention detected
2. Sentiment analyzed
3. Score calculated (0-100)
4. If 70+: Queued for approval
5. Admin reviews: /queue
6. Approve/Reject
7. If approved & under rate limit: Send
8. Log interaction
```

## 📈 Scoring
- Direct mention: +50
- Question: +40
- Related topic: +20
- Positive sentiment: +20
- Negative sentiment: -30

Score ranges:
- 90-100: High (instant notify)
- 70-89: Good (queued)
- 50-69: Medium (logged)
- 0-49: Low (ignored)

## 🛡️ Safety
- Max 5 responses/hour
- Human approval required
- Blacklist system
- Sentiment protection
- Full logging

## ✅ Pre-Launch
- [ ] Bot token configured
- [ ] Admin ID added
- [ ] Tested in private group
- [ ] All 13 tests passed
- [ ] Team trained

## 📞 Support
- Docs: `/docs/` folder
- Logs: `logs/*.jsonl`
- Runtime: `pm2 logs mention-monitor`

## 🎓 Learn More
Start here: `docs/MENTION-MONITOR-README.md` (5 min read)
