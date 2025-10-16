export const TOKEN_ABI = [
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
  "function totalSupply() view returns (uint256)",
  "function balanceOf(address) view returns (uint256)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function approve(address spender, uint256 amount) returns (bool)",
  "function transfer(address to, uint256 amount) returns (bool)",
  "function transferFrom(address from, address to, uint256 amount) returns (bool)",
  "function stake(uint256 amount, uint256 lockPeriodDays) external",
  "function unstake(uint256 stakeIndex) external",
  "function getUserStakes(address user) view returns (tuple(uint256 amount, uint256 timestamp, uint256 lockPeriod, uint256 rewardRate)[])",
  "function calculateStakingReward(address user, uint256 stakeIndex) view returns (uint256)",
  "event Transfer(address indexed from, address indexed to, uint256 value)",
  "event Approval(address indexed owner, address indexed spender, uint256 value)",
  "event Staked(address indexed user, uint256 amount, uint256 lockPeriod)",
  "event Unstaked(address indexed user, uint256 amount, uint256 reward)"
] as const;

export const STAKING_ABI = [
  "function stakingToken() view returns (address)",
  "function stakingTiers(uint256) view returns (uint256 lockPeriod, uint256 apy, uint256 totalStaked, bool active)",
  "function stakes(address, uint256) view returns (uint256 amount, uint256 tier, uint256 startTime, uint256 lastClaim, uint256 rewards)",
  "function stakeCount(address) view returns (uint256)",
  "function totalStaked() view returns (uint256)",
  "function totalRewardsDistributed() view returns (uint256)",
  "function stake(uint256 amount, uint256 tier) external",
  "function unstake(uint256 stakeId) external",
  "function claimRewards(uint256 stakeId) external",
  "function pendingRewards(address user, uint256 stakeId) view returns (uint256)",
  "function getTVL() view returns (uint256)",
  "event Staked(address indexed user, uint256 indexed stakeId, uint256 amount, uint256 tier)",
  "event Unstaked(address indexed user, uint256 indexed stakeId, uint256 amount, uint256 rewards)",
  "event RewardsClaimed(address indexed user, uint256 indexed stakeId, uint256 rewards)"
] as const;

export const GOVERNANCE_ABI = [
  "function governanceToken() view returns (address)",
  "function proposalThreshold() view returns (uint256)",
  "function votingPeriod() view returns (uint256)",
  "function quorumPercentage() view returns (uint256)",
  "function proposalCount() view returns (uint256)",
  "function createProposal(string description) returns (uint256)",
  "function castVote(uint256 proposalId, uint8 voteType) external",
  "function getProposal(uint256 proposalId) view returns (uint256 id, address proposer, string description, uint256 forVotes, uint256 againstVotes, uint256 abstainVotes, uint256 startTime, uint256 endTime, bool executed, uint8 status)",
  "function getProposalState(uint256 proposalId) view returns (uint8)",
  "function hasVoted(uint256 proposalId, address voter) view returns (bool)",
  "function executeProposal(uint256 proposalId) external",
  "function cancelProposal(uint256 proposalId) external",
  "event ProposalCreated(uint256 indexed proposalId, address indexed proposer, string description)",
  "event VoteCast(address indexed voter, uint256 indexed proposalId, uint8 voteType, uint256 weight)",
  "event ProposalExecuted(uint256 indexed proposalId)",
  "event ProposalCancelled(uint256 indexed proposalId)"
] as const;
