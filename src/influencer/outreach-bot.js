const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

/**
 * HypeAI Influencer Outreach Automation Bot
 * Automates Twitter DMs, email sequences, and follow-ups
 */

class OutreachBot {
  constructor(crm, config = {}) {
    this.crm = crm;
    this.config = {
      emailHost: config.emailHost || process.env.EMAIL_HOST || 'smtp.gmail.com',
      emailPort: config.emailPort || process.env.EMAIL_PORT || 587,
      emailUser: config.emailUser || process.env.EMAIL_USER,
      emailPass: config.emailPass || process.env.EMAIL_PASS,
      twitterApiKey: config.twitterApiKey || process.env.TWITTER_API_KEY,
      twitterApiSecret: config.twitterApiSecret || process.env.TWITTER_API_SECRET,
      twitterBearerToken: config.twitterBearerToken || process.env.TWITTER_BEARER_TOKEN,
      rateLimitTwitter: config.rateLimitTwitter || 20, // DMs per hour
      rateLimitEmail: config.rateLimitEmail || 50, // emails per hour
      autoFollowUpDays: config.autoFollowUpDays || [3, 7] // Day 3 and Day 7 follow-ups
    };

    this.emailTransporter = this.setupEmailTransporter();
    this.templateCache = {};
    this.outreachLog = [];
  }

  setupEmailTransporter() {
    if (!this.config.emailUser || !this.config.emailPass) {
      console.warn('Email credentials not configured. Email sending disabled.');
      return null;
    }

    return nodemailer.createTransport({
      host: this.config.emailHost,
      port: this.config.emailPort,
      secure: false,
      auth: {
        user: this.config.emailUser,
        pass: this.config.emailPass
      }
    });
  }

  loadTemplate(templateName) {
    if (this.templateCache[templateName]) {
      return this.templateCache[templateName];
    }

    const templatePath = path.join(__dirname, 'templates', `${templateName}.txt`);
    if (fs.existsSync(templatePath)) {
      this.templateCache[templateName] = fs.readFileSync(templatePath, 'utf8');
      return this.templateCache[templateName];
    }

    console.warn(`Template ${templateName} not found`);
    return null;
  }

  personalizeMessage(template, influencer, customVars = {}) {
    let message = template;

    // Standard variables
    const vars = {
      '{NAME}': influencer.name.replace('@', ''),
      '{FULL_NAME}': influencer.name,
      '{PLATFORM}': influencer.platform,
      '{NICHE}': influencer.niche,
      '{FOLLOWERS}': influencer.followers.toLocaleString(),
      '{BUDGET}': `$${influencer.budget}`,
      '{ENGAGEMENT}': `${(influencer.engagement * 100).toFixed(1)}%`,
      ...customVars
    };

    for (const [key, value] of Object.entries(vars)) {
      message = message.replace(new RegExp(key, 'g'), value);
    }

    return message;
  }

  async sendEmail(influencer, templateName, customVars = {}) {
    if (!this.emailTransporter) {
      console.error('Email transporter not configured');
      return { success: false, error: 'Email not configured' };
    }

    if (!influencer.email) {
      console.error(`No email for influencer ${influencer.name}`);
      return { success: false, error: 'No email address' };
    }

    const template = this.loadTemplate(templateName);
    if (!template) {
      return { success: false, error: 'Template not found' };
    }

    const message = this.personalizeMessage(template, influencer, customVars);
    const [subject, ...bodyLines] = message.split('\n');

    try {
      const info = await this.emailTransporter.sendMail({
        from: `"HypeAI Team" <${this.config.emailUser}>`,
        to: influencer.email,
        subject: subject.replace('Subject: ', ''),
        text: bodyLines.join('\n'),
        html: this.convertToHTML(bodyLines.join('\n'))
      });

      this.logOutreach(influencer, 'email', templateName, true);
      this.crm.addNote(influencer.id, `Email sent: ${templateName}`);

      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('Email send error:', error);
      this.logOutreach(influencer, 'email', templateName, false, error.message);
      return { success: false, error: error.message };
    }
  }

  convertToHTML(text) {
    return text
      .split('\n\n')
      .map(para => `<p>${para.replace(/\n/g, '<br>')}</p>`)
      .join('');
  }

  async sendTwitterDM(influencer, templateName, customVars = {}) {
    // Twitter API v2 DM implementation
    // Note: Requires OAuth 2.0 authentication and user context

    if (!this.config.twitterBearerToken) {
      console.error('Twitter API not configured');
      return { success: false, error: 'Twitter API not configured' };
    }

    const template = this.loadTemplate(templateName);
    if (!template) {
      return { success: false, error: 'Template not found' };
    }

    const message = this.personalizeMessage(template, influencer, customVars);

    // Twitter DM character limit is 10,000 but best practice is under 280 for initial contact
    if (message.length > 280) {
      console.warn('Twitter DM message exceeds 280 characters. Consider shortening.');
    }

    try {
      // Placeholder for actual Twitter API call
      // In production, use twitter-api-v2 package:
      /*
      const client = new TwitterApi(this.config.twitterBearerToken);
      const dmResult = await client.v2.sendDm({
        dm_conversation_id: influencer.twitterUserId,
        text: message
      });
      */

      // For demo purposes, simulate success
      console.log(`[DEMO] Would send Twitter DM to ${influencer.name}: ${message.substring(0, 100)}...`);

      this.logOutreach(influencer, 'twitter', templateName, true);
      this.crm.addNote(influencer.id, `Twitter DM sent: ${templateName}`);

      return { success: true, demo: true };
    } catch (error) {
      console.error('Twitter DM error:', error);
      this.logOutreach(influencer, 'twitter', templateName, false, error.message);
      return { success: false, error: error.message };
    }
  }

  async bulkOutreach(influencerIds, channel = 'email', templateName = 'initial-outreach-cold') {
    const results = [];
    const delay = channel === 'twitter'
      ? 3600000 / this.config.rateLimitTwitter  // ms delay between messages
      : 3600000 / this.config.rateLimitEmail;

    for (const id of influencerIds) {
      const influencer = this.crm.getInfluencerById(id);
      if (!influencer) {
        results.push({ id, success: false, error: 'Influencer not found' });
        continue;
      }

      let result;
      if (channel === 'email') {
        result = await this.sendEmail(influencer, templateName);
      } else if (channel === 'twitter') {
        result = await this.sendTwitterDM(influencer, templateName);
      }

      results.push({ id, name: influencer.name, ...result });

      if (result.success) {
        this.crm.updateInfluencerStatus(id, 'contacted');
      }

      // Rate limiting
      if (influencerIds.indexOf(id) < influencerIds.length - 1) {
        await this.sleep(delay);
      }
    }

    return results;
  }

  async scheduleFollowUps() {
    const followUpNeeded = this.crm.getFollowUpNeeded();
    const results = [];

    for (const influencer of followUpNeeded) {
      const daysSinceContact = this.daysSince(influencer.lastContact);

      let templateName;
      if (daysSinceContact >= 7) {
        templateName = 'followup-day7';
      } else if (daysSinceContact >= 3) {
        templateName = 'followup-day3';
      } else {
        continue;
      }

      const result = await this.sendEmail(influencer, templateName);
      results.push({
        id: influencer.id,
        name: influencer.name,
        daysSinceContact,
        ...result
      });

      await this.sleep(2000); // 2 second delay between follow-ups
    }

    return results;
  }

  daysSince(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }

  async detectResponses() {
    // In production, this would:
    // 1. Check email inbox for replies (using IMAP)
    // 2. Check Twitter DMs for responses
    // 3. Update influencer status automatically

    console.log('[DEMO] Response detection would run here');
    return { checked: 0, responses: 0 };
  }

  logOutreach(influencer, channel, template, success, error = null) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      influencerId: influencer.id,
      influencerName: influencer.name,
      channel,
      template,
      success,
      error
    };

    this.outreachLog.push(logEntry);

    // Save to file
    const logFile = path.join(__dirname, 'data', 'outreach-log.json');
    const existingLog = fs.existsSync(logFile)
      ? JSON.parse(fs.readFileSync(logFile, 'utf8'))
      : [];
    existingLog.push(logEntry);
    fs.writeFileSync(logFile, JSON.stringify(existingLog, null, 2));
  }

  getOutreachStats(days = 30) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const recentOutreach = this.outreachLog.filter(log =>
      new Date(log.timestamp) > cutoffDate
    );

    const stats = {
      total: recentOutreach.length,
      successful: recentOutreach.filter(l => l.success).length,
      failed: recentOutreach.filter(l => !l.success).length,
      byChannel: {
        email: recentOutreach.filter(l => l.channel === 'email').length,
        twitter: recentOutreach.filter(l => l.channel === 'twitter').length
      },
      byTemplate: {}
    };

    recentOutreach.forEach(log => {
      if (!stats.byTemplate[log.template]) {
        stats.byTemplate[log.template] = 0;
      }
      stats.byTemplate[log.template]++;
    });

    return stats;
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Campaign-specific outreach
  async launchCampaign(campaignName, influencerIds, channel = 'email') {
    console.log(`Launching campaign: ${campaignName}`);

    const results = await this.bulkOutreach(influencerIds, channel, 'initial-outreach-cold');

    // Add campaign to each influencer
    influencerIds.forEach(id => {
      const influencer = this.crm.getInfluencerById(id);
      if (influencer) {
        this.crm.addCampaign(id, {
          name: campaignName,
          deliverables: ['1 post', '1 story'],
          budget: influencer.budget
        });
      }
    });

    return {
      campaign: campaignName,
      totalSent: results.filter(r => r.success).length,
      results
    };
  }
}

module.exports = OutreachBot;
