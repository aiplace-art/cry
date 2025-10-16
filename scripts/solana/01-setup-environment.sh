#!/bin/bash

################################################################################
# Solana Environment Setup Script
#
# This script installs and configures the Solana CLI tools and dependencies
# needed for token deployment.
#
# Usage: ./01-setup-environment.sh [--network mainnet|devnet]
################################################################################

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Default network
NETWORK="mainnet-beta"

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --network)
            if [ "$2" == "devnet" ]; then
                NETWORK="devnet"
            elif [ "$2" == "mainnet" ]; then
                NETWORK="mainnet-beta"
            fi
            shift 2
            ;;
        *)
            echo -e "${RED}Unknown option: $1${NC}"
            exit 1
            ;;
    esac
done

echo -e "${GREEN}=== Solana Environment Setup ===${NC}"
echo "Network: $NETWORK"
echo ""

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to print status
print_status() {
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ $1${NC}"
    else
        echo -e "${RED}✗ $1${NC}"
        exit 1
    fi
}

# Check OS
echo "Checking operating system..."
OS="$(uname -s)"
case "${OS}" in
    Linux*)     OS_TYPE=Linux;;
    Darwin*)    OS_TYPE=Mac;;
    CYGWIN*)    OS_TYPE=Windows;;
    MINGW*)     OS_TYPE=Windows;;
    *)          OS_TYPE="UNKNOWN:${OS}"
esac
echo "Detected OS: $OS_TYPE"
print_status "OS detection"

# Install Solana CLI
echo ""
echo "Checking Solana CLI installation..."
if command_exists solana; then
    SOLANA_VERSION=$(solana --version | awk '{print $2}')
    echo "Solana CLI already installed (version $SOLANA_VERSION)"
else
    echo "Installing Solana CLI..."
    if [ "$OS_TYPE" == "Windows" ]; then
        echo "Please install manually from: https://docs.solana.com/cli/install-solana-cli-tools"
        exit 1
    else
        sh -c "$(curl -sSfL https://release.solana.com/stable/install)"
        export PATH="$HOME/.local/share/solana/install/active_release/bin:$PATH"
    fi
    print_status "Solana CLI installation"
fi

# Verify Solana installation
echo ""
echo "Verifying Solana installation..."
solana --version
print_status "Solana verification"

# Configure Solana network
echo ""
echo "Configuring Solana network to $NETWORK..."
if [ "$NETWORK" == "mainnet-beta" ]; then
    solana config set --url https://api.mainnet-beta.solana.com
else
    solana config set --url https://api.devnet.solana.com
fi
print_status "Network configuration"

# Install SPL Token CLI
echo ""
echo "Checking SPL Token CLI..."
if command_exists spl-token; then
    echo "SPL Token CLI already installed"
else
    echo "Installing SPL Token CLI..."
    if command_exists cargo; then
        cargo install spl-token-cli
    else
        echo -e "${YELLOW}Cargo not found. Please install Rust first:${NC}"
        echo "curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh"
        echo ""
        echo "Then run this script again."
        exit 1
    fi
    print_status "SPL Token CLI installation"
fi

# Install Node.js dependencies
echo ""
echo "Checking Node.js..."
if command_exists node; then
    NODE_VERSION=$(node --version)
    echo "Node.js installed ($NODE_VERSION)"

    # Check for required npm packages
    echo "Installing Solana Web3.js..."
    npm install -g @solana/web3.js @solana/spl-token
    print_status "Node.js dependencies"
else
    echo -e "${YELLOW}Node.js not found. Please install Node.js v16+ from:${NC}"
    echo "https://nodejs.org/"
    exit 1
fi

# Create necessary directories
echo ""
echo "Creating directory structure..."
mkdir -p ~/.config/solana
mkdir -p ~/solana-tokens/metadata
mkdir -p ~/solana-tokens/logs
print_status "Directory creation"

# Show configuration
echo ""
echo -e "${GREEN}=== Current Configuration ===${NC}"
solana config get

echo ""
echo -e "${GREEN}=== Setup Complete ===${NC}"
echo "You can now proceed to create a wallet with: ./02-create-wallet.sh"
echo ""
echo "Useful commands:"
echo "  solana --version          - Check Solana version"
echo "  solana config get         - View current configuration"
echo "  spl-token --version       - Check SPL Token version"
echo "  solana balance            - Check wallet balance"
