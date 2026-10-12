import React, { TextareaHTMLAttributes, forwardRef } from 'react';
import clsx from 'clsx';

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, rows = 4, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        rows={rows}
        className={clsx(
          'w-full p-3 text-sm bg-[var(--surface)] text-[var(--ink)] border rounded-[2px] transition-colors resize-y',
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

Textarea.displayName = 'Textarea';
