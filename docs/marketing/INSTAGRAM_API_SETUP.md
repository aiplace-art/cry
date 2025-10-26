# Instagram Graph API Setup Guide

## Overview

This guide walks you through setting up Instagram Graph API access for automated posting to your Instagram Business or Creator account.

## Prerequisites

- **Facebook Business Page** (required)
- **Instagram Business or Creator Account** (must be connected to Facebook Page)
- **Facebook Developer Account** (free)
- **Meta App** with Instagram Graph API access

---

## Step 1: Create Facebook App

### 1.1 Go to Facebook Developers
Visit: https://developers.facebook.com/apps/

### 1.2 Create New App
1. Click **"Create App"**
2. Select **"Business"** as app type
3. Fill in app details:
   - **App Name**: "HypeAI Marketing Automation"
   - **Contact Email**: your-email@example.com
   - **Business Account**: Select or create one
4. Click **"Create App"**

### 1.3 Add Instagram Product
1. In app dashboard, scroll to **"Add Products"**
2. Find **"Instagram"** and click **"Set Up"**
3. This adds Instagram Graph API to your app

---

## Step 2: Configure Instagram Business Account

### 2.1 Connect Instagram to Facebook Page
1. Go to your Facebook Page settings
2. Navigate to **"Instagram"** section
3. Click **"Connect Account"**
4. Login to your Instagram Business/Creator account
5. Authorize connection

### 2.2 Verify Connection
```bash
# Your Instagram account must be:
✓ Business or Creator account type
✓ Connected to a Facebook Business Page
✓ Have posting permissions
```

---

## Step 3: Get Access Tokens

### 3.1 Get User Access Token (Short-lived)

**Method 1: Graph API Explorer** (Easiest for testing)
1. Go to: https://developers.facebook.com/tools/explorer/
2. Select your app from dropdown
3. Click **"Generate Access Token"**
4. Grant permissions:
   - `instagram_basic`
   - `instagram_content_publish`
   - `pages_read_engagement`
   - `pages_manage_posts` (if posting to Facebook too)
5. Copy the **User Access Token** (valid 1-2 hours)

**Method 2: Facebook Login** (Production)
Implement OAuth flow:
```javascript
const authUrl = `https://www.facebook.com/v18.0/dialog/oauth?` +
  `client_id=${FB_APP_ID}` +
  `&redirect_uri=${REDIRECT_URI}` +
  `&scope=instagram_basic,instagram_content_publish,pages_read_engagement`;
```

### 3.2 Exchange for Long-Lived Token (60 days)

```bash
curl -X GET "https://graph.facebook.com/v18.0/oauth/access_token" \
  -d "grant_type=fb_exchange_token" \
  -d "client_id=YOUR_APP_ID" \
  -d "client_secret=YOUR_APP_SECRET" \
  -d "fb_exchange_token=SHORT_LIVED_TOKEN"
```

Response:
```json
{
  "access_token": "LONG_LIVED_TOKEN",
  "token_type": "bearer",
  "expires_in": 5183999
}
```

### 3.3 Get Never-Expiring Page Token (Recommended)

```bash
# 1. Get user's Facebook Pages
curl -X GET "https://graph.facebook.com/v18.0/me/accounts" \
  -d "access_token=LONG_LIVED_USER_TOKEN"

# Response includes page_id and page_access_token
# 2. Use page_access_token (never expires if user doesn't change password)
```

---

## Step 4: Get Instagram Business Account ID

### 4.1 Get Facebook Page ID
```bash
curl -X GET "https://graph.facebook.com/v18.0/me/accounts" \
  -d "access_token=YOUR_ACCESS_TOKEN"
```

### 4.2 Get Instagram Account ID
```bash
curl -X GET "https://graph.facebook.com/v18.0/{PAGE_ID}?fields=instagram_business_account" \
  -d "access_token=YOUR_ACCESS_TOKEN"
```

Response:
```json
{
  "instagram_business_account": {
    "id": "17841405309211844"
  },
  "id": "PAGE_ID"
}
```

**Save this Instagram Business Account ID** - you'll need it for posting!

---

## Step 5: Configure Environment Variables

Add to `/Users/ai.place/Crypto/scripts/.env.marketing`:

```bash
# Instagram Graph API Credentials
INSTAGRAM_BUSINESS_ACCOUNT_ID=17841405309211844
INSTAGRAM_ACCESS_TOKEN=EAAxxxxxxxxxxxxxxxxxxxxxxx
FACEBOOK_PAGE_ID=123456789012345
FACEBOOK_APP_ID=123456789012345
FACEBOOK_APP_SECRET=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Optional: For token refresh
INSTAGRAM_USER_ID=your_instagram_user_id
```

---

## Step 6: Test API Access

### 6.1 Test Account Access
```bash
curl -X GET "https://graph.facebook.com/v18.0/{INSTAGRAM_ACCOUNT_ID}" \
  -d "fields=id,username,name,profile_picture_url" \
  -d "access_token={ACCESS_TOKEN}"
```

Expected response:
```json
{
  "id": "17841405309211844",
  "username": "hypeai",
  "name": "HypeAI",
  "profile_picture_url": "https://..."
}
```

### 6.2 Test Posting Permission
```bash
curl -X GET "https://graph.facebook.com/v18.0/{INSTAGRAM_ACCOUNT_ID}" \
  -d "fields=instagram_business_account" \
  -d "access_token={ACCESS_TOKEN}"
```

---

## Step 7: Test Image Upload

### 7.1 Upload Test Image
```bash
curl -X POST "https://graph.facebook.com/v18.0/{IG_ACCOUNT_ID}/media" \
  -F "image_url=https://example.com/test.png" \
  -F "caption=Test post from HypeAI automation 🚀" \
  -F "access_token={ACCESS_TOKEN}"
```

Response:
```json
{
  "id": "18027934701234567"
}
```

### 7.2 Publish Container
```bash
curl -X POST "https://graph.facebook.com/v18.0/{IG_ACCOUNT_ID}/media_publish" \
  -F "creation_id=18027934701234567" \
  -F "access_token={ACCESS_TOKEN}"
```

Response:
```json
{
  "id": "17895695668004550"
}
```

**Success!** Your post is live: `https://www.instagram.com/p/{SHORTCODE}/`

---

## Common Issues & Solutions

### Issue 1: "Invalid OAuth access token"
**Solution**: Token expired. Generate new long-lived token or page token.

### Issue 2: "Insufficient permissions"
**Solution**: Re-authorize with all required scopes:
- `instagram_basic`
- `instagram_content_publish`
- `pages_read_engagement`

### Issue 3: "Instagram account is not a business account"
**Solution**: Convert to Business/Creator account in Instagram app:
1. Settings → Account → Switch to Professional Account
2. Connect to Facebook Business Page

### Issue 4: "Cannot publish to this account"
**Solution**: Verify:
- Account is Business/Creator (not Personal)
- Connected to Facebook Page
- App has Instagram Graph API product added
- User authorized all permissions

### Issue 5: Rate limits (200 calls/hour per user)
**Solution**: Implement exponential backoff and request batching.

---

## Rate Limits

Instagram Graph API has the following limits:

| Limit Type | Value | Reset Period |
|------------|-------|--------------|
| Media publish | 25 posts/day | 24 hours |
| Stories publish | 50 stories/day | 24 hours |
| API calls | 200 calls/hour | 1 hour |
| Hashtags per post | 30 max | - |

**Our scheduler is configured to respect these limits:**
- Max 3 posts/day (well under 25 limit)
- 4-hour gap between posts
- Automatic rate limit handling

---

## Security Best Practices

### 1. Protect Access Tokens
```bash
# NEVER commit .env.marketing to git
# Verify .gitignore includes:
scripts/.env.marketing
.env*
```

### 2. Token Rotation
- Refresh long-lived tokens every 30 days
- Monitor expiration with `expires_in` field
- Implement automatic refresh in production

### 3. Secure Storage
```bash
# Production: Use secure vault
# Development: .env file with chmod 600
chmod 600 /Users/ai.place/Crypto/scripts/.env.marketing
```

### 4. Error Logging
- Log errors but NOT tokens
- Sanitize logs before sharing
- Monitor for suspicious activity

---

## Next Steps

1. ✅ Complete this setup
2. ✅ Add credentials to `.env.marketing`
3. ✅ Test with `node scripts/test-instagram-api.js`
4. ✅ Run first post: `node scripts/instagram-auto-poster.js --dry-run`
5. ✅ Enable scheduler: `bash scripts/setup-instagram-cron.sh`

---

## Resources

- **Instagram Graph API Docs**: https://developers.facebook.com/docs/instagram-api
- **Content Publishing**: https://developers.facebook.com/docs/instagram-api/guides/content-publishing
- **Permissions Reference**: https://developers.facebook.com/docs/permissions/reference
- **Rate Limits**: https://developers.facebook.com/docs/graph-api/overview/rate-limiting

---

## Support

Need help? Check:
1. **Setup issues**: Review this guide step-by-step
2. **API errors**: Check Instagram Graph API status page
3. **Code issues**: See `docs/marketing/INSTAGRAM_AUTOMATION_GUIDE.md`
