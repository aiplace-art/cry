const nodemailer = require('nodemailer');
const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');

class AlertSystem {
  constructor(config = {}) {
    this.config = {
      // Email configuration
      emailEnabled: config.emailEnabled !== false,
      emailFrom: config.emailFrom || process.env.ALERT_EMAIL_FROM || 'alerts@hypeai.io',
      emailTo: config.emailTo || process.env.ALERT_EMAIL_TO || 'team@hypeai.io',
      smtpHost: config.smtpHost || process.env.SMTP_HOST,
      smtpPort: config.smtpPort || process.env.SMTP_PORT || 587,
      smtpUser: config.smtpUser || process.env.SMTP_USER,
      smtpPass: config.smtpPass || process.env.SMTP_PASS,

      // Slack configuration
      slackEnabled: config.slackEnabled !== false,
      slackWebhook: config.slackWebhook || process.env.SLACK_WEBHOOK_URL,

      // Twilio SMS configuration
      smsEnabled: config.smsEnabled || false,
      twilioAccountSid: config.twilioAccountSid || process.env.TWILIO_ACCOUNT_SID,
      twilioAuthToken: config.twilioAuthToken || process.env.TWILIO_AUTH_TOKEN,
      twilioFromNumber: config.twilioFromNumber || process.env.TWILIO_FROM_NUMBER,
      twilioToNumber: config.twilioToNumber || process.env.TWILIO_TO_NUMBER,

      // Alert behavior
      groupingWindow: config.groupingWindow || 300000, // 5 minutes
      maxAlertsPerHour: config.maxAlertsPerHour || 20,
      deduplicationWindow: config.deduplicationWindow || 900000, // 15 minutes

      // On-call rotation
      onCallRotation: config.onCallRotation || [],

      // Storage
      alertHistoryPath: config.alertHistoryPath || path.join(__dirname, '../../data/alert-history.json')
    };

    this.emailTransporter = null;
    this.alertHistory = [];
    this.alertGroups = new Map();
    this.recentAlerts = new Map();
    this.hourlyAlertCount = 0;
    this.lastHourReset = Date.now();

    this.initializeEmailTransporter();
  }

  /**
   * Initialize email transporter
   */
  initializeEmailTransporter() {
    if (!this.config.emailEnabled || !this.config.smtpHost) {
      return;
    }

    try {
      this.emailTransporter = nodemailer.createTransport({
        host: this.config.smtpHost,
        port: this.config.smtpPort,
        secure: this.config.smtpPort === 465,
        auth: {
          user: this.config.smtpUser,
          pass: this.config.smtpPass
        }
      });
      console.log('✅ Email transporter initialized');
    } catch (error) {
      console.error('❌ Failed to initialize email transporter:', error.message);
    }
  }

  /**
   * Send alert through configured channels
   */
  async sendAlert(alert) {
    try {
      // Validate alert
      const validatedAlert = this.validateAlert(alert);

      // Check rate limiting
      if (!this.checkRateLimit()) {
        console.log('⚠️ Alert rate limit reached, queueing alert');
        return { success: false, reason: 'rate_limited' };
      }

      // Check deduplication
      if (this.isDuplicate(validatedAlert)) {
        console.log('⏭️ Skipping duplicate alert');
        return { success: false, reason: 'duplicate' };
      }

      // Determine recipients based on priority and on-call rotation
      const recipients = this.getRecipients(validatedAlert.priority);

      // Send through appropriate channels
      const results = await Promise.allSettled([
        this.sendSlackAlert(validatedAlert),
        this.sendEmailAlert(validatedAlert, recipients),
        validatedAlert.priority === 'P0' ? this.sendSMSAlert(validatedAlert, recipients) : Promise.resolve()
      ]);

      // Save to history
      await this.saveAlertToHistory({
        ...validatedAlert,
        timestamp: new Date().toISOString(),
        recipients,
        results: results.map(r => r.status)
      });

      // Track for deduplication
      this.recentAlerts.set(this.getAlertKey(validatedAlert), Date.now());

      console.log(`✅ Alert sent: ${validatedAlert.title} (${validatedAlert.priority})`);

      return { success: true, results };

    } catch (error) {
      console.error('❌ Failed to send alert:', error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * Validate and normalize alert
   */
  validateAlert(alert) {
    const priorities = ['P0', 'P1', 'P2', 'P3', 'P4'];

    return {
      priority: priorities.includes(alert.priority) ? alert.priority : 'P3',
      title: alert.title || 'Untitled Alert',
      message: alert.message || '',
      data: alert.data || {},
      tags: alert.tags || [],
      timestamp: alert.timestamp || new Date().toISOString()
    };
  }

  /**
   * Check if alert should be rate limited
   */
  checkRateLimit() {
    const now = Date.now();

    // Reset counter every hour
    if (now - this.lastHourReset > 3600000) {
      this.hourlyAlertCount = 0;
      this.lastHourReset = now;
    }

    if (this.hourlyAlertCount >= this.config.maxAlertsPerHour) {
      return false;
    }

    this.hourlyAlertCount++;
    return true;
  }

  /**
   * Check if alert is a duplicate
   */
  isDuplicate(alert) {
    const key = this.getAlertKey(alert);
    const lastSent = this.recentAlerts.get(key);

    if (!lastSent) return false;

    const timeSinceLastAlert = Date.now() - lastSent;
    return timeSinceLastAlert < this.config.deduplicationWindow;
  }

  /**
   * Generate unique key for alert deduplication
   */
  getAlertKey(alert) {
    return `${alert.priority}:${alert.title}`;
  }

  /**
   * Get recipients based on priority and on-call rotation
   */
  getRecipients(priority) {
    const recipients = {
      email: [this.config.emailTo],
      phone: []
    };

    // For P0/P1, add on-call person
    if ((priority === 'P0' || priority === 'P1') && this.config.onCallRotation.length > 0) {
      const onCallIndex = Math.floor(Date.now() / (24 * 60 * 60 * 1000)) % this.config.onCallRotation.length;
      const onCallPerson = this.config.onCallRotation[onCallIndex];

      if (onCallPerson.email) recipients.email.push(onCallPerson.email);
      if (onCallPerson.phone) recipients.phone.push(onCallPerson.phone);
    }

    return recipients;
  }

  /**
   * Send Slack alert
   */
  async sendSlackAlert(alert) {
    if (!this.config.slackEnabled || !this.config.slackWebhook) {
      return { skipped: true, reason: 'Slack not configured' };
    }

    try {
      const color = this.getPriorityColor(alert.priority);
      const emoji = this.getPriorityEmoji(alert.priority);

      const payload = {
        username: 'HypeAI Alerts',
        icon_emoji: ':robot_face:',
        attachments: [{
          color,
          title: `${emoji} ${alert.title}`,
          text: alert.message,
          fields: [
            {
              title: 'Priority',
              value: alert.priority,
              short: true
            },
            {
              title: 'Time',
              value: new Date(alert.timestamp).toLocaleString(),
              short: true
            }
          ],
          footer: 'HypeAI Monitoring System',
          ts: Math.floor(Date.now() / 1000)
        }]
      };

      await axios.post(this.config.slackWebhook, payload);
      return { success: true, channel: 'slack' };

    } catch (error) {
      console.error('Failed to send Slack alert:', error.message);
      return { success: false, channel: 'slack', error: error.message };
    }
  }

  /**
   * Send email alert
   */
  async sendEmailAlert(alert, recipients) {
    if (!this.config.emailEnabled || !this.emailTransporter) {
      return { skipped: true, reason: 'Email not configured' };
    }

    try {
      const html = this.generateEmailHTML(alert);

      const mailOptions = {
        from: this.config.emailFrom,
        to: recipients.email.join(','),
        subject: `[${alert.priority}] ${alert.title}`,
        html
      };

      await this.emailTransporter.sendMail(mailOptions);
      return { success: true, channel: 'email', recipients: recipients.email };

    } catch (error) {
      console.error('Failed to send email alert:', error.message);
      return { success: false, channel: 'email', error: error.message };
    }
  }

  /**
   * Send SMS alert via Twilio
   */
  async sendSMSAlert(alert, recipients) {
    if (!this.config.smsEnabled || !this.config.twilioAccountSid) {
      return { skipped: true, reason: 'SMS not configured' };
    }

    try {
      const twilio = require('twilio')(
        this.config.twilioAccountSid,
        this.config.twilioAuthToken
      );

      const message = `[${alert.priority}] ${alert.title}\n${alert.message}`;
      const phones = recipients.phone.length > 0 ? recipients.phone : [this.config.twilioToNumber];

      const results = await Promise.all(
        phones.map(phone =>
          twilio.messages.create({
            body: message,
            from: this.config.twilioFromNumber,
            to: phone
          })
        )
      );

      return { success: true, channel: 'sms', recipients: phones, results };

    } catch (error) {
      console.error('Failed to send SMS alert:', error.message);
      return { success: false, channel: 'sms', error: error.message };
    }
  }

  /**
   * Generate HTML for email alert
   */
  generateEmailHTML(alert) {
    const color = this.getPriorityColor(alert.priority);
    const emoji = this.getPriorityEmoji(alert.priority);

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: ${color}; color: white; padding: 20px; border-radius: 5px 5px 0 0; }
          .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 5px 5px; }
          .priority { display: inline-block; padding: 5px 10px; background: ${color}; color: white; border-radius: 3px; }
          .message { background: white; padding: 15px; margin: 15px 0; border-left: 4px solid ${color}; }
          .footer { margin-top: 20px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>${emoji} ${alert.title}</h2>
          </div>
          <div class="content">
            <p><span class="priority">${alert.priority}</span></p>
            <div class="message">
              <p>${alert.message.replace(/\n/g, '<br>')}</p>
            </div>
            <p><strong>Time:</strong> ${new Date(alert.timestamp).toLocaleString()}</p>
            ${alert.data && Object.keys(alert.data).length > 0 ? `
              <details>
                <summary>Additional Data</summary>
                <pre>${JSON.stringify(alert.data, null, 2)}</pre>
              </details>
            ` : ''}
          </div>
          <div class="footer">
            <p>This is an automated alert from the HypeAI Monitoring System.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Get color for priority level
   */
  getPriorityColor(priority) {
    const colors = {
      'P0': '#dc3545', // Red
      'P1': '#fd7e14', // Orange
      'P2': '#ffc107', // Yellow
      'P3': '#17a2b8', // Blue
      'P4': '#6c757d'  // Gray
    };
    return colors[priority] || colors.P3;
  }

  /**
   * Get emoji for priority level
   */
  getPriorityEmoji(priority) {
    const emojis = {
      'P0': '🚨',
      'P1': '⚠️',
      'P2': '⚡',
      'P3': 'ℹ️',
      'P4': '📝'
    };
    return emojis[priority] || emojis.P3;
  }

  /**
   * Save alert to history
   */
  async saveAlertToHistory(alert) {
    try {
      this.alertHistory.push(alert);

      // Keep last 1000 alerts in memory
      if (this.alertHistory.length > 1000) {
        this.alertHistory.shift();
      }

      // Save to file
      const historyDir = path.dirname(this.config.alertHistoryPath);
      await fs.mkdir(historyDir, { recursive: true });

      let fileHistory = { alerts: [] };
      try {
        const data = await fs.readFile(this.config.alertHistoryPath, 'utf8');
        fileHistory = JSON.parse(data);
      } catch (error) {
        // File doesn't exist yet
      }

      fileHistory.alerts.push(alert);

      // Keep last 10000 alerts in file
      if (fileHistory.alerts.length > 10000) {
        fileHistory.alerts = fileHistory.alerts.slice(-10000);
      }

      await fs.writeFile(this.config.alertHistoryPath, JSON.stringify(fileHistory, null, 2));

    } catch (error) {
      console.error('Failed to save alert to history:', error.message);
    }
  }

  /**
   * Get alert history
   */
  getAlertHistory(limit = 100) {
    return this.alertHistory.slice(-limit);
  }

  /**
   * Get alerts by priority
   */
  getAlertsByPriority(priority, limit = 100) {
    return this.alertHistory
      .filter(alert => alert.priority === priority)
      .slice(-limit);
  }

  /**
   * Get alert statistics
   */
  getStatistics(hours = 24) {
    const now = Date.now();
    const cutoff = now - (hours * 60 * 60 * 1000);

    const recentAlerts = this.alertHistory.filter(alert =>
      new Date(alert.timestamp).getTime() > cutoff
    );

    const stats = {
      total: recentAlerts.length,
      byPriority: {},
      byCh annel: {},
      avgPerHour: recentAlerts.length / hours
    };

    ['P0', 'P1', 'P2', 'P3', 'P4'].forEach(priority => {
      stats.byPriority[priority] = recentAlerts.filter(a => a.priority === priority).length;
    });

    return stats;
  }
}

module.exports = AlertSystem;

// CLI usage
if (require.main === module) {
  const alerts = new AlertSystem();

  // Test alert
  alerts.sendAlert({
    priority: 'P2',
    title: 'Test Alert',
    message: 'This is a test alert from the HypeAI monitoring system',
    tags: ['test']
  });
}
