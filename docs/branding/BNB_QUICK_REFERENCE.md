# BNB Branding Quick Reference

## Color Cheat Sheet

```tsx
// Primary Actions
className="bg-gradient-to-r from-bnb-primary to-bnb-secondary"

// Cards
className="bg-bnb-dark border border-bnb-border"

// Inputs
className="bg-bnb-darker border border-bnb-border focus:border-bnb-primary"

// Text
className="text-bnb-text"           // Light text
className="text-bnb-textSecondary"   // Muted text
className="text-bnb-primary"         // Gold text

// Badges
className="bg-bnb-success/20 text-bnb-success border border-bnb-success/30"  // Success
className="bg-bnb-error/20 text-bnb-error border border-bnb-error/30"        // Error
className="bg-bnb-warning/20 text-bnb-warning border border-bnb-warning/30"  // Warning

// Hover States
className="hover:border-bnb-primary/50 hover:shadow-bnb-primary/10"
```

## Hex Values

| Class | Hex |
|-------|-----|
| `bnb-primary` | #F3BA2F |
| `bnb-secondary` | #FCD535 |
| `bnb-dark` | #1E2026 |
| `bnb-darker` | #14151A |
| `bnb-success` | #0ECB81 |
| `bnb-error` | #F6465D |
| `bnb-warning` | #F0B90B |
| `bnb-text` | #EAECEF |
| `bnb-textSecondary` | #848E9C |

## Common Patterns

### Button Types
```tsx
// Primary CTA
<button className="bg-gradient-to-r from-bnb-primary to-bnb-secondary text-bnb-darker hover:shadow-lg hover:shadow-bnb-primary/50 px-6 py-3 rounded-lg">
  Buy Now
</button>

// Secondary
<button className="bg-bnb-dark text-bnb-text border border-bnb-border hover:bg-bnb-dark/80 px-6 py-3 rounded-lg">
  Learn More
</button>

// Outline
<button className="bg-transparent text-bnb-primary border-2 border-bnb-primary hover:bg-bnb-primary/10 px-6 py-3 rounded-lg">
  Cancel
</button>
```

### Card Types
```tsx
// Default Card
<div className="bg-bnb-dark border border-bnb-border rounded-xl p-6">
  Content
</div>

// Gradient Card
<div className="bg-gradient-to-br from-bnb-dark to-bnb-darker border border-bnb-primary/20 rounded-xl p-6">
  Content
</div>

// Hoverable Card
<div className="bg-bnb-dark border border-bnb-border hover:border-bnb-primary/50 hover:shadow-lg hover:shadow-bnb-primary/10 rounded-xl p-6">
  Content
</div>
```

## Verification Command

```bash
# Check for non-BNB colors (should return 0)
grep -r "bg-blue\|bg-purple\|bg-indigo\|text-blue\|border-blue" components/ | wc -l
```

**Expected**: `0`
**Status**: ✅ Verified
