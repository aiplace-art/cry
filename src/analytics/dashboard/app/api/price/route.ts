import { NextResponse } from 'next/server';
import { PriceAPIService } from '../../../lib/price-api';

export async function GET() {
  try {
    const coingeckoKey = process.env.COINGECKO_API_KEY;
    const cmcKey = process.env.CMC_API_KEY;
    const coinId = process.env.COINGECKO_COIN_ID || 'ethereum';

    const priceService = new PriceAPIService(coingeckoKey, cmcKey);
    const data = await priceService.getCoinGeckoPrice(coinId);

    return NextResponse.json(data);
  } catch (error) {
    console.error('Price API error:', error);
    // Return mock data on error
    return NextResponse.json({
      price: 0.000432,
      marketCap: 4320000,
      volume24h: 234000,
      priceChange24h: 12.4,
      priceChange7d: 28.7,
      priceChange30d: 142.3,
      high24h: 0.000456,
      low24h: 0.000398,
      circulatingSupply: 10000000000,
      totalSupply: 10000000000,
      lastUpdated: Date.now(),
    });
  }
}
