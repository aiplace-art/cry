// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title Staking
 * @dev Staking contract with reward distribution
 */
contract Staking is Ownable, Pausable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    IERC20 public stakingToken;
    uint256 public rewardRate;
    uint256 public totalStaked;

    mapping(address => uint256) private _balances;
    mapping(address => uint256) private _rewardDebt;
    mapping(address => uint256) private _lastStakeTime;

    uint256 private _accRewardPerShare;
    uint256 private _lastRewardTime;

    event Staked(address indexed user, uint256 amount);
    event Withdrawn(address indexed user, uint256 amount);
    event RewardPaid(address indexed user, uint256 reward);

    constructor(address _stakingToken, uint256 _rewardRate) Ownable(msg.sender) {
        require(_stakingToken != address(0), "Invalid token address");
        stakingToken = IERC20(_stakingToken);
        rewardRate = _rewardRate;
        _lastRewardTime = block.timestamp;
    }

    /**
     * @dev Stake tokens
     * @param amount Amount of tokens to stake
     */
    function stake(uint256 amount) external nonReentrant whenNotPaused {
        require(amount > 0, "Cannot stake 0 tokens");

        _updateRewards();

        // Claim any pending rewards first
        if (_balances[msg.sender] > 0) {
            uint256 pending = earned(msg.sender);
            if (pending > 0) {
                _rewardDebt[msg.sender] = (_balances[msg.sender] * _accRewardPerShare) / 1e18;
                stakingToken.safeTransfer(msg.sender, pending);
                emit RewardPaid(msg.sender, pending);
            }
        }

        stakingToken.safeTransferFrom(msg.sender, address(this), amount);

        _balances[msg.sender] += amount;
        totalStaked += amount;
        _lastStakeTime[msg.sender] = block.timestamp;
        _rewardDebt[msg.sender] = (_balances[msg.sender] * _accRewardPerShare) / 1e18;

        emit Staked(msg.sender, amount);
    }

    /**
     * @dev Withdraw staked tokens
     * @param amount Amount of tokens to withdraw
     */
    function withdraw(uint256 amount) external nonReentrant {
        require(amount > 0, "Cannot withdraw 0 tokens");
        require(_balances[msg.sender] >= amount, "Insufficient staked balance");

        _updateRewards();

        // Claim pending rewards
        uint256 pending = earned(msg.sender);
        if (pending > 0) {
            stakingToken.safeTransfer(msg.sender, pending);
            emit RewardPaid(msg.sender, pending);
        }

        _balances[msg.sender] -= amount;
        totalStaked -= amount;
        _rewardDebt[msg.sender] = (_balances[msg.sender] * _accRewardPerShare) / 1e18;

        stakingToken.safeTransfer(msg.sender, amount);

        emit Withdrawn(msg.sender, amount);
    }

    /**
     * @dev Claim accumulated rewards
     */
    function claimRewards() external nonReentrant {
        _updateRewards();

        uint256 pending = earned(msg.sender);
        require(pending > 0, "No rewards to claim");

        _rewardDebt[msg.sender] = (_balances[msg.sender] * _accRewardPerShare) / 1e18;
        stakingToken.safeTransfer(msg.sender, pending);

        emit RewardPaid(msg.sender, pending);
    }

    /**
     * @dev Get user's staked balance
     * @param account User address
     * @return User's staked balance
     */
    function balanceOf(address account) external view returns (uint256) {
        return _balances[account];
    }

    /**
     * @dev Calculate earned rewards for a user
     * @param account User address
     * @return Pending rewards
     */
    function earned(address account) public view returns (uint256) {
        if (_balances[account] == 0) {
            return 0;
        }

        uint256 accRewardPerShare = _accRewardPerShare;

        if (totalStaked > 0 && block.timestamp > _lastRewardTime) {
            uint256 timeElapsed = block.timestamp - _lastRewardTime;
            uint256 reward = timeElapsed * rewardRate;
            accRewardPerShare += (reward * 1e18) / totalStaked;
        }

        return (_balances[account] * accRewardPerShare) / 1e18 - _rewardDebt[account];
    }

    /**
     * @dev Update reward variables
     */
    function _updateRewards() private {
        if (block.timestamp <= _lastRewardTime) {
            return;
        }

        if (totalStaked == 0) {
            _lastRewardTime = block.timestamp;
            return;
        }

        uint256 timeElapsed = block.timestamp - _lastRewardTime;
        uint256 reward = timeElapsed * rewardRate;

        _accRewardPerShare += (reward * 1e18) / totalStaked;
        _lastRewardTime = block.timestamp;
    }

    /**
     * @dev Pause staking (only owner)
     */
    function pause() external onlyOwner {
        _pause();
    }

    /**
     * @dev Unpause staking (only owner)
     */
    function unpause() external onlyOwner {
        _unpause();
    }

    /**
     * @dev Emergency withdraw all tokens (only owner)
     */
    function emergencyWithdraw() external onlyOwner {
        uint256 balance = stakingToken.balanceOf(address(this));
        stakingToken.safeTransfer(owner(), balance);
    }

    /**
     * @dev Update reward rate (only owner)
     * @param newRate New reward rate
     */
    function updateRewardRate(uint256 newRate) external onlyOwner {
        _updateRewards();
        rewardRate = newRate;
    }
}
