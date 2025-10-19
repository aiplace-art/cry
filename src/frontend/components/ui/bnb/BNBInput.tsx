import React from 'react';

interface BNBInputProps {
  label?: string;
  value: string | number;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: 'text' | 'number' | 'email' | 'password';
  disabled?: boolean;
  error?: string;
  helperText?: string;
  icon?: React.ReactNode;
  suffix?: React.ReactNode;
  className?: string;
}

export const BNBInput: React.FC<BNBInputProps> = ({
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
  disabled = false,
  error,
  helperText,
  icon,
  suffix,
  className = '',
}) => {
  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-bnb-text mb-2">
          {label}
        </label>
      )}

      <div className="relative">
        {icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-bnb-textSecondary">
            {icon}
          </div>
        )}

        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          className={`
            w-full px-4 py-3 rounded-lg
            bg-bnb-darker border transition-all duration-200
            text-bnb-text placeholder-bnb-textSecondary
            ${icon ? 'pl-12' : ''}
            ${suffix ? 'pr-24' : ''}
            ${error
              ? 'border-bnb-error focus:border-bnb-error focus:ring-2 focus:ring-bnb-error/20'
              : 'border-bnb-border focus:border-bnb-primary focus:ring-2 focus:ring-bnb-primary/20'
            }
            ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-bnb-border/60'}
            outline-none
          `}
        />

        {suffix && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-bnb-textSecondary font-medium">
            {suffix}
          </div>
        )}
      </div>

      {error && (
        <p className="mt-2 text-sm text-bnb-error flex items-center gap-1">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </p>
      )}

      {helperText && !error && (
        <p className="mt-2 text-sm text-bnb-textSecondary">{helperText}</p>
      )}
    </div>
  );
};
