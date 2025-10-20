# Production Monitoring Setup Guide - HypeAI Private Sale

**Version**: 1.0.0
**Last Updated**: 2025-10-20

---

## Quick Start (5 minutes)

### 1. Install Sentry SDK

```bash
cd /Users/ai.place/Crypto/src/frontend
npm install --save @sentry/nextjs
```

### 2. Configure Environment Variables

Add to `/Users/ai.place/Crypto/src/frontend/.env.local`:

```bash
# Sentry Configuration
NEXT_PUBLIC_SENTRY_DSN=https://your-dsn@sentry.io/project-id
NEXT_PUBLIC_ENVIRONMENT=production
NEXT_PUBLIC_SENTRY_RELEASE=1.0.0
NEXT_PUBLIC_SENTRY_DIST=production-1

# Monitoring Settings
NEXT_PUBLIC_MONITORING_ENABLED=true
NEXT_PUBLIC_METRICS_INTERVAL=60000
```

### 3. Initialize Sentry

Already configured in:
- `/src/frontend/sentry.client.config.js` (Frontend)
- `/src/frontend/sentry.server.config.js` (Backend)

### 4. Update `_app.tsx` to Initialize Monitoring

Add to `/src/frontend/pages/_app.tsx`:

```typescript
import { useEffect } from 'react';
import { trackWebVitals, trackBundleSize } from '@/lib/monitoring/performance';
import { trackPageView } from '@/lib/monitoring/analytics';
import { startHealthMonitoring } from '@/lib/monitoring/health';

export default function App({ Component, pageProps }: AppProps) {
  useEffect(() => {
    // Initialize monitoring
    if (process.env.NODE_ENV === 'production') {
      trackWebVitals();
      trackBundleSize();
      startHealthMonitoring(60000); // Check every minute
    }

    // Track page views
    trackPageView(window.location.pathname);
  }, []);

  // ... rest of your app
}
```

### 5. Test Health Endpoints

```bash
curl http://localhost:3000/api/health
curl http://localhost:3000/api/health/db
curl http://localhost:3000/api/health/blockchain
curl http://localhost:3000/api/health/metrics
```

---

## Sentry Setup (Detailed)

### Step 1: Create Sentry Project

1. Go to [sentry.io](https://sentry.io) and sign up (free tier available)
2. Create new project: **Next.js**
3. Name: `hypeai-private-sale`
4. Copy the DSN (Data Source Name)

### Step 2: Install Sentry

```bash
cd /Users/ai.place/Crypto/src/frontend
npm install --save @sentry/nextjs
```

### Step 3: Configure Next.js Integration

Create `/src/frontend/next.config.js`:

```javascript
const { withSentryConfig } = require('@sentry/nextjs');

const moduleExports = {
  // Your existing Next.js config
  reactStrictMode: true,
  swcMinify: true,
};

const sentryWebpackPluginOptions = {
  // Suppress source map upload logs during build
  silent: true,
  org: 'hypeai',
  project: 'hypeai-private-sale',
};

// Export with Sentry
module.exports = withSentryConfig(moduleExports, sentryWebpackPluginOptions);
```

### Step 4: Configure Source Maps (for debugging)

Add to `.env.local`:

```bash
SENTRY_AUTH_TOKEN=your-auth-token
SENTRY_ORG=hypeai
SENTRY_PROJECT=hypeai-private-sale
```

Get auth token from: Sentry → Settings → Auth Tokens → Create New Token

### Step 5: Test Error Tracking

Add test button to your app:

```typescript
<button onClick={() => {
  throw new Error('Sentry test error');
}}>
  Test Sentry
</button>
```

Click the button, check Sentry dashboard for the error.

---

## Integration with Application

### Track Purchase Errors

```typescript
// In your purchase flow
import * as Sentry from '@sentry/nextjs';
import { trackPurchaseError } from '@/lib/monitoring/analytics';

try {
  await processPurchase(amount, paymentMethod);
} catch (error) {
  // Track in analytics
  trackPurchaseError('transaction_failed', amount, paymentMethod);

  // Send to Sentry with context
  Sentry.withScope((scope) => {
    scope.setContext('purchase', {
      amount,
      paymentMethod,
      wallet: walletAddress,
    });
    Sentry.captureException(error);
  });

  throw error;
}
```

### Track Performance

```typescript
import { measureAsync } from '@/lib/monitoring/performance';

// Wrap async operations
const data = await measureAsync('fetch_user_data', async () => {
  return await fetch('/api/user').then(r => r.json());
});
```

### Track Business Events

```typescript
import { trackPurchaseComplete } from '@/lib/monitoring/analytics';

// After successful purchase
trackPurchaseComplete(1000, 'ETH', 50000, txHash);
```

### Track Security Events

```typescript
import { trackFailedAuth } from '@/lib/monitoring/security';

// After failed login
trackFailedAuth(ipAddress, 'invalid_signature');
```

---

## Monitoring Dashboard

### Access the Dashboard

Add monitoring dashboard to your app:

```typescript
// pages/admin/monitoring.tsx
import { MonitoringDashboard } from '@/components/MonitoringDashboard';

export default function MonitoringPage() {
  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <MonitoringDashboard refreshInterval={30000} />
    </div>
  );
}
```

Access at: `http://localhost:3000/admin/monitoring`

### Protect with Authentication

```typescript
import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function MonitoringPage() {
  const router = useRouter();

  useEffect(() => {
    // Check if admin (implement your auth logic)
    const isAdmin = checkAdminAccess();
    if (!isAdmin) {
      router.push('/');
    }
  }, []);

  return <MonitoringDashboard />;
}
```

---

## External Monitoring Setup

### UptimeRobot (Free)

1. Sign up at [uptimerobot.com](https://uptimerobot.com)
2. Add monitor:
   - **Type**: HTTP(s)
   - **URL**: `https://your-domain.com/api/health`
   - **Interval**: 1 minute
3. Add alert contacts (email, SMS)

### Pingdom (Paid - $10/month)

1. Sign up at [pingdom.com](https://pingdom.com)
2. Add uptime check:
   - **URL**: `https://your-domain.com`
   - **Check interval**: 1 minute
3. Add transaction check (user flow simulation)
4. Configure alert policies

### StatusPage.io (Optional)

1. Sign up at [statuspage.io](https://statuspage.io)
2. Create public status page
3. Connect to UptimeRobot or Pingdom
4. Share URL with users: `https://status.hypeai.io`

---

## Alert Configuration

### Sentry Alerts

**Setup in Sentry Dashboard:**

1. Go to **Alerts → Create Alert Rule**
2. Configure alert:
   - **Name**: High Error Rate
   - **Condition**: Errors > 10 in 5 minutes
   - **Actions**: Email + Slack
3. Create additional alerts:
   - Critical errors (immediate)
   - Performance degradation
   - New error types

### Email Alerts

Create `/src/frontend/lib/monitoring/alerting.ts`:

```typescript
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendAlert(
  severity: string,
  message: string,
  details: any
) {
  await transporter.sendMail({
    from: '"HypeAI Monitoring" <alerts@hypeai.io>',
    to: 'team@hypeai.io',
    subject: `[${severity.toUpperCase()}] ${message}`,
    html: `
      <h2>${message}</h2>
      <p><strong>Severity:</strong> ${severity}</p>
      <p><strong>Time:</strong> ${new Date().toISOString()}</p>
      <pre>${JSON.stringify(details, null, 2)}</pre>
    `,
  });
}
```

### Slack Alerts

```typescript
export async function sendSlackAlert(message: string, details: any) {
  await fetch(process.env.SLACK_WEBHOOK_URL!, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      text: message,
      attachments: [{
        color: 'danger',
        fields: Object.entries(details).map(([key, value]) => ({
          title: key,
          value: String(value),
          short: true,
        })),
      }],
    }),
  });
}
```

---

## Performance Optimization

### Reduce Sentry Quota Usage

```javascript
// sentry.client.config.js
Sentry.init({
  // ... other config

  // Sample 10% of transactions in production
  tracesSampleRate: 0.1,

  // Don't send console.log in production
  beforeBreadcrumb(breadcrumb) {
    if (breadcrumb.category === 'console' && process.env.NODE_ENV === 'production') {
      return null;
    }
    return breadcrumb;
  },
});
```

### Bundle Size Optimization

```bash
# Analyze bundle
npm install --save-dev @next/bundle-analyzer

# Add to next.config.js
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

# Run analysis
ANALYZE=true npm run build
```

---

## Testing Monitoring

### Test Error Tracking

```bash
# Test frontend error
curl -X POST http://localhost:3000/api/test-error

# Test backend error
curl -X POST http://localhost:3000/api/test-server-error
```

### Load Testing

```bash
# Install artillery
npm install -g artillery

# Create load test
cat > load-test.yml <<EOF
config:
  target: 'http://localhost:3000'
  phases:
    - duration: 60
      arrivalRate: 10
scenarios:
  - name: "Health check"
    flow:
      - get:
          url: "/api/health"
EOF

# Run load test
artillery run load-test.yml
```

### Monitor During Load Test

1. Open monitoring dashboard
2. Run load test
3. Watch metrics in real-time
4. Verify alerts trigger correctly

---

## Incident Response Playbook

### P0 - Critical (15-minute response)

**Symptoms:**
- System completely down
- Payment processing failed
- Smart contract exploit

**Response:**
1. Acknowledge alert (reply "ACK" to PagerDuty)
2. Check health endpoints
3. Review Sentry for critical errors
4. Identify root cause
5. Deploy hotfix or rollback
6. Notify users via status page
7. Post-mortem within 24 hours

### P1 - High (1-hour response)

**Symptoms:**
- API degradation (>50% errors)
- Database performance issues
- High security events

**Response:**
1. Acknowledge alert
2. Investigate error logs
3. Check resource usage (CPU, memory)
4. Scale infrastructure if needed
5. Deploy fix in next release
6. Update monitoring to prevent recurrence

### P2 - Medium (4-hour response)

**Symptoms:**
- Non-critical feature failure
- Performance degradation
- Moderate error rates

**Response:**
1. Log issue in tracking system
2. Investigate during business hours
3. Schedule fix for next sprint
4. Monitor for escalation

---

## Metrics Reference

### Key Performance Indicators (KPIs)

```typescript
// Availability
uptime: 99.9% (target)
mtbf: Mean Time Between Failures
mttr: Mean Time To Recovery

// Performance
api_latency_p95: <500ms
page_load_time: <3s
database_query_time: <100ms

// Business
conversion_rate: visitors → purchases
average_purchase_size: USD
total_revenue: USD
active_users: DAU, MAU

// Security
error_rate: <0.1%
blocked_ips: count
suspicious_transactions: count
rate_limit_violations: count
```

### Web Vitals Thresholds

```
LCP (Largest Contentful Paint): <2.5s (good), <4s (needs improvement), >4s (poor)
FID (First Input Delay): <100ms (good), <300ms (needs improvement), >300ms (poor)
CLS (Cumulative Layout Shift): <0.1 (good), <0.25 (needs improvement), >0.25 (poor)
TTFB (Time To First Byte): <800ms (good), <1800ms (needs improvement), >1800ms (poor)
```

---

## Troubleshooting

### Sentry Not Receiving Events

**Check:**
1. DSN configured correctly in `.env.local`
2. Sentry SDK installed: `npm list @sentry/nextjs`
3. Network connectivity to sentry.io
4. Rate limits not exceeded (check Sentry quota)
5. `beforeSend` not filtering too aggressively

**Debug:**
```javascript
Sentry.init({
  debug: true, // Enable debug logging
  // ... rest of config
});
```

### High Memory Usage

**Symptoms:**
- Process crashes with OOM (Out Of Memory)
- Slow response times
- High heap usage in metrics

**Solutions:**
1. Clear monitoring data periodically:
   ```typescript
   setInterval(() => {
     performanceMonitor.clear();
     analytics.clear();
   }, 3600000); // Every hour
   ```
2. Reduce data retention
3. Use streaming for large datasets
4. Enable Node.js memory profiling

### Health Checks Failing

**Database check fails:**
```bash
# Check database file exists
ls -la /Users/ai.place/Crypto/src/backend/database/private-sale.db

# Check permissions
chmod 644 private-sale.db
```

**Blockchain check fails:**
```bash
# Test RPC URL
curl -X POST https://eth.llamarpc.com \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}'
```

---

## Cost Optimization

### Free Tier Setup (MVP)

```
Sentry: Free (5,000 errors/month)
UptimeRobot: Free (50 monitors)
StatusPage: Free (basic)
Custom Dashboard: Self-hosted ($0)

Total: $0/month
```

### Production Setup ($50-100/month)

```
Sentry: $26/month (50K errors + Performance)
Pingdom: $10/month
UptimeRobot: Free
PagerDuty: Free (1 user)
Twilio SMS: $20/month (alerts)

Total: ~$56/month
```

### Reduce Sentry Costs

1. **Lower sample rate:**
   ```javascript
   tracesSampleRate: 0.1, // 10% instead of 100%
   ```

2. **Filter noisy errors:**
   ```javascript
   ignoreErrors: [
     'MetaMask: User denied',
     'Network request failed',
   ]
   ```

3. **Use before send filtering:**
   ```javascript
   beforeSend(event) {
     if (event.level === 'info') return null;
     return event;
   }
   ```

---

## Next Steps

### Week 1: Core Setup
- [ ] Install Sentry SDK
- [ ] Configure environment variables
- [ ] Test error tracking
- [ ] Setup health endpoints
- [ ] Create monitoring dashboard

### Week 2: Alerts & Integration
- [ ] Configure Sentry alerts
- [ ] Setup UptimeRobot
- [ ] Integrate with application code
- [ ] Test alert delivery
- [ ] Document incident response

### Week 3: Optimization
- [ ] Fine-tune alert thresholds
- [ ] Optimize performance
- [ ] Add custom metrics
- [ ] Create status page
- [ ] Load testing

### Week 4: Production Hardening
- [ ] Security audit
- [ ] Performance optimization
- [ ] Documentation review
- [ ] Team training
- [ ] Go live checklist

---

## Support & Resources

**Documentation:**
- Sentry Docs: https://docs.sentry.io/platforms/javascript/guides/nextjs/
- UptimeRobot Docs: https://uptimerobot.com/api/
- Pingdom Docs: https://docs.pingdom.com/

**Team Contacts:**
- DevOps Lead: devops@hypeai.io
- Security Team: security@hypeai.io
- On-Call: oncall@hypeai.io

**Internal Docs:**
- Architecture: `/docs/architecture/PRODUCTION_MONITORING_ARCHITECTURE.md`
- Incident Response: `/docs/INCIDENT_RESPONSE.md`
- Runbooks: `/docs/runbooks/`

---

**Last Updated**: 2025-10-20
**Maintained By**: HypeAI DevOps Team
**Next Review**: 2025-11-20
