# HypeAI Bots - Quick Start Guide

Get your community management bots up and running in 5 minutes!

## Prerequisites

- Node.js 18+ installed
- Discord, Telegram, and/or Twitter accounts
- Bot tokens and API keys (see setup sections below)

## Installation

```bash
# Navigate to bots directory
cd src/bots

# Install dependencies
npm install
```

## Configuration

### Step 1: Set Up Environment Variables

```bash
# Copy example file
cp .env.example .env

# Edit .env with your credentials
nano .env  # or use your preferred editor
```

### Step 2: Configure bots-config.json

Edit `bots-config.json` and update:
- Contract address
- Partnership email
- All links to your actual resources

## Getting Bot Tokens

### Discord Bot

1. Go to https://discord.com/developers/applications
2. Click "New Application"
3. Name it "HypeAI Bot"
4. Go to "Bot" tab → Click "Add Bot"
5. Copy the token → Add to `.env` as `DISCORD_TOKEN`
6. Enable these intents:
   - Server Members Intent
   - Message Content Intent
   - Presence Intent
7. Go to OAuth2 → URL Generator
8. Select scopes: `bot`, `applications.commands`
9. Select permissions: `Administrator` (or customize)
10. Copy URL and invite bot to your server

### Telegram Bot

1. Open Telegram and message [@BotFather](https://t.me/botfather)
2. Send `/newbot`
3. Follow prompts to name your bot
4. Copy the token → Add to `.env` as `TELEGRAM_TOKEN`
5. Send `/setdescription` to set bot description
6. Send `/setabouttext` for about text
7. Send `/setuserpic` to upload profile picture

### Twitter Bot

1. Go to https://developer.twitter.com/en/portal/dashboard
2. Create a new Project and App
3. Go to "Keys and Tokens" tab
4. Generate API Key & Secret → Add to `.env`
5. Generate Access Token & Secret → Add to `.env`
6. Go to Settings → User authentication set up
7. Enable OAuth 1.0a with Read and Write permissions
8. Get your User ID from https://tweeterid.com/ → Add to `.env`

## Running the Bots

### All Bots at Once

```bash
npm start
```

### Individual Bots

```bash
# Discord only
npm run start:discord

# Telegram only
npm run start:telegram

# Twitter only
npm run start:twitter
```

### Development Mode (Auto-reload)

```bash
npm run dev
```

## Testing

### Discord Bot Tests

1. Join your Discord server
2. Try commands:
   - `/price` - Check if price data shows
   - `/help` - View all commands
   - `!price` - Test prefix commands
3. Test auto-responses:
   - Type "how to buy" → Should get auto-response
4. Test moderation:
   - Try posting 6+ messages quickly → Should get spam warning

### Telegram Bot Tests

1. Search for your bot in Telegram
2. Send `/start` → Should receive welcome message
3. Try `/price`, `/apy`, `/stats`
4. Set a price alert: `/setalert 0.005`
5. View alerts: `/alerts`

### Twitter Bot Tests

1. Mention your account from another Twitter account
2. Check console logs for mention detection
3. View pending replies:
   ```javascript
   const manager = new BotManager();
   await manager.start({ enableDiscord: false, enableTelegram: false });
   console.log(manager.getTwitterPendingReplies());
   ```

## Production Deployment

### Using PM2 (Recommended)

```bash
# Install PM2
npm install -g pm2

# Start bots with PM2
pm2 start index.js --name hypeai-bots

# Monitor
pm2 monit

# View logs
pm2 logs hypeai-bots

# Stop
pm2 stop hypeai-bots

# Restart
pm2 restart hypeai-bots

# Auto-start on system reboot
pm2 startup
pm2 save
```

### Using Docker

```bash
# Build image
docker build -t hypeai-bots .

# Run container
docker run -d \
  --name hypeai-bots \
  --restart unless-stopped \
  -v $(pwd)/.env:/app/.env \
  -v $(pwd)/bots-config.json:/app/bots-config.json \
  -v $(pwd)/data:/app/data \
  hypeai-bots

# View logs
docker logs -f hypeai-bots

# Stop
docker stop hypeai-bots
```

### Using systemd (Linux)

```bash
# Create service file
sudo nano /etc/systemd/system/hypeai-bots.service
```

```ini
[Unit]
Description=HypeAI Community Bots
After=network.target

[Service]
Type=simple
User=your_user
WorkingDirectory=/path/to/src/bots
ExecStart=/usr/bin/node index.js
Restart=always
RestartSec=10
StandardOutput=syslog
StandardError=syslog
SyslogIdentifier=hypeai-bots

[Install]
WantedBy=multi-user.target
```

```bash
# Enable and start service
sudo systemctl enable hypeai-bots
sudo systemctl start hypeai-bots

# Check status
sudo systemctl status hypeai-bots

# View logs
sudo journalctl -u hypeai-bots -f
```

## Twitter Human Review Workflow

### Viewing Pending Replies

Create a review script `review-twitter.js`:

```javascript
const BotManager = require('./index');

async function reviewPending() {
  const manager = new BotManager();

  // Start only Twitter bot
  await manager.start({
    enableDiscord: false,
    enableTelegram: false,
    enableTwitter: true
  });

  // Get pending replies
  const pending = manager.getTwitterPendingReplies();

  console.log(`\n📬 ${pending.length} Pending Replies:\n`);

  pending.forEach((reply, index) => {
    console.log(`\n[${index + 1}] Tweet ID: ${reply.id}`);
    console.log(`    Author: @${reply.author}`);
    console.log(`    Original: ${reply.text}`);
    console.log(`    Suggested Reply: ${reply.generatedReply}`);
    console.log(`    Sentiment: ${reply.sentiment}`);
  });
}

reviewPending();
```

### Approving/Rejecting from Code

```javascript
// Approve a reply
await manager.approveTwitterReply(tweetId);

// Reject a reply
await manager.rejectTwitterReply(tweetId, 'Not appropriate tone');

// Send custom reply
await manager.customTwitterReply(tweetId, 'Thanks for reaching out! ...');
```

### Web Dashboard (Optional)

For easier management, consider building a simple Express dashboard:

```javascript
const express = require('express');
const app = express();
const manager = new BotManager();

app.get('/pending', (req, res) => {
  const pending = manager.getTwitterPendingReplies();
  res.json(pending);
});

app.post('/approve/:id', async (req, res) => {
  await manager.approveTwitterReply(req.params.id);
  res.json({ success: true });
});

app.listen(3000, () => console.log('Review dashboard at http://localhost:3000'));
```

## Monitoring & Maintenance

### Check Bot Status

```bash
# If using PM2
pm2 status

# If using Docker
docker ps

# If using systemd
sudo systemctl status hypeai-bots
```

### View Logs

```bash
# PM2
pm2 logs hypeai-bots --lines 100

# Docker
docker logs hypeai-bots --tail 100 -f

# systemd
sudo journalctl -u hypeai-bots -n 100 -f
```

### Backup Bot Data

```bash
# Backup Twitter bot data
tar -czf twitter-data-backup-$(date +%Y%m%d).tar.gz data/

# Restore
tar -xzf twitter-data-backup-20250109.tar.gz
```

### Update Configuration

```bash
# Edit config
nano bots-config.json

# Restart bots to apply changes
pm2 restart hypeai-bots  # PM2
# or
docker restart hypeai-bots  # Docker
# or
sudo systemctl restart hypeai-bots  # systemd
```

## Common Issues

### Discord Bot Not Responding

**Problem**: Bot is online but doesn't respond to commands

**Solutions**:
1. Check Message Content Intent is enabled
2. Verify bot has permission to read/send messages
3. Check bot role is above other roles
4. Try re-inviting bot with new OAuth URL

### Telegram Bot "Conflict" Error

**Problem**: `Error: 409 Conflict: terminated by other getUpdates`

**Solution**: Only one instance can poll at a time
```bash
# Stop other instances
pm2 delete hypeai-bots
# Wait 30 seconds
# Restart
npm start
```

### Twitter Rate Limits

**Problem**: Bot stops responding or gets errors

**Solution**: Check rate limit tracking
```javascript
// Rate limits are automatic, but you can monitor:
// - 15 mention checks per 15 minutes
// - 180 searches per 15 minutes
// - 50 tweets per day
```

### "Module not found" Errors

**Problem**: `Cannot find module 'discord.js'`

**Solution**:
```bash
# Install dependencies
cd src/bots
npm install

# If issues persist, delete and reinstall
rm -rf node_modules package-lock.json
npm install
```

## Security Checklist

- [ ] Never commit `.env` file to git
- [ ] Keep bot tokens secret
- [ ] Enable 2FA on all accounts
- [ ] Regularly update dependencies (`npm update`)
- [ ] Monitor bot logs for suspicious activity
- [ ] Use environment variables for all secrets
- [ ] Enable human review for Twitter auto-replies
- [ ] Whitelist only trusted domains
- [ ] Set up rate limiting
- [ ] Regular security audits

## Performance Tips

1. **Rate Limiting**: Already implemented - prevents API abuse
2. **Caching**: Cache price data for 1 minute to reduce API calls
3. **Database**: For scaling, replace JSON files with proper database
4. **Load Balancing**: Run multiple instances behind a load balancer
5. **Monitoring**: Use services like Datadog, New Relic, or Sentry

## Getting Help

- Check logs first: `pm2 logs` or `docker logs`
- Review error messages carefully
- Test with minimal config first
- Join HypeAI Discord for support
- Open GitHub issue with logs and config (remove tokens!)

## Next Steps

1. Customize FAQ responses for your community
2. Add more commands based on user requests
3. Integrate with your price API
4. Set up monitoring and alerts
5. Build a web dashboard for Twitter review
6. Add more moderation rules
7. Create custom emoji reactions
8. Implement advanced analytics

---

**Need Help?** Join our Discord or open an issue on GitHub!

**Found a Bug?** Please report it so we can fix it!

**Want to Contribute?** PRs are welcome!
