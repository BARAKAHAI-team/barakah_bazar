'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="max-w-[700px] mx-auto px-4 py-20 text-center">
      <div className="p-10 border border-[var(--line)] bg-[var(--surface)] rounded-[2px] space-y-4">
        <span className="text-xs uppercase tracking-widest font-semibold text-[var(--danger)] block">
          Application Error
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl text-[var(--ink)] m-0">
          Something went wrong
        </h1>
        <p className="text-xs sm:text-sm text-[var(--ink-muted)] max-w-md mx-auto">
          An unexpected issue occurred while processing your request. Please try again or return home.
        </p>

        <div className="flex justify-center gap-3 pt-4">
          <Button variant="primary" size="md" onClick={() => reset()}>
            Try Again
          </Button>
          <Link href="/">
            <Button variant="secondary" size="md">
              Return Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
