#!/usr/bin/env node

/**
 * Threads Content Adapter
 * Optimizes content for Threads 500 character limit
 * Handles hashtags, mentions, emojis, and formatting
 */

export default class ThreadsContentAdapter {
  constructor(options = {}) {
    this.maxLength = options.maxLength || 500;
    this.maxHashtags = options.maxHashtags || 3;
    this.preserveEmojis = options.preserveEmojis !== false;
    this.preserveMentions = options.preserveMentions !== false;
  }

  /**
   * Adapt Twitter content for Threads
   */
  adaptFromTwitter(twitterContent) {
    console.log('🔄 Adapting Twitter content for Threads');

    // Twitter uses 280 chars, Threads uses 500 - usually no problem
    // But we optimize for better Threads engagement

    let content = twitterContent;

    // Remove Twitter-specific elements that don't work on Threads
    content = this.removeTwitterSpecificElements(content);

    // Optimize hashtags for Threads
    content = this.optimizeHashtags(content);

    // Enhance with Threads-friendly formatting
    content = this.enhanceForThreads(content);

    // Ensure within character limit
    content = this.enforceCharacterLimit(content);

    return content;
  }

  /**
   * Create Threads-native content
   */
  createNativeContent(params) {
    const { topic, hook, callToAction, hashtags = [] } = params;

    let content = '';

    // Hook (first line - critical for engagement)
    if (hook) {
      content += `${hook}\n\n`;
    }

    // Main content
    if (topic) {
      content += `${topic}\n\n`;
    }

    // Call to action
    if (callToAction) {
      content += `${callToAction}\n\n`;
    }

    // Hashtags (max 3 for optimal reach)
    const selectedHashtags = hashtags.slice(0, this.maxHashtags);
    if (selectedHashtags.length > 0) {
      content += selectedHashtags.map(tag => `#${tag.replace('#', '')}`).join(' ');
    }

    return this.enforceCharacterLimit(content.trim());
  }

  /**
   * Remove Twitter-specific elements
   */
  removeTwitterSpecificElements(content) {
    // Remove Twitter handles that don't exist on Threads
    // Keep @mentions that are generic or brand names

    // Remove quote tweet markers
    content = content.replace(/^RT @\w+:/g, '');

    // Remove Twitter-specific commands
    content = content.replace(/\/via @\w+/g, '');

    return content.trim();
  }

  /**
   * Optimize hashtags for Threads
   */
  optimizeHashtags(content) {
    // Extract hashtags
    const hashtags = content.match(/#\w+/g) || [];

    if (hashtags.length <= this.maxHashtags) {
      return content;
    }

    // Too many hashtags - keep most relevant
    const mainContent = content.replace(/#\w+/g, '').trim();
    const topHashtags = this.selectTopHashtags(hashtags, this.maxHashtags);

    return `${mainContent}\n\n${topHashtags.join(' ')}`;
  }

  /**
   * Select top hashtags by relevance
   */
  selectTopHashtags(hashtags, count) {
    // Priority hashtags for HYPEAI
    const priorityTags = ['#AI', '#Crypto', '#Web3', '#DeFi', '#Innovation'];

    const selected = [];

    // Add priority tags first
    for (const tag of hashtags) {
      if (priorityTags.includes(tag) && selected.length < count) {
        selected.push(tag);
      }
    }

    // Fill remaining slots
    for (const tag of hashtags) {
      if (!selected.includes(tag) && selected.length < count) {
        selected.push(tag);
      }
    }

    return selected;
  }

  /**
   * Enhance content for Threads
   */
  enhanceForThreads(content) {
    // Threads prefers conversational, engaging content

    // Add line breaks for readability
    content = this.addLineBreaks(content);

    // Ensure emoji usage is optimal
    if (this.preserveEmojis) {
      content = this.optimizeEmojis(content);
    }

    return content;
  }

  /**
   * Add line breaks for readability
   */
  addLineBreaks(content) {
    // Split into sentences
    const sentences = content.split(/\. (?=[A-Z])/);

    if (sentences.length <= 2) {
      return content;
    }

    // Add breaks between logical sections
    return sentences.join('.\n\n');
  }

  /**
   * Optimize emoji usage
   */
  optimizeEmojis(content) {
    // Count emojis
    const emojiCount = (content.match(/[\p{Emoji}]/gu) || []).length;

    // Threads works well with 2-4 emojis
    if (emojiCount >= 2 && emojiCount <= 4) {
      return content;
    }

    // If no emojis, add a relevant one at start
    if (emojiCount === 0) {
      const relevantEmoji = this.selectRelevantEmoji(content);
      return `${relevantEmoji} ${content}`;
    }

    return content;
  }

  /**
   * Select relevant emoji based on content
   */
  selectRelevantEmoji(content) {
    const keywords = {
      '🚀': ['launch', 'growth', 'success', 'innovation', 'breakthrough'],
      '💡': ['idea', 'insight', 'learn', 'discover', 'understand'],
      '🔥': ['hot', 'trending', 'popular', 'amazing', 'incredible'],
      '💎': ['value', 'gem', 'crypto', 'token', 'treasure'],
      '🤖': ['ai', 'bot', 'automation', 'machine learning', 'artificial'],
      '⚡': ['fast', 'quick', 'instant', 'speed', 'power'],
      '🎯': ['target', 'goal', 'focus', 'achieve', 'success'],
      '🌟': ['star', 'featured', 'highlight', 'special', 'new']
    };

    const lowerContent = content.toLowerCase();

    for (const [emoji, words] of Object.entries(keywords)) {
      if (words.some(word => lowerContent.includes(word))) {
        return emoji;
      }
    }

    return '🚀'; // Default
  }

  /**
   * Enforce character limit
   */
  enforceCharacterLimit(content) {
    if (content.length <= this.maxLength) {
      return content;
    }

    console.warn(`⚠️  Content exceeds ${this.maxLength} chars (${content.length}). Truncating...`);

    // Try to cut at sentence boundary
    let truncated = content.substring(0, this.maxLength - 3);
    const lastPeriod = truncated.lastIndexOf('.');

    if (lastPeriod > this.maxLength * 0.8) {
      truncated = truncated.substring(0, lastPeriod + 1);
    } else {
      truncated = truncated.substring(0, truncated.lastIndexOf(' ')) + '...';
    }

    return truncated;
  }

  /**
   * Validate Threads content
   */
  validate(content) {
    const issues = [];

    if (!content || content.trim().length === 0) {
      issues.push('Content is empty');
    }

    if (content.length > this.maxLength) {
      issues.push(`Content exceeds ${this.maxLength} characters (${content.length})`);
    }

    const hashtags = (content.match(/#\w+/g) || []).length;
    if (hashtags > 10) {
      issues.push(`Too many hashtags (${hashtags}). Recommended: ${this.maxHashtags}`);
    }

    // Check for prohibited content
    if (this.hasProhibitedContent(content)) {
      issues.push('Content may contain prohibited elements');
    }

    return {
      valid: issues.length === 0,
      issues,
      stats: {
        length: content.length,
        hashtags,
        mentions: (content.match(/@\w+/g) || []).length,
        emojis: (content.match(/[\p{Emoji}]/gu) || []).length
      }
    };
  }

  /**
   * Check for prohibited content
   */
  hasProhibitedContent(content) {
    // Basic checks for content that violates Threads policies
    const prohibitedPatterns = [
      /\b(buy now|click here|limited time)\b/i, // Spam phrases
      /\$\$\$+/,                                   // Excessive money symbols
      /!!!{3,}/,                                   // Excessive exclamation
    ];

    return prohibitedPatterns.some(pattern => pattern.test(content));
  }

  /**
   * Generate content variations
   */
  generateVariations(baseContent, count = 3) {
    const variations = [];

    // Variation 1: Different hook
    variations.push(this.varyHook(baseContent));

    // Variation 2: Different emoji placement
    variations.push(this.varyEmojis(baseContent));

    // Variation 3: Different hashtag selection
    variations.push(this.varyHashtags(baseContent));

    return variations.slice(0, count);
  }

  varyHook(content) {
    const hooks = [
      '🔥 Hot take:',
      '💡 Here\'s the thing:',
      '🚀 Breaking:',
      '⚡ Quick insight:',
      '🎯 The truth:'
    ];

    const randomHook = hooks[Math.floor(Math.random() * hooks.length)];
    return `${randomHook} ${content}`;
  }

  varyEmojis(content) {
    // Shuffle emoji positions
    return content; // Simplified for now
  }

  varyHashtags(content) {
    // Try different hashtag combinations
    return content; // Simplified for now
  }
}

// CLI testing
if (import.meta.url === `file://${process.argv[1]}`) {
  const adapter = new ThreadsContentAdapter();

  // Test Twitter adaptation
  const twitterContent = '🚀 Exciting news! HYPEAI is revolutionizing crypto with AI-powered trading. Join us! #AI #Crypto #DeFi #Web3 #Innovation #Trading';
  const threadsContent = adapter.adaptFromTwitter(twitterContent);

  console.log('Original (Twitter):');
  console.log(twitterContent);
  console.log(`\nAdapted (Threads):`);
  console.log(threadsContent);
  console.log('\nValidation:');
  console.log(JSON.stringify(adapter.validate(threadsContent), null, 2));
}
