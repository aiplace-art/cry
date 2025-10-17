const { ethers } = require("hardhat");

/**
 * Increase blockchain time by specified seconds
 * @param {number} seconds - Number of seconds to advance
 */
async function increaseTime(seconds) {
  await ethers.provider.send("evm_increaseTime", [seconds]);
  await ethers.provider.send("evm_mine");
}

/**
 * Get current block timestamp
 * @returns {Promise<number>} Current block timestamp
 */
async function getBlockTimestamp() {
  const block = await ethers.provider.getBlock("latest");
  return block.timestamp;
}

/**
 * Parse ether amount to wei
 * @param {string|number} amount - Amount in ether
 * @returns {BigInt} Amount in wei
 */
function parseEther(amount) {
  return ethers.parseEther(amount.toString());
}

/**
 * Format wei amount to ether
 * @param {BigInt} amount - Amount in wei
 * @returns {string} Amount in ether
 */
function formatEther(amount) {
  return ethers.formatEther(amount);
}

/**
 * Time constants in seconds
 */
const TIME = {
  MINUTE: 60,
  HOUR: 3600,
  DAY: 86400,
  WEEK: 604800,
  MONTH: 2592000,
  YEAR: 31536000,
  SIX_MONTHS: 15552000, // 180 days
  TWENTY_FOUR_MONTHS: 62208000 // 720 days
};

/**
 * Set next block timestamp
 * @param {number} timestamp - Target timestamp
 */
async function setNextBlockTimestamp(timestamp) {
  await ethers.provider.send("evm_setNextBlockTimestamp", [timestamp]);
  await ethers.provider.send("evm_mine");
}

/**
 * Mine blocks
 * @param {number} count - Number of blocks to mine
 */
async function mineBlocks(count) {
  for (let i = 0; i < count; i++) {
    await ethers.provider.send("evm_mine");
  }
}

/**
 * Snapshot blockchain state
 * @returns {Promise<string>} Snapshot ID
 */
async function snapshot() {
  return await ethers.provider.send("evm_snapshot");
}

/**
 * Revert to snapshot
 * @param {string} id - Snapshot ID
 */
async function revert(id) {
  await ethers.provider.send("evm_revert", [id]);
}

/**
 * Get balance of address
 * @param {string} address - Address to check
 * @returns {Promise<BigInt>} Balance in wei
 */
async function getBalance(address) {
  return await ethers.provider.getBalance(address);
}

/**
 * Calculate percentage
 * @param {BigInt} amount - Total amount
 * @param {number} percent - Percentage (0-100)
 * @returns {BigInt} Calculated amount
 */
function calculatePercentage(amount, percent) {
  return (amount * BigInt(Math.floor(percent * 100))) / BigInt(10000);
}

module.exports = {
  increaseTime,
  getBlockTimestamp,
  parseEther,
  formatEther,
  TIME,
  setNextBlockTimestamp,
  mineBlocks,
  snapshot,
  revert,
  getBalance,
  calculatePercentage
};
