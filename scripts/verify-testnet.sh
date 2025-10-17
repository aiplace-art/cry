#!/bin/bash

# BSC Testnet Contract Verification Script
# Usage: bash scripts/verify-testnet.sh

echo "🔍 Verifying HypeAI contracts on BSCScan Testnet..."
echo ""

# Check if deployment-testnet.json exists
if [ ! -f "deployment-testnet.json" ]; then
  echo "❌ deployment-testnet.json not found!"
  echo "📍 Please deploy contracts first: npx hardhat run scripts/deploy-testnet.js --network bscTestnet"
  exit 1
fi

# Read addresses from deployment file
TOKEN_ADDRESS=$(node -pe 'JSON.parse(require("fs").readFileSync("deployment-testnet.json")).contracts.HypeAI')
VESTING_ADDRESS=$(node -pe 'JSON.parse(require("fs").readFileSync("deployment-testnet.json")).contracts.TeamTokenVesting')
SALE_ADDRESS=$(node -pe 'JSON.parse(require("fs").readFileSync("deployment-testnet.json")).contracts.HypeAIPrivateSale')
USDT_ADDRESS=$(node -pe 'JSON.parse(require("fs").readFileSync("deployment-testnet.json")).contracts.MockUSDT')
DEPLOYER=$(node -pe 'JSON.parse(require("fs").readFileSync("deployment-testnet.json")).deployer')

echo "📋 Contract Addresses:"
echo "Token:   $TOKEN_ADDRESS"
echo "Vesting: $VESTING_ADDRESS"
echo "Sale:    $SALE_ADDRESS"
echo "USDT:    $USDT_ADDRESS"
echo ""

# Verify HypeAI Token
echo "1️⃣ Verifying HypeAI Token..."
npx hardhat verify --network bscTestnet $TOKEN_ADDRESS "$DEPLOYER" "$DEPLOYER"

if [ $? -eq 0 ]; then
  echo "✅ HypeAI Token verified!"
else
  echo "⚠️ HypeAI Token verification failed (might already be verified)"
fi
echo ""

# Verify TeamTokenVesting
echo "2️⃣ Verifying TeamTokenVesting..."
npx hardhat verify --network bscTestnet $VESTING_ADDRESS "$TOKEN_ADDRESS"

if [ $? -eq 0 ]; then
  echo "✅ TeamTokenVesting verified!"
else
  echo "⚠️ TeamTokenVesting verification failed (might already be verified)"
fi
echo ""

# Verify Mock USDT
echo "3️⃣ Verifying Mock USDT..."
npx hardhat verify --network bscTestnet $USDT_ADDRESS "Mock USDT" "USDT" "1000000000000000000000000"

if [ $? -eq 0 ]; then
  echo "✅ Mock USDT verified!"
else
  echo "⚠️ Mock USDT verification failed (might already be verified)"
fi
echo ""

# Verify HypeAIPrivateSale (requires constructor args from deployment)
echo "4️⃣ Verifying HypeAIPrivateSale..."
echo "⚠️ Private Sale verification requires exact constructor arguments"
echo "📍 Use command from deployment-testnet.json → verification → HypeAIPrivateSale"
echo ""

# Show BSCScan links
echo "🔗 View on BSCScan Testnet:"
echo "Token:   https://testnet.bscscan.com/address/$TOKEN_ADDRESS#code"
echo "Vesting: https://testnet.bscscan.com/address/$VESTING_ADDRESS#code"
echo "Sale:    https://testnet.bscscan.com/address/$SALE_ADDRESS#code"
echo "USDT:    https://testnet.bscscan.com/address/$USDT_ADDRESS#code"
echo ""

echo "✅ Verification complete!"
