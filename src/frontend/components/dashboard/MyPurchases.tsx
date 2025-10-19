import React from 'react';
import { BNBCard, BNBBadge, BNBButton } from '../ui/bnb';

interface Purchase {
  id: string;
  date: string;
  amount: number;
  paymentMethod: 'BNB' | 'USDT';
  tokenAmount: number;
  bonusTokens: number;
  totalTokens: number;
  vestedTokens: number;
  claimedTokens: number;
  txHash: string;
}

interface MyPurchasesProps {
  purchases: Purchase[];
  onClaim?: (purchaseId: string) => void;
}

export const MyPurchases: React.FC<MyPurchasesProps> = ({
  purchases = [],
  onClaim,
}) => {
  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const shortenHash = (hash: string) => {
    return `${hash.slice(0, 10)}...${hash.slice(-8)}`;
  };

  const getVestingProgress = (purchase: Purchase) => {
    const totalVested = purchase.vestedTokens;
    const totalTokens = purchase.totalTokens;
    return (totalVested / totalTokens) * 100;
  };

  const getClaimableTokens = (purchase: Purchase) => {
    return purchase.vestedTokens - purchase.claimedTokens;
  };

  const totalInvested = purchases.reduce((sum, p) => sum + p.amount, 0);
  const totalTokens = purchases.reduce((sum, p) => sum + p.totalTokens, 0);
  const totalVested = purchases.reduce((sum, p) => sum + p.vestedTokens, 0);
  const totalClaimed = purchases.reduce((sum, p) => sum + p.claimedTokens, 0);
  const totalClaimable = totalVested - totalClaimed;

  return (
    <div className="space-y-6">
      {/* Title */}
      <BNBCard variant="gradient" padding="lg">
        <div>
          <h1 className="text-3xl font-bold text-[#EAECEF] mb-2">
            My Purchases
          </h1>
          <p className="text-[#848E9C]">
            Track your token purchases and claim vested tokens
          </p>
        </div>
      </BNBCard>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <BNBCard padding="md">
          <div className="text-center">
            <p className="text-sm text-[#848E9C] mb-2">Total Invested</p>
            <p className="text-2xl font-bold text-[#EAECEF]">{formatCurrency(totalInvested)}</p>
          </div>
        </BNBCard>

        <BNBCard padding="md">
          <div className="text-center">
            <p className="text-sm text-[#848E9C] mb-2">Total Tokens</p>
            <p className="text-2xl font-bold text-[#F3BA2F]">{formatNumber(totalTokens)}</p>
          </div>
        </BNBCard>

        <BNBCard padding="md">
          <div className="text-center">
            <p className="text-sm text-[#848E9C] mb-2">Vested Tokens</p>
            <p className="text-2xl font-bold text-[#0ECB81]">{formatNumber(totalVested)}</p>
          </div>
        </BNBCard>

        <BNBCard padding="md">
          <div className="text-center">
            <p className="text-sm text-[#848E9C] mb-2">Claimable Now</p>
            <p className="text-2xl font-bold text-[#FCD535]">{formatNumber(totalClaimable)}</p>
          </div>
        </BNBCard>
      </div>

      {/* Vesting Timeline */}
      <BNBCard title="Vesting Timeline" subtitle="Your token unlock schedule" padding="lg">
        <div className="space-y-6">
          {/* Timeline visualization */}
          <div className="relative">
            <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-[#848E9C]/20"></div>

            {Array.from({ length: 6 }).map((_, index) => {
              const monthProgress = ((index + 1) / 6) * 100;
              const isPast = monthProgress <= ((totalVested / totalTokens) * 100);

              return (
                <div key={index} className="relative flex gap-4 mb-6 last:mb-0">
                  <div className={`
                    relative z-10 w-12 h-12 rounded-full flex items-center justify-center font-bold
                    ${isPast
                      ? 'bg-gradient-to-br from-[#F3BA2F] to-[#FCD535] text-[#14151A]'
                      : 'bg-[#14151A] border-2 border-[#848E9C]/20 text-[#848E9C]'
                    }
                  `}>
                    {isPast ? '✓' : index + 1}
                  </div>

                  <div className="flex-1 pt-2">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-bold text-[#EAECEF]">Month {index + 1}</h4>
                      <BNBBadge variant={isPast ? 'success' : 'info'} size="sm">
                        {isPast ? 'Unlocked' : 'Locked'}
                      </BNBBadge>
                    </div>
                    <p className="text-sm text-[#848E9C]">
                      {formatNumber((totalTokens / 6) * (index + 1))} HYPE unlocked
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </BNBCard>

      {/* Purchase History */}
      <BNBCard title="Purchase History" subtitle={`${purchases.length} transactions`} padding="lg">
        {purchases.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-[#14151A] flex items-center justify-center text-4xl">
              📦
            </div>
            <h3 className="text-xl font-bold text-[#EAECEF] mb-2">No Purchases Yet</h3>
            <p className="text-[#848E9C] mb-6">
              Start by purchasing HYPE tokens to see your transaction history here
            </p>
            <BNBButton>Buy Tokens Now</BNBButton>
          </div>
        ) : (
          <div className="space-y-4">
            {purchases.map((purchase) => {
              const vestingProgress = getVestingProgress(purchase);
              const claimable = getClaimableTokens(purchase);

              return (
                <div
                  key={purchase.id}
                  className="bg-[#14151A] border border-[#848E9C]/20 rounded-xl p-6 hover:border-[#F3BA2F]/50 transition-all"
                >
                  <div className="grid lg:grid-cols-2 gap-6">
                    {/* Left side - Purchase details */}
                    <div className="space-y-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-bold text-[#EAECEF]">
                              {formatNumber(purchase.totalTokens)} HYPE
                            </h4>
                            <BNBBadge variant="gold" size="sm">
                              +{formatNumber(purchase.bonusTokens)} Bonus
                            </BNBBadge>
                          </div>
                          <p className="text-sm text-[#848E9C]">
                            {formatDate(purchase.date)}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs text-[#848E9C] mb-1">Paid</p>
                          <p className="text-sm font-bold text-[#EAECEF]">
                            {purchase.amount} {purchase.paymentMethod}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-[#848E9C] mb-1">Base Tokens</p>
                          <p className="text-sm font-bold text-[#EAECEF]">
                            {formatNumber(purchase.tokenAmount)}
                          </p>
                        </div>
                      </div>

                      <div>
                        <a
                          href={`https://testnet.bscscan.com/tx/${purchase.txHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-[#F3BA2F] hover:underline flex items-center gap-1"
                        >
                          {shortenHash(purchase.txHash)}
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </a>
                      </div>
                    </div>

                    {/* Right side - Vesting status */}
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-[#848E9C]">Vesting Progress</span>
                          <span className="font-bold text-[#EAECEF]">{vestingProgress.toFixed(0)}%</span>
                        </div>
                        <div className="w-full bg-[#1E2026] rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-[#F3BA2F] to-[#FCD535] h-2 rounded-full transition-all duration-500"
                            style={{ width: `${vestingProgress}%` }}
                          ></div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs text-[#848E9C] mb-1">Vested</p>
                          <p className="text-sm font-bold text-[#0ECB81]">
                            {formatNumber(purchase.vestedTokens)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-[#848E9C] mb-1">Claimed</p>
                          <p className="text-sm font-bold text-[#EAECEF]">
                            {formatNumber(purchase.claimedTokens)}
                          </p>
                        </div>
                      </div>

                      <BNBButton
                        onClick={() => onClaim?.(purchase.id)}
                        disabled={claimable <= 0}
                        fullWidth
                        size="sm"
                      >
                        {claimable > 0
                          ? `Claim ${formatNumber(claimable)} HYPE`
                          : 'No Tokens to Claim'
                        }
                      </BNBButton>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </BNBCard>
    </div>
  );
};
