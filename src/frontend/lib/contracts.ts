/**
 * Contract Integration for HypeAI Private Sale
 * Provides contract instances and ABIs for Web3 interactions
 */

import { ethers } from 'ethers';

// BSC Mainnet Configuration
export const BSC_CONFIG = {
  chainId: '0x38', // 56 in hex
  chainIdDecimal: 56,
  chainName: 'BNB Smart Chain Mainnet',
  nativeCurrency: {
    name: 'BNB',
    symbol: 'BNB',
    decimals: 18,
  },
  rpcUrls: ['https://bsc-dataseed1.binance.org'],
  blockExplorerUrls: ['https://bscscan.com'],
};

// BSC Testnet Configuration (for testing)
export const BSC_TESTNET_CONFIG = {
  chainId: '0x61', // 97 in hex
  chainIdDecimal: 97,
  chainName: 'BNB Smart Chain Testnet',
  nativeCurrency: {
    name: 'tBNB',
    symbol: 'tBNB',
    decimals: 18,
  },
  rpcUrls: ['https://data-seed-prebsc-1-s1.binance.org:8545'],
  blockExplorerUrls: ['https://testnet.bscscan.com'],
};

// Contract Addresses (replace with actual deployed addresses)
export const CONTRACTS = {
  PRESALE: process.env.NEXT_PUBLIC_PRESALE_CONTRACT || '',
  HYPEAI_TOKEN: process.env.NEXT_PUBLIC_HYPEAI_TOKEN || '',
  USDT_TOKEN: process.env.NEXT_PUBLIC_USDT_TOKEN || '0x55d398326f99059fF775485246999027B3197955', // BSC USDT
};

// Validate contract addresses
export const validateContractAddresses = (): boolean => {
  if (!CONTRACTS.PRESALE || !CONTRACTS.HYPEAI_TOKEN) {
    console.error('Contract addresses not configured. Please set environment variables.');
    return false;
  }
  return true;
};

// Private Sale Contract ABI
export const PRESALE_ABI = [
  // View Functions
  'function whitelist(address) view returns (bool)',
  'function contributions(address) view returns (uint256)',
  'function tokensPurchased(address) view returns (uint256)',
  'function isFoundingMember(address) view returns (bool)',
  'function totalUSDRaised() view returns (uint256)',
  'function totalTokensSold() view returns (uint256)',
  'function foundingMembersCount() view returns (uint256)',
  'function saleStartTime() view returns (uint256)',
  'function saleEndTime() view returns (uint256)',
  'function saleFinalized() view returns (bool)',
  'function MIN_PURCHASE_USD() view returns (uint256)',
  'function MAX_PURCHASE_USD() view returns (uint256)',
  'function HARD_CAP_USD() view returns (uint256)',
  'function MAX_FOUNDING_MEMBERS() view returns (uint256)',
  'function TOKENS_FOR_SALE() view returns (uint256)',

  // Main Functions
  'function getSaleStats() view returns (uint256 totalUSDRaised, uint256 totalTokensSold, uint256 foundingMembersCount, uint256 remainingTokens, uint256 remainingUSDCap, uint256 timeRemaining, bool isActive)',
  'function checkEligibility(address) view returns (bool eligible, uint256 remainingAllocation, uint256 tokensWouldReceive)',
  'function purchaseWithBNB() payable',
  'function purchaseWithUSDT(uint256 usdtAmount)',

  // Events
  'event TokensPurchased(address indexed buyer, uint256 usdAmount, uint256 tokensAmount, uint256 bonusTokens, bool paymentMethod)',
  'event WhitelistUpdated(address indexed user, bool status)',
] as const;

// ERC20 ABI (for USDT and HypeAI token)
export const ERC20_ABI = [
  'function balanceOf(address) view returns (uint256)',
  'function allowance(address owner, address spender) view returns (uint256)',
  'function approve(address spender, uint256 amount) returns (bool)',
  'function decimals() view returns (uint8)',
  'function symbol() view returns (string)',
  'function name() view returns (string)',
  'event Approval(address indexed owner, address indexed spender, uint256 value)',
] as const;

/**
 * Get contract instances
 */
export const getContracts = (provider: ethers.BrowserProvider) => {
  if (!validateContractAddresses()) {
    throw new Error('Contract addresses not configured');
  }

  return {
    presale: new ethers.Contract(CONTRACTS.PRESALE, PRESALE_ABI, provider),
    hypeaiToken: new ethers.Contract(CONTRACTS.HYPEAI_TOKEN, ERC20_ABI, provider),
    usdtToken: new ethers.Contract(CONTRACTS.USDT_TOKEN, ERC20_ABI, provider),
  };
};

/**
 * Get contract instances with signer (for transactions)
 */
export const getSignedContracts = async (provider: ethers.BrowserProvider) => {
  if (!validateContractAddresses()) {
    throw new Error('Contract addresses not configured');
  }

  const signer = await provider.getSigner();

  return {
    presale: new ethers.Contract(CONTRACTS.PRESALE, PRESALE_ABI, signer),
    hypeaiToken: new ethers.Contract(CONTRACTS.HYPEAI_TOKEN, ERC20_ABI, signer),
    usdtToken: new ethers.Contract(CONTRACTS.USDT_TOKEN, ERC20_ABI, signer),
  };
};

/**
 * Format utilities
 */
export const formatters = {
  // Format BNB/USDT amounts
  formatToken: (amount: bigint, decimals = 18): string => {
    return ethers.formatUnits(amount, decimals);
  },

  // Parse BNB/USDT amounts
  parseToken: (amount: string, decimals = 18): bigint => {
    return ethers.parseUnits(amount, decimals);
  },

  // Format USD values
  formatUSD: (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  },

  // Format token amounts with commas
  formatTokenAmount: (amount: string | number): string => {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(num);
  },

  // Format address
  formatAddress: (address: string): string => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  },
};

/**
 * Error messages
 */
export const ERROR_MESSAGES = {
  WALLET_NOT_CONNECTED: 'Please connect your wallet',
  WRONG_NETWORK: 'Please switch to BNB Smart Chain',
  NOT_WHITELISTED: 'Your address is not whitelisted for this sale',
  SALE_NOT_STARTED: 'Sale has not started yet',
  SALE_ENDED: 'Sale has ended',
  BELOW_MINIMUM: 'Purchase amount below minimum ($40)',
  ABOVE_MAXIMUM: 'Purchase amount exceeds maximum ($800)',
  INSUFFICIENT_BALANCE: 'Insufficient balance',
  INSUFFICIENT_ALLOWANCE: 'Please approve USDT spending first',
  TRANSACTION_REJECTED: 'Transaction rejected by user',
  TRANSACTION_FAILED: 'Transaction failed',
  MAX_MEMBERS_REACHED: 'Maximum number of founding members reached',
  HARD_CAP_REACHED: 'Hard cap reached',
  CONTRACT_NOT_CONFIGURED: 'Contract addresses not configured',
};

/**
 * Transaction status types
 */
export enum TransactionStatus {
  IDLE = 'idle',
  APPROVING = 'approving',
  PENDING = 'pending',
  SUCCESS = 'success',
  ERROR = 'error',
}

/**
 * Network validation
 */
export const isCorrectNetwork = (chainId: number): boolean => {
  return chainId === BSC_CONFIG.chainIdDecimal;
};

/**
 * Calculate BNB amount from USD (assuming BNB price)
 */
export const calculateBNBFromUSD = (usdAmount: number, bnbPrice = 600): string => {
  const bnbAmount = usdAmount / bnbPrice;
  return bnbAmount.toFixed(6);
};

/**
 * Calculate expected tokens (including 10% bonus)
 */
export const calculateExpectedTokens = (usdAmount: number): string => {
  const baseTokens = usdAmount * 1250; // 1 HYPEAI = $0.0008
  const bonusTokens = baseTokens * 0.1; // 10% bonus
  const totalTokens = baseTokens + bonusTokens;
  return formatters.formatTokenAmount(totalTokens);
};

/**
 * Gas estimation helpers
 */
export const GAS_LIMITS = {
  APPROVE: 100000n,
  PURCHASE_BNB: 250000n,
  PURCHASE_USDT: 300000n,
};

export default {
  BSC_CONFIG,
  BSC_TESTNET_CONFIG,
  CONTRACTS,
  PRESALE_ABI,
  ERC20_ABI,
  getContracts,
  getSignedContracts,
  formatters,
  ERROR_MESSAGES,
  TransactionStatus,
  isCorrectNetwork,
  calculateBNBFromUSD,
  calculateExpectedTokens,
  GAS_LIMITS,
};
