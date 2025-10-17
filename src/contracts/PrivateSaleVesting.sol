// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

/**
 * @title PrivateSaleVesting
 * @notice Private sale contract with 6-month vesting and anti-whale protection
 * @dev Implements:
 *      - 20-30% bonus tokens (not discount!)
 *      - $500 maximum per wallet
 *      - 40% immediate unlock, 60% vested over 6 months
 *      - Anti-whale protection
 */
contract PrivateSaleVesting is Ownable, ReentrancyGuard {
    using SafeMath for uint256;

    IERC20 public token;

    // Pricing and limits
    uint256 public constant TOKEN_PRICE = 0.0015 ether; // $0.0015 USD per token
    uint256 public constant MAX_PURCHASE_USD = 500; // $500 maximum
    uint256 public constant IMMEDIATE_UNLOCK_PERCENT = 40; // 40% unlocked immediately
    uint256 public constant VESTING_DURATION = 180 days; // 6 months
    uint256 public constant VESTING_INTERVAL = 30 days; // Monthly unlocks
    uint256 public constant VESTING_PERIODS = 6; // 6 monthly periods

    // Sale period
    uint256 public saleStartTime;
    uint256 public saleEndTime;

    // Bonus tiers (in basis points, 100 = 1%)
    struct BonusTier {
        uint256 minAmount; // Minimum USD amount
        uint256 bonusPercent; // Bonus percentage (20 = 20%)
    }

    BonusTier[] public bonusTiers;

    // Purchase tracking
    struct Purchase {
        uint256 totalTokens; // Total tokens including bonus
        uint256 immediateTokens; // 40% unlocked immediately
        uint256 vestedTokens; // 60% to be vested
        uint256 claimedTokens; // Tokens already claimed from vesting
        uint256 purchaseTime;
        bool immediateClaimed; // Whether immediate tokens were claimed
    }

    mapping(address => Purchase) public purchases;
    mapping(address => uint256) public totalSpentUSD; // Track total USD spent per wallet

    // Anti-whale tracking
    mapping(address => bool) public blacklisted;
    uint256 public totalParticipants;
    uint256 public totalRaised;

    // Events
    event TokensPurchased(
        address indexed buyer,
        uint256 usdAmount,
        uint256 baseTokens,
        uint256 bonusTokens,
        uint256 totalTokens
    );
    event ImmediateTokensClaimed(address indexed buyer, uint256 amount);
    event VestedTokensClaimed(address indexed buyer, uint256 amount);
    event BonusTierAdded(uint256 minAmount, uint256 bonusPercent);
    event AddressBlacklisted(address indexed account);
    event AddressWhitelisted(address indexed account);

    constructor(
        address _token,
        uint256 _saleStartTime,
        uint256 _saleEndTime
    ) {
        require(_token != address(0), "Invalid token address");
        require(_saleStartTime < _saleEndTime, "Invalid sale period");

        token = IERC20(_token);
        saleStartTime = _saleStartTime;
        saleEndTime = _saleEndTime;

        // Initialize bonus tiers (highest to lowest)
        bonusTiers.push(BonusTier(500, 30)); // $500+: 30% bonus
        bonusTiers.push(BonusTier(100, 20)); // $100+: 20% bonus

        emit BonusTierAdded(500, 30);
        emit BonusTierAdded(100, 20);
    }

    /**
     * @notice Purchase tokens with ETH
     * @dev Implements $500 max limit and bonus calculation
     */
    function purchaseTokens() external payable nonReentrant {
        require(block.timestamp >= saleStartTime, "Sale not started");
        require(block.timestamp <= saleEndTime, "Sale ended");
        require(!blacklisted[msg.sender], "Address blacklisted");
        require(msg.value > 0, "Must send ETH");

        // Convert ETH to USD (simplified - in production use Chainlink oracle)
        uint256 usdAmount = msg.value; // Assume 1:1 for demo, use oracle in production

        // Check $500 limit per wallet
        uint256 newTotal = totalSpentUSD[msg.sender].add(usdAmount);
        require(newTotal <= MAX_PURCHASE_USD * 1e18, "Exceeds $500 limit per wallet");

        // Calculate base tokens
        uint256 baseTokens = usdAmount.mul(1e18).div(TOKEN_PRICE);

        // Calculate bonus
        uint256 bonusPercent = getBonusPercent(usdAmount);
        uint256 bonusTokens = baseTokens.mul(bonusPercent).div(100);
        uint256 totalTokens = baseTokens.add(bonusTokens);

        // Calculate immediate vs vested
        uint256 immediateTokens = totalTokens.mul(IMMEDIATE_UNLOCK_PERCENT).div(100);
        uint256 vestedTokens = totalTokens.sub(immediateTokens);

        // Update purchase record
        if (purchases[msg.sender].totalTokens == 0) {
            totalParticipants++;
        }

        Purchase storage purchase = purchases[msg.sender];
        purchase.totalTokens = purchase.totalTokens.add(totalTokens);
        purchase.immediateTokens = purchase.immediateTokens.add(immediateTokens);
        purchase.vestedTokens = purchase.vestedTokens.add(vestedTokens);
        purchase.purchaseTime = block.timestamp;

        totalSpentUSD[msg.sender] = newTotal;
        totalRaised = totalRaised.add(usdAmount);

        emit TokensPurchased(msg.sender, usdAmount, baseTokens, bonusTokens, totalTokens);
    }

    /**
     * @notice Claim immediate 40% tokens
     */
    function claimImmediateTokens() external nonReentrant {
        Purchase storage purchase = purchases[msg.sender];
        require(purchase.immediateTokens > 0, "No immediate tokens");
        require(!purchase.immediateClaimed, "Already claimed");

        purchase.immediateClaimed = true;

        require(
            token.transfer(msg.sender, purchase.immediateTokens),
            "Transfer failed"
        );

        emit ImmediateTokensClaimed(msg.sender, purchase.immediateTokens);
    }

    /**
     * @notice Claim vested tokens based on time elapsed
     */
    function claimVestedTokens() external nonReentrant {
        Purchase storage purchase = purchases[msg.sender];
        require(purchase.vestedTokens > 0, "No vested tokens");

        uint256 claimable = getClaimableVestedTokens(msg.sender);
        require(claimable > 0, "No tokens to claim yet");

        purchase.claimedTokens = purchase.claimedTokens.add(claimable);

        require(
            token.transfer(msg.sender, claimable),
            "Transfer failed"
        );

        emit VestedTokensClaimed(msg.sender, claimable);
    }

    /**
     * @notice Calculate claimable vested tokens
     * @param buyer Address to check
     * @return Amount of tokens that can be claimed
     */
    function getClaimableVestedTokens(address buyer) public view returns (uint256) {
        Purchase memory purchase = purchases[buyer];
        if (purchase.vestedTokens == 0) return 0;

        uint256 elapsed = block.timestamp.sub(purchase.purchaseTime);
        if (elapsed < VESTING_INTERVAL) return 0;

        // Calculate how many periods have passed
        uint256 periodsPassed = elapsed.div(VESTING_INTERVAL);
        if (periodsPassed > VESTING_PERIODS) {
            periodsPassed = VESTING_PERIODS;
        }

        // Calculate total unlocked (10% per month for 6 months)
        uint256 totalUnlocked = purchase.vestedTokens.mul(periodsPassed).div(VESTING_PERIODS);

        // Subtract already claimed
        uint256 claimable = totalUnlocked.sub(purchase.claimedTokens);

        return claimable;
    }

    /**
     * @notice Get bonus percentage for USD amount
     * @param usdAmount Amount in USD (18 decimals)
     * @return Bonus percentage
     */
    function getBonusPercent(uint256 usdAmount) public view returns (uint256) {
        for (uint256 i = 0; i < bonusTiers.length; i++) {
            if (usdAmount >= bonusTiers[i].minAmount * 1e18) {
                return bonusTiers[i].bonusPercent;
            }
        }
        return 0;
    }

    /**
     * @notice Get vesting schedule for a buyer
     * @param buyer Address to check
     * @return Array of unlock times and amounts
     */
    function getVestingSchedule(address buyer)
        external
        view
        returns (
            uint256[] memory unlockTimes,
            uint256[] memory unlockAmounts,
            bool[] memory claimed
        )
    {
        Purchase memory purchase = purchases[buyer];

        unlockTimes = new uint256[](VESTING_PERIODS);
        unlockAmounts = new uint256[](VESTING_PERIODS);
        claimed = new bool[](VESTING_PERIODS);

        uint256 amountPerPeriod = purchase.vestedTokens.div(VESTING_PERIODS);

        for (uint256 i = 0; i < VESTING_PERIODS; i++) {
            unlockTimes[i] = purchase.purchaseTime.add(VESTING_INTERVAL.mul(i + 1));
            unlockAmounts[i] = amountPerPeriod;

            // Check if this period has been claimed
            uint256 periodClaimed = purchase.claimedTokens.div(amountPerPeriod);
            claimed[i] = i < periodClaimed;
        }

        return (unlockTimes, unlockAmounts, claimed);
    }

    /**
     * @notice Get purchase info for a buyer
     */
    function getPurchaseInfo(address buyer)
        external
        view
        returns (
            uint256 totalTokens,
            uint256 immediateTokens,
            uint256 vestedTokens,
            uint256 claimedTokens,
            uint256 claimableNow,
            bool immediateClaimed
        )
    {
        Purchase memory purchase = purchases[buyer];
        return (
            purchase.totalTokens,
            purchase.immediateTokens,
            purchase.vestedTokens,
            purchase.claimedTokens,
            getClaimableVestedTokens(buyer),
            purchase.immediateClaimed
        );
    }

    /**
     * @notice Admin: Add bonus tier
     */
    function addBonusTier(uint256 minAmount, uint256 bonusPercent) external onlyOwner {
        require(bonusPercent <= 50, "Bonus too high"); // Max 50%
        bonusTiers.push(BonusTier(minAmount, bonusPercent));
        emit BonusTierAdded(minAmount, bonusPercent);
    }

    /**
     * @notice Admin: Blacklist address (anti-whale protection)
     */
    function blacklistAddress(address account) external onlyOwner {
        blacklisted[account] = true;
        emit AddressBlacklisted(account);
    }

    /**
     * @notice Admin: Remove from blacklist
     */
    function whitelistAddress(address account) external onlyOwner {
        blacklisted[account] = false;
        emit AddressWhitelisted(account);
    }

    /**
     * @notice Admin: Withdraw raised funds
     */
    function withdrawFunds(address payable recipient) external onlyOwner {
        require(recipient != address(0), "Invalid recipient");
        uint256 balance = address(this).balance;
        require(balance > 0, "No funds");

        (bool success, ) = recipient.call{value: balance}("");
        require(success, "Withdrawal failed");
    }

    /**
     * @notice Admin: Recover accidentally sent tokens
     */
    function recoverTokens(address tokenAddress, uint256 amount) external onlyOwner {
        require(tokenAddress != address(token), "Cannot recover sale token");
        IERC20(tokenAddress).transfer(owner(), amount);
    }

    /**
     * @notice Get sale statistics
     */
    function getSaleStats()
        external
        view
        returns (
            uint256 participants,
            uint256 raised,
            uint256 timeLeft,
            bool isActive
        )
    {
        uint256 timeRemaining = 0;
        bool active = false;

        if (block.timestamp < saleStartTime) {
            timeRemaining = saleStartTime.sub(block.timestamp);
        } else if (block.timestamp < saleEndTime) {
            timeRemaining = saleEndTime.sub(block.timestamp);
            active = true;
        }

        return (totalParticipants, totalRaised, timeRemaining, active);
    }
}
