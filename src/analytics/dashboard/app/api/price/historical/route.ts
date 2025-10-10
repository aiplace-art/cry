import { NextResponse } from 'next/server';
import { PriceAPIService } from '../../../../lib/price-api';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '7');

    const coingeckoKey = process.env.COINGECKO_API_KEY;
    const coinId = process.env.COINGECKO_COIN_ID || 'ethereum';

    const priceService = new PriceAPIService(coingeckoKey);
    const data = await priceService.getHistoricalPrices(coinId, days);

    return NextResponse.json(data);
  } catch (error) {
    console.error('Historical price API error:', error);
    // Return mock data on error
    const mockData = Array.from({ length: 168 }, (_, i) => ({
      timestamp: Date.now() - (168 - i) * 3600000,
      price: 0.000400 + Math.random() * 0.0001,
      volume: 200000 + Math.random() * 100000,
    }));
    return NextResponse.json(mockData);
  }
}
