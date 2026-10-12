import React from 'react';
import clsx from 'clsx';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'neutral' | 'accent' | 'danger' | 'success';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  className,
}) => {
  const variants = {
    neutral: 'bg-[var(--surface)] text-[var(--ink)] border-[var(--line)]',
    accent: 'bg-[var(--surface)] text-[var(--accent-bridal)] border-[var(--accent-bridal)]',
    danger: 'bg-[var(--surface)] text-[var(--danger)] border-[var(--danger)]',
    success: 'bg-[var(--surface)] text-[var(--success)] border-[var(--success)]',
  };

  return (
    <span
      className={clsx(
        'inline-flex items-center px-2 py-0.5 text-[11px] font-medium tracking-wide uppercase border rounded-[2px]',
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
};
