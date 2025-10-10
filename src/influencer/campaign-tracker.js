const fs = require('fs');
const path = require('path');

/**
 * HypeAI Campaign Tracker
 * Tracks influencer campaigns, monitors performance, calculates ROI
 */

class CampaignTracker {
  constructor(crm, dataPath = path.join(__dirname, 'data')) {
    this.crm = crm;
    this.dataPath = dataPath;
    this.campaignsFile = path.join(dataPath, 'campaigns.json');
    this.metricsFile = path.join(dataPath, 'campaign-metrics.json');

    this.ensureDataFiles();
    this.campaigns = this.loadCampaigns();
    this.metrics = this.loadMetrics();
  }

  ensureDataFiles() {
    if (!fs.existsSync(this.dataPath)) {
      fs.mkdirSync(this.dataPath, { recursive: true });
    }
    if (!fs.existsSync(this.campaignsFile)) {
      fs.writeFileSync(this.campaignsFile, JSON.stringify([], null, 2));
    }
    if (!fs.existsSync(this.metricsFile)) {
      fs.writeFileSync(this.metricsFile, JSON.stringify({}, null, 2));
    }
  }

  loadCampaigns() {
    return JSON.parse(fs.readFileSync(this.campaignsFile, 'utf8'));
  }

  loadMetrics() {
    return JSON.parse(fs.readFileSync(this.metricsFile, 'utf8'));
  }

  saveCampaigns() {
    fs.writeFileSync(this.campaignsFile, JSON.stringify(this.campaigns, null, 2));
  }

  saveMetrics() {
    fs.writeFileSync(this.metricsFile, JSON.stringify(this.metrics, null, 2));
  }

  createCampaign(campaignData) {
    const campaign = {
      id: Date.now(),
      name: campaignData.name,
      influencerId: campaignData.influencerId,
      influencerName: this.crm.getInfluencerById(campaignData.influencerId)?.name || 'Unknown',
      platform: campaignData.platform,
      startDate: campaignData.startDate || new Date().toISOString(),
      endDate: campaignData.endDate,
      status: 'active', // active, completed, paused, cancelled
      deliverables: campaignData.deliverables || [],
      budget: campaignData.budget,
      paid: 0,
      posts: [],
      performance: {
        reach: 0,
        impressions: 0,
        engagement: 0,
        likes: 0,
        comments: 0,
        shares: 0,
        clicks: 0,
        conversions: 0,
        signups: 0,
        revenue: 0
      },
      roi: 0,
      notes: []
    };

    this.campaigns.push(campaign);
    this.saveCampaigns();

    // Initialize metrics
    this.metrics[campaign.id] = {
      dailyMetrics: [],
      lastUpdated: new Date().toISOString()
    };
    this.saveMetrics();

    return campaign;
  }

  getCampaign(campaignId) {
    return this.campaigns.find(c => c.id === campaignId);
  }

  getAllCampaigns() {
    return this.campaigns;
  }

  getActiveCampaigns() {
    return this.campaigns.filter(c => c.status === 'active');
  }

  getCampaignsByInfluencer(influencerId) {
    return this.campaigns.filter(c => c.influencerId === influencerId);
  }

  addPost(campaignId, postData) {
    const campaign = this.getCampaign(campaignId);
    if (!campaign) return null;

    const post = {
      id: Date.now(),
      platform: postData.platform,
      url: postData.url,
      type: postData.type, // tweet, tiktok, youtube, instagram
      publishedAt: postData.publishedAt || new Date().toISOString(),
      content: postData.content || '',
      metrics: {
        reach: postData.reach || 0,
        impressions: postData.impressions || 0,
        likes: postData.likes || 0,
        comments: postData.comments || 0,
        shares: postData.shares || 0,
        clicks: postData.clicks || 0,
        views: postData.views || 0
      },
      trackingUrl: postData.trackingUrl || '',
      lastChecked: new Date().toISOString()
    };

    campaign.posts.push(post);
    this.updateCampaignPerformance(campaignId);
    this.saveCampaigns();

    return post;
  }

  updatePostMetrics(campaignId, postId, newMetrics) {
    const campaign = this.getCampaign(campaignId);
    if (!campaign) return null;

    const post = campaign.posts.find(p => p.id === postId);
    if (!post) return null;

    post.metrics = { ...post.metrics, ...newMetrics };
    post.lastChecked = new Date().toISOString();

    this.updateCampaignPerformance(campaignId);
    this.saveCampaigns();

    // Log daily metrics
    this.logDailyMetrics(campaignId);

    return post;
  }

  updateCampaignPerformance(campaignId) {
    const campaign = this.getCampaign(campaignId);
    if (!campaign) return null;

    // Aggregate all post metrics
    const performance = {
      reach: 0,
      impressions: 0,
      engagement: 0,
      likes: 0,
      comments: 0,
      shares: 0,
      clicks: 0,
      conversions: campaign.performance.conversions || 0,
      signups: campaign.performance.signups || 0,
      revenue: campaign.performance.revenue || 0
    };

    campaign.posts.forEach(post => {
      performance.reach += post.metrics.reach || 0;
      performance.impressions += post.metrics.impressions || 0;
      performance.likes += post.metrics.likes || 0;
      performance.comments += post.metrics.comments || 0;
      performance.shares += post.metrics.shares || 0;
      performance.clicks += post.metrics.clicks || 0;
    });

    // Calculate total engagement
    performance.engagement = performance.likes + performance.comments + performance.shares;

    campaign.performance = performance;

    // Calculate ROI
    campaign.roi = this.calculateROI(campaign);

    this.saveCampaigns();
    return campaign;
  }

  calculateROI(campaign) {
    const totalSpent = campaign.paid;
    const revenue = campaign.performance.revenue;

    if (totalSpent === 0) return 0;

    // ROI = (Revenue - Cost) / Cost * 100
    const roi = ((revenue - totalSpent) / totalSpent) * 100;
    return parseFloat(roi.toFixed(2));
  }

  updateConversions(campaignId, conversions, signups = 0, revenue = 0) {
    const campaign = this.getCampaign(campaignId);
    if (!campaign) return null;

    campaign.performance.conversions = conversions;
    campaign.performance.signups = signups;
    campaign.performance.revenue = revenue;

    campaign.roi = this.calculateROI(campaign);
    this.saveCampaigns();

    return campaign;
  }

  logDailyMetrics(campaignId) {
    const campaign = this.getCampaign(campaignId);
    if (!campaign) return;

    const today = new Date().toISOString().split('T')[0];
    const campaignMetrics = this.metrics[campaignId];

    if (!campaignMetrics) {
      this.metrics[campaignId] = { dailyMetrics: [], lastUpdated: new Date().toISOString() };
    }

    // Check if we already have today's metrics
    const existingIndex = campaignMetrics.dailyMetrics.findIndex(m => m.date === today);

    const dailySnapshot = {
      date: today,
      ...campaign.performance,
      roi: campaign.roi
    };

    if (existingIndex >= 0) {
      campaignMetrics.dailyMetrics[existingIndex] = dailySnapshot;
    } else {
      campaignMetrics.dailyMetrics.push(dailySnapshot);
    }

    campaignMetrics.lastUpdated = new Date().toISOString();
    this.saveMetrics();
  }

  getCampaignMetrics(campaignId, days = 30) {
    const campaignMetrics = this.metrics[campaignId];
    if (!campaignMetrics) return [];

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    const cutoff = cutoffDate.toISOString().split('T')[0];

    return campaignMetrics.dailyMetrics.filter(m => m.date >= cutoff);
  }

  getPerformanceReport(campaignId) {
    const campaign = this.getCampaign(campaignId);
    if (!campaign) return null;

    const influencer = this.crm.getInfluencerById(campaign.influencerId);
    const expectedReach = influencer ? influencer.followers : 0;
    const expectedEngagement = influencer ? influencer.followers * influencer.engagement : 0;

    const report = {
      campaignId: campaign.id,
      campaignName: campaign.name,
      influencer: campaign.influencerName,
      platform: campaign.platform,
      status: campaign.status,
      duration: this.getDuration(campaign.startDate, campaign.endDate),
      budget: campaign.budget,
      spent: campaign.paid,
      remainingBudget: campaign.budget - campaign.paid,

      performance: campaign.performance,

      efficiency: {
        costPerReach: campaign.paid > 0 ? (campaign.paid / campaign.performance.reach).toFixed(2) : 0,
        costPerEngagement: campaign.performance.engagement > 0 ? (campaign.paid / campaign.performance.engagement).toFixed(2) : 0,
        costPerClick: campaign.performance.clicks > 0 ? (campaign.paid / campaign.performance.clicks).toFixed(2) : 0,
        costPerConversion: campaign.performance.conversions > 0 ? (campaign.paid / campaign.performance.conversions).toFixed(2) : 0,
        engagementRate: campaign.performance.reach > 0 ? ((campaign.performance.engagement / campaign.performance.reach) * 100).toFixed(2) + '%' : '0%',
        clickThroughRate: campaign.performance.impressions > 0 ? ((campaign.performance.clicks / campaign.performance.impressions) * 100).toFixed(2) + '%' : '0%',
        conversionRate: campaign.performance.clicks > 0 ? ((campaign.performance.conversions / campaign.performance.clicks) * 100).toFixed(2) + '%' : '0%'
      },

      roi: campaign.roi,

      vsExpected: {
        reachVsExpected: expectedReach > 0 ? ((campaign.performance.reach / expectedReach) * 100).toFixed(0) + '%' : 'N/A',
        engagementVsExpected: expectedEngagement > 0 ? ((campaign.performance.engagement / expectedEngagement) * 100).toFixed(0) + '%' : 'N/A'
      },

      posts: campaign.posts.length,
      deliverables: campaign.deliverables
    };

    return report;
  }

  getDuration(startDate, endDate) {
    const start = new Date(startDate);
    const end = endDate ? new Date(endDate) : new Date();
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return `${diffDays} days`;
  }

  getROILeaderboard(limit = 10) {
    return this.campaigns
      .filter(c => c.status === 'completed' || c.paid > 0)
      .sort((a, b) => b.roi - a.roi)
      .slice(0, limit)
      .map(c => ({
        campaignId: c.id,
        campaignName: c.name,
        influencer: c.influencerName,
        spent: c.paid,
        revenue: c.performance.revenue,
        roi: c.roi
      }));
  }

  getOverallStats() {
    const activeCampaigns = this.getActiveCampaigns();
    const completedCampaigns = this.campaigns.filter(c => c.status === 'completed');

    const totalSpent = this.campaigns.reduce((sum, c) => sum + c.paid, 0);
    const totalRevenue = this.campaigns.reduce((sum, c) => sum + c.performance.revenue, 0);
    const totalReach = this.campaigns.reduce((sum, c) => sum + c.performance.reach, 0);
    const totalEngagement = this.campaigns.reduce((sum, c) => sum + c.performance.engagement, 0);
    const totalConversions = this.campaigns.reduce((sum, c) => sum + c.performance.conversions, 0);

    return {
      totalCampaigns: this.campaigns.length,
      activeCampaigns: activeCampaigns.length,
      completedCampaigns: completedCampaigns.length,
      totalSpent,
      totalRevenue,
      overallROI: totalSpent > 0 ? (((totalRevenue - totalSpent) / totalSpent) * 100).toFixed(2) : 0,
      totalReach,
      totalEngagement,
      totalConversions,
      averageCostPerConversion: totalConversions > 0 ? (totalSpent / totalConversions).toFixed(2) : 0,
      averageEngagementRate: totalReach > 0 ? ((totalEngagement / totalReach) * 100).toFixed(2) + '%' : '0%'
    };
  }

  markCampaignComplete(campaignId) {
    const campaign = this.getCampaign(campaignId);
    if (!campaign) return null;

    campaign.status = 'completed';
    campaign.endDate = new Date().toISOString();
    this.saveCampaigns();

    return campaign;
  }

  pauseCampaign(campaignId) {
    const campaign = this.getCampaign(campaignId);
    if (!campaign) return null;

    campaign.status = 'paused';
    this.saveCampaigns();

    return campaign;
  }

  resumeCampaign(campaignId) {
    const campaign = this.getCampaign(campaignId);
    if (!campaign) return null;

    campaign.status = 'active';
    this.saveCampaigns();

    return campaign;
  }

  recordPayment(campaignId, amount) {
    const campaign = this.getCampaign(campaignId);
    if (!campaign) return null;

    campaign.paid += amount;
    campaign.roi = this.calculateROI(campaign);
    this.saveCampaigns();

    // Also update influencer payment records
    const influencer = this.crm.getInfluencerById(campaign.influencerId);
    if (influencer) {
      this.crm.addPayment(campaign.influencerId, {
        amount,
        campaignId: campaign.id,
        status: 'completed',
        notes: `Payment for campaign: ${campaign.name}`
      });
    }

    return campaign;
  }
}

module.exports = CampaignTracker;
