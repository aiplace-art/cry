#!/bin/bash

################################################################################
# Token Information Checker
#
# This script checks and displays information about a Solana token
#
# Usage: ./check-token.sh <TOKEN_MINT_ADDRESS>
################################################################################

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Check arguments
if [ -z "$1" ]; then
    echo -e "${RED}Error: Token mint address required${NC}"
    echo "Usage: $0 <TOKEN_MINT_ADDRESS>"
    exit 1
fi

TOKEN_MINT="$1"

echo -e "${GREEN}=== Token Information ===${NC}"
echo ""
echo "Token Mint: $TOKEN_MINT"
echo ""

# Check if spl-token is installed
if ! command -v spl-token &> /dev/null; then
    echo -e "${RED}Error: spl-token CLI not found${NC}"
    echo "Install with: cargo install spl-token-cli"
    exit 1
fi

# Get token supply
echo -e "${BLUE}Supply Information:${NC}"
SUPPLY=$(spl-token supply $TOKEN_MINT 2>/dev/null || echo "Error")
if [ "$SUPPLY" != "Error" ]; then
    echo "Total Supply: $SUPPLY"
else
    echo -e "${RED}Failed to get supply information${NC}"
fi
echo ""

# Get token accounts
echo -e "${BLUE}Your Token Accounts:${NC}"
spl-token accounts $TOKEN_MINT 2>/dev/null || echo "No accounts found or error occurred"
echo ""

# Get current network
NETWORK=$(solana config get | grep "RPC URL" | awk '{print $3}')
echo "Network: $NETWORK"
echo ""

# Generate explorer links
echo -e "${BLUE}Explorer Links:${NC}"
if [[ $NETWORK == *"mainnet"* ]]; then
    echo "Solscan: https://solscan.io/token/$TOKEN_MINT"
    echo "Solana Explorer: https://explorer.solana.com/address/$TOKEN_MINT"
    echo "Dexscreener: https://dexscreener.com/solana/$TOKEN_MINT"
    echo "Birdeye: https://birdeye.so/token/$TOKEN_MINT?chain=solana"
    echo "pump.fun: https://pump.fun/coin/$TOKEN_MINT"
else
    echo "Solscan (Devnet): https://solscan.io/token/$TOKEN_MINT?cluster=devnet"
    echo "Solana Explorer (Devnet): https://explorer.solana.com/address/$TOKEN_MINT?cluster=devnet"
fi
echo ""

# Try to get account info
echo -e "${BLUE}Account Details:${NC}"
solana account $TOKEN_MINT 2>/dev/null || echo "Could not fetch account details"
