# 🚀 HypeAI - Quick Start Guide
## From Zero to Launch in 2 Hours

**Last Updated:** 9 октября 2025

---

## 📋 What You'll Accomplish

In the next 2 hours, you will:
- ✅ Set up all 3 bots (Discord, Telegram, Twitter)
- ✅ Deploy analytics dashboard
- ✅ Configure content automation
- ✅ Set up monitoring & alerts
- ✅ Prepare for launch

**Prerequisites:**
- Node.js 18+ installed
- Git installed
- Code editor (VS Code recommended)
- 2 hours of focused time

---

## ⏱️ Phase 1: Environment Setup (15 minutes)

### Step 1: Clone and Install (5 min)

```bash
# Navigate to project
cd /Users/ai.place/Crypto

# Install all dependencies
npm install

# Install bot dependencies
cd src/bots
npm install

# Install analytics dependencies
cd ../analytics/dashboard
npm install

# Install automation dependencies
cd ../../automation
npm install

# Back to root
cd ../..
```

### Step 2: Get API Keys (10 min)

You need API keys from these services:

#### **Discord Bot** (2 min)
1. Go to https://discord.com/developers/applications
2. Click "New Application" → Name it "HypeAI Bot"
3. Go to "Bot" → Click "Add Bot"
4. Copy the **TOKEN** → Save it
5. Enable these intents:
   - ✅ Presence Intent
   - ✅ Server Members Intent
   - ✅ Message Content Intent
6. Go to "OAuth2" → "URL Generator"
   - Select scopes: `bot`, `applications.commands`
   - Select permissions: `Administrator`
   - Copy the URL and open it to invite bot to your server

#### **Telegram Bot** (2 min)
1. Open Telegram and message @BotFather
2. Send `/newbot`
3. Choose name: "HypeAI Bot"
4. Choose username: "hypeai_bot" (must end with "bot")
5. Copy the **TOKEN** → Save it

#### **Twitter API** (5 min)
1. Go to https://developer.twitter.com/en/portal/dashboard
2. Create a new app: "HypeAI Bot"
3. Enable "User authentication settings"
4. Get these credentials:
   - API Key (Consumer Key)
   - API Secret (Consumer Secret)
   - Access Token
   - Access Token Secret
   - Bearer Token
5. Copy all → Save them

#### **Other Services** (1 min)
- CoinGecko API: https://www.coingecko.com/en/api (free tier)
- Slack Webhook: https://api.slack.com/messaging/webhooks

### Step 3: Configure Environment (5 min)

Create `.env` files:

```bash
# Bots configuration
cp src/bots/.env.example src/bots/.env
nano src/bots/.env  # or use your editor

# Analytics configuration
cp src/analytics/dashboard/.env.example src/analytics/dashboard/.env.local
nano src/analytics/dashboard/.env.local

# Automation configuration
cp src/automation/.env.example src/automation/.env
nano src/automation/.env
```

**Fill in all the API keys you just collected!**

---

## ⏱️ Phase 2: Launch Bots (20 minutes)

### Step 1: Test Discord Bot (5 min)

```bash
cd src/bots
npm run start:discord
```

**In Discord:**
- Type `/price` → Should show mock price
- Type `/holders` → Should show mock holder count
- Type `/help` → Should show all commands

**If it works:** ✅ Press Ctrl+C to stop

### Step 2: Test Telegram Bot (5 min)

```bash
npm run start:telegram
```

**In Telegram:**
- Find your bot (@hypeai_bot)
- Type `/start` → Should send welcome message
- Type `/price` → Should show mock price
- Type `/setalert 0.002` → Should confirm alert set

**If it works:** ✅ Press Ctrl+C to stop

### Step 3: Test Twitter Bot (5 min)

```bash
npm run start:twitter
```

**Check console:**
- Should say "Twitter bot started, monitoring mentions..."
- Mention @yourbotname on Twitter
- Check console → Should see mention detected
- Check `data/pending-replies.json` → Should have queued reply

**If it works:** ✅ Press Ctrl+C to stop

### Step 4: Start All Bots (5 min)

```bash
# Start all bots together
npm start

# Or use PM2 for production
npm install -g pm2
pm2 start pm2.ecosystem.config.js
pm2 save
pm2 startup  # Follow instructions
```

**Verify:**
- All 3 bots should show "started"
- Check bot statuses in Discord/Telegram
- Monitor logs: `pm2 logs` or check console

---

## ⏱️ Phase 3: Deploy Analytics Dashboard (15 minutes)

### Step 1: Configure Contract Address (2 min)

Edit `src/analytics/dashboard/.env.local`:

```env
# Add your deployed contract address
NEXT_PUBLIC_CONTRACT_ADDRESS=0xYourContractAddressHere
NEXT_PUBLIC_RPC_URL=https://eth-mainnet.g.alchemy.com/v2/YOUR_KEY
```

### Step 2: Start Dashboard (3 min)

```bash
cd src/analytics/dashboard
npm run dev
```

**Open:** http://localhost:3001

**You should see:**
- Token metrics (price, market cap, volume)
- Price chart
- Social media stats
- Competitor comparison
- Influencer campaigns

### Step 3: Test Reporting (5 min)

```bash
cd ../..  # Back to src/analytics

# Test daily report
npm run report:daily

# Check your email for the report
```

### Step 4: Deploy to Production (5 min)

**Option A: Vercel (Recommended)**

```bash
npm install -g vercel
cd dashboard
vercel  # Follow prompts
```

**Option B: Docker**

```bash
docker build -t hypeai-dashboard dashboard/
docker run -p 3001:3001 hypeai-dashboard
```

---

## ⏱️ Phase 4: Content Automation (20 minutes)

### Step 1: Configure Scheduler (5 min)

Edit `src/automation/config.json`:

```json
{
  "twitter": {
    "enabled": true,
    "autoPost": true,
    "postingTimes": ["09:00", "14:00", "20:00"]
  },
  "telegram": {
    "enabled": true,
    "autoPost": true
  },
  "discord": {
    "enabled": true,
    "autoPost": true
  }
}
```

### Step 2: Test Content Scheduler (5 min)

```bash
cd src/automation

# Test scheduler (dry run - no actual posting)
npm run test:scheduler

# Should show upcoming posts from tweets.md
```

### Step 3: Start Automation (5 min)

```bash
# Start content scheduler
npm run start:scheduler

# Or with PM2
pm2 start content-scheduler.js --name hypeai-scheduler
```

**Verify:**
- Check console → Should show loaded tweets
- Check admin panel: http://localhost:3002
- Verify upcoming posts queue

### Step 4: Test Admin Panel (5 min)

**Open:** http://localhost:3002

**You can:**
- ✅ View upcoming posts (next 7 days)
- ✅ Edit post content
- ✅ Reschedule posts
- ✅ Post manually
- ✅ View analytics

---

## ⏱️ Phase 5: Influencer Outreach (15 minutes)

### Step 1: Import Influencers (5 min)

```bash
cd src/influencer

# Import influencers from docs
npm run import:influencers
```

**Should import 50+ influencers from `/docs/marketing/influencer-list.md`**

### Step 2: Test CRM (5 min)

**Open:** http://localhost:3003

**You should see:**
- List of 50+ influencers
- Status pipeline (Not Contacted → Partnered)
- Quick actions (Send DM, Email)

### Step 3: Send First Outreach (5 min)

**In the CRM:**
1. Select a micro-influencer (Tier 1)
2. Click "Send DM" or "Send Email"
3. Review the auto-generated personalized message
4. Click "Send" (or "Save as Draft")

**Monitor:**
- Check `data/outreach-log.json` for sent messages
- Responses will be detected automatically
- Follow-ups scheduled for Day 3 and Day 7

---

## ⏱️ Phase 6: Monitoring Setup (15 minutes)

### Step 1: Configure Alerts (5 min)

Edit `src/monitoring/alert-rules.json`:

```json
{
  "slack": {
    "webhook": "https://hooks.slack.com/services/YOUR/WEBHOOK/URL",
    "channel": "#hypeai-alerts"
  },
  "email": {
    "to": "your-email@example.com",
    "from": "alerts@hypeai.io"
  },
  "rules": {
    "bot_down": {
      "severity": "P1",
      "threshold": "5 minutes"
    }
  }
}
```

### Step 2: Start Monitoring (5 min)

```bash
cd src/monitoring

# Start health monitor
npm run start:monitor

# Or with PM2
pm2 start health-monitor.js --name hypeai-monitor
```

**Verify:**
- Check console → Should show "All systems operational"
- Force a test alert: `npm run test:alert`
- Check Slack/Email for test alert

### Step 3: View Dashboards (5 min)

**Monitoring Dashboard:**
http://localhost:3004

**Status Page (Public):**
http://localhost:3004/status

**You should see:**
- System health: 100% (all green)
- Recent alerts (should be empty)
- Metrics charts
- Bot statuses

---

## ⏱️ Phase 7: Launch Preparation (20 minutes)

### Step 1: Review Launch Checklist (10 min)

Open: `/docs/launch/PRE_LAUNCH_CHECKLIST.md`

**Go through each item:**
- ✅ Smart contract deployed and verified
- ✅ Liquidity added to DEX
- ✅ All bots running
- ✅ Analytics dashboard live
- ✅ Content scheduled
- ✅ Monitoring active
- ✅ Emergency contacts ready
- ✅ Team coordinated

### Step 2: Review 24H Master Plan (10 min)

Open: `/docs/launch/24H_MASTER_PLAN.md`

**Understand the timeline:**
- Hour 0: Contract deployment
- Hour 1: Verification
- Hour 2: Liquidity
- Hour 8: Asia wave
- Hour 12: Europe wave
- Hour 16: Americas wave

**Assign responsibilities:**
- Who handles what?
- Backup people for each task
- Communication channels

---

## ✅ Final Verification

### Run This Command:

```bash
npm run verify:all
```

**Should check:**
- ✅ All bots online
- ✅ Dashboard accessible
- ✅ Content scheduler running
- ✅ Monitoring active
- ✅ APIs responding
- ✅ Database connected

**If everything is ✅ GREEN → YOU'RE READY TO LAUNCH! 🚀**

---

## 🚀 Launch Day Commands

### T-1 Hour: Final Checks

```bash
# Check all systems
npm run verify:all

# Check bot status
pm2 status

# Check logs for errors
pm2 logs --lines 50

# Test emergency stop
# (Don't actually run this unless emergency!)
# npm run emergency:stop
```

### T-0: LAUNCH!

```bash
# Start launch tracking dashboard
npm run launch:dashboard

# Opens: http://localhost:3005
# Shows real-time launch progress
```

### T+1 Hour: Monitor

**Watch these metrics:**
- Token holders (target: 100+ in first hour)
- Trading volume (target: $100K+ in first hour)
- Social engagement (target: 1,000+ interactions)
- Bot performance (should be 0 errors)

### T+24 Hours: First Checkpoint

```bash
# Generate 24-hour report
npm run report:launch-24h

# Review metrics vs targets
# Adjust strategy if needed
```

---

## 🆘 Troubleshooting

### Bot Won't Start

```bash
# Check logs
pm2 logs hypeai-bots --lines 100

# Common issues:
# - Missing .env file → cp .env.example .env
# - Invalid API keys → Check and update .env
# - Port already in use → Change port in config
```

### Dashboard Shows Errors

```bash
# Check API keys
cat src/analytics/dashboard/.env.local

# Test APIs individually
npm run test:apis

# Check RPC connection
npm run test:rpc
```

### Content Not Posting

```bash
# Check scheduler logs
pm2 logs hypeai-scheduler

# Verify Twitter API limits
npm run check:rate-limits

# Manual post to test
npm run post:manual "Test tweet"
```

### Monitoring Not Alerting

```bash
# Test alert system
npm run test:alerts

# Check Slack webhook
curl -X POST WEBHOOK_URL -d '{"text":"Test"}'

# Check email config
npm run test:email
```

---

## 📞 Emergency Contacts

**If something goes wrong during launch:**

1. **Critical (P0):** Call emergency hotline
2. **Important (P1):** Slack #hypeai-emergency
3. **Normal (P2):** Slack #hypeai-support

**Emergency Procedures:**
- Contract bug → Execute emergency pause
- No liquidity → Add more immediately
- Bot failure → Restart: `pm2 restart all`
- FUD attack → Follow crisis protocol

**Rollback Plan:**
See `/docs/launch/EMERGENCY_PROTOCOLS.md`

---

## 🎉 You're Ready!

**All systems are:**
- ✅ Configured
- ✅ Tested
- ✅ Running
- ✅ Monitored

**You have:**
- ✅ 30 tweets ready to post
- ✅ 3 blog articles ready
- ✅ 50+ influencers to contact
- ✅ Complete launch plan
- ✅ Emergency protocols

**Next Steps:**
1. Final team meeting (1 hour before launch)
2. Execute 24H Master Plan
3. Monitor all metrics
4. Celebrate success! 🎊

---

**Questions?** Check these resources:
- Technical: `/docs/technical/`
- Marketing: `/docs/marketing/`
- Launch: `/docs/launch/`
- Emergency: `/docs/launch/EMERGENCY_PROTOCOLS.md`

**Good luck with your launch! 🚀💎**

---

*HypeAI - Where Hype Meets Intelligence*
*Built by 15 AI Agents, For Future Millionaires*
