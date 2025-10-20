import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { DashboardOverview } from '@/components/dashboard/DashboardOverview';
import { BuyTokensPanel } from '@/components/dashboard/BuyTokensPanel';
import { MyPurchases } from '@/components/dashboard/MyPurchases';
import { useRouter } from 'next/router';

/**
 * ✅ ОРИГИНАЛЬНЫЙ ДАШБОРД (V1)
 *
 * Полная версия дашборда с подробной статистикой
 * - 4 карточки статистики
 * - График цены токена
 * - 3 блока быстрых действий
 * - История покупок
 * - Подробная информация о вестинге
 *
 * Доступ: http://localhost:3000/dashboard-original
 */
export default function DashboardOriginalPage() {
  const router = useRouter();
  const [view, setView] = useState<'overview' | 'buy' | 'purchases'>('overview');

  // Mock data (в продакшене брать из usePrivateSale hook)
  const mockData = {
    totalInvested: 5000,
    tokensOwned: 250000,
    vestingProgress: 67,
    referralEarnings: 1250,
  };

  const handleBuyTokens = () => {
    setView('buy');
  };

  const handleClaimTokens = () => {
    // TODO: Implement claim logic
    console.log('Claiming tokens...');
  };

  const handleViewPurchases = () => {
    setView('purchases');
  };

  return (
    <DashboardLayout>
      {view === 'overview' && (
        <DashboardOverview
          totalInvested={mockData.totalInvested}
          tokensOwned={mockData.tokensOwned}
          vestingProgress={mockData.vestingProgress}
          referralEarnings={mockData.referralEarnings}
          onBuyTokens={handleBuyTokens}
          onClaimTokens={handleClaimTokens}
        />
      )}

      {view === 'buy' && (
        <BuyTokensPanel
          onPurchase={(amount, method) => {
            console.log(`Purchasing ${amount} with ${method}`);
            // TODO: Implement purchase logic
          }}
        />
      )}

      {view === 'purchases' && (
        <MyPurchases />
      )}

      {/* Navigation Buttons */}
      <div className="mt-8 flex gap-4 justify-center">
        <button
          onClick={() => setView('overview')}
          className={`px-6 py-2 rounded-lg ${
            view === 'overview'
              ? 'bg-[#F3BA2F] text-black'
              : 'bg-[#14151A] text-[#848E9C] hover:bg-[#1E2026]'
          }`}
        >
          📊 Overview
        </button>
        <button
          onClick={() => setView('buy')}
          className={`px-6 py-2 rounded-lg ${
            view === 'buy'
              ? 'bg-[#F3BA2F] text-black'
              : 'bg-[#14151A] text-[#848E9C] hover:bg-[#1E2026]'
          }`}
        >
          💳 Buy Tokens
        </button>
        <button
          onClick={() => setView('purchases')}
          className={`px-6 py-2 rounded-lg ${
            view === 'purchases'
              ? 'bg-[#F3BA2F] text-black'
              : 'bg-[#14151A] text-[#848E9C] hover:bg-[#1E2026]'
          }`}
        >
          📜 My Purchases
        </button>
      </div>

      {/* Version Switcher */}
      <div className="mt-8 text-center">
        <button
          onClick={() => router.push('/dashboard-simple')}
          className="text-[#F3BA2F] hover:text-[#FCD535] text-sm"
        >
          → Переключиться на упрощённую версию
        </button>
      </div>
    </DashboardLayout>
  );
}
