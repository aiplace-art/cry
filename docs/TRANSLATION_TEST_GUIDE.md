# Russian Translation - Quick Test Guide

## How to Test

### 1. Open the Website
Navigate to: `/public/variant-2/index.html`

### 2. Initial State
- Language button shows: **EN 🌐**
- All content is in English
- Check localStorage: `localStorage.getItem('hypeai_language')` → should be `null` or `'en'`

### 3. Switch to Russian
**Steps:**
1. Click the language button (**EN 🌐**) in header
2. Dropdown appears with:
   - English ✓ (active, has checkmark)
   - Русский
3. Click **Русский**
4. Dropdown closes
5. Button now shows: **RU 🌐**

**Expected Results:**
- ✅ ALL text changes to Russian instantly
- ✅ Layout remains intact (no overflow)
- ✅ Buttons stay properly sized
- ✅ Navigation links: "Услуги", "AI Агенты", "Токеномика", "Дорожная карта"
- ✅ Hero title: "Где AI встречает Возможности"
- ✅ All service names translated
- ✅ Footer completely in Russian

### 4. Verify Persistence
1. Refresh the page (F5 or Cmd+R)
2. Page should load in Russian automatically
3. Language button shows: **RU 🌐**
4. Check localStorage: `localStorage.getItem('hypeai_language')` → `'ru'`

### 5. Switch Back to English
1. Click **RU 🌐** button
2. Select **English** from dropdown
3. All text switches back to English
4. Refresh → page loads in English

## Visual Verification Checklist

### Header
- [ ] Logo "HypeAI" remains unchanged
- [ ] "27 AI агентов онлайн" (Russian) / "27 AI Agents Online" (English)
- [ ] Nav: Услуги, AI Агенты, Токеномика, Дорожная карта
- [ ] Button text translates

### Hero Section
- [ ] Title: "Где AI встречает Возможности"
- [ ] Description fully translated
- [ ] Button: "Смотреть AI агентов →" and "Узнать больше"
- [ ] Stats labels:
  - "AI агентов активно"
  - "Активных пользователей"
  - "Услуг"
  - "Максимум APY"
  - "Точность AI"

### Services Section
- [ ] "8 категорий услуг - 35+ специализированных услуг"
- [ ] "Безопасность и аудит"
- [ ] "Дизайн токеномики"
- [ ] "Разработка смарт-контрактов"
- [ ] All 8 categories translated
- [ ] Feature lists translated

### AI Agents Section
- [ ] "Познакомьтесь с нашей AI командой"
- [ ] Agent roles translated:
  - "Аудитор безопасности"
  - "Дизайнер токеномики"
  - "Solidity разработчик"
  - etc.

### Tokenomics Section
- [ ] "Честное распределение для устойчивого роста"
- [ ] Distribution items:
  - "Публичная продажа (40%)"
  - "Награды за стейкинг (25%)"
  - "Команда (15% - вестинг 18 мес)"
  - etc.

### Roadmap
- [ ] Q1: "Запуск ✅"
- [ ] Q2: "Рост 🔄"
- [ ] Q3: "Расширение 📅"
- [ ] Q4: "Экосистема 🚀"
- [ ] All milestone items translated

### Footer
- [ ] "Профессиональные AI услуги. Реальный доход. Реальные сжигания."
- [ ] All link categories translated
- [ ] Copyright: "© 2024 HypeAI. Все права защищены."

## Mobile Testing

### Responsive Breakpoints
1. **Desktop** (1440px+): Full navigation with language switcher
2. **Tablet** (768px-1439px): Compact navigation
3. **Mobile** (< 768px): Hamburger menu, language switcher centered

### Mobile Checks
- [ ] Language dropdown appears correctly
- [ ] No horizontal scroll
- [ ] Text doesn't overflow cards
- [ ] Buttons remain tappable
- [ ] Russian text wraps properly

## Browser Testing

Test in at least 2 browsers:
- [ ] Chrome/Edge
- [ ] Firefox
- [ ] Safari
- [ ] Mobile Safari (iOS)
- [ ] Chrome Mobile (Android)

## Common Issues & Solutions

### Issue: Text Overflows
**Solution:** Russian text is longer. Check CSS:
```css
.lang-ru .some-element {
  font-size: 95%;
}
```

### Issue: Language Doesn't Switch
**Solution:** Check browser console for errors:
```javascript
window.i18n.translate('test_key')
```

### Issue: Dropdown Doesn't Close
**Solution:** Click outside dropdown or press Escape

### Issue: Language Not Persisting
**Solution:** Check if localStorage is enabled:
```javascript
localStorage.setItem('test', '1')
localStorage.getItem('test') // Should return '1'
```

## Performance Check

Open browser DevTools → Console:

```javascript
// Check translation system loaded
console.log(window.i18n); // Should show I18n object

// Check current language
console.log(window.i18n.currentLang); // 'en' or 'ru'

// Check translation count
console.log(Object.keys(translations.en).length); // 175+
console.log(Object.keys(translations.ru).length); // 175+

// Test translation function
console.log(window.i18n.translate('hero_title_1')); // Returns translation
```

## Expected Performance
- Language switch: < 10ms
- No layout shift
- No flash of untranslated content (FOUC)
- Smooth dropdown animation

## Screenshot Comparison

### Before & After
Take screenshots of these sections in both languages:

1. **Full Homepage** - EN vs RU
2. **Services Section** - EN vs RU
3. **AI Agents Grid** - EN vs RU
4. **Footer** - EN vs RU

Compare:
- Text fits properly
- Alignment consistent
- Colors/styling identical
- Images not affected

## Sign-Off Checklist

Before marking as complete:
- [ ] All sections translate correctly
- [ ] No console errors
- [ ] Language persists after refresh
- [ ] Mobile layout works
- [ ] No layout breaking
- [ ] Both languages tested in 2+ browsers
- [ ] Screenshots taken for documentation

## Success Criteria

✅ **PASS** if:
- All visible text translates (except "HypeAI" logo)
- Layout remains intact
- Language preference saves
- Switching is instant and smooth
- No errors in console
- Works on mobile

❌ **FAIL** if:
- Any section doesn't translate
- Layout breaks in Russian
- Language doesn't persist
- Console shows errors
- Mobile view broken

---

**Tester:** _______________
**Date:** _______________
**Result:** ✅ PASS / ❌ FAIL
**Notes:** _______________________________________________
