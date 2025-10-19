# HypeAI Variant 2 - Mobile Testing Guide

## Quick Test

### 1. Open Test Page
```
file:///Users/ai.place/Crypto/public/variant-2/test-mobile.html
```

### 2. Open Main Site
```
file:///Users/ai.place/Crypto/public/variant-2/index.html
```

## Testing Steps

### Step 1: Desktop Browser Testing (Chrome DevTools)

1. **Open DevTools:**
   - Press F12 or Cmd+Option+I (Mac)
   - Click "Toggle device toolbar" or press Cmd+Shift+M

2. **Test Each Device:**
   - iPhone SE (375x667)
   - iPhone 12 (390x844)
   - iPad (768x1024)
   - Responsive mode (drag to test all sizes)

3. **Verify:**
   - [ ] No horizontal scroll at any size
   - [ ] Hamburger menu appears on mobile
   - [ ] Desktop nav appears on desktop
   - [ ] Touch targets are 44px minimum
   - [ ] Text is readable without zoom
   - [ ] Buttons stack on mobile, row on desktop

### Step 2: Real Device Testing

1. **Start Local Server:**
```bash
cd /Users/ai.place/Crypto/public/variant-2
python3 -m http.server 8000
```

2. **Find Your IP:**
```bash
# macOS
ipconfig getifaddr en0

# Example output: 192.168.1.100
```

3. **Access from Mobile:**
```
http://192.168.1.100:8000/
```

4. **Test on Device:**
   - [ ] Hamburger menu smooth
   - [ ] Touch feedback on buttons
   - [ ] No accidental zoom on input focus
   - [ ] Smooth scrolling
   - [ ] PWA install prompt appears

### Step 3: Lighthouse Audit

1. **Open Chrome DevTools**
2. **Go to Lighthouse tab**
3. **Select:**
   - [x] Performance
   - [x] Accessibility
   - [x] Best Practices
   - [x] SEO
   - [x] PWA
4. **Device:** Mobile
5. **Click "Generate report"**

**Expected Scores:**
- Performance: 90+
- Accessibility: 100
- Best Practices: 100
- SEO: 100
- PWA: 100

### Step 4: Manual Feature Testing

#### Hamburger Menu
- [ ] Click hamburger - menu slides in from right
- [ ] Click link - menu closes
- [ ] Click outside menu - menu closes
- [ ] Press ESC - menu closes
- [ ] Body scroll locked when menu open
- [ ] Smooth 300ms animation

#### Touch Interactions
- [ ] Tap button - visual feedback (scale down)
- [ ] Release - returns to normal
- [ ] All buttons respond to touch
- [ ] No hover effects on touch devices

#### Responsive Layout
- [ ] 320px - Single column, stacked buttons
- [ ] 768px - 2 columns, row buttons
- [ ] 1024px - 3 columns, desktop nav
- [ ] No content cutoff at any size

#### PWA Features
- [ ] Install prompt appears (Chrome/Edge)
- [ ] Can add to home screen (iOS/Android)
- [ ] Works offline after install
- [ ] App-like full screen experience

### Step 5: Performance Testing

#### Load on 3G
1. **Chrome DevTools → Network tab**
2. **Throttling:** Slow 3G
3. **Reload page**
4. **Verify:**
   - [ ] First Contentful Paint < 2s
   - [ ] Largest Contentful Paint < 3s
   - [ ] Time to Interactive < 4s

#### Page Weight
1. **Network tab → Size column**
2. **Verify:**
   - [ ] HTML: ~12 KB
   - [ ] CSS: Inline (included in HTML)
   - [ ] JS: ~8 KB
   - [ ] Total: <30 KB

### Step 6: Accessibility Testing

#### Keyboard Navigation
- [ ] Tab through all interactive elements
- [ ] Enter/Space activates buttons
- [ ] ESC closes mobile menu
- [ ] Focus visible on all elements

#### Screen Reader (Optional)
- [ ] VoiceOver (Mac): Cmd+F5
- [ ] Test hamburger menu announcement
- [ ] Test button labels

#### Color Contrast
- [ ] Text meets 4.5:1 ratio
- [ ] Buttons meet contrast requirements
- [ ] Links distinguishable

## Common Issues & Fixes

### Issue: Horizontal Scroll on Mobile
**Fix:** Check CSS for fixed widths:
```css
/* Bad */
.element { width: 500px; }

/* Good */
.element { max-width: 100%; }
```

### Issue: iOS Input Zoom
**Fix:** Ensure 16px minimum font:
```css
input, textarea, select {
  font-size: 16px;
}
```

### Issue: Menu Not Closing
**Fix:** Check JavaScript event listeners:
```javascript
mobileNavLinks.forEach(link => {
  link.addEventListener('click', closeMenu);
});
```

### Issue: Touch Targets Too Small
**Fix:** Add minimum dimensions:
```css
button, a {
  min-width: 44px;
  min-height: 44px;
}
```

## Test Results Template

```
# Test Results - [Date]

## Device Info
- Device: [iPhone 12 / Pixel 5 / etc]
- OS: [iOS 15.1 / Android 12]
- Browser: [Safari / Chrome]
- Screen: [390x844]

## Automated Tests
- [ ] No horizontal scroll
- [ ] Font size >= 16px
- [ ] Touch targets >= 44px
- [ ] Lighthouse Performance: __/100
- [ ] Lighthouse Accessibility: __/100

## Manual Tests
- [ ] Hamburger menu works
- [ ] Touch feedback works
- [ ] PWA installable
- [ ] Offline mode works

## Issues Found
1. [Issue description]
2. [Issue description]

## Notes
[Any additional observations]
```

## Quick Commands

```bash
# Start server
cd /Users/ai.place/Crypto/public/variant-2 && python3 -m http.server 8000

# Find local IP (macOS)
ipconfig getifaddr en0

# Find local IP (Windows)
ipconfig | findstr IPv4

# Test with curl
curl -I http://localhost:8000/

# Clear service worker cache
# In browser console:
navigator.serviceWorker.getRegistrations().then(r => r.forEach(reg => reg.unregister()))
```

## Success Criteria

✅ **All tests pass:**
- No horizontal scroll
- Touch targets 44px+
- Lighthouse mobile 90+
- Works on iOS & Android
- PWA installable
- Offline functional
- Accessible (WCAG AA)

---

**Ready to test!** Start with test-mobile.html for automated checks.
