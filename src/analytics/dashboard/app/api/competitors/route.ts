import { NextResponse } from 'next/server';
import { PriceAPIService } from '../../../lib/price-api';
import { SocialAPIService } from '../../../lib/social-api';
import metricsConfig from '../../../../metrics-config.json';

export async function GET() {
  try {
    const coingeckoKey = process.env.COINGECKO_API_KEY;
    const priceService = new PriceAPIService(coingeckoKey);
    const socialService = new SocialAPIService();

    const competitors = metricsConfig.competitors;
    const coinIds = competitors.map(c => c.coingecko_id);

    // Fetch prices for all competitors
    const priceMap = await priceService.getMultipleTokenPrices(coinIds);

    // Build competitor data
    const competitorData = await Promise.all(
      competitors.map(async (competitor) => {
        const priceData = priceMap.get(competitor.coingecko_id);

        // For demo, using mock social data
        return {
          name: competitor.name,
          symbol: competitor.symbol,
          marketCap: priceData?.marketCap || Math.random() * 10000000,
          price: priceData?.price || Math.random() * 0.001,
          volume24h: priceData?.volume24h || Math.random() * 1000000,
          holders: Math.floor(Math.random() * 5000) + 500,
          twitterFollowers: Math.floor(Math.random() * 10000) + 1000,
          telegramMembers: Math.floor(Math.random() * 5000) + 500,
        };
      })
    );

    // Add HypeAI to comparison
    const hypeaiData = {
      name: 'HypeAI',
      symbol: 'HYPE',
      marketCap: 4320000,
      price: 0.000432,
      volume24h: 234000,
      holders: 1247,
      twitterFollowers: 5234,
      telegramMembers: 2847,
    };

    return NextResponse.json([hypeaiData, ...competitorData]);
  } catch (error) {
    console.error('Competitors API error:', error);
    // Return mock data on error
    return NextResponse.json([
      {
        name: 'HypeAI',
        symbol: 'HYPE',
        marketCap: 4320000,
        price: 0.000432,
        volume24h: 234000,
        holders: 1247,
        twitterFollowers: 5234,
        telegramMembers: 2847,
      },
      {
        name: 'AIToken1',
        symbol: 'AI1',
        marketCap: 3500000,
        price: 0.000350,
        volume24h: 189000,
        holders: 892,
        twitterFollowers: 4123,
        telegramMembers: 2134,
      },
      {
        name: 'AIToken2',
        symbol: 'AI2',
        marketCap: 5200000,
        price: 0.000520,
        volume24h: 312000,
        holders: 1532,
        twitterFollowers: 6234,
        telegramMembers: 3421,
      },
    ]);
  }
}
