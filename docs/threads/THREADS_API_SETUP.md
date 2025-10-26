# Threads API Setup Guide

Complete guide for obtaining and configuring Threads API credentials.

## 🎯 Overview

To use the Threads automation system in **API mode** (recommended), you need:
1. Meta (Facebook) Developer Account
2. Threads API Beta Access (application required)
3. Access Token and User ID
4. Environment configuration

## 📋 Prerequisites

- ✅ Instagram account linked to Threads
- ✅ Threads profile (create at threads.net)
- ✅ Meta (Facebook) Developer account
- ✅ Business verification (for production access)

## 🚀 Step-by-Step Setup

### Step 1: Create Meta Developer Account

1. Go to https://developers.facebook.com
2. Click "Get Started"
3. Complete account setup
4. Verify email address

### Step 2: Apply for Threads API Access

**Important:** Threads API is currently in **limited beta**

1. Visit https://developers.facebook.com/docs/threads
2. Click "Request Access" or "Apply for Beta"
3. Fill out application form:
   - Company/Project name: HYPEAI
   - Use case: Automated content management and analytics
   - Expected usage: 50-100 posts/day
   - Purpose: Marketing automation for crypto AI platform

4. Submit and wait for approval (typically 1-3 weeks)

**Alternative:** If beta access is not available:
- Use **Manual Mode** (no API required)
- Use **Browser Automation Mode** (experimental)
- Wait for public API release

### Step 3: Create a Meta App

Once approved for beta:

1. Go to https://developers.facebook.com/apps
2. Click "Create App"
3. Choose app type: **Business**
4. Fill in details:
   - App Name: HYPEAI Threads Automation
   - Contact Email: your@email.com
5. Click "Create App"

### Step 4: Add Threads Product

1. In your app dashboard
2. Find "Add Products to Your App"
3. Locate "Threads API"
4. Click "Set Up"
5. Follow setup wizard

### Step 5: Get Access Token

#### Option A: Short-Lived Token (Testing)

1. Go to **Graph API Explorer** (https://developers.facebook.com/tools/explorer)
2. Select your app from dropdown
3. Click "Generate Access Token"
4. Grant permissions:
   - `threads_basic`
   - `threads_content_publish`
   - `threads_manage_insights`
   - `threads_manage_replies`
   - `threads_read_replies`

5. Copy the token (valid for 1-2 hours)

#### Option B: Long-Lived Token (Production)

Short-lived tokens expire quickly. Exchange for long-lived token:

```bash
curl -X GET "https://graph.facebook.com/v18.0/oauth/access_token?grant_type=fb_exchange_token&client_id={app-id}&client_secret={app-secret}&fb_exchange_token={short-lived-token}"
```

Response:
```json
{
  "access_token": "long_lived_token_here",
  "token_type": "bearer",
  "expires_in": 5184000  // 60 days
}
```

### Step 6: Get Your User ID

```bash
curl -X GET "https://graph.threads.net/v1.0/me?fields=id,username&access_token={your-access-token}"
```

Response:
```json
{
  "id": "1234567890",
  "username": "hypeai_official"
}
```

### Step 7: Configure Environment

Add to `.env.marketing`:

```bash
# Threads API Configuration
THREADS_MODE=api
THREADS_ACCESS_TOKEN=your_long_lived_access_token_here
THREADS_USER_ID=1234567890
THREADS_API_VERSION=v1.0

# Optional: Refresh token endpoint
THREADS_APP_ID=your_app_id
THREADS_APP_SECRET=your_app_secret
```

### Step 8: Test Connection

```bash
# Test API client
node scripts/threads/threads-api-client.js

# Expected output:
# 🔄 Initializing Threads API Client (mode: api)
# ✅ API Connected: @hypeai_official

# Test post
node scripts/threads/threads-api-client.js test-post
```

## 🔐 Token Management

### Token Expiration

Long-lived tokens expire after 60 days. Refresh before expiration:

```javascript
// Add to threads-api-client.js
async refreshAccessToken() {
  const response = await axios.get('https://graph.facebook.com/v18.0/oauth/access_token', {
    params: {
      grant_type: 'fb_exchange_token',
      client_id: process.env.THREADS_APP_ID,
      client_secret: process.env.THREADS_APP_SECRET,
      fb_exchange_token: this.accessToken
    }
  });

  this.accessToken = response.data.access_token;
  // Update .env.marketing with new token
}
```

### Token Security

- ✅ **Store in `.env.marketing`** (gitignored)
- ✅ **Never commit tokens** to git
- ✅ **Rotate tokens** every 30 days
- ✅ **Use environment variables** in production
- ❌ **Never hardcode tokens** in scripts

## 📊 API Permissions

Required scopes for full functionality:

| Permission | Purpose | Required |
|------------|---------|----------|
| `threads_basic` | Basic profile access | ✅ Yes |
| `threads_content_publish` | Post content | ✅ Yes |
| `threads_manage_insights` | Analytics | ⚠️ Recommended |
| `threads_manage_replies` | Reply management | ⚠️ Optional |
| `threads_read_replies` | Read comments | ⚠️ Optional |

## 🚦 Rate Limits

Threads API rate limits (as of 2024):

| Action | Limit |
|--------|-------|
| Posts per hour | 25 |
| Posts per day | 250 |
| API requests per hour | 500 |
| Media uploads per hour | 50 |

The automation system enforces these limits automatically.

## 🧪 Testing API Access

### Test 1: Basic Connection

```bash
curl -X GET "https://graph.threads.net/v1.0/me?fields=id,username,threads_profile_picture_url&access_token={token}"
```

### Test 2: Create Post

```bash
# Step 1: Create media container
curl -X POST "https://graph.threads.net/v1.0/{user-id}/threads" \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "media_type": "TEXT",
    "text": "🚀 Testing HYPEAI Threads API!"
  }'

# Response: {"id": "container_123"}

# Step 2: Publish
curl -X POST "https://graph.threads.net/v1.0/{user-id}/threads_publish" \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "creation_id": "container_123"
  }'
```

### Test 3: Get Insights

```bash
curl -X GET "https://graph.threads.net/v1.0/{post-id}/insights?metric=views,likes,replies,reposts&access_token={token}"
```

## ⚠️ Common Issues

### Issue 1: API Not Available

**Error:** "Threads API product not found"

**Solution:**
- Verify beta access approval
- Check app dashboard for Threads product
- Wait for official API public release
- Use **Manual Mode** as fallback

### Issue 2: Invalid Token

**Error:** "Invalid OAuth access token"

**Solutions:**
1. Verify token hasn't expired
2. Check token permissions/scopes
3. Regenerate token with correct scopes
4. Exchange for long-lived token

### Issue 3: User ID Not Found

**Error:** "User ID not found"

**Solutions:**
1. Ensure Threads profile is public
2. Verify Instagram account is linked
3. Check token has `threads_basic` permission
4. Wait 24 hours after Threads signup

### Issue 4: Rate Limit Exceeded

**Error:** "Rate limit exceeded"

**Solutions:**
1. Implement exponential backoff
2. Use scheduler to space out posts
3. Monitor posting frequency
4. Wait for limit reset (hourly)

## 🔄 Alternative Methods (No API Access)

If you don't have API access yet:

### Option 1: Manual Mode

```bash
# Set in .env.marketing
THREADS_MODE=manual

# System generates posting instructions
node scripts/threads/threads-auto-poster.js post "Your content"
# Creates manual-workflows/threads-post-*.json
```

### Option 2: Browser Automation

```bash
# Install Playwright
npm install playwright

# Set in .env.marketing
THREADS_MODE=browser

# Semi-automated posting
node scripts/threads/threads-auto-poster.js post "Your content"
```

### Option 3: Zapier/IFTTT Integration

Use third-party automation:
1. Connect Twitter → Zapier → Threads
2. Set up trigger: New Twitter post
3. Action: Post to Threads
4. Map content fields

## 📱 Mobile App Testing

While waiting for API access, test posting flow:

1. Open Threads app
2. Create test posts
3. Note optimal times for engagement
4. Analyze which content performs best
5. Document hashtag effectiveness

## 🎓 Best Practices

### Security
- ✅ Rotate tokens every 30 days
- ✅ Use separate tokens for dev/prod
- ✅ Monitor API usage in Meta dashboard
- ✅ Set up alerts for suspicious activity

### Development
- ✅ Test with low rate limits first
- ✅ Implement retry logic with backoff
- ✅ Log all API errors
- ✅ Cache profile data locally
- ✅ Use staging environment

### Production
- ✅ Monitor rate limit usage
- ✅ Implement graceful degradation
- ✅ Have manual workflow as backup
- ✅ Set up automated token refresh
- ✅ Track API health metrics

## 📚 Resources

### Official Documentation
- Threads API Docs: https://developers.facebook.com/docs/threads
- Graph API Explorer: https://developers.facebook.com/tools/explorer
- Meta Developer Dashboard: https://developers.facebook.com/apps

### Community
- Meta Developer Community: https://developers.facebook.com/community
- Threads API Beta Discussion: (check your app dashboard)

### Support
- Meta Developer Support: https://developers.facebook.com/support
- Submit Bug Reports: https://developers.facebook.com/bugs

## ✅ Verification Checklist

Before going live:

- [ ] Meta Developer account created
- [ ] Threads API beta access approved
- [ ] App created and configured
- [ ] Access token obtained (long-lived)
- [ ] User ID retrieved
- [ ] Environment variables set
- [ ] API connection tested
- [ ] Test post successful
- [ ] Rate limits understood
- [ ] Error handling implemented
- [ ] Token refresh configured
- [ ] Backup mode available (manual/browser)

## 🚀 Next Steps

Once API is configured:

1. **Test thoroughly** with low-volume posting
2. **Enable scheduling** for optimal timing
3. **Set up analytics** collection
4. **Configure cross-posting** from Twitter
5. **Enable automation** with cron jobs
6. **Monitor performance** and adjust

---

**Need help? Check THREADS_INTEGRATION_GUIDE.md for full documentation**
