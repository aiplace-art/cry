#!/usr/bin/env node

/**
 * Instagram Graph API Client
 * Handles authentication, media upload, and content publishing
 * API Version: v18.0
 */

import axios from 'axios';
import fs from 'fs';
import FormData from 'form-data';
import { URL } from 'url';

const API_VERSION = 'v18.0';
const BASE_URL = `https://graph.facebook.com/${API_VERSION}`;

class InstagramAPIClient {
  constructor(config = {}) {
    this.accountId = config.accountId || process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID;
    this.accessToken = config.accessToken || process.env.INSTAGRAM_ACCESS_TOKEN;
    this.pageId = config.pageId || process.env.FACEBOOK_PAGE_ID;

    if (!this.accountId || !this.accessToken) {
      throw new Error('Instagram credentials missing. Check .env.marketing file.');
    }

    // Rate limiting
    this.rateLimits = {
      postsPerDay: 25,
      storiesPerDay: 50,
      callsPerHour: 200,
      lastCallTime: null,
      callCount: 0
    };

    // Request history for rate limit tracking
    this.requestHistory = [];
  }

  /**
   * Make authenticated API request with rate limiting
   */
  async request(endpoint, method = 'GET', params = {}, data = null) {
    // Rate limit check
    await this.checkRateLimit();

    const url = `${BASE_URL}${endpoint}`;
    const config = {
      method,
      url,
      params: {
        access_token: this.accessToken,
        ...params
      },
      headers: {
        'Content-Type': 'application/json'
      }
    };

    if (data) {
      config.data = data;
    }

    try {
      const response = await axios(config);
      this.trackRequest();
      return response.data;
    } catch (error) {
      this.handleAPIError(error);
    }
  }

  /**
   * Check and enforce rate limits
   */
  async checkRateLimit() {
    const now = Date.now();
    const oneHourAgo = now - (60 * 60 * 1000);

    // Clean old requests
    this.requestHistory = this.requestHistory.filter(time => time > oneHourAgo);

    // Check if we're at limit
    if (this.requestHistory.length >= this.rateLimits.callsPerHour) {
      const oldestRequest = this.requestHistory[0];
      const waitTime = (oldestRequest + (60 * 60 * 1000)) - now;

      if (waitTime > 0) {
        console.log(`⏳ Rate limit reached. Waiting ${Math.ceil(waitTime / 1000)}s...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }

    // Minimum 100ms between requests
    if (this.rateLimits.lastCallTime) {
      const timeSinceLastCall = now - this.rateLimits.lastCallTime;
      if (timeSinceLastCall < 100) {
        await new Promise(resolve => setTimeout(resolve, 100 - timeSinceLastCall));
      }
    }
  }

  /**
   * Track request for rate limiting
   */
  trackRequest() {
    const now = Date.now();
    this.requestHistory.push(now);
    this.rateLimits.lastCallTime = now;
  }

  /**
   * Handle API errors with detailed messages
   */
  handleAPIError(error) {
    if (error.response) {
      const { status, data } = error.response;

      // Common error codes
      const errorMessages = {
        190: 'Access token expired or invalid. Generate new token.',
        100: 'Invalid parameter. Check request data.',
        200: 'Permission denied. Verify app permissions.',
        368: 'Temporarily blocked for unusual activity.',
        4: 'Rate limit exceeded. Slow down requests.',
        32: 'Page or account not found. Verify IDs.'
      };

      const errorCode = data?.error?.code;
      const errorMsg = errorMessages[errorCode] || data?.error?.message || 'Unknown error';

      throw new Error(`Instagram API Error ${status}: ${errorMsg} (Code: ${errorCode})`);
    } else if (error.request) {
      throw new Error('No response from Instagram API. Check internet connection.');
    } else {
      throw new Error(`Request setup error: ${error.message}`);
    }
  }

  /**
   * Test API connection and permissions
   */
  async testConnection() {
    console.log('🔍 Testing Instagram API connection...\n');

    try {
      // 1. Get account info
      const accountInfo = await this.request(`/${this.accountId}`, 'GET', {
        fields: 'id,username,name,profile_picture_url,followers_count,media_count'
      });

      console.log('✅ Account verified:');
      console.log(`   ID: ${accountInfo.id}`);
      console.log(`   Username: @${accountInfo.username}`);
      console.log(`   Name: ${accountInfo.name}`);
      console.log(`   Followers: ${accountInfo.followers_count || 'N/A'}`);
      console.log(`   Posts: ${accountInfo.media_count || 0}\n`);

      // 2. Test permissions
      console.log('🔑 Testing permissions...');

      // Try to get recent media (tests read permission)
      try {
        await this.request(`/${this.accountId}/media`, 'GET', {
          fields: 'id,caption',
          limit: 1
        });
        console.log('   ✓ Read permission: OK');
      } catch (err) {
        console.log('   ✗ Read permission: FAILED');
        throw err;
      }

      // Test publish permission by checking container creation capability
      console.log('   ✓ Publish permission: Assumed OK (will verify on first post)\n');

      return {
        success: true,
        account: accountInfo
      };

    } catch (error) {
      console.error('❌ Connection test failed:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Upload image and create media container
   * Supports: Single image, URL, or carousel
   */
  async createMediaContainer(options = {}) {
    const {
      imageUrl,
      imagePath,
      caption,
      locationId,
      userTags,
      isCarouselItem = false
    } = options;

    console.log(`   📦 Creating media container...`);

    // Prepare parameters
    const params = {
      access_token: this.accessToken
    };

    // Image source (URL or file upload)
    if (imageUrl) {
      params.image_url = imageUrl;
    } else if (imagePath) {
      // For local files, we need to upload to a temporary URL first
      // Instagram requires publicly accessible URLs
      throw new Error('Local file upload requires hosting. Use imageUrl with public URL.');
    } else {
      throw new Error('Either imageUrl or imagePath required');
    }

    // Caption (max 2200 characters)
    if (caption) {
      params.caption = caption.substring(0, 2200);
    }

    // Location tagging
    if (locationId) {
      params.location_id = locationId;
    }

    // User tagging
    if (userTags && userTags.length > 0) {
      params.user_tags = JSON.stringify(userTags);
    }

    // Carousel flag
    if (isCarouselItem) {
      params.is_carousel_item = true;
    }

    try {
      const response = await this.request(
        `/${this.accountId}/media`,
        'POST',
        params
      );

      console.log(`   ✅ Container created: ${response.id}`);
      return response.id; // Returns container ID

    } catch (error) {
      console.error(`   ❌ Container creation failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Create carousel post (multiple images)
   */
  async createCarousel(options = {}) {
    const { images, caption } = options;

    if (!images || images.length < 2 || images.length > 10) {
      throw new Error('Carousel requires 2-10 images');
    }

    console.log(`   🎠 Creating carousel with ${images.length} images...`);

    // Create containers for each image
    const containerIds = [];
    for (let i = 0; i < images.length; i++) {
      const imageUrl = images[i];
      console.log(`   Creating container ${i + 1}/${images.length}...`);

      const containerId = await this.createMediaContainer({
        imageUrl,
        isCarouselItem: true
      });

      containerIds.push(containerId);

      // Small delay between container creations
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    // Create carousel container
    const carouselParams = {
      media_type: 'CAROUSEL',
      children: containerIds.join(','),
      access_token: this.accessToken
    };

    if (caption) {
      carouselParams.caption = caption.substring(0, 2200);
    }

    const response = await this.request(
      `/${this.accountId}/media`,
      'POST',
      carouselParams
    );

    console.log(`   ✅ Carousel container created: ${response.id}`);
    return response.id;
  }

  /**
   * Publish media container to Instagram feed
   */
  async publishMedia(containerId) {
    console.log(`   📤 Publishing media container ${containerId}...`);

    // Check container status first
    const status = await this.getContainerStatus(containerId);

    if (status.status_code !== 'FINISHED') {
      throw new Error(`Container not ready. Status: ${status.status_code}`);
    }

    try {
      const response = await this.request(
        `/${this.accountId}/media_publish`,
        'POST',
        {
          creation_id: containerId,
          access_token: this.accessToken
        }
      );

      console.log(`   ✅ Published successfully! Media ID: ${response.id}`);
      return response.id; // Returns Instagram media ID

    } catch (error) {
      console.error(`   ❌ Publishing failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Check media container status
   */
  async getContainerStatus(containerId) {
    const response = await this.request(`/${containerId}`, 'GET', {
      fields: 'id,status_code'
    });

    return response;
  }

  /**
   * Complete workflow: Create + Publish
   */
  async post(options = {}) {
    const { imageUrl, caption, isCarousel = false, images } = options;

    try {
      console.log('\n🚀 Instagram Posting Workflow Started\n');

      let containerId;

      if (isCarousel) {
        // Carousel post
        containerId = await this.createCarousel({ images, caption });
      } else {
        // Single image post
        containerId = await this.createMediaContainer({ imageUrl, caption });
      }

      // Wait for processing (Instagram needs time to process)
      console.log('   ⏳ Waiting for Instagram to process media (10s)...');
      await new Promise(resolve => setTimeout(resolve, 10000));

      // Publish
      const mediaId = await this.publishMedia(containerId);

      console.log('\n✅ Post published successfully!\n');

      return {
        success: true,
        containerId,
        mediaId,
        url: `https://www.instagram.com/p/${this.getShortcode(mediaId)}/`
      };

    } catch (error) {
      console.error('\n❌ Posting failed:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get media insights (analytics)
   */
  async getMediaInsights(mediaId) {
    try {
      const response = await this.request(`/${mediaId}/insights`, 'GET', {
        metric: 'engagement,impressions,reach,saved'
      });

      return response.data.reduce((acc, metric) => {
        acc[metric.name] = metric.values[0].value;
        return acc;
      }, {});

    } catch (error) {
      console.error('Failed to get insights:', error.message);
      return null;
    }
  }

  /**
   * Get account insights
   */
  async getAccountInsights(period = 'day', since = null, until = null) {
    const params = {
      metric: 'impressions,reach,profile_views,follower_count',
      period
    };

    if (since) params.since = since;
    if (until) params.until = until;

    try {
      const response = await this.request(
        `/${this.accountId}/insights`,
        'GET',
        params
      );

      return response.data.reduce((acc, metric) => {
        acc[metric.name] = metric.values[0].value;
        return acc;
      }, {});

    } catch (error) {
      console.error('Failed to get account insights:', error.message);
      return null;
    }
  }

  /**
   * Get recent media
   */
  async getRecentMedia(limit = 10) {
    try {
      const response = await this.request(`/${this.accountId}/media`, 'GET', {
        fields: 'id,caption,media_type,media_url,permalink,timestamp,like_count,comments_count',
        limit
      });

      return response.data;

    } catch (error) {
      console.error('Failed to get recent media:', error.message);
      return [];
    }
  }

  /**
   * Convert media ID to shortcode (for URL)
   */
  getShortcode(mediaId) {
    // This is a simplified conversion
    // Real shortcode generation is more complex
    return Buffer.from(mediaId).toString('base64').substring(0, 11);
  }

  /**
   * Validate image URL
   */
  async validateImageUrl(imageUrl) {
    try {
      const response = await axios.head(imageUrl, { timeout: 5000 });
      const contentType = response.headers['content-type'];

      if (!contentType || !contentType.startsWith('image/')) {
        throw new Error('URL does not point to an image');
      }

      return true;
    } catch (error) {
      throw new Error(`Invalid image URL: ${error.message}`);
    }
  }
}

export default InstagramAPIClient;
