/**
 * React Hook for Smart Recommendations
 */

import { useState, useEffect, useCallback } from 'react';
import { recommendationEngine } from '../lib/recommendations';
import type { Recommendation } from '../types/presale';

interface RecommendationsState {
  recommendations: Recommendation[];
  fomo: ReturnType<typeof recommendationEngine.getFOMOTrigger>;
  loading: boolean;
}

interface UserContext {
  currentInvestment: number;
  walletConnected: boolean;
  previousVisits: number;
  timeOnPage: number;
  calculatorUsage: number;
}

export function useRecommendations(context: UserContext) {
  const [state, setState] = useState<RecommendationsState>({
    recommendations: [],
    fomo: null,
    loading: true
  });

  /**
   * Load recommendations
   */
  const loadRecommendations = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true }));

    try {
      const recommendations = await recommendationEngine.generateRecommendations(context);
      const fomo = recommendationEngine.getFOMOTrigger();

      setState({
        recommendations,
        fomo,
        loading: false
      });
    } catch (error) {
      console.error('Failed to load recommendations:', error);
      setState(prev => ({ ...prev, loading: false }));
    }
  }, [context]);

  /**
   * Get suggested amounts
   */
  const getSuggestedAmounts = useCallback(() => {
    return recommendationEngine.getSuggestedAmounts();
  }, []);

  // Load recommendations when context changes
  useEffect(() => {
    loadRecommendations();
  }, [loadRecommendations]);

  // Refresh FOMO trigger every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      const fomo = recommendationEngine.getFOMOTrigger();
      setState(prev => ({ ...prev, fomo }));
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  return {
    ...state,
    getSuggestedAmounts,
    refresh: loadRecommendations
  };
}
