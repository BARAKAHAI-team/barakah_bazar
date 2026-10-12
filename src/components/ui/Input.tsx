import React, { InputHTMLAttributes, forwardRef } from 'react';
import clsx from 'clsx';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={clsx(
          'w-full h-11 px-3 text-sm bg-[var(--surface)] text-[var(--ink)] border rounded-[2px] transition-colors',
          'placeholder:text-[var(--ink-muted)] placeholder:opacity-60',
          'disabled:opacity-50 disabled:bg-[var(--bg)] disabled:cursor-not-allowed',
          error
            ? 'border-[var(--danger)] focus:border-[var(--danger)]'
            : 'border-[var(--line)] focus:border-[var(--ink)]',
          className
        )}
        {...props}
      />
    );
  }
);

Input.displayName = 'Input';
