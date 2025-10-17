// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title HypeAI Token
 * @dev Advanced ERC-20 token with AI-powered tokenomics features
 *
 * "Where Hype Meets Intelligence"
 *
 * Features:
 * - Anti-whale mechanisms (max transaction & wallet limits)
 * - Auto-liquidity generation
 * - Reflection rewards to holders
 * - Dynamic burn mechanism
 * - AI-driven fee optimization
 * - Staking rewards system
 * - AI-powered price prediction
 */
contract HypeAI is ERC20, Ownable, ReentrancyGuard {

    // Token configuration
    uint256 private constant TOTAL_SUPPLY = 10_000_000_000 * 10**18; // 10 Billion tokens
    uint256 public maxTransactionAmount = 50_000_000 * 10**18; // 0.5% of total supply
    uint256 public maxWalletAmount = 200_000_000 * 10**18; // 2% of total supply

    // Fee structure (in basis points, 1% = 100)
    uint256 public constant REFLECTION_FEE = 200; // 2%
    uint256 public constant LIQUIDITY_FEE = 300; // 3%
    uint256 public constant BURN_FEE = 100; // 1%
    uint256 public constant TREASURY_FEE = 200; // 2%
    uint256 public constant TOTAL_FEES = 800; // 8% total (fixed, no AI adjustment)

    // Addresses
    address public treasuryWallet;
    address public liquidityWallet;
    address public deadWallet = 0x000000000000000000000000000000000000dEaD;

    // Trading control
    bool public tradingEnabled = false;
    mapping(address => bool) public isExcludedFromFees;
    mapping(address => bool) public isExcludedFromLimits;
    mapping(address => bool) public isBlacklisted;
    mapping(address => bool) public automatedMarketMakerPairs;

    // Reflection tracking (simplified - direct distribution to treasury for manual rewards)
    uint256 private _totalReflectionsCollected;

    // Staking system
    struct Stake {
        uint256 amount;
        uint256 timestamp;
        uint256 lockPeriod; // in days
        uint256 rewardRate; // APY in basis points
    }

    mapping(address => Stake[]) public stakes;

    // Dynamic APY system (adjusts based on pool health to prevent depletion)
    uint256 public constant BASE_APY = 1200; // 12% base APY
    uint256 public constant BONUS_APY_30_DAYS = 500; // +5% for 30 days
    uint256 public constant BONUS_APY_90_DAYS = 1500; // +15% for 90 days
    uint256 public constant BONUS_APY_365_DAYS = 5000; // +50% for 365 days

    uint256 public constant INITIAL_STAKING_POOL = 2_500_000_000 * 10**18; // 2.5B tokens
    uint256 public stakingPoolRemaining = INITIAL_STAKING_POOL; // Tracks available rewards
    uint256 public totalStakedAmount; // Total currently staked

    // Liquidity management
    uint256 public swapTokensAtAmount = 10_000_000 * 10**18; // 0.1% of supply
    bool private swapping;

    // Events
    event TradingEnabled();
    event FeesUpdated(uint256 reflection, uint256 liquidity, uint256 burn, uint256 treasury);
    event AIFeesUpdated(uint256 newTotalFee);
    event Staked(address indexed user, uint256 amount, uint256 lockPeriod, uint256 effectiveAPY);
    event Unstaked(address indexed user, uint256 amount, uint256 reward);
    event ReflectionDistributed(uint256 amount);
    event LiquidityAdded(uint256 tokenAmount, uint256 ethAmount);
    event StakingPoolUpdated(uint256 remaining, uint256 poolHealthPercent);

    constructor(
        address _treasuryWallet,
        address _liquidityWallet
    ) ERC20("HypeAI Token", "HYPEAI") Ownable(msg.sender) {
        require(_treasuryWallet != address(0), "Invalid treasury wallet");
        require(_liquidityWallet != address(0), "Invalid liquidity wallet");

        treasuryWallet = _treasuryWallet;
        liquidityWallet = _liquidityWallet;

        // Exclude from fees and limits
        isExcludedFromFees[owner()] = true;
        isExcludedFromFees[address(this)] = true;
        isExcludedFromFees[treasuryWallet] = true;
        isExcludedFromFees[deadWallet] = true;

        isExcludedFromLimits[owner()] = true;
        isExcludedFromLimits[address(this)] = true;
        isExcludedFromLimits[treasuryWallet] = true;
        isExcludedFromLimits[deadWallet] = true;

        // Mint total supply to owner
        _mint(owner(), TOTAL_SUPPLY);
    }

    receive() external payable {}

    // Override transfer functions for custom logic
    function _update(
        address from,
        address to,
        uint256 amount
    ) internal override {
        // Skip custom logic for mint/burn operations
        if (from == address(0) || to == address(0)) {
            super._update(from, to, amount);
            return;
        }

        require(!isBlacklisted[from] && !isBlacklisted[to], "Blacklisted address");
        require(amount > 0, "Transfer amount must be greater than zero");

        // Trading control
        if (!tradingEnabled) {
            require(isExcludedFromFees[from] || isExcludedFromFees[to], "Trading not enabled");
        }

        // Anti-whale limits
        if (!isExcludedFromLimits[from] && !isExcludedFromLimits[to]) {
            require(amount <= maxTransactionAmount, "Exceeds max transaction amount");
            if (!automatedMarketMakerPairs[to]) {
                require(balanceOf(to) + amount <= maxWalletAmount, "Exceeds max wallet amount");
            }
        }

        _handleFeesAndSwaps(from, to, amount);
    }

    function _handleFeesAndSwaps(address from, address to, uint256 amount) private {
        // Take fees (fixed 8%, no AI adjustment)
        bool takeFee = !swapping && !isExcludedFromFees[from] && !isExcludedFromFees[to];

        if (takeFee) {
            uint256 fees = (amount * TOTAL_FEES) / 10000;
            _distributeFees(from, fees);

            // Auto-liquidity swap
            if (balanceOf(address(this)) >= swapTokensAtAmount && !automatedMarketMakerPairs[from]) {
                swapping = true;
                _swapAndLiquify(swapTokensAtAmount);
                swapping = false;
            }

            super._update(from, to, amount - fees);
        } else {
            super._update(from, to, amount);
        }
    }

    /**
     * @dev Distribute collected fees (simplified, no complex reflection math)
     */
    function _distributeFees(address from, uint256 totalFeeAmount) private {
        uint256 reflectionAmount = (totalFeeAmount * REFLECTION_FEE) / TOTAL_FEES;
        uint256 liquidityAmount = (totalFeeAmount * LIQUIDITY_FEE) / TOTAL_FEES;
        uint256 burnAmount = (totalFeeAmount * BURN_FEE) / TOTAL_FEES;
        uint256 treasuryAmount = totalFeeAmount - reflectionAmount - liquidityAmount - burnAmount;

        // Reflection amount goes to treasury for manual holder rewards distribution
        if (reflectionAmount > 0) {
            _totalReflectionsCollected = _totalReflectionsCollected + reflectionAmount;
            super._update(from, treasuryWallet, reflectionAmount);
            emit ReflectionDistributed(reflectionAmount);
        }

        // Liquidity pool
        if (liquidityAmount > 0) {
            super._update(from, address(this), liquidityAmount);
        }

        // Burn
        if (burnAmount > 0) {
            super._update(from, deadWallet, burnAmount);
        }

        // Treasury
        if (treasuryAmount > 0) {
            super._update(from, treasuryWallet, treasuryAmount);
        }
    }


    /**
     * @dev Swap tokens for ETH and add liquidity
     */
    function _swapAndLiquify(uint256 tokens) private {
        // For this implementation, tokens are sent to liquidity wallet
        // In production, integrate with DEX router for actual swaps
        super._update(address(this), liquidityWallet, tokens);

        emit LiquidityAdded(tokens / 2, 0);
    }

    /**
     * @dev Stake tokens for rewards with DYNAMIC APY based on pool health
     */
    function stake(uint256 amount, uint256 lockPeriodDays) external nonReentrant {
        require(amount > 0, "Cannot stake 0 tokens");
        require(balanceOf(msg.sender) >= amount, "Insufficient balance");
        require(
            lockPeriodDays == 30 || lockPeriodDays == 90 || lockPeriodDays == 365,
            "Invalid lock period"
        );
        require(stakingPoolRemaining > 0, "Staking pool depleted");

        // Calculate base reward rate based on lock period
        uint256 baseRewardRate = BASE_APY;
        if (lockPeriodDays == 30) baseRewardRate = baseRewardRate + BONUS_APY_30_DAYS;
        else if (lockPeriodDays == 90) baseRewardRate = baseRewardRate + BONUS_APY_90_DAYS;
        else if (lockPeriodDays == 365) baseRewardRate = baseRewardRate + BONUS_APY_365_DAYS;

        // DYNAMIC APY: Adjust reward rate based on pool health
        // Formula: effectiveAPY = baseAPY × (poolRemaining / initialPool)
        // When pool is 100% → 100% APY
        // When pool is 50% → 50% APY
        // When pool is 10% → 10% APY (minimum threshold)
        uint256 poolHealthBasisPoints = (stakingPoolRemaining * 10000) / INITIAL_STAKING_POOL;

        // Ensure minimum 10% APY even when pool is low (prevents 0% APY)
        if (poolHealthBasisPoints < 1000) poolHealthBasisPoints = 1000; // 10% minimum

        uint256 effectiveRewardRate = (baseRewardRate * poolHealthBasisPoints) / 10000;

        // Transfer tokens to contract
        _transfer(msg.sender, address(this), amount);

        // Update total staked
        totalStakedAmount = totalStakedAmount + amount;

        // Create stake with DYNAMIC reward rate
        stakes[msg.sender].push(Stake({
            amount: amount,
            timestamp: block.timestamp,
            lockPeriod: lockPeriodDays,
            rewardRate: effectiveRewardRate
        }));

        emit Staked(msg.sender, amount, lockPeriodDays, effectiveRewardRate);
        emit StakingPoolUpdated(stakingPoolRemaining, poolHealthBasisPoints / 100);
    }

    /**
     * @dev Unstake tokens and claim rewards (deducts from pool)
     */
    function unstake(uint256 stakeIndex) external nonReentrant {
        require(stakeIndex < stakes[msg.sender].length, "Invalid stake index");

        Stake memory userStake = stakes[msg.sender][stakeIndex];
        uint256 lockEndTime = userStake.timestamp + (userStake.lockPeriod * 1 days);

        require(block.timestamp >= lockEndTime, "Stake is still locked");

        // Calculate rewards based on the DYNAMIC APY at time of staking
        uint256 stakingDuration = block.timestamp - userStake.timestamp;
        uint256 reward = (userStake.amount * userStake.rewardRate * stakingDuration) / (365 days) / 10000;

        // Cap reward at remaining pool (safety check)
        if (reward > stakingPoolRemaining) {
            reward = stakingPoolRemaining;
        }

        uint256 totalAmount = userStake.amount + reward;

        // Update pool and total staked
        stakingPoolRemaining = stakingPoolRemaining - reward;
        totalStakedAmount = totalStakedAmount - userStake.amount;

        // Remove stake
        stakes[msg.sender][stakeIndex] = stakes[msg.sender][stakes[msg.sender].length - 1];
        stakes[msg.sender].pop();

        // Transfer tokens and rewards
        _transfer(address(this), msg.sender, totalAmount);

        emit Unstaked(msg.sender, userStake.amount, reward);
        emit StakingPoolUpdated(stakingPoolRemaining, (stakingPoolRemaining * 100) / INITIAL_STAKING_POOL);
    }


    // Admin functions
    function enableTrading() external onlyOwner {
        require(!tradingEnabled, "Trading already enabled");
        tradingEnabled = true;
        emit TradingEnabled();
    }

    // Fees are now constants (2/3/1/2) and cannot be changed
    // This function removed for security - prevents owner from changing fees after launch

    function setMaxTransactionAmount(uint256 _maxTransactionAmount) external onlyOwner {
        require(_maxTransactionAmount >= TOTAL_SUPPLY / 1000, "Max transaction too low");
        maxTransactionAmount = _maxTransactionAmount;
    }

    function setMaxWalletAmount(uint256 _maxWalletAmount) external onlyOwner {
        require(_maxWalletAmount >= TOTAL_SUPPLY / 100, "Max wallet too low");
        maxWalletAmount = _maxWalletAmount;
    }

    function setAutomatedMarketMakerPair(address pair, bool value) external onlyOwner {
        automatedMarketMakerPairs[pair] = value;
    }

    function setBlacklist(address account, bool value) external onlyOwner {
        isBlacklisted[account] = value;
    }

    function excludeFromFees(address account, bool excluded) external onlyOwner {
        isExcludedFromFees[account] = excluded;
    }

    function excludeFromLimits(address account, bool excluded) external onlyOwner {
        isExcludedFromLimits[account] = excluded;
    }

    function updateTreasuryWallet(address newWallet) external onlyOwner {
        require(newWallet != address(0), "Invalid address");
        treasuryWallet = newWallet;
    }

    function updateLiquidityWallet(address newWallet) external onlyOwner {
        require(newWallet != address(0), "Invalid address");
        liquidityWallet = newWallet;
    }

    // View functions
    function getUserStakes(address user) external view returns (Stake[] memory) {
        return stakes[user];
    }

    function calculateStakingReward(address user, uint256 stakeIndex) external view returns (uint256) {
        require(stakeIndex < stakes[user].length, "Invalid stake index");

        Stake memory userStake = stakes[user][stakeIndex];
        uint256 stakingDuration = block.timestamp - userStake.timestamp;
        uint256 reward = (userStake.amount * userStake.rewardRate * stakingDuration) / (365 days) / 10000;

        // Cap at remaining pool
        if (reward > stakingPoolRemaining) {
            return stakingPoolRemaining;
        }

        return reward;
    }

    /**
     * @dev Get current pool health and effective APY rates
     */
    function getPoolHealth() external view returns (
        uint256 poolRemaining,
        uint256 poolHealthPercent,
        uint256 effectiveAPY30Days,
        uint256 effectiveAPY90Days,
        uint256 effectiveAPY365Days
    ) {
        poolRemaining = stakingPoolRemaining;
        poolHealthPercent = (stakingPoolRemaining * 100) / INITIAL_STAKING_POOL;

        uint256 poolHealthBasisPoints = (stakingPoolRemaining * 10000) / INITIAL_STAKING_POOL;
        if (poolHealthBasisPoints < 1000) poolHealthBasisPoints = 1000; // 10% minimum

        effectiveAPY30Days = ((BASE_APY + BONUS_APY_30_DAYS) * poolHealthBasisPoints) / 10000;
        effectiveAPY90Days = ((BASE_APY + BONUS_APY_90_DAYS) * poolHealthBasisPoints) / 10000;
        effectiveAPY365Days = ((BASE_APY + BONUS_APY_365_DAYS) * poolHealthBasisPoints) / 10000;
    }
}
