# Threads Manual Workflow Guide

Complete instructions for using Threads automation without API access.

## 🎯 Overview

The **Manual Mode** allows you to use the Threads automation system without Meta API access:
- ✅ Content optimization and scheduling
- ✅ Multi-platform coordination
- ✅ Analytics tracking
- ⚠️ Requires manual posting via Threads app

## ⚙️ Setup

### 1. Configure Environment

Add to `.env.marketing`:

```bash
# Enable manual mode
THREADS_MODE=manual

# Optional: Still configure Twitter for cross-posting
TWITTER_API_KEY=your_key
TWITTER_API_SECRET=your_secret
TWITTER_ACCESS_TOKEN=your_token
TWITTER_ACCESS_SECRET=your_secret
```

### 2. Create Directories

```bash
mkdir -p scripts/manual-workflows
mkdir -p data/project-coordination
```

### 3. Initialize System

```bash
# Test manual mode
node scripts/threads/threads-api-client.js

# Expected output:
# 📋 Manual Mode: Generating posting instructions
# ✅ Manual workflow initialized
```

## 📝 How It Works

### Content Generation Flow

```
User Request → Auto-Poster → Content Adapter → Manual Workflow File
                                                       ↓
                                         Instructions + Optimized Content
                                                       ↓
                                              Manual Posting (You)
                                                       ↓
                                              Update History
```

### What The System Does

1. **Optimizes content** for Threads (500 char limit, hashtags)
2. **Generates instructions** for manual posting
3. **Creates workflow file** with everything you need
4. **Tracks schedule** and reminds you when to post
5. **Provides analytics** (with manual data entry)

### What You Do

1. **Review workflow file** with instructions
2. **Open Threads app** when it's time to post
3. **Copy and paste content** from workflow file
4. **Add media** if provided
5. **Post to Threads**
6. **Update history** with post URL

## 🚀 Usage

### Single Post

```bash
# Generate manual workflow
node scripts/threads/threads-auto-poster.js post "🚀 HYPEAI launches AI-powered crypto trading! Revolutionary technology meets decentralized finance. Join the future! #AI #Crypto #DeFi"
```

**Output:**
```
📤 Posting to Threads
📋 Manual workflow saved: threads-post-1729872000000.json
✅ Posted successfully!
```

**Workflow File** (`scripts/manual-workflows/threads-post-1729872000000.json`):

```json
{
  "content": "🚀 HYPEAI launches AI-powered crypto trading!\n\nRevolutionary technology meets decentralized finance. Join the future!\n\n#AI #Crypto #DeFi",
  "instructions": [
    "1. Open Threads mobile app or threads.net",
    "2. Click 'New Thread' button",
    "3. Copy and paste the content below",
    "4. Add image if provided",
    "5. Click 'Post'",
    "6. Update posting-history.json with post URL"
  ],
  "contentToCopy": "🚀 HYPEAI launches AI-powered crypto trading!\n\nRevolutionary technology meets decentralized finance. Join the future!\n\n#AI #Crypto #DeFi",
  "imageUrl": null,
  "scheduledFor": "Now",
  "platform": "Threads",
  "status": "pending_manual_post",
  "createdAt": "2025-10-25T16:00:00.000Z"
}
```

### Follow the Instructions

1. **Open workflow file** in your text editor
2. **Copy `contentToCopy` field** to clipboard
3. **Open Threads app** on mobile or threads.net
4. **Click "New Thread"** button (+ icon)
5. **Paste content** into thread composer
6. **Review and adjust** if needed
7. **Click "Post"** button
8. **Copy post URL** from browser/app
9. **Update history** (see below)

### Update Posting History

After posting, update the history file:

**File:** `data/project-coordination/posting-history.json`

```json
{
  "threads": [
    {
      "platform": "Threads",
      "content": "🚀 HYPEAI launches AI-powered crypto trading!...",
      "result": {
        "success": true,
        "mode": "manual",
        "postUrl": "https://www.threads.net/@hypeai_official/post/ABC123",
        "postId": "ABC123"
      },
      "timestamp": "2025-10-25T16:05:00.000Z",
      "mode": "manual"
    }
  ],
  "lastUpdated": "2025-10-25T16:05:00.000Z"
}
```

## 📅 Scheduled Posts

### Schedule a Post

```bash
# Schedule for specific time
node scripts/threads/threads-auto-poster.js schedule "Your content here" "2025-10-26T10:00:00Z"
```

**Output:**
```
📅 Scheduling post for Fri Oct 26 2025 10:00:00 GMT+0000
✅ Post scheduled (ID: scheduled_1729936800000)
```

### Check Schedule

```bash
# View all scheduled posts
node scripts/threads/threads-scheduler.js list
```

**Output:**
```json
[
  {
    "id": "scheduled_1729936800000",
    "content": "Your content here",
    "scheduledTime": "2025-10-26T10:00:00.000Z",
    "status": "scheduled",
    "contentType": "general",
    "priority": "normal"
  }
]
```

### Get Posting Reminders

Create a daily reminder script:

**File:** `scripts/check-manual-posts.sh`

```bash
#!/bin/bash

echo "📋 Checking for posts due today..."

node scripts/threads/threads-scheduler.js list | jq '.[] | select(.status == "scheduled") | select(.scheduledTime < now + 86400) | {time: .scheduledTime, content: .content[:50]}'

echo "\n📁 Workflow files ready:"
ls -lt scripts/manual-workflows/threads-post-*.json | head -5
```

Run daily:
```bash
chmod +x scripts/check-manual-posts.sh
./scripts/check-manual-posts.sh
```

## 🎨 Content Optimization

### Automatic Optimization

The system automatically:
- ✅ Limits to 500 characters
- ✅ Optimizes hashtags (max 3)
- ✅ Adds line breaks for readability
- ✅ Suggests emojis
- ✅ Formats for Threads style

### Manual Tweaking

Edit workflow files before posting:

```json
{
  "contentToCopy": "🚀 HYPEAI launches AI trading!\n\nEdit this text as needed before posting.\n\n#AI #Crypto"
}
```

### Content Templates

Create templates for common post types:

**File:** `scripts/threads/templates/announcement.json`

```json
{
  "template": "🚀 {hook}\n\n{details}\n\n{cta}\n\n#{tag1} #{tag2} #{tag3}",
  "example": {
    "hook": "Big news!",
    "details": "We're launching something amazing.",
    "cta": "Follow for updates!",
    "tag1": "AI",
    "tag2": "Crypto",
    "tag3": "Innovation"
  }
}
```

## 📊 Manual Analytics

### Record Metrics

After posting, record engagement in history file:

```json
{
  "threads": [
    {
      "content": "Your post content...",
      "result": {
        "postUrl": "https://threads.net/@user/post/123"
      },
      "timestamp": "2025-10-25T16:00:00.000Z",
      "insights": {
        "views": 1250,
        "likes": 45,
        "replies": 8,
        "reposts": 3,
        "quotes": 1,
        "recordedAt": "2025-10-26T16:00:00.000Z"
      }
    }
  ]
}
```

### How to Get Metrics

1. **Open Threads app**
2. **Go to your profile**
3. **Find the post**
4. **Note the metrics:**
   - Views (eye icon)
   - Likes (heart icon)
   - Replies (comment count)
   - Reposts (arrow icon)
   - Quotes (quote count)

### Update Analytics

```bash
# After adding metrics to history
node scripts/threads/threads-analytics.js update

# Generate report
node scripts/threads/threads-analytics.js report
```

**Sample Report:**

```
📊 THREADS ANALYTICS REPORT
══════════════════════════════════════════════════

📈 OVERVIEW
Total Posts: 15
Posts with Metrics: 12

Average Engagement:
  Views: 1,234
  Likes: 56
  Replies: 8
  Reposts: 4
  Engagement Rate: 5.5%

📊 7-DAY TRENDS
  📈 views: +12.5%
  📈 likes: +8.3%
  ➡️ replies: +0.2%
  📉 reposts: -2.1%

🏆 TOP 3 POSTS
  1. Score: 15,234 - 🚀 HYPEAI launches AI-powered...
  2. Score: 12,456 - 💡 Learn how AI revolutionizes...
  3. Score: 10,987 - 🔥 Hot take: The future of...

Last Updated: 2025-10-25T20:00:00.000Z
```

## 🔄 Multi-Platform Workflow

### Twitter → Threads Cross-Posting

1. **Post to Twitter** (automated via existing system)
2. **System generates Threads workflow** (30min later)
3. **Review workflow file** for Threads
4. **Manually post to Threads**
5. **Update history**

**Automated monitoring:**

```bash
# Check for Twitter posts to cross-post
node scripts/cross-post-monitor.js
```

This creates workflow files for high-performing Twitter posts.

### Multi-Platform Manual Posting

```bash
# Generate workflows for all platforms
node scripts/multi-platform/multi-platform-poster.js post "Your content"
```

Creates:
- `manual-workflows/twitter-post-*.json` (if not using API)
- `manual-workflows/threads-post-*.json`
- `manual-workflows/instagram-post-*.json`

## 📱 Mobile Workflow

### On-the-Go Posting

1. **Check workflow files** on your phone:
   ```
   - Open Files app (iOS) or Files (Android)
   - Navigate to: Crypto/scripts/manual-workflows/
   - Open latest JSON file
   ```

2. **Use Shortcuts app** (iOS) to automate:
   - Read JSON file
   - Extract `contentToCopy`
   - Copy to clipboard
   - Open Threads app

3. **Paste and post** from clipboard

### Quick Command (iOS Shortcuts)

Create a shortcut:
1. Get file: `scripts/manual-workflows/threads-post-*.json`
2. Get dictionary value: `contentToCopy`
3. Copy to clipboard
4. Open Threads app
5. Show notification: "Content copied! Paste and post."

## 🧹 Maintenance

### Daily Tasks

```bash
# Morning: Check scheduled posts
./scripts/check-manual-posts.sh

# After posting: Update history
nano data/project-coordination/posting-history.json

# Evening: Generate report
node scripts/threads/threads-analytics.js report
```

### Weekly Tasks

```bash
# Review analytics
node scripts/threads/threads-analytics.js report

# Cleanup old workflows
find scripts/manual-workflows -name "*.json" -mtime +7 -delete

# Backup history
cp data/project-coordination/posting-history.json \
   data/project-coordination/posting-history-backup-$(date +%Y%m%d).json
```

### Monthly Tasks

```bash
# Full analytics review
node scripts/threads/threads-scheduler.js analyze

# Archive old posts
# (move posts older than 30 days to archive)
```

## 🎓 Tips & Best Practices

### Content Creation
1. **Use workflow files as drafts** - edit before posting
2. **Schedule during optimal times** - system suggests best times
3. **Batch create content** - generate 5-10 posts at once
4. **Review and adjust** - don't just copy-paste blindly

### Posting Strategy
1. **Post during high-engagement times:**
   - Weekdays: 7am, 12:30pm, 5pm, 8pm EST
   - Weekends: 9am, 2pm, 7pm EST

2. **Vary content types:**
   - Educational (morning)
   - News (early morning)
   - Engagement (evening)
   - Promotional (afternoon)

3. **Track what works:**
   - Note high-performing content
   - Replicate successful patterns
   - Adjust based on analytics

### Efficiency
1. **Batch workflow generation:**
   ```bash
   # Generate 7 days of workflows at once
   for i in {0..6}; do
     node scripts/threads/threads-scheduler.js schedule \
       "Post content for day $i" \
       --contentType educational
   done
   ```

2. **Set up reminders:**
   - Calendar events for scheduled posts
   - Push notifications when posts are due
   - Daily email digest of pending workflows

3. **Use mobile workflow** for quick posting

## ⚠️ Limitations

### What Manual Mode CAN'T Do
- ❌ Automatically post to Threads
- ❌ Collect analytics via API
- ❌ Verify post was published
- ❌ Handle errors automatically

### What Manual Mode CAN Do
- ✅ Optimize content
- ✅ Schedule and remind
- ✅ Track analytics (with manual entry)
- ✅ Generate posting instructions
- ✅ Integrate with Twitter
- ✅ Multi-platform coordination

## 🔄 Transitioning to API Mode

When you get API access:

1. **Update environment:**
   ```bash
   THREADS_MODE=api
   THREADS_ACCESS_TOKEN=your_token
   THREADS_USER_ID=your_id
   ```

2. **Migrate scheduled posts:**
   ```bash
   # Posts will automatically use API mode
   node scripts/threads/threads-auto-poster.js process
   ```

3. **Enable automation:**
   ```bash
   # Set up cron jobs
   crontab -e
   # Add: */15 * * * * /path/to/scripts/cron-threads.sh
   ```

4. **Keep manual workflows as backup**

---

**Manual mode is perfect for getting started or as a reliable backup! 🎉**
