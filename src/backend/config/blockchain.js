const { ethers } = require('ethers');
const { logger } = require('./logger');

// Provider cache
let providers = {};

/**
 * Get blockchain provider for specific network
 */
const getProvider = (network = 'ethereum') => {
  if (providers[network]) {
    return providers[network];
  }

  let rpcUrl;

  switch (network.toLowerCase()) {
    case 'ethereum':
    case 'eth':
      rpcUrl = process.env.ETH_RPC_URL || 'https://eth-mainnet.g.alchemy.com/v2/demo';
      break;
    case 'polygon':
    case 'matic':
      rpcUrl = process.env.POLYGON_RPC_URL || 'https://polygon-rpc.com';
      break;
    case 'bsc':
    case 'binance':
      rpcUrl = process.env.BSC_RPC_URL || 'https://bsc-dataseed.binance.org';
      break;
    default:
      rpcUrl = process.env.ETH_RPC_URL || 'https://eth-mainnet.g.alchemy.com/v2/demo';
  }

  try {
    providers[network] = new ethers.JsonRpcProvider(rpcUrl);
    logger.info(`Blockchain provider initialized for ${network}`);
    return providers[network];
  } catch (error) {
    logger.error(`Failed to initialize provider for ${network}: ${error.message}`);
    throw error;
  }
};

/**
 * Get contract instance
 */
const getContract = (address, abi, network = 'ethereum') => {
  try {
    const provider = getProvider(network);
    return new ethers.Contract(address, abi, provider);
  } catch (error) {
    logger.error(`Failed to get contract: ${error.message}`);
    throw error;
  }
};

/**
 * Get current gas price
 */
const getGasPrice = async (network = 'ethereum') => {
  try {
    const provider = getProvider(network);
    const feeData = await provider.getFeeData();

    return {
      gasPrice: feeData.gasPrice ? ethers.formatUnits(feeData.gasPrice, 'gwei') : null,
      maxFeePerGas: feeData.maxFeePerGas ? ethers.formatUnits(feeData.maxFeePerGas, 'gwei') : null,
      maxPriorityFeePerGas: feeData.maxPriorityFeePerGas ? ethers.formatUnits(feeData.maxPriorityFeePerGas, 'gwei') : null
    };
  } catch (error) {
    logger.error(`Failed to get gas price: ${error.message}`);
    throw error;
  }
};

/**
 * Get transaction by hash
 */
const getTransaction = async (txHash, network = 'ethereum') => {
  try {
    const provider = getProvider(network);
    const tx = await provider.getTransaction(txHash);

    if (!tx) {
      return null;
    }

    // Get receipt if transaction is mined
    const receipt = await provider.getTransactionReceipt(txHash);

    return {
      hash: tx.hash,
      from: tx.from,
      to: tx.to,
      value: ethers.formatEther(tx.value),
      gasLimit: tx.gasLimit.toString(),
      gasPrice: tx.gasPrice ? ethers.formatUnits(tx.gasPrice, 'gwei') : null,
      nonce: tx.nonce,
      blockNumber: tx.blockNumber,
      confirmations: await tx.confirmations(),
      status: receipt ? (receipt.status === 1 ? 'confirmed' : 'failed') : 'pending',
      receipt: receipt ? {
        gasUsed: receipt.gasUsed.toString(),
        effectiveGasPrice: ethers.formatUnits(receipt.gasPrice || receipt.effectiveGasPrice, 'gwei'),
        logs: receipt.logs.length
      } : null
    };
  } catch (error) {
    logger.error(`Failed to get transaction: ${error.message}`);
    throw error;
  }
};

/**
 * Get wallet balance
 */
const getWalletBalance = async (address, network = 'ethereum') => {
  try {
    const provider = getProvider(network);
    const balance = await provider.getBalance(address);
    return ethers.formatEther(balance);
  } catch (error) {
    logger.error(`Failed to get wallet balance: ${error.message}`);
    throw error;
  }
};

/**
 * Get ERC20 token balance
 */
const getTokenBalance = async (walletAddress, tokenAddress, network = 'ethereum') => {
  try {
    const ERC20_ABI = [
      'function balanceOf(address owner) view returns (uint256)',
      'function decimals() view returns (uint8)',
      'function symbol() view returns (string)'
    ];

    const contract = getContract(tokenAddress, ERC20_ABI, network);
    const [balance, decimals, symbol] = await Promise.all([
      contract.balanceOf(walletAddress),
      contract.decimals(),
      contract.symbol()
    ]);

    return {
      balance: ethers.formatUnits(balance, decimals),
      decimals,
      symbol
    };
  } catch (error) {
    logger.error(`Failed to get token balance: ${error.message}`);
    throw error;
  }
};

/**
 * Estimate gas for transaction
 */
const estimateGas = async (transaction, network = 'ethereum') => {
  try {
    const provider = getProvider(network);
    const gasEstimate = await provider.estimateGas(transaction);
    return gasEstimate.toString();
  } catch (error) {
    logger.error(`Failed to estimate gas: ${error.message}`);
    throw error;
  }
};

/**
 * Get current block number
 */
const getBlockNumber = async (network = 'ethereum') => {
  try {
    const provider = getProvider(network);
    return await provider.getBlockNumber();
  } catch (error) {
    logger.error(`Failed to get block number: ${error.message}`);
    throw error;
  }
};

/**
 * Validate Ethereum address
 */
const isValidAddress = (address) => {
  return ethers.isAddress(address);
};

module.exports = {
  getProvider,
  getContract,
  getGasPrice,
  getTransaction,
  getWalletBalance,
  getTokenBalance,
  estimateGas,
  getBlockNumber,
  isValidAddress
};
