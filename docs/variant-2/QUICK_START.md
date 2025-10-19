# HypeAI Variant 2 - Quick Start Guide
## Get Building in 15 Minutes

**For:** Developers ready to start implementation
**Time to first page:** ~2 hours
**Time to complete site:** ~6 weeks

---

## Step 1: Create Directory Structure (2 minutes)

```bash
# Navigate to project root
cd /Users/ai.place/Crypto

# Ensure you're on the right branch
git checkout variant-2-website

# Create complete directory structure
mkdir -p public/variant-2/{css/pages,js/{core,components,features,utils,pages},assets/{images/{logo,branding,hero,agents,features,og,misc},icons,animations,fonts/{Inter,Poppins}},data,docs}

# Create placeholder HTML files
touch public/variant-2/{index,about,agents,analytics,api,audit,blog,cookies,docs,governance,privacy,proof,roadmap,stake,terms,trade,whitepaper}.html

# Verify structure
tree public/variant-2 -L 2
```

---

## Step 2: Create Design System (15 minutes)

Create `public/variant-2/css/bnb-theme.css`:

```css
/* Copy this minimal starter - full version in VARIANT_2_TECH_SPEC.md */

:root {
  /* BNB Colors */
  --bnb-gold: #F3BA2F;
  --bnb-gold-light: #FCD535;
  --bnb-dark: #14151A;
  --bnb-darker: #1E2026;
  --bnb-success: #0ECB81;
  --bnb-error: #F6465D;

  /* Typography */
  --font-primary: 'Inter', sans-serif;
  --font-display: 'Poppins', sans-serif;

  /* Spacing */
  --spacing-4: 1rem;
  --spacing-6: 1.5rem;
  --spacing-8: 2rem;

  /* Radius */
  --radius-md: 0.75rem;
  --radius-lg: 1rem;

  /* Effects */
  --glass-bg: rgba(30, 32, 38, 0.4);
  --glass-border: rgba(243, 186, 47, 0.2);
  --glow-gold: 0 0 40px rgba(243, 186, 47, 0.4);
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: var(--font-primary);
  background: var(--bnb-dark);
  color: #fff;
  line-height: 1.6;
}

.glass {
  background: var(--glass-bg);
  backdrop-filter: blur(24px);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-lg);
}

.btn-primary {
  padding: 12px 24px;
  background: linear-gradient(135deg, var(--bnb-gold) 0%, var(--bnb-gold-light) 100%);
  color: #000;
  font-weight: 700;
  border: none;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all 0.3s;
}

.btn-primary:hover {
  box-shadow: var(--glow-gold);
  transform: translateY(-2px);
}
```

---

## Step 3: Create First Page (30 minutes)

Create `public/variant-2/index.html`:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>HypeAI - AI Services on Binance Chain</title>

  <!-- Fonts -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Poppins:wght@600;700&display=swap" rel="stylesheet">

  <!-- Styles -->
  <link rel="stylesheet" href="css/bnb-theme.css">

  <style>
    /* Quick inline styles for header and hero */
    .header {
      position: fixed;
      top: 0;
      width: 100%;
      padding: 1rem 2rem;
      background: rgba(30, 32, 38, 0.6);
      backdrop-filter: blur(24px);
      display: flex;
      justify-content: space-between;
      align-items: center;
      z-index: 100;
    }

    .logo {
      font-size: 1.5rem;
      font-weight: 700;
      color: #F3BA2F;
      font-family: 'Poppins', sans-serif;
    }

    .hero {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      padding: 2rem;
      background: linear-gradient(135deg, #14151A 0%, #1E2026 100%);
    }

    .hero h1 {
      font-size: 3rem;
      font-family: 'Poppins', sans-serif;
      margin-bottom: 1rem;
    }

    .hero .gold {
      background: linear-gradient(135deg, #F3BA2F 0%, #FCD535 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .hero p {
      font-size: 1.25rem;
      color: #D1D5DB;
      max-width: 600px;
      margin-bottom: 2rem;
    }

    .cta-group {
      display: flex;
      gap: 1rem;
      flex-wrap: wrap;
      justify-content: center;
    }

    .stats {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 2rem;
      margin-top: 4rem;
      max-width: 800px;
    }

    .stat-value {
      font-size: 2.5rem;
      font-weight: 800;
      color: #F3BA2F;
      font-family: 'Poppins', sans-serif;
    }

    .stat-label {
      font-size: 0.875rem;
      color: #9CA3AF;
      text-transform: uppercase;
    }
  </style>
</head>
<body>
  <!-- Header -->
  <header class="header">
    <div class="logo">HypeAI</div>
    <button class="btn-primary">Connect Wallet</button>
  </header>

  <!-- Hero Section -->
  <section class="hero">
    <div style="background: rgba(243, 186, 47, 0.1); padding: 8px 16px; border-radius: 24px; border: 1px solid rgba(243, 186, 47, 0.3); color: #F3BA2F; font-size: 14px; margin-bottom: 2rem;">
      ⚡ Powered by Binance Smart Chain
    </div>

    <h1>
      AI-Powered Services on<br>
      <span class="gold">Binance Chain</span>
    </h1>

    <p>
      Professional AI services for everyone. Fast transactions, low fees, 27 AI agents working 24/7.
    </p>

    <div class="cta-group">
      <button class="btn-primary">Join Private Sale</button>
      <button class="btn-primary" style="background: transparent; border: 2px solid #F3BA2F; color: #F3BA2F;">
        Explore AI Agents
      </button>
    </div>

    <!-- Stats -->
    <div class="stats">
      <div>
        <div class="stat-value">$12.5M</div>
        <div class="stat-label">Total Value Locked</div>
      </div>
      <div>
        <div class="stat-value">15.4K</div>
        <div class="stat-label">Active Users</div>
      </div>
      <div>
        <div class="stat-value">2.8M</div>
        <div class="stat-label">Transactions</div>
      </div>
      <div>
        <div class="stat-value">27</div>
        <div class="stat-label">AI Agents</div>
      </div>
    </div>
  </section>

  <script>
    console.log('HypeAI Variant 2 - Loaded successfully! 🚀');
  </script>
</body>
</html>
```

---

## Step 4: Test Your First Page (2 minutes)

```bash
# Start a local server
cd public/variant-2
python3 -m http.server 8000

# Open in browser
# http://localhost:8000

# You should see:
# ✓ BNB gold colors
# ✓ Dark background
# ✓ Hero section with stats
# ✓ "Powered by BSC" badge
```

---

## Step 5: Add Components (Next Steps)

### Create Header Component

Create `public/variant-2/js/components/header.js`:

```javascript
class BNBHeader {
  constructor(element) {
    this.element = element;
    this.init();
  }

  init() {
    this.setupScrollEffect();
  }

  setupScrollEffect() {
    let lastScroll = 0;

    window.addEventListener('scroll', () => {
      const currentScroll = window.pageYOffset;

      if (currentScroll > lastScroll && currentScroll > 100) {
        // Scrolling down - hide header
        this.element.style.transform = 'translateY(-100%)';
      } else {
        // Scrolling up - show header
        this.element.style.transform = 'translateY(0)';
      }

      lastScroll = currentScroll;
    });
  }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  const header = document.querySelector('.header');
  if (header) {
    new BNBHeader(header);
  }
});
```

Add to your HTML:
```html
<script src="js/components/header.js"></script>
```

---

## Step 6: Add More Sections

### Features Grid

Add to `index.html` after hero:

```html
<section style="padding: 4rem 2rem; max-width: 1200px; margin: 0 auto;">
  <h2 style="text-align: center; font-size: 2.5rem; margin-bottom: 3rem; font-family: 'Poppins', sans-serif;">
    Why Choose <span class="gold">HypeAI</span>
  </h2>

  <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 2rem;">
    <!-- Feature Card 1 -->
    <div class="glass" style="padding: 2rem;">
      <div style="width: 64px; height: 64px; background: linear-gradient(135deg, #F3BA2F 0%, #FCD535 100%); border-radius: 12px; display: flex; align-items: center; justify-content: center; margin-bottom: 1.5rem; box-shadow: 0 0 30px rgba(243, 186, 47, 0.4);">
        🤖
      </div>
      <h3 style="margin-bottom: 1rem; font-family: 'Poppins', sans-serif;">27 AI Agents</h3>
      <p style="color: #D1D5DB;">Specialized AI agents working 24/7 to analyze markets and optimize your portfolio.</p>
    </div>

    <!-- Feature Card 2 -->
    <div class="glass" style="padding: 2rem;">
      <div style="width: 64px; height: 64px; background: linear-gradient(135deg, #F3BA2F 0%, #FCD535 100%); border-radius: 12px; display: flex; align-items: center; justify-content: center; margin-bottom: 1.5rem; box-shadow: 0 0 30px rgba(243, 186, 47, 0.4);">
        ⚡
      </div>
      <h3 style="margin-bottom: 1rem; font-family: 'Poppins', sans-serif;">Lightning Fast</h3>
      <p style="color: #D1D5DB;">3-second block times on BSC for instant transactions and confirmations.</p>
    </div>

    <!-- Feature Card 3 -->
    <div class="glass" style="padding: 2rem;">
      <div style="width: 64px; height: 64px; background: linear-gradient(135deg, #F3BA2F 0%, #FCD535 100%); border-radius: 12px; display: flex; align-items: center; justify-content: center; margin-bottom: 1.5rem; box-shadow: 0 0 30px rgba(243, 186, 47, 0.4);">
        💰
      </div>
      <h3 style="margin-bottom: 1rem; font-family: 'Poppins', sans-serif;">Low Fees</h3>
      <p style="color: #D1D5DB;">Average transaction cost of just $0.10 on Binance Smart Chain.</p>
    </div>
  </div>
</section>
```

---

## Step 7: Next Steps

### Immediate Tasks (Today)

1. ✓ Create directory structure
2. ✓ Create `bnb-theme.css`
3. ✓ Create `index.html`
4. ✓ Test locally
5. [ ] Add more sections to homepage
6. [ ] Create logo SVG
7. [ ] Add footer

### This Week

1. [ ] Complete homepage (all 6 sections)
2. [ ] Create component CSS file
3. [ ] Add animations
4. [ ] Make fully responsive
5. [ ] Create About page
6. [ ] Create Agents page

### Full Roadmap

See [README.md](./README.md) for complete 6-week implementation plan.

---

## Common Issues & Solutions

### Issue: Fonts not loading

**Solution:**
```html
<!-- Add preconnect -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
```

### Issue: Glassmorphism not working

**Solution:**
```css
/* Make sure backdrop-filter has vendor prefix */
backdrop-filter: blur(24px);
-webkit-backdrop-filter: blur(24px);
```

### Issue: Colors look wrong

**Solution:**
```css
/* Double-check color values */
--bnb-gold: #F3BA2F;  /* Correct */
--bnb-gold: #F3BA2E;  /* Wrong - off by one! */
```

---

## Resources You'll Need

### Documentation
- [Complete Architecture](./VARIANT_2_ARCHITECTURE.md)
- [File Structure Guide](./VARIANT_2_FILE_STRUCTURE.md)
- [Branding Guidelines](./VARIANT_2_BNB_BRANDING.md)
- [Technical Spec](./VARIANT_2_TECH_SPEC.md)

### Code Examples
- Full HTML templates: See VARIANT_2_TECH_SPEC.md Section 2
- Complete CSS: See VARIANT_2_TECH_SPEC.md Section 3
- JavaScript modules: See VARIANT_2_TECH_SPEC.md Section 4

### External Resources
- [BNB Chain Docs](https://docs.bnbchain.org/)
- [Inter Font](https://fonts.google.com/specimen/Inter)
- [Poppins Font](https://fonts.google.com/specimen/Poppins)
- [Chart.js](https://www.chartjs.org/)

---

## Checklist for First Day

```
Setup:
[ ] Git branch created (variant-2-website)
[ ] Directory structure created
[ ] Local server running

Files Created:
[ ] css/bnb-theme.css (design system)
[ ] index.html (homepage)
[ ] js/components/header.js (header component)

Visual Check:
[ ] BNB gold (#F3BA2F) visible
[ ] Dark background (#14151A)
[ ] Glassmorphism working
[ ] Responsive on mobile
[ ] Fonts loading (Inter, Poppins)

Functionality:
[ ] Page loads in < 2 seconds
[ ] No console errors
[ ] Header scroll effect works
[ ] Buttons have hover states

Next:
[ ] Read complete architecture docs
[ ] Plan Week 1 tasks
[ ] Create more components
```

---

## Tips for Success

### 1. Start Simple
Don't try to build everything at once. Get one page perfect, then replicate.

### 2. Use the Design System
All colors, spacing, and typography are defined. Just use the CSS variables.

### 3. Component-First
Build reusable components. A button you make today will be used 100 times.

### 4. Test on Mobile
Open Chrome DevTools, toggle device toolbar, test on different sizes.

### 5. Follow the Docs
Everything you need is in the 4 documentation files. Reference them often.

### 6. Version Control
Commit early, commit often. Each component = one commit.

```bash
git add public/variant-2/css/bnb-theme.css
git commit -m "feat(design): add BNB design system CSS"

git add public/variant-2/index.html
git commit -m "feat(homepage): create initial homepage with hero"
```

---

## Get Help

**Stuck?** Check these in order:

1. **README.md** - Overview and roadmap
2. **VARIANT_2_ARCHITECTURE.md** - Design system and components
3. **VARIANT_2_TECH_SPEC.md** - Code examples
4. **VARIANT_2_BNB_BRANDING.md** - Colors and branding

**Still stuck?**
- Check browser console for errors
- Validate HTML: https://validator.w3.org/
- Check CSS: Look for typos in color values
- Simplify: Remove complexity until it works

---

## Success!

If you've followed this guide, you should have:

✓ Complete directory structure
✓ Design system CSS
✓ Working homepage with hero
✓ BNB gold branding
✓ Local development server

**Next:** Continue with Week 1 tasks from the implementation roadmap!

---

**Time Invested:** ~15 minutes setup + 2 hours first page
**Progress:** Foundation complete, ready for Week 1
**Files Created:** 3-5 core files
**Lines of Code:** ~200 CSS + ~100 HTML + ~30 JS

**You're ready to build!** 🚀
