# Manual QA Testing Checklist - HypeAI

## Pre-Testing Setup
- [ ] Build production version: `npm run build`
- [ ] Start local server: `npm run preview`
- [ ] Open DevTools in all browsers
- [ ] Clear browser cache
- [ ] Disable browser extensions (test in incognito)

---

## 1. TECHNICAL FUNCTIONALITY

### 1.1 Console Errors Check
**How to Test:**
1. Open Chrome DevTools (F12) → Console tab
2. Navigate through all pages
3. Look for red error messages
4. Check Network tab for failed requests

**Expected Result:** Zero errors, zero failed requests

**Actual Result:**
- [ ] Homepage: ___
- [ ] About: ___
- [ ] Services: ___
- [ ] Contact: ___

### 1.2 Link Validation
**How to Test:**
1. Click every link on every page
2. Verify destination is correct
3. Check external links open in new tab
4. Test hash/anchor links scroll correctly

**Expected Result:** All links work, external links have target="_blank" rel="noopener"

**Actual Result:**
- [ ] Navigation links work: ___
- [ ] Footer links work: ___
- [ ] CTA buttons work: ___
- [ ] External links safe: ___

### 1.3 Image Loading
**How to Test:**
1. Open Network tab, filter by "Img"
2. Refresh page, watch all images load
3. Check for 404 errors
4. Verify alt text on all images (inspect element)

**Expected Result:** All images load, all have alt text

**Actual Result:**
- [ ] Hero images load: ___
- [ ] Feature images load: ___
- [ ] All images have alt text: ___
- [ ] No broken images: ___

### 1.4 Form Validation
**How to Test:**
Contact Form:
1. Try submitting empty form → Should show errors
2. Enter invalid email → Should show error
3. Enter valid data → Should submit successfully
4. Check success message displays

**Expected Result:** Proper validation, error messages clear, submission works

**Actual Result:**
- [ ] Required field validation: ___
- [ ] Email format validation: ___
- [ ] Phone validation: ___
- [ ] Success message: ___

### 1.5 ROI Calculator
**How to Test:**
1. Enter $10,000 → Check calculation
2. Enter $100,000 → Check calculation
3. Enter $1,000,000 → Check calculation
4. Try $0 → Should handle gracefully
5. Try negative number → Should validate/prevent
6. Try letters → Should validate/prevent

**Expected Results:**
- $10,000 investment → [Expected ROI]
- Proper number formatting ($1,000.00)
- Edge cases handled

**Actual Result:**
- [ ] Calculations accurate: ___
- [ ] Number formatting: ___
- [ ] Edge cases handled: ___

### 1.6 Animation Performance
**How to Test:**
1. Open DevTools → Performance tab
2. Start recording
3. Scroll page slowly
4. Stop recording
5. Check FPS (should be 60)
6. Look for long tasks (red flags)

**Expected Result:** Smooth 60 FPS, no jank

**Actual Result:**
- [ ] Scroll animations smooth: ___
- [ ] Hover effects smooth: ___
- [ ] FPS avg: ___
- [ ] Long tasks detected: ___

---

## 2. RESPONSIVE DESIGN

### 2.1 Mobile Testing (375px)
**How to Test:**
1. Open DevTools → Device Toolbar (Cmd+Shift+M)
2. Select iPhone SE
3. Navigate all pages
4. Check layout, text size, images

**Expected Result:** No horizontal scroll, text readable (16px+), images scale

**Checklist:**
- [ ] Layout looks good
- [ ] No horizontal scroll
- [ ] Text readable (check small text)
- [ ] Images scale properly
- [ ] Navigation works (hamburger menu?)
- [ ] Touch targets ≥44px (use ruler)

### 2.2 Tablet Testing (768px, 1024px)
**How to Test:**
1. Set viewport to iPad Mini (768px)
2. Check layout adapts
3. Repeat for iPad Pro (1024px)

**Checklist:**
- [ ] 768px layout good
- [ ] 1024px layout good
- [ ] Multi-column layouts work
- [ ] Navigation appropriate
- [ ] Images look sharp

### 2.3 Desktop Testing (1440px, 1920px, 4K)
**How to Test:**
1. Test on actual large display OR
2. Set custom viewport sizes in DevTools

**Checklist:**
- [ ] 1440px: Professional look
- [ ] 1920px: No excessive whitespace
- [ ] 4K: Content remains contained
- [ ] Max-width constraints work
- [ ] Images remain sharp

### 2.4 Orientation Change Test
**How to Test (Mobile):**
1. Rotate device/emulator
2. Check layout adapts
3. Check no broken elements

**Checklist:**
- [ ] Portrait → Landscape works
- [ ] Landscape → Portrait works
- [ ] No layout breaks

---

## 3. CROSS-BROWSER TESTING

### 3.1 Chrome
- [ ] Version: ___ (check chrome://version)
- [ ] All features work
- [ ] Styles render correctly
- [ ] Animations smooth
- [ ] Forms work
- [ ] Console clean

### 3.2 Safari
**How to Test:**
1. Open in Safari
2. Open Web Inspector (Cmd+Opt+I)
3. Test all features

- [ ] Version: ___ (Safari → About Safari)
- [ ] All features work
- [ ] Webkit-specific CSS works
- [ ] Forms work
- [ ] Console clean

### 3.3 Firefox
- [ ] Version: ___ (Help → About Firefox)
- [ ] All features work
- [ ] Styles render correctly
- [ ] Animations smooth
- [ ] Forms work
- [ ] Console clean

### 3.4 Edge
- [ ] Version: ___ (edge://version)
- [ ] All features work
- [ ] Styles render correctly
- [ ] Animations smooth
- [ ] Forms work
- [ ] Console clean

### 3.5 Mobile Browsers
**iOS Safari:**
- [ ] Test on real iPhone OR BrowserStack
- [ ] Touch events work
- [ ] Scroll smooth
- [ ] No zoom issues

**Chrome Mobile (Android):**
- [ ] Test on real Android OR BrowserStack
- [ ] Touch events work
- [ ] Scroll smooth
- [ ] No zoom issues

---

## 4. PERFORMANCE

### 4.1 Page Load Time Test
**How to Test:**
1. Open DevTools → Network tab
2. Hard reload (Cmd+Shift+R)
3. Check Load time (bottom right)
4. Should be <2 seconds

**Results:**
- [ ] Homepage: ___ seconds (target: <2s)
- [ ] About: ___ seconds (target: <2s)
- [ ] Services: ___ seconds (target: <2s)
- [ ] Contact: ___ seconds (target: <2s)

### 4.2 Lighthouse Audit
**How to Test:**
1. Open DevTools → Lighthouse tab
2. Select "Desktop" mode
3. Check all categories
4. Click "Generate report"
5. Repeat for "Mobile"

**Desktop Results:**
- [ ] Performance: ___ / 100 (target: >90)
- [ ] Accessibility: ___ / 100 (target: >90)
- [ ] Best Practices: ___ / 100 (target: >90)
- [ ] SEO: ___ / 100 (target: >90)

**Mobile Results:**
- [ ] Performance: ___ / 100 (target: >90)
- [ ] Accessibility: ___ / 100 (target: >90)
- [ ] Best Practices: ___ / 100 (target: >90)
- [ ] SEO: ___ / 100 (target: >90)

### 4.3 Core Web Vitals Check
**From Lighthouse report, record:**
- [ ] First Contentful Paint: ___ ms (target: <1000ms)
- [ ] Largest Contentful Paint: ___ ms (target: <2500ms)
- [ ] Cumulative Layout Shift: ___ (target: <0.1)
- [ ] First Input Delay: ___ ms (target: <100ms)

### 4.4 Image Optimization Check
**How to Test:**
1. Open Network tab
2. Filter by "Img"
3. Check file sizes
4. Check formats (WebP preferred)

**Checklist:**
- [ ] Images compressed (<200KB each)
- [ ] Using WebP format
- [ ] Lazy loading implemented
- [ ] Responsive images (srcset)

---

## 5. ACCESSIBILITY

### 5.1 Keyboard Navigation Test
**How to Test:**
1. Close mouse/trackpad
2. Use Tab to navigate
3. Use Enter/Space to activate
4. Use Escape to close modals

**Checklist:**
- [ ] Tab order logical
- [ ] All interactive elements reachable
- [ ] Focus indicators visible (blue outline)
- [ ] No keyboard traps
- [ ] Skip to content link works

### 5.2 Screen Reader Test
**How to Test (VoiceOver - macOS):**
1. Cmd+F5 to enable VoiceOver
2. Navigate with VO+Arrow keys
3. Listen to all content

**Checklist:**
- [ ] All content readable
- [ ] Alt text on images announced
- [ ] Headings structure makes sense
- [ ] Links are descriptive
- [ ] Forms have labels

### 5.3 Color Contrast Check
**How to Test:**
1. Use WebAIM Contrast Checker: https://webaim.org/resources/contrastchecker/
2. Check text/background combinations
3. Need 4.5:1 for normal text, 3:1 for large text

**Checklist:**
- [ ] Body text contrast: ___ (need: 4.5:1)
- [ ] Heading contrast: ___ (need: 3:1 if large)
- [ ] Button text contrast: ___ (need: 4.5:1)
- [ ] Link contrast: ___ (need: 4.5:1)

### 5.4 WAVE Accessibility Tool
**How to Test:**
1. Install WAVE extension
2. Click WAVE icon on each page
3. Review errors/alerts

**Results:**
- [ ] Homepage - Errors: ___, Alerts: ___
- [ ] About - Errors: ___, Alerts: ___
- [ ] Services - Errors: ___, Alerts: ___
- [ ] Contact - Errors: ___, Alerts: ___

---

## 6. CONTENT ACCURACY

### 6.1 Spelling & Grammar
**How to Test:**
1. Copy all text to Grammarly/Google Docs
2. Review suggestions
3. Fix any errors

**Checklist:**
- [ ] Homepage reviewed
- [ ] About page reviewed
- [ ] Services page reviewed
- [ ] Contact page reviewed
- [ ] No typos found

### 6.2 ROI Calculations Verified
**Manual Calculation:**
1. Take example: $10,000 investment
2. Calculate expected ROI manually
3. Compare with calculator result

**Checklist:**
- [ ] Formula verified: ___
- [ ] $10K calculation correct
- [ ] $100K calculation correct
- [ ] $1M calculation correct

### 6.3 Contact Information
**Verify:**
- [ ] Email address correct
- [ ] Phone number correct (test dial)
- [ ] Physical address correct (Google Maps)
- [ ] Social media links correct

### 6.4 Legal Compliance
**Verify Present:**
- [ ] Privacy Policy link
- [ ] Terms of Service link
- [ ] Cookie Notice (if applicable)
- [ ] Copyright notice
- [ ] Disclaimers (if crypto-related)

---

## 7. SECURITY CHECKS

### 7.1 HTTPS & SSL
**How to Test:**
1. Check URL starts with https://
2. Click padlock icon
3. Verify certificate valid

**Checklist:**
- [ ] HTTPS enabled
- [ ] SSL certificate valid
- [ ] No mixed content warnings

### 7.2 Security Headers Check
**How to Test:**
1. Use https://securityheaders.com
2. Enter your domain
3. Review score

**Required Headers:**
- [ ] Strict-Transport-Security
- [ ] Content-Security-Policy
- [ ] X-Content-Type-Options
- [ ] X-Frame-Options
- [ ] X-XSS-Protection

### 7.3 Input Sanitization
**How to Test:**
1. Try entering `<script>alert('XSS')</script>` in form
2. Should be escaped/sanitized
3. Try SQL injection: `' OR '1'='1`

**Checklist:**
- [ ] XSS prevented (script tags escaped)
- [ ] SQL injection prevented
- [ ] No sensitive data in URLs

---

## 8. FINAL CHECKS

### 8.1 Meta Tags & SEO
**How to Test:**
1. View page source (Cmd+U)
2. Check <head> section
3. Verify meta tags present

**Checklist:**
- [ ] Title tag unique per page
- [ ] Meta description present
- [ ] Open Graph tags (social sharing)
- [ ] Favicon loads

### 8.2 Analytics & Tracking
**If implemented:**
- [ ] Google Analytics tracking code
- [ ] Event tracking works
- [ ] No console errors from tracking

### 8.3 Error Pages
**Test:**
- [ ] 404 page exists and looks good
- [ ] 500 error page (if applicable)
- [ ] Offline page (if PWA)

### 8.4 Browser Back Button
**How to Test:**
1. Navigate to page 2
2. Click browser back button
3. Should go to page 1 correctly

**Checklist:**
- [ ] Back button works correctly
- [ ] State preserved (if applicable)
- [ ] No broken navigation

---

## 9. REGRESSION TESTING
(After bug fixes, re-test affected areas)

### Bug #1: [Description]
- [ ] Re-tested after fix
- [ ] Verified no new issues
- [ ] Status: ✅ Fixed / ❌ Still broken

### Bug #2: [Description]
- [ ] Re-tested after fix
- [ ] Verified no new issues
- [ ] Status: ✅ Fixed / ❌ Still broken

---

## 10. FINAL SIGN-OFF

### Critical Issues (Must fix)
- [ ] No critical bugs found
- [ ] All critical bugs fixed

### High Priority Issues
- [ ] No high priority bugs found
- [ ] All high priority bugs fixed

### Performance Targets
- [ ] All pages load <2s
- [ ] Lighthouse scores >90
- [ ] Core Web Vitals pass

### Accessibility Compliance
- [ ] WCAG AA compliant
- [ ] Keyboard accessible
- [ ] Screen reader friendly

### Browser Compatibility
- [ ] Works in Chrome
- [ ] Works in Safari
- [ ] Works in Firefox
- [ ] Works in Edge
- [ ] Works on mobile

### Responsive Design
- [ ] Works on all mobile sizes
- [ ] Works on tablets
- [ ] Works on desktop
- [ ] Works on 4K

### Final QA Approval
- [ ] ✅ APPROVED FOR LAUNCH
- [ ] ⚠️ CONDITIONAL APPROVAL (minor issues)
- [ ] ❌ NOT APPROVED (critical issues)

**QA Specialist Signature:** VERIFY
**Date:** 2025-10-17
**Notes:** ___

---

## Testing Tools Checklist

- [ ] Chrome DevTools
- [ ] Safari Web Inspector
- [ ] Firefox Developer Tools
- [ ] Lighthouse
- [ ] WAVE Browser Extension
- [ ] axe DevTools
- [ ] WebAIM Contrast Checker
- [ ] Grammarly/Google Docs
- [ ] https://securityheaders.com
- [ ] BrowserStack (cross-browser)

---

**Estimated Testing Time:** 2-3 hours for thorough manual testing
**Last Updated:** 2025-10-17
