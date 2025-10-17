# HypeAI Referral Dashboard - Quick Start Guide

## 1. Installation (5 minutes)

### Install Dependencies
```bash
cd /Users/ai.place/Crypto
npm install qrcode @types/qrcode
```

### Environment Setup
Create `src/frontend/.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api
NEXT_PUBLIC_SITE_URL=https://hypeai.agency
```

## 2. File Structure Overview

```
src/frontend/
├── components/referral/        # 5 React components
│   ├── AuthModal.tsx           # Web3 + Email auth
│   ├── ReferralDashboard.tsx   # Stats + referral link
│   ├── ReferralList.tsx        # Table with filters
│   ├── ClaimRewards.tsx        # Rewards claiming
│   └── ReferralSettings.tsx    # User settings
│
├── hooks/                      # 2 custom hooks
│   ├── useWeb3Auth.ts          # Wallet connection
│   └── useReferralAPI.ts       # API data fetching
│
├── pages/dashboard/
│   └── index.tsx               # Main dashboard page
│
├── types/
│   └── referral.ts             # TypeScript types
│
└── utils/
    └── helpers.ts              # Utility functions
```

## 3. Quick Test (2 minutes)

### Start Development Server
```bash
npm run dev
```

### Visit Dashboard
```
http://localhost:3000/dashboard
```

## 4. Integration Steps

### Option A: Use Complete Dashboard (Recommended)

**Step 1**: Import the dashboard page
```typescript
// pages/referral.tsx
import DashboardPage from '@/pages/dashboard';
export default DashboardPage;
```

**Step 2**: Access at `/referral`

That's it! Full dashboard is ready.

### Option B: Custom Integration

**Step 1**: Import components you need
```typescript
import {
  ReferralDashboard,
  ReferralList
} from '@/components/referral';
```

**Step 2**: Use in your page
```typescript
function MyPage() {
  return (
    <div>
      <ReferralDashboard userId="123" />
      <ReferralList userId="123" />
    </div>
  );
}
```

## Support

Need help? Check:
- Full documentation: `/docs/REFERRAL_DASHBOARD_README.md`
- Component code: `/src/frontend/components/referral/`
- Contact: support@hypeai.agency

---

Ready to launch! 🚀
