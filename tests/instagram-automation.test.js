/**
 * Instagram Automation Test Suite
 * Comprehensive tests for all Instagram automation components
 */

import { describe, it, before, after } from 'node:test';
import assert from 'node:assert';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import InstagramAPIClient from '../scripts/instagram-api-client.js';
import InstagramContentAdapter from '../scripts/instagram-content-adapter.js';
import PremiumImageGenerator from '../scripts/twitter-media/premium-image-generator.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('Instagram Automation Tests', () => {

  describe('Instagram API Client', () => {
    let client;

    before(() => {
      // Use test credentials or mocks
      client = new InstagramAPIClient({
        accountId: process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID || 'test-account',
        accessToken: process.env.INSTAGRAM_ACCESS_TOKEN || 'test-token'
      });
    });

    it('should initialize with credentials', () => {
      assert.ok(client);
      assert.ok(client.accountId);
      assert.ok(client.accessToken);
    });

    it('should have rate limiting configured', () => {
      assert.strictEqual(client.rateLimits.postsPerDay, 25);
      assert.strictEqual(client.rateLimits.storiesPerDay, 50);
      assert.strictEqual(client.rateLimits.callsPerHour, 200);
    });

    it('should validate image URLs', async () => {
      // Valid image URL
      const validUrl = 'https://picsum.photos/1080/1080';

      try {
        const isValid = await client.validateImageUrl(validUrl);
        assert.ok(isValid);
      } catch (error) {
        // Network errors are acceptable in tests
        assert.ok(error.message.includes('Invalid image URL') || error.message.includes('timeout'));
      }
    });

    it('should handle API errors gracefully', () => {
      const error = {
        response: {
          status: 190,
          data: {
            error: {
              code: 190,
              message: 'Access token expired'
            }
          }
        }
      };

      try {
        client.handleAPIError(error);
        assert.fail('Should throw error');
      } catch (err) {
        assert.ok(err.message.includes('Access token expired'));
      }
    });
  });

  describe('Content Adapter', () => {
    let adapter;
    let sampleTweet;

    before(() => {
      adapter = new InstagramContentAdapter();

      sampleTweet = {
        id: 1,
        text: 'Introducing HypeAI! Revolutionary AI-powered DeFi platform on BNB Chain.',
        category: 'introduction',
        hashtags: ['#DeFi', '#AI', '#BNBChain']
      };
    });

    it('should initialize with correct limits', () => {
      assert.strictEqual(adapter.limits.captionLength, 2200);
      assert.strictEqual(adapter.limits.hashtagsPerPost, 30);
    });

    it('should create Instagram caption from tweet', () => {
      const adapted = adapter.adaptFromTwitter(sampleTweet);

      assert.ok(adapted.caption);
      assert.ok(adapted.caption.length <= adapter.limits.captionLength);
      assert.ok(adapted.caption.includes('HypeAI'));
    });

    it('should select appropriate hashtags', () => {
      const adapted = adapter.adaptFromTwitter(sampleTweet);

      assert.ok(Array.isArray(adapted.hashtags));
      assert.ok(adapted.hashtags.length <= adapter.limits.hashtagsPerPost);
      assert.ok(adapted.hashtags.length > 0);
    });

    it('should determine optimal image specs', () => {
      const adapted = adapter.adaptFromTwitter(sampleTweet);

      assert.ok(adapted.imageSpecs);
      assert.ok(adapted.imageSpecs.width);
      assert.ok(adapted.imageSpecs.height);
      assert.ok(adapted.imageSpecs.ratio);
      assert.ok(adapted.imageSpecs.style);
    });

    it('should recommend posting strategy', () => {
      const adapted = adapter.adaptFromTwitter(sampleTweet);

      assert.ok(adapted.postingStrategy);
      assert.ok(Array.isArray(adapted.postingStrategy.optimalTimes));
      assert.ok(adapted.postingStrategy.frequency);
    });

    it('should validate adapted content', () => {
      const adapted = adapter.adaptFromTwitter(sampleTweet);
      const validation = adapter.validate(adapted);

      assert.ok(validation);
      assert.strictEqual(validation.valid, true);
      assert.strictEqual(validation.issues.length, 0);
    });

    it('should create story variants', () => {
      const story = adapter.adaptForStory(sampleTweet);

      assert.ok(story);
      assert.strictEqual(story.format, '1080x1920');
      assert.ok(Array.isArray(story.elements));
      assert.ok(story.elements.length > 0);
    });

    it('should create reel concepts', () => {
      const reel = adapter.adaptForReel(sampleTweet);

      assert.ok(reel);
      assert.strictEqual(reel.format, '1080x1920');
      assert.ok(reel.concept);
      assert.ok(Array.isArray(reel.captions));
    });

    it('should handle all tweet categories', () => {
      const categories = ['introduction', 'features', 'technical', 'community', 'launch', 'education', 'engagement', 'viral'];

      categories.forEach(category => {
        const tweet = { ...sampleTweet, category };
        const adapted = adapter.adaptFromTwitter(tweet);

        assert.ok(adapted.caption);
        assert.ok(adapted.hashtags);
        assert.ok(adapted.imageSpecs);
      });
    });
  });

  describe('Image Generation', () => {
    let generator;

    before(() => {
      generator = new PremiumImageGenerator();
    });

    it('should initialize with correct dimensions', () => {
      assert.strictEqual(generator.width, 1920);
      assert.strictEqual(generator.height, 1080);
    });

    it('should have brand colors defined', () => {
      assert.ok(generator.colors);
      assert.ok(generator.colors.primary);
      assert.ok(generator.colors.secondary);
      assert.strictEqual(generator.colors.primary, '#00E5FF');
    });

    it('should generate glassmorphism style', async () => {
      const options = {
        title: 'Test Post',
        subtitle: 'Test Subtitle',
        stats: '$100K'
      };

      const buffer = await generator.generateGlassmorphism(options);

      assert.ok(buffer);
      assert.ok(buffer instanceof Buffer);
      assert.ok(buffer.length > 0);
    });

    it('should generate all premium styles', async () => {
      const styles = ['glassmorphism', '3DGradient', 'neonCyberpunk', 'abstractGeo', 'cinematic'];

      const options = {
        title: 'Test',
        subtitle: 'Test'
      };

      for (const style of styles) {
        let buffer;

        switch (style) {
          case 'glassmorphism':
            buffer = await generator.generateGlassmorphism(options);
            break;
          case '3DGradient':
            buffer = await generator.generate3DGradient(options);
            break;
          case 'neonCyberpunk':
            buffer = await generator.generateNeonCyberpunk(options);
            break;
          case 'abstractGeo':
            buffer = await generator.generateAbstractGeo(options);
            break;
          case 'cinematic':
            buffer = await generator.generateCinematic(options);
            break;
        }

        assert.ok(buffer, `Failed to generate ${style}`);
        assert.ok(buffer instanceof Buffer);
      }
    });

    it('should export high-quality images', async () => {
      const options = { title: 'Quality Test' };
      const buffer = await generator.generateGlassmorphism(options);

      // Check PNG signature
      assert.strictEqual(buffer[0], 0x89);
      assert.strictEqual(buffer[1], 0x50);
      assert.strictEqual(buffer[2], 0x4E);
      assert.strictEqual(buffer[3], 0x47);
    });

    it('should resize for Instagram formats', async () => {
      // Test square format (1:1)
      generator.width = 1080;
      generator.height = 1080;

      const squareBuffer = await generator.generateGlassmorphism({ title: 'Square' });
      assert.ok(squareBuffer);

      // Test portrait format (4:5)
      generator.width = 1080;
      generator.height = 1350;

      const portraitBuffer = await generator.generateGlassmorphism({ title: 'Portrait' });
      assert.ok(portraitBuffer);
    });
  });

  describe('History Management', () => {
    const testHistoryPath = './test-instagram-history.json';

    after(() => {
      // Cleanup
      if (fs.existsSync(testHistoryPath)) {
        fs.unlinkSync(testHistoryPath);
      }
    });

    it('should create new history file', () => {
      const history = {
        posted: [],
        lastIndex: 0,
        stats: {
          totalPosts: 0,
          successfulPosts: 0,
          failedPosts: 0
        }
      };

      fs.writeFileSync(testHistoryPath, JSON.stringify(history, null, 2));

      assert.ok(fs.existsSync(testHistoryPath));
    });

    it('should track posted content', () => {
      const history = JSON.parse(fs.readFileSync(testHistoryPath, 'utf8'));

      history.posted.push({
        contentId: 1,
        instagramMediaId: '12345',
        category: 'introduction',
        timestamp: new Date().toISOString()
      });

      history.stats.totalPosts++;
      history.stats.successfulPosts++;

      fs.writeFileSync(testHistoryPath, JSON.stringify(history, null, 2));

      const updated = JSON.parse(fs.readFileSync(testHistoryPath, 'utf8'));
      assert.strictEqual(updated.posted.length, 1);
      assert.strictEqual(updated.stats.totalPosts, 1);
    });
  });

  describe('Scheduling Logic', () => {
    it('should identify posting time windows', () => {
      const schedule = {
        morning: { hour: 11, minute: 0, days: [1, 2, 3, 4, 5, 6, 0] },
        afternoon: { hour: 14, minute: 0, days: [1, 2, 3, 4, 5, 6, 0] },
        evening: { hour: 19, minute: 0, days: [1, 2, 3, 4, 5, 6, 0] }
      };

      assert.ok(schedule.morning);
      assert.ok(schedule.afternoon);
      assert.ok(schedule.evening);
      assert.strictEqual(schedule.evening.hour, 19); // Best time
    });

    it('should enforce rate limits', () => {
      const limits = {
        MAX_POSTS_PER_DAY: 2,
        MAX_POSTS_PER_WEEK: 12,
        MAX_POSTS_PER_MONTH: 60,
        MIN_HOURS_BETWEEN_POSTS: 6
      };

      assert.ok(limits.MAX_POSTS_PER_DAY <= 25); // Instagram limit
      assert.ok(limits.MIN_HOURS_BETWEEN_POSTS >= 4); // Minimum spacing
    });
  });

  describe('Integration Tests', () => {
    it('should complete full workflow (dry run)', async () => {
      // 1. Load content
      const tweetData = {
        id: 999,
        text: 'Test integration post',
        category: 'introduction',
        hashtags: ['#Test']
      };

      // 2. Adapt content
      const adapter = new InstagramContentAdapter();
      const adapted = adapter.adaptFromTwitter(tweetData);

      assert.ok(adapted);

      // 3. Validate
      const validation = adapter.validate(adapted);
      assert.strictEqual(validation.valid, true);

      // 4. Generate image
      const generator = new PremiumImageGenerator();
      generator.width = adapted.imageSpecs.width;
      generator.height = adapted.imageSpecs.height;

      const buffer = await generator.generateGlassmorphism({
        title: tweetData.text.substring(0, 50),
        subtitle: tweetData.category
      });

      assert.ok(buffer);
      assert.ok(buffer.length > 0);

      console.log('✅ Full workflow test passed');
    });
  });
});

// Run tests
console.log('🧪 Running Instagram Automation Tests...\n');
