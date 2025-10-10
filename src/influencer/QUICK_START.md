# HypeAI Influencer System - Quick Start Guide

## 🚀 Get Started in 5 Minutes

### 1. Install Dependencies
```bash
cd src/influencer
npm install
```

### 2. Configure Email (Optional)
```bash
cp .env.example .env
# Edit .env with your email credentials
```

### 3. Start the Server
```bash
npm start
```

### 4. Open Dashboard
Navigate to: **http://localhost:3030/dashboard.html**

## 📋 What You Get

### Pre-loaded Database
- **50 influencers** across 3 tiers
  - Tier 1: 30 micro-influencers (10K-50K followers)
  - Tier 2: 15 mid-tier (50K-500K followers)
  - Tier 3: 5 macro-influencers (500K+ followers)

### Email Templates
8 ready-to-use templates in `/templates/`:
1. Cold outreach
2. Warm introduction
3. Referral-based
4. Day 3 follow-up
5. Day 7 follow-up
6. Partnership proposal
7. Contract template
8. Payment confirmation

### Features
- CRM with pipeline management
- Automated email outreach
- Campaign tracking
- ROI analytics
- Performance dashboard

## 🎯 Common Tasks

### Send Outreach to Influencer
```bash
curl -X POST http://localhost:3030/api/outreach/email \
  -H "Content-Type: application/json" \
  -d '{
    "influencerId": 1,
    "template": "initial-outreach-cold"
  }'
```

### Create Campaign
```bash
curl -X POST http://localhost:3030/api/campaigns \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Launch Week",
    "influencerId": 1,
    "platform": "Twitter",
    "budget": 300,
    "deliverables": ["1 thread", "2 tweets"]
  }'
```

### Bulk Outreach to Tier 1
```bash
curl -X POST http://localhost:3030/api/outreach/bulk \
  -H "Content-Type: application/json" \
  -d '{
    "influencerIds": [1, 2, 3, 4, 5],
    "channel": "email",
    "template": "initial-outreach-cold"
  }'
```

### Get High Priority Influencers
```bash
curl http://localhost:3030/api/priority
```

## 📊 Dashboard Features

### Pipeline View
- Drag-and-drop Kanban board
- 5 stages: Not Contacted → Contacted → Negotiating → Partnered → Declined
- Filter by tier, status, priority

### Campaign Tracking
- Real-time performance metrics
- ROI calculation
- Cost per conversion
- Engagement tracking

### Analytics
- ROI leaderboard
- Overall statistics
- Follow-up reminders
- Export to CSV

## 🔧 Customization

### Add Your Own Influencers
Edit `/src/influencer/crm.js` and add to the `initializeInfluencers()` method:

```javascript
{
  id: 51,
  name: '@YourInfluencer',
  platform: 'Twitter',
  followers: 50000,
  tier: 1,
  niche: 'Crypto Trading',
  engagement: 0.05,
  status: 'not_contacted',
  budget: 400,
  email: 'influencer@example.com',
  notes: [],
  contractStatus: 'none',
  payments: [],
  campaigns: [],
  outreachDate: null,
  lastContact: null,
  priority: 'high'
}
```

### Customize Templates
Edit files in `/templates/` folder. Use these variables:
- `{NAME}` - Influencer name
- `{PLATFORM}` - Social platform
- `{NICHE}` - Content niche
- `{FOLLOWERS}` - Follower count
- `{BUDGET}` - Budget amount

## 📈 Workflow Example

### Week 1: Initial Outreach
1. Filter high-priority Tier 1 influencers
2. Send bulk cold outreach (20 influencers)
3. Track open rates

### Week 2: Follow-ups
1. System automatically sends Day 3 follow-ups
2. Day 7 follow-ups for non-responders
3. Update status for responses

### Week 3: Partnerships
1. Move interested influencers to "Negotiating"
2. Send partnership proposals
3. Create campaigns for confirmed partners

### Week 4: Campaign Tracking
1. Add posts to campaigns
2. Track performance metrics
3. Calculate ROI
4. Process payments

## 🎨 Sample Data

The system includes:
- **50 real influencers** from the marketing plan
- **Budget allocation**: $184,820 total
- **Total reach**: 209M+ followers
- **Average engagement**: 5%

## 🚨 Important Notes

1. **Email Configuration Required** for actual sending
   - Gmail: Enable "Less secure apps" or use App Password
   - SendGrid/Mailgun: Add API keys to `.env`

2. **Twitter API** requires approved developer account
   - Apply at: https://developer.twitter.com
   - Get API keys and add to `.env`

3. **Rate Limits** are enforced automatically
   - Email: 50/hour (configurable)
   - Twitter: 20/hour (configurable)

4. **Data Persistence** uses JSON files
   - For production, consider PostgreSQL/MongoDB
   - Current setup is perfect for testing/demo

## 📞 Support

- **API Docs**: http://localhost:3030/api/health
- **Run Tests**: `npm test`
- **View Logs**: `data/outreach-log.json`

## ✅ Next Steps

1. ✓ System is running
2. → Configure email credentials
3. → Customize templates
4. → Start outreach campaign
5. → Track your first campaign
6. → Analyze ROI

**You're ready to manage 50+ influencer partnerships! 🎉**
