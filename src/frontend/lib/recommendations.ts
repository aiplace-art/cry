/**
 * Smart Recommendations Engine
 * Provides intelligent investment suggestions based on user behavior and market data
 */

import type { Recommendation, VIPTier } from '../types/presale';
import { VIP_TIERS, priceCalculator } from './calculator';

interface UserContext {
  currentInvestment: number;
  walletConnected: boolean;
  previousVisits: number;
  timeOnPage: number;
  calculatorUsage: number;
}

class RecommendationEngine {
  /**
   * Generate personalized recommendations
   */
  async generateRecommendations(context: UserContext): Promise<Recommendation[]> {
    const recommendations: Recommendation[] = [];

    // Investment amount recommendations
    const investmentRec = await this.getInvestmentRecommendation(context);
    if (investmentRec) recommendations.push(investmentRec);

    // VIP tier upgrade recommendations
    const tierRec = this.getVIPTierRecommendation(context);
    if (tierRec) recommendations.push(tierRec);

    // Payment method recommendations
    const paymentRec = await this.getPaymentMethodRecommendation(context);
    if (paymentRec) recommendations.push(paymentRec);

    // Timing recommendations
    const timingRec = this.getTimingRecommendation(context);
    if (timingRec) recommendations.push(timingRec);

    return recommendations;
  }

  /**
   * Recommend optimal investment amount
   */
  private async getInvestmentRecommendation(context: UserContext): Promise<Recommendation | null> {
    if (context.currentInvestment > 0) return null;

    // For new users, suggest starting tier
    const suggestedAmount = 1000; // Conservative start
    const calculation = await priceCalculator.calculateFromUSD(suggestedAmount);

    return {
      type: 'investment',
      title: 'Smart Start Investment',
      description: `Start with $${suggestedAmount} to receive ${Math.floor(calculation.totalTokens).toLocaleString()} HYPEAI tokens`,
      value: `$${suggestedAmount}`,
      confidence: 0.85,
      reason: 'Balanced entry point with ${calculation.bonusTokens.toLocaleString()} bonus tokens included'
    };
  }

  /**
   * Recommend VIP tier upgrade
   */
  private getVIPTierRecommendation(context: UserContext): Recommendation | null {
    if (context.currentInvestment === 0) return null;

    const nextTier = priceCalculator.getNextTierRecommendation(context.currentInvestment);

    if (!nextTier.nextTier || nextTier.additionalNeeded <= 0) {
      return null;
    }

    const additionalTokens = (nextTier.additionalNeeded / 0.00015) * (nextTier.additionalBonus / 100);

    return {
      type: 'tier',
      title: `Upgrade to ${nextTier.nextTier.name}`,
      description: `Add $${Math.floor(nextTier.additionalNeeded).toLocaleString()} to unlock ${nextTier.nextTier.name} benefits`,
      value: `+${nextTier.additionalBonus}% bonus`,
      confidence: 0.9,
      reason: `Earn ${Math.floor(additionalTokens).toLocaleString()} extra bonus tokens`
    };
  }

  /**
   * Recommend best payment method
   */
  private async getPaymentMethodRecommendation(context: UserContext): Promise<Recommendation | null> {
    try {
      const priceData = await priceCalculator.getPriceData();

      // Simple heuristic: recommend BNB if price is favorable
      const bnbVolatility = this.estimateBNBVolatility();

      if (bnbVolatility < 0.05) { // Low volatility
        return {
          type: 'payment',
          title: 'Use BNB for Payment',
          description: 'BNB price is stable - good time to use BNB for purchase',
          value: `$${priceData.bnbPriceUSD.toFixed(2)} per BNB`,
          confidence: 0.75,
          reason: 'Current BNB price offers good value with low volatility'
        };
      } else {
        return {
          type: 'payment',
          title: 'Use USDT for Payment',
          description: 'BNB showing volatility - USDT provides price stability',
          value: 'Stable pricing',
          confidence: 0.8,
          reason: 'Avoid price fluctuations during transaction processing'
        };
      }
    } catch {
      return null;
    }
  }

  /**
   * Recommend optimal purchase timing
   */
  private getTimingRecommendation(context: UserContext): Recommendation | null {
    const hour = new Date().getHours();

    // Recommend buying during presale bonus periods
    if (this.isHighDemandPeriod()) {
      return {
        type: 'timing',
        title: 'Act Now - High Demand Period',
        description: 'Current period showing increased purchase activity',
        value: 'Limited time',
        confidence: 0.7,
        reason: 'Secure your allocation before tier sells out'
      };
    }

    // Recommend based on time of day (less network congestion)
    if (hour >= 2 && hour <= 6) { // Late night UTC
      return {
        type: 'timing',
        title: 'Optimal Network Conditions',
        description: 'Low network congestion - faster transaction processing',
        value: 'Lower gas fees',
        confidence: 0.65,
        reason: 'Current time offers reduced transaction costs'
      };
    }

    return null;
  }

  /**
   * Generate FOMO trigger based on current metrics
   */
  getFOMOTrigger(): {
    message: string;
    urgency: 'low' | 'medium' | 'high';
    data: any;
  } | null {
    const triggers = [
      {
        condition: () => this.getRemainingSpots() < 100,
        message: `Only ${this.getRemainingSpots()} spots remaining in this tier!`,
        urgency: 'high' as const,
        data: { spots: this.getRemainingSpots() }
      },
      {
        condition: () => this.getRecentPurchases() > 10,
        message: `${this.getRecentPurchases()} purchases in the last hour`,
        urgency: 'medium' as const,
        data: { purchases: this.getRecentPurchases() }
      },
      {
        condition: () => this.getTimeRemaining() < 24 * 60 * 60,
        message: 'Less than 24 hours until presale ends!',
        urgency: 'high' as const,
        data: { timeLeft: this.getTimeRemaining() }
      }
    ];

    for (const trigger of triggers) {
      if (trigger.condition()) {
        return trigger;
      }
    }

    return null;
  }

  /**
   * Get suggested investment amounts for quick selection
   */
  getSuggestedAmounts(): { amount: number; label: string; highlight?: boolean }[] {
    return [
      { amount: 500, label: 'Starter', highlight: false },
      { amount: 1000, label: 'Popular', highlight: true },
      { amount: 5000, label: 'Silver VIP', highlight: false },
      { amount: 10000, label: 'Gold VIP', highlight: false },
      { amount: 25000, label: 'Platinum VIP', highlight: false },
      { amount: 50000, label: 'Diamond VIP', highlight: false }
    ];
  }

  // Helper methods (would connect to real data sources in production)

  private estimateBNBVolatility(): number {
    // In production, calculate from historical price data
    return Math.random() * 0.1; // Simulated volatility 0-10%
  }

  private isHighDemandPeriod(): boolean {
    // In production, check actual purchase rate from analytics
    return Math.random() > 0.7; // 30% chance
  }

  private getRemainingSpots(): number {
    // In production, fetch from smart contract
    return Math.floor(Math.random() * 500) + 50;
  }

  private getRecentPurchases(): number {
    // In production, fetch from analytics
    return Math.floor(Math.random() * 20);
  }

  private getTimeRemaining(): number {
    // In production, calculate from presale end date
    const endDate = new Date('2025-12-31').getTime();
    return Math.floor((endDate - Date.now()) / 1000);
  }
}

// Export singleton instance
export const recommendationEngine = new RecommendationEngine();
