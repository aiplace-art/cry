import React from 'react';
import { motion } from 'framer-motion';

interface BNBCardProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  variant?: 'default' | 'gradient' | 'dark';
  padding?: 'sm' | 'md' | 'lg';
  hover?: boolean;
  className?: string;
  headerAction?: React.ReactNode;
}

export const BNBCard: React.FC<BNBCardProps> = ({
  children,
  title,
  subtitle,
  variant = 'default',
  padding = 'md',
  hover = false,
  className = '',
  headerAction,
}) => {
  const variants = {
    default: 'bg-bnb-dark border border-bnb-border',
    gradient: 'bg-gradient-to-br from-bnb-dark to-bnb-darker border border-bnb-primary/20',
    dark: 'bg-bnb-darker border border-bnb-border/50',
  };

  const paddings = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  const hoverStyles = hover ? 'hover:border-bnb-primary/50 hover:shadow-lg hover:shadow-bnb-primary/10' : '';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`
        ${variants[variant]}
        ${paddings[padding]}
        ${hoverStyles}
        rounded-2xl transition-all duration-200
        ${className}
      `}
    >
      {(title || subtitle || headerAction) && (
        <div className="mb-6 flex items-start justify-between">
          <div>
            {title && (
              <h3 className="text-xl font-bold text-bnb-text mb-1">{title}</h3>
            )}
            {subtitle && (
              <p className="text-sm text-bnb-textSecondary">{subtitle}</p>
            )}
          </div>
          {headerAction && <div>{headerAction}</div>}
        </div>
      )}
      {children}
    </motion.div>
  );
};
