#!/bin/bash

# Check if contract is verified on BSCScan
# Usage: ./check-verification-status.sh

CONTRACT_ADDRESS="0x01708a6b5818fD3c98f4a947349E3D58DD8B39D3"
NETWORK="testnet"

echo "🔍 Checking verification status on BSCScan..."
echo ""
echo "Contract: $CONTRACT_ADDRESS"
echo "Network: BSC $NETWORK"
echo ""

# Check using BSCScan API (works without API key for verification status)
if [ "$NETWORK" = "testnet" ]; then
  API_URL="https://api-testnet.bscscan.com/api"
  EXPLORER_URL="https://testnet.bscscan.com"
else
  API_URL="https://api.bscscan.com/api"
  EXPLORER_URL="https://bscscan.com"
fi

# Try to get ABI (if verified, this will work)
RESPONSE=$(curl -s "${API_URL}?module=contract&action=getabi&address=${CONTRACT_ADDRESS}")

# Check if verified
if echo "$RESPONSE" | grep -q '"status":"1"'; then
  echo "✅ CONTRACT IS VERIFIED!"
  echo ""
  echo "View on BSCScan:"
  echo "${EXPLORER_URL}/address/${CONTRACT_ADDRESS}#code"
  echo ""
  echo "Contract ABI is available and can be used for:"
  echo "  - Frontend integration"
  echo "  - Web3 interactions"
  echo "  - Block explorers"
  echo ""
elif echo "$RESPONSE" | grep -q "Contract source code not verified"; then
  echo "❌ CONTRACT NOT VERIFIED"
  echo ""
  echo "Next steps:"
  echo "  1. Get BSCScan API key: https://bscscan.com/myapikey"
  echo "  2. Add to .env: BSCSCAN_API_KEY=your_key"
  echo "  3. Run: ./verify-contract.sh"
  echo ""
  echo "Or verify manually at:"
  echo "${EXPLORER_URL}/address/${CONTRACT_ADDRESS}#code"
  echo ""
else
  echo "⚠️  UNABLE TO DETERMINE STATUS"
  echo ""
  echo "API Response:"
  echo "$RESPONSE" | jq '.' 2>/dev/null || echo "$RESPONSE"
  echo ""
  echo "Check manually at:"
  echo "${EXPLORER_URL}/address/${CONTRACT_ADDRESS}#code"
  echo ""
fi
