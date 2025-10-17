/**
 * Token Growth Economics Types
 * Defines interfaces for the Inevitable Growth campaign
 */

export interface PriceProjection {
  month: number;
  timeline: string;
  price: number;
  multiplier: number;
  probabilityLabel: string;
  supplyBurned: number;
  supplyBurnedPercentage: number;
}

export interface BurnMechanism {
  activity: string;
  burnRate: number;
  icon: string;
}

export interface GrowthReason {
  id: number;
  title: string;
  description: string;
  icon: string;
}

export interface InvestmentScenario {
  name: 'conservative' | 'moderate' | 'optimistic';
  label: string;
  multiplier: number;
  timeframe: string;
  probability: string;
  color: string;
}

export interface CalculatorInputs {
  investmentAmount: number;
  currentPrice: number;
}

export interface CalculatorResults {
  tokensReceived: number;
  conservative: number;
  moderate: number;
  optimistic: number;
}

export interface SupplyReduction {
  month: number;
  label: string;
  totalSupply: number;
  burned: number;
  percentage: number;
}

export interface TokenGrowthData {
  startingSupply: number;
  currentPrice: number;
  projections: {
    conservative: PriceProjection[];
    moderate: PriceProjection[];
    optimistic: PriceProjection[];
  };
  burnMechanisms: BurnMechanism[];
  growthReasons: GrowthReason[];
  supplyReduction: SupplyReduction[];
  scenarios: InvestmentScenario[];
}
