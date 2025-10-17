// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

/**
 * @title HYPEPresale
 * @dev Secure presale contract for HYPE token with multi-round support, vesting, and multi-payment options
 * @notice This contract handles 3 presale rounds with different prices, bonuses, and vesting schedules
 */
contract HYPEPresale is ReentrancyGuard, Pausable, Ownable {
    using SafeERC20 for IERC20;
    using SafeMath for uint256;

    // ==================== CONSTANTS ====================
    uint256 public constant TOTAL_PRESALE_TOKENS = 300_000_000 * 10**18; // 300M tokens
    uint256 public constant MAX_TRANSACTION_USD = 10_000; // $10k max per transaction
    uint256 public constant KYC_THRESHOLD_USD = 5_000; // $5k KYC requirement
    uint256 public constant PRICE_DECIMALS = 6; // Price precision (6 decimals for USD)
    uint256 public constant MULTISIG_REQUIRED = 2; // 2 of 3 multisig

    // ==================== ENUMS ====================
    enum Round { PRIVATE, PRESALE1, PRESALE2 }
    enum PaymentMethod { ETH, USDT, USDC, BNB }

    // ==================== STRUCTS ====================
    struct RoundConfig {
        uint256 price; // Price in USD with 6 decimals (e.g., 0.01 USD = 10000)
        uint256 bonus; // Bonus percentage (e.g., 20 = 20%)
        uint256 allocation; // Total tokens allocated for this round
        uint256 sold; // Tokens sold in this round
        uint256 startTime; // Round start timestamp
        uint256 endTime; // Round end timestamp
        uint256 vestingCliff; // Vesting cliff in seconds
        uint256 vestingDuration; // Total vesting duration in seconds
        uint256 immediateRelease; // Percentage released immediately (0-100)
        bool requiresWhitelist; // Whether whitelist is required
    }

    struct Purchase {
        uint256 amount; // Total tokens purchased
        uint256 claimed; // Tokens already claimed
        uint256 purchaseTime; // Time of purchase
        Round round; // Round in which purchase was made
        bool exists; // Flag to check if purchase exists
    }

    struct VestingSchedule {
        uint256 totalAmount; // Total tokens to be vested
        uint256 releasedAmount; // Tokens already released
        uint256 startTime; // Vesting start time
        uint256 cliff; // Cliff period in seconds
        uint256 duration; // Total vesting duration
        uint256 immediateRelease; // Percentage released immediately
    }

    // ==================== STATE VARIABLES ====================
    IERC20 public hypeToken;
    IERC20 public usdtToken;
    IERC20 public usdcToken;

    Round public currentRound;
    mapping(Round => RoundConfig) public roundConfigs;
    mapping(address => Purchase[]) public purchases;
    mapping(address => VestingSchedule) public vestingSchedules;
    mapping(address => bool) public whitelist;
    mapping(address => bool) public kycVerified;
    mapping(address => uint256) public totalInvestedUSD; // Track total investment per user

    uint256 public totalRaised; // Total raised in USD (6 decimals)
    uint256 public softCap; // Soft cap in USD (6 decimals)
    uint256 public hardCap; // Hard cap in USD (6 decimals)
    bool public softCapReached;
    bool public presaleFinalized;
    uint256 public withdrawLockTime; // Time lock for fund withdrawal

    // Price feeds (in USD with 6 decimals)
    mapping(PaymentMethod => uint256) public priceFeeds;

    // Multisig
    address[3] public multisigOwners;
    mapping(bytes32 => uint256) public multisigApprovals;
    mapping(bytes32 => mapping(address => bool)) public hasApproved;

    // Rate limiting
    mapping(address => uint256) public lastPurchaseTime;
    uint256 public constant RATE_LIMIT_DURATION = 5 minutes;

    // ==================== EVENTS ====================
    event TokensPurchased(
        address indexed buyer,
        uint256 amount,
        uint256 price,
        PaymentMethod paymentMethod,
        Round round,
        uint256 timestamp
    );
    event TokensClaimed(address indexed buyer, uint256 amount, uint256 timestamp);
    event RefundIssued(address indexed buyer, uint256 amount, uint256 timestamp);
    event RoundChanged(Round oldRound, Round newRound, uint256 timestamp);
    event WhitelistUpdated(address indexed user, bool status);
    event KYCVerified(address indexed user, bool status);
    event EmergencyWithdraw(address indexed owner, uint256 amount, uint256 timestamp);
    event SoftCapReached(uint256 amount, uint256 timestamp);
    event PresaleFinalized(uint256 totalRaised, uint256 timestamp);
    event PriceFeedUpdated(PaymentMethod method, uint256 price);
    event MultisigApproval(bytes32 indexed action, address indexed approver, uint256 approvals);

    // ==================== MODIFIERS ====================
    modifier onlyWhitelisted() {
        if (roundConfigs[currentRound].requiresWhitelist) {
            require(whitelist[msg.sender], "Not whitelisted");
        }
        _;
    }

    modifier validRound() {
        RoundConfig memory config = roundConfigs[currentRound];
        require(block.timestamp >= config.startTime, "Round not started");
        require(block.timestamp <= config.endTime, "Round ended");
        _;
    }

    modifier notFinalized() {
        require(!presaleFinalized, "Presale finalized");
        _;
    }

    modifier rateLimited() {
        require(
            block.timestamp >= lastPurchaseTime[msg.sender] + RATE_LIMIT_DURATION,
            "Rate limit exceeded"
        );
        _;
    }

    // ==================== CONSTRUCTOR ====================
    constructor(
        address _hypeToken,
        address _usdtToken,
        address _usdcToken,
        address[3] memory _multisigOwners,
        uint256 _softCap,
        uint256 _hardCap
    ) {
        require(_hypeToken != address(0), "Invalid HYPE token");
        require(_usdtToken != address(0), "Invalid USDT token");
        require(_usdcToken != address(0), "Invalid USDC token");
        require(_softCap > 0 && _hardCap > _softCap, "Invalid caps");

        hypeToken = IERC20(_hypeToken);
        usdtToken = IERC20(_usdtToken);
        usdcToken = IERC20(_usdcToken);
        multisigOwners = _multisigOwners;
        softCap = _softCap;
        hardCap = _hardCap;

        // Initialize round configurations
        _initializeRounds();

        currentRound = Round.PRIVATE;
        withdrawLockTime = block.timestamp + 30 days; // 30 day lock
    }

    // ==================== INITIALIZATION ====================
    function _initializeRounds() private {
        // Private Round: 100M tokens, $0.01, 20% bonus, whitelist required
        roundConfigs[Round.PRIVATE] = RoundConfig({
            price: 10000, // $0.01 in 6 decimals
            bonus: 20,
            allocation: 100_000_000 * 10**18,
            sold: 0,
            startTime: block.timestamp,
            endTime: block.timestamp + 30 days,
            vestingCliff: 0,
            vestingDuration: 90 days,
            immediateRelease: 25, // 25% immediate
            requiresWhitelist: true
        });

        // Presale 1: 100M tokens, $0.015, 10% bonus
        roundConfigs[Round.PRESALE1] = RoundConfig({
            price: 15000, // $0.015 in 6 decimals
            bonus: 10,
            allocation: 100_000_000 * 10**18,
            sold: 0,
            startTime: block.timestamp + 30 days,
            endTime: block.timestamp + 60 days,
            vestingCliff: 0,
            vestingDuration: 30 days,
            immediateRelease: 50, // 50% immediate
            requiresWhitelist: false
        });

        // Presale 2: 100M tokens, $0.02, no bonus
        roundConfigs[Round.PRESALE2] = RoundConfig({
            price: 20000, // $0.02 in 6 decimals
            bonus: 0,
            allocation: 100_000_000 * 10**18,
            sold: 0,
            startTime: block.timestamp + 60 days,
            endTime: block.timestamp + 90 days,
            vestingCliff: 0,
            vestingDuration: 0,
            immediateRelease: 100, // 100% immediate
            requiresWhitelist: false
        });
    }

    // ==================== PURCHASE FUNCTIONS ====================
    /**
     * @dev Buy tokens with ETH
     */
    function buyTokensETH()
        external
        payable
        nonReentrant
        whenNotPaused
        onlyWhitelisted
        validRound
        notFinalized
        rateLimited
    {
        require(msg.value > 0, "Invalid ETH amount");

        uint256 usdAmount = _convertToUSD(msg.value, PaymentMethod.ETH);
        _validatePurchase(usdAmount);

        uint256 tokenAmount = _calculateTokenAmount(usdAmount);
        _processPurchase(msg.sender, tokenAmount, usdAmount);

        emit TokensPurchased(
            msg.sender,
            tokenAmount,
            roundConfigs[currentRound].price,
            PaymentMethod.ETH,
            currentRound,
            block.timestamp
        );
    }

    /**
     * @dev Buy tokens with USDT
     * @param usdtAmount Amount of USDT to spend (6 decimals)
     */
    function buyTokensUSDT(uint256 usdtAmount)
        external
        nonReentrant
        whenNotPaused
        onlyWhitelisted
        validRound
        notFinalized
        rateLimited
    {
        require(usdtAmount > 0, "Invalid USDT amount");

        uint256 usdAmount = usdtAmount; // USDT is already in 6 decimals
        _validatePurchase(usdAmount);

        usdtToken.safeTransferFrom(msg.sender, address(this), usdtAmount);

        uint256 tokenAmount = _calculateTokenAmount(usdAmount);
        _processPurchase(msg.sender, tokenAmount, usdAmount);

        emit TokensPurchased(
            msg.sender,
            tokenAmount,
            roundConfigs[currentRound].price,
            PaymentMethod.USDT,
            currentRound,
            block.timestamp
        );
    }

    /**
     * @dev Buy tokens with USDC
     * @param usdcAmount Amount of USDC to spend (6 decimals)
     */
    function buyTokensUSDC(uint256 usdcAmount)
        external
        nonReentrant
        whenNotPaused
        onlyWhitelisted
        validRound
        notFinalized
        rateLimited
    {
        require(usdcAmount > 0, "Invalid USDC amount");

        uint256 usdAmount = usdcAmount; // USDC is already in 6 decimals
        _validatePurchase(usdAmount);

        usdcToken.safeTransferFrom(msg.sender, address(this), usdcAmount);

        uint256 tokenAmount = _calculateTokenAmount(usdAmount);
        _processPurchase(msg.sender, tokenAmount, usdAmount);

        emit TokensPurchased(
            msg.sender,
            tokenAmount,
            roundConfigs[currentRound].price,
            PaymentMethod.USDC,
            currentRound,
            block.timestamp
        );
    }

    // ==================== INTERNAL FUNCTIONS ====================
    function _validatePurchase(uint256 usdAmount) private view {
        require(usdAmount <= MAX_TRANSACTION_USD * 10**PRICE_DECIMALS, "Exceeds max transaction");

        if (usdAmount > KYC_THRESHOLD_USD * 10**PRICE_DECIMALS) {
            require(kycVerified[msg.sender], "KYC required");
        }

        RoundConfig memory config = roundConfigs[currentRound];
        uint256 tokenAmount = _calculateTokenAmount(usdAmount);
        require(config.sold + tokenAmount <= config.allocation, "Exceeds round allocation");
        require(totalRaised + usdAmount <= hardCap, "Exceeds hard cap");
    }

    function _calculateTokenAmount(uint256 usdAmount) private view returns (uint256) {
        RoundConfig memory config = roundConfigs[currentRound];

        // Calculate base token amount
        uint256 baseAmount = usdAmount.mul(10**18).div(config.price);

        // Add bonus
        uint256 bonusAmount = baseAmount.mul(config.bonus).div(100);

        return baseAmount.add(bonusAmount);
    }

    function _processPurchase(address buyer, uint256 tokenAmount, uint256 usdAmount) private {
        RoundConfig storage config = roundConfigs[currentRound];

        // Update state
        config.sold = config.sold.add(tokenAmount);
        totalRaised = totalRaised.add(usdAmount);
        totalInvestedUSD[buyer] = totalInvestedUSD[buyer].add(usdAmount);
        lastPurchaseTime[buyer] = block.timestamp;

        // Create purchase record
        purchases[buyer].push(Purchase({
            amount: tokenAmount,
            claimed: 0,
            purchaseTime: block.timestamp,
            round: currentRound,
            exists: true
        }));

        // Setup vesting
        _setupVesting(buyer, tokenAmount, config);

        // Check soft cap
        if (!softCapReached && totalRaised >= softCap) {
            softCapReached = true;
            emit SoftCapReached(totalRaised, block.timestamp);
        }
    }

    function _setupVesting(
        address buyer,
        uint256 amount,
        RoundConfig memory config
    ) private {
        if (vestingSchedules[buyer].totalAmount == 0) {
            vestingSchedules[buyer] = VestingSchedule({
                totalAmount: amount,
                releasedAmount: 0,
                startTime: block.timestamp,
                cliff: config.vestingCliff,
                duration: config.vestingDuration,
                immediateRelease: config.immediateRelease
            });
        } else {
            vestingSchedules[buyer].totalAmount = vestingSchedules[buyer].totalAmount.add(amount);
        }
    }

    function _convertToUSD(uint256 amount, PaymentMethod method) private view returns (uint256) {
        uint256 price = priceFeeds[method];
        require(price > 0, "Price feed not set");

        if (method == PaymentMethod.ETH) {
            // ETH has 18 decimals, convert to USD with 6 decimals
            return amount.mul(price).div(10**18);
        }

        return amount;
    }

    // ==================== CLAIM FUNCTIONS ====================
    /**
     * @dev Claim vested tokens
     */
    function claimTokens() external nonReentrant whenNotPaused {
        require(presaleFinalized, "Presale not finalized");

        VestingSchedule storage schedule = vestingSchedules[msg.sender];
        require(schedule.totalAmount > 0, "No tokens to claim");

        uint256 claimable = _calculateClaimable(msg.sender);
        require(claimable > 0, "No tokens available");

        schedule.releasedAmount = schedule.releasedAmount.add(claimable);

        hypeToken.safeTransfer(msg.sender, claimable);

        emit TokensClaimed(msg.sender, claimable, block.timestamp);
    }

    function _calculateClaimable(address user) private view returns (uint256) {
        VestingSchedule memory schedule = vestingSchedules[user];

        if (schedule.totalAmount == 0) {
            return 0;
        }

        // Calculate immediate release
        uint256 immediateAmount = schedule.totalAmount.mul(schedule.immediateRelease).div(100);

        // If no vesting, return all minus what's already released
        if (schedule.duration == 0) {
            return schedule.totalAmount.sub(schedule.releasedAmount);
        }

        // Check cliff
        if (block.timestamp < schedule.startTime.add(schedule.cliff)) {
            if (schedule.releasedAmount < immediateAmount) {
                return immediateAmount.sub(schedule.releasedAmount);
            }
            return 0;
        }

        // Calculate vested amount (linear vesting)
        uint256 timeElapsed = block.timestamp.sub(schedule.startTime);
        uint256 vestedAmount;

        if (timeElapsed >= schedule.duration) {
            vestedAmount = schedule.totalAmount;
        } else {
            uint256 vestingAmount = schedule.totalAmount.sub(immediateAmount);
            uint256 vestedPortion = vestingAmount.mul(timeElapsed).div(schedule.duration);
            vestedAmount = immediateAmount.add(vestedPortion);
        }

        return vestedAmount.sub(schedule.releasedAmount);
    }

    // ==================== REFUND FUNCTIONS ====================
    /**
     * @dev Refund if soft cap not reached
     */
    function refund() external nonReentrant {
        require(presaleFinalized, "Presale not finalized");
        require(!softCapReached, "Soft cap reached");
        require(purchases[msg.sender].length > 0, "No purchases");

        uint256 refundAmount = totalInvestedUSD[msg.sender];
        require(refundAmount > 0, "Already refunded");

        totalInvestedUSD[msg.sender] = 0;

        // Delete purchases
        delete purchases[msg.sender];
        delete vestingSchedules[msg.sender];

        // Transfer refund (simplified - in production, track payment method)
        payable(msg.sender).transfer(refundAmount);

        emit RefundIssued(msg.sender, refundAmount, block.timestamp);
    }

    // ==================== ADMIN FUNCTIONS ====================
    /**
     * @dev Set round parameters (requires multisig)
     */
    function setRoundParams(
        Round _round,
        uint256 _price,
        uint256 _bonus,
        uint256 _startTime,
        uint256 _endTime
    ) external onlyOwner {
        bytes32 action = keccak256(abi.encodePacked("setRoundParams", _round, _price, _bonus));
        require(_requireMultisig(action), "Multisig required");

        RoundConfig storage config = roundConfigs[_round];
        config.price = _price;
        config.bonus = _bonus;
        config.startTime = _startTime;
        config.endTime = _endTime;
    }

    /**
     * @dev Change current round
     */
    function setCurrentRound(Round _round) external onlyOwner {
        Round oldRound = currentRound;
        currentRound = _round;
        emit RoundChanged(oldRound, _round, block.timestamp);
    }

    /**
     * @dev Add/remove from whitelist
     */
    function whitelistAddress(address user, bool status) external onlyOwner {
        whitelist[user] = status;
        emit WhitelistUpdated(user, status);
    }

    /**
     * @dev Batch whitelist
     */
    function whitelistAddressBatch(address[] calldata users, bool status) external onlyOwner {
        for (uint256 i = 0; i < users.length; i++) {
            whitelist[users[i]] = status;
            emit WhitelistUpdated(users[i], status);
        }
    }

    /**
     * @dev Verify KYC
     */
    function verifyKYC(address user, bool status) external onlyOwner {
        kycVerified[user] = status;
        emit KYCVerified(user, status);
    }

    /**
     * @dev Update price feeds
     */
    function updatePriceFeed(PaymentMethod method, uint256 price) external onlyOwner {
        priceFeeds[method] = price;
        emit PriceFeedUpdated(method, price);
    }

    /**
     * @dev Finalize presale
     */
    function finalizePresale() external onlyOwner {
        require(!presaleFinalized, "Already finalized");
        presaleFinalized = true;
        emit PresaleFinalized(totalRaised, block.timestamp);
    }

    /**
     * @dev Emergency withdraw (requires multisig and time lock)
     */
    function emergencyWithdraw(uint256 amount) external onlyOwner nonReentrant {
        require(block.timestamp >= withdrawLockTime, "Time lock active");

        bytes32 action = keccak256(abi.encodePacked("emergencyWithdraw", amount));
        require(_requireMultisig(action), "Multisig required");

        payable(owner()).transfer(amount);
        emit EmergencyWithdraw(owner(), amount, block.timestamp);
    }

    /**
     * @dev Pause contract
     */
    function pause() external onlyOwner {
        _pause();
    }

    /**
     * @dev Unpause contract
     */
    function unpause() external onlyOwner {
        _unpause();
    }

    // ==================== MULTISIG ====================
    function _requireMultisig(bytes32 action) private returns (bool) {
        if (!hasApproved[action][msg.sender]) {
            hasApproved[action][msg.sender] = true;
            multisigApprovals[action]++;
            emit MultisigApproval(action, msg.sender, multisigApprovals[action]);
        }

        return multisigApprovals[action] >= MULTISIG_REQUIRED;
    }

    function approveAction(bytes32 action) external {
        bool isOwner = false;
        for (uint256 i = 0; i < 3; i++) {
            if (multisigOwners[i] == msg.sender) {
                isOwner = true;
                break;
            }
        }
        require(isOwner, "Not multisig owner");

        if (!hasApproved[action][msg.sender]) {
            hasApproved[action][msg.sender] = true;
            multisigApprovals[action]++;
            emit MultisigApproval(action, msg.sender, multisigApprovals[action]);
        }
    }

    // ==================== VIEW FUNCTIONS ====================
    function getClaimableAmount(address user) external view returns (uint256) {
        return _calculateClaimable(user);
    }

    function getPurchaseCount(address user) external view returns (uint256) {
        return purchases[user].length;
    }

    function getPurchase(address user, uint256 index) external view returns (Purchase memory) {
        return purchases[user][index];
    }

    function getRoundConfig(Round _round) external view returns (RoundConfig memory) {
        return roundConfigs[_round];
    }

    function getVestingSchedule(address user) external view returns (VestingSchedule memory) {
        return vestingSchedules[user];
    }

    // ==================== FALLBACK ====================
    receive() external payable {
        revert("Use buyTokensETH()");
    }
}
