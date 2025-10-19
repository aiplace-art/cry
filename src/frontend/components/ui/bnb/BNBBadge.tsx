import React from 'react';

interface BNBBadgeProps {
  children: React.ReactNode;
  variant?: 'gold' | 'success' | 'danger' | 'warning' | 'info';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const BNBBadge: React.FC<BNBBadgeProps> = ({
  children,
  variant = 'gold',
  size = 'md',
  className = '',
}) => {
  const variants = {
    gold: 'bg-gradient-to-r from-bnb-primary to-bnb-secondary text-bnb-darker',
    success: 'bg-bnb-success text-white',
    danger: 'bg-bnb-error text-white',
    warning: 'bg-bnb-warning text-bnb-darker',
    info: 'bg-bnb-dark text-bnb-text border border-bnb-border',
  };

  const sizes = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base',
  };

  return (
    <span className={`
      inline-flex items-center justify-center
      font-semibold rounded-full
      ${variants[variant]}
      ${sizes[size]}
      ${className}
    `}>
      {children}
    </span>
  );
};
