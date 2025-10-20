import React from 'react';

interface SimpleProgressProps {
  percentage: number;
  unlockedAmount: number;
  token: string;
}

export function SimpleProgress({ percentage, unlockedAmount, token }: SimpleProgressProps) {
  return (
    <div className="max-w-2xl mx-auto px-8">
      {/* Прогресс-бар */}
      <div className="relative h-6 bg-gray-700 rounded-full overflow-hidden">
        <div
          className="absolute h-full bg-gradient-to-r from-cyan-400 to-blue-500 transition-all duration-500"
          style={{ width: `${percentage}%` }}
        />
        <div className="absolute inset-0 flex items-center justify-center text-sm font-bold text-white">
          {percentage}%
        </div>
      </div>

      {/* Подпись */}
      <div className="text-center text-lg text-gray-300 mt-3">
        Разблокировано {unlockedAmount.toLocaleString('ru-RU')} {token}
      </div>
    </div>
  );
}
