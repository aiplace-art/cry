# HypeAI Twitter Engagement Bot Guide

## Overview

The Twitter Engagement Bot is an automated community management system that:
- Monitors and responds to mentions
- Engages with relevant content
- Builds relationships with influencers
- Respects rate limits and safety guidelines
- Tracks engagement metrics

## Features

### 1. Mention Monitoring
- Automatic mention detection
- Intelligent response generation
- Context-aware replies
- Anti-spam protection

### 2. Content Discovery
- Keyword-based search
- Relevance filtering
- Quality assessment
- Smart engagement

### 3. Influencer Engagement
- Target account monitoring
- Strategic interactions
- Relationship building
- Priority engagement

### 4. Safety & Rate Limiting
- Twitter API compliance
- Natural engagement patterns
- Anti-spam measures
- Rate limit tracking

## Installation

### 1. Install Dependencies
```bash
cd scripts
npm install twitter-api-v2 dotenv
```

### 2. Configure Credentials
Edit `.env.marketing` with your Twitter API credentials (already configured).

### 3. Customize Responses
Edit `twitter-responses.json` to customize bot responses.

### 4. Adjust Configuration
Edit `engagement-config.json` to tune bot behavior.

## Usage

### Start the Bot
```bash
npm run engagement:start
# or
cd scripts && bash start-engagement-bot.sh
```

### Stop the Bot
```bash
npm run engagement:stop
# or
cd scripts && bash stop-engagement-bot.sh
```

### Check Status
```bash
npm run engagement:status
# or
cd scripts && bash engagement-status.sh
```

### View Logs
```bash
tail -f scripts/.twitter/logs/engagement-bot.log
```

## Configuration

### Rate Limits (`engagement-config.json`)

```json
{
  "rateLimits": {
    "maxLikesPerHour": 20,
    "maxRetweetsPerHour": 10,
    "maxRepliesPerHour": 30,
    "maxFollowsPerHour": 5
  }
}
```

**Recommended Settings:**
- Likes: 15-20/hour (safe)
- Retweets: 5-10/hour (conservative)
- Replies: 20-30/hour (moderate)
- Follows: 3-5/hour (very safe)

### Anti-Spam Settings

```json
{
  "antiSpam": {
    "minTimeBetweenEngagements": 300000,
    "maxRepliesPerUser": 3,
    "blockedKeywords": [
      "scam", "fake", "ponzi", "rug"
    ]
  }
}
```

### Targeting

```json
{
  "targeting": {
    "keywords": ["solana", "ai", "defi", "crypto"],
    "influencerMinFollowers": 1000,
    "projectMinFollowers": 500
  }
}
```

## Response Templates

### Structure (`twitter-responses.json`)

```json
{
  "greetings": [...],
  "questions": {
    "whatIsHypeAI": [...],
    "tokenInfo": [...],
    "howToJoin": [...]
  },
  "engagement": {
    "positive": [...],
    "technical": [...]
  }
}
```

### Placeholders

Use these placeholders in responses:
- `{user}` - Mentioned user's @username
- `{website}` - Project website URL
- `{telegram}` - Telegram community link
- `{discord}` - Discord server link

Example:
```
"Hey {user}! Join us at {telegram}"
```

## Engagement Strategy

### 1. Mention Responses (Priority: High)
- Response time: 30-180 seconds
- Always like mentions
- Reply with relevant context
- Retweet high-value mentions

### 2. Content Discovery (Priority: Medium)
- Check every 3rd cycle (~6 minutes)
- Search for keywords
- Engage with quality content
- Build organic presence

### 3. Influencer Engagement (Priority: High)
- Check every 5th cycle (~10 minutes)
- Target accounts from config
- Strategic likes and retweets
- Build relationships

### 4. Community Management (Priority: High)
- Monitor all interactions
- Track engagement metrics
- Generate hourly reports
- Maintain conversation history

## Safety Guidelines

### Do's ✅
- Respect rate limits
- Use natural delays
- Engage authentically
- Track all interactions
- Save state regularly

### Don'ts ❌
- Don't spam replies
- Don't engage with scams
- Don't exceed limits
- Don't follow everyone
- Don't use automation aggressively

## Monitoring & Analytics

### Real-Time Logs
```bash
tail -f scripts/.twitter/logs/engagement-bot.log
```

### Engagement State
View current state:
```bash
cat scripts/.twitter/engagement-state.json
```

### Analytics Reports
Generated every 10 cycles (~20 minutes):
- Total engagements
- Mention replies
- Content engagement
- Rate limit usage

## Troubleshooting

### Bot Won't Start
1. Check API credentials in `.env.marketing`
2. Verify Node.js is installed
3. Check if already running: `npm run engagement:status`

### Rate Limit Errors
1. Reduce limits in `engagement-config.json`
2. Increase check interval
3. Wait for rate limit reset

### No Engagements
1. Check keywords in config
2. Verify targeting settings
3. Review anti-spam filters
4. Check Twitter API access

### High CPU Usage
1. Increase check interval
2. Reduce max engagements
3. Disable content discovery temporarily

## Advanced Features

### Custom Response Logic
Edit `twitter-engagement-bot.js`:
```javascript
generateResponse(tweetText, username) {
  // Add custom logic here
  if (tweetText.includes('custom keyword')) {
    return 'Custom response';
  }
  // ... existing logic
}
```

### Webhook Integration
Add webhook notifications for:
- High-value engagements
- Milestone achievements
- Error conditions

### A/B Testing
Test different response strategies:
```javascript
const responseVariant = Math.random() < 0.5 ? 'A' : 'B';
```

## Best Practices

### 1. Start Conservative
- Begin with lower rate limits
- Monitor for 24 hours
- Gradually increase if safe

### 2. Monitor Daily
- Check logs daily
- Review engagement reports
- Adjust based on performance

### 3. Stay Authentic
- Don't over-automate
- Mix with manual engagement
- Maintain genuine interactions

### 4. Community First
- Prioritize community questions
- Respond to concerns quickly
- Build real relationships

### 5. Compliance
- Follow Twitter Terms of Service
- Respect user privacy
- Disclose automation when appropriate

## Performance Metrics

### Key Metrics to Track
- **Engagement Rate**: Interactions / Opportunities
- **Response Time**: Average reply delay
- **Quality Score**: Positive responses / Total
- **Growth Rate**: New followers / Day
- **Reach**: Impressions / Engagement

### Optimization Goals
- Engagement Rate: >10%
- Response Time: <5 minutes
- Quality Score: >90%
- Growth Rate: +50/day
- Reach: 10x engagements

## Integration with Marketing Campaign

The engagement bot works alongside:
- Content posting bot (`ai-marketing-bot.js`)
- Growth strategy (`launch-campaign.sh`)
- Analytics tracking
- Community management

### Coordination
- Bot handles micro-interactions
- Manual team handles major announcements
- Analytics inform both strategies
- Weekly review and adjustment

## Support

For issues or questions:
1. Check logs: `.twitter/logs/engagement-bot.log`
2. Review configuration
3. Consult Twitter API documentation
4. Contact development team

## Changelog

### v1.0.0 (2025-10-16)
- Initial release
- Core engagement features
- Rate limiting and safety
- Response templates
- Analytics and reporting

---

**Remember:** Quality engagement beats quantity. Build real relationships! 🤖💙
