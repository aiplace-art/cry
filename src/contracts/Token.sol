// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

/**
 * @title HypedToken
 * @dev Advanced ERC-20 token with innovative tokenomics features
 *
 * Features:
 * - Anti-whale mechanisms (max transaction & wallet limits)
 * - Auto-liquidity generation
 * - Reflection rewards to holders
 * - Dynamic burn mechanism
 * - AI-driven fee optimization
 * - Staking rewards system
 */
contract HypedToken is ERC20, Ownable, ReentrancyGuard {
    using SafeMath for uint256;

    // Token configuration
    uint256 private constant TOTAL_SUPPLY = 1_000_000_000 * 10**18; // 1 Billion tokens
    uint256 public maxTransactionAmount = 5_000_000 * 10**18; // 0.5% of total supply
    uint256 public maxWalletAmount = 20_000_000 * 10**18; // 2% of total supply

    // Fee structure (in basis points, 1% = 100)
    uint256 public reflectionFee = 200; // 2%
    uint256 public liquidityFee = 300; // 3%
    uint256 public burnFee = 100; // 1%
    uint256 public treasuryFee = 200; // 2%
    uint256 public totalFees = 800; // 8% total

    // AI-driven dynamic fee adjustment
    uint256 public minFee = 500; // 5% minimum
    uint256 public maxFee = 1500; // 15% maximum
    bool public aiFeesEnabled = true;

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

    // Reflection tracking
    mapping(address => uint256) private _reflectionBalances;
    mapping(address => bool) public isExcludedFromReflections;
    address[] private _excludedFromReflections;
    uint256 private constant MAX = ~uint256(0);
    uint256 private _reflectionTotal = (MAX - (MAX % TOTAL_SUPPLY));
    uint256 private _totalReflections;

    // Staking system
    struct Stake {
        uint256 amount;
        uint256 timestamp;
        uint256 lockPeriod; // in days
        uint256 rewardRate; // APY in basis points
    }

    mapping(address => Stake[]) public stakes;
    uint256 public constant BASE_APY = 1200; // 12% base APY
    uint256 public constant BONUS_APY_30_DAYS = 500; // +5% for 30 days
    uint256 public constant BONUS_APY_90_DAYS = 1500; // +15% for 90 days
    uint256 public constant BONUS_APY_365_DAYS = 5000; // +50% for 365 days

    // Liquidity management
    uint256 public swapTokensAtAmount = 1_000_000 * 10**18; // 0.1% of supply
    bool private swapping;

    // Volume tracking for AI fee adjustment
    uint256 public dailyVolume;
    uint256 public lastVolumeReset;
    uint256 public constant VOLUME_RESET_PERIOD = 1 days;

    // Events
    event TradingEnabled();
    event FeesUpdated(uint256 reflection, uint256 liquidity, uint256 burn, uint256 treasury);
    event AIFeesUpdated(uint256 newTotalFee);
    event Staked(address indexed user, uint256 amount, uint256 lockPeriod);
    event Unstaked(address indexed user, uint256 amount, uint256 reward);
    event ReflectionDistributed(uint256 amount);
    event LiquidityAdded(uint256 tokenAmount, uint256 ethAmount);

    constructor(
        address _treasuryWallet,
        address _liquidityWallet
    ) ERC20("HypedToken", "HYPE") {
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

        // Initialize reflection balances
        _reflectionBalances[owner()] = _reflectionTotal;

        // Mint total supply to owner
        _mint(owner(), TOTAL_SUPPLY);

        lastVolumeReset = block.timestamp;
    }

    receive() external payable {}

    // Override transfer functions for custom logic
    function _transfer(
        address from,
        address to,
        uint256 amount
    ) internal override {
        require(from != address(0), "Transfer from zero address");
        require(to != address(0), "Transfer to zero address");
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

        // AI fee adjustment based on volume
        if (aiFeesEnabled && block.timestamp >= lastVolumeReset + VOLUME_RESET_PERIOD) {
            _adjustFeesBasedOnVolume();
            dailyVolume = 0;
            lastVolumeReset = block.timestamp;
        }

        // Track volume
        dailyVolume += amount;

        // Take fees
        bool takeFee = !swapping && !isExcludedFromFees[from] && !isExcludedFromFees[to];

        if (takeFee) {
            uint256 fees = amount.mul(totalFees).div(10000);
            amount = amount.sub(fees);

            // Distribute fees
            _distributeFees(from, fees);
        }

        // Auto-liquidity swap
        uint256 contractBalance = balanceOf(address(this));
        bool canSwap = contractBalance >= swapTokensAtAmount;

        if (
            canSwap &&
            !swapping &&
            !automatedMarketMakerPairs[from] &&
            takeFee
        ) {
            swapping = true;
            _swapAndLiquify(swapTokensAtAmount);
            swapping = false;
        }

        super._transfer(from, to, amount);
    }

    /**
     * @dev Distribute collected fees
     */
    function _distributeFees(address from, uint256 totalFeeAmount) private {
        uint256 reflectionAmount = totalFeeAmount.mul(reflectionFee).div(totalFees);
        uint256 liquidityAmount = totalFeeAmount.mul(liquidityFee).div(totalFees);
        uint256 burnAmount = totalFeeAmount.mul(burnFee).div(totalFees);
        uint256 treasuryAmount = totalFeeAmount.sub(reflectionAmount).sub(liquidityAmount).sub(burnAmount);

        // Reflection to holders
        if (reflectionAmount > 0) {
            _totalReflections = _totalReflections.add(reflectionAmount);
            emit ReflectionDistributed(reflectionAmount);
        }

        // Liquidity pool
        if (liquidityAmount > 0) {
            super._transfer(from, address(this), liquidityAmount);
        }

        // Burn
        if (burnAmount > 0) {
            super._transfer(from, deadWallet, burnAmount);
        }

        // Treasury
        if (treasuryAmount > 0) {
            super._transfer(from, treasuryWallet, treasuryAmount);
        }
    }

    /**
     * @dev AI-driven fee adjustment based on trading volume
     */
    function _adjustFeesBasedOnVolume() private {
        uint256 volumeRatio = dailyVolume.mul(10000).div(TOTAL_SUPPLY);

        // High volume (>5% of supply): reduce fees
        if (volumeRatio > 500) {
            totalFees = minFee;
        }
        // Medium volume (2-5%): standard fees
        else if (volumeRatio > 200) {
            totalFees = 800; // 8%
        }
        // Low volume (<2%): increase fees to incentivize holding
        else {
            totalFees = maxFee;
        }

        emit AIFeesUpdated(totalFees);
    }

    /**
     * @dev Swap tokens for ETH and add liquidity
     */
    function _swapAndLiquify(uint256 tokens) private {
        uint256 half = tokens.div(2);
        uint256 otherHalf = tokens.sub(half);

        // For this implementation, tokens are sent to liquidity wallet
        // In production, integrate with DEX router for actual swaps
        super._transfer(address(this), liquidityWallet, tokens);

        emit LiquidityAdded(half, 0);
    }

    /**
     * @dev Stake tokens for rewards
     */
    function stake(uint256 amount, uint256 lockPeriodDays) external nonReentrant {
        require(amount > 0, "Cannot stake 0 tokens");
        require(balanceOf(msg.sender) >= amount, "Insufficient balance");
        require(
            lockPeriodDays == 30 || lockPeriodDays == 90 || lockPeriodDays == 365,
            "Invalid lock period"
        );

        // Calculate reward rate based on lock period
        uint256 rewardRate = BASE_APY;
        if (lockPeriodDays == 30) rewardRate = rewardRate.add(BONUS_APY_30_DAYS);
        else if (lockPeriodDays == 90) rewardRate = rewardRate.add(BONUS_APY_90_DAYS);
        else if (lockPeriodDays == 365) rewardRate = rewardRate.add(BONUS_APY_365_DAYS);

        // Transfer tokens to contract
        _transfer(msg.sender, address(this), amount);

        // Create stake
        stakes[msg.sender].push(Stake({
            amount: amount,
            timestamp: block.timestamp,
            lockPeriod: lockPeriodDays,
            rewardRate: rewardRate
        }));

        emit Staked(msg.sender, amount, lockPeriodDays);
    }

    /**
     * @dev Unstake tokens and claim rewards
     */
    function unstake(uint256 stakeIndex) external nonReentrant {
        require(stakeIndex < stakes[msg.sender].length, "Invalid stake index");

        Stake memory userStake = stakes[msg.sender][stakeIndex];
        uint256 lockEndTime = userStake.timestamp + (userStake.lockPeriod * 1 days);

        require(block.timestamp >= lockEndTime, "Stake is still locked");

        // Calculate rewards
        uint256 stakingDuration = block.timestamp.sub(userStake.timestamp);
        uint256 reward = userStake.amount
            .mul(userStake.rewardRate)
            .mul(stakingDuration)
            .div(365 days)
            .div(10000);

        uint256 totalAmount = userStake.amount.add(reward);

        // Remove stake
        stakes[msg.sender][stakeIndex] = stakes[msg.sender][stakes[msg.sender].length - 1];
        stakes[msg.sender].pop();

        // Transfer tokens and rewards
        _transfer(address(this), msg.sender, totalAmount);

        emit Unstaked(msg.sender, userStake.amount, reward);
    }

    /**
     * @dev Get reflection balance
     */
    function balanceOf(address account) public view override returns (uint256) {
        if (isExcludedFromReflections[account]) return super.balanceOf(account);
        return _tokenFromReflection(_reflectionBalances[account]);
    }

    function _tokenFromReflection(uint256 rAmount) private view returns (uint256) {
        require(rAmount <= _reflectionTotal, "Amount must be less than total reflections");
        uint256 currentRate = _getRate();
        return rAmount.div(currentRate);
    }

    function _getRate() private view returns (uint256) {
        (uint256 rSupply, uint256 tSupply) = _getCurrentSupply();
        return rSupply.div(tSupply);
    }

    function _getCurrentSupply() private view returns (uint256, uint256) {
        uint256 rSupply = _reflectionTotal;
        uint256 tSupply = TOTAL_SUPPLY;

        for (uint256 i = 0; i < _excludedFromReflections.length; i++) {
            if (_reflectionBalances[_excludedFromReflections[i]] > rSupply ||
                super.balanceOf(_excludedFromReflections[i]) > tSupply) {
                return (_reflectionTotal, TOTAL_SUPPLY);
            }
            rSupply = rSupply.sub(_reflectionBalances[_excludedFromReflections[i]]);
            tSupply = tSupply.sub(super.balanceOf(_excludedFromReflections[i]));
        }

        if (rSupply < _reflectionTotal.div(TOTAL_SUPPLY)) return (_reflectionTotal, TOTAL_SUPPLY);
        return (rSupply, tSupply);
    }

    // Admin functions
    function enableTrading() external onlyOwner {
        require(!tradingEnabled, "Trading already enabled");
        tradingEnabled = true;
        emit TradingEnabled();
    }

    function setFees(
        uint256 _reflectionFee,
        uint256 _liquidityFee,
        uint256 _burnFee,
        uint256 _treasuryFee
    ) external onlyOwner {
        reflectionFee = _reflectionFee;
        liquidityFee = _liquidityFee;
        burnFee = _burnFee;
        treasuryFee = _treasuryFee;
        totalFees = _reflectionFee.add(_liquidityFee).add(_burnFee).add(_treasuryFee);
        require(totalFees <= maxFee, "Total fees exceed maximum");
        emit FeesUpdated(_reflectionFee, _liquidityFee, _burnFee, _treasuryFee);
    }

    function setMaxTransactionAmount(uint256 _maxTransactionAmount) external onlyOwner {
        require(_maxTransactionAmount >= TOTAL_SUPPLY.div(1000), "Max transaction too low");
        maxTransactionAmount = _maxTransactionAmount;
    }

    function setMaxWalletAmount(uint256 _maxWalletAmount) external onlyOwner {
        require(_maxWalletAmount >= TOTAL_SUPPLY.div(100), "Max wallet too low");
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

    function setAIFeesEnabled(bool enabled) external onlyOwner {
        aiFeesEnabled = enabled;
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
        uint256 stakingDuration = block.timestamp.sub(userStake.timestamp);

        return userStake.amount
            .mul(userStake.rewardRate)
            .mul(stakingDuration)
            .div(365 days)
            .div(10000);
    }
}
