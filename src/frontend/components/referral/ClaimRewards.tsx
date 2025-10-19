import React, { useState } from 'react';
import { useReferralStats, useRewardClaims } from '../../hooks/useReferralAPI';
import type { UserSettings } from '../../types/referral';
import {
  formatCurrency,
  formatNumber,
  formatDate,
  getStatusColor,
  getStatusIcon,
} from '../../utils/helpers';

interface ClaimRewardsProps {
  userId: string;
  settings: UserSettings | null;
}

export const ClaimRewards: React.FC<ClaimRewardsProps> = ({ userId, settings }) => {
  const { stats } = useReferralStats(userId);
  const { claims, loading, error, claimRewards, refetch } = useRewardClaims(userId);

  const [claiming, setClaiming] = useState(false);
  const [claimError, setClaimError] = useState('');
  const [claimSuccess, setClaimSuccess] = useState(false);

  const handleClaim = async () => {
    if (!stats || stats.pendingRewards <= 0) return;
    if (!settings?.rewardType) {
      setClaimError('Please set your reward type in settings first');
      return;
    }
    if (!settings?.payoutWallet) {
      setClaimError('Please set your payout wallet in settings first');
      return;
    }

    setClaiming(true);
    setClaimError('');
    setClaimSuccess(false);

    try {
      await claimRewards(stats.pendingRewards, settings.rewardType);
      setClaimSuccess(true);
      setTimeout(() => setClaimSuccess(false), 5000);
    } catch (err: any) {
      setClaimError(err.message || 'Failed to claim rewards');
    } finally {
      setClaiming(false);
    }
  };

  const canClaim = stats && stats.pendingRewards > 0 && settings?.payoutWallet;
  const minClaimAmount = 100; // Minimum $100 to claim

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Claim Rewards</h1>

      {/* Pending Rewards Card */}
      <div className="bg-gradient-to-br from-bnb-secondary600 to-pink-600 rounded-2xl shadow-xl p-8 text-white">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-bnb-text text-sm font-medium mb-2">Available to Claim</p>
            <h2 className="text-5xl font-bold">
              {formatCurrency(stats?.pendingRewards || 0)}
            </h2>
            {settings?.rewardType === 'HYPE' && stats && (
              <p className="text-bnb-text mt-2">
                ≈ {formatNumber(stats.pendingRewards * 1250, 0)} HYPE tokens
              </p>
            )}
          </div>
          <div className="bg-white bg-opacity-20 p-6 rounded-2xl">
            <svg className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>

        {claimSuccess && (
          <div className="mb-4 p-4 bg-green-500 bg-opacity-20 border border-green-300 rounded-lg">
            <p className="flex items-center gap-2">
              <span className="text-2xl">✓</span>
              <span>Claim request submitted successfully! Processing may take a few minutes.</span>
            </p>
          </div>
        )}

        {claimError && (
          <div className="mb-4 p-4 bg-red-500 bg-opacity-20 border border-red-300 rounded-lg">
            <p className="flex items-center gap-2">
              <span className="text-2xl">⚠</span>
              <span>{claimError}</span>
            </p>
          </div>
        )}

        <div className="flex items-center gap-4">
          <button
            onClick={handleClaim}
            disabled={!canClaim || claiming || (stats?.pendingRewards || 0) < minClaimAmount}
            className="flex-1 bg-white text-bnb-secondary py-4 px-8 rounded-xl font-bold text-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {claiming ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Processing...
              </span>
            ) : (
              'Claim Now'
            )}
          </button>

          <button
            onClick={refetch}
            className="bg-white bg-opacity-20 hover:bg-opacity-30 p-4 rounded-xl transition-all"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>

        {stats && stats.pendingRewards < minClaimAmount && stats.pendingRewards > 0 && (
          <p className="mt-4 text-bnb-text text-sm">
            Minimum claim amount is {formatCurrency(minClaimAmount)}. Keep referring to reach the minimum!
          </p>
        )}

        {!settings?.payoutWallet && (
          <p className="mt-4 text-yellow-200 text-sm flex items-center gap-2">
            <span>⚠</span>
            <span>Please set your payout wallet in settings before claiming</span>
          </p>
        )}
      </div>

      {/* Payout Info */}
      {settings && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Payout Information</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-gray-600 mb-1">Reward Type</p>
              <p className="text-lg font-semibold text-gray-900">
                {settings.rewardType === 'HYPE' ? 'HYPE Tokens' : 'USDT'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Payout Wallet</p>
              <p className="text-lg font-semibold text-gray-900 font-mono">
                {settings.payoutWallet ? (
                  <>{settings.payoutWallet.slice(0, 10)}...{settings.payoutWallet.slice(-8)}</>
                ) : (
                  <span className="text-red-500">Not set</span>
                )}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Claim History */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <h3 className="text-lg font-bold text-gray-900">Claim History</h3>
        </div>

        {loading ? (
          <div className="p-12 text-center">
            <svg className="animate-spin h-12 w-12 text-bnb-secondary mx-auto mb-4" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <p className="text-gray-600">Loading claim history...</p>
          </div>
        ) : error ? (
          <div className="p-12 text-center">
            <div className="text-red-500 mb-4 text-5xl">⚠️</div>
            <p className="text-red-600 font-medium">{error}</p>
          </div>
        ) : claims.length === 0 ? (
          <div className="p-12 text-center">
            <div className="text-gray-400 mb-4 text-5xl">📋</div>
            <p className="text-gray-600 font-medium mb-2">No claims yet</p>
            <p className="text-gray-500 text-sm">
              Your claim history will appear here once you make your first claim
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Reward Type
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Transaction
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {claims.map((claim) => (
                  <tr key={claim.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-bold text-gray-900">
                        {formatCurrency(claim.amount)}
                      </div>
                      {claim.tokenAmount && (
                        <div className="text-xs text-gray-500">
                          {formatNumber(claim.tokenAmount, 0)} HYPE
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">
                        {claim.rewardType === 'HYPE' ? 'HYPE Tokens' : 'USDT'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                          claim.status
                        )}`}
                      >
                        {getStatusIcon(claim.status)} {claim.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {claim.txHash ? (
                        <a
                          href={`https://etherscan.io/tx/${claim.txHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-bnb-secondary hover:text-bnb-textSecondary font-mono flex items-center gap-1"
                        >
                          {claim.txHash.slice(0, 8)}...{claim.txHash.slice(-6)}
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </a>
                      ) : (
                        <span className="text-sm text-gray-400">Pending</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div>{formatDate(claim.createdAt)}</div>
                      {claim.completedAt && (
                        <div className="text-xs text-gray-400">
                          Completed: {formatDate(claim.completedAt)}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Important Notes */}
      <div className="bg-bnb-primary/5 border border-bnb-border rounded-xl p-6">
        <h4 className="font-bold text-bnb-textSecondary mb-3 flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Important Information
        </h4>
        <ul className="space-y-2 text-sm text-bnb-textSecondary">
          <li className="flex items-start gap-2">
            <span className="text-bnb-primary mt-0.5">•</span>
            <span>Minimum claim amount is {formatCurrency(minClaimAmount)}</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-bnb-primary mt-0.5">•</span>
            <span>Claims are processed within 24-48 hours</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-bnb-primary mt-0.5">•</span>
            <span>You will receive a notification when your claim is processed</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-bnb-primary mt-0.5">•</span>
            <span>For HYPE token claims, tokens will be sent to your connected wallet</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-bnb-primary mt-0.5">•</span>
            <span>For USDT claims, payment will be sent to your configured payout wallet</span>
          </li>
        </ul>
      </div>
    </div>
  );
};
