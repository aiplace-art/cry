# Quick Start - Twitter Integration

## Getting Started

The Twitter integration is now production-ready and works automatically when you open the dashboard.

### Prerequisites

1. **Web Server** (for local development):
   ```bash
   cd /Users/ai.place/Crypto/products/hypeai-dashboard
   python3 -m http.server 8080
   ```

2. **Data Files** (these exist at):
   - `/Users/ai.place/Crypto/data/project-coordination/analytics-data.json`
   - `/Users/ai.place/Crypto/data/project-coordination/posting-history.json`
   - `/Users/ai.place/Crypto/data/project-coordination/marketing-insights.json`

### Opening the Dashboard

1. Start web server:
   ```bash
   python3 -m http.server 8080
   ```

2. Open browser:
   ```
   http://localhost:8080
   ```

3. The Twitter integration will automatically:
   - Load data from the data files
   - Show loading indicators
   - Display connection status
   - Update metrics on the dashboard

### Features You'll See

1. **Connection Status** (top right):
   - 🟢 Live - Data is fresh
   - 🟡 Stale - Using cached data
   - 🔴 Offline - No connection
   - ⏳ Loading - Fetching data

2. **Refresh Button** (top right):
   - Click to manually refresh data
   - Shows loading state during refresh

3. **Last Updated** (top right):
   - Shows when data was last fetched
   - Hover for full timestamp

4. **Toast Notifications**:
   - ✓ Success when data loads
   - ✗ Error if loading fails
   - ⚠️ Warning for partial failures

5. **Loading Overlays**:
   - Spinner appears when loading
   - Message shows what's loading

### What Gets Updated

The dashboard will show:
- **Followers Count**: From `twitterData.followers`
- **Tweets Count**: From `posting-history.json` (length of `posted` array)
- **Engagement Rate**: Calculated from metrics
- **Growth Rate**: Based on follower changes
- **Goal Progress**: Progress toward 10K followers

### Automatic Updates

Data refreshes automatically every:
- **30 seconds** - When you're actively using the dashboard
- **1 minute** - When you're idle (no interaction for 60s)
- **5 minutes** - When the browser tab is in the background

### Troubleshooting

#### Data Not Loading?

1. Check browser console (F12) for errors
2. Verify data files exist:
   ```bash
   ls -la /Users/ai.place/Crypto/data/project-coordination/
   ```

3. Check network tab in devtools
4. Look for connection status indicator

#### Shows "Offline"?

1. Check if web server is running
2. Verify file paths in browser console
3. Check CORS settings if using different domain

#### Shows "Stale Data"?

1. Data is more than 5 minutes old
2. Click refresh button to force update
3. Check if data files are being updated

### Configuration

Edit `/Users/ai.place/Crypto/products/hypeai-dashboard/js/twitter-connect-v2.js`:

```javascript
const TWITTER_CONFIG = {
    updateInterval: 30000,      // Active refresh (30s)
    maxUpdateInterval: 300000,  // Background refresh (5min)
    cacheMaxAge: 300000,       // Cache lifetime (5min)
};
```

### Browser Console Commands

```javascript
// Check service status
window.TwitterConnect.twitterService

// View current data
window.TwitterConnect.twitterData

// Check version
window.TwitterConnect.version  // "2.0"

// Force refresh
window.dispatchEvent(new CustomEvent('twitter:refresh', {
    detail: { force: true }
}));

// Check cache
window.TwitterConnect.twitterService.cache

// Get specific cached data
window.TwitterConnect.twitterService.getFromCache('analytics')
window.TwitterConnect.twitterService.getFromCache('history')
```

### For Production Deployment

1. **Update Base Path** in `twitter-data-service.js`:
   ```javascript
   getBasePath() {
       // Change to your production API endpoint
       return '/api/twitter';
   }
   ```

2. **Setup API Endpoints**:
   - `/api/twitter/analytics-data.json`
   - `/api/twitter/posting-history.json`
   - `/api/twitter/marketing-insights.json`

3. **Configure CORS** on your server:
   ```nginx
   add_header Access-Control-Allow-Origin https://your-domain.com;
   ```

### Next Steps

- Read `TWITTER_INTEGRATION_FIXED.md` for full documentation
- Review `INTEGRATION_CRITIQUE.md` for technical details
- Check browser console for detailed logs
- Monitor connection status indicator

### Support

If you encounter issues:
1. Check browser console for errors
2. Verify all JavaScript files loaded
3. Check network tab for failed requests
4. Review error messages in toast notifications
5. Check connection status indicator

The integration includes comprehensive error handling, so you'll always see user-friendly messages explaining what's happening.
