# HypeAI Multi-Language Switcher Guide

## Overview

The HypeAI website now supports 8 languages with a professional dropdown interface:

**Active Languages (Q1 2025):**
- 🇺🇸 English (en)
- 🇷🇺 Russian (ru)

**Coming Soon:**
- 🇨🇳 Chinese (zh) - Q2 2025
- 🇪🇸 Spanish (es) - Q2 2025
- 🇫🇷 French (fr) - Q3 2025
- 🇩🇪 German (de) - Q3 2025
- 🇯🇵 Japanese (ja) - Q3 2025
- 🇰🇷 Korean (ko) - Q4 2025

---

## File Structure

```
website/
├── js/
│   └── language-switcher.js     # Main switcher logic
├── css/
│   └── language-switcher.css    # Dropdown styles
└── i18n/
    └── translations.json         # All translations
```

---

## How to Activate a New Language

### Step 1: Complete Translations

Edit `website/i18n/translations.json` and translate all English keys for your target language.

**Example: Activating Spanish (es)**

```json
{
  "es": {
    "_meta": {
      "language": "Spanish",
      "status": "active",           // Change from "coming_soon" to "active"
      "completion": "100%",          // Update completion percentage
      "last_updated": "2025-04-15",
      "notes": "Spanish translation complete"
    },
    "nav": {
      "home": "Inicio",              // Translate all keys
      "trade": "Comerciar",
      "stake": "Apostar",
      "agents": "Agentes IA",
      "docs": "Documentación",
      "whitepaper": "Whitepaper",
      "connectWallet": "Conectar Billetera"
    },
    "hero": {
      "title": "Trading Cripto Impulsado por IA",
      "subtitle": "Más inteligente. Más rápido. Mejor.",
      "description": "27 Agentes IA trabajando infinitamente para potenciar tu crecimiento financiero",
      "ctaPrimary": "Comenzar a Operar",
      "ctaSecondary": "Ver Agentes IA",
      "whySuccessButton": "🚀 Por qué 50x-100x-1000x es Inevitable"
    }
    // ... translate all other sections
  }
}
```

### Step 2: Update Language Switcher

Edit `website/js/language-switcher.js`:

**Line 15: Add language to `activeLangs` array**

```javascript
activeLangs: ['en', 'ru', 'es'], // Add 'es' here
```

**Line 23: Update language metadata (optional)**

```javascript
es: { name: 'Spanish', flag: '🇪🇸', status: 'active', availability: 'Q2 2025' },
```

### Step 3: Test the Language

1. Open the website in a browser
2. Click the language dropdown
3. Select the newly activated language
4. Verify all text is translated correctly
5. Check mobile responsiveness

---

## Translation Guidelines

### 1. Keep Consistency

- Use the same terminology throughout
- Maintain brand voice (professional, clear, minimal)
- Keep emoji usage consistent with English version

### 2. Cultural Adaptation

- Adapt currency symbols ($ vs € vs ¥)
- Adjust date formats (MM/DD/YYYY vs DD/MM/YYYY)
- Consider local regulations (legal disclaimers)

### 3. Technical Terms

**DO NOT translate:**
- Product names: "HypeAI", "HYPE token"
- Technical terms: "smart contract", "blockchain", "DeFi"
- Brand names: "Telegram", "Discord", "Twitter"

**DO translate:**
- UI elements: buttons, navigation, headers
- Marketing copy: descriptions, benefits, features
- User instructions: tooltips, help text, errors

### 4. Quality Checklist

- [ ] All keys translated (no English fallbacks)
- [ ] Grammar and spelling checked
- [ ] Technical accuracy verified
- [ ] Tested on actual website
- [ ] Mobile layout reviewed
- [ ] Updated `_meta` section

---

## Advanced Configuration

### Change Language Order in Dropdown

Edit `website/js/language-switcher.js`, line 14:

```javascript
supportedLangs: ['en', 'ru', 'zh', 'es', 'fr', 'de', 'ja', 'ko'],
// Reorder as needed, e.g., ['en', 'es', 'ru', ...]
```

### Add More Languages

1. Add new language to `supportedLangs` array
2. Add language info to `languageInfo` object:

```javascript
languageInfo: {
  // ... existing languages
  pt: { name: 'Portuguese', flag: '🇧🇷', status: 'coming', availability: 'Q4 2025' }
}
```

3. Create translation structure in `translations.json`
4. Follow activation steps above

### Update Coming Soon Dates

Edit `website/js/language-switcher.js`, lines 19-26:

```javascript
zh: { name: 'Chinese', flag: '🇨🇳', status: 'coming', availability: 'Q2 2025' },
```

Change `availability` field to reflect new timeline.

---

## Troubleshooting

### Language Not Appearing in Dropdown

**Issue:** New language doesn't show in dropdown

**Solution:**
- Check `supportedLangs` array includes language code
- Verify `languageInfo` object has entry for language
- Clear browser cache and reload

### Translations Not Loading

**Issue:** Language switches but text stays in English

**Solution:**
- Verify `translations.json` has valid JSON syntax
- Check browser console for errors
- Ensure translation keys match HTML `data-i18n` attributes

### Dropdown Not Closing

**Issue:** Dropdown stays open after selecting language

**Solution:**
- Check `closeDropdown()` function is called after `switchLanguage()`
- Verify click-outside listener is working
- Clear browser cache

### Mobile Layout Issues

**Issue:** Dropdown doesn't fit on mobile screens

**Solution:**
- Check CSS media queries in `language-switcher.css`
- Test on actual devices, not just browser DevTools
- Verify viewport meta tag in HTML

---

## API Reference

### LanguageManager Methods

#### `switchLanguage(lang)`

Switches to specified language.

```javascript
window.HypeAILanguage.switchLanguage('es');
```

#### `getCurrentLanguage()`

Returns current language code.

```javascript
const currentLang = window.HypeAILanguage.getCurrentLanguage();
// Returns: 'en', 'ru', 'es', etc.
```

#### `translate(key)`

Programmatically translates a key.

```javascript
const title = window.HypeAILanguage.translate('hero.title');
```

### Events

#### `languageChanged`

Fired when language is switched.

```javascript
window.addEventListener('languageChanged', (e) => {
  console.log('New language:', e.detail.lang);
});
```

---

## Design Specifications

### Colors

- **Primary Gradient:** `#8B5CF6` → `#6366F1` (Purple to Blue)
- **Accent Cyan:** `#00D4FF`
- **Text Primary:** `#FFFFFF`
- **Text Secondary:** `#A0AEC0`

### Animations

- **Transition Duration:** 0.3s
- **Easing:** `cubic-bezier(0.4, 0, 0.2, 1)`
- **Dropdown Fade-in:** `translateY(-10px)` → `translateY(0)`

### Breakpoints

- **Desktop:** > 1024px
- **Tablet:** 769px - 1024px
- **Mobile:** < 768px

---

## Performance Tips

1. **Lazy Loading:** Translations are loaded once on page load
2. **localStorage:** Selected language is cached locally
3. **No External Dependencies:** Pure vanilla JavaScript
4. **CSS Animations:** Hardware-accelerated transforms
5. **Small File Size:** Minified CSS < 10KB

---

## Accessibility Features

- **Keyboard Navigation:** Full keyboard support (Tab, Enter, Esc)
- **Focus Indicators:** Clear focus states for all interactive elements
- **Screen Readers:** Proper ARIA labels and roles
- **Reduced Motion:** Respects `prefers-reduced-motion` setting
- **High Contrast:** Enhanced borders for high contrast mode

---

## Roadmap

| Language | Status | Target Date | Progress |
|----------|--------|-------------|----------|
| 🇺🇸 English | ✅ Active | Q1 2025 | 100% |
| 🇷🇺 Russian | ✅ Active | Q1 2025 | 100% |
| 🇨🇳 Chinese | 📋 Planned | Q2 2025 | 0% |
| 🇪🇸 Spanish | 📋 Planned | Q2 2025 | 0% |
| 🇫🇷 French | 📋 Planned | Q3 2025 | 0% |
| 🇩🇪 German | 📋 Planned | Q3 2025 | 0% |
| 🇯🇵 Japanese | 📋 Planned | Q3 2025 | 0% |
| 🇰🇷 Korean | 📋 Planned | Q4 2025 | 0% |

---

## Support

For questions or issues:

1. Check console logs for errors
2. Verify JSON syntax in translations file
3. Test in different browsers
4. Contact BABEL agent (Translation Specialist)

---

**Built by:** BABEL - HypeAI Translation Specialist
**Last Updated:** October 17, 2025
**Version:** 1.0.0
