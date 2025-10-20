// Alerting System for HypeAI Private Sale
// Send alerts via email, SMS, Slack for critical events

interface Alert {
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  message: string;
  timestamp: number;
  metadata?: Record<string, any>;
}

class AlertManager {
  private alerts: Alert[] = [];
  private maxAlerts = 100;

  // Log alert
  log(
    severity: Alert['severity'],
    title: string,
    message: string,
    metadata?: Record<string, any>
  ) {
    const alert: Alert = {
      severity,
      title,
      message,
      timestamp: Date.now(),
      metadata,
    };

    this.alerts.push(alert);

    // Keep only last N alerts
    if (this.alerts.length > this.maxAlerts) {
      this.alerts.shift();
    }

    // Send alert if critical or high
    if (severity === 'critical' || severity === 'high') {
      this.sendAlert(alert);
    }

    return alert;
  }

  // Send alert via configured channels
  private async sendAlert(alert: Alert) {
    // Log to console
    const emoji = {
      low: '🔵',
      medium: '🟡',
      high: '🟠',
      critical: '🔴',
    };
    console.error(`${emoji[alert.severity]} [ALERT] ${alert.title}: ${alert.message}`);

    // Send to configured channels
    if (typeof window === 'undefined') {
      // Server-side: Send email/SMS/Slack
      await this.sendEmailAlert(alert);
      await this.sendSlackAlert(alert);

      if (alert.severity === 'critical') {
        await this.sendSMSAlert(alert);
      }
    } else {
      // Client-side: Send to API endpoint
      await fetch('/api/alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(alert),
      }).catch((error) => {
        console.error('Failed to send alert:', error);
      });
    }
  }

  // Send email alert
  private async sendEmailAlert(alert: Alert) {
    try {
      // In production, use actual email service (Nodemailer, SendGrid, etc.)
      console.log('Sending email alert:', alert.title);

      // Example implementation:
      /*
      const nodemailer = require('nodemailer');
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: 587,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });

      await transporter.sendMail({
        from: '"HypeAI Alerts" <alerts@hypeai.io>',
        to: 'team@hypeai.io',
        subject: `[${alert.severity.toUpperCase()}] ${alert.title}`,
        html: `
          <h2>${alert.title}</h2>
          <p>${alert.message}</p>
          <p><strong>Severity:</strong> ${alert.severity}</p>
          <p><strong>Time:</strong> ${new Date(alert.timestamp).toISOString()}</p>
          ${alert.metadata ? `<pre>${JSON.stringify(alert.metadata, null, 2)}</pre>` : ''}
        `,
      });
      */
    } catch (error) {
      console.error('Failed to send email alert:', error);
    }
  }

  // Send Slack alert
  private async sendSlackAlert(alert: Alert) {
    try {
      const webhookUrl = process.env.SLACK_WEBHOOK_URL;
      if (!webhookUrl) return;

      const colors = {
        low: '#0ea5e9',
        medium: '#f59e0b',
        high: '#f97316',
        critical: '#ef4444',
      };

      await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: `🚨 ${alert.title}`,
          attachments: [
            {
              color: colors[alert.severity],
              title: alert.title,
              text: alert.message,
              fields: [
                {
                  title: 'Severity',
                  value: alert.severity.toUpperCase(),
                  short: true,
                },
                {
                  title: 'Time',
                  value: new Date(alert.timestamp).toISOString(),
                  short: true,
                },
                ...(alert.metadata
                  ? Object.entries(alert.metadata).map(([key, value]) => ({
                      title: key,
                      value: String(value),
                      short: true,
                    }))
                  : []),
              ],
            },
          ],
        }),
      });
    } catch (error) {
      console.error('Failed to send Slack alert:', error);
    }
  }

  // Send SMS alert (for critical only)
  private async sendSMSAlert(alert: Alert) {
    try {
      // In production, use Twilio or similar service
      console.log('Sending SMS alert:', alert.title);

      // Example Twilio implementation:
      /*
      const twilio = require('twilio');
      const client = twilio(
        process.env.TWILIO_ACCOUNT_SID,
        process.env.TWILIO_AUTH_TOKEN
      );

      await client.messages.create({
        body: `[CRITICAL] ${alert.title}: ${alert.message}`,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: process.env.ONCALL_PHONE_NUMBER,
      });
      */
    } catch (error) {
      console.error('Failed to send SMS alert:', error);
    }
  }

  // Get alerts
  getAlerts(severity?: Alert['severity']): Alert[] {
    if (severity) {
      return this.alerts.filter((a) => a.severity === severity);
    }
    return this.alerts;
  }

  // Clear alerts
  clear() {
    this.alerts = [];
  }
}

// Global alert manager instance
export const alertManager = new AlertManager();

// Common alert functions

// System down alert
export function alertSystemDown(reason: string, details?: Record<string, any>) {
  alertManager.log('critical', 'System Down', reason, details);
}

// High error rate alert
export function alertHighErrorRate(errorCount: number, timeWindow: string) {
  alertManager.log(
    'high',
    'High Error Rate',
    `${errorCount} errors in ${timeWindow}`,
    { errorCount, timeWindow }
  );
}

// Performance degradation alert
export function alertPerformanceDegradation(metric: string, value: number, threshold: number) {
  alertManager.log(
    'high',
    'Performance Degradation',
    `${metric} exceeded threshold: ${value} > ${threshold}`,
    { metric, value, threshold }
  );
}

// Security breach alert
export function alertSecurityBreach(type: string, details: Record<string, any>) {
  alertManager.log('critical', 'Security Breach', `${type} detected`, details);
}

// Payment failure alert
export function alertPaymentFailure(amount: number, reason: string, details?: Record<string, any>) {
  alertManager.log(
    'high',
    'Payment Failure',
    `Payment of $${amount} failed: ${reason}`,
    { amount, reason, ...details }
  );
}

// Database connection lost alert
export function alertDatabaseDown(error: string) {
  alertManager.log('critical', 'Database Connection Lost', error);
}

// RPC node failure alert
export function alertRPCNodeDown(rpcUrl: string, error: string) {
  alertManager.log('high', 'RPC Node Failure', `${rpcUrl} is down: ${error}`, {
    rpcUrl,
    error,
  });
}

// Rate limit exceeded alert
export function alertRateLimitExceeded(identifier: string, count: number, endpoint: string) {
  alertManager.log(
    'medium',
    'Rate Limit Exceeded',
    `${identifier} exceeded rate limit on ${endpoint}`,
    { identifier, count, endpoint }
  );
}

// Unusual transaction pattern alert
export function alertUnusualTransaction(wallet: string, amount: number, reason: string) {
  alertManager.log(
    'high',
    'Unusual Transaction Pattern',
    `Suspicious transaction detected: ${reason}`,
    { wallet, amount, reason }
  );
}

// Disk space low alert
export function alertDiskSpaceLow(available: number, total: number) {
  const percentUsed = ((total - available) / total) * 100;
  alertManager.log(
    'medium',
    'Disk Space Low',
    `Disk space at ${percentUsed.toFixed(1)}% capacity`,
    { available, total, percentUsed }
  );
}

// Memory usage high alert
export function alertMemoryHigh(used: number, total: number) {
  const percentUsed = (used / total) * 100;
  alertManager.log(
    'medium',
    'High Memory Usage',
    `Memory at ${percentUsed.toFixed(1)}% usage`,
    { used, total, percentUsed }
  );
}

// Get alert summary
export function getAlertSummary() {
  const last24h = Date.now() - 24 * 60 * 60 * 1000;
  const recentAlerts = alertManager
    .getAlerts()
    .filter((a) => a.timestamp > last24h);

  return {
    total: recentAlerts.length,
    bySeverity: {
      critical: recentAlerts.filter((a) => a.severity === 'critical').length,
      high: recentAlerts.filter((a) => a.severity === 'high').length,
      medium: recentAlerts.filter((a) => a.severity === 'medium').length,
      low: recentAlerts.filter((a) => a.severity === 'low').length,
    },
    recent: recentAlerts.slice(-10).reverse(), // Last 10 alerts
  };
}
