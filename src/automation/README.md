# HypeAI Content Automation System

Complete automated content posting system for HypeAI's social media presence.

## Features

- **Automated Scheduling**: Posts content at optimal times (9AM, 2PM, 8PM UTC)
- **Multi-Platform**: Simultaneous posting to Twitter, Telegram, and Discord
- **Queue Management**: Track upcoming, posted, and failed content
- **Smart Retry**: Automatic retry logic for failed posts
- **Analytics**: Track engagement rates and best posting times
- **Admin Panel**: Web-based interface for management
- **Duplicate Detection**: Prevent posting same content twice
- **Rate Limiting**: Respect platform API limits
- **Email Notifications**: Daily reminders and failure alerts

## Quick Start

### 1. Install Dependencies

```bash
cd src/automation
npm install node-cron axios form-data nodemailer
```

### 2. Configure Environment Variables

Create `.env` file in `src/automation/`:

```env
# Twitter API v2
TWITTER_API_KEY=your_api_key
TWITTER_API_SECRET=your_api_secret
TWITTER_ACCESS_TOKEN=your_access_token
TWITTER_ACCESS_SECRET=your_access_secret
TWITTER_BEARER_TOKEN=your_bearer_token

# Telegram Bot
TELEGRAM_BOT_TOKEN=your_bot_token
TELEGRAM_CHAT_ID=@your_channel

# Discord Webhook
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/...

# Email Notifications
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
REMINDER_EMAIL=admin@hypeai.io
```

### 3. Start the Scheduler

```bash
# Start automation system
node content-scheduler.js start

# Or use PM2 for production
pm2 start content-scheduler.js --name hypeai-automation
```

### 4. Open Admin Panel

```bash
# Start simple HTTP server for admin panel
python3 -m http.server 8080

# Or use live-server
npx live-server --port=8080
```

Open: `http://localhost:8080/admin-panel.html`

## Usage Examples

### Content Scheduler

```bash
# Start the scheduler
node content-scheduler.js start

# Schedule new content from files
node content-scheduler.js schedule

# Check queue status
node content-scheduler.js status

# Retry failed posts
node content-scheduler.js retry
```

### Multi-Platform Publisher

```bash
# Test posting to all platforms
node multi-publisher.js test

# Check configuration status
node multi-publisher.js status
```

### Calendar Manager

```bash
# View today's schedule
node calendar-manager.js today

# View upcoming 7 days
node calendar-manager.js upcoming 7

# Check completion rate
node calendar-manager.js completion

# View analytics summary
node calendar-manager.js analytics

# Send daily reminder email
node calendar-manager.js remind
```

## Programmatic Usage

### JavaScript Integration

```javascript
const ContentScheduler = require('./content-scheduler');
const MultiPublisher = require('./multi-publisher');
const CalendarManager = require('./calendar-manager');

// Initialize
const scheduler = new ContentScheduler({
  postingTimes: ['09:00', '14:00', '20:00'],
  maxRetries: 3
});

const publisher = new MultiPublisher({
  platforms: ['twitter', 'telegram', 'discord']
});

const calendar = new CalendarManager();

// Start automation
scheduler.start();

// Publish manually
const content = {
  title: 'HypeAI Update',
  content: 'AI prediction accuracy: 87%! #HypeAI',
  hashtags: ['#HypeAI', '#AI']
};

await publisher.publishToAll(content);

// Check today's schedule
const todaySchedule = calendar.getTodaySchedule();
console.log(todaySchedule);
```

## Cron Job Setup

### Linux/Mac (crontab)

```bash
# Edit crontab
crontab -e

# Add these lines:

# Start scheduler on reboot
@reboot cd /path/to/Crypto/src/automation && node content-scheduler.js start >> logs/cron.log 2>&1

# Daily reminder at 8 AM
0 8 * * * cd /path/to/Crypto/src/automation && node calendar-manager.js remind

# Weekly analytics report (Mondays at 9 AM)
0 9 * * 1 cd /path/to/Crypto/src/automation && node calendar-manager.js analytics
```

### Windows (Task Scheduler)

1. Open Task Scheduler
2. Create Basic Task
3. Trigger: Daily at 8:00 AM
4. Action: Start a program
   - Program: `node`
   - Arguments: `C:\path\to\content-scheduler.js start`
   - Start in: `C:\path\to\automation\`

### PM2 (Production)

```bash
# Install PM2
npm install -g pm2

# Start with PM2
pm2 start content-scheduler.js --name hypeai-automation
pm2 start calendar-manager.js --name hypeai-calendar --cron "0 8 * * *"

# Save configuration
pm2 save

# Setup startup script
pm2 startup
```

## Configuration

Edit `config.json` to customize:

```json
{
  "scheduling": {
    "postingTimes": ["09:00", "14:00", "20:00"],
    "timezone": "UTC"
  },
  "platforms": {
    "twitter": { "enabled": true },
    "telegram": { "enabled": true },
    "discord": { "enabled": true }
  },
  "queue": {
    "maxRetries": 3,
    "retryDelay": 300000
  }
}
```

## Content Sources

The system reads content from:

1. **Tweets**: `docs/content/tweets.md`
2. **90-Day Calendar**: `docs/marketing/social-media-calendar-90days.md`
3. **Announcements**: `docs/content/announcements.md`

### Content Format

```markdown
### Tweet 1 - Title Here
\`\`\`
Your tweet content here with #hashtags
\`\`\`
```

## API Rate Limits

| Platform | Limit | Window |
|----------|-------|--------|
| Twitter  | 50 posts | 15 minutes |
| Telegram | 30 posts | 1 minute |
| Discord  | 5 posts | 5 seconds |

## Troubleshooting

### Posts Not Publishing

1. Check API credentials in `.env`
2. Verify rate limits not exceeded
3. Check queue status: `node content-scheduler.js status`
4. Review logs in `logs/automation.log`

### Email Notifications Not Working

1. Enable "Less secure app access" for Gmail
2. Use App Password instead of regular password
3. Check SMTP settings in config

### Admin Panel Not Loading

1. Ensure HTTP server is running
2. Check browser console for errors
3. Verify admin-panel.html exists

## Architecture

```
src/automation/
├── content-scheduler.js    # Main scheduler (cron-based)
├── multi-publisher.js       # Multi-platform posting
├── calendar-manager.js      # 90-day calendar tracking
├── admin-panel.html         # Web UI
├── config.json              # Configuration
├── queue.json               # Post queue (auto-generated)
├── analytics.json           # Analytics data (auto-generated)
└── README.md               # This file
```

## Best Practices

1. **Test First**: Always test with `multi-publisher.js test` before going live
2. **Monitor Logs**: Check logs regularly for errors
3. **Backup Queue**: `queue.json` contains scheduled posts - back it up
4. **Review Analytics**: Use analytics to optimize posting times
5. **Update Content**: Refresh content files weekly
6. **Rate Limit Awareness**: Don't manually post while automation is running

## Security

- Never commit `.env` file to Git
- Use environment variables for API keys
- Enable IP whitelist in production
- Set admin password in config
- Rotate API keys regularly

## Performance

- **Memory Usage**: ~50-100 MB
- **CPU Usage**: <1% (idle), ~5% (posting)
- **Disk Space**: <10 MB (excluding logs)
- **Network**: Minimal (only during posts)

## Support

For issues or questions:
- Check logs: `tail -f logs/automation.log`
- Review queue: `node content-scheduler.js status`
- Test platforms: `node multi-publisher.js test`

## Future Enhancements

- [ ] Image generation integration
- [ ] Sentiment analysis
- [ ] A/B testing
- [ ] Advanced analytics (click tracking)
- [ ] Video posting support
- [ ] Multi-account management
- [ ] AI-powered content optimization

## License

Part of HypeAI project - Where Hype Meets Intelligence

---

**Last Updated**: October 9, 2025
**Version**: 1.0.0
**Status**: Production Ready
