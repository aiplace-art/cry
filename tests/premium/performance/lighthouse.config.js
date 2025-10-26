/**
 * Lighthouse CI Configuration
 * Performance, accessibility, and best practices auditing
 */

module.exports = {
  ci: {
    collect: {
      url: [
        'http://localhost:3000/variant-2/index.html',
        'http://localhost:3000/variant-2/services.html',
        'http://localhost:3000/variant-2/privacy.html',
      ],
      numberOfRuns: 3,
      settings: {
        preset: 'desktop',
        onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
        skipAudits: ['uses-http2', 'redirects-http'],
      },
    },
    assert: {
      assertions: {
        'categories:performance': ['error', { minScore: 0.9 }],
        'categories:accessibility': ['error', { minScore: 0.95 }],
        'categories:best-practices': ['error', { minScore: 0.9 }],
        'categories:seo': ['error', { minScore: 0.9 }],

        // Performance metrics
        'first-contentful-paint': ['warn', { maxNumericValue: 2000 }],
        'largest-contentful-paint': ['error', { maxNumericValue: 3000 }],
        'cumulative-layout-shift': ['error', { maxNumericValue: 0.1 }],
        'total-blocking-time': ['warn', { maxNumericValue: 300 }],
        'speed-index': ['warn', { maxNumericValue: 4000 }],

        // Accessibility
        'color-contrast': 'error',
        'heading-order': 'error',
        'html-has-lang': 'error',
        'meta-viewport': 'error',
        'aria-allowed-attr': 'error',
        'aria-required-attr': 'error',
        'aria-valid-attr': 'error',
        'button-name': 'error',
        'document-title': 'error',
        'duplicate-id': 'error',
        'image-alt': 'error',
        'label': 'error',
        'link-name': 'error',
        'tabindex': 'error',

        // Best practices
        'errors-in-console': 'warn',
        'is-on-https': 'off', // Not applicable for localhost
        'no-vulnerable-libraries': 'error',
        'uses-passive-event-listeners': 'warn',

        // SEO
        'meta-description': 'error',
        'robots-txt': 'off',
        'canonical': 'warn',
      },
    },
    upload: {
      target: 'temporary-public-storage',
    },
  },
};
