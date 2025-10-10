import { useState, useEffect, useMemo } from 'react';
import { ethers, Contract } from 'ethers';
import { useWeb3 } from '@/contexts/Web3Context';
import { TOKEN_ABI, STAKING_ABI, GOVERNANCE_ABI } from '@/types/abis';

// Contract addresses - update these with your deployed addresses
export const CONTRACTS = {
  TOKEN: process.env.VITE_TOKEN_ADDRESS || '0x0000000000000000000000000000000000000000',
  STAKING: process.env.VITE_STAKING_ADDRESS || '0x0000000000000000000000000000000000000000',
  GOVERNANCE: process.env.VITE_GOVERNANCE_ADDRESS || '0x0000000000000000000000000000000000000000',
};

export const useTokenContract = () => {
  const { signer, provider } = useWeb3();

  return useMemo(() => {
    if (!CONTRACTS.TOKEN || CONTRACTS.TOKEN === '0x0000000000000000000000000000000000000000') {
      return null;
    }
    const signerOrProvider = signer || provider;
    if (!signerOrProvider) return null;
    return new Contract(CONTRACTS.TOKEN, TOKEN_ABI, signerOrProvider);
  }, [signer, provider]);
};

export const useStakingContract = () => {
  const { signer, provider } = useWeb3();

  return useMemo(() => {
    if (!CONTRACTS.STAKING || CONTRACTS.STAKING === '0x0000000000000000000000000000000000000000') {
      return null;
    }
    const signerOrProvider = signer || provider;
    if (!signerOrProvider) return null;
    return new Contract(CONTRACTS.STAKING, STAKING_ABI, signerOrProvider);
  }, [signer, provider]);
};

export const useGovernanceContract = () => {
  const { signer, provider } = useWeb3();

  return useMemo(() => {
    if (!CONTRACTS.GOVERNANCE || CONTRACTS.GOVERNANCE === '0x0000000000000000000000000000000000000000') {
      return null;
    }
    const signerOrProvider = signer || provider;
    if (!signerOrProvider) return null;
    return new Contract(CONTRACTS.GOVERNANCE, GOVERNANCE_ABI, signerOrProvider);
  }, [signer, provider]);
};

export const useContractRead = <T,>(
  contract: Contract | null,
  method: string,
  args: any[] = [],
  options: { enabled?: boolean; interval?: number } = {}
) => {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState(true);

  const { enabled = true, interval } = options;

  useEffect(() => {
    if (!contract || !enabled) {
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        const result = await contract[method](...args);
        setData(result);
        setError(null);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    if (interval) {
      const intervalId = setInterval(fetchData, interval);
      return () => clearInterval(intervalId);
    }
  }, [contract, method, JSON.stringify(args), enabled, interval]);

  return { data, error, loading };
};

export const useContractWrite = (contract: Contract | null, method: string) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);

  const write = async (...args: any[]) => {
    if (!contract) {
      throw new Error('Contract not initialized');
    }

    setLoading(true);
    setError(null);
    setTxHash(null);

    try {
      const tx = await contract[method](...args);
      setTxHash(tx.hash);
      const receipt = await tx.wait();
      return receipt;
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { write, loading, error, txHash };
};

export const formatUnits = (value: bigint | string, decimals: number = 18): string => {
  try {
    return ethers.formatUnits(value, decimals);
  } catch {
    return '0';
  }
};

export const parseUnits = (value: string, decimals: number = 18): bigint => {
  try {
    return ethers.parseUnits(value, decimals);
  } catch {
    return BigInt(0);
  }
};

export const formatAddress = (address: string): string => {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};
