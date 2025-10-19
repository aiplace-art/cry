'use client';

import React from 'react';

export const Loading: React.FC<{ text?: string }> = ({ text = 'Loading...' }) => {
  return (
    <div className="flex flex-col items-center justify-center p-8">
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 rounded-full border-4 border-bnb-border"></div>
        <div className="absolute inset-0 rounded-full border-4 border-bnb-primary border-t-transparent animate-spin"></div>
      </div>
      <p className="mt-4 text-bnb-textSecondary">{text}</p>
    </div>
  );
};

export const Skeleton: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <div className={`animate-pulse bg-bnb-dark rounded ${className}`} />
  );
};
