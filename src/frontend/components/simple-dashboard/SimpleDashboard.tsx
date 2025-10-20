import React from 'react';
import { useRouter } from 'next/router';
import { BigNumber } from './BigNumber';
import { SimpleProgress } from './SimpleProgress';
import { TwoButtons } from './TwoButtons';
import { usePrivateSale } from '@/hooks/usePrivateSale';

export function SimpleDashboard() {
  const router = useRouter();
  const { userPurchases, calculateUnlockedAmount } = usePrivateSale();

  // Подсчёт токенов
  const totalTokens = userPurchases.reduce((sum, p) => sum + p.tokenAmount, 0);
  const unlockedTokens = userPurchases.reduce((sum, p) => sum + calculateUnlockedAmount(p), 0);
  const percentage = totalTokens > 0 ? Math.round((unlockedTokens / totalTokens) * 100) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-cyan-900 py-12">
      <div className="max-w-4xl mx-auto">

        {/* 1. Главная цифра */}
        <BigNumber
          value={totalTokens}
          token="HYPE"
          label="💎 У ВАС ТОКЕНОВ"
        />

        {/* 2. Прогресс-бар */}
        <SimpleProgress
          percentage={percentage}
          unlockedAmount={unlockedTokens}
          token="HYPE"
        />

        {/* 3. Две кнопки */}
        <TwoButtons
          onBuy={() => router.push('/buy')}
          onClaim={() => router.push('/claim')}
          claimDisabled={unlockedTokens === 0}
        />

        {/* Простое объяснение */}
        <div className="text-center text-gray-300 mt-12 text-lg">
          20% получаете сразу, остальное разблокируется за 21 месяц
        </div>

      </div>
    </div>
  );
}
