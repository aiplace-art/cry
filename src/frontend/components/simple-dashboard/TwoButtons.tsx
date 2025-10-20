import React from 'react';

interface TwoButtonsProps {
  onBuy: () => void;
  onClaim: () => void;
  claimDisabled?: boolean;
}

export function TwoButtons({ onBuy, onClaim, claimDisabled }: TwoButtonsProps) {
  return (
    <div className="flex gap-6 justify-center mt-12 px-8">
      <button
        onClick={onBuy}
        className="px-12 py-6 bg-cyan-500 hover:bg-cyan-600 text-white text-xl font-bold rounded-xl transition-all shadow-lg hover:shadow-cyan-500/50"
      >
        КУПИТЬ ЕЩЁ
      </button>

      <button
        onClick={onClaim}
        disabled={claimDisabled}
        className="px-12 py-6 bg-blue-500 hover:bg-blue-600 text-white text-xl font-bold rounded-xl transition-all shadow-lg hover:shadow-blue-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        ЗАБРАТЬ
      </button>
    </div>
  );
}
