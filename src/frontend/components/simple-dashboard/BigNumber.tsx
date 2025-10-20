import React from 'react';

interface BigNumberProps {
  value: number;
  token: string;
  label?: string;
}

export function BigNumber({ value, token, label }: BigNumberProps) {
  return (
    <div className="text-center py-12">
      {label && (
        <div className="text-xl text-gray-400 mb-4">
          {label}
        </div>
      )}
      <div className="text-7xl font-bold text-cyan-400">
        {value.toLocaleString('ru-RU')}
      </div>
      <div className="text-3xl text-gray-300 mt-2">
        {token}
      </div>
    </div>
  );
}
