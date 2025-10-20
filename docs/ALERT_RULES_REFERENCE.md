# Alert Rules Reference - HypeAI Production Monitoring

**Version**: 1.0.0
**Last Updated**: 2025-10-20

---

## Alert Severity Levels

| Severity | Response Time | Channels | Escalation |
|----------|--------------|----------|------------|
| 🔴 **P0 - Critical** | 15 minutes | Email + SMS + Slack | Immediate |
| 🟠 **P1 - High** | 1 hour | Email + Slack | After 2 hours |
| 🟡 **P2 - Medium** | 4 hours | Email | After 8 hours |
| 🔵 **P3 - Low** | Next day | Dashboard | None |

---

## Critical Alerts (P0) - Immediate Response

### 1. System Down

**Trigger**: Frontend or API returns 5xx errors for >1 minute

**Condition**:
```javascript
error_rate > 50% AND duration >= 60 seconds
```

**Alert Message**:
```
🔴 CRITICAL: System Down
Frontend/API returning 5xx errors
Error rate: [X]%
Duration: [X] minutes
```

**Actions**:
1. Acknowledge within 15 minutes
2. Check health endpoints
3. Review Sentry errors
4. Deploy hotfix or rollback
5. Update status page

---

### 2. Payment Processing Failure

**Trigger**: Payment endpoint fails >5 times in 5 minutes

**Condition**:
```javascript
payment_errors >= 5 AND timeWindow = 5 minutes
```

**Alert Message**:
```
🔴 CRITICAL: Payment System Down
[X] payment failures in 5 minutes
Total lost revenue: $[X]
```

**Actions**:
1. Stop accepting new purchases
2. Investigate payment gateway
3. Check smart contract state
4. Notify users via status page

---

### 3. Smart Contract Exploit

**Trigger**: Unusual contract balance change or ownership transfer

**Condition**:
```javascript
contract_balance_change > 10% OR ownership_changed = true
```

**Alert Message**:
```
🔴 CRITICAL: Smart Contract Security Alert
Contract balance changed by [X]%
OR
Contract ownership transferred to [address]
```

**Actions**:
1. Pause all contract operations
2. Investigate transaction history
3. Contact security team
4. Prepare incident response

---

### 4. Database Connection Lost

**Trigger**: Database unreachable for >30 seconds

**Condition**:
```javascript
database_health = false AND duration >= 30 seconds
```

**Alert Message**:
```
🔴 CRITICAL: Database Offline
Database connection lost
Duration: [X] seconds
Last error: [error message]
```

**Actions**:
1. Check database server status
2. Verify network connectivity
3. Attempt connection restart
4. Fallback to read-replica if available

---

### 5. Security Breach Detected

**Trigger**: SQL injection, XSS, or data breach attempt

**Condition**:
```javascript
security_event_type IN ['sql_injection', 'xss', 'data_breach']
```

**Alert Message**:
```
🔴 CRITICAL: Security Breach Attempt
Type: [attack_type]
Source IP: [ip_address]
Target: [endpoint]
```

**Actions**:
1. Block IP immediately
2. Analyze attack vector
3. Check for data exposure
4. Deploy security patch

---

## High Priority Alerts (P1) - 1 Hour Response

### 1. High Error Rate

**Trigger**: Error rate >10% for 5 minutes

**Condition**:
```javascript
(errors / total_requests) > 0.10 AND duration >= 5 minutes
```

**Alert Message**:
```
🟠 HIGH: Elevated Error Rate
Error rate: [X]%
Total errors: [X] in 5 minutes
Top errors: [error types]
```

**Actions**:
1. Review error logs in Sentry
2. Identify common error pattern
3. Check recent deployments
4. Prepare fix for next release

---

### 2. API Performance Degradation

**Trigger**: P95 latency >1000ms for 10 minutes

**Condition**:
```javascript
api_latency_p95 > 1000 AND duration >= 10 minutes
```

**Alert Message**:
```
🟠 HIGH: API Performance Degraded
P95 latency: [X]ms (threshold: 1000ms)
Affected endpoints: [list]
```

**Actions**:
1. Check server resources (CPU, memory)
2. Review slow database queries
3. Check external API dependencies
4. Consider scaling infrastructure

---

### 3. Unusual Transaction Pattern

**Trigger**: Anomaly detected in transaction behavior

**Condition**:
```javascript
transaction_amount > (avg_amount * 10) OR
transaction_frequency > 5 per minute from single wallet
```

**Alert Message**:
```
🟠 HIGH: Suspicious Transaction Detected
Wallet: [address]
Amount: [X] ([Y]x average)
Pattern: [anomaly_type]
```

**Actions**:
1. Flag wallet for review
2. Pause large transactions temporarily
3. Investigate transaction history
4. Whitelist if legitimate

---

### 4. RPC Node Failure

**Trigger**: Blockchain RPC node unreachable for >2 minutes

**Condition**:
```javascript
rpc_health = false AND duration >= 120 seconds
```

**Alert Message**:
```
🟠 HIGH: RPC Node Failure
Node: [rpc_url]
Duration: [X] minutes
Fallback status: [active/failed]
```

**Actions**:
1. Switch to backup RPC node
2. Verify blockchain sync status
3. Contact RPC provider if persistent
4. Add additional fallback nodes

---

### 5. High Memory Usage

**Trigger**: Memory usage >90% for 5 minutes

**Condition**:
```javascript
memory_usage_percent > 90 AND duration >= 5 minutes
```

**Alert Message**:
```
🟠 HIGH: High Memory Usage
Memory: [X]% used ([Y]MB / [Z]MB)
Process: [process_name]
```

**Actions**:
1. Identify memory-consuming processes
2. Clear monitoring data buffers
3. Restart application if needed
4. Scale infrastructure

---

## Medium Priority Alerts (P2) - 4 Hour Response

### 1. Rate Limit Violations

**Trigger**: >10 rate limit breaches in 5 minutes

**Condition**:
```javascript
rate_limit_violations >= 10 AND timeWindow = 5 minutes
```

**Alert Message**:
```
🟡 MEDIUM: Rate Limit Violations
Violations: [X] in 5 minutes
Top offenders: [IP addresses]
```

**Actions**:
1. Review rate limit logs
2. Identify legitimate users vs bots
3. Adjust rate limits if needed
4. Block persistent offenders

---

### 2. Slow Database Queries

**Trigger**: Query execution time >500ms for >10 queries

**Condition**:
```javascript
COUNT(queries WHERE duration > 500) >= 10
```

**Alert Message**:
```
🟡 MEDIUM: Slow Database Queries
Count: [X] queries >500ms
Slowest query: [X]ms
```

**Actions**:
1. Review slow query log
2. Analyze query execution plans
3. Add database indexes
4. Optimize queries

---

### 3. Failed Authentication Attempts

**Trigger**: >20 failed auth attempts in 10 minutes

**Condition**:
```javascript
failed_auth_attempts >= 20 AND timeWindow = 10 minutes
```

**Alert Message**:
```
🟡 MEDIUM: Multiple Failed Authentications
Attempts: [X] in 10 minutes
Source IPs: [list]
```

**Actions**:
1. Review authentication logs
2. Check for brute force patterns
3. Implement CAPTCHA if needed
4. Block suspicious IPs

---

### 4. Cache Miss Rate High

**Trigger**: Cache miss rate >50% for 30 minutes

**Condition**:
```javascript
(cache_misses / total_requests) > 0.5 AND duration >= 30 minutes
```

**Alert Message**:
```
🟡 MEDIUM: High Cache Miss Rate
Miss rate: [X]%
Impact: Increased latency
```

**Actions**:
1. Review cache configuration
2. Check cache expiration settings
3. Warm cache with common queries
4. Optimize cache keys

---

### 5. Disk Space Low

**Trigger**: Disk usage >80%

**Condition**:
```javascript
disk_usage_percent > 80
```

**Alert Message**:
```
🟡 MEDIUM: Disk Space Low
Disk usage: [X]% ([Y]GB / [Z]GB)
Estimated time to full: [X] days
```

**Actions**:
1. Review log file sizes
2. Archive old data
3. Clean temporary files
4. Provision additional storage

---

## Low Priority Alerts (P3) - Next Business Day

### 1. Daily Summary Report

**Trigger**: Automated daily at 9 AM

**Condition**:
```javascript
schedule = "0 9 * * *"
```

**Alert Message**:
```
🔵 DAILY SUMMARY: [Date]
✅ Uptime: [X]%
📊 Purchases: [X] ($[Y])
👥 Active Users: [X]
⚠️ Errors: [X]
```

**Actions**:
1. Review daily metrics
2. Identify trends
3. Plan optimizations
4. Update stakeholders

---

### 2. Weekly Performance Report

**Trigger**: Automated weekly on Monday at 9 AM

**Condition**:
```javascript
schedule = "0 9 * * 1"
```

**Alert Message**:
```
🔵 WEEKLY REPORT: [Date Range]
Performance:
- API Latency: [X]ms avg ([Y]ms p95)
- Error Rate: [X]%
- Uptime: [X]%

Business:
- Total Revenue: $[X]
- New Users: [X]
- Conversion Rate: [X]%
```

**Actions**:
1. Share with leadership team
2. Analyze week-over-week trends
3. Plan infrastructure scaling
4. Schedule optimizations

---

## Alert Configuration Examples

### Sentry Alert Rules

```javascript
// In Sentry Dashboard > Alerts > Create Alert Rule

// 1. High Error Rate
{
  name: "High Error Rate",
  conditions: {
    events: "> 10",
    timeWindow: "5 minutes"
  },
  actions: {
    email: "team@hypeai.io",
    slack: "#incidents"
  }
}

// 2. Performance Degradation
{
  name: "API Slow Response",
  conditions: {
    metric: "transaction.duration",
    aggregation: "p95",
    value: "> 1000ms",
    timeWindow: "10 minutes"
  },
  actions: {
    email: "devops@hypeai.io",
    slack: "#performance"
  }
}

// 3. New Error Type
{
  name: "New Error Detected",
  conditions: {
    event: "first-seen"
  },
  actions: {
    email: "team@hypeai.io"
  }
}
```

---

### UptimeRobot Alert Configuration

```javascript
// Monitor Configuration
{
  monitor_type: "HTTP(s)",
  monitor_url: "https://hypeai.io/api/health",
  monitor_interval: 1, // 1 minute
  alert_contacts: [
    {
      type: "email",
      value: "team@hypeai.io"
    },
    {
      type: "sms",
      value: "+1234567890"
    }
  ],
  monitor_timeout: 30, // 30 seconds
  monitor_http_method: "GET",
  monitor_expected_http_code: "200"
}
```

---

### Custom Alert Thresholds

```typescript
// lib/monitoring/config.ts

export const ALERT_THRESHOLDS = {
  // Performance thresholds
  api_latency_p95: 1000, // ms
  page_load_time: 3000, // ms
  database_query_time: 500, // ms

  // Error rate thresholds
  error_rate_critical: 0.5, // 50%
  error_rate_high: 0.1, // 10%
  error_rate_medium: 0.05, // 5%

  // Resource usage thresholds
  memory_usage_critical: 95, // %
  memory_usage_high: 90, // %
  disk_usage_warning: 80, // %

  // Security thresholds
  failed_auth_attempts: 20,
  rate_limit_violations: 10,

  // Business thresholds
  payment_failure_rate: 0.05, // 5%
  purchase_anomaly_multiplier: 10, // 10x average
};
```

---

## Alert Routing Matrix

| Alert Type | P0 (Critical) | P1 (High) | P2 (Medium) | P3 (Low) |
|------------|---------------|-----------|-------------|----------|
| **Email** | ✅ Immediate | ✅ Immediate | ✅ Batched | ✅ Daily digest |
| **SMS** | ✅ Immediate | ❌ | ❌ | ❌ |
| **Slack** | ✅ @channel | ✅ @here | ✅ Normal | ❌ |
| **PagerDuty** | ✅ High urgency | ✅ Low urgency | ❌ | ❌ |
| **Dashboard** | ✅ Red banner | ✅ Orange banner | ✅ Yellow badge | ✅ Info |

---

## Alert Suppression Rules

### Maintenance Window

During scheduled maintenance, suppress non-critical alerts:

```typescript
// Suppress alerts during maintenance
export function isMaintenanceWindow(): boolean {
  const now = new Date();
  const hour = now.getUTCHours();

  // Maintenance window: Sundays 2-4 AM UTC
  return now.getUTCDay() === 0 && hour >= 2 && hour < 4;
}

// In alerting.ts
if (!isMaintenanceWindow() || severity === 'critical') {
  sendAlert(alert);
}
```

### Alert Throttling

Prevent alert fatigue by throttling repeated alerts:

```typescript
const alertThrottle = new Map<string, number>();

export function shouldSendAlert(alertKey: string, throttleMinutes = 15): boolean {
  const lastSent = alertThrottle.get(alertKey);
  const now = Date.now();

  if (lastSent && now - lastSent < throttleMinutes * 60 * 1000) {
    return false; // Throttled
  }

  alertThrottle.set(alertKey, now);
  return true;
}
```

---

## Testing Alerts

### Test Alert Delivery

```bash
# Test email alert
curl -X POST http://localhost:3000/api/alerts \
  -H "Content-Type: application/json" \
  -d '{
    "severity": "high",
    "title": "Test Alert",
    "message": "This is a test alert",
    "metadata": { "test": true }
  }'

# Test Sentry integration
node -e "require('@sentry/nextjs').captureMessage('Test alert from CLI')"

# Test Slack webhook
curl -X POST $SLACK_WEBHOOK_URL \
  -H "Content-Type: application/json" \
  -d '{"text": "Test alert from monitoring system"}'
```

---

## Alert Response Checklist

### P0 - Critical Response

- [ ] Acknowledge alert within 15 minutes
- [ ] Check system health dashboard
- [ ] Review error logs in Sentry
- [ ] Identify root cause
- [ ] Deploy hotfix or rollback
- [ ] Update status page
- [ ] Notify stakeholders
- [ ] Post-mortem within 24 hours

### P1 - High Response

- [ ] Acknowledge alert within 1 hour
- [ ] Investigate error logs
- [ ] Check recent deployments
- [ ] Identify affected users
- [ ] Plan fix for next release
- [ ] Monitor for escalation
- [ ] Update tracking system

### P2 - Medium Response

- [ ] Review alert within 4 hours
- [ ] Log issue in tracking system
- [ ] Analyze patterns
- [ ] Schedule fix for next sprint
- [ ] Document findings

---

## Alert Metrics

Track alert effectiveness:

```typescript
export interface AlertMetrics {
  total_alerts: number;
  false_positives: number;
  missed_incidents: number;
  mean_time_to_detect: number; // minutes
  mean_time_to_acknowledge: number; // minutes
  mean_time_to_resolve: number; // minutes
}

// Target SLAs
const ALERT_SLAS = {
  false_positive_rate: 0.05, // <5%
  missed_incident_rate: 0.01, // <1%
  mtd: 5, // <5 minutes
  mta: 15, // <15 minutes (P0)
  mtr: 120, // <2 hours (P0)
};
```

---

## Conclusion

This alert rules reference provides comprehensive coverage for:

- ✅ 20+ predefined alert rules
- ✅ Clear severity levels and response times
- ✅ Alert routing and escalation
- ✅ Suppression and throttling rules
- ✅ Testing procedures
- ✅ Response checklists

**Review this document monthly** to ensure alert thresholds remain appropriate as the system scales.

---

**Document Maintained By**: HypeAI DevOps Team
**Last Updated**: 2025-10-20
**Next Review**: 2025-11-20
