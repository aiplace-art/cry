/**
 * Instagram Content Adapter
 * Transforms Twitter content for Instagram optimization
 */

import fs from 'fs';

class InstagramContentAdapter {
  constructor() {
    // Instagram-specific constraints
    this.limits = {
      captionLength: 2200,
      hashtagsPerPost: 30,
      maxImageSize: 8 * 1024 * 1024, // 8MB
      minImageSize: 320, // 320x320 minimum
      maxImageSize: 1440, // 1440x1440 recommended
      aspectRatios: {
        square: 1.0,      // 1:1 (1080x1080)
        portrait: 0.8,    // 4:5 (1080x1350)
        landscape: 1.91   // 1.91:1 (1080x566)
      }
    };

    // Instagram-optimized hashtag strategy
    this.hashtagGroups = {
      defi: [
        '#DeFi',
        '#Crypto',
        '#Blockchain',
        '#Web3',
        '#CryptoNews',
        '#DeFiProject',
        '#SmartContracts',
        '#CryptoInvesting'
      ],
      ai: [
        '#AI',
        '#ArtificialIntelligence',
        '#MachineLearning',
        '#AITechnology',
        '#FutureOfAI',
        '#AIInnovation',
        '#TechAI',
        '#AIRevolution'
      ],
      bnb: [
        '#BNBChain',
        '#BSC',
        '#BinanceSmartChain',
        '#BNB',
        '#BUIDLonBNB',
        '#BNBCommunity',
        '#BNBEcosystem',
        '#CryptoOnBNB'
      ],
      community: [
        '#CryptoCommunity',
        '#Altcoins',
        '#CryptoTrading',
        '#InvestSmart',
        '#FinancialFreedom',
        '#PassiveIncome',
        '#CryptoLife',
        '#HODL'
      ],
      launch: [
        '#NewProject',
        '#ICO',
        '#TokenLaunch',
        '#CryptoLaunch',
        '#UpcomingProject',
        '#NextBigThing',
        '#Presale',
        '#Airdrop'
      ],
      technical: [
        '#SmartContract',
        '#Solidity',
        '#EVM',
        '#Blockchain',
        '#Decentralized',
        '#OpenSource',
        '#DevCommunity',
        '#CryptoTech'
      ]
    };

    // Emoji mappings for better engagement
    this.emojiMap = {
      introduction: '👋',
      features: '⚡',
      technical: '🔧',
      community: '🤝',
      launch: '🚀',
      education: '📚',
      engagement: '💬',
      viral: '🔥'
    };
  }

  /**
   * Main adaptation function: Twitter → Instagram
   */
  adaptFromTwitter(tweetData) {
    return {
      caption: this.createInstagramCaption(tweetData),
      hashtags: this.selectInstagramHashtags(tweetData),
      imageSpecs: this.getOptimalImageSpecs(tweetData),
      postingStrategy: this.determinePostingStrategy(tweetData)
    };
  }

  /**
   * Create Instagram-optimized caption from tweet
   */
  createInstagramCaption(tweetData) {
    let caption = '';

    // 1. Hook (first line - crucial for preview)
    const hook = this.createHook(tweetData);
    caption += hook + '\n\n';

    // 2. Main content (expand tweet text for Instagram)
    const expandedContent = this.expandContent(tweetData.text);
    caption += expandedContent + '\n\n';

    // 3. Call to action
    const cta = this.createCallToAction(tweetData.category);
    caption += cta + '\n\n';

    // 4. Brand tagline
    caption += '✨ HypeAI: Where AI Meets DeFi\n';
    caption += '🔗 Link in bio\n\n';

    // 5. Line breaks for aesthetic
    caption += '─────────\n';

    // Ensure within limits
    if (caption.length > this.limits.captionLength) {
      caption = caption.substring(0, this.limits.captionLength - 3) + '...';
    }

    return caption;
  }

  /**
   * Create attention-grabbing hook
   */
  createHook(tweetData) {
    const emoji = this.emojiMap[tweetData.category] || '💡';

    const hooks = {
      introduction: `${emoji} Introducing HypeAI`,
      features: `${emoji} Revolutionary Feature Alert`,
      technical: `${emoji} Technical Deep Dive`,
      community: `${emoji} Join Our Growing Community`,
      launch: `${emoji} Big Announcement Coming`,
      education: `${emoji} Learn About DeFi`,
      engagement: `${emoji} Let's Talk Crypto`,
      viral: `${emoji} This Changes Everything`
    };

    return hooks[tweetData.category] || `${emoji} ${tweetData.text.split('\n')[0]}`;
  }

  /**
   * Expand content with Instagram-friendly formatting
   */
  expandContent(tweetText) {
    // Remove Twitter @mentions (not useful on Instagram)
    let content = tweetText.replace(/@\w+/g, '');

    // Add line breaks for readability
    content = content.replace(/\. /g, '.\n\n');

    // Add emojis for emphasis
    content = content.replace(/!\s/g, '! ✨ ');

    // Highlight key phrases
    content = content.replace(/HypeAI/g, '💎 HypeAI');
    content = content.replace(/AI/g, '🤖 AI');
    content = content.replace(/DeFi/g, '💰 DeFi');

    return content.trim();
  }

  /**
   * Create category-specific call-to-action
   */
  createCallToAction(category) {
    const ctas = {
      introduction: '👉 Follow us to stay updated!',
      features: '💬 Comment your thoughts below!',
      technical: '🔖 Save this for later!',
      community: '🤝 Tag a friend who needs to see this!',
      launch: '🔔 Turn on notifications!',
      education: '📚 Share to help others learn!',
      engagement: '💭 Drop your questions below!',
      viral: '🚀 Share this with your network!'
    };

    return ctas[category] || '💬 Let us know what you think!';
  }

  /**
   * Select optimal hashtags for Instagram
   * Instagram strategy: Mix of high-traffic and niche hashtags
   */
  selectInstagramHashtags(tweetData) {
    const selected = new Set();

    // 1. Category-specific hashtags (60%)
    const categoryHashtags = this.hashtagGroups[tweetData.category] || this.hashtagGroups.defi;
    categoryHashtags.slice(0, 5).forEach(tag => selected.add(tag));

    // 2. DeFi/Blockchain hashtags (20%)
    this.hashtagGroups.defi.slice(0, 2).forEach(tag => selected.add(tag));

    // 3. AI hashtags (10%)
    this.hashtagGroups.ai.slice(0, 2).forEach(tag => selected.add(tag));

    // 4. BNB Chain hashtags (10%)
    this.hashtagGroups.bnb.slice(0, 2).forEach(tag => selected.add(tag));

    // Convert to array and limit to 30
    let hashtags = Array.from(selected).slice(0, 30);

    // Format with proper spacing
    return hashtags;
  }

  /**
   * Format hashtags for Instagram caption
   */
  formatHashtags(hashtags) {
    // Instagram best practice: Space out hashtags for readability
    // Group in sets of 5
    const grouped = [];
    for (let i = 0; i < hashtags.length; i += 5) {
      grouped.push(hashtags.slice(i, i + 5).join(' '));
    }
    return grouped.join('\n');
  }

  /**
   * Get optimal image specifications for Instagram
   */
  getOptimalImageSpecs(tweetData) {
    // Instagram prefers 1:1 (square) or 4:5 (portrait)
    const category = tweetData.category;

    // Category-based image specs
    const specs = {
      introduction: {
        width: 1080,
        height: 1080,
        ratio: 'square',
        style: 'glassmorphism' // Professional, welcoming
      },
      features: {
        width: 1080,
        height: 1350,
        ratio: 'portrait',
        style: '3DGradient' // Eye-catching
      },
      technical: {
        width: 1080,
        height: 1080,
        ratio: 'square',
        style: 'neonCyberpunk' // Technical aesthetic
      },
      community: {
        width: 1080,
        height: 1350,
        ratio: 'portrait',
        style: 'abstractGeo' // Inclusive, dynamic
      },
      launch: {
        width: 1080,
        height: 1350,
        ratio: 'portrait',
        style: 'cinematic' // Dramatic, attention-grabbing
      },
      education: {
        width: 1080,
        height: 1080,
        ratio: 'square',
        style: 'glassmorphism' // Clean, professional
      },
      engagement: {
        width: 1080,
        height: 1080,
        ratio: 'square',
        style: 'abstractGeo' // Interactive feel
      },
      viral: {
        width: 1080,
        height: 1350,
        ratio: 'portrait',
        style: 'cinematic' // Maximum impact
      }
    };

    return specs[category] || specs.introduction;
  }

  /**
   * Determine optimal posting strategy
   */
  determinePostingStrategy(tweetData) {
    // Instagram engagement patterns differ from Twitter
    return {
      optimalTimes: [
        '11:00', // Late morning
        '14:00', // Early afternoon
        '19:00'  // Evening (best time)
      ],
      frequency: '1-2 posts/day', // Less than Twitter
      carouselRecommended: tweetData.category === 'features' || tweetData.category === 'education',
      storiesRecommended: tweetData.category === 'engagement' || tweetData.category === 'viral',
      reelsRecommended: tweetData.category === 'launch' || tweetData.category === 'viral'
    };
  }

  /**
   * Create Instagram Story variant
   */
  adaptForStory(tweetData) {
    return {
      format: '1080x1920', // 9:16 vertical
      duration: 15, // seconds
      elements: [
        {
          type: 'background',
          style: 'gradient' // Brand colors
        },
        {
          type: 'text',
          content: tweetData.text.substring(0, 100),
          position: 'center',
          fontSize: 48
        },
        {
          type: 'sticker',
          content: this.emojiMap[tweetData.category],
          position: 'top-right'
        },
        {
          type: 'cta',
          content: 'Swipe up',
          position: 'bottom'
        }
      ]
    };
  }

  /**
   * Create Instagram Reel concept
   */
  adaptForReel(tweetData) {
    return {
      format: '1080x1920', // 9:16 vertical
      duration: '15-30s',
      concept: this.generateReelConcept(tweetData.category),
      music: 'trending-tech',
      captions: this.createReelCaptions(tweetData)
    };
  }

  /**
   * Generate Reel concept
   */
  generateReelConcept(category) {
    const concepts = {
      launch: 'Countdown animation with feature reveals',
      features: 'Feature showcase with smooth transitions',
      technical: 'Code animations and tech visuals',
      community: 'Community testimonials compilation',
      education: 'Educational tips carousel',
      viral: 'Trend-jacking with brand messaging'
    };

    return concepts[category] || 'Brand story animation';
  }

  /**
   * Create Reel captions
   */
  createReelCaptions(tweetData) {
    const lines = tweetData.text.split('\n').filter(l => l.trim());

    // Break into 3-second segments
    return lines.map((line, idx) => ({
      text: line,
      startTime: idx * 3,
      duration: 3,
      style: 'bold-white-outline'
    }));
  }

  /**
   * Validate adapted content
   */
  validate(adaptedContent) {
    const issues = [];

    // Check caption length
    if (adaptedContent.caption.length > this.limits.captionLength) {
      issues.push(`Caption too long: ${adaptedContent.caption.length}/${this.limits.captionLength}`);
    }

    // Check hashtag count
    if (adaptedContent.hashtags.length > this.limits.hashtagsPerPost) {
      issues.push(`Too many hashtags: ${adaptedContent.hashtags.length}/${this.limits.hashtagsPerPost}`);
    }

    // Check image specs
    const { width, height } = adaptedContent.imageSpecs;
    if (width < this.limits.minImageSize || height < this.limits.minImageSize) {
      issues.push(`Image too small: ${width}x${height} (min ${this.limits.minImageSize})`);
    }

    return {
      valid: issues.length === 0,
      issues
    };
  }

  /**
   * Load Twitter content bank for adaptation
   */
  loadTwitterContent(contentPath = './scripts/twitter-content/tweets-bank.json') {
    try {
      const content = fs.readFileSync(contentPath, 'utf8');
      return JSON.parse(content);
    } catch (error) {
      console.error('Failed to load Twitter content:', error.message);
      return null;
    }
  }

  /**
   * Batch adapt all Twitter content
   */
  batchAdapt(twitterContentBank) {
    const adaptedContent = {
      posts: [],
      stories: [],
      reels: []
    };

    twitterContentBank.tweets.forEach(tweet => {
      // Main post
      const post = this.adaptFromTwitter(tweet);
      adaptedContent.posts.push({
        id: `ig-${tweet.id}`,
        original: tweet,
        adapted: post,
        validation: this.validate(post)
      });

      // Story variant (for selected categories)
      if (['engagement', 'viral', 'launch'].includes(tweet.category)) {
        const story = this.adaptForStory(tweet);
        adaptedContent.stories.push({
          id: `story-${tweet.id}`,
          original: tweet,
          story
        });
      }

      // Reel concept (for selected categories)
      if (['launch', 'viral', 'features'].includes(tweet.category)) {
        const reel = this.adaptForReel(tweet);
        adaptedContent.reels.push({
          id: `reel-${tweet.id}`,
          original: tweet,
          reel
        });
      }
    });

    return adaptedContent;
  }
}

export default InstagramContentAdapter;
