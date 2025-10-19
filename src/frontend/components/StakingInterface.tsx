'use client';

import React, { useState } from 'react';
import { useStakingData } from '@/hooks/useStakingData';
import { Card, CardHeader, CardTitle, CardContent } from './ui/Card';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Badge } from './ui/Badge';
import { Loading } from './ui/Loading';
import { formatTokenAmount, calculateAPY, formatTimeRemaining } from '@/lib/utils';
import { STAKING_LOCK_PERIODS } from '@/lib/constants';
import { Lock, Unlock, TrendingUp, Clock } from 'lucide-react';

interface StakingInterfaceProps {
  stakingAddress: string;
  tokenSymbol: string;
}

export const StakingInterface: React.FC<StakingInterfaceProps> = ({
  stakingAddress,
  tokenSymbol,
}) => {
  const { stakingData, loading, error, stake, unstake, claimRewards } = useStakingData(stakingAddress);
  const [stakeAmount, setStakeAmount] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState(STAKING_LOCK_PERIODS[0]);
  const [isStaking, setIsStaking] = useState(false);

  if (loading) return <Loading text="Loading staking data..." />;
  if (error) return <div className="text-red-600">Error: {error}</div>;
  if (!stakingData) return null;

  const calculatedAPY = calculateAPY(
    Number(stakeAmount || 0),
    stakingData.apy,
    selectedPeriod.days
  );

  const handleStake = async () => {
    if (!stakeAmount || Number(stakeAmount) <= 0) return;
    setIsStaking(true);
    try {
      await stake(stakeAmount, selectedPeriod.days);
      setStakeAmount('');
    } catch (err) {
      console.error('Staking failed:', err);
    } finally {
      setIsStaking(false);
    }
  };

  const handleUnstake = async () => {
    if (!stakingData.userStaked) return;
    setIsStaking(true);
    try {
      await unstake(stakingData.userStaked);
    } catch (err) {
      console.error('Unstaking failed:', err);
    } finally {
      setIsStaking(false);
    }
  };

  const handleClaim = async () => {
    setIsStaking(true);
    try {
      await claimRewards();
    } catch (err) {
      console.error('Claim failed:', err);
    } finally {
      setIsStaking(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card gradient hover>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Your Staked</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  {formatTokenAmount(stakingData.userStaked)} {tokenSymbol}
                </p>
              </div>
              <div className="p-3 bg-primary-100 dark:bg-primary-900/30 rounded-lg">
                <Lock className="h-6 w-6 text-primary-600 dark:text-primary-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card gradient hover>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Your Rewards</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  {formatTokenAmount(stakingData.rewards)} {tokenSymbol}
                </p>
              </div>
              <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <TrendingUp className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card gradient hover>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Current APY</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  {stakingData.apy.toFixed(2)}%
                </p>
              </div>
              <div className="p-3 bg-secondary-100 dark:bg-secondary-900/30 rounded-lg">
                <TrendingUp className="h-6 w-6 text-secondary-600 dark:text-secondary-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              Stake Tokens
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Input
                type="number"
                placeholder="Amount to stake"
                value={stakeAmount}
                onChange={(e) => setStakeAmount(e.target.value)}
                label={`Amount (${tokenSymbol})`}
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Lock Period
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {STAKING_LOCK_PERIODS.map((period) => (
                    <button
                      key={period.days}
                      onClick={() => setSelectedPeriod(period)}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        selectedPeriod.days === period.days
                          ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-primary-300'
                      }`}
                    >
                      <p className="font-medium text-gray-900 dark:text-white">
                        {period.days} days
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {period.multiplier}x rewards
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              {stakeAmount && Number(stakeAmount) > 0 && (
                <div className="p-4 bg-gradient-primary/10 rounded-lg border border-primary-500/20">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Estimated APY</p>
                  <p className="text-2xl font-bold text-primary-600 dark:text-primary-400 mt-1">
                    {calculatedAPY.toFixed(2)}%
                  </p>
                </div>
              )}

              <Button
                variant="primary"
                className="w-full"
                onClick={handleStake}
                loading={isStaking}
                disabled={!stakeAmount || Number(stakeAmount) <= 0}
              >
                <Lock className="mr-2 h-4 w-4" />
                Stake Tokens
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Unlock className="h-5 w-5" />
              Manage Stake
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Staked Amount</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {formatTokenAmount(stakingData.userStaked)} {tokenSymbol}
                  </span>
                </div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Unlock Time</span>
                  <Badge variant="warning">
                    <Clock className="inline h-3 w-3 mr-1" />
                    {formatTimeRemaining(stakingData.unlockTime)}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Pending Rewards</span>
                  <span className="font-medium text-green-600 dark:text-green-400">
                    {formatTokenAmount(stakingData.rewards)} {tokenSymbol}
                  </span>
                </div>
              </div>

              <Button
                variant="secondary"
                className="w-full"
                onClick={handleClaim}
                loading={isStaking}
                disabled={Number(stakingData.rewards) === 0}
              >
                <TrendingUp className="mr-2 h-4 w-4" />
                Claim Rewards
              </Button>

              <Button
                variant="outline"
                className="w-full"
                onClick={handleUnstake}
                loading={isStaking}
                disabled={Number(stakingData.userStaked) === 0}
              >
                <Unlock className="mr-2 h-4 w-4" />
                Unstake All
              </Button>

              <div className="p-4 bg-bnb-primary/5 dark:bg-bnb-darker/20 rounded-lg border border-bnb-border dark:border-bnb-border">
                <p className="text-sm text-bnb-textSecondary dark:text-bnb-primary">
                  Total Staked in Pool: {formatTokenAmount(stakingData.totalStaked)} {tokenSymbol}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
