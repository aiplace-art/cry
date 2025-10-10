export interface TokenInfo {
  name: string;
  symbol: string;
  decimals: number;
  totalSupply: string;
  balance: string;
  allowance: string;
}

export interface StakingTier {
  lockPeriod: number;
  apy: number;
  totalStaked: string;
  active: boolean;
}

export interface StakeInfo {
  amount: string;
  tier: number;
  startTime: number;
  lastClaim: number;
  rewards: string;
  stakeId: number;
}

export interface Proposal {
  id: number;
  proposer: string;
  description: string;
  forVotes: string;
  againstVotes: string;
  abstainVotes: string;
  startTime: number;
  endTime: number;
  executed: boolean;
  status: ProposalStatus;
}

export enum ProposalStatus {
  Pending = 0,
  Active = 1,
  Succeeded = 2,
  Defeated = 3,
  Executed = 4,
  Cancelled = 5,
}

export enum VoteType {
  Against = 0,
  For = 1,
  Abstain = 2,
}

export interface Trade {
  type: 'buy' | 'sell';
  amount: string;
  price: string;
  timestamp: number;
  txHash: string;
  status: 'pending' | 'confirmed' | 'failed';
}

export interface PriceData {
  timestamp: number;
  price: number;
  volume: number;
}
