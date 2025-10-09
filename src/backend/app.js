const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const app = express();

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Only use morgan in development
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('combined'));
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString()
  });
});

// Mock authentication routes
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, walletAddress } = req.body;

    // Validation
    if (!email || !email.includes('@')) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    if (!password || password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters' });
    }

    if (!walletAddress || !walletAddress.startsWith('0x') || walletAddress.length !== 42) {
      return res.status(400).json({ error: 'Invalid wallet address format' });
    }

    // Check for duplicate (mock)
    if (email === 'duplicate@example.com') {
      return res.status(409).json({ error: 'Email already exists' });
    }

    // Mock successful registration
    res.status(201).json({
      user: {
        id: Date.now().toString(),
        email,
        walletAddress
      },
      token: 'mock-jwt-token-' + Date.now()
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Mock validation
    if (email === 'login@example.com' && password === 'SecurePass123!') {
      return res.status(200).json({
        user: {
          id: '12345',
          email
        },
        token: 'mock-jwt-token-' + Date.now()
      });
    }

    res.status(401).json({ error: 'Invalid credentials' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Mock wallet routes
app.get('/api/wallet/balance/:address', (req, res) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { address } = req.params;

  if (!address.startsWith('0x') || address.length !== 42) {
    return res.status(400).json({ error: 'Invalid address format' });
  }

  res.status(200).json({
    address,
    balance: '1000.0'
  });
});

app.post('/api/wallet/connect', (req, res) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { address, signature, message } = req.body;

  if (!signature || signature === 'invalid') {
    return res.status(400).json({ error: 'Invalid signature format' });
  }

  res.status(200).json({
    connected: true,
    address
  });
});

// Mock staking routes
app.post('/api/staking/stake', (req, res) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { amount, duration, transactionHash } = req.body;

  if (!amount || parseFloat(amount) <= 0) {
    return res.status(400).json({ error: 'Invalid amount' });
  }

  if (!duration || duration <= 0) {
    return res.status(400).json({ error: 'Invalid duration' });
  }

  res.status(201).json({
    stakingId: Date.now().toString(),
    amount,
    duration,
    transactionHash,
    status: 'pending'
  });
});

app.get('/api/staking/positions', (req, res) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // Return mock positions
  res.status(200).json([]);
});

app.post('/api/staking/unstake/:id', (req, res) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { id } = req.params;

  if (id === '999999') {
    return res.status(404).json({ error: 'Staking position not found' });
  }

  res.status(200).json({
    stakingId: id,
    status: 'unstaked'
  });
});

app.get('/api/staking/rewards/:address', (req, res) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  res.status(200).json({
    pendingRewards: '50.0',
    claimedRewards: '100.0',
    totalRewards: '150.0'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({ error: 'Invalid JSON format' });
  }

  res.status(500).json({ error: 'Internal server error' });
});

module.exports = app;
