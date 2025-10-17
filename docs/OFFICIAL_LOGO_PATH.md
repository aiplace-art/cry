# 🎨 OFFICIAL HYPEAI LOGO - MANDATORY USAGE RULES

**Created**: October 17, 2025
**Status**: OFFICIAL STANDARD - MUST FOLLOW
**Applies to**: ALL AI agents, scripts, and automated systems

---

## 📍 OFFICIAL LOGO LOCATION

**SINGLE SOURCE OF TRUTH:**

```
/Users/ai.place/Crypto/website/logo-icon-only.svg
```

**This is the ONLY logo that should be used for:**
- ✅ Twitter post images
- ✅ Social media graphics
- ✅ Marketing materials
- ✅ AI-generated content
- ✅ Automated posting systems
- ✅ Dashboard displays

---

## 🚫 DO NOT USE

❌ **NEVER use these files** (they are outdated or for specific purposes):
- `website/branding/logos/twitter/hypeai-logo-1024.png` - OLD
- `website/branding/logos/twitter/hypeai-logo-2048.png` - OLD
- Any other logo files unless explicitly approved

---

## 📏 LOGO SPECIFICATIONS

**From Website (Official Source):**
- **File**: `logo-icon-only.svg`
- **Location**: Website root directory
- **Size**: 70x70px on website header
- **Style**: Spinning animation + glow effect
- **Colors**: Should match brand gradient (Blue #00D4FF → Purple #9D4EDD)

---

## 🤖 FOR AI SYSTEMS & SCRIPTS

**All automated systems MUST:**

1. **Load logo from official path:**
   ```javascript
   const OFFICIAL_LOGO = './website/logo-icon-only.svg';
   ```

2. **For Twitter media generation:**
   ```javascript
   // In media-generator.js
   const logo = await loadImage('./website/logo-icon-only.svg');
   ```

3. **Size on Twitter images:**
   - Minimum: 150x150px
   - Recommended: 200x200px
   - Maximum: 300x300px

4. **Position on Twitter images:**
   - Top-left corner: 50px from edges
   - Or centered if it's a logo-focused post

---

## 📋 CHECKLIST FOR NEW FEATURES

Before deploying ANY feature that uses the logo:

- [ ] Uses `website/logo-icon-only.svg`
- [ ] NOT using files from `website/branding/logos/twitter/`
- [ ] Logo size is appropriate (150-300px)
- [ ] Logo has proper spacing (minimum 50px clear space)
- [ ] Logo is visible on all background colors
- [ ] Drop shadow or glow applied if needed

---

## 🔄 UPDATE PROTOCOL

**If logo needs to be updated:**

1. Replace ONLY this file: `website/logo-icon-only.svg`
2. All systems will automatically use the new logo
3. NO need to update scripts or code
4. Test in one Twitter post before mass publishing

---

## 🛠️ CURRENT IMPLEMENTATION

**Files that use this logo:**
- `scripts/media-generator.js` - Twitter image generation
- `products/hypeai-dashboard/index.html` - Dashboard header
- `website/index.html` - Main website header

**All scripts MUST be updated to use:**
```javascript
const OFFICIAL_LOGO_PATH = './website/logo-icon-only.svg';
```

---

## ⚠️ ENFORCEMENT

**This is MANDATORY for ALL AI agents and systems.**

If you see a script using a different logo path:
1. Stop execution
2. Update to use official path
3. Report the violation
4. Re-test before publishing

---

## 📞 QUESTIONS?

If you're unsure which logo to use:
- **Answer**: ALWAYS use `website/logo-icon-only.svg`
- **No exceptions**
- **No special cases**

---

**Last Updated**: October 17, 2025
**Next Review**: When logo is updated by user

🎨 **HypeAI - Where Hype Meets Intelligence**
