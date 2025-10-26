#!/usr/bin/env node

/**
 * Threads Integration Test Suite
 * Comprehensive tests for all Threads automation components
 */

const assert = require('assert');
const fs = require('fs').promises;
const path = require('path');

// Mock API responses
const mockThreadsAPI = {
  me: { id: '123456', username: 'test_user' },
  createContainer: { id: 'container_123' },
  publish: { id: 'post_123' },
  insights: { views: 100, likes: 10, replies: 2, reposts: 1, quotes: 0 }
};

// Test suites
const tests = {
  apiClient: [],
  contentAdapter: [],
  autoPoster: [],
  scheduler: [],
  analytics: [],
  multiPlatform: [],
  crossPost: []
};

let passedTests = 0;
let failedTests = 0;

// Helper: Test runner
async function runTest(name, fn) {
  try {
    await fn();
    console.log(`✅ ${name}`);
    passedTests++;
    return true;
  } catch (error) {
    console.error(`❌ ${name}: ${error.message}`);
    failedTests++;
    return false;
  }
}

// Helper: Mock HTTP requests
function mockHTTP() {
  // Simple mock - in production use nock or similar
  return {
    get: async () => mockThreadsAPI.me,
    post: async () => mockThreadsAPI.createContainer
  };
}

// ============================================
// TEST SUITE 1: API CLIENT
// ============================================

console.log('\n📦 Testing: Threads API Client\n');

tests.apiClient.push(async () => {
  await runTest('API Client: Initialize in API mode', async () => {
    const ThreadsAPIClient = require('../../scripts/threads/threads-api-client');
    const client = new ThreadsAPIClient({ mode: 'api', accessToken: 'test_token', userId: '123' });

    assert(client.mode === 'api', 'Mode should be api');
    assert(client.accessToken === 'test_token', 'Token should be set');
  });

  await runTest('API Client: Initialize in manual mode', async () => {
    const ThreadsAPIClient = require('../../scripts/threads/threads-api-client');
    const client = new ThreadsAPIClient({ mode: 'manual' });

    const init = await client.initialize();
    assert(init.mode === 'manual', 'Should initialize in manual mode');
    assert(init.valid === true, 'Manual mode should be valid');
  });

  await runTest('API Client: Rate limit tracking', async () => {
    const ThreadsAPIClient = require('../../scripts/threads/threads-api-client');
    const client = new ThreadsAPIClient({ mode: 'api' });

    const analytics = client.getAnalytics();
    assert(analytics.rateLimits.postsPerHour === 25, 'Should enforce 25 posts/hour limit');
    assert(analytics.rateLimits.postsPerDay === 250, 'Should enforce 250 posts/day limit');
  });

  await runTest('API Client: Manual mode creates workflow files', async () => {
    const ThreadsAPIClient = require('../../scripts/threads/threads-api-client');
    const client = new ThreadsAPIClient({ mode: 'manual' });
    await client.initialize();

    const result = await client.createPost('Test content');
    assert(result.mode === 'manual', 'Should use manual mode');
    assert(result.workflowFile, 'Should create workflow file');
  });
});

// ============================================
// TEST SUITE 2: CONTENT ADAPTER
// ============================================

console.log('\n✍️  Testing: Content Adapter\n');

tests.contentAdapter.push(async () => {
  await runTest('Content Adapter: Enforce 500 character limit', async () => {
    const ThreadsContentAdapter = require('../../scripts/threads/threads-content-adapter');
    const adapter = new ThreadsContentAdapter();

    const longContent = 'a'.repeat(600);
    const adapted = adapter.enforceCharacterLimit(longContent);

    assert(adapted.length <= 500, 'Should truncate to 500 chars');
  });

  await runTest('Content Adapter: Optimize hashtags to max 3', async () => {
    const ThreadsContentAdapter = require('../../scripts/threads/threads-content-adapter');
    const adapter = new ThreadsContentAdapter({ maxHashtags: 3 });

    const content = 'Test #AI #Crypto #Web3 #DeFi #NFT #Blockchain';
    const optimized = adapter.optimizeHashtags(content);

    const hashtagCount = (optimized.match(/#\w+/g) || []).length;
    assert(hashtagCount <= 3, 'Should limit to 3 hashtags');
  });

  await runTest('Content Adapter: Validate content', async () => {
    const ThreadsContentAdapter = require('../../scripts/threads/threads-content-adapter');
    const adapter = new ThreadsContentAdapter();

    const validation = adapter.validate('Valid content with good length #AI #Crypto');
    assert(validation.valid === true, 'Valid content should pass');

    const tooLong = adapter.validate('a'.repeat(600));
    assert(tooLong.valid === false, 'Too long content should fail');
  });

  await runTest('Content Adapter: Add relevant emoji', async () => {
    const ThreadsContentAdapter = require('../../scripts/threads/threads-content-adapter');
    const adapter = new ThreadsContentAdapter();

    const content = 'Launch new feature';
    const withEmoji = adapter.optimizeEmojis(content);

    const emojiCount = (withEmoji.match(/[\p{Emoji}]/gu) || []).length;
    assert(emojiCount > 0, 'Should add emoji to content without any');
  });
});

// ============================================
// TEST SUITE 3: AUTO-POSTER
// ============================================

console.log('\n📤 Testing: Auto-Poster\n');

tests.autoPoster.push(async () => {
  await runTest('Auto-Poster: Initialize with manual mode', async () => {
    const ThreadsAutoPoster = require('../../scripts/threads/threads-auto-poster');
    const poster = new ThreadsAutoPoster({ autoPost: true });

    const init = await poster.initialize();
    assert(init, 'Should initialize successfully');
  });

  await runTest('Auto-Poster: Detect duplicate content', async () => {
    const ThreadsAutoPoster = require('../../scripts/threads/threads-auto-poster');
    const poster = new ThreadsAutoPoster();
    await poster.initialize();

    // Mock history
    poster.history = {
      threads: [{
        content: 'Test content',
        timestamp: new Date().toISOString()
      }]
    };

    const isDupe = await poster.isDuplicate('Test content');
    assert(isDupe === true, 'Should detect duplicate content');
  });

  await runTest('Auto-Poster: Calculate content similarity', async () => {
    const ThreadsAutoPoster = require('../../scripts/threads/threads-auto-poster');
    const poster = new ThreadsAutoPoster();

    const similarity = poster.calculateSimilarity(
      'Hello world test',
      'Hello world test'
    );
    assert(similarity === 1.0, 'Identical content should have similarity 1.0');

    const partial = poster.calculateSimilarity(
      'Hello world',
      'Goodbye world'
    );
    assert(partial > 0 && partial < 1, 'Partial match should be between 0 and 1');
  });

  await runTest('Auto-Poster: Schedule post', async () => {
    const ThreadsAutoPoster = require('../../scripts/threads/threads-auto-poster');
    const poster = new ThreadsAutoPoster();
    await poster.initialize();

    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const scheduled = await poster.schedulePost('Test content', tomorrow);

    assert(scheduled.status === 'scheduled', 'Should be scheduled');
    assert(scheduled.id, 'Should have ID');
  });
});

// ============================================
// TEST SUITE 4: SCHEDULER
// ============================================

console.log('\n📅 Testing: Scheduler\n');

tests.scheduler.push(async () => {
  await runTest('Scheduler: Detect content type', async () => {
    const ThreadsScheduler = require('../../scripts/threads/threads-scheduler');
    const scheduler = new ThreadsScheduler();

    assert(scheduler.detectContentType('Learn how to trade') === 'educational');
    assert(scheduler.detectContentType('Breaking news: Launch') === 'news');
    assert(scheduler.detectContentType('What do you think?') === 'engagement');
  });

  await runTest('Scheduler: Generate candidate times', async () => {
    const ThreadsScheduler = require('../../scripts/threads/threads-scheduler');
    const scheduler = new ThreadsScheduler();

    const candidates = scheduler.generateCandidateTimes(new Date(), 7);
    assert(candidates.length > 0, 'Should generate candidate times');
    assert(candidates.length <= 7 * 4, 'Should respect day limit');
  });

  await runTest('Scheduler: Calculate time score', async () => {
    const ThreadsScheduler = require('../../scripts/threads/threads-scheduler');
    const scheduler = new ThreadsScheduler();

    // 12:30pm on weekday should have high score
    const time = new Date();
    time.setHours(12, 30, 0, 0);
    time.setDate(time.getDate() + (8 - time.getDay()) % 7); // Next Monday

    const score = scheduler.calculateTimeScore(time, 'news', []);
    assert(score > 0.5, 'Optimal time should have good score');
  });

  await runTest('Scheduler: Find optimal time slot', async () => {
    const ThreadsScheduler = require('../../scripts/threads/threads-scheduler');
    const scheduler = new ThreadsScheduler();

    const optimal = await scheduler.findOptimalTimeSlot(new Date(), 'educational', 'normal');
    assert(optimal, 'Should find optimal time');
    assert(optimal.score > 0, 'Should have positive score');
  });
});

// ============================================
// TEST SUITE 5: ANALYTICS
// ============================================

console.log('\n📊 Testing: Analytics\n');

tests.analytics.push(async () => {
  await runTest('Analytics: Initialize', async () => {
    const ThreadsAnalytics = require('../../scripts/threads/threads-analytics');
    const analytics = new ThreadsAnalytics({ mode: 'manual' });

    const init = await analytics.initialize();
    assert(init.initialized === true, 'Should initialize');
  });

  await runTest('Analytics: Calculate engagement rate', async () => {
    const ThreadsAnalytics = require('../../scripts/threads/threads-analytics');
    const analytics = new ThreadsAnalytics();

    const rate = analytics.calculateEngagementRate({
      views: 1000,
      likes: 50,
      replies: 10,
      reposts: 5,
      quotes: 2
    });

    assert(rate === 6.7, 'Should calculate correct engagement rate');
  });

  await runTest('Analytics: Calculate post score', async () => {
    const ThreadsAnalytics = require('../../scripts/threads/threads-analytics');
    const analytics = new ThreadsAnalytics();

    const score = analytics.calculatePostScore({
      views: 1000,
      likes: 50,
      replies: 10,
      reposts: 5,
      quotes: 2
    });

    assert(score > 0, 'Should calculate positive score');
    assert(score === 1000 + 500 + 200 + 150 + 50, 'Should weight metrics correctly');
  });

  await runTest('Analytics: Detect content type', async () => {
    const ThreadsAnalytics = require('../../scripts/threads/threads-analytics');
    const analytics = new ThreadsAnalytics();

    assert(analytics.detectContentType('Learn how') === 'educational');
    assert(analytics.detectContentType('Announcing launch') === 'news');
  });
});

// ============================================
// TEST SUITE 6: MULTI-PLATFORM
// ============================================

console.log('\n🌐 Testing: Multi-Platform Poster\n');

tests.multiPlatform.push(async () => {
  await runTest('Multi-Platform: Initialize', async () => {
    const MultiPlatformPoster = require('../../scripts/multi-platform/multi-platform-poster');
    const poster = new MultiPlatformPoster({
      platforms: ['threads'],
      staggerPosts: 2
    });

    assert(poster.config.staggerPosts === 2, 'Should set stagger time');
    assert(poster.config.platforms.includes('threads'), 'Should include threads');
  });

  await runTest('Multi-Platform: Adapt content for platform', async () => {
    const MultiPlatformPoster = require('../../scripts/multi-platform/multi-platform-poster');
    const poster = new MultiPlatformPoster();

    const longContent = 'a'.repeat(300);
    const forTwitter = poster.adaptContentForPlatform(longContent, 'twitter');
    const forThreads = poster.adaptContentForPlatform(longContent, 'threads');

    assert(forTwitter.length <= 280, 'Twitter content should be 280 chars max');
    assert(forThreads.length <= 500, 'Threads content should be 500 chars max');
  });

  await runTest('Multi-Platform: Instagram requires media', async () => {
    const MultiPlatformPoster = require('../../scripts/multi-platform/multi-platform-poster');
    const poster = new MultiPlatformPoster();
    await poster.initialize();

    try {
      await poster.postToInstagram('Content without media');
      assert(false, 'Should throw error for Instagram without media');
    } catch (error) {
      assert(error.message.includes('requires media'), 'Should require media for Instagram');
    }
  });
});

// ============================================
// TEST SUITE 7: CROSS-POST MONITOR
// ============================================

console.log('\n🔄 Testing: Cross-Post Monitor\n');

tests.crossPost.push(async () => {
  await runTest('Cross-Post: Initialize', async () => {
    const CrossPostMonitor = require('../../scripts/cross-post-monitor');
    const monitor = new CrossPostMonitor({
      minEngagement: 5,
      delayMinutes: 30
    });

    assert(monitor.minEngagement === 5, 'Should set min engagement');
    assert(monitor.delayMinutes === 30, 'Should set delay');
  });

  await runTest('Cross-Post: Load and save state', async () => {
    const CrossPostMonitor = require('../../scripts/cross-post-monitor');
    const monitor = new CrossPostMonitor();

    monitor.state = { crossPosted: ['123', '456'], lastCheck: new Date().toISOString() };
    await monitor.saveState();

    const loaded = await monitor.loadState();
    assert(loaded.crossPosted.includes('123'), 'Should save and load state');
  });
});

// ============================================
// RUN ALL TESTS
// ============================================

(async () => {
  console.log('\n🧪 THREADS AUTOMATION TEST SUITE\n');
  console.log('═'.repeat(50));

  // Run all test suites
  for (const suite of tests.apiClient) await suite();
  for (const suite of tests.contentAdapter) await suite();
  for (const suite of tests.autoPoster) await suite();
  for (const suite of tests.scheduler) await suite();
  for (const suite of tests.analytics) await suite();
  for (const suite of tests.multiPlatform) await suite();
  for (const suite of tests.crossPost) await suite();

  // Summary
  console.log('\n' + '═'.repeat(50));
  console.log(`\n📊 TEST RESULTS\n`);
  console.log(`✅ Passed: ${passedTests}`);
  console.log(`❌ Failed: ${failedTests}`);
  console.log(`📈 Success Rate: ${Math.round((passedTests / (passedTests + failedTests)) * 100)}%\n`);

  if (failedTests > 0) {
    console.error('❌ Some tests failed. Please fix before deploying.\n');
    process.exit(1);
  } else {
    console.log('✅ All tests passed! System ready for deployment.\n');
    process.exit(0);
  }
})();
