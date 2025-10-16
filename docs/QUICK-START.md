# Telegram Growth Bots - Quick Start Guide

## 🚀 Get Started in 5 Minutes

### Step 1: Install Dependencies

```bash
cd /Users/ai.place/Crypto/src/bots
npm install
```

### Step 2: Configure Environment

Create `.env` file in project root:

```bash
TELEGRAM_BOT_TOKEN=your_bot_token_here
TELEGRAM_CHANNEL_ID=@your_channel_username
NODE_ENV=production
```

### Step 3: Run All Bots

**Option A: Simple (Development)**
```bash
node /Users/ai.place/Crypto/src/bots/run-all-growth-bots.js
```

**Option B: PM2 (Production - Recommended)**
```bash
# Install PM2
npm install -g pm2

# Start bots
pm2 start /Users/ai.place/Crypto/src/bots/run-all-growth-bots.js --name telegram-growth

# Monitor
pm2 status
pm2 logs telegram-growth

# Auto-start on reboot
pm2 startup
pm2 save
```

### Step 4: Monitor Performance

```bash
# Check status
node /Users/ai.place/Crypto/src/bots/run-all-growth-bots.js --status

# Generate report
node /Users/ai.place/Crypto/src/bots/run-all-growth-bots.js --report

# Stop all bots
node /Users/ai.place/Crypto/src/bots/run-all-growth-bots.js --stop
```

---

## 📊 What Each Bot Does

### 1. Content Creator Bot
- **Runs:** Every 4 hours (6x/day)
- **Purpose:** Posts engaging content automatically
- **Output:** 4-6 quality posts per day

### 2. Mention Monitor Bot
- **Runs:** Continuously (24/7)
- **Purpose:** Responds to mentions and engages community
- **Output:** Real-time responses within 30-60 seconds

### 3. Growth Hacker Bot
- **Runs:** Every 6 hours (4x/day)
- **Purpose:** Finds partnerships and growth opportunities
- **Output:** 5-10 partnership outreach messages per day

---

## 📈 Expected Results (30 Days)

| Metric | Target |
|--------|--------|
| New Members | 500-750 |
| Engagement Rate | 40-50% |
| Daily Active Users | 200-300 |
| Active Partnerships | 12-15 |
| Content Published | 115-135 posts |

---

## ⚠️ Important Safety Rules

### ✅ DO:
- Keep posting frequency at 4-6 hours apart
- Respond to direct mentions and questions
- Build genuine partnerships with relevant channels
- Monitor metrics daily
- Follow Telegram's terms of service

### ❌ DON'T:
- Post more than 6 times per day
- Send unsolicited mass messages
- Buy followers or fake engagement
- Spam unrelated channels
- Ignore rate limits

---

## 🔧 Troubleshooting

### Bot Not Starting?
```bash
# Check logs
tail -f /Users/ai.place/Crypto/logs/growth-bots.log

# Verify environment
echo $TELEGRAM_BOT_TOKEN
echo $TELEGRAM_CHANNEL_ID
```

### Low Engagement?
- Adjust posting times (check analytics)
- Improve content quality (more polls, questions)
- Engage more with comments
- See full strategy guide for details

### Getting Warnings from Telegram?
- Reduce posting frequency immediately
- Increase delays between messages
- Review recent content for spam patterns
- See legal guidelines in main strategy doc

---

## 📚 Documentation

- **Full Strategy:** `/docs/telegram-growth-strategy.md`
- **Bot Code:** `/src/bots/`
- **Logs:** `/logs/`
- **Data:** `/data/`

---

## 💡 Pro Tips

1. **Best Posting Times:**
   - 8-9 AM (morning commute)
   - 12-1 PM (lunch break)
   - 4-5 PM (end of workday)
   - 8-9 PM (evening leisure)

2. **Content Mix:**
   - 40% Educational
   - 30% News & Updates
   - 20% Engagement (polls, questions)
   - 10% Promotional

3. **Partnership Success:**
   - Target channels with 1K-5K members
   - Look for 30-70% audience overlap
   - Personalize every outreach message
   - Follow up after 3 days if no response

4. **Monitoring:**
   - Check status daily
   - Generate weekly reports
   - Adjust strategy based on metrics
   - Backup data regularly

---

## 🆘 Need Help?

1. Check the full strategy guide
2. Review bot logs for errors
3. Run diagnostic commands
4. Adjust configuration as needed

---

**Ready to grow your Telegram community? Start the bots and watch it happen! 🚀**

Last Updated: 2025-10-16
