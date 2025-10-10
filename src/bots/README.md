# HypeAI Community Management Bots

Automated community management tools for Discord, Telegram, and Twitter with built-in moderation, rate limiting, and human oversight.

## Features

### Discord Bot
- 🎉 Welcome messages for new members
- 🎭 Auto-role assignment
- ❓ FAQ auto-responses
- 💰 Price/stats commands (`!price`, `!holders`, `!apy`, `!stats`)
- 🧮 Staking rewards calculator
- 🛡️ Moderation features (anti-spam, anti-scam)
- 📊 Daily stats updates
- ⚡ Slash commands support

### Telegram Bot
- 👋 Welcome messages
- 🔔 Custom price alerts
- 📊 Daily stats updates
- ❓ FAQ auto-responses
- 🔗 Resource links
- 📈 Real-time market data

### Twitter Bot
- 📨 Mention monitoring
- 💬 Auto-reply suggestions (with human review)
- 📊 Sentiment tracking
- 🔥 Viral post alerts
- 🤝 Partnership opportunity detection
- 🎯 Keyword monitoring

## Installation

### Prerequisites

```bash
npm install discord.js node-telegram-bot-api twitter-api-v2
```

### Configuration

1. Copy `bots-config.json` and update with your credentials:
   - Discord bot token
   - Telegram bot token
   - Twitter API credentials
   - Contract address
   - Links to your resources

2. Set up bot tokens:

#### Discord Bot Setup
1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Create new application
3. Go to "Bot" section and create bot
4. Copy bot token to config
5. Enable these intents:
   - Server Members Intent
   - Message Content Intent
6. Invite bot with permissions: `268954832` (Administrator)

#### Telegram Bot Setup
1. Message [@BotFather](https://t.me/botfather) on Telegram
2. Use `/newbot` command
3. Follow instructions
4. Copy bot token to config

#### Twitter Bot Setup
1. Go to [Twitter Developer Portal](https://developer.twitter.com/en/portal/dashboard)
2. Create new project and app
3. Get API keys and tokens
4. Set up OAuth 1.0a user context
5. Get your Twitter user ID

## Usage

### Starting All Bots

```javascript
const config = require('./bots-config.json');
const DiscordBot = require('./discord-bot');
const TelegramBot = require('./telegram-bot');
const TwitterBot = require('./twitter-engagement');

// Initialize bots
const discordBot = new DiscordBot(config);
const telegramBot = new TelegramBot(config);
const twitterBot = new TwitterBot(config);

// Start all bots
async function startBots() {
  try {
    await discordBot.start();
    await telegramBot.start();
    await twitterBot.start();

    console.log('✅ All bots started successfully!');
  } catch (error) {
    console.error('Error starting bots:', error);
  }
}

startBots();
```

### Starting Individual Bots

#### Discord Only
```javascript
const DiscordBot = require('./discord-bot');
const config = require('./bots-config.json');

const bot = new DiscordBot(config);
bot.start();
```

#### Telegram Only
```javascript
const TelegramBot = require('./telegram-bot');
const config = require('./bots-config.json');

const bot = new TelegramBot(config);
bot.start();
```

#### Twitter Only
```javascript
const TwitterBot = require('./twitter-engagement');
const config = require('./bots-config.json');

const bot = new TwitterBot(config);
bot.start();
```

## Discord Commands

### Slash Commands
- `/price` - Current token price and market stats
- `/holders` - Number of token holders
- `/apy` - Staking APY rates
- `/stats` - Comprehensive ecosystem statistics
- `/rewards <amount> <duration>` - Calculate staking rewards
- `/help` - Show all commands

### Prefix Commands
All slash commands also work with `!` prefix:
- `!price`, `!holders`, `!apy`, `!stats`, `!help`
- `!rewards 10000 90` - Calculate rewards for 10,000 tokens over 90 days

## Telegram Commands

- `/start` - Welcome message and bot introduction
- `/help` - Show all available commands
- `/price` - Current token price
- `/holders` - Token holder statistics
- `/apy` - Staking APY rates
- `/stats` - Ecosystem statistics
- `/setalert <price>` - Set price alert (e.g., `/setalert 0.005`)
- `/alerts` - View active alerts
- `/removealert <id>` - Remove price alert
- `/faq` - Frequently asked questions
- `/resources` - Useful links
- `/notify on|off` - Toggle daily updates

## Twitter Features

### Mention Monitoring
The bot monitors all mentions and:
- Analyzes sentiment
- Generates reply suggestions
- Queues replies for human review
- Tracks engagement metrics

### Human Review System

#### Approving Replies
```javascript
// Get pending replies
const pending = twitterBot.getPendingReplies();
console.log(pending);

// Approve a reply
await twitterBot.approveReply(tweetId);

// Reject a reply
await twitterBot.rejectReply(tweetId, 'Not appropriate');

// Send custom reply
await twitterBot.customReply(tweetId, 'Custom message here');
```

#### Sentiment Analysis
```javascript
// Get sentiment summary
const sentiment = twitterBot.getSentimentSummary();
console.log(sentiment);
// { positive: 45, neutral: 30, negative: 5, total: 80 }
```

#### Viral Posts
```javascript
// Get viral posts mentioning HypeAI
const viralPosts = twitterBot.getViralPosts();
console.log(viralPosts);
```

#### Partnership Opportunities
```javascript
// Get detected partnership opportunities
const opportunities = twitterBot.getPartnershipOpportunities();
console.log(opportunities);
```

## Moderation Features

### Anti-Spam (Discord)
- Detects rapid message posting
- Automatically deletes spam
- Warns users
- Logs to moderation channel

### Anti-Scam (Discord)
- Pattern matching for common scams
- Link filtering (whitelist-based)
- Automatic message deletion
- Moderator notifications

### Rate Limiting (All Bots)
- Per-user rate limiting
- Prevents API abuse
- Configurable limits

## Data Collection & Storage

### Twitter Bot Data
All data is saved to `/src/bots/data/`:
- `pending-replies.json` - Queued Twitter replies
- `sentiment.json` - Sentiment analysis data
- `viral-posts.json` - Viral content tracking
- `partnerships.json` - Partnership opportunities

Data is automatically saved every 5 minutes and cleaned up after 30 days.

## Customization

### Adding Custom FAQ Responses

#### Discord
Edit `discord-bot.js`, find `handleAutoResponse()`:
```javascript
const faqResponses = {
  'your keyword': {
    title: 'Your Title',
    description: 'Your response...'
  }
};
```

#### Telegram
Edit `telegram-bot.js`, find `handleMessage()`:
```javascript
if (text.includes('your keyword')) {
  await this.sendMessage(chatId, 'Your response...');
}
```

### Modifying Reply Generation (Twitter)
Edit `twitter-engagement.js`, find `generateReply()`:
```javascript
if (textLower.includes('your keyword')) {
  return 'Your custom reply...';
}
```

### Adding New Commands

#### Discord Slash Command
```javascript
// 1. Add to registerCommands()
{
  name: 'newcommand',
  description: 'Description of command',
  options: [/* command options */]
}

// 2. Add handler in onInteraction()
case 'newcommand':
  await this.handleNewCommand(interaction);
  break;

// 3. Implement handler
async handleNewCommand(interaction) {
  // Your logic here
}
```

#### Telegram Command
```javascript
// 1. Add handler in setupHandlers()
this.bot.onText(/\/newcommand/, (msg) => this.handleNewCommand(msg));

// 2. Implement handler
async handleNewCommand(msg) {
  const chatId = msg.chat.id;
  await this.sendMessage(chatId, 'Response...');
}
```

## API Integration

### Connecting to Price Oracle
Replace mock implementations in all bot files:

```javascript
async fetchPriceData() {
  // Replace with your actual API
  const response = await fetch('https://api.yourservice.com/price');
  const data = await response.json();

  return {
    priceUSD: data.price,
    change24h: data.change,
    marketCap: data.marketCap,
    // ...
  };
}
```

### Blockchain Integration
```javascript
const { ethers } = require('ethers');

async fetchHoldersData() {
  const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
  const contract = new ethers.Contract(ADDRESS, ABI, provider);

  // Your contract calls
  const holders = await contract.totalHolders();

  return {
    total: holders.toString(),
    // ...
  };
}
```

## Production Deployment

### Using PM2 (Recommended)

```bash
# Install PM2
npm install -g pm2

# Create ecosystem file
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [
    {
      name: 'hypeai-discord-bot',
      script: './discord-bot-runner.js',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G'
    },
    {
      name: 'hypeai-telegram-bot',
      script: './telegram-bot-runner.js',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G'
    },
    {
      name: 'hypeai-twitter-bot',
      script: './twitter-bot-runner.js',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G'
    }
  ]
};
EOF

# Start all bots
pm2 start ecosystem.config.js

# Monitor
pm2 monit

# View logs
pm2 logs

# Save configuration
pm2 save

# Auto-start on system boot
pm2 startup
```

### Docker Deployment

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY src/bots/ ./

CMD ["node", "index.js"]
```

```bash
# Build
docker build -t hypeai-bots .

# Run
docker run -d \
  --name hypeai-bots \
  --restart unless-stopped \
  -v $(pwd)/bots-config.json:/app/bots-config.json \
  -v $(pwd)/data:/app/data \
  hypeai-bots
```

## Security Best Practices

1. **Never commit tokens/keys** - Use environment variables
2. **Enable rate limiting** - Prevent API abuse
3. **Implement human review** - For auto-replies
4. **Whitelist domains** - For link filtering
5. **Monitor logs** - Regular security audits
6. **Update dependencies** - Keep packages up to date
7. **Backup data** - Regular backups of bot data

## Environment Variables

Create `.env` file:
```bash
DISCORD_TOKEN=your_discord_token
TELEGRAM_TOKEN=your_telegram_token
TWITTER_API_KEY=your_twitter_key
TWITTER_API_SECRET=your_twitter_secret
TWITTER_ACCESS_TOKEN=your_access_token
TWITTER_ACCESS_SECRET=your_access_secret
CONTRACT_ADDRESS=your_contract_address
```

Load in code:
```javascript
require('dotenv').config();

const config = {
  discord: {
    token: process.env.DISCORD_TOKEN
  },
  // ...
};
```

## Monitoring & Analytics

### Discord Analytics
- Track command usage
- Monitor member growth
- Measure engagement rates

### Telegram Analytics
- Alert effectiveness
- User retention
- Command popularity

### Twitter Analytics
- Sentiment trends
- Viral content performance
- Partnership conversion

## Troubleshooting

### Discord Bot Not Responding
1. Check bot token is correct
2. Verify bot has proper permissions
3. Ensure required intents are enabled
4. Check bot is online in server

### Telegram Bot Not Working
1. Verify bot token
2. Check bot is not blocked
3. Ensure polling is enabled
4. Review Telegram API limits

### Twitter Bot Issues
1. Verify all API credentials
2. Check Twitter API access level
3. Monitor rate limits
4. Review pending replies queue

## Support

For issues or questions:
- Discord: [Join our server](https://discord.gg/hypeai)
- Telegram: [@hypeai_support](https://t.me/hypeai_support)
- Email: support@hypeai.io

## License

MIT License - See LICENSE file for details

---

**Built with ❤️ for the HypeAI Community**
