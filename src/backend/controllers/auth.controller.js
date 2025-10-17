/**
 * Authentication Controller - Web3 and Web2 auth handlers
 */

const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const { ethers } = require('ethers');
const referralService = require('../services/referral.service');
const { query } = require('../utils/database-pool');
const { logger } = require('../config/logger');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRES_IN = '7d';

class AuthController {
  /**
   * Generate authentication nonce for Web3
   * POST /api/auth/web3/nonce
   * Body: { walletAddress: string }
   */
  async generateNonce(req, res, next) {
    try {
      const { walletAddress } = req.body;

      if (!walletAddress || !ethers.isAddress(walletAddress)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid wallet address'
        });
      }

      const nonce = `Sign this message to authenticate with HypeAI: ${crypto.randomBytes(16).toString('hex')}`;
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

      // Store nonce
      await query(
        `INSERT INTO auth_nonces (wallet_address, nonce, expires_at)
         VALUES ($1, $2, $3)
         ON CONFLICT (wallet_address)
         DO UPDATE SET nonce = $2, expires_at = $3, created_at = NOW()`,
        [walletAddress.toLowerCase(), nonce, expiresAt]
      );

      res.json({
        success: true,
        data: {
          nonce,
          expiresAt
        }
      });
    } catch (error) {
      logger.error('Generate nonce error:', error);
      next(error);
    }
  }

  /**
   * Verify Web3 signature and login
   * POST /api/auth/web3/verify
   * Body: { walletAddress: string, signature: string, referrerCode?: string }
   */
  async verifyWeb3Signature(req, res, next) {
    try {
      const { walletAddress, signature, referrerCode } = req.body;

      if (!walletAddress || !ethers.isAddress(walletAddress)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid wallet address'
        });
      }

      if (!signature) {
        return res.status(400).json({
          success: false,
          error: 'Signature is required'
        });
      }

      // Get nonce
      const nonceResult = await query(
        `SELECT nonce, expires_at FROM auth_nonces
         WHERE wallet_address = $1 AND expires_at > NOW()`,
        [walletAddress.toLowerCase()]
      );

      if (nonceResult.rows.length === 0) {
        return res.status(401).json({
          success: false,
          error: 'Nonce not found or expired. Please request a new nonce.'
        });
      }

      const { nonce } = nonceResult.rows[0];

      // Verify signature
      try {
        const recoveredAddress = ethers.verifyMessage(nonce, signature);

        if (recoveredAddress.toLowerCase() !== walletAddress.toLowerCase()) {
          return res.status(401).json({
            success: false,
            error: 'Invalid signature'
          });
        }
      } catch (error) {
        return res.status(401).json({
          success: false,
          error: 'Signature verification failed'
        });
      }

      // Delete used nonce
      await query(
        'DELETE FROM auth_nonces WHERE wallet_address = $1',
        [walletAddress.toLowerCase()]
      );

      // Find or create user
      let user = await referralService.getUserByWallet(walletAddress);

      if (!user) {
        // Create new user
        user = await referralService.createUser({
          walletAddress: walletAddress.toLowerCase(),
          referrerCode
        });
      }

      // Update last login
      await referralService.updateLastLogin(user.id);

      // Generate JWT
      const token = jwt.sign(
        {
          userId: user.id,
          walletAddress: user.wallet_address
        },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
      );

      // Store session
      const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
      await query(
        `INSERT INTO user_sessions (user_id, token_hash, ip_address, user_agent, expires_at)
         VALUES ($1, $2, $3, $4, NOW() + INTERVAL '7 days')`,
        [user.id, tokenHash, req.ip, req.headers['user-agent'] || null]
      );

      res.json({
        success: true,
        data: {
          token,
          user: {
            id: user.id,
            walletAddress: user.wallet_address,
            referralCode: user.referral_code,
            totalEarnings: user.total_earnings,
            totalReferrals: user.total_referrals
          }
        }
      });
    } catch (error) {
      logger.error('Web3 verification error:', error);
      next(error);
    }
  }

  /**
   * Register with email/password (for Russia)
   * POST /api/auth/register
   * Body: { email: string, password: string, referrerCode?: string }
   */
  async register(req, res, next) {
    try {
      const { email, password, referrerCode } = req.body;

      // Validation
      if (!email || !email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid email address'
        });
      }

      if (!password || password.length < 8) {
        return res.status(400).json({
          success: false,
          error: 'Password must be at least 8 characters'
        });
      }

      // Check if email exists
      const existingUser = await referralService.getUserByEmail(email);
      if (existingUser) {
        return res.status(409).json({
          success: false,
          error: 'Email already registered'
        });
      }

      // Hash password
      const passwordHash = await bcrypt.hash(password, 12);

      // Create user
      const user = await referralService.createUser({
        email: email.toLowerCase(),
        passwordHash,
        referrerCode
      });

      // Generate JWT
      const token = jwt.sign(
        {
          userId: user.id,
          email: user.email
        },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
      );

      // Store session
      const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
      await query(
        `INSERT INTO user_sessions (user_id, token_hash, ip_address, user_agent, expires_at)
         VALUES ($1, $2, $3, $4, NOW() + INTERVAL '7 days')`,
        [user.id, tokenHash, req.ip, req.headers['user-agent'] || null]
      );

      res.status(201).json({
        success: true,
        data: {
          token,
          user: {
            id: user.id,
            email: user.email,
            referralCode: user.referral_code
          }
        }
      });
    } catch (error) {
      logger.error('Registration error:', error);
      next(error);
    }
  }

  /**
   * Login with email/password
   * POST /api/auth/login
   * Body: { email: string, password: string }
   */
  async login(req, res, next) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({
          success: false,
          error: 'Email and password are required'
        });
      }

      // Find user
      const user = await referralService.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({
          success: false,
          error: 'Invalid credentials'
        });
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.password_hash);
      if (!isValidPassword) {
        return res.status(401).json({
          success: false,
          error: 'Invalid credentials'
        });
      }

      // Update last login
      await referralService.updateLastLogin(user.id);

      // Generate JWT
      const token = jwt.sign(
        {
          userId: user.id,
          email: user.email
        },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
      );

      // Store session
      const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
      await query(
        `INSERT INTO user_sessions (user_id, token_hash, ip_address, user_agent, expires_at)
         VALUES ($1, $2, $3, $4, NOW() + INTERVAL '7 days')`,
        [user.id, tokenHash, req.ip, req.headers['user-agent'] || null]
      );

      res.json({
        success: true,
        data: {
          token,
          user: {
            id: user.id,
            email: user.email,
            walletAddress: user.wallet_address,
            referralCode: user.referral_code,
            totalEarnings: user.total_earnings,
            totalReferrals: user.total_referrals
          }
        }
      });
    } catch (error) {
      logger.error('Login error:', error);
      next(error);
    }
  }

  /**
   * Logout
   * POST /api/auth/logout
   */
  async logout(req, res, next) {
    try {
      const token = req.headers.authorization?.split(' ')[1];

      if (token) {
        const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

        await query(
          'UPDATE user_sessions SET is_active = false WHERE token_hash = $1',
          [tokenHash]
        );
      }

      res.json({
        success: true,
        message: 'Logged out successfully'
      });
    } catch (error) {
      logger.error('Logout error:', error);
      next(error);
    }
  }

  /**
   * Get current user
   * GET /api/auth/me
   */
  async getCurrentUser(req, res, next) {
    try {
      const userId = req.userId;

      const user = await referralService.getUserById(userId);

      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'User not found'
        });
      }

      res.json({
        success: true,
        data: {
          user: {
            id: user.id,
            email: user.email,
            walletAddress: user.wallet_address,
            referralCode: user.referral_code,
            totalEarnings: user.total_earnings,
            totalReferrals: user.total_referrals,
            createdAt: user.created_at
          }
        }
      });
    } catch (error) {
      logger.error('Get current user error:', error);
      next(error);
    }
  }
}

module.exports = new AuthController();
