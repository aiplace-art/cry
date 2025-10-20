#!/bin/bash

# Contract Verification Script for HypeAIPrivateSaleWithVesting
# Usage: ./verify-contract.sh

set -e

echo "🔍 Verifying HypeAIPrivateSaleWithVesting on BSCScan Testnet..."
echo ""

cd /Users/ai.place/Crypto

# Check environment
source .env 2>/dev/null || true

if [ -z "$BSCSCAN_API_KEY" ] || [ "$BSCSCAN_API_KEY" = "your_bscscan_api_key" ]; then
  echo "❌ ERROR: BSCSCAN_API_KEY not set in .env"
  echo ""
  echo "📝 Steps to get API key:"
  echo "  1. Go to https://bscscan.com/register"
  echo "  2. Create account and verify email"
  echo "  3. Go to https://bscscan.com/myapikey"
  echo "  4. Create new API key"
  echo "  5. Add to .env: BSCSCAN_API_KEY=your_key_here"
  echo ""
  exit 1
fi

# Display contract info
echo "📋 Contract Information:"
echo "  Address:    0x01708a6b5818fD3c98f4a947349E3D58DD8B39D3"
echo "  Network:    BSC Testnet (Chain ID: 97)"
echo "  Compiler:   Solidity 0.8.20"
echo "  Optimizer:  Enabled (200 runs)"
echo "  Via IR:     Enabled"
echo ""

echo "📦 Constructor Arguments:"
echo "  _hypeToken:      0x02B23B891b3A3717673291aD34EB67893A19D978"
echo "  _usdtToken:      0x284D311f0E4562a3a870720D97aa12c445922137"
echo "  _referralSystem: 0x0000000000000000000000000000000000000000"
echo ""

# Verify contract
echo "🚀 Running hardhat verify..."
echo ""

npx hardhat verify --network bscTestnet \
  0x01708a6b5818fD3c98f4a947349E3D58DD8B39D3 \
  "0x02B23B891b3A3717673291aD34EB67893A19D978" \
  "0x284D311f0E4562a3a870720D97aa12c445922137" \
  "0x0000000000000000000000000000000000000000"

echo ""
echo "✅ Verification complete!"
echo ""
echo "📊 View verified contract on BSCScan:"
echo "   https://testnet.bscscan.com/address/0x01708a6b5818fD3c98f4a947349E3D58DD8B39D3#code"
echo ""
