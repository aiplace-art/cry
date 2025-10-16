/**
 * Growth Hacker Bot - Usage Example
 * Demonstrates how to set up and use the ethical growth bot
 */

import GrowthHackerBot from '../src/bots/growth-hacker-bot.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

/**
 * Example 1: Basic Setup
 */
function basicSetup() {
  console.log('📚 Example 1: Basic Setup\n');

  const config = {
    telegramToken: process.env.GROWTH_BOT_TOKEN,
    adminId: process.env.ADMIN_TELEGRAM_ID,
    projectName: 'DeFiMax Protocol',
    projectDescription: 'Next-generation cross-chain yield aggregator with AI-powered strategies',
    projectWebsite: 'https://defimax.example.com'
  };

  const bot = new GrowthHackerBot(config);

  console.log('✅ Bot initialized with config:');
  console.log(`   Project: ${config.projectName}`);
  console.log(`   Website: ${config.projectWebsite}`);
  console.log(`   Admin ID: ${config.adminId}\n`);
}

/**
 * Example 2: Finding Partnership Opportunities
 */
async function partnershipDiscoveryExample() {
  console.log('📚 Example 2: Partnership Discovery\n');

  // Simulate partnership search results
  const partnerships = [
    {
      name: 'Yield Optimizer Pro',
      category: 'DeFi',
      communitySize: 18000,
      matchScore: 88,
      reason: 'Complementary yield strategies, similar target audience',
      contact: '@yield_optimizer_admin',
      website: 'https://yieldopt.example.com'
    },
    {
      name: 'Cross-Chain Bridge DAO',
      category: 'Infrastructure',
      communitySize: 24000,
      matchScore: 82,
      reason: 'Cross-chain integration potential, technical alignment',
      contact: 'partnerships@bridgedao.example.com',
      website: 'https://bridgedao.example.com'
    }
  ];

  console.log(`Found ${partnerships.length} high-potential partnerships:\n`);

  partnerships.forEach((p, i) => {
    console.log(`${i + 1}. ${p.name}`);
    console.log(`   Match Score: ${p.matchScore}%`);
    console.log(`   Community: ${p.communitySize.toLocaleString()} members`);
    console.log(`   Reason: ${p.reason}`);
    console.log(`   Contact: ${p.contact}\n`);
  });
}

/**
 * Example 3: Customizing Outreach Templates
 */
function templateCustomizationExample() {
  console.log('📚 Example 3: Template Customization\n');

  const baseTemplate = `Hi {recipientName},

I'm reaching out from {projectName}. I've been following {theirProject} and I'm impressed by {specificThing}.

We're building {ourValue}, and I believe our communities could benefit from a partnership.`;

  const customization = {
    recipientName: 'Sarah Thompson',
    projectName: 'DeFiMax Protocol',
    theirProject: 'Yield Optimizer Pro',
    specificThing: 'your innovative gas optimization strategy in the recent v2 launch',
    ourValue: 'AI-powered cross-chain yield aggregation'
  };

  let personalizedMessage = baseTemplate;
  Object.entries(customization).forEach(([key, value]) => {
    personalizedMessage = personalizedMessage.replace(`{${key}}`, value);
  });

  console.log('Original Template:');
  console.log(baseTemplate);
  console.log('\n' + '='.repeat(60) + '\n');
  console.log('Personalized Message:');
  console.log(personalizedMessage);
  console.log('\n' + '='.repeat(60) + '\n');
}

/**
 * Example 4: Tracking Analytics
 */
function analyticsExample() {
  console.log('📚 Example 4: Analytics Tracking\n');

  const analytics = {
    totalOpportunitiesFound: 47,
    totalOutreachSent: 20,
    totalResponses: 8,
    totalPartnerships: 4
  };

  const responseRate = ((analytics.totalResponses / analytics.totalOutreachSent) * 100).toFixed(1);
  const conversionRate = ((analytics.totalPartnerships / analytics.totalOutreachSent) * 100).toFixed(1);

  console.log('Growth Analytics Dashboard:');
  console.log(`📊 Opportunities Found: ${analytics.totalOpportunitiesFound}`);
  console.log(`📨 Outreach Sent: ${analytics.totalOutreachSent}`);
  console.log(`💬 Responses: ${analytics.totalResponses} (${responseRate}% response rate)`);
  console.log(`🤝 Partnerships: ${analytics.totalPartnerships} (${conversionRate}% conversion)\n`);

  // Calculate trend
  let trend;
  if (analytics.totalPartnerships > 10) trend = 'Excellent growth! 🚀';
  else if (analytics.totalPartnerships > 5) trend = 'Good progress! 📈';
  else if (analytics.totalPartnerships > 0) trend = 'Getting started 🌱';
  else trend = 'Ready to grow! 💪';

  console.log(`Growth Trend: ${trend}\n`);
}

/**
 * Example 5: Ethical Outreach Checklist
 */
function ethicalChecklistExample() {
  console.log('📚 Example 5: Ethical Outreach Checklist\n');

  const checklist = [
    { item: 'Research the project thoroughly', checked: true },
    { item: 'Identify specific mutual benefits', checked: true },
    { item: 'Personalize the message', checked: true },
    { item: 'Lead with value proposition', checked: true },
    { item: 'Get human approval before sending', checked: true },
    { item: 'Respect their time and space', checked: true },
    { item: 'Follow up only once if no response', checked: true },
    { item: 'Accept "no" gracefully', checked: true }
  ];

  console.log('✅ Ethical Outreach Checklist:\n');

  checklist.forEach((item, i) => {
    const status = item.checked ? '✅' : '⬜';
    console.log(`${status} ${i + 1}. ${item.item}`);
  });

  console.log('\n💡 Remember: Quality relationships > Quantity of outreach\n');
}

/**
 * Example 6: Partnership Lifecycle Management
 */
function partnershipLifecycleExample() {
  console.log('📚 Example 6: Partnership Lifecycle\n');

  const partnership = {
    name: 'Yield Optimizer Pro',
    status: 'Active',
    type: 'Content Cross-Promotion',
    startedAt: '2024-01-15',
    activities: [
      { date: '2024-01-20', activity: 'Guest blog post exchange', status: 'completed' },
      { date: '2024-01-25', activity: 'Twitter cross-promotion', status: 'completed' },
      { date: '2024-02-15', activity: 'Joint webinar', status: 'scheduled' },
      { date: '2024-03-01', activity: 'Co-created research report', status: 'in-progress' }
    ],
    metrics: {
      combinedReach: 25000,
      trafficDriven: 847,
      newMembers: 234,
      engagementRate: 6.8
    }
  };

  console.log(`Partnership: ${partnership.name}`);
  console.log(`Status: ${partnership.status}`);
  console.log(`Type: ${partnership.type}`);
  console.log(`Started: ${partnership.startedAt}\n`);

  console.log('Activities:');
  partnership.activities.forEach(activity => {
    const statusIcon = activity.status === 'completed' ? '✅' : activity.status === 'scheduled' ? '📅' : '🔄';
    console.log(`  ${statusIcon} ${activity.date}: ${activity.activity}`);
  });

  console.log('\nMetrics:');
  console.log(`  👥 Combined Reach: ${partnership.metrics.combinedReach.toLocaleString()}`);
  console.log(`  🔗 Traffic Driven: ${partnership.metrics.trafficDriven.toLocaleString()} visits`);
  console.log(`  ➕ New Members: ${partnership.metrics.newMembers}`);
  console.log(`  📊 Engagement Rate: ${partnership.metrics.engagementRate}%\n`);
}

/**
 * Example 7: AMA Preparation
 */
function amaPreparationExample() {
  console.log('📚 Example 7: AMA Preparation\n');

  const ama = {
    community: 'DeFi Innovators Hub',
    members: 18000,
    date: '2024-03-15',
    time: '2:00 PM UTC',
    duration: '60 minutes'
  };

  const preparation = {
    before: [
      'Research community\'s interests and pain points',
      'Prepare 15-20 anticipated questions',
      'Draft opening statement (2-3 minutes)',
      'Prepare exclusive announcement or offer',
      'Get team members ready for technical questions',
      'Create promotional materials',
      'Set up tracking links'
    ],
    during: [
      'Start with strong introduction',
      'Answer questions thoroughly but concisely',
      'Be honest about limitations',
      'Engage with follow-up questions',
      'Share exclusive insights',
      'Thank participants regularly'
    ],
    after: [
      'Thank the community and moderators',
      'Share summary in your channels',
      'Follow up on unanswered questions',
      'Track metrics (attendance, engagement, conversions)',
      'Maintain engagement with interested members',
      'Plan next steps for converted leads'
    ]
  };

  console.log(`AMA Details:`);
  console.log(`  Community: ${ama.community}`);
  console.log(`  Members: ${ama.members.toLocaleString()}`);
  console.log(`  Date: ${ama.date} at ${ama.time}`);
  console.log(`  Duration: ${ama.duration}\n`);

  console.log('Before AMA:');
  preparation.before.forEach((task, i) => {
    console.log(`  ${i + 1}. ${task}`);
  });

  console.log('\nDuring AMA:');
  preparation.during.forEach((task, i) => {
    console.log(`  ${i + 1}. ${task}`);
  });

  console.log('\nAfter AMA:');
  preparation.after.forEach((task, i) => {
    console.log(`  ${i + 1}. ${task}`);
  });

  console.log();
}

/**
 * Main execution
 */
async function main() {
  console.log('\n' + '='.repeat(60));
  console.log('  Growth Hacker Bot - Usage Examples');
  console.log('  Ethical Growth Through Genuine Partnerships');
  console.log('='.repeat(60) + '\n');

  // Run all examples
  basicSetup();
  await partnershipDiscoveryExample();
  templateCustomizationExample();
  analyticsExample();
  ethicalChecklistExample();
  partnershipLifecycleExample();
  amaPreparationExample();

  console.log('='.repeat(60));
  console.log('✅ All examples completed!');
  console.log('📖 See /Users/ai.place/Crypto/docs/growth-bot-guide.md for full documentation');
  console.log('='.repeat(60) + '\n');
}

// Run examples if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export {
  basicSetup,
  partnershipDiscoveryExample,
  templateCustomizationExample,
  analyticsExample,
  ethicalChecklistExample,
  partnershipLifecycleExample,
  amaPreparationExample
};
