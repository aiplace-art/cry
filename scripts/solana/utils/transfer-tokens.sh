#!/bin/bash

################################################################################
# Token Transfer Script
#
# This script transfers SPL tokens between addresses
#
# Usage: ./transfer-tokens.sh --token <MINT> --to <ADDRESS> --amount <AMOUNT>
################################################################################

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --token)
            TOKEN_MINT="$2"
            shift 2
            ;;
        --to)
            RECIPIENT="$2"
            shift 2
            ;;
        --amount)
            AMOUNT="$2"
            shift 2
            ;;
        *)
            echo -e "${RED}Unknown option: $1${NC}"
            echo "Usage: $0 --token <MINT> --to <ADDRESS> --amount <AMOUNT>"
            exit 1
            ;;
    esac
done

# Validate arguments
if [ -z "$TOKEN_MINT" ] || [ -z "$RECIPIENT" ] || [ -z "$AMOUNT" ]; then
    echo -e "${RED}Error: Missing required arguments${NC}"
    echo "Usage: $0 --token <MINT> --to <ADDRESS> --amount <AMOUNT>"
    exit 1
fi

echo -e "${GREEN}=== Token Transfer ===${NC}"
echo ""
echo "Token: $TOKEN_MINT"
echo "To: $RECIPIENT"
echo "Amount: $AMOUNT"
echo ""

# Get sender address
SENDER=$(solana address)
echo "From: $SENDER"
echo ""

# Check balance
echo "Checking balances..."
echo ""
echo "Your token balance:"
spl-token balance $TOKEN_MINT
echo ""

# Confirm transfer
read -p "Proceed with transfer? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Transfer cancelled"
    exit 0
fi

# Perform transfer
echo ""
echo "Transferring tokens..."
spl-token transfer $TOKEN_MINT $AMOUNT $RECIPIENT

echo ""
echo -e "${GREEN}✓ Transfer complete!${NC}"
echo ""

# Show new balance
echo "Your new balance:"
spl-token balance $TOKEN_MINT
