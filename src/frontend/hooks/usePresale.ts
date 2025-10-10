/**
 * usePresale Hook
 * Main hook for interacting with the HypeAI Private Sale contract
 */

import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import {
  getSignedContracts,
  formatters,
  ERROR_MESSAGES,
  TransactionStatus,
  calculateExpectedTokens,
  GAS_LIMITS,
} from '../lib/contracts';
import { useWallet } from './useWallet';

export interface SaleStats {
  totalUSDRaised: number;
  totalTokensSold: string;
  foundingMembersCount: number;
  remainingTokens: string;
  remainingUSDCap: number;
  timeRemaining: number;
  isActive: boolean;
  progressPercentage: number;
}

export interface UserEligibility {
  eligible: boolean;
  remainingAllocation: number;
  tokensWouldReceive: string;
  isWhitelisted: boolean;
  contribution: number;
  tokensPurchased: string;
  isFoundingMember: boolean;
}

export interface TransactionState {
  status: TransactionStatus;
  hash?: string;
  error?: string;
}

export const usePresale = () => {
  const wallet = useWallet();

  const [saleStats, setSaleStats] = useState<SaleStats | null>(null);
  const [userEligibility, setUserEligibility] = useState<UserEligibility | null>(null);
  const [transactionState, setTransactionState] = useState<TransactionState>({
    status: TransactionStatus.IDLE,
  });
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Fetch sale statistics from blockchain
   */
  const getSaleStats = useCallback(async () => {
    if (!wallet.provider) {
      return;
    }

    try {
      const { presale } = await getSignedContracts(wallet.provider);

      const [
        totalUSDRaised,
        totalTokensSold,
        foundingMembersCount,
        remainingTokens,
        remainingUSDCap,
        timeRemaining,
        isActive,
      ] = await presale.getSaleStats();

      const stats: SaleStats = {
        totalUSDRaised: Number(totalUSDRaised),
        totalTokensSold: formatters.formatToken(totalTokensSold),
        foundingMembersCount: Number(foundingMembersCount),
        remainingTokens: formatters.formatToken(remainingTokens),
        remainingUSDCap: Number(remainingUSDCap),
        timeRemaining: Number(timeRemaining),
        isActive,
        progressPercentage: (Number(totalUSDRaised) / 80000) * 100,
      };

      setSaleStats(stats);
      return stats;
    } catch (err) {
      console.error('Error fetching sale stats:', err);
      throw err;
    }
  }, [wallet.provider]);

  /**
   * Check user eligibility
   */
  const checkEligibility = useCallback(async (address: string) => {
    if (!wallet.provider) {
      throw new Error(ERROR_MESSAGES.WALLET_NOT_CONNECTED);
    }

    try {
      const { presale } = await getSignedContracts(wallet.provider);

      // Get eligibility info
      const [eligible, remainingAllocation, tokensWouldReceive] = await presale.checkEligibility(address);

      // Get additional user info
      const [isWhitelisted, contribution, tokensPurchased, isFoundingMember] = await Promise.all([
        presale.whitelist(address),
        presale.contributions(address),
        presale.tokensPurchased(address),
        presale.isFoundingMember(address),
      ]);

      const eligibility: UserEligibility = {
        eligible,
        remainingAllocation: Number(remainingAllocation),
        tokensWouldReceive: formatters.formatToken(tokensWouldReceive),
        isWhitelisted,
        contribution: Number(contribution),
        tokensPurchased: formatters.formatToken(tokensPurchased),
        isFoundingMember,
      };

      setUserEligibility(eligibility);
      return eligibility;
    } catch (err) {
      console.error('Error checking eligibility:', err);
      throw err;
    }
  }, [wallet.provider]);

  /**
   * Get user contribution info
   */
  const getUserContribution = useCallback(async (address: string) => {
    if (!wallet.provider) {
      throw new Error(ERROR_MESSAGES.WALLET_NOT_CONNECTED);
    }

    try {
      const { presale } = await getSignedContracts(wallet.provider);

      const [contribution, tokensPurchased, isFoundingMember] = await Promise.all([
        presale.contributions(address),
        presale.tokensPurchased(address),
        presale.isFoundingMember(address),
      ]);

      return {
        contribution: Number(contribution),
        tokensPurchased: formatters.formatToken(tokensPurchased),
        isFoundingMember,
      };
    } catch (err) {
      console.error('Error getting user contribution:', err);
      throw err;
    }
  }, [wallet.provider]);

  /**
   * Purchase with BNB
   */
  const purchaseWithBNB = useCallback(async (usdAmount: number) => {
    if (!wallet.address || !wallet.provider) {
      throw new Error(ERROR_MESSAGES.WALLET_NOT_CONNECTED);
    }

    if (!wallet.isCorrectNetwork) {
      throw new Error(ERROR_MESSAGES.WRONG_NETWORK);
    }

    setIsLoading(true);
    setTransactionState({ status: TransactionStatus.PENDING });

    try {
      const { presale } = await getSignedContracts(wallet.provider);

      // Calculate BNB amount (1 BNB = $600 as per contract)
      const bnbAmount = usdAmount / 600;
      const bnbAmountWei = formatters.parseToken(bnbAmount.toFixed(6));

      // Validate balance
      const bnbBalance = formatters.parseToken(wallet.bnbBalance);
      if (bnbBalance < bnbAmountWei) {
        throw new Error(ERROR_MESSAGES.INSUFFICIENT_BALANCE);
      }

      // Estimate gas
      let gasLimit: bigint;
      try {
        gasLimit = await presale.purchaseWithBNB.estimateGas({ value: bnbAmountWei });
        gasLimit = (gasLimit * 120n) / 100n; // Add 20% buffer
      } catch (err) {
        gasLimit = GAS_LIMITS.PURCHASE_BNB;
      }

      // Send transaction
      const tx = await presale.purchaseWithBNB({
        value: bnbAmountWei,
        gasLimit,
      });

      setTransactionState({
        status: TransactionStatus.PENDING,
        hash: tx.hash,
      });

      // Wait for confirmation
      const receipt = await tx.wait();

      if (receipt.status === 1) {
        setTransactionState({
          status: TransactionStatus.SUCCESS,
          hash: tx.hash,
        });

        // Refresh data
        await Promise.all([
          getSaleStats(),
          checkEligibility(wallet.address),
          wallet.refreshBalances(),
        ]);

        return { success: true, hash: tx.hash };
      } else {
        throw new Error(ERROR_MESSAGES.TRANSACTION_FAILED);
      }
    } catch (err: any) {
      console.error('Error purchasing with BNB:', err);

      let errorMessage = ERROR_MESSAGES.TRANSACTION_FAILED;

      if (err.code === 4001) {
        errorMessage = ERROR_MESSAGES.TRANSACTION_REJECTED;
      } else if (err.message) {
        // Extract revert reason
        if (err.message.includes('Not whitelisted')) {
          errorMessage = ERROR_MESSAGES.NOT_WHITELISTED;
        } else if (err.message.includes('Sale not started')) {
          errorMessage = ERROR_MESSAGES.SALE_NOT_STARTED;
        } else if (err.message.includes('Sale ended')) {
          errorMessage = ERROR_MESSAGES.SALE_ENDED;
        } else if (err.message.includes('Below minimum')) {
          errorMessage = ERROR_MESSAGES.BELOW_MINIMUM;
        } else if (err.message.includes('Exceeds maximum')) {
          errorMessage = ERROR_MESSAGES.ABOVE_MAXIMUM;
        } else if (err.message.includes('Max members reached')) {
          errorMessage = ERROR_MESSAGES.MAX_MEMBERS_REACHED;
        } else if (err.message.includes('Exceeds hard cap')) {
          errorMessage = ERROR_MESSAGES.HARD_CAP_REACHED;
        } else {
          errorMessage = err.message;
        }
      }

      setTransactionState({
        status: TransactionStatus.ERROR,
        error: errorMessage,
      });

      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [wallet, getSaleStats, checkEligibility]);

  /**
   * Purchase with USDT
   */
  const purchaseWithUSDT = useCallback(async (usdAmount: number) => {
    if (!wallet.address || !wallet.provider) {
      throw new Error(ERROR_MESSAGES.WALLET_NOT_CONNECTED);
    }

    if (!wallet.isCorrectNetwork) {
      throw new Error(ERROR_MESSAGES.WRONG_NETWORK);
    }

    setIsLoading(true);

    try {
      const { presale, usdtToken } = await getSignedContracts(wallet.provider);

      const usdtAmountWei = formatters.parseToken(usdAmount.toString());

      // Check USDT balance
      const usdtBalance = formatters.parseToken(wallet.usdtBalance);
      if (usdtBalance < usdtAmountWei) {
        throw new Error(ERROR_MESSAGES.INSUFFICIENT_BALANCE);
      }

      // Check allowance
      const allowance = await usdtToken.allowance(wallet.address, await presale.getAddress());

      if (allowance < usdtAmountWei) {
        // Need to approve first
        setTransactionState({ status: TransactionStatus.APPROVING });

        const approveTx = await usdtToken.approve(await presale.getAddress(), usdtAmountWei, {
          gasLimit: GAS_LIMITS.APPROVE,
        });

        await approveTx.wait();
      }

      // Now purchase
      setTransactionState({ status: TransactionStatus.PENDING });

      // Estimate gas
      let gasLimit: bigint;
      try {
        gasLimit = await presale.purchaseWithUSDT.estimateGas(usdtAmountWei);
        gasLimit = (gasLimit * 120n) / 100n; // Add 20% buffer
      } catch (err) {
        gasLimit = GAS_LIMITS.PURCHASE_USDT;
      }

      const tx = await presale.purchaseWithUSDT(usdtAmountWei, {
        gasLimit,
      });

      setTransactionState({
        status: TransactionStatus.PENDING,
        hash: tx.hash,
      });

      // Wait for confirmation
      const receipt = await tx.wait();

      if (receipt.status === 1) {
        setTransactionState({
          status: TransactionStatus.SUCCESS,
          hash: tx.hash,
        });

        // Refresh data
        await Promise.all([
          getSaleStats(),
          checkEligibility(wallet.address),
          wallet.refreshBalances(),
        ]);

        return { success: true, hash: tx.hash };
      } else {
        throw new Error(ERROR_MESSAGES.TRANSACTION_FAILED);
      }
    } catch (err: any) {
      console.error('Error purchasing with USDT:', err);

      let errorMessage = ERROR_MESSAGES.TRANSACTION_FAILED;

      if (err.code === 4001) {
        errorMessage = ERROR_MESSAGES.TRANSACTION_REJECTED;
      } else if (err.message) {
        // Extract revert reason
        if (err.message.includes('Not whitelisted')) {
          errorMessage = ERROR_MESSAGES.NOT_WHITELISTED;
        } else if (err.message.includes('Sale not started')) {
          errorMessage = ERROR_MESSAGES.SALE_NOT_STARTED;
        } else if (err.message.includes('Sale ended')) {
          errorMessage = ERROR_MESSAGES.SALE_ENDED;
        } else if (err.message.includes('Below minimum')) {
          errorMessage = ERROR_MESSAGES.BELOW_MINIMUM;
        } else if (err.message.includes('Exceeds maximum')) {
          errorMessage = ERROR_MESSAGES.ABOVE_MAXIMUM;
        } else if (err.message.includes('Max members reached')) {
          errorMessage = ERROR_MESSAGES.MAX_MEMBERS_REACHED;
        } else if (err.message.includes('Exceeds hard cap')) {
          errorMessage = ERROR_MESSAGES.HARD_CAP_REACHED;
        } else {
          errorMessage = err.message;
        }
      }

      setTransactionState({
        status: TransactionStatus.ERROR,
        error: errorMessage,
      });

      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [wallet, getSaleStats, checkEligibility]);

  /**
   * Reset transaction state
   */
  const resetTransactionState = useCallback(() => {
    setTransactionState({ status: TransactionStatus.IDLE });
  }, []);

  /**
   * Auto-fetch sale stats on mount and when wallet connects
   */
  useEffect(() => {
    if (wallet.provider && wallet.isCorrectNetwork) {
      getSaleStats();
    }
  }, [wallet.provider, wallet.isCorrectNetwork, getSaleStats]);

  /**
   * Auto-check eligibility when address changes
   */
  useEffect(() => {
    if (wallet.address && wallet.provider && wallet.isCorrectNetwork) {
      checkEligibility(wallet.address);
    }
  }, [wallet.address, wallet.provider, wallet.isCorrectNetwork, checkEligibility]);

  /**
   * Setup real-time updates (listen to events)
   */
  useEffect(() => {
    if (!wallet.provider || !wallet.isCorrectNetwork) {
      return;
    }

    let presaleContract: ethers.Contract;

    const setupListeners = async () => {
      try {
        const { presale } = await getSignedContracts(wallet.provider!);
        presaleContract = presale;

        // Listen to TokensPurchased events
        presale.on('TokensPurchased', async () => {
          await getSaleStats();
          if (wallet.address) {
            await checkEligibility(wallet.address);
          }
        });

        // Listen to WhitelistUpdated events
        presale.on('WhitelistUpdated', async (user: string) => {
          if (wallet.address && user.toLowerCase() === wallet.address.toLowerCase()) {
            await checkEligibility(wallet.address);
          }
        });
      } catch (err) {
        console.error('Error setting up event listeners:', err);
      }
    };

    setupListeners();

    // Cleanup
    return () => {
      if (presaleContract) {
        presaleContract.removeAllListeners();
      }
    };
  }, [wallet.provider, wallet.address, wallet.isCorrectNetwork, getSaleStats, checkEligibility]);

  return {
    saleStats,
    userEligibility,
    transactionState,
    isLoading,
    getSaleStats,
    checkEligibility,
    getUserContribution,
    purchaseWithBNB,
    purchaseWithUSDT,
    resetTransactionState,
    calculateExpectedTokens,
  };
};

export default usePresale;
