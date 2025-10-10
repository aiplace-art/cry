/**
 * React Hook for Analytics
 */

import { useEffect, useCallback, useState } from 'react';
import { analytics } from '../lib/analytics';
import type { FunnelStage, VisitorStats } from '../types/presale';

export function useAnalytics() {
  const [funnelData, setFunnelData] = useState<FunnelStage[]>([]);
  const [visitorStats, setVisitorStats] = useState<VisitorStats | null>(null);

  /**
   * Track custom event
   */
  const track = useCallback((event: string, data?: Record<string, any>) => {
    analytics.track(event, data);
  }, []);

  /**
   * Track page view
   */
  const trackPageView = useCallback((page: string, referrer?: string) => {
    analytics.trackPageView(page, referrer);
  }, []);

  /**
   * Track wallet connection
   */
  const trackWalletConnection = useCallback((address: string, provider: string) => {
    analytics.trackWalletConnection(address, provider);
  }, []);

  /**
   * Track purchase attempt
   */
  const trackPurchaseAttempt = useCallback((amount: number, currency: string) => {
    analytics.trackPurchaseAttempt(amount, currency);
  }, []);

  /**
   * Track successful purchase
   */
  const trackPurchaseSuccess = useCallback((txHash: string, amount: number, tokens: number) => {
    analytics.trackPurchaseSuccess(txHash, amount, tokens);
  }, []);

  /**
   * Get funnel data
   */
  const loadFunnelData = useCallback(() => {
    const data = analytics.getFunnelData();
    setFunnelData(data);
  }, []);

  /**
   * Get visitor statistics
   */
  const loadVisitorStats = useCallback(() => {
    const stats = analytics.getVisitorStats();
    setVisitorStats(stats);
  }, []);

  /**
   * Get session duration
   */
  const getSessionDuration = useCallback(() => {
    return analytics.getSessionDuration();
  }, []);

  // Load initial data
  useEffect(() => {
    loadFunnelData();
    loadVisitorStats();

    // Refresh stats every 30 seconds
    const interval = setInterval(() => {
      loadFunnelData();
      loadVisitorStats();
    }, 30000);

    return () => clearInterval(interval);
  }, [loadFunnelData, loadVisitorStats]);

  return {
    track,
    trackPageView,
    trackWalletConnection,
    trackPurchaseAttempt,
    trackPurchaseSuccess,
    funnelData,
    visitorStats,
    sessionDuration: getSessionDuration(),
    refreshData: () => {
      loadFunnelData();
      loadVisitorStats();
    }
  };
}
