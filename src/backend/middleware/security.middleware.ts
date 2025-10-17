import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
import { ethers } from 'ethers';
import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

// Rate limiting for purchase endpoints
export const purchaseRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // Max 10 purchases per hour
  message: 'Too many purchase attempts. Please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req: Request) => {
    // Rate limit by wallet address
    return req.body.walletAddress || req.ip || 'unknown';
  },
  skip: (req: Request) => {
    // Skip rate limiting for whitelisted addresses
    const whitelist = process.env.RATE_LIMIT_WHITELIST?.split(',') || [];
    return whitelist.includes(req.body.walletAddress?.toLowerCase());
  }
});

// General API rate limiter
export const apiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Max 100 requests per 15 minutes
  message: 'Too many requests. Please try again later.',
  standardHeaders: true,
  legacyHeaders: false
});

// Wallet verification middleware
export const verifyWallet = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { walletAddress, signature, message } = req.body;

    if (!walletAddress) {
      res.status(400).json({ error: 'Wallet address is required' });
      return;
    }

    // Validate wallet address format
    if (!ethers.isAddress(walletAddress)) {
      res.status(400).json({ error: 'Invalid wallet address format' });
      return;
    }

    // If signature is provided, verify it
    if (signature && message) {
      try {
        const recoveredAddress = ethers.verifyMessage(message, signature);

        if (recoveredAddress.toLowerCase() !== walletAddress.toLowerCase()) {
          res.status(401).json({ error: 'Invalid signature' });
          return;
        }
      } catch (error) {
        res.status(401).json({ error: 'Signature verification failed' });
        return;
      }
    }

    // Check if wallet is blacklisted
    const isBlacklisted = await redis.sismember('blacklisted_wallets', walletAddress.toLowerCase());
    if (isBlacklisted) {
      res.status(403).json({ error: 'Wallet address is blacklisted' });
      return;
    }

    next();
  } catch (error) {
    console.error('Wallet verification error:', error);
    res.status(500).json({ error: 'Wallet verification failed' });
  }
};

// Anti-fraud detection middleware
export const antiFraud = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { walletAddress, amountUSD } = req.body;
    const ip = req.ip || req.headers['x-forwarded-for'] as string || 'unknown';

    // Check for suspicious patterns
    const fraudScore = await calculateFraudScore({
      walletAddress,
      amountUSD,
      ip,
      userAgent: req.headers['user-agent'] || 'unknown'
    });

    if (fraudScore > 80) {
      // High fraud risk - block
      await redis.sadd('suspicious_activity', JSON.stringify({
        wallet: walletAddress,
        ip,
        score: fraudScore,
        timestamp: new Date().toISOString()
      }));

      res.status(403).json({ error: 'Transaction blocked due to suspicious activity' });
      return;
    }

    if (fraudScore > 50) {
      // Medium risk - require additional verification
      req.body.requiresVerification = true;
    }

    next();
  } catch (error) {
    console.error('Anti-fraud check error:', error);
    // Don't block on error, just log
    next();
  }
};

async function calculateFraudScore(data: {
  walletAddress: string;
  amountUSD: number;
  ip: string;
  userAgent: string;
}): Promise<number> {
  let score = 0;

  // Check if wallet has made multiple purchases in short time
  const recentPurchases = await redis.get(`purchases:${data.walletAddress}:count`);
  if (recentPurchases && parseInt(recentPurchases) > 5) {
    score += 30;
  }

  // Check if IP has multiple wallet addresses
  const walletsFromIp = await redis.scard(`ip:${data.ip}:wallets`);
  if (walletsFromIp > 3) {
    score += 25;
  }

  // Check for unusually large amounts
  if (data.amountUSD > 50000) {
    score += 20;
  }

  // Check for suspicious user agent
  if (!data.userAgent || data.userAgent === 'unknown') {
    score += 15;
  }

  // Check if wallet is newly created (requires blockchain check)
  // This would need actual blockchain integration
  // score += await checkWalletAge(data.walletAddress);

  return score;
}

// CORS middleware for security
export const corsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'];

    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200
};

// Transaction validation middleware
export const validateTransaction = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { txHash, paymentId } = req.body;

    if (txHash) {
      // Check if transaction hash is valid format
      if (!/^0x[a-fA-F0-9]{64}$/.test(txHash)) {
        res.status(400).json({ error: 'Invalid transaction hash format' });
        return;
      }

      // Check if transaction has already been used
      const existingTx = await redis.get(`tx:${txHash}`);
      if (existingTx) {
        res.status(400).json({ error: 'Transaction already processed' });
        return;
      }
    }

    if (paymentId) {
      // Check if payment ID has already been used
      const existingPayment = await redis.get(`payment:${paymentId}`);
      if (existingPayment) {
        res.status(400).json({ error: 'Payment already processed' });
        return;
      }
    }

    next();
  } catch (error) {
    console.error('Transaction validation error:', error);
    res.status(500).json({ error: 'Transaction validation failed' });
  }
};

// Request logging middleware
export const requestLogger = (req: Request, res: Response, next: NextFunction): void => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    const logData = {
      method: req.method,
      path: req.path,
      status: res.statusCode,
      duration,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
      timestamp: new Date().toISOString()
    };

    console.log(JSON.stringify(logData));

    // Store in Redis for analytics
    redis.lpush('api_logs', JSON.stringify(logData));
    redis.ltrim('api_logs', 0, 9999); // Keep last 10k logs
  });

  next();
};

// Error handling middleware
export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  console.error('Error:', err);

  // Log error to Redis
  redis.lpush('api_errors', JSON.stringify({
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    timestamp: new Date().toISOString()
  }));

  if (err.name === 'ValidationError') {
    res.status(400).json({ error: err.message });
    return;
  }

  if (err.name === 'UnauthorizedError') {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  res.status(500).json({ error: 'Internal server error' });
};

// Input sanitization middleware
export const sanitizeInput = (req: Request, res: Response, next: NextFunction): void => {
  // Sanitize all string inputs
  const sanitize = (obj: any): any => {
    if (typeof obj === 'string') {
      return obj.trim().replace(/[<>]/g, '');
    }
    if (typeof obj === 'object' && obj !== null) {
      for (const key in obj) {
        obj[key] = sanitize(obj[key]);
      }
    }
    return obj;
  };

  req.body = sanitize(req.body);
  req.query = sanitize(req.query);
  req.params = sanitize(req.params);

  next();
};
