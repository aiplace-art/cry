'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  icon,
  className,
  ...props
}) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-bnb-text mb-2">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-bnb-textSecondary">
            {icon}
          </div>
        )}
        <input
          className={cn(
            'w-full px-4 py-2 rounded-lg border transition-all duration-200',
            'bg-bnb-darker',
            'border-bnb-border',
            'text-bnb-text',
            'placeholder-bnb-textSecondary',
            'focus:outline-none focus:ring-2 focus:ring-bnb-primary focus:border-bnb-primary',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            icon && 'pl-10',
            error && 'border-bnb-error focus:ring-bnb-error',
            className
          )}
          {...props}
        />
      </div>
      {error && (
        <p className="mt-1 text-sm text-bnb-error">{error}</p>
      )}
    </div>
  );
};
