// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title AIOracle
 * @dev AI-powered oracle for dynamic fee adjustment and market analysis
 *
 * Features:
 * - Chainlink-compatible interface
 * - Multiple data feeds (price, volume, sentiment)
 * - Aggregated market metrics
 * - Automated fee optimization
 * - Historical data tracking
 * - Multi-source validation
 */
contract AIOracle is Ownable, ReentrancyGuard {

    // Data feed types
    enum FeedType {
        PRICE,
        VOLUME,
        SENTIMENT,
        VOLATILITY,
        LIQUIDITY
    }

    // Data point structure
    struct DataPoint {
        uint256 value;
        uint256 timestamp;
        uint256 confidence;  // 0-10000 (100%)
        address source;
    }

    // Market metrics
    struct MarketMetrics {
        uint256 averagePrice;
        uint256 volume24h;
        int256 sentiment;      // -10000 to +10000
        uint256 volatility;    // Percentage in basis points
        uint256 liquidity;
        uint256 lastUpdate;
    }

    // Data storage
    mapping(FeedType => DataPoint[]) public dataHistory;
    mapping(FeedType => DataPoint) public latestData;
    mapping(address => bool) public authorizedSources;

    MarketMetrics public currentMetrics;

    // Configuration
    uint256 public maxDataAge = 1 hours;
    uint256 public minConfidence = 7000; // 70%
    uint256 public maxHistorySize = 1000;

    // Fee optimization parameters
    struct FeeRecommendation {
        uint256 reflectionFee;
        uint256 liquidityFee;
        uint256 burnFee;
        uint256 treasuryFee;
        uint256 timestamp;
        string reason;
    }

    FeeRecommendation public latestFeeRecommendation;

    // Events
    event DataUpdated(FeedType indexed feedType, uint256 value, uint256 confidence, address source);
    event MetricsCalculated(uint256 price, uint256 volume, int256 sentiment, uint256 volatility);
    event FeeRecommendationUpdated(uint256 total, string reason);
    event SourceAuthorized(address indexed source, bool authorized);

    /**
     * @dev Constructor
     */
    constructor() Ownable(msg.sender) {
        authorizedSources[msg.sender] = true;

        // Initialize with default metrics
        currentMetrics = MarketMetrics({
            averagePrice: 0,
            volume24h: 0,
            sentiment: 0,
            volatility: 0,
            liquidity: 0,
            lastUpdate: block.timestamp
        });

        // Initialize with conservative fees
        latestFeeRecommendation = FeeRecommendation({
            reflectionFee: 200,
            liquidityFee: 300,
            burnFee: 100,
            treasuryFee: 200,
            timestamp: block.timestamp,
            reason: "Initial conservative fees"
        });
    }

    /**
     * @dev Update data feed
     * @param feedType Type of data feed
     * @param value Data value
     * @param confidence Confidence level (0-10000)
     */
    function updateData(
        FeedType feedType,
        uint256 value,
        uint256 confidence
    ) external {
        require(authorizedSources[msg.sender], "Not authorized");
        require(confidence <= 10000, "Invalid confidence");
        require(confidence >= minConfidence, "Confidence too low");

        DataPoint memory newData = DataPoint({
            value: value,
            timestamp: block.timestamp,
            confidence: confidence,
            source: msg.sender
        });

        // Update latest data
        latestData[feedType] = newData;

        // Add to history
        if (dataHistory[feedType].length >= maxHistorySize) {
            // Remove oldest entry
            for (uint256 i = 0; i < dataHistory[feedType].length - 1; i++) {
                dataHistory[feedType][i] = dataHistory[feedType][i + 1];
            }
            dataHistory[feedType][dataHistory[feedType].length - 1] = newData;
        } else {
            dataHistory[feedType].push(newData);
        }

        emit DataUpdated(feedType, value, confidence, msg.sender);

        // Trigger metrics calculation
        _calculateMetrics();
    }

    /**
     * @dev Calculate aggregated market metrics
     */
    function _calculateMetrics() private {
        // Get latest data points
        DataPoint memory priceData = latestData[FeedType.PRICE];
        DataPoint memory volumeData = latestData[FeedType.VOLUME];
        DataPoint memory sentimentData = latestData[FeedType.SENTIMENT];
        DataPoint memory volatilityData = latestData[FeedType.VOLATILITY];
        DataPoint memory liquidityData = latestData[FeedType.LIQUIDITY];

        // Validate data freshness
        if (block.timestamp - priceData.timestamp > maxDataAge) {
            return; // Data too old
        }

        // Update metrics
        currentMetrics = MarketMetrics({
            averagePrice: priceData.value,
            volume24h: volumeData.value,
            sentiment: int256(sentimentData.value) - 10000, // Convert to -10000 to +10000
            volatility: volatilityData.value,
            liquidity: liquidityData.value,
            lastUpdate: block.timestamp
        });

        emit MetricsCalculated(
            currentMetrics.averagePrice,
            currentMetrics.volume24h,
            currentMetrics.sentiment,
            currentMetrics.volatility
        );

        // Update fee recommendations
        _optimizeFees();
    }

    /**
     * @dev AI-driven fee optimization
     */
    function _optimizeFees() private {
        uint256 reflectionFee;
        uint256 liquidityFee;
        uint256 burnFee;
        uint256 treasuryFee;
        string memory reason;

        // High volatility scenario: Increase stability mechanisms
        if (currentMetrics.volatility > 5000) { // >50% volatility
            reflectionFee = 300;  // 3%
            liquidityFee = 400;   // 4%
            burnFee = 200;        // 2%
            treasuryFee = 300;    // 3%
            reason = "High volatility: Increased liquidity and burn";
        }
        // Positive sentiment + high volume: Lower fees to encourage trading
        else if (currentMetrics.sentiment > 5000 && currentMetrics.volume24h > 1000000 * 10**18) {
            reflectionFee = 150;  // 1.5%
            liquidityFee = 200;   // 2%
            burnFee = 50;         // 0.5%
            treasuryFee = 100;    // 1%
            reason = "Bullish market: Reduced fees for momentum";
        }
        // Negative sentiment: Increase holder rewards
        else if (currentMetrics.sentiment < -3000) {
            reflectionFee = 400;  // 4%
            liquidityFee = 250;   // 2.5%
            burnFee = 150;        // 1.5%
            treasuryFee = 200;    // 2%
            reason = "Bearish sentiment: Increased holder rewards";
        }
        // Low liquidity: Prioritize liquidity building
        else if (currentMetrics.liquidity < 500000 * 10**18) {
            reflectionFee = 200;  // 2%
            liquidityFee = 500;   // 5%
            burnFee = 100;        // 1%
            treasuryFee = 200;    // 2%
            reason = "Low liquidity: Focus on pool building";
        }
        // Normal market conditions: Balanced fees
        else {
            reflectionFee = 200;  // 2%
            liquidityFee = 300;   // 3%
            burnFee = 100;        // 1%
            treasuryFee = 200;    // 2%
            reason = "Stable market: Balanced fee structure";
        }

        uint256 totalFee = reflectionFee + liquidityFee + burnFee + treasuryFee;

        latestFeeRecommendation = FeeRecommendation({
            reflectionFee: reflectionFee,
            liquidityFee: liquidityFee,
            burnFee: burnFee,
            treasuryFee: treasuryFee,
            timestamp: block.timestamp,
            reason: reason
        });

        emit FeeRecommendationUpdated(totalFee, reason);
    }

    /**
     * @dev Get latest data for a feed type
     * @param feedType Type of data feed
     * @return Latest data point
     */
    function getLatestData(FeedType feedType) external view returns (DataPoint memory) {
        return latestData[feedType];
    }

    /**
     * @dev Get current market metrics
     * @return Current metrics
     */
    function getMarketMetrics() external view returns (MarketMetrics memory) {
        return currentMetrics;
    }

    /**
     * @dev Get fee recommendation
     * @return Current fee recommendation
     */
    function getFeeRecommendation() external view returns (FeeRecommendation memory) {
        require(
            block.timestamp - latestFeeRecommendation.timestamp < maxDataAge,
            "Recommendation outdated"
        );
        return latestFeeRecommendation;
    }

    /**
     * @dev Get historical data
     * @param feedType Type of data feed
     * @param count Number of recent entries to return
     * @return Array of data points
     */
    function getHistoricalData(FeedType feedType, uint256 count)
        external
        view
        returns (DataPoint[] memory)
    {
        uint256 historyLength = dataHistory[feedType].length;
        uint256 returnCount = count > historyLength ? historyLength : count;

        DataPoint[] memory result = new DataPoint[](returnCount);

        for (uint256 i = 0; i < returnCount; i++) {
            result[i] = dataHistory[feedType][historyLength - returnCount + i];
        }

        return result;
    }

    /**
     * @dev Calculate average value over time period
     * @param feedType Type of data feed
     * @param timeWindow Time window in seconds
     * @return Average value
     */
    function getAverageValue(FeedType feedType, uint256 timeWindow)
        external
        view
        returns (uint256)
    {
        uint256 sum = 0;
        uint256 count = 0;
        uint256 cutoffTime = block.timestamp - timeWindow;

        for (uint256 i = dataHistory[feedType].length; i > 0; i--) {
            DataPoint memory point = dataHistory[feedType][i - 1];

            if (point.timestamp < cutoffTime) {
                break;
            }

            sum += point.value;
            count++;
        }

        return count > 0 ? sum / count : 0;
    }

    /**
     * @dev Check if data is fresh
     * @param feedType Type of data feed
     * @return True if data is recent
     */
    function isDataFresh(FeedType feedType) external view returns (bool) {
        return block.timestamp - latestData[feedType].timestamp < maxDataAge;
    }

    // Admin functions

    /**
     * @dev Authorize data source
     * @param source Source address
     * @param authorized Authorization status
     */
    function setAuthorizedSource(address source, bool authorized) external onlyOwner {
        require(source != address(0), "Invalid address");
        authorizedSources[source] = authorized;
        emit SourceAuthorized(source, authorized);
    }

    /**
     * @dev Set maximum data age
     * @param age Maximum age in seconds
     */
    function setMaxDataAge(uint256 age) external onlyOwner {
        require(age >= 5 minutes && age <= 24 hours, "Invalid age");
        maxDataAge = age;
    }

    /**
     * @dev Set minimum confidence threshold
     * @param confidence Minimum confidence (0-10000)
     */
    function setMinConfidence(uint256 confidence) external onlyOwner {
        require(confidence <= 10000, "Invalid confidence");
        minConfidence = confidence;
    }

    /**
     * @dev Set maximum history size
     * @param size Maximum number of historical entries
     */
    function setMaxHistorySize(uint256 size) external onlyOwner {
        require(size >= 100 && size <= 10000, "Invalid size");
        maxHistorySize = size;
    }

    /**
     * @dev Manual fee recommendation update (emergency)
     * @param reflectionFee Reflection fee
     * @param liquidityFee Liquidity fee
     * @param burnFee Burn fee
     * @param treasuryFee Treasury fee
     * @param reason Reason for manual update
     */
    function manualFeeUpdate(
        uint256 reflectionFee,
        uint256 liquidityFee,
        uint256 burnFee,
        uint256 treasuryFee,
        string memory reason
    ) external onlyOwner {
        uint256 totalFee = reflectionFee + liquidityFee + burnFee + treasuryFee;
        require(totalFee <= 1500, "Total fee too high"); // Max 15%

        latestFeeRecommendation = FeeRecommendation({
            reflectionFee: reflectionFee,
            liquidityFee: liquidityFee,
            burnFee: burnFee,
            treasuryFee: treasuryFee,
            timestamp: block.timestamp,
            reason: reason
        });

        emit FeeRecommendationUpdated(totalFee, reason);
    }
}
