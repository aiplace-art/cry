# Mention Monitor Bot - Deployment Checklist

## 🚀 Pre-Deployment (Complete these BEFORE going live)

### 1. Bot Setup ✓
- [ ] Created bot with @BotFather
- [ ] Saved bot token securely
- [ ] Set bot username (memorable, professional)
- [ ] Set bot description (explains what it does)
- [ ] Disabled privacy mode (@BotFather → /setprivacy → Disable)
- [ ] Set bot profile picture (optional but recommended)

### 2. Configuration ✓
- [ ] Copied `config/mention-monitor-config.example.json`
- [ ] Renamed to `config/mention-monitor-config.json`
- [ ] Added real bot token
- [ ] Added admin Telegram user ID(s)
- [ ] Set appropriate `maxResponsesPerHour` (start with 5)
- [ ] Configured keywords for HypeAI project
- [ ] Verified JSON is valid (use jsonlint.com if unsure)

### 3. Security ✓
- [ ] Bot token is NOT in git repository
- [ ] Added `config/mention-monitor-config.json` to .gitignore
- [ ] Admin IDs are only trusted team members
- [ ] Logs directory added to .gitignore
- [ ] No sensitive data in committed files
- [ ] Reviewed security notes in documentation

### 4. Testing ✓
- [ ] Created private test group
- [ ] Added bot to test group
- [ ] Ran bot: `npm run mention-bot`
- [ ] Bot started without errors
- [ ] Posted test mention: "Has anyone tried HypeAI?"
- [ ] Received admin notification
- [ ] Checked queue: `/queue`
- [ ] Successfully approved a response: `/approve <ID>`
- [ ] Response appeared in test group
- [ ] Tested rejection: `/reject <ID>`
- [ ] Checked stats: `/stats`
- [ ] Tested blacklist: `/blacklist <chat_id>`
- [ ] Verified rate limiting (approve 6 responses quickly)
- [ ] Tested sentiment detection (positive, neutral, negative)
- [ ] All tests from `docs/TESTING-MENTION-BOT.md` passed

### 5. Documentation Review ✓
- [ ] Read `docs/MENTION-MONITOR-README.md`
- [ ] Read `docs/mention-bot-guide.md`
- [ ] Understand legal compliance requirements
- [ ] Know how to handle blacklist requests
- [ ] Familiar with all admin commands
- [ ] Reviewed best practices section

## 📋 Deployment Day

### Step 1: Final Preparation
```bash
# Ensure dependencies installed
npm install

# Run one final test
npm run mention-bot
# (Ctrl+C after confirming it starts)

# Verify logs directory exists
ls -la logs/
```

### Step 2: Start in Production Mode
```bash
# Start with PM2 (recommended for production)
npm run mention-bot:pm2

# Verify it's running
pm2 status

# Check logs
pm2 logs mention-monitor --lines 20
```

### Step 3: Add to First Group
```bash
# Start with ONE friendly group
# 1. Get permission from group admin
# 2. Add bot to group
# 3. Make bot admin (optional, but allows better features)
# 4. Post test mention to verify detection
```

### Step 4: Monitor Closely (First 24 Hours)
```bash
# Check status every 2-3 hours
pm2 logs mention-monitor

# Review queue frequently
# Send to bot on Telegram: /queue

# Check stats
# Send to bot: /stats

# Be ready to /blacklist if requested
```

## 📊 Post-Deployment (First Week)

### Daily Tasks
- [ ] Morning: Check `/stats`
- [ ] Midday: Review `/queue`, approve high-value
- [ ] Evening: Check `/stats` again
- [ ] Review logs: `cat logs/mentions.jsonl | tail -20`

### End of Week 1
- [ ] Run analytics: `npm run mention-analytics`
- [ ] Calculate key metrics:
  - Mentions detected
  - Approval rate (target: 50-70%)
  - Response rate (target: 20-40%)
  - Engagement score (target: 75+)
- [ ] Identify top-performing keywords
- [ ] Note peak activity hours
- [ ] Adjust config based on learnings

## 🔄 Scaling Up (Week 2+)

### Add More Groups (Gradually)
- [ ] Week 2: Add 2nd group
- [ ] Week 3: Add 3rd and 4th groups
- [ ] Week 4: Evaluate and add more if capacity allows

### Optimization
- [ ] Refine keyword list (add top performers)
- [ ] Update response templates
- [ ] Adjust opportunity scoring if needed
- [ ] Consider increasing rate limit (carefully)

### Team Training
- [ ] Add additional admins to config
- [ ] Share documentation with team
- [ ] Practice approval workflow together
- [ ] Establish approval criteria
- [ ] Set up rotation schedule

## ⚠️ Emergency Procedures

### If Bot Misbehaves
```bash
# STOP IMMEDIATELY
pm2 stop mention-monitor

# Review logs
pm2 logs mention-monitor --lines 100

# Fix issue in config or code

# Restart when ready
pm2 restart mention-monitor
```

### If Group Requests Removal
```bash
# 1. Apologize professionally
# 2. Blacklist immediately
#    Send to bot: /blacklist <chat_id>
# 3. Leave the group
# 4. Document the incident
# 5. Review what went wrong
```

### If Rate Limited by Telegram
```bash
# 1. Stop bot
pm2 stop mention-monitor

# 2. Wait 1 hour
# 3. Reduce maxResponsesPerHour in config
# 4. Restart carefully
pm2 restart mention-monitor
```

## 📈 Success Indicators

### Week 1 Success:
- ✅ Bot runs 24/7 without crashes
- ✅ Detected 10+ relevant mentions
- ✅ Approved 3-5 high-value responses
- ✅ No spam complaints
- ✅ No rate limit violations
- ✅ Positive community feedback

### Month 1 Success:
- ✅ Engagement score 75+
- ✅ Approval rate 50-70%
- ✅ Active in 3-5 groups
- ✅ Generated valuable conversations
- ✅ Identified top keywords
- ✅ Established approval workflow

## 🎯 Quarterly Review

Every 3 months, evaluate:

### Metrics Review
- [ ] Total mentions detected
- [ ] Total responses sent
- [ ] Approval vs rejection rate
- [ ] Average opportunity scores
- [ ] Top performing groups
- [ ] Best keywords
- [ ] Peak activity times

### ROI Assessment
- [ ] New community members attributed to bot
- [ ] Quality of conversations generated
- [ ] Brand awareness increase
- [ ] Time saved vs manual monitoring
- [ ] Team satisfaction with tool

### System Health
- [ ] Bot uptime percentage
- [ ] Error rate
- [ ] Log file sizes (cleanup if needed)
- [ ] PM2 resource usage
- [ ] Config updates needed

### Strategic Planning
- [ ] Continue as-is?
- [ ] Expand to more groups?
- [ ] Reduce rate limit?
- [ ] Update keywords?
- [ ] Refine scoring algorithm?
- [ ] Add new features?

## 🛠️ Maintenance Schedule

### Daily (5 minutes)
- Check `/queue`
- Approve/reject responses
- Monitor for issues

### Weekly (15 minutes)
- Review `/stats`
- Run analytics report
- Adjust keywords if needed
- Check PM2 status

### Monthly (30 minutes)
- Full analytics review
- Config optimization
- Response template updates
- Team performance review

### Quarterly (2 hours)
- Comprehensive system audit
- Strategic planning
- Major updates/improvements
- Documentation updates

## 📞 Support Contacts

### Technical Issues
- Documentation: `docs/` folder
- Logs: `logs/mentions.jsonl`, `logs/interactions.jsonl`
- PM2 logs: `pm2 logs mention-monitor`

### Telegram Bot Issues
- @BotFather - Bot management
- Telegram API Status: https://status.telegram.org/

### Team Escalation
- Primary admin: [Your contact]
- Secondary admin: [Backup contact]
- Technical lead: [Developer contact]

## ✅ Final Pre-Launch Checklist

Before announcing bot to wider audience:

- [ ] All deployment steps completed
- [ ] Tested in at least 1 group for 1 week
- [ ] No crashes or errors
- [ ] Rate limiting working correctly
- [ ] Admin team trained
- [ ] Documentation accessible
- [ ] Emergency procedures understood
- [ ] Backup admin configured
- [ ] Success metrics defined
- [ ] Monitoring schedule established

## 🎉 Launch Announcement (Template)

Once stable, announce to team:

```
🤖 Mention Monitor Bot is now live!

What it does:
- Monitors for HypeAI mentions and related keywords
- Suggests responses (with human approval)
- Provides analytics on community sentiment

How to use:
- Check queue: Send /queue to the bot
- Approve: /approve <ID>
- Reject: /reject <ID>
- Stats: /stats

Documentation: docs/MENTION-MONITOR-README.md

Let's engage smartly and ethically! 🚀
```

---

**Remember: Quality over quantity. Ethical over growth at all costs.** ✅

Good luck with your deployment! 🎯
