# HypeAI Bot Deployment - Quick Reference

## One-Command Deployment

```bash
# From project root
./scripts/deploy-bots.sh
```

## File Structure

```
├── src/bots/
│   ├── Dockerfile                    # Container image definition
│   ├── docker-compose.yml            # Multi-container orchestration
│   ├── pm2.ecosystem.config.js       # PM2 process management
│   ├── .env.example                  # Environment template
│   ├── PRODUCTION_SETUP.md           # Complete setup guide
│   ├── monitoring/
│   │   └── dashboard.html            # Real-time monitoring UI
│   ├── discord-bot.js                # Discord bot implementation
│   ├── telegram-bot.js               # Telegram bot implementation
│   └── twitter-engagement.js         # Twitter bot implementation
│
└── scripts/
    ├── deploy-bots.sh                # Main deployment script
    ├── start-all.sh                  # Start all bots
    ├── stop-all.sh                   # Stop all bots
    └── health-check.sh               # Status check script
```

## Quick Commands

### Initial Setup

```bash
# 1. Copy environment template
cp src/bots/.env.example .env

# 2. Edit .env with your tokens
nano .env

# 3. Deploy
./scripts/deploy-bots.sh
```

### Docker Commands

```bash
# Start all bots
cd src/bots && docker-compose up -d

# View logs (all)
docker-compose logs -f

# View logs (specific bot)
docker-compose logs -f discord-bot

# Check status
docker-compose ps

# Restart bot
docker-compose restart discord-bot

# Stop all
docker-compose down

# Rebuild and restart
docker-compose up -d --build
```

### PM2 Commands

```bash
# Start all bots
pm2 start src/bots/pm2.ecosystem.config.js

# Monitor
pm2 monit

# View logs
pm2 logs

# Restart specific bot
pm2 restart hypeai-discord-bot

# Stop all
pm2 stop all

# Delete all
pm2 delete all
```

### Management Scripts

```bash
# Start all bots (auto-detects Docker/PM2)
./scripts/start-all.sh

# Stop all bots
./scripts/stop-all.sh

# Health check
./scripts/health-check.sh
```

## Monitoring

### Dashboard
- **URL:** http://localhost:8080
- **Features:** Real-time status, metrics, uptime
- **Auto-refresh:** Every 10 seconds

### Health Check
```bash
./scripts/health-check.sh
```

**Output:**
- Docker container status
- PM2 process status
- Resource usage (CPU, Memory)
- Dashboard availability

## Environment Variables Required

### Discord
- `DISCORD_TOKEN` - Bot token from Discord Developer Portal
- `DISCORD_CLIENT_ID` - Application ID

### Telegram
- `TELEGRAM_TOKEN` - Bot token from @BotFather

### Twitter
- `TWITTER_API_KEY` - API key
- `TWITTER_API_SECRET` - API secret
- `TWITTER_ACCESS_TOKEN` - Access token
- `TWITTER_ACCESS_SECRET` - Access secret

## Deployment Options

### Option 1: Docker (Recommended)

**Pros:**
- Isolated environments
- Auto-restart on failure
- Production-ready
- Easy scaling
- Centralized logging

**Deploy:**
```bash
./scripts/deploy-bots.sh
# Select option 1
```

### Option 2: PM2

**Pros:**
- Lightweight
- Built-in monitoring
- Log rotation
- Fast restart

**Deploy:**
```bash
./scripts/deploy-bots.sh
# Select option 2
```

## Troubleshooting

### Bot won't start
```bash
# Check logs
docker-compose logs discord-bot
# or
pm2 logs hypeai-discord-bot

# Verify environment
docker-compose config
```

### Connection issues
```bash
# Test Discord token
curl -H "Authorization: Bot YOUR_TOKEN" \
  https://discord.com/api/v10/users/@me

# Check container networking
docker network ls
docker network inspect hypeai-network
```

### High memory usage
```bash
# Check resource usage
docker stats
# or
pm2 monit

# Restart bot
docker-compose restart discord-bot
# or
pm2 restart hypeai-discord-bot
```

## Production Checklist

- [ ] `.env` file created with valid tokens
- [ ] Docker/PM2 installed
- [ ] Bots deployed successfully
- [ ] Health check passes
- [ ] Monitoring dashboard accessible (http://localhost:8080)
- [ ] Logs rotating properly
- [ ] Auto-restart configured
- [ ] Resource limits set

## File Descriptions

### Infrastructure Files

**`Dockerfile`**
- Multi-stage Node.js 18 Alpine image
- Security: Non-root user
- Health checks included
- Optimized for production

**`docker-compose.yml`**
- 3 bot services (Discord, Telegram, Twitter)
- Nginx monitoring dashboard
- Shared network and volumes
- Auto-restart policy
- Resource limits
- Log rotation

**`pm2.ecosystem.config.js`**
- 3 PM2 processes
- Auto-restart on failure
- Memory limit: 500MB per bot
- Log rotation
- Graceful shutdown

### Deployment Scripts

**`deploy-bots.sh`**
- Interactive deployment
- Validates prerequisites
- Supports Docker and PM2
- Shows status after deployment

**`start-all.sh`**
- Auto-detects Docker/PM2
- Starts all bots
- Shows status

**`stop-all.sh`**
- Stops all running bots
- Works with both deployment methods

**`health-check.sh`**
- Container/process status
- Resource usage
- Dashboard availability
- Success rate calculation

### Monitoring

**`monitoring/dashboard.html`**
- Real-time bot status
- Message counts
- Error tracking
- Uptime statistics
- Resource monitoring (CPU, Memory)
- System overview
- Auto-refresh every 10 seconds

## Architecture

### Docker Architecture
```
┌─────────────────────────────────────┐
│         Docker Network              │
│                                     │
│  ┌──────────┐  ┌──────────┐       │
│  │ Discord  │  │ Telegram │       │
│  │   Bot    │  │   Bot    │       │
│  └──────────┘  └──────────┘       │
│                                     │
│  ┌──────────┐  ┌──────────┐       │
│  │ Twitter  │  │  Nginx   │       │
│  │   Bot    │  │ Monitor  │       │
│  └──────────┘  └──────────┘       │
│                                     │
│  Shared Volumes: logs, data        │
└─────────────────────────────────────┘
```

### PM2 Architecture
```
┌─────────────────────────────────────┐
│         PM2 Process Manager         │
│                                     │
│  Process 1: hypeai-discord-bot     │
│  Process 2: hypeai-telegram-bot    │
│  Process 3: hypeai-twitter-bot     │
│                                     │
│  Features:                          │
│  - Auto-restart on failure          │
│  - Log rotation                     │
│  - Memory monitoring                │
│  - Cluster mode support             │
└─────────────────────────────────────┘
```

## Next Steps

1. **Configure tokens** - Add real API keys to `.env`
2. **Deploy** - Run `./scripts/deploy-bots.sh`
3. **Monitor** - Check http://localhost:8080
4. **Test** - Send messages to bots
5. **Scale** - Adjust resources as needed

## Support

- **Full Guide:** `src/bots/PRODUCTION_SETUP.md`
- **Bot Features:** `src/bots/FEATURES.md`
- **Quick Start:** `src/bots/QUICK_START.md`

---

**Ready for Production!** ✅
