# Solana Token Deployment Scripts

This directory contains scripts for deploying tokens on Solana and listing them on pump.fun.

## Quick Start

### 1. Setup Environment
```bash
cd /Users/ai.place/Crypto/scripts/solana
./01-setup-environment.sh --network mainnet
```

### 2. Create Wallet
```bash
./02-create-wallet.sh
# Save your seed phrase securely!
```

### 3. Fund Wallet
- **Devnet**: `solana airdrop 2` or use `./utils/airdrop-devnet.sh`
- **Mainnet**: Purchase SOL and send to your wallet address

### 4. Create Token (Optional - pump.fun can do this)
```bash
./03-create-token.sh \
  --name "My Token" \
  --symbol "MTK" \
  --decimals 9 \
  --supply 1000000000
```

### 5. Upload Metadata (Optional)
```bash
./04-upload-metadata.sh \
  --token <TOKEN_MINT> \
  --image ./path/to/logo.png \
  --name "My Token" \
  --symbol "MTK"
```

### 6. List on pump.fun
```bash
./05-list-on-pumpfun.sh --token <TOKEN_MINT>
```

## Script Overview

### Core Scripts

| Script | Purpose | Prerequisites |
|--------|---------|---------------|
| `01-setup-environment.sh` | Install Solana CLI and dependencies | None |
| `02-create-wallet.sh` | Create or import Solana wallet | Solana CLI |
| `03-create-token.sh` | Create SPL token on-chain | Funded wallet |
| `04-upload-metadata.sh` | Prepare token metadata | Token mint |
| `05-list-on-pumpfun.sh` | Guide for pump.fun listing | Token mint |

### Utility Scripts (utils/)

| Script | Purpose |
|--------|---------|
| `check-token.sh` | View token information |
| `transfer-tokens.sh` | Transfer tokens between addresses |
| `airdrop-devnet.sh` | Request devnet SOL for testing |

## Recommended Workflow

### For pump.fun (Easiest)
1. Run `01-setup-environment.sh`
2. Run `02-create-wallet.sh`
3. Fund wallet with SOL
4. Visit pump.fun and create token through their interface
5. Skip scripts 03-05!

### For Advanced Users (CLI)
1. Run scripts 01-05 in order
2. Use utility scripts as needed

## Network Selection

### Devnet (Testing)
```bash
./01-setup-environment.sh --network devnet
./utils/airdrop-devnet.sh 2
```

### Mainnet (Production)
```bash
./01-setup-environment.sh --network mainnet
# Purchase and send real SOL to wallet
```

## Cost Breakdown

| Method | Platform Fee | Network Fee | Total |
|--------|--------------|-------------|-------|
| Solana CLI | 0 SOL | ~0.003 SOL | ~0.003 SOL |
| pump.fun Web | 0.02 SOL | ~0.001 SOL | ~0.021 SOL |
| pump.fun API | 0.001 SOL | ~0.001 SOL | ~0.002 SOL |

## Important Notes

### Security
- Never share your seed phrase or private keys
- Keep backups in multiple secure locations
- Use hardware wallets for large amounts
- Test on devnet before mainnet deployment

### pump.fun Specifics
- Trading fee: 1% per transaction
- Creator earnings: 0.05% of all trades
- Auto-graduates to Raydium at $60k market cap
- 1 billion token supply standard
- Immediate trading after creation

## Troubleshooting

### Insufficient Balance
```bash
# Check balance
solana balance

# Devnet: Request airdrop
./utils/airdrop-devnet.sh 2

# Mainnet: Purchase SOL
```

### Wrong Network
```bash
# Check current network
solana config get

# Switch to devnet
solana config set --url https://api.devnet.solana.com

# Switch to mainnet
solana config set --url https://api.mainnet-beta.solana.com
```

### Token Info
```bash
./utils/check-token.sh <TOKEN_MINT_ADDRESS>
```

## Resources

### Documentation
- [Complete Deployment Guide](/Users/ai.place/Crypto/docs/solana-deployment-guide.md)
- [Solana Docs](https://docs.solana.com)
- [SPL Token Docs](https://spl.solana.com/token)
- [pump.fun](https://pump.fun)

### Tools
- [Solana Explorer](https://explorer.solana.com)
- [Solscan](https://solscan.io)
- [Phantom Wallet](https://phantom.app)
- [Dexscreener](https://dexscreener.com)

### Community
- [Solana Discord](https://discord.gg/solana)
- [pump.fun Discord](https://discord.gg/pumpfun)

## Examples

### Create Token on Devnet
```bash
# Setup
./01-setup-environment.sh --network devnet
./02-create-wallet.sh
./utils/airdrop-devnet.sh 2

# Create token
./03-create-token.sh \
  --name "Test Token" \
  --symbol "TEST" \
  --decimals 9 \
  --supply 1000000000

# Check token
./utils/check-token.sh <TOKEN_MINT>
```

### Transfer Tokens
```bash
./utils/transfer-tokens.sh \
  --token <TOKEN_MINT> \
  --to <RECIPIENT_ADDRESS> \
  --amount 1000
```

## Support

For issues or questions:
1. Check the [troubleshooting guide](/Users/ai.place/Crypto/docs/solana-deployment-guide.md#troubleshooting)
2. Review [Solana documentation](https://docs.solana.com)
3. Join [Solana Discord](https://discord.gg/solana)

## License

These scripts are provided as-is for educational and development purposes.
