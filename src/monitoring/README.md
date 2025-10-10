# HypeAI Monitoring & Alerts System

Comprehensive monitoring and alerting system for all HypeAI operations.

## Features

### 🏥 Health Monitoring
- **Real-time health checks** for all services (Discord, Telegram, Twitter bots)
- **Blockchain monitoring** (gas balance, contract status, block numbers)
- **Website uptime** monitoring
- **External API** status checks (CoinGecko, Twitter API, etc.)
- **Automated checks** every 60 seconds
- **Health scoring** (0-100) with status levels

### 🚨 Multi-Channel Alerts
- **Slack** notifications for team collaboration
- **Email** alerts with HTML formatting
- **SMS** alerts via Twilio for P0 emergencies
- **Priority levels** (P0-P4) with smart routing
- **Alert deduplication** (prevent spam)
- **Alert grouping** within time windows
- **On-call rotation** support

### 📊 Metrics Collection
- **Token metrics**: Price, volume, market cap, holder count
- **Social stats**: Followers, members, engagement
- **Bot performance**: Uptime, response times
- **Website analytics**: Traffic, page views
- **API performance**: Response times, rate limits
- **Time-series storage** with automatic aggregation
- **Retention policy**: 90 days by default

### 📈 Dashboards
- **Internal dashboard** with real-time charts
- **Public status page** for transparency
- **Mobile-responsive** design
- **Auto-refresh** every minute
- **Quick actions** (restart bots, silence alerts)

## Installation

```bash
npm install express axios node-cron nodemailer twilio ethers
```

## Configuration

### Environment Variables

```env
# Monitoring
MONITORING_PORT=3005

# Health Checks
RPC_URL=https://mainnet.infura.io/v3/YOUR_KEY
CONTRACT_ADDRESS=0x...

# Email Alerts
ALERT_EMAIL_FROM=alerts@hypeai.io
ALERT_EMAIL_TO=team@hypeai.io
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Slack Alerts
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK/URL

# SMS Alerts (Optional)
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_FROM_NUMBER=+1234567890
TWILIO_TO_NUMBER=+0987654321

# External APIs
ETHERSCAN_API_KEY=your_etherscan_key
TWITTER_BEARER_TOKEN=your_twitter_token
TWITTER_ACCOUNT_ID=your_account_id
```

## Usage

### Start Monitoring Server

```bash
node src/monitoring/server.js
```

### Access Dashboards

- **Internal Dashboard**: http://localhost:3005
- **Public Status Page**: http://localhost:3005/status

### Standalone Components

#### Health Monitor

```javascript
const HealthMonitor = require('./health-monitor');

const monitor = new HealthMonitor({
  checkInterval: '*/1 * * * *', // Every minute
  discordBotUrl: 'http://localhost:3001/health',
  telegramBotUrl: 'http://localhost:3002/health',
  twitterBotUrl: 'http://localhost:3003/health',
  alertCallback: async (alert) => {
    console.log('Alert:', alert);
  }
});

monitor.start();
```

#### Alert System

```javascript
const AlertSystem = require('./alerts');

const alerts = new AlertSystem({
  slackWebhook: process.env.SLACK_WEBHOOK_URL,
  emailEnabled: true,
  smsEnabled: true
});

// Send alert
await alerts.sendAlert({
  priority: 'P1',
  title: 'Discord Bot Down',
  message: 'Discord bot has been unreachable for 5 minutes',
  tags: ['bot', 'discord']
});
```

#### Metrics Collector

```javascript
const MetricsCollector = require('./metrics-collector');

const collector = new MetricsCollector({
  collectionInterval: '*/1 * * * *',
  tokenAddress: '0x...',
  coingeckoId: 'hypeai'
});

collector.start();

// Get current metrics
const metrics = collector.getCurrentMetrics();
console.log(metrics);
```

## API Reference

### Health API

#### GET /api/health
Get current system health status.

**Response:**
```json
{
  "timestamp": "2025-01-10T...",
  "services": {
    "Discord Bot": { "status": "healthy", "responseTime": 45 },
    "Telegram Bot": { "status": "healthy", "responseTime": 38 }
  },
  "blockchain": {
    "status": "healthy",
    "gasBalance": "0.5",
    "blockNumber": 12345678
  },
  "overall": {
    "status": "healthy",
    "score": 100,
    "issues": []
  }
}
```

#### GET /api/health/history?limit=100
Get health check history.

#### GET /api/health/uptime?hours=24
Get uptime percentage.

### Metrics API

#### GET /api/metrics
Get current metrics snapshot.

**Response:**
```json
{
  "timestamp": "2025-01-10T...",
  "token": {
    "price": 0.05,
    "priceChange24h": 5.2,
    "volume24h": 1000000,
    "marketCap": 5000000,
    "holderCount": 1234
  },
  "social": {
    "twitter": { "followers": 5000 },
    "discord": { "members": 2000 },
    "telegram": { "members": 1500 }
  }
}
```

#### GET /api/metrics/range?start=2025-01-01&end=2025-01-10
Get metrics for date range.

#### GET /api/metrics/export
Download all metrics as JSON file.

### Alerts API

#### GET /api/alerts?limit=100
Get recent alerts.

#### POST /api/alerts
Send a new alert.

**Request:**
```json
{
  "priority": "P2",
  "title": "High Response Time",
  "message": "Website response time exceeds 2 seconds",
  "tags": ["website", "performance"]
}
```

#### POST /api/alerts/silence
Silence alerts for specified duration.

#### GET /api/alerts/stats?hours=24
Get alert statistics.

## Alert Rules

Alert rules are defined in `alert-rules.json`:

```json
{
  "rules": [
    {
      "id": "bot-down",
      "condition": {
        "metric": "bots.*.status",
        "operator": "equals",
        "value": "down",
        "duration": "5m"
      },
      "priority": "P1",
      "channels": ["slack", "email"]
    }
  ]
}
```

### Priority Levels

- **P0**: Emergency (SMS + Email + Slack) - System down, immediate action required
- **P1**: Critical (Email + Slack) - Service degraded, action needed soon
- **P2**: Warning (Email + Slack) - Potential issue, should investigate
- **P3**: Info (Slack) - Informational, no action needed
- **P4**: Low (Slack) - Nice to know

### On-Call Rotation

Configure on-call rotation in `alert-rules.json`:

```json
{
  "on_call_rotation": [
    {
      "name": "Engineer 1",
      "email": "engineer1@hypeai.io",
      "phone": "+1234567890",
      "days": ["Monday", "Tuesday", "Wednesday"]
    },
    {
      "name": "Engineer 2",
      "email": "engineer2@hypeai.io",
      "phone": "+0987654321",
      "days": ["Thursday", "Friday", "Saturday", "Sunday"]
    }
  ]
}
```

## Metrics Storage

Metrics are stored in a time-series format:

```
data/
  metrics/
    minute/
      2025-01-10.json  # Minute-level data
    hourly/
      2025-01-10.json  # Hourly summaries
    daily/
      2025-01-10.json  # Daily summaries
  health-metrics.json    # Health check history
  alert-history.json     # Alert history
```

## Monitoring Best Practices

1. **Set up alerts early** - Configure email/Slack before going live
2. **Test alerts regularly** - Ensure notification channels work
3. **Monitor the monitors** - Set up external uptime monitoring
4. **Review metrics weekly** - Look for trends and patterns
5. **Tune alert thresholds** - Avoid alert fatigue
6. **Document incidents** - Learn from failures
7. **Keep retention short** - 90 days is usually enough

## Dashboard Features

### Internal Dashboard (`/`)
- Real-time system status (green/yellow/red indicators)
- Live metrics charts (price, volume)
- Recent alerts feed
- Overall health score
- Quick actions (restart, silence, export)
- Auto-refresh every minute

### Public Status Page (`/status`)
- Public-facing status page
- System uptime statistics
- Incident history
- Email subscription form
- Mobile-responsive design

## Auto-Restart & Self-Healing

The monitoring system includes auto-restart capabilities:

1. **Detection**: Health checks identify failed services
2. **Alert**: Team is notified via configured channels
3. **Action**: Automatic restart attempts (configurable)
4. **Verification**: Post-restart health checks
5. **Escalation**: If restart fails, escalate to P0

## Integration with Existing Services

Each service should expose a `/health` endpoint:

```javascript
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    // Service-specific metrics
    messageCount24h: 1234,
    errorRate: 0.01
  });
});
```

## Troubleshooting

### Alerts not sending

1. Check environment variables are set
2. Verify SMTP credentials
3. Test Slack webhook manually
4. Check alert rate limits

### Metrics not collecting

1. Ensure cron jobs are running
2. Check file permissions on data directory
3. Verify external API keys
4. Check network connectivity

### Dashboard not updating

1. Verify monitoring server is running
2. Check browser console for errors
3. Ensure API endpoints are accessible
4. Clear browser cache

## License

MIT License - HypeAI 2025
