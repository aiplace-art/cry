import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Mock API endpoints
app.get('/api/v1/token/price', (req, res) => {
  res.json({ price: 0.001, change24h: 15.5 });
});

app.get('/api/v1/staking/pools', (req, res) => {
  res.json([
    { tier: 0, apy: 17, lockPeriod: 30 },
    { tier: 1, apy: 27, lockPeriod: 90 },
    { tier: 2, apy: 62, lockPeriod: 365 }
  ]);
});

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
