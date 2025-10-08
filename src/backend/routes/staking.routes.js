const express = require('express');
const router = express.Router();
const stakingController = require('../controllers/staking.controller');
const { verifyToken } = require('../middleware/auth');
const { validate, schemas } = require('../middleware/validation');

// All routes require authentication
router.use(verifyToken);

/**
 * @route   GET /api/v1/staking/pools
 * @desc    Get available staking pools
 * @access  Private
 */
router.get('/pools', stakingController.getStakingPools);

/**
 * @route   POST /api/v1/staking/stake
 * @desc    Create new stake
 * @access  Private
 */
router.post('/stake', validate(schemas.createStake), stakingController.createStake);

/**
 * @route   GET /api/v1/staking/user
 * @desc    Get user's stakes
 * @access  Private
 */
router.get('/user', stakingController.getUserStakes);

/**
 * @route   GET /api/v1/staking/:stakeId
 * @desc    Get stake details
 * @access  Private
 */
router.get('/:stakeId', stakingController.getStakeDetails);

/**
 * @route   POST /api/v1/staking/unstake
 * @desc    Unstake tokens
 * @access  Private
 */
router.post('/unstake', validate(schemas.unstake), stakingController.unstake);

/**
 * @route   POST /api/v1/staking/:stakeId/claim
 * @desc    Claim staking rewards
 * @access  Private
 */
router.post('/:stakeId/claim', stakingController.claimRewards);

/**
 * @route   GET /api/v1/staking/:stakeId/rewards
 * @desc    Calculate current rewards
 * @access  Private
 */
router.get('/:stakeId/rewards', stakingController.calculateRewards);

module.exports = router;
