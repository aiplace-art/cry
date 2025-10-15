/**
 * usePresaleContract Hook
 * Handles all presale contract interactions including purchases, stats, and eligibility checks
 */

import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import {
  PRESALE_ABI,
  CONTRACTS,
  ERROR_MESSAGES,
  TransactionStatus,
  formatters,
  GAS_LIMITS,
  calculateExpectedTokens
} from '../lib/contracts';

export interface PresaleStats {
  totalUSDRaised: string;
  totalTokensSold: string;
  foundingMembersCount: number;
  remainingTokens: string;
  remainingUSDCap: string;
  timeRemaining: number;
  isActive: boolean;
  hardCapUSD: string;
  maxFoundingMembers: number;
}

export interface UserPresaleInfo {
  isWhitelisted: boolean;
  contribution: string;
  tokensPurchased: string;
  isFoundingMember: boolean;
  remainingAllocation: string;
}

export interface PurchaseParams {
  currency: 'BNB' | 'USDT';
  amount: string;
  onApproving?: () => void;
  onPending?: () => void;
  onSuccess?: (txHash: string) => void;
  onError?: (error: Error) => void;
}

export const usePresaleContract = (provider: ethers.BrowserProvider | null, address: string | null) => {
  const [presaleStats, setPresaleStats] = useState<PresaleStats | null>(null);
  const [userInfo, setUserInfo] = useState<UserPresaleInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [txStatus, setTxStatus] = useState<TransactionStatus>(TransactionStatus.IDLE);
  const [txHash, setTxHash] = useState<string | null>(null);

  /**
   * Get presale contract instance
   */
  const getPresaleContract = useCallback(() => {
    if (!provider) throw new Error(ERROR_MESSAGES.WALLET_NOT_CONNECTED);
    if (!CONTRACTS.PRESALE) throw new Error(ERROR_MESSAGES.CONTRACT_NOT_CONFIGURED);

    return new ethers.Contract(CONTRACTS.PRESALE, PRESALE_ABI, provider);
  }, [provider]);

  /**
   * Get presale contract with signer
   */
  const getSignedPresaleContract = useCallback(async () => {
    if (!provider) throw new Error(ERROR_MESSAGES.WALLET_NOT_CONNECTED);
    if (!CONTRACTS.PRESALE) throw new Error(ERROR_MESSAGES.CONTRACT_NOT_CONFIGURED);

    const signer = await provider.getSigner();
    return new ethers.Contract(CONTRACTS.PRESALE, PRESALE_ABI, signer);
  }, [provider]);

  /**
   * Fetch presale statistics
   */
  const fetchPresaleStats = useCallback(async () => {
    try {
      const contract = getPresaleContract();

      const [stats, hardCapUSD, maxMembers] = await Promise.all([
        contract.getSaleStats(),
        contract.HARD_CAP_USD(),
        contract.MAX_FOUNDING_MEMBERS()
      ]);

      setPresaleStats({
        totalUSDRaised: formatters.formatToken(stats.totalUSDRaised, 18),
        totalTokensSold: formatters.formatToken(stats.totalTokensSold, 18),
        foundingMembersCount: Number(stats.foundingMembersCount),
        remainingTokens: formatters.formatToken(stats.remainingTokens, 18),
        remainingUSDCap: formatters.formatToken(stats.remainingUSDCap, 18),
        timeRemaining: Number(stats.timeRemaining),
        isActive: stats.isActive,
        hardCapUSD: formatters.formatToken(hardCapUSD, 18),
        maxFoundingMembers: Number(maxMembers)
      });
    } catch (err: any) {
      console.error('Error fetching presale stats:', err);
      setError(err.message || 'Failed to fetch presale statistics');
    }
  }, [getPresaleContract]);

  /**
   * Fetch user presale information
   */
  const fetchUserInfo = useCallback(async () => {
    if (!address) return;

    try {
      const contract = getPresaleContract();

      const [isWhitelisted, contribution, tokensPurchased, isFoundingMember, eligibility] = await Promise.all([
        contract.whitelist(address),
        contract.contributions(address),
        contract.tokensPurchased(address),
        contract.isFoundingMember(address),
        contract.checkEligibility(address)
      ]);

      setUserInfo({
        isWhitelisted,
        contribution: formatters.formatToken(contribution, 18),
        tokensPurchased: formatters.formatToken(tokensPurchased, 18),
        isFoundingMember,
        remainingAllocation: formatters.formatToken(eligibility.remainingAllocation, 18)
      });
    } catch (err: any) {
      console.error('Error fetching user info:', err);
    }
  }, [address, getPresaleContract]);

  /**
   * Validate purchase parameters
   */
  const validatePurchase = useCallback((amount: string): { valid: boolean; error?: string } => {
    const amountNum = parseFloat(amount);

    if (isNaN(amountNum) || amountNum <= 0) {
      return { valid: false, error: 'Please enter a valid amount' };
    }

    if (amountNum < 0.001) {
      return { valid: false, error: 'Amount too small' };
    }

    if (!presaleStats?.isActive) {
      return { valid: false, error: ERROR_MESSAGES.SALE_NOT_STARTED };
    }

    return { valid: true };
  }, [presaleStats]);

  /**
   * Purchase tokens with BNB
   */
  const purchaseWithBNB = useCallback(async (params: PurchaseParams) => {
    const { amount, onApproving, onPending, onSuccess, onError } = params;

    setIsLoading(true);
    setError(null);
    setTxHash(null);

    try {
      // Validate purchase
      const validation = validatePurchase(amount);
      if (!validation.valid) {
        throw new Error(validation.error);
      }

      // Get signed contract
      const contract = await getSignedPresaleContract();

      // Update status
      setTxStatus(TransactionStatus.PENDING);
      onPending?.();

      // Convert amount to wei
      const amountWei = formatters.parseToken(amount, 18);

      // Estimate gas
      const gasEstimate = await contract.purchaseWithBNB.estimateGas({ value: amountWei });
      const gasLimit = (gasEstimate * 120n) / 100n; // 20% buffer

      // Execute purchase
      const tx = await contract.purchaseWithBNB({
        value: amountWei,
        gasLimit
      });

      setTxHash(tx.hash);

      // Wait for confirmation
      const receipt = await tx.wait();

      if (receipt.status === 0) {
        throw new Error(ERROR_MESSAGES.TRANSACTION_FAILED);
      }

      setTxStatus(TransactionStatus.SUCCESS);
      onSuccess?.(tx.hash);

      // Refresh data
      await Promise.all([fetchPresaleStats(), fetchUserInfo()]);

    } catch (err: any) {
      console.error('Error purchasing with BNB:', err);

      let errorMessage = ERROR_MESSAGES.TRANSACTION_FAILED;

      if (err.code === 4001) {
        errorMessage = ERROR_MESSAGES.TRANSACTION_REJECTED;
      } else if (err.code === 'INSUFFICIENT_FUNDS') {
        errorMessage = ERROR_MESSAGES.INSUFFICIENT_BALANCE;
      } else if (err.message) {
        errorMessage = err.message;
      }

      setError(errorMessage);
      setTxStatus(TransactionStatus.ERROR);
      onError?.(new Error(errorMessage));
    } finally {
      setIsLoading(false);
    }
  }, [validatePurchase, getSignedPresaleContract, fetchPresaleStats, fetchUserInfo]);

  /**
   * Purchase tokens with USDT
   */
  const purchaseWithUSDT = useCallback(async (params: PurchaseParams) => {
    const { amount, onApproving, onPending, onSuccess, onError } = params;

    setIsLoading(true);
    setError(null);
    setTxHash(null);

    try {
      // Validate purchase
      const validation = validatePurchase(amount);
      if (!validation.valid) {
        throw new Error(validation.error);
      }

      if (!provider) throw new Error(ERROR_MESSAGES.WALLET_NOT_CONNECTED);

      // Get contracts
      const signer = await provider.getSigner();
      const presaleContract = await getSignedPresaleContract();
      const usdtContract = new ethers.Contract(CONTRACTS.USDT_TOKEN, [
        'function approve(address spender, uint256 amount) returns (bool)',
        'function allowance(address owner, address spender) view returns (uint256)'
      ], signer);

      const amountWei = formatters.parseToken(amount, 18);

      // Check allowance
      const currentAllowance = await usdtContract.allowance(address, CONTRACTS.PRESALE);

      if (currentAllowance < amountWei) {
        // Need to approve
        setTxStatus(TransactionStatus.APPROVING);
        onApproving?.();

        const approveTx = await usdtContract.approve(CONTRACTS.PRESALE, amountWei, {
          gasLimit: GAS_LIMITS.APPROVE
        });

        await approveTx.wait();
      }

      // Purchase with USDT
      setTxStatus(TransactionStatus.PENDING);
      onPending?.();

      const gasEstimate = await presaleContract.purchaseWithUSDT.estimateGas(amountWei);
      const gasLimit = (gasEstimate * 120n) / 100n;

      const tx = await presaleContract.purchaseWithUSDT(amountWei, { gasLimit });
      setTxHash(tx.hash);

      const receipt = await tx.wait();

      if (receipt.status === 0) {
        throw new Error(ERROR_MESSAGES.TRANSACTION_FAILED);
      }

      setTxStatus(TransactionStatus.SUCCESS);
      onSuccess?.(tx.hash);

      // Refresh data
      await Promise.all([fetchPresaleStats(), fetchUserInfo()]);

    } catch (err: any) {
      console.error('Error purchasing with USDT:', err);

      let errorMessage = ERROR_MESSAGES.TRANSACTION_FAILED;

      if (err.code === 4001) {
        errorMessage = ERROR_MESSAGES.TRANSACTION_REJECTED;
      } else if (err.code === 'INSUFFICIENT_FUNDS') {
        errorMessage = ERROR_MESSAGES.INSUFFICIENT_BALANCE;
      } else if (err.message) {
        errorMessage = err.message;
      }

      setError(errorMessage);
      setTxStatus(TransactionStatus.ERROR);
      onError?.(new Error(errorMessage));
    } finally {
      setIsLoading(false);
    }
  }, [provider, address, validatePurchase, getSignedPresaleContract, fetchPresaleStats, fetchUserInfo]);

  /**
   * Purchase tokens (auto-detect currency)
   */
  const purchaseTokens = useCallback(async (params: PurchaseParams) => {
    if (params.currency === 'BNB') {
      return purchaseWithBNB(params);
    } else {
      return purchaseWithUSDT(params);
    }
  }, [purchaseWithBNB, purchaseWithUSDT]);

  /**
   * Reset transaction status
   */
  const resetTransaction = useCallback(() => {
    setTxStatus(TransactionStatus.IDLE);
    setTxHash(null);
    setError(null);
  }, []);

  /**
   * Initial data fetch
   */
  useEffect(() => {
    if (!CONTRACTS.PRESALE) return;

    fetchPresaleStats();

    // Auto-refresh stats every 10 seconds
    const interval = setInterval(fetchPresaleStats, 10000);
    return () => clearInterval(interval);
  }, [fetchPresaleStats]);

  /**
   * Fetch user info when address changes
   */
  useEffect(() => {
    if (address && CONTRACTS.PRESALE) {
      fetchUserInfo();
    }
  }, [address, fetchUserInfo]);

  return {
    // Data
    presaleStats,
    userInfo,

    // Status
    isLoading,
    error,
    txStatus,
    txHash,

    // Actions
    purchaseTokens,
    purchaseWithBNB,
    purchaseWithUSDT,
    refreshStats: fetchPresaleStats,
    refreshUserInfo: fetchUserInfo,
    resetTransaction,

    // Utilities
    validatePurchase,
    calculateExpectedTokens
  };
};

export default usePresaleContract;
