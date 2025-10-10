import { ethers } from 'ethers';

const ERC20_ABI = [
  'function totalSupply() view returns (uint256)',
  'function balanceOf(address) view returns (uint256)',
  'function decimals() view returns (uint8)',
  'function symbol() view returns (string)',
  'function name() view returns (string)',
];

export interface TokenData {
  totalSupply: string;
  holders: number;
  symbol: string;
  name: string;
  decimals: number;
  address: string;
}

export interface TransactionData {
  hash: string;
  from: string;
  to: string;
  value: string;
  timestamp: number;
  type: 'buy' | 'sell' | 'transfer';
}

export class BlockchainService {
  private provider: ethers.JsonRpcProvider;
  private tokenContract: ethers.Contract;

  constructor(rpcUrl: string, tokenAddress: string) {
    this.provider = new ethers.JsonRpcProvider(rpcUrl);
    this.tokenContract = new ethers.Contract(tokenAddress, ERC20_ABI, this.provider);
  }

  async getTokenData(): Promise<TokenData> {
    try {
      const [totalSupply, symbol, name, decimals] = await Promise.all([
        this.tokenContract.totalSupply(),
        this.tokenContract.symbol(),
        this.tokenContract.name(),
        this.tokenContract.decimals(),
      ]);

      // Get holder count from Etherscan API or similar
      const holders = await this.getHolderCount();

      return {
        totalSupply: ethers.formatUnits(totalSupply, decimals),
        holders,
        symbol,
        name,
        decimals: Number(decimals),
        address: await this.tokenContract.getAddress(),
      };
    } catch (error) {
      console.error('Error fetching token data:', error);
      throw new Error('Failed to fetch token data');
    }
  }

  async getHolderCount(): Promise<number> {
    // This would typically use Etherscan API or similar service
    // For demo, returning mock data
    try {
      // Example: Query Transfer events and count unique addresses
      const filter = this.tokenContract.filters.Transfer();
      const currentBlock = await this.provider.getBlockNumber();
      const fromBlock = Math.max(0, currentBlock - 10000); // Last 10k blocks

      const events = await this.tokenContract.queryFilter(filter, fromBlock, currentBlock);
      const uniqueAddresses = new Set(
        events.flatMap(event => [event.args?.[0], event.args?.[1]])
      );

      return uniqueAddresses.size;
    } catch (error) {
      console.warn('Could not fetch holder count from events, using default');
      return 0;
    }
  }

  async getRecentTransactions(limit: number = 10): Promise<TransactionData[]> {
    try {
      const filter = this.tokenContract.filters.Transfer();
      const currentBlock = await this.provider.getBlockNumber();
      const fromBlock = Math.max(0, currentBlock - 5000);

      const events = await this.tokenContract.queryFilter(filter, fromBlock, currentBlock);
      const transactions: TransactionData[] = [];

      for (const event of events.slice(-limit)) {
        const block = await event.getBlock();
        const tx = await event.getTransaction();

        transactions.push({
          hash: tx.hash,
          from: event.args?.[0] || '',
          to: event.args?.[1] || '',
          value: ethers.formatEther(event.args?.[2] || 0),
          timestamp: block.timestamp,
          type: this.determineTransactionType(event.args?.[0], event.args?.[1]),
        });
      }

      return transactions.reverse();
    } catch (error) {
      console.error('Error fetching transactions:', error);
      return [];
    }
  }

  private determineTransactionType(from: string, to: string): 'buy' | 'sell' | 'transfer' {
    // Simple heuristic - could be enhanced with DEX router addresses
    const zeroAddress = '0x0000000000000000000000000000000000000000';
    if (from === zeroAddress) return 'buy';
    if (to === zeroAddress) return 'sell';
    return 'transfer';
  }

  async getTokenPrice(): Promise<number> {
    // This would integrate with DEX price feeds (Uniswap, etc.)
    // For now, returning 0 as placeholder
    return 0;
  }

  subscribeToTransfers(callback: (tx: TransactionData) => void) {
    const filter = this.tokenContract.filters.Transfer();

    this.tokenContract.on(filter, async (from, to, value, event) => {
      const block = await event.getBlock();
      const tx = await event.getTransaction();

      callback({
        hash: tx.hash,
        from,
        to,
        value: ethers.formatEther(value),
        timestamp: block.timestamp,
        type: this.determineTransactionType(from, to),
      });
    });
  }

  unsubscribeFromTransfers() {
    this.tokenContract.removeAllListeners();
  }
}
