const { WebClient } = require('@slack/web-api');
const axios = require('axios');

class NotificationService {
  constructor(config) {
    this.config = config;
    this.slackClient = new WebClient(process.env.SLACK_BOT_TOKEN);
    this.webhookUrl = config.hypeai.notifications.slack.webhook_url;
    this.milestones = config.hypeai.milestones;
    this.triggeredMilestones = new Set();
  }

  async checkMilestones(metrics) {
    const notifications = [];

    // Check holder milestones
    for (const milestone of this.milestones.holders) {
      const key = `holders-${milestone}`;
      if (
        metrics.holders >= milestone &&
        !this.triggeredMilestones.has(key)
      ) {
        notifications.push({
          type: 'holders',
          milestone,
          value: metrics.holders,
          message: `🎉 Milestone Reached! ${metrics.holders.toLocaleString()} token holders!`,
        });
        this.triggeredMilestones.add(key);
      }
    }

    // Check market cap milestones
    for (const milestone of this.milestones.marketcap) {
      const key = `marketcap-${milestone}`;
      if (
        metrics.marketCap >= milestone &&
        !this.triggeredMilestones.has(key)
      ) {
        notifications.push({
          type: 'marketcap',
          milestone,
          value: metrics.marketCap,
          message: `🚀 Market Cap Milestone! $${(milestone / 1000000).toFixed(1)}M reached!`,
        });
        this.triggeredMilestones.add(key);
      }
    }

    // Check Twitter follower milestones
    if (metrics.twitterFollowers) {
      for (const milestone of this.milestones.twitter_followers) {
        const key = `twitter-${milestone}`;
        if (
          metrics.twitterFollowers >= milestone &&
          !this.triggeredMilestones.has(key)
        ) {
          notifications.push({
            type: 'twitter',
            milestone,
            value: metrics.twitterFollowers,
            message: `🐦 Twitter Milestone! ${metrics.twitterFollowers.toLocaleString()} followers!`,
          });
          this.triggeredMilestones.add(key);
        }
      }
    }

    // Check Telegram member milestones
    if (metrics.telegramMembers) {
      for (const milestone of this.milestones.telegram_members) {
        const key = `telegram-${milestone}`;
        if (
          metrics.telegramMembers >= milestone &&
          !this.triggeredMilestones.has(key)
        ) {
          notifications.push({
            type: 'telegram',
            milestone,
            value: metrics.telegramMembers,
            message: `📱 Telegram Milestone! ${metrics.telegramMembers.toLocaleString()} members!`,
          });
          this.triggeredMilestones.add(key);
        }
      }
    }

    // Send notifications
    for (const notification of notifications) {
      await this.sendSlackNotification(notification);
      await this.sendEmailNotification(notification);
    }

    return notifications;
  }

  async sendSlackNotification(notification) {
    if (!this.webhookUrl) {
      console.warn('Slack webhook URL not configured');
      return false;
    }

    const blocks = [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: notification.message,
          emoji: true,
        },
      },
      {
        type: 'section',
        fields: [
          {
            type: 'mrkdwn',
            text: `*Type:*\n${notification.type}`,
          },
          {
            type: 'mrkdwn',
            text: `*Value:*\n${notification.value.toLocaleString()}`,
          },
          {
            type: 'mrkdwn',
            text: `*Time:*\n${new Date().toLocaleString()}`,
          },
        ],
      },
      {
        type: 'actions',
        elements: [
          {
            type: 'button',
            text: {
              type: 'plain_text',
              text: 'View Dashboard',
              emoji: true,
            },
            url: process.env.DASHBOARD_URL || 'http://localhost:3001',
            style: 'primary',
          },
        ],
      },
    ];

    try {
      await axios.post(this.webhookUrl, {
        text: notification.message,
        blocks,
      });
      console.log('Slack notification sent:', notification.message);
      return true;
    } catch (error) {
      console.error('Error sending Slack notification:', error.message);
      return false;
    }
  }

  async sendEmailNotification(notification) {
    // Email notification implementation would go here
    // For brevity, just logging
    console.log('Email notification would be sent:', notification.message);
    return true;
  }

  async sendAlert(title, message, priority = 'normal') {
    const colors = {
      low: '#10b981',
      normal: '#3b82f6',
      high: '#f59e0b',
      critical: '#ef4444',
    };

    const blocks = [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: title,
          emoji: true,
        },
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: message,
        },
      },
      {
        type: 'context',
        elements: [
          {
            type: 'mrkdwn',
            text: `Priority: *${priority.toUpperCase()}* | ${new Date().toLocaleString()}`,
          },
        ],
      },
    ];

    try {
      await axios.post(this.webhookUrl, {
        text: title,
        blocks,
        attachments: [
          {
            color: colors[priority],
            text: message,
          },
        ],
      });
      console.log('Alert sent:', title);
      return true;
    } catch (error) {
      console.error('Error sending alert:', error.message);
      return false;
    }
  }
}

module.exports = NotificationService;
