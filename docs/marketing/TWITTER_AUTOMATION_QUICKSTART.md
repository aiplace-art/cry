# ⚡ Twitter Automation - Quick Reference

## 🚀 One-Time Setup

```bash
# 1. Setup automation
bash scripts/setup-cron.sh
# Choose option 1 (auto-install) or 3 (launchd for macOS)

# 2. Verify installation
node scripts/check-posting-status.js
```

**Done! System will now post automatically.**

---

## 📅 Posting Schedule (Moscow Time UTC+3)

| Day | Times |
|-----|-------|
| **Monday-Friday** | 09:00, 15:00, 21:00 |
| **Saturday-Sunday** | 15:00, 21:00 |

**Expected:** 2-3 posts/day, ~76 posts/month

---

## 🛡️ Safety Limits

- ✅ Max 3 posts per day
- ✅ Max 90 posts per month
- ✅ Min 4 hours between posts
- ✅ Auto-stop after 3 consecutive errors

---

## 📊 Essential Commands

### Check Status
```bash
node scripts/check-posting-status.js
```

### View Logs
```bash
tail -f logs/cron.log
```

### Test (no posting)
```bash
node scripts/twitter-scheduler.js --dry-run
```

### Force Post Now
```bash
node scripts/twitter-scheduler.js --force
```

---

## 🔍 Quick Troubleshooting

### No posts going out?

**Check schedule:**
```bash
crontab -l | grep twitter
# or for macOS launchd:
launchctl list | grep hypeai
```

**Check status:**
```bash
node scripts/check-posting-status.js
```

**View errors:**
```bash
tail -50 logs/cron.log
```

### Reset after errors

Edit `/Users/ai.place/Crypto/data/project-coordination/scheduler-log.json`:
```json
"consecutiveErrors": 0
```

---

## 📱 Monitor Weekly

```bash
# Monday morning routine:
node scripts/check-posting-status.js

# What to check:
# ✅ Posts this week < 18
# ✅ Posts this month < 90
# ✅ Consecutive errors = 0
# ✅ Success rate > 80%
```

---

## 🎯 Files to Know

| File | Purpose |
|------|---------|
| `scripts/twitter-scheduler.js` | Main scheduler |
| `scripts/check-posting-status.js` | Status monitor |
| `logs/cron.log` | Execution logs |
| `data/project-coordination/scheduler-log.json` | Run history |

---

## ⚠️ Important Limits

**Twitter Free Tier:**
- 100 posts/month (we use max 90)
- Rate limits apply

**Our Limits:**
- 3 posts/day max
- 18 posts/week max
- 90 posts/month max

**Fail-Safe:**
- Stops after 3 consecutive errors
- Requires 4h gap between posts

---

## 🔧 Common Tasks

### Disable temporarily
```bash
crontab -e
# Comment out lines with #
```

### Re-enable
```bash
crontab -e
# Remove # from lines
```

### Change schedule times
Edit `scripts/twitter-scheduler.js`:
```javascript
SCHEDULE: {
  morning: { hour: 9, minute: 0, days: [1,2,3,4,5] }
  // Change hour/minute as needed
}
```

---

## 📈 Success Indicators

🟢 **Good Health:**
- Success rate > 80%
- 0 consecutive errors
- Quota < 80% used

🟡 **Needs Attention:**
- Success rate 60-80%
- Quota 80-90% used

🔴 **Issues:**
- Consecutive errors ≥ 2
- Success rate < 60%

---

## 🆘 Emergency Commands

```bash
# Stop all automation
crontab -r

# Or for launchd:
launchctl unload ~/Library/LaunchAgents/com.hypeai.twitter.scheduler.plist

# View what's scheduled
crontab -l

# Check if running
ps aux | grep twitter-scheduler
```

---

## ✅ Daily Checklist (Optional)

**Morning (optional):**
- [ ] Check if morning post went out
- [ ] Review overnight logs

**Weekly (recommended):**
- [ ] Run status check
- [ ] Verify quota usage
- [ ] Check for errors

**Monthly (required):**
- [ ] Review full month stats
- [ ] Plan next month's content
- [ ] Verify API credentials valid

---

## 🎓 Help Resources

**Full docs:** `docs/marketing/AUTOMATED_TWITTER_POSTING.md`

**Setup wizard:** `bash scripts/setup-cron.sh`

**Test first:** Always use `--dry-run` when testing changes

---

**Last Updated:** October 21, 2025
**Status:** ✅ Production Ready
