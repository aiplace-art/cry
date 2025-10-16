/**
 * Growth Hacker Bot - Ethical Partnership & Community Growth
 *
 * Focus: Building genuine partnerships and collaborations in crypto space
 * Ethics: 100% consent-based, human-approved outreach, no spam
 *
 * Features:
 * - Partnership opportunity finder
 * - AMA scheduling
 * - Influencer collaboration discovery
 * - Competitor analysis (legal only)
 * - Cross-promotion opportunities
 */

const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');
const cron = require('node-cron');
const fs = require('fs').promises;
const path = require('path');

class GrowthHackerBot {
  constructor(config) {
    this.bot = new TelegramBot(config.telegramToken, { polling: true });
    this.adminId = config.adminId;
    this.projectName = config.projectName || 'Your Crypto Project';
    this.projectDescription = config.projectDescription || '';
    this.projectWebsite = config.projectWebsite || '';

    // Data storage paths
    this.dataDir = path.join(__dirname, '..', 'data', 'growth-hacker');
    this.partnershipsFile = path.join(this.dataDir, 'partnerships.json');
    this.opportunitiesFile = path.join(this.dataDir, 'opportunities.json');
    this.analyticsFile = path.join(this.dataDir, 'analytics.json');
    this.templatesFile = path.join(this.dataDir, 'templates.json');

    // In-memory data
    this.partnerships = [];
    this.opportunities = [];
    this.analytics = {
      totalOpportunitiesFound: 0,
      totalOutreachSent: 0,
      totalResponses: 0,
      totalPartnerships: 0,
      successRate: 0,
      avgResponseTime: 0
    };

    // Pending approvals
    this.pendingApprovals = new Map();

    this.init();
  }

  async init() {
    await this.ensureDataDirectory();
    await this.loadData();
    this.setupCommands();
    this.setupCallbacks();
    this.scheduleOpportunityScanning();
    console.log('Growth Hacker Bot initialized - Ethical growth mode activated!');
  }

  async ensureDataDirectory() {
    try {
      await fs.mkdir(this.dataDir, { recursive: true });
    } catch (error) {
      console.error('Error creating data directory:', error);
    }
  }

  async loadData() {
    try {
      const [partnerships, opportunities, analytics] = await Promise.all([
        this.loadJSON(this.partnershipsFile, []),
        this.loadJSON(this.opportunitiesFile, []),
        this.loadJSON(this.analyticsFile, this.analytics)
      ]);

      this.partnerships = partnerships;
      this.opportunities = opportunities;
      this.analytics = analytics;
    } catch (error) {
      console.error('Error loading data:', error);
    }
  }

  async loadJSON(filePath, defaultValue) {
    try {
      const data = await fs.readFile(filePath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      return defaultValue;
    }
  }

  async saveJSON(filePath, data) {
    try {
      await fs.writeFile(filePath, JSON.stringify(data, null, 2));
    } catch (error) {
      console.error(`Error saving to ${filePath}:`, error);
    }
  }

  setupCommands() {
    // Main menu
    this.bot.onText(/\/start/, (msg) => this.handleStart(msg));
    this.bot.onText(/\/help/, (msg) => this.handleHelp(msg));

    // Opportunity discovery
    this.bot.onText(/\/find_partners/, (msg) => this.findPartnershipOpportunities(msg));
    this.bot.onText(/\/find_amas/, (msg) => this.findAMAOpportunities(msg));
    this.bot.onText(/\/find_influencers/, (msg) => this.findInfluencerOpportunities(msg));
    this.bot.onText(/\/analyze_competitors/, (msg) => this.analyzeCompetitors(msg));

    // Outreach management
    this.bot.onText(/\/pending_approvals/, (msg) => this.showPendingApprovals(msg));
    this.bot.onText(/\/outreach_templates/, (msg) => this.showOutreachTemplates(msg));
    this.bot.onText(/\/customize_template (.+)/, (msg, match) => this.customizeTemplate(msg, match[1]));

    // Partnership tracking
    this.bot.onText(/\/my_partnerships/, (msg) => this.showPartnerships(msg));
    this.bot.onText(/\/track_partnership (.+)/, (msg, match) => this.trackPartnership(msg, match[1]));

    // Analytics
    this.bot.onText(/\/analytics/, (msg) => this.showAnalytics(msg));
    this.bot.onText(/\/growth_report/, (msg) => this.generateGrowthReport(msg));

    // Settings
    this.bot.onText(/\/update_project/, (msg) => this.updateProjectInfo(msg));
    this.bot.onText(/\/set_auto_scan (.+)/, (msg, match) => this.setAutoScan(msg, match[1]));
  }

  setupCallbacks() {
    this.bot.on('callback_query', async (query) => {
      const action = query.data;
      const msg = query.message;

      if (action.startsWith('approve_')) {
        await this.handleApproval(query, true);
      } else if (action.startsWith('reject_')) {
        await this.handleApproval(query, false);
      } else if (action.startsWith('customize_')) {
        await this.handleCustomization(query);
      } else if (action.startsWith('view_opp_')) {
        await this.viewOpportunityDetails(query);
      }

      await this.bot.answerCallbackQuery(query.id);
    });
  }

  async handleStart(msg) {
    const chatId = msg.chat.id;

    const welcomeMessage = `
🚀 *Growth Hacker Bot - Ethical Edition*

Welcome to your ethical growth partner! I help you build genuine partnerships and collaborations in the crypto space.

*What I DO:*
✅ Find partnership opportunities with similar projects
✅ Discover AMA hosting opportunities
✅ Identify influencers for collaboration
✅ Analyze competitor strategies (legally!)
✅ Suggest cross-promotion ideas

*What I DON'T DO:*
❌ Spam communities
❌ Send unsolicited messages
❌ Use aggressive tactics
❌ Violate platform rules

*Quick Start:*
/find_partners - Find partnership opportunities
/find_amas - Discover AMA opportunities
/find_influencers - Find collaboration opportunities
/analytics - View growth metrics

*All outreach requires your approval! 👍*
    `;

    await this.bot.sendMessage(chatId, welcomeMessage, { parse_mode: 'Markdown' });
  }

  async handleHelp(msg) {
    const chatId = msg.chat.id;

    const helpMessage = `
📚 *Growth Hacker Bot - Command Guide*

*🔍 Discovery Commands:*
/find_partners - Scan for partnership opportunities
/find_amas - Find AMA hosting groups
/find_influencers - Discover crypto influencers
/analyze_competitors - Legal competitor analysis

*📝 Outreach Commands:*
/pending_approvals - Review pending outreach
/outreach_templates - View message templates
/customize_template <type> - Edit templates

*🤝 Partnership Management:*
/my_partnerships - View active partnerships
/track_partnership <name> - Track partnership details

*📊 Analytics Commands:*
/analytics - View growth metrics
/growth_report - Generate detailed report

*⚙️ Settings:*
/update_project - Update project information
/set_auto_scan <on/off> - Auto opportunity scanning

*Need help? Contact admin!*
    `;

    await this.bot.sendMessage(chatId, helpMessage, { parse_mode: 'Markdown' });
  }

  async findPartnershipOpportunities(msg) {
    const chatId = msg.chat.id;

    await this.bot.sendMessage(chatId, '🔍 Scanning for partnership opportunities...');

    // Simulate opportunity discovery
    const opportunities = await this.scanForPartners();

    if (opportunities.length === 0) {
      await this.bot.sendMessage(chatId, 'No new opportunities found at this time. Try again later!');
      return;
    }

    this.analytics.totalOpportunitiesFound += opportunities.length;
    await this.saveJSON(this.analyticsFile, this.analytics);

    let message = `✨ *Found ${opportunities.length} Partnership Opportunities*\n\n`;

    opportunities.forEach((opp, index) => {
      message += `${index + 1}. *${opp.name}*\n`;
      message += `   Category: ${opp.category}\n`;
      message += `   Size: ${opp.communitySize} members\n`;
      message += `   Match Score: ${opp.matchScore}%\n`;
      message += `   Reason: ${opp.reason}\n\n`;
    });

    const keyboard = {
      inline_keyboard: opportunities.map((opp, index) => [{
        text: `View Details - ${opp.name}`,
        callback_data: `view_opp_${index}`
      }])
    };

    await this.bot.sendMessage(chatId, message, {
      parse_mode: 'Markdown',
      reply_markup: keyboard
    });

    // Store opportunities
    this.opportunities = [...this.opportunities, ...opportunities];
    await this.saveJSON(this.opportunitiesFile, this.opportunities);
  }

  async scanForPartners() {
    // This is a simulation - in production, this would use APIs or web scraping
    const potentialPartners = [
      {
        id: `partner_${Date.now()}_1`,
        name: 'DeFi Yield Protocol',
        category: 'DeFi',
        communitySize: 15000,
        matchScore: 85,
        reason: 'Similar target audience, complementary features',
        contact: 'telegram: @defi_yield_admin',
        website: 'https://example.com',
        type: 'partnership',
        status: 'discovered',
        discoveredAt: new Date().toISOString()
      },
      {
        id: `partner_${Date.now()}_2`,
        name: 'Crypto Education DAO',
        category: 'Education',
        communitySize: 8000,
        matchScore: 72,
        reason: 'Great for educational content collaboration',
        contact: 'twitter: @crypto_edu_dao',
        website: 'https://example.com',
        type: 'partnership',
        status: 'discovered',
        discoveredAt: new Date().toISOString()
      },
      {
        id: `partner_${Date.now()}_3`,
        name: 'NFT Artists Collective',
        category: 'NFT',
        communitySize: 12000,
        matchScore: 68,
        reason: 'Cross-promotion potential with NFT community',
        contact: 'discord: nft_artists',
        website: 'https://example.com',
        type: 'partnership',
        status: 'discovered',
        discoveredAt: new Date().toISOString()
      }
    ];

    // Randomly return 1-3 opportunities
    const count = Math.floor(Math.random() * 3) + 1;
    return potentialPartners.slice(0, count);
  }

  async findAMAOpportunities(msg) {
    const chatId = msg.chat.id;

    await this.bot.sendMessage(chatId, '🔍 Searching for AMA opportunities...');

    const amaOpportunities = await this.scanForAMAs();

    if (amaOpportunities.length === 0) {
      await this.bot.sendMessage(chatId, 'No AMA opportunities found. Keep building your project!');
      return;
    }

    let message = `🎤 *Found ${amaOpportunities.length} AMA Opportunities*\n\n`;

    amaOpportunities.forEach((ama, index) => {
      message += `${index + 1}. *${ama.communityName}*\n`;
      message += `   Members: ${ama.memberCount}\n`;
      message += `   Frequency: ${ama.amaFrequency}\n`;
      message += `   Last AMA: ${ama.lastAMA}\n`;
      message += `   Application: ${ama.applicationProcess}\n\n`;
    });

    message += `\n💡 *Tip:* Customize your pitch for each community!\n`;
    message += `Use /outreach_templates to see AMA pitch templates.`;

    await this.bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });

    // Store opportunities
    this.opportunities = [...this.opportunities, ...amaOpportunities];
    await this.saveJSON(this.opportunitiesFile, this.opportunities);
  }

  async scanForAMAs() {
    const amaGroups = [
      {
        id: `ama_${Date.now()}_1`,
        communityName: 'DeFi Discussions',
        memberCount: 25000,
        amaFrequency: 'Weekly',
        lastAMA: '3 days ago',
        applicationProcess: 'DM admin with project details',
        contact: '@defi_admin',
        requirements: 'Minimum 1000 community members',
        type: 'ama',
        status: 'discovered',
        discoveredAt: new Date().toISOString()
      },
      {
        id: `ama_${Date.now()}_2`,
        communityName: 'Crypto Innovators Hub',
        memberCount: 18000,
        amaFrequency: 'Bi-weekly',
        lastAMA: '1 week ago',
        applicationProcess: 'Fill application form',
        contact: 'https://forms.example.com',
        requirements: 'Innovative technology or unique use case',
        type: 'ama',
        status: 'discovered',
        discoveredAt: new Date().toISOString()
      }
    ];

    return amaGroups;
  }

  async findInfluencerOpportunities(msg) {
    const chatId = msg.chat.id;

    await this.bot.sendMessage(chatId, '🔍 Identifying collaboration opportunities with influencers...');

    const influencers = await this.scanForInfluencers();

    let message = `🌟 *Found ${influencers.length} Potential Collaborators*\n\n`;

    influencers.forEach((influencer, index) => {
      message += `${index + 1}. *${influencer.name}*\n`;
      message += `   Platform: ${influencer.platform}\n`;
      message += `   Followers: ${influencer.followers}\n`;
      message += `   Focus: ${influencer.focus}\n`;
      message += `   Engagement: ${influencer.engagement}\n`;
      message += `   Collaboration Type: ${influencer.collaborationType}\n\n`;
    });

    message += `\n⚠️ *Remember:*\n`;
    message += `• Always offer value first\n`;
    message += `• Personalize every message\n`;
    message += `• Respect their time\n`;
    message += `• Build genuine relationships`;

    await this.bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
  }

  async scanForInfluencers() {
    const influencers = [
      {
        id: `influencer_${Date.now()}_1`,
        name: 'CryptoAnalyst Pro',
        platform: 'Twitter + YouTube',
        followers: '125K',
        focus: 'DeFi Analysis',
        engagement: 'High (4.5%)',
        collaborationType: 'Educational content partnership',
        contact: '@crypto_analyst_pro',
        type: 'influencer',
        status: 'discovered',
        discoveredAt: new Date().toISOString()
      },
      {
        id: `influencer_${Date.now()}_2`,
        name: 'Blockchain Educator',
        platform: 'YouTube',
        followers: '85K',
        focus: 'Tech Tutorials',
        engagement: 'Very High (6.2%)',
        collaborationType: 'Tutorial video collaboration',
        contact: 'youtube.com/blockchain_edu',
        type: 'influencer',
        status: 'discovered',
        discoveredAt: new Date().toISOString()
      }
    ];

    return influencers;
  }

  async analyzeCompetitors(msg) {
    const chatId = msg.chat.id;

    await this.bot.sendMessage(chatId, '📊 Analyzing competitor strategies (legally)...');

    const analysis = await this.performCompetitorAnalysis();

    let message = `📈 *Competitor Strategy Analysis*\n\n`;

    analysis.forEach((competitor, index) => {
      message += `${index + 1}. *${competitor.name}*\n`;
      message += `   Strategy: ${competitor.strategy}\n`;
      message += `   Growth Tactics: ${competitor.tactics}\n`;
      message += `   Community Size: ${competitor.communitySize}\n`;
      message += `   Lessons: ${competitor.lessons}\n\n`;
    });

    message += `\n💡 *Key Insights:*\n`;
    message += `• Focus on community engagement\n`;
    message += `• Educational content performs well\n`;
    message += `• Partnerships accelerate growth\n`;
    message += `• Consistency is crucial`;

    await this.bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
  }

  async performCompetitorAnalysis() {
    // This is ethical analysis based on public information only
    const competitors = [
      {
        name: 'Similar DeFi Project A',
        strategy: 'Partnership-first growth',
        tactics: 'Weekly AMAs, influencer collaborations',
        communitySize: '50K members',
        lessons: 'Consistent engagement builds trust'
      },
      {
        name: 'Similar DeFi Project B',
        strategy: 'Educational content marketing',
        tactics: 'Tutorial videos, blog posts, workshops',
        communitySize: '35K members',
        lessons: 'Value-first approach attracts quality users'
      }
    ];

    return competitors;
  }

  async showPendingApprovals(msg) {
    const chatId = msg.chat.id;

    if (this.pendingApprovals.size === 0) {
      await this.bot.sendMessage(chatId, 'No pending outreach approvals! 🎉');
      return;
    }

    let message = `⏳ *Pending Approvals (${this.pendingApprovals.size})*\n\n`;

    for (const [id, approval] of this.pendingApprovals.entries()) {
      message += `📝 *${approval.type.toUpperCase()}*\n`;
      message += `To: ${approval.recipientName}\n`;
      message += `Message Preview: ${approval.message.substring(0, 100)}...\n\n`;
    }

    const keyboard = {
      inline_keyboard: Array.from(this.pendingApprovals.entries()).map(([id, approval]) => [
        { text: `✅ Approve - ${approval.recipientName}`, callback_data: `approve_${id}` },
        { text: `❌ Reject - ${approval.recipientName}`, callback_data: `reject_${id}` }
      ])
    };

    await this.bot.sendMessage(chatId, message, {
      parse_mode: 'Markdown',
      reply_markup: keyboard
    });
  }

  async showOutreachTemplates(msg) {
    const chatId = msg.chat.id;

    const templates = this.getDefaultTemplates();

    let message = `📝 *Outreach Message Templates*\n\n`;
    message += `These are starting points - ALWAYS customize!\n\n`;

    Object.entries(templates).forEach(([type, template]) => {
      message += `*${type.toUpperCase()}:*\n`;
      message += `${template.template}\n\n`;
      message += `Variables: ${template.variables.join(', ')}\n`;
      message += `───────────────────\n\n`;
    });

    message += `Use /customize_template <type> to personalize these templates.`;

    await this.bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
  }

  getDefaultTemplates() {
    return {
      partnership: {
        template: `Hi {recipientName},

I'm reaching out from {projectName}. I've been following {theirProject} and I'm impressed by {specificThing}.

We're building {ourValue}, and I believe our communities could benefit from a partnership. Specifically, I think we could:

1. {collaboration1}
2. {collaboration2}
3. {collaboration3}

Would you be open to a quick chat about potential collaboration?

Best regards,
{yourName}`,
        variables: ['recipientName', 'projectName', 'theirProject', 'specificThing', 'ourValue', 'collaboration1', 'collaboration2', 'collaboration3', 'yourName']
      },
      ama: {
        template: `Hi {communityAdmin},

I hope this message finds you well! I'm {yourName} from {projectName}.

I noticed your community hosts regular AMAs, and I'd love to discuss the possibility of hosting an AMA about {topicFocus}.

What makes this relevant for your community:
• {relevance1}
• {relevance2}
• {relevance3}

We're happy to work around your schedule and can provide:
✅ Detailed project information
✅ Answers to technical questions
✅ Exclusive insights for your community

Would you be interested in discussing this further?

Thank you for your consideration!
{yourName}`,
        variables: ['communityAdmin', 'yourName', 'projectName', 'topicFocus', 'relevance1', 'relevance2', 'relevance3']
      },
      influencer: {
        template: `Hi {influencerName},

I've been following your content on {platform}, particularly your recent {specificContent}. The way you {whatYouLiked} really resonated with me.

I'm reaching out from {projectName} because I think there could be an interesting collaboration opportunity. We're focused on {projectFocus}, which aligns with your content on {theirFocus}.

Potential collaboration ideas:
• {idea1}
• {idea2}
• {idea3}

I'd love to explore how we could create value together for both our audiences.

Would you be open to a brief conversation?

Best,
{yourName}`,
        variables: ['influencerName', 'platform', 'specificContent', 'whatYouLiked', 'projectName', 'projectFocus', 'theirFocus', 'idea1', 'idea2', 'idea3', 'yourName']
      }
    };
  }

  async showPartnerships(msg) {
    const chatId = msg.chat.id;

    if (this.partnerships.length === 0) {
      await this.bot.sendMessage(chatId, 'No active partnerships yet. Start reaching out! 🚀');
      return;
    }

    let message = `🤝 *Active Partnerships (${this.partnerships.length})*\n\n`;

    this.partnerships.forEach((partnership, index) => {
      message += `${index + 1}. *${partnership.name}*\n`;
      message += `   Status: ${partnership.status}\n`;
      message += `   Type: ${partnership.type}\n`;
      message += `   Started: ${new Date(partnership.startedAt).toLocaleDateString()}\n`;
      message += `   Last Activity: ${partnership.lastActivity}\n\n`;
    });

    await this.bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
  }

  async showAnalytics(msg) {
    const chatId = msg.chat.id;

    const successRate = this.analytics.totalOutreachSent > 0
      ? ((this.analytics.totalResponses / this.analytics.totalOutreachSent) * 100).toFixed(1)
      : 0;

    const message = `
📊 *Growth Analytics Dashboard*

*Discovery Metrics:*
🔍 Opportunities Found: ${this.analytics.totalOpportunitiesFound}
📨 Outreach Sent: ${this.analytics.totalOutreachSent}
💬 Responses Received: ${this.analytics.totalResponses}
🤝 Active Partnerships: ${this.analytics.totalPartnerships}

*Performance:*
✅ Success Rate: ${successRate}%
⏱️ Avg Response Time: ${this.analytics.avgResponseTime} hours

*Growth Trajectory:*
📈 ${this.calculateGrowthTrend()}

Use /growth_report for detailed insights!
    `;

    await this.bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
  }

  calculateGrowthTrend() {
    const rate = this.analytics.totalPartnerships;
    if (rate > 10) return 'Excellent growth! 🚀';
    if (rate > 5) return 'Good progress! 📈';
    if (rate > 0) return 'Getting started 🌱';
    return 'Ready to grow! 💪';
  }

  async generateGrowthReport(msg) {
    const chatId = msg.chat.id;

    await this.bot.sendMessage(chatId, '📊 Generating comprehensive growth report...');

    const report = `
📈 *Comprehensive Growth Report*

*🎯 Executive Summary:*
Total Opportunities: ${this.analytics.totalOpportunitiesFound}
Conversion Rate: ${((this.analytics.totalPartnerships / Math.max(this.analytics.totalOpportunitiesFound, 1)) * 100).toFixed(1)}%
Active Partnerships: ${this.analytics.totalPartnerships}

*📊 Channel Breakdown:*
Partnership Outreach: ${this.getChannelStats('partnership')}
AMA Opportunities: ${this.getChannelStats('ama')}
Influencer Collaborations: ${this.getChannelStats('influencer')}

*💡 Key Insights:*
${this.generateInsights()}

*🎯 Recommended Actions:*
${this.generateRecommendations()}

*📅 Report Generated:* ${new Date().toLocaleString()}
    `;

    await this.bot.sendMessage(chatId, report, { parse_mode: 'Markdown' });
  }

  getChannelStats(type) {
    const opportunities = this.opportunities.filter(o => o.type === type);
    return `${opportunities.length} opportunities found`;
  }

  generateInsights() {
    const insights = [
      '• Partnership approach shows highest conversion',
      '• Educational content collaborations perform well',
      '• Personalized outreach increases response rates by 3x'
    ];
    return insights.join('\n');
  }

  generateRecommendations() {
    const recommendations = [
      '1. Focus on quality over quantity in outreach',
      '2. Engage with potential partners\' content first',
      '3. Customize each message - no copy-paste!',
      '4. Follow up politely after 5-7 days'
    ];
    return recommendations.join('\n');
  }

  async handleApproval(query, approved) {
    const approvalId = query.data.split('_')[1];
    const approval = this.pendingApprovals.get(approvalId);

    if (!approval) {
      await this.bot.sendMessage(query.message.chat.id, 'Approval not found or already processed.');
      return;
    }

    if (approved) {
      await this.bot.sendMessage(query.message.chat.id, `✅ Approved outreach to ${approval.recipientName}`);

      // Log the approval (in production, this would trigger actual sending)
      this.analytics.totalOutreachSent++;
      await this.saveJSON(this.analyticsFile, this.analytics);

      // Remove from pending
      this.pendingApprovals.delete(approvalId);
    } else {
      await this.bot.sendMessage(query.message.chat.id, `❌ Rejected outreach to ${approval.recipientName}`);
      this.pendingApprovals.delete(approvalId);
    }
  }

  async viewOpportunityDetails(query) {
    const oppIndex = parseInt(query.data.split('_')[2]);
    const opportunity = this.opportunities[oppIndex];

    if (!opportunity) {
      await this.bot.sendMessage(query.message.chat.id, 'Opportunity not found.');
      return;
    }

    let message = `
*📋 Opportunity Details*

*Name:* ${opportunity.name}
*Category:* ${opportunity.category || opportunity.type}
*Match Score:* ${opportunity.matchScore || 'N/A'}%
*Contact:* ${opportunity.contact}
*Website:* ${opportunity.website || 'N/A'}

*Why This Opportunity:*
${opportunity.reason || opportunity.requirements || 'Good collaboration potential'}

*Next Steps:*
1. Research their recent activity
2. Identify specific collaboration points
3. Customize your outreach message
4. Submit for approval before sending

Would you like to create a personalized outreach message?
    `;

    const keyboard = {
      inline_keyboard: [[
        { text: '✍️ Create Custom Message', callback_data: `customize_${oppIndex}` }
      ]]
    };

    await this.bot.sendMessage(query.message.chat.id, message, {
      parse_mode: 'Markdown',
      reply_markup: keyboard
    });
  }

  scheduleOpportunityScanning() {
    // Run daily at 9 AM
    cron.schedule('0 9 * * *', async () => {
      console.log('Running scheduled opportunity scan...');

      if (this.adminId) {
        await this.bot.sendMessage(
          this.adminId,
          '🔍 Running daily opportunity scan...'
        );

        // Simulate scanning
        const newOpps = await this.scanForPartners();

        if (newOpps.length > 0) {
          await this.bot.sendMessage(
            this.adminId,
            `✨ Found ${newOpps.length} new opportunities! Use /find_partners to view.`
          );
        }
      }
    });
  }

  // Helper method to create an outreach approval request
  async requestOutreachApproval(recipientName, message, type) {
    const approvalId = `approval_${Date.now()}`;

    this.pendingApprovals.set(approvalId, {
      recipientName,
      message,
      type,
      createdAt: new Date().toISOString()
    });

    const keyboard = {
      inline_keyboard: [[
        { text: '✅ Approve & Send', callback_data: `approve_${approvalId}` },
        { text: '❌ Reject', callback_data: `reject_${approvalId}` }
      ]]
    };

    await this.bot.sendMessage(this.adminId, `
🔔 *New Outreach Approval Request*

*To:* ${recipientName}
*Type:* ${type}

*Message:*
${message}

Please review and approve or reject.
    `, {
      parse_mode: 'Markdown',
      reply_markup: keyboard
    });
  }
}

// Export for use in main application
module.exports = GrowthHackerBot;

// Example usage
if (require.main === module) {
  const config = {
    telegramToken: process.env.GROWTH_BOT_TOKEN || 'your-telegram-bot-token',
    adminId: process.env.ADMIN_TELEGRAM_ID || 'your-telegram-id',
    projectName: 'Your Crypto Project',
    projectDescription: 'Revolutionary DeFi protocol',
    projectWebsite: 'https://yourproject.com'
  };

  const bot = new GrowthHackerBot(config);

  console.log('Growth Hacker Bot is running - Ethical growth mode activated! 🚀');
}
