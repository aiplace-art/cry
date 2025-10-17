#!/usr/bin/env node

/**
 * Link Validation Script for HypeAI Website
 * Validates all internal and external links across all HTML pages
 */

const fs = require('fs').promises;
const path = require('path');
const { JSDOM } = require('jsdom');

const PAGES = [
  'index.html',
  'about.html',
  'agents.html',
  'agents-activity.html',
  'analytics.html',
  'api.html',
  'audit.html',
  'blog.html',
  'docs.html',
  'governance.html',
  'proof.html',
  'roadmap.html',
  'stake.html',
  'trade.html',
  'trade-enhanced.html',
  'whitepaper.html'
];

const results = {
  totalLinks: 0,
  internalLinks: 0,
  externalLinks: 0,
  brokenLinks: [],
  missingTargetBlank: [],
  missingNoopener: [],
  validLinks: 0
};

async function validatePage(pagePath) {
  const fullPath = path.join(process.cwd(), pagePath);

  try {
    const html = await fs.readFile(fullPath, 'utf-8');
    const dom = new JSDOM(html);
    const document = dom.window.document;

    const links = document.querySelectorAll('a[href]');

    for (const link of links) {
      const href = link.getAttribute('href');
      const target = link.getAttribute('target');
      const rel = link.getAttribute('rel');

      results.totalLinks++;

      // Skip hash links, mailto, tel
      if (href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) {
        results.validLinks++;
        continue;
      }

      // Check if external
      const isExternal = href.startsWith('http://') || href.startsWith('https://');

      if (isExternal) {
        results.externalLinks++;

        // Check for target="_blank"
        if (target !== '_blank') {
          results.missingTargetBlank.push({
            page: pagePath,
            link: href,
            text: link.textContent.trim()
          });
        }

        // Check for rel="noopener noreferrer"
        if (target === '_blank' && (!rel || !rel.includes('noopener'))) {
          results.missingNoopener.push({
            page: pagePath,
            link: href,
            text: link.textContent.trim()
          });
        }

        results.validLinks++;
      } else {
        results.internalLinks++;

        // Check if internal file exists
        const internalPath = path.join(process.cwd(), href.split('#')[0]);

        try {
          await fs.access(internalPath);
          results.validLinks++;
        } catch {
          results.brokenLinks.push({
            page: pagePath,
            link: href,
            text: link.textContent.trim()
          });
        }
      }
    }

  } catch (error) {
    console.error(`Error processing ${pagePath}:`, error.message);
  }
}

async function runValidation() {
  console.log('🔗 Link Validation Report\n');
  console.log('=' .repeat(60));

  for (const page of PAGES) {
    await validatePage(page);
  }

  console.log(`\nTotal Links: ${results.totalLinks}`);
  console.log(`Internal Links: ${results.internalLinks}`);
  console.log(`External Links: ${results.externalLinks}`);
  console.log(`Valid Links: ${results.validLinks}`);
  console.log(`\n` + '='.repeat(60));

  if (results.brokenLinks.length > 0) {
    console.log(`\n❌ BROKEN LINKS (${results.brokenLinks.length}):`);
    results.brokenLinks.forEach(item => {
      console.log(`  ${item.page}: ${item.link} ("${item.text}")`);
    });
  } else {
    console.log(`\n✅ No broken links found`);
  }

  if (results.missingTargetBlank.length > 0) {
    console.log(`\n⚠️  EXTERNAL LINKS WITHOUT target="_blank" (${results.missingTargetBlank.length}):`);
    results.missingTargetBlank.forEach(item => {
      console.log(`  ${item.page}: ${item.link}`);
    });
  }

  if (results.missingNoopener.length > 0) {
    console.log(`\n⚠️  EXTERNAL LINKS WITHOUT rel="noopener" (${results.missingNoopener.length}):`);
    results.missingNoopener.forEach(item => {
      console.log(`  ${item.page}: ${item.link}`);
    });
  }

  // Save report
  const reportPath = path.join(__dirname, '../docs/QA_LINK_VALIDATION.json');
  await fs.writeFile(reportPath, JSON.stringify(results, null, 2));
  console.log(`\n📄 Report saved to: ${reportPath}`);

  // Exit code
  const hasIssues = results.brokenLinks.length > 0;
  process.exit(hasIssues ? 1 : 0);
}

runValidation().catch(console.error);
