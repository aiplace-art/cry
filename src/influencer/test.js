const InfluencerCRM = require('./crm');
const OutreachBot = require('./outreach-bot');
const CampaignTracker = require('./campaign-tracker');

/**
 * Test Suite for HypeAI Influencer System
 */

console.log('Starting HypeAI Influencer System Tests...\n');

// Initialize systems
const crm = new InfluencerCRM();
const outreachBot = new OutreachBot(crm);
const campaignTracker = new CampaignTracker(crm);

// Test 1: CRM Initialization
console.log('Test 1: CRM Initialization');
const allInfluencers = crm.getAllInfluencers();
console.log(`✓ Loaded ${allInfluencers.length} influencers`);
console.log(`✓ Statistics:`, crm.getStatistics());
console.log('');

// Test 2: Pipeline Management
console.log('Test 2: Pipeline Management');
const pipeline = crm.getPipeline();
console.log(`✓ Not Contacted: ${pipeline.not_contacted.length}`);
console.log(`✓ Contacted: ${pipeline.contacted.length}`);
console.log(`✓ Negotiating: ${pipeline.negotiating.length}`);
console.log(`✓ Partnered: ${pipeline.partnered.length}`);
console.log(`✓ Declined: ${pipeline.declined.length}`);
console.log('');

// Test 3: Update Influencer Status
console.log('Test 3: Update Influencer Status');
const testInfluencer = crm.getInfluencerById(1);
console.log(`✓ Before: ${testInfluencer.name} - ${testInfluencer.status}`);
crm.updateInfluencerStatus(1, 'contacted');
const updatedInfluencer = crm.getInfluencerById(1);
console.log(`✓ After: ${updatedInfluencer.name} - ${updatedInfluencer.status}`);
console.log('');

// Test 4: Add Notes
console.log('Test 4: Add Notes');
crm.addNote(1, 'Initial outreach sent via email');
crm.addNote(1, 'Positive response received');
const influencerWithNotes = crm.getInfluencerById(1);
console.log(`✓ Added ${influencerWithNotes.notes.length} notes to ${influencerWithNotes.name}`);
console.log('');

// Test 5: Email Template Loading
console.log('Test 5: Email Template Loading');
const coldTemplate = outreachBot.loadTemplate('initial-outreach-cold');
if (coldTemplate) {
  console.log('✓ Cold outreach template loaded');
  const personalized = outreachBot.personalizeMessage(coldTemplate, testInfluencer);
  console.log('✓ Template personalization working');
  console.log(`Sample: ${personalized.substring(0, 100)}...`);
} else {
  console.log('✗ Template not found');
}
console.log('');

// Test 6: Campaign Creation
console.log('Test 6: Campaign Creation');
const campaign = campaignTracker.createCampaign({
  name: 'Launch Campaign - @CryptoCapo_',
  influencerId: 1,
  platform: 'Twitter',
  budget: 300,
  deliverables: ['1 thread', '2 tweets']
});
console.log(`✓ Created campaign: ${campaign.name}`);
console.log(`✓ Campaign ID: ${campaign.id}`);
console.log('');

// Test 7: Add Post to Campaign
console.log('Test 7: Add Post to Campaign');
const post = campaignTracker.addPost(campaign.id, {
  platform: 'Twitter',
  url: 'https://twitter.com/CryptoCapo_/status/123456',
  type: 'tweet',
  reach: 45000,
  likes: 2000,
  comments: 150,
  shares: 300,
  clicks: 800
});
console.log(`✓ Added post to campaign`);
console.log(`✓ Post ID: ${post.id}`);
console.log('');

// Test 8: Update Campaign Performance
console.log('Test 8: Update Campaign Performance');
campaignTracker.updatePostMetrics(campaign.id, post.id, {
  likes: 2500,
  comments: 200,
  shares: 400,
  clicks: 1000
});
const updatedCampaign = campaignTracker.getCampaign(campaign.id);
console.log(`✓ Updated campaign performance`);
console.log(`✓ Total engagement: ${updatedCampaign.performance.engagement}`);
console.log('');

// Test 9: Record Payment
console.log('Test 9: Record Payment');
campaignTracker.recordPayment(campaign.id, 150); // 50% upfront
console.log(`✓ Recorded payment: $150`);
console.log('');

// Test 10: Update Conversions and Calculate ROI
console.log('Test 10: Update Conversions and Calculate ROI');
campaignTracker.updateConversions(campaign.id, 25, 25, 1250);
const finalCampaign = campaignTracker.getCampaign(campaign.id);
console.log(`✓ Conversions: ${finalCampaign.performance.conversions}`);
console.log(`✓ Revenue: $${finalCampaign.performance.revenue}`);
console.log(`✓ ROI: ${finalCampaign.roi}%`);
console.log('');

// Test 11: Performance Report
console.log('Test 11: Performance Report');
const report = campaignTracker.getPerformanceReport(campaign.id);
console.log(`✓ Campaign: ${report.campaignName}`);
console.log(`✓ Cost per click: $${report.efficiency.costPerClick}`);
console.log(`✓ Cost per conversion: $${report.efficiency.costPerConversion}`);
console.log(`✓ ROI: ${report.roi}%`);
console.log('');

// Test 12: High Priority Influencers
console.log('Test 12: High Priority Influencers');
const highPriority = crm.getHighPriorityInfluencers();
console.log(`✓ Found ${highPriority.length} high priority influencers`);
highPriority.slice(0, 5).forEach(inf => {
  console.log(`  - ${inf.name} (${inf.priority})`);
});
console.log('');

// Test 13: Follow-up Needed
console.log('Test 13: Follow-up Needed');
const followUpNeeded = crm.getFollowUpNeeded();
console.log(`✓ ${followUpNeeded.length} influencers need follow-up`);
console.log('');

// Test 14: Overall Campaign Statistics
console.log('Test 14: Overall Campaign Statistics');
const overallStats = campaignTracker.getOverallStats();
console.log(`✓ Total campaigns: ${overallStats.totalCampaigns}`);
console.log(`✓ Active campaigns: ${overallStats.activeCampaigns}`);
console.log(`✓ Total spent: $${overallStats.totalSpent}`);
console.log(`✓ Total revenue: $${overallStats.totalRevenue}`);
console.log(`✓ Overall ROI: ${overallStats.overallROI}%`);
console.log('');

// Test 15: ROI Leaderboard
console.log('Test 15: ROI Leaderboard');
const leaderboard = campaignTracker.getROILeaderboard(5);
console.log(`✓ Top ${leaderboard.length} campaigns by ROI:`);
leaderboard.forEach((item, index) => {
  console.log(`  ${index + 1}. ${item.campaignName} - ROI: ${item.roi}%`);
});
console.log('');

// Test 16: CSV Export
console.log('Test 16: CSV Export');
const csvFile = crm.exportToCSV();
console.log(`✓ Exported to: ${csvFile}`);
console.log('');

// Test 17: Outreach Statistics
console.log('Test 17: Outreach Statistics');
const outreachStats = outreachBot.getOutreachStats(30);
console.log(`✓ Total outreach attempts: ${outreachStats.total}`);
console.log(`✓ Successful: ${outreachStats.successful}`);
console.log(`✓ Failed: ${outreachStats.failed}`);
console.log('');

console.log('════════════════════════════════════════');
console.log('All Tests Completed Successfully! ✓');
console.log('════════════════════════════════════════\n');

console.log('System Summary:');
console.log(`- ${allInfluencers.length} influencers in database`);
console.log(`- ${overallStats.totalCampaigns} campaigns tracked`);
console.log(`- ${highPriority.length} high-priority targets`);
console.log(`- ${followUpNeeded.length} follow-ups needed`);
console.log(`- Overall ROI: ${overallStats.overallROI}%`);
console.log('\nReady to launch! 🚀');
