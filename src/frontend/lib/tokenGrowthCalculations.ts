/**
 * Token Growth Economics Calculations
 * All mathematical functions for the Inevitable Growth campaign
 */

import {
  CalculatorInputs,
  CalculatorResults,
  InvestmentScenario
} from '../types/tokenGrowth';
import {
  CURRENT_PRICE,
  investmentScenarios
} from '../constants/tokenGrowthData';

/**
 * Calculate tokens received for investment amount
 */
export function calculateTokensReceived(
  investmentAmount: number,
  tokenPrice: number = CURRENT_PRICE
): number {
  if (investmentAmount <= 0 || tokenPrice <= 0) return 0;
  return investmentAmount / tokenPrice;
}

/**
 * Calculate future value based on multiplier
 */
export function calculateFutureValue(
  investmentAmount: number,
  multiplier: number
): number {
  if (investmentAmount <= 0 || multiplier <= 0) return 0;
  return investmentAmount * multiplier;
}

/**
 * Calculate all investment scenarios
 */
export function calculateAllScenarios(
  inputs: CalculatorInputs
): CalculatorResults {
  const { investmentAmount, currentPrice } = inputs;

  const tokensReceived = calculateTokensReceived(investmentAmount, currentPrice);

  const scenarios = investmentScenarios.reduce((acc, scenario) => {
    acc[scenario.name] = calculateFutureValue(investmentAmount, scenario.multiplier);
    return acc;
  }, {} as Record<string, number>);

  return {
    tokensReceived,
    conservative: scenarios.conservative || 0,
    moderate: scenarios.moderate || 0,
    optimistic: scenarios.optimistic || 0,
  };
}

/**
 * Calculate burn rate per day
 */
export function calculateDailyBurnRate(
  analysesPerDay: number,
  tokensPerAnalysis: number = 1000,
  burnPercentage: number = 0.5
): number {
  return analysesPerDay * tokensPerAnalysis * burnPercentage;
}

/**
 * Calculate monthly burn
 */
export function calculateMonthlyBurn(dailyBurn: number): number {
  return dailyBurn * 30;
}

/**
 * Calculate supply after burn
 */
export function calculateRemainingSupply(
  currentSupply: number,
  burnedAmount: number
): number {
  return Math.max(0, currentSupply - burnedAmount);
}

/**
 * Calculate percentage of supply burned
 */
export function calculateBurnPercentage(
  burnedAmount: number,
  totalSupply: number
): number {
  if (totalSupply === 0) return 0;
  return (burnedAmount / totalSupply) * 100;
}

/**
 * Calculate price based on supply/demand
 */
export function calculatePrice(
  demand: number,
  supply: number,
  basePrice: number = CURRENT_PRICE
): number {
  if (supply === 0) return Infinity;
  const supplyRatio = 1 / (supply / 1_000_000_000); // Normalize to starting supply
  const demandMultiplier = demand / 10_000; // Normalize to baseline demand
  return basePrice * supplyRatio * demandMultiplier;
}

/**
 * Format currency with appropriate precision
 */
export function formatCurrency(amount: number): string {
  if (amount >= 1_000_000) {
    return `$${(amount / 1_000_000).toFixed(2)}M`;
  }
  if (amount >= 1_000) {
    return `$${(amount / 1_000).toFixed(2)}K`;
  }
  if (amount >= 1) {
    return `$${amount.toFixed(2)}`;
  }
  return `$${amount.toFixed(4)}`;
}

/**
 * Format token amount with commas
 */
export function formatTokenAmount(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format percentage
 */
export function formatPercentage(value: number): string {
  return `${value.toFixed(1)}%`;
}

/**
 * Format multiplier (e.g., "5x", "100x")
 */
export function formatMultiplier(multiplier: number): string {
  if (multiplier >= 1000) {
    return `${(multiplier / 1000).toFixed(1)}Kx`;
  }
  return `${multiplier}x`;
}

/**
 * Calculate ROI percentage
 */
export function calculateROI(
  initialInvestment: number,
  finalValue: number
): number {
  if (initialInvestment === 0) return 0;
  return ((finalValue - initialInvestment) / initialInvestment) * 100;
}

/**
 * Validate investment amount
 */
export function validateInvestmentAmount(amount: number): {
  isValid: boolean;
  error?: string;
} {
  const MIN_INVESTMENT = 100;
  const MAX_INVESTMENT = 100_000;

  if (amount < MIN_INVESTMENT) {
    return {
      isValid: false,
      error: `Minimum investment is ${formatCurrency(MIN_INVESTMENT)}`,
    };
  }

  if (amount > MAX_INVESTMENT) {
    return {
      isValid: false,
      error: `Maximum investment is ${formatCurrency(MAX_INVESTMENT)}`,
    };
  }

  return { isValid: true };
}

/**
 * Calculate projected supply at specific month
 */
export function calculateSupplyAtMonth(
  month: number,
  startingSupply: number = 1_000_000_000,
  monthlyBurnRate: number = 0.15 // 15% per month
): number {
  return startingSupply * Math.pow(1 - monthlyBurnRate, month);
}

/**
 * Estimate time until supply exhaustion
 */
export function estimateSupplyExhaustionMonths(
  startingSupply: number,
  monthlyBurnRate: number,
  minimumSupply: number = 1_000_000
): number {
  let supply = startingSupply;
  let months = 0;

  while (supply > minimumSupply && months < 120) { // Max 10 years
    supply = supply * (1 - monthlyBurnRate);
    months++;
  }

  return months;
}
