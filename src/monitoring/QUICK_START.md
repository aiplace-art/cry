# Quick Start Guide - HypeAI Monitoring

Get up and running in 5 minutes!

## 1. Install Dependencies

```bash
cd src/monitoring
chmod +x install.sh
./install.sh
```

Or manually:

```bash
npm install express axios node-cron nodemailer twilio ethers
```

## 2. Configure Environment

Copy and edit the environment file:

```bash
cp .env.example .env
nano .env
```

**Minimal configuration** (just to get started):

```env
MONITORING_PORT=3005

# Service URLs (update with your actual ports)
DISCORD_BOT_URL=http://localhost:3001
TELEGRAM_BOT_URL=http://localhost:3002
TWITTER_BOT_URL=http://localhost:3003

# At minimum, configure Slack for alerts
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK/URL
```

## 3. Start the Server

```bash
node server.js
```

You should see:

```
🏥 HypeAI Monitoring System Started
=====================================
📊 Dashboard: http://localhost:3005
📈 Status Page: http://localhost:3005/status
🔌 API: http://localhost:3005/api
=====================================
```

## 4. Access Dashboards

Open in your browser:

- **Internal Dashboard**: http://localhost:3005
- **Public Status Page**: http://localhost:3005/status

## 5. Test Alerts

Send a test alert:

```bash
node -e "
const AlertSystem = require('./alerts');
const alerts = new AlertSystem();
alerts.sendAlert({
  priority: 'P3',
  title: 'Test Alert',
  message: 'Monitoring system is working!'
});
"
```

Check your Slack channel for the alert!

## Optional: Production Setup

### Using PM2

```bash
npm install -g pm2
pm2 start server.js --name hypeai-monitoring
pm2 save
pm2 startup
```

### Using systemd

```bash
./install.sh
# Answer 'y' when asked about systemd service

sudo systemctl start hypeai-monitoring
sudo systemctl status hypeai-monitoring
```

### Using Docker

```bash
docker build -t hypeai-monitoring .
docker run -d \
  --name hypeai-monitoring \
  -p 3005:3005 \
  --env-file .env \
  hypeai-monitoring
```

## Configuration Deep Dive

### Enable Email Alerts

```env
ALERT_EMAIL_FROM=alerts@hypeai.io
ALERT_EMAIL_TO=team@hypeai.io
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password  # Not your regular password!
```

**Gmail App Password**: Go to Google Account Settings → Security → 2-Step Verification → App Passwords

### Enable SMS Alerts (P0 Only)

```env
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_FROM_NUMBER=+1234567890
TWILIO_TO_NUMBER=+0987654321
```

Sign up at [twilio.com](https://www.twilio.com) for a free trial.

### Enable Blockchain Monitoring

```env
RPC_URL=https://mainnet.infura.io/v3/YOUR_INFURA_KEY
CONTRACT_ADDRESS=0xYourHypeAITokenAddress
DEPLOYER_PRIVATE_KEY=your_private_key  # For gas balance checks
```

### Enable Token Price Tracking

```env
COINGECKO_API_KEY=your_coingecko_api_key  # Optional, free tier works
```

## Verify Everything is Working

### Check Health Endpoint

```bash
curl http://localhost:3005/api/health | jq
```

### Check Metrics

```bash
curl http://localhost:3005/api/metrics | jq
```

### Check Alerts

```bash
curl http://localhost:3005/api/alerts | jq
```

## Common Issues

### Port 3005 already in use

Change the port in `.env`:

```env
MONITORING_PORT=3006
```

### Alerts not sending

1. Check Slack webhook URL is correct
2. Test webhook manually:
   ```bash
   curl -X POST -H 'Content-type: application/json' \
     --data '{"text":"Test"}' \
     YOUR_SLACK_WEBHOOK_URL
   ```
3. Check email SMTP credentials
4. Look at server logs for errors

### Bots showing as "down"

Make sure your bot services expose a `/health` endpoint:

```javascript
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', uptime: process.uptime() });
});
```

### Metrics not updating

1. Check external API keys are valid
2. Verify token address and RPC URL
3. Check network connectivity
4. Look at server logs

## Next Steps

1. **Customize Alert Rules**: Edit `alert-rules.json`
2. **Set Up On-Call Rotation**: Configure in `alert-rules.json`
3. **Public Status Page**: Share http://your-domain.com:3005/status
4. **Integrate with Services**: Add health endpoints to all bots
5. **Set Up External Monitoring**: Use UptimeRobot to monitor the monitoring system

## API Examples

### Send Custom Alert

```javascript
const response = await fetch('http://localhost:3005/api/alerts', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    priority: 'P2',
    title: 'Custom Alert',
    message: 'Something important happened',
    tags: ['custom']
  })
});
```

### Get Health History

```javascript
const response = await fetch('http://localhost:3005/api/health/history?limit=100');
const history = await response.json();
```

### Export Metrics

```javascript
const response = await fetch('http://localhost:3005/api/metrics/export');
const blob = await response.blob();
// Save to file
```

## Support

For issues or questions:
- GitHub: https://github.com/hypeai/monitoring
- Discord: https://discord.gg/hypeai
- Email: support@hypeai.io

## Security Notes

1. **Never commit `.env`** to git (it's in `.gitignore`)
2. **Use environment variables** in production
3. **Restrict dashboard access** with authentication (add later)
4. **Use HTTPS** in production
5. **Rotate API keys** regularly

Happy monitoring! 🎉
