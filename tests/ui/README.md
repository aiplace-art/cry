# UI Test Files

This directory contains HTML test files for UI development and testing.

## Purpose

These files are **not** part of the production build. They are used for:
- Testing individual UI components in isolation
- Visual regression testing
- Developer testing during feature development
- Integration testing of new features

## Files

All `test-*.html` files in this directory are test fixtures. They should never be deployed to production.

## Usage

### Running Tests Locally

```bash
# Open any test file directly in browser
open tests/ui/test-mobile.html

# Or serve with local server
cd tests/ui
python3 -m http.server 8000
# Visit http://localhost:8000/test-mobile.html
```

### Test Categories

- **Component Tests**: `test-*-component.html` - Test individual components
- **Integration Tests**: `test-*-integrated.html` - Test feature integration
- **Visual Tests**: `test-*-visual.html` - Test visual appearance
- **Mobile Tests**: `test-mobile-*.html` - Test mobile responsiveness

## DO NOT

- ❌ Reference these files from production code
- ❌ Deploy these files to production server
- ❌ Include these files in build artifacts
- ❌ Link to these files from public pages

## Production Safety

The deployment pipeline should automatically exclude this directory:

```json
{
  "exclude": [
    "tests/**",
    "**/test-*.html"
  ]
}
```

## CI/CD Integration

These test files can be used in automated testing:

```yaml
# .github/workflows/test.yml
- name: Run UI tests
  run: |
    npm run test:ui
    # Runs tests against files in tests/ui/
```

## Maintenance

- Keep test files up to date with latest UI changes
- Remove obsolete test files
- Document what each test file is testing
- Use consistent naming convention: `test-{feature}-{type}.html`
