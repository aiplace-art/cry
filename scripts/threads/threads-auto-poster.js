#!/usr/bin/env node

/**
 * Threads Auto-Poster
 * Automated posting system with API + manual workflow modes
 * Integrates with existing Twitter content strategy
 */

import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import ThreadsAPIClient from './threads-api-client.js';
import ThreadsContentAdapter from './threads-content-adapter.js';
import fs from 'fs/promises';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env.marketing') });

class ThreadsAutoPoster {
  constructor(options = {}) {
    this.client = new ThreadsAPIClient(options);
    this.adapter = new ThreadsContentAdapter();
    this.historyFile = path.join(__dirname, '../../data/project-coordination/posting-history.json');
    this.contentQueueFile = path.join(__dirname, '../threads/content-queue.json');
    this.config = {
      autoPost: options.autoPost !== false,
      syncWithTwitter: options.syncWithTwitter !== false,
      scheduleEnabled: options.scheduleEnabled !== false,
      ...options
    };
  }

  /**
   * Initialize the auto-poster
   */
  async initialize() {
    console.log('🚀 Initializing Threads Auto-Poster');

    const initResult = await this.client.initialize();

    if (!initResult.valid && this.client.mode === 'api') {
      console.warn('⚠️  API mode unavailable. Switching to manual workflow.');
      this.client.mode = 'manual';
      await this.client.initialize();
    }

    // Load posting history
    this.history = await this.loadHistory();

    // Load content queue
    this.contentQueue = await this.loadContentQueue();

    console.log(`✅ Auto-poster initialized (${this.client.mode} mode)`);
    return initResult;
  }

  /**
   * Post to Threads
   */
  async post(content, options = {}) {
    console.log('📤 Posting to Threads');

    // Adapt content for Threads
    const threadsContent = options.fromTwitter
      ? this.adapter.adaptFromTwitter(content)
      : content;

    // Validate content
    const validation = this.adapter.validate(threadsContent);
    if (!validation.valid) {
      console.error('❌ Content validation failed:', validation.issues);
      throw new Error('Invalid content: ' + validation.issues.join(', '));
    }

    // Check if already posted (deduplication)
    if (await this.isDuplicate(threadsContent)) {
      console.warn('⚠️  Similar content already posted recently. Skipping.');
      return { success: false, reason: 'duplicate' };
    }

    // Post via client
    const result = await this.client.createPost(threadsContent, options);

    // Save to history
    await this.saveToHistory({
      platform: 'Threads',
      content: threadsContent,
      result,
      timestamp: new Date().toISOString(),
      mode: this.client.mode
    });

    console.log('✅ Posted successfully!');
    return result;
  }

  /**
   * Cross-post from Twitter to Threads
   */
  async crossPostFromTwitter(twitterPost) {
    console.log('🔄 Cross-posting from Twitter to Threads');

    if (!this.config.syncWithTwitter) {
      console.log('ℹ️  Twitter sync disabled');
      return null;
    }

    // Check if already cross-posted
    if (await this.isAlreadyCrossPosted(twitterPost.id)) {
      console.log('ℹ️  Already cross-posted');
      return null;
    }

    // Wait for Twitter engagement before cross-posting (optional)
    if (this.config.waitForEngagement) {
      const shouldCrossPost = await this.checkTwitterEngagement(twitterPost);
      if (!shouldCrossPost) {
        console.log('ℹ️  Waiting for more Twitter engagement');
        return null;
      }
    }

    // Cross-post
    const result = await this.post(twitterPost.content, {
      fromTwitter: true,
      twitterPostId: twitterPost.id,
      mediaUrl: twitterPost.mediaUrl
    });

    return result;
  }

  /**
   * Schedule post for later
   */
  async schedulePost(content, scheduledTime, options = {}) {
    console.log(`📅 Scheduling post for ${scheduledTime}`);

    const scheduledPost = {
      id: `scheduled_${Date.now()}`,
      content,
      scheduledTime: new Date(scheduledTime).toISOString(),
      options,
      status: 'scheduled',
      createdAt: new Date().toISOString()
    };

    this.contentQueue.push(scheduledPost);
    await this.saveContentQueue();

    console.log(`✅ Post scheduled (ID: ${scheduledPost.id})`);
    return scheduledPost;
  }

  /**
   * Process scheduled posts
   */
  async processScheduledPosts() {
    console.log('⏰ Processing scheduled posts');

    const now = new Date();
    const duePosts = this.contentQueue.filter(post =>
      post.status === 'scheduled' && new Date(post.scheduledTime) <= now
    );

    console.log(`📊 Found ${duePosts.length} posts due for posting`);

    for (const post of duePosts) {
      try {
        console.log(`📤 Processing scheduled post: ${post.id}`);

        const result = await this.post(post.content, post.options);

        // Update status
        post.status = 'posted';
        post.postedAt = new Date().toISOString();
        post.result = result;

        await this.saveContentQueue();

        // Rate limiting - wait between posts
        if (duePosts.indexOf(post) < duePosts.length - 1) {
          console.log('⏳ Waiting 60s before next post...');
          await new Promise(resolve => setTimeout(resolve, 60000));
        }

      } catch (error) {
        console.error(`❌ Failed to post scheduled content:`, error);
        post.status = 'failed';
        post.error = error.message;
        await this.saveContentQueue();
      }
    }

    // Cleanup old completed posts
    this.contentQueue = this.contentQueue.filter(post => {
      if (post.status === 'posted') {
        const age = now - new Date(post.postedAt);
        return age < 7 * 24 * 60 * 60 * 1000; // Keep for 7 days
      }
      return true;
    });

    await this.saveContentQueue();

    console.log('✅ Scheduled posts processed');
  }

  /**
   * Check for duplicate content
   */
  async isDuplicate(content) {
    // Check last 24 hours of posts
    const dayAgo = Date.now() - 24 * 60 * 60 * 1000;
    const recentPosts = this.history.threads?.filter(post =>
      new Date(post.timestamp) > dayAgo
    ) || [];

    // Simple similarity check (can be enhanced)
    for (const post of recentPosts) {
      const similarity = this.calculateSimilarity(content, post.content);
      if (similarity > 0.8) {
        return true;
      }
    }

    return false;
  }

  /**
   * Calculate content similarity (0-1)
   */
  calculateSimilarity(text1, text2) {
    // Simple word-based similarity
    const words1 = new Set(text1.toLowerCase().split(/\s+/));
    const words2 = new Set(text2.toLowerCase().split(/\s+/));

    const intersection = new Set([...words1].filter(w => words2.has(w)));
    const union = new Set([...words1, ...words2]);

    return intersection.size / union.size;
  }

  /**
   * Check if Twitter post already cross-posted
   */
  async isAlreadyCrossPosted(twitterPostId) {
    const crossPosts = this.history.threads?.filter(post =>
      post.result?.twitterPostId === twitterPostId
    ) || [];

    return crossPosts.length > 0;
  }

  /**
   * Check Twitter engagement before cross-posting
   */
  async checkTwitterEngagement(twitterPost) {
    // Optional: Only cross-post if Twitter post has good engagement
    const minLikes = 5;
    const minRetweets = 2;

    return twitterPost.likes >= minLikes || twitterPost.retweets >= minRetweets;
  }

  /**
   * Load posting history
   */
  async loadHistory() {
    try {
      const data = await fs.readFile(this.historyFile, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      console.log('ℹ️  No posting history found, creating new');
      return { threads: [], twitter: [], lastUpdated: new Date().toISOString() };
    }
  }

  /**
   * Save to posting history
   */
  async saveToHistory(entry) {
    if (!this.history.threads) {
      this.history.threads = [];
    }

    this.history.threads.push(entry);
    this.history.lastUpdated = new Date().toISOString();

    await fs.writeFile(this.historyFile, JSON.stringify(this.history, null, 2));
  }

  /**
   * Load content queue
   */
  async loadContentQueue() {
    try {
      const data = await fs.readFile(this.contentQueueFile, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      return [];
    }
  }

  /**
   * Save content queue
   */
  async saveContentQueue() {
    await fs.writeFile(this.contentQueueFile, JSON.stringify(this.contentQueue, null, 2));
  }

  /**
   * Get posting statistics
   */
  getStatistics() {
    const threadsPosts = this.history.threads || [];
    const last24h = threadsPosts.filter(post =>
      Date.now() - new Date(post.timestamp) < 24 * 60 * 60 * 1000
    );
    const last7d = threadsPosts.filter(post =>
      Date.now() - new Date(post.timestamp) < 7 * 24 * 60 * 60 * 1000
    );

    return {
      total: threadsPosts.length,
      last24h: last24h.length,
      last7d: last7d.length,
      scheduled: this.contentQueue.filter(p => p.status === 'scheduled').length,
      failed: this.contentQueue.filter(p => p.status === 'failed').length,
      mode: this.client.mode
    };
  }
}

export default ThreadsAutoPoster;

// CLI usage
if (import.meta.url === `file://${process.argv[1]}`) {
  (async () => {
    const poster = new ThreadsAutoPoster();
    await poster.initialize();

    const command = process.argv[2];

    switch (command) {
      case 'post':
        const content = process.argv[3];
        if (!content) {
          console.error('Usage: node threads-auto-poster.js post "Your content here"');
          process.exit(1);
        }
        const result = await poster.post(content);
        console.log('Result:', JSON.stringify(result, null, 2));
        break;

      case 'schedule':
        const schedContent = process.argv[3];
        const schedTime = process.argv[4];
        if (!schedContent || !schedTime) {
          console.error('Usage: node threads-auto-poster.js schedule "Content" "2025-10-26T10:00:00Z"');
          process.exit(1);
        }
        await poster.schedulePost(schedContent, schedTime);
        break;

      case 'process':
        await poster.processScheduledPosts();
        break;

      case 'stats':
        console.log('Statistics:', JSON.stringify(poster.getStatistics(), null, 2));
        break;

      default:
        console.log('Commands: post, schedule, process, stats');
    }
  })();
}
