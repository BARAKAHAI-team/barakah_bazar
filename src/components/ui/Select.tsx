import React, { SelectHTMLAttributes, forwardRef } from 'react';
import clsx from 'clsx';
import { ChevronDown } from 'lucide-react';

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  error?: boolean;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, error, children, ...props }, ref) => {
    return (
      <div className="relative w-full">
        <select
          ref={ref}
          className={clsx(
            'w-full h-11 pl-3 pr-10 text-sm bg-[var(--surface)] text-[var(--ink)] border rounded-[2px] appearance-none transition-colors cursor-pointer',
            'disabled:opacity-50 disabled:bg-[var(--bg)] disabled:cursor-not-allowed',
            error
              ? 'border-[var(--danger)] focus:border-[var(--danger)]'
              : 'border-[var(--line)] focus:border-[var(--ink)]',
            className
          )}
          {...props}
        >
          {children}
        </select>
        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[var(--ink-muted)]">
          <ChevronDown size={16} strokeWidth={1.5} />
        </span>
      </div>
    );
  }
);

Select.displayName = 'Select';
