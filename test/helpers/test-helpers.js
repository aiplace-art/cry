const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");

/**
 * Test Helper Utilities for HypeAI Token Tests
 */

/**
 * Time constants for testing
 */
const TIME = {
  MINUTE: 60,
  HOUR: 60 * 60,
  DAY: 24 * 60 * 60,
  WEEK: 7 * 24 * 60 * 60,
  MONTH: 30 * 24 * 60 * 60,
  YEAR: 365 * 24 * 60 * 60,
};

/**
 * Token constants
 */
const TOKENS = {
  TOTAL_SUPPLY: ethers.parseEther("21000000000"), // 21B
  STAKING_POOL: ethers.parseEther("13020000000"), // 62%
  PRIVATE_SALE: ethers.parseEther("2100000000"), // 10%
  TEAM: ethers.parseEther("2100000000"), // 10%
  PUBLIC_SALE: ethers.parseEther("1680000000"), // 8%
  LIQUIDITY: ethers.parseEther("2100000000"), // 10%
};

/**
 * Vesting constants
 */
const VESTING = {
  CLIFF: 6 * TIME.MONTH,
  DURATION: 24 * TIME.MONTH,
  TOTAL: 30 * TIME.MONTH,
};

/**
 * APY constants
 */
const APY = {
  MAX: 62,
  MID: 31,
  MIN: 6.2,
};

/**
 * Increase time by specified amount
 * @param {number} seconds - Seconds to increase
 */
async function increaseTime(seconds) {
  await time.increase(seconds);
}

/**
 * Increase time to specific timestamp
 * @param {number} timestamp - Target timestamp
 */
async function increaseTimeTo(timestamp) {
  await time.increaseTo(timestamp);
}

/**
 * Get current block timestamp
 * @returns {Promise<number>} Current timestamp
 */
async function getCurrentTime() {
  return await time.latest();
}

/**
 * Mine specified number of blocks
 * @param {number} blocks - Number of blocks to mine
 */
async function mineBlocks(blocks) {
  for (let i = 0; i < blocks; i++) {
    await time.increase(1);
  }
}

/**
 * Calculate expected staking rewards
 * @param {BigInt} principal - Staked amount
 * @param {number} apy - Annual percentage yield
 * @param {number} duration - Staking duration in seconds
 * @returns {BigInt} Expected rewards
 */
function calculateStakingRewards(principal, apy, duration) {
  const annualRewards = (principal * BigInt(Math.floor(apy * 100))) / BigInt(10000);
  const durationRatio = BigInt(duration) / BigInt(TIME.YEAR);
  return annualRewards * durationRatio / BigInt(100);
}

/**
 * Calculate vested amount (linear vesting after cliff)
 * @param {BigInt} totalAllocation - Total allocation
 * @param {number} vestingStart - Vesting start timestamp
 * @param {number} currentTime - Current timestamp
 * @param {number} cliff - Cliff duration in seconds
 * @param {number} duration - Vesting duration in seconds
 * @returns {BigInt} Vested amount
 */
function calculateVestedAmount(totalAllocation, vestingStart, currentTime, cliff, duration) {
  const elapsedTime = currentTime - vestingStart;

  // Before cliff
  if (elapsedTime < cliff) {
    return BigInt(0);
  }

  // After cliff
  const vestingTime = elapsedTime - cliff;

  // Fully vested
  if (vestingTime >= duration) {
    return totalAllocation;
  }

  // Linear vesting
  return (totalAllocation * BigInt(vestingTime)) / BigInt(duration);
}

/**
 * Calculate token amount from BNB
 * @param {BigInt} bnbAmount - BNB amount
 * @param {number} bnbPrice - BNB price in USD (8 decimals)
 * @param {BigInt} tokenPrice - Token price in wei
 * @returns {BigInt} Token amount
 */
function calculateTokensFromBNB(bnbAmount, bnbPrice, tokenPrice) {
  // BNB value in USD (convert from 8 decimals)
  const bnbValueUSD = (bnbAmount * BigInt(bnbPrice)) / BigInt(10 ** 8);

  // Tokens = USD value / token price
  return bnbValueUSD / tokenPrice;
}

/**
 * Calculate bonus percentage based on purchase amount
 * @param {BigInt} usdValue - Purchase value in USD
 * @returns {number} Bonus percentage
 */
function calculateBonus(usdValue) {
  const value = Number(ethers.formatEther(usdValue));

  if (value >= 50000) return 30;
  if (value >= 10000) return 20;
  if (value >= 1000) return 10;
  return 0;
}

/**
 * Deploy mock Chainlink price feed
 * @param {number} initialPrice - Initial price (8 decimals)
 * @returns {Promise<Contract>} Mock price feed contract
 */
async function deployMockPriceFeed(initialPrice = 30000000000) {
  const MockV3Aggregator = await ethers.getContractFactory("MockV3Aggregator");
  return await MockV3Aggregator.deploy(8, initialPrice);
}

/**
 * Setup test environment with all contracts
 * @returns {Promise<Object>} Deployed contracts and signers
 */
async function setupTestEnvironment() {
  const [owner, user1, user2, user3, ...others] = await ethers.getSigners();

  // Deploy HypeToken
  const HypeToken = await ethers.getContractFactory("HypeToken");
  const hypeToken = await HypeToken.deploy();

  // Deploy mock price feed
  const mockPriceFeed = await deployMockPriceFeed();

  // Deploy PrivateSale
  const PrivateSale = await ethers.getContractFactory("PrivateSale");
  const privateSale = await PrivateSale.deploy(hypeToken.target, mockPriceFeed.target);

  // Deploy TeamTokenVesting
  const TeamTokenVesting = await ethers.getContractFactory("TeamTokenVesting");
  const teamVesting = await TeamTokenVesting.deploy(hypeToken.target);

  return {
    hypeToken,
    privateSale,
    teamVesting,
    mockPriceFeed,
    signers: { owner, user1, user2, user3, others },
  };
}

/**
 * Create snapshot of current blockchain state
 * @returns {Promise<string>} Snapshot ID
 */
async function takeSnapshot() {
  return await ethers.provider.send("evm_snapshot", []);
}

/**
 * Restore blockchain state to snapshot
 * @param {string} snapshotId - Snapshot ID
 */
async function restoreSnapshot(snapshotId) {
  await ethers.provider.send("evm_revert", [snapshotId]);
}

/**
 * Assert two BigInt values are close within tolerance
 * @param {BigInt} actual - Actual value
 * @param {BigInt} expected - Expected value
 * @param {BigInt} tolerance - Tolerance amount
 * @returns {boolean} True if within tolerance
 */
function assertCloseTo(actual, expected, tolerance) {
  const diff = actual > expected ? actual - expected : expected - actual;
  return diff <= tolerance;
}

/**
 * Format test output for debugging
 * @param {string} label - Label for value
 * @param {BigInt} value - Value to format
 */
function debugLog(label, value) {
  if (typeof value === "bigint") {
    console.log(`${label}: ${ethers.formatEther(value)} HYPE`);
  } else {
    console.log(`${label}:`, value);
  }
}

/**
 * Generate random address
 * @returns {string} Random Ethereum address
 */
function randomAddress() {
  return ethers.Wallet.createRandom().address;
}

/**
 * Calculate percentage
 * @param {BigInt} amount - Amount
 * @param {number} percentage - Percentage (0-100)
 * @returns {BigInt} Result
 */
function percentage(amount, percentage) {
  return (amount * BigInt(Math.floor(percentage * 100))) / BigInt(10000);
}

module.exports = {
  TIME,
  TOKENS,
  VESTING,
  APY,
  increaseTime,
  increaseTimeTo,
  getCurrentTime,
  mineBlocks,
  calculateStakingRewards,
  calculateVestedAmount,
  calculateTokensFromBNB,
  calculateBonus,
  deployMockPriceFeed,
  setupTestEnvironment,
  takeSnapshot,
  restoreSnapshot,
  assertCloseTo,
  debugLog,
  randomAddress,
  percentage,
};
