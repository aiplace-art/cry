/**
 * Analytics tracking for AI chat
 * Sends events to external analytics services
 */

/**
 * Track analytics event
 * @param {object} data - Event data
 */
export async function trackAnalytics(data) {
  // Skip if analytics disabled
  if (process.env.DISABLE_ANALYTICS === 'true') {
    return;
  }

  const event = {
    timestamp: new Date().toISOString(),
    ...data
  };

  // Log in development
  if (process.env.NODE_ENV === 'development') {
    console.log('[Analytics]', event);
  }

  // Send to multiple services (don't await - fire and forget)
  const promises = [];

  // 1. Send to Express API analytics endpoint (if available)
  if (process.env.EXPRESS_API_URL) {
    promises.push(
      fetch(`${process.env.EXPRESS_API_URL}/api/ai-assistant/analytics`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': process.env.EXPRESS_API_KEY || ''
        },
        body: JSON.stringify(event)
      }).catch(err => {
        if (process.env.NODE_ENV === 'development') {
          console.error('[Analytics Express Error]', err.message);
        }
      })
    );
  }

  // 2. Send to Google Analytics (if configured)
  if (process.env.GA_MEASUREMENT_ID) {
    promises.push(
      sendToGoogleAnalytics(event).catch(err => {
        if (process.env.NODE_ENV === 'development') {
          console.error('[Analytics GA Error]', err.message);
        }
      })
    );
  }

  // 3. Send to custom webhook (if configured)
  if (process.env.ANALYTICS_WEBHOOK_URL) {
    promises.push(
      fetch(process.env.ANALYTICS_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(event)
      }).catch(err => {
        if (process.env.NODE_ENV === 'development') {
          console.error('[Analytics Webhook Error]', err.message);
        }
      })
    );
  }

  // Execute all in parallel (fire and forget)
  Promise.allSettled(promises);
}

/**
 * Send event to Google Analytics 4
 */
async function sendToGoogleAnalytics(event) {
  const measurementId = process.env.GA_MEASUREMENT_ID;
  const apiSecret = process.env.GA_API_SECRET;

  if (!measurementId || !apiSecret) {
    return;
  }

  const url = `https://www.google-analytics.com/mp/collect?measurement_id=${measurementId}&api_secret=${apiSecret}`;

  await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: event.sessionId || 'anonymous',
      events: [{
        name: event.event || 'chat_interaction',
        params: {
          language: event.language,
          message_length: event.messageLength,
          response_time: event.responseTime,
          cached: event.cached,
          model: event.model
        }
      }]
    })
  });
}

/**
 * Track conversion event (for paid features)
 */
export async function trackConversion(data) {
  return trackAnalytics({
    event: 'conversion',
    ...data
  });
}

/**
 * Track error event
 */
export async function trackError(error, context = {}) {
  return trackAnalytics({
    event: 'error',
    errorMessage: error.message,
    errorStack: error.stack?.substring(0, 500), // Limit stack trace
    ...context
  });
}

/**
 * Batch analytics events (for high-volume scenarios)
 */
const eventBuffer = [];
const BATCH_SIZE = 10;
const FLUSH_INTERVAL = 5000; // 5 seconds

export function trackBatched(data) {
  eventBuffer.push({
    timestamp: new Date().toISOString(),
    ...data
  });

  if (eventBuffer.length >= BATCH_SIZE) {
    flushAnalytics();
  }
}

async function flushAnalytics() {
  if (eventBuffer.length === 0) return;

  const batch = eventBuffer.splice(0, eventBuffer.length);

  // Send batch to analytics endpoint
  if (process.env.EXPRESS_API_URL) {
    fetch(`${process.env.EXPRESS_API_URL}/api/ai-assistant/analytics/batch`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': process.env.EXPRESS_API_KEY || ''
      },
      body: JSON.stringify({ events: batch })
    }).catch(err => {
      console.error('[Analytics Batch Error]', err.message);
    });
  }
}

// Auto-flush every 5 seconds
if (typeof setInterval !== 'undefined') {
  setInterval(flushAnalytics, FLUSH_INTERVAL);
}
