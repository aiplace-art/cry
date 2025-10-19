# ✅ Quick Fix Checklist for Production Readiness

**Goal**: Get to 95/100 score and production-ready status

---

## 🔴 CRITICAL FIXES (Required for Build)

### 1. TypeScript Compilation (4-6 hours)

#### Ethers.js v6 Migration
```typescript
□ Replace ethers.providers.Web3Provider → BrowserProvider
□ Replace ethers.utils.parseEther → parseEther
□ Replace ethers.utils.formatEther → formatEther
□ Replace ethers.BigNumber → bigint
□ Update all contract interaction code
□ Test wallet connection
```

**Files to Update**:
- `□ utils/presaleContract.ts` (32 errors)
- `□ contexts/Web3Context.tsx`
- `□ hooks/useWeb3.ts`
- `□ hooks/usePresale.ts`

#### Missing Type Exports
```typescript
□ Export PresaleRound from types/presale.ts
□ Export PaymentMethod from types/presale.ts
□ Export GasEstimate from types/presale.ts
□ Export TransactionError from types/presale.ts
□ Export PAYMENT_METHODS from lib/constants.ts
□ Export PRESALE_CONFIG from lib/constants.ts
□ Export CONTRACT_ABI from lib/constants.ts
□ Export TOKEN_ADDRESSES from lib/constants.ts
□ Export GAS_LIMIT_BUFFER from lib/constants.ts
```

**Files to Update**:
- `□ types/presale.ts`
- `□ lib/constants.ts`
- `□ hooks/index.ts`

#### Missing Hook Exports
```typescript
□ Export useCalculator from hooks/index.ts
□ Export useAnalytics from hooks/index.ts
□ Export useRecommendations from hooks/index.ts
□ Export useLiveUpdates from hooks/index.ts
```

**Files to Update**:
- `□ hooks/index.ts`

#### Framer Motion Types
```typescript
□ Fix BenefitsGrid.tsx animation variants
□ Change ease: [0.43, 0.13, 0.23, 0.96] → ease: 'easeInOut'
□ Update all animation configs to use string literals
```

**Files to Update**:
- `□ components/presale/BenefitsGrid.tsx`

#### PWA Types
```typescript
□ Fix Uint8Array type in pwa.ts
□ Update PushSubscriptionOptionsInit typing
```

**Files to Update**:
- `□ utils/pwa.ts`

---

### 2. Test Infrastructure (2-3 hours)

#### Install Dependencies
```bash
□ npm install --save-dev ts-jest
□ npm install --save-dev @types/jest
□ npm install --save-dev jest-environment-jsdom
□ npm install --save-dev @testing-library/react
□ npm install --save-dev @testing-library/jest-dom
```

#### Fix Configuration
```javascript
□ Fix Jest config typo: coverageThresholds → coverageThreshold
□ Add preset: 'ts-jest'
□ Add testEnvironment: 'jsdom'
□ Add setupFilesAfterEnv config
```

**Files to Update**:
- `□ tests/frontend/jest.config.js`

#### Create Test Suites
```bash
□ Create __tests__/components/PresaleWidget.test.tsx
□ Create __tests__/utils/presaleContract.test.ts
□ Create __tests__/hooks/usePresale.test.ts
□ Create __tests__/components/BNBButton.test.tsx
□ Run tests and verify they pass
```

---

### 3. BNB Branding (3-4 hours)

#### Update Tailwind Config
```javascript
□ Add bnb-gold: '#F3BA2F'
□ Add bnb-dark: '#1E2026'
□ Add bnb-darker: '#14151A'
□ Add bnb-green: '#0ECB81'
□ Add bnb-red: '#F6465D'
□ Add bnb-gray: '#848E9C'
□ Add bnb-text: '#EAECEF'
□ Replace primary colors with BNB gold
□ Add BNB gradients
```

**Files to Update**:
- `□ tailwind.config.js`

#### Migrate Components (Search & Replace)
```bash
□ bg-blue-500 → bg-bnb-gold
□ bg-blue-600 → bg-bnb-gold/90
□ bg-purple-500 → bg-bnb-dark
□ bg-purple-600 → bg-bnb-darker
□ text-green-500 → text-bnb-green
□ text-blue-500 → text-bnb-gold
□ border-blue-500 → border-bnb-gold
```

**Files to Review**:
- `□ All components in components/`
- `□ All pages in pages/`

#### Update Global Styles
```css
□ Add :root CSS variables for BNB colors
□ Update body background
□ Update default text colors
```

**Files to Update**:
- `□ styles/globals.css`

---

## 🟡 HIGH PRIORITY (Before Launch)

### 4. ESLint Warnings (1-2 hours)

```typescript
□ Add missing dependency to BadgeSystem.tsx useEffect
□ Add missing dependencies to Leaderboard.tsx useEffect
□ Add missing dependency to NotificationCenter.tsx useEffect
□ Replace <img> with <Image /> in ReferralDashboard.tsx (2 instances)
□ Fix anonymous export in lib/contracts.ts
```

**Files to Update**:
- `□ components/referral/BadgeSystem.tsx`
- `□ components/referral/Leaderboard.tsx`
- `□ components/referral/NotificationCenter.tsx`
- `□ components/referral/ReferralDashboard.tsx`
- `□ lib/contracts.ts`

### 5. Build Configuration (1 hour)

```bash
□ Remove duplicate dashboard.tsx (keep dashboard/index.tsx)
□ Remove swcMinify from next.config.js
□ Add outputFileTracingRoot to silence lockfile warning
□ Run build and verify success
```

**Files to Update**:
- `□ next.config.js`
- `□ Delete: pages/dashboard.tsx`

---

## 🟢 MEDIUM PRIORITY (Post-Launch)

### 6. Performance Optimization

```bash
□ Add service worker
□ Implement image optimization
□ Add compression middleware
□ Setup bundle analyzer
□ Optimize bundle size
```

### 7. Enhanced Testing

```bash
□ Add E2E tests with Playwright
□ Add integration tests
□ Add performance tests
□ Achieve 95%+ coverage
```

---

## ✅ VERIFICATION CHECKLIST

### Build Verification
```bash
□ npm run typecheck → 0 errors
□ npm run lint → 0 errors, <5 warnings
□ npm run test → All tests pass
□ npm run build → Build succeeds
□ npm run start → App starts
```

### Visual Verification
```bash
□ Dashboard loads without errors
□ BNB gold color (#F3BA2F) used consistently
□ Dark theme (#1E2026, #14151A) applied
□ Buttons animate smoothly
□ Wallet connection works
□ Forms submit correctly
```

### Test Coverage
```bash
□ Unit tests: ≥95%
□ Integration tests: ≥80%
□ E2E tests: Critical paths covered
□ No failing tests
```

### Final Validation
```bash
□ Run production validation again
□ Score ≥95/100
□ All critical issues resolved
□ Staging environment tested
□ Performance verified
```

---

## 📊 PROGRESS TRACKING

### Current Status
```
☐ TypeScript Compilation    [ 0%] - 0/5 tasks
☐ Test Infrastructure        [ 0%] - 0/3 tasks
☐ BNB Branding              [ 0%] - 0/3 tasks
☐ ESLint Warnings           [ 0%] - 0/5 tasks
☐ Build Configuration       [ 0%] - 0/4 tasks
```

### Target Status (Production Ready)
```
✅ TypeScript Compilation    [100%] - 5/5 tasks
✅ Test Infrastructure        [100%] - 3/3 tasks
✅ BNB Branding              [100%] - 3/3 tasks
✅ ESLint Warnings           [100%] - 5/5 tasks
✅ Build Configuration       [100%] - 4/4 tasks
```

---

## 🚀 READY FOR PRODUCTION?

### Minimum Requirements
- ✅ TypeScript: 0 errors
- ✅ Tests: 95% coverage
- ✅ Build: Successful
- ✅ Score: ≥95/100
- ✅ All critical issues resolved

### Current Status
- ❌ TypeScript: 150+ errors
- ❌ Tests: 0% coverage
- ❌ Build: Failed
- ❌ Score: 38/100
- ❌ 3 critical blockers

---

**Use this checklist to track progress towards production readiness!**
