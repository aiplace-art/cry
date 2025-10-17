import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export const config = {
  // Server configuration
  server: {
    port: parseInt(process.env.PORT || '3001'),
    env: process.env.NODE_ENV || 'development',
    apiUrl: process.env.API_URL || 'http://localhost:3001',
    frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000'
  },

  // Database configuration
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    name: process.env.DB_NAME || 'private_sale',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '',
    poolSize: parseInt(process.env.DB_POOL_SIZE || '20')
  },

  // Redis configuration
  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379'
  },

  // Payment gateway configuration
  payment: {
    coinbase: {
      apiKey: process.env.COINBASE_API_KEY || '',
      secret: process.env.COINBASE_SECRET || '',
      webhookSecret: process.env.COINBASE_WEBHOOK_SECRET || ''
    },
    nowpayments: {
      apiKey: process.env.NOWPAYMENTS_API_KEY || '',
      secret: process.env.NOWPAYMENTS_SECRET || '',
      ipnSecret: process.env.NOWPAYMENTS_IPN_SECRET || ''
    },
    coingate: {
      apiKey: process.env.COINGATE_API_KEY || '',
      secret: process.env.COINGATE_SECRET || ''
    }
  },

  // Email configuration
  email: {
    provider: process.env.EMAIL_PROVIDER || 'smtp',
    from: process.env.EMAIL_FROM || 'noreply@cryptoproject.com',
    smtp: {
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      user: process.env.SMTP_USER || '',
      pass: process.env.SMTP_PASS || ''
    },
    aws: {
      region: process.env.AWS_REGION || 'us-east-1',
      accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || ''
    }
  },

  // Blockchain configuration
  blockchain: {
    rpcUrl: process.env.RPC_URL || 'https://mainnet.infura.io/v3/YOUR-PROJECT-ID',
    chainId: parseInt(process.env.CHAIN_ID || '1'),
    tokenContractAddress: process.env.TOKEN_CONTRACT_ADDRESS || '',
    privateKey: process.env.PRIVATE_KEY || ''
  },

  // Security configuration
  security: {
    jwtSecret: process.env.JWT_SECRET || 'your-secret-key',
    allowedOrigins: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
    rateLimitWhitelist: process.env.RATE_LIMIT_WHITELIST?.split(',') || []
  },

  // Sale configuration
  sale: {
    minPurchaseUSD: parseFloat(process.env.MIN_PURCHASE_USD || '100'),
    maxPurchaseUSD: parseFloat(process.env.MAX_PURCHASE_USD || '100000'),
    tokenPriceUSD: parseFloat(process.env.TOKEN_PRICE_USD || '0.0001'),
    referralBonusPercentage: parseInt(process.env.REFERRAL_BONUS_PERCENTAGE || '10'),
    vestingMonths: parseInt(process.env.VESTING_MONTHS || '12'),
    initialUnlockPercentage: parseInt(process.env.INITIAL_UNLOCK_PERCENTAGE || '10')
  }
};

// Validate required environment variables
export function validateConfig(): void {
  const required = [
    'DB_PASSWORD',
    'COINBASE_API_KEY',
    'NOWPAYMENTS_API_KEY',
    'COINGATE_API_KEY',
    'TOKEN_CONTRACT_ADDRESS'
  ];

  const missing = required.filter(key => !process.env[key]);

  if (missing.length > 0) {
    console.warn('Warning: Missing required environment variables:', missing.join(', '));
  }
}
