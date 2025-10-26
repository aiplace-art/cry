/**
 * INTEGRATION EXAMPLE: Premium Image Generator + Twitter Auto-Poster
 *
 * This example shows how to integrate the Premium Image Generator
 * with the existing Twitter auto-posting system.
 */

import PremiumImageGenerator from './premium-image-generator.js';
// import { TwitterApi } from 'twitter-api-v2'; // Uncomment when ready

// ==================== INITIALIZATION ====================

const generator = new PremiumImageGenerator();

// ==================== CONTENT TEMPLATES ====================

const contentTemplates = {
  productLaunch: {
    style: 'glassmorphism',
    options: {
      title: 'HypeAI Pro',
      subtitle: 'Advanced AI Trading on BNB Chain',
      stats: 'Beta Access • Limited Slots'
    },
    tweetText: '🚀 Introducing HypeAI Pro!\n\nAdvanced AI-powered trading now live on BNB Chain.\n\n✨ Features:\n• Auto-trading strategies\n• Real-time analytics\n• BNB Chain integration\n\nJoin the beta: [link]\n\n#HypeAI #BNBChain #DeFi'
  },

  techAnnouncement: {
    style: 'neonCyberpunk',
    options: {
      title: 'SMART CONTRACTS',
      subtitle: 'Automated Trading is Live',
      tagline: 'SECURE • FAST • POWERFUL'
    },
    tweetText: '⚡ Smart Contracts are LIVE!\n\nAutomated trading now available on HypeAI.\n\n🔐 Secure\n⚡ Fast\n💪 Powerful\n\nBuilt on BNB Chain for maximum performance.\n\n#HypeAI #SmartContracts #BNBChain'
  },

  communityEvent: {
    style: 'abstractGeo',
    options: {
      title: 'AMA Event',
      subtitle: 'Meet the HypeAI Team',
      stats: 'Tomorrow • 6PM UTC'
    },
    tweetText: '🎤 AMA with the HypeAI Team!\n\n📅 Tomorrow at 6PM UTC\n🎯 Ask us anything\n🎁 Prizes for best questions\n\nDon\'t miss it! Set your reminders.\n\n#HypeAI #AMA #Community'
  },

  milestone: {
    style: 'cinematic',
    options: {
      title: 'MAINNET LIVE',
      subtitle: 'The Future is Here',
      date: 'LIVE NOW'
    },
    tweetText: '🎬 MAINNET IS LIVE!\n\nHypeAI is officially live on BNB Chain mainnet.\n\n🌟 Thank you to our amazing community\n🚀 The journey begins\n\n#HypeAI #Mainnet #BNBChain'
  },

  stats: {
    style: 'glassmorphism',
    options: {
      title: '$10M TVL',
      subtitle: 'Total Value Locked',
      stats: '25,000 Users • 150K Transactions'
    },
    tweetText: '📊 HypeAI Growth Update!\n\n💰 $10M Total Value Locked\n👥 25,000+ Active Users\n⚡ 150,000+ Transactions\n\nThank you for your trust!\n\n#HypeAI #DeFi #BNBChain'
  }
};

// ==================== GENERATION FUNCTIONS ====================

/**
 * Generate image for a content template
 */
async function generateImage(templateKey) {
  const template = contentTemplates[templateKey];

  if (!template) {
    throw new Error(`Template '${templateKey}' not found`);
  }

  const { style, options } = template;

  switch (style) {
    case 'glassmorphism':
      return await generator.generateGlassmorphism(options);

    case 'gradient3d':
      return await generator.generate3DGradient(options);

    case 'neonCyberpunk':
      return await generator.generateNeonCyberpunk(options);

    case 'abstractGeo':
      return await generator.generateAbstractGeo(options);

    case 'cinematic':
      return await generator.generateCinematic(options);

    default:
      throw new Error(`Unknown style: ${style}`);
  }
}

/**
 * Post tweet with premium image
 */
async function postTweetWithImage(templateKey, customOptions = {}) {
  console.log(`🎨 Generating image for: ${templateKey}...`);

  // Generate image
  const imageBuffer = await generateImage(templateKey);
  console.log('✅ Image generated successfully');

  // Get template
  const template = contentTemplates[templateKey];
  const tweetText = customOptions.tweetText || template.tweetText;

  // Save image locally (for testing)
  const filename = `tweet-${templateKey}-${Date.now()}.png`;
  await generator.saveImage(imageBuffer, filename);
  console.log(`💾 Image saved: ${filename}`);

  // TODO: Upload to Twitter when ready
  // const client = new TwitterApi(process.env.TWITTER_API_KEY);
  // const mediaId = await client.v1.uploadMedia(imageBuffer);
  // await client.v2.tweet({
  //   text: tweetText,
  //   media: { media_ids: [mediaId] }
  // });

  console.log('📝 Tweet text:');
  console.log(tweetText);
  console.log('\n✅ Tweet ready to post!');

  return {
    imageBuffer,
    tweetText,
    filename
  };
}

// ==================== SCHEDULED POSTING ====================

/**
 * Weekly content schedule
 */
const weeklySchedule = [
  { day: 'Monday', time: '10:00', template: 'stats' },
  { day: 'Tuesday', time: '14:00', template: 'techAnnouncement' },
  { day: 'Wednesday', time: '16:00', template: 'communityEvent' },
  { day: 'Thursday', time: '12:00', template: 'productLaunch' },
  { day: 'Friday', time: '18:00', template: 'milestone' }
];

/**
 * Generate all weekly content at once
 */
async function generateWeeklyContent() {
  console.log('📅 Generating weekly content...\n');

  for (const post of weeklySchedule) {
    console.log(`\n${post.day} ${post.time}:`);
    await postTweetWithImage(post.template);
  }

  console.log('\n🎉 All weekly content generated!');
}

// ==================== CAMPAIGN MANAGEMENT ====================

/**
 * Launch campaign with multiple posts
 */
async function launchCampaign(campaignName, posts) {
  console.log(`🚀 Launching campaign: ${campaignName}\n`);

  const results = [];

  for (const post of posts) {
    const result = await postTweetWithImage(post.template, post.options);
    results.push(result);

    // Wait between posts (Twitter rate limiting)
    await new Promise(resolve => setTimeout(resolve, 5000));
  }

  console.log(`\n✅ Campaign '${campaignName}' completed!`);
  return results;
}

// ==================== EXAMPLE CAMPAIGNS ====================

/**
 * Example: Product Launch Campaign
 */
async function productLaunchCampaign() {
  const posts = [
    {
      template: 'productLaunch',
      options: {
        tweetText: '🚀 Tomorrow: HypeAI Pro Launch!\n\nGet ready for advanced AI trading on BNB Chain.\n\n⏰ 24 hours to go!\n\n#HypeAI #ComingSoon'
      }
    },
    {
      template: 'techAnnouncement',
      options: {
        tweetText: '⚡ 6 HOURS TO GO!\n\nHypeAI Pro launches today.\n\nAre you ready?\n\n#HypeAI #Launch'
      }
    },
    {
      template: 'milestone',
      options: {
        tweetText: '🎬 IT\'S LIVE!\n\nHypeAI Pro is now available!\n\nStart trading: [link]\n\n#HypeAI #Live'
      }
    }
  ];

  return await launchCampaign('Product Launch', posts);
}

/**
 * Example: Community Building Campaign
 */
async function communityBuildingCampaign() {
  const posts = [
    { template: 'communityEvent' },
    { template: 'stats' },
    { template: 'abstractGeo' }
  ];

  return await launchCampaign('Community Building', posts);
}

// ==================== SMART POSTING ====================

/**
 * Smart post selection based on metrics
 */
async function smartPost(metrics = {}) {
  const { tvl = 0, users = 0, isMainEvent = false } = metrics;

  let templateKey;

  if (isMainEvent) {
    templateKey = 'milestone';
  } else if (tvl > 1000000) {
    templateKey = 'stats';
  } else if (users > 10000) {
    templateKey = 'communityEvent';
  } else {
    templateKey = 'productLaunch';
  }

  console.log(`🤖 Smart selection: ${templateKey}`);
  return await postTweetWithImage(templateKey);
}

// ==================== TESTING ====================

/**
 * Test all templates
 */
async function testAllTemplates() {
  console.log('🧪 Testing all templates...\n');

  for (const templateKey of Object.keys(contentTemplates)) {
    console.log(`\nTesting: ${templateKey}`);
    await postTweetWithImage(templateKey);
  }

  console.log('\n✅ All templates tested!');
}

// ==================== EXPORTS ====================

export {
  // Core functions
  generateImage,
  postTweetWithImage,

  // Scheduling
  weeklySchedule,
  generateWeeklyContent,

  // Campaigns
  launchCampaign,
  productLaunchCampaign,
  communityBuildingCampaign,

  // Smart posting
  smartPost,

  // Testing
  testAllTemplates,

  // Templates
  contentTemplates
};

// ==================== CLI USAGE ====================

if (import.meta.url === `file://${process.argv[1]}`) {
  const command = process.argv[2];

  switch (command) {
    case 'test':
      await testAllTemplates();
      break;

    case 'weekly':
      await generateWeeklyContent();
      break;

    case 'launch-campaign':
      await productLaunchCampaign();
      break;

    case 'community-campaign':
      await communityBuildingCampaign();
      break;

    case 'post':
      const template = process.argv[3] || 'productLaunch';
      await postTweetWithImage(template);
      break;

    default:
      console.log(`
🎨 Premium Image Generator - Integration Example

USAGE:
  node INTEGRATION_EXAMPLE.js [command]

COMMANDS:
  test                 Test all templates
  weekly               Generate weekly content
  launch-campaign      Run product launch campaign
  community-campaign   Run community building campaign
  post [template]      Post single template

TEMPLATES:
  productLaunch        Product/feature launch
  techAnnouncement     Tech feature announcement
  communityEvent       Community event/AMA
  milestone            Major milestone
  stats                Stats/metrics update

EXAMPLES:
  node INTEGRATION_EXAMPLE.js test
  node INTEGRATION_EXAMPLE.js post productLaunch
  node INTEGRATION_EXAMPLE.js weekly
      `);
  }
}
