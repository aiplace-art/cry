import axios from 'axios';

export interface WebsiteMetrics {
  pageViews: number;
  uniqueVisitors: number;
  bounceRate: number;
  avgSessionDuration: number;
  topPages: PageData[];
  trafficSources: TrafficSource[];
  deviceBreakdown: DeviceData;
  geographicData: CountryData[];
}

export interface PageData {
  path: string;
  views: number;
  uniqueViews: number;
  avgTimeOnPage: number;
  bounceRate: number;
}

export interface TrafficSource {
  source: string;
  sessions: number;
  percentage: number;
}

export interface DeviceData {
  desktop: number;
  mobile: number;
  tablet: number;
}

export interface CountryData {
  country: string;
  sessions: number;
  percentage: number;
}

export interface InfluencerCampaign {
  id: string;
  influencer: string;
  platform: string;
  reach: number;
  engagement: number;
  conversions: number;
  cost: number;
  roi: number;
  status: 'active' | 'completed' | 'planned';
}

export class AnalyticsClient {
  private gaTrackingId?: string;
  private gaServiceAccount?: string;

  constructor(gaTrackingId?: string, gaServiceAccount?: string) {
    this.gaTrackingId = gaTrackingId;
    this.gaServiceAccount = gaServiceAccount;
  }

  async getWebsiteMetrics(days: number = 30): Promise<WebsiteMetrics> {
    // This would integrate with Google Analytics API
    // For demo, returning mock data
    return {
      pageViews: 47832,
      uniqueVisitors: 12456,
      bounceRate: 42.3,
      avgSessionDuration: 243, // seconds
      topPages: [
        {
          path: '/',
          views: 18234,
          uniqueViews: 8932,
          avgTimeOnPage: 123,
          bounceRate: 38.2,
        },
        {
          path: '/about',
          views: 8932,
          uniqueViews: 4521,
          avgTimeOnPage: 187,
          bounceRate: 45.1,
        },
        {
          path: '/tokenomics',
          views: 6234,
          uniqueViews: 3892,
          avgTimeOnPage: 298,
          bounceRate: 32.4,
        },
        {
          path: '/roadmap',
          views: 4821,
          uniqueViews: 2934,
          avgTimeOnPage: 234,
          bounceRate: 41.2,
        },
        {
          path: '/community',
          views: 3892,
          uniqueViews: 2341,
          avgTimeOnPage: 156,
          bounceRate: 48.7,
        },
      ],
      trafficSources: [
        { source: 'Direct', sessions: 4821, percentage: 38.7 },
        { source: 'Twitter', sessions: 3234, percentage: 26.0 },
        { source: 'Google', sessions: 2123, percentage: 17.0 },
        { source: 'Telegram', sessions: 1432, percentage: 11.5 },
        { source: 'Reddit', sessions: 846, percentage: 6.8 },
      ],
      deviceBreakdown: {
        desktop: 62.3,
        mobile: 32.4,
        tablet: 5.3,
      },
      geographicData: [
        { country: 'United States', sessions: 4234, percentage: 34.0 },
        { country: 'United Kingdom', sessions: 2134, percentage: 17.1 },
        { country: 'Germany', sessions: 1432, percentage: 11.5 },
        { country: 'Japan', sessions: 1234, percentage: 9.9 },
        { country: 'Canada', sessions: 892, percentage: 7.2 },
      ],
    };
  }

  async getInfluencerCampaigns(): Promise<InfluencerCampaign[]> {
    // This would integrate with campaign tracking system
    // For demo, returning mock data
    return [
      {
        id: 'camp-001',
        influencer: '@CryptoInfluencer1',
        platform: 'Twitter',
        reach: 150000,
        engagement: 12500,
        conversions: 347,
        cost: 5000,
        roi: 2.8,
        status: 'active',
      },
      {
        id: 'camp-002',
        influencer: 'CryptoYouTuber',
        platform: 'YouTube',
        reach: 85000,
        engagement: 8200,
        conversions: 213,
        cost: 3500,
        roi: 3.2,
        status: 'active',
      },
      {
        id: 'camp-003',
        influencer: '@TelegramInfluencer',
        platform: 'Telegram',
        reach: 45000,
        engagement: 5600,
        conversions: 178,
        cost: 2000,
        roi: 4.1,
        status: 'completed',
      },
      {
        id: 'camp-004',
        influencer: '@CryptoTrader',
        platform: 'Twitter',
        reach: 120000,
        engagement: 9800,
        conversions: 0,
        cost: 4000,
        roi: 0,
        status: 'planned',
      },
    ];
  }

  async trackEvent(category: string, action: string, label?: string, value?: number) {
    // Send event to Google Analytics
    if (!this.gaTrackingId) return;

    try {
      await axios.post('https://www.google-analytics.com/collect', null, {
        params: {
          v: 1,
          tid: this.gaTrackingId,
          cid: 'server-side',
          t: 'event',
          ec: category,
          ea: action,
          el: label,
          ev: value,
        },
      });
    } catch (error) {
      console.error('Error tracking event:', error);
    }
  }
}
