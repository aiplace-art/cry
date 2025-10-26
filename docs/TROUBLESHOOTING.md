# 🔧 Troubleshooting Guide - Social Media Automation

## Quick Diagnosis

### Twitter Issues

#### Error: "Command failed: node ./scripts/auto-poster.js"
**Cause**: Multiple possible causes
**Diagnosis**:
```bash
# Test directly
node scripts/auto-poster.js

# Check credentials
grep "TWITTER_API_KEY" scripts/.env.marketing

# Check content bank
ls -la scripts/twitter-content/tweets-bank.json

# Check logs
cat data/project-coordination/scheduler-log.json | jq '.stats'
```

**Solutions**:
1. Verify Twitter credentials in `.env.marketing`
2. Check `tweets-bank.json` exists and is valid JSON
3. Review `scheduler-log.json` for specific errors
4. Check rate limits (max 3/day)

---

#### Error: "Rate limit hit"
**Cause**: Too many posts in short time
**Solution**:
```bash
# Check current limits
node scripts/twitter-scheduler.js 2>&1 | grep "Posts"

# Wait for next window or use --force carefully
node scripts/twitter-scheduler.js --force  # Only if within daily limit
```

**Rate Limits**:
- Max 3 posts/day
- Max 18 posts/week
- Max 90 posts/month
- Min 4 hours between posts

---

#### Error: "Not in scheduled window"
**Cause**: Running outside scheduled times
**Schedule**:
- Morning: 9:00 Moscow Time (Mon-Fri)
- Afternoon: 15:00 Moscow Time (Daily)
- Evening: 21:00 Moscow Time (Daily)

**Solution**:
```bash
# Check next scheduled time
node scripts/twitter-scheduler.js | grep "Next scheduled"

# Force post if needed
node scripts/twitter-scheduler.js --force
```

---

### Instagram Issues

#### Error: "Instagram credentials missing"
**Cause**: Credentials not set in `.env.marketing`
**Solution**:
```bash
# Edit .env.marketing
nano scripts/.env.marketing

# Add these values:
INSTAGRAM_BUSINESS_ACCOUNT_ID=your_account_id
INSTAGRAM_ACCESS_TOKEN=your_access_token
FACEBOOK_PAGE_ID=your_page_id
```

**Get Credentials**:
1. Go to https://developers.facebook.com/
2. Create app with Instagram API access
3. Get Instagram Business Account ID
4. Generate long-lived access token
5. Add Facebook Page ID

---

#### Error: "Access token expired"
**Cause**: Instagram tokens expire every 60 days
**Solution**:
```bash
# Refresh token using Meta Graph API
curl -i -X GET "https://graph.facebook.com/v18.0/oauth/access_token?grant_type=fb_exchange_token&client_id=YOUR_APP_ID&client_secret=YOUR_APP_SECRET&fb_exchange_token=YOUR_OLD_TOKEN"

# Update .env.marketing with new token
```

---

#### Error: "Invalid image URL"
**Cause**: Image not publicly accessible
**Solution**:
Instagram requires publicly accessible image URLs. Options:
1. Use CDN (Cloudinary, AWS S3, etc.)
2. Use temporary hosting
3. Update `CONFIG.IMAGE.TEMP_URL_BASE` in script

---

### Threads Issues

#### Error: "require is not defined"
**Cause**: Old bug - already fixed!
**Verification**:
```bash
# Should work now
cd scripts/threads && node threads-auto-poster.js stats
```

If error persists:
```bash
# Verify ES module conversion
grep "import.*from" scripts/threads/threads-auto-poster.js
# Should show ES imports, not require()
```

---

#### Threads Manual Mode
**Not an error** - Threads works in manual mode by default

**Features**:
- Generates posting instructions
- Creates workflow JSON files
- Saves to `scripts/manual-workflows/`

**To enable API mode**:
```bash
# Add to .env.marketing
THREADS_MODE=api
THREADS_ACCESS_TOKEN=your_token
THREADS_USER_ID=your_user_id
```

---

### Multi-Platform Issues

#### Error: "Twitter connection failed: 403"
**Cause**: Using wrong credentials or expired tokens
**Solution**:
```bash
# Test Twitter separately
node scripts/auto-poster.js

# If Twitter works alone, check multi-platform credentials
grep "TWITTER_" scripts/.env.marketing
```

---

#### Posts Only to Some Platforms
**Expected Behavior**: Platforms with missing credentials are skipped

**Check Status**:
```bash
node scripts/multi-platform/multi-platform-poster.js stats

# Response shows:
# ✅ Connected platforms
# ❌ Failed platforms with errors
```

---

## Common Issues

### 1. Module Import Errors

#### Error: "Cannot find module"
**Cause**: Missing `.js` extension
**Fix**:
```javascript
// Wrong
import Module from './module';

// Correct
import Module from './module.js';
```

---

#### Error: "require is not defined"
**Cause**: CommonJS in ES module project
**Fix**: Convert to ES modules:
```javascript
// Before
const fs = require('fs');
module.exports = MyClass;

// After
import fs from 'fs';
export default MyClass;
```

---

### 2. Environment Issues

#### .env Not Loading
**Check**:
```bash
# Verify file exists
ls -la scripts/.env.marketing

# Check syntax
cat scripts/.env.marketing | grep -E "^[A-Z]"

# No quotes needed for values
TWITTER_API_KEY=abc123  # ✅ Correct
TWITTER_API_KEY="abc123"  # ⚠️ May cause issues
```

---

#### Wrong Directory
**Error**: "Cannot find module"
**Solution**:
```bash
# Always run from project root
cd /Users/ai.place/Crypto
node scripts/auto-poster.js  # ✅ Correct

# Not from scripts directory
cd scripts
node auto-poster.js  # ❌ Wrong
```

---

### 3. Permission Issues

#### Error: "Permission denied"
**Solution**:
```bash
# Make scripts executable
chmod +x scripts/*.sh
chmod +x scripts/cron-*.sh
```

---

### 4. Cron Issues

#### Cron Not Running
**Check**:
```bash
# List cron jobs
crontab -l

# Check cron is running
pgrep cron

# Check logs
tail -f logs/twitter-cron.log
```

**Setup Cron**:
```bash
# Edit crontab
crontab -e

# Add entries (example for Twitter)
0 6,12,18 * * * cd /Users/ai.place/Crypto && ./scripts/cron-twitter.sh
```

---

#### Cron Works Manually, Not Automatically
**Cause**: Environment differences
**Solution**:
```bash
# Use absolute paths in cron scripts
# Already implemented in all cron-*.sh files

# Check cron-twitter.sh has:
cd /Users/ai.place/Crypto || exit 1
/opt/homebrew/bin/node scripts/twitter-scheduler.js
```

---

## Debug Mode

### Enable Verbose Logging

**Twitter**:
```bash
# Add to auto-poster.js (temporary)
console.log('Debug:', JSON.stringify(data, null, 2));
```

**Instagram**:
```bash
# Check API responses
node scripts/instagram-auto-poster.js --dry-run 2>&1 | tee debug.log
```

**Threads**:
```bash
# Check manual workflows
cat scripts/manual-workflows/threads-post-*.json
```

---

## Log Analysis

### Check Twitter Logs
```bash
# View scheduler stats
cat data/project-coordination/scheduler-log.json | jq '.stats'

# View last 5 runs
cat data/project-coordination/scheduler-log.json | jq '.runs[-5:]'

# Check for errors
cat data/project-coordination/scheduler-log.json | jq '.runs[] | select(.success == false)'
```

### Check Posting History
```bash
# Twitter history
cat data/project-coordination/posting-history.json | jq '.posted[-5:]'

# Instagram history
cat data/project-coordination/instagram-history.json | jq '.stats'
```

### Check Cron Logs
```bash
# Twitter
tail -n 100 logs/twitter-cron.log

# Instagram
tail -n 100 logs/instagram-cron.log

# Threads
tail -n 100 logs/threads-cron.log
```

---

## Health Check Script

```bash
#!/bin/bash
# health-check.sh - Check all automation status

echo "🏥 Health Check - Social Media Automation"
echo "=========================================="

# Twitter
echo "📱 TWITTER:"
if node scripts/twitter-scheduler.js 2>&1 | grep -q "SCHEDULED WINDOW"; then
    echo "   ✅ Script working"
else
    echo "   ❌ Script error"
fi

# Instagram
echo "📸 INSTAGRAM:"
if node scripts/instagram-auto-poster.js --help 2>&1 | grep -q "USAGE"; then
    echo "   ✅ Script working"
else
    echo "   ❌ Script error"
fi

# Threads
echo "🧵 THREADS:"
if cd scripts/threads && node threads-auto-poster.js stats 2>&1 | grep -q "mode"; then
    echo "   ✅ Script working"
else
    echo "   ❌ Script error"
fi

# Stats
echo ""
echo "📊 STATISTICS:"
echo "Twitter:"
cat data/project-coordination/scheduler-log.json | jq '.stats'

# Cron
echo ""
echo "⏰ CRON STATUS:"
crontab -l | grep -E "twitter|instagram|threads" || echo "   No cron jobs found"

echo "=========================================="
```

---

## Quick Fixes

### Reset Twitter History
```bash
# Backup first
cp data/project-coordination/posting-history.json data/project-coordination/posting-history.json.bak

# Reset
echo '{"posted":[],"lastIndex":0}' > data/project-coordination/posting-history.json
```

### Clear Error Counter
```bash
# Edit scheduler-log.json
# Set consecutiveErrors to 0
cat data/project-coordination/scheduler-log.json | jq '.stats.consecutiveErrors = 0' > tmp.json
mv tmp.json data/project-coordination/scheduler-log.json
```

### Force Post Now
```bash
# Twitter (bypasses schedule, respects safety limits)
node scripts/twitter-scheduler.js --force

# Test without posting
node scripts/twitter-scheduler.js --dry-run
```

---

## Getting Help

### Check Documentation
- Bug Fixes: `docs/BUG_FIXES_COMPLETE_REPORT.md`
- Testing: `docs/TESTING_GUIDE.md`
- This Guide: `docs/TROUBLESHOOTING.md`

### Run Diagnostics
```bash
# Full test suite
bash test-all.sh

# Individual platform tests
node scripts/auto-poster.js  # Twitter
node scripts/instagram-auto-poster.js --dry-run  # Instagram
cd scripts/threads && node threads-auto-poster.js stats  # Threads
```

### Report Issues
When reporting issues, include:
1. Error message (full output)
2. Platform (Twitter/Instagram/Threads)
3. Command used
4. Log excerpts
5. Environment (Node version, OS)

```bash
# Get environment info
node --version
uname -a
which node
```

---

## Prevention

### Regular Maintenance

**Weekly**:
- Check logs for errors
- Verify credentials still valid
- Review posting statistics

**Monthly**:
- Rotate logs
- Update content bank
- Check rate limit usage

**Every 60 Days**:
- Refresh Instagram token
- Verify Threads API access
- Test all platforms

---

## Emergency Procedures

### Stop All Automation
```bash
# Disable cron
crontab -l > cron-backup.txt
crontab -r

# Stop running processes
pkill -f "auto-poster"
pkill -f "scheduler"
```

### Restore Cron
```bash
# Re-enable from backup
crontab cron-backup.txt
```

### Quick Recovery
```bash
# 1. Reset error counters
echo '{"stats":{"consecutiveErrors":0}}' > data/project-coordination/scheduler-log.json

# 2. Test each platform
node scripts/auto-poster.js --dry-run
node scripts/instagram-auto-poster.js --dry-run
cd scripts/threads && node threads-auto-poster.js stats

# 3. Re-enable cron
crontab cron-backup.txt
```

---

## Success Indicators

### Twitter ✅
```bash
# Check recent posts
cat data/project-coordination/scheduler-log.json | jq '.stats'
# Should show successfulPosts > 0, consecutiveErrors = 0
```

### Instagram ✅
```bash
# Check connection
node scripts/instagram-auto-poster.js --dry-run 2>&1 | grep "Connecting"
# Should NOT show "credentials missing"
```

### Threads ✅
```bash
# Check mode
cd scripts/threads && node threads-auto-poster.js stats | grep "mode"
# Should show "manual" or "api"
```

---

## Contact

For issues not covered here, check:
1. Main documentation in `/docs`
2. Inline code comments
3. GitHub issues (if applicable)
