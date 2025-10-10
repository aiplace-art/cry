import axios from 'axios';

export interface PriceData {
  price: number;
  marketCap: number;
  volume24h: number;
  priceChange24h: number;
  priceChange7d: number;
  priceChange30d: number;
  high24h: number;
  low24h: number;
  circulatingSupply: number;
  totalSupply: number;
  lastUpdated: number;
}

export interface HistoricalPrice {
  timestamp: number;
  price: number;
  volume: number;
}

export class PriceAPIService {
  private coingeckoApiKey?: string;
  private cmcApiKey?: string;

  constructor(coingeckoApiKey?: string, cmcApiKey?: string) {
    this.coingeckoApiKey = coingeckoApiKey;
    this.cmcApiKey = cmcApiKey;
  }

  async getCoinGeckoPrice(coinId: string): Promise<PriceData> {
    try {
      const headers = this.coingeckoApiKey
        ? { 'x-cg-pro-api-key': this.coingeckoApiKey }
        : {};

      const response = await axios.get(
        `https://api.coingecko.com/api/v3/coins/${coinId}`,
        { headers }
      );

      const data = response.data;
      return {
        price: data.market_data.current_price.usd,
        marketCap: data.market_data.market_cap.usd,
        volume24h: data.market_data.total_volume.usd,
        priceChange24h: data.market_data.price_change_percentage_24h,
        priceChange7d: data.market_data.price_change_percentage_7d,
        priceChange30d: data.market_data.price_change_percentage_30d,
        high24h: data.market_data.high_24h.usd,
        low24h: data.market_data.low_24h.usd,
        circulatingSupply: data.market_data.circulating_supply,
        totalSupply: data.market_data.total_supply,
        lastUpdated: Date.now(),
      };
    } catch (error) {
      console.error('CoinGecko API error:', error);
      throw new Error('Failed to fetch price from CoinGecko');
    }
  }

  async getCMCPrice(cmcId: string): Promise<PriceData> {
    if (!this.cmcApiKey) {
      throw new Error('CoinMarketCap API key not configured');
    }

    try {
      const response = await axios.get(
        `https://pro-api.coinmarketcap.com/v2/cryptocurrency/quotes/latest`,
        {
          headers: {
            'X-CMC_PRO_API_KEY': this.cmcApiKey,
          },
          params: {
            id: cmcId,
          },
        }
      );

      const data = response.data.data[cmcId];
      const quote = data.quote.USD;

      return {
        price: quote.price,
        marketCap: quote.market_cap,
        volume24h: quote.volume_24h,
        priceChange24h: quote.percent_change_24h,
        priceChange7d: quote.percent_change_7d,
        priceChange30d: quote.percent_change_30d,
        high24h: 0, // Not provided by CMC
        low24h: 0, // Not provided by CMC
        circulatingSupply: data.circulating_supply,
        totalSupply: data.total_supply,
        lastUpdated: Date.now(),
      };
    } catch (error) {
      console.error('CoinMarketCap API error:', error);
      throw new Error('Failed to fetch price from CoinMarketCap');
    }
  }

  async getHistoricalPrices(
    coinId: string,
    days: number = 30
  ): Promise<HistoricalPrice[]> {
    try {
      const headers = this.coingeckoApiKey
        ? { 'x-cg-pro-api-key': this.coingeckoApiKey }
        : {};

      const response = await axios.get(
        `https://api.coingecko.com/api/v3/coins/${coinId}/market_chart`,
        {
          headers,
          params: {
            vs_currency: 'usd',
            days: days,
            interval: days > 90 ? 'daily' : 'hourly',
          },
        }
      );

      return response.data.prices.map(([timestamp, price]: [number, number]) => ({
        timestamp,
        price,
        volume: 0, // Would need separate call for volume
      }));
    } catch (error) {
      console.error('Error fetching historical prices:', error);
      return [];
    }
  }

  async getMultipleTokenPrices(coinIds: string[]): Promise<Map<string, PriceData>> {
    try {
      const headers = this.coingeckoApiKey
        ? { 'x-cg-pro-api-key': this.coingeckoApiKey }
        : {};

      const response = await axios.get(
        `https://api.coingecko.com/api/v3/coins/markets`,
        {
          headers,
          params: {
            vs_currency: 'usd',
            ids: coinIds.join(','),
            order: 'market_cap_desc',
            per_page: 250,
            page: 1,
            sparkline: false,
            price_change_percentage: '24h,7d,30d',
          },
        }
      );

      const priceMap = new Map<string, PriceData>();

      response.data.forEach((coin: any) => {
        priceMap.set(coin.id, {
          price: coin.current_price,
          marketCap: coin.market_cap,
          volume24h: coin.total_volume,
          priceChange24h: coin.price_change_percentage_24h,
          priceChange7d: coin.price_change_percentage_7d_in_currency,
          priceChange30d: coin.price_change_percentage_30d_in_currency,
          high24h: coin.high_24h,
          low24h: coin.low_24h,
          circulatingSupply: coin.circulating_supply,
          totalSupply: coin.total_supply,
          lastUpdated: Date.now(),
        });
      });

      return priceMap;
    } catch (error) {
      console.error('Error fetching multiple token prices:', error);
      return new Map();
    }
  }
}
