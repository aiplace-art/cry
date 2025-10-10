/**
 * Analytics Integration
 * Track user behavior, conversions, and generate insights
 */

import type { AnalyticsEvent, FunnelStage, VisitorStats } from '../types/presale';

const ANALYTICS_STORAGE_KEY = 'hypeai_analytics';
const SESSION_STORAGE_KEY = 'hypeai_session';
const VISITOR_ID_KEY = 'hypeai_visitor_id';

// Funnel stages
enum FunnelStages {
  PAGE_VIEW = 'page_view',
  CALCULATOR_USED = 'calculator_used',
  WALLET_CONNECTED = 'wallet_connected',
  PURCHASE_INITIATED = 'purchase_initiated',
  PURCHASE_COMPLETED = 'purchase_completed'
}

interface Session {
  id: string;
  visitorId: string;
  startTime: number;
  lastActivity: number;
  events: AnalyticsEvent[];
  funnelStage: FunnelStages;
}

class AnalyticsTracker {
  private session: Session | null = null;
  private visitorId: string;
  private eventQueue: AnalyticsEvent[] = [];
  private flushInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.visitorId = this.getOrCreateVisitorId();
    this.initSession();
    this.startAutoFlush();
  }

  /**
   * Get or create unique visitor ID
   */
  private getOrCreateVisitorId(): string {
    try {
      let visitorId = localStorage.getItem(VISITOR_ID_KEY);

      if (!visitorId) {
        visitorId = `visitor_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        localStorage.setItem(VISITOR_ID_KEY, visitorId);
      }

      return visitorId;
    } catch {
      // Fallback if localStorage is not available
      return `visitor_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
  }

  /**
   * Initialize or restore session
   */
  private initSession(): void {
    try {
      const sessionData = sessionStorage.getItem(SESSION_STORAGE_KEY);

      if (sessionData) {
        const parsed = JSON.parse(sessionData);
        // Check if session is still valid (less than 30 minutes old)
        if (Date.now() - parsed.lastActivity < 30 * 60 * 1000) {
          this.session = parsed;
          this.session!.lastActivity = Date.now();
          return;
        }
      }
    } catch (error) {
      console.warn('Failed to restore session:', error);
    }

    // Create new session
    this.session = {
      id: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      visitorId: this.visitorId,
      startTime: Date.now(),
      lastActivity: Date.now(),
      events: [],
      funnelStage: FunnelStages.PAGE_VIEW
    };

    this.saveSession();
    this.track('session_start');
  }

  /**
   * Track an event
   */
  track(event: string, data?: Record<string, any>): void {
    const analyticsEvent: AnalyticsEvent = {
      event,
      timestamp: Date.now(),
      data,
      userId: this.visitorId
    };

    // Add to session events
    if (this.session) {
      this.session.events.push(analyticsEvent);
      this.session.lastActivity = Date.now();
      this.saveSession();
    }

    // Add to queue for batch processing
    this.eventQueue.push(analyticsEvent);

    // Update funnel stage
    this.updateFunnelStage(event);

    console.log('[Analytics]', event, data);
  }

  /**
   * Track page view
   */
  trackPageView(page: string, referrer?: string): void {
    this.track('page_view', {
      page,
      referrer: referrer || document.referrer,
      url: window.location.href,
      userAgent: navigator.userAgent
    });
  }

  /**
   * Track wallet connection
   */
  trackWalletConnection(address: string, provider: string): void {
    this.track('wallet_connected', {
      address: address.substring(0, 10) + '...', // Privacy
      provider,
      chainId: (window as any).ethereum?.chainId
    });
  }

  /**
   * Track purchase attempt
   */
  trackPurchaseAttempt(amount: number, currency: string): void {
    this.track('purchase_initiated', {
      amount,
      currency,
      amountUSD: currency === 'BNB' ? amount * 300 : amount // Rough estimate
    });
  }

  /**
   * Track successful purchase
   */
  trackPurchaseSuccess(txHash: string, amount: number, tokens: number): void {
    this.track('purchase_completed', {
      txHash: txHash.substring(0, 10) + '...',
      amount,
      tokens,
      timestamp: Date.now()
    });
  }

  /**
   * Track calculator usage
   */
  trackCalculatorUsage(inputAmount: number, inputType: 'USD' | 'BNB', result: any): void {
    this.track('calculator_used', {
      inputAmount,
      inputType,
      outputTokens: result.totalTokens,
      vipTier: result.vipTier?.name || 'none'
    });
  }

  /**
   * Track errors
   */
  trackError(error: Error, context?: string): void {
    this.track('error', {
      message: error.message,
      stack: error.stack?.substring(0, 200),
      context
    });
  }

  /**
   * Update funnel stage
   */
  private updateFunnelStage(event: string): void {
    if (!this.session) return;

    const stageMap: Record<string, FunnelStages> = {
      'page_view': FunnelStages.PAGE_VIEW,
      'calculator_used': FunnelStages.CALCULATOR_USED,
      'wallet_connected': FunnelStages.WALLET_CONNECTED,
      'purchase_initiated': FunnelStages.PURCHASE_INITIATED,
      'purchase_completed': FunnelStages.PURCHASE_COMPLETED
    };

    const newStage = stageMap[event];
    if (newStage) {
      this.session.funnelStage = newStage;
      this.saveSession();
    }
  }

  /**
   * Get conversion funnel data
   */
  getFunnelData(): FunnelStage[] {
    const events = this.getAllEvents();

    const stages = [
      { name: 'Page Views', event: 'page_view' },
      { name: 'Calculator Used', event: 'calculator_used' },
      { name: 'Wallet Connected', event: 'wallet_connected' },
      { name: 'Purchase Initiated', event: 'purchase_initiated' },
      { name: 'Purchase Completed', event: 'purchase_completed' }
    ];

    const total = events.filter(e => e.event === 'page_view').length || 1;

    return stages.map(stage => {
      const count = events.filter(e => e.event === stage.event).length;
      return {
        name: stage.name,
        count,
        percentage: (count / total) * 100
      };
    });
  }

  /**
   * Get visitor statistics
   */
  getVisitorStats(): VisitorStats {
    const events = this.getAllEvents();
    const purchases = events.filter(e => e.event === 'purchase_completed');

    // Simulate online users (in real app, this would come from backend)
    const onlineCount = Math.floor(Math.random() * 50) + 20;

    // Calculate average investment
    const totalInvestment = purchases.reduce((sum, e) => {
      return sum + (e.data?.amount || 0);
    }, 0);
    const avgInvestment = purchases.length > 0
      ? totalInvestment / purchases.length
      : 0;

    return {
      online: onlineCount,
      total: this.getUniqueVisitors(),
      purchases24h: this.getPurchases24h(),
      avgInvestment
    };
  }

  /**
   * Get unique visitors count
   */
  private getUniqueVisitors(): number {
    const events = this.getAllEvents();
    const uniqueVisitors = new Set(events.map(e => e.userId));
    return uniqueVisitors.size;
  }

  /**
   * Get purchases in last 24 hours
   */
  private getPurchases24h(): number {
    const events = this.getAllEvents();
    const dayAgo = Date.now() - 24 * 60 * 60 * 1000;
    return events.filter(e =>
      e.event === 'purchase_completed' && e.timestamp > dayAgo
    ).length;
  }

  /**
   * Save session to storage
   */
  private saveSession(): void {
    if (!this.session) return;

    try {
      sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(this.session));
    } catch (error) {
      console.warn('Failed to save session:', error);
    }
  }

  /**
   * Get all stored events
   */
  private getAllEvents(): AnalyticsEvent[] {
    try {
      const data = localStorage.getItem(ANALYTICS_STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  /**
   * Start auto-flush timer
   */
  private startAutoFlush(): void {
    this.flushInterval = setInterval(() => {
      this.flush();
    }, 30000); // Flush every 30 seconds
  }

  /**
   * Flush events to storage
   */
  flush(): void {
    if (this.eventQueue.length === 0) return;

    try {
      const existing = this.getAllEvents();
      const updated = [...existing, ...this.eventQueue];

      // Keep only last 1000 events
      const trimmed = updated.slice(-1000);

      localStorage.setItem(ANALYTICS_STORAGE_KEY, JSON.stringify(trimmed));
      this.eventQueue = [];
    } catch (error) {
      console.warn('Failed to flush analytics:', error);
    }
  }

  /**
   * Get session duration in seconds
   */
  getSessionDuration(): number {
    if (!this.session) return 0;
    return Math.floor((Date.now() - this.session.startTime) / 1000);
  }

  /**
   * Destroy tracker and cleanup
   */
  destroy(): void {
    if (this.flushInterval) {
      clearInterval(this.flushInterval);
    }
    this.flush();
    this.track('session_end', {
      duration: this.getSessionDuration()
    });
  }
}

// Export singleton instance
export const analytics = new AnalyticsTracker();

// Auto-track page view on load
if (typeof window !== 'undefined') {
  analytics.trackPageView(window.location.pathname);

  // Track session end on page unload
  window.addEventListener('beforeunload', () => {
    analytics.destroy();
  });
}
