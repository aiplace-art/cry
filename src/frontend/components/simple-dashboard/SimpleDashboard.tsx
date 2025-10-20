import React from 'react';
import { useRouter } from 'next/router';
import { BigNumber } from './BigNumber';
import { SimpleProgress } from './SimpleProgress';
import { TwoButtons } from './TwoButtons';

export function SimpleDashboard() {
  const router = useRouter();

  // Mock данные для демонстрации (в продакшене заменить на usePrivateSale hook)
  const totalTokens = 250000;
  const unlockedTokens = 167500; // 67% разблокировано
  const percentage = 67;

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

        {/* Переключение на полную версию */}
        <div className="text-center mt-8">
          <p className="text-gray-400 text-sm mb-2">
            Нужна подробная статистика?
          </p>
          <button
            onClick={() => router.push('/dashboard')}
            className="text-cyan-400 hover:text-cyan-300 text-sm font-medium transition-colors"
          >
            → Переключиться на полную версию
          </button>
        </div>

      </div>
    </div>
  );
}
