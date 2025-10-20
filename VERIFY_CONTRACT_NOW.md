# VERIFY CONTRACT ON BSCSCAN - QUICK START

## 🚨 BEFORE YOU START

You need a BSCScan API key. Get it here:
1. Go to https://bscscan.com/register
2. Create account and verify email
3. Go to https://bscscan.com/myapikey
4. Copy your API key
5. Add to `.env`: `BSCSCAN_API_KEY=your_key_here`

---

## ⚡ FASTEST METHOD (1 Command)

```bash
cd /Users/ai.place/Crypto

# Run the verification script
./verify-contract.sh
```

**OR** run the command directly:

```bash
cd /Users/ai.place/Crypto

npx hardhat verify --network bscTestnet \
  0x01708a6b5818fD3c98f4a947349E3D58DD8B39D3 \
  "0x02B23B891b3A3717673291aD34EB67893A19D978" \
  "0x284D311f0E4562a3a870720D97aa12c445922137" \
  "0x0000000000000000000000000000000000000000"
```

---

## ✅ EXPECTED OUTPUT

```
Successfully verified contract HypeAIPrivateSaleWithVesting on bscTestnet.
https://testnet.bscscan.com/address/0x01708a6b5818fD3c98f4a947349E3D58DD8B39D3#code
```

---

## 🔧 IF VERIFICATION FAILS

### Option 1: Flatten and Verify Manually

```bash
cd /Users/ai.place/Crypto

# Flatten the contract
npx hardhat flatten src/contracts/vesting/HypeAIPrivateSaleWithVesting.sol > HypeAIPrivateSaleWithVesting-flattened.sol
```

Then verify manually on BSCScan:
1. Go to: https://testnet.bscscan.com/address/0x01708a6b5818fD3c98f4a947349E3D58DD8B39D3#code
2. Click "Verify and Publish"
3. Fill in:
   - Compiler: v0.8.20+commit.a1b79de6
   - Optimization: Yes (200 runs)
   - Via IR: **YES** (CRITICAL!)
   - Paste flattened source code
   - Constructor arguments (see below)

**Constructor Arguments (ABI-encoded):**
```
00000000000000000000000002b23b891b3a3717673291ad34eb67893a19d978000000000000000000000000284d311f0e4562a3a870720d97aa12c4459221370000000000000000000000000000000000000000000000000000000000000000
```

### Option 2: Generate Constructor Arguments

```bash
cd /Users/ai.place/Crypto
npx hardhat run scripts/encode-constructor-args.cjs
```

This will show you the ABI-encoded constructor arguments.

---

## 📋 CONTRACT DETAILS

- **Contract Name**: HypeAIPrivateSaleWithVesting
- **Address**: `0x01708a6b5818fD3c98f4a947349E3D58DD8B39D3`
- **Network**: BSC Testnet (Chain ID: 97)
- **Compiler**: Solidity 0.8.20
- **Optimization**: Enabled (200 runs)
- **Via IR**: Enabled ⚠️ MUST be checked!

### Constructor Parameters:
- `_hypeToken`: `0x02B23B891b3A3717673291aD34EB67893A19D978`
- `_usdtToken`: `0x284D311f0E4562a3a870720D97aa12c445922137`
- `_referralSystem`: `0x0000000000000000000000000000000000000000` (NULL)

---

## 📖 FULL DOCUMENTATION

See `/Users/ai.place/Crypto/docs/CONTRACT_VERIFICATION_GUIDE.md` for:
- Detailed troubleshooting
- Alternative verification methods
- API-based verification
- Post-verification checklist

---

## 🎯 VERIFY SUCCESS

After verification, check:
1. Go to: https://testnet.bscscan.com/address/0x01708a6b5818fD3c98f4a947349E3D58DD8B39D3#code
2. You should see:
   - ✅ Green checkmark next to contract name
   - Source code is visible
   - "Read Contract" and "Write Contract" tabs work

---

**Created**: 2025-10-20
**Contract Deployed**: 2025-10-19 21:14:23 UTC
