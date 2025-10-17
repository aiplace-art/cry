# HypeAI Referral Dashboard - Complete Frontend Implementation

## Overview

A complete, production-ready referral dashboard system with Web3 integration for HypeAI. This implementation includes authentication, referral tracking, rewards claiming, and comprehensive settings management.

## Features

### 1. Authentication System
- **Web3 Login**: MetaMask and Trust Wallet integration
- **Email/Password**: Traditional authentication option
- **Dual Mode**: Users can switch between Web3 and email auth
- **Auto-detection**: Checks for existing wallet connections

### 2. Dashboard Overview
- Real-time statistics display
- Total referrals count
- Earnings in USDT and HYPE tokens
- Pending rewards tracking
- Referral link generator with QR code
- Click and conversion tracking
- Shareable promotional materials

### 3. Referrals List
- Paginated table view
- Advanced filtering:
  - By status (pending/paid)
  - By date range
  - By amount
  - Search by wallet/email
- Real-time data updates
- Detailed referral information
- Commission tracking per referral

### 4. Rewards Claiming
- View pending rewards
- Claim rewards in USDT or HYPE tokens
- Transaction history
- Blockchain transaction tracking
- Minimum claim amount validation
- Real-time status updates

### 5. Settings Management
- Reward type selection (USDT/HYPE)
- Payout wallet configuration
- Email/Telegram notifications
- KYC document upload
- Wallet address validation

## Tech Stack

```
Frontend:
- React 18
- Next.js 14
- TypeScript
- Tailwind CSS
- QRCode library

Web3:
- MetaMask SDK
- Trust Wallet integration
- Ethereum provider detection

State Management:
- React Hooks
- Custom API hooks
- Real-time updates
```

## Project Structure

```
src/frontend/
├── components/
│   └── referral/
│       ├── AuthModal.tsx           # Authentication modal
│       ├── ReferralDashboard.tsx   # Main dashboard overview
│       ├── ReferralList.tsx        # Referrals table with filters
│       ├── ClaimRewards.tsx        # Rewards claiming interface
│       ├── ReferralSettings.tsx    # Settings management
│       └── index.ts                # Component exports
│
├── hooks/
│   ├── useWeb3Auth.ts              # Web3 wallet connection
│   ├── useReferralAPI.ts           # API data fetching hooks
│   └── index.ts                    # Hook exports
│
├── pages/
│   └── dashboard/
│       └── index.tsx               # Main dashboard page
│
├── types/
│   └── referral.ts                 # TypeScript type definitions
│
└── utils/
    └── helpers.ts                  # Utility functions
```

## Components

### 1. AuthModal.tsx
**Purpose**: Handle user authentication

**Features**:
- Web3 wallet connection (MetaMask/Trust Wallet)
- Email/password login
- User registration
- Mode switching
- Error handling
- Loading states

**Props**:
```typescript
interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: any) => void;
}
```

### 2. ReferralDashboard.tsx
**Purpose**: Display overview statistics and referral link

**Features**:
- Real-time stats cards
- Referral link management
- QR code generation
- Copy to clipboard
- Conversion tracking
- Success tips

**Props**:
```typescript
interface ReferralDashboardProps {
  userId: string;
  userWallet?: string;
  userEmail?: string;
}
```

### 3. ReferralList.tsx
**Purpose**: Display and filter referrals

**Features**:
- Paginated table
- Advanced filters
- Search functionality
- Status badges
- Commission display
- Real-time updates

**Props**:
```typescript
interface ReferralListProps {
  userId: string;
}
```

### 4. ClaimRewards.tsx
**Purpose**: Manage reward claims

**Features**:
- Pending rewards display
- Claim button with validation
- Transaction history
- Blockchain tracking
- Status updates
- Important notes section

**Props**:
```typescript
interface ClaimRewardsProps {
  userId: string;
  settings: UserSettings | null;
}
```

### 5. ReferralSettings.tsx
**Purpose**: Configure user preferences

**Features**:
- Reward type selection
- Wallet configuration
- Notification settings
- KYC document upload
- Validation
- Success/error feedback

**Props**:
```typescript
interface ReferralSettingsProps {
  userId: string;
}
```

## Hooks

### useWeb3Auth
**Purpose**: Web3 wallet connection management

**Returns**:
```typescript
{
  account: string | null;
  chainId: number | null;
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
  connectWallet: () => Promise<boolean>;
  disconnectWallet: () => void;
  switchNetwork: (chainId: number) => Promise<boolean>;
}
```

### useReferralStats
**Purpose**: Fetch referral statistics

**Returns**:
```typescript
{
  stats: ReferralStats | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}
```

### useReferrals
**Purpose**: Fetch and filter referrals list

**Parameters**:
- `userId: string`
- `filters?: FilterOptions`
- `pagination?: { page: number; pageSize: number }`

**Returns**:
```typescript
{
  referrals: Referral[];
  paginationData: PaginationData | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}
```

### useReferralLink
**Purpose**: Get referral link and QR code

**Returns**:
```typescript
{
  link: ReferralLink | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}
```

### useRewardClaims
**Purpose**: Manage reward claims

**Returns**:
```typescript
{
  claims: RewardClaim[];
  loading: boolean;
  error: string | null;
  claimRewards: (amount: number, type: 'USDT' | 'HYPE') => Promise<any>;
  refetch: () => void;
}
```

### useUserSettings
**Purpose**: Manage user settings

**Returns**:
```typescript
{
  settings: UserSettings | null;
  loading: boolean;
  error: string | null;
  updateSettings: (updates: Partial<UserSettings>) => Promise<any>;
  refetch: () => void;
}
```

## Installation

### 1. Install Dependencies

```bash
npm install qrcode @types/qrcode
```

### 2. Environment Variables

Create `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api
NEXT_PUBLIC_SITE_URL=https://hypeai.agency
```

### 3. Import Components

```typescript
import { ReferralDashboard } from '@/components/referral';
import { useWeb3Auth } from '@/hooks';
```

## Usage Examples

### Basic Dashboard Setup

```typescript
import DashboardPage from '@/pages/dashboard';

function App() {
  return <DashboardPage />;
}
```

### Custom Integration

```typescript
import { ReferralDashboard } from '@/components/referral';
import { useWeb3Auth } from '@/hooks';

function MyDashboard() {
  const { account } = useWeb3Auth();

  return (
    <ReferralDashboard
      userId="user123"
      userWallet={account}
    />
  );
}
```

### Web3 Connection

```typescript
import { useWeb3Auth } from '@/hooks';

function ConnectWallet() {
  const { connectWallet, account, isConnecting } = useWeb3Auth();

  return (
    <button onClick={connectWallet} disabled={isConnecting}>
      {account ? `Connected: ${account}` : 'Connect Wallet'}
    </button>
  );
}
```

## API Integration

### Required Backend Endpoints

```typescript
// Authentication
POST   /api/auth/web3           - Web3 authentication
POST   /api/auth/login          - Email login
POST   /api/auth/register       - User registration
POST   /api/auth/logout         - Logout
GET    /api/auth/me             - Current user

// Referrals
GET    /api/referrals/stats     - Get statistics
GET    /api/referrals           - Get referrals list
GET    /api/referrals/link      - Get referral link
GET    /api/referrals/claims    - Get claim history
POST   /api/referrals/claim     - Create claim

// Settings
GET    /api/referrals/settings  - Get user settings
PUT    /api/referrals/settings  - Update settings
POST   /api/referrals/kyc       - Upload KYC document
```

### Example API Response Formats

**GET /api/referrals/stats**:
```json
{
  "totalReferrals": 15,
  "totalEarned": 450,
  "totalEarnedUSDT": 300,
  "totalEarnedHYPE": 187500,
  "pendingRewards": 120,
  "paidRewards": 330
}
```

**GET /api/referrals**:
```json
{
  "referrals": [
    {
      "id": "ref_123",
      "referredUser": {
        "wallet": "0x1234...",
        "email": "user@example.com",
        "name": "John Doe"
      },
      "purchaseAmount": 500,
      "commissionAmount": 25,
      "commissionPercentage": 5,
      "status": "paid",
      "createdAt": "2025-01-15T10:30:00Z",
      "paidAt": "2025-01-16T14:20:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "pageSize": 10,
    "total": 15,
    "totalPages": 2
  }
}
```

## Styling

### Tailwind Configuration

All components use Tailwind CSS classes. Ensure your `tailwind.config.js` includes:

```javascript
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        purple: {
          50: '#faf5ff',
          600: '#9333ea',
        },
        pink: {
          600: '#db2777',
        },
      },
    },
  },
}
```

### Custom Styling

Components support custom styling through Tailwind classes. Example:

```typescript
<ReferralDashboard
  className="custom-dashboard"
  userId={userId}
/>
```

## Mobile Responsiveness

All components are fully responsive with breakpoints:
- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: > 1024px

Example responsive grid:
```typescript
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
  {/* Stats cards */}
</div>
```

## Security Best Practices

### 1. Wallet Validation
```typescript
import { validateWalletAddress } from '@/utils/helpers';

const isValid = validateWalletAddress(address);
```

### 2. Input Sanitization
All user inputs are validated before submission.

### 3. Secure API Calls
```typescript
// Always use try-catch
try {
  const response = await fetch('/api/endpoint');
  const data = await response.json();
} catch (error) {
  // Handle error
}
```

### 4. Environment Variables
Never expose private keys or secrets in frontend code.

## Performance Optimization

### 1. Code Splitting
Components are lazy-loaded where appropriate.

### 2. Debouncing
Search inputs use debouncing:
```typescript
import { debounce } from '@/utils/helpers';

const handleSearch = debounce((query) => {
  // Search logic
}, 300);
```

### 3. Pagination
Large lists are paginated to improve performance.

### 4. Caching
API responses are cached appropriately.

## Testing

### Unit Testing Example

```typescript
import { render, screen } from '@testing-library/react';
import { ReferralDashboard } from '@/components/referral';

test('renders dashboard with stats', () => {
  render(
    <ReferralDashboard
      userId="test123"
      userWallet="0x1234..."
    />
  );

  expect(screen.getByText('Referral Dashboard')).toBeInTheDocument();
});
```

## Troubleshooting

### Common Issues

**1. MetaMask Not Detected**
```typescript
if (typeof window.ethereum === 'undefined') {
  alert('Please install MetaMask');
}
```

**2. Wrong Network**
```typescript
const { switchNetwork } = useWeb3Auth();
await switchNetwork(1); // Switch to Ethereum mainnet
```

**3. API Connection Issues**
Check `NEXT_PUBLIC_API_URL` environment variable.

## Future Enhancements

- [ ] Multi-language support (i18n)
- [ ] Dark mode toggle
- [ ] Advanced analytics dashboard
- [ ] Social sharing integrations
- [ ] Mobile app version
- [ ] Push notifications
- [ ] CSV export functionality
- [ ] Referral leaderboard

## License

MIT License - HypeAI 2025

## Support

For issues or questions:
- Email: support@hypeai.agency
- Telegram: @hypeai_support
- Documentation: https://docs.hypeai.agency

---

**Version**: 1.0.0
**Last Updated**: January 2025
**Maintainer**: HypeAI Development Team
