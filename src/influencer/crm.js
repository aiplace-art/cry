const fs = require('fs');
const path = require('path');

/**
 * HypeAI Influencer CRM System
 * Manages 50+ influencer relationships, outreach status, contracts, and payments
 */

class InfluencerCRM {
  constructor(dataPath = path.join(__dirname, 'data')) {
    this.dataPath = dataPath;
    this.dbFile = path.join(dataPath, 'influencers.json');
    this.contractsDir = path.join(dataPath, 'contracts');
    this.notesDir = path.join(dataPath, 'notes');

    this.ensureDirectories();
    this.influencers = this.loadDatabase();
  }

  ensureDirectories() {
    [this.dataPath, this.contractsDir, this.notesDir].forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
  }

  loadDatabase() {
    if (fs.existsSync(this.dbFile)) {
      return JSON.parse(fs.readFileSync(this.dbFile, 'utf8'));
    }
    return this.initializeInfluencers();
  }

  saveDatabase() {
    fs.writeFileSync(this.dbFile, JSON.stringify(this.influencers, null, 2));
  }

  initializeInfluencers() {
    // Initialize 50+ influencers from the list
    return [
      // TIER 1: MICRO-INFLUENCERS
      // Twitter Crypto Analysts
      { id: 1, name: '@CryptoCapo_', platform: 'Twitter', followers: 45000, tier: 1, niche: 'Technical Analysis',
        engagement: 0.04, status: 'not_contacted', budget: 300, email: '', notes: [], contractStatus: 'none',
        payments: [], campaigns: [], outreachDate: null, lastContact: null, priority: 'medium' },
      { id: 2, name: '@AltcoinGordon', platform: 'Twitter', followers: 38000, tier: 1, niche: 'Altcoin Gems',
        engagement: 0.04, status: 'not_contacted', budget: 250, email: '', notes: [], contractStatus: 'none',
        payments: [], campaigns: [], outreachDate: null, lastContact: null, priority: 'high' },
      { id: 3, name: '@CryptoRoverr', platform: 'Twitter', followers: 42000, tier: 1, niche: 'On-chain Analysis',
        engagement: 0.035, status: 'not_contacted', budget: 280, email: '', notes: [], contractStatus: 'none',
        payments: [], campaigns: [], outreachDate: null, lastContact: null, priority: 'high' },
      { id: 4, name: '@CryptoBull2020', platform: 'Twitter', followers: 35000, tier: 1, niche: 'Bitcoin Macro',
        engagement: 0.042, status: 'not_contacted', budget: 240, email: '', notes: [], contractStatus: 'none',
        payments: [], campaigns: [], outreachDate: null, lastContact: null, priority: 'medium' },
      { id: 5, name: '@IncomeSharks', platform: 'Twitter', followers: 48000, tier: 1, niche: 'Passive Income/DeFi',
        engagement: 0.038, status: 'not_contacted', budget: 320, email: '', notes: [], contractStatus: 'none',
        payments: [], campaigns: [], outreachDate: null, lastContact: null, priority: 'high' },
      { id: 6, name: '@TraderXO', platform: 'Twitter', followers: 31000, tier: 1, niche: 'Day Trading',
        engagement: 0.05, status: 'not_contacted', budget: 230, email: '', notes: [], contractStatus: 'none',
        payments: [], campaigns: [], outreachDate: null, lastContact: null, priority: 'medium' },
      { id: 7, name: '@CryptoELITES', platform: 'Twitter', followers: 29000, tier: 1, niche: 'News/Sentiment',
        engagement: 0.032, status: 'not_contacted', budget: 220, email: '', notes: [], contractStatus: 'none',
        payments: [], campaigns: [], outreachDate: null, lastContact: null, priority: 'low' },
      { id: 8, name: '@TheCryptoDog', platform: 'Twitter', followers: 44000, tier: 1, niche: 'Memes/Community',
        engagement: 0.06, status: 'not_contacted', budget: 290, email: '', notes: [], contractStatus: 'none',
        payments: [], campaigns: [], outreachDate: null, lastContact: null, priority: 'high' },
      { id: 9, name: '@CryptoMessiah', platform: 'Twitter', followers: 37000, tier: 1, niche: 'Education/Beginner',
        engagement: 0.045, status: 'not_contacted', budget: 260, email: '', notes: [], contractStatus: 'none',
        payments: [], campaigns: [], outreachDate: null, lastContact: null, priority: 'medium' },
      { id: 10, name: '@MoonOverlord', platform: 'Twitter', followers: 41000, tier: 1, niche: 'Altcoin Moonshots',
        engagement: 0.04, status: 'not_contacted', budget: 270, email: '', notes: [], contractStatus: 'none',
        payments: [], campaigns: [], outreachDate: null, lastContact: null, priority: 'high' },

      // TikTok/Reels Educators
      { id: 11, name: '@CryptoCrewUniversity', platform: 'TikTok', followers: 47000, tier: 1, niche: 'Education',
        engagement: 0.08, status: 'not_contacted', budget: 310, email: '', notes: [], contractStatus: 'none',
        payments: [], campaigns: [], outreachDate: null, lastContact: null, priority: 'high' },
      { id: 12, name: '@AltcoinDaily_TikTok', platform: 'TikTok', followers: 35000, tier: 1, niche: 'Daily News',
        engagement: 0.06, status: 'not_contacted', budget: 240, email: '', notes: [], contractStatus: 'none',
        payments: [], campaigns: [], outreachDate: null, lastContact: null, priority: 'medium' },
      { id: 13, name: '@CryptoWendyO_TikTok', platform: 'TikTok', followers: 29000, tier: 1, niche: 'Lifestyle/Female',
        engagement: 0.10, status: 'not_contacted', budget: 220, email: '', notes: [], contractStatus: 'none',
        payments: [], campaigns: [], outreachDate: null, lastContact: null, priority: 'high' },
      { id: 14, name: '@TheMoonCarl', platform: 'TikTok', followers: 42000, tier: 1, niche: 'Comedy/Memes',
        engagement: 0.09, status: 'not_contacted', budget: 280, email: '', notes: [], contractStatus: 'none',
        payments: [], campaigns: [], outreachDate: null, lastContact: null, priority: 'high' },
      { id: 15, name: '@CryptoBanter_TikTok', platform: 'TikTok', followers: 38000, tier: 1, niche: 'Trading Clips',
        engagement: 0.07, status: 'not_contacted', budget: 260, email: '', notes: [], contractStatus: 'none',
        payments: [], campaigns: [], outreachDate: null, lastContact: null, priority: 'medium' },
      { id: 16, name: '@BlockchainBoy', platform: 'Instagram', followers: 33000, tier: 1, niche: 'Tech/NFTs',
        engagement: 0.065, status: 'not_contacted', budget: 235, email: '', notes: [], contractStatus: 'none',
        payments: [], campaigns: [], outreachDate: null, lastContact: null, priority: 'medium' },
      { id: 17, name: '@CryptoGirlBoss', platform: 'TikTok', followers: 26000, tier: 1, niche: 'Empowerment/Female',
        engagement: 0.08, status: 'not_contacted', budget: 210, email: '', notes: [], contractStatus: 'none',
        payments: [], campaigns: [], outreachDate: null, lastContact: null, priority: 'high' },
      { id: 18, name: '@SatoshiStacker', platform: 'Instagram', followers: 31000, tier: 1, niche: 'Bitcoin',
        engagement: 0.05, status: 'not_contacted', budget: 230, email: '', notes: [], contractStatus: 'none',
        payments: [], campaigns: [], outreachDate: null, lastContact: null, priority: 'low' },
      { id: 19, name: '@DeFiDad_TikTok', platform: 'TikTok', followers: 28000, tier: 1, niche: 'DeFi',
        engagement: 0.07, status: 'not_contacted', budget: 215, email: '', notes: [], contractStatus: 'none',
        payments: [], campaigns: [], outreachDate: null, lastContact: null, priority: 'medium' },
      { id: 20, name: '@CryptoZilla', platform: 'TikTok', followers: 40000, tier: 1, niche: 'Project Reviews',
        engagement: 0.06, status: 'not_contacted', budget: 270, email: '', notes: [], contractStatus: 'none',
        payments: [], campaigns: [], outreachDate: null, lastContact: null, priority: 'high' },

      // YouTube Channels
      { id: 21, name: 'Crypto Jebb', platform: 'YouTube', followers: 46000, tier: 1, niche: 'Daily Updates',
        engagement: 0.04, status: 'not_contacted', budget: 400, email: '', notes: [], contractStatus: 'none',
        payments: [], campaigns: [], outreachDate: null, lastContact: null, priority: 'high' },
      { id: 22, name: 'Crypto Rover', platform: 'YouTube', followers: 39000, tier: 1, niche: 'TA Education',
        engagement: 0.05, status: 'not_contacted', budget: 350, email: '', notes: [], contractStatus: 'none',
        payments: [], campaigns: [], outreachDate: null, lastContact: null, priority: 'high' },
      { id: 23, name: 'Crypto Blood', platform: 'YouTube', followers: 34000, tier: 1, niche: 'Deep Dives',
        engagement: 0.035, status: 'not_contacted', budget: 320, email: '', notes: [], contractStatus: 'none',
        payments: [], campaigns: [], outreachDate: null, lastContact: null, priority: 'medium' },
      { id: 24, name: 'Krown\'s Crypto Cave', platform: 'YouTube', followers: 41000, tier: 1, niche: 'Bitcoin TA',
        engagement: 0.042, status: 'not_contacted', budget: 370, email: '', notes: [], contractStatus: 'none',
        payments: [], campaigns: [], outreachDate: null, lastContact: null, priority: 'medium' },
      { id: 25, name: 'Crypto Kirby', platform: 'YouTube', followers: 37000, tier: 1, niche: 'Altcoin Trading',
        engagement: 0.038, status: 'not_contacted', budget: 340, email: '', notes: [], contractStatus: 'none',
        payments: [], campaigns: [], outreachDate: null, lastContact: null, priority: 'high' },
      { id: 26, name: 'MMCrypto', platform: 'YouTube', followers: 48000, tier: 1, niche: 'Daily News',
        engagement: 0.045, status: 'not_contacted', budget: 410, email: '', notes: [], contractStatus: 'none',
        payments: [], campaigns: [], outreachDate: null, lastContact: null, priority: 'high' },
      { id: 27, name: 'Crypto Zombie', platform: 'YouTube', followers: 43000, tier: 1, niche: 'Entertainment',
        engagement: 0.052, status: 'not_contacted', budget: 380, email: '', notes: [], contractStatus: 'none',
        payments: [], campaigns: [], outreachDate: null, lastContact: null, priority: 'high' },
      { id: 28, name: 'Sheldon Evans', platform: 'YouTube', followers: 32000, tier: 1, niche: 'Passive Income',
        engagement: 0.04, status: 'not_contacted', budget: 310, email: '', notes: [], contractStatus: 'none',
        payments: [], campaigns: [], outreachDate: null, lastContact: null, priority: 'high' },
      { id: 29, name: 'Crypto Daily', platform: 'YouTube', followers: 45000, tier: 1, niche: 'Humor/News',
        engagement: 0.06, status: 'not_contacted', budget: 390, email: '', notes: [], contractStatus: 'none',
        payments: [], campaigns: [], outreachDate: null, lastContact: null, priority: 'medium' },
      { id: 30, name: 'Davincij15', platform: 'YouTube', followers: 50000, tier: 1, niche: 'Bitcoin OG',
        engagement: 0.03, status: 'not_contacted', budget: 420, email: '', notes: [], contractStatus: 'none',
        payments: [], campaigns: [], outreachDate: null, lastContact: null, priority: 'medium' },

      // TIER 2: MID-TIER INFLUENCERS
      { id: 31, name: '@APompliano', platform: 'Twitter', followers: 1600000, tier: 2, niche: 'Bitcoin/Macro',
        engagement: 0.015, status: 'not_contacted', budget: 15000, email: '', notes: [], contractStatus: 'none',
        payments: [], campaigns: [], outreachDate: null, lastContact: null, priority: 'critical' },
      { id: 32, name: '@CryptoCred', platform: 'Twitter', followers: 680000, tier: 2, niche: 'Trading Education',
        engagement: 0.02, status: 'not_contacted', budget: 7500, email: '', notes: [], contractStatus: 'none',
        payments: [], campaigns: [], outreachDate: null, lastContact: null, priority: 'critical' },
      { id: 33, name: '@CryptoWendyO', platform: 'Twitter', followers: 320000, tier: 2, niche: 'Female Advocate',
        engagement: 0.025, status: 'not_contacted', budget: 4000, email: '', notes: [], contractStatus: 'none',
        payments: [], campaigns: [], outreachDate: null, lastContact: null, priority: 'high' },
      { id: 34, name: '@TheCryptoDog_Main', platform: 'Twitter', followers: 850000, tier: 2, niche: 'Memes',
        engagement: 0.03, status: 'not_contacted', budget: 10000, email: '', notes: [], contractStatus: 'none',
        payments: [], campaigns: [], outreachDate: null, lastContact: null, priority: 'critical' },
      { id: 35, name: '@LayahHeilpern', platform: 'Twitter', followers: 425000, tier: 2, niche: 'Journalism',
        engagement: 0.022, status: 'not_contacted', budget: 5000, email: '', notes: [], contractStatus: 'none',
        payments: [], campaigns: [], outreachDate: null, lastContact: null, priority: 'high' },
      { id: 36, name: '@IvanOnTech', platform: 'Twitter', followers: 510000, tier: 2, niche: 'Developer Focus',
        engagement: 0.018, status: 'not_contacted', budget: 6500, email: '', notes: [], contractStatus: 'none',
        payments: [], campaigns: [], outreachDate: null, lastContact: null, priority: 'high' },
      { id: 37, name: '@AltcoinDaily', platform: 'Twitter', followers: 780000, tier: 2, niche: 'Daily News',
        engagement: 0.02, status: 'not_contacted', budget: 8500, email: '', notes: [], contractStatus: 'none',
        payments: [], campaigns: [], outreachDate: null, lastContact: null, priority: 'critical' },
      { id: 38, name: '@CoinBureau', platform: 'Twitter', followers: 920000, tier: 2, niche: 'Education',
        engagement: 0.017, status: 'not_contacted', budget: 12500, email: '', notes: [], contractStatus: 'none',
        payments: [], campaigns: [], outreachDate: null, lastContact: null, priority: 'critical' },
      { id: 39, name: 'DataDash', platform: 'YouTube', followers: 520000, tier: 2, niche: 'Market Analysis',
        engagement: 0.03, status: 'not_contacted', budget: 10000, email: '', notes: [], contractStatus: 'none',
        payments: [], campaigns: [], outreachDate: null, lastContact: null, priority: 'critical' },
      { id: 40, name: 'Crypto Casey', platform: 'YouTube', followers: 310000, tier: 2, niche: 'Beginner Education',
        engagement: 0.04, status: 'not_contacted', budget: 6500, email: '', notes: [], contractStatus: 'none',
        payments: [], campaigns: [], outreachDate: null, lastContact: null, priority: 'high' },
      { id: 41, name: 'Lark Davis', platform: 'YouTube', followers: 495000, tier: 2, niche: 'Altcoin Analysis',
        engagement: 0.035, status: 'not_contacted', budget: 8500, email: '', notes: [], contractStatus: 'none',
        payments: [], campaigns: [], outreachDate: null, lastContact: null, priority: 'critical' },
      { id: 42, name: 'Coin Bureau YouTube', platform: 'YouTube', followers: 2400000, tier: 2, niche: 'Deep Dives',
        engagement: 0.025, status: 'not_contacted', budget: 25000, email: '', notes: [], contractStatus: 'none',
        payments: [], campaigns: [], outreachDate: null, lastContact: null, priority: 'critical' },
      { id: 43, name: 'BitBoy Crypto', platform: 'YouTube', followers: 1500000, tier: 2, niche: 'News/Altcoins',
        engagement: 0.02, status: 'not_contacted', budget: 20000, email: '', notes: [], contractStatus: 'none',
        payments: [], campaigns: [], outreachDate: null, lastContact: null, priority: 'critical' },
      { id: 44, name: 'Crypto VIP Signal', platform: 'Telegram', followers: 185000, tier: 2, niche: 'Trading Signals',
        engagement: 0.30, status: 'not_contacted', budget: 6500, email: '', notes: [], contractStatus: 'none',
        payments: [], campaigns: [], outreachDate: null, lastContact: null, priority: 'high' },
      { id: 45, name: 'Wolf Of All Streets', platform: 'Discord', followers: 45000, tier: 2, niche: 'Trading Community',
        engagement: 0.25, status: 'not_contacted', budget: 4000, email: '', notes: [], contractStatus: 'none',
        payments: [], campaigns: [], outreachDate: null, lastContact: null, priority: 'high' },

      // TIER 3: MACRO-INFLUENCERS
      { id: 46, name: '@VitalikButerin', platform: 'Twitter', followers: 5200000, tier: 3, niche: 'Ethereum/Tech',
        engagement: 0.01, status: 'not_contacted', budget: 0, email: '', notes: [], contractStatus: 'none',
        payments: [], campaigns: [], outreachDate: null, lastContact: null, priority: 'strategic' },
      { id: 47, name: '@CZ_Binance', platform: 'Twitter', followers: 8500000, tier: 3, niche: 'Exchange/Industry',
        engagement: 0.008, status: 'not_contacted', budget: 0, email: '', notes: [], contractStatus: 'none',
        payments: [], campaigns: [], outreachDate: null, lastContact: null, priority: 'strategic' },
      { id: 48, name: '@elonmusk', platform: 'Twitter', followers: 180000000, tier: 3, niche: 'Tech/Memes',
        engagement: 0.005, status: 'not_contacted', budget: 0, email: '', notes: [], contractStatus: 'none',
        payments: [], campaigns: [], outreachDate: null, lastContact: null, priority: 'aspirational' },
      { id: 49, name: '@Cointelegraph', platform: 'Twitter', followers: 2100000, tier: 3, niche: 'News Media',
        engagement: 0.012, status: 'not_contacted', budget: 15000, email: '', notes: [], contractStatus: 'none',
        payments: [], campaigns: [], outreachDate: null, lastContact: null, priority: 'critical' },
      { id: 50, name: '@TheBlock__', platform: 'Twitter', followers: 920000, tier: 3, niche: 'Journalism',
        engagement: 0.015, status: 'not_contacted', budget: 11500, email: '', notes: [], contractStatus: 'none',
        payments: [], campaigns: [], outreachDate: null, lastContact: null, priority: 'critical' }
    ];
  }

  // CRUD Operations
  getAllInfluencers() {
    return this.influencers;
  }

  getInfluencerById(id) {
    return this.influencers.find(inf => inf.id === id);
  }

  getInfluencersByStatus(status) {
    return this.influencers.filter(inf => inf.status === status);
  }

  getInfluencersByTier(tier) {
    return this.influencers.filter(inf => inf.tier === tier);
  }

  getInfluencersByPriority(priority) {
    return this.influencers.filter(inf => inf.priority === priority);
  }

  updateInfluencerStatus(id, newStatus) {
    const influencer = this.getInfluencerById(id);
    if (influencer) {
      influencer.status = newStatus;
      influencer.lastContact = new Date().toISOString();
      if (newStatus === 'contacted' && !influencer.outreachDate) {
        influencer.outreachDate = new Date().toISOString();
      }
      this.saveDatabase();
      return influencer;
    }
    return null;
  }

  updateInfluencerEmail(id, email) {
    const influencer = this.getInfluencerById(id);
    if (influencer) {
      influencer.email = email;
      this.saveDatabase();
      return influencer;
    }
    return null;
  }

  addNote(id, note) {
    const influencer = this.getInfluencerById(id);
    if (influencer) {
      const noteEntry = {
        date: new Date().toISOString(),
        content: note,
        author: 'System'
      };
      influencer.notes.push(noteEntry);
      this.saveDatabase();

      // Also save to notes file
      const noteFile = path.join(this.notesDir, `influencer-${id}.txt`);
      const noteText = `[${noteEntry.date}] ${noteEntry.content}\n`;
      fs.appendFileSync(noteFile, noteText);

      return influencer;
    }
    return null;
  }

  updateContractStatus(id, status, contractDetails = null) {
    const influencer = this.getInfluencerById(id);
    if (influencer) {
      influencer.contractStatus = status;
      if (contractDetails) {
        const contractFile = path.join(this.contractsDir, `contract-${id}.json`);
        fs.writeFileSync(contractFile, JSON.stringify({
          influencerId: id,
          influencerName: influencer.name,
          status: status,
          details: contractDetails,
          createdAt: new Date().toISOString()
        }, null, 2));
      }
      this.saveDatabase();
      return influencer;
    }
    return null;
  }

  addPayment(id, paymentData) {
    const influencer = this.getInfluencerById(id);
    if (influencer) {
      const payment = {
        id: Date.now(),
        amount: paymentData.amount,
        date: new Date().toISOString(),
        method: paymentData.method || 'bank_transfer',
        status: paymentData.status || 'pending',
        campaignId: paymentData.campaignId,
        notes: paymentData.notes || ''
      };
      influencer.payments.push(payment);
      this.saveDatabase();
      return payment;
    }
    return null;
  }

  addCampaign(id, campaignData) {
    const influencer = this.getInfluencerById(id);
    if (influencer) {
      const campaign = {
        id: Date.now(),
        name: campaignData.name,
        startDate: campaignData.startDate || new Date().toISOString(),
        endDate: campaignData.endDate,
        deliverables: campaignData.deliverables || [],
        status: campaignData.status || 'active',
        budget: campaignData.budget,
        performance: {
          reach: 0,
          engagement: 0,
          clicks: 0,
          conversions: 0,
          roi: 0
        }
      };
      influencer.campaigns.push(campaign);
      this.saveDatabase();
      return campaign;
    }
    return null;
  }

  // Analytics
  getStatistics() {
    const total = this.influencers.length;
    const byStatus = {
      not_contacted: this.getInfluencersByStatus('not_contacted').length,
      contacted: this.getInfluencersByStatus('contacted').length,
      negotiating: this.getInfluencersByStatus('negotiating').length,
      partnered: this.getInfluencersByStatus('partnered').length,
      declined: this.getInfluencersByStatus('declined').length
    };

    const byTier = {
      tier1: this.getInfluencersByTier(1).length,
      tier2: this.getInfluencersByTier(2).length,
      tier3: this.getInfluencersByTier(3).length
    };

    const totalBudget = this.influencers.reduce((sum, inf) => sum + inf.budget, 0);
    const totalReach = this.influencers.reduce((sum, inf) => sum + inf.followers, 0);

    const totalSpent = this.influencers.reduce((sum, inf) => {
      return sum + inf.payments
        .filter(p => p.status === 'completed')
        .reduce((psum, p) => psum + p.amount, 0);
    }, 0);

    return {
      total,
      byStatus,
      byTier,
      totalBudget,
      totalReach,
      totalSpent,
      averageEngagement: (this.influencers.reduce((sum, inf) => sum + inf.engagement, 0) / total).toFixed(3)
    };
  }

  getPipeline() {
    return {
      not_contacted: this.getInfluencersByStatus('not_contacted'),
      contacted: this.getInfluencersByStatus('contacted'),
      negotiating: this.getInfluencersByStatus('negotiating'),
      partnered: this.getInfluencersByStatus('partnered'),
      declined: this.getInfluencersByStatus('declined')
    };
  }

  getHighPriorityInfluencers() {
    return this.influencers
      .filter(inf => ['critical', 'high'].includes(inf.priority))
      .sort((a, b) => {
        const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      });
  }

  getFollowUpNeeded() {
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    return this.influencers.filter(inf => {
      if (inf.status === 'contacted' && inf.lastContact) {
        const lastContact = new Date(inf.lastContact);
        return lastContact < threeDaysAgo;
      }
      return false;
    });
  }

  exportToCSV() {
    const headers = ['ID', 'Name', 'Platform', 'Followers', 'Tier', 'Niche', 'Engagement', 'Status', 'Budget', 'Priority'];
    const rows = this.influencers.map(inf => [
      inf.id,
      inf.name,
      inf.platform,
      inf.followers,
      inf.tier,
      inf.niche,
      inf.engagement,
      inf.status,
      inf.budget,
      inf.priority
    ]);

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const csvFile = path.join(this.dataPath, 'influencers-export.csv');
    fs.writeFileSync(csvFile, csv);
    return csvFile;
  }
}

module.exports = InfluencerCRM;
