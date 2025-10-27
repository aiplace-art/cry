# 🚀 Quick Integration Checklist

**Copy/paste this into each HTML file:**

## Step 1: Add Scripts (before closing </body>)

```html
<!-- ERROR TRACKING & LOGGING -->
<script src="js/modules/logger.js"></script>
<script src="js/modules/error-tracking.js"></script>
<script src="https://browser.sentry-cdn.com/7.100.0/bundle.min.js"></script>
```

## Step 2: Find & Replace in JS Files

**Search:** `console.log(`
**Replace:** `window.logger.log(`

**Search:** `console.error(`
**Replace:** `window.logger.error(`

**Search:** `console.warn(`
**Replace:** `window.logger.warn(`

## Step 3: Environment Variables

Add to Vercel/Netlify dashboard:

```
ERROR_TRACKING_DSN=https://your-sentry-dsn@sentry.io/project
ERROR_TRACKING_ENABLED=true
ERROR_TRACKING_ENVIRONMENT=production
```

## Step 4: Test

```javascript
// In browser console
window.logger.log('Test');
window.errorTracker.captureMessage('Test');
```

Done! ✅
