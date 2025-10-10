# HypeAI Influencer Outreach Automation System

Complete influencer management system with CRM, automated outreach, campaign tracking, and ROI analytics.

## Features

### 1. Influencer CRM
- 50+ pre-loaded influencers (Tier 1, 2, and 3)
- Status tracking: not contacted, contacted, negotiating, partnered, declined
- Notes and conversation history
- Contract management
- Payment tracking
- Priority management

### 2. Outreach Automation
- Email automation with personalized templates
- Twitter DM automation (with rate limiting)
- Bulk outreach campaigns
- Automatic follow-ups (Day 3 and Day 7)
- Response detection
- Template personalization

### 3. Campaign Tracking
- Campaign creation and management
- Post performance monitoring (Twitter, YouTube, TikTok, Instagram)
- Real-time metrics tracking (reach, engagement, clicks, conversions)
- ROI calculation
- Performance reports
- ROI leaderboard

### 4. Dashboard
- Real-time analytics
- Pipeline visualization (Kanban-style)
- Active campaigns overview
- ROI leaderboard
- Quick actions (contact, update status, view details)

## Installation

```bash
cd src/influencer
npm install
```

## Configuration

1. Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

2. Configure your credentials in `.env`:
- Email settings (Gmail, SendGrid, etc.)
- Twitter API credentials
- Rate limits

## Usage

### Start the Server

```bash
npm start
```

Server runs on http://localhost:3030

### Access Dashboard

Open http://localhost:3030/dashboard.html

### Run Tests

```bash
npm test
```

## API Endpoints

### CRM Endpoints

- `GET /api/influencers` - Get all influencers (with filters)
- `GET /api/influencers/:id` - Get influencer details
- `PUT /api/influencers/:id/status` - Update status
- `PUT /api/influencers/:id/email` - Update email
- `POST /api/influencers/:id/notes` - Add note
- `PUT /api/influencers/:id/contract` - Update contract
- `GET /api/statistics` - Get overall statistics
- `GET /api/pipeline` - Get pipeline view
- `GET /api/priority` - Get high-priority influencers
- `GET /api/followup-needed` - Get influencers needing follow-up
- `GET /api/export-csv` - Export to CSV

### Outreach Endpoints

- `POST /api/outreach/email` - Send email
- `POST /api/outreach/twitter` - Send Twitter DM
- `POST /api/outreach/bulk` - Bulk outreach
- `POST /api/outreach/followups` - Schedule follow-ups
- `GET /api/outreach/stats` - Get outreach statistics
- `POST /api/outreach/campaign` - Launch campaign

### Campaign Endpoints

- `GET /api/campaigns` - Get all campaigns
- `POST /api/campaigns` - Create campaign
- `GET /api/campaigns/:id` - Get campaign details
- `GET /api/campaigns/:id/report` - Get performance report
- `POST /api/campaigns/:id/posts` - Add post
- `PUT /api/campaigns/:id/posts/:postId` - Update post metrics
- `PUT /api/campaigns/:id/conversions` - Update conversions
- `PUT /api/campaigns/:id/complete` - Mark complete
- `PUT /api/campaigns/:id/pause` - Pause campaign
- `PUT /api/campaigns/:id/resume` - Resume campaign
- `POST /api/campaigns/:id/payment` - Record payment
- `GET /api/campaigns/leaderboard/roi` - ROI leaderboard
- `GET /api/campaigns/stats/overall` - Overall statistics

## Email Templates

Located in `templates/`:

1. **initial-outreach-cold.txt** - Cold outreach
2. **initial-outreach-warm.txt** - Warm introduction
3. **initial-outreach-referral.txt** - Referral-based
4. **followup-day3.txt** - Day 3 follow-up
5. **followup-day7.txt** - Day 7 follow-up
6. **partnership-proposal.txt** - Formal proposal
7. **contract-template.txt** - Partnership contract
8. **payment-confirmation.txt** - Payment confirmation

All templates support variable replacement:
- `{NAME}` - Influencer name
- `{FULL_NAME}` - Full name with @
- `{PLATFORM}` - Social platform
- `{NICHE}` - Content niche
- `{FOLLOWERS}` - Follower count
- `{BUDGET}` - Budget amount
- `{ENGAGEMENT}` - Engagement rate

## Workflow

### 1. Initial Outreach

```javascript
// Send email to influencer
await fetch('/api/outreach/email', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    influencerId: 1,
    template: 'initial-outreach-cold',
    customVars: { '{CUSTOM}': 'value' }
  })
});
```

### 2. Bulk Campaign

```javascript
// Launch campaign to multiple influencers
await fetch('/api/outreach/campaign', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'Launch Week Campaign',
    influencerIds: [1, 2, 3, 4, 5],
    channel: 'email'
  })
});
```

### 3. Track Campaign

```javascript
// Create campaign
const campaign = await fetch('/api/campaigns', {
  method: 'POST',
  body: JSON.stringify({
    name: 'Twitter Launch',
    influencerId: 1,
    platform: 'Twitter',
    budget: 300,
    deliverables: ['1 thread', '2 tweets']
  })
});

// Add post
await fetch(`/api/campaigns/${campaignId}/posts`, {
  method: 'POST',
  body: JSON.stringify({
    platform: 'Twitter',
    url: 'https://twitter.com/user/status/123',
    reach: 45000,
    likes: 2000,
    comments: 150,
    clicks: 800
  })
});

// Update conversions
await fetch(`/api/campaigns/${campaignId}/conversions`, {
  method: 'PUT',
  body: JSON.stringify({
    conversions: 25,
    signups: 25,
    revenue: 1250
  })
});
```

### 4. Monitor Performance

```javascript
// Get campaign report
const report = await fetch(`/api/campaigns/${campaignId}/report`);
// Returns: reach, engagement, ROI, cost per conversion, etc.

// Get ROI leaderboard
const leaderboard = await fetch('/api/campaigns/leaderboard/roi');
```

## Database Structure

### Influencer Schema
```javascript
{
  id: Number,
  name: String,
  platform: String,
  followers: Number,
  tier: Number (1, 2, or 3),
  niche: String,
  engagement: Number (0-1),
  status: String (not_contacted, contacted, negotiating, partnered, declined),
  budget: Number,
  email: String,
  notes: Array,
  contractStatus: String,
  payments: Array,
  campaigns: Array,
  outreachDate: Date,
  lastContact: Date,
  priority: String (low, medium, high, critical)
}
```

### Campaign Schema
```javascript
{
  id: Number,
  name: String,
  influencerId: Number,
  influencerName: String,
  platform: String,
  startDate: Date,
  endDate: Date,
  status: String (active, completed, paused, cancelled),
  deliverables: Array,
  budget: Number,
  paid: Number,
  posts: Array,
  performance: {
    reach: Number,
    impressions: Number,
    engagement: Number,
    likes: Number,
    comments: Number,
    shares: Number,
    clicks: Number,
    conversions: Number,
    signups: Number,
    revenue: Number
  },
  roi: Number,
  notes: Array
}
```

## Automation Features

### Automatic Follow-ups
The system automatically sends follow-ups:
- Day 3 after initial contact
- Day 7 if no response

Schedule follow-ups:
```bash
POST /api/outreach/followups
```

### Rate Limiting
- Twitter: 20 DMs per hour (configurable)
- Email: 50 emails per hour (configurable)

### Response Detection
System monitors email inbox and Twitter DMs for responses (requires configuration).

## Analytics

### Key Metrics
- Total influencers
- Active partnerships
- Total reach (combined followers)
- Total budget allocated
- Campaign ROI
- Cost per conversion
- Engagement rate
- Click-through rate

### Reports
- Performance reports per campaign
- ROI leaderboard
- Overall statistics
- Follow-up needed list
- High-priority targets

## Best Practices

1. **Start with Tier 1** - Test with micro-influencers first
2. **Personalize messages** - Always customize templates
3. **Track everything** - Log all interactions
4. **Monitor ROI** - Focus on high-performing partnerships
5. **Follow up** - Automated follow-ups increase response rate by 50%
6. **Build relationships** - Notes and conversation history are key

## Support

For issues or questions:
- Check API documentation: http://localhost:3030/api/health
- Review test suite: `npm test`
- Check logs in `data/outreach-log.json`

## License

MIT License - HypeAI Team
