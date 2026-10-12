import React from 'react';
import Link from 'next/link';
import clsx from 'clsx';
import { Button } from './Button';

export interface EmptyStateProps {
  title: string;
  description?: string;
  actionHref?: string;
  actionText?: string;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  actionHref,
  actionText,
  className,
}) => {
  return (
    <div
      className={clsx(
        'flex flex-col items-center justify-center text-center p-8 sm:p-12 my-6 border border-[var(--line)] bg-[var(--surface)] rounded-[2px]',
        className
      )}
    >
      <h3 className="font-serif text-xl sm:text-2xl text-[var(--ink)] m-0">
        {title}
      </h3>
      {description && (
        <p className="text-sm text-[var(--ink-muted)] max-w-md mt-2 mb-6">
          {description}
        </p>
      )}
      {actionHref && actionText && (
        <Link href={actionHref}>
          <Button variant="secondary" size="md">
            {actionText}
          </Button>
        </Link>
      )}
    </div>
  );
};
