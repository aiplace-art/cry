#!/bin/bash

################################################################################
# Solana Token Creation Script
#
# This script creates a new SPL token on the Solana blockchain
#
# Usage: ./03-create-token.sh --name "Token Name" --symbol "TKN" [OPTIONS]
################################################################################

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default values
DECIMALS=9
SUPPLY=1000000000
OUTPUT_DIR="$HOME/solana-tokens"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --name)
            TOKEN_NAME="$2"
            shift 2
            ;;
        --symbol)
            TOKEN_SYMBOL="$2"
            shift 2
            ;;
        --decimals)
            DECIMALS="$2"
            shift 2
            ;;
        --supply)
            SUPPLY="$2"
            shift 2
            ;;
        --output)
            OUTPUT_DIR="$2"
            shift 2
            ;;
        *)
            echo -e "${RED}Unknown option: $1${NC}"
            echo "Usage: $0 --name \"Token Name\" --symbol \"TKN\" [--decimals 9] [--supply 1000000000]"
            exit 1
            ;;
    esac
done

# Validate required arguments
if [ -z "$TOKEN_NAME" ] || [ -z "$TOKEN_SYMBOL" ]; then
    echo -e "${RED}Error: Token name and symbol are required${NC}"
    echo "Usage: $0 --name \"Token Name\" --symbol \"TKN\""
    exit 1
fi

echo -e "${GREEN}=== Solana Token Creation ===${NC}"
echo ""
echo "Token Name: $TOKEN_NAME"
echo "Token Symbol: $TOKEN_SYMBOL"
echo "Decimals: $DECIMALS"
echo "Initial Supply: $SUPPLY"
echo ""

# Check wallet balance
echo "Checking wallet balance..."
BALANCE=$(solana balance | awk '{print $1}')
echo "Current Balance: $BALANCE SOL"

# Check if balance is sufficient (minimum 0.005 SOL)
if (( $(echo "$BALANCE < 0.005" | bc -l) )); then
    echo -e "${RED}Error: Insufficient balance. Need at least 0.005 SOL${NC}"
    echo "Fund your wallet first with: solana airdrop 2 (devnet) or purchase SOL (mainnet)"
    exit 1
fi

echo ""
read -p "Proceed with token creation? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Operation cancelled."
    exit 0
fi

# Create output directory
mkdir -p "$OUTPUT_DIR"
TOKEN_INFO_FILE="$OUTPUT_DIR/${TOKEN_SYMBOL}_${TIMESTAMP}.json"

echo ""
echo -e "${BLUE}Step 1: Creating token mint...${NC}"
TOKEN_MINT=$(spl-token create-token --decimals $DECIMALS 2>&1 | grep -oP 'Creating token \K[A-Za-z0-9]+')

if [ -z "$TOKEN_MINT" ]; then
    echo -e "${RED}Error: Failed to create token mint${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Token mint created: $TOKEN_MINT${NC}"

echo ""
echo -e "${BLUE}Step 2: Creating token account...${NC}"
TOKEN_ACCOUNT=$(spl-token create-account $TOKEN_MINT 2>&1 | grep -oP 'Creating account \K[A-Za-z0-9]+')

if [ -z "$TOKEN_ACCOUNT" ]; then
    echo -e "${RED}Error: Failed to create token account${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Token account created: $TOKEN_ACCOUNT${NC}"

echo ""
echo -e "${BLUE}Step 3: Minting initial supply...${NC}"
spl-token mint $TOKEN_MINT $SUPPLY

echo -e "${GREEN}✓ Minted $SUPPLY tokens${NC}"

echo ""
echo -e "${BLUE}Step 4: Verifying token...${NC}"
TOKEN_SUPPLY=$(spl-token supply $TOKEN_MINT)
echo "Current supply: $TOKEN_SUPPLY"

# Get wallet address
WALLET_ADDRESS=$(solana address)

# Save token information
cat > "$TOKEN_INFO_FILE" << EOF
{
  "name": "$TOKEN_NAME",
  "symbol": "$TOKEN_SYMBOL",
  "decimals": $DECIMALS,
  "totalSupply": $SUPPLY,
  "mintAddress": "$TOKEN_MINT",
  "tokenAccount": "$TOKEN_ACCOUNT",
  "creator": "$WALLET_ADDRESS",
  "network": "$(solana config get | grep 'RPC URL' | awk '{print $3}')",
  "createdAt": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "timestamp": "$TIMESTAMP"
}
EOF

echo ""
echo -e "${GREEN}=== Token Created Successfully ===${NC}"
echo ""
echo "Token Details:"
echo "  Name: $TOKEN_NAME"
echo "  Symbol: $TOKEN_SYMBOL"
echo "  Mint Address: $TOKEN_MINT"
echo "  Token Account: $TOKEN_ACCOUNT"
echo "  Total Supply: $SUPPLY"
echo ""
echo "Token information saved to: $TOKEN_INFO_FILE"
echo ""

# Show on explorers
NETWORK=$(solana config get | grep "RPC URL" | awk '{print $3}')
if [[ $NETWORK == *"mainnet"* ]]; then
    echo "View on Solscan: https://solscan.io/token/$TOKEN_MINT"
    echo "View on Solana Explorer: https://explorer.solana.com/address/$TOKEN_MINT"
else
    echo "View on Solscan (Devnet): https://solscan.io/token/$TOKEN_MINT?cluster=devnet"
    echo "View on Solana Explorer (Devnet): https://explorer.solana.com/address/$TOKEN_MINT?cluster=devnet"
fi

echo ""
echo -e "${BLUE}=== Next Steps ===${NC}"
echo "1. Upload metadata with: ./04-upload-metadata.sh --token $TOKEN_MINT"
echo "2. List on pump.fun with: ./05-list-on-pumpfun.sh --token $TOKEN_MINT"
echo ""

# Optional: Disable minting authority for fixed supply
echo ""
read -p "Disable minting authority? (Recommended for fixed supply) (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "Disabling mint authority..."
    spl-token authorize $TOKEN_MINT mint --disable
    echo -e "${GREEN}✓ Mint authority disabled - supply is now fixed${NC}"
fi

# Export token mint for use in other scripts
export SOLANA_TOKEN_MINT="$TOKEN_MINT"
echo ""
echo -e "${GREEN}Token mint address exported to SOLANA_TOKEN_MINT environment variable${NC}"
