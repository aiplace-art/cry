// Business Analytics for HypeAI Private Sale
// Track sales, user behavior, conversions, and custom events

import { logBusinessEvent } from '../../sentry.client.config';

interface AnalyticsEvent {
  category: string;
  action: string;
  label?: string;
  value?: number;
  timestamp: number;
  metadata?: Record<string, any>;
}

class Analytics {
  private events: AnalyticsEvent[] = [];
  private maxEvents = 1000;

  // Track custom event
  track(
    category: string,
    action: string,
    label?: string,
    value?: number,
    metadata?: Record<string, any>
  ) {
    const event: AnalyticsEvent = {
      category,
      action,
      label,
      value,
      timestamp: Date.now(),
      metadata,
    };

    this.events.push(event);

    // Keep only last N events
    if (this.events.length > this.maxEvents) {
      this.events.shift();
    }

    // Send to Sentry for correlation with errors
    logBusinessEvent(category, `${action}: ${label || ''}`, {
      value,
      ...metadata,
    });

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log('[Analytics]', category, action, label, value, metadata);
    }

    return event;
  }

  // Get events by category
  getEvents(category?: string): AnalyticsEvent[] {
    if (category) {
      return this.events.filter((e) => e.category === category);
    }
    return this.events;
  }

  // Calculate conversion rate
  getConversionRate(fromAction: string, toAction: string): number {
    const fromEvents = this.events.filter((e) => e.action === fromAction);
    const toEvents = this.events.filter((e) => e.action === toAction);

    if (fromEvents.length === 0) return 0;
    return (toEvents.length / fromEvents.length) * 100;
  }

  // Export analytics data
  export(): AnalyticsEvent[] {
    return [...this.events];
  }

  // Clear events
  clear() {
    this.events = [];
  }
}

// Global analytics instance
export const analytics = new Analytics();

// Common event tracking functions

// Track page view
export function trackPageView(page: string, metadata?: Record<string, any>) {
  analytics.track('page', 'view', page, undefined, metadata);
}

// Track wallet connection
export function trackWalletConnect(walletType: string, address: string) {
  analytics.track('wallet', 'connect', walletType, undefined, {
    address: address.substring(0, 10) + '...', // Partial address for privacy
  });
}

// Track wallet disconnect
export function trackWalletDisconnect() {
  analytics.track('wallet', 'disconnect');
}

// Track purchase attempt
export function trackPurchaseStart(
  amount: number,
  paymentMethod: string,
  metadata?: Record<string, any>
) {
  analytics.track('purchase', 'start', paymentMethod, amount, metadata);
}

// Track purchase completion
export function trackPurchaseComplete(
  amount: number,
  paymentMethod: string,
  tokens: number,
  txHash: string
) {
  analytics.track('purchase', 'complete', paymentMethod, amount, {
    tokens,
    txHash: txHash.substring(0, 10) + '...', // Partial hash
  });
}

// Track purchase failure
export function trackPurchaseError(
  reason: string,
  amount?: number,
  paymentMethod?: string
) {
  analytics.track('purchase', 'error', reason, amount, { paymentMethod });
}

// Track calculator usage
export function trackCalculatorUse(inputAmount: number, outputTokens: number) {
  analytics.track('calculator', 'calculate', undefined, inputAmount, {
    outputTokens,
  });
}

// Track referral link generation
export function trackReferralGenerate(code: string) {
  analytics.track('referral', 'generate', code);
}

// Track referral link share
export function trackReferralShare(code: string, method: string) {
  analytics.track('referral', 'share', method, undefined, { code });
}

// Track FAQ interaction
export function trackFAQClick(question: string) {
  analytics.track('faq', 'click', question);
}

// Track social media click
export function trackSocialClick(platform: string) {
  analytics.track('social', 'click', platform);
}

// Track whitepaper download
export function trackWhitepaperDownload() {
  analytics.track('content', 'download', 'whitepaper');
}

// Track newsletter signup
export function trackNewsletterSignup(email: string) {
  analytics.track('newsletter', 'signup', 'email', undefined, {
    email: '[REDACTED]', // Don't log actual email
  });
}

// Track network switch
export function trackNetworkSwitch(fromNetwork: string, toNetwork: string) {
  analytics.track('network', 'switch', toNetwork, undefined, {
    fromNetwork,
  });
}

// Track token claim
export function trackTokenClaim(amount: number, type: string) {
  analytics.track('vesting', 'claim', type, amount);
}

// Track staking
export function trackStaking(amount: number, duration: number) {
  analytics.track('staking', 'stake', undefined, amount, {
    duration,
  });
}

// Track governance vote
export function trackGovernanceVote(proposalId: string, vote: string) {
  analytics.track('governance', 'vote', vote, undefined, {
    proposalId,
  });
}

// Track error occurrence (non-critical)
export function trackError(category: string, message: string, metadata?: Record<string, any>) {
  analytics.track('error', category, message, undefined, metadata);
}

// Track user engagement
export function trackEngagement(action: string, duration?: number) {
  analytics.track('engagement', action, undefined, duration);
}

// Track form field interactions
export function trackFormField(fieldName: string, action: string) {
  analytics.track('form', action, fieldName);
}

// Track button clicks
export function trackButtonClick(buttonName: string, location?: string) {
  analytics.track('interaction', 'click', buttonName, undefined, {
    location,
  });
}

// Track modal open/close
export function trackModal(modalName: string, action: 'open' | 'close') {
  analytics.track('modal', action, modalName);
}

// Track video play/pause
export function trackVideo(videoName: string, action: string, position?: number) {
  analytics.track('video', action, videoName, position);
}

// Get business metrics summary
export function getBusinessMetrics() {
  const allEvents = analytics.export();

  return {
    // Purchase metrics
    purchases: {
      total: allEvents.filter((e) => e.category === 'purchase' && e.action === 'complete')
        .length,
      totalValue: allEvents
        .filter((e) => e.category === 'purchase' && e.action === 'complete')
        .reduce((sum, e) => sum + (e.value || 0), 0),
      byPaymentMethod: allEvents
        .filter((e) => e.category === 'purchase' && e.action === 'complete')
        .reduce((acc, e) => {
          const method = e.label || 'unknown';
          acc[method] = (acc[method] || 0) + (e.value || 0);
          return acc;
        }, {} as Record<string, number>),
      failed: allEvents.filter((e) => e.category === 'purchase' && e.action === 'error')
        .length,
    },

    // Wallet metrics
    wallets: {
      connected: allEvents.filter((e) => e.category === 'wallet' && e.action === 'connect')
        .length,
      disconnected: allEvents.filter(
        (e) => e.category === 'wallet' && e.action === 'disconnect'
      ).length,
      byType: allEvents
        .filter((e) => e.category === 'wallet' && e.action === 'connect')
        .reduce((acc, e) => {
          const type = e.label || 'unknown';
          acc[type] = (acc[type] || 0) + 1;
          return acc;
        }, {} as Record<string, number>),
    },

    // Conversion funnel
    funnel: {
      pageViews: allEvents.filter((e) => e.category === 'page' && e.action === 'view').length,
      walletConnects: allEvents.filter(
        (e) => e.category === 'wallet' && e.action === 'connect'
      ).length,
      purchaseStarts: allEvents.filter(
        (e) => e.category === 'purchase' && e.action === 'start'
      ).length,
      purchaseCompletes: allEvents.filter(
        (e) => e.category === 'purchase' && e.action === 'complete'
      ).length,
      conversionRate: analytics.getConversionRate('connect', 'complete'),
    },

    // Engagement metrics
    engagement: {
      calculatorUses: allEvents.filter(
        (e) => e.category === 'calculator' && e.action === 'calculate'
      ).length,
      faqClicks: allEvents.filter((e) => e.category === 'faq' && e.action === 'click').length,
      socialClicks: allEvents.filter((e) => e.category === 'social' && e.action === 'click')
        .length,
      referrals: allEvents.filter((e) => e.category === 'referral').length,
    },

    // Error metrics
    errors: {
      total: allEvents.filter((e) => e.category === 'error').length,
      byType: allEvents
        .filter((e) => e.category === 'error')
        .reduce((acc, e) => {
          const type = e.action || 'unknown';
          acc[type] = (acc[type] || 0) + 1;
          return acc;
        }, {} as Record<string, number>),
    },
  };
}

// Export data for external analytics (Google Analytics, Mixpanel, etc.)
export function exportForExternalAnalytics() {
  return analytics.export().map((event) => ({
    event: `${event.category}_${event.action}`,
    params: {
      event_category: event.category,
      event_action: event.action,
      event_label: event.label,
      value: event.value,
      ...event.metadata,
    },
  }));
}
