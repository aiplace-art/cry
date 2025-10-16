# Growth Hacker Bot - Setup & Quick Start

## Overview

The Growth Hacker Bot is an **ethical growth automation tool** for crypto projects that helps you:
- Find genuine partnership opportunities
- Discover AMA hosting communities
- Identify influencers for collaboration
- Track competitor strategies (legally)
- Manage outreach with human approval

**Core Principle:** 100% ethical, consent-based growth through authentic relationships.

---

## Prerequisites

### Required Dependencies

```bash
npm install node-telegram-bot-api axios node-cron
```

### Optional Dependencies (for advanced features)

```bash
npm install dotenv
```

---

## Quick Start

### 1. Get Your Telegram Bot Token

1. Open Telegram and search for [@BotFather](https://t.me/botfather)
2. Send `/newbot` and follow the prompts
3. Copy your bot token (looks like: `123456789:ABCdefGHIjklMNOpqrsTUVwxyz`)
4. Send `/setcommands` to BotFather and paste:

```
start - Start the bot and see welcome message
help - Show all available commands
find_partners - Find partnership opportunities
find_amas - Discover AMA opportunities
find_influencers - Find collaboration opportunities
analyze_competitors - Legal competitor analysis
pending_approvals - Review pending outreach
outreach_templates - View message templates
my_partnerships - View active partnerships
analytics - View growth metrics
growth_report - Generate detailed report
```

### 2. Get Your Telegram User ID

1. Open Telegram and search for [@userinfobot](https://t.me/userinfobot)
2. Start a chat - it will reply with your User ID
3. Save this ID (you'll need it for admin access)

### 3. Configure Environment Variables

Create a `.env` file in the project root:

```bash
# Telegram Bot Configuration
GROWTH_BOT_TOKEN=your-telegram-bot-token-here
ADMIN_TELEGRAM_ID=your-telegram-user-id-here

# Project Information
PROJECT_NAME=Your Crypto Project
PROJECT_DESCRIPTION=Your project elevator pitch
PROJECT_WEBSITE=https://yourproject.com
```

### 4. Run the Bot

```bash
# Using Node.js directly
node /Users/ai.place/Crypto/src/bots/growth-hacker-bot.js

# Or using npm scripts (add to package.json):
npm run growth-bot
```

### 5. Start Using the Bot

1. Open Telegram and find your bot
2. Send `/start` to begin
3. Use `/find_partners` to discover your first opportunities
4. Review and approve outreach with `/pending_approvals`

---

## Installation Methods

### Method 1: Standalone Installation

```bash
# Create project directory
mkdir growth-hacker-bot
cd growth-hacker-bot

# Initialize npm project
npm init -y

# Install dependencies
npm install node-telegram-bot-api axios node-cron dotenv

# Copy the bot file
cp /Users/ai.place/Crypto/src/bots/growth-hacker-bot.js ./

# Create .env file
echo "GROWTH_BOT_TOKEN=your-token-here" > .env
echo "ADMIN_TELEGRAM_ID=your-id-here" >> .env

# Run the bot
node growth-hacker-bot.js
```

### Method 2: Integration into Existing Project

```javascript
// In your main bot file or server
import GrowthHackerBot from './bots/growth-hacker-bot.js';

const config = {
  telegramToken: process.env.GROWTH_BOT_TOKEN,
  adminId: process.env.ADMIN_TELEGRAM_ID,
  projectName: 'Your Project',
  projectDescription: 'Your description',
  projectWebsite: 'https://yourproject.com'
};

const growthBot = new GrowthHackerBot(config);
```

---

## Configuration Options

### Basic Configuration

```javascript
const config = {
  // Required
  telegramToken: 'your-bot-token',        // From BotFather
  adminId: 'your-telegram-id',            // Your Telegram user ID

  // Recommended
  projectName: 'DeFiMax Protocol',        // Your project name
  projectDescription: 'AI-powered DeFi',  // Short description
  projectWebsite: 'https://defimax.io',   // Your website

  // Optional (advanced)
  autoScan: true,                         // Auto-scan for opportunities daily
  scanTime: '09:00',                      // Time for auto-scan (24h format)
  minMatchScore: 70,                      // Minimum match score for opportunities
  maxOpportunities: 50                    // Max opportunities to store
};
```

---

## Usage Examples

### Finding Partnership Opportunities

```bash
# In Telegram, send to your bot:
/find_partners
```

**What happens:**
1. Bot scans for similar crypto projects
2. Calculates match scores based on:
   - Audience overlap
   - Complementary features
   - Category alignment
   - Growth stage
3. Presents top opportunities with details
4. Provides contact information

### Customizing Outreach Templates

```bash
# View available templates
/outreach_templates

# Customize a specific template
/customize_template partnership
```

**Template variables you can customize:**
- `{recipientName}` - Their name
- `{theirProject}` - Their project name
- `{specificThing}` - Something specific you admire
- `{ourValue}` - Your unique value proposition
- `{collaboration1}`, `{collaboration2}`, `{collaboration3}` - Specific ideas

### Tracking Analytics

```bash
# Quick metrics
/analytics

# Detailed report
/growth_report
```

**Metrics tracked:**
- Opportunities found
- Outreach sent
- Response rate
- Conversion rate
- Active partnerships
- Growth trends

---

## Features in Detail

### 1. Partnership Discovery

**How it works:**
- Scans crypto communities and projects
- Analyzes compatibility factors
- Calculates match scores
- Provides contact information

**Best practices:**
- Focus on high match scores (80%+)
- Research before reaching out
- Look for complementary, not competing, projects
- Prioritize similar community sizes

### 2. AMA Opportunities

**How it works:**
- Identifies communities hosting AMAs
- Checks frequency and format
- Provides application process
- Tracks requirements

**Best practices:**
- Target communities aligned with your niche
- Prepare thoroughly before applying
- Customize pitch for each community
- Offer exclusive value

### 3. Influencer Collaboration

**How it works:**
- Discovers crypto influencers
- Analyzes engagement metrics
- Identifies collaboration potential
- Provides contact methods

**Best practices:**
- Prioritize engagement over follower count
- Engage with their content first
- Propose value-first collaborations
- Build authentic relationships

### 4. Competitor Analysis

**How it works:**
- Monitors public strategies (legally)
- Tracks growth tactics
- Identifies patterns
- Suggests improvements

**Ethical guidelines:**
- Only use publicly available information
- Learn from patterns, don't copy
- Focus on differentiation
- Respect privacy and ToS

### 5. Outreach Management

**How it works:**
- Provides customizable templates
- Requires human approval for all messages
- Tracks sent outreach
- Schedules follow-ups

**Key features:**
- Personalization variables
- Preview before sending
- Approval workflow
- Analytics tracking

---

## Directory Structure

After setup, your bot creates this structure:

```
your-project/
├── src/
│   └── bots/
│       └── growth-hacker-bot.js
├── data/
│   └── growth-hacker/
│       ├── partnerships.json
│       ├── opportunities.json
│       ├── analytics.json
│       └── templates.json
├── docs/
│   └── growth-bot-guide.md
├── examples/
│   └── growth-hacker-example.js
├── tests/
│   └── growth-hacker-bot.test.js
└── .env
```

---

## Troubleshooting

### Bot doesn't respond

**Check:**
1. Bot token is correct in `.env`
2. Bot is running (`node growth-hacker-bot.js`)
3. You've sent `/start` to initialize

### "Unauthorized" error

**Fix:**
1. Verify bot token with BotFather
2. Check for extra spaces in `.env`
3. Restart the bot after changing `.env`

### No opportunities found

**Reasons:**
1. Opportunity discovery is randomized (by design)
2. Try again later or adjust match score threshold
3. Check that bot has internet access

### Commands not working

**Fix:**
1. Register commands with BotFather using `/setcommands`
2. Restart your Telegram app
3. Try sending `/help` first

---

## Security Best Practices

### Never commit sensitive data

```bash
# Add to .gitignore
.env
data/growth-hacker/*.json
*.log
```

### Secure your bot token

- Never share your bot token publicly
- Use environment variables, not hardcoded values
- Rotate token if exposed (via BotFather)

### Admin-only access

The bot automatically restricts admin commands to the configured admin ID.

---

## Scaling & Production

### For Production Deployment

1. **Use PM2 for process management:**

```bash
npm install -g pm2
pm2 start growth-hacker-bot.js --name growth-bot
pm2 save
pm2 startup
```

2. **Add logging:**

```javascript
// Add to bot initialization
const fs = require('fs');
const logStream = fs.createWriteStream('growth-bot.log', { flags: 'a' });

console.log = (...args) => {
  logStream.write(new Date().toISOString() + ' ' + args.join(' ') + '\n');
};
```

3. **Use a database:**

Replace JSON files with PostgreSQL/MongoDB for better scaling:

```javascript
// Instead of:
await this.saveJSON(this.partnershipsFile, this.partnerships);

// Use:
await db.partnerships.upsert(this.partnerships);
```

4. **Add monitoring:**

```javascript
// Track uptime and errors
const metrics = {
  uptime: process.uptime(),
  errors: errorCount,
  activeUsers: userCount
};
```

---

## Customization

### Adding Custom Opportunity Sources

```javascript
// In growth-hacker-bot.js, add to scanForPartners()
async scanForPartners() {
  const opportunities = [];

  // Add your custom source
  const customOpps = await this.scanCustomSource();
  opportunities.push(...customOpps);

  return opportunities;
}

async scanCustomSource() {
  // Your custom discovery logic
  const response = await axios.get('https://your-api.com/projects');
  return response.data.map(project => ({
    id: `custom_${project.id}`,
    name: project.name,
    category: project.category,
    matchScore: this.calculateMatch(project),
    // ... other fields
  }));
}
```

### Adding Custom Commands

```javascript
// In setupCommands()
this.bot.onText(/\/custom_command/, (msg) => this.handleCustomCommand(msg));

async handleCustomCommand(msg) {
  const chatId = msg.chat.id;
  await this.bot.sendMessage(chatId, 'Custom command response!');
}
```

---

## Support & Resources

### Documentation
- **Full Guide:** `/Users/ai.place/Crypto/docs/growth-bot-guide.md`
- **Examples:** `/Users/ai.place/Crypto/examples/growth-hacker-example.js`
- **Tests:** `/Users/ai.place/Crypto/tests/growth-hacker-bot.test.js`

### Community
- GitHub Issues: Report bugs and request features
- Discord: Join community discussions
- Telegram: Bot support channel

### Updates
The bot is actively maintained with regular updates for:
- New opportunity sources
- Improved matching algorithms
- Additional features
- Bug fixes and optimizations

---

## FAQ

**Q: Is this bot for spamming?**
A: Absolutely not! The bot is designed for ethical, consent-based growth. All outreach requires human approval.

**Q: Can it auto-send messages?**
A: No. By design, all messages require manual approval to ensure quality and personalization.

**Q: What data does it store?**
A: Only locally stored data: opportunities, partnerships, analytics. No data is sent to external servers.

**Q: Is it free?**
A: Yes! The bot is open source. You only pay for Telegram Bot API usage (which is free for most use cases).

**Q: Can I use it for non-crypto projects?**
A: Yes! Just adjust the opportunity discovery logic for your niche.

---

## License & Credits

**License:** MIT

**Credits:**
- Built with ethical growth principles
- Inspired by successful crypto partnerships
- Community-driven development

**Contributing:**
Pull requests welcome! Please maintain the ethical standards and add tests for new features.

---

## Quick Command Reference

| Command | Description |
|---------|-------------|
| `/start` | Initialize bot and see welcome |
| `/help` | Show all commands |
| `/find_partners` | Discover partnership opportunities |
| `/find_amas` | Find AMA hosting communities |
| `/find_influencers` | Identify collaboration opportunities |
| `/analyze_competitors` | Legal competitor analysis |
| `/pending_approvals` | Review outreach waiting approval |
| `/outreach_templates` | View message templates |
| `/my_partnerships` | View active partnerships |
| `/analytics` | Quick metrics dashboard |
| `/growth_report` | Detailed performance report |

---

**Ready to grow ethically? Start your bot and send `/start`! 🚀**
