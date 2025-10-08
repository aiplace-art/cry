import { useMemo } from 'react';
import { ethers } from 'ethers';
import { useWeb3 } from '@/contexts/Web3Context';

export const ERC20_ABI = [
  'function name() view returns (string)',
  'function symbol() view returns (string)',
  'function decimals() view returns (uint8)',
  'function totalSupply() view returns (uint256)',
  'function balanceOf(address) view returns (uint256)',
  'function transfer(address to, uint256 amount) returns (bool)',
  'function approve(address spender, uint256 amount) returns (bool)',
  'function allowance(address owner, address spender) view returns (uint256)',
  'event Transfer(address indexed from, address indexed to, uint256 value)',
  'event Approval(address indexed owner, address indexed spender, uint256 value)',
];

export const STAKING_ABI = [
  'function stake(uint256 amount, uint256 lockPeriod) external',
  'function unstake(uint256 amount) external',
  'function claimRewards() external',
  'function getStakedAmount(address user) view returns (uint256)',
  'function getRewards(address user) view returns (uint256)',
  'function totalStaked() view returns (uint256)',
  'function apy() view returns (uint256)',
  'event Staked(address indexed user, uint256 amount, uint256 lockPeriod)',
  'event Unstaked(address indexed user, uint256 amount)',
  'event RewardsClaimed(address indexed user, uint256 amount)',
];

export const GOVERNANCE_ABI = [
  'function propose(string memory description, address[] memory targets, uint256[] memory values, bytes[] memory calldatas) returns (uint256)',
  'function vote(uint256 proposalId, bool support) external',
  'function execute(uint256 proposalId) external',
  'function getProposal(uint256 proposalId) view returns (tuple(uint256 id, address proposer, string description, uint256 votesFor, uint256 votesAgainst, uint256 startTime, uint256 endTime, bool executed, uint8 status))',
  'function getVotingPower(address user) view returns (uint256)',
  'event ProposalCreated(uint256 indexed proposalId, address indexed proposer, string description)',
  'event VoteCast(uint256 indexed proposalId, address indexed voter, bool support, uint256 votes)',
  'event ProposalExecuted(uint256 indexed proposalId)',
];

export function useContract(address: string, abi: any[]) {
  const { provider, signer, isConnected } = useWeb3();

  return useMemo(() => {
    if (!isConnected || !address) return null;

    try {
      if (signer) {
        return new ethers.Contract(address, abi, signer);
      } else if (provider) {
        return new ethers.Contract(address, abi, provider);
      }
      return null;
    } catch (error) {
      console.error('Error creating contract instance:', error);
      return null;
    }
  }, [address, abi, provider, signer, isConnected]);
}

export function useTokenContract(address: string) {
  return useContract(address, ERC20_ABI);
}

export function useStakingContract(address: string) {
  return useContract(address, STAKING_ABI);
}

export function useGovernanceContract(address: string) {
  return useContract(address, GOVERNANCE_ABI);
}
