export interface PrivateSaleConfig {
  startDate: Date;
  endDate: Date;
  targetAmount: number;
  currentAmount: number;
  tokenPrice: number;
  bonusPercentage: number;
  minPurchase: number;
  maxPurchase: number;
}

export interface PaymentMethod {
  id: string;
  name: string;
  symbol: string;
  icon: string;
  network: 'ethereum' | 'bsc' | 'solana' | 'polygon';
  contractAddress?: string;
  decimals: number;
}

export interface Purchase {
  id: string;
  amount: number;
  currency: string;
  tokensReceived: number;
  bonusTokens: number;
  totalTokens: number;
  transactionHash: string;
  status: 'pending' | 'completed' | 'failed';
  timestamp: Date;
  walletAddress: string;
}

export interface CalculatorResult {
  usdAmount: number;
  baseTokens: number;
  bonusTokens: number;
  totalTokens: number;
  bonusPercentage: number;
}

export interface TransactionResult {
  success: boolean;
  transactionHash?: string;
  error?: string;
  tokensReceived?: number;
}

export interface WalletConnection {
  address: string;
  chainId: number;
  provider: any;
  isConnected: boolean;
}
