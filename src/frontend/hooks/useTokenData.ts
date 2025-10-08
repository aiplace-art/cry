import { useState, useEffect } from 'react';
import { useTokenContract } from './useContract';
import type { TokenData } from '@/types';
import { REFRESH_INTERVAL } from '@/lib/constants';

export function useTokenData(tokenAddress: string) {
  const [tokenData, setTokenData] = useState<TokenData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const contract = useTokenContract(tokenAddress);

  useEffect(() => {
    let mounted = true;
    let interval: NodeJS.Timeout;

    const fetchTokenData = async () => {
      if (!contract) {
        setLoading(false);
        return;
      }

      try {
        const [name, symbol, decimals, totalSupply] = await Promise.all([
          contract.name(),
          contract.symbol(),
          contract.decimals(),
          contract.totalSupply(),
        ]);

        // Mock price data - in production, fetch from an oracle or API
        const mockPrice = 1.23 + Math.random() * 0.1;
        const mockPriceChange = (Math.random() - 0.5) * 10;
        const mockVolume = 1000000 + Math.random() * 500000;
        const mockHolders = 5000 + Math.floor(Math.random() * 1000);

        if (mounted) {
          setTokenData({
            address: tokenAddress,
            name,
            symbol,
            decimals: Number(decimals),
            totalSupply: totalSupply.toString(),
            price: mockPrice,
            marketCap: mockPrice * Number(totalSupply) / Math.pow(10, Number(decimals)),
            holders: mockHolders,
            priceChange24h: mockPriceChange,
            volume24h: mockVolume,
          });
          setError(null);
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err.message : 'Failed to fetch token data');
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchTokenData();
    interval = setInterval(fetchTokenData, REFRESH_INTERVAL);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [contract, tokenAddress]);

  return { tokenData, loading, error };
}
