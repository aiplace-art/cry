const { ethers } = require('ethers');
const blockchain = require('../config/blockchain');
const { logger } = require('../config/logger');
const { cacheGet, cacheSet } = require('../config/redis');

/**
 * Staking Pool ABI
 */
const STAKING_ABI = [
  'function stake(uint256 amount, uint256 duration) external',
  'function unstake(uint256 stakeId) external',
  'function claimRewards(uint256 stakeId) external',
  'function getStakeInfo(address user, uint256 stakeId) view returns (uint256 amount, uint256 startTime, uint256 endTime, uint256 rewards, bool active)',
  'function getUserStakes(address user) view returns (uint256[])',
  'function totalStaked() view returns (uint256)',
  'function rewardRate() view returns (uint256)',
  'event Staked(address indexed user, uint256 indexed stakeId, uint256 amount, uint256 duration)',
  'event Unstaked(address indexed user, uint256 indexed stakeId, uint256 amount, uint256 rewards)',
  'event RewardsClaimed(address indexed user, uint256 indexed stakeId, uint256 rewards)'
];

/**
 * Get staking contract instance
 */
const getStakingContract = (network = 'ethereum') => {
  const contractAddress = process.env.STAKING_CONTRACT_ADDRESS;

  if (!contractAddress || contractAddress === '0x0000000000000000000000000000000000000000') {
    throw new Error('Staking contract address not configured');
  }

  return blockchain.getContract(contractAddress, STAKING_ABI, network);
};

/**
 * Get user's on-chain stakes
 */
const getUserOnChainStakes = async (walletAddress, network = 'ethereum') => {
  try {
    const cacheKey = `stakes:${network}:${walletAddress}`;
    const cached = await cacheGet(cacheKey);

    if (cached) {
      return cached;
    }

    const contract = getStakingContract(network);
    const stakeIds = await contract.getUserStakes(walletAddress);

    const stakes = await Promise.all(
      stakeIds.map(async (stakeId) => {
        const info = await contract.getStakeInfo(walletAddress, stakeId);
        return {
          stakeId: stakeId.toString(),
          amount: ethers.formatEther(info.amount),
          startTime: new Date(Number(info.startTime) * 1000),
          endTime: new Date(Number(info.endTime) * 1000),
          rewards: ethers.formatEther(info.rewards),
          active: info.active
        };
      })
    );

    await cacheSet(cacheKey, stakes, 60); // Cache for 1 minute

    return stakes;
  } catch (error) {
    logger.error(`Get user on-chain stakes error: ${error.message}`);
    return [];
  }
};

/**
 * Get staking pool statistics
 */
const getStakingPoolStats = async (network = 'ethereum') => {
  try {
    const cacheKey = `staking:stats:${network}`;
    const cached = await cacheGet(cacheKey);

    if (cached) {
      return cached;
    }

    const contract = getStakingContract(network);
    const [totalStaked, rewardRate] = await Promise.all([
      contract.totalStaked(),
      contract.rewardRate()
    ]);

    const stats = {
      totalStaked: ethers.formatEther(totalStaked),
      rewardRate: Number(rewardRate) / 100, // Convert from basis points
      timestamp: new Date()
    };

    await cacheSet(cacheKey, stats, 300); // Cache for 5 minutes

    return stats;
  } catch (error) {
    logger.error(`Get staking pool stats error: ${error.message}`);
    return {
      totalStaked: '0',
      rewardRate: 0,
      timestamp: new Date()
    };
  }
};

/**
 * Monitor transaction status
 */
const monitorTransaction = async (txHash, network = 'ethereum', requiredConfirmations = 3) => {
  try {
    const provider = blockchain.getProvider(network);

    // Wait for transaction to be mined
    logger.info(`Monitoring transaction: ${txHash}`);
    const receipt = await provider.waitForTransaction(txHash, requiredConfirmations);

    if (!receipt) {
      throw new Error('Transaction receipt not found');
    }

    const status = receipt.status === 1 ? 'confirmed' : 'failed';

    logger.info(`Transaction ${txHash} ${status} with ${receipt.confirmations} confirmations`);

    return {
      txHash,
      status,
      blockNumber: receipt.blockNumber,
      confirmations: receipt.confirmations,
      gasUsed: receipt.gasUsed.toString(),
      effectiveGasPrice: ethers.formatUnits(receipt.gasPrice || receipt.effectiveGasPrice, 'gwei'),
      logs: receipt.logs
    };
  } catch (error) {
    logger.error(`Transaction monitoring error: ${error.message}`);
    throw error;
  }
};

/**
 * Parse staking events from transaction receipt
 */
const parseStakingEvents = (receipt) => {
  try {
    const iface = new ethers.Interface(STAKING_ABI);
    const events = [];

    for (const log of receipt.logs) {
      try {
        const parsed = iface.parseLog(log);
        if (parsed) {
          events.push({
            name: parsed.name,
            args: parsed.args,
            signature: parsed.signature
          });
        }
      } catch (e) {
        // Skip logs that don't match our interface
        continue;
      }
    }

    return events;
  } catch (error) {
    logger.error(`Parse staking events error: ${error.message}`);
    return [];
  }
};

/**
 * Get transaction history for wallet
 */
const getTransactionHistory = async (walletAddress, network = 'ethereum', limit = 50) => {
  try {
    const provider = blockchain.getProvider(network);
    const currentBlock = await provider.getBlockNumber();
    const startBlock = Math.max(0, currentBlock - 10000); // Last ~10000 blocks

    // For production, use The Graph or blockchain indexer API
    // This is a simplified version
    const transactions = [];

    logger.info(`Fetching transaction history for ${walletAddress}`);

    // In production, integrate with The Graph or Etherscan API
    // For now, return empty array as we need indexer service

    return transactions;
  } catch (error) {
    logger.error(`Get transaction history error: ${error.message}`);
    return [];
  }
};

/**
 * Verify contract exists at address
 */
const verifyContract = async (address, network = 'ethereum') => {
  try {
    const provider = blockchain.getProvider(network);
    const code = await provider.getCode(address);

    // If code is '0x', no contract exists at this address
    return code !== '0x';
  } catch (error) {
    logger.error(`Verify contract error: ${error.message}`);
    return false;
  }
};

/**
 * Get network information
 */
const getNetworkInfo = async (network = 'ethereum') => {
  try {
    const provider = blockchain.getProvider(network);
    const [networkData, blockNumber, feeData] = await Promise.all([
      provider.getNetwork(),
      provider.getBlockNumber(),
      provider.getFeeData()
    ]);

    return {
      chainId: Number(networkData.chainId),
      name: networkData.name,
      blockNumber,
      gasPrice: feeData.gasPrice ? ethers.formatUnits(feeData.gasPrice, 'gwei') : null,
      maxFeePerGas: feeData.maxFeePerGas ? ethers.formatUnits(feeData.maxFeePerGas, 'gwei') : null,
      maxPriorityFeePerGas: feeData.maxPriorityFeePerGas ? ethers.formatUnits(feeData.maxPriorityFeePerGas, 'gwei') : null
    };
  } catch (error) {
    logger.error(`Get network info error: ${error.message}`);
    throw error;
  }
};

module.exports = {
  getStakingContract,
  getUserOnChainStakes,
  getStakingPoolStats,
  monitorTransaction,
  parseStakingEvents,
  getTransactionHistory,
  verifyContract,
  getNetworkInfo
};
