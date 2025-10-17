/// <reference types="vite/client" />

interface ImportMetaEnv {
  // Payment Gateway API Keys
  readonly NEXT_PUBLIC_COINBASE_COMMERCE_API_KEY: string;
  readonly NEXT_PUBLIC_NOWPAYMENTS_API_KEY: string;
  readonly NEXT_PUBLIC_COINGATE_API_KEY: string;

  // Web3 Configuration
  readonly NEXT_PUBLIC_INFURA_ID: string;
  readonly NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID: string;

  // Smart Contract Addresses
  readonly NEXT_PUBLIC_TOKEN_CONTRACT_ADDRESS: string;
  readonly NEXT_PUBLIC_SALE_CONTRACT_ADDRESS: string;

  // Email Service
  readonly SENDGRID_API_KEY: string;

  // Database
  readonly DATABASE_URL: string;

  // Blockchain RPC
  readonly RPC_URL: string;
  readonly PRIVATE_KEY: string;

  // Application
  readonly BASE_URL: string;
  readonly NODE_ENV: 'development' | 'production' | 'test';
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare global {
  interface Window {
    ethereum?: any;
    solana?: any;
  }
}

export {};
