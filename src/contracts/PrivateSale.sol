// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @dev Chainlink Price Feed interface for BNB/USD
 */
interface AggregatorV3Interface {
    function latestRoundData()
        external
        view
        returns (
            uint80 roundId,
            int256 answer,
            uint256 startedAt,
            uint256 updatedAt,
            uint80 answeredInRound
        );

    function decimals() external view returns (uint8);
}

/**
 * @title HypeAI Private Sale Contract
 * @notice Founding Members Private Sale with VIP benefits
 * @dev Supports BNB and USDT payments, automatic token distribution
 */
contract HypeAIPrivateSale is Ownable, ReentrancyGuard, Pausable {
    // Token being sold
    IERC20 public hypeaiToken;

    // USDT token for payments (BSC: 0x55d398326f99059fF775485246999027B3197955)
    IERC20 public usdtToken;

    // Chainlink BNB/USD Price Feed
    // BSC Mainnet: 0x0567F2323251f0Aab15c8dFb1967E4e8A7D42aeE
    // BSC Testnet: 0x2514895c72f50D8bd4B4F9b1110F0D6bD2c97526
    AggregatorV3Interface public bnbPriceFeed;

    // Sale parameters (10B tokenomics: prices ÷10, amounts ×10)
    uint256 public constant TOKEN_PRICE = 8 * 10**13; // $0.00008 in wei (assuming BNB = $600)
    uint256 public constant MIN_PURCHASE_USD = 40; // $40 minimum
    uint256 public constant MAX_PURCHASE_USD = 800; // $800 maximum
    uint256 public constant HARD_CAP_USD = 80000; // $80,000 hard cap
    uint256 public constant BONUS_PERCENTAGE = 10; // 10% bonus tokens

    uint256 public constant TOKENS_FOR_SALE = 1_100_000_000 * 10**18; // 1.1B tokens (includes 10% bonus buffer)
    uint256 public constant MAX_FOUNDING_MEMBERS = 500;

    // Sale state
    uint256 public totalTokensSold;
    uint256 public totalUSDRaised;
    uint256 public foundingMembersCount;
    uint256 public saleStartTime;
    uint256 public saleEndTime;
    bool public saleFinalized;

    // Whitelist for private sale
    mapping(address => bool) public whitelist;
    mapping(address => uint256) public contributions; // In USD
    mapping(address => uint256) public tokensPurchased;
    mapping(address => bool) public isFoundingMember;

    // Events
    event WhitelistUpdated(address indexed user, bool status);
    event TokensPurchased(
        address indexed buyer,
        uint256 usdAmount,
        uint256 tokensAmount,
        uint256 bonusTokens,
        bool paymentMethod // true = BNB, false = USDT
    );
    event SaleFinalized(uint256 totalRaised, uint256 totalTokensSold);
    event TokensWithdrawn(address indexed recipient, uint256 amount);
    event FundsWithdrawn(address indexed recipient, uint256 bnbAmount, uint256 usdtAmount);

    constructor(
        address _hypeaiToken,
        address _usdtToken,
        address _bnbPriceFeed,
        uint256 _saleStartTime,
        uint256 _saleDuration
    ) Ownable(msg.sender) {
        require(_hypeaiToken != address(0), "Invalid token address");
        require(_usdtToken != address(0), "Invalid USDT address");
        require(_bnbPriceFeed != address(0), "Invalid price feed address");
        // Allow immediate start for testing
        require(_saleStartTime > 0, "Invalid start time");

        hypeaiToken = IERC20(_hypeaiToken);
        usdtToken = IERC20(_usdtToken);
        bnbPriceFeed = AggregatorV3Interface(_bnbPriceFeed);
        saleStartTime = _saleStartTime;
        saleEndTime = _saleStartTime + _saleDuration;
    }

    /**
     * @notice Add addresses to whitelist
     * @param _addresses Array of addresses to whitelist
     */
    function addToWhitelist(address[] calldata _addresses) external onlyOwner {
        for (uint256 i = 0; i < _addresses.length; i++) {
            whitelist[_addresses[i]] = true;
            emit WhitelistUpdated(_addresses[i], true);
        }
    }

    /**
     * @notice Remove addresses from whitelist
     * @param _addresses Array of addresses to remove
     */
    function removeFromWhitelist(address[] calldata _addresses) external onlyOwner {
        for (uint256 i = 0; i < _addresses.length; i++) {
            whitelist[_addresses[i]] = false;
            emit WhitelistUpdated(_addresses[i], false);
        }
    }

    /**
     * @notice Purchase tokens with BNB (uses Chainlink oracle for real-time BNB price)
     */
    function purchaseWithBNB() external payable nonReentrant whenNotPaused {
        require(block.timestamp >= saleStartTime, "Sale not started");
        require(block.timestamp <= saleEndTime, "Sale ended");
        require(whitelist[msg.sender], "Not whitelisted");
        require(!saleFinalized, "Sale finalized");
        require(foundingMembersCount < MAX_FOUNDING_MEMBERS, "Max members reached");

        // Get real-time BNB price from Chainlink oracle
        uint256 bnbPriceUSD = getBNBPrice();

        // Calculate USD value: (BNB amount × BNB price) / 1e18
        uint256 usdValue = (msg.value * bnbPriceUSD) / 10**18;

        require(usdValue >= MIN_PURCHASE_USD, "Below minimum purchase");
        require(
            contributions[msg.sender] + usdValue <= MAX_PURCHASE_USD,
            "Exceeds maximum purchase"
        );
        require(
            totalUSDRaised + usdValue <= HARD_CAP_USD,
            "Exceeds hard cap"
        );

        _processPurchase(msg.sender, usdValue, true);
    }

    /**
     * @notice Purchase tokens with USDT
     * @param _usdtAmount Amount of USDT to spend (in USDT decimals)
     */
    function purchaseWithUSDT(uint256 _usdtAmount) external nonReentrant whenNotPaused {
        require(block.timestamp >= saleStartTime, "Sale not started");
        require(block.timestamp <= saleEndTime, "Sale ended");
        require(whitelist[msg.sender], "Not whitelisted");
        require(!saleFinalized, "Sale finalized");
        require(foundingMembersCount < MAX_FOUNDING_MEMBERS, "Max members reached");

        // USDT has 18 decimals on BSC
        uint256 usdValue = _usdtAmount / 10**18;

        require(usdValue >= MIN_PURCHASE_USD, "Below minimum purchase");
        require(
            contributions[msg.sender] + usdValue <= MAX_PURCHASE_USD,
            "Exceeds maximum purchase"
        );
        require(
            totalUSDRaised + usdValue <= HARD_CAP_USD,
            "Exceeds hard cap"
        );

        // Transfer USDT from buyer
        require(
            usdtToken.transferFrom(msg.sender, address(this), _usdtAmount),
            "USDT transfer failed"
        );

        _processPurchase(msg.sender, usdValue, false);
    }

    /**
     * @notice Internal function to process purchase
     * @param _buyer Address of buyer
     * @param _usdValue USD value of purchase
     * @param _isBNB True if payment is BNB, false if USDT
     */
    function _processPurchase(
        address _buyer,
        uint256 _usdValue,
        bool _isBNB
    ) internal {
        // Calculate tokens (1 HYPEAI = $0.00008) - 10B tokenomics
        // tokens = usdValue / 0.00008 = usdValue * 12500
        uint256 baseTokens = _usdValue * 12500 * 10**18;

        // Calculate bonus (10%)
        uint256 bonusTokens = (baseTokens * BONUS_PERCENTAGE) / 100;
        uint256 totalTokens = baseTokens + bonusTokens;

        require(
            totalTokensSold + totalTokens <= TOKENS_FOR_SALE,
            "Not enough tokens left"
        );

        // Update state
        contributions[_buyer] += _usdValue;
        tokensPurchased[_buyer] += totalTokens;
        totalUSDRaised += _usdValue;
        totalTokensSold += totalTokens;

        // Mark as Founding Member if first purchase
        if (!isFoundingMember[_buyer]) {
            isFoundingMember[_buyer] = true;
            foundingMembersCount++;
        }

        // Transfer tokens immediately
        require(
            hypeaiToken.transfer(_buyer, totalTokens),
            "Token transfer failed"
        );

        emit TokensPurchased(
            _buyer,
            _usdValue,
            baseTokens,
            bonusTokens,
            _isBNB
        );
    }

    /**
     * @notice Check if address is eligible for purchase
     * @param _address Address to check
     * @return eligible True if can purchase
     * @return remainingAllocation Remaining USD allocation
     * @return tokensWouldReceive Tokens they would receive for their remaining allocation
     */
    function checkEligibility(address _address)
        external
        view
        returns (
            bool eligible,
            uint256 remainingAllocation,
            uint256 tokensWouldReceive
        )
    {
        if (!whitelist[_address]) {
            return (false, 0, 0);
        }

        if (block.timestamp < saleStartTime || block.timestamp > saleEndTime) {
            return (false, 0, 0);
        }

        if (saleFinalized) {
            return (false, 0, 0);
        }

        if (foundingMembersCount >= MAX_FOUNDING_MEMBERS && !isFoundingMember[_address]) {
            return (false, 0, 0);
        }

        remainingAllocation = MAX_PURCHASE_USD - contributions[_address];

        if (remainingAllocation == 0) {
            return (false, 0, 0);
        }

        // Calculate tokens with bonus (10B tokenomics: ×10)
        uint256 baseTokens = remainingAllocation * 12500 * 10**18;
        tokensWouldReceive = baseTokens + (baseTokens * BONUS_PERCENTAGE / 100);

        eligible = true;
    }

    /**
     * @notice Get sale statistics
     */
    function getSaleStats()
        external
        view
        returns (
            uint256 _totalUSDRaised,
            uint256 _totalTokensSold,
            uint256 _foundingMembersCount,
            uint256 _remainingTokens,
            uint256 _remainingUSDCap,
            uint256 _timeRemaining,
            bool _isActive
        )
    {
        _totalUSDRaised = totalUSDRaised;
        _totalTokensSold = totalTokensSold;
        _foundingMembersCount = foundingMembersCount;
        _remainingTokens = TOKENS_FOR_SALE - totalTokensSold;
        _remainingUSDCap = HARD_CAP_USD - totalUSDRaised;

        if (block.timestamp < saleEndTime) {
            _timeRemaining = saleEndTime - block.timestamp;
        } else {
            _timeRemaining = 0;
        }

        _isActive = (
            block.timestamp >= saleStartTime &&
            block.timestamp <= saleEndTime &&
            !saleFinalized &&
            totalUSDRaised < HARD_CAP_USD
        );
    }

    /**
     * @notice Finalize sale (can only be called after sale ends)
     */
    function finalizeSale() external onlyOwner {
        require(block.timestamp > saleEndTime || totalUSDRaised >= HARD_CAP_USD, "Sale still active");
        require(!saleFinalized, "Already finalized");

        saleFinalized = true;

        emit SaleFinalized(totalUSDRaised, totalTokensSold);
    }

    /**
     * @notice Withdraw unsold tokens (only after finalization)
     */
    function withdrawUnsoldTokens() external onlyOwner {
        require(saleFinalized, "Sale not finalized");

        uint256 unsoldTokens = TOKENS_FOR_SALE - totalTokensSold;

        if (unsoldTokens > 0) {
            require(
                hypeaiToken.transfer(owner(), unsoldTokens),
                "Token transfer failed"
            );

            emit TokensWithdrawn(owner(), unsoldTokens);
        }
    }

    /**
     * @notice Withdraw raised funds (only after finalization)
     */
    function withdrawFunds() external onlyOwner {
        require(saleFinalized, "Sale not finalized");

        uint256 bnbBalance = address(this).balance;
        uint256 usdtBalance = usdtToken.balanceOf(address(this));

        if (bnbBalance > 0) {
            (bool success, ) = owner().call{value: bnbBalance}("");
            require(success, "BNB transfer failed");
        }

        if (usdtBalance > 0) {
            require(
                usdtToken.transfer(owner(), usdtBalance),
                "USDT transfer failed"
            );
        }

        emit FundsWithdrawn(owner(), bnbBalance, usdtBalance);
    }

    /**
     * @notice Emergency pause
     */
    function pause() external onlyOwner {
        _pause();
    }

    /**
     * @notice Unpause
     */
    function unpause() external onlyOwner {
        _unpause();
    }

    /**
     * @notice Update sale end time (only before sale ends)
     */
    function extendSale(uint256 _newEndTime) external onlyOwner {
        require(_newEndTime > saleEndTime, "Must extend, not shorten");
        require(block.timestamp < saleEndTime, "Sale already ended");

        saleEndTime = _newEndTime;
    }

    /**
     * @notice Get current BNB price in USD from Chainlink oracle
     * @return price BNB price in USD (8 decimals)
     */
    function getBNBPrice() public view returns (uint256) {
        (
            /* uint80 roundId */,
            int256 answer,
            /* uint256 startedAt */,
            uint256 updatedAt,
            /* uint80 answeredInRound */
        ) = bnbPriceFeed.latestRoundData();

        require(answer > 0, "Invalid price from oracle");
        require(updatedAt > 0, "Price data not updated");
        require(block.timestamp - updatedAt < 3600, "Price data stale"); // Must be updated within 1 hour

        // Chainlink returns price with 8 decimals (e.g., 60000000000 = $600.00)
        // We need to scale it to match our calculations
        return uint256(answer) / 10**8; // Convert to USD with 0 decimals (e.g., 600)
    }

    /**
     * @notice Update Chainlink price feed address (emergency only)
     */
    function updatePriceFeed(address _newPriceFeed) external onlyOwner {
        require(_newPriceFeed != address(0), "Invalid price feed address");
        bnbPriceFeed = AggregatorV3Interface(_newPriceFeed);
    }

    /**
     * @notice Accept BNB payments
     */
    receive() external payable {
        revert("Use purchaseWithBNB() function");
    }
}
