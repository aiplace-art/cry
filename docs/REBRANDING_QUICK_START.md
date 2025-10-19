# BNB Chain Rebranding - Quick Start Guide

## What Changed?

HypeAI Twitter visuals have been completely rebranded to BNB Chain style:
- Colors: BNB Gold (#F3BA2F) and Black (#000000)
- Style: Professional blockchain aesthetic
- Branding: "Built on BNB Chain" messaging

---

## Immediate Actions Needed

### 1. Update Twitter Profile (5 minutes)

**Upload New Assets:**
```bash
# Profile Picture (Avatar)
File: /Users/ai.place/Crypto/scripts/twitter-media/avatar-bnb.png
Size: 400x400px (110KB)
Action: Upload as Twitter profile picture

# Header Banner
File: /Users/ai.place/Crypto/scripts/twitter-media/banner-bnb.png
Size: 1500x500px (198KB)
Action: Upload as Twitter header banner
```

**Update Profile Settings:**
- Accent Color: #F3BA2F (BNB Gold)
- Theme: Dark mode recommended

---

### 2. Test the Auto-Poster (2 minutes)

The auto-poster now automatically uses BNB Chain styling:

```bash
# Navigate to project
cd /Users/ai.place/Crypto

# Test tweet generation
npm run tweet

# Or run auto-poster directly
node scripts/auto-poster.js
```

The generated images will automatically use:
- BNB Chain gold and black colors
- Hexagonal blockchain patterns
- "Built on BNB Chain" branding
- Professional tech aesthetic

---

### 3. Review Brand Guidelines (10 minutes)

**Full Documentation:**
```bash
# Read comprehensive brand guidelines
cat docs/TWITTER_BNB_VISUAL_STYLE.md

# Read full rebranding report
cat docs/BNB_CHAIN_REBRAND_REPORT.md
```

**Key Points:**
- Primary color: #F3BA2F (BNB Gold)
- Secondary color: #000000 (Black)
- Style: Professional, enterprise-grade
- Pattern: Hexagons and circuit lines
- Branding: Always include "Built on BNB Chain"

---

## File Locations

### Visual Assets
```
scripts/twitter-media/
├── avatar-bnb.png           # Profile picture (400x400)
├── banner-bnb.png           # Header banner (1500x500)
└── bnb-templates/           # Category templates (1200x675)
    ├── technical.png        # Tech/security posts
    ├── features.png         # Feature announcements
    ├── community.png        # Community updates
    ├── education.png        # Educational content
    ├── launch.png           # Launch announcements
    ├── engagement.png       # Polls, questions
    ├── viral.png            # Memes, viral content
    └── introduction.png     # Project intros
```

### Code & Scripts
```
scripts/
├── media-generator.js           # Updated with BNB colors
├── generate-bnb-templates.js    # Template generator
├── generate-bnb-profile.js      # Profile asset generator
└── auto-poster.js               # (No changes needed)
```

### Documentation
```
docs/
├── TWITTER_BNB_VISUAL_STYLE.md      # Brand guidelines (350+ lines)
├── BNB_CHAIN_REBRAND_REPORT.md      # Full report (500+ lines)
└── REBRANDING_QUICK_START.md        # This file
```

---

## How to Use Templates

### Manual Posting with Templates

If you want to manually create a post with BNB Chain style:

1. Choose appropriate template from `scripts/twitter-media/bnb-templates/`
2. Edit in image editor (Photoshop, Figma, Canva)
3. Add your text/content
4. Maintain BNB Chain colors (#F3BA2F, #000000)
5. Post to Twitter

### Automated Posting

The auto-poster automatically:
- Generates images in BNB Chain style
- Uses correct colors and patterns
- Adds "Built on BNB Chain" branding
- Applies category-appropriate gradients

No manual intervention needed!

---

## Regenerating Assets

If you need to regenerate templates or profile assets:

### Regenerate Category Templates
```bash
cd /Users/ai.place/Crypto
node scripts/generate-bnb-templates.js
```
Output: 8 PNG files in `scripts/twitter-media/bnb-templates/`

### Regenerate Profile Assets
```bash
cd /Users/ai.place/Crypto
node scripts/generate-bnb-profile.js
```
Output: `avatar-bnb.png` and `banner-bnb.png`

### Test Image Generator
```bash
cd /Users/ai.place/Crypto
node scripts/media-generator.js
```
Output: Test image in BNB Chain style

---

## Color Reference Card

Copy this for quick reference:

```css
/* PRIMARY COLORS */
BNB Gold:     #F3BA2F  (Main brand color)
Black:        #000000  (Secondary color)
White:        #FFFFFF  (Text on dark)

/* SUPPORTING COLORS */
Dark Gray:    #1E2329  (Backgrounds)
Deep Black:   #0B0E11  (Cards)
Light Gray:   #EAECEF  (Text)
Dark Gold:    #F0B90B  (Hover states)
Light Gold:   #FCD535  (Highlights)
```

---

## Quick Visual Check

### Before (Old HypeAI Style)
- Colors: Blue, Purple, Green
- Style: Colorful, cyber-punk
- Pattern: Circles
- Branding: Generic AI

### After (New BNB Chain Style)
- Colors: Gold, Black
- Style: Professional, enterprise
- Pattern: Hexagons
- Branding: "Built on BNB Chain"

---

## Troubleshooting

### "Old colors still showing"
- Clear cache: `rm scripts/twitter-media/tweet-*-generated.png`
- Regenerate: Run auto-poster again

### "Templates not found"
- Regenerate: `node scripts/generate-bnb-templates.js`

### "Profile assets missing"
- Regenerate: `node scripts/generate-bnb-profile.js`

### "Auto-poster not working"
- Check: Verify Twitter API credentials in `.env.marketing`
- Test: Run `node scripts/media-generator.js` first

---

## Support & Questions

**Documentation:**
- Brand Guidelines: `/Users/ai.place/Crypto/docs/TWITTER_BNB_VISUAL_STYLE.md`
- Full Report: `/Users/ai.place/Crypto/docs/BNB_CHAIN_REBRAND_REPORT.md`

**Need Help?**
- Check brand guidelines first
- Review examples in templates folder
- Reference official BNB Chain Twitter: @BNBCHAIN

---

## Success Checklist

Use this to verify everything is working:

- [ ] Profile picture updated to avatar-bnb.png
- [ ] Header banner updated to banner-bnb.png
- [ ] Profile accent color set to #F3BA2F
- [ ] Auto-poster generates BNB Chain styled images
- [ ] All tweets use gold and black colors
- [ ] "Built on BNB Chain" appears in images
- [ ] Brand guidelines reviewed
- [ ] Team briefed on new style

---

**Last Updated:** October 18, 2025
**Version:** 1.0 - BNB Chain Launch
**Status:** Ready for Production
