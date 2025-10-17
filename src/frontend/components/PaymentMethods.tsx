'use client';

import React, { useState } from 'react';
import { PaymentMethod } from '../types/private-sale';
import { PAYMENT_METHODS } from '../lib/payment-config';

interface PaymentMethodsProps {
  selectedMethod: PaymentMethod | null;
  onSelectMethod: (method: PaymentMethod) => void;
  disabled?: boolean;
}

export const PaymentMethods: React.FC<PaymentMethodsProps> = ({
  selectedMethod,
  onSelectMethod,
  disabled = false,
}) => {
  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        Select Payment Method
      </label>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {PAYMENT_METHODS.map((method) => (
          <button
            key={method.id}
            onClick={() => onSelectMethod(method)}
            disabled={disabled}
            className={`
              relative flex flex-col items-center justify-center p-4 rounded-xl
              border-2 transition-all duration-200
              ${
                selectedMethod?.id === method.id
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600'
              }
              ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            `}
          >
            {/* Icon */}
            <div className="text-3xl mb-2">{method.icon}</div>

            {/* Symbol */}
            <div className="text-sm font-semibold text-gray-900 dark:text-white">
              {method.symbol}
            </div>

            {/* Network badge */}
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {method.network.toUpperCase()}
            </div>

            {/* Selected indicator */}
            {selectedMethod?.id === method.id && (
              <div className="absolute top-2 right-2 w-2 h-2 bg-blue-500 rounded-full" />
            )}
          </button>
        ))}
      </div>

      {/* Selected method info */}
      {selectedMethod && (
        <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                Pay with {selectedMethod.name}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Network: {selectedMethod.network.toUpperCase()}
              </p>
            </div>
            <div className="text-2xl">{selectedMethod.icon}</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentMethods;
