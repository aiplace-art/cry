'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'success' | 'danger' | 'warning' | 'info' | 'neutral';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  className
}) => {
  const variants = {
    success: 'bg-bnb-success/20 text-bnb-success border border-bnb-success/30',
    danger: 'bg-bnb-error/20 text-bnb-error border border-bnb-error/30',
    warning: 'bg-bnb-warning/20 text-bnb-warning border border-bnb-warning/30',
    info: 'bg-bnb-primary/20 text-bnb-primary border border-bnb-primary/30',
    neutral: 'bg-bnb-dark text-bnb-textSecondary border border-bnb-border',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
};
