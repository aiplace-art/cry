export const SUPPORTED_CHAINS = [
  {
    id: 1,
    name: 'Ethereum',
    rpcUrl: 'https://eth.llamarpc.com',
    blockExplorer: 'https://etherscan.io',
  },
  {
    id: 5,
    name: 'Goerli',
    rpcUrl: 'https://goerli.infura.io/v3/',
    blockExplorer: 'https://goerli.etherscan.io',
  },
  {
    id: 137,
    name: 'Polygon',
    rpcUrl: 'https://polygon-rpc.com',
    blockExplorer: 'https://polygonscan.com',
  },
];

export const CONTRACT_ADDRESSES = {
  TOKEN: process.env.NEXT_PUBLIC_TOKEN_ADDRESS || '',
  STAKING: process.env.NEXT_PUBLIC_STAKING_ADDRESS || '',
  GOVERNANCE: process.env.NEXT_PUBLIC_GOVERNANCE_ADDRESS || '',
};

export const DEFAULT_CHAIN_ID = 1;

export const REFRESH_INTERVAL = 10000; // 10 seconds

export const CHART_COLORS = {
  primary: '#0ea5e9',
  secondary: '#a855f7',
  success: '#10b981',
  danger: '#ef4444',
  warning: '#f59e0b',
};

export const STAKING_LOCK_PERIODS = [
  { days: 30, multiplier: 1.0 },
  { days: 90, multiplier: 1.5 },
  { days: 180, multiplier: 2.0 },
  { days: 365, multiplier: 3.0 },
];

// Presale configuration
export const PRESALE_CONFIG = {
  minPurchase: 0.01,
  maxPurchase: 100,
  tokenPrice: 0.001,
  startDate: new Date('2025-01-01'),
  endDate: new Date('2025-03-31'),
  targetAmount: 1000000,
  currentRound: {
    id: 1,
    name: 'Private Sale',
    price: 0.001,
    bonus: 30,
  }
};

// Payment methods for presale
export const PAYMENT_METHODS = [
  {
    id: 'ETH',
    name: 'Ethereum',
    symbol: 'ETH',
    icon: '⟠',
    network: 'ethereum' as const,
    decimals: 18,
  },
  {
    id: 'BNB',
    name: 'BNB',
    symbol: 'BNB',
    icon: '💰',
    network: 'bsc' as const,
    decimals: 18,
  },
  {
    id: 'USDT',
    name: 'Tether',
    symbol: 'USDT',
    icon: '💵',
    network: 'ethereum' as const,
    decimals: 6,
  },
  {
    id: 'USDC',
    name: 'USD Coin',
    symbol: 'USDC',
    icon: '💲',
    network: 'ethereum' as const,
    decimals: 6,
  },
  {
    id: 'SOL',
    name: 'Solana',
    symbol: 'SOL',
    icon: '◎',
    network: 'solana' as const,
    decimals: 9,
  },
];
