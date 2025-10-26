# Threads Integration Guide

Complete guide for the HYPEAI Threads automation system with multi-platform support.

## 🎯 Overview

The Threads automation system provides:
- **Full API Client** - Production-ready Threads API integration
- **Fallback Modes** - Manual workflow and browser automation
- **Multi-Platform** - Unified posting to Twitter, Threads, and Instagram
- **Smart Scheduling** - AI-powered optimal timing
- **Analytics** - Comprehensive engagement tracking
- **Cross-Posting** - Automatic Twitter → Threads synchronization

## 📁 File Structure

```
scripts/
├── threads/
│   ├── threads-api-client.js       # Core API client with 3 modes
│   ├── threads-content-adapter.js  # Content optimization for 500 char limit
│   ├── threads-auto-poster.js      # Automated posting system
│   ├── threads-scheduler.js        # Intelligent scheduling
│   └── threads-analytics.js        # Analytics and reporting
├── multi-platform/
│   └── multi-platform-poster.js    # Unified Twitter+Threads+Instagram
├── cross-post-monitor.js           # Twitter → Threads automation
├── cron-threads.sh                 # Cron automation script
└── .env.marketing                  # Configuration

data/project-coordination/
├── posting-history.json            # Unified posting history
├── threads-analytics.json          # Analytics data
└── crosspost-state.json            # Cross-posting state

docs/threads/
├── THREADS_INTEGRATION_GUIDE.md    # This file
├── THREADS_API_SETUP.md            # API configuration guide
└── THREADS_MANUAL_WORKFLOW.md      # Manual posting instructions
```

## 🚀 Quick Start

### 1. Choose Your Mode

**Option A: API Mode** (Recommended, requires Threads API access)
```bash
# Configure API credentials
THREADS_MODE=api
THREADS_ACCESS_TOKEN=your_token
THREADS_USER_ID=your_user_id
```

**Option B: Manual Mode** (No API required)
```bash
# Enable manual workflow
THREADS_MODE=manual
```

**Option C: Browser Automation** (Experimental)
```bash
# Install Playwright and enable browser mode
npm install playwright
THREADS_MODE=browser
```

### 2. Test the Client

```bash
# Test API connection
node scripts/threads/threads-api-client.js

# Test a post
node scripts/threads/threads-api-client.js test-post
```

### 3. Post to Threads

```bash
# Single post
node scripts/threads/threads-auto-poster.js post "🚀 HYPEAI is live on Threads! #AI #Crypto"

# Schedule a post
node scripts/threads/threads-auto-poster.js schedule "Content here" "2025-10-26T10:00:00Z"

# Process scheduled posts
node scripts/threads/threads-auto-poster.js process
```

### 4. Multi-Platform Posting

```bash
# Post to Twitter + Threads simultaneously
node scripts/multi-platform/multi-platform-poster.js post "Your content"

# View statistics
node scripts/multi-platform/multi-platform-poster.js stats
```

## 🔧 Configuration

### Environment Variables (.env.marketing)

```bash
# Threads Configuration
THREADS_MODE=api                    # api, manual, or browser
THREADS_ACCESS_TOKEN=your_token     # Meta access token
THREADS_USER_ID=your_user_id        # Threads user ID

# Cross-Posting Settings
CROSSPOST_MIN_ENGAGEMENT=5          # Min likes+retweets before crosspost
CROSSPOST_DELAY_MINUTES=30          # Wait time before crosspost

# Multi-Platform Settings
MULTIPLATFORM_STAGGER_MINUTES=2     # Delay between platforms
MULTIPLATFORM_PLATFORMS=twitter,threads  # Enabled platforms

# Twitter (existing)
TWITTER_API_KEY=your_key
TWITTER_API_SECRET=your_secret
TWITTER_ACCESS_TOKEN=your_token
TWITTER_ACCESS_SECRET=your_secret
```

## 📊 Three Operating Modes

### Mode 1: API Mode (Production)

**Best for:** Automated, scalable operations

**Setup:**
1. Apply for Threads API beta access: https://developers.facebook.com/docs/threads
2. Create a Meta app and get credentials
3. Configure environment variables
4. Test connection

**Features:**
- ✅ Full automation
- ✅ Real-time posting
- ✅ Analytics collection
- ✅ Scheduling support
- ✅ Rate limit handling

**Usage:**
```javascript
const ThreadsAPIClient = require('./scripts/threads/threads-api-client');
const client = new ThreadsAPIClient({ mode: 'api' });

await client.initialize();
await client.createPost('Your content here');
```

### Mode 2: Manual Mode (No API Required)

**Best for:** Getting started without API access

**Setup:**
1. Set `THREADS_MODE=manual`
2. Run the script to generate instructions

**Features:**
- ✅ No API credentials needed
- ✅ Content optimization
- ✅ Posting instructions
- ✅ Schedule management
- ⚠️ Manual posting required

**Workflow:**
1. Script generates posting instructions
2. Open Threads app
3. Copy content and post
4. Update posting history

**Usage:**
```bash
node scripts/threads/threads-auto-poster.js post "Your content"
# Creates manual-workflows/threads-post-*.json with instructions
```

### Mode 3: Browser Automation (Experimental)

**Best for:** Semi-automated posting without API

**Setup:**
1. Install Playwright: `npm install playwright`
2. Set `THREADS_MODE=browser`

**Features:**
- ✅ Automated browser interaction
- ✅ No API needed
- ⚠️ Requires browser session
- ⚠️ Less reliable than API

**Usage:**
```bash
node scripts/threads/threads-auto-poster.js post "Your content"
# Opens browser, you may need to login manually first time
```

## 🎯 Content Optimization

### Threads Character Limit: 500

The content adapter automatically optimizes for Threads:

```javascript
const ThreadsContentAdapter = require('./scripts/threads/threads-content-adapter');
const adapter = new ThreadsContentAdapter();

// From Twitter content
const threadsContent = adapter.adaptFromTwitter(twitterContent);

// Native Threads content
const content = adapter.createNativeContent({
  hook: '🚀 Big announcement!',
  topic: 'HYPEAI launches Threads automation',
  callToAction: 'Follow us for updates!',
  hashtags: ['AI', 'Crypto', 'Web3']
});
```

**Optimization Features:**
- ✅ Character limit enforcement (500 chars)
- ✅ Hashtag optimization (max 3 recommended)
- ✅ Emoji placement
- ✅ Line break formatting
- ✅ Content validation

## 📅 Smart Scheduling

The scheduler uses AI to find optimal posting times:

```javascript
const ThreadsScheduler = require('./scripts/threads/threads-scheduler');
const scheduler = new ThreadsScheduler();

// Schedule with optimal timing
const scheduled = await scheduler.schedulePost(content, {
  contentType: 'educational',  // educational, news, engagement, promotional
  priority: 'high',            // high, normal, low
  earliestTime: new Date()
});

// Bulk scheduling
const posts = [
  { content: 'Post 1', contentType: 'news', priority: 'high' },
  { content: 'Post 2', contentType: 'engagement', priority: 'normal' }
];
await scheduler.bulkSchedule(posts);

// Analyze best times
const analysis = await scheduler.analyzePerformance();
```

**Optimal Times (EST):**
- **Weekdays:** 7am, 12:30pm, 5pm, 8pm
- **Weekends:** 9am, 2pm, 7pm

**Content Type Timing:**
- **Educational:** Best in morning (9x engagement)
- **News:** Best early morning (95% engagement)
- **Engagement:** Best evening (95% engagement)
- **Promotional:** Best afternoon (90% engagement)

## 📈 Analytics

Track and analyze Threads performance:

```bash
# Collect metrics (API mode only)
node scripts/threads/threads-analytics.js collect

# Update analytics
node scripts/threads/threads-analytics.js update

# Generate report
node scripts/threads/threads-analytics.js report

# JSON format
node scripts/threads/threads-analytics.js report json
```

**Metrics Tracked:**
- Views
- Likes
- Replies
- Reposts
- Quotes
- Engagement rate
- Best performing content
- Optimal posting times

## 🔄 Cross-Platform Integration

### Unified Multi-Platform Posting

```javascript
const MultiPlatformPoster = require('./scripts/multi-platform/multi-platform-poster');
const poster = new MultiPlatformPoster({
  platforms: ['twitter', 'threads', 'instagram'],
  staggerPosts: 2  // Minutes between platforms
});

await poster.initialize();

// Post to all platforms
const results = await poster.postToAll('Your content', {
  mediaUrl: 'https://example.com/image.png'
});

// Schedule multi-platform
await poster.scheduleMultiPlatform(content, scheduledTime);

// Get statistics
const stats = await poster.getUnifiedStats();
```

### Automatic Twitter → Threads Cross-Posting

```bash
# Monitor and cross-post
node scripts/cross-post-monitor.js
```

**Configuration:**
- `CROSSPOST_MIN_ENGAGEMENT`: Minimum engagement before crosspost
- `CROSSPOST_DELAY_MINUTES`: Wait time to check engagement

## ⚙️ Automation Setup

### Cron Jobs

```bash
# Make cron script executable
chmod +x scripts/cron-threads.sh

# Edit crontab
crontab -e

# Add these lines:

# Process scheduled posts every 15 minutes
*/15 * * * * /path/to/scripts/cron-threads.sh

# Cross-post monitor every 30 minutes
*/30 * * * * cd /path/to/Crypto && node scripts/cross-post-monitor.js

# Analytics collection twice daily (noon and midnight)
0 0,12 * * * cd /path/to/Crypto && node scripts/threads/threads-analytics.js collect
```

### Manual Automation (No Cron)

```bash
# Run in loop (for testing)
while true; do
  node scripts/threads/threads-auto-poster.js process
  sleep 900  # 15 minutes
done
```

## 🧪 Testing

### Test Individual Components

```bash
# Test API client
node scripts/threads/threads-api-client.js

# Test content adapter
node scripts/threads/threads-content-adapter.js

# Test scheduler
node scripts/threads/threads-scheduler.js schedule "Test content"

# Test analytics
node scripts/threads/threads-analytics.js update
```

### Test Multi-Platform

```bash
# Initialize
node scripts/multi-platform/multi-platform-poster.js stats

# Test post (dry run)
node scripts/multi-platform/multi-platform-poster.js post "Test post 🚀"
```

## 🐛 Troubleshooting

### API Mode Issues

**Problem:** Authentication failed
```bash
# Verify credentials
echo $THREADS_ACCESS_TOKEN
echo $THREADS_USER_ID

# Test connection
node scripts/threads/threads-api-client.js
```

**Problem:** Rate limit exceeded
```bash
# Check analytics
node scripts/threads/threads-analytics.js report

# Rate limits:
# - 25 posts/hour
# - 250 posts/day
# - 500 requests/hour
```

### Manual Mode Issues

**Problem:** Posts not appearing
1. Check `scripts/manual-workflows/` for instructions
2. Verify content in JSON files
3. Follow manual posting steps
4. Update `posting-history.json` after posting

### Browser Mode Issues

**Problem:** Browser automation fails
```bash
# Reinstall Playwright
npm install playwright
npx playwright install

# Test browser launch
node -e "const {chromium} = require('playwright'); chromium.launch().then(b => b.close());"
```

## 📚 API Reference

### ThreadsAPIClient

```javascript
const client = new ThreadsAPIClient({
  mode: 'api',
  accessToken: 'your_token',
  userId: 'your_id'
});

await client.initialize();
const result = await client.createPost(content, {
  mediaUrl: 'https://...',
  replyTo: 'post_id'
});
```

### ThreadsAutoPoster

```javascript
const poster = new ThreadsAutoPoster({
  autoPost: true,
  syncWithTwitter: true,
  scheduleEnabled: true
});

await poster.initialize();
await poster.post(content);
await poster.schedulePost(content, scheduledTime);
await poster.processScheduledPosts();
```

### ThreadsScheduler

```javascript
const scheduler = new ThreadsScheduler({
  timezone: 'America/New_York',
  targetAudience: 'crypto_enthusiasts'
});

await scheduler.schedulePost(content, {
  contentType: 'news',
  priority: 'high'
});
```

## 🎓 Best Practices

### Content Strategy
1. **Keep it conversational** - Threads favors authentic, engaging content
2. **Use 2-4 emojis** - Visual appeal without overdoing it
3. **Max 3 hashtags** - More focused = better reach
4. **Post at optimal times** - Use scheduler analysis
5. **Engage with replies** - Algorithm rewards interaction

### Posting Frequency
- **Minimum:** 1-2 posts/day
- **Optimal:** 3-4 posts/day
- **Maximum:** 8-10 posts/day (stay below rate limits)

### Cross-Platform Strategy
1. Post natively to Twitter
2. Wait 30-60 minutes
3. Automatically cross-post to Threads
4. Adapt content for Instagram (manual)

## 🔐 Security

- ✅ All credentials in `.env.marketing` (gitignored)
- ✅ No secrets in code
- ✅ Rate limiting protection
- ✅ Error logging (no sensitive data)
- ✅ Secure token refresh (when available)

## 📞 Support

### Threads API Beta Access
- Apply: https://developers.facebook.com/docs/threads
- Docs: https://developers.facebook.com/docs/threads/get-started
- Status: Check your Meta Developer dashboard

### Common Issues
- **No API access?** Use manual mode
- **Rate limits?** Enable scheduling
- **Content too long?** Auto-adapter handles it
- **Poor engagement?** Use scheduler's optimal times

## 🚀 Next Steps

1. **Set up your preferred mode** (API, manual, or browser)
2. **Configure cross-posting** from Twitter
3. **Enable automated scheduling**
4. **Set up cron jobs** for automation
5. **Monitor analytics** and optimize timing

---

**Ready to launch Threads automation for HYPEAI! 🎉**
