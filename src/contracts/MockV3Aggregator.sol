// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title MockV3Aggregator
 * @notice Mock Chainlink price feed for testing
 * @dev Simulates Chainlink V3 Aggregator Interface
 */
contract MockV3Aggregator {
    uint8 public decimals;
    int256 public answer;
    uint256 public updatedAt;
    uint256 public startedAt;
    uint80 public roundId;

    event AnswerUpdated(int256 indexed current, uint256 indexed roundId, uint256 updatedAt);

    constructor(uint8 _decimals, int256 _initialAnswer) {
        decimals = _decimals;
        answer = _initialAnswer;
        updatedAt = block.timestamp;
        startedAt = block.timestamp;
        roundId = 1;
    }

    /**
     * @notice Update the mock price
     * @param _answer New price value
     */
    function updateAnswer(int256 _answer) external {
        answer = _answer;
        updatedAt = block.timestamp;
        roundId++;

        emit AnswerUpdated(_answer, roundId, updatedAt);
    }

    /**
     * @notice Get latest round data
     * @return roundId_ Round ID
     * @return answer_ Price value
     * @return startedAt_ Round start timestamp
     * @return updatedAt_ Last update timestamp
     * @return answeredInRound_ Round where answer was computed
     */
    function latestRoundData()
        external
        view
        returns (
            uint80 roundId_,
            int256 answer_,
            uint256 startedAt_,
            uint256 updatedAt_,
            uint80 answeredInRound_
        )
    {
        return (roundId, answer, startedAt, updatedAt, roundId);
    }

    /**
     * @notice Simulate stale price by setting old timestamp
     * @param _secondsAgo How many seconds ago to set timestamp
     */
    function setStalePrice(uint256 _secondsAgo) external {
        updatedAt = block.timestamp - _secondsAgo;
    }
}
