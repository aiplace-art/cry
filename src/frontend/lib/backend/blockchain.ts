/**
 * Blockchain Utilities for HypeAI Backend
 * Production-ready Web3 integration with BSC Testnet
 */

import { ethers, Contract, Provider, JsonRpcProvider, formatUnits, parseUnits } from 'ethers';
import { APIError } from '../../types/api';

// ============================================================================
// Constants
// ============================================================================

export const CONTRACTS = {
  HYPEAI_TOKEN: '0x02B23B891b3A3717673291aD34EB67893A19D978',
  PRIVATE_SALE: '0x01708a6b5818fD3c98f4a947349E3D58DD8B39D3', // Updated vesting contract
  MOCK_USDT: '0x284D311f0E4562a3a870720D97aa12c445922137',
  CHAINLINK_BNB_USD: '0x2514895c72f50D8bd4B4F9b1110F0D6bD2c97526',
} as const;

export const BSC_TESTNET_RPC = 'https://data-seed-prebsc-1-s1.binance.org:8545/';
export const BSC_TESTNET_CHAIN_ID = 97;

// ============================================================================
// ABIs (Minimal for required functions)
// ============================================================================

const PRIVATE_SALE_ABI = [
  'function buyWithUSDT(uint256 usdtAmount) external',
  'function buyWithBNB() external payable',
  'function totalUSDTRaised() external view returns (uint256)',
  'function totalBNBRaised() external view returns (uint256)',
  'function tokenPrice() external view returns (uint256)',
  'function calculateBonus(uint256 amount) external view returns (uint256)',
  'function vestingDuration() external view returns (uint256)',
  'function purchases(address buyer) external view returns (uint256 totalTokens, uint256 claimed)',
  'event Purchase(address indexed buyer, uint256 amount, uint256 tokens, uint256 bonus)',
];

const CHAINLINK_ABI = [
  'function latestRoundData() external view returns (uint80 roundId, int256 answer, uint256 startedAt, uint256 updatedAt, uint80 answeredInRound)',
];

const ERC20_ABI = [
  'function balanceOf(address account) external view returns (uint256)',
  'function decimals() external view returns (uint8)',
];

// ============================================================================
// Provider Singleton with Rate Limiting
// ============================================================================

let provider: JsonRpcProvider | null = null;

// SECURITY: Rate limiting for RPC calls to prevent abuse
interface RPCRateLimit {
  lastCall: number;
  callCount: number;
}

const rpcRateLimit: Map<string, RPCRateLimit> = new Map();
const RPC_CALLS_PER_SECOND = 10;
const RPC_RESET_INTERVAL_MS = 1000;

/**
 * Check and enforce RPC rate limit
 */
function checkRPCRateLimit(operation: string): void {
  const now = Date.now();
  const limit = rpcRateLimit.get(operation) || { lastCall: 0, callCount: 0 };

  // Reset counter if interval passed
  if (now - limit.lastCall > RPC_RESET_INTERVAL_MS) {
    limit.callCount = 0;
    limit.lastCall = now;
  }

  // Check limit
  if (limit.callCount >= RPC_CALLS_PER_SECOND) {
    throw new APIError(
      429,
      'Too many blockchain requests. Please slow down.',
      'RPC_RATE_LIMIT_EXCEEDED'
    );
  }

  limit.callCount++;
  rpcRateLimit.set(operation, limit);
}

export function getProvider(): JsonRpcProvider {
  checkRPCRateLimit('getProvider');

  if (!provider) {
    provider = new ethers.JsonRpcProvider(BSC_TESTNET_RPC, {
      chainId: BSC_TESTNET_CHAIN_ID,
      name: 'bsc-testnet',
    });
  }
  return provider;
}

// ============================================================================
// Contract Instances
// ============================================================================

export function getPrivateSaleContract(): Contract {
  return new ethers.Contract(
    CONTRACTS.PRIVATE_SALE,
    PRIVATE_SALE_ABI,
    getProvider()
  );
}

export function getChainlinkContract(): Contract {
  return new ethers.Contract(
    CONTRACTS.CHAINLINK_BNB_USD,
    CHAINLINK_ABI,
    getProvider()
  );
}

// ============================================================================
// Signature Verification
// ============================================================================

/**
 * Verify a Web3 signature
 */
export async function verifySignature(
  address: string,
  message: string,
  signature: string
): Promise<boolean> {
  try {
    const recoveredAddress = ethers.verifyMessage(message, signature);
    return recoveredAddress.toLowerCase() === address.toLowerCase();
  } catch (error) {
    // SECURITY: Don't expose signature verification details
    if (process.env.NODE_ENV === 'development') {
      console.error('Signature verification failed:', error);
    }
    return false;
  }
}

/**
 * Generate authentication message
 */
export function generateAuthMessage(address: string, timestamp: number): string {
  return `Sign this message to authenticate with HypeAI Dashboard\n\nAddress: ${address}\nTimestamp: ${timestamp}\n\nThis request will not trigger a blockchain transaction or cost any gas fees.`;
}

// ============================================================================
// Price Fetching
// ============================================================================

/**
 * Get current BNB price in USD from Chainlink oracle
 */
export async function getBNBPriceUSD(): Promise<number> {
  try {
    const chainlink = getChainlinkContract();
    const roundData = await chainlink.latestRoundData();
    const price = Number(formatUnits(roundData.answer, 8)); // Chainlink uses 8 decimals

    if (price <= 0) {
      throw new Error('Invalid price from oracle');
    }

    return price;
  } catch (error) {
    // SECURITY: Log error without exposing details
    if (process.env.NODE_ENV === 'development') {
      console.error('Failed to fetch BNB price:', error);
    }
    // Fallback price if oracle fails
    return 600; // Approximate BNB price
  }
}

/**
 * Get token price from contract
 */
export async function getTokenPrice(): Promise<number> {
  try {
    const contract = getPrivateSaleContract();
    const price = await contract.tokenPrice();
    return Number(formatUnits(price, 18));
  } catch (error) {
    // SECURITY: Log error without exposing details
    if (process.env.NODE_ENV === 'development') {
      console.error('Failed to fetch token price:', error);
    }
    return 0.025; // Default price
  }
}

// ============================================================================
// Presale Stats
// ============================================================================

/**
 * Get total raised amounts
 */
export async function getTotalRaised(): Promise<{
  usdtRaised: number;
  bnbRaised: number;
  totalUSD: number;
}> {
  try {
    const contract = getPrivateSaleContract();

    const [usdtRaised, bnbRaised, bnbPrice] = await Promise.all([
      contract.totalUSDTRaised(),
      contract.totalBNBRaised(),
      getBNBPriceUSD(),
    ]);

    const usdtAmount = Number(formatUnits(usdtRaised, 18));
    const bnbAmount = Number(formatUnits(bnbRaised, 18));
    const totalUSD = usdtAmount + (bnbAmount * bnbPrice);

    return {
      usdtRaised: usdtAmount,
      bnbRaised: bnbAmount,
      totalUSD,
    };
  } catch (error) {
    // SECURITY: Log error without exposing details
    if (process.env.NODE_ENV === 'development') {
      console.error('Failed to fetch total raised:', error);
    }
    // Return fallback values if contract calls fail
    return {
      usdtRaised: 0,
      bnbRaised: 0,
      totalUSD: 0,
    };
  }
}

/**
 * Get unique participants count from Purchase events
 */
export async function getParticipantsCount(): Promise<number> {
  try {
    const contract = getPrivateSaleContract();
    const filter = contract.filters.Purchase();

    // Get events from contract deployment
    const events = await contract.queryFilter(filter, 0, 'latest');

    // Get unique buyers (with proper type checking)
    const uniqueBuyers = new Set(
      events
        .map(event => {
          // EventLog has args, Log does not
          if ('args' in event && event.args && event.args.buyer) {
            return event.args.buyer.toLowerCase();
          }
          return null;
        })
        .filter((addr): addr is string => addr !== null)
    );

    return uniqueBuyers.size;
  } catch (error) {
    // SECURITY: Log error without exposing details
    if (process.env.NODE_ENV === 'development') {
      console.error('Failed to fetch participants count:', error);
    }
    // Return 0 if events can't be fetched
    return 0;
  }
}

// ============================================================================
// Bonus Calculation
// ============================================================================

/**
 * Calculate bonus percentage based on investment amount
 */
export function calculateBonusPercentage(amountUSD: number): number {
  if (amountUSD >= 50000) return 30;
  if (amountUSD >= 25000) return 27;
  if (amountUSD >= 10000) return 25;
  if (amountUSD >= 5000) return 23;
  if (amountUSD >= 1000) return 20;
  return 0;
}

/**
 * Calculate tokens with bonus
 */
export function calculateTokensWithBonus(
  amountUSD: number,
  tokenPrice: number
): {
  baseTokens: number;
  bonusPercentage: number;
  bonusTokens: number;
  totalTokens: number;
} {
  const baseTokens = amountUSD / tokenPrice;
  const bonusPercentage = calculateBonusPercentage(amountUSD);
  const bonusTokens = (baseTokens * bonusPercentage) / 100;
  const totalTokens = baseTokens + bonusTokens;

  return {
    baseTokens,
    bonusPercentage,
    bonusTokens,
    totalTokens,
  };
}

// ============================================================================
// Vesting Calculations
// ============================================================================

// New vesting parameters (matching smart contract)
const IMMEDIATE_UNLOCK_PERCENTAGE = 0.20; // 20%
const CLIFF_DURATION_DAYS = 90; // 3 months
const VESTING_DURATION_DAYS = 540; // 18 months
const TOTAL_DURATION_DAYS = 630; // 21 months total

const SECONDS_PER_DAY = 24 * 60 * 60;
const CLIFF_DURATION_SECONDS = CLIFF_DURATION_DAYS * SECONDS_PER_DAY;
const VESTING_DURATION_SECONDS = VESTING_DURATION_DAYS * SECONDS_PER_DAY;

/**
 * Calculate vested tokens based on time elapsed with cliff
 * Matches smart contract logic:
 * - 20% immediate unlock
 * - 90 days cliff (no vesting during this period)
 * - 80% linear vesting over 540 days after cliff
 */
export function calculateVestedTokens(
  totalTokens: number,
  purchaseTimestamp: number,
  currentTimestamp: number = Date.now()
): number {
  const elapsed = (currentTimestamp - purchaseTimestamp) / 1000; // Convert to seconds

  const immediateTokens = totalTokens * IMMEDIATE_UNLOCK_PERCENTAGE;
  const vestedTokens = totalTokens * (1 - IMMEDIATE_UNLOCK_PERCENTAGE);

  // Day 0 (purchase time) should return immediate tokens (20%)
  if (elapsed < 0) return 0;

  // During cliff period - only immediate unlock
  if (elapsed < CLIFF_DURATION_SECONDS) {
    return immediateTokens;
  }

  // After cliff - calculate linear vesting
  const vestingElapsed = elapsed - CLIFF_DURATION_SECONDS;

  if (vestingElapsed >= VESTING_DURATION_SECONDS) {
    // Full vesting complete
    return totalTokens;
  }

  // Linear vesting calculation
  const unlockedFromVesting = (vestedTokens * vestingElapsed) / VESTING_DURATION_SECONDS;
  return immediateTokens + unlockedFromVesting;
}

// ============================================================================
// Transaction Monitoring
// ============================================================================

/**
 * Wait for transaction confirmation
 */
export async function waitForTransaction(
  txHash: string,
  confirmations: number = 1
): Promise<ethers.TransactionReceipt> {
  try {
    const provider = getProvider();
    const receipt = await provider.waitForTransaction(txHash, confirmations);

    if (!receipt) {
      throw new Error('Transaction receipt not found');
    }

    if (receipt.status === 0) {
      throw new Error('Transaction failed');
    }

    return receipt;
  } catch (error) {
    // SECURITY: Log error without exposing details
    if (process.env.NODE_ENV === 'development') {
      console.error('Transaction monitoring failed:', error);
    }
    throw new APIError(500, 'Failed to confirm transaction');
  }
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Validate Ethereum address
 */
export function isValidAddress(address: string): boolean {
  return ethers.isAddress(address);
}

/**
 * Normalize address to checksum format
 */
export function normalizeAddress(address: string): string {
  return ethers.getAddress(address);
}

/**
 * Parse units with error handling
 */
export function safeParseUnits(value: string | number, decimals: number): bigint {
  try {
    return parseUnits(value.toString(), decimals);
  } catch (error) {
    throw new APIError(400, 'Invalid amount format');
  }
}
