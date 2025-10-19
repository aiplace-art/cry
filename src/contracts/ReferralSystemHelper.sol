// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title ReferralSystemHelper
 * @notice Helper functions for the enhanced referral system
 */
library ReferralSystemHelper {

    /// @notice Level constants
    uint256 internal constant BRONZE_THRESHOLD = 5;
    uint256 internal constant SILVER_THRESHOLD = 20;
    uint256 internal constant GOLD_THRESHOLD = 50;
    uint256 internal constant PLATINUM_THRESHOLD = 100;

    /// @notice Bonus multipliers (in basis points: 10000 = 1x)
    uint256 internal constant BRONZE_MULTIPLIER = 10000; // 1x
    uint256 internal constant SILVER_MULTIPLIER = 12500; // 1.25x
    uint256 internal constant GOLD_MULTIPLIER = 15000; // 1.5x
    uint256 internal constant PLATINUM_MULTIPLIER = 20000; // 2x
    uint256 internal constant BASIS_POINTS = 10000;

    /**
     * @notice Calculate the user's current level based on total referrals
     * @param totalReferrals Number of referrals
     * @return level 0=Bronze, 1=Silver, 2=Gold, 3=Platinum
     */
    function calculateLevel(uint256 totalReferrals) internal pure returns (uint8 level) {
        if (totalReferrals >= PLATINUM_THRESHOLD) return 3;
        if (totalReferrals >= GOLD_THRESHOLD) return 2;
        if (totalReferrals >= SILVER_THRESHOLD) return 1;
        return 0; // Bronze
    }

    /**
     * @notice Get bonus multiplier for a given level
     * @param level User's level (0-3)
     * @return multiplier Bonus multiplier in basis points
     */
    function getBonusMultiplier(uint8 level) internal pure returns (uint256 multiplier) {
        if (level == 3) return PLATINUM_MULTIPLIER;
        if (level == 2) return GOLD_MULTIPLIER;
        if (level == 1) return SILVER_MULTIPLIER;
        return BRONZE_MULTIPLIER;
    }

    /**
     * @notice Apply bonus multiplier to a reward amount
     * @param baseReward Base reward amount
     * @param level User's level
     * @return finalReward Reward with multiplier applied
     */
    function applyBonusMultiplier(uint256 baseReward, uint8 level) internal pure returns (uint256 finalReward) {
        uint256 multiplier = getBonusMultiplier(level);
        return (baseReward * multiplier) / BASIS_POINTS;
    }

    /**
     * @notice Check which milestones a user has reached but not claimed
     * @param totalReferrals Current total referrals
     * @param claimedMask Bitmask of claimed milestones
     * @return milestones Array of milestone indices to claim
     * @return totalReward Total reward amount for unclaimed milestones
     */
    function getUnclaimedMilestones(
        uint256 totalReferrals,
        uint256 claimedMask
    ) internal pure returns (
        uint256[] memory milestones,
        uint256 totalReward
    ) {
        uint256[5] memory thresholds = [uint256(10), 25, 50, 100, 250];
        uint256[5] memory rewards = [uint256(50), 150, 350, 800, 2500];

        uint256 count = 0;
        uint256 tempReward = 0;

        // First pass: count unclaimed milestones
        for (uint256 i = 0; i < 5; i++) {
            if (totalReferrals >= thresholds[i] && (claimedMask & (1 << i)) == 0) {
                count++;
                tempReward += rewards[i];
            }
        }

        // Second pass: populate array
        milestones = new uint256[](count);
        uint256 index = 0;
        for (uint256 i = 0; i < 5; i++) {
            if (totalReferrals >= thresholds[i] && (claimedMask & (1 << i)) == 0) {
                milestones[index] = i;
                index++;
            }
        }

        totalReward = tempReward;
    }

    /**
     * @notice Get level name as string
     * @param level Level index (0-3)
     * @return name Level name
     */
    function getLevelName(uint8 level) internal pure returns (string memory name) {
        if (level == 3) return "Platinum";
        if (level == 2) return "Gold";
        if (level == 1) return "Silver";
        return "Bronze";
    }

    /**
     * @notice Calculate next level threshold
     * @param currentLevel Current level (0-3)
     * @return threshold Number of referrals needed for next level, 0 if max level
     */
    function getNextLevelThreshold(uint8 currentLevel) internal pure returns (uint256 threshold) {
        if (currentLevel == 0) return SILVER_THRESHOLD;
        if (currentLevel == 1) return GOLD_THRESHOLD;
        if (currentLevel == 2) return PLATINUM_THRESHOLD;
        return 0; // Max level reached
    }
}
