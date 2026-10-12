import React, { ButtonHTMLAttributes, forwardRef } from 'react';
import clsx from 'clsx';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'text' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading, disabled, children, ...props }, ref) => {
    const baseStyles =
      'inline-flex items-center justify-center font-medium transition-opacity duration-150 rounded-[2px] disabled:opacity-40 disabled:cursor-not-allowed select-none cursor-pointer';

    const variants = {
      primary: 'bg-[var(--ink)] text-[var(--bg)] border border-[var(--ink)] hover:opacity-90',
      secondary: 'bg-transparent text-[var(--ink)] border border-[var(--ink)] hover:bg-[var(--line)]',
      text: 'bg-transparent text-[var(--ink)] border-transparent hover:underline px-0',
      danger: 'bg-[var(--danger)] text-white border border-[var(--danger)] hover:opacity-90',
    };

    const sizes = {
      sm: 'text-xs px-3 py-1.5 h-8 min-w-[32px]',
      md: 'text-sm px-4 py-2.5 h-11 min-w-[44px]',
      lg: 'text-base px-6 py-3 h-12 min-w-[48px]',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={clsx(
          baseStyles,
          variants[variant],
          variant !== 'text' && sizes[size],
          className
        )}
        {...props}
      >
        {loading ? (
          <span className="inline-flex items-center gap-2">
            <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25" />
              <path fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" className="opacity-75" />
            </svg>
            <span>Loading...</span>
          </span>
        ) : (
          children
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';
