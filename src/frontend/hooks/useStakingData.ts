import { useState, useEffect } from 'react';
import { useStakingContract } from './useContract';
import { useWeb3 } from '@/contexts/Web3Context';
import type { StakingData } from '@/types';
import { REFRESH_INTERVAL } from '@/lib/constants';

export function useStakingData(stakingAddress: string) {
  const [stakingData, setStakingData] = useState<StakingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const contract = useStakingContract(stakingAddress);
  const { address, isConnected } = useWeb3();

  useEffect(() => {
    let mounted = true;
    let interval: NodeJS.Timeout;

    const fetchStakingData = async () => {
      if (!contract || !isConnected || !address) {
        setLoading(false);
        return;
      }

      try {
        const [userStaked, totalStaked, apy, rewards] = await Promise.all([
          contract.getStakedAmount(address),
          contract.totalStaked(),
          contract.apy(),
          contract.getRewards(address),
        ]);

        if (mounted) {
          setStakingData({
            userStaked: userStaked.toString(),
            totalStaked: totalStaked.toString(),
            apy: Number(apy) / 100,
            rewards: rewards.toString(),
            lockPeriod: 30,
            unlockTime: Math.floor(Date.now() / 1000) + 30 * 86400,
          });
          setError(null);
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err.message : 'Failed to fetch staking data');
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchStakingData();
    interval = setInterval(fetchStakingData, REFRESH_INTERVAL);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [contract, address, isConnected, stakingAddress]);

  const stake = async (amount: string, lockPeriod: number) => {
    if (!contract) throw new Error('Contract not initialized');
    const tx = await contract.stake(amount, lockPeriod);
    await tx.wait();
  };

  const unstake = async (amount: string) => {
    if (!contract) throw new Error('Contract not initialized');
    const tx = await contract.unstake(amount);
    await tx.wait();
  };

  const claimRewards = async () => {
    if (!contract) throw new Error('Contract not initialized');
    const tx = await contract.claimRewards();
    await tx.wait();
  };

  return { stakingData, loading, error, stake, unstake, claimRewards };
}
