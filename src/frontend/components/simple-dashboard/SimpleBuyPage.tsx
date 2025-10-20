import React, { useState } from 'react';
import { usePrivateSale } from '@/hooks/usePrivateSale';

export function SimpleBuyPage() {
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState<'BNB' | 'USDT'>('BNB');
  const { currentPrice, buyTokens, loading } = usePrivateSale();

  // Расчёт токенов
  const tokenAmount = amount ? (parseFloat(amount) / currentPrice) * 1_000_000 : 0;

  const handleBuy = async () => {
    if (!amount) return;
    await buyTokens(parseFloat(amount), currency);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-cyan-900 py-12">
      <div className="max-w-2xl mx-auto px-8">

        {/* Заголовок */}
        <h1 className="text-4xl font-bold text-center text-white mb-12">
          💰 КУПИТЬ HYPE ТОКЕНЫ
        </h1>

        {/* Поле ввода */}
        <div className="bg-gray-800/50 rounded-2xl p-8 backdrop-blur-sm">

          <label className="text-xl text-gray-300 block mb-4">
            Сколько хотите потратить?
          </label>

          <div className="flex gap-4 items-center">
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.5"
              className="flex-1 px-6 py-4 bg-gray-700 text-white text-2xl rounded-xl border-2 border-gray-600 focus:border-cyan-400 outline-none"
            />

            {/* Переключатель валюты */}
            <div className="flex gap-2">
              <button
                onClick={() => setCurrency('BNB')}
                className={`px-6 py-4 rounded-xl text-lg font-bold transition-all ${
                  currency === 'BNB'
                    ? 'bg-cyan-500 text-white'
                    : 'bg-gray-700 text-gray-400'
                }`}
              >
                BNB
              </button>
              <button
                onClick={() => setCurrency('USDT')}
                className={`px-6 py-4 rounded-xl text-lg font-bold transition-all ${
                  currency === 'USDT'
                    ? 'bg-cyan-500 text-white'
                    : 'bg-gray-700 text-gray-400'
                }`}
              >
                USDT
              </button>
            </div>
          </div>

          {/* Результат */}
          {amount && (
            <div className="mt-8 pt-8 border-t border-gray-600">
              <div className="text-gray-300 text-lg mb-2">↓ Вы получите</div>
              <div className="text-5xl font-bold text-cyan-400">
                {tokenAmount.toLocaleString('ru-RU')} HYPE
              </div>
            </div>
          )}

        </div>

        {/* Кнопка покупки */}
        <div className="flex justify-center mt-8">
          <button
            onClick={handleBuy}
            disabled={!amount || loading}
            className="px-16 py-6 bg-cyan-500 hover:bg-cyan-600 text-white text-2xl font-bold rounded-xl transition-all shadow-lg hover:shadow-cyan-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'ПОКУПАЕМ...' : 'КУПИТЬ'}
          </button>
        </div>

      </div>
    </div>
  );
}
