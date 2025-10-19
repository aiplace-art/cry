// Token ROI Calculator Component

import React, { useState, useMemo } from 'react';
import { presaleContract } from '../utils/presaleContract';

interface TokenCalculatorProps {
  currentPrice: number;
  bonus: number;
  listingPrice?: number;
}

export const TokenCalculator: React.FC<TokenCalculatorProps> = ({
  currentPrice,
  bonus,
  listingPrice = 0.15,
}) => {
  const [investment, setInvestment] = useState<string>('1');

  const calculations = useMemo(() => {
    const amount = parseFloat(investment) || 0;
    const tokens = presaleContract.calculateTokens(amount, currentPrice, bonus);
    const valueAtListing = tokens * listingPrice;
    const roi = ((valueAtListing - amount) / amount) * 100;
    const multiplier = valueAtListing / amount;

    return {
      tokens,
      bonusTokens: (tokens * bonus) / (100 + bonus),
      valueAtListing,
      roi,
      multiplier,
    };
  }, [investment, currentPrice, bonus, listingPrice]);

  const formatNumber = (num: number): string => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(num);
  };

  return (
    <div className="bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-xl rounded-2xl p-8 border border-gray-700/50 shadow-2xl">
      <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
        <span className="text-3xl">🧮</span>
        ROI Calculator
      </h3>

      {/* Investment Input */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Your Investment (USD)
        </label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg">
            $
          </span>
          <input
            type="number"
            value={investment}
            onChange={(e) => setInvestment(e.target.value)}
            min="0.01"
            step="0.01"
            className="w-full bg-gray-800/50 border border-gray-600 rounded-xl px-10 py-4 text-white text-lg focus:outline-none focus:ring-2 focus:ring-bnb-secondary500 focus:border-transparent transition-all"
            placeholder="1.00"
          />
        </div>
      </div>

      {/* Results Grid */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
          <div className="text-sm text-gray-400 mb-1">Base Tokens</div>
          <div className="text-xl font-bold text-white">
            {formatNumber(calculations.tokens - calculations.bonusTokens)}
          </div>
          <div className="text-xs text-gray-500 mt-1">HYPE</div>
        </div>

        <div className="bg-gradient-to-br from-bnb-secondary900/30 to-pink-900/30 rounded-xl p-4 border border-bnb-border0/50">
          <div className="text-sm text-bnb-secondary mb-1">Bonus Tokens</div>
          <div className="text-xl font-bold text-bnb-text">
            +{formatNumber(calculations.bonusTokens)}
          </div>
          <div className="text-xs text-bnb-secondary mt-1">{bonus}% Bonus</div>
        </div>

        <div className="bg-gradient-to-br from-bnb-primary900/30 to-cyan-900/30 rounded-xl p-4 border border-bnb-border0/50">
          <div className="text-sm text-bnb-primary mb-1">Total Tokens</div>
          <div className="text-2xl font-bold text-bnb-text">
            {formatNumber(calculations.tokens)}
          </div>
          <div className="text-xs text-bnb-primary mt-1">HYPE</div>
        </div>

        <div className="bg-gradient-to-br from-green-900/30 to-emerald-900/30 rounded-xl p-4 border border-green-500/50">
          <div className="text-sm text-green-300 mb-1">Value at Listing</div>
          <div className="text-2xl font-bold text-green-100">
            ${formatNumber(calculations.valueAtListing)}
          </div>
          <div className="text-xs text-green-400 mt-1">
            @ ${listingPrice} per token
          </div>
        </div>
      </div>

      {/* ROI Display */}
      <div className="bg-gradient-to-r from-bnb-secondary600/20 to-pink-600/20 rounded-xl p-6 border border-bnb-border0/30 mb-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-bnb-secondary mb-1">Potential ROI</div>
            <div className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-bnb-secondary400 to-pink-400">
              {calculations.roi > 0 ? '+' : ''}
              {formatNumber(calculations.roi)}%
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-bnb-secondary mb-1">Multiplier</div>
            <div className="text-3xl font-bold text-bnb-secondary">
              {calculations.multiplier.toFixed(2)}x
            </div>
          </div>
        </div>
      </div>

      {/* Quick Investment Buttons */}
      <div className="grid grid-cols-4 gap-2">
        {['0.1', '0.5', '1', '5'].map((amount) => (
          <button
            key={amount}
            onClick={() => setInvestment(amount)}
            className="bg-gray-700/50 hover:bg-gray-600/50 text-white rounded-lg py-2 text-sm font-medium transition-all hover:scale-105 active:scale-95"
          >
            ${amount} ETH
          </button>
        ))}
      </div>

      {/* Disclaimer */}
      <p className="text-xs text-gray-500 mt-4 text-center leading-relaxed">
        * Calculations are estimates. Actual results may vary based on market conditions.
        This is not financial advice.
      </p>
    </div>
  );
};
