# HypeAI Analytics Dashboard & Tracking System

Comprehensive real-time analytics dashboard with automated reporting and competitor tracking for HypeAI token.

## Features

- **Real-time Dashboard**: Next.js 14 dashboard with live metrics
- **Blockchain Integration**: Token holder tracking via Ethers.js
- **Price Tracking**: CoinGecko/CoinMarketCap API integration
- **Social Media Metrics**: Twitter, Telegram, Discord analytics
- **Competitor Analysis**: Track and compare 5+ competitor tokens
- **Automated Reports**: Daily/weekly/monthly email reports with PDF
- **Milestone Notifications**: Slack alerts for key achievements
- **Influencer ROI**: Campaign performance tracking

## Quick Start

### 1. Install Dependencies

```bash
cd src/analytics
npm install
```

### 2. Configure Environment Variables

Create `.env.local` in the `dashboard/` directory:

```bash
# Blockchain
NEXT_PUBLIC_RPC_URL=https://eth-mainnet.g.alchemy.com/v2/YOUR_KEY
NEXT_PUBLIC_TOKEN_ADDRESS=0x...

# Price APIs
COINGECKO_API_KEY=your_key_here
COINGECKO_COIN_ID=hypeai
CMC_API_KEY=your_key_here

# Social Media
TWITTER_BEARER_TOKEN=your_token_here
TWITTER_HANDLE=@HypeAIToken
TELEGRAM_BOT_TOKEN=your_token_here
TELEGRAM_CHAT_ID=@HypeAICommunity
DISCORD_BOT_TOKEN=your_token_here
DISCORD_SERVER_ID=your_server_id

# Analytics
GA_TRACKING_ID=UA-XXXXXXXXX-X
GA_SERVICE_ACCOUNT=path/to/service-account.json

# Notifications
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/...
SLACK_BOT_TOKEN=xoxb-...

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password

# Dashboard
DASHBOARD_URL=http://localhost:3001
```

### 3. Run the Dashboard

```bash
cd dashboard
npm run dev
```

Dashboard will be available at `http://localhost:3001`

## Dashboard Features

### Real-time Metrics
- Token price with 24h change
- Market capitalization
- Trading volume
- Holder count
- Price charts (7/30/90 days)

### Social Analytics
- Twitter followers & engagement rate
- Telegram member count & activity
- Discord server statistics
- Combined reach metrics

### Competitor Tracking
- Side-by-side market cap comparison
- Trading volume analysis
- Social media reach comparison
- Price performance benchmarking

### Campaign Performance
- Influencer reach & engagement
- Conversion tracking
- ROI calculation per campaign
- Platform breakdown (Twitter, YouTube, Telegram)

## Automated Reporting

### Daily Reports

Run manually:
```bash
npm run report:daily
```

Or set up cron job:
```bash
# Run every day at 9 AM
0 9 * * * cd /path/to/src/analytics && npm run report:daily
```

### Weekly Reports

```bash
npm run report:weekly
```

### Monthly Reports

```bash
npm run report:monthly
```

## Competitor Tracking

Track competitors and generate comparison matrix:

```bash
npm run track:competitors
```

Data is saved to `src/analytics/data/competitors/`

### Configure Competitors

Edit `metrics-config.json`:

```json
{
  "competitors": [
    {
      "name": "CompetitorName",
      "symbol": "COMP",
      "address": "0x...",
      "coingecko_id": "competitor-id",
      "twitter": "@CompetitorTwitter",
      "telegram": "@CompetitorTG"
    }
  ]
}
```

## Milestone Notifications

Automatic Slack notifications when milestones are reached:

- Token holders: 100, 500, 1K, 5K, 10K
- Market cap: $100K, $500K, $1M, $5M, $10M
- Twitter followers: 1K, 5K, 10K, 50K, 100K
- Telegram members: 500, 1K, 5K, 10K, 25K

Configure in `metrics-config.json` under `milestones`.

## API Routes

The dashboard exposes these API endpoints:

- `GET /api/token` - Token data (holders, supply, etc.)
- `GET /api/price` - Current price & market data
- `GET /api/price/historical?days=7` - Historical prices
- `GET /api/social` - Social media metrics
- `GET /api/competitors` - Competitor comparison data
- `GET /api/campaigns` - Influencer campaign ROI

## Components

### MetricCard
Display individual metrics with trend indicators:
```tsx
<MetricCard
  title="Token Price"
  value="$0.000432"
  change={12.4}
  icon={<Coins />}
/>
```

### PriceChart
Visualize price history:
```tsx
<PriceChart
  data={historicalPrices}
  type="area"
  height={350}
/>
```

### SocialMetrics
Show all social media stats:
```tsx
<SocialMetrics
  twitter={twitterData}
  telegram={telegramData}
  discord={discordData}
/>
```

### CompetitorComparison
Compare metrics across tokens:
```tsx
<CompetitorComparison
  data={competitorData}
  metric="marketCap"
/>
```

### InfluencerROI
Track campaign performance:
```tsx
<InfluencerROI campaigns={campaignData} />
```

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **Blockchain**: Ethers.js v6
- **Data Fetching**: SWR (stale-while-revalidate)
- **APIs**: CoinGecko, CoinMarketCap, Twitter, Telegram, Discord
- **Notifications**: Slack Web API, Nodemailer
- **Reports**: PDFKit, HTML email templates

## Data Update Intervals

- Token data: 30 seconds
- Price data: 30 seconds
- Social metrics: 1 minute
- Competitor data: 2 minutes
- Campaign data: 5 minutes

Configure in `dashboard/app/page.tsx`.

## File Structure

```
src/analytics/
├── dashboard/              # Next.js dashboard
│   ├── app/               # App router pages
│   │   ├── page.tsx       # Main dashboard
│   │   ├── layout.tsx     # Root layout
│   │   └── api/           # API routes
│   ├── components/        # React components
│   ├── lib/               # Service classes
│   └── styles/            # CSS files
├── reporting/             # Report generators
│   ├── generators/        # Daily/weekly/monthly
│   └── templates/         # Email templates
├── api/                   # Notification services
├── data/                  # Stored metrics
├── competitor-tracker.js  # Competitor tracking
├── metrics-config.json    # Configuration
├── package.json
└── README.md
```

## Production Deployment

### Vercel (Recommended)

```bash
cd dashboard
vercel --prod
```

### Docker

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY dashboard/package*.json ./
RUN npm ci --only=production
COPY dashboard/ .
RUN npm run build
EXPOSE 3001
CMD ["npm", "start"]
```

```bash
docker build -t hypeai-analytics .
docker run -p 3001:3001 --env-file .env hypeai-analytics
```

## Monitoring & Maintenance

- Check API rate limits (CoinGecko: 50 calls/min free tier)
- Monitor email delivery rates
- Review Slack notification logs
- Clean old data files periodically
- Update competitor list as needed

## Troubleshooting

### Dashboard not loading data

1. Check API keys in `.env.local`
2. Verify blockchain RPC URL is accessible
3. Check browser console for errors
4. Ensure backend services are running

### Reports not sending

1. Verify SMTP credentials
2. Check recipient email addresses
3. Review nodemailer logs
4. Test with a simple email first

### Slack notifications failing

1. Confirm webhook URL is correct
2. Check Slack workspace permissions
3. Verify message format in logs

## Support

For issues or questions:
- Check logs in console/terminal
- Review API documentation
- Test endpoints individually
- Verify environment variables

## License

MIT License - See LICENSE file for details

---

**Built with Claude-Flow for HypeAI** 🚀
