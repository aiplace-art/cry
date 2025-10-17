/**
 * Token Growth Economics Data
 * All data and projections for the Inevitable Growth campaign
 */

import {
  TokenGrowthData,
  PriceProjection,
  BurnMechanism,
  GrowthReason,
  SupplyReduction,
  InvestmentScenario
} from '../types/tokenGrowth';

export const STARTING_SUPPLY = 1_000_000_000; // 1 billion HYPE
export const CURRENT_PRICE = 0.001; // $0.001
export const BURN_RATE = 0.5; // 50% burn per transaction
export const DAILY_ANALYSES_CONSERVATIVE = 10_000;

// Conservative price projections (99.9% probability)
const conservativeProjections: PriceProjection[] = [
  {
    month: 0,
    timeline: 'Today',
    price: 0.001,
    multiplier: 1,
    probabilityLabel: 'Current',
    supplyBurned: 0,
    supplyBurnedPercentage: 0,
  },
  {
    month: 1,
    timeline: 'Month 1',
    price: 0.005,
    multiplier: 5,
    probabilityLabel: '99.9% Guaranteed',
    supplyBurned: 150_000_000,
    supplyBurnedPercentage: 15,
  },
  {
    month: 3,
    timeline: 'Month 3',
    price: 0.020,
    multiplier: 20,
    probabilityLabel: '99% Guaranteed',
    supplyBurned: 450_000_000,
    supplyBurnedPercentage: 45,
  },
  {
    month: 6,
    timeline: 'Month 6',
    price: 0.100,
    multiplier: 100,
    probabilityLabel: '95% Guaranteed',
    supplyBurned: 900_000_000,
    supplyBurnedPercentage: 90,
  },
  {
    month: 12,
    timeline: 'Month 12',
    price: 1.000,
    multiplier: 1000,
    probabilityLabel: '85% Inevitable',
    supplyBurned: 990_000_000,
    supplyBurnedPercentage: 99,
  },
];

// Moderate price projections (85% probability)
const moderateProjections: PriceProjection[] = [
  {
    month: 0,
    timeline: 'Today',
    price: 0.001,
    multiplier: 1,
    probabilityLabel: 'Current',
    supplyBurned: 0,
    supplyBurnedPercentage: 0,
  },
  {
    month: 1,
    timeline: 'Month 1',
    price: 0.010,
    multiplier: 10,
    probabilityLabel: '90% Likely',
    supplyBurned: 150_000_000,
    supplyBurnedPercentage: 15,
  },
  {
    month: 3,
    timeline: 'Month 3',
    price: 0.050,
    multiplier: 50,
    probabilityLabel: '85% Likely',
    supplyBurned: 450_000_000,
    supplyBurnedPercentage: 45,
  },
  {
    month: 6,
    timeline: 'Month 6',
    price: 0.250,
    multiplier: 250,
    probabilityLabel: '80% Likely',
    supplyBurned: 900_000_000,
    supplyBurnedPercentage: 90,
  },
  {
    month: 12,
    timeline: 'Month 12',
    price: 2.500,
    multiplier: 2500,
    probabilityLabel: '70% Likely',
    supplyBurned: 990_000_000,
    supplyBurnedPercentage: 99,
  },
];

// Optimistic price projections (50% probability)
const optimisticProjections: PriceProjection[] = [
  {
    month: 0,
    timeline: 'Today',
    price: 0.001,
    multiplier: 1,
    probabilityLabel: 'Current',
    supplyBurned: 0,
    supplyBurnedPercentage: 0,
  },
  {
    month: 1,
    timeline: 'Month 1',
    price: 0.025,
    multiplier: 25,
    probabilityLabel: '60% Possible',
    supplyBurned: 200_000_000,
    supplyBurnedPercentage: 20,
  },
  {
    month: 3,
    timeline: 'Month 3',
    price: 0.150,
    multiplier: 150,
    probabilityLabel: '55% Possible',
    supplyBurned: 600_000_000,
    supplyBurnedPercentage: 60,
  },
  {
    month: 6,
    timeline: 'Month 6',
    price: 1.000,
    multiplier: 1000,
    probabilityLabel: '50% Possible',
    supplyBurned: 950_000_000,
    supplyBurnedPercentage: 95,
  },
  {
    month: 12,
    timeline: 'Month 12',
    price: 10.000,
    multiplier: 10000,
    probabilityLabel: '40% Possible',
    supplyBurned: 995_000_000,
    supplyBurnedPercentage: 99.5,
  },
];

// Burn mechanisms
export const burnMechanisms: BurnMechanism[] = [
  {
    activity: 'Every AI Analysis',
    burnRate: 50,
    icon: '🤖',
  },
  {
    activity: 'Every B2B Service',
    burnRate: 50,
    icon: '🏢',
  },
  {
    activity: 'Every Transaction',
    burnRate: 50,
    icon: '💱',
  },
];

// 5 Reasons Growth is Inevitable
export const growthReasons: GrowthReason[] = [
  {
    id: 1,
    title: 'Burn Rate > Emission Rate',
    description: '50% burns, 0% new tokens = Supply only goes down',
    icon: '🔥',
  },
  {
    id: 2,
    title: 'Real Utility Demand',
    description: 'People MUST buy HYPE to use AI services',
    icon: '⚡',
  },
  {
    id: 3,
    title: 'B2B Corporate Demand',
    description: 'Companies buy $10K-100K in HYPE tokens',
    icon: '🏢',
  },
  {
    id: 4,
    title: 'Staking Lockup (62% APY)',
    description: '300M-500M HYPE locked = Less circulating supply',
    icon: '🔒',
  },
  {
    id: 5,
    title: 'Network Effects',
    description: 'More users → More burns → Higher price → More users',
    icon: '♾️',
  },
];

// Supply reduction timeline
export const supplyReduction: SupplyReduction[] = [
  {
    month: 0,
    label: 'Day 1',
    totalSupply: 1_000_000_000,
    burned: 0,
    percentage: 0,
  },
  {
    month: 1,
    label: 'Month 1',
    totalSupply: 850_000_000,
    burned: 150_000_000,
    percentage: 15,
  },
  {
    month: 3,
    label: 'Month 3',
    totalSupply: 550_000_000,
    burned: 450_000_000,
    percentage: 45,
  },
  {
    month: 6,
    label: 'Month 6',
    totalSupply: 100_000_000,
    burned: 900_000_000,
    percentage: 90,
  },
  {
    month: 12,
    label: 'Month 12',
    totalSupply: 10_000_000,
    burned: 990_000_000,
    percentage: 99,
  },
];

// Investment scenarios
export const investmentScenarios: InvestmentScenario[] = [
  {
    name: 'conservative',
    label: 'Conservative',
    multiplier: 3.5,
    timeframe: '12 months',
    probability: '99% Guaranteed',
    color: '#10b981', // green
  },
  {
    name: 'moderate',
    label: 'Moderate',
    multiplier: 100,
    timeframe: '6-12 months',
    probability: '85% Likely',
    color: '#fbbf24', // gold
  },
  {
    name: 'optimistic',
    label: 'Optimistic',
    multiplier: 1000,
    timeframe: '12 months',
    probability: '50% Possible',
    color: '#06b6d4', // cyan
  },
];

// Complete data export
export const tokenGrowthData: TokenGrowthData = {
  startingSupply: STARTING_SUPPLY,
  currentPrice: CURRENT_PRICE,
  projections: {
    conservative: conservativeProjections,
    moderate: moderateProjections,
    optimistic: optimisticProjections,
  },
  burnMechanisms,
  growthReasons,
  supplyReduction,
  scenarios: investmentScenarios,
};
