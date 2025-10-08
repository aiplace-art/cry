'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  gradient?: boolean;
  hover?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className,
  gradient = false,
  hover = false
}) => {
  return (
    <div
      className={cn(
        'rounded-xl p-6 backdrop-blur-sm transition-all duration-300',
        gradient
          ? 'bg-gradient-to-br from-primary-500/10 via-secondary-500/10 to-accent-500/10 border border-primary-500/20'
          : 'bg-white/80 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700',
        hover && 'hover:shadow-xl hover:scale-[1.02]',
        className
      )}
    >
      {children}
    </div>
  );
};

export const CardHeader: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className
}) => {
  return (
    <div className={cn('mb-4', className)}>
      {children}
    </div>
  );
};

export const CardTitle: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className
}) => {
  return (
    <h3 className={cn('text-xl font-bold text-gray-900 dark:text-white', className)}>
      {children}
    </h3>
  );
};

export const CardContent: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className
}) => {
  return (
    <div className={cn('text-gray-600 dark:text-gray-300', className)}>
      {children}
    </div>
  );
};
