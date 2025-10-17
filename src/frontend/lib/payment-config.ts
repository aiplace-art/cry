import { PaymentMethod } from '../types/private-sale';

export const PAYMENT_METHODS: PaymentMethod[] = [
  {
    id: 'eth',
    name: 'Ethereum',
    symbol: 'ETH',
    icon: '⟠',
    network: 'ethereum',
    decimals: 18,
  },
  {
    id: 'usdt',
    name: 'Tether USD',
    symbol: 'USDT',
    icon: '₮',
    network: 'ethereum',
    contractAddress: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
    decimals: 6,
  },
  {
    id: 'usdc',
    name: 'USD Coin',
    symbol: 'USDC',
    icon: '$',
    network: 'ethereum',
    contractAddress: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    decimals: 6,
  },
  {
    id: 'bnb',
    name: 'BNB',
    symbol: 'BNB',
    icon: '🔶',
    network: 'bsc',
    decimals: 18,
  },
  {
    id: 'sol',
    name: 'Solana',
    symbol: 'SOL',
    icon: '◎',
    network: 'solana',
    decimals: 9,
  },
];

export const PRIVATE_SALE_CONFIG = {
  tokenSymbol: 'HYPE',
  tokenPrice: 0.05, // USD per token
  bonusTiers: [
    { minAmount: 10000, bonus: 30 }, // 30% bonus for $10k+
    { minAmount: 5000, bonus: 20 },  // 20% bonus for $5k+
    { minAmount: 1000, bonus: 15 },  // 15% bonus for $1k+
    { minAmount: 500, bonus: 10 },   // 10% bonus for $500+
    { minAmount: 100, bonus: 5 },    // 5% bonus for $100+
  ],
  minPurchase: 50, // USD
  maxPurchase: 100000, // USD
  targetAmount: 5000000, // $5M target
  startDate: new Date('2025-10-01'),
  endDate: new Date('2025-12-31'),
};

export const EXPLORER_URLS = {
  ethereum: 'https://etherscan.io/tx/',
  bsc: 'https://bscscan.com/tx/',
  solana: 'https://solscan.io/tx/',
  polygon: 'https://polygonscan.com/tx/',
};

export const WALLET_PROVIDERS = {
  metamask: {
    name: 'MetaMask',
    icon: '🦊',
    networks: ['ethereum', 'bsc', 'polygon'],
  },
  walletconnect: {
    name: 'WalletConnect',
    icon: '🔗',
    networks: ['ethereum', 'bsc', 'polygon', 'solana'],
  },
  phantom: {
    name: 'Phantom',
    icon: '👻',
    networks: ['solana'],
  },
};
