import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTokenContract } from './useContract';
import { tokenApi } from '@/lib/api';
import { usePriceUpdates } from '@/lib/websocket';
import type { TokenData } from '@/types';
import { REFRESH_INTERVAL } from '@/lib/constants';

export function useTokenData(tokenAddress: string) {
  const contract = useTokenContract(tokenAddress);
  const [symbol, setSymbol] = useState<string>('');

  // Get real-time price updates via WebSocket
  const { price: livePrice, priceChange } = usePriceUpdates(symbol);

  // Fetch token metadata from contract
  const { data: contractData, isLoading: contractLoading } = useQuery({
    queryKey: ['token-contract', tokenAddress],
    queryFn: async () => {
      if (!contract) throw new Error('Contract not initialized');

      const [name, symbol, decimals, totalSupply] = await Promise.all([
        contract.name(),
        contract.symbol(),
        contract.decimals(),
        contract.totalSupply(),
      ]);

      setSymbol(symbol);

      return {
        name,
        symbol,
        decimals: Number(decimals),
        totalSupply: totalSupply.toString(),
      };
    },
    enabled: !!contract,
    staleTime: 60000,
  });

  // Fetch price and market data from API
  const { data: marketData, isLoading: marketLoading } = useQuery({
    queryKey: ['token-market', tokenAddress],
    queryFn: () => tokenApi.getTokenData(tokenAddress),
    refetchInterval: REFRESH_INTERVAL,
    enabled: !!tokenAddress,
  });

  const loading = contractLoading || marketLoading;
  const error = !contract && !loading ? 'Contract not initialized' : null;

  const tokenData: TokenData | null = contractData && marketData ? {
    address: tokenAddress,
    name: contractData.name,
    symbol: contractData.symbol,
    decimals: contractData.decimals,
    totalSupply: contractData.totalSupply,
    price: livePrice || (marketData as any)?.price || 0,
    marketCap: (marketData as any)?.marketCap || 0,
    holders: (marketData as any)?.holders || 0,
    priceChange24h: priceChange || (marketData as any)?.priceChange24h || 0,
    volume24h: (marketData as any)?.volume24h || 0,
  } : null;

  return { tokenData, loading, error };
}
