const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

/**
 * Multi-Platform Publisher
 * Posts content to Twitter, Telegram, and Discord simultaneously
 */
class MultiPublisher {
  constructor(config = {}) {
    this.config = {
      twitter: {
        apiKey: config.twitter?.apiKey || process.env.TWITTER_API_KEY,
        apiSecret: config.twitter?.apiSecret || process.env.TWITTER_API_SECRET,
        accessToken: config.twitter?.accessToken || process.env.TWITTER_ACCESS_TOKEN,
        accessSecret: config.twitter?.accessSecret || process.env.TWITTER_ACCESS_SECRET,
        bearerToken: config.twitter?.bearerToken || process.env.TWITTER_BEARER_TOKEN
      },
      telegram: {
        botToken: config.telegram?.botToken || process.env.TELEGRAM_BOT_TOKEN,
        chatId: config.telegram?.chatId || process.env.TELEGRAM_CHAT_ID
      },
      discord: {
        webhookUrl: config.discord?.webhookUrl || process.env.DISCORD_WEBHOOK_URL
      },
      platforms: config.platforms || ['twitter', 'telegram', 'discord']
    };

    this.rateLimits = {
      twitter: { remaining: 50, resetAt: Date.now() + 15 * 60 * 1000 },
      telegram: { remaining: 30, resetAt: Date.now() + 60 * 1000 },
      discord: { remaining: 5, resetAt: Date.now() + 5 * 1000 }
    };
  }

  /**
   * Adapt content for specific platform
   */
  adaptContent(content, platform) {
    const adapted = {
      text: content.content,
      images: content.images || [],
      links: content.links || [],
      platform
    };

    switch (platform) {
      case 'twitter':
        // Twitter: 280 characters, optimize hashtags
        adapted.text = this.optimizeForTwitter(content.content);
        break;

      case 'telegram':
        // Telegram: Markdown formatting, link previews
        adapted.text = this.optimizeForTelegram(content.content);
        break;

      case 'discord':
        // Discord: Embed format, rich previews
        adapted.embed = this.createDiscordEmbed(content);
        break;
    }

    return adapted;
  }

  /**
   * Optimize content for Twitter
   */
  optimizeForTwitter(text) {
    // Ensure under 280 characters
    if (text.length <= 280) return text;

    // Truncate and add ellipsis
    return text.substring(0, 277) + '...';
  }

  /**
   * Optimize content for Telegram
   */
  optimizeForTelegram(text) {
    // Convert to Telegram Markdown
    return text
      .replace(/\*\*(.+?)\*\*/g, '*$1*') // Bold
      .replace(/\*(.+?)\*/g, '_$1_')      // Italic
      .replace(/~~(.+?)~~/g, '~$1~');     // Strikethrough
  }

  /**
   * Create Discord embed
   */
  createDiscordEmbed(content) {
    return {
      title: content.title || 'HypeAI Update',
      description: content.content.substring(0, 4096),
      color: 0x00D9FF, // HypeAI brand color
      timestamp: new Date().toISOString(),
      footer: {
        text: 'HypeAI - Where Hype Meets Intelligence',
        icon_url: 'https://hypeai.io/logo.png'
      },
      fields: content.hashtags ? [{
        name: 'Tags',
        value: content.hashtags.join(' '),
        inline: true
      }] : []
    };
  }

  /**
   * Check rate limits
   */
  async checkRateLimit(platform) {
    const limit = this.rateLimits[platform];
    const now = Date.now();

    // Reset if time passed
    if (now >= limit.resetAt) {
      limit.remaining = platform === 'twitter' ? 50 : platform === 'telegram' ? 30 : 5;
      limit.resetAt = now + (platform === 'twitter' ? 15 * 60 * 1000 : platform === 'telegram' ? 60 * 1000 : 5 * 1000);
    }

    if (limit.remaining <= 0) {
      const waitTime = limit.resetAt - now;
      throw new Error(`Rate limit exceeded for ${platform}. Wait ${Math.ceil(waitTime / 1000)}s`);
    }

    limit.remaining--;
    return true;
  }

  /**
   * Post to Twitter (X)
   */
  async postToTwitter(content) {
    try {
      await this.checkRateLimit('twitter');

      const adapted = this.adaptContent(content, 'twitter');

      // Using Twitter API v2
      const response = await axios.post(
        'https://api.twitter.com/2/tweets',
        {
          text: adapted.text
        },
        {
          headers: {
            'Authorization': `Bearer ${this.config.twitter.bearerToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('✅ Posted to Twitter:', response.data.data.id);
      return {
        success: true,
        platform: 'twitter',
        postId: response.data.data.id,
        url: `https://twitter.com/user/status/${response.data.data.id}`
      };
    } catch (error) {
      console.error('❌ Twitter error:', error.response?.data || error.message);
      return {
        success: false,
        platform: 'twitter',
        error: error.response?.data?.detail || error.message
      };
    }
  }

  /**
   * Post to Telegram
   */
  async postToTelegram(content) {
    try {
      await this.checkRateLimit('telegram');

      const adapted = this.adaptContent(content, 'telegram');
      const url = `https://api.telegram.org/bot${this.config.telegram.botToken}/sendMessage`;

      const response = await axios.post(url, {
        chat_id: this.config.telegram.chatId,
        text: adapted.text,
        parse_mode: 'Markdown',
        disable_web_page_preview: false
      });

      console.log('✅ Posted to Telegram:', response.data.result.message_id);
      return {
        success: true,
        platform: 'telegram',
        postId: response.data.result.message_id,
        url: `https://t.me/${this.config.telegram.chatId}/${response.data.result.message_id}`
      };
    } catch (error) {
      console.error('❌ Telegram error:', error.response?.data || error.message);
      return {
        success: false,
        platform: 'telegram',
        error: error.response?.data?.description || error.message
      };
    }
  }

  /**
   * Post to Discord
   */
  async postToDiscord(content) {
    try {
      await this.checkRateLimit('discord');

      const adapted = this.adaptContent(content, 'discord');

      const response = await axios.post(
        this.config.discord.webhookUrl,
        {
          content: adapted.text,
          embeds: [adapted.embed]
        },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('✅ Posted to Discord');
      return {
        success: true,
        platform: 'discord',
        postId: Date.now().toString()
      };
    } catch (error) {
      console.error('❌ Discord error:', error.response?.data || error.message);
      return {
        success: false,
        platform: 'discord',
        error: error.response?.data?.message || error.message
      };
    }
  }

  /**
   * Post with image attachment
   */
  async postWithImage(content, imagePath, platforms = null) {
    const targetPlatforms = platforms || this.config.platforms;
    const results = {};

    for (const platform of targetPlatforms) {
      try {
        switch (platform) {
          case 'twitter':
            results[platform] = await this.postTwitterImage(content, imagePath);
            break;
          case 'telegram':
            results[platform] = await this.postTelegramImage(content, imagePath);
            break;
          case 'discord':
            results[platform] = await this.postDiscordImage(content, imagePath);
            break;
        }
      } catch (error) {
        results[platform] = {
          success: false,
          error: error.message
        };
      }
    }

    return results;
  }

  /**
   * Post Twitter with image
   */
  async postTwitterImage(content, imagePath) {
    // Implementation would upload image first, then tweet
    // Requires media upload endpoint
    console.log('📸 Twitter image posting not fully implemented');
    return { success: false, error: 'Image posting requires full OAuth setup' };
  }

  /**
   * Post Telegram with image
   */
  async postTelegramImage(content, imagePath) {
    try {
      await this.checkRateLimit('telegram');

      const url = `https://api.telegram.org/bot${this.config.telegram.botToken}/sendPhoto`;
      const form = new FormData();

      form.append('chat_id', this.config.telegram.chatId);
      form.append('photo', fs.createReadStream(imagePath));
      form.append('caption', this.adaptContent(content, 'telegram').text);
      form.append('parse_mode', 'Markdown');

      const response = await axios.post(url, form, {
        headers: form.getHeaders()
      });

      console.log('✅ Posted image to Telegram');
      return {
        success: true,
        platform: 'telegram',
        postId: response.data.result.message_id
      };
    } catch (error) {
      console.error('❌ Telegram image error:', error.message);
      return {
        success: false,
        platform: 'telegram',
        error: error.message
      };
    }
  }

  /**
   * Post Discord with image
   */
  async postDiscordImage(content, imagePath) {
    try {
      await this.checkRateLimit('discord');

      const form = new FormData();
      const adapted = this.adaptContent(content, 'discord');

      form.append('payload_json', JSON.stringify({
        embeds: [adapted.embed]
      }));
      form.append('file', fs.createReadStream(imagePath));

      const response = await axios.post(this.config.discord.webhookUrl, form, {
        headers: form.getHeaders()
      });

      console.log('✅ Posted image to Discord');
      return {
        success: true,
        platform: 'discord',
        postId: Date.now().toString()
      };
    } catch (error) {
      console.error('❌ Discord image error:', error.message);
      return {
        success: false,
        platform: 'discord',
        error: error.message
      };
    }
  }

  /**
   * Publish to all platforms simultaneously
   */
  async publishToAll(content, platforms = null) {
    const targetPlatforms = platforms || this.config.platforms;
    const results = {};

    console.log(`\n📤 Publishing to ${targetPlatforms.length} platforms...`);

    // Post to all platforms in parallel
    const promises = targetPlatforms.map(async platform => {
      try {
        let result;
        switch (platform) {
          case 'twitter':
            result = await this.postToTwitter(content);
            break;
          case 'telegram':
            result = await this.postToTelegram(content);
            break;
          case 'discord':
            result = await this.postToDiscord(content);
            break;
          default:
            result = { success: false, error: 'Unknown platform' };
        }
        results[platform] = result;
      } catch (error) {
        results[platform] = {
          success: false,
          platform,
          error: error.message
        };
      }
    });

    await Promise.all(promises);

    // Summary
    const successful = Object.values(results).filter(r => r.success).length;
    console.log(`\n✨ Published to ${successful}/${targetPlatforms.length} platforms`);

    return results;
  }

  /**
   * Get platform status
   */
  getStatus() {
    return {
      configured: {
        twitter: !!this.config.twitter.bearerToken,
        telegram: !!this.config.telegram.botToken,
        discord: !!this.config.discord.webhookUrl
      },
      rateLimits: this.rateLimits
    };
  }
}

module.exports = MultiPublisher;

// CLI usage
if (require.main === module) {
  const publisher = new MultiPublisher();

  const command = process.argv[2];

  switch (command) {
    case 'test':
      const testContent = {
        title: 'Test Post',
        content: 'Testing HypeAI automation system! 🤖 #HypeAI #Testing',
        hashtags: ['#HypeAI', '#Testing']
      };

      publisher.publishToAll(testContent).then(results => {
        console.log('\nResults:', JSON.stringify(results, null, 2));
      });
      break;

    case 'status':
      console.log(JSON.stringify(publisher.getStatus(), null, 2));
      break;

    default:
      console.log(`
Usage:
  node multi-publisher.js test     - Test posting to all platforms
  node multi-publisher.js status   - Check configuration status
      `);
  }
}
