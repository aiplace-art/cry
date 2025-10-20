# BSCScan Contract Verification Guide

## Quick Reference

**Contract**: HypeAIPrivateSaleWithVesting
**Address**: `0x01708a6b5818fD3c98f4a947349E3D58DD8B39D3`
**Network**: BSC Testnet (Chain ID: 97)
**Compiler**: Solidity 0.8.20
**Optimization**: Enabled (200 runs) + viaIR

---

## 1. QUICK VERIFICATION (1-STEP)

### Method 1A: Using Hardhat (Recommended)

```bash
cd /Users/ai.place/Crypto

# Verify on BSCScan Testnet
npx hardhat verify --network bscTestnet \
  0x01708a6b5818fD3c98f4a947349E3D58DD8B39D3 \
  "0x02B23B891b3A3717673291aD34EB67893A19D978" \
  "0x284D311f0E4562a3a870720D97aa12c445922137" \
  "0x0000000000000000000000000000000000000000"
```

### Method 1B: Using Pre-Saved Command

```bash
cd /Users/ai.place/Crypto

# Read verification command from deployment file
npx hardhat verify --network bscTestnet 0x01708a6b5818fD3c98f4a947349E3D58DD8B39D3 "0x02B23B891b3A3717673291aD34EB67893A19D978" "0x284D311f0E4562a3a870720D97aa12c445922137" "0x0000000000000000000000000000000000000000"
```

---

## 2. CONSTRUCTOR ARGUMENTS

### Decoded Arguments:
```solidity
constructor(
    address _hypeToken,      // HypeAI Token
    address _usdtToken,      // USDT Token
    address _referralSystem  // Referral System (optional)
)
```

### Values Used:
```javascript
_hypeToken:      0x02B23B891b3A3717673291aD34EB67893A19D978  // HypeAI Token
_usdtToken:      0x284D311f0E4562a3a870720D97aa12c445922137  // Mock USDT
_referralSystem: 0x0000000000000000000000000000000000000000  // NULL (no referral yet)
```

### ABI-Encoded Constructor Arguments:

```
0x00000000000000000000000002b23b891b3a3717673291ad34eb67893a19d978
0000000000000000000000000284d311f0e4562a3a870720D97aa12c445922137
0000000000000000000000000000000000000000000000000000000000000000
```

**How to generate this:**
```bash
cd /Users/ai.place/Crypto

# Using Hardhat console
npx hardhat console --network bscTestnet

# In console:
const { ethers } = require("hardhat");
const encoded = ethers.AbiCoder.defaultAbiCoder().encode(
  ["address", "address", "address"],
  [
    "0x02B23B891b3A3717673291aD34EB67893A19D978",
    "0x284D311f0E4562a3a870720D97aa12c445922137",
    "0x0000000000000000000000000000000000000000"
  ]
);
console.log(encoded);
```

---

## 3. MANUAL VERIFICATION (Web UI)

If automated verification fails, use BSCScan web interface:

### Step 1: Go to Contract Page
https://testnet.bscscan.com/address/0x01708a6b5818fD3c98f4a947349E3D58DD8B39D3#code

### Step 2: Click "Verify and Publish"

### Step 3: Fill Form
- **Contract Address**: `0x01708a6b5818fD3c98f4a947349E3D58DD8B39D3` (auto-filled)
- **Compiler Type**: Solidity (Single file)
- **Compiler Version**: v0.8.20+commit.a1b79de6
- **Open Source License**: MIT

### Step 4: Contract Details
- **Optimization**: Yes
- **Runs**: 200
- **Enter the Solidity Contract Code**: [See Section 5 - Flattened Contract]
- **Constructor Arguments ABI-encoded**:
  ```
  00000000000000000000000002b23b891b3a3717673291ad34eb67893a19d978000000000000000000000000284d311f0e4562a3a870720d97aa12c4459221370000000000000000000000000000000000000000000000000000000000000000
  ```

### Step 5: Advanced Options
- **Via IR**: Yes (CRITICAL - must match deployment)
- **EVM Version**: Default
- **Contract Library Address**: Leave blank (no libraries used)

### Step 6: Verify
Click "Verify and Publish"

---

## 4. COMPILER SETTINGS (MUST MATCH)

The contract was compiled with these exact settings:

```javascript
{
  "solidity": {
    "version": "0.8.20",
    "settings": {
      "optimizer": {
        "enabled": true,
        "runs": 200
      },
      "viaIR": true  // ⚠️ CRITICAL: Must be enabled
    }
  }
}
```

**Why viaIR matters:**
- Enables IR-based code generation
- Different bytecode than without viaIR
- Verification will FAIL if viaIR setting doesn't match

---

## 5. FLATTENED CONTRACT (For Manual Verification)

### Generate Flattened Source:

```bash
cd /Users/ai.place/Crypto

# Flatten the contract
npx hardhat flatten src/contracts/vesting/HypeAIPrivateSaleWithVesting.sol > HypeAIPrivateSaleWithVesting-flattened.sol

# Remove duplicate SPDX licenses (keep only first one)
# You may need to manually edit the flattened file
```

**Manual steps after flattening:**
1. Open `HypeAIPrivateSaleWithVesting-flattened.sol`
2. Remove all duplicate `// SPDX-License-Identifier: MIT` lines except the first one
3. Remove any duplicate pragma statements
4. Ensure OpenZeppelin imports are resolved correctly

---

## 6. TROUBLESHOOTING

### Error: "Compiler version mismatch"
**Solution**: Ensure you're using Solidity 0.8.20 exactly
```bash
# Check contract pragma
grep "pragma solidity" src/contracts/vesting/HypeAIPrivateSaleWithVesting.sol
```

### Error: "Bytecode does not match"
**Possible causes:**
1. **viaIR setting mismatch** (most common)
   - Check hardhat.config.cjs has `viaIR: true`
2. **Optimization runs mismatch**
   - Must be exactly 200 runs
3. **Constructor arguments incorrect**
   - Verify the ABI encoding

**Solution**: Re-verify compiler settings match exactly:
```bash
cd /Users/ai.place/Crypto
cat hardhat.config.cjs | grep -A 10 "solidity:"
```

### Error: "Invalid constructor arguments"
**Solution**: Regenerate ABI-encoded arguments
```bash
# See Section 2 for encoding script
npx hardhat console --network bscTestnet
```

### Error: "Already verified"
**Solution**: Contract is already verified! Check:
https://testnet.bscscan.com/address/0x01708a6b5818fD3c98f4a947349E3D58DD8B39D3#code

### Error: "BSCSCAN_API_KEY not set"
**Solution**: Add your BSCScan API key to .env
```bash
# Get API key from: https://bscscan.com/myapikey
echo "BSCSCAN_API_KEY=your_api_key_here" >> .env
```

---

## 7. POST-VERIFICATION CHECKLIST

After successful verification:

### 7.1 Verify Contract is Readable
- [ ] Go to BSCScan contract page
- [ ] Click "Contract" tab
- [ ] See green checkmark next to contract name
- [ ] Source code is visible and readable

### 7.2 Test Read Functions
Test these view functions on BSCScan:
- [ ] `getVestingParameters()` - Returns correct constants
- [ ] `hypeToken()` - Returns `0x02B23B891b3A3717673291aD34EB67893A19D978`
- [ ] `usdtToken()` - Returns `0x284D311f0E4562a3a870720D97aa12c445922137`
- [ ] `saleActive()` - Returns `true`

### 7.3 Verify Contract Settings
```javascript
Expected values:
- IMMEDIATE_UNLOCK_PERCENTAGE: 2000 (20%)
- VESTING_PERCENTAGE: 8000 (80%)
- CLIFF_DURATION: 7776000 (90 days)
- VESTING_DURATION: 46656000 (540 days)
- TOKEN_PRICE_USD: 8
- MIN_PURCHASE_USD: 400000000000000000000 (400 * 10^18)
- MAX_PURCHASE_USD: 8000000000000000000000 (8000 * 10^18)
- BONUS_PERCENTAGE: 1000 (10%)
```

### 7.4 Enable Contract Interaction
- [ ] "Read Contract" tab works
- [ ] "Write Contract" tab shows all functions
- [ ] Can connect wallet to write functions

---

## 8. VERIFICATION STATUS CHECK

### Check if Already Verified:
```bash
# Visit BSCScan
open "https://testnet.bscscan.com/address/0x01708a6b5818fD3c98f4a947349E3D58DD8B39D3#code"

# Or use API
curl "https://api-testnet.bscscan.com/api?module=contract&action=getabi&address=0x01708a6b5818fD3c98f4a947349E3D58DD8B39D3&apikey=YOUR_API_KEY"
```

**Expected response if verified:**
```json
{
  "status": "1",
  "message": "OK",
  "result": "[{\"inputs\":[...]}]"  // Full ABI
}
```

**Expected response if NOT verified:**
```json
{
  "status": "0",
  "message": "NOTOK",
  "result": "Contract source code not verified"
}
```

---

## 9. QUICK VERIFICATION SCRIPT

Save this as `verify-contract.sh`:

```bash
#!/bin/bash

# Contract Verification Script
# Usage: ./verify-contract.sh

set -e

echo "🔍 Verifying HypeAIPrivateSaleWithVesting on BSCScan Testnet..."

cd /Users/ai.place/Crypto

# Check environment
if [ -z "$BSCSCAN_API_KEY" ] || [ "$BSCSCAN_API_KEY" = "your_bscscan_api_key" ]; then
  echo "❌ ERROR: BSCSCAN_API_KEY not set in .env"
  echo "Get your API key from: https://bscscan.com/myapikey"
  exit 1
fi

# Verify contract
echo "📝 Running hardhat verify..."
npx hardhat verify --network bscTestnet \
  0x01708a6b5818fD3c98f4a947349E3D58DD8B39D3 \
  "0x02B23B891b3A3717673291aD34EB67893A19D978" \
  "0x284D311f0E4562a3a870720D97aa12c445922137" \
  "0x0000000000000000000000000000000000000000"

echo "✅ Verification complete!"
echo "📊 View on BSCScan: https://testnet.bscscan.com/address/0x01708a6b5818fD3c98f4a947349E3D58DD8B39D3#code"
```

Make it executable:
```bash
chmod +x verify-contract.sh
./verify-contract.sh
```

---

## 10. ALTERNATIVE: API-BASED VERIFICATION

If hardhat fails, use direct API call:

```bash
# Using curl to submit verification
curl -X POST "https://api-testnet.bscscan.com/api" \
  -d "module=contract" \
  -d "action=verifysourcecode" \
  -d "contractaddress=0x01708a6b5818fD3c98f4a947349E3D58DD8B39D3" \
  -d "sourceCode=$(cat HypeAIPrivateSaleWithVesting-flattened.sol)" \
  -d "codeformat=solidity-single-file" \
  -d "contractname=HypeAIPrivateSaleWithVesting" \
  -d "compilerversion=v0.8.20+commit.a1b79de6" \
  -d "optimizationUsed=1" \
  -d "runs=200" \
  -d "constructorArguments=00000000000000000000000002b23b891b3a3717673291ad34eb67893a19d978000000000000000000000000284d311f0e4562a3a870720d97aa12c4459221370000000000000000000000000000000000000000000000000000000000000000" \
  -d "evmversion=default" \
  -d "licenseType=3" \
  -d "apikey=$BSCSCAN_API_KEY"
```

---

## 11. SUMMARY

### Easiest Method (Recommended):
```bash
cd /Users/ai.place/Crypto
npx hardhat verify --network bscTestnet 0x01708a6b5818fD3c98f4a947349E3D58DD8B39D3 "0x02B23B891b3A3717673291aD34EB67893A19D978" "0x284D311f0E4562a3a870720D97aa12c445922137" "0x0000000000000000000000000000000000000000"
```

### What You Need:
1. ✅ Contract address: `0x01708a6b5818fD3c98f4a947349E3D58DD8B39D3`
2. ✅ Constructor arguments (see Section 2)
3. ✅ BSCScan API key (add to .env)
4. ✅ Correct compiler settings (viaIR: true, runs: 200)

### Expected Result:
```
Successfully verified contract HypeAIPrivateSaleWithVesting on bscTestnet.
https://testnet.bscscan.com/address/0x01708a6b5818fD3c98f4a947349E3D58DD8B39D3#code
```

---

## 12. REFERENCES

- **Contract Source**: `/Users/ai.place/Crypto/src/contracts/vesting/HypeAIPrivateSaleWithVesting.sol`
- **Deployment Info**: `/Users/ai.place/Crypto/deployment-testnet.json`
- **Hardhat Config**: `/Users/ai.place/Crypto/hardhat.config.cjs`
- **BSCScan Testnet**: https://testnet.bscscan.com/
- **BSCScan Verify API**: https://docs.bscscan.com/api-endpoints/contracts#verify-source-code

---

**Last Updated**: 2025-10-20
**Contract Deployed**: 2025-10-19 21:14:23 UTC
