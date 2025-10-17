# Language Switcher Design System

## Overview
Professional, elegant language switcher for HypeAI with glass-morphism design and purple/blue gradient theme.

## Design Principles

### Visual Language
- **Minimalism**: Clean, uncluttered interface
- **Elegance**: Subtle animations and transitions
- **Professional**: Enterprise-level quality
- **No Pomposity**: Refined without being flashy

### Color System
```css
Primary Colors:
  Purple: #8B5CF6
  Blue: #6366F1
  Cyan Accent: #00D4FF

Backgrounds:
  Dark: #0F172A
  Surface: #1E293B

Text:
  Primary: #FFFFFF
  Secondary: #A0AEC0
  Disabled: rgba(160, 174, 192, 0.4)
```

## Component Anatomy

### Button Structure
```
┌──────────────────────────────────┐
│  [Flag] [Language Name]  [Arrow] │
│   🇺🇸      English         ▼     │
└──────────────────────────────────┘
```

### Dropdown Structure
```
┌──────────────────────────────────┐
│  🇺🇸 English               ✓     │ ← Active (cyan)
│  🇷🇺 Русский                     │ ← Available
│  🇨🇳 中文            Q2 2025      │ ← Coming Soon
│  🇪🇸 Español         Q2 2025      │
│  🇩🇪 Deutsch         Q2 2025      │
│  🇫🇷 Français        Q2 2025      │
│  🇯🇵 日本語          Q2 2025      │
│  🇰🇷 한국어          Q2 2025      │
└──────────────────────────────────┘
```

## Interactive States

### Button States
1. **Default**: Purple gradient with subtle glow
2. **Hover**: Enhanced glow, slight lift (translateY -1px)
3. **Active**: Pressed effect (translateY 0)
4. **Open**: Stronger gradient, cyan arrow
5. **Focus**: Cyan outline (accessibility)

### Dropdown Item States
1. **Default**: Transparent background
2. **Hover**: Purple gradient, slide right (2px)
3. **Active**: Cyan gradient, checkmark
4. **Disabled**: 50% opacity, no interaction

## Animation Specifications

### Transitions
- **Smooth**: 0.3s cubic-bezier(0.4, 0, 0.2, 1)
- **Fast**: 0.2s ease-out
- **Spring**: 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)

### Dropdown Animation
- Fade-in: opacity 0 → 1
- Slide-down: translateY -8px → 0
- Stagger items: 0.05s delay between each

### Hover Effects
- Box-shadow expansion
- Subtle transform
- Color transitions

## Responsive Breakpoints

```css
Desktop (1440px+):  200px width, 18px padding
Desktop (1024px):   180px width, 16px padding
Tablet (768px):     160px width, 14px padding
Mobile (<768px):    100% width, centered
```

## Accessibility Features

### ARIA Implementation
```html
<button aria-label="Select language" aria-expanded="false">
```

### Keyboard Navigation
- Tab: Focus button
- Enter/Space: Toggle dropdown
- Arrow keys: Navigate options
- Esc: Close dropdown

### Screen Reader Support
- Descriptive labels
- State announcements
- Disabled state communication

### Visual Accessibility
- High contrast mode support
- Reduced motion support
- Focus indicators (cyan outline)

## Glass-Morphism Effect

### Technique
```css
background: linear-gradient(135deg,
  rgba(139, 92, 246, 0.1) 0%,
  rgba(99, 102, 241, 0.1) 100%
);
backdrop-filter: blur(12px);
border: 1px solid rgba(255, 255, 255, 0.1);
```

### Glow Effects
```css
Default: 0 4px 20px rgba(139, 92, 246, 0.15)
Hover:   0 8px 32px rgba(99, 102, 241, 0.3)
Active:  0 0 0 8px rgba(0, 212, 255, 0.25) (pulse)
```

## Typography

### Font Stack
```css
font-family: 'Inter', -apple-system, BlinkMacSystemFont,
             'Segoe UI', system-ui, sans-serif;
```

### Sizes
- Button text: 14px, medium (500)
- Dropdown items: 14px, medium (500)
- Coming soon: 11px, light (400), italic
- Arrow: 10px

## Implementation Guide

### Step 1: Add CSS
```html
<link rel="stylesheet" href="css/language-switcher.css">
```

### Step 2: Add HTML Structure
See `language-switcher-example.html` for full markup

### Step 3: Add JavaScript
```javascript
// Toggle dropdown
langButton.addEventListener('click', toggleDropdown);

// Close on outside click
document.addEventListener('click', handleOutsideClick);

// Language selection
langOptions.forEach(option => {
  option.addEventListener('click', selectLanguage);
});
```

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

### Progressive Enhancement
- Backdrop-filter: fallback to solid background
- Animations: disabled in reduced-motion mode
- Grid layout: fallback to flexbox

## Performance Considerations

### CSS Optimizations
- Hardware-accelerated transforms
- Will-change hints for animated properties
- Efficient selectors (no deep nesting)

### JavaScript Best Practices
- Event delegation where possible
- Debounced resize handlers
- Minimal DOM queries

## Design Inspiration

**Reference Sites:**
- Vercel: Clean, minimal language selector
- Linear: Smooth animations, professional feel
- Stripe: Glass-morphism effects, subtle gradients

## Future Enhancements

### Q2 2025 Languages
- 🇨🇳 Chinese (Simplified)
- 🇪🇸 Spanish
- 🇩🇪 German
- 🇫🇷 French
- 🇯🇵 Japanese
- 🇰🇷 Korean

### Potential Features
- Auto-detect user language
- Remember preference (localStorage)
- RTL support for Arabic/Hebrew
- Flag customization
- Search/filter for many languages

## Testing Checklist

- [ ] Visual regression tests
- [ ] Cross-browser testing
- [ ] Mobile device testing
- [ ] Accessibility audit (WCAG 2.1 AA)
- [ ] Keyboard navigation
- [ ] Screen reader testing
- [ ] Performance benchmarks
- [ ] Print preview

## Maintenance Notes

### CSS Variables
All colors use CSS custom properties for easy theming

### Modular Structure
Component is self-contained, no external dependencies

### Documentation
Keep this file updated with design changes

---

**Design Status**: ✅ Complete
**Created**: 2025-10-17
**Designer**: PIXEL (Chief Design Officer)
**Version**: 1.0.0
