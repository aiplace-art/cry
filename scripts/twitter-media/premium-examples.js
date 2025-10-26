/**
 * Premium Image Generator - Usage Examples
 *
 * This file demonstrates how to use each premium style effectively
 */

import PremiumImageGenerator from './premium-image-generator.js';

const generator = new PremiumImageGenerator();

// ==================== EXAMPLE USE CASES ====================

/**
 * EXAMPLE 1: Product Launch (Glassmorphism)
 * Perfect for: Premium announcements, feature reveals
 */
async function exampleProductLaunch() {
  const buffer = await generator.generateGlassmorphism({
    title: 'HypeAI Pro',
    subtitle: 'Advanced AI Trading on BNB Chain',
    stats: 'Limited Beta • 1000 Slots'
  });

  await generator.saveImage(buffer, 'example-product-launch.png');
  console.log('✅ Product launch image created');
}

/**
 * EXAMPLE 2: Service Showcase (3D Gradient)
 * Perfect for: Service announcements, feature highlights
 */
async function exampleServiceShowcase() {
  const buffer = await generator.generate3DGradient({
    title: 'AI SERVICES',
    subtitle: 'Professional DeFi Solutions',
    highlight: 'Starting at $99/month'
  });

  await generator.saveImage(buffer, 'example-service-showcase.png');
  console.log('✅ Service showcase image created');
}

/**
 * EXAMPLE 3: Tech Announcement (Neon Cyberpunk)
 * Perfect for: Tech features, crypto launches
 */
async function exampleTechAnnouncement() {
  const buffer = await generator.generateNeonCyberpunk({
    title: 'SMART CONTRACTS',
    subtitle: 'Automated Trading is Live',
    tagline: 'SECURE • FAST • POWERFUL'
  });

  await generator.saveImage(buffer, 'example-tech-announcement.png');
  console.log('✅ Tech announcement image created');
}

/**
 * EXAMPLE 4: Community Event (Abstract Geometric)
 * Perfect for: Community updates, events
 */
async function exampleCommunityEvent() {
  const buffer = await generator.generateAbstractGeo({
    title: 'AMA Event',
    subtitle: 'Meet the HypeAI Team',
    stats: 'Tomorrow • 6PM UTC'
  });

  await generator.saveImage(buffer, 'example-community-event.png');
  console.log('✅ Community event image created');
}

/**
 * EXAMPLE 5: Major Launch (Cinematic)
 * Perfect for: Big announcements, milestones
 */
async function exampleMajorLaunch() {
  const buffer = await generator.generateCinematic({
    title: 'MAINNET',
    subtitle: 'The Future is Here',
    date: 'LIVE NOW'
  });

  await generator.saveImage(buffer, 'example-major-launch.png');
  console.log('✅ Major launch image created');
}

/**
 * EXAMPLE 6: Stats Showcase (Glassmorphism)
 * Perfect for: Milestones, achievements
 */
async function exampleStatsShowcase() {
  const buffer = await generator.generateGlassmorphism({
    title: '$10M TVL',
    subtitle: 'Total Value Locked',
    stats: '25,000 Active Users • 150K Transactions'
  });

  await generator.saveImage(buffer, 'example-stats-showcase.png');
  console.log('✅ Stats showcase image created');
}

/**
 * EXAMPLE 7: Partnership Announcement (3D Gradient)
 * Perfect for: Partnerships, collaborations
 */
async function examplePartnership() {
  const buffer = await generator.generate3DGradient({
    title: 'NEW PARTNERSHIP',
    subtitle: 'HypeAI × Major Exchange',
    highlight: 'Listing Confirmed'
  });

  await generator.saveImage(buffer, 'example-partnership.png');
  console.log('✅ Partnership announcement image created');
}

/**
 * EXAMPLE 8: Gaming Integration (Neon Cyberpunk)
 * Perfect for: Gaming, NFT, Web3 content
 */
async function exampleGamingIntegration() {
  const buffer = await generator.generateNeonCyberpunk({
    title: 'PLAY TO EARN',
    subtitle: 'HypeAI Gaming Beta',
    tagline: 'EARN WHILE YOU PLAY'
  });

  await generator.saveImage(buffer, 'example-gaming.png');
  console.log('✅ Gaming integration image created');
}

/**
 * EXAMPLE 9: Contest/Giveaway (Abstract Geometric)
 * Perfect for: Contests, giveaways, promotions
 */
async function exampleGiveaway() {
  const buffer = await generator.generateAbstractGeo({
    title: '$5000 GIVEAWAY',
    subtitle: 'BNB Chain Celebration',
    stats: 'Enter Now • 48 Hours Left'
  });

  await generator.saveImage(buffer, 'example-giveaway.png');
  console.log('✅ Giveaway image created');
}

/**
 * EXAMPLE 10: Season/Event Launch (Cinematic)
 * Perfect for: Seasons, campaigns, major events
 */
async function exampleSeasonLaunch() {
  const buffer = await generator.generateCinematic({
    title: 'SEASON 2',
    subtitle: 'New Features Unlocked',
    date: 'JANUARY 2025'
  });

  await generator.saveImage(buffer, 'example-season-launch.png');
  console.log('✅ Season launch image created');
}

// ==================== STYLE SELECTION GUIDE ====================

const styleGuide = {
  glassmorphism: {
    name: 'Glassmorphism',
    vibe: 'Modern, Premium, Professional',
    bestFor: ['Product launches', 'Feature announcements', 'Stats/milestones', 'Premium content'],
    avoid: ['Casual content', 'Memes', 'Urgent announcements']
  },

  gradient3d: {
    name: '3D Gradient',
    vibe: 'Bold, Energetic, Dynamic',
    bestFor: ['Service showcases', 'Partnerships', 'Promotions', 'Marketing campaigns'],
    avoid: ['Serious announcements', 'Technical documentation']
  },

  neonCyberpunk: {
    name: 'Neon Cyberpunk',
    vibe: 'Tech-focused, Futuristic, Edgy',
    bestFor: ['Tech features', 'Crypto launches', 'Gaming', 'Web3 content'],
    avoid: ['Corporate content', 'Traditional finance']
  },

  abstractGeo: {
    name: 'Abstract Geometric',
    vibe: 'Artistic, Creative, Unique',
    bestFor: ['Community events', 'Contests', 'Creative content', 'Brand storytelling'],
    avoid: ['Urgent news', 'Data-heavy content']
  },

  cinematic: {
    name: 'Cinematic',
    vibe: 'Dramatic, Important, Epic',
    bestFor: ['Major launches', 'Mainnet releases', 'Big milestones', 'Season announcements'],
    avoid: ['Small updates', 'Daily content', 'Routine posts']
  }
};

// ==================== BATCH GENERATION ====================

/**
 * Generate all examples at once
 */
async function generateAllExamples() {
  console.log('🎨 Generating all premium style examples...\n');

  await exampleProductLaunch();
  await exampleServiceShowcase();
  await exampleTechAnnouncement();
  await exampleCommunityEvent();
  await exampleMajorLaunch();
  await exampleStatsShowcase();
  await examplePartnership();
  await exampleGamingIntegration();
  await exampleGiveaway();
  await exampleSeasonLaunch();

  console.log('\n🎉 All examples generated successfully!');
  console.log('📁 Check the outputs/ directory\n');
}

// ==================== CONTENT CALENDAR INTEGRATION ====================

/**
 * Generate images for a week's worth of content
 */
async function generateWeeklyContent() {
  const schedule = [
    { day: 'Monday', style: 'glassmorphism', type: 'Stats Update' },
    { day: 'Tuesday', style: 'gradient3d', type: 'Feature Highlight' },
    { day: 'Wednesday', style: 'neonCyberpunk', type: 'Tech Wednesday' },
    { day: 'Thursday', style: 'abstractGeo', type: 'Community Spotlight' },
    { day: 'Friday', style: 'cinematic', type: 'Weekend Announcement' },
  ];

  console.log('📅 Generating weekly content schedule...\n');

  for (const item of schedule) {
    console.log(`${item.day}: ${item.type} (${item.style})`);

    switch (item.style) {
      case 'glassmorphism':
        await generator.generateGlassmorphism({
          title: 'Weekly Stats',
          subtitle: `${item.day} Update`,
          stats: 'HypeAI on BNB Chain'
        });
        break;
      case 'gradient3d':
        await generator.generate3DGradient({
          title: 'FEATURE',
          subtitle: item.type,
          highlight: item.day
        });
        break;
      case 'neonCyberpunk':
        await generator.generateNeonCyberpunk({
          title: item.type.toUpperCase(),
          subtitle: 'HypeAI Tech',
          tagline: item.day.toUpperCase()
        });
        break;
      case 'abstractGeo':
        await generator.generateAbstractGeo({
          title: 'Community',
          subtitle: item.type,
          stats: item.day
        });
        break;
      case 'cinematic':
        await generator.generateCinematic({
          title: 'ANNOUNCEMENT',
          subtitle: item.type,
          date: item.day.toUpperCase()
        });
        break;
    }
  }

  console.log('\n✅ Weekly content generated!');
}

// ==================== EXPORT ====================

export {
  // Individual examples
  exampleProductLaunch,
  exampleServiceShowcase,
  exampleTechAnnouncement,
  exampleCommunityEvent,
  exampleMajorLaunch,
  exampleStatsShowcase,
  examplePartnership,
  exampleGamingIntegration,
  exampleGiveaway,
  exampleSeasonLaunch,

  // Batch operations
  generateAllExamples,
  generateWeeklyContent,

  // Style guide
  styleGuide
};

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  generateAllExamples();
}
