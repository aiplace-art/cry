# HypeAI Private Sale - Web3 Hooks Documentation

## Overview

Production-ready React hooks for Web3 integration with the HypeAI Private Sale smart contract on Binance Smart Chain (BSC).

## Architecture

```
src/frontend/
├── hooks/
│   ├── useWallet.ts      # Wallet connection & network management
│   ├── usePresale.ts     # Presale contract interactions
│   └── index.ts          # Export index
├── lib/
│   └── contracts.ts      # Contract instances, ABIs, utilities
└── .env.example          # Environment variables template
```

## Setup

### 1. Install Dependencies

```bash
npm install ethers@^6.0.0
# or
yarn add ethers@^6.0.0
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env.local` and update with your deployed contract addresses:

```env
NEXT_PUBLIC_PRESALE_CONTRACT=0x... # Your deployed PrivateSale contract
NEXT_PUBLIC_HYPEAI_TOKEN=0x...     # Your deployed HypeAI token
```

### 3. Import Hooks

```typescript
import { useWallet, usePresale } from '@/hooks';
```

## Hooks API Reference

### useWallet

Manages wallet connection, network switching, and balance tracking.

#### State

```typescript
interface WalletState {
  address: string | null;           // Connected wallet address
  chainId: number | null;           // Current chain ID
  isConnected: boolean;             // Connection status
  isCorrectNetwork: boolean;        // Is on BSC?
  bnbBalance: string;              // BNB balance (formatted)
  usdtBalance: string;             // USDT balance (formatted)
  hypeaiBalance: string;           // HypeAI token balance (formatted)
  provider: BrowserProvider | null; // Ethers provider instance
}
```

#### Methods

```typescript
const {
  // State
  address,
  chainId,
  isConnected,
  isCorrectNetwork,
  bnbBalance,
  usdtBalance,
  hypeaiBalance,
  provider,

  // Loading & Error
  isLoading,
  error,

  // Utilities
  isMetaMaskInstalled,

  // Actions
  connectWallet,      // () => Promise<void>
  disconnectWallet,   // () => void
  switchToBSC,        // () => Promise<void>
  refreshBalances,    // () => Promise<void>
} = useWallet();
```

#### Usage Example

```typescript
function WalletButton() {
  const {
    isConnected,
    address,
    isCorrectNetwork,
    connectWallet,
    switchToBSC,
    bnbBalance,
    isLoading
  } = useWallet();

  if (!isConnected) {
    return (
      <button onClick={connectWallet} disabled={isLoading}>
        Connect Wallet
      </button>
    );
  }

  if (!isCorrectNetwork) {
    return (
      <button onClick={switchToBSC}>
        Switch to BSC
      </button>
    );
  }

  return (
    <div>
      <p>Connected: {address}</p>
      <p>BNB Balance: {bnbBalance}</p>
    </div>
  );
}
```

### usePresale

Main hook for interacting with the Private Sale contract.

#### State

```typescript
interface SaleStats {
  totalUSDRaised: number;         // Total USD raised
  totalTokensSold: string;        // Total tokens sold (formatted)
  foundingMembersCount: number;   // Number of founding members
  remainingTokens: string;        // Tokens remaining (formatted)
  remainingUSDCap: number;        // USD remaining to hard cap
  timeRemaining: number;          // Seconds until sale ends
  isActive: boolean;              // Is sale currently active?
  progressPercentage: number;     // Progress to hard cap (0-100)
}

interface UserEligibility {
  eligible: boolean;              // Can user purchase?
  remainingAllocation: number;    // USD remaining they can spend
  tokensWouldReceive: string;     // Tokens for remaining allocation
  isWhitelisted: boolean;         // Is address whitelisted?
  contribution: number;           // Total USD contributed
  tokensPurchased: string;        // Total tokens purchased (formatted)
  isFoundingMember: boolean;      // Is a founding member?
}

interface TransactionState {
  status: TransactionStatus;      // idle | approving | pending | success | error
  hash?: string;                  // Transaction hash
  error?: string;                 // Error message
}
```

#### Methods

```typescript
const {
  // State
  saleStats,
  userEligibility,
  transactionState,
  isLoading,

  // Read Methods
  getSaleStats,          // () => Promise<SaleStats>
  checkEligibility,      // (address: string) => Promise<UserEligibility>
  getUserContribution,   // (address: string) => Promise<UserContribution>

  // Write Methods
  purchaseWithBNB,       // (usdAmount: number) => Promise<{success: boolean, hash: string}>
  purchaseWithUSDT,      // (usdAmount: number) => Promise<{success: boolean, hash: string}>

  // Utilities
  resetTransactionState, // () => void
  calculateExpectedTokens, // (usdAmount: number) => string
} = usePresale();
```

#### Purchase Flow Example

```typescript
function PurchaseForm() {
  const { address } = useWallet();
  const {
    userEligibility,
    purchaseWithBNB,
    transactionState,
    calculateExpectedTokens,
  } = usePresale();

  const [amount, setAmount] = useState('');

  const handlePurchase = async () => {
    try {
      const result = await purchaseWithBNB(Number(amount));
      console.log('Purchase successful:', result.hash);
    } catch (error) {
      console.error('Purchase failed:', error);
    }
  };

  if (!userEligibility?.eligible) {
    return <p>Not eligible to purchase</p>;
  }

  return (
    <div>
      <input
        type="number"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        min="40"
        max={userEligibility.remainingAllocation}
      />

      <p>You will receive: {calculateExpectedTokens(Number(amount))} HYPEAI</p>

      <button
        onClick={handlePurchase}
        disabled={transactionState.status !== 'idle'}
      >
        {transactionState.status === 'pending' ? 'Processing...' : 'Buy with BNB'}
      </button>

      {transactionState.status === 'success' && (
        <p>Success! Transaction: {transactionState.hash}</p>
      )}

      {transactionState.status === 'error' && (
        <p>Error: {transactionState.error}</p>
      )}
    </div>
  );
}
```

## Contract Integration (lib/contracts.ts)

### Configuration

```typescript
import { BSC_CONFIG, CONTRACTS, formatters } from '@/lib/contracts';

// Network config
BSC_CONFIG.chainId        // '0x38' (56)
BSC_CONFIG.rpcUrls        // ['https://bsc-dataseed1.binance.org']

// Contract addresses
CONTRACTS.PRESALE         // PrivateSale contract
CONTRACTS.HYPEAI_TOKEN    // HypeAI token
CONTRACTS.USDT_TOKEN      // USDT on BSC
```

### Formatters

```typescript
// Format token amounts
formatters.formatToken(bigIntAmount, decimals)     // BigInt => string
formatters.parseToken(stringAmount, decimals)      // string => BigInt

// Format display values
formatters.formatUSD(123.45)                       // "$123.45"
formatters.formatTokenAmount(1234567)              // "1,234,567"
formatters.formatAddress("0x123...789")            // "0x123...789"

// Calculate values
calculateBNBFromUSD(40, 600)                       // "0.066667"
calculateExpectedTokens(100)                       // "137,500" (includes bonus)
```

### Error Messages

```typescript
import { ERROR_MESSAGES } from '@/lib/contracts';

ERROR_MESSAGES.WALLET_NOT_CONNECTED
ERROR_MESSAGES.WRONG_NETWORK
ERROR_MESSAGES.NOT_WHITELISTED
ERROR_MESSAGES.BELOW_MINIMUM
ERROR_MESSAGES.ABOVE_MAXIMUM
// ... and more
```

## Transaction Status Flow

```
IDLE → APPROVING (USDT only) → PENDING → SUCCESS
  ↓                                ↓
  └────────────────────────────→ ERROR
```

### Status Handling

```typescript
import { TransactionStatus } from '@/hooks';

switch (transactionState.status) {
  case TransactionStatus.IDLE:
    // Show purchase form
    break;
  case TransactionStatus.APPROVING:
    // Show "Approving USDT..." message
    break;
  case TransactionStatus.PENDING:
    // Show "Transaction pending..." with hash
    break;
  case TransactionStatus.SUCCESS:
    // Show success message with hash
    break;
  case TransactionStatus.ERROR:
    // Show error message
    break;
}
```

## Event Listeners

The hooks automatically listen for blockchain events:

### Auto-Updates

- **TokensPurchased**: Refreshes sale stats and user eligibility
- **WhitelistUpdated**: Updates user eligibility if address matches
- **AccountChanged**: Updates wallet state and refreshes balances
- **ChainChanged**: Reloads page (MetaMask recommendation)

### Manual Refresh

```typescript
const { refreshBalances } = useWallet();
const { getSaleStats, checkEligibility } = usePresale();

// Refresh all data
await Promise.all([
  refreshBalances(),
  getSaleStats(),
  checkEligibility(address),
]);
```

## Error Handling

All methods throw errors with descriptive messages. Always wrap in try-catch:

```typescript
try {
  await purchaseWithBNB(100);
} catch (error) {
  // Error messages are user-friendly:
  // - "Please connect your wallet"
  // - "Your address is not whitelisted for this sale"
  // - "Purchase amount below minimum ($40)"
  // - "Insufficient balance"
  // etc.

  toast.error(error.message);
}
```

## Network Validation

The hooks enforce BSC network:

```typescript
const { isCorrectNetwork, switchToBSC } = useWallet();

if (!isCorrectNetwork) {
  // User is on wrong network
  await switchToBSC(); // Automatically adds BSC if not present
}
```

## Gas Optimization

Gas limits are automatically estimated with 20% buffer:

```typescript
// Automatic gas estimation
const gasLimit = await contract.method.estimateGas(params);
const bufferedGas = (gasLimit * 120n) / 100n;

// Fallback limits if estimation fails
GAS_LIMITS.APPROVE          // 100,000
GAS_LIMITS.PURCHASE_BNB     // 250,000
GAS_LIMITS.PURCHASE_USDT    // 300,000
```

## Complete Integration Example

```typescript
import { useWallet, usePresale, TransactionStatus } from '@/hooks';

function PresaleDashboard() {
  const wallet = useWallet();
  const presale = usePresale();
  const [usdAmount, setUsdAmount] = useState('');

  // Show MetaMask install prompt
  if (!wallet.isMetaMaskInstalled) {
    return <InstallMetaMask />;
  }

  // Show connect button
  if (!wallet.isConnected) {
    return <button onClick={wallet.connectWallet}>Connect Wallet</button>;
  }

  // Show network switch button
  if (!wallet.isCorrectNetwork) {
    return <button onClick={wallet.switchToBSC}>Switch to BSC</button>;
  }

  // Show eligibility check
  if (!presale.userEligibility?.eligible) {
    return (
      <div>
        <p>Not eligible to purchase</p>
        {!presale.userEligibility?.isWhitelisted && (
          <p>Reason: Not whitelisted</p>
        )}
        {presale.userEligibility?.remainingAllocation === 0 && (
          <p>Reason: Maximum purchase limit reached</p>
        )}
      </div>
    );
  }

  const handleBNBPurchase = async () => {
    try {
      const result = await presale.purchaseWithBNB(Number(usdAmount));
      alert(`Success! Transaction: ${result.hash}`);
    } catch (error) {
      alert(`Error: ${error.message}`);
    }
  };

  const handleUSDTPurchase = async () => {
    try {
      const result = await presale.purchaseWithUSDT(Number(usdAmount));
      alert(`Success! Transaction: ${result.hash}`);
    } catch (error) {
      alert(`Error: ${error.message}`);
    }
  };

  return (
    <div>
      {/* Sale Statistics */}
      {presale.saleStats && (
        <div>
          <h2>Sale Progress</h2>
          <p>Raised: ${presale.saleStats.totalUSDRaised} / $80,000</p>
          <p>Progress: {presale.saleStats.progressPercentage.toFixed(2)}%</p>
          <p>Founding Members: {presale.saleStats.foundingMembersCount} / 500</p>
          <p>Time Remaining: {Math.floor(presale.saleStats.timeRemaining / 3600)}h</p>
        </div>
      )}

      {/* User Info */}
      {presale.userEligibility && (
        <div>
          <h2>Your Status</h2>
          <p>Contributed: ${presale.userEligibility.contribution}</p>
          <p>Tokens Purchased: {presale.userEligibility.tokensPurchased}</p>
          <p>Remaining Allocation: ${presale.userEligibility.remainingAllocation}</p>
          {presale.userEligibility.isFoundingMember && (
            <p>🎉 You are a Founding Member!</p>
          )}
        </div>
      )}

      {/* Purchase Form */}
      <div>
        <h2>Purchase Tokens</h2>

        <input
          type="number"
          value={usdAmount}
          onChange={(e) => setUsdAmount(e.target.value)}
          placeholder="Amount in USD"
          min="40"
          max={presale.userEligibility.remainingAllocation}
        />

        <p>
          You will receive: {presale.calculateExpectedTokens(Number(usdAmount))} HYPEAI
          <br />
          (Includes 10% bonus!)
        </p>

        <div>
          <button
            onClick={handleBNBPurchase}
            disabled={presale.transactionState.status !== TransactionStatus.IDLE}
          >
            Buy with BNB ({(Number(usdAmount) / 600).toFixed(6)} BNB)
          </button>

          <button
            onClick={handleUSDTPurchase}
            disabled={presale.transactionState.status !== TransactionStatus.IDLE}
          >
            Buy with USDT (${usdAmount})
          </button>
        </div>

        {/* Transaction Status */}
        {presale.transactionState.status === TransactionStatus.APPROVING && (
          <p>⏳ Approving USDT...</p>
        )}
        {presale.transactionState.status === TransactionStatus.PENDING && (
          <p>⏳ Transaction pending... Hash: {presale.transactionState.hash}</p>
        )}
        {presale.transactionState.status === TransactionStatus.SUCCESS && (
          <p>✅ Success! Transaction: {presale.transactionState.hash}</p>
        )}
        {presale.transactionState.status === TransactionStatus.ERROR && (
          <p>❌ Error: {presale.transactionState.error}</p>
        )}
      </div>

      {/* Wallet Info */}
      <div>
        <h3>Wallet</h3>
        <p>Address: {wallet.address}</p>
        <p>BNB Balance: {wallet.bnbBalance}</p>
        <p>USDT Balance: {wallet.usdtBalance}</p>
        <p>HypeAI Balance: {wallet.hypeaiBalance}</p>
        <button onClick={wallet.refreshBalances}>Refresh Balances</button>
      </div>
    </div>
  );
}
```

## Security Considerations

1. **Contract Validation**: Validates contract addresses on initialization
2. **Network Enforcement**: Only allows transactions on BSC (chainId: 56)
3. **Input Validation**: Enforces min ($40) and max ($800) purchase limits
4. **Balance Checks**: Validates sufficient balance before transactions
5. **Allowance Management**: Handles USDT approval automatically
6. **Gas Buffer**: Adds 20% buffer to gas estimates for safety
7. **Error Handling**: All errors are caught and user-friendly
8. **Event Validation**: Only listens to contract events on correct network

## Testing

Before production deployment:

1. Test on BSC Testnet (chainId: 97)
2. Update `BSC_TESTNET_CONFIG` in contracts.ts
3. Deploy contracts to testnet
4. Update `.env.local` with testnet addresses
5. Test all purchase flows
6. Test error scenarios
7. Test network switching
8. Test wallet disconnection

## Production Checklist

- [ ] Deploy contracts to BSC Mainnet
- [ ] Update `.env.local` with production addresses
- [ ] Test wallet connection
- [ ] Test network switching
- [ ] Test BNB purchase flow
- [ ] Test USDT purchase flow (with approval)
- [ ] Test error handling
- [ ] Test event listeners
- [ ] Test balance refreshing
- [ ] Verify gas limits
- [ ] Test on multiple browsers
- [ ] Test MetaMask mobile
- [ ] Monitor transaction costs
- [ ] Set up error tracking (Sentry)
- [ ] Set up analytics

## Support

For issues or questions:
- Check error messages in browser console
- Verify contract addresses in `.env.local`
- Ensure MetaMask is on BSC network
- Check BSCScan for transaction details
- Review this documentation

---

**Built with ethers.js v6 for production-ready Web3 integration.**
