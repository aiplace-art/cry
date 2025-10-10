const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');

/**
 * Content Calendar Manager
 * Manages 90-day social media calendar with analytics
 */
class CalendarManager {
  constructor(config = {}) {
    this.config = {
      calendarPath: config.calendarPath || path.join(__dirname, '../../docs/marketing/social-media-calendar-90days.md'),
      analyticsPath: config.analyticsPath || path.join(__dirname, 'analytics.json'),
      reminderEmail: config.reminderEmail || process.env.REMINDER_EMAIL,
      smtpConfig: config.smtpConfig || {
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: process.env.SMTP_PORT || 587,
        secure: false,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        }
      },
      ...config
    };

    this.calendar = [];
    this.analytics = {
      posts: [],
      bestTimes: {},
      engagementRates: {},
      platformPerformance: {}
    };

    this.loadCalendar();
    this.loadAnalytics();
  }

  /**
   * Parse 90-day calendar from markdown
   */
  loadCalendar() {
    try {
      const content = fs.readFileSync(this.config.calendarPath, 'utf8');
      this.calendar = this.parseCalendar(content);
      console.log(`📅 Loaded ${this.calendar.length} calendar entries`);
    } catch (error) {
      console.error('❌ Error loading calendar:', error.message);
    }
  }

  /**
   * Parse calendar entries from markdown
   */
  parseCalendar(content) {
    const entries = [];
    const dayRegex = /\*\*Day (\d+) \((\w+)\)(.*?)\*\*/g;
    let match;

    while ((match = dayRegex.exec(content)) !== null) {
      const [, dayNum, dayOfWeek, title] = match;
      const dayContent = this.extractDayContent(content, match.index);

      entries.push({
        day: parseInt(dayNum),
        dayOfWeek,
        title: title.trim().replace(/^-\s*/, ''),
        platforms: this.extractPlatforms(dayContent),
        content: dayContent,
        status: 'scheduled',
        postedAt: null
      });
    }

    return entries;
  }

  /**
   * Extract content for a specific day
   */
  extractDayContent(content, startIndex) {
    // Find content until next day marker or end
    const nextDay = content.indexOf('**Day ', startIndex + 1);
    const endIndex = nextDay === -1 ? content.length : nextDay;
    return content.substring(startIndex, endIndex).trim();
  }

  /**
   * Extract platforms mentioned in day content
   */
  extractPlatforms(content) {
    const platforms = [];
    if (content.includes('**Twitter/X**')) platforms.push('twitter');
    if (content.includes('**Telegram**')) platforms.push('telegram');
    if (content.includes('**Discord**')) platforms.push('discord');
    if (content.includes('**TikTok**')) platforms.push('tiktok');
    if (content.includes('**Reels**')) platforms.push('reels');
    if (content.includes('**Stories**')) platforms.push('stories');
    return platforms;
  }

  /**
   * Load analytics data
   */
  loadAnalytics() {
    try {
      if (fs.existsSync(this.config.analyticsPath)) {
        const data = fs.readFileSync(this.config.analyticsPath, 'utf8');
        this.analytics = JSON.parse(data);
        console.log(`📊 Loaded analytics: ${this.analytics.posts.length} tracked posts`);
      }
    } catch (error) {
      console.error('⚠️  Error loading analytics:', error.message);
    }
  }

  /**
   * Save analytics data
   */
  saveAnalytics() {
    try {
      fs.writeFileSync(
        this.config.analyticsPath,
        JSON.stringify(this.analytics, null, 2),
        'utf8'
      );
      console.log('💾 Analytics saved');
    } catch (error) {
      console.error('❌ Error saving analytics:', error.message);
    }
  }

  /**
   * Get today's scheduled content
   */
  getTodaySchedule() {
    const today = new Date();
    const daysSinceLaunch = this.calculateDaysSinceLaunch();

    return this.calendar.filter(entry =>
      entry.day === daysSinceLaunch && entry.status === 'scheduled'
    );
  }

  /**
   * Calculate days since launch (for demo purposes, using arbitrary start)
   */
  calculateDaysSinceLaunch() {
    const launchDate = new Date('2025-10-09'); // HypeAI launch date
    const today = new Date();
    const diffTime = Math.abs(today - launchDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }

  /**
   * Mark calendar item as posted
   */
  markAsPosted(day, platform, metrics = {}) {
    const entry = this.calendar.find(e => e.day === day);
    if (entry) {
      entry.status = 'posted';
      entry.postedAt = new Date().toISOString();

      // Track in analytics
      this.analytics.posts.push({
        day,
        platform,
        postedAt: entry.postedAt,
        metrics: {
          impressions: metrics.impressions || 0,
          engagements: metrics.engagements || 0,
          clicks: metrics.clicks || 0,
          shares: metrics.shares || 0
        }
      });

      this.saveAnalytics();
      console.log(`✅ Marked Day ${day} as posted on ${platform}`);
    }
  }

  /**
   * Get upcoming schedule (next N days)
   */
  getUpcoming(days = 7) {
    const currentDay = this.calculateDaysSinceLaunch();
    return this.calendar.filter(entry =>
      entry.day >= currentDay && entry.day < currentDay + days
    );
  }

  /**
   * Get posting completion rate
   */
  getCompletionRate() {
    const currentDay = this.calculateDaysSinceLaunch();
    const dueDays = this.calendar.filter(e => e.day < currentDay);
    const posted = dueDays.filter(e => e.status === 'posted');

    return {
      total: dueDays.length,
      posted: posted.length,
      rate: dueDays.length > 0 ? (posted.length / dueDays.length * 100).toFixed(1) : 0,
      upcoming: this.calendar.filter(e => e.day >= currentDay).length
    };
  }

  /**
   * Analyze best posting times
   */
  analyzeBestTimes() {
    const timeSlots = {};

    this.analytics.posts.forEach(post => {
      const hour = new Date(post.postedAt).getUTCHours();
      const timeSlot = `${hour}:00`;

      if (!timeSlots[timeSlot]) {
        timeSlots[timeSlot] = {
          count: 0,
          totalEngagement: 0,
          avgEngagement: 0
        };
      }

      timeSlots[timeSlot].count++;
      timeSlots[timeSlot].totalEngagement += post.metrics.engagements;
    });

    // Calculate averages
    Object.keys(timeSlots).forEach(slot => {
      timeSlots[slot].avgEngagement =
        timeSlots[slot].totalEngagement / timeSlots[slot].count;
    });

    // Sort by engagement
    const sorted = Object.entries(timeSlots)
      .sort(([, a], [, b]) => b.avgEngagement - a.avgEngagement)
      .slice(0, 5);

    this.analytics.bestTimes = Object.fromEntries(sorted);
    this.saveAnalytics();

    return this.analytics.bestTimes;
  }

  /**
   * Calculate engagement rates by platform
   */
  calculateEngagementRates() {
    const platformStats = {};

    this.analytics.posts.forEach(post => {
      if (!platformStats[post.platform]) {
        platformStats[post.platform] = {
          posts: 0,
          totalImpressions: 0,
          totalEngagements: 0,
          rate: 0
        };
      }

      const stats = platformStats[post.platform];
      stats.posts++;
      stats.totalImpressions += post.metrics.impressions;
      stats.totalEngagements += post.metrics.engagements;
    });

    // Calculate rates
    Object.keys(platformStats).forEach(platform => {
      const stats = platformStats[platform];
      stats.rate = stats.totalImpressions > 0
        ? (stats.totalEngagements / stats.totalImpressions * 100).toFixed(2)
        : 0;
    });

    this.analytics.engagementRates = platformStats;
    this.saveAnalytics();

    return platformStats;
  }

  /**
   * Send daily reminder email
   */
  async sendDailyReminder() {
    if (!this.config.reminderEmail || !this.config.smtpConfig.auth.user) {
      console.log('⚠️  Email not configured, skipping reminder');
      return;
    }

    const todaySchedule = this.getTodaySchedule();
    if (todaySchedule.length === 0) {
      console.log('📭 No scheduled posts for today');
      return;
    }

    try {
      const transporter = nodemailer.createTransport(this.config.smtpConfig);

      const html = this.generateReminderEmail(todaySchedule);

      await transporter.sendMail({
        from: this.config.smtpConfig.auth.user,
        to: this.config.reminderEmail,
        subject: `📅 HypeAI Daily Content Reminder - ${todaySchedule.length} posts scheduled`,
        html
      });

      console.log('✅ Daily reminder email sent');
    } catch (error) {
      console.error('❌ Error sending reminder:', error.message);
    }
  }

  /**
   * Generate reminder email HTML
   */
  generateReminderEmail(schedule) {
    const items = schedule.map(item => `
      <li>
        <strong>Day ${item.day} - ${item.title}</strong><br>
        Platforms: ${item.platforms.join(', ')}<br>
        <small>${item.content.substring(0, 200)}...</small>
      </li>
    `).join('');

    return `
      <html>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #00D9FF;">🚀 HypeAI Daily Content Reminder</h2>
          <p>You have <strong>${schedule.length}</strong> posts scheduled for today:</p>
          <ul style="line-height: 1.8;">
            ${items}
          </ul>
          <p style="color: #666; font-size: 12px;">
            This is an automated reminder from HypeAI Content Automation System.
          </p>
        </body>
      </html>
    `;
  }

  /**
   * Get analytics summary
   */
  getAnalyticsSummary() {
    const completion = this.getCompletionRate();
    const bestTimes = this.analyzeBestTimes();
    const engagementRates = this.calculateEngagementRates();

    return {
      completion,
      totalPosts: this.analytics.posts.length,
      bestTimes: Object.keys(bestTimes).slice(0, 3),
      engagementRates,
      lastUpdated: new Date().toISOString()
    };
  }
}

module.exports = CalendarManager;

// CLI usage
if (require.main === module) {
  const manager = new CalendarManager();

  const command = process.argv[2];

  switch (command) {
    case 'today':
      const today = manager.getTodaySchedule();
      console.log(`\n📅 Today's Schedule (${today.length} items):\n`);
      today.forEach(item => {
        console.log(`Day ${item.day} - ${item.title}`);
        console.log(`Platforms: ${item.platforms.join(', ')}\n`);
      });
      break;

    case 'upcoming':
      const days = parseInt(process.argv[3]) || 7;
      const upcoming = manager.getUpcoming(days);
      console.log(`\n📅 Upcoming ${days} days (${upcoming.length} items):\n`);
      upcoming.forEach(item => {
        console.log(`Day ${item.day} (${item.dayOfWeek}) - ${item.title}`);
      });
      break;

    case 'completion':
      const completion = manager.getCompletionRate();
      console.log('\n📊 Completion Rate:');
      console.log(JSON.stringify(completion, null, 2));
      break;

    case 'analytics':
      const analytics = manager.getAnalyticsSummary();
      console.log('\n📊 Analytics Summary:');
      console.log(JSON.stringify(analytics, null, 2));
      break;

    case 'remind':
      manager.sendDailyReminder();
      break;

    default:
      console.log(`
Usage:
  node calendar-manager.js today          - Show today's schedule
  node calendar-manager.js upcoming [N]   - Show next N days (default 7)
  node calendar-manager.js completion     - Show completion rate
  node calendar-manager.js analytics      - Show analytics summary
  node calendar-manager.js remind         - Send daily reminder email
      `);
  }
}
