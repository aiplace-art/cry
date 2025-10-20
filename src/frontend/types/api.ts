/**
 * API Types for HypeAI Backend
 * Production-ready type definitions for all API endpoints
 */

import { z } from 'zod';

// ============================================================================
// Authentication Types
// ============================================================================

export const Web3AuthRequestSchema = z.object({
  address: z.string().regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid Ethereum address'),
  signature: z.string().regex(/^0x[a-fA-F0-9]+$/, 'Invalid signature'),
  message: z.string().min(1),
  timestamp: z.number().optional(),
});

export type Web3AuthRequest = z.infer<typeof Web3AuthRequestSchema>;

export interface Web3AuthResponse {
  success: boolean;
  token?: string;
  address?: string;
  error?: string;
  expiresIn?: number;
}

export interface JWTPayload {
  address: string;
  timestamp: number;
  iat?: number;
  exp?: number;
}

// ============================================================================
// Private Sale Types
// ============================================================================

export const PurchaseRequestSchema = z.object({
  amount: z.number().positive('Amount must be positive'),
  paymentMethod: z.enum(['USDT', 'BNB']),
  referralCode: z.string().optional(),
  email: z.string().email().optional(),
});

export type PurchaseRequest = z.infer<typeof PurchaseRequestSchema>;

export interface PurchaseResponse {
  success: boolean;
  txHash?: string;
  tokensReceived?: number;
  bonusTokens?: number;
  totalTokens?: number;
  bonusPercentage?: number;
  error?: string;
  estimatedGas?: string;
}

export interface Purchase {
  id: string;
  address: string;
  date: string;
  timestamp: number;
  amount: number;
  paymentMethod: 'USDT' | 'BNB';
  tokenAmount: number;
  bonusTokens: number;
  totalTokens: number;
  bonusPercentage: number;
  vestedTokens: number;
  claimedTokens: number;
  txHash: string;
  referralCode?: string;
  email?: string;
}

export interface PurchaseHistoryResponse {
  success: boolean;
  purchases?: Purchase[];
  totalInvested?: number;
  totalTokens?: number;
  error?: string;
}

export interface BonusTier {
  min: number;
  bonus: number;
}

export interface PresaleStats {
  totalRaised: number;
  totalUSDTRaised: number;
  totalBNBRaised: number;
  bnbPriceUSD: number;
  goal: number;
  progress: number;
  participantsCount: number;
  tokenPrice: number;
  bonusTiers: BonusTier[];
  vestingMonths: number;
  startTime: number;
  endTime?: number;
  isActive: boolean;
}

export interface PresaleStatsResponse {
  success: boolean;
  stats?: PresaleStats;
  error?: string;
}

// ============================================================================
// Database Schema
// ============================================================================

export interface DBPurchase {
  id: string;
  address: string;
  timestamp: number;
  amount: number;
  payment_method: 'USDT' | 'BNB';
  token_amount: number;
  bonus_tokens: number;
  total_tokens: number;
  bonus_percentage: number;
  tx_hash: string;
  referral_code?: string;
  email?: string;
  claimed_tokens: number;
  created_at: number;
}

export interface DBSession {
  token: string;
  address: string;
  created_at: number;
  expires_at: number;
  last_used: number;
}

export interface DBSignatureNonce {
  address: string;
  message: string;
  signature: string;
  timestamp: number;
  used: boolean;
}

// ============================================================================
// Error Types
// ============================================================================

export class APIError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public code?: string
  ) {
    super(message);
    this.name = 'APIError';
  }
}

export interface ErrorResponse {
  success: false;
  error: string;
  code?: string;
  details?: any;
}

// ============================================================================
// Rate Limiting
// ============================================================================

export interface RateLimitConfig {
  points: number; // Number of requests
  duration: number; // Time window in seconds
  blockDuration?: number; // Block duration in seconds after exceeding
}

export const RateLimits = {
  auth: { points: 5, duration: 60, blockDuration: 300 }, // 5 per minute
  purchase: { points: 3, duration: 60, blockDuration: 600 }, // 3 per minute
  query: { points: 30, duration: 60 }, // 30 per minute
  stats: { points: 60, duration: 60 }, // 60 per minute
} as const;
