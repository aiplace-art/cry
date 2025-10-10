/**
 * Smart Price Calculator
 * Real-time BNB pricing, USD conversion, ROI projections, and VIP tier calculations
 */

import type { PriceData, CalculationResult, VIPTier } from '../types/presale';

const HYPEAI_PRESALE_PRICE = 0.00015; // $0.00015 per token
const BASE_BONUS_PERCENTAGE = 10; // 10% bonus for all purchases
const BNB_PRICE_CACHE_KEY = 'hypeai_bnb_price';
const CACHE_DURATION = 60000; // 1 minute

// VIP Tier Configuration
export const VIP_TIERS: VIPTier[] = [
  {
    name: 'Diamond VIP',
    minInvestment: 50000,
    maxInvestment: Infinity,
    bonusPercentage: 25,
    benefits: [
      'Priority customer support',
      'Exclusive diamond NFT',
      'Early access to new features',
      'Quarterly strategy sessions',
      'Dedicated account manager'
    ],
    priority: 1
  },
  {
    name: 'Platinum VIP',
    minInvestment: 25000,
    maxInvestment: 49999,
    bonusPercentage: 20,
    benefits: [
      'Priority customer support',
      'Platinum NFT badge',
      'Early access to new features',
      'Monthly newsletters',
      'VIP community access'
    ],
    priority: 2
  },
  {
    name: 'Gold VIP',
    minInvestment: 10000,
    maxInvestment: 24999,
    bonusPercentage: 15,
    benefits: [
      'Enhanced customer support',
      'Gold NFT badge',
      'Beta feature access',
      'Quarterly updates'
    ],
    priority: 3
  },
  {
    name: 'Silver VIP',
    minInvestment: 5000,
    maxInvestment: 9999,
    bonusPercentage: 12,
    benefits: [
      'Priority support queue',
      'Silver NFT badge',
      'Community recognition'
    ],
    priority: 4
  }
];

class PriceCalculator {
  private priceCache: PriceData | null = null;
  private cacheTimestamp: number = 0;

  /**
   * Fetch real-time BNB price from CoinGecko API
   */
  async fetchBNBPrice(): Promise<number> {
    // Check cache first
    if (this.priceCache && Date.now() - this.cacheTimestamp < CACHE_DURATION) {
      return this.priceCache.bnbPriceUSD;
    }

    // Try localStorage cache
    const cachedData = this.loadFromStorage();
    if (cachedData && Date.now() - cachedData.lastUpdated < CACHE_DURATION) {
      this.priceCache = cachedData;
      this.cacheTimestamp = cachedData.lastUpdated;
      return cachedData.bnbPriceUSD;
    }

    try {
      const response = await fetch(
        'https://api.coingecko.com/api/v3/simple/price?ids=binancecoin&vs_currencies=usd',
        {
          headers: {
            'Accept': 'application/json'
          }
        }
      );

      if (!response.ok) {
        throw new Error(`CoinGecko API error: ${response.status}`);
      }

      const data = await response.json();
      const bnbPrice = data.binancecoin?.usd;

      if (!bnbPrice) {
        throw new Error('Invalid price data received');
      }

      // Update cache
      this.priceCache = {
        bnbPriceUSD: bnbPrice,
        hypeaiPriceUSD: HYPEAI_PRESALE_PRICE,
        lastUpdated: Date.now()
      };
      this.cacheTimestamp = Date.now();
      this.saveToStorage(this.priceCache);

      return bnbPrice;
    } catch (error) {
      console.error('Failed to fetch BNB price:', error);

      // Fallback to cached data if available
      if (cachedData) {
        console.warn('Using stale BNB price from cache');
        return cachedData.bnbPriceUSD;
      }

      // Last resort: use a conservative estimate
      console.warn('Using fallback BNB price estimate');
      return 300; // Conservative fallback
    }
  }

  /**
   * Calculate investment details from USD amount
   */
  async calculateFromUSD(usdAmount: number): Promise<CalculationResult> {
    const bnbPrice = await this.fetchBNBPrice();
    const bnbAmount = usdAmount / bnbPrice;

    return this.performCalculation(usdAmount, bnbAmount);
  }

  /**
   * Calculate investment details from BNB amount
   */
  async calculateFromBNB(bnbAmount: number): Promise<CalculationResult> {
    const bnbPrice = await this.fetchBNBPrice();
    const usdAmount = bnbAmount * bnbPrice;

    return this.performCalculation(usdAmount, bnbAmount);
  }

  /**
   * Core calculation logic
   */
  private performCalculation(usdAmount: number, bnbAmount: number): CalculationResult {
    // Calculate base tokens
    const baseTokens = usdAmount / HYPEAI_PRESALE_PRICE;

    // Determine VIP tier
    const vipTier = this.getVIPTier(usdAmount);

    // Calculate bonus
    const bonusPercentage = vipTier
      ? vipTier.bonusPercentage
      : BASE_BONUS_PERCENTAGE;
    const bonusTokens = baseTokens * (bonusPercentage / 100);
    const totalTokens = baseTokens + bonusTokens;

    // Calculate ROI projections
    const roi = this.calculateROI(usdAmount, totalTokens);

    return {
      bnbAmount,
      usdtAmount: usdAmount,
      hypeaiTokens: baseTokens,
      bonusTokens,
      totalTokens,
      roi,
      vipTier
    };
  }

  /**
   * Calculate ROI projections based on market scenarios
   */
  private calculateROI(investment: number, tokens: number): {
    week1: number;
    month1: number;
    month6: number;
  } {
    // Conservative growth projections
    const week1Price = HYPEAI_PRESALE_PRICE * 1.5; // 50% increase
    const month1Price = HYPEAI_PRESALE_PRICE * 3; // 200% increase
    const month6Price = HYPEAI_PRESALE_PRICE * 10; // 900% increase

    return {
      week1: (tokens * week1Price - investment) / investment * 100,
      month1: (tokens * month1Price - investment) / investment * 100,
      month6: (tokens * month6Price - investment) / investment * 100
    };
  }

  /**
   * Determine VIP tier based on investment amount
   */
  getVIPTier(usdAmount: number): VIPTier | null {
    for (const tier of VIP_TIERS) {
      if (usdAmount >= tier.minInvestment && usdAmount <= tier.maxInvestment) {
        return tier;
      }
    }
    return null;
  }

  /**
   * Get suggested investment amounts for VIP tiers
   */
  getSuggestedAmounts(): { amount: number; tier: VIPTier }[] {
    return VIP_TIERS.map(tier => ({
      amount: tier.minInvestment,
      tier
    })).reverse(); // Show from lowest to highest
  }

  /**
   * Calculate optimal investment to reach next VIP tier
   */
  getNextTierRecommendation(currentUSD: number): {
    nextTier: VIPTier | null;
    additionalNeeded: number;
    additionalBonus: number;
  } {
    const currentTier = this.getVIPTier(currentUSD);
    const currentTierIndex = currentTier
      ? VIP_TIERS.findIndex(t => t.name === currentTier.name)
      : VIP_TIERS.length;

    if (currentTierIndex === 0) {
      // Already at highest tier
      return {
        nextTier: null,
        additionalNeeded: 0,
        additionalBonus: 0
      };
    }

    const nextTier = VIP_TIERS[currentTierIndex - 1];
    const additionalNeeded = nextTier.minInvestment - currentUSD;
    const currentBonus = currentTier?.bonusPercentage || BASE_BONUS_PERCENTAGE;
    const additionalBonus = nextTier.bonusPercentage - currentBonus;

    return {
      nextTier,
      additionalNeeded: Math.max(0, additionalNeeded),
      additionalBonus
    };
  }

  /**
   * Get current price data
   */
  async getPriceData(): Promise<PriceData> {
    const bnbPrice = await this.fetchBNBPrice();
    return {
      bnbPriceUSD: bnbPrice,
      hypeaiPriceUSD: HYPEAI_PRESALE_PRICE,
      lastUpdated: Date.now()
    };
  }

  /**
   * Save price data to localStorage
   */
  private saveToStorage(data: PriceData): void {
    try {
      localStorage.setItem(BNB_PRICE_CACHE_KEY, JSON.stringify(data));
    } catch (error) {
      console.warn('Failed to save price to localStorage:', error);
    }
  }

  /**
   * Load price data from localStorage
   */
  private loadFromStorage(): PriceData | null {
    try {
      const cached = localStorage.getItem(BNB_PRICE_CACHE_KEY);
      return cached ? JSON.parse(cached) : null;
    } catch (error) {
      console.warn('Failed to load price from localStorage:', error);
      return null;
    }
  }
}

// Export singleton instance
export const priceCalculator = new PriceCalculator();

// Export utility functions
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
};

export const formatTokens = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }).format(amount);
};

export const formatPercentage = (value: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'percent',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    signDisplay: 'always'
  }).format(value / 100);
};
