import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ethers } from 'ethers';
import { useStakingContract } from './useContract';
import { useWeb3 } from '@/contexts/Web3Context';
import { stakingApi } from '@/lib/api';
import { useNotifications } from '@/lib/notifications';
import { useStakingUpdates } from '@/lib/websocket';
import type { StakingData } from '@/types';
import { REFRESH_INTERVAL } from '@/lib/constants';

export function useStakingData(stakingAddress: string) {
  const contract = useStakingContract(stakingAddress);
  const { address, isConnected } = useWeb3();
  const queryClient = useQueryClient();
  const notifications = useNotifications();
  const wsStakingData = useStakingUpdates(stakingAddress);

  // Fetch staking data from contract
  const { data: stakingData, isLoading: loading, error: queryError } = useQuery({
    queryKey: ['staking', stakingAddress, address],
    queryFn: async () => {
      if (!contract || !address) throw new Error('Not connected');

      const [userStaked, totalStaked, apy, rewards] = await Promise.all([
        contract.getStakedAmount(address),
        contract.totalStaked(),
        contract.apy(),
        contract.getRewards(address),
      ]);

      return {
        userStaked: userStaked.toString(),
        totalStaked: totalStaked.toString(),
        apy: Number(apy) / 100,
        rewards: rewards.toString(),
        lockPeriod: 30,
        unlockTime: Math.floor(Date.now() / 1000) + 30 * 86400,
      } as StakingData;
    },
    enabled: !!contract && !!address && isConnected,
    refetchInterval: REFRESH_INTERVAL,
  });

  // Stake mutation
  const stakeMutation = useMutation({
    mutationFn: async ({ amount, lockPeriod }: { amount: string; lockPeriod: number }) => {
      if (!contract) throw new Error('Contract not initialized');

      const parsedAmount = ethers.parseEther(amount);
      const tx = await contract.stake(parsedAmount, lockPeriod);

      notifications.info('Transaction Submitted', 'Waiting for confirmation...');
      const receipt = await tx.wait();

      return receipt;
    },
    onSuccess: () => {
      notifications.success('Staking Successful', 'Your tokens have been staked');
      queryClient.invalidateQueries({ queryKey: ['staking', stakingAddress] });
    },
    onError: (error: Error) => {
      notifications.error('Staking Failed', error.message);
    },
  });

  // Unstake mutation
  const unstakeMutation = useMutation({
    mutationFn: async (amount: string) => {
      if (!contract) throw new Error('Contract not initialized');

      const parsedAmount = ethers.parseEther(amount);
      const tx = await contract.unstake(parsedAmount);

      notifications.info('Transaction Submitted', 'Waiting for confirmation...');
      const receipt = await tx.wait();

      return receipt;
    },
    onSuccess: () => {
      notifications.success('Unstaking Successful', 'Your tokens have been unstaked');
      queryClient.invalidateQueries({ queryKey: ['staking', stakingAddress] });
    },
    onError: (error: Error) => {
      notifications.error('Unstaking Failed', error.message);
    },
  });

  // Claim rewards mutation
  const claimMutation = useMutation({
    mutationFn: async () => {
      if (!contract) throw new Error('Contract not initialized');

      const tx = await contract.claimRewards();

      notifications.info('Transaction Submitted', 'Claiming rewards...');
      const receipt = await tx.wait();

      return receipt;
    },
    onSuccess: () => {
      notifications.success('Rewards Claimed', 'Your rewards have been claimed');
      queryClient.invalidateQueries({ queryKey: ['staking', stakingAddress] });
    },
    onError: (error: Error) => {
      notifications.error('Claim Failed', error.message);
    },
  });

  const error = queryError ? (queryError as Error).message : null;

  return {
    stakingData: wsStakingData || stakingData,
    loading,
    error,
    stake: (amount: string, lockPeriod: number) => stakeMutation.mutateAsync({ amount, lockPeriod }),
    unstake: (amount: string) => unstakeMutation.mutateAsync(amount),
    claimRewards: () => claimMutation.mutateAsync(),
  };
}
