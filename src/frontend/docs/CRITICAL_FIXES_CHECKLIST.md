# Critical Fixes Checklist - Pre-Deployment

**Status:** 🔴 BLOCKING PRODUCTION DEPLOYMENT
**Estimated Time:** 2-3 days with focused effort

---

## 🔴 CRITICAL FIX #1: Fix Build Error (15 minutes)

**Problem:** Build fails with "page without valid component"

**File:** `/Users/ai.place/Crypto/src/frontend/pages/presale.tsx`

**Fix:**
```typescript
// At the bottom of presale.tsx, change:
export default function PresalePage() {  // Add this line
  // ... existing code
}  // Close function

// Remove any existing export statement that's not default export
```

**Test:**
```bash
npm run build
# Should complete successfully
```

**Status:** [ ] NOT STARTED [ ] IN PROGRESS [ ] COMPLETED

---

## 🔴 CRITICAL FIX #2: Deploy Presale Contract (2-4 hours)

**Problem:** No contract deployed, address is empty

**Steps:**
1. Deploy presale contract to BSC Testnet
2. Verify contract on BSCScan
3. Test contract functions (buyTokens, etc.)
4. Get contract address

**Contract Requirements:**
```solidity
// Minimum required functions:
- buyTokens() payable
- buyTokensWithUSDT(uint256 amount)
- getPresaleInfo() view
- getUserPurchase(address) view
- withdrawFunds() onlyOwner
```

**After Deployment:**
```bash
# Update .env.local
NEXT_PUBLIC_PRESALE_CONTRACT_ADDRESS=0xYOUR_CONTRACT_ADDRESS
```

**Status:** [ ] NOT STARTED [ ] IN PROGRESS [ ] COMPLETED

---

## 🔴 CRITICAL FIX #3: Add Presale Contract ABI (30 minutes)

**Problem:** No ABI defined for presale contract

**File:** `/Users/ai.place/Crypto/src/frontend/lib/contracts.ts`

**Add:**
```typescript
// Add after GOVERNANCE_ABI
export const PRESALE_ABI = [
  'function buyTokens() payable returns (uint256)',
  'function buyTokensWithUSDT(uint256 usdtAmount) returns (uint256)',
  'function getPresaleInfo() view returns (uint256 price, uint256 raised, uint256 cap, uint256 minPurchase, uint256 maxPurchase)',
  'function getUserPurchase(address user) view returns (uint256 amount, uint256 tokens, uint256 timestamp)',
  'function getTokenPrice() view returns (uint256)',
  'function presaleActive() view returns (bool)',
  'function whitelistEnabled() view returns (bool)',
  'function isWhitelisted(address user) view returns (bool)',
  'event TokensPurchased(address indexed buyer, uint256 amount, uint256 tokens, uint256 timestamp)',
  'event PresaleStatusChanged(bool active)',
];

// Add presale contract hook
export function usePresaleContract() {
  const address = process.env.NEXT_PUBLIC_PRESALE_CONTRACT_ADDRESS;
  return useContract(address!, PRESALE_ABI);
}
```

**Status:** [ ] NOT STARTED [ ] IN PROGRESS [ ] COMPLETED

---

## 🔴 CRITICAL FIX #4: Implement Real Wallet Connection (2-3 hours)

**Problem:** Currently using mock/simulated wallet connection

**File:** `/Users/ai.place/Crypto/src/frontend/pages/presale.tsx`

**Replace Mock Connection:**
```typescript
// BEFORE (lines 102-105):
const handleConnectWallet = async () => {
  // MetaMask connection logic would go here
  setIsConnected(true);
};

// AFTER:
const handleConnectWallet = async () => {
  if (typeof window.ethereum === 'undefined') {
    setErrorMessage('Please install MetaMask to participate in the presale');
    return;
  }

  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const accounts = await provider.send('eth_requestAccounts', []);

    if (accounts.length === 0) {
      throw new Error('No accounts found');
    }

    const network = await provider.getNetwork();
    const expectedChainId = Number(process.env.NEXT_PUBLIC_CHAIN_ID);

    if (Number(network.chainId) !== expectedChainId) {
      // Request network switch
      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: `0x${expectedChainId.toString(16)}` }],
        });
      } catch (switchError: any) {
        if (switchError.code === 4902) {
          throw new Error('Please add BSC network to MetaMask');
        }
        throw switchError;
      }
    }

    const signer = await provider.getSigner();
    setIsConnected(true);
    // Store provider and signer in state for later use
  } catch (error: any) {
    console.error('Wallet connection failed:', error);
    setErrorMessage(error.message || 'Failed to connect wallet');
  }
};
```

**Status:** [ ] NOT STARTED [ ] IN PROGRESS [ ] COMPLETED

---

## 🔴 CRITICAL FIX #5: Implement Real Purchase Logic (3-4 hours)

**Problem:** Purchase function only simulates, doesn't execute blockchain transaction

**File:** `/Users/ai.place/Crypto/src/frontend/pages/presale.tsx`

**Replace Mock Purchase:**
```typescript
// Add imports at top
import { ethers } from 'ethers';
import { PRESALE_ABI } from '@/lib/contracts';

// Add state for provider/signer
const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
const [signer, setSigner] = useState<ethers.JsonRpcSigner | null>(null);

// BEFORE (lines 108-115):
const handleBuyTokens = async () => {
  if (!isConnected) {
    await handleConnectWallet();
    return;
  }
  // Purchase logic would go here
  console.log('Purchasing tokens:', calculateTokens());
};

// AFTER:
const handleBuyTokens = async () => {
  if (!isConnected) {
    await handleConnectWallet();
    return;
  }

  if (!provider || !signer) {
    setErrorMessage('Wallet not properly connected');
    return;
  }

  const contractAddress = process.env.NEXT_PUBLIC_PRESALE_CONTRACT_ADDRESS;
  if (!contractAddress) {
    setErrorMessage('Presale contract not configured');
    return;
  }

  try {
    setLoading(true);
    setErrorMessage('');

    const contract = new ethers.Contract(contractAddress, PRESALE_ABI, signer);

    // Check if presale is active
    const isActive = await contract.presaleActive();
    if (!isActive) {
      throw new Error('Presale is not currently active');
    }

    // Check whitelist if enabled
    const whitelistEnabled = await contract.whitelistEnabled();
    if (whitelistEnabled) {
      const isWhitelisted = await contract.isWhitelisted(await signer.getAddress());
      if (!isWhitelisted) {
        throw new Error('You are not whitelisted for this presale');
      }
    }

    let tx;
    if (purchaseMode.currency === 'BNB') {
      // Purchase with BNB
      const value = ethers.parseEther(purchaseMode.amount);

      // Estimate gas
      const gasEstimate = await contract.buyTokens.estimateGas({ value });

      // Execute transaction
      tx = await contract.buyTokens({
        value,
        gasLimit: gasEstimate * 120n / 100n, // 20% buffer
      });
    } else {
      // Purchase with USDT
      const usdtAddress = process.env.NEXT_PUBLIC_USDT_CONTRACT_ADDRESS;
      const usdtContract = new ethers.Contract(
        usdtAddress!,
        ['function approve(address spender, uint256 amount) returns (bool)'],
        signer
      );

      const amount = ethers.parseUnits(purchaseMode.amount, 18);

      // Approve USDT spending
      const approveTx = await usdtContract.approve(contractAddress, amount);
      await approveTx.wait();

      // Execute purchase
      tx = await contract.buyTokensWithUSDT(amount);
    }

    // Wait for confirmation
    const receipt = await tx.wait();

    if (receipt.status === 0) {
      throw new Error('Transaction failed');
    }

    // Success!
    setSuccessMessage(`Successfully purchased ${calculateTokens()} tokens!`);
    setPurchaseMode({ ...purchaseMode, amount: '' });

  } catch (error: any) {
    console.error('Purchase failed:', error);

    // User-friendly error messages
    if (error.code === 4001) {
      setErrorMessage('Transaction was rejected');
    } else if (error.code === -32603) {
      setErrorMessage('Insufficient funds for gas fee');
    } else if (error.message?.includes('insufficient funds')) {
      setErrorMessage('Insufficient balance');
    } else {
      setErrorMessage(error.reason || error.message || 'Transaction failed');
    }
  } finally {
    setLoading(false);
  }
};
```

**Status:** [ ] NOT STARTED [ ] IN PROGRESS [ ] COMPLETED

---

## 🟡 HIGH PRIORITY FIX #6: Remove Console Statements (30 minutes)

**Problem:** 45 console.log/error statements in production code

**Command:**
```bash
# Find all console statements
grep -r "console\." /Users/ai.place/Crypto/src/frontend/pages /Users/ai.place/Crypto/src/frontend/components /Users/ai.place/Crypto/src/frontend/lib --include="*.tsx" --include="*.ts" | grep -v node_modules

# Replace with proper logging (or remove)
```

**Files to Update:**
- `pages/presale.tsx` - Remove console.log on line 114
- `contexts/Web3Context.tsx` - Replace console.error with Sentry
- `components/AIInsights.tsx` - Remove mock data comments
- All other files with console statements

**Status:** [ ] NOT STARTED [ ] IN PROGRESS [ ] COMPLETED

---

## 🟡 HIGH PRIORITY FIX #7: Add Error Tracking (1 hour)

**Problem:** No way to track production errors

**Steps:**
```bash
# 1. Install Sentry
npm install @sentry/nextjs

# 2. Initialize
npx @sentry/wizard -i nextjs

# 3. Add to .env.production
NEXT_PUBLIC_SENTRY_DSN=your_sentry_dsn_here
SENTRY_AUTH_TOKEN=your_auth_token

# 4. Update next.config.js (wizard does this)
```

**Verify:**
- Errors are sent to Sentry dashboard
- Source maps uploaded for debugging
- Release tracking configured

**Status:** [ ] NOT STARTED [ ] IN PROGRESS [ ] COMPLETED

---

## 🟡 HIGH PRIORITY FIX #8: Comprehensive Error Handling (2 hours)

**Add to presale.tsx:**

```typescript
// Add error types
type ErrorType = 'WALLET' | 'NETWORK' | 'CONTRACT' | 'TRANSACTION' | 'UNKNOWN';

interface ErrorState {
  type: ErrorType;
  message: string;
  technical?: string;
  action?: string;
}

// Enhanced error handler
function handleError(error: any): ErrorState {
  // Wallet errors
  if (error.code === 4001) {
    return {
      type: 'WALLET',
      message: 'Transaction rejected',
      action: 'Please approve the transaction in your wallet'
    };
  }

  // Network errors
  if (error.code === -32603 || error.message?.includes('insufficient funds')) {
    return {
      type: 'NETWORK',
      message: 'Insufficient funds',
      action: 'Please add BNB to cover gas fees'
    };
  }

  // Contract errors
  if (error.message?.includes('Presale not active')) {
    return {
      type: 'CONTRACT',
      message: 'Presale is not currently active',
      action: 'Please check the presale schedule'
    };
  }

  if (error.message?.includes('not whitelisted')) {
    return {
      type: 'CONTRACT',
      message: 'Address not whitelisted',
      action: 'Please ensure your address is on the whitelist'
    };
  }

  // Transaction errors
  if (error.receipt?.status === 0) {
    return {
      type: 'TRANSACTION',
      message: 'Transaction failed',
      technical: error.reason,
      action: 'Please try again with more gas'
    };
  }

  // Unknown errors
  return {
    type: 'UNKNOWN',
    message: 'An unexpected error occurred',
    technical: error.message,
    action: 'Please try again or contact support'
  };
}
```

**Status:** [ ] NOT STARTED [ ] IN PROGRESS [ ] COMPLETED

---

## 🟡 MEDIUM PRIORITY FIX #9: Create Production Environment (30 minutes)

**Create:** `/Users/ai.place/Crypto/src/frontend/.env.production`

```bash
# Production Environment Configuration
# BSC MAINNET CONFIGURATION

# ============================================
# CONTRACT ADDRESSES (MAINNET)
# ============================================
NEXT_PUBLIC_PRESALE_CONTRACT_ADDRESS=0x[DEPLOYED_MAINNET_CONTRACT]
NEXT_PUBLIC_USDT_CONTRACT_ADDRESS=0x55d398326f99059fF775485246999027B3197955

# ============================================
# RPC CONFIGURATION (MAINNET)
# ============================================
NEXT_PUBLIC_BSC_RPC_URL=https://bsc-dataseed1.binance.org
NEXT_PUBLIC_CHAIN_ID=56

# ============================================
# ENVIRONMENT
# ============================================
NEXT_PUBLIC_ENVIRONMENT=production
NEXT_PUBLIC_DEBUG=false

# ============================================
# MONITORING
# ============================================
NEXT_PUBLIC_SENTRY_DSN=[YOUR_SENTRY_DSN]
NEXT_PUBLIC_GA_MEASUREMENT_ID=[YOUR_GA_ID]
NEXT_PUBLIC_VERCEL_ANALYTICS=true

# ============================================
# PRESALE CONFIGURATION
# ============================================
NEXT_PUBLIC_PRESALE_START_DATE=2025-01-15T00:00:00Z
NEXT_PUBLIC_PRESALE_END_DATE=2025-03-15T00:00:00Z
NEXT_PUBLIC_TOKEN_PRICE_USD=0.0008
NEXT_PUBLIC_MIN_PURCHASE_USD=40
NEXT_PUBLIC_MAX_PURCHASE_USD=800

# ============================================
# FEATURE FLAGS
# ============================================
NEXT_PUBLIC_ENABLE_USDT=true
NEXT_PUBLIC_ENABLE_REFERRALS=false
NEXT_PUBLIC_ENABLE_WHITELIST=true
NEXT_PUBLIC_SHOW_COUNTDOWN=true
```

**Status:** [ ] NOT STARTED [ ] IN PROGRESS [ ] COMPLETED

---

## 🟢 TESTING CHECKLIST

### Manual Testing
- [ ] Build succeeds (`npm run build`)
- [ ] Production build runs locally (`npm run build && npm start`)
- [ ] Wallet connects (MetaMask)
- [ ] Network switching works
- [ ] Purchase with BNB executes
- [ ] Purchase with USDT executes
- [ ] Error messages display correctly
- [ ] Loading states work
- [ ] Mobile responsive
- [ ] Dark mode works

### Browser Testing
- [ ] Chrome/Brave (Desktop)
- [ ] Firefox (Desktop)
- [ ] Safari (Desktop)
- [ ] Edge (Desktop)
- [ ] Chrome (Mobile)
- [ ] Safari (iOS)
- [ ] MetaMask Mobile
- [ ] Trust Wallet

### Transaction Testing (Testnet)
- [ ] Successful BNB purchase
- [ ] Successful USDT purchase
- [ ] Rejected transaction
- [ ] Insufficient balance
- [ ] Wrong network
- [ ] Wallet disconnection during tx
- [ ] Transaction timeout

---

## 📊 Progress Tracker

**Overall Progress:** 0/9 Critical Fixes Completed

### Critical Fixes (Must complete before production)
- [ ] Fix #1: Build Error (15 min)
- [ ] Fix #2: Deploy Contract (2-4 hours)
- [ ] Fix #3: Add Contract ABI (30 min)
- [ ] Fix #4: Real Wallet Connection (2-3 hours)
- [ ] Fix #5: Real Purchase Logic (3-4 hours)

**Critical Subtotal:** 0/5 (0%)

### High Priority Fixes (Should complete before production)
- [ ] Fix #6: Remove Console Statements (30 min)
- [ ] Fix #7: Add Error Tracking (1 hour)
- [ ] Fix #8: Enhanced Error Handling (2 hours)

**High Priority Subtotal:** 0/3 (0%)

### Medium Priority
- [ ] Fix #9: Production Environment (30 min)

**Medium Priority Subtotal:** 0/1 (0%)

---

## 🚀 Quick Start Command Sequence

```bash
# 1. Fix build error (do this first!)
# Edit pages/presale.tsx and add default export

# 2. Test build
npm run build

# 3. If build succeeds, start fixing critical issues
# Deploy contract, get address, update .env

# 4. Implement real wallet/purchase logic
# Follow fixes #4 and #5 above

# 5. Test everything on testnet
npm run dev
# Test all purchase flows

# 6. Clean up
# Remove console statements, add error tracking

# 7. Final production build
npm run build
npm start

# 8. Deploy to Vercel/hosting
vercel --prod
```

---

## 📞 Support Resources

**Documentation:**
- Main report: `/docs/PRODUCTION_VALIDATION_REPORT.md`
- Deployment guide: `/DEPLOYMENT.md`
- Web3 integration: `/WEB3_INTEGRATION_README.md`

**Debugging:**
- Check browser console for errors
- Check MetaMask for transaction status
- Check BSCScan for transaction details
- Check Sentry for production errors

---

## ⏱️ Estimated Completion Time

**Minimum (with experience):** 1-2 days
**Average (normal pace):** 2-3 days
**Maximum (with testing):** 3-5 days

**Recommendation:** Allocate 3 full days for implementation and testing.

---

**Last Updated:** October 15, 2025
**Next Review:** After critical fixes completed
