# Production Monitoring - Quick Reference Card

**HypeAI Private Sale Platform**

---

## 🚀 Quick Start (5 Minutes)

```bash
# 1. Install Sentry
cd /Users/ai.place/Crypto/src/frontend
npm install --save @sentry/nextjs

# 2. Configure environment
echo 'NEXT_PUBLIC_SENTRY_DSN=https://your-dsn@sentry.io/project-id' >> .env.local

# 3. Start development server
npm run dev

# 4. Test health endpoints
curl http://localhost:3000/api/health
curl http://localhost:3000/api/health/db
curl http://localhost:3000/api/health/blockchain
```

---

## 📊 Key Endpoints

| Endpoint | Purpose | Response Time |
|----------|---------|---------------|
| `/api/health` | Basic liveness check | <50ms |
| `/api/health/db` | Database connectivity | <100ms |
| `/api/health/blockchain` | RPC node status | <500ms |
| `/api/health/metrics` | Prometheus metrics | <100ms |
| `/admin/monitoring` | Monitoring dashboard | N/A |

---

## 🎯 Performance Targets

| Metric | Target | Current | Status |
|--------|--------|---------|--------|
| **Uptime** | 99.9% | - | 🟢 |
| **API Latency (p95)** | <500ms | - | 🟢 |
| **Error Rate** | <0.1% | - | 🟢 |
| **Page Load Time** | <3s | - | 🟢 |
| **Database Queries** | <100ms | - | 🟢 |

---

## 🚨 Alert Severity Levels

| Level | Response | Channels | Examples |
|-------|----------|----------|----------|
| 🔴 **P0 - Critical** | 15 min | Email + SMS + Slack | System down, security breach |
| 🟠 **P1 - High** | 1 hour | Email + Slack | High errors, performance degraded |
| 🟡 **P2 - Medium** | 4 hours | Email | Rate limits, slow queries |
| 🔵 **P3 - Low** | Next day | Dashboard | Daily reports, metrics |

---

## 📈 Key Metrics to Monitor

### System Health
- ✅ API response time (p50, p95, p99)
- ✅ Error rate (errors per minute)
- ✅ Database query time
- ✅ RPC node latency
- ✅ Memory usage
- ✅ CPU usage

### Business Metrics
- 💰 Total purchases (count, USD value)
- 👥 Active users (DAU, MAU)
- 📊 Conversion rate (visitor → purchase)
- 💳 Sales by payment method
- 🎯 Average purchase size

### Security Events
- 🛡️ Failed authentication attempts
- ⚠️ Rate limit violations
- 🚫 Blocked IPs
- 🔍 Suspicious transactions
- 📝 Security event count by severity

---

## 🔧 Common Commands

### Check System Status
```bash
# Quick health check
curl http://localhost:3000/api/health | jq

# Database status
curl http://localhost:3000/api/health/db | jq

# Blockchain status
curl http://localhost:3000/api/health/blockchain | jq
```

### View Logs
```bash
# Application logs
npm run dev

# Sentry dashboard
open https://sentry.io/organizations/hypeai/issues/

# UptimeRobot dashboard
open https://uptimerobot.com/dashboard
```

### Test Alerts
```bash
# Test alert endpoint
curl -X POST http://localhost:3000/api/alerts \
  -H "Content-Type: application/json" \
  -d '{
    "severity": "high",
    "title": "Test Alert",
    "message": "Testing alert system"
  }'
```

---

## 📱 Integration Examples

### Track Purchase
```typescript
import { trackPurchaseComplete } from '@/lib/monitoring/analytics';

trackPurchaseComplete(1000, 'ETH', 50000, txHash);
```

### Track Error
```typescript
import * as Sentry from '@sentry/nextjs';

try {
  await riskyOperation();
} catch (error) {
  Sentry.captureException(error);
  throw error;
}
```

### Track Performance
```typescript
import { measureAsync } from '@/lib/monitoring/performance';

const data = await measureAsync('fetch_data', async () => {
  return await fetchData();
});
```

### Track Security Event
```typescript
import { trackFailedAuth } from '@/lib/monitoring/security';

trackFailedAuth(ipAddress, 'invalid_signature');
```

---

## 🔍 Troubleshooting

### Sentry Not Receiving Events

**Check:**
```bash
# Verify DSN configured
echo $NEXT_PUBLIC_SENTRY_DSN

# Check Sentry SDK installed
npm list @sentry/nextjs

# Enable debug mode in sentry.client.config.js
debug: true
```

### Health Checks Failing

**Database:**
```bash
# Check database file exists
ls -la /Users/ai.place/Crypto/src/backend/database/private-sale.db

# Test database connection
sqlite3 private-sale.db "SELECT 1;"
```

**Blockchain:**
```bash
# Test RPC endpoint
curl -X POST https://eth.llamarpc.com \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}'
```

### High Memory Usage

```bash
# Check Node.js memory
node -e "console.log(process.memoryUsage())"

# Clear monitoring buffers (in app)
performanceMonitor.clear();
analytics.clear();
```

---

## 📞 Incident Response

### P0 - Critical Incident

1. **Acknowledge** (within 15 min)
   - Reply "ACK" to alert
   - Join incident channel (#incidents)

2. **Assess**
   - Check monitoring dashboard
   - Review Sentry errors
   - Check health endpoints

3. **Mitigate**
   - Deploy hotfix, OR
   - Rollback deployment, OR
   - Scale infrastructure

4. **Communicate**
   - Update status page
   - Notify stakeholders
   - Post updates every 30 min

5. **Resolve**
   - Verify fix deployed
   - Monitor metrics
   - Close incident

6. **Post-Mortem** (within 24 hours)
   - Document timeline
   - Root cause analysis
   - Action items

---

## 📊 Monitoring Dashboard

### Access Dashboard
```
http://localhost:3000/admin/monitoring
```

### Dashboard Sections

1. **System Health Overview**
   - Status, uptime, latency, error rate

2. **Performance Metrics**
   - API, database, blockchain performance
   - Web Vitals (LCP, FID, CLS, TTFB)

3. **Business Metrics**
   - Purchases, revenue, conversion funnel
   - Payment method distribution

4. **Security Monitoring**
   - Security events by severity
   - Blocked IPs, suspicious wallets
   - Transaction statistics

5. **Health Checks**
   - API, database, blockchain status
   - Latency for each dependency

---

## 💰 Cost Breakdown

### Free Tier (Development)
- Sentry: Free (5K errors/month)
- UptimeRobot: Free (50 monitors)
- **Total: $0/month**

### Production Tier
- Sentry: $26/month (50K errors)
- Pingdom: $10/month
- Twilio SMS: $20/month
- **Total: ~$56/month**

---

## 📚 Documentation Links

| Document | Purpose |
|----------|---------|
| [PRODUCTION_MONITORING_ARCHITECTURE.md](architecture/PRODUCTION_MONITORING_ARCHITECTURE.md) | Complete system architecture |
| [MONITORING_SETUP.md](MONITORING_SETUP.md) | Detailed setup guide |
| [MONITORING_IMPLEMENTATION_SUMMARY.md](MONITORING_IMPLEMENTATION_SUMMARY.md) | Implementation status |
| [ALERT_RULES_REFERENCE.md](ALERT_RULES_REFERENCE.md) | Alert configuration |

---

## 🎯 Next Steps

### Today
- [ ] Install Sentry SDK
- [ ] Configure environment variables
- [ ] Test health endpoints

### This Week
- [ ] Integrate monitoring into app
- [ ] Create monitoring dashboard page
- [ ] Configure Sentry alerts
- [ ] Set up UptimeRobot

### Next Week
- [ ] Set up alert channels (Email, Slack, SMS)
- [ ] Load testing
- [ ] Fine-tune alert thresholds
- [ ] Team training

---

## 🆘 Emergency Contacts

| Role | Contact | Phone | Email |
|------|---------|-------|-------|
| **DevOps Lead** | - | - | devops@hypeai.io |
| **On-Call Engineer** | - | - | oncall@hypeai.io |
| **Security Team** | - | - | security@hypeai.io |
| **CTO** | - | - | cto@hypeai.io |

---

## 🔐 Service Credentials

**Sentry**
- Dashboard: https://sentry.io
- Org: hypeai
- Project: hypeai-private-sale

**UptimeRobot**
- Dashboard: https://uptimerobot.com/dashboard
- Monitors: 50 (free tier)

**Pingdom**
- Dashboard: https://my.pingdom.com
- Plan: Starter ($10/month)

---

## ✅ Go-Live Checklist

### Pre-Production
- [ ] Sentry SDK installed and configured
- [ ] Environment variables set
- [ ] Health endpoints tested
- [ ] Monitoring dashboard accessible
- [ ] Sentry alerts configured
- [ ] UptimeRobot monitors created
- [ ] Alert channels tested (email, Slack)
- [ ] Team trained on monitoring tools
- [ ] Incident response runbooks reviewed

### Production
- [ ] All monitors active
- [ ] Status page configured
- [ ] On-call rotation defined
- [ ] PagerDuty integrated (optional)
- [ ] Performance baselines established
- [ ] Alert thresholds tuned
- [ ] Post-deployment monitoring active

### Post-Launch
- [ ] Daily metrics reviewed
- [ ] Weekly performance reports
- [ ] Monthly alert fine-tuning
- [ ] Quarterly capacity planning

---

**Quick Reference Version**: 1.0.0
**Last Updated**: 2025-10-20
**Print & Keep Handy** 📋
