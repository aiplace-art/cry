# Chinese Translation Implementation Guide

## Quick Start for Developers

### Translation File Location
```
/Users/ai.place/Crypto/website/i18n/translations.json
```

### Translation Status
- **Language Code:** `zh`
- **Language:** Simplified Chinese (简体中文)
- **Completion:** 100%
- **Last Updated:** 2025-10-17

## How to Use the Chinese Translation

### 1. Language Switcher Integration

If using i18next or similar:

```typescript
import i18n from 'i18next';
import translations from './i18n/translations.json';

i18n.init({
  lng: 'en', // default language
  fallbackLng: 'en',
  resources: {
    en: { translation: translations.en },
    ru: { translation: translations.ru },
    zh: { translation: translations.zh }, // Chinese translation
  },
});
```

### 2. Accessing Translation Keys

```typescript
// Hero section
const title = t('hero.title'); // "AI驱动的加密货币交易"
const subtitle = t('hero.subtitle'); // "更智能。更快速。更优秀。"

// Navigation
const navHome = t('nav.home'); // "首页"
const navStake = t('nav.stake'); // "质押"

// Buttons
const buyButton = t('buttons.buyNow'); // "💰 立即购买$HYPE"
```

### 3. Language Detection

Recommended: Auto-detect Chinese users

```typescript
const detectLanguage = () => {
  // Browser language detection
  const browserLang = navigator.language || navigator.userLanguage;

  if (browserLang.startsWith('zh')) {
    return 'zh'; // Chinese
  } else if (browserLang.startsWith('ru')) {
    return 'ru'; // Russian
  } else {
    return 'en'; // English (default)
  }
};
```

### 4. Font Considerations

Chinese characters require specific fonts. Add to your CSS:

```css
/* Chinese font stack */
html[lang="zh"] {
  font-family:
    -apple-system,
    BlinkMacSystemFont,
    "PingFang SC",          /* macOS/iOS Chinese */
    "Microsoft YaHei",       /* Windows Chinese */
    "Noto Sans SC",          /* Google Noto Sans Simplified Chinese */
    "Source Han Sans SC",    /* Adobe Source Han Sans */
    sans-serif;
}

/* Ensure proper line height for Chinese characters */
html[lang="zh"] {
  line-height: 1.7; /* Chinese text needs more space */
}

/* Slightly larger font size for better readability */
html[lang="zh"] body {
  font-size: 16px; /* vs 14px for English */
}
```

### 5. Character Encoding

Ensure your HTML includes proper charset:

```html
<html lang="zh">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>HypeAI - AI驱动的加密货币交易</title>
  </head>
</html>
```

## Translation Structure

### Main Sections Available

```javascript
translations.zh = {
  _meta: {}, // Metadata about translation
  nav: {},   // Navigation menu
  hero: {},  // Hero section
  stats: {}, // Statistics display
  whySucceed: { // Why HypeAI succeeds section
    cryptoChecker: {},
    oracle: {},
    revenue: {},
    burns: {},
    staking: {},
    agents: {},
    successFormula: {},
    longTerm: {}
  },
  services: { // Services platform
    security: {},
    tokenomics: {}
  },
  footer: {}, // Footer section
  buttons: {} // All CTAs and buttons
}
```

## Key Terminology Reference

### Critical Terms for Developers

```javascript
// These terms appear frequently - make sure they're used consistently
const keyTerms = {
  'AI Agents': 'AI代理',
  'Staking': '质押',
  'Token': '代币',
  'Smart Contract': '智能合约',
  'DeFi': '去中心化金融',
  'Blockchain': '区块链',
  'Whitepaper': '白皮书',
  'APY': 'APY年化收益率',
  'Burns': '销毁',
  'Liquidity': '流动性'
};
```

## Testing Checklist

### Visual Testing
- [ ] All Chinese characters display correctly
- [ ] No broken characters (□ boxes)
- [ ] Proper line breaks (Chinese uses different rules)
- [ ] Font rendering looks clean on:
  - [ ] Windows
  - [ ] macOS
  - [ ] iOS
  - [ ] Android

### Functional Testing
- [ ] Language switcher works
- [ ] All pages translate correctly
- [ ] No missing translation keys
- [ ] Fallback to English works
- [ ] URL structure handles Chinese (if applicable)

### Mobile Testing
- [ ] Chinese characters readable on small screens
- [ ] Touch targets sized appropriately
- [ ] Horizontal scrolling avoided
- [ ] WeChat in-app browser compatible

### Performance Testing
- [ ] Chinese font loading optimized
- [ ] Web font file size acceptable
- [ ] Page load time acceptable
- [ ] Font rendering doesn't cause layout shift

## SEO Considerations

### Meta Tags for Chinese Pages

```html
<!-- Chinese language meta tags -->
<html lang="zh-CN"> <!-- Simplified Chinese -->
  <head>
    <meta charset="UTF-8">
    <meta name="description" content="HypeAI - 27个AI代理无限工作，助力您的财务增长">
    <meta name="keywords" content="AI代理, 加密货币, 区块链, DeFi, 质押, 代币经济学">

    <!-- Open Graph for Chinese social media -->
    <meta property="og:locale" content="zh_CN">
    <meta property="og:title" content="HypeAI - AI驱动的加密货币交易">
    <meta property="og:description" content="更智能。更快速。更优秀。">

    <!-- WeChat specific (very important in China!) -->
    <meta property="og:image" content="https://hypeai.com/wechat-share-image.jpg">
  </head>
</html>
```

### Sitemap Configuration

```xml
<!-- Add Chinese pages to sitemap.xml -->
<url>
  <loc>https://hypeai.com/zh</loc>
  <xhtml:link
    rel="alternate"
    hreflang="en"
    href="https://hypeai.com/en"/>
  <xhtml:link
    rel="alternate"
    hreflang="zh-CN"
    href="https://hypeai.com/zh"/>
  <xhtml:link
    rel="alternate"
    hreflang="ru"
    href="https://hypeai.com/ru"/>
</url>
```

## Common Issues and Solutions

### Issue 1: Broken Chinese Characters
**Problem:** Chinese characters show as boxes (□□□)
**Solution:**
```css
/* Add web font */
@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@400;500;700&display=swap');

html[lang="zh"] {
  font-family: 'Noto Sans SC', sans-serif;
}
```

### Issue 2: Text Overflow
**Problem:** Chinese text breaks layout
**Solution:**
```css
/* Chinese text wrapping */
html[lang="zh"] * {
  word-break: break-word;
  overflow-wrap: break-word;
}
```

### Issue 3: Wrong Font Weight
**Problem:** Chinese text looks too thin/thick
**Solution:**
```css
/* Adjust font weights for Chinese */
html[lang="zh"] h1,
html[lang="zh"] h2,
html[lang="zh"] h3 {
  font-weight: 500; /* Instead of 700 */
}

html[lang="zh"] body {
  font-weight: 400; /* Standard weight */
}
```

### Issue 4: Line Height Issues
**Problem:** Chinese characters feel cramped
**Solution:**
```css
html[lang="zh"] {
  line-height: 1.7; /* vs 1.5 for English */
  letter-spacing: 0.02em; /* Slight spacing helps */
}
```

## Browser Compatibility

### Supported Browsers in China

1. **WeChat In-App Browser** (Critical!)
   - Most important for Chinese users
   - Test all functionality inside WeChat
   - Image sharing must work perfectly

2. **QQ Browser**
   - Popular in China
   - Webkit-based

3. **UC Browser**
   - Mobile browser popular in Asia
   - Test on Android

4. **Baidu Browser**
   - Chinese search engine browser
   - Desktop and mobile

5. **Standard Browsers**
   - Chrome (still used)
   - Safari (iOS users)
   - Edge (Windows users)

## Analytics Setup

### Track Chinese User Behavior

```javascript
// Google Analytics 4
gtag('event', 'language_selected', {
  'language': 'zh',
  'user_region': 'CN' // or detected region
});

// Track which sections Chinese users engage with
gtag('event', 'section_view', {
  'language': 'zh',
  'section': 'whySucceed.cryptoChecker'
});
```

## Marketing Integration

### WeChat Integration (Critical for China!)

```javascript
// WeChat JS SDK configuration
wx.config({
  appId: 'YOUR_APP_ID',
  timestamp: timestamp,
  nonceStr: nonceStr,
  signature: signature,
  jsApiList: [
    'updateAppMessageShareData', // Share to chat
    'updateTimelineShareData'     // Share to moments
  ]
});

// Set Chinese share content
wx.ready(function() {
  wx.updateAppMessageShareData({
    title: 'HypeAI - AI驱动的加密货币交易',
    desc: '27个AI代理无限工作，助力您的财务增长',
    link: 'https://hypeai.com/zh',
    imgUrl: 'https://hypeai.com/wechat-share.jpg'
  });
});
```

## Content Management

### Adding New Content

When adding new features, remember to add Chinese translations:

```javascript
// 1. Add English first (en)
"newFeature": {
  "title": "New Feature",
  "description": "Description here"
}

// 2. Add Russian (ru)
"newFeature": {
  "title": "Новая функция",
  "description": "Описание здесь"
}

// 3. Add Chinese (zh)
"newFeature": {
  "title": "新功能",
  "description": "描述在这里"
}
```

### Translation Workflow

```bash
# 1. Check for missing translations
npm run i18n:check

# 2. Add missing translations to zh section

# 3. Validate JSON
npm run i18n:validate

# 4. Test all languages
npm run dev
```

## Performance Optimization

### Font Loading Strategy

```html
<!-- Preload Chinese fonts for better performance -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="preload"
      href="https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@400;500;700&display=swap"
      as="style"
      onload="this.onload=null;this.rel='stylesheet'">
```

### Subset Chinese Fonts

```css
/* Load only needed Chinese characters (reduces file size) */
@font-face {
  font-family: 'Noto Sans SC';
  font-style: normal;
  font-weight: 400;
  src: url('/fonts/NotoSansSC-subset.woff2') format('woff2');
  unicode-range: U+4E00-9FFF; /* CJK Unified Ideographs */
}
```

## Accessibility

### Chinese Language Accessibility

```html
<!-- Screen reader support for Chinese -->
<html lang="zh-CN">
  <body>
    <!-- Use semantic HTML -->
    <nav aria-label="主导航">
      <a href="/">首页</a>
      <a href="/trade">交易</a>
      <a href="/stake">质押</a>
    </nav>

    <!-- Proper heading hierarchy -->
    <h1>AI驱动的加密货币交易</h1>
    <h2>为什么HypeAI注定成功</h2>
  </body>
</html>
```

## Legal Compliance

### China-Specific Considerations

1. **ICP License**
   - Required for China hosting
   - Display ICP number in footer

2. **Content Restrictions**
   - Avoid gambling language
   - Be careful with financial promises
   - Include proper risk disclaimers

3. **Data Privacy**
   - PIPL compliance (China's privacy law)
   - Data localization if storing Chinese user data

4. **Crypto Regulations**
   - China has strict crypto rules
   - Market to international Chinese speakers
   - Consider Hong Kong, Taiwan, Singapore Chinese users

## Support Resources

### Getting Help

1. **Translation Issues**
   - Check: `/Users/ai.place/Crypto/docs/chinese-translation-summary.md`
   - File: `/Users/ai.place/Crypto/website/i18n/translations.json`

2. **Technical Issues**
   - Review this guide
   - Test in multiple browsers
   - Check console for errors

3. **Content Updates**
   - Follow same structure as English
   - Maintain emoji usage
   - Keep brand names in English

## Quick Reference Commands

```bash
# Validate JSON structure
node -e "JSON.parse(require('fs').readFileSync('website/i18n/translations.json'))"

# Check Chinese translation completeness
node -e "const data = JSON.parse(require('fs').readFileSync('website/i18n/translations.json')); console.log('Chinese translation status:', data.zh._meta.completion)"

# Extract Chinese keys
node -e "const data = JSON.parse(require('fs').readFileSync('website/i18n/translations.json')); console.log(Object.keys(data.zh))"
```

## Deployment Checklist

Before deploying Chinese translation:

- [ ] All translations complete
- [ ] JSON validated (no syntax errors)
- [ ] Fonts loading correctly
- [ ] Language switcher working
- [ ] Meta tags updated
- [ ] OpenGraph images set
- [ ] WeChat sharing tested (if applicable)
- [ ] Mobile responsive
- [ ] Performance optimized
- [ ] Analytics tracking configured
- [ ] SEO meta tags added
- [ ] Sitemap updated
- [ ] All links working
- [ ] No console errors
- [ ] Cross-browser tested

## Success Metrics

Track these metrics after launch:

1. **Language Adoption**
   - % users choosing Chinese
   - Session duration in Chinese
   - Bounce rate comparison

2. **User Engagement**
   - Pages per session (Chinese users)
   - Time on page (Chinese content)
   - Scroll depth

3. **Conversion**
   - Wallet connections (Chinese users)
   - Token purchases
   - Staking participation

4. **Technical**
   - Page load time (Chinese fonts)
   - Font render time
   - Language switch time

---

**Guide Version:** 1.0
**Last Updated:** 2025-10-17
**Maintained By:** Development Team
**Translation By:** Chinese Translation Specialist Agent

---

## Additional Resources

- **Translation Summary:** `/Users/ai.place/Crypto/docs/chinese-translation-summary.md`
- **Translation File:** `/Users/ai.place/Crypto/website/i18n/translations.json`
- **Chinese Crypto Terms:** See summary document glossary section

For questions or updates, refer to these documents or create an issue in the project repository.
