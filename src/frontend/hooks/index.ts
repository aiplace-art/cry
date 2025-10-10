/**
 * Central export for all custom hooks
 */

// Existing hooks
export { useCalculator } from './useCalculator';
export { useAnalytics } from './useAnalytics';
export { useRecommendations } from './useRecommendations';
export { useLiveUpdates } from './useLiveUpdates';

// Web3 hooks
export { useWallet } from './useWallet';
export type { WalletState, WalletError } from './useWallet';

export { usePresale } from './usePresale';
export type { SaleStats, UserEligibility, TransactionState } from './usePresale';

// Re-export TransactionStatus enum from lib
export { TransactionStatus } from '../lib/contracts';
