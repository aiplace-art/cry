// Smart contract interaction utilities

import { ethers } from 'ethers';
import { CONTRACT_ABI, PRESALE_CONFIG, TOKEN_ADDRESSES, GAS_LIMIT_BUFFER } from '../lib/constants';
import type { PaymentMethod, GasEstimate, TransactionError } from '../types/presale';

export class PresaleContract {
  private contract: ethers.Contract | null = null;
  private provider: ethers.providers.Web3Provider | null = null;
  private signer: ethers.Signer | null = null;

  constructor() {}

  // Initialize contract with provider
  async initialize(provider: ethers.providers.Web3Provider): Promise<void> {
    this.provider = provider;
    this.signer = provider.getSigner();
    this.contract = new ethers.Contract(
      PRESALE_CONFIG.contractAddress,
      CONTRACT_ABI,
      this.signer
    );
  }

  // Validate input amount
  validateAmount(amount: number): { valid: boolean; error?: string } {
    if (amount < PRESALE_CONFIG.minPurchase) {
      return {
        valid: false,
        error: `Minimum purchase is ${PRESALE_CONFIG.minPurchase} tokens`,
      };
    }

    if (amount > PRESALE_CONFIG.maxPurchase) {
      return {
        valid: false,
        error: `Maximum purchase is ${PRESALE_CONFIG.maxPurchase} tokens`,
      };
    }

    return { valid: true };
  }

  // Calculate tokens with bonus
  calculateTokens(amount: number, price: number, bonus: number): number {
    const baseTokens = amount / price;
    const bonusTokens = (baseTokens * bonus) / 100;
    return baseTokens + bonusTokens;
  }

  // Estimate gas for transaction
  async estimateGas(
    paymentMethod: PaymentMethod,
    amount: number
  ): Promise<GasEstimate> {
    if (!this.contract || !this.provider) {
      throw new Error('Contract not initialized');
    }

    try {
      const gasPrice = await this.provider.getGasPrice();
      const amountWei = ethers.utils.parseEther(amount.toString());

      let estimatedGas: ethers.BigNumber;

      if (paymentMethod === 'ETH') {
        estimatedGas = await this.contract.estimateGas.buyTokens(
          TOKEN_ADDRESSES.ETH,
          amountWei,
          { value: amountWei }
        );
      } else {
        const tokenAddress = TOKEN_ADDRESSES[paymentMethod as keyof typeof TOKEN_ADDRESSES];
        estimatedGas = await this.contract.estimateGas.buyTokens(
          tokenAddress,
          amountWei
        );
      }

      const bufferedGas = estimatedGas.mul(Math.floor(GAS_LIMIT_BUFFER * 100)).div(100);
      const totalCost = gasPrice.mul(bufferedGas);

      return {
        gasPrice: gasPrice.toString(),
        gasPriceGwei: ethers.utils.formatUnits(gasPrice, 'gwei'),
        estimatedGas: bufferedGas.toString(),
        totalCost: ethers.utils.formatEther(totalCost),
      };
    } catch (error: any) {
      throw this.parseError(error);
    }
  }

  // Buy tokens
  async buyTokens(
    paymentMethod: PaymentMethod,
    amount: number,
    slippage: number = 0.5
  ): Promise<string> {
    if (!this.contract) {
      throw new Error('Contract not initialized');
    }

    const validation = this.validateAmount(amount);
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    try {
      const amountWei = ethers.utils.parseEther(amount.toString());
      const gasEstimate = await this.estimateGas(paymentMethod, amount);

      let tx: ethers.ContractTransaction;

      if (paymentMethod === 'ETH') {
        tx = await this.contract.buyTokens(TOKEN_ADDRESSES.ETH, amountWei, {
          value: amountWei,
          gasLimit: gasEstimate.estimatedGas,
        });
      } else {
        const tokenAddress = TOKEN_ADDRESSES[paymentMethod as keyof typeof TOKEN_ADDRESSES];

        // Approve token spending first
        await this.approveToken(tokenAddress, amountWei);

        tx = await this.contract.buyTokens(tokenAddress, amountWei, {
          gasLimit: gasEstimate.estimatedGas,
        });
      }

      return tx.hash;
    } catch (error: any) {
      throw this.parseError(error);
    }
  }

  // Approve ERC20 token spending
  private async approveToken(tokenAddress: string, amount: ethers.BigNumber): Promise<void> {
    if (!this.signer) {
      throw new Error('Signer not initialized');
    }

    const tokenContract = new ethers.Contract(
      tokenAddress,
      ['function approve(address spender, uint256 amount) external returns (bool)'],
      this.signer
    );

    const tx = await tokenContract.approve(PRESALE_CONFIG.contractAddress, amount);
    await tx.wait();
  }

  // Claim vested tokens
  async claimTokens(): Promise<string> {
    if (!this.contract) {
      throw new Error('Contract not initialized');
    }

    try {
      const tx = await this.contract.claimTokens();
      return tx.hash;
    } catch (error: any) {
      throw this.parseError(error);
    }
  }

  // Get current round information
  async getRoundInfo(): Promise<{
    roundId: number;
    price: number;
    collected: number;
    hardCap: number;
  }> {
    if (!this.contract) {
      throw new Error('Contract not initialized');
    }

    try {
      const [roundId, price, collected, hardCap] = await this.contract.getRoundInfo();

      return {
        roundId: roundId.toNumber(),
        price: parseFloat(ethers.utils.formatEther(price)),
        collected: parseFloat(ethers.utils.formatEther(collected)),
        hardCap: parseFloat(ethers.utils.formatEther(hardCap)),
      };
    } catch (error: any) {
      throw this.parseError(error);
    }
  }

  // Get user information
  async getUserInfo(address: string): Promise<{
    totalPurchased: number;
    totalTokens: number;
    claimed: number;
  }> {
    if (!this.contract) {
      throw new Error('Contract not initialized');
    }

    try {
      const [totalPurchased, totalTokens, claimed] = await this.contract.getUserInfo(address);

      return {
        totalPurchased: parseFloat(ethers.utils.formatEther(totalPurchased)),
        totalTokens: parseFloat(ethers.utils.formatEther(totalTokens)),
        claimed: parseFloat(ethers.utils.formatEther(claimed)),
      };
    } catch (error: any) {
      throw this.parseError(error);
    }
  }

  // Get vesting schedule
  async getVestingSchedule(address: string): Promise<
    Array<{ amount: number; releaseDate: Date; claimed: boolean }>
  > {
    if (!this.contract) {
      throw new Error('Contract not initialized');
    }

    try {
      const schedule = await this.contract.getVestingSchedule(address);

      return schedule.map((vest: any) => ({
        amount: parseFloat(ethers.utils.formatEther(vest.amount)),
        releaseDate: new Date(vest.releaseTime.toNumber() * 1000),
        claimed: vest.claimed,
      }));
    } catch (error: any) {
      throw this.parseError(error);
    }
  }

  // Wait for transaction confirmation
  async waitForTransaction(txHash: string): Promise<ethers.providers.TransactionReceipt> {
    if (!this.provider) {
      throw new Error('Provider not initialized');
    }

    try {
      const receipt = await this.provider.waitForTransaction(txHash, 1, 60000);
      return receipt;
    } catch (error: any) {
      throw this.parseError(error);
    }
  }

  // Parse contract errors
  private parseError(error: any): TransactionError {
    if (error.code === 'INSUFFICIENT_FUNDS') {
      return {
        code: 'INSUFFICIENT_FUNDS',
        message: 'Insufficient funds for transaction',
      };
    }

    if (error.code === 'ACTION_REJECTED' || error.code === 4001) {
      return {
        code: 'USER_REJECTED',
        message: 'Transaction rejected by user',
      };
    }

    if (error.code === 'NETWORK_ERROR') {
      return {
        code: 'NETWORK_ERROR',
        message: 'Network error occurred. Please try again.',
      };
    }

    if (error.message?.includes('execution reverted')) {
      const revertReason = error.message.split('execution reverted: ')[1] || 'Transaction failed';
      return {
        code: 'CONTRACT_REVERT',
        message: revertReason,
      };
    }

    return {
      code: 'UNKNOWN_ERROR',
      message: error.message || 'An unknown error occurred',
      details: error,
    };
  }
}

// Singleton instance
export const presaleContract = new PresaleContract();
