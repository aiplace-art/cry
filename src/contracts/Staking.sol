// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

contract Staking is Ownable, ReentrancyGuard, Pausable {
    using SafeERC20 for IERC20;

    IERC20 public stakingToken;

    struct StakingTier {
        uint256 lockPeriod;
        uint256 apy;
        uint256 totalStaked;
        bool active;
    }

    struct StakeInfo {
        uint256 amount;
        uint256 tier;
        uint256 startTime;
        uint256 lastClaim;
        uint256 rewards;
    }

    mapping(uint256 => StakingTier) public stakingTiers;
    mapping(address => mapping(uint256 => StakeInfo)) public stakes;
    mapping(address => uint256) public stakeCount;

    uint256 public totalRewardsDistributed;
    uint256 public totalStaked;

    event Staked(address indexed user, uint256 indexed stakeId, uint256 amount, uint256 tier);
    event Unstaked(address indexed user, uint256 indexed stakeId, uint256 amount, uint256 rewards);
    event RewardsClaimed(address indexed user, uint256 indexed stakeId, uint256 rewards);

    constructor(address _stakingToken) Ownable(msg.sender) {
        require(_stakingToken != address(0), "Invalid token address");
        stakingToken = IERC20(_stakingToken);

        stakingTiers[0] = StakingTier(30 days, 1700, 0, true);
        stakingTiers[1] = StakingTier(90 days, 2700, 0, true);
        stakingTiers[2] = StakingTier(365 days, 6200, 0, true);
    }

    function stake(uint256 _amount, uint256 _tier) external nonReentrant whenNotPaused {
        require(_amount > 0, "Cannot stake 0 tokens");
        require(_tier < 3, "Invalid tier");
        require(stakingTiers[_tier].active, "Tier not active");

        stakingToken.safeTransferFrom(msg.sender, address(this), _amount);

        uint256 stakeId = stakeCount[msg.sender];
        stakes[msg.sender][stakeId] = StakeInfo(_amount, _tier, block.timestamp, block.timestamp, 0);

        stakeCount[msg.sender]++;
        stakingTiers[_tier].totalStaked += _amount;
        totalStaked += _amount;

        emit Staked(msg.sender, stakeId, _amount, _tier);
    }

    function pendingRewards(address _user, uint256 _stakeId) public view returns (uint256) {
        StakeInfo memory userStake = stakes[_user][_stakeId];
        if (userStake.amount == 0) return 0;

        StakingTier memory tier = stakingTiers[userStake.tier];
        uint256 timeStaked = block.timestamp - userStake.lastClaim;
        uint256 rewards = (userStake.amount * tier.apy * timeStaked) / (365 days * 10000);

        return rewards + userStake.rewards;
    }

    function claimRewards(uint256 _stakeId) external nonReentrant {
        require(_stakeId < stakeCount[msg.sender], "Invalid stake ID");

        uint256 rewards = pendingRewards(msg.sender, _stakeId);
        require(rewards > 0, "No rewards to claim");

        stakes[msg.sender][_stakeId].lastClaim = block.timestamp;
        stakes[msg.sender][_stakeId].rewards = 0;

        totalRewardsDistributed += rewards;
        stakingToken.safeTransfer(msg.sender, rewards);

        emit RewardsClaimed(msg.sender, _stakeId, rewards);
    }

    function unstake(uint256 _stakeId) external nonReentrant {
        require(_stakeId < stakeCount[msg.sender], "Invalid stake ID");

        StakeInfo memory userStake = stakes[msg.sender][_stakeId];
        require(userStake.amount > 0, "No tokens staked");

        StakingTier memory tier = stakingTiers[userStake.tier];
        require(block.timestamp >= userStake.startTime + tier.lockPeriod, "Lock period not ended");

        uint256 rewards = pendingRewards(msg.sender, _stakeId);
        uint256 totalAmount = userStake.amount + rewards;

        stakingTiers[userStake.tier].totalStaked -= userStake.amount;
        totalStaked -= userStake.amount;
        totalRewardsDistributed += rewards;

        delete stakes[msg.sender][_stakeId];

        stakingToken.safeTransfer(msg.sender, totalAmount);

        emit Unstaked(msg.sender, _stakeId, userStake.amount, rewards);
    }

    function getTVL() external view returns (uint256) {
        return totalStaked;
    }
}
