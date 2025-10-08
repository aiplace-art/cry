# Marketing Automation Setup Guide

This guide will walk you through setting up the automated marketing system for your crypto project.

## Prerequisites

- Node.js 16+ installed
- Twitter Developer Account
- Discord Server
- Telegram Bot
- BSCScan API Key

## Step 1: Install Dependencies

```bash
cd scripts
npm install
```

## Step 2: Configure Environment Variables

1. Copy the example environment file:
```bash
cp .env.example .env
```

2. Fill in your API credentials in `.env` file

### Getting Twitter API Credentials

1. Go to [Twitter Developer Portal](https://developer.twitter.com/en/portal/dashboard)
2. Create a new app or use existing
3. Generate API keys and tokens
4. Copy all credentials to `.env`

### Setting Up Discord Webhook

1. Go to your Discord server
2. Right-click on the channel you want to post to
3. Edit Channel > Integrations > Webhooks
4. Create new webhook
5. Copy webhook URL to `.env`

### Setting Up Telegram Bot

1. Message @BotFather on Telegram
2. Send `/newbot` and follow instructions
3. Copy the bot token to `.env`
4. Add bot to your channel
5. Get channel ID and add to `.env`

### Getting BSCScan API Key

1. Go to [BSCScan](https://bscscan.com/apis)
2. Sign up and create API key
3. Copy to `.env`

## Step 3: Customize Templates

Edit `marketing-automation.js` to customize:

- Tweet templates
- Posting schedule
- Milestone thresholds
- Brand voice and messaging

## Step 4: Test the System

### Test Individual Posts

```bash
# Test morning post
node marketing-automation.js post morning

# Test engagement post
node marketing-automation.js post engagement

# Test FOMO post
node marketing-automation.js post fomo
```

### Generate Report

```bash
node marketing-automation.js report
```

### Check Milestones

```bash
node marketing-automation.js milestone
```

## Step 5: Start Automated Scheduling

```bash
# Start the automation engine
node marketing-automation.js start
```

This will run continuously and execute scheduled tasks:
- Morning updates: 8 AM UTC daily
- Engagement posts: 2 PM UTC daily
- Milestone checks: Every hour
- Analytics: Every 2 hours

## Step 6: Run as Background Service

### Using PM2 (Recommended)

```bash
# Install PM2
npm install -g pm2

# Start automation
pm2 start marketing-automation.js --name crypto-marketing -- start

# View logs
pm2 logs crypto-marketing

# Stop automation
pm2 stop crypto-marketing

# Restart automation
pm2 restart crypto-marketing
```

### Using systemd (Linux)

Create `/etc/systemd/system/crypto-marketing.service`:

```ini
[Unit]
Description=Crypto Marketing Automation
After=network.target

[Service]
Type=simple
User=your-user
WorkingDirectory=/path/to/Crypto/scripts
ExecStart=/usr/bin/node marketing-automation.js start
Restart=on-failure

[Install]
WantedBy=multi-user.target
```

Then:
```bash
sudo systemctl enable crypto-marketing
sudo systemctl start crypto-marketing
sudo systemctl status crypto-marketing
```

## Monitoring and Maintenance

### View Analytics

Analytics are saved to `data/analytics.json` every 2 hours. You can analyze:
- Holder growth trends
- Social media metrics
- Volume patterns
- Price movements

### Milestone Tracking

Achieved milestones are saved to `data/milestones.json` to avoid duplicate celebrations.

### Logs

All actions are logged to console. When running with PM2, logs are saved automatically.

## Customization Tips

### Adding New Tweet Types

1. Add new template category to `TWEET_TEMPLATES`
2. Create templates with placeholder variables
3. Add command in CLI interface

### Changing Schedule

Modify cron expressions in `start()` method:
```javascript
// Format: 'minute hour day month weekday'
cron.schedule('0 8 * * *', callback); // 8 AM daily
cron.schedule('0 */2 * * *', callback); // Every 2 hours
cron.schedule('0 0 * * 0', callback); // Weekly on Sunday
```

### Adding New Platforms

1. Create new client class (e.g., `InstagramClient`)
2. Add configuration to CONFIG object
3. Integrate into ContentScheduler
4. Add to scheduled tasks

## Troubleshooting

### Rate Limits

Twitter has rate limits. If you hit them:
- Reduce posting frequency
- Add delays between posts
- Upgrade to premium API access

### API Errors

Check that:
- All credentials are correct
- APIs are not deprecated
- Network connectivity is stable
- Contract address is valid

### Missing Data

If blockchain data isn't loading:
- Verify RPC URL is working
- Check contract address is correct
- Ensure BSCScan API key is valid
- Try alternative data sources

## Security Best Practices

1. **Never commit `.env` file** - It's in `.gitignore`
2. **Use read-only APIs** where possible
3. **Rotate credentials** regularly
4. **Monitor for suspicious activity**
5. **Use separate accounts** for automation
6. **Enable 2FA** on all accounts

## Support

For issues or questions:
- Check logs for error messages
- Verify all credentials are correct
- Test individual components separately
- Review API documentation

## Advanced Features

### Webhook Integration

Trigger posts from external events:
```javascript
// Add webhook endpoint
app.post('/webhook/milestone', async (req, res) => {
  await automation.scheduler.checkMilestones();
  res.send('OK');
});
```

### Custom Analytics

Export data for visualization:
```javascript
const analytics = await automation.scheduler.runAnalytics();
// Send to your analytics platform
```

### Multi-language Support

Add translation templates:
```javascript
const TEMPLATES_ES = {
  morning: ["¡Buenos días..."],
  // etc
};
```

## Conclusion

You now have a fully automated marketing system that will:
- Post engaging content regularly
- Celebrate milestones automatically
- Track analytics continuously
- Build community engagement
- Maintain consistent presence

Remember to monitor performance and adjust strategies based on results!
