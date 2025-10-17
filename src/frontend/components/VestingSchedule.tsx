// Vesting Schedule Component

import React, { useState } from 'react';
import type { VestingSchedule } from '../types/presale';

interface VestingScheduleProps {
  schedule: VestingSchedule[];
  onClaim?: (vestingId: string) => Promise<void>;
}

export const VestingSchedule: React.FC<VestingScheduleProps> = ({ schedule, onClaim }) => {
  const [claimingId, setClaimingId] = useState<string | null>(null);

  const totalVested = schedule.reduce((sum, vest) => sum + vest.amount, 0);
  const totalClaimed = schedule
    .filter((vest) => vest.claimed)
    .reduce((sum, vest) => sum + vest.amount, 0);
  const availableToClaim = schedule
    .filter((vest) => !vest.claimed && new Date(vest.releaseDate) <= new Date())
    .reduce((sum, vest) => sum + vest.amount, 0);

  const handleClaim = async (vestingId: string) => {
    if (!onClaim) return;

    setClaimingId(vestingId);
    try {
      await onClaim(vestingId);
    } finally {
      setClaimingId(null);
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const isClaimable = (vest: VestingSchedule) => {
    return !vest.claimed && new Date(vest.releaseDate) <= new Date();
  };

  return (
    <div className="bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-xl rounded-2xl p-8 border border-gray-700/50 shadow-2xl">
      <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
        <span className="text-3xl">🔒</span>
        Vesting Schedule
      </h3>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
          <div className="text-sm text-gray-400 mb-1">Total Vested</div>
          <div className="text-2xl font-bold text-white">{totalVested.toLocaleString()}</div>
          <div className="text-xs text-gray-500 mt-1">HYPE</div>
        </div>

        <div className="bg-gradient-to-br from-green-900/30 to-emerald-900/30 rounded-xl p-4 border border-green-500/50">
          <div className="text-sm text-green-300 mb-1">Claimed</div>
          <div className="text-2xl font-bold text-green-100">{totalClaimed.toLocaleString()}</div>
          <div className="text-xs text-green-400 mt-1">HYPE</div>
        </div>

        <div className="bg-gradient-to-br from-purple-900/30 to-pink-900/30 rounded-xl p-4 border border-purple-500/50">
          <div className="text-sm text-purple-300 mb-1">Available</div>
          <div className="text-2xl font-bold text-purple-100">
            {availableToClaim.toLocaleString()}
          </div>
          <div className="text-xs text-purple-400 mt-1">HYPE</div>
        </div>
      </div>

      {/* Vesting Timeline */}
      <div className="space-y-3">
        {schedule.map((vest, index) => {
          const claimable = isClaimable(vest);
          const claiming = claimingId === vest.id;

          return (
            <div
              key={vest.id}
              className={`bg-gray-800/50 rounded-xl p-4 border transition-all ${
                vest.claimed
                  ? 'border-green-500/30 opacity-60'
                  : claimable
                  ? 'border-purple-500/50 shadow-lg shadow-purple-500/20'
                  : 'border-gray-700/50'
              }`}
            >
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                        vest.claimed
                          ? 'bg-green-500/20 text-green-400'
                          : claimable
                          ? 'bg-purple-500/20 text-purple-400'
                          : 'bg-gray-700/50 text-gray-400'
                      }`}
                    >
                      {vest.claimed ? '✓' : index + 1}
                    </div>
                    <div>
                      <div className="text-white font-semibold">
                        {vest.amount.toLocaleString()} HYPE
                      </div>
                      <div className="text-sm text-gray-400">{formatDate(vest.releaseDate)}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-xs">
                    {vest.claimed ? (
                      <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded-full border border-green-500/30">
                        ✓ Claimed
                      </span>
                    ) : claimable ? (
                      <span className="px-2 py-1 bg-purple-500/20 text-purple-400 rounded-full border border-purple-500/30 animate-pulse">
                        🎁 Ready to Claim
                      </span>
                    ) : (
                      <span className="px-2 py-1 bg-gray-700/50 text-gray-400 rounded-full border border-gray-600/30">
                        🔒 Locked
                      </span>
                    )}
                  </div>
                </div>

                {claimable && !vest.claimed && onClaim && (
                  <button
                    onClick={() => handleClaim(vest.id)}
                    disabled={claiming}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-600 disabled:to-gray-700 text-white font-bold py-2 px-6 rounded-lg transition-all transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    {claiming ? (
                      <span className="flex items-center gap-2">
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                        Claiming...
                      </span>
                    ) : (
                      'Claim'
                    )}
                  </button>
                )}
              </div>

              {/* Progress Bar for Locked Tokens */}
              {!vest.claimed && !claimable && (
                <div className="mt-3">
                  <div className="h-1 bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-purple-600 to-pink-600 transition-all duration-500"
                      style={{
                        width: `${Math.min(
                          ((new Date().getTime() - new Date(vest.releaseDate).getTime()) /
                            (new Date(vest.releaseDate).getTime() - new Date().getTime())) *
                            100,
                          100
                        )}%`,
                      }}
                    ></div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {schedule.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📅</div>
          <p className="text-gray-400">No vesting schedule yet</p>
          <p className="text-sm text-gray-500 mt-2">
            Your tokens will appear here after purchase
          </p>
        </div>
      )}
    </div>
  );
};
