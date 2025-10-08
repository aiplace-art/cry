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
