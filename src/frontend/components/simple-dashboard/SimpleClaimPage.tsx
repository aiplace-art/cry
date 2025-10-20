import React from 'react';
import { usePrivateSale } from '@/hooks/usePrivateSale';

export function SimpleClaimPage() {
  const { userPurchases, claimTokens, calculateUnlockedAmount, loading } = usePrivateSale();

  // Подсчёт доступных токенов
  const availableTokens = userPurchases.reduce((sum, p) => sum + calculateUnlockedAmount(p), 0);

  // Следующая разблокировка
  const nextUnlock = userPurchases[0]?.vestingSchedule.find(v => !v.claimed);

  const handleClaim = async () => {
    await claimTokens();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-cyan-900 py-12">
      <div className="max-w-2xl mx-auto px-8 text-center">

        {/* Заголовок */}
        <h1 className="text-4xl font-bold text-white mb-12">
          💸 ЗАБРАТЬ ТОКЕНЫ
        </h1>

        {/* Доступно к получению */}
        <div className="bg-gray-800/50 rounded-2xl p-12 backdrop-blur-sm mb-8">
          <div className="text-xl text-gray-300 mb-4">
            Доступно к получению:
          </div>
          <div className="text-7xl font-bold text-cyan-400 mb-8">
            {availableTokens.toLocaleString('ru-RU')}
          </div>
          <div className="text-2xl text-gray-300">
            HYPE
          </div>
        </div>

        {/* Кнопка забрать */}
        <button
          onClick={handleClaim}
          disabled={availableTokens === 0 || loading}
          className="px-16 py-6 bg-cyan-500 hover:bg-cyan-600 text-white text-2xl font-bold rounded-xl transition-all shadow-lg hover:shadow-cyan-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'ОТПРАВЛЯЕМ...' : 'ЗАБРАТЬ'}
        </button>

        {/* Следующая разблокировка */}
        {nextUnlock && (
          <div className="mt-12 text-gray-300 text-lg">
            Следующая разблокировка:<br />
            <span className="text-cyan-400 font-bold">
              {new Date(nextUnlock.date).toLocaleDateString('ru-RU')} - {nextUnlock.amount.toLocaleString('ru-RU')} токенов
            </span>
          </div>
        )}

      </div>
    </div>
  );
}
