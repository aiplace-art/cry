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
  tokenPrice: 0.0015, // USD per token ($0.0015 - fair price, bonuses on top)
  bonusTiers: [
    { minAmount: 500, bonus: 30 },   // 30% bonus for $500 (maximum purchase)
    { minAmount: 100, bonus: 20 },   // 20% bonus for $100+
  ],
  minPurchase: 10, // USD (low barrier to entry)
  maxPurchase: 500, // USD ($500 HARD CAP per wallet - anti-whale)
  targetAmount: 5000000, // $5M target
  startDate: new Date('2025-10-01'),
  endDate: new Date('2025-12-31'),

  // Vesting configuration
  vesting: {
    immediateUnlockPercent: 40, // 40% unlocked at purchase
    vestingDurationMonths: 6,   // 6-month vesting period
    vestingIntervalDays: 30,     // Monthly unlocks
    monthlyUnlockPercent: 10,    // 10% per month (60% total / 6 months)
  },

  // Anti-whale protection
  antiWhale: {
    maxPurchasePerWallet: 500,   // $500 maximum
    monitorLargeTransactions: true,
    requireKYCAbove: 500,         // KYC required for max amount
  },
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
