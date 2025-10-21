# HypeAI UI Components

Reusable, GDPR-compliant UI components for HypeAI website.

## Available Components

### 1. Legal Consent Checkbox (`consent-checkbox.html`)

**Purpose**: GDPR + CCPA compliant consent form for registration/purchase flows.

**Features**:
- ✅ Required consent for Terms of Service & Privacy Policy
- ✅ Age verification (18+ required)
- ✅ Optional marketing consent (GDPR compliant)
- ✅ Optional analytics consent
- ✅ Mobile-responsive design
- ✅ Accessible (WCAG 2.1 AA compliant)
- ✅ Form validation with error states

**Usage**:

```html
<!-- Include the component HTML -->
<div class="legal-consent">
  <!-- Consent checkboxes here -->
</div>
```

**Integration Example**:

```html
<form id="signup-form">
  <input type="email" name="email" required>
  <input type="password" name="password" required>

  <!-- Include consent checkboxes -->
  <div class="legal-consent">
    <label class="consent-checkbox required">
      <input type="checkbox" name="terms_accepted" required>
      <span>
        I agree to the
        <a href="legal/terms-of-service.html" target="_blank">Terms of Service</a>
        and
        <a href="legal/privacy-policy.html" target="_blank">Privacy Policy</a>
      </span>
    </label>

    <label class="consent-checkbox required">
      <input type="checkbox" name="age_verified" required>
      <span>I confirm I am 18 years or older</span>
    </label>

    <label class="consent-checkbox optional">
      <input type="checkbox" name="marketing_consent">
      <span>I agree to receive marketing emails (optional)</span>
    </label>
  </div>

  <button type="submit">Sign Up</button>
</form>
```

**Validation**:

```javascript
// Validate before form submission
form.addEventListener('submit', function(e) {
  const termsAccepted = document.querySelector('[name="terms_accepted"]').checked;
  const ageVerified = document.querySelector('[name="age_verified"]').checked;

  if (!termsAccepted || !ageVerified) {
    e.preventDefault();
    alert('Please accept the required terms to continue.');
  }
});
```

---

## Design Guidelines

All components follow HypeAI design system:

**Colors**:
- Primary: `#FFE900` (Brand Yellow)
- Accent: `#00E5FF` (Cosmic Blue)
- Background: `rgba(30, 32, 38, 0.4)`
- Text: `#E4E7EB`
- Links: `#00E5FF`
- Error: `#ff4444`

**Typography**:
- Font: Space Grotesk / Noto Sans
- Body: 14px
- Small: 13px

**Spacing**:
- Component padding: 20px (desktop), 16px (mobile)
- Item gap: 12-16px

---

## Legal Compliance

### GDPR Requirements
- ✅ Explicit consent required for data processing
- ✅ Clear privacy policy links
- ✅ Optional marketing consent (not pre-checked)
- ✅ Right to withdraw consent
- ✅ Data subject rights information

### CCPA Requirements
- ✅ "Do Not Sell" link in footer
- ✅ Privacy policy with CCPA section
- ✅ User data rights disclosure

### Age Verification
- ✅ 18+ age gate for services
- ✅ Clear checkbox for age confirmation

---

## Browser Support

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

---

## Accessibility

All components are WCAG 2.1 AA compliant:

- ✅ Keyboard navigation
- ✅ Screen reader support (ARIA labels)
- ✅ Focus indicators
- ✅ High contrast mode support
- ✅ Sufficient color contrast (4.5:1 minimum)

---

## Testing

**Manual Testing Checklist**:

1. ☐ All checkboxes are clickable
2. ☐ Required checkboxes show validation errors
3. ☐ Links open in new tabs
4. ☐ Mobile responsive (test on phone)
5. ☐ Keyboard navigation works
6. ☐ Screen reader announces labels correctly
7. ☐ Form submission validates properly

**Browser Testing**:
- ☐ Chrome/Edge
- ☐ Firefox
- ☐ Safari (Mac)
- ☐ Mobile Safari (iPhone)
- ☐ Chrome Mobile (Android)

---

## Future Components

Planned components for future releases:

- [ ] Payment method selector
- [ ] Token amount calculator
- [ ] Service package selector
- [ ] Contact form with validation
- [ ] Newsletter signup form
- [ ] Cookie preferences modal trigger
- [ ] Language selector dropdown
- [ ] Social share buttons
- [ ] Testimonial cards
- [ ] Service pricing cards

---

## Contributing

When creating new components:

1. Follow HypeAI design system
2. Ensure GDPR/CCPA compliance
3. Make it accessible (WCAG 2.1 AA)
4. Test on mobile devices
5. Document usage examples
6. Add to this README

---

## Support

For questions or issues:
- Email: dev@hypeai.io
- Discord: https://discord.gg/hypeai
- GitHub: https://github.com/hypeai/website
