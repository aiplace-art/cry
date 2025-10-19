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
          ? 'bg-gradient-to-br from-bnb-dark to-bnb-darker border border-bnb-primary/20'
          : 'bg-bnb-dark/80 border border-bnb-border',
        hover && 'hover:shadow-xl hover:shadow-bnb-primary/10 hover:scale-[1.02] hover:border-bnb-primary/50',
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
    <h3 className={cn('text-xl font-bold text-bnb-text', className)}>
      {children}
    </h3>
  );
};

export const CardContent: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className
}) => {
  return (
    <div className={cn('text-bnb-textSecondary', className)}>
      {children}
    </div>
  );
};
