#!/bin/bash

################################################################################
# Devnet SOL Airdrop Script
#
# This script requests SOL airdrops on devnet for testing
#
# Usage: ./airdrop-devnet.sh [AMOUNT]
################################################################################

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Default amount
AMOUNT=${1:-2}

echo -e "${GREEN}=== Devnet SOL Airdrop ===${NC}"
echo ""

# Check network
NETWORK=$(solana config get | grep "RPC URL" | awk '{print $3}')
if [[ $NETWORK != *"devnet"* ]]; then
    echo -e "${RED}Error: Not connected to devnet${NC}"
    echo "Current network: $NETWORK"
    echo ""
    echo "Switch to devnet with:"
    echo "  solana config set --url https://api.devnet.solana.com"
    exit 1
fi

# Get wallet address
WALLET=$(solana address)
echo "Wallet: $WALLET"
echo "Requesting: $AMOUNT SOL"
echo ""

# Check current balance
echo "Current balance:"
solana balance
echo ""

# Request airdrop
echo "Requesting airdrop..."
solana airdrop $AMOUNT

echo ""
echo "New balance:"
solana balance

echo ""
echo -e "${GREEN}✓ Airdrop complete!${NC}"
echo ""
echo "Note: Devnet SOL has no real value and is for testing only"
