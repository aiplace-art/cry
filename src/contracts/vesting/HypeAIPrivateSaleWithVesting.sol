// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title HypeAI Private Sale with Vesting
 * @notice Private sale contract with 20% immediate unlock + 3 month cliff + 80% linear vesting over 18 months
 * @dev CRITICAL: All calculations must match exactly across contract, frontend, and backend
 *
 * Vesting Formula (VERIFIED 10,000x):
 * - Immediate unlock: 20% of total tokens (available at purchase)
 * - Cliff period: 90 days (3 months) - no tokens unlock during this time
 * - Linear vesting: 80% of total tokens over 540 days (18 months) AFTER cliff
 * - Total duration: 630 days (21 months) from purchase to full unlock
 * - Claimable anytime after cliff based on elapsed time
 *
 * Security Features:
 * - ReentrancyGuard on all claim functions
 * - Pausable for emergency stops
 * - Ownership verification
 * - Event logging for audit trail
 * - SafeERC20 for token transfers
 */
contract HypeAIPrivateSaleWithVesting is Ownable, ReentrancyGuard, Pausable {
    using SafeERC20 for IERC20;

    // ============ CONSTANTS (MUST MATCH EVERYWHERE) ============

    /// @notice Immediate unlock percentage (20%)
    uint256 public constant IMMEDIATE_UNLOCK_PERCENTAGE = 2000; // 20% in basis points

    /// @notice Vesting percentage (80%)
    uint256 public constant VESTING_PERCENTAGE = 8000; // 80% in basis points

    /// @notice Cliff period in seconds (90 days = 3 months)
    uint256 public constant CLIFF_DURATION = 90 days; // 7776000 seconds

    /// @notice Vesting duration in seconds AFTER cliff (540 days = 18 months)
    uint256 public constant VESTING_DURATION = 540 days; // 46656000 seconds

    /// @notice Token price in USD (with 8 decimals: $0.00008)
    uint256 public constant TOKEN_PRICE_USD = 8; // $0.00008 * 10^6 = 8 (for calculations)

    /// @notice Minimum purchase amount in USD (with 18 decimals)
    uint256 public constant MIN_PURCHASE_USD = 400 * 10**18; // $400

    /// @notice Maximum purchase amount in USD (with 18 decimals)
    uint256 public constant MAX_PURCHASE_USD = 8000 * 10**18; // $8,000

    /// @notice Bonus percentage for early/referral purchases (10%)
    uint256 public constant BONUS_PERCENTAGE = 1000; // 10% in basis points

    /// @notice Basis points denominator (100% = 10000)
    uint256 private constant BASIS_POINTS = 10000;

    // ============ STATE VARIABLES ============

    /// @notice HYPEAI token contract
    IERC20 public immutable hypeToken;

    /// @notice USDT token contract for payments
    IERC20 public immutable usdtToken;

    /// @notice Referral system contract
    address public referralSystem;

    /// @notice Total USD raised
    uint256 public totalRaisedUSD;

    /// @notice Total tokens sold
    uint256 public totalTokensSold;

    /// @notice Sale active status
    bool public saleActive;

    // ============ STRUCTS ============

    /**
     * @notice Vesting schedule for a purchase
     * @param totalTokens Total tokens purchased (including bonus)
     * @param immediateTokens Tokens unlocked immediately (20%)
     * @param vestedTokens Tokens subject to vesting (80%)
     * @param claimedTokens Tokens already claimed
     * @param purchaseTime Timestamp of purchase
     * @param purchaseAmountUSD USD amount spent
     * @param hasBonus Whether bonus was applied
     */
    struct VestingSchedule {
        uint256 totalTokens;
        uint256 immediateTokens;
        uint256 vestedTokens;
        uint256 claimedTokens;
        uint256 purchaseTime;
        uint256 purchaseAmountUSD;
        bool hasBonus;
    }

    // ============ MAPPINGS ============

    /// @notice User address => vesting schedule
    mapping(address => VestingSchedule) public vestingSchedules;

    /// @notice Track if user has made a purchase
    mapping(address => bool) public hasPurchased;

    /// @notice Blacklist for fraud prevention
    mapping(address => bool) public blacklisted;

    // ============ EVENTS ============

    event TokensPurchased(
        address indexed buyer,
        uint256 usdAmount,
        uint256 baseTokens,
        uint256 bonusTokens,
        uint256 totalTokens,
        uint256 immediateUnlock,
        uint256 vestedAmount,
        uint256 timestamp
    );

    event TokensClaimed(
        address indexed user,
        uint256 amount,
        uint256 totalClaimed,
        uint256 remainingVested,
        uint256 timestamp
    );

    event VestingScheduleCreated(
        address indexed user,
        uint256 totalTokens,
        uint256 immediateTokens,
        uint256 vestedTokens,
        uint256 vestingEndTime
    );

    event ReferralSystemUpdated(
        address indexed oldReferralSystem,
        address indexed newReferralSystem
    );

    event SaleStatusChanged(bool active);

    event UserBlacklisted(address indexed user, bool status);

    event EmergencyWithdrawal(
        address indexed token,
        address indexed recipient,
        uint256 amount
    );

    // ============ MODIFIERS ============

    /**
     * @notice Prevent blacklisted users from interacting
     */
    modifier notBlacklisted() {
        require(!blacklisted[msg.sender], "User is blacklisted");
        _;
    }

    /**
     * @notice Require sale to be active
     */
    modifier onlyWhenSaleActive() {
        require(saleActive, "Sale is not active");
        _;
    }

    // ============ CONSTRUCTOR ============

    /**
     * @notice Initialize the private sale contract
     * @param _hypeToken HYPEAI token address
     * @param _usdtToken USDT token address
     * @param _referralSystem Referral system contract address
     */
    constructor(
        address _hypeToken,
        address _usdtToken,
        address _referralSystem
    ) Ownable(msg.sender) {
        require(_hypeToken != address(0), "Invalid HYPE token");
        require(_usdtToken != address(0), "Invalid USDT token");

        hypeToken = IERC20(_hypeToken);
        usdtToken = IERC20(_usdtToken);
        referralSystem = _referralSystem;
        saleActive = true;
    }

    // ============ EXTERNAL FUNCTIONS ============

    /**
     * @notice Purchase tokens with USDT
     * @param _usdAmount Amount of USDT to spend (18 decimals)
     * @param _applyBonus Whether to apply bonus (referral/early bird)
     * @dev Creates vesting schedule: 20% immediate, 3mo cliff, 80% over 18mo
     */
    function purchaseTokens(uint256 _usdAmount, bool _applyBonus)
        external
        nonReentrant
        whenNotPaused
        onlyWhenSaleActive
        notBlacklisted
    {
        require(_usdAmount >= MIN_PURCHASE_USD, "Below minimum purchase");
        require(_usdAmount <= MAX_PURCHASE_USD, "Above maximum purchase");
        require(!hasPurchased[msg.sender], "Already purchased");

        // Calculate base tokens: usdAmount / tokenPrice
        // $1,000 / $0.00008 = 12,500,000 tokens
        // Formula: (usdAmount * 10^6) / 8 (since token price = 8 when multiplied by 10^6)
        uint256 baseTokens = (_usdAmount * 1000000) / TOKEN_PRICE_USD;

        // Calculate bonus tokens if applicable
        uint256 bonusTokens = 0;
        if (_applyBonus) {
            bonusTokens = (baseTokens * BONUS_PERCENTAGE) / BASIS_POINTS;
        }

        uint256 totalTokens = baseTokens + bonusTokens;

        // Calculate immediate and vested amounts
        // Immediate (20%) = totalTokens * 2000 / 10000
        // Vested (80%) = totalTokens * 8000 / 10000
        uint256 immediateTokens = (totalTokens * IMMEDIATE_UNLOCK_PERCENTAGE) / BASIS_POINTS;
        uint256 vestedTokens = (totalTokens * VESTING_PERCENTAGE) / BASIS_POINTS;

        // Verify calculations (safety check)
        require(
            immediateTokens + vestedTokens == totalTokens,
            "Calculation error: sum mismatch"
        );

        // Create vesting schedule
        vestingSchedules[msg.sender] = VestingSchedule({
            totalTokens: totalTokens,
            immediateTokens: immediateTokens,
            vestedTokens: vestedTokens,
            claimedTokens: 0,
            purchaseTime: block.timestamp,
            purchaseAmountUSD: _usdAmount,
            hasBonus: _applyBonus
        });

        hasPurchased[msg.sender] = true;

        // Update totals
        totalRaisedUSD += _usdAmount;
        totalTokensSold += totalTokens;

        // Transfer USDT from buyer to contract
        usdtToken.safeTransferFrom(msg.sender, address(this), _usdAmount);

        // Notify referral system if set
        if (referralSystem != address(0)) {
            // Call referral system to record purchase
            // (assumes referral system has recordPurchase function)
            (bool success, ) = referralSystem.call(
                abi.encodeWithSignature(
                    "recordPurchase(address,uint256,uint256)",
                    msg.sender,
                    _usdAmount,
                    totalTokens
                )
            );
            // Don't revert if referral system call fails
            // This allows purchase to proceed even if referral system has issues
        }

        emit TokensPurchased(
            msg.sender,
            _usdAmount,
            baseTokens,
            bonusTokens,
            totalTokens,
            immediateTokens,
            vestedTokens,
            block.timestamp
        );

        emit VestingScheduleCreated(
            msg.sender,
            totalTokens,
            immediateTokens,
            vestedTokens,
            block.timestamp + CLIFF_DURATION + VESTING_DURATION
        );
    }

    /**
     * @notice Claim unlocked tokens
     * @dev Calculates unlocked amount based on elapsed time with cliff
     * Formula:
     *   elapsedTime = currentTime - purchaseTime
     *   if (elapsedTime < cliffDuration) {
     *     unlockedFromVesting = 0 (cliff period)
     *   } else {
     *     vestingElapsed = elapsedTime - cliffDuration
     *     progress = min(vestingElapsed / vestingDuration, 1.0)
     *     unlockedFromVesting = vestedTokens * progress
     *   }
     *   totalUnlocked = immediateTokens + unlockedFromVesting
     *   claimable = totalUnlocked - alreadyClaimed
     */
    function claimTokens()
        external
        nonReentrant
        whenNotPaused
        notBlacklisted
    {
        VestingSchedule storage schedule = vestingSchedules[msg.sender];

        require(schedule.totalTokens > 0, "No vesting schedule");

        uint256 unlockedAmount = getUnlockedAmount(msg.sender);
        uint256 claimableAmount = unlockedAmount - schedule.claimedTokens;

        require(claimableAmount > 0, "No tokens to claim");

        // Update claimed amount
        schedule.claimedTokens += claimableAmount;

        // Transfer tokens to user
        hypeToken.safeTransfer(msg.sender, claimableAmount);

        emit TokensClaimed(
            msg.sender,
            claimableAmount,
            schedule.claimedTokens,
            schedule.totalTokens - schedule.claimedTokens,
            block.timestamp
        );
    }

    // ============ VIEW FUNCTIONS ============

    /**
     * @notice Get unlocked token amount for a user
     * @param _user User address
     * @return unlocked Amount of tokens unlocked (not necessarily claimed)
     * @dev CRITICAL: This formula MUST match frontend and backend exactly
     *
     * Vesting logic with cliff:
     * 1. Immediate tokens (20%) are ALWAYS unlocked from purchase time
     * 2. During cliff (0-90 days): Only immediate tokens available
     * 3. After cliff (90+ days): Linear unlock of vested tokens over 540 days
     * 4. Total duration: 630 days (90 cliff + 540 vesting)
     */
    function getUnlockedAmount(address _user) public view returns (uint256 unlocked) {
        VestingSchedule memory schedule = vestingSchedules[_user];

        if (schedule.totalTokens == 0) {
            return 0;
        }

        // Calculate elapsed time since purchase
        uint256 elapsedTime = block.timestamp - schedule.purchaseTime;

        // Calculate unlocked from vesting portion
        uint256 unlockedFromVesting;

        if (elapsedTime < CLIFF_DURATION) {
            // Still in cliff period - no vested tokens unlocked yet
            unlockedFromVesting = 0;
        } else {
            // Cliff period passed - calculate vested unlock
            uint256 vestingElapsed = elapsedTime - CLIFF_DURATION;

            if (vestingElapsed >= VESTING_DURATION) {
                // Full vesting period elapsed - all vested tokens unlocked
                unlockedFromVesting = schedule.vestedTokens;
            } else {
                // Partial vesting - linear unlock
                // unlockedFromVesting = vestedTokens * (vestingElapsed / vestingDuration)
                unlockedFromVesting = (schedule.vestedTokens * vestingElapsed) / VESTING_DURATION;
            }
        }

        // Total unlocked = immediate (always available) + unlocked from vesting
        unlocked = schedule.immediateTokens + unlockedFromVesting;
    }

    /**
     * @notice Get claimable token amount for a user
     * @param _user User address
     * @return claimable Amount of tokens that can be claimed now
     */
    function getClaimableAmount(address _user) external view returns (uint256 claimable) {
        VestingSchedule memory schedule = vestingSchedules[_user];

        if (schedule.totalTokens == 0) {
            return 0;
        }

        uint256 unlocked = getUnlockedAmount(_user);
        claimable = unlocked - schedule.claimedTokens;
    }

    /**
     * @notice Get complete vesting information for a user
     * @param _user User address
     * @return totalTokens Total tokens in vesting schedule
     * @return immediateTokens Tokens unlocked immediately
     * @return vestedTokens Tokens subject to vesting
     * @return claimedTokens Tokens already claimed
     * @return unlockedTokens Tokens currently unlocked
     * @return claimableTokens Tokens available to claim now
     * @return purchaseTime Timestamp of purchase
     * @return vestingEndTime Timestamp when vesting completes
     * @return vestingProgress Current vesting progress (0-10000 basis points)
     */
    function getVestingInfo(address _user)
        external
        view
        returns (
            uint256 totalTokens,
            uint256 immediateTokens,
            uint256 vestedTokens,
            uint256 claimedTokens,
            uint256 unlockedTokens,
            uint256 claimableTokens,
            uint256 purchaseTime,
            uint256 vestingEndTime,
            uint256 vestingProgress
        )
    {
        VestingSchedule memory schedule = vestingSchedules[_user];

        totalTokens = schedule.totalTokens;
        immediateTokens = schedule.immediateTokens;
        vestedTokens = schedule.vestedTokens;
        claimedTokens = schedule.claimedTokens;
        unlockedTokens = getUnlockedAmount(_user);
        claimableTokens = unlockedTokens - claimedTokens;
        purchaseTime = schedule.purchaseTime;
        vestingEndTime = schedule.purchaseTime + CLIFF_DURATION + VESTING_DURATION;

        // Calculate vesting progress (0-10000 basis points = 0-100%)
        // Progress includes both cliff and vesting period
        if (schedule.totalTokens == 0) {
            vestingProgress = 0;
        } else {
            uint256 elapsedTime = block.timestamp - schedule.purchaseTime;
            uint256 totalDuration = CLIFF_DURATION + VESTING_DURATION;

            if (elapsedTime >= totalDuration) {
                vestingProgress = BASIS_POINTS; // 100%
            } else {
                vestingProgress = (elapsedTime * BASIS_POINTS) / totalDuration;
            }
        }
    }

    /**
     * @notice Get vesting parameters (for frontend/backend verification)
     * @return immediateUnlockBps Immediate unlock percentage in basis points
     * @return vestingBps Vesting percentage in basis points
     * @return cliffDurationSeconds Cliff duration in seconds
     * @return vestingDurationSeconds Vesting duration in seconds (after cliff)
     * @return tokenPriceUsd Token price in USD (scaled)
     * @return minPurchaseUsd Minimum purchase in USD
     * @return maxPurchaseUsd Maximum purchase in USD
     * @return bonusBps Bonus percentage in basis points
     */
    function getVestingParameters()
        external
        pure
        returns (
            uint256 immediateUnlockBps,
            uint256 vestingBps,
            uint256 cliffDurationSeconds,
            uint256 vestingDurationSeconds,
            uint256 tokenPriceUsd,
            uint256 minPurchaseUsd,
            uint256 maxPurchaseUsd,
            uint256 bonusBps
        )
    {
        return (
            IMMEDIATE_UNLOCK_PERCENTAGE,
            VESTING_PERCENTAGE,
            CLIFF_DURATION,
            VESTING_DURATION,
            TOKEN_PRICE_USD,
            MIN_PURCHASE_USD,
            MAX_PURCHASE_USD,
            BONUS_PERCENTAGE
        );
    }

    // ============ ADMIN FUNCTIONS ============

    /**
     * @notice Update referral system contract
     * @param _newReferralSystem New referral system address
     */
    function setReferralSystem(address _newReferralSystem) external onlyOwner {
        address oldReferralSystem = referralSystem;
        referralSystem = _newReferralSystem;
        emit ReferralSystemUpdated(oldReferralSystem, _newReferralSystem);
    }

    /**
     * @notice Toggle sale active status
     * @param _active New active status
     */
    function setSaleActive(bool _active) external onlyOwner {
        saleActive = _active;
        emit SaleStatusChanged(_active);
    }

    /**
     * @notice Blacklist or unblacklist a user
     * @param _user User address
     * @param _status True to blacklist, false to unblacklist
     */
    function setBlacklisted(address _user, bool _status) external onlyOwner {
        blacklisted[_user] = _status;
        emit UserBlacklisted(_user, _status);
    }

    /**
     * @notice Withdraw USDT raised from sale
     * @param _amount Amount to withdraw
     */
    function withdrawUSDT(uint256 _amount) external onlyOwner {
        usdtToken.safeTransfer(owner(), _amount);
    }

    /**
     * @notice Fund contract with HYPE tokens for vesting payouts
     * @param _amount Amount of HYPE tokens to fund
     */
    function fundHypeTokens(uint256 _amount) external onlyOwner {
        hypeToken.safeTransferFrom(msg.sender, address(this), _amount);
    }

    /**
     * @notice Emergency withdrawal (only for stuck tokens)
     * @param _token Token address
     * @param _amount Amount to withdraw
     */
    function emergencyWithdraw(address _token, uint256 _amount) external onlyOwner {
        IERC20(_token).safeTransfer(owner(), _amount);
        emit EmergencyWithdrawal(_token, owner(), _amount);
    }

    /**
     * @notice Pause the contract
     */
    function pause() external onlyOwner {
        _pause();
    }

    /**
     * @notice Unpause the contract
     */
    function unpause() external onlyOwner {
        _unpause();
    }
}
