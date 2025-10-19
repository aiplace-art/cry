// Presale Progress Bar Component

import React from 'react';
import type { PresaleRound } from '../types/presale';

interface PresaleProgressProps {
  currentRound: PresaleRound;
  totalRaised: number;
  hardCap: number;
}

export const PresaleProgress: React.FC<PresaleProgressProps> = ({
  currentRound,
  totalRaised,
  hardCap,
}) => {
  const roundProgress = (currentRound.collected / currentRound.hardCap) * 100;
  const totalProgress = (totalRaised / hardCap) * 100;

  return (
    <div className="bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-xl rounded-2xl p-8 border border-gray-700/50 shadow-2xl">
      <h3 className="text-2xl font-bold text-white mb-6">Presale Progress</h3>

      {/* Current Round Progress */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-gray-300">
            {currentRound.name} Progress
          </span>
          <span className="text-sm font-bold text-bnb-secondary">
            {roundProgress.toFixed(1)}%
          </span>
        </div>

        <div className="relative w-full h-4 bg-gray-800 rounded-full overflow-hidden">
          <div
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-bnb-secondary600 to-pink-600 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${Math.min(roundProgress, 100)}%` }}
          >
            <div className="absolute inset-0 bg-white/20 animate-shimmer"></div>
          </div>
        </div>

        <div className="flex items-center justify-between mt-2 text-sm">
          <span className="text-gray-400">
            ${currentRound.collected.toLocaleString()} raised
          </span>
          <span className="text-gray-400">
            ${currentRound.hardCap.toLocaleString()} goal
          </span>
        </div>
      </div>

      {/* Total Progress */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-gray-300">Total Presale Progress</span>
          <span className="text-sm font-bold text-green-400">{totalProgress.toFixed(1)}%</span>
        </div>

        <div className="relative w-full h-4 bg-gray-800 rounded-full overflow-hidden">
          <div
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-green-600 to-emerald-600 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${Math.min(totalProgress, 100)}%` }}
          >
            <div className="absolute inset-0 bg-white/20 animate-shimmer"></div>
          </div>
        </div>

        <div className="flex items-center justify-between mt-2 text-sm">
          <span className="text-gray-400">${totalRaised.toLocaleString()} raised</span>
          <span className="text-gray-400">${hardCap.toLocaleString()} total goal</span>
        </div>
      </div>

      {/* Round Info Grid */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gray-800/50 rounded-lg p-4">
          <div className="text-xs text-gray-400 mb-1">Current Price</div>
          <div className="text-xl font-bold text-white">${currentRound.price}</div>
        </div>
        <div className="bg-gray-800/50 rounded-lg p-4">
          <div className="text-xs text-gray-400 mb-1">Bonus</div>
          <div className="text-xl font-bold text-bnb-secondary">{currentRound.bonus}%</div>
        </div>
      </div>

      <style jsx>{`
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
      `}</style>
    </div>
  );
};
