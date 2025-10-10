const express = require('express');
const path = require('path');
const InfluencerCRM = require('./crm');
const OutreachBot = require('./outreach-bot');
const CampaignTracker = require('./campaign-tracker');

/**
 * HypeAI Influencer Management Server
 * API and dashboard for influencer outreach automation
 */

const app = express();
const PORT = process.env.PORT || 3030;

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// Initialize systems
const crm = new InfluencerCRM();
const outreachBot = new OutreachBot(crm);
const campaignTracker = new CampaignTracker(crm);

// API Routes

// CRM Endpoints
app.get('/api/influencers', (req, res) => {
  const { status, tier, priority } = req.query;
  let influencers = crm.getAllInfluencers();

  if (status) influencers = influencers.filter(i => i.status === status);
  if (tier) influencers = influencers.filter(i => i.tier === parseInt(tier));
  if (priority) influencers = influencers.filter(i => i.priority === priority);

  res.json(influencers);
});

app.get('/api/influencers/:id', (req, res) => {
  const influencer = crm.getInfluencerById(parseInt(req.params.id));
  if (!influencer) {
    return res.status(404).json({ error: 'Influencer not found' });
  }
  res.json(influencer);
});

app.put('/api/influencers/:id/status', (req, res) => {
  const { status } = req.body;
  const influencer = crm.updateInfluencerStatus(parseInt(req.params.id), status);
  if (!influencer) {
    return res.status(404).json({ error: 'Influencer not found' });
  }
  res.json(influencer);
});

app.put('/api/influencers/:id/email', (req, res) => {
  const { email } = req.body;
  const influencer = crm.updateInfluencerEmail(parseInt(req.params.id), email);
  if (!influencer) {
    return res.status(404).json({ error: 'Influencer not found' });
  }
  res.json(influencer);
});

app.post('/api/influencers/:id/notes', (req, res) => {
  const { note } = req.body;
  const influencer = crm.addNote(parseInt(req.params.id), note);
  if (!influencer) {
    return res.status(404).json({ error: 'Influencer not found' });
  }
  res.json(influencer);
});

app.put('/api/influencers/:id/contract', (req, res) => {
  const { status, details } = req.body;
  const influencer = crm.updateContractStatus(parseInt(req.params.id), status, details);
  if (!influencer) {
    return res.status(404).json({ error: 'Influencer not found' });
  }
  res.json(influencer);
});

app.get('/api/statistics', (req, res) => {
  res.json(crm.getStatistics());
});

app.get('/api/pipeline', (req, res) => {
  res.json(crm.getPipeline());
});

app.get('/api/priority', (req, res) => {
  res.json(crm.getHighPriorityInfluencers());
});

app.get('/api/followup-needed', (req, res) => {
  res.json(crm.getFollowUpNeeded());
});

app.get('/api/export-csv', (req, res) => {
  const file = crm.exportToCSV();
  res.download(file);
});

// Outreach Endpoints
app.post('/api/outreach/email', async (req, res) => {
  const { influencerId, template, customVars } = req.body;
  const influencer = crm.getInfluencerById(influencerId);

  if (!influencer) {
    return res.status(404).json({ error: 'Influencer not found' });
  }

  const result = await outreachBot.sendEmail(influencer, template, customVars);
  res.json(result);
});

app.post('/api/outreach/twitter', async (req, res) => {
  const { influencerId, template, customVars } = req.body;
  const influencer = crm.getInfluencerById(influencerId);

  if (!influencer) {
    return res.status(404).json({ error: 'Influencer not found' });
  }

  const result = await outreachBot.sendTwitterDM(influencer, template, customVars);
  res.json(result);
});

app.post('/api/outreach/bulk', async (req, res) => {
  const { influencerIds, channel, template } = req.body;
  const results = await outreachBot.bulkOutreach(influencerIds, channel, template);
  res.json(results);
});

app.post('/api/outreach/followups', async (req, res) => {
  const results = await outreachBot.scheduleFollowUps();
  res.json(results);
});

app.get('/api/outreach/stats', (req, res) => {
  const days = parseInt(req.query.days) || 30;
  res.json(outreachBot.getOutreachStats(days));
});

app.post('/api/outreach/campaign', async (req, res) => {
  const { name, influencerIds, channel } = req.body;
  const result = await outreachBot.launchCampaign(name, influencerIds, channel);
  res.json(result);
});

// Campaign Endpoints
app.get('/api/campaigns', (req, res) => {
  const { status } = req.query;
  let campaigns;

  if (status === 'active') {
    campaigns = campaignTracker.getActiveCampaigns();
  } else {
    campaigns = campaignTracker.getAllCampaigns();
  }

  res.json(campaigns);
});

app.post('/api/campaigns', (req, res) => {
  const campaign = campaignTracker.createCampaign(req.body);
  res.json(campaign);
});

app.get('/api/campaigns/:id', (req, res) => {
  const campaign = campaignTracker.getCampaign(parseInt(req.params.id));
  if (!campaign) {
    return res.status(404).json({ error: 'Campaign not found' });
  }
  res.json(campaign);
});

app.get('/api/campaigns/:id/report', (req, res) => {
  const report = campaignTracker.getPerformanceReport(parseInt(req.params.id));
  if (!report) {
    return res.status(404).json({ error: 'Campaign not found' });
  }
  res.json(report);
});

app.post('/api/campaigns/:id/posts', (req, res) => {
  const post = campaignTracker.addPost(parseInt(req.params.id), req.body);
  if (!post) {
    return res.status(404).json({ error: 'Campaign not found' });
  }
  res.json(post);
});

app.put('/api/campaigns/:id/posts/:postId', (req, res) => {
  const post = campaignTracker.updatePostMetrics(
    parseInt(req.params.id),
    parseInt(req.params.postId),
    req.body
  );
  if (!post) {
    return res.status(404).json({ error: 'Post not found' });
  }
  res.json(post);
});

app.put('/api/campaigns/:id/conversions', (req, res) => {
  const { conversions, signups, revenue } = req.body;
  const campaign = campaignTracker.updateConversions(
    parseInt(req.params.id),
    conversions,
    signups,
    revenue
  );
  if (!campaign) {
    return res.status(404).json({ error: 'Campaign not found' });
  }
  res.json(campaign);
});

app.put('/api/campaigns/:id/complete', (req, res) => {
  const campaign = campaignTracker.markCampaignComplete(parseInt(req.params.id));
  if (!campaign) {
    return res.status(404).json({ error: 'Campaign not found' });
  }
  res.json(campaign);
});

app.put('/api/campaigns/:id/pause', (req, res) => {
  const campaign = campaignTracker.pauseCampaign(parseInt(req.params.id));
  if (!campaign) {
    return res.status(404).json({ error: 'Campaign not found' });
  }
  res.json(campaign);
});

app.put('/api/campaigns/:id/resume', (req, res) => {
  const campaign = campaignTracker.resumeCampaign(parseInt(req.params.id));
  if (!campaign) {
    return res.status(404).json({ error: 'Campaign not found' });
  }
  res.json(campaign);
});

app.post('/api/campaigns/:id/payment', (req, res) => {
  const { amount } = req.body;
  const campaign = campaignTracker.recordPayment(parseInt(req.params.id), amount);
  if (!campaign) {
    return res.status(404).json({ error: 'Campaign not found' });
  }
  res.json(campaign);
});

app.get('/api/campaigns/leaderboard/roi', (req, res) => {
  const limit = parseInt(req.query.limit) || 10;
  res.json(campaignTracker.getROILeaderboard(limit));
});

app.get('/api/campaigns/stats/overall', (req, res) => {
  res.json(campaignTracker.getOverallStats());
});

app.get('/api/campaigns/:id/metrics', (req, res) => {
  const days = parseInt(req.query.days) || 30;
  const metrics = campaignTracker.getCampaignMetrics(parseInt(req.params.id), days);
  res.json(metrics);
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    systems: {
      crm: 'operational',
      outreach: 'operational',
      campaigns: 'operational'
    },
    stats: crm.getStatistics()
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`
  ╔════════════════════════════════════════════╗
  ║   HypeAI Influencer Management System      ║
  ╠════════════════════════════════════════════╣
  ║   Server running on http://localhost:${PORT}  ║
  ║                                            ║
  ║   Dashboard: http://localhost:${PORT}/dashboard.html
  ║   API Docs:  http://localhost:${PORT}/api/health
  ║                                            ║
  ║   Systems: CRM | Outreach | Campaigns      ║
  ╚════════════════════════════════════════════╝
  `);
});

module.exports = app;
