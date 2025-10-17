# Translation Implementation Guide - HypeAI Website

**Date:** 2025-10-17
**Status:** Ready for Development
**Estimated Effort:** 6 weeks (1 developer)

---

## Quick Summary

### Current State
- **Pages:** 27 HTML files analyzed
- **Translation Coverage:** <1% (only nav and hero on index.html)
- **Keys Created:** ~10 keys
- **Keys Needed:** 1,200-1,500 keys
- **Gap:** 99%+ missing coverage

### Deliverables Created
1. ✅ **translation-audit.md** - Complete analysis of 27 pages
2. ✅ **translation-keys-structure.json** - Example structure with ~250 keys
3. ✅ **translation-implementation-guide.md** - This file

---

## Files Overview

### High Priority Pages (Week 1-2)
| File | Size | Elements | Status | Priority |
|------|------|----------|--------|----------|
| index.html | 96 KB | ~300 | 3% done | HIGH |
| trade.html | 16 KB | ~50 | 0% done | HIGH |
| stake.html | 20 KB | ~60 | 0% done | HIGH |
| governance.html | 26 KB | ~80 | 0% done | HIGH |

### Medium Priority Pages (Week 3-4)
| File | Size | Elements | Status | Priority |
|------|------|----------|--------|----------|
| about.html | 21 KB | ~70 | 0% done | MEDIUM |
| agents.html | 42 KB | ~450 | 0% done | MEDIUM |
| agents-activity.html | 39 KB | ~100 | 0% done | MEDIUM |
| analytics.html | 28 KB | ~80 | 0% done | MEDIUM |

### Documentation Pages (Week 5)
| File | Size | Elements | Status | Priority |
|------|------|----------|--------|----------|
| docs.html | 23 KB | ~60 | 0% done | MEDIUM |
| whitepaper.html | 29 KB | ~100 | 0% done | MEDIUM |
| api.html | 29 KB | ~80 | 0% done | MEDIUM |
| audit.html | 19 KB | ~50 | 0% done | MEDIUM |
| proof.html | 25 KB | ~60 | 0% done | LOW |
| blog.html | 24 KB | ~70 | 0% done | LOW |
| roadmap.html | 25 KB | ~60 | 0% done | LOW |

### Legal Pages (Week 6)
| File | Size | Elements | Status | Priority |
|------|------|----------|--------|----------|
| privacy.html | 65 KB | ~150 | 0% done | LOW |
| terms.html | 91 KB | ~200 | 0% done | LOW |
| cookies.html | 51 KB | ~100 | 0% done | LOW |

### Utility Pages (As Needed)
| File | Size | Elements | Status | Priority |
|------|------|----------|--------|----------|
| ALL_PAGES.html | 8.2 KB | ~20 | 0% done | LOW |
| hypeai-avatar.html | 9.1 KB | ~5 | 0% done | LOW |
| hypeai-banner.html | 10 KB | ~5 | 0% done | LOW |
| logo-*.html (4 files) | ~80 KB | ~10 | 0% done | LOW |
| svg-to-png-converter.html | 4.8 KB | ~10 | 0% done | LOW |

---

## Implementation Steps

### Phase 1: Setup & Foundation (Week 1)

#### 1.1 Install Dependencies
```bash
npm install i18next i18next-browser-languagedetector i18next-http-backend
```

#### 1.2 Create Directory Structure
```bash
mkdir -p public/locales/{en,ru,zh,es,fr}
cd public/locales/en
touch common.json index.json agents.json trade.json stake.json governance.json docs.json legal.json
```

#### 1.3 Initialize i18next Configuration
Create `/public/js/i18n.js`:
```javascript
import i18next from 'i18next';
import HttpBackend from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';

i18next
  .use(HttpBackend)
  .use(LanguageDetector)
  .init({
    fallbackLng: 'en',
    debug: true,
    ns: ['common', 'index', 'agents', 'trade', 'stake', 'governance', 'docs', 'legal'],
    defaultNS: 'common',
    backend: {
      loadPath: '/locales/{{lng}}/{{ns}}.json'
    },
    interpolation: {
      escapeValue: false
    }
  });

export default i18next;
```

#### 1.4 Create Language Switcher Component
Create `/public/components/LanguageSwitcher.html`:
```html
<div class="language-switcher">
  <button class="current-lang" id="langButton">
    <span id="currentLangFlag">🇺🇸</span>
    <span id="currentLangCode">EN</span>
  </button>
  <div class="lang-dropdown" id="langDropdown">
    <button data-lang="en" class="lang-option">🇺🇸 English</button>
    <button data-lang="ru" class="lang-option">🇷🇺 Русский</button>
    <button data-lang="zh" class="lang-option">🇨🇳 中文</button>
    <button data-lang="es" class="lang-option">🇪🇸 Español</button>
    <button data-lang="fr" class="lang-option">🇫🇷 Français</button>
  </div>
</div>
```

### Phase 2: Core Pages Implementation (Week 2-3)

#### 2.1 index.html
**Work Required:**
- Add data-i18n to ~300 elements
- Extract all text content to JSON
- Test language switching
- Fix layout issues

**Example Changes:**
```html
<!-- Before -->
<h1>Where AI Meets Opportunity</h1>

<!-- After -->
<h1 data-i18n="index.hero.title">Where AI Meets Opportunity</h1>
```

**JSON Structure:**
```json
{
  "index": {
    "hero": {
      "title": "Where AI Meets Opportunity",
      "subtitle": "AI-powered crypto platform..."
    }
  }
}
```

#### 2.2 trade.html, stake.html, governance.html
Follow same pattern as index.html:
1. Read file thoroughly
2. Identify all text elements
3. Create translation keys
4. Add data-i18n attributes
5. Test switching languages
6. Fix any layout breaks

### Phase 3: Content Pages (Week 4-5)

#### 3.1 agents.html (Most Complex)
**Work Required:**
- 26 agent profiles
- Each agent: name, role, description, 2 stats
- Total: ~450 translatable elements

**Recommended Approach:**
- Create separate JSON file: `agents.json`
- Use template for agent cards
- Iterate through agent data

#### 3.2 Documentation Pages
**Work Required:**
- Large blocks of technical content
- Tables with headers and data
- Code examples (don't translate)
- API endpoints (don't translate)

**Important:** Mark non-translatable content:
```html
<code class="no-translate">GET /api/v1/predictions</code>
```

### Phase 4: Legal Pages (Week 6)

#### 4.1 Professional Translation Required
Legal text must be:
- Legally accurate
- Reviewed by native speakers
- Approved by legal team

**Recommendation:** Hire professional legal translators (~$5,000-10,000)

### Phase 5: QA & Polish (Ongoing)

#### 5.1 Testing Checklist
- [ ] All pages load without errors
- [ ] Language switching works on every page
- [ ] No layout breaks in any language
- [ ] All buttons/links work correctly
- [ ] Forms submit correctly
- [ ] Translations are contextually correct
- [ ] No missing keys (fallback to English)
- [ ] Performance is acceptable (<2s page load)

#### 5.2 Native Speaker Review
Hire native speakers to review:
- Russian translation
- Chinese translation
- Spanish translation
- French translation

**Budget:** $1,000-2,000 per language for review

---

## Translation Key Naming Convention

### Format
```
{page}.{section}.{element}.{variant}
```

### Examples
```
index.hero.title
index.hero.subtitle
index.services.aiAgent.title
index.services.aiAgent.description
index.services.aiAgent.pricing
index.services.aiAgent.features.0
index.services.aiAgent.features.1

agents.atlas.name
agents.atlas.role
agents.atlas.description
agents.atlas.stats.reports
agents.atlas.stats.accuracy

trade.orderBook.header.price
trade.orderBook.header.amount
trade.orderBook.header.total

stake.pools.bronze.tier
stake.pools.bronze.apy
stake.pools.bronze.period

governance.proposal.003.title
governance.proposal.003.description

footer.product.title
footer.product.links.trade
```

---

## File Organization

### Recommended Structure
```
public/
  locales/
    en/
      common.json       (nav, footer, buttons, status - 100 keys)
      index.json        (homepage - 200 keys)
      agents.json       (all agents - 450 keys)
      trade.json        (trading pages - 80 keys)
      stake.json        (staking pages - 80 keys)
      governance.json   (governance - 100 keys)
      analytics.json    (analytics - 80 keys)
      docs.json         (documentation - 150 keys)
      whitepaper.json   (whitepaper - 100 keys)
      legal.json        (legal pages - 250 keys)
    ru/
      (same structure)
    zh/
      (same structure)
    es/
      (same structure)
    fr/
      (same structure)
```

### Benefits of Split Files
1. **Performance:** Load only needed translations
2. **Maintainability:** Easier to manage smaller files
3. **Collaboration:** Multiple translators can work simultaneously
4. **Caching:** Browser caches individual files

---

## Automation Scripts

### 1. Extract All Text Script
```bash
#!/bin/bash
# extract-text.sh - Extract all text from HTML files

for file in public/*.html; do
  echo "Processing $file..."
  # Use grep to find text content
  grep -o '>[^<]*<' "$file" | sed 's/^>//;s/<$//' | grep -v '^$' > "text-$(basename $file).txt"
done
```

### 2. Add data-i18n Attributes Script
```javascript
// add-i18n-attributes.js
const fs = require('fs');
const cheerio = require('cheerio');

function addI18nAttributes(htmlFile, translations) {
  const html = fs.readFileSync(htmlFile, 'utf8');
  const $ = cheerio.load(html);

  // Find all text elements
  $('h1, h2, h3, h4, h5, h6, p, button, a, span, label').each((i, elem) => {
    const text = $(elem).text().trim();
    if (text && text.length > 0) {
      // Generate translation key
      const key = generateKey(text);
      $(elem).attr('data-i18n', key);
    }
  });

  fs.writeFileSync(htmlFile, $.html());
}
```

### 3. Validate Translations Script
```javascript
// validate-translations.js
const fs = require('fs');

function validateTranslations() {
  const languages = ['en', 'ru', 'zh', 'es', 'fr'];
  const namespaces = ['common', 'index', 'agents', 'trade', 'stake', 'governance', 'docs', 'legal'];

  const enKeys = {};

  // Load all English keys
  namespaces.forEach(ns => {
    const file = `public/locales/en/${ns}.json`;
    enKeys[ns] = JSON.parse(fs.readFileSync(file, 'utf8'));
  });

  // Check other languages
  languages.slice(1).forEach(lang => {
    console.log(`Checking ${lang}...`);
    namespaces.forEach(ns => {
      const file = `public/locales/${lang}/${ns}.json`;
      const langKeys = JSON.parse(fs.readFileSync(file, 'utf8'));

      // Find missing keys
      const missing = findMissingKeys(enKeys[ns], langKeys);
      if (missing.length > 0) {
        console.error(`Missing keys in ${lang}/${ns}:`, missing);
      }
    });
  });
}

function findMissingKeys(source, target, prefix = '') {
  const missing = [];

  Object.keys(source).forEach(key => {
    const fullKey = prefix ? `${prefix}.${key}` : key;

    if (!target.hasOwnProperty(key)) {
      missing.push(fullKey);
    } else if (typeof source[key] === 'object') {
      missing.push(...findMissingKeys(source[key], target[key], fullKey));
    }
  });

  return missing;
}
```

---

## Cost Estimates

### Professional Translation
| Service | Volume | Rate | Total |
|---------|--------|------|-------|
| English to Russian | 35,000 words | $0.10/word | $3,500 |
| English to Chinese | 35,000 words | $0.12/word | $4,200 |
| English to Spanish | 35,000 words | $0.08/word | $2,800 |
| English to French | 35,000 words | $0.09/word | $3,150 |
| **Total** | **140,000 words** | | **$13,650** |

### AI-Assisted Translation (Recommended)
| Service | Volume | Rate | Total |
|---------|--------|------|-------|
| GPT-4 Translation | 35,000 words × 4 | $0.006/word | $840 |
| Human Review (10%) | 3,500 words × 4 | $0.30/word | $4,200 |
| Native Speaker QA | 4 languages | $1,000/lang | $4,000 |
| **Total** | | | **$9,040** |

### Recommended Approach
1. Use GPT-4 for initial translation (~$840)
2. Human review of critical pages (nav, hero, CTAs) (~$2,000)
3. Native speaker final review (~$4,000)
4. **Total: ~$7,000**

---

## Performance Considerations

### Lazy Loading
```javascript
// Only load translations when needed
i18next.loadNamespaces(['trade'], (err, t) => {
  // Trade page translations loaded
});
```

### Caching Strategy
```javascript
// Cache translations for 1 hour
backend: {
  loadPath: '/locales/{{lng}}/{{ns}}.json',
  crossDomain: false,
  allowMultiLoading: false,
  cache: true,
  cacheMaxAge: 3600000 // 1 hour
}
```

### Code Splitting
- Load common.json on all pages
- Load page-specific JSON only when needed
- Use webpack/parcel to bundle translations

---

## Success Metrics

### Coverage
- [ ] 100% of text has translation keys
- [ ] All 27 pages support language switching
- [ ] Zero missing keys in production

### Quality
- [ ] Native speaker approval rating >90%
- [ ] No grammatical errors
- [ ] Contextually appropriate translations

### Performance
- [ ] Page load time <2 seconds
- [ ] Language switch time <500ms
- [ ] Bundle size increase <100KB

### User Experience
- [ ] No layout breaks in any language
- [ ] All buttons/forms work correctly
- [ ] Smooth language switching

---

## Maintenance Plan

### Regular Updates
1. **Weekly:** Check for new text added to pages
2. **Monthly:** Update translations for new features
3. **Quarterly:** Native speaker review of translations

### Process for New Content
1. Developer adds text with data-i18n attribute
2. English key added to JSON file
3. Translation service updates other languages
4. QA tests all languages
5. Deploy to production

---

## Support Resources

### i18next Documentation
- https://www.i18next.com/
- https://www.i18next.com/overview/api

### Translation Services
- **DeepL:** https://www.deepl.com/translator
- **Google Translate API:** https://cloud.google.com/translate
- **Microsoft Translator:** https://www.microsoft.com/en-us/translator/

### Translation Management Platforms
- **Lokalise:** https://lokalise.com/
- **Crowdin:** https://crowdin.com/
- **Phrase:** https://phrase.com/

---

## Next Actions

### Immediate (This Week)
1. ✅ Review translation audit document
2. ✅ Review translation keys structure
3. ✅ Review implementation guide
4. [ ] Set up i18next configuration
5. [ ] Create directory structure
6. [ ] Implement language switcher

### Week 1-2
7. [ ] Complete index.html translation
8. [ ] Complete trade.html translation
9. [ ] Complete stake.html translation
10. [ ] Complete governance.html translation

### Week 3-4
11. [ ] Complete about.html translation
12. [ ] Complete agents.html translation (biggest task)
13. [ ] Complete analytics.html translation
14. [ ] Complete agents-activity.html translation

### Week 5
15. [ ] Complete documentation pages
16. [ ] Complete whitepaper, API docs
17. [ ] Complete blog and roadmap pages

### Week 6
18. [ ] Complete legal pages (with professional translation)
19. [ ] QA testing all languages
20. [ ] Native speaker reviews
21. [ ] Deploy to production

---

**End of Implementation Guide**

For questions or clarifications, review:
- `/docs/translation-audit.md` - Detailed analysis
- `/docs/translation-keys-structure.json` - Example keys
- `/docs/translation-implementation-guide.md` - This file
