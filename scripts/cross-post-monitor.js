#!/usr/bin/env node

/**
 * Cross-Post Monitor
 * Monitors Twitter for new posts and automatically cross-posts to Threads
 */

require('dotenv').config({ path: require('path').join(__dirname, '.env.marketing') });
const { TwitterApi } = require('twitter-api-v2');
const ThreadsAutoPoster = require('./threads/threads-auto-poster');
const fs = require('fs').promises;
const path = require('path');

class CrossPostMonitor {
  constructor(options = {}) {
    this.twitter = new TwitterApi({
      appKey: process.env.TWITTER_API_KEY,
      appSecret: process.env.TWITTER_API_SECRET,
      accessToken: process.env.TWITTER_ACCESS_TOKEN,
      accessSecret: process.env.TWITTER_ACCESS_SECRET
    });

    this.threads = new ThreadsAutoPoster(options.threads || {});

    this.stateFile = path.join(__dirname, '../data/project-coordination/crosspost-state.json');
    this.minEngagement = options.minEngagement || 0; // Minimum likes+retweets before crossposting
    this.delayMinutes = options.delayMinutes || 30; // Wait time before crossposting
  }

  /**
   * Initialize monitor
   */
  async initialize() {
    console.log('🔄 Initializing Cross-Post Monitor');

    await this.threads.initialize();
    this.state = await this.loadState();

    return { initialized: true };
  }

  /**
   * Monitor and cross-post
   */
  async monitor() {
    console.log('👁️  Monitoring Twitter for posts to cross-post');

    try {
      // Get my recent tweets
      const me = await this.twitter.v2.me();
      const tweets = await this.twitter.v2.userTimeline(me.data.id, {
        max_results: 10,
        'tweet.fields': 'created_at,public_metrics',
        exclude: 'retweets,replies'
      });

      let crossPosted = 0;

      for (const tweet of tweets.data.data || []) {
        // Check if already cross-posted
        if (this.state.crossPosted?.includes(tweet.id)) {
          continue;
        }

        // Check if tweet is old enough
        const tweetAge = Date.now() - new Date(tweet.created_at).getTime();
        if (tweetAge < this.delayMinutes * 60 * 1000) {
          console.log(`⏳ Tweet ${tweet.id} too recent (${Math.round(tweetAge / 60000)}m old)`);
          continue;
        }

        // Check engagement threshold
        const engagement = (tweet.public_metrics?.like_count || 0) + (tweet.public_metrics?.retweet_count || 0);
        if (engagement < this.minEngagement) {
          console.log(`📊 Tweet ${tweet.id} below engagement threshold (${engagement} < ${this.minEngagement})`);
          continue;
        }

        // Cross-post to Threads
        console.log(`📤 Cross-posting tweet ${tweet.id} to Threads`);

        try {
          const result = await this.threads.post(tweet.text, {
            fromTwitter: true,
            twitterPostId: tweet.id
          });

          if (result.success !== false) {
            // Mark as cross-posted
            if (!this.state.crossPosted) {
              this.state.crossPosted = [];
            }
            this.state.crossPosted.push(tweet.id);
            await this.saveState();

            crossPosted++;
            console.log(`✅ Cross-posted tweet ${tweet.id}`);
          }

        } catch (error) {
          console.error(`❌ Failed to cross-post tweet ${tweet.id}:`, error.message);
        }

        // Rate limiting - wait between cross-posts
        if (crossPosted < tweets.data.data.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 5000));
        }
      }

      console.log(`✅ Monitoring complete: ${crossPosted} tweets cross-posted`);

      return { crossPosted, total: tweets.data.data?.length || 0 };

    } catch (error) {
      console.error('❌ Monitoring failed:', error.message);
      throw error;
    }
  }

  /**
   * Load state
   */
  async loadState() {
    try {
      const data = await fs.readFile(this.stateFile, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      return { crossPosted: [], lastCheck: null };
    }
  }

  /**
   * Save state
   */
  async saveState() {
    this.state.lastCheck = new Date().toISOString();
    await fs.writeFile(this.stateFile, JSON.stringify(this.state, null, 2));
  }
}

// CLI usage
if (require.main === module) {
  (async () => {
    const monitor = new CrossPostMonitor({
      minEngagement: parseInt(process.env.CROSSPOST_MIN_ENGAGEMENT) || 0,
      delayMinutes: parseInt(process.env.CROSSPOST_DELAY_MINUTES) || 30
    });

    await monitor.initialize();
    await monitor.monitor();
  })();
}

module.exports = CrossPostMonitor;
