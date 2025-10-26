#!/usr/bin/env node

/**
 * Multi-Platform Poster
 * Unified posting system for Twitter + Instagram + Threads
 * Handles cross-platform content adaptation and synchronization
 */

import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { TwitterApi } from 'twitter-api-v2';
import ThreadsAutoPoster from '../threads/threads-auto-poster.js';
import fs from 'fs/promises';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env.marketing') });

class MultiPlatformPoster {
  constructor(options = {}) {
    // Initialize platform clients
    this.twitter = new TwitterApi({
      appKey: process.env.TWITTER_API_KEY,
      appSecret: process.env.TWITTER_API_SECRET,
      accessToken: process.env.TWITTER_ACCESS_TOKEN,
      accessSecret: process.env.TWITTER_ACCESS_SECRET
    });

    this.threads = new ThreadsAutoPoster(options.threads || {});

    // Instagram (via Threads API or manual)
    this.instagramEnabled = options.instagramEnabled || false;

    // Configuration
    this.config = {
      platforms: options.platforms || ['twitter', 'threads'],
      adaptContent: options.adaptContent !== false,
      syncSchedules: options.syncSchedules !== false,
      staggerPosts: options.staggerPosts || 0, // Minutes between platforms
      ...options
    };

    this.historyFile = path.join(__dirname, '../../data/project-coordination/posting-history.json');
  }

  /**
   * Initialize all platform connections
   */
  async initialize() {
    console.log('🚀 Initializing Multi-Platform Poster');

    const results = {};

    // Test Twitter connection
    if (this.config.platforms.includes('twitter')) {
      try {
        const me = await this.twitter.v2.me();
        console.log(`✅ Twitter: @${me.data.username}`);
        results.twitter = { connected: true, username: me.data.username };
      } catch (error) {
        console.error('❌ Twitter connection failed:', error.message);
        results.twitter = { connected: false, error: error.message };
      }
    }

    // Initialize Threads
    if (this.config.platforms.includes('threads')) {
      try {
        const threadsInit = await this.threads.initialize();
        console.log(`✅ Threads: ${threadsInit.mode} mode`);
        results.threads = threadsInit;
      } catch (error) {
        console.error('❌ Threads initialization failed:', error.message);
        results.threads = { connected: false, error: error.message };
      }
    }

    // Instagram status
    if (this.config.platforms.includes('instagram')) {
      console.log('ℹ️  Instagram: Use Threads API or Meta Business Suite');
      results.instagram = { connected: false, message: 'Manual workflow' };
    }

    return results;
  }

  /**
   * Post to multiple platforms
   */
  async postToAll(content, options = {}) {
    console.log('📤 Posting to multiple platforms');

    const platforms = options.platforms || this.config.platforms;
    const results = {};

    for (const platform of platforms) {
      try {
        console.log(`\n📱 Posting to ${platform}...`);

        // Adapt content for platform
        const adaptedContent = this.config.adaptContent
          ? this.adaptContentForPlatform(content, platform)
          : content;

        // Post to platform
        const result = await this.postToPlatform(platform, adaptedContent, options);
        results[platform] = { success: true, result };

        console.log(`✅ Posted to ${platform}`);

        // Stagger posts if configured
        if (platforms.indexOf(platform) < platforms.length - 1 && this.config.staggerPosts > 0) {
          const staggerMs = this.config.staggerPosts * 60 * 1000;
          console.log(`⏳ Waiting ${this.config.staggerPosts}m before next platform...`);
          await new Promise(resolve => setTimeout(resolve, staggerMs));
        }

      } catch (error) {
        console.error(`❌ Failed to post to ${platform}:`, error.message);
        results[platform] = { success: false, error: error.message };
      }
    }

    // Save to unified history
    await this.saveToHistory({
      content,
      platforms: results,
      timestamp: new Date().toISOString(),
      options
    });

    return results;
  }

  /**
   * Post to specific platform
   */
  async postToPlatform(platform, content, options = {}) {
    switch (platform) {
      case 'twitter':
        return await this.postToTwitter(content, options);

      case 'threads':
        return await this.threads.post(content, options);

      case 'instagram':
        return await this.postToInstagram(content, options);

      default:
        throw new Error(`Unknown platform: ${platform}`);
    }
  }

  /**
   * Post to Twitter
   */
  async postToTwitter(content, options = {}) {
    const tweetData = { text: content };

    // Add media if provided
    if (options.mediaUrl) {
      // Upload media first (simplified - needs full implementation)
      console.log('📎 Media upload for Twitter not fully implemented');
    }

    const tweet = await this.twitter.v2.tweet(tweetData);

    return {
      platform: 'twitter',
      postId: tweet.data.id,
      url: `https://twitter.com/user/status/${tweet.data.id}`,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Post to Instagram
   */
  async postToInstagram(content, options = {}) {
    // Instagram posting requires:
    // 1. Image/video (required for feed posts)
    // 2. Meta Business Account
    // 3. Graph API or manual workflow

    if (!options.mediaUrl) {
      throw new Error('Instagram requires media (image/video)');
    }

    console.log('📋 Instagram: Manual posting workflow');
    console.log('   1. Save content and media');
    console.log('   2. Post via Instagram app or Meta Business Suite');
    console.log('   3. Update posting history');

    // Save for manual workflow
    const workflowFile = path.join(__dirname, '../manual-workflows', `instagram-post-${Date.now()}.json`);
    await fs.writeFile(workflowFile, JSON.stringify({
      platform: 'instagram',
      content,
      mediaUrl: options.mediaUrl,
      instructions: [
        '1. Download media from mediaUrl',
        '2. Open Instagram app',
        '3. Create new post',
        '4. Add caption from content field',
        '5. Publish'
      ]
    }, null, 2));

    return {
      platform: 'instagram',
      mode: 'manual',
      workflowFile,
      message: 'Ready for manual posting'
    };
  }

  /**
   * Adapt content for specific platform
   */
  adaptContentForPlatform(content, platform) {
    switch (platform) {
      case 'twitter':
        // Twitter: 280 chars, casual tone
        return this.adaptForTwitter(content);

      case 'threads':
        // Threads: 500 chars, conversational
        return this.threads.adapter.adaptFromTwitter(content);

      case 'instagram':
        // Instagram: Longer captions OK, emoji-heavy
        return this.adaptForInstagram(content);

      default:
        return content;
    }
  }

  adaptForTwitter(content) {
    // Ensure within 280 chars
    if (content.length <= 280) {
      return content;
    }

    // Truncate intelligently
    const truncated = content.substring(0, 277) + '...';
    return truncated;
  }

  adaptForInstagram(content) {
    // Instagram allows longer captions and prefers emoji-rich content
    // Add more emojis if needed
    if (!(content.match(/[\p{Emoji}]/gu) || []).length < 2) {
      content = `✨ ${content}`;
    }

    // Instagram prefers hashtags at the end
    const hashtags = content.match(/#\w+/g) || [];
    const mainContent = content.replace(/#\w+/g, '').trim();

    if (hashtags.length > 0) {
      return `${mainContent}\n\n${hashtags.join(' ')}`;
    }

    return content;
  }

  /**
   * Schedule post across platforms
   */
  async scheduleMultiPlatform(content, scheduledTime, options = {}) {
    console.log('📅 Scheduling multi-platform post');

    const platforms = options.platforms || this.config.platforms;
    const results = {};

    for (const platform of platforms) {
      try {
        // Adapt content
        const adaptedContent = this.adaptContentForPlatform(content, platform);

        // Calculate staggered time
        const platformTime = new Date(scheduledTime);
        if (platforms.indexOf(platform) > 0) {
          platformTime.setMinutes(platformTime.getMinutes() + this.config.staggerPosts * platforms.indexOf(platform));
        }

        // Schedule on platform
        const result = await this.schedulePlatformPost(platform, adaptedContent, platformTime, options);
        results[platform] = { success: true, result };

      } catch (error) {
        console.error(`❌ Failed to schedule on ${platform}:`, error.message);
        results[platform] = { success: false, error: error.message };
      }
    }

    return results;
  }

  async schedulePlatformPost(platform, content, scheduledTime, options) {
    switch (platform) {
      case 'threads':
        return await this.threads.schedulePost(content, scheduledTime, options);

      case 'twitter':
        // Twitter API v2 doesn't support scheduled tweets directly
        // Would need to use external scheduler or save for manual scheduling
        console.log('ℹ️  Twitter: Save to local scheduler');
        return { platform: 'twitter', scheduledTime, status: 'local_schedule' };

      case 'instagram':
        console.log('ℹ️  Instagram: Use Meta Business Suite for scheduling');
        return { platform: 'instagram', scheduledTime, status: 'manual_schedule' };

      default:
        throw new Error(`Unknown platform: ${platform}`);
    }
  }

  /**
   * Get unified posting statistics
   */
  async getUnifiedStats() {
    const history = await this.loadHistory();

    const stats = {
      platforms: {},
      total: history.multiPlatform?.length || 0,
      last24h: 0,
      last7d: 0
    };

    const now = Date.now();
    const dayMs = 24 * 60 * 60 * 1000;

    for (const post of (history.multiPlatform || [])) {
      const age = now - new Date(post.timestamp).getTime();

      if (age < dayMs) stats.last24h++;
      if (age < 7 * dayMs) stats.last7d++;

      // Per-platform stats
      for (const [platform, result] of Object.entries(post.platforms || {})) {
        if (!stats.platforms[platform]) {
          stats.platforms[platform] = { total: 0, successful: 0, failed: 0 };
        }

        stats.platforms[platform].total++;
        if (result.success) {
          stats.platforms[platform].successful++;
        } else {
          stats.platforms[platform].failed++;
        }
      }
    }

    return stats;
  }

  /**
   * Load posting history
   */
  async loadHistory() {
    try {
      const data = await fs.readFile(this.historyFile, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      return { multiPlatform: [], twitter: [], threads: [] };
    }
  }

  /**
   * Save to posting history
   */
  async saveToHistory(entry) {
    const history = await this.loadHistory();

    if (!history.multiPlatform) {
      history.multiPlatform = [];
    }

    history.multiPlatform.push(entry);
    history.lastUpdated = new Date().toISOString();

    await fs.writeFile(this.historyFile, JSON.stringify(history, null, 2));
  }
}

export default MultiPlatformPoster;

// CLI usage
if (import.meta.url === `file://${process.argv[1]}`) {
  (async () => {
    const poster = new MultiPlatformPoster({
      platforms: ['twitter', 'threads'],
      staggerPosts: 2 // 2 minutes between platforms
    });

    await poster.initialize();

    const command = process.argv[2];

    switch (command) {
      case 'post':
        const content = process.argv[3];
        const results = await poster.postToAll(content);
        console.log('\nResults:', JSON.stringify(results, null, 2));
        break;

      case 'stats':
        const stats = await poster.getUnifiedStats();
        console.log('\nStatistics:', JSON.stringify(stats, null, 2));
        break;

      default:
        console.log('Commands: post "content", stats');
    }
  })();
}
