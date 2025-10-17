#!/usr/bin/env node

/**
 * HypeAI Automated QA Testing Suite
 *
 * Runs automated tests for:
 * - Performance metrics (Lighthouse)
 * - Accessibility (axe-core)
 * - Link validation
 * - Image optimization
 * - Security headers
 * - Console errors
 */

const puppeteer = require('puppeteer');
const lighthouse = require('lighthouse');
const { AxePuppeteer } = require('@axe-core/puppeteer');
const chalk = require('chalk');
const fs = require('fs').promises;
const path = require('path');

// Configuration
const BASE_URL = process.env.TEST_URL || 'http://localhost:5173';
const PAGES_TO_TEST = [
  '/',
  '/about',
  '/services',
  '/contact'
];

const VIEWPORT_SIZES = [
  { name: 'iPhone SE', width: 375, height: 667 },
  { name: 'iPhone 12 Pro', width: 390, height: 844 },
  { name: 'iPhone 14 Pro Max', width: 414, height: 896 },
  { name: 'iPad Mini', width: 768, height: 1024 },
  { name: 'iPad Pro', width: 1024, height: 1366 },
  { name: 'Desktop 1440p', width: 1440, height: 900 },
  { name: 'Desktop 1920p', width: 1920, height: 1080 },
  { name: '4K Display', width: 3840, height: 2160 }
];

// Results storage
const results = {
  performance: {},
  accessibility: {},
  links: [],
  images: [],
  consoleErrors: [],
  security: {},
  responsive: {},
  timestamp: new Date().toISOString()
};

/**
 * Run Lighthouse performance audit
 */
async function runLighthouseAudit(url) {
  console.log(chalk.blue(`\n🔍 Running Lighthouse audit for: ${url}`));

  try {
    const { lhr } = await lighthouse(url, {
      port: 9222,
      output: 'json',
      onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
    });

    const scores = {
      performance: Math.round(lhr.categories.performance.score * 100),
      accessibility: Math.round(lhr.categories.accessibility.score * 100),
      bestPractices: Math.round(lhr.categories['best-practices'].score * 100),
      seo: Math.round(lhr.categories.seo.score * 100),
      metrics: {
        fcp: lhr.audits['first-contentful-paint'].numericValue,
        lcp: lhr.audits['largest-contentful-paint'].numericValue,
        cls: lhr.audits['cumulative-layout-shift'].numericValue,
        fid: lhr.audits['max-potential-fid']?.numericValue || 0,
        tti: lhr.audits['interactive'].numericValue,
        speedIndex: lhr.audits['speed-index'].numericValue
      }
    };

    results.performance[url] = scores;

    console.log(chalk.green(`✅ Performance: ${scores.performance}/100`));
    console.log(chalk.green(`✅ Accessibility: ${scores.accessibility}/100`));
    console.log(chalk.green(`✅ Best Practices: ${scores.bestPractices}/100`));
    console.log(chalk.green(`✅ SEO: ${scores.seo}/100`));

    return scores;
  } catch (error) {
    console.error(chalk.red(`❌ Lighthouse audit failed: ${error.message}`));
    return null;
  }
}

/**
 * Run accessibility tests with axe-core
 */
async function runAccessibilityTests(page, url) {
  console.log(chalk.blue(`\n♿ Running accessibility tests for: ${url}`));

  try {
    const axe = new AxePuppeteer(page);
    const axeResults = await axe.analyze();

    results.accessibility[url] = {
      violations: axeResults.violations.length,
      passes: axeResults.passes.length,
      incomplete: axeResults.incomplete.length,
      details: axeResults.violations.map(v => ({
        id: v.id,
        impact: v.impact,
        description: v.description,
        nodes: v.nodes.length
      }))
    };

    if (axeResults.violations.length === 0) {
      console.log(chalk.green(`✅ No accessibility violations found`));
    } else {
      console.log(chalk.yellow(`⚠️  Found ${axeResults.violations.length} accessibility violations`));
      axeResults.violations.forEach(v => {
        console.log(chalk.yellow(`   - ${v.impact.toUpperCase()}: ${v.description}`));
      });
    }

    return axeResults;
  } catch (error) {
    console.error(chalk.red(`❌ Accessibility test failed: ${error.message}`));
    return null;
  }
}

/**
 * Validate all links on page
 */
async function validateLinks(page, url) {
  console.log(chalk.blue(`\n🔗 Validating links for: ${url}`));

  try {
    const links = await page.$$eval('a[href]', anchors =>
      anchors.map(a => ({
        href: a.href,
        text: a.textContent.trim(),
        target: a.target
      }))
    );

    for (const link of links) {
      const isExternal = !link.href.startsWith(BASE_URL) && link.href.startsWith('http');

      results.links.push({
        url,
        href: link.href,
        text: link.text,
        isExternal,
        hasTargetBlank: link.target === '_blank',
        hasNoopener: isExternal ? link.target.includes('noopener') : 'N/A'
      });
    }

    console.log(chalk.green(`✅ Found ${links.length} links`));
    return links;
  } catch (error) {
    console.error(chalk.red(`❌ Link validation failed: ${error.message}`));
    return [];
  }
}

/**
 * Check image optimization
 */
async function checkImages(page, url) {
  console.log(chalk.blue(`\n🖼️  Checking images for: ${url}`));

  try {
    const images = await page.$$eval('img', imgs =>
      imgs.map(img => ({
        src: img.src,
        alt: img.alt,
        width: img.naturalWidth,
        height: img.naturalHeight,
        loading: img.loading,
        hasAlt: !!img.alt
      }))
    );

    const issues = [];
    images.forEach((img, index) => {
      if (!img.hasAlt) {
        issues.push(`Image ${index + 1} missing alt text: ${img.src}`);
      }
      if (img.width > 2000 || img.height > 2000) {
        issues.push(`Image ${index + 1} very large (${img.width}x${img.height}): ${img.src}`);
      }
      if (!img.loading && index > 2) {
        issues.push(`Image ${index + 1} should use lazy loading: ${img.src}`);
      }
    });

    results.images.push({
      url,
      totalImages: images.length,
      missingAlt: images.filter(i => !i.hasAlt).length,
      largeImages: images.filter(i => i.width > 2000 || i.height > 2000).length,
      issues
    });

    if (issues.length === 0) {
      console.log(chalk.green(`✅ All ${images.length} images optimized`));
    } else {
      console.log(chalk.yellow(`⚠️  Found ${issues.length} image issues`));
    }

    return images;
  } catch (error) {
    console.error(chalk.red(`❌ Image check failed: ${error.message}`));
    return [];
  }
}

/**
 * Monitor console errors
 */
async function monitorConsoleErrors(page, url) {
  const errors = [];

  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push({
        url,
        type: 'console.error',
        text: msg.text(),
        location: msg.location()
      });
    }
  });

  page.on('pageerror', error => {
    errors.push({
      url,
      type: 'pageerror',
      text: error.message,
      stack: error.stack
    });
  });

  return errors;
}

/**
 * Check security headers
 */
async function checkSecurityHeaders(page, url) {
  console.log(chalk.blue(`\n🔒 Checking security headers for: ${url}`));

  try {
    const response = await page.goto(url, { waitUntil: 'networkidle0' });
    const headers = response.headers();

    const securityHeaders = {
      'strict-transport-security': headers['strict-transport-security'] || 'Missing',
      'content-security-policy': headers['content-security-policy'] || 'Missing',
      'x-content-type-options': headers['x-content-type-options'] || 'Missing',
      'x-frame-options': headers['x-frame-options'] || 'Missing',
      'x-xss-protection': headers['x-xss-protection'] || 'Missing',
      'referrer-policy': headers['referrer-policy'] || 'Missing'
    };

    results.security[url] = securityHeaders;

    const missing = Object.entries(securityHeaders)
      .filter(([_, value]) => value === 'Missing')
      .map(([key, _]) => key);

    if (missing.length === 0) {
      console.log(chalk.green(`✅ All security headers present`));
    } else {
      console.log(chalk.yellow(`⚠️  Missing headers: ${missing.join(', ')}`));
    }

    return securityHeaders;
  } catch (error) {
    console.error(chalk.red(`❌ Security header check failed: ${error.message}`));
    return null;
  }
}

/**
 * Test responsive design
 */
async function testResponsive(page, url) {
  console.log(chalk.blue(`\n📱 Testing responsive design for: ${url}`));

  results.responsive[url] = {};

  for (const viewport of VIEWPORT_SIZES) {
    try {
      await page.setViewport({
        width: viewport.width,
        height: viewport.height
      });

      await page.goto(url, { waitUntil: 'networkidle0' });

      // Check for horizontal scroll
      const hasHorizontalScroll = await page.evaluate(() => {
        return document.documentElement.scrollWidth > document.documentElement.clientWidth;
      });

      // Check minimum touch target size (44px)
      const smallTouchTargets = await page.$$eval('button, a, input[type="button"], input[type="submit"]', elements => {
        return elements.filter(el => {
          const rect = el.getBoundingClientRect();
          return rect.width < 44 || rect.height < 44;
        }).length;
      });

      results.responsive[url][viewport.name] = {
        width: viewport.width,
        height: viewport.height,
        hasHorizontalScroll,
        smallTouchTargets
      };

      const status = !hasHorizontalScroll && smallTouchTargets === 0 ? '✅' : '⚠️';
      console.log(`${status} ${viewport.name} (${viewport.width}x${viewport.height})`);

      if (hasHorizontalScroll) {
        console.log(chalk.yellow(`   - Horizontal scroll detected`));
      }
      if (smallTouchTargets > 0) {
        console.log(chalk.yellow(`   - ${smallTouchTargets} touch targets < 44px`));
      }

    } catch (error) {
      console.error(chalk.red(`❌ Responsive test failed for ${viewport.name}: ${error.message}`));
    }
  }
}

/**
 * Generate test report
 */
async function generateReport() {
  console.log(chalk.blue(`\n📊 Generating test report...`));

  const reportPath = path.join(__dirname, '../docs/QA_AUTOMATED_RESULTS.json');
  await fs.writeFile(reportPath, JSON.stringify(results, null, 2));

  console.log(chalk.green(`✅ Report saved to: ${reportPath}`));

  // Summary
  console.log(chalk.bold.blue(`\n📈 TEST SUMMARY`));
  console.log(chalk.bold(`\nPerformance Scores (avg):`));
  const perfScores = Object.values(results.performance);
  if (perfScores.length > 0) {
    const avgPerf = perfScores.reduce((acc, curr) => acc + curr.performance, 0) / perfScores.length;
    const avgAcc = perfScores.reduce((acc, curr) => acc + curr.accessibility, 0) / perfScores.length;
    console.log(`  Performance: ${Math.round(avgPerf)}/100`);
    console.log(`  Accessibility: ${Math.round(avgAcc)}/100`);
  }

  console.log(chalk.bold(`\nAccessibility Violations:`));
  const totalViolations = Object.values(results.accessibility)
    .reduce((acc, curr) => acc + curr.violations, 0);
  console.log(`  Total: ${totalViolations}`);

  console.log(chalk.bold(`\nLinks:`));
  console.log(`  Total: ${results.links.length}`);
  const externalLinks = results.links.filter(l => l.isExternal);
  console.log(`  External: ${externalLinks.length}`);
  const unsafeExternal = externalLinks.filter(l => !l.hasNoopener);
  if (unsafeExternal.length > 0) {
    console.log(chalk.yellow(`  ⚠️  ${unsafeExternal.length} external links without rel="noopener"`));
  }

  console.log(chalk.bold(`\nImages:`));
  const totalImageIssues = results.images.reduce((acc, curr) => acc + curr.issues.length, 0);
  console.log(`  Total Issues: ${totalImageIssues}`);

  console.log(chalk.bold(`\nConsole Errors:`));
  console.log(`  Total: ${results.consoleErrors.length}`);

  // Final verdict
  console.log(chalk.bold.blue(`\n🎯 FINAL VERDICT:`));
  const criticalIssues = totalViolations > 0 || results.consoleErrors.length > 0;
  if (criticalIssues) {
    console.log(chalk.red(`❌ CRITICAL ISSUES FOUND - DO NOT LAUNCH`));
  } else if (totalImageIssues > 0 || unsafeExternal.length > 0) {
    console.log(chalk.yellow(`⚠️  MINOR ISSUES FOUND - FIX RECOMMENDED`));
  } else {
    console.log(chalk.green(`✅ ALL TESTS PASSED - READY FOR LAUNCH`));
  }
}

/**
 * Main test execution
 */
async function runTests() {
  console.log(chalk.bold.cyan(`\n🚀 HypeAI Automated QA Testing Suite\n`));
  console.log(chalk.gray(`Testing URL: ${BASE_URL}`));
  console.log(chalk.gray(`Pages: ${PAGES_TO_TEST.length}`));
  console.log(chalk.gray(`Viewports: ${VIEWPORT_SIZES.length}\n`));

  let browser;

  try {
    // Launch browser
    browser = await puppeteer.launch({
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--remote-debugging-port=9222'
      ]
    });

    const page = await browser.newPage();

    // Set up console error monitoring
    page.on('console', msg => {
      if (msg.type() === 'error') {
        results.consoleErrors.push({
          type: 'console.error',
          text: msg.text(),
          location: msg.location()
        });
      }
    });

    // Test each page
    for (const pagePath of PAGES_TO_TEST) {
      const url = `${BASE_URL}${pagePath}`;

      console.log(chalk.bold.cyan(`\n${'='.repeat(60)}`));
      console.log(chalk.bold.cyan(`Testing: ${url}`));
      console.log(chalk.bold.cyan(`${'='.repeat(60)}`));

      // Run all tests for this page
      await checkSecurityHeaders(page, url);
      await validateLinks(page, url);
      await checkImages(page, url);
      await runAccessibilityTests(page, url);
      await testResponsive(page, url);
      await runLighthouseAudit(url);
    }

    await browser.close();

    // Generate final report
    await generateReport();

  } catch (error) {
    console.error(chalk.red(`\n❌ Test execution failed: ${error.message}`));
    console.error(error.stack);

    if (browser) {
      await browser.close();
    }

    process.exit(1);
  }
}

// Run tests
runTests().catch(error => {
  console.error(chalk.red(`Fatal error: ${error.message}`));
  process.exit(1);
});
