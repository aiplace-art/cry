// Alert API Endpoint - Receive and process alerts from frontend

import type { NextApiRequest, NextApiResponse } from 'next';
import { trackSecurityEvent } from '../../sentry.server.config';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const alert = req.body;

    // Validate alert structure
    if (!alert.severity || !alert.title || !alert.message) {
      return res.status(400).json({ error: 'Invalid alert format' });
    }

    // Log alert
    console.error(`[ALERT] [${alert.severity.toUpperCase()}] ${alert.title}: ${alert.message}`);

    // Send to Sentry for critical/high alerts
    if (alert.severity === 'critical' || alert.severity === 'high') {
      trackSecurityEvent(alert.title, alert.severity, {
        message: alert.message,
        ...alert.metadata,
      });
    }

    // Here you would send alerts to external services:
    // - Email (Nodemailer, SendGrid)
    // - SMS (Twilio)
    // - Slack (Webhook)
    // - PagerDuty (API)

    // For now, just acknowledge
    res.status(200).json({ success: true, alert });
  } catch (error) {
    console.error('Failed to process alert:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to process alert',
    });
  }
}
