/**
 * HypeAI Influencer CRM System
 * Manages influencer relationships, outreach, and campaigns
 */

const fs = require('fs').promises;
const path = require('path');

class InfluencerCRM {
  constructor() {
    this.dataDir = path.join(__dirname, 'data');
    this.influencersFile = path.join(this.dataDir, 'influencers.json');
    this.outreachFile = path.join(this.dataDir, 'outreach-log.json');
    this.campaignsFile = path.join(this.dataDir, 'campaigns.json');

    this.influencers = [];
    this.outreach = [];
    this.campaigns = [];
  }

  async init() {
    // Create data directory if not exists
    try {
      await fs.mkdir(this.dataDir, { recursive: true });
    } catch (err) {
      console.log('Data directory already exists');
    }

    // Load data
    await this.loadData();
  }

  async loadData() {
    try {
      const influencersData = await fs.readFile(this.influencersFile, 'utf8');
      this.influencers = JSON.parse(influencersData);
    } catch (err) {
      this.influencers = [];
    }

    try {
      const outreachData = await fs.readFile(this.outreachFile, 'utf8');
      this.outreach = JSON.parse(outreachData);
    } catch (err) {
      this.outreach = [];
    }

    try {
      const campaignsData = await fs.readFile(this.campaignsFile, 'utf8');
      this.campaigns = JSON.parse(campaignsData);
    } catch (err) {
      this.campaigns = [];
    }
  }

  async saveData() {
    await fs.writeFile(this.influencersFile, JSON.stringify(this.influencers, null, 2));
    await fs.writeFile(this.outreachFile, JSON.stringify(this.outreach, null, 2));
    await fs.writeFile(this.campaignsFile, JSON.stringify(this.campaigns, null, 2));
  }

  // Import influencers from markdown file
  async importFromMarkdown(filePath) {
    const content = await fs.readFile(filePath, 'utf8');
    const lines = content.split('\n');

    let currentTier = null;
    let imported = 0;

    for (const line of lines) {
      // Detect tier
      if (line.includes('Tier 1') || line.includes('Micro')) {
        currentTier = 'micro';
      } else if (line.includes('Tier 2') || line.includes('Mid')) {
        currentTier = 'mid';
      } else if (line.includes('Tier 3') || line.includes('Macro')) {
        currentTier = 'macro';
      }

      // Parse influencer data
      const match = line.match(/\*\*(.+?)\*\*.*?(@\w+)/);
      if (match && currentTier) {
        const [, name, handle] = match;
        const followersMatch = line.match(/([\d,]+K?)\s+followers/i);
        const followers = followersMatch ? followersMatch[1] : 'Unknown';

        this.influencers.push({
          id: `inf_${Date.now()}_${imported}`,
          name: name.trim(),
          handle: handle.trim(),
          tier: currentTier,
          followers,
          status: 'not_contacted',
          platform: 'twitter',
          notes: [],
          campaigns: [],
          createdAt: new Date().toISOString()
        });

        imported++;
      }
    }

    await this.saveData();
    return imported;
  }

  // Get influencers by status
  getByStatus(status) {
    return this.influencers.filter(inf => inf.status === status);
  }

  // Get influencers by tier
  getByTier(tier) {
    return this.influencers.filter(inf => inf.tier === tier);
  }

  // Update influencer status
  async updateStatus(influencerId, newStatus) {
    const influencer = this.influencers.find(inf => inf.id === influencerId);
    if (influencer) {
      influencer.status = newStatus;
      influencer.statusUpdatedAt = new Date().toISOString();
      await this.saveData();
      return true;
    }
    return false;
  }

  // Add note to influencer
  async addNote(influencerId, note) {
    const influencer = this.influencers.find(inf => inf.id === influencerId);
    if (influencer) {
      influencer.notes.push({
        text: note,
        createdAt: new Date().toISOString()
      });
      await this.saveData();
      return true;
    }
    return false;
  }

  // Log outreach attempt
  async logOutreach(influencerId, method, message, response = null) {
    const outreach = {
      id: `out_${Date.now()}`,
      influencerId,
      method, // 'dm', 'email', 'comment'
      message,
      response,
      sentAt: new Date().toISOString(),
      status: response ? 'responded' : 'sent'
    };

    this.outreach.push(outreach);
    await this.saveData();
    return outreach;
  }

  // Create campaign
  async createCampaign(influencerId, details) {
    const campaign = {
      id: `camp_${Date.now()}`,
      influencerId,
      ...details,
      status: 'active',
      createdAt: new Date().toISOString(),
      metrics: {
        reach: 0,
        engagement: 0,
        conversions: 0,
        roi: 0
      }
    };

    this.campaigns.push(campaign);

    const influencer = this.influencers.find(inf => inf.id === influencerId);
    if (influencer) {
      influencer.campaigns.push(campaign.id);
    }

    await this.saveData();
    return campaign;
  }

  // Update campaign metrics
  async updateCampaignMetrics(campaignId, metrics) {
    const campaign = this.campaigns.find(c => c.id === campaignId);
    if (campaign) {
      campaign.metrics = { ...campaign.metrics, ...metrics };

      // Calculate ROI
      if (campaign.cost && metrics.conversions) {
        const revenue = metrics.conversions * 100; // Assume $100 per conversion
        campaign.metrics.roi = ((revenue - campaign.cost) / campaign.cost) * 100;
      }

      await this.saveData();
      return true;
    }
    return false;
  }

  // Get pipeline stats
  getPipelineStats() {
    const stats = {
      total: this.influencers.length,
      not_contacted: 0,
      contacted: 0,
      negotiating: 0,
      partnered: 0,
      declined: 0
    };

    this.influencers.forEach(inf => {
      if (stats[inf.status] !== undefined) {
        stats[inf.status]++;
      }
    });

    return stats;
  }

  // Get top performers
  getTopPerformers(limit = 10) {
    const influencersWithROI = this.influencers
      .filter(inf => inf.campaigns && inf.campaigns.length > 0)
      .map(inf => {
        const influencerCampaigns = this.campaigns.filter(c =>
          inf.campaigns.includes(c.id)
        );

        const totalROI = influencerCampaigns.reduce((sum, c) =>
          sum + (c.metrics.roi || 0), 0
        );

        const avgROI = influencerCampaigns.length > 0
          ? totalROI / influencerCampaigns.length
          : 0;

        return { ...inf, avgROI };
      })
      .sort((a, b) => b.avgROI - a.avgROI)
      .slice(0, limit);

    return influencersWithROI;
  }

  // Generate outreach message
  generateOutreachMessage(influencer, template = 'cold') {
    const templates = {
      cold: `Hey ${influencer.name}! 👋

I've been following your content on ${influencer.platform} and love how you break down crypto topics for your ${influencer.followers} followers.

We're launching HypeAI - the first crypto token with REAL AI (LSTM + Transformer models, 85%+ prediction accuracy). Built by 15 AI agents.

Would love to partner with you for our launch. We offer:
- Competitive rates for your tier
- Early access to platform
- Performance bonuses based on engagement

Interested in learning more? 🚀

Best,
HypeAI Team`,

      warm: `Hey ${influencer.name}!

Hope you're doing well! Quick question - are you taking on any crypto partnerships right now?

We're launching HypeAI (AI-powered crypto with proven 85% prediction accuracy) and your audience would be a perfect fit.

We've got a solid offer prepared if you're interested. Let me know! 🤝`,

      referral: `Hey ${influencer.name}!

[Mutual Contact] suggested I reach out to you about HypeAI - we're launching the first genuinely AI-powered crypto token.

Given your expertise in [niche], I think your audience would really benefit from learning about our tech (LSTM models, 62% APY staking, etc.)

Open to a quick chat about partnership opportunities? 📈`
    };

    return templates[template] || templates.cold;
  }
}

// Export
module.exports = InfluencerCRM;

// CLI usage
if (require.main === module) {
  const crm = new InfluencerCRM();

  (async () => {
    await crm.init();

    const command = process.argv[2];

    if (command === 'import') {
      const filePath = process.argv[3] || '../../docs/marketing/influencer-list.md';
      const count = await crm.importFromMarkdown(filePath);
      console.log(`✅ Imported ${count} influencers`);
    }

    else if (command === 'stats') {
      const stats = crm.getPipelineStats();
      console.log('📊 Pipeline Stats:');
      console.log(stats);
    }

    else if (command === 'top') {
      const top = crm.getTopPerformers(5);
      console.log('🏆 Top Performers:');
      top.forEach((inf, i) => {
        console.log(`${i + 1}. ${inf.name} - ${inf.avgROI.toFixed(2)}% avg ROI`);
      });
    }

    else if (command === 'message') {
      const influencer = { name: 'Example', platform: 'Twitter', followers: '50K' };
      const message = crm.generateOutreachMessage(influencer, 'cold');
      console.log('💬 Sample Message:');
      console.log(message);
    }

    else {
      console.log(`
HypeAI Influencer CRM

Commands:
  import [file]  - Import influencers from markdown
  stats          - Show pipeline statistics
  top            - Show top performing influencers
  message        - Generate sample outreach message
      `);
    }
  })();
}
