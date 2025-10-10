import { NextResponse } from 'next/server';
import { AnalyticsClient } from '../../../lib/analytics-client';

export async function GET() {
  try {
    const gaTrackingId = process.env.GA_TRACKING_ID;
    const gaServiceAccount = process.env.GA_SERVICE_ACCOUNT;

    const analyticsClient = new AnalyticsClient(gaTrackingId, gaServiceAccount);
    const campaigns = await analyticsClient.getInfluencerCampaigns();

    return NextResponse.json(campaigns);
  } catch (error) {
    console.error('Campaigns API error:', error);
    // Return mock data on error
    return NextResponse.json([
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
    ]);
  }
}
