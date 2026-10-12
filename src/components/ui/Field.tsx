import React from 'react';
import clsx from 'clsx';

export interface FieldProps {
  label?: string;
  htmlFor?: string;
  error?: string | null;
  hint?: string | null;
  required?: boolean;
  className?: string;
  children: React.ReactNode;
}

export const Field: React.FC<FieldProps> = ({
  label,
  htmlFor,
  error,
  hint,
  required,
  className,
  children,
}) => {
  return (
    <div className={clsx('flex flex-col gap-1.5 w-full', className)}>
      {label && (
        <label
          htmlFor={htmlFor}
          className="text-xs font-medium uppercase tracking-[0.06em] text-[var(--ink-muted)]"
        >
          {label} {required && <span className="text-[var(--danger)]">*</span>}
        </label>
      )}
      {children}
      {hint && !error && (
        <span className="text-xs text-[var(--ink-muted)]">{hint}</span>
      )}
      {error && (
        <span role="alert" className="text-xs text-[var(--danger)]">
          {error}
        </span>
      )}
    </div>
  );
};
