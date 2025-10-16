#!/usr/bin/env node

/**
 * HypeAI Brand Compliance Checker
 *
 * Automated tool to verify Twitter content meets brand guidelines
 * Usage: node scripts/brand-checker.js "your tweet text here"
 */

const BRAND_RULES = {
  // Correct brand terminology
  correctName: "HypeAI",
  correctSymbol: "$HYPEAI",
  incorrectNames: ["HypedAI", "HyperAI", "Hype AI", "hypeai", "HYPE AI"],
  incorrectSymbols: ["$HypeAI", "$hypeai", "$HYPE", "HYPEAI", "$Hype"],

  // Approved emojis
  approvedEmojis: ["🤖", "🧠", "💎", "🚀", "💰", "🔥", "📈", "⚡", "🗳️", "🛡️"],

  // Approved hashtags
  primaryHashtag: "#HypeAI",
  approvedHashtags: [
    "#HypeAI",
    "#WhereHypeMeetsIntelligence",
    "#AIPoweredCrypto",
    "#DeFiAI",
    "#DeFi",
    "#AI",
    "#Crypto",
    "#Blockchain",
    "#Staking"
  ],

  // Red flag words
  bannedPhrases: [
    "guaranteed returns",
    "can't lose",
    "100% safe",
    "financial advice",
    "get rich quick",
    "moon mission",
    "ngmi",
    "ape in"
  ],

  // Character limits
  maxLength: 280,
  idealLength: { min: 200, max: 220 },
  maxHashtags: 3,
  maxEmojis: 4,

  // Required disclaimers for certain content
  requiresDisclaimer: [
    "apy",
    "returns",
    "profit",
    "earnings",
    "yield",
    "staking"
  ]
};

class BrandChecker {
  constructor(text) {
    this.text = text;
    this.issues = [];
    this.warnings = [];
    this.suggestions = [];
    this.score = 100;
  }

  checkAll() {
    this.checkBrandTerminology();
    this.checkLength();
    this.checkEmojis();
    this.checkHashtags();
    this.checkBannedPhrases();
    this.checkDisclaimer();
    this.checkLinks();
    this.checkFormatting();

    return this.generateReport();
  }

  checkBrandTerminology() {
    const text = this.text;

    // Check for incorrect brand names
    BRAND_RULES.incorrectNames.forEach(incorrect => {
      const regex = new RegExp(incorrect, 'gi');
      if (regex.test(text)) {
        this.issues.push({
          severity: 'HIGH',
          type: 'Brand Name',
          message: `Found incorrect brand name "${incorrect}". Use "${BRAND_RULES.correctName}" instead.`,
          fix: text.replace(regex, BRAND_RULES.correctName)
        });
        this.score -= 20;
      }
    });

    // Check for incorrect token symbols
    BRAND_RULES.incorrectSymbols.forEach(incorrect => {
      if (text.includes(incorrect)) {
        this.issues.push({
          severity: 'HIGH',
          type: 'Token Symbol',
          message: `Found incorrect token symbol "${incorrect}". Use "${BRAND_RULES.correctSymbol}" instead.`,
          fix: text.replace(new RegExp(incorrect, 'g'), BRAND_RULES.correctSymbol)
        });
        this.score -= 15;
      }
    });

    // Check if brand name exists at all
    if (!text.includes(BRAND_RULES.correctName) && !text.includes(BRAND_RULES.correctSymbol)) {
      this.warnings.push({
        type: 'Brand Visibility',
        message: 'Tweet does not mention HypeAI or $HYPEAI. Consider adding for brand recognition.'
      });
      this.score -= 5;
    }
  }

  checkLength() {
    const length = this.text.length;

    if (length > BRAND_RULES.maxLength) {
      this.issues.push({
        severity: 'HIGH',
        type: 'Length',
        message: `Tweet is ${length} characters (max: ${BRAND_RULES.maxLength}). Shorten by ${length - BRAND_RULES.maxLength} characters.`
      });
      this.score -= 25;
    } else if (length < BRAND_RULES.idealLength.min || length > BRAND_RULES.idealLength.max) {
      this.suggestions.push({
        type: 'Length Optimization',
        message: `Tweet is ${length} characters. Ideal range: ${BRAND_RULES.idealLength.min}-${BRAND_RULES.idealLength.max} for better RT potential.`
      });
      this.score -= 2;
    }
  }

  checkEmojis() {
    const emojiRegex = /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu;
    const emojis = this.text.match(emojiRegex) || [];

    // Check emoji count
    if (emojis.length > BRAND_RULES.maxEmojis) {
      this.warnings.push({
        type: 'Emoji Overuse',
        message: `Found ${emojis.length} emojis (max recommended: ${BRAND_RULES.maxEmojis}). Excessive emojis reduce professionalism.`
      });
      this.score -= 5;
    }

    // Check for unapproved emojis
    const unapprovedEmojis = emojis.filter(e => !BRAND_RULES.approvedEmojis.includes(e));
    if (unapprovedEmojis.length > 0) {
      this.suggestions.push({
        type: 'Emoji Brand Consistency',
        message: `Using non-standard emojis: ${[...new Set(unapprovedEmojis)].join(' ')}. Approved: ${BRAND_RULES.approvedEmojis.join(' ')}`
      });
      this.score -= 3;
    }

    // Check if robot emoji is used for official announcements
    if ((this.text.toLowerCase().includes('announcement') || this.text.toLowerCase().includes('new:')) && !this.text.includes('🤖')) {
      this.suggestions.push({
        type: 'Brand Emoji',
        message: 'Consider starting announcements with 🤖 (brand mascot).'
      });
    }
  }

  checkHashtags() {
    const hashtags = this.text.match(/#\w+/g) || [];

    // Check hashtag count
    if (hashtags.length > BRAND_RULES.maxHashtags) {
      this.warnings.push({
        type: 'Hashtag Spam',
        message: `Found ${hashtags.length} hashtags (max: ${BRAND_RULES.maxHashtags}). Excessive hashtags hurt engagement.`
      });
      this.score -= 10;
    }

    // Check if primary hashtag is included
    if (hashtags.length > 0 && !hashtags.includes(BRAND_RULES.primaryHashtag)) {
      this.suggestions.push({
        type: 'Primary Hashtag',
        message: `Consider including ${BRAND_RULES.primaryHashtag} as primary brand hashtag.`
      });
      this.score -= 3;
    }

    // Check for unapproved hashtags
    const unapprovedHashtags = hashtags.filter(h => !BRAND_RULES.approvedHashtags.includes(h));
    if (unapprovedHashtags.length > 0) {
      this.suggestions.push({
        type: 'Hashtag Relevance',
        message: `Using custom hashtags: ${unapprovedHashtags.join(', ')}. Verify these are strategic.`
      });
    }
  }

  checkBannedPhrases() {
    const lowerText = this.text.toLowerCase();

    BRAND_RULES.bannedPhrases.forEach(phrase => {
      if (lowerText.includes(phrase)) {
        this.issues.push({
          severity: 'CRITICAL',
          type: 'Banned Phrase',
          message: `Contains banned phrase: "${phrase}". This violates brand guidelines and may have legal implications.`
        });
        this.score -= 30;
      }
    });

    // Check for all-caps (except allowed cases)
    const words = this.text.split(/\s+/);
    const allCapsWords = words.filter(w => {
      // Allow $HYPEAI and approved acronyms
      if (w === '$HYPEAI' || w === 'AI' || w === 'APY' || w === 'DAO' || w === 'LSTM') return false;
      // Check if word is all caps and longer than 3 characters
      return w.length > 3 && w === w.toUpperCase() && /[A-Z]/.test(w);
    });

    if (allCapsWords.length > 0) {
      this.warnings.push({
        type: 'Formatting',
        message: `Avoid all-caps words: ${allCapsWords.join(', ')}. Comes across as shouting.`
      });
      this.score -= 5;
    }
  }

  checkDisclaimer() {
    const lowerText = this.text.toLowerCase();
    const needsDisclaimer = BRAND_RULES.requiresDisclaimer.some(term => lowerText.includes(term));

    if (needsDisclaimer) {
      const hasDisclaimer = lowerText.includes('not financial advice') ||
                           lowerText.includes('dyor') ||
                           lowerText.includes('do your own research');

      if (!hasDisclaimer) {
        this.issues.push({
          severity: 'MEDIUM',
          type: 'Legal Compliance',
          message: 'Tweet mentions financial returns but lacks disclaimer. Add "Not financial advice. DYOR." or similar.'
        });
        this.score -= 15;
      }
    }
  }

  checkLinks() {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const urls = this.text.match(urlRegex) || [];

    urls.forEach(url => {
      // Check if link appears to be shortened
      if (url.includes('bit.ly') || url.includes('tinyurl') || url.includes('short')) {
        this.warnings.push({
          type: 'Link Trust',
          message: `Shortened URL detected: ${url}. Use full URLs or official shorteners for trust.`
        });
        this.score -= 5;
      }

      // Validate it's not a placeholder
      if (url.includes('example.com') || url.includes('placeholder')) {
        this.issues.push({
          severity: 'HIGH',
          type: 'Invalid Link',
          message: `Placeholder URL detected: ${url}. Replace with actual link before posting.`
        });
        this.score -= 20;
      }
    });
  }

  checkFormatting() {
    // Check for spelling/grammar red flags
    if (this.text.match(/\s{2,}/)) {
      this.warnings.push({
        type: 'Formatting',
        message: 'Multiple consecutive spaces detected. Clean up formatting.'
      });
      this.score -= 2;
    }

    // Check for basic punctuation
    if (this.text.includes(',,') || this.text.includes('..') || this.text.includes('!!')) {
      this.warnings.push({
        type: 'Formatting',
        message: 'Repeated punctuation detected. Use single punctuation marks.'
      });
      this.score -= 3;
    }

    // Check if sentence starts with capital letter
    if (this.text.length > 0 && this.text[0] !== this.text[0].toUpperCase() && !['🤖', '$', '#'].includes(this.text[0])) {
      this.suggestions.push({
        type: 'Capitalization',
        message: 'Tweet should start with capital letter (unless starting with emoji or $).'
      });
      this.score -= 2;
    }
  }

  generateReport() {
    // Calculate final score (minimum 0)
    this.score = Math.max(0, this.score);

    // Determine grade
    let grade = 'F';
    if (this.score >= 95) grade = 'A+';
    else if (this.score >= 90) grade = 'A';
    else if (this.score >= 85) grade = 'B+';
    else if (this.score >= 80) grade = 'B';
    else if (this.score >= 75) grade = 'C+';
    else if (this.score >= 70) grade = 'C';
    else if (this.score >= 60) grade = 'D';

    // Recommendation
    let recommendation = '';
    if (this.score >= 90) {
      recommendation = '✅ APPROVED - Tweet meets brand standards. Safe to post.';
    } else if (this.score >= 75) {
      recommendation = '⚠️ NEEDS REVISION - Address issues before posting.';
    } else if (this.score >= 60) {
      recommendation = '❌ MAJOR REVISIONS NEEDED - Multiple brand violations detected.';
    } else {
      recommendation = '🚫 DO NOT POST - Critical brand/legal issues. Rewrite completely.';
    }

    return {
      score: this.score,
      grade,
      recommendation,
      issues: this.issues,
      warnings: this.warnings,
      suggestions: this.suggestions,
      stats: {
        length: this.text.length,
        emojis: (this.text.match(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu) || []).length,
        hashtags: (this.text.match(/#\w+/g) || []).length,
        links: (this.text.match(/(https?:\/\/[^\s]+)/g) || []).length
      }
    };
  }

  static printReport(report) {
    console.log('\n' + '='.repeat(60));
    console.log('🤖 HYPEAI BRAND COMPLIANCE CHECKER');
    console.log('='.repeat(60) + '\n');

    // Score section
    console.log(`📊 BRAND SCORE: ${report.score}/100 (Grade: ${report.grade})`);
    console.log(`${report.recommendation}\n`);

    // Stats section
    console.log('📈 STATISTICS:');
    console.log(`   Length:   ${report.stats.length}/280 characters`);
    console.log(`   Emojis:   ${report.stats.emojis} (max: ${BRAND_RULES.maxEmojis})`);
    console.log(`   Hashtags: ${report.stats.hashtags} (max: ${BRAND_RULES.maxHashtags})`);
    console.log(`   Links:    ${report.stats.links}\n`);

    // Issues section (critical)
    if (report.issues.length > 0) {
      console.log('🚨 ISSUES (Must Fix):');
      report.issues.forEach((issue, i) => {
        console.log(`   ${i + 1}. [${issue.severity}] ${issue.type}: ${issue.message}`);
        if (issue.fix) {
          console.log(`      Suggested fix: "${issue.fix}"`);
        }
      });
      console.log('');
    }

    // Warnings section
    if (report.warnings.length > 0) {
      console.log('⚠️  WARNINGS (Should Fix):');
      report.warnings.forEach((warning, i) => {
        console.log(`   ${i + 1}. ${warning.type}: ${warning.message}`);
      });
      console.log('');
    }

    // Suggestions section
    if (report.suggestions.length > 0) {
      console.log('💡 SUGGESTIONS (Nice to Have):');
      report.suggestions.forEach((suggestion, i) => {
        console.log(`   ${i + 1}. ${suggestion.type}: ${suggestion.message}`);
      });
      console.log('');
    }

    // Summary
    if (report.issues.length === 0 && report.warnings.length === 0) {
      console.log('✨ Perfect! This tweet meets all brand guidelines.\n');
    }

    console.log('='.repeat(60) + '\n');
  }
}

// CLI Interface
if (require.main === module) {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log(`
🤖 HypeAI Brand Compliance Checker

USAGE:
  node brand-checker.js "your tweet text here"

EXAMPLES:
  node brand-checker.js "🤖 HypeAI's AI just achieved 78% prediction accuracy!"
  node brand-checker.js "Check out our new staking rewards: 62% APY. Not financial advice. #HypeAI"

OPTIONS:
  --json    Output results as JSON
  --help    Show this help message
`);
    process.exit(0);
  }

  if (args[0] === '--help') {
    console.log('See usage above');
    process.exit(0);
  }

  const outputJson = args.includes('--json');
  const tweetText = args.filter(a => a !== '--json').join(' ');

  const checker = new BrandChecker(tweetText);
  const report = checker.checkAll();

  if (outputJson) {
    console.log(JSON.stringify(report, null, 2));
  } else {
    BrandChecker.printReport(report);
  }

  // Exit with error code if score is too low
  process.exit(report.score < 75 ? 1 : 0);
}

module.exports = BrandChecker;
