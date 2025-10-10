const fs = require('fs');
const path = require('path');
const cron = require('node-cron');
const crypto = require('crypto');

/**
 * Content Scheduler - Automated content posting system
 * Reads content from repository and posts at optimal times
 */
class ContentScheduler {
  constructor(config = {}) {
    this.config = {
      contentPath: config.contentPath || path.join(__dirname, '../../docs/content/tweets.md'),
      queuePath: config.queuePath || path.join(__dirname, 'queue.json'),
      postingTimes: config.postingTimes || ['09:00', '14:00', '20:00'], // UTC
      maxRetries: config.maxRetries || 3,
      retryDelay: config.retryDelay || 5 * 60 * 1000, // 5 minutes
      ...config
    };

    this.queue = {
      upcoming: [],
      posted: [],
      failed: []
    };

    this.cronJobs = [];
    this.isRunning = false;
    this.loadQueue();
  }

  /**
   * Parse tweets from markdown file
   */
  parseContent() {
    try {
      const content = fs.readFileSync(this.config.contentPath, 'utf8');
      const tweets = [];

      // Match tweet blocks with metadata
      const tweetRegex = /###\s+Tweet\s+(\d+)\s+-\s+([^\n]+)\n```\n([\s\S]*?)\n```/g;
      let match;

      while ((match = tweetRegex.exec(content)) !== null) {
        const [, number, title, text] = match;

        tweets.push({
          id: this.generateId(text),
          number: parseInt(number),
          title: title.trim(),
          content: text.trim(),
          hashtags: this.extractHashtags(text),
          createdAt: new Date().toISOString(),
          scheduledFor: null,
          status: 'pending'
        });
      }

      console.log(`📄 Parsed ${tweets.length} tweets from content file`);
      return tweets;
    } catch (error) {
      console.error('❌ Error parsing content:', error.message);
      return [];
    }
  }

  /**
   * Generate unique ID for content
   */
  generateId(content) {
    return crypto
      .createHash('md5')
      .update(content)
      .digest('hex')
      .substring(0, 12);
  }

  /**
   * Extract hashtags from content
   */
  extractHashtags(text) {
    const hashtagRegex = /#\w+/g;
    return text.match(hashtagRegex) || [];
  }

  /**
   * Load queue from file
   */
  loadQueue() {
    try {
      if (fs.existsSync(this.config.queuePath)) {
        const data = fs.readFileSync(this.config.queuePath, 'utf8');
        this.queue = JSON.parse(data);
        console.log(`✅ Loaded queue: ${this.queue.upcoming.length} upcoming, ${this.queue.posted.length} posted, ${this.queue.failed.length} failed`);
      }
    } catch (error) {
      console.error('⚠️  Error loading queue:', error.message);
    }
  }

  /**
   * Save queue to file
   */
  saveQueue() {
    try {
      fs.writeFileSync(
        this.config.queuePath,
        JSON.stringify(this.queue, null, 2),
        'utf8'
      );
      console.log('💾 Queue saved successfully');
    } catch (error) {
      console.error('❌ Error saving queue:', error.message);
    }
  }

  /**
   * Schedule tweets at optimal times
   */
  scheduleContent() {
    const tweets = this.parseContent();
    const now = new Date();

    // Filter out already posted tweets
    const postedIds = new Set(this.queue.posted.map(t => t.id));
    const newTweets = tweets.filter(t => !postedIds.has(t.id));

    // Schedule tweets across posting times
    let timeIndex = 0;
    const scheduledTweets = newTweets.map((tweet, index) => {
      const scheduledDate = new Date(now);
      const daysToAdd = Math.floor(index / this.config.postingTimes.length);
      scheduledDate.setDate(scheduledDate.getDate() + daysToAdd);

      const [hour, minute] = this.config.postingTimes[timeIndex].split(':');
      scheduledDate.setUTCHours(parseInt(hour), parseInt(minute), 0, 0);

      timeIndex = (timeIndex + 1) % this.config.postingTimes.length;

      return {
        ...tweet,
        scheduledFor: scheduledDate.toISOString(),
        retries: 0
      };
    });

    // Add to upcoming queue
    this.queue.upcoming.push(...scheduledTweets);
    this.queue.upcoming.sort((a, b) =>
      new Date(a.scheduledFor) - new Date(b.scheduledFor)
    );

    this.saveQueue();
    console.log(`📅 Scheduled ${scheduledTweets.length} new tweets`);
    return scheduledTweets;
  }

  /**
   * Post content (to be implemented with actual API)
   */
  async postContent(content) {
    try {
      console.log(`📤 Posting content: ${content.title}`);
      console.log(`   Content: ${content.content.substring(0, 100)}...`);

      // TODO: Implement actual API posting
      // For now, simulate success
      await new Promise(resolve => setTimeout(resolve, 1000));

      return {
        success: true,
        postId: `post_${Date.now()}`,
        platform: 'twitter',
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error(`❌ Error posting content: ${error.message}`);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Process queue - check for content to post
   */
  async processQueue() {
    const now = new Date();
    const toPost = [];

    // Find content ready to post
    this.queue.upcoming = this.queue.upcoming.filter(item => {
      const scheduledTime = new Date(item.scheduledFor);
      if (scheduledTime <= now) {
        toPost.push(item);
        return false;
      }
      return true;
    });

    // Post content
    for (const item of toPost) {
      console.log(`\n⏰ Time to post: ${item.title}`);
      const result = await this.postContent(item);

      if (result.success) {
        this.queue.posted.push({
          ...item,
          postedAt: new Date().toISOString(),
          postId: result.postId,
          status: 'posted'
        });
        console.log(`✅ Successfully posted: ${item.title}`);
      } else {
        // Handle retry logic
        item.retries = (item.retries || 0) + 1;

        if (item.retries < this.config.maxRetries) {
          // Reschedule for retry
          const retryTime = new Date(now.getTime() + this.config.retryDelay);
          item.scheduledFor = retryTime.toISOString();
          this.queue.upcoming.push(item);
          console.log(`🔄 Retry ${item.retries}/${this.config.maxRetries} scheduled for ${retryTime.toISOString()}`);
        } else {
          // Move to failed queue
          this.queue.failed.push({
            ...item,
            failedAt: new Date().toISOString(),
            error: result.error,
            status: 'failed'
          });
          console.log(`❌ Failed after ${this.config.maxRetries} retries: ${item.title}`);
        }
      }
    }

    this.saveQueue();
  }

  /**
   * Start scheduler with cron jobs
   */
  start() {
    if (this.isRunning) {
      console.log('⚠️  Scheduler already running');
      return;
    }

    console.log('\n🚀 Starting Content Scheduler...');
    this.isRunning = true;

    // Schedule content on start
    this.scheduleContent();

    // Create cron jobs for each posting time
    this.config.postingTimes.forEach(time => {
      const [hour, minute] = time.split(':');
      const cronExpression = `${minute} ${hour} * * *`; // Daily at specified time

      const job = cron.schedule(cronExpression, async () => {
        console.log(`\n⏰ Cron triggered at ${new Date().toISOString()}`);
        await this.processQueue();
      }, {
        timezone: 'UTC'
      });

      this.cronJobs.push(job);
      console.log(`✅ Cron job scheduled for ${time} UTC`);
    });

    // Also check every 5 minutes for retries
    const retryJob = cron.schedule('*/5 * * * *', async () => {
      await this.processQueue();
    }, {
      timezone: 'UTC'
    });
    this.cronJobs.push(retryJob);
    console.log('✅ Retry checker scheduled (every 5 minutes)');

    console.log('\n✨ Content Scheduler is running!');
  }

  /**
   * Stop scheduler
   */
  stop() {
    if (!this.isRunning) {
      console.log('⚠️  Scheduler not running');
      return;
    }

    console.log('\n🛑 Stopping Content Scheduler...');
    this.cronJobs.forEach(job => job.stop());
    this.cronJobs = [];
    this.isRunning = false;
    console.log('✅ Scheduler stopped');
  }

  /**
   * Get queue status
   */
  getStatus() {
    return {
      isRunning: this.isRunning,
      upcoming: this.queue.upcoming.length,
      posted: this.queue.posted.length,
      failed: this.queue.failed.length,
      nextPost: this.queue.upcoming[0]?.scheduledFor || null,
      upcomingPosts: this.queue.upcoming.slice(0, 10).map(item => ({
        title: item.title,
        scheduledFor: item.scheduledFor,
        content: item.content.substring(0, 100) + '...'
      }))
    };
  }

  /**
   * Get upcoming posts for next N days
   */
  getUpcoming(days = 7) {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() + days);

    return this.queue.upcoming.filter(item =>
      new Date(item.scheduledFor) <= cutoff
    );
  }

  /**
   * Reschedule a post
   */
  reschedule(postId, newTime) {
    const index = this.queue.upcoming.findIndex(item => item.id === postId);
    if (index !== -1) {
      this.queue.upcoming[index].scheduledFor = newTime;
      this.queue.upcoming.sort((a, b) =>
        new Date(a.scheduledFor) - new Date(b.scheduledFor)
      );
      this.saveQueue();
      return true;
    }
    return false;
  }

  /**
   * Delete a scheduled post
   */
  deletePost(postId) {
    const index = this.queue.upcoming.findIndex(item => item.id === postId);
    if (index !== -1) {
      this.queue.upcoming.splice(index, 1);
      this.saveQueue();
      return true;
    }
    return false;
  }

  /**
   * Retry failed posts
   */
  retryFailed() {
    const failedPosts = [...this.queue.failed];
    this.queue.failed = [];

    failedPosts.forEach(post => {
      post.retries = 0;
      post.scheduledFor = new Date().toISOString();
      this.queue.upcoming.push(post);
    });

    this.saveQueue();
    console.log(`🔄 Retrying ${failedPosts.length} failed posts`);
    return failedPosts.length;
  }
}

// Export for use in other modules
module.exports = ContentScheduler;

// CLI usage
if (require.main === module) {
  const scheduler = new ContentScheduler();

  const command = process.argv[2];

  switch (command) {
    case 'start':
      scheduler.start();
      // Keep process running
      process.on('SIGINT', () => {
        scheduler.stop();
        process.exit(0);
      });
      break;

    case 'schedule':
      scheduler.scheduleContent();
      break;

    case 'status':
      console.log(JSON.stringify(scheduler.getStatus(), null, 2));
      break;

    case 'retry':
      scheduler.retryFailed();
      break;

    default:
      console.log(`
Usage:
  node content-scheduler.js start      - Start the scheduler
  node content-scheduler.js schedule   - Schedule new content
  node content-scheduler.js status     - Show queue status
  node content-scheduler.js retry      - Retry failed posts
      `);
  }
}
