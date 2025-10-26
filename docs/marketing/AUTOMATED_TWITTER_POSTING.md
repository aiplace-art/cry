# 🤖 Automated Twitter Posting System

**Status:** ✅ Production Ready
**Version:** 1.0.0
**Last Updated:** October 21, 2025

## 📋 Overview

Fully automated Twitter posting system with intelligent scheduling, safety limits, and comprehensive monitoring.

### Key Features

✅ **Smart Scheduling** - Posts at optimal times (Moscow Time UTC+3)
✅ **Safety Limits** - Prevents spam and API violations
✅ **Auto-Retry** - Handles failures gracefully
✅ **Comprehensive Logging** - Full audit trail
✅ **Status Monitoring** - Real-time statistics
✅ **Cron Integration** - Set-and-forget automation

---

## 🚀 Quick Start

### 1. Test the System

```bash
# Test without posting
node scripts/twitter-scheduler.js --dry-run

# Check current status
node scripts/check-posting-status.js
```

### 2. Setup Automation

```bash
# Run setup wizard
bash scripts/setup-cron.sh

# Choose option 1 for auto-install
```

### 3. Monitor

```bash
# Check posting status anytime
node scripts/check-posting-status.js

# View logs
tail -f logs/cron.log
```

---

## 📅 Posting Schedule

### Moscow Time (UTC+3)

**Monday - Friday:**
- 🌅 09:00 - Morning post (breakfast time)
- ☀️ 15:00 - Afternoon post (midday peak)
- 🌙 21:00 - Evening post (prime time)

**Saturday - Sunday:**
- ☀️ 15:00 - Afternoon post
- 🌙 21:00 - Evening post

### Schedule Logic

The scheduler operates within **time windows**:
- Can post **5 minutes before** scheduled time
- Can post up to **15 minutes after** scheduled time
- This allows flexibility for system delays

**Example:**
For 09:00 slot, will post between 08:55 and 09:15

---

## 🛡️ Safety Limits

### Rate Limits

| Limit | Value | Purpose |
|-------|-------|---------|
| **Max per day** | 3 posts | Prevent spam |
| **Max per week** | 18 posts | Safety buffer |
| **Max per month** | 90 posts | Twitter Free tier (100 limit with buffer) |
| **Min gap** | 4 hours | Avoid flooding |

### Error Handling

- **Max consecutive errors:** 3
- **Auto-retry:** Up to 3 attempts
- **Automatic stop:** After 3 consecutive failures

### What Gets Blocked

❌ Posting more than 3 times per day
❌ Posting within 4 hours of last post
❌ Exceeding monthly quota (90 posts)
❌ Posting after 3 consecutive errors
✅ All other posts proceed normally

---

## 🔧 Installation & Setup

### Prerequisites

- Node.js installed
- Twitter API credentials configured
- Existing auto-poster working (`scripts/auto-poster.js`)

### Method 1: Automatic Cron (Recommended)

```bash
bash scripts/setup-cron.sh
# Choose option 1
```

This will:
1. Add crontab entries
2. Setup logging
3. Configure schedules
4. Verify installation

### Method 2: Manual Cron

```bash
# Edit crontab
crontab -e

# Add these lines (adjust times for your timezone):
# Morning (9 AM Moscow = 6 AM UTC for UTC system)
0 6 * * 1-5 cd /path/to/project && node scripts/twitter-scheduler.js >> logs/cron.log 2>&1

# Afternoon (3 PM Moscow = 12 PM UTC)
0 12 * * * cd /path/to/project && node scripts/twitter-scheduler.js >> logs/cron.log 2>&1

# Evening (9 PM Moscow = 6 PM UTC)
0 18 * * * cd /path/to/project && node scripts/twitter-scheduler.js >> logs/cron.log 2>&1
```

### Method 3: macOS launchd (Most Reliable on Mac)

```bash
bash scripts/setup-cron.sh
# Choose option 3
```

Benefits of launchd:
- Survives reboots
- Better error handling
- Separate log files
- Easy to monitor

---

## 📊 Monitoring & Status

### Check Current Status

```bash
node scripts/check-posting-status.js
```

**Shows:**
- ✅ Posts today/week/month
- ✅ Remaining quota
- ✅ Recent activity (last 10 runs)
- ✅ Next scheduled post
- ✅ System health
- ✅ Success rates

### View Logs

```bash
# Cron logs
tail -f logs/cron.log

# Launchd logs (macOS)
tail -f logs/launchd.log
tail -f logs/launchd.error.log

# Scheduler log (JSON data)
cat data/project-coordination/scheduler-log.json | jq
```

### Understanding Status Output

**Progress Bars:**
- 🟢 Green: Safe (< 60% used)
- 🟡 Yellow: Caution (60-80% used)
- 🔴 Red: High (> 80% used)

**Recent Activity Icons:**
- ✅ = Posted successfully
- ⏭️ = Skipped (not in window or limit reached)
- ❌ = Failed (error occurred)

---

## 🎯 Usage Examples

### Test Without Posting

```bash
node scripts/twitter-scheduler.js --dry-run
```

**Output:**
```
✅ IN SCHEDULED WINDOW
🧪 DRY RUN: Would execute auto-poster here
```

### Force Post (Override Schedule)

```bash
node scripts/twitter-scheduler.js --force
```

**Use cases:**
- Manual testing
- Emergency announcements
- Catching up after downtime

**Note:** Still respects safety limits!

### Normal Scheduled Run

```bash
node scripts/twitter-scheduler.js
```

**The scheduler will:**
1. Check current time
2. Verify it's within scheduled window
3. Check safety limits
4. Execute auto-poster if all checks pass
5. Log the result

---

## 📁 File Structure

```
scripts/
├── twitter-scheduler.js       # Main scheduler (smart posting)
├── auto-poster.js              # Tweet posting logic
├── setup-cron.sh               # Automated setup wizard
└── check-posting-status.js     # Status monitoring

data/project-coordination/
├── posting-history.json        # Posted tweets history
└── scheduler-log.json          # Scheduler run logs

logs/
├── cron.log                    # Cron execution logs
├── launchd.log                 # macOS launchd stdout
└── launchd.error.log           # macOS launchd stderr
```

---

## 🔍 Troubleshooting

### Scheduler Not Running

**Check cron status:**
```bash
# macOS/Linux
crontab -l | grep twitter

# macOS launchd
launchctl list | grep hypeai
```

**View recent errors:**
```bash
tail -50 logs/cron.log
```

### Posts Not Going Through

**Common issues:**

1. **Not in scheduled window**
   - Solution: Wait for next window or use `--force`

2. **Safety limits reached**
   ```bash
   node scripts/check-posting-status.js
   # Check quota usage
   ```

3. **API credentials expired**
   ```bash
   # Check .env.marketing file
   cat scripts/.env.marketing
   ```

4. **Consecutive errors**
   - Automatic recovery after 24 hours
   - Or manually reset by running successful post

### Verify Schedule

```bash
# Should show next scheduled time
node scripts/twitter-scheduler.js --dry-run
```

### Reset Error Counter

If stuck due to errors:

```bash
# Edit scheduler-log.json
nano data/project-coordination/scheduler-log.json

# Set consecutiveErrors to 0
"consecutiveErrors": 0
```

---

## 📈 Performance & Limits

### Twitter API Limits (Free Tier)

| Metric | Limit |
|--------|-------|
| Posts per month | 100 |
| Posts per day | No official limit (we use 3) |
| Rate limit window | 15 minutes |

### Our Safety Margins

- **Monthly:** 90 posts (10 buffer)
- **Daily:** 3 posts (conservative)
- **Gap:** 4 hours (prevent flooding)

### Expected Usage

**Normal schedule:**
- Weekdays: 3 posts/day = 15 posts/week
- Weekends: 2 posts/day = 4 posts/week
- **Total:** ~76 posts/month (well under 90 limit)

---

## 🔐 Security

### Environment Variables

All credentials in `scripts/.env.marketing`:

```bash
TWITTER_API_KEY=xxx
TWITTER_API_SECRET=xxx
TWITTER_ACCESS_TOKEN=xxx
TWITTER_ACCESS_TOKEN_SECRET=xxx
```

**Never commit this file to git!**

### Log Safety

Logs contain:
- ✅ Timestamps
- ✅ Success/failure status
- ✅ Error messages
- ❌ NO API credentials
- ❌ NO tweet content (for privacy)

---

## 🎛️ Configuration

### Modify Schedule

Edit `scripts/twitter-scheduler.js`:

```javascript
const CONFIG = {
  SCHEDULE: {
    morning: { hour: 9, minute: 0, days: [1, 2, 3, 4, 5] },
    afternoon: { hour: 15, minute: 0, days: [1, 2, 3, 4, 5, 6, 0] },
    evening: { hour: 21, minute: 0, days: [1, 2, 3, 4, 5, 6, 0] }
  }
};
```

**Days:** 0=Sunday, 1=Monday, ..., 6=Saturday

### Modify Limits

```javascript
const CONFIG = {
  LIMITS: {
    MAX_POSTS_PER_DAY: 3,
    MAX_POSTS_PER_WEEK: 18,
    MAX_POSTS_PER_MONTH: 90,
    MIN_HOURS_BETWEEN_POSTS: 4
  }
};
```

### Time Windows

```javascript
const CONFIG = {
  WINDOW: {
    BEFORE: 5,  // minutes before scheduled time
    AFTER: 15   // minutes after scheduled time
  }
};
```

---

## 📊 Analytics & Reporting

### Success Metrics

Track via `check-posting-status.js`:

- **Success Rate:** % of successful posts
- **Skip Rate:** % of skipped runs (expected)
- **Failure Rate:** % of failed posts (should be low)

### Health Indicators

🟢 **Healthy:**
- Success rate > 80%
- Consecutive errors = 0
- Quota usage < 80%

🟡 **Caution:**
- Success rate 60-80%
- Quota usage 80-90%

🔴 **Issue:**
- Consecutive errors ≥ 2
- Success rate < 60%
- Quota exceeded

---

## 🚀 Best Practices

### Do's ✅

- ✅ Monitor status weekly
- ✅ Check logs for errors
- ✅ Keep quota under 80%
- ✅ Test with `--dry-run` before changes
- ✅ Use `--force` sparingly

### Don'ts ❌

- ❌ Don't modify limits without testing
- ❌ Don't bypass safety checks
- ❌ Don't exceed Twitter API limits
- ❌ Don't run multiple schedulers
- ❌ Don't commit API credentials

---

## 🛠️ Maintenance

### Weekly Tasks

```bash
# Check system health
node scripts/check-posting-status.js

# Review logs for errors
tail -100 logs/cron.log
```

### Monthly Tasks

```bash
# Verify quota usage
node scripts/check-posting-status.js

# Clean old logs (keep last 1000 lines)
tail -1000 logs/cron.log > logs/cron.log.tmp
mv logs/cron.log.tmp logs/cron.log
```

### Backup

Important files to backup:
- `data/project-coordination/posting-history.json`
- `data/project-coordination/scheduler-log.json`
- `scripts/.env.marketing`

---

## 🆘 Support

### Common Commands

```bash
# Check if scheduler is running
ps aux | grep twitter-scheduler

# View crontab
crontab -l

# Test scheduler
node scripts/twitter-scheduler.js --dry-run

# Force a post
node scripts/twitter-scheduler.js --force

# Check status
node scripts/check-posting-status.js

# View logs
tail -f logs/cron.log
```

### Getting Help

1. Check logs first: `tail -100 logs/cron.log`
2. Run status check: `node scripts/check-posting-status.js`
3. Test manually: `node scripts/twitter-scheduler.js --dry-run`
4. Review this documentation

---

## 📝 Changelog

### Version 1.0.0 (October 21, 2025)

**Features:**
- ✅ Smart scheduling with time windows
- ✅ Comprehensive safety limits
- ✅ Automated cron setup
- ✅ Real-time status monitoring
- ✅ Detailed logging and analytics
- ✅ macOS launchd support
- ✅ Error recovery mechanisms

**Safety:**
- ✅ Rate limiting (3/day, 90/month)
- ✅ Minimum gap enforcement (4 hours)
- ✅ Automatic error throttling
- ✅ Quota management

**Monitoring:**
- ✅ Progress bars and quotas
- ✅ Recent activity tracking
- ✅ Health checks
- ✅ Next post predictions

---

## 🎯 Future Enhancements

**Potential improvements:**

1. **Smart Content Selection**
   - ML-based best time to post
   - Engagement prediction
   - A/B testing support

2. **Advanced Analytics**
   - Engagement tracking
   - Best performing times
   - Content performance metrics

3. **Dynamic Scheduling**
   - Adjust times based on engagement
   - Holiday detection
   - Event-based posting

4. **Notifications**
   - Email alerts on failures
   - Slack/Discord integration
   - Weekly reports

---

## ✅ Production Checklist

Before going live:

- [ ] Twitter API credentials configured
- [ ] Auto-poster tested and working
- [ ] Scheduler tested with `--dry-run`
- [ ] Status monitor working
- [ ] Cron/launchd installed
- [ ] Logs directory created
- [ ] First manual test successful
- [ ] Monitoring plan in place
- [ ] Backup strategy ready

---

**System Status:** 🟢 READY FOR PRODUCTION

**Next Steps:**
1. Run `bash scripts/setup-cron.sh`
2. Monitor for first week
3. Adjust schedule if needed
4. Enjoy automated posting! 🚀
