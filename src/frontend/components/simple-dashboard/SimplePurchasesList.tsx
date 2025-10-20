import React from 'react';
import { usePrivateSale } from '@/hooks/usePrivateSale';

export function SimplePurchasesList() {
  const { userPurchases, calculateUnlockedAmount } = usePrivateSale();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-cyan-900 py-12">
      <div className="max-w-2xl mx-auto px-8">

        {/* Заголовок */}
        <h1 className="text-4xl font-bold text-white text-center mb-12">
          📜 ИСТОРИЯ ПОКУПОК
        </h1>

        {/* Список покупок */}
        <div className="space-y-6">
          {userPurchases.map((purchase, index) => {
            const unlockedAmount = calculateUnlockedAmount(purchase);
            const percentage = Math.round((unlockedAmount / purchase.tokenAmount) * 100);

            return (
              <div key={index} className="bg-gray-800/50 rounded-2xl p-8 backdrop-blur-sm">

                {/* Дата */}
                <div className="text-gray-400 text-lg mb-4">
                  {new Date(purchase.purchaseDate).toLocaleDateString('ru-RU', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })}
                </div>

                {/* Количество токенов */}
                <div className="text-4xl font-bold text-cyan-400 mb-6">
                  {purchase.tokenAmount.toLocaleString('ru-RU')} HYPE
                </div>

                {/* Прогресс-бар */}
                <div className="relative h-4 bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="absolute h-full bg-gradient-to-r from-cyan-400 to-blue-500 transition-all"
                    style={{ width: `${percentage}%` }}
                  />
                </div>

                {/* Текст */}
                <div className="text-gray-300 text-lg mt-3">
                  Разблокировано {percentage}% ({unlockedAmount.toLocaleString('ru-RU')} токенов)
                </div>

              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}
