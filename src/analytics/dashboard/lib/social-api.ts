import axios from 'axios';

export interface TwitterMetrics {
  followers: number;
  following: number;
  tweets: number;
  likes: number;
  engagement_rate: number;
  recent_tweets: Tweet[];
  growth_24h: number;
}

export interface Tweet {
  id: string;
  text: string;
  likes: number;
  retweets: number;
  replies: number;
  timestamp: number;
  url: string;
}

export interface TelegramMetrics {
  members: number;
  online: number;
  messages_24h: number;
  growth_24h: number;
  engagement_rate: number;
}

export interface DiscordMetrics {
  members: number;
  online: number;
  messages_24h: number;
  channels: number;
  roles: number;
  growth_24h: number;
}

export interface SocialMetrics {
  twitter?: TwitterMetrics;
  telegram?: TelegramMetrics;
  discord?: DiscordMetrics;
  total_reach: number;
  combined_engagement: number;
  lastUpdated: number;
}

export class SocialAPIService {
  private twitterBearerToken?: string;
  private telegramBotToken?: string;
  private discordBotToken?: string;

  constructor(
    twitterBearerToken?: string,
    telegramBotToken?: string,
    discordBotToken?: string
  ) {
    this.twitterBearerToken = twitterBearerToken;
    this.telegramBotToken = telegramBotToken;
    this.discordBotToken = discordBotToken;
  }

  async getTwitterMetrics(username: string): Promise<TwitterMetrics> {
    if (!this.twitterBearerToken) {
      return this.getMockTwitterMetrics();
    }

    try {
      // Get user info
      const userResponse = await axios.get(
        `https://api.twitter.com/2/users/by/username/${username.replace('@', '')}`,
        {
          headers: {
            Authorization: `Bearer ${this.twitterBearerToken}`,
          },
          params: {
            'user.fields': 'public_metrics,created_at',
          },
        }
      );

      const userData = userResponse.data.data;
      const metrics = userData.public_metrics;

      // Get recent tweets
      const tweetsResponse = await axios.get(
        `https://api.twitter.com/2/users/${userData.id}/tweets`,
        {
          headers: {
            Authorization: `Bearer ${this.twitterBearerToken}`,
          },
          params: {
            'tweet.fields': 'public_metrics,created_at',
            max_results: 10,
          },
        }
      );

      const tweets: Tweet[] = tweetsResponse.data.data?.map((tweet: any) => ({
        id: tweet.id,
        text: tweet.text,
        likes: tweet.public_metrics.like_count,
        retweets: tweet.public_metrics.retweet_count,
        replies: tweet.public_metrics.reply_count,
        timestamp: new Date(tweet.created_at).getTime(),
        url: `https://twitter.com/${username}/status/${tweet.id}`,
      })) || [];

      // Calculate engagement rate
      const totalEngagements = tweets.reduce(
        (sum, t) => sum + t.likes + t.retweets + t.replies,
        0
      );
      const engagement_rate = (totalEngagements / (metrics.followers_count * tweets.length)) * 100;

      return {
        followers: metrics.followers_count,
        following: metrics.following_count,
        tweets: metrics.tweet_count,
        likes: 0, // Not directly available
        engagement_rate: Math.min(engagement_rate, 100),
        recent_tweets: tweets,
        growth_24h: 0, // Would need historical data
      };
    } catch (error) {
      console.error('Twitter API error:', error);
      return this.getMockTwitterMetrics();
    }
  }

  async getTelegramMetrics(chatId: string): Promise<TelegramMetrics> {
    if (!this.telegramBotToken) {
      return this.getMockTelegramMetrics();
    }

    try {
      const response = await axios.get(
        `https://api.telegram.org/bot${this.telegramBotToken}/getChatMembersCount`,
        {
          params: {
            chat_id: chatId,
          },
        }
      );

      const memberCount = response.data.result;

      // Get chat info for additional details
      const chatInfo = await axios.get(
        `https://api.telegram.org/bot${this.telegramBotToken}/getChat`,
        {
          params: {
            chat_id: chatId,
          },
        }
      );

      return {
        members: memberCount,
        online: Math.floor(memberCount * 0.1), // Estimate 10% online
        messages_24h: 0, // Would need bot to track messages
        growth_24h: 0, // Would need historical tracking
        engagement_rate: 0, // Would need message tracking
      };
    } catch (error) {
      console.error('Telegram API error:', error);
      return this.getMockTelegramMetrics();
    }
  }

  async getDiscordMetrics(serverId: string): Promise<DiscordMetrics> {
    if (!this.discordBotToken) {
      return this.getMockDiscordMetrics();
    }

    try {
      const response = await axios.get(
        `https://discord.com/api/v10/guilds/${serverId}?with_counts=true`,
        {
          headers: {
            Authorization: `Bot ${this.discordBotToken}`,
          },
        }
      );

      const data = response.data;

      return {
        members: data.approximate_member_count,
        online: data.approximate_presence_count,
        messages_24h: 0, // Would need bot to track
        channels: data.channels?.length || 0,
        roles: data.roles?.length || 0,
        growth_24h: 0, // Would need historical tracking
      };
    } catch (error) {
      console.error('Discord API error:', error);
      return this.getMockDiscordMetrics();
    }
  }

  async getAllMetrics(
    twitter?: string,
    telegram?: string,
    discord?: string
  ): Promise<SocialMetrics> {
    const [twitterMetrics, telegramMetrics, discordMetrics] = await Promise.all([
      twitter ? this.getTwitterMetrics(twitter) : undefined,
      telegram ? this.getTelegramMetrics(telegram) : undefined,
      discord ? this.getDiscordMetrics(discord) : undefined,
    ]);

    const total_reach =
      (twitterMetrics?.followers || 0) +
      (telegramMetrics?.members || 0) +
      (discordMetrics?.members || 0);

    const combined_engagement =
      ((twitterMetrics?.engagement_rate || 0) +
        (telegramMetrics?.engagement_rate || 0)) /
      2;

    return {
      twitter: twitterMetrics,
      telegram: telegramMetrics,
      discord: discordMetrics,
      total_reach,
      combined_engagement,
      lastUpdated: Date.now(),
    };
  }

  // Mock data for demo/testing
  private getMockTwitterMetrics(): TwitterMetrics {
    return {
      followers: 5234,
      following: 432,
      tweets: 1247,
      likes: 8932,
      engagement_rate: 4.2,
      recent_tweets: [],
      growth_24h: 127,
    };
  }

  private getMockTelegramMetrics(): TelegramMetrics {
    return {
      members: 2847,
      online: 312,
      messages_24h: 487,
      growth_24h: 89,
      engagement_rate: 17.1,
    };
  }

  private getMockDiscordMetrics(): DiscordMetrics {
    return {
      members: 1923,
      online: 234,
      messages_24h: 623,
      channels: 12,
      roles: 8,
      growth_24h: 45,
    };
  }
}
