# Presale Testing Checklist

## Overview

This document provides a comprehensive testing checklist for the ElonBTC presale page. Follow this guide to ensure all functionality works correctly before production deployment.

## Pre-Testing Setup

### Environment Setup

- [ ] Node.js 18.x or higher installed
- [ ] Dependencies installed (`npm install`)
- [ ] Environment variables configured (`.env.local`)
- [ ] Development server running (`npm run dev`)

### Wallet Setup

- [ ] MetaMask extension installed
- [ ] Test account created with test BNB
- [ ] BSC Mainnet added to MetaMask
- [ ] BSC Testnet added (for testing)
- [ ] USDT tokens available for testing

### Contract Verification

- [ ] Presale contract deployed on BSC
- [ ] Contract address verified on BSCScan
- [ ] Contract ABI matches deployed version
- [ ] Contract functions callable via BSCScan

---

## 1. Wallet Connection Testing

### MetaMask Connection

**Test Case 1.1: Initial Connection**
- [ ] Click "Connect Wallet" button
- [ ] MetaMask popup appears
- [ ] Can select account
- [ ] Connection successful
- [ ] Wallet address displayed (truncated)
- [ ] Network badge shows "BSC Mainnet"

**Test Case 1.2: Wrong Network**
- [ ] Connect with Ethereum network selected
- [ ] Warning message displayed
- [ ] "Switch to BSC" button appears
- [ ] Click switch button
- [ ] MetaMask prompts network switch
- [ ] Successfully switches to BSC

**Test Case 1.3: Account Switching**
- [ ] Switch accounts in MetaMask
- [ ] Page detects account change
- [ ] New address displayed
- [ ] Balances update automatically
- [ ] No errors in console

**Test Case 1.4: Disconnection**
- [ ] Disconnect wallet in MetaMask
- [ ] Page detects disconnection
- [ ] UI resets to disconnected state
- [ ] "Connect Wallet" button reappears

**Test Case 1.5: Rejected Connection**
- [ ] Click "Connect Wallet"
- [ ] Reject in MetaMask
- [ ] Error message displayed
- [ ] Can retry connection
- [ ] No app crash

---

## 2. BNB Purchase Flow Testing

### Input Validation

**Test Case 2.1: Valid Amount**
- [ ] Enter valid BNB amount (e.g., 0.1)
- [ ] Token amount calculated correctly
- [ ] USD value displayed
- [ ] No validation errors
- [ ] "Buy with BNB" button enabled

**Test Case 2.2: Minimum Amount**
- [ ] Enter amount below minimum ($10 equivalent)
- [ ] Error message: "Minimum purchase is $10"
- [ ] Button disabled
- [ ] Cannot proceed

**Test Case 2.3: Maximum Amount**
- [ ] Enter amount above maximum ($100,000 equivalent)
- [ ] Error message: "Maximum purchase is $100,000"
- [ ] Button disabled
- [ ] Cannot proceed

**Test Case 2.4: Invalid Input**
- [ ] Enter negative number
- [ ] Error message displayed
- [ ] Enter zero
- [ ] Error message displayed
- [ ] Enter non-numeric characters
- [ ] Input sanitized/rejected

**Test Case 2.5: Insufficient Balance**
- [ ] Enter amount greater than wallet balance
- [ ] Error message: "Insufficient BNB balance"
- [ ] Button disabled
- [ ] Balance displayed correctly

### Purchase Transaction

**Test Case 2.6: Successful Purchase**
- [ ] Enter valid amount
- [ ] Click "Buy with BNB"
- [ ] MetaMask popup appears
- [ ] Transaction details correct
- [ ] Gas estimate reasonable
- [ ] Confirm transaction
- [ ] Loading state displayed
- [ ] Transaction submitted
- [ ] Success message appears
- [ ] Transaction hash displayed
- [ ] Link to BSCScan works
- [ ] Balances update after confirmation

**Test Case 2.7: Rejected Transaction**
- [ ] Enter valid amount
- [ ] Click "Buy with BNB"
- [ ] Reject in MetaMask
- [ ] Error message: "Transaction rejected"
- [ ] Form resets properly
- [ ] Can retry purchase

**Test Case 2.8: Failed Transaction**
- [ ] Attempt transaction that will fail (e.g., during pause)
- [ ] Transaction submitted
- [ ] Failure detected
- [ ] Error message displayed
- [ ] Reason shown if available
- [ ] Can retry

**Test Case 2.9: Pending Transaction**
- [ ] Submit transaction
- [ ] Before confirmation, check UI
- [ ] "Transaction pending" message shown
- [ ] Transaction hash clickable
- [ ] Cannot submit duplicate transaction
- [ ] UI updates when confirmed

---

## 3. USDT Purchase Flow Testing

### USDT Approval

**Test Case 3.1: First-Time Approval**
- [ ] Select USDT payment option
- [ ] Enter valid amount
- [ ] No existing USDT approval
- [ ] "Approve USDT" button shown
- [ ] Click approve button
- [ ] MetaMask popup for approval
- [ ] Approve transaction
- [ ] Approval confirmed
- [ ] Button changes to "Buy with USDT"

**Test Case 3.2: Approval with Sufficient Allowance**
- [ ] Previous approval exists
- [ ] Enter amount within allowance
- [ ] "Buy with USDT" button shown directly
- [ ] No approval step needed

**Test Case 3.3: Approval Insufficient**
- [ ] Previous approval exists but insufficient
- [ ] Enter amount exceeding allowance
- [ ] "Approve More USDT" button shown
- [ ] Can increase approval

**Test Case 3.4: Rejected Approval**
- [ ] Click approve
- [ ] Reject in MetaMask
- [ ] Error message displayed
- [ ] Can retry approval

### USDT Purchase

**Test Case 3.5: Successful USDT Purchase**
- [ ] USDT approved
- [ ] Enter valid amount
- [ ] Click "Buy with USDT"
- [ ] MetaMask popup appears
- [ ] Confirm transaction
- [ ] Transaction submitted
- [ ] Success message
- [ ] Balances update

**Test Case 3.6: Insufficient USDT Balance**
- [ ] Enter amount exceeding USDT balance
- [ ] Error: "Insufficient USDT balance"
- [ ] Button disabled

---

## 4. UI/UX Testing

### Loading States

**Test Case 4.1: Initial Load**
- [ ] Page loads quickly (<3s)
- [ ] No layout shift
- [ ] Skeleton loaders shown
- [ ] Data populates smoothly
- [ ] No flash of unstyled content

**Test Case 4.2: Transaction Loading**
- [ ] Transaction submitted
- [ ] Loading spinner displayed
- [ ] Form inputs disabled
- [ ] Cancel button available
- [ ] Clear loading message

**Test Case 4.3: Data Refresh**
- [ ] Progress bar updates
- [ ] Token sold counter updates
- [ ] Countdown timer updates
- [ ] Price updates (if dynamic)

### Error Handling

**Test Case 4.4: Network Errors**
- [ ] Disconnect internet
- [ ] Appropriate error message
- [ ] Retry functionality available
- [ ] Graceful degradation

**Test Case 4.5: Contract Errors**
- [ ] Contract call fails
- [ ] User-friendly error message
- [ ] Technical details available
- [ ] Contact support option

**Test Case 4.6: Validation Errors**
- [ ] Clear error messages
- [ ] Errors next to relevant fields
- [ ] Red/warning styling
- [ ] Errors clear when fixed

### Animations and Transitions

**Test Case 4.7: Smooth Animations**
- [ ] Modal transitions smooth
- [ ] Button hover effects work
- [ ] Progress bar animates
- [ ] Countdown timer smooth
- [ ] No janky animations

---

## 5. Responsive Design Testing

### Mobile (320px - 768px)

**Test Case 5.1: iPhone SE (375x667)**
- [ ] Page renders correctly
- [ ] No horizontal scroll
- [ ] Buttons clickable
- [ ] Forms usable
- [ ] Text readable
- [ ] MetaMask mobile works

**Test Case 5.2: iPhone 14 Pro (393x852)**
- [ ] Layout optimized
- [ ] Safe area respected
- [ ] Navigation accessible

**Test Case 5.3: Samsung Galaxy S21 (360x800)**
- [ ] Android testing
- [ ] Trust Wallet compatible
- [ ] No layout issues

### Tablet (768px - 1024px)

**Test Case 5.4: iPad Air (820x1180)**
- [ ] Two-column layout works
- [ ] Touch targets adequate
- [ ] Landscape orientation good

### Desktop (1024px+)

**Test Case 5.5: 1920x1080**
- [ ] Full layout displayed
- [ ] Content centered
- [ ] Not too wide
- [ ] Hover states work

**Test Case 5.6: 4K (3840x2160)**
- [ ] Scales properly
- [ ] Images high quality
- [ ] No pixelation

---

## 6. Browser Compatibility

### Chrome/Brave

**Test Case 6.1: Chrome Latest**
- [ ] Full functionality works
- [ ] MetaMask integration perfect
- [ ] No console errors
- [ ] Performance good

### Firefox

**Test Case 6.2: Firefox Latest**
- [ ] All features work
- [ ] MetaMask compatible
- [ ] Styling consistent

### Safari

**Test Case 6.3: Safari Desktop**
- [ ] Renders correctly
- [ ] Wallet connect works
- [ ] No webkit issues

**Test Case 6.4: Safari iOS**
- [ ] Mobile Safari works
- [ ] MetaMask mobile compatible
- [ ] No iOS-specific bugs

### Edge

**Test Case 6.5: Edge Latest**
- [ ] Chromium Edge works
- [ ] No compatibility issues

---

## 7. Performance Testing

### Load Time

**Test Case 7.1: First Load**
- [ ] Page loads in <3 seconds
- [ ] Largest Contentful Paint <2.5s
- [ ] First Input Delay <100ms
- [ ] Cumulative Layout Shift <0.1

**Test Case 7.2: Subsequent Loads**
- [ ] Cached resources used
- [ ] Near-instant load

### Bundle Size

**Test Case 7.3: JavaScript Bundle**
- [ ] Main bundle <200KB gzipped
- [ ] Code splitting implemented
- [ ] Lazy loading works

**Test Case 7.4: Images**
- [ ] Images optimized
- [ ] WebP format used
- [ ] Proper sizes served
- [ ] Lazy loading below fold

### Network Performance

**Test Case 7.5: Slow 3G**
- [ ] Page usable on slow connection
- [ ] Progressive enhancement
- [ ] Loading states clear

---

## 8. Accessibility Testing

### Keyboard Navigation

**Test Case 8.1: Tab Navigation**
- [ ] Can tab through all controls
- [ ] Focus visible
- [ ] Logical tab order
- [ ] No keyboard traps

**Test Case 8.2: Enter/Space**
- [ ] Buttons activate with Enter
- [ ] Space works on buttons
- [ ] Form submission works

### Screen Reader

**Test Case 8.3: NVDA/JAWS**
- [ ] All text readable
- [ ] Buttons labeled
- [ ] Form labels present
- [ ] ARIA labels correct

**Test Case 8.4: VoiceOver (iOS)**
- [ ] Mobile screen reader works
- [ ] Gestures functional

### Color Contrast

**Test Case 8.5: WCAG AA**
- [ ] Text contrast ratio ≥4.5:1
- [ ] Large text ≥3:1
- [ ] Interactive elements clear

---

## 9. Security Testing

### Input Sanitization

**Test Case 9.1: XSS Prevention**
- [ ] Cannot inject scripts
- [ ] HTML escaped properly
- [ ] No dangerous innerHTML

**Test Case 9.2: SQL Injection** (if backend)
- [ ] Inputs sanitized
- [ ] Parameterized queries used

### Smart Contract Security

**Test Case 9.3: Reentrancy Protection**
- [ ] Contract has reentrancy guards
- [ ] Multiple transactions handled safely

**Test Case 9.4: Overflow Protection**
- [ ] SafeMath used (or Solidity 0.8+)
- [ ] No integer overflow possible

---

## 10. Integration Testing

### End-to-End Flows

**Test Case 10.1: Complete BNB Purchase**
1. [ ] Open page
2. [ ] Connect wallet
3. [ ] Switch to BSC
4. [ ] Enter BNB amount
5. [ ] Submit transaction
6. [ ] Confirm in MetaMask
7. [ ] Wait for confirmation
8. [ ] Verify token balance updated
9. [ ] Check BSCScan transaction

**Test Case 10.2: Complete USDT Purchase**
1. [ ] Connect wallet
2. [ ] Select USDT option
3. [ ] Approve USDT
4. [ ] Wait for approval
5. [ ] Enter amount
6. [ ] Buy with USDT
7. [ ] Confirm transaction
8. [ ] Verify success

**Test Case 10.3: Multiple Purchases**
- [ ] Buy with BNB
- [ ] Buy with USDT
- [ ] Both update totals correctly
- [ ] Transaction history accurate

---

## 11. Analytics Testing

### Google Analytics

**Test Case 11.1: Page Views**
- [ ] Page view tracked
- [ ] Event fires on load

**Test Case 11.2: Wallet Connection Event**
- [ ] "wallet_connected" event fires
- [ ] User ID set

**Test Case 11.3: Purchase Events**
- [ ] "purchase_initiated" event
- [ ] "purchase_completed" event
- [ ] Purchase value tracked

---

## 12. Monitoring and Logging

### Error Tracking

**Test Case 12.1: Sentry Integration**
- [ ] Errors sent to Sentry
- [ ] Source maps working
- [ ] User context included

**Test Case 12.2: Console Logging**
- [ ] No errors in production
- [ ] Debug logs only in dev
- [ ] Warnings addressed

---

## Final Checklist

### Pre-Production

- [ ] All test cases passed
- [ ] No critical bugs
- [ ] Performance optimized
- [ ] Security reviewed
- [ ] Accessibility validated
- [ ] Browser testing complete
- [ ] Mobile testing complete
- [ ] Contract addresses verified
- [ ] Environment variables set
- [ ] Analytics configured
- [ ] Monitoring enabled
- [ ] Backup plan ready

### Production Deployment

- [ ] Build completes successfully
- [ ] Environment variables in Vercel
- [ ] Custom domain configured
- [ ] SSL certificate active
- [ ] DNS propagated
- [ ] Production smoke test passed
- [ ] Rollback plan ready
- [ ] Team notified
- [ ] Documentation updated
- [ ] Support team briefed

---

## Reporting Issues

When reporting bugs, include:
1. Environment (browser, OS, device)
2. Steps to reproduce
3. Expected behavior
4. Actual behavior
5. Screenshots/videos
6. Console errors
7. Network tab info
8. Wallet type/version

---

## Automated Testing (Future)

Consider adding:
- Unit tests (Jest)
- Integration tests (React Testing Library)
- E2E tests (Playwright/Cypress)
- Visual regression tests
- Contract tests (Hardhat)
- Load testing (k6)

---

**Last Updated:** 2025-10-10
**Version:** 1.0.0
