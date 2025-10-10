/**
 * React Hook for Price Calculator
 */

import { useState, useEffect, useCallback } from 'react';
import { priceCalculator } from '../lib/calculator';
import { analytics } from '../lib/analytics';
import type { CalculationResult, PriceData } from '../types/presale';

interface CalculatorState {
  result: CalculationResult | null;
  priceData: PriceData | null;
  loading: boolean;
  error: Error | null;
}

export function useCalculator() {
  const [state, setState] = useState<CalculatorState>({
    result: null,
    priceData: null,
    loading: false,
    error: null
  });

  /**
   * Load current price data
   */
  const loadPriceData = useCallback(async () => {
    try {
      const data = await priceCalculator.getPriceData();
      setState(prev => ({ ...prev, priceData: data, error: null }));
    } catch (error) {
      console.error('Failed to load price data:', error);
      setState(prev => ({ ...prev, error: error as Error }));
    }
  }, []);

  /**
   * Calculate from USD amount
   */
  const calculateFromUSD = useCallback(async (amount: number) => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const result = await priceCalculator.calculateFromUSD(amount);
      setState(prev => ({ ...prev, result, loading: false }));

      // Track calculator usage
      analytics.trackCalculatorUsage(amount, 'USD', result);

      return result;
    } catch (error) {
      console.error('Calculation error:', error);
      setState(prev => ({ ...prev, loading: false, error: error as Error }));
      analytics.trackError(error as Error, 'calculator_usd');
      return null;
    }
  }, []);

  /**
   * Calculate from BNB amount
   */
  const calculateFromBNB = useCallback(async (amount: number) => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const result = await priceCalculator.calculateFromBNB(amount);
      setState(prev => ({ ...prev, result, loading: false }));

      // Track calculator usage
      analytics.trackCalculatorUsage(amount, 'BNB', result);

      return result;
    } catch (error) {
      console.error('Calculation error:', error);
      setState(prev => ({ ...prev, loading: false, error: error as Error }));
      analytics.trackError(error as Error, 'calculator_bnb');
      return null;
    }
  }, []);

  /**
   * Get suggested investment amounts
   */
  const getSuggestedAmounts = useCallback(() => {
    return priceCalculator.getSuggestedAmounts();
  }, []);

  /**
   * Get next tier recommendation
   */
  const getNextTierRecommendation = useCallback((currentUSD: number) => {
    return priceCalculator.getNextTierRecommendation(currentUSD);
  }, []);

  // Load price data on mount
  useEffect(() => {
    loadPriceData();

    // Refresh price data every minute
    const interval = setInterval(loadPriceData, 60000);

    return () => clearInterval(interval);
  }, [loadPriceData]);

  return {
    ...state,
    calculateFromUSD,
    calculateFromBNB,
    getSuggestedAmounts,
    getNextTierRecommendation,
    refreshPriceData: loadPriceData
  };
}
