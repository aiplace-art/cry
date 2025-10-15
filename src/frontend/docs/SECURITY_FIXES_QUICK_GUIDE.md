# SECURITY FIXES - Quick Implementation Guide
## Priority-Based Remediation for HypeAI Presale

---

## CRITICAL FIXES (Deploy Blocker)

### FIX-01: Implement Chainlink Price Oracle

**File:** `/lib/priceOracle.ts` (NEW)
```typescript
import { ethers } from 'ethers';

// Chainlink BNB/USD Price Feed on BSC Mainnet
const BNB_USD_FEED = '0x0567F2323251f0Aab15c8dFb1967E4e8A7D42aeE';

const PRICE_FEED_ABI = [
  'function latestRoundData() external view returns (uint80 roundId, int256 answer, uint256 startedAt, uint256 updatedAt, uint80 answeredInRound)',
  'function decimals() external view returns (uint8)',
];

export const getBNBPrice = async (
  provider: ethers.Provider
): Promise<number> => {
  try {
    const priceFeed = new ethers.Contract(
      BNB_USD_FEED,
      PRICE_FEED_ABI,
      provider
    );

    const [roundId, answer, , updatedAt, answeredInRound] =
      await priceFeed.latestRoundData();

    // Validate price feed data
    if (answeredInRound < roundId) {
      throw new Error('Stale price data');
    }

    const stalePeriod = 3600; // 1 hour
    if (Date.now() / 1000 - Number(updatedAt) > stalePeriod) {
      throw new Error('Price feed not updated recently');
    }

    const decimals = await priceFeed.decimals();
    const price = Number(answer) / Math.pow(10, decimals);

    // Sanity check: BNB should be between $100 and $2000
    if (price < 100 || price > 2000) {
      throw new Error('Price outside expected range');
    }

    return price;
  } catch (err) {
    console.error('Failed to fetch BNB price from oracle:', err);
    throw err;
  }
};

// Fallback to CoinGecko API if Chainlink fails
export const getBNBPriceFallback = async (): Promise<number> => {
  try {
    const response = await fetch(
      'https://api.coingecko.com/api/v3/simple/price?ids=binancecoin&vs_currencies=usd',
      { cache: 'no-store' }
    );

    if (!response.ok) {
      throw new Error('CoinGecko API failed');
    }

    const data = await response.json();
    const price = data.binancecoin.usd;

    if (!price || price < 100 || price > 2000) {
      throw new Error('Invalid price from CoinGecko');
    }

    return price;
  } catch (err) {
    console.error('CoinGecko fallback failed:', err);
    throw err;
  }
};

// Main price fetcher with fallback
export const getCurrentBNBPrice = async (
  provider?: ethers.Provider
): Promise<number> => {
  try {
    if (provider) {
      return await getBNBPrice(provider);
    }
  } catch (err) {
    console.warn('Chainlink price feed failed, using fallback');
  }

  return await getBNBPriceFallback();
};
```

**File:** `/hooks/useBNBPrice.ts` (NEW)
```typescript
import { useState, useEffect } from 'react';
import { getCurrentBNBPrice } from '@/lib/priceOracle';
import { useWallet } from './useWallet';

export const useBNBPrice = () => {
  const { provider } = useWallet();
  const [price, setPrice] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchPrice = async () => {
      try {
        setLoading(true);
        const currentPrice = await getCurrentBNBPrice(provider || undefined);

        if (isMounted) {
          setPrice(currentPrice);
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Failed to fetch price');
          setPrice(null);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchPrice();

    // Update price every 30 seconds
    const interval = setInterval(fetchPrice, 30000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [provider]);

  return { price, loading, error };
};
```

**Update:** `/hooks/usePresale.ts`
```typescript
import { useBNBPrice } from './useBNBPrice';

export const usePresale = () => {
  const wallet = useWallet();
  const { price: bnbPrice, loading: bnbPriceLoading } = useBNBPrice();

  const purchaseWithBNB = useCallback(async (usdAmount: number) => {
    if (!bnbPrice) {
      throw new Error('BNB price not available');
    }

    // Use real-time oracle price instead of hardcoded
    const bnbAmount = usdAmount / bnbPrice; // FIXED!
    const bnbAmountWei = formatters.parseToken(bnbAmount.toFixed(6));

    // ... rest of purchase logic
  }, [wallet, bnbPrice]);

  return {
    // ... other exports
    bnbPrice,
    bnbPriceLoading,
  };
};
```

**Update:** `/pages/presale.tsx`
```typescript
import { useBNBPrice } from '@/hooks/useBNBPrice';

export default function PresalePage() {
  const { price: bnbPrice } = useBNBPrice();

  const calculateTokens = (): number => {
    const amount = parseFloat(purchaseMode.amount) || 0;
    // Use real-time BNB price instead of hardcoded 320
    const usdValue = purchaseMode.currency === 'BNB'
      ? amount * (bnbPrice || 600) // Fallback to 600 if price unavailable
      : amount;
    return usdValue / PRESALE_PRICE;
  };

  // Display current BNB price to user
  {bnbPrice && (
    <div className="text-sm text-gray-400">
      Current BNB Price: ${bnbPrice.toFixed(2)}
    </div>
  )}
}
```

---

### FIX-02: Input Validation & Sanitization

**File:** `/lib/validators.ts` (NEW)
```typescript
export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export const validatePurchaseAmount = (
  amount: string,
  currency: 'BNB' | 'USDT',
  bnbPrice?: number
): number => {
  // Remove whitespace
  const trimmed = amount.trim();

  // Check for empty
  if (!trimmed || trimmed === '') {
    throw new ValidationError('Amount is required');
  }

  // Parse to number
  const parsed = parseFloat(trimmed);

  // Check for NaN
  if (isNaN(parsed)) {
    throw new ValidationError('Invalid amount format');
  }

  // Check for negative
  if (parsed < 0) {
    throw new ValidationError('Amount cannot be negative');
  }

  // Check for zero
  if (parsed === 0) {
    throw new ValidationError('Amount must be greater than zero');
  }

  // Check for infinity
  if (!isFinite(parsed)) {
    throw new ValidationError('Amount is too large');
  }

  // Check decimal places (max 6 decimals)
  const decimalPlaces = (trimmed.split('.')[1] || '').length;
  if (decimalPlaces > 6) {
    throw new ValidationError('Maximum 6 decimal places allowed');
  }

  // Convert to USD for min/max validation
  let usdValue: number;
  if (currency === 'BNB') {
    if (!bnbPrice) {
      throw new ValidationError('BNB price not available');
    }
    usdValue = parsed * bnbPrice;
  } else {
    usdValue = parsed;
  }

  // Check minimum ($40)
  const MIN_PURCHASE_USD = 40;
  if (usdValue < MIN_PURCHASE_USD) {
    throw new ValidationError(`Minimum purchase is $${MIN_PURCHASE_USD}`);
  }

  // Check maximum ($800)
  const MAX_PURCHASE_USD = 800;
  if (usdValue > MAX_PURCHASE_USD) {
    throw new ValidationError(`Maximum purchase is $${MAX_PURCHASE_USD}`);
  }

  return parsed;
};

export const sanitizeNumericInput = (value: string): string => {
  // Remove all non-numeric characters except decimal point
  let sanitized = value.replace(/[^\d.]/g, '');

  // Ensure only one decimal point
  const parts = sanitized.split('.');
  if (parts.length > 2) {
    sanitized = parts[0] + '.' + parts.slice(1).join('');
  }

  // Limit to 6 decimal places
  if (parts.length === 2 && parts[1].length > 6) {
    sanitized = parts[0] + '.' + parts[1].substring(0, 6);
  }

  return sanitized;
};
```

**Update:** `/pages/presale.tsx`
```typescript
import { validatePurchaseAmount, sanitizeNumericInput, ValidationError } from '@/lib/validators';
import { useBNBPrice } from '@/hooks/useBNBPrice';

export default function PresalePage() {
  const { price: bnbPrice } = useBNBPrice();
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;

    // Sanitize input
    const sanitized = sanitizeNumericInput(rawValue);

    // Update state
    setPurchaseMode({ ...purchaseMode, amount: sanitized });

    // Validate
    try {
      if (sanitized !== '') {
        validatePurchaseAmount(sanitized, purchaseMode.currency, bnbPrice || undefined);
      }
      setValidationError(null);
    } catch (err) {
      if (err instanceof ValidationError) {
        setValidationError(err.message);
      }
    }
  };

  return (
    <div className="mb-6">
      <label className="block text-sm font-semibold text-gray-400 mb-2">
        Amount ({purchaseMode.currency})
      </label>
      <div className="relative">
        <input
          type="text"
          inputMode="decimal"
          value={purchaseMode.amount}
          onChange={handleAmountChange}
          onKeyDown={(e) => {
            // Block invalid characters
            if (
              e.key === '-' ||
              e.key === '+' ||
              e.key === 'e' ||
              e.key === 'E'
            ) {
              e.preventDefault();
            }
          }}
          placeholder="0.0"
          className={`w-full bg-slate-800 border ${
            validationError ? 'border-red-500' : 'border-slate-700'
          } rounded-xl px-6 py-4 text-2xl font-bold text-white focus:outline-none focus:border-cyan-500 transition-colors`}
        />
        <div className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-500 font-semibold">
          {purchaseMode.currency}
        </div>
      </div>

      {/* Validation Error */}
      {validationError && (
        <div className="mt-2 text-sm text-red-400 flex items-center gap-2">
          <span className="text-red-500">⚠</span>
          {validationError}
        </div>
      )}

      {/* USD Value */}
      {purchaseMode.amount && !validationError && bnbPrice && (
        <div className="mt-2 text-sm text-gray-400">
          ≈ $
          {(
            (parseFloat(purchaseMode.amount) || 0) *
            (purchaseMode.currency === 'BNB' ? bnbPrice : 1)
          ).toLocaleString('en-US', { maximumFractionDigits: 2 })}
          USD
        </div>
      )}
    </div>
  );
}
```

---

### FIX-03: Transaction Deadline & Slippage Protection

**Update:** `/hooks/usePresale.ts`
```typescript
const purchaseWithBNB = useCallback(async (usdAmount: number) => {
  if (!wallet.address || !wallet.provider) {
    throw new Error(ERROR_MESSAGES.WALLET_NOT_CONNECTED);
  }

  if (!bnbPrice) {
    throw new Error('BNB price not available');
  }

  setIsLoading(true);
  setTransactionState({ status: TransactionStatus.PENDING });

  try {
    const { presale } = await getSignedContracts(wallet.provider);

    // Calculate BNB amount with current oracle price
    const bnbAmount = usdAmount / bnbPrice;
    const bnbAmountWei = formatters.parseToken(bnbAmount.toFixed(6));

    // Calculate minimum tokens to receive (5% slippage tolerance)
    const expectedTokens = calculateExpectedTokens(usdAmount);
    const minTokens = Math.floor(parseFloat(expectedTokens) * 0.95);
    const minTokensWei = formatters.parseToken(minTokens.toString());

    // Set deadline (30 minutes from now)
    const deadline = Math.floor(Date.now() / 1000) + 1800;

    // Validate balance
    const bnbBalance = formatters.parseToken(wallet.bnbBalance);
    if (bnbBalance < bnbAmountWei) {
      throw new Error(ERROR_MESSAGES.INSUFFICIENT_BALANCE);
    }

    // Estimate gas
    let gasLimit: bigint;
    try {
      // Update contract call to include minTokens and deadline
      gasLimit = await presale.purchaseWithBNB.estimateGas(
        minTokensWei,
        deadline,
        { value: bnbAmountWei }
      );
      gasLimit = (gasLimit * 120n) / 100n;

      // Sanity check
      if (gasLimit > 1000000n) {
        throw new Error('Gas estimation too high');
      }
    } catch (err: any) {
      // If estimation fails, check if it's a revert
      if (err.message.includes('revert') || err.message.includes('execution reverted')) {
        throw new Error(
          'Transaction will fail: ' + (err.reason || err.message)
        );
      }
      gasLimit = GAS_LIMITS.PURCHASE_BNB;
    }

    // Send transaction with deadline and slippage protection
    const tx = await presale.purchaseWithBNB(minTokensWei, deadline, {
      value: bnbAmountWei,
      gasLimit,
    });

    setTransactionState({
      status: TransactionStatus.PENDING,
      hash: tx.hash,
    });

    // Wait for confirmation with timeout
    const receipt = await waitForTransaction(tx, 300000); // 5 min timeout

    if (receipt.status === 1) {
      setTransactionState({
        status: TransactionStatus.SUCCESS,
        hash: tx.hash,
      });

      // Refresh data
      await Promise.all([
        getSaleStats(),
        checkEligibility(wallet.address),
        wallet.refreshBalances(),
      ]);

      return { success: true, hash: tx.hash };
    } else {
      throw new Error(ERROR_MESSAGES.TRANSACTION_FAILED);
    }
  } catch (err: any) {
    // ... error handling
  } finally {
    setIsLoading(false);
  }
}, [wallet, bnbPrice, getSaleStats, checkEligibility]);

// Add timeout helper
const waitForTransaction = async (
  tx: ethers.TransactionResponse,
  timeoutMs = 300000
): Promise<ethers.TransactionReceipt> => {
  return Promise.race([
    tx.wait(),
    new Promise<never>((_, reject) =>
      setTimeout(
        () => reject(new Error('Transaction timeout')),
        timeoutMs
      )
    ),
  ]);
};
```

**Smart Contract Update Required:**
```solidity
// Update PrivateSale.sol to accept deadline and minTokens
function purchaseWithBNB(uint256 minTokensOut, uint256 deadline)
    external
    payable
    nonReentrant
{
    require(block.timestamp <= deadline, "Transaction expired");

    uint256 tokensToReceive = calculateTokens(msg.value);

    require(tokensToReceive >= minTokensOut, "Insufficient output amount");

    // ... rest of purchase logic
}
```

---

### FIX-04: Race Condition Protection

**File:** `/hooks/usePresale.ts`
```typescript
export const usePresale = () => {
  const wallet = useWallet();
  const [transactionLock, setTransactionLock] = useState(false);

  const purchaseWithBNB = useCallback(async (usdAmount: number) => {
    // Check if another transaction is in progress
    if (transactionLock) {
      throw new Error('Another transaction is already in progress. Please wait.');
    }

    // Acquire lock
    setTransactionLock(true);
    setIsLoading(true);
    setTransactionState({ status: TransactionStatus.PENDING });

    try {
      // ... transaction logic ...

      // Atomic state refresh
      await Promise.all([
        getSaleStats(),
        checkEligibility(wallet.address),
        wallet.refreshBalances(),
      ]);

      return { success: true, hash: tx.hash };
    } catch (err: any) {
      // ... error handling ...
      throw err;
    } finally {
      // Always release lock
      setTransactionLock(false);
      setIsLoading(false);
    }
  }, [wallet, transactionLock, getSaleStats, checkEligibility]);

  return {
    // ... other exports
    transactionLock,
  };
};
```

**Update UI:**
```typescript
<button
  onClick={handleBuyTokens}
  disabled={
    !purchaseMode.amount ||
    parseFloat(purchaseMode.amount) <= 0 ||
    transactionLock || // Disable if locked
    validationError
  }
  className="..."
>
  {transactionLock ? 'Transaction in Progress...' : 'Buy Tokens Now'}
</button>
```

---

### FIX-05: Environment Variable Validation

**File:** `/lib/contracts.ts`
```typescript
import { ethers } from 'ethers';

// Strict address validation
const validateAddress = (address: string | undefined, name: string): string => {
  if (!address || address === '') {
    throw new Error(
      `CRITICAL: ${name} address not configured. Check environment variables.`
    );
  }

  if (!ethers.isAddress(address)) {
    throw new Error(
      `CRITICAL: ${name} address is invalid: ${address}`
    );
  }

  if (address === ethers.ZeroAddress) {
    throw new Error(
      `CRITICAL: ${name} cannot be zero address`
    );
  }

  return address;
};

// Validate on module load (fail fast)
export const CONTRACTS = {
  PRESALE: validateAddress(
    process.env.NEXT_PUBLIC_PRESALE_CONTRACT,
    'PRESALE_CONTRACT'
  ),
  HYPEAI_TOKEN: validateAddress(
    process.env.NEXT_PUBLIC_HYPEAI_TOKEN,
    'HYPEAI_TOKEN'
  ),
  USDT_TOKEN: validateAddress(
    process.env.NEXT_PUBLIC_USDT_TOKEN || '0x55d398326f99059fF775485246999027B3197955',
    'USDT_TOKEN'
  ),
};

// Runtime contract verification
export const verifyContractDeployment = async (
  address: string,
  provider: ethers.Provider
): Promise<void> => {
  const code = await provider.getCode(address);

  if (code === '0x') {
    throw new Error(
      `No contract deployed at ${address}. Possible configuration error.`
    );
  }

  console.log(`✓ Contract verified at ${address}`);
};

// Verify all contracts on app start
export const verifyAllContracts = async (
  provider: ethers.Provider
): Promise<void> => {
  await Promise.all([
    verifyContractDeployment(CONTRACTS.PRESALE, provider),
    verifyContractDeployment(CONTRACTS.HYPEAI_TOKEN, provider),
    verifyContractDeployment(CONTRACTS.USDT_TOKEN, provider),
  ]);

  console.log('✓ All contracts verified');
};
```

**Update:** `/app/layout.tsx` or `_app.tsx`
```typescript
import { verifyAllContracts } from '@/lib/contracts';
import { useEffect } from 'react';

export default function RootLayout({ children }) {
  useEffect(() => {
    // Verify contracts on app start
    const verify = async () => {
      try {
        const provider = new ethers.JsonRpcProvider(
          process.env.NEXT_PUBLIC_BSC_RPC_URL ||
            'https://bsc-dataseed1.binance.org'
        );
        await verifyAllContracts(provider);
      } catch (err) {
        console.error('Contract verification failed:', err);
        // Show warning to user
        alert('Configuration error. Please contact support.');
      }
    };

    verify();
  }, []);

  return <>{children}</>;
}
```

---

## TESTING THE FIXES

### Unit Tests

**File:** `/tests/validators.test.ts`
```typescript
import { validatePurchaseAmount, ValidationError } from '@/lib/validators';

describe('validatePurchaseAmount', () => {
  it('should reject negative numbers', () => {
    expect(() => validatePurchaseAmount('-100', 'BNB', 600)).toThrow(
      'Amount cannot be negative'
    );
  });

  it('should reject zero', () => {
    expect(() => validatePurchaseAmount('0', 'BNB', 600)).toThrow(
      'Amount must be greater than zero'
    );
  });

  it('should reject NaN', () => {
    expect(() => validatePurchaseAmount('abc', 'BNB', 600)).toThrow(
      'Invalid amount format'
    );
  });

  it('should reject amounts below minimum', () => {
    expect(() => validatePurchaseAmount('0.05', 'BNB', 600)).toThrow(
      'Minimum purchase is $40'
    );
  });

  it('should reject amounts above maximum', () => {
    expect(() => validatePurchaseAmount('2', 'BNB', 600)).toThrow(
      'Maximum purchase is $800'
    );
  });

  it('should accept valid amounts', () => {
    expect(validatePurchaseAmount('0.1', 'BNB', 600)).toBe(0.1);
    expect(validatePurchaseAmount('100', 'USDT', undefined)).toBe(100);
  });
});
```

### Integration Tests

**File:** `/tests/presale.integration.test.ts`
```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import PresalePage from '@/pages/presale';

describe('Presale Purchase Flow', () => {
  it('should prevent negative amount submission', async () => {
    render(<PresalePage />);

    const input = screen.getByPlaceholderText('0.0');
    fireEvent.change(input, { target: { value: '-100' } });

    await waitFor(() => {
      expect(screen.getByText(/Amount cannot be negative/i)).toBeInTheDocument();
    });

    const buyButton = screen.getByText(/Buy Tokens/i);
    expect(buyButton).toBeDisabled();
  });

  it('should prevent rapid double-purchases', async () => {
    render(<PresalePage />);

    const buyButton = screen.getByText(/Buy Tokens/i);

    fireEvent.click(buyButton);
    fireEvent.click(buyButton); // Try to click again

    await waitFor(() => {
      expect(
        screen.getByText(/Another transaction is already in progress/i)
      ).toBeInTheDocument();
    });
  });
});
```

---

## DEPLOYMENT CHECKLIST

Before deploying fixes to production:

- [ ] All unit tests passing
- [ ] Integration tests passing
- [ ] Manual testing on testnet complete
- [ ] Security audit of fixes complete
- [ ] Environment variables configured correctly
- [ ] Smart contract updated with deadline/slippage support
- [ ] Smart contract re-audited
- [ ] Monitoring and alerts configured
- [ ] Rollback plan prepared
- [ ] Team notified of deployment
- [ ] Documentation updated

---

**IMPORTANT:** These fixes address the most critical vulnerabilities. Continue to HIGH and MEDIUM priority fixes after deployment.
