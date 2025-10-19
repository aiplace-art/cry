import { useState, useEffect, useCallback } from 'react';
import {
  PrivateSaleConfig,
  Purchase,
  CalculatorResult,
  TransactionResult,
  PaymentMethod
} from '../types/private-sale';
import { PRIVATE_SALE_CONFIG } from '../lib/payment-config';

// Rate limiter for API calls
const rateLimiter = {
  lastRequest: 0,
  minInterval: 1000, // 1 second between requests
  canMakeRequest(): boolean {
    const now = Date.now();
    if (now - this.lastRequest < this.minInterval) {
      return false;
    }
    this.lastRequest = now;
    return true;
  },
  waitTime(): number {
    const now = Date.now();
    const elapsed = now - this.lastRequest;
    return Math.max(0, this.minInterval - elapsed);
  }
};

// Sign request with wallet signature for security
const signRequest = async (data: any, walletAddress: string): Promise<any> => {
  try {
    if (typeof window !== 'undefined' && window.ethereum) {
      const message = JSON.stringify(data);
      const signature = await window.ethereum.request({
        method: 'personal_sign',
        params: [message, walletAddress],
      });
      return { ...data, signature, wallet: walletAddress, timestamp: Date.now() };
    }
    return data;
  } catch (error) {
    console.error('Failed to sign request:', error);
    return data;
  }
};

export const usePrivateSale = () => {
  const [config, setConfig] = useState<PrivateSaleConfig>({
    startDate: PRIVATE_SALE_CONFIG.startDate,
    endDate: PRIVATE_SALE_CONFIG.endDate,
    targetAmount: PRIVATE_SALE_CONFIG.targetAmount,
    currentAmount: 0,
    tokenPrice: PRIVATE_SALE_CONFIG.tokenPrice,
    bonusPercentage: 0,
    minPurchase: PRIVATE_SALE_CONFIG.minPurchase,
    maxPurchase: PRIVATE_SALE_CONFIG.maxPurchase,
  });

  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(false);

  // Calculate tokens based on USD amount
  const calculateTokens = useCallback((usdAmount: number): CalculatorResult => {
    const baseTokens = usdAmount / config.tokenPrice;

    // Find applicable bonus tier
    let bonusPercentage = 0;
    for (const tier of PRIVATE_SALE_CONFIG.bonusTiers) {
      if (usdAmount >= tier.minAmount) {
        bonusPercentage = tier.bonus;
        break;
      }
    }

    const bonusTokens = (baseTokens * bonusPercentage) / 100;
    const totalTokens = baseTokens + bonusTokens;

    return {
      usdAmount,
      baseTokens,
      bonusTokens,
      totalTokens,
      bonusPercentage,
    };
  }, [config.tokenPrice]);

  // Get time remaining
  const getTimeRemaining = useCallback(() => {
    const now = new Date().getTime();
    const end = config.endDate.getTime();
    const distance = end - now;

    if (distance < 0) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };
    }

    return {
      days: Math.floor(distance / (1000 * 60 * 60 * 24)),
      hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
      minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
      seconds: Math.floor((distance % (1000 * 60)) / 1000),
      expired: false,
    };
  }, [config.endDate]);

  // Get progress percentage
  const getProgress = useCallback(() => {
    return (config.currentAmount / config.targetAmount) * 100;
  }, [config.currentAmount, config.targetAmount]);

  // Process purchase
  const processPurchase = async (
    amount: number,
    paymentMethod: PaymentMethod,
    walletAddress: string
  ): Promise<TransactionResult> => {
    setLoading(true);

    try {
      // Check rate limiting
      if (!rateLimiter.canMakeRequest()) {
        const waitTime = rateLimiter.waitTime();
        throw new Error(`Please wait ${Math.ceil(waitTime / 1000)} seconds before making another request`);
      }

      // Validate amount
      if (amount < config.minPurchase) {
        throw new Error(`Minimum purchase is $${config.minPurchase}`);
      }
      if (amount > config.maxPurchase) {
        throw new Error(`Maximum purchase is $${config.maxPurchase}`);
      }

      // Calculate tokens
      const calculation = calculateTokens(amount);

      // Prepare request data
      const requestData = {
        amount,
        paymentMethod: paymentMethod.id,
        walletAddress,
        calculation,
      };

      // Sign request for security
      const signedData = await signRequest(requestData, walletAddress);

      // API call to payment gateway with signature
      const response = await fetch('/api/private-sale/purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(signedData),
      });

      if (!response.ok) {
        throw new Error('Payment processing failed');
      }

      const data = await response.json();

      // Add to purchases
      const newPurchase: Purchase = {
        id: data.purchaseId,
        amount,
        currency: paymentMethod.symbol,
        tokensReceived: calculation.baseTokens,
        bonusTokens: calculation.bonusTokens,
        totalTokens: calculation.totalTokens,
        transactionHash: data.transactionHash,
        status: 'completed',
        timestamp: new Date(),
        walletAddress,
      };

      setPurchases(prev => [newPurchase, ...prev]);

      // Update current amount
      setConfig(prev => ({
        ...prev,
        currentAmount: prev.currentAmount + amount,
      }));

      return {
        success: true,
        transactionHash: data.transactionHash,
        tokensReceived: calculation.totalTokens,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    } finally {
      setLoading(false);
    }
  };

  // Get referral link
  const getReferralLink = useCallback((walletAddress: string) => {
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
    return `${baseUrl}/private-sale?ref=${walletAddress}`;
  }, []);

  // Load user purchases
  const loadPurchases = useCallback(async (walletAddress: string) => {
    try {
      // Check rate limiting
      if (!rateLimiter.canMakeRequest()) {
        console.warn('Rate limit exceeded, skipping purchases load');
        return;
      }

      const response = await fetch(`/api/private-sale/purchases?wallet=${walletAddress}`);
      if (response.ok) {
        const data = await response.json();
        setPurchases(data.purchases);
      }
    } catch (error) {
      console.error('Failed to load purchases:', error);
    }
  }, []);

  // Load current sale stats
  useEffect(() => {
    const loadStats = async () => {
      try {
        // Check rate limiting for stats endpoint
        if (!rateLimiter.canMakeRequest()) {
          return; // Skip this update if rate limited
        }

        const response = await fetch('/api/private-sale/stats');
        if (response.ok) {
          const data = await response.json();
          setConfig(prev => ({
            ...prev,
            currentAmount: data.currentAmount,
          }));
        }
      } catch (error) {
        console.error('Failed to load stats:', error);
      }
    };

    loadStats();
    const interval = setInterval(loadStats, 30000); // Update every 30s

    return () => clearInterval(interval);
  }, []);

  return {
    config,
    purchases,
    loading,
    calculateTokens,
    getTimeRemaining,
    getProgress,
    processPurchase,
    getReferralLink,
    loadPurchases,
  };
};
