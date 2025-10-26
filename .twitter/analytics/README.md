# HypeAI Twitter Analytics System

Comprehensive Twitter analytics tracking and reporting for HypeAI.

## Directory Structure

```
.twitter/analytics/
├── daily/          # Daily analytics snapshots
├── weekly/         # Weekly aggregated reports
├── metrics/        # Raw metrics data
│   ├── user-metrics-YYYY-MM-DD.json
│   ├── tweets-YYYY-MM-DD.json
│   ├── growth-rate-YYYY-MM-DD.json
│   ├── top-content-YYYY-MM-DD.json
│   ├── optimal-times-YYYY-MM-DD.json
│   └── competitors-YYYY-MM-DD.json
└── reports/        # Generated reports
    ├── daily-YYYY-MM-DD.md
    ├── weekly-YYYY-MM-DD.md
    ├── content-analysis-YYYY-MM-DD.md
    └── competitor-analysis-YYYY-MM-DD.md
```

## Setup

1. Set environment variables:
```bash
export TWITTER_BEARER_TOKEN="your_bearer_token"
export TWITTER_ACCOUNT_ID="HypeAI_Official"
```

2. Install dependencies:
```bash
npm install
```

3. Run analytics collection:
```bash
node scripts/twitter-analytics.js
```

4. Generate reports:
```bash
node scripts/twitter-reporter.js all
```

5. View dashboard:
```bash
open scripts/analytics-dashboard.html
```

## Automated Tracking

Set up cron jobs for automated tracking:

```bash
# Daily analytics collection (9 AM UTC)
0 9 * * * cd /path/to/project && node scripts/twitter-analytics.js

# Daily report generation (9:30 AM UTC)
30 9 * * * cd /path/to/project && node scripts/twitter-reporter.js daily

# Weekly report (Monday 10 AM UTC)
0 10 * * 1 cd /path/to/project && node scripts/twitter-reporter.js weekly
```

## Metrics Tracked

### Account Metrics
- Follower count
- Following count
- Total tweets
- Account age
- Verification status

### Engagement Metrics
- Likes per tweet
- Retweets per tweet
- Replies per tweet
- Impressions
- Engagement rate

### Growth Metrics
- Daily follower growth
- Weekly follower growth
- Monthly follower growth
- Growth rate percentage

### Content Analysis
- Best performing tweets
- Top hashtags
- Optimal posting times
- Content type performance
- Hashtag effectiveness

### Competitor Tracking
- Competitor follower counts
- Comparative analysis
- Growth benchmarks
- Market positioning

## API Endpoints Used

Twitter API v2 endpoints:
- `GET /2/users/by/username/:username` - User profile data
- `GET /2/users/:id/tweets` - User tweets with metrics
- Tweet metrics include: public_metrics, created_at, entities

## Data Storage

All data is stored as JSON files with timestamps. This allows for:
- Historical trend analysis
- Easy data backup
- Simple data portability
- No database dependencies

## Report Types

### Daily Summary
- Current metrics snapshot
- 24-hour growth
- Top performing tweet
- Engagement overview

### Weekly Report
- 7-day growth trends
- Content performance analysis
- Optimal posting recommendations
- Hashtag effectiveness

### Content Analysis
- Deep dive into tweet performance
- Hashtag analysis
- Timing insights
- Content pattern identification

### Competitor Analysis
- Benchmark against competitors
- Relative positioning
- Growth comparisons
- Market insights

## Dashboard Features

Interactive HTML dashboard provides:
- Real-time metrics display
- Growth trend charts
- Engagement visualizations
- Top content tables
- Hashtag performance
- Competitor comparisons

## Integration

The analytics system integrates with:
- Twitter API v2
- Claude-Flow coordination hooks
- Node.js automation scripts
- HTML/Chart.js visualization

## Security

- Never commit API tokens
- Use environment variables
- Store in .env file (gitignored)
- Rotate tokens regularly

## Troubleshooting

If you get API errors:
1. Check `TWITTER_BEARER_TOKEN` is set
2. Verify API rate limits
3. Ensure account has API access
4. Check token permissions

Demo mode runs without API access for testing.

## Future Enhancements

- [ ] Real-time streaming
- [ ] Sentiment analysis
- [ ] Automated tweet scheduling
- [ ] A/B testing framework
- [ ] ML-powered predictions
- [ ] Slack/Discord notifications
- [ ] CSV export functionality
- [ ] API endpoint for integrations
