# HypeAI Content Automation - Quick Start

Get your automated content posting system running in 5 minutes!

## Prerequisites

- Node.js 14+ installed
- API credentials for Twitter, Telegram, and Discord
- Basic terminal/command line knowledge

## Step 1: Setup (2 minutes)

### Linux/Mac
```bash
cd src/automation
chmod +x setup.sh
./setup.sh
```

### Windows
```powershell
cd src\automation
.\setup.ps1
```

## Step 2: Configure API Keys (2 minutes)

Edit `.env` file:

```env
# Twitter (Get from: https://developer.twitter.com)
TWITTER_BEARER_TOKEN=your_token_here

# Telegram (Get from: @BotFather)
TELEGRAM_BOT_TOKEN=your_token_here
TELEGRAM_CHAT_ID=@your_channel

# Discord (Get from: Server Settings > Integrations)
DISCORD_WEBHOOK_URL=your_webhook_here
```

## Step 3: Start Automation (1 minute)

```bash
# Option A: Direct start
node content-scheduler.js start

# Option B: Production with PM2
npm run pm2:start
```

## Step 4: Open Admin Panel

```bash
# Start web server
python3 -m http.server 8080

# Open browser
http://localhost:8080/admin-panel.html
```

## That's It!

Your content automation is now running and will:
- Auto-post at 9 AM, 2 PM, 8 PM UTC
- Track all posts in the admin panel
- Retry failed posts automatically
- Send daily reminders

## Verify It's Working

```bash
# Check status
node content-scheduler.js status

# Test posting
node multi-publisher.js test

# View today's schedule
node calendar-manager.js today
```

## Common Commands

```bash
# View upcoming posts
node content-scheduler.js status

# Manual post
# (Use admin panel or create custom post)

# Retry failed
node content-scheduler.js retry

# Stop automation
pm2 stop hypeai-automation
```

## Need Help?

- Full docs: `README.md`
- Check logs: `tail -f logs/automation.log`
- Test config: `node multi-publisher.js status`

## Next Steps

1. Review your content in `docs/content/tweets.md`
2. Customize posting times in `config.json`
3. Set up email notifications
4. Monitor analytics in admin panel

---

**Ready to Automate Your Hype!** 🚀
