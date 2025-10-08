const Stake = require('../models/Stake');
const User = require('../models/User');
const stakingService = require('../services/staking.service');
const { logger } = require('../config/logger');

/**
 * Get available staking pools
 */
const getStakingPools = async (req, res) => {
  try {
    const pools = await stakingService.getAvailablePools();
    res.json({ pools });
  } catch (error) {
    logger.error(`Get staking pools error: ${error.message}`);
    res.status(500).json({ error: 'Failed to fetch staking pools' });
  }
};

/**
 * Create new stake
 */
const createStake = async (req, res) => {
  try {
    const { tokenAddress, amount, duration } = req.validatedBody;
    const userId = req.userId;
    const walletAddress = req.walletAddress;

    const stake = await stakingService.createStake({
      userId,
      walletAddress,
      tokenAddress,
      amount,
      duration
    });

    res.status(201).json({
      message: 'Stake created successfully',
      stake
    });
  } catch (error) {
    logger.error(`Create stake error: ${error.message}`);
    res.status(500).json({ error: error.message || 'Failed to create stake' });
  }
};

/**
 * Get user's stakes
 */
const getUserStakes = async (req, res) => {
  try {
    const userId = req.userId;
    const { status } = req.query;

    const query = { userId };
    if (status) {
      query.status = status;
    }

    const stakes = await Stake.find(query)
      .sort({ createdAt: -1 })
      .lean();

    // Calculate current rewards for each stake
    const stakesWithRewards = stakes.map(stake => {
      const stakeDoc = new Stake(stake);
      const rewards = stakeDoc.calculateRewards();
      return { ...stake, rewards };
    });

    res.json({ stakes: stakesWithRewards });
  } catch (error) {
    logger.error(`Get user stakes error: ${error.message}`);
    res.status(500).json({ error: 'Failed to fetch stakes' });
  }
};

/**
 * Get stake details
 */
const getStakeDetails = async (req, res) => {
  try {
    const { stakeId } = req.params;
    const userId = req.userId;

    const stake = await Stake.findOne({ _id: stakeId, userId });

    if (!stake) {
      return res.status(404).json({ error: 'Stake not found' });
    }

    const rewards = stake.calculateRewards();

    res.json({
      stake: {
        ...stake.toObject(),
        rewards
      }
    });
  } catch (error) {
    logger.error(`Get stake details error: ${error.message}`);
    res.status(500).json({ error: 'Failed to fetch stake details' });
  }
};

/**
 * Unstake tokens
 */
const unstake = async (req, res) => {
  try {
    const { stakeId } = req.validatedBody;
    const userId = req.userId;

    const result = await stakingService.unstake(stakeId, userId);

    res.json({
      message: 'Unstaked successfully',
      ...result
    });
  } catch (error) {
    logger.error(`Unstake error: ${error.message}`);
    res.status(500).json({ error: error.message || 'Failed to unstake' });
  }
};

/**
 * Claim staking rewards
 */
const claimRewards = async (req, res) => {
  try {
    const { stakeId } = req.params;
    const userId = req.userId;

    const result = await stakingService.claimRewards(stakeId, userId);

    res.json({
      message: 'Rewards claimed successfully',
      ...result
    });
  } catch (error) {
    logger.error(`Claim rewards error: ${error.message}`);
    res.status(500).json({ error: error.message || 'Failed to claim rewards' });
  }
};

/**
 * Calculate current rewards
 */
const calculateRewards = async (req, res) => {
  try {
    const { stakeId } = req.params;
    const userId = req.userId;

    const stake = await Stake.findOne({ _id: stakeId, userId });

    if (!stake) {
      return res.status(404).json({ error: 'Stake not found' });
    }

    const rewards = stake.calculateRewards();

    res.json({ rewards });
  } catch (error) {
    logger.error(`Calculate rewards error: ${error.message}`);
    res.status(500).json({ error: 'Failed to calculate rewards' });
  }
};

module.exports = {
  getStakingPools,
  createStake,
  getUserStakes,
  getStakeDetails,
  unstake,
  claimRewards,
  calculateRewards
};
