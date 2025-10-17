# Private Sale API Documentation

## Overview

The Private Sale API implements a fair, community-focused token sale with:
- **20-30% bonus tokens** (not discounts!)
- **$500 maximum per wallet** (anti-whale protection)
- **6-month vesting schedule** (40% immediate, 60% vested)
- **Transparent pricing** at $0.0015 per token

---

## Endpoints

### 1. Purchase Tokens

**POST** `/api/private-sale/purchase`

Purchase tokens with bonus rewards.

**Request Body:**
```json
{
  "walletAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
  "usdAmount": 500,
  "currency": "ETH",
  "referralCode": "FRIEND123"
}
```

**Response:**
```json
{
  "success": true,
  "transactionHash": "0xabc123...",
  "totalTokens": 433333,
  "baseTokens": 333333,
  "bonusTokens": 100000,
  "immediateTokens": 173333,
  "vestedTokens": 260000,
  "vestingSchedule": [
    {
      "month": 1,
      "unlockDate": "2025-11-17T00:00:00Z",
      "amount": 43333,
      "claimed": false
    }
  ]
}
```

**Errors:**
- `400` - Invalid request or exceeds limits
- `409` - Wallet limit exceeded
- `500` - Server error

---

### 2. Get Wallet Limit Info

**GET** `/api/private-sale/wallet/:address/limits`

Check remaining purchase limit for a wallet.

**Response:**
```json
{
  "walletAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
  "totalSpentUSD": 300,
  "remainingLimit": 200,
  "purchaseCount": 2,
  "isAtLimit": false
}
```

---

### 3. Get Vesting Schedule

**GET** `/api/private-sale/wallet/:address/vesting`

Get complete vesting schedule for a wallet.

**Response:**
```json
{
  "walletAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
  "totalVested": 260000,
  "totalClaimed": 0,
  "claimableNow": 43333,
  "schedule": [
    {
      "id": "vesting-1729152000-month-1",
      "month": 1,
      "unlockDate": "2025-11-17T00:00:00Z",
      "amount": 43333,
      "claimed": false
    },
    {
      "month": 2,
      "unlockDate": "2025-12-17T00:00:00Z",
      "amount": 43333,
      "claimed": false
    }
  ]
}
```

---

### 4. Claim Vested Tokens

**POST** `/api/private-sale/claim/vested`

Claim unlocked vested tokens.

**Request Body:**
```json
{
  "walletAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
  "vestingIds": ["vesting-1729152000-month-1"]
}
```

**Response:**
```json
{
  "success": true,
  "transactionHash": "0xdef456...",
  "claimedAmount": 43333,
  "remainingVested": 216667
}
```

---

### 5. Claim Immediate Tokens

**POST** `/api/private-sale/claim/immediate`

Claim the 40% immediate unlock tokens.

**Request Body:**
```json
{
  "walletAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb"
}
```

**Response:**
```json
{
  "success": true,
  "transactionHash": "0xghi789...",
  "claimedAmount": 173333
}
```

---

### 6. Calculate Purchase Preview

**POST** `/api/private-sale/calculate`

Preview token amounts before purchase.

**Request Body:**
```json
{
  "usdAmount": 500
}
```

**Response:**
```json
{
  "usdAmount": 500,
  "baseTokens": 333333,
  "bonusPercent": 30,
  "bonusTokens": 100000,
  "totalTokens": 433333,
  "immediateTokens": 173333,
  "vestedTokens": 260000,
  "effectivePrice": 0.001154
}
```

---

### 7. Get Purchase Statistics

**GET** `/api/private-sale/stats`

Get overall sale statistics.

**Response:**
```json
{
  "totalParticipants": 1247,
  "totalRaised": 487500,
  "averagePurchase": 391.27,
  "walletsAtLimit": 823,
  "progress": 9.75,
  "targetAmount": 5000000
}
```

---

## Bonus Tiers

| Purchase Amount | Bonus Percentage | Example Calculation |
|----------------|------------------|---------------------|
| $500 (max)     | 30%              | 333,333 base + 100,000 bonus = 433,333 total |
| $100+          | 20%              | 66,667 base + 13,333 bonus = 80,000 total |
| Under $100     | 0%               | No bonus |

---

## Vesting Schedule

### Breakdown:
- **40% Immediate**: Unlocked immediately at purchase
- **60% Vested**: Released over 6 months

### Monthly Unlocks:
- Month 1: 10% of total tokens
- Month 2: 10% of total tokens
- Month 3: 10% of total tokens
- Month 4: 10% of total tokens
- Month 5: 10% of total tokens
- Month 6: 10% of total tokens

**Example for $500 purchase (433,333 total tokens):**
- Immediate: 173,333 tokens
- Month 1-6: 43,333 tokens each month

---

## Anti-Whale Protection

### Limits:
1. **$500 maximum per wallet** (enforced at smart contract level)
2. **Suspicious activity detection** (rapid purchases, pattern matching)
3. **Blacklist capability** (admin can block addresses)
4. **Transaction monitoring** (all purchases tracked and auditable)

### Detection Patterns:
- Multiple rapid consecutive purchases
- Attempts to exceed wallet limit
- Coordinated multi-wallet attacks

---

## Error Codes

| Code | Message | Description |
|------|---------|-------------|
| `LIMIT_EXCEEDED` | Exceeds wallet limit | Total purchases would exceed $500 |
| `INVALID_AMOUNT` | Invalid purchase amount | Below minimum or above maximum |
| `SALE_ENDED` | Sale has ended | Purchase period expired |
| `BLACKLISTED` | Address blacklisted | Wallet blocked by admin |
| `NO_CLAIMABLE` | No tokens to claim | Vesting period not reached |
| `ALREADY_CLAIMED` | Tokens already claimed | Duplicate claim attempt |

---

## Rate Limiting

- **General API**: 100 requests/minute per IP
- **Purchase endpoints**: 10 requests/minute per wallet
- **Claim endpoints**: 5 requests/minute per wallet

---

## Webhook Events

Subscribe to real-time events:

### `purchase.completed`
```json
{
  "event": "purchase.completed",
  "walletAddress": "0x742d35Cc...",
  "usdAmount": 500,
  "totalTokens": 433333,
  "timestamp": "2025-10-17T12:00:00Z"
}
```

### `vesting.claimed`
```json
{
  "event": "vesting.claimed",
  "walletAddress": "0x742d35Cc...",
  "amount": 43333,
  "month": 1,
  "timestamp": "2025-11-17T12:00:00Z"
}
```

### `limit.reached`
```json
{
  "event": "limit.reached",
  "walletAddress": "0x742d35Cc...",
  "totalSpent": 500,
  "timestamp": "2025-10-17T12:00:00Z"
}
```

---

## Smart Contract Integration

**Contract Address**: `0x...` (deployed on Ethereum mainnet)

**ABI Methods:**
- `purchaseTokens()` - Purchase with ETH
- `claimImmediateTokens()` - Claim 40% immediate
- `claimVestedTokens()` - Claim monthly vesting
- `getVestingSchedule(address)` - View vesting details
- `getPurchaseInfo(address)` - View purchase info

---

## Security Considerations

1. **Always verify wallet ownership** before purchases
2. **Use HTTPS** for all API calls
3. **Validate transaction signatures** on-chain
4. **Monitor for suspicious patterns** (provided by API)
5. **Keep private keys secure** - never share
6. **Verify contract address** before interacting

---

## Testing

**Testnet**: Sepolia
**Test Token Price**: Same as mainnet ($0.0015)
**Test Limits**: Same as mainnet ($500 max)

**Test Wallets:**
- Faucet: https://sepoliafaucet.com
- Test USDT: `0x...` (Sepolia)

---

## Support

- **Documentation**: https://docs.hypetoken.com
- **Discord**: https://discord.gg/hypetoken
- **Email**: support@hypetoken.com
- **Telegram**: @HYPESupport

---

## Changelog

### v2.0.0 (2025-10-17)
- Changed from discount model to bonus model
- Reduced max purchase from $100k to $500
- Extended vesting from 3 months to 6 months
- Implemented anti-whale protection
- Added suspicious activity detection

### v1.0.0 (2025-10-01)
- Initial release
