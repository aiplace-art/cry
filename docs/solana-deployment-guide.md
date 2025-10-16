# Solana Token Deployment Guide for pump.fun

## Table of Contents
1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Solana CLI Setup](#solana-cli-setup)
4. [Wallet Creation and Funding](#wallet-creation-and-funding)
5. [Token Creation Process](#token-creation-process)
6. [pump.fun Integration](#pumpfun-integration)
7. [Cost Breakdown](#cost-breakdown)
8. [Step-by-Step Deployment](#step-by-step-deployment)
9. [API Integration Options](#api-integration-options)
10. [Troubleshooting](#troubleshooting)

---

## Overview

This guide provides comprehensive instructions for deploying tokens on the Solana blockchain and listing them on pump.fun, a leading memecoin launchpad platform.

### What is pump.fun?

pump.fun is a cryptocurrency launchpad on Solana that enables users to:
- Create tokens in minutes without coding
- Trade immediately on the platform
- Automatically graduate to Raydium DEX at $60,000 market cap
- Earn 0.05% of trading fees on your tokens

**Platform Statistics (2025):**
- 11.9 million+ tokens generated
- 71% of Solana's daily token launches
- $1.6 billion PUMP token market cap
- $600 million raised in ICO

---

## Prerequisites

### Required Tools
- Node.js v16+ installed
- Solana CLI tools
- Solana wallet (Phantom, Solflare, or CLI wallet)
- Minimum 0.05 SOL for deployment and fees

### Knowledge Requirements
- Basic command-line operations
- Understanding of Solana account model
- Familiarity with token economics

---

## Solana CLI Setup

### Installation

#### macOS/Linux
```bash
sh -c "$(curl -sSfL https://release.solana.com/stable/install)"
```

#### Windows
```powershell
curl https://release.solana.com/stable/solana-install-init-x86_64-pc-windows-msvc.exe --output solana-install.exe
.\solana-install.exe
```

### Verify Installation
```bash
solana --version
# Expected output: solana-cli 1.18.x (or latest version)
```

### Configure Network
```bash
# Set to mainnet for production
solana config set --url https://api.mainnet-beta.solana.com

# Set to devnet for testing
solana config set --url https://api.devnet.solana.com

# Verify configuration
solana config get
```

### Install SPL Token CLI
```bash
cargo install spl-token-cli
# or
npm install -g @solana/spl-token
```

---

## Wallet Creation and Funding

### Create New Wallet

#### Using Solana CLI
```bash
# Generate new keypair
solana-keygen new --outfile ~/.config/solana/id.json

# Set as default wallet
solana config set --keypair ~/.config/solana/id.json

# Get wallet address
solana address
```

#### Using Phantom Wallet (Recommended for pump.fun)
1. Install Phantom browser extension
2. Create new wallet or import existing
3. Securely store seed phrase
4. Enable developer mode in settings

### Fund Your Wallet

#### Mainnet-Beta
1. Purchase SOL from exchange (Coinbase, Binance, etc.)
2. Withdraw to your Solana address
3. Minimum recommended: 0.1 SOL for deployment and fees

#### Devnet (Testing)
```bash
solana airdrop 2
```

### Verify Balance
```bash
solana balance
# or check specific address
solana balance <YOUR_ADDRESS>
```

---

## Token Creation Process

### Using Solana CLI

#### 1. Create Token Mint
```bash
spl-token create-token --decimals 9
# Returns: Creating token <TOKEN_MINT_ADDRESS>
# Save this address - you'll need it!
```

#### 2. Create Token Account
```bash
spl-token create-account <TOKEN_MINT_ADDRESS>
# Returns: Creating account <TOKEN_ACCOUNT_ADDRESS>
```

#### 3. Mint Initial Supply
```bash
# Mint 1 billion tokens (standard for pump.fun)
spl-token mint <TOKEN_MINT_ADDRESS> 1000000000
```

#### 4. Check Token Supply
```bash
spl-token supply <TOKEN_MINT_ADDRESS>
```

### Cost for CLI Method
- Network fees: ~0.003 SOL
- Rent-exempt balance: ~0.0015 SOL per account
- Total: ~0.005 SOL

---

## pump.fun Integration

### Method 1: Web Interface (Easiest)

#### Step-by-Step Process:

1. **Visit pump.fun**
   - Navigate to https://pump.fun
   - Click "Connect Wallet" (top right)
   - Select your wallet (Phantom recommended)

2. **Create Token**
   - Click "Create Token" or "Start a New Coin"
   - Fill in required fields:
     - Name: Your token's full name
     - Ticker: 3-5 character symbol
     - Description: Compelling project description
     - Image: Upload token logo (recommended: 512x512px PNG)

3. **Deploy**
   - Review details
   - Click "Create Coin"
   - Confirm transaction in wallet
   - Cost: 0.02 SOL

4. **Post-Creation**
   - Token is immediately tradable
   - You receive creator benefits (0.05% of all trades)
   - Token auto-graduates to Raydium at $60k market cap

### Method 2: API Integration

#### Using PumpFun API
```javascript
// Example token creation
const response = await fetch('https://api.pumpfunapi.org/v1/create-token', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_API_KEY'
  },
  body: JSON.stringify({
    name: 'My Token',
    symbol: 'MTK',
    description: 'A revolutionary memecoin',
    initialSupply: 1000000000,
    decimals: 9,
    metadata: {
      image: 'https://your-cdn.com/logo.png',
      website: 'https://yourproject.com',
      twitter: '@yourproject'
    }
  })
});

const { tokenMint, transaction } = await response.json();
```

#### Using QuickNode Metis
```typescript
import { Connection, Keypair, Transaction } from '@solana/web3.js';

const connection = new Connection('YOUR_QUICKNODE_ENDPOINT');
const wallet = Keypair.fromSecretKey(/* your secret key */);

// Get quote for pump.fun token
const quote = await fetch('YOUR_QUICKNODE_ENDPOINT/pump-fun/quote', {
  method: 'POST',
  body: JSON.stringify({
    mint: 'TOKEN_MINT_ADDRESS',
    amount: 1000000,
    action: 'buy'
  })
});

// Execute swap
const swap = await fetch('YOUR_QUICKNODE_ENDPOINT/pump-fun/swap', {
  method: 'POST',
  body: JSON.stringify({
    mint: 'TOKEN_MINT_ADDRESS',
    amount: 1000000,
    action: 'buy',
    userPublicKey: wallet.publicKey.toString()
  })
});
```

---

## Cost Breakdown

### Creation Costs

| Method | Platform Fee | Network Fee | Total (SOL) | Total (USD)* |
|--------|--------------|-------------|-------------|--------------|
| Solana CLI | 0 | ~0.003 | ~0.003 | ~$0.60 |
| pump.fun Web | 0.02 | ~0.001 | ~0.021 | ~$4.20 |
| pump.fun API | 0.001 | ~0.001 | ~0.002 | ~$0.40 |
| No-Code Tools | 0.05 | ~0.0003 | ~0.0503 | ~$10.06 |

*Based on SOL price of ~$200 (January 2025)

### Trading Fees
- pump.fun trading fee: 1% per transaction (buy/sell)
- Creator earnings: 0.05% of all trading volume
- PumpPortal API: Additional 0.5% if using their trading API

### Ongoing Costs
- Rent-exempt balance: ~0.0015 SOL per account (one-time)
- Metadata storage: Free (on-chain) or IPFS costs (optional)
- Marketing/promotion: Variable

---

## Step-by-Step Deployment

### Complete Deployment Workflow

#### Phase 1: Preparation (15 minutes)
```bash
# 1. Install prerequisites
./scripts/solana/01-setup-environment.sh

# 2. Create and fund wallet
./scripts/solana/02-create-wallet.sh

# 3. Verify setup
solana balance
solana config get
```

#### Phase 2: Token Creation (5 minutes)

**Option A: Using pump.fun (Recommended)**
1. Connect wallet to pump.fun
2. Fill token details form
3. Upload logo and metadata
4. Click "Create Coin"
5. Confirm transaction

**Option B: Using CLI**
```bash
# Create token
./scripts/solana/03-create-token.sh \
  --name "My Token" \
  --symbol "MTK" \
  --decimals 9 \
  --supply 1000000000

# Save the token mint address returned
```

#### Phase 3: Metadata and Branding (30 minutes)
```bash
# Upload metadata to IPFS or Arweave
./scripts/solana/04-upload-metadata.sh \
  --token <TOKEN_MINT> \
  --image ./assets/logo.png \
  --name "My Token" \
  --symbol "MTK"
```

#### Phase 4: pump.fun Listing (If using CLI method)
- Manually create pump.fun listing with token mint
- Or use API integration script
```bash
./scripts/solana/05-list-on-pumpfun.sh --token <TOKEN_MINT>
```

#### Phase 5: Verification (5 minutes)
```bash
# Verify token on Solscan
# https://solscan.io/token/<TOKEN_MINT>

# Check pump.fun listing
# https://pump.fun/coin/<TOKEN_MINT>

# Verify supply and metadata
spl-token supply <TOKEN_MINT>
```

---

## API Integration Options

### 1. PumpFun Official API

**Base URL:** `https://api.pumpfunapi.org/v1`

**Authentication:**
```bash
# Get API key from PumpFun dashboard
export PUMPFUN_API_KEY="your_api_key"
```

**Endpoints:**
- `POST /create-token` - Create new token
- `GET /token/:mint` - Get token details
- `GET /token/:mint/trades` - Get trade history
- `POST /token/:mint/metadata` - Update metadata

**Rate Limits:**
- Free tier: 100 requests/hour
- Pro tier: 1000 requests/hour

### 2. QuickNode Metis

**Features:**
- REST endpoints for quotes and swaps
- Real-time WebSocket updates
- Historical data access

**Setup:**
```bash
npm install @quicknode/sdk
```

**Example:**
```typescript
import { QuickNode } from '@quicknode/sdk';

const qn = new QuickNode({
  endpoint: 'YOUR_ENDPOINT',
  token: 'YOUR_TOKEN'
});

// Get pump.fun quote
const quote = await qn.pumpFun.getQuote({
  mint: 'TOKEN_MINT',
  amount: 1000000,
  action: 'buy'
});
```

### 3. Bitquery GraphQL API

**Features:**
- Comprehensive on-chain data
- Historical OHLCV data
- Bonding curve analytics

**Example Query:**
```graphql
query PumpFunTokenData {
  Solana {
    DEXTradeByTokens(
      where: {
        Trade: { Dex: { ProtocolName: { is: "pump" } } }
        Transaction: { Result: { Success: true } }
      }
    ) {
      Trade {
        Currency {
          Symbol
          Name
          MintAddress
        }
        Price
        PriceInUSD
      }
    }
  }
}
```

### 4. Moralis Solana API

**Features:**
- Token metadata retrieval
- Real-time price data
- Liquidity information

**Setup:**
```bash
npm install moralis
```

---

## Troubleshooting

### Common Issues and Solutions

#### Issue 1: Insufficient SOL Balance
**Error:** `Attempt to debit an account but found no record of a prior credit`

**Solution:**
```bash
# Check balance
solana balance

# Request airdrop (devnet only)
solana airdrop 2

# For mainnet, purchase SOL from exchange
```

#### Issue 2: Network Connection Failed
**Error:** `Failed to get recent blockhash: connection refused`

**Solution:**
```bash
# Check network configuration
solana config get

# Set correct RPC endpoint
solana config set --url https://api.mainnet-beta.solana.com

# Or use QuickNode/Alchemy for better reliability
solana config set --url https://your-quicknode-endpoint.com
```

#### Issue 3: Token Creation Failed
**Error:** `Transaction simulation failed: Error processing Instruction`

**Solutions:**
```bash
# 1. Verify wallet has enough SOL (minimum 0.005)
solana balance

# 2. Check if token program is accessible
solana program show TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA

# 3. Increase compute units
spl-token create-token --decimals 9 -- --compute-unit-price 1000

# 4. Wait and retry - network might be congested
```

#### Issue 4: Metadata Upload Failed
**Error:** `Failed to upload metadata to Arweave/IPFS`

**Solutions:**
```bash
# Use alternative storage provider
# Try Arweave instead of IPFS or vice versa

# Ensure image is proper format and size
# Recommended: PNG, 512x512px, < 1MB

# Check API keys are valid
echo $ARWEAVE_KEY
echo $PINATA_API_KEY
```

#### Issue 5: pump.fun Connection Issues
**Error:** `Wallet connection failed`

**Solutions:**
1. Clear browser cache and cookies
2. Try different browser
3. Ensure Phantom wallet is unlocked
4. Switch to correct network in wallet settings
5. Disable conflicting browser extensions

#### Issue 6: Transaction Taking Too Long
**Symptoms:** Transaction pending for > 60 seconds

**Solutions:**
```bash
# Check transaction status
solana confirm <TRANSACTION_SIGNATURE>

# If stuck, check if blockhash expired
solana transaction-history <YOUR_ADDRESS>

# Retry with fresh blockhash
# Most transactions auto-retry
```

#### Issue 7: Token Not Showing on pump.fun
**Symptoms:** Token created but not visible on platform

**Solutions:**
1. Wait 1-2 minutes for indexing
2. Verify token mint address is correct
3. Check if token was created on correct network
4. Clear pump.fun cache (Ctrl+F5)
5. Contact pump.fun support with token mint

#### Issue 8: Rent-Exempt Balance Error
**Error:** `Insufficient funds for rent-exempt balance`

**Solution:**
```bash
# Calculate required rent
solana rent <BYTES>

# For token account: ~0.00203928 SOL
# For mint account: ~0.00144768 SOL

# Ensure wallet has extra SOL beyond transaction fees
```

---

## Security Best Practices

### Wallet Security
1. Never share private keys or seed phrases
2. Use hardware wallet for large amounts
3. Enable 2FA on exchanges
4. Store backups in multiple secure locations
5. Use different wallets for testing and production

### Smart Contract Security
1. Audit all custom programs before mainnet deployment
2. Use verified programs from official Solana libraries
3. Test thoroughly on devnet first
4. Implement proper access controls
5. Consider using multisig wallets for token authority

### API Security
1. Keep API keys in environment variables
2. Never commit credentials to version control
3. Rotate API keys regularly
4. Use rate limiting to prevent abuse
5. Implement proper error handling

---

## Next Steps

### After Deployment
1. **Marketing & Community**
   - Create social media presence (Twitter, Discord, Telegram)
   - Engage with Solana and pump.fun communities
   - Consider influencer partnerships

2. **Liquidity Management**
   - Monitor bonding curve progress
   - Prepare for Raydium graduation at $60k market cap
   - Consider adding additional liquidity

3. **Development**
   - Build additional utilities for token
   - Create NFT collections or governance features
   - Integrate with other Solana protocols

4. **Monitoring**
   - Track trading volume and holder count
   - Monitor price action and market sentiment
   - Respond to community feedback

---

## Resources

### Official Documentation
- Solana Docs: https://docs.solana.com
- SPL Token Docs: https://spl.solana.com/token
- pump.fun: https://pump.fun
- PumpFun API Docs: https://docs.pumpfunapi.org

### Development Tools
- Solana Explorer: https://explorer.solana.com
- Solscan: https://solscan.io
- QuickNode: https://www.quicknode.com
- Bitquery: https://bitquery.io

### Community
- Solana Discord: https://discord.gg/solana
- pump.fun Discord: https://discord.gg/pumpfun
- Solana Developers: https://github.com/solana-labs

### Utilities
- Phantom Wallet: https://phantom.app
- Solflare Wallet: https://solflare.com
- Jupiter Aggregator: https://jup.ag
- Raydium DEX: https://raydium.io

---

## Conclusion

This guide covers the complete process of deploying a Solana token and listing it on pump.fun. For the most cost-effective approach, use pump.fun's web interface directly. For programmatic deployment at scale, integrate with their API or use QuickNode's Metis endpoints.

**Key Takeaways:**
- Minimum 0.05 SOL needed for deployment
- pump.fun handles bonding curve and DEX graduation automatically
- Web interface is easiest, API is most scalable
- Always test on devnet before mainnet deployment
- Marketing and community engagement are crucial for success

Good luck with your token launch!
