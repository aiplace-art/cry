# HypeAI Private Sale - Visual User Journey

## Complete User Flow: From Button Click to Token Ownership

---

## Journey Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    USER JOURNEY TIMELINE                        │
│                                                                 │
│  Discovery → Auth → (KYC) → Dashboard → Purchase → Vesting     │
│     2min      3min    5min      1min      5min      6 months    │
└─────────────────────────────────────────────────────────────────┘
```

---

## Detailed Flow with Screenshots/Wireframes

### Step 1: Discovery (Homepage)

**Page:** `https://hypeai.io`

```
┌────────────────────────────────────────────────────────────────┐
│  [LOGO] HypeAI                    Home  About  Docs  [Connect] │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│              HypeAI - Where AI Meets Opportunity               │
│              AI-Powered Crypto Trading Platform                │
│                                                                │
│                  ┌──────────────────────┐                      │
│                  │ Join Private Sale    │ ← USER CLICKS HERE  │
│                  └──────────────────────┘                      │
│                                                                │
│                      Token Price: $0.015                       │
│                      Bonus: +20%                               │
│                      Time Left: 43 days                        │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

**What Happens:**
- User clicks "Join Private Sale" button
- System checks: Is user authenticated?
  - NO → Show wallet connection modal
  - YES → Redirect to dashboard

---

### Step 2: Wallet Connection

**Modal appears on screen**

```
┌────────────────────────────────────────────────────────────────┐
│                    Connect Your Wallet                         │
│                                                                │
│  ┌──────────────────────┐  ┌──────────────────────┐          │
│  │   [🦊 MetaMask]      │  │  [🌈 WalletConnect]  │          │
│  └──────────────────────┘  └──────────────────────┘          │
│                                                                │
│  ┌──────────────────────┐  ┌──────────────────────┐          │
│  │ [📧 Email/Web3Auth]  │  │  [🔵 Coinbase Wallet]│          │
│  └──────────────────────┘  └──────────────────────┘          │
│                                                                │
│  By connecting, you agree to our Terms & Privacy Policy       │
│                                                                │
│                     [Cancel]                                   │
└────────────────────────────────────────────────────────────────┘
```

**User selects MetaMask:**

```
┌────────────────────────────────────────────────────────────────┐
│                     MetaMask Prompt                            │
│                                                                │
│  Sign this message to prove you own this wallet:               │
│                                                                │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │ Welcome to HypeAI!                                       │ │
│  │                                                          │ │
│  │ Please sign this message to authenticate.               │ │
│  │                                                          │ │
│  │ Nonce: 8a7f9c2e                                         │ │
│  │ Timestamp: 2025-10-18T12:00:00Z                         │ │
│  │                                                          │ │
│  │ This will not trigger a blockchain transaction.         │ │
│  └──────────────────────────────────────────────────────────┘ │
│                                                                │
│              [Cancel]           [Sign]                         │
└────────────────────────────────────────────────────────────────┘
```

**User signs → Authentication complete**

```
┌────────────────────────────────────────────────────────────────┐
│                  ✓ Wallet Connected!                           │
│                                                                │
│             Redirecting to dashboard...                        │
│                                                                │
│                      [🔄 Loading...]                           │
└────────────────────────────────────────────────────────────────┘
```

---

### Step 3: KYC Check (if needed)

**If user wants to purchase ≥ $10,000:**

```
┌────────────────────────────────────────────────────────────────┐
│                   KYC Verification Required                    │
│                                                                │
│  To purchase $10,000 or more, please complete KYC verification│
│                                                                │
│  ┌────────────────────────────────────────────────────────┐   │
│  │ Why KYC?                                               │   │
│  │ • Regulatory compliance                                │   │
│  │ • Protect against fraud                                │   │
│  │ • Secure the platform                                  │   │
│  └────────────────────────────────────────────────────────┘   │
│                                                                │
│  Process takes 5-10 minutes                                    │
│  Auto-approval in most cases                                   │
│                                                                │
│              [Start KYC]    [Buy Less Than $10k]               │
└────────────────────────────────────────────────────────────────┘
```

**KYC Flow (Sumsub):**

```
Step 1: Personal Info
┌────────────────────────────────────────────────────────────────┐
│  Full Name:    [________________]                              │
│  Date of Birth: [__/__/____]                                   │
│  Country:      [United States ▼]                               │
│  Email:        [________________]                              │
│  Phone:        [________________]                              │
│                                                                │
│                          [Next]                                │
└────────────────────────────────────────────────────────────────┘

Step 2: Document Upload
┌────────────────────────────────────────────────────────────────┐
│  Upload Government ID (Passport or Driver's License)           │
│                                                                │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │                                                          │ │
│  │              [📄 Click to Upload]                        │ │
│  │                                                          │ │
│  │         or drag and drop file here                       │ │
│  │                                                          │ │
│  └──────────────────────────────────────────────────────────┘ │
│                                                                │
│                   [Back]        [Next]                         │
└────────────────────────────────────────────────────────────────┘

Step 3: Selfie Verification
┌────────────────────────────────────────────────────────────────┐
│  Take a selfie to verify your identity                         │
│                                                                │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │                                                          │ │
│  │                    📷                                    │ │
│  │                                                          │ │
│  │              [Start Camera]                              │ │
│  │                                                          │ │
│  └──────────────────────────────────────────────────────────┘ │
│                                                                │
│  Tips: Good lighting, face camera, remove glasses             │
│                                                                │
│                   [Back]        [Capture]                      │
└────────────────────────────────────────────────────────────────┘

Step 4: Verification
┌────────────────────────────────────────────────────────────────┐
│              ✓ Documents Submitted!                            │
│                                                                │
│  Your verification is being processed...                       │
│                                                                │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │                                                          │ │
│  │                    [🔄 ••••]                             │ │
│  │                                                          │ │
│  │          Estimated time: 2-5 minutes                     │ │
│  │                                                          │ │
│  └──────────────────────────────────────────────────────────┘ │
│                                                                │
│  We'll notify you via email when approved.                     │
│                                                                │
│               [Go to Dashboard]                                │
└────────────────────────────────────────────────────────────────┘
```

---

### Step 4: Dashboard - Overview

**Page:** `/dashboard`

```
┌────────────────────────────────────────────────────────────────┐
│ [LOGO]  HypeAI Dashboard                   0x742d...f44e  [⚙] │
├────────┬───────────────────────────────────────────────────────┤
│        │                                                       │
│ Home   │  Welcome back! 👋                                     │
│ Buy    │                                                       │
│ Invest │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐│
│ Vest   │  │ Invested │ │  Tokens  │ │ Vesting  │ │Referrals ││
│ Refer  │  │ $10,000  │ │ 933,333  │ │   0%     │ │    3     ││
│ Account│  └──────────┘ └──────────┘ └──────────┘ └──────────┘│
│ Support│                                                       │
│        │  Portfolio Value: $15,000 (+$5,000 / +50%)           │
│        │  ┌────────────────────────────────────────────────┐  │
│        │  │         [Portfolio Chart]                      │  │
│        │  │  $15k─┐                                        │  │
│        │  │       │  ╱                                     │  │
│        │  │  $10k─┼─╯                                      │  │
│        │  │       │                                        │  │
│        │  │   $5k─┘                                        │  │
│        │  │      Oct 1    Oct 10    Oct 18                 │  │
│        │  └────────────────────────────────────────────────┘  │
│        │                                                       │
│        │  Vesting Schedule                                     │
│        │  ┌────────────────────────────────────────────────┐  │
│        │  │ Next Unlock: Dec 1, 2025 (44 days)            │  │
│        │  │ Amount: 140,000 HYPE (TGE - 15%)               │  │
│        │  │ [Set Reminder]                                 │  │
│        │  └────────────────────────────────────────────────┘  │
│        │                                                       │
│        │  Recent Activity                                      │
│        │  • Purchased 933,333 HYPE - $10,000 (2 hours ago)    │
│        │  • Wallet connected (2 hours ago)                     │
│        │                                                       │
│        │  Referral Quick Link                                  │
│        │  ┌────────────────────────────────────────────────┐  │
│        │  │ hypeai.io/ref/HYPE-A7B2C9  [📋 Copy]          │  │
│        │  └────────────────────────────────────────────────┘  │
│        │  3 referrals | 2 active | 56,000 HYPE earned         │
│        │                                                       │
└────────┴───────────────────────────────────────────────────────┘
```

---

### Step 5: Buy Tokens Page

**Page:** `/dashboard/buy`

**User clicks "Buy" in sidebar:**

```
┌────────────────────────────────────────────────────────────────┐
│ [LOGO]  Buy HYPE Tokens                    0x742d...f44e  [⚙] │
├────────┬───────────────────────────────────────────────────────┤
│        │                                                       │
│ Home   │  Private Sale - Round 1                               │
│ Buy ★  │  Price: $0.015 | Bonus: +20% | 43 days left          │
│ Invest │                                                       │
│ Vest   │  ┌────────────────────────────────────────────────┐  │
│ Refer  │  │ Calculate Your Purchase                        │  │
│ Account│  │                                                │  │
│ Support│  │ I want to invest:                              │  │
│        │  │ ┌──────────────┐                               │  │
│        │  │ │ $ 10,000     │ USD                           │  │
│        │  │ └──────────────┘                               │  │
│        │  │                                                │  │
│        │  │ You will receive:                              │  │
│        │  │ • Base tokens:     666,666.67 HYPE            │  │
│        │  │ • Round bonus (20%): 133,333.33 HYPE          │  │
│        │  │ • Tier bonus (20%):  133,333.33 HYPE          │  │
│        │  │ ─────────────────────────────────             │  │
│        │  │ • Total:           933,333.33 HYPE 🎉        │  │
│        │  │                                                │  │
│        │  │ Vesting: 15% at TGE, then 6 months            │  │
│        │  └────────────────────────────────────────────────┘  │
│        │                                                       │
│        │  Select Payment Method                                │
│        │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐   │
│        │  │   ETH   │ │  USDT   │ │   BNB   │ │  Card   │   │
│        │  │    ○    │ │    ●    │ │    ○    │ │    ○    │   │
│        │  └─────────┘ └─────────┘ └─────────┘ └─────────┘   │
│        │                                                       │
│        │  ⚠ KYC Required for purchases ≥ $10,000              │
│        │  Your KYC: ✓ Approved                                │
│        │                                                       │
│        │         [Continue to Payment]                         │
│        │                                                       │
└────────┴───────────────────────────────────────────────────────┘
```

**User clicks "Continue to Payment":**

**Crypto Payment (USDT selected):**

```
┌────────────────────────────────────────────────────────────────┐
│ Complete Your Purchase                                         │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  Send exactly 10,000 USDT to this address:                     │
│                                                                │
│  ┌────────────────────────────────────────────────────────┐   │
│  │                                                        │   │
│  │                    [QR CODE]                           │   │
│  │                                                        │   │
│  └────────────────────────────────────────────────────────┘   │
│                                                                │
│  0x9f8A7B2C3D4E5F6A7B8C9D0E1F2A3B4C5D6E7F8A  [📋 Copy]       │
│                                                                │
│  ⚠ Important:                                                  │
│  • Send USDT (ERC-20) only                                     │
│  • Do NOT send from an exchange                                │
│  • Your tokens will be allocated after 12 confirmations        │
│                                                                │
│  Status: ⏳ Waiting for payment...                             │
│                                                                │
│  This address expires in: 58:42                                │
│                                                                │
│               [I've Sent the Payment]                          │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

**After sending (monitoring):**

```
┌────────────────────────────────────────────────────────────────┐
│ Transaction Detected! 🎉                                       │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  We've detected your transaction:                              │
│                                                                │
│  TX: 0x8f3c7b9a2e5d8f1c4b6a9e2d5f8c1a4b7e3d9f2c5a8e1b4d7... │
│                                                                │
│  ┌────────────────────────────────────────────────────────┐   │
│  │ Confirmations: 3 / 12                                  │   │
│  │ ████████░░░░░░░░░░░░                                   │   │
│  │                                                        │   │
│  │ Estimated time: ~8 minutes                             │   │
│  └────────────────────────────────────────────────────────┘   │
│                                                                │
│  Your tokens will be allocated automatically once confirmed.   │
│                                                                │
│  You can close this page. We'll email you when ready.         │
│                                                                │
│               [View on Etherscan]  [Go to Dashboard]           │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

**Card Payment (Stripe):**

```
┌────────────────────────────────────────────────────────────────┐
│ Stripe Checkout                                                │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  Purchase 933,333 HYPE Tokens                                  │
│  Amount: $10,000.00 USD                                        │
│                                                                │
│  Card Information                                              │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │ 1234 5678 9012 3456                                      │ │
│  └──────────────────────────────────────────────────────────┘ │
│                                                                │
│  ┌─────────────────┐  ┌──────┐  ┌──────┐                     │
│  │ MM / YY         │  │ CVC  │  │ ZIP  │                     │
│  └─────────────────┘  └──────┘  └──────┘                     │
│                                                                │
│  🔒 Powered by Stripe - Your payment is secure                │
│                                                                │
│              [Pay $10,000.00]                                  │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

---

### Step 6: Purchase Confirmation

**After successful payment:**

```
┌────────────────────────────────────────────────────────────────┐
│                  ✓ Purchase Successful! 🎉                     │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  Congratulations! You've successfully purchased HYPE tokens.   │
│                                                                │
│  ┌────────────────────────────────────────────────────────┐   │
│  │ Transaction Details                                    │   │
│  │                                                        │   │
│  │ Amount Invested:    $10,000.00                        │   │
│  │ Tokens Purchased:   933,333.33 HYPE                   │   │
│  │ Bonus Received:     266,666.67 HYPE                   │   │
│  │                                                        │   │
│  │ Transaction Hash:                                      │   │
│  │ 0x8f3c7b9a2e5d8f1c...  [View]                         │   │
│  │                                                        │   │
│  │ Vesting Start:      Dec 1, 2025                       │   │
│  │ TGE Unlock (15%):   140,000 HYPE                      │   │
│  │ Monthly Unlock:     132,222 HYPE (6 months)           │   │
│  └────────────────────────────────────────────────────────┘   │
│                                                                │
│  What's Next?                                                  │
│  • Your tokens are in vesting                                  │
│  • First unlock on Dec 1, 2025                                │
│  • Refer friends to earn more tokens!                          │
│                                                                │
│  ┌────────────────────────────────────────────────────────┐   │
│  │ Share & Earn                                           │   │
│  │                                                        │   │
│  │ Your Referral Link:                                    │   │
│  │ hypeai.io/ref/HYPE-A7B2C9  [📋 Copy]                  │   │
│  │                                                        │   │
│  │ Earn 5% commission on every referral!                 │   │
│  │                                                        │   │
│  │ [Share on Twitter]  [Share on Telegram]               │   │
│  └────────────────────────────────────────────────────────┘   │
│                                                                │
│         [View Vesting Schedule]  [Go to Dashboard]             │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

---

### Step 7: Vesting Schedule Page

**Page:** `/dashboard/vesting`

```
┌────────────────────────────────────────────────────────────────┐
│ [LOGO]  Vesting Schedule                   0x742d...f44e  [⚙] │
├────────┬───────────────────────────────────────────────────────┤
│        │                                                       │
│ Home   │  Your Vesting Overview                                │
│ Buy    │                                                       │
│ Invest │  ┌────────────────────────────────────────────────┐  │
│ Vest ★ │  │ Total Tokens:    933,333 HYPE                  │  │
│ Refer  │  │ Claimed:         0 HYPE (0%)                   │  │
│ Account│  │ Remaining:       933,333 HYPE (100%)           │  │
│ Support│  │                                                │  │
│        │  │ [░░░░░░░░░░░░░░░░░░░░░░░░░░░░] 0%             │  │
│        │  └────────────────────────────────────────────────┘  │
│        │                                                       │
│        │  Next Unlock                                          │
│        │  ┌────────────────────────────────────────────────┐  │
│        │  │ 🗓 December 1, 2025 (44 days)                  │  │
│        │  │                                                │  │
│        │  │ Amount: 140,000 HYPE (15% TGE)                │  │
│        │  │                                                │  │
│        │  │ [Set Email Reminder]                           │  │
│        │  └────────────────────────────────────────────────┘  │
│        │                                                       │
│        │  Vesting Timeline                                     │
│        │  ┌────────────────────────────────────────────────┐  │
│        │  │                                                │  │
│        │  │ Dec 1  Jan 1  Feb 1  Mar 1  Apr 1  May 1  Jun 1│  │
│        │  │   ●─────●─────●─────●─────●─────●─────●       │  │
│        │  │  TGE                                     Done  │  │
│        │  │                                                │  │
│        │  └────────────────────────────────────────────────┘  │
│        │                                                       │
│        │  Detailed Schedule                                    │
│        │  ┌────────────────────────────────────────────────┐  │
│        │  │ Date       │ Amount     │ Type    │ Status    │  │
│        │  ├────────────┼────────────┼─────────┼───────────┤  │
│        │  │ Dec 1,2025 │ 140,000    │ TGE     │ Pending   │  │
│        │  │ Jan 1,2026 │ 132,222    │ Monthly │ Locked    │  │
│        │  │ Feb 1,2026 │ 132,222    │ Monthly │ Locked    │  │
│        │  │ Mar 1,2026 │ 132,222    │ Monthly │ Locked    │  │
│        │  │ Apr 1,2026 │ 132,222    │ Monthly │ Locked    │  │
│        │  │ May 1,2026 │ 132,222    │ Monthly │ Locked    │  │
│        │  │ Jun 1,2026 │ 132,223    │ Monthly │ Locked    │  │
│        │  └────────────────────────────────────────────────┘  │
│        │                                                       │
└────────┴───────────────────────────────────────────────────────┘
```

**On Dec 1, 2025 (TGE Day):**

```
┌────────────────────────────────────────────────────────────────┐
│ Vesting Schedule                                               │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  ✨ Tokens Available to Claim!                                 │
│                                                                │
│  ┌────────────────────────────────────────────────────────┐   │
│  │ Claimable Now: 140,000 HYPE                            │   │
│  │                                                        │   │
│  │ This is your TGE (Token Generation Event) unlock.     │   │
│  │                                                        │   │
│  │ Gas fee estimate: ~$5 (Fast)                          │   │
│  │                                                        │   │
│  │          [Claim 140,000 HYPE]                          │   │
│  └────────────────────────────────────────────────────────┘   │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

**User clicks "Claim":**

```
┌────────────────────────────────────────────────────────────────┐
│                  MetaMask Confirmation                         │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  Confirm Transaction                                           │
│                                                                │
│  Function: claim()                                             │
│  Contract: 0x...Vesting                                        │
│                                                                │
│  You will receive: 140,000 HYPE                                │
│                                                                │
│  Gas fee: 0.002 ETH (~$4.50)                                   │
│                                                                │
│              [Reject]    [Confirm]                             │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

**After claiming:**

```
┌────────────────────────────────────────────────────────────────┐
│                  ✓ Tokens Claimed! 🎉                          │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  Successfully claimed 140,000 HYPE tokens!                     │
│                                                                │
│  Transaction: 0xabc123...  [View on Etherscan]                │
│                                                                │
│  Your wallet balance: 140,000 HYPE                             │
│                                                                │
│  Next unlock: January 1, 2026 (132,222 HYPE)                  │
│                                                                │
│              [View Portfolio]  [Dashboard]                     │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

---

### Step 8: Referral System

**Page:** `/dashboard/referrals`

```
┌────────────────────────────────────────────────────────────────┐
│ [LOGO]  Referral Program                   0x742d...f44e  [⚙] │
├────────┬───────────────────────────────────────────────────────┤
│        │                                                       │
│ Home   │  Your Referral Link                                   │
│ Buy    │  ┌────────────────────────────────────────────────┐  │
│ Invest │  │                                                │  │
│ Vest   │  │  https://hypeai.io/ref/HYPE-A7B2C9             │  │
│ Refer ★│  │                                                │  │
│ Account│  │  [📋 Copy Link]  [🔗 QR Code]                 │  │
│ Support│  │                                                │  │
│        │  │  Share: [Twitter] [Telegram] [WhatsApp] [Email]│  │
│        │  └────────────────────────────────────────────────┘  │
│        │                                                       │
│        │  Your Stats                                           │
│        │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐   │
│        │  │ Clicks  │ │Referrals│ │  Active │ │ Earned  │   │
│        │  │   47    │ │    3    │ │    2    │ │ 56,000  │   │
│        │  └─────────┘ └─────────┘ └─────────┘ └─────────┘   │
│        │                                                       │
│        │  Conversion Rate: 4.26% | Total Volume: $15,000      │
│        │                                                       │
│        │  Your Tier: 🥉 Bronze                                │
│        │  ┌────────────────────────────────────────────────┐  │
│        │  │ Commission Rate: 5%                            │  │
│        │  │                                                │  │
│        │  │ Progress to Silver (7%):                       │  │
│        │  │ [██████░░░░░░░░░] 3/10 referrals              │  │
│        │  │                                                │  │
│        │  │ 7 more referrals to unlock Silver tier!       │  │
│        │  └────────────────────────────────────────────────┘  │
│        │                                                       │
│        │  Your Referrals                                       │
│        │  ┌────────────────────────────────────────────────┐  │
│        │  │ User      │ Joined  │ Invested │ Your Reward │  │
│        │  ├───────────┼─────────┼──────────┼─────────────┤  │
│        │  │ 0x1234... │ Oct 10  │ $5,000   │ 16,667 HYPE │  │
│        │  │ 0xabcd... │ Oct 15  │ $10,000  │ 39,333 HYPE │  │
│        │  │ 0x9876... │ Oct 17  │ -        │ -           │  │
│        │  └────────────────────────────────────────────────┘  │
│        │                                                       │
│        │  Unclaimed Rewards                                    │
│        │  ┌────────────────────────────────────────────────┐  │
│        │  │ 28,000 HYPE ready to claim                     │  │
│        │  │                                                │  │
│        │  │ [Claim Rewards]                                │  │
│        │  └────────────────────────────────────────────────┘  │
│        │                                                       │
└────────┴───────────────────────────────────────────────────────┘
```

---

## User Journey Summary

### Timeline

1. **Discovery (2 min):** User sees "Join Private Sale" on homepage
2. **Authentication (3 min):** Connect wallet + sign message
3. **KYC (5 min):** If purchasing ≥ $10k, complete verification
4. **Dashboard (1 min):** Land on overview, see stats
5. **Purchase (5 min):** Calculate amount, select payment, complete
6. **Confirmation (instant):** See success, tokens allocated to vesting
7. **Vesting (6 months):** Monthly unlocks, claim when ready
8. **Referrals (ongoing):** Share link, earn commissions

### Key Touchpoints

- **Homepage → CTA:** Clear "Join Private Sale" button
- **Wallet Connection:** Seamless MetaMask/WalletConnect
- **KYC Gate:** Only for large purchases (≥$10k)
- **Dashboard:** Central hub for all actions
- **Purchase Flow:** Simple calculator + multiple payment options
- **Vesting Visualization:** Clear timeline and claim interface
- **Referral Integration:** Everywhere in dashboard, easy to share

### Success Metrics

- **Wallet Connection:** < 30 seconds
- **Purchase Completion:** < 5 minutes
- **KYC Approval:** < 10 minutes (auto-approval)
- **First Claim:** December 1, 2025 (TGE)
- **Referral Sharing:** Within 5 minutes of first purchase

---

## Next Steps for Implementation

1. Create high-fidelity designs based on these wireframes
2. Implement responsive versions (mobile/tablet)
3. Build component library
4. Develop backend APIs
5. Integrate smart contracts
6. User testing
7. Launch!

---

**Questions or need clarification?** Refer to the main architecture document: `/docs/architecture/private-sale-system-architecture.md`
