# 🚀 Threads Quick Start Guide

**Get started with Threads automation in 2 minutes!**

## ⚡ Fastest Path to First Post

```bash
# 1. Test the system
node scripts/threads/threads-api-client.js

# 2. Create your first post
node scripts/threads/threads-auto-poster.js post "🚀 HYPEAI is now on Threads! Follow for AI & crypto insights. #AI #Crypto #Web3"

# 3. Follow the instructions
cat scripts/manual-workflows/threads-post-*.json

# 4. Post to Threads app
# Open Threads → New Thread → Paste content → Post

# Done! 🎉
```

## 📋 Essential Commands

### Posting
```bash
# Single post (manual mode)
node scripts/threads/threads-auto-poster.js post "Your content here"

# Schedule post
node scripts/threads/threads-auto-poster.js schedule "Content" "2025-10-26T10:00:00Z"

# Process scheduled posts
node scripts/threads/threads-auto-poster.js process

# View stats
node scripts/threads/threads-auto-poster.js stats
```

### Multi-Platform
```bash
# Post to Twitter + Threads
node scripts/multi-platform/multi-platform-poster.js post "Your content"

# View multi-platform stats
node scripts/multi-platform/multi-platform-poster.js stats
```

### Analytics
```bash
# Update analytics
node scripts/threads/threads-analytics.js update

# View report
node scripts/threads/threads-analytics.js report

# Collect metrics (API mode only)
node scripts/threads/threads-analytics.js collect
```

### Scheduling
```bash
# Schedule with optimal timing
node scripts/threads/threads-scheduler.js schedule "Your content"

# View schedule
node scripts/threads/threads-scheduler.js list

# Analyze best times
node scripts/threads/threads-scheduler.js analyze
```

## 🎯 Common Workflows

### Daily Posting Routine
```bash
# Morning: Check scheduled posts
node scripts/threads/threads-scheduler.js list

# Create and schedule posts
node scripts/threads/threads-auto-poster.js schedule "Post 1" "2025-10-26T12:30:00Z"
node scripts/threads/threads-auto-poster.js schedule "Post 2" "2025-10-26T17:00:00Z"

# Evening: Process scheduled + check stats
node scripts/threads/threads-auto-poster.js process
node scripts/threads/threads-analytics.js report
```

### Content Calendar Setup
```bash
# Schedule a week of posts
for day in {1..7}; do
  node scripts/threads/threads-scheduler.js schedule \
    "Day $day content here" \
    --contentType educational
done

# View full schedule
node scripts/threads/threads-scheduler.js list
```

### Multi-Platform Campaign
```bash
# Post to all platforms
node scripts/multi-platform/multi-platform-poster.js post "🚀 Big announcement! HYPEAI launches new features..."

# Monitor cross-posting
node scripts/cross-post-monitor.js

# Check unified stats
node scripts/multi-platform/multi-platform-poster.js stats
```

## 🔧 Configuration Quick Reference

### Switch Modes

**Manual Mode (Default - No API):**
```bash
# In scripts/.env.marketing
THREADS_MODE=manual
```

**API Mode (Full Automation):**
```bash
# In scripts/.env.marketing
THREADS_MODE=api
THREADS_ACCESS_TOKEN=your_token
THREADS_USER_ID=your_id
```

**Browser Mode (Semi-Auto):**
```bash
# Install Playwright first
npm install playwright

# In scripts/.env.marketing
THREADS_MODE=browser
```

### Key Settings
```bash
# Cross-posting
CROSSPOST_MIN_ENGAGEMENT=5
CROSSPOST_DELAY_MINUTES=30

# Multi-platform
MULTIPLATFORM_PLATFORMS=twitter,threads
MULTIPLATFORM_STAGGER_MINUTES=2

# Scheduling
SCHEDULE_TIMEZONE=America/New_York
```

## 📅 Setup Automation

### Quick Cron Setup
```bash
# 1. Make script executable
chmod +x scripts/cron-threads.sh

# 2. Edit crontab
crontab -e

# 3. Add this line:
*/15 * * * * /Users/ai.place/Crypto/scripts/cron-threads.sh
```

### What Gets Automated
- ✅ Process scheduled posts (every 15 min)
- ✅ Cross-post from Twitter (every 30 min)
- ✅ Collect analytics (twice daily)
- ✅ Generate reports (daily at midnight)

## 🎨 Content Tips

### Optimal Post Structure
```
🚀 Hook (attention grabber)

Main message (2-3 sentences)

Call to action

#Hashtag1 #Hashtag2 #Hashtag3
```

### Best Times to Post (EST)
- **Morning:** 7:00 AM
- **Lunch:** 12:30 PM
- **After Work:** 5:00 PM
- **Evening:** 8:00 PM

### Content Types
- **Educational:** Morning (7-9 AM)
- **News:** Early morning (6-8 AM)
- **Engagement:** Evening (7-9 PM)
- **Promotional:** Afternoon (2-4 PM)

## 📊 Quick Analytics

### View Performance
```bash
# Full report
node scripts/threads/threads-analytics.js report

# JSON format
node scripts/threads/threads-analytics.js report json
```

### Key Metrics
- **Views:** How many saw your post
- **Likes:** Direct engagement
- **Replies:** Conversation starts
- **Reposts:** Content sharing
- **Engagement Rate:** (Likes+Replies+Reposts)/Views

## 🐛 Quick Troubleshooting

### "API credentials not found"
→ You're in manual mode. This is normal! Just follow the workflow instructions.

### "Rate limit exceeded"
→ Wait 1 hour. Limits: 25 posts/hour, 250 posts/day

### "Content too long"
→ System auto-truncates to 500 chars. Check the adapted content.

### "Duplicate content detected"
→ Similar post in last 24h. Edit content or wait.

## 📚 Full Documentation

- **Complete Guide:** `docs/threads/THREADS_INTEGRATION_GUIDE.md`
- **API Setup:** `docs/threads/THREADS_API_SETUP.md`
- **Manual Workflow:** `docs/threads/THREADS_MANUAL_WORKFLOW.md`
- **Deployment:** `docs/threads/DEPLOYMENT_SUMMARY.md`

## 🎯 Next Steps

1. **Start posting** with manual mode (no API needed)
2. **Enable scheduling** for consistent posting
3. **Setup cron** for automation
4. **Apply for API** for full automation (optional)
5. **Monitor analytics** and optimize

## ⚡ One-Line Commands

```bash
# Post now
node scripts/threads/threads-auto-poster.js post "Your content"

# Schedule optimal time
node scripts/threads/threads-scheduler.js schedule "Content"

# Multi-platform post
node scripts/multi-platform/multi-platform-poster.js post "Content"

# Check stats
node scripts/threads/threads-analytics.js report

# Process scheduled
node scripts/threads/threads-auto-poster.js process
```

---

**You're ready to automate Threads! 🚀**

Need help? Check the full documentation in `docs/threads/`
