# Error Tracking Integration Guide

Quick guide for integrating the new error tracking and logging modules into HTML pages.

## Quick Start

### 1. Add Scripts to HTML

Add these script tags **before** your other JavaScript files:

```html
<!DOCTYPE html>
<html>
<head>
    <!-- ... other head content ... -->
</head>
<body>
    <!-- Your content -->

    <!-- ERROR TRACKING & LOGGING (Load first!) -->
    <script src="js/modules/logger.js"></script>
    <script src="js/modules/error-tracking.js"></script>

    <!-- Optional: Sentry SDK for advanced features -->
    <script src="https://browser.sentry-cdn.com/7.100.0/bundle.min.js"
            integrity="sha384-..." crossorigin="anonymous"></script>

    <!-- Your other scripts -->
    <script src="js/hyper-chat-competitive-engine.js"></script>
</body>
</html>
```

### 2. Configure Environment Variables

**For Vercel/Netlify** (via dashboard):
```env
ERROR_TRACKING_ENABLED=true
ERROR_TRACKING_DSN=https://your-sentry-dsn@o123456.ingest.sentry.io/7654321
ERROR_TRACKING_ENVIRONMENT=production
```

**For local development** (`.env` file):
```env
NODE_ENV=development
ERROR_TRACKING_ENABLED=false
```

### 3. Use Logger Instead of console.log

**Before:**
```javascript
console.log('User clicked button');
console.error('API request failed');
console.warn('Slow response time');
```

**After:**
```javascript
window.logger.log('User clicked button');      // Only in development
window.logger.error('API request failed');     // Always logged
window.logger.warn('Slow response time');      // Always logged
```

## Integration Examples

### Example 1: index.html

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>HypeAI - Home</title>
    <!-- ... meta tags, styles ... -->
</head>
<body>
    <!-- Page content -->

    <!-- Load error tracking first -->
    <script src="js/modules/logger.js"></script>
    <script src="js/modules/error-tracking.js"></script>

    <!-- Optional: Sentry SDK -->
    <script src="https://browser.sentry-cdn.com/7.100.0/bundle.min.js"></script>

    <!-- Your application scripts -->
    <script src="js/hyper-chat-competitive-engine.js"></script>
    <script src="js/ai-assistant.js"></script>

    <script>
        // Error tracker is ready!
        window.logger.log('Homepage initialized');

        // Track user actions
        document.querySelectorAll('button').forEach(btn => {
            btn.addEventListener('click', () => {
                window.errorTracker.addBreadcrumb({
                    category: 'user-action',
                    message: `Clicked: ${btn.textContent}`,
                    level: 'info'
                });
            });
        });
    </script>
</body>
</html>
```

### Example 2: services.html

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>HypeAI - Services</title>
</head>
<body>
    <!-- Page content -->

    <!-- Error tracking modules -->
    <script src="js/modules/logger.js"></script>
    <script src="js/modules/error-tracking.js"></script>
    <script src="https://browser.sentry-cdn.com/7.100.0/bundle.min.js"></script>

    <script>
        // Set user context for better error tracking
        if (window.errorTracker) {
            window.errorTracker.setUser({
                id: 'user-123',
                email: 'user@example.com',
                segment: 'services-visitor'
            });
        }

        // Track page load time
        window.logger.time('page-load');

        window.addEventListener('load', () => {
            window.logger.timeEnd('page-load');
            window.logger.log('Services page fully loaded');
        });
    </script>
</body>
</html>
```

## Advanced Usage

### Tracking Specific Errors

```javascript
try {
    // Some risky operation
    await fetchDataFromAPI();
} catch (error) {
    // Automatically sent to Sentry with context
    window.errorTracker.captureException(error, {
        tags: {
            feature: 'api-call',
            severity: 'high'
        },
        extra: {
            endpoint: '/api/data',
            userId: currentUser.id
        }
    });
}
```

### Adding Breadcrumbs (User Journey)

```javascript
// Track user navigation
window.errorTracker.addBreadcrumb({
    category: 'navigation',
    message: 'User navigated to services page',
    level: 'info'
});

// Track user interactions
window.errorTracker.addBreadcrumb({
    category: 'ui',
    message: 'Clicked "Get Started" button',
    level: 'info',
    data: {
        buttonId: 'cta-main',
        section: 'hero'
    }
});
```

### Performance Monitoring

```javascript
// Measure function performance
window.logger.time('data-processing');
await processLargeDataset();
window.logger.timeEnd('data-processing');

// Performance marks
window.logger.mark('api-request-start');
await fetch('/api/data');
window.logger.mark('api-request-end');
window.logger.measure('api-request', 'api-request-start', 'api-request-end');
```

### Wrapping Functions with Error Tracking

```javascript
// Wrap async function
const safeFetchData = window.errorTracker.wrapAsync(
    async function fetchData(userId) {
        const response = await fetch(`/api/users/${userId}`);
        return response.json();
    },
    { function: 'fetchData', module: 'api' }
);

// Now all errors are automatically tracked
const data = await safeFetchData('user-123');
```

## Environment-Specific Behavior

### Development
- All logs visible: `logger.log()`, `logger.debug()`, `logger.info()`
- Error tracking disabled by default
- Detailed error messages in console

### Production
- Only errors and warnings: `logger.error()`, `logger.warn()`
- Error tracking enabled
- Errors sent to Sentry
- User data automatically sanitized

## Sentry Dashboard Setup

### 1. Create Sentry Account
1. Go to [sentry.io](https://sentry.io)
2. Create free account (50k events/month free)
3. Create new project → JavaScript

### 2. Get DSN
1. Go to Project Settings → Client Keys (DSN)
2. Copy DSN: `https://abc123@o123.ingest.sentry.io/456`
3. Add to environment variables

### 3. Configure Alerts
1. Go to Alerts → Create Alert Rule
2. Set conditions:
   - Error rate > 1% → Warning
   - Error rate > 5% → Critical
3. Set notification method (Email, Slack, PagerDuty)

### 4. Monitor Dashboard
- **Issues**: See all errors grouped by type
- **Performance**: Track API response times
- **Releases**: Compare error rates across versions
- **Replays**: Watch session recordings of errors

## Testing Error Tracking

### Test in Development

```javascript
// Test logger
window.logger.log('Test log');
window.logger.warn('Test warning');
window.logger.error('Test error');

// Test error tracking
window.errorTracker.captureException(new Error('Test error'));
window.errorTracker.captureMessage('Test message', 'info');
```

### Test in Production (Staging)

1. Deploy to staging environment
2. Open browser console
3. Trigger test error:
   ```javascript
   throw new Error('Test production error');
   ```
4. Check Sentry dashboard for event

## Troubleshooting

### Logger Not Working
```javascript
// Check if logger is loaded
if (window.logger) {
    console.log('Logger ready');
} else {
    console.error('Logger not loaded');
}

// Fallback pattern
(window.logger || console).log('Safe logging');
```

### Sentry Not Receiving Events
```javascript
// Check error tracker status
if (window.errorTracker) {
    console.log('Tracker initialized:', window.errorTracker.initialized);
    console.log('Provider:', window.errorTracker.provider);
} else {
    console.error('Error tracker not loaded');
}

// Test Sentry connection
if (typeof Sentry !== 'undefined') {
    Sentry.captureMessage('Test message from browser');
}
```

### Environment Detection Issues
```javascript
// Check detected environment
console.log('Is Development:', window.logger.isDevelopment);
console.log('Hostname:', window.location.hostname);
console.log('Port:', window.location.port);

// Force development mode
window.logger.enableAll();
```

## Best Practices

### DO ✅
- Load logger and error-tracking before other scripts
- Use `window.logger.log()` for development-only logs
- Use `window.logger.error()` for all errors
- Add breadcrumbs for important user actions
- Set user context when user logs in
- Test error tracking in staging before production

### DON'T ❌
- Don't use `console.log()` directly (use logger)
- Don't hardcode Sentry DSN in code
- Don't track sensitive data (passwords, tokens)
- Don't enable full logging in production
- Don't ignore logger initialization errors

## Migration Checklist

For each HTML file:
- [ ] Add logger.js script tag
- [ ] Add error-tracking.js script tag
- [ ] Add Sentry SDK script tag (optional)
- [ ] Replace console.log with window.logger.log
- [ ] Replace console.error with window.logger.error
- [ ] Replace console.warn with window.logger.warn
- [ ] Test in development
- [ ] Test in staging
- [ ] Verify Sentry events

## Support

**Issues**: Create GitHub issue with "error-tracking" label
**Docs**: `/docs/deployment/ERROR_TRACKING_INTEGRATION.md`
**Module Docs**: See comments in `js/modules/error-tracking.js`

---

**Last Updated**: 2025-10-26
**Version**: 1.0.0
