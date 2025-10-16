#!/bin/bash

################################################################################
# Solana Wallet Creation Script
#
# This script creates a new Solana wallet and provides instructions for funding
#
# Usage: ./02-create-wallet.sh [--import] [--recover]
################################################################################

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

WALLET_DIR="$HOME/.config/solana"
KEYPAIR_FILE="$WALLET_DIR/id.json"
MODE="create"

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --import)
            MODE="import"
            shift
            ;;
        --recover)
            MODE="recover"
            shift
            ;;
        *)
            echo -e "${RED}Unknown option: $1${NC}"
            echo "Usage: $0 [--import] [--recover]"
            exit 1
            ;;
    esac
done

echo -e "${GREEN}=== Solana Wallet Management ===${NC}"
echo ""

# Check if wallet already exists
if [ -f "$KEYPAIR_FILE" ] && [ "$MODE" == "create" ]; then
    echo -e "${YELLOW}Warning: A wallet already exists at $KEYPAIR_FILE${NC}"
    echo ""
    read -p "Do you want to create a new wallet? This will backup the old one. (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Operation cancelled."
        exit 0
    fi

    # Backup existing wallet
    BACKUP_FILE="$WALLET_DIR/id.json.backup.$(date +%Y%m%d_%H%M%S)"
    mv "$KEYPAIR_FILE" "$BACKUP_FILE"
    echo -e "${GREEN}Old wallet backed up to: $BACKUP_FILE${NC}"
    echo ""
fi

case $MODE in
    create)
        echo "Creating new wallet..."
        echo ""
        solana-keygen new --outfile "$KEYPAIR_FILE"
        ;;

    import)
        echo "Importing wallet from private key..."
        echo ""
        echo -e "${YELLOW}Enter your base58 private key:${NC}"
        read -s PRIVATE_KEY
        echo "$PRIVATE_KEY" | solana-keygen recover 'prompt://?key=0/0' --outfile "$KEYPAIR_FILE"
        ;;

    recover)
        echo "Recovering wallet from seed phrase..."
        echo ""
        solana-keygen recover --outfile "$KEYPAIR_FILE"
        ;;
esac

# Set as default keypair
echo ""
echo "Setting as default keypair..."
solana config set --keypair "$KEYPAIR_FILE"

# Get wallet address
WALLET_ADDRESS=$(solana address)

echo ""
echo -e "${GREEN}=== Wallet Created Successfully ===${NC}"
echo ""
echo "Wallet Address: $WALLET_ADDRESS"
echo "Keypair saved to: $KEYPAIR_FILE"
echo ""

# Check network and balance
NETWORK=$(solana config get | grep "RPC URL" | awk '{print $3}')
echo "Current Network: $NETWORK"
echo ""

# Check balance
echo "Checking balance..."
BALANCE=$(solana balance)
echo "Current Balance: $BALANCE"
echo ""

# Provide funding instructions
if [[ $BALANCE == "0 SOL" ]]; then
    if [[ $NETWORK == *"devnet"* ]]; then
        echo -e "${BLUE}=== Funding Instructions (Devnet) ===${NC}"
        echo "Request an airdrop with:"
        echo "  solana airdrop 2"
        echo ""
        echo "Or use the web faucet:"
        echo "  https://faucet.solana.com/"
    else
        echo -e "${BLUE}=== Funding Instructions (Mainnet) ===${NC}"
        echo "1. Purchase SOL from an exchange (Coinbase, Binance, etc.)"
        echo "2. Withdraw to your wallet address: $WALLET_ADDRESS"
        echo ""
        echo "Recommended minimum for token deployment: 0.1 SOL"
    fi
    echo ""
fi

# Security reminder
echo -e "${RED}=== IMPORTANT SECURITY REMINDERS ===${NC}"
echo "1. NEVER share your seed phrase or private key"
echo "2. Store your seed phrase in a secure location"
echo "3. Consider using a hardware wallet for large amounts"
echo "4. Keep multiple backups in different locations"
echo "5. The keypair file at $KEYPAIR_FILE gives full access to your wallet"
echo ""

# Create a wallet info file
WALLET_INFO_FILE="$WALLET_DIR/wallet-info.txt"
cat > "$WALLET_INFO_FILE" << EOF
Wallet Address: $WALLET_ADDRESS
Network: $NETWORK
Created: $(date)
Keypair File: $KEYPAIR_FILE

SECURITY: Keep this information private and secure!
EOF

echo -e "${GREEN}Wallet information saved to: $WALLET_INFO_FILE${NC}"
echo ""

# Show next steps
echo -e "${BLUE}=== Next Steps ===${NC}"
echo "1. Fund your wallet with SOL"
echo "2. Verify balance with: solana balance"
echo "3. Create a token with: ./03-create-token.sh"
echo ""

# Export wallet address for use in other scripts
export SOLANA_WALLET_ADDRESS="$WALLET_ADDRESS"
echo "export SOLANA_WALLET_ADDRESS=\"$WALLET_ADDRESS\"" >> ~/.bashrc
