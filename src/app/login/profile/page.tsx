'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Field } from '@/components/ui/Field';
import { useToast } from '@/components/ui/Toast';
import { clientStore } from '@/lib/store';

function ProfileCompletionForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextUrl = searchParams.get('next') || '/';
  const { toast } = useToast();

  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please enter your full name.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim() }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error?.message || 'Failed to update profile.');
      } else {
        clientStore.setAuth(true, name.trim());
        toast('Welcome to Barakah Bazaar!', 'success');

        // Replay pending action if any
        const pending = sessionStorage.getItem('bz_pending_action');
        if (pending) {
          sessionStorage.removeItem('bz_pending_action');
          try {
            const act = JSON.parse(pending);
            if (act.type === 'cart') {
              await fetch('/api/cart/items', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ variantId: act.variantId, qty: act.qty }),
              });
            } else if (act.type === 'wishlist') {
              await fetch('/api/wishlist', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ productId: act.productId }),
              });
            }
          } catch {
            // ignore
          }
        }

        router.push(nextUrl);
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16 sm:py-24">
      <div className="bg-[var(--surface)] border border-[var(--line)] p-6 sm:p-8 rounded-[2px]">
        <h1 className="font-serif text-2xl sm:text-3xl text-[var(--ink)] m-0 mb-2">
          What should we call you?
        </h1>
        <p className="text-xs text-[var(--ink-muted)] mb-6">
          Please provide your name for order confirmations and deliveries.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <Field label="Full Name" htmlFor="name-input" error={error} required>
            <Input
              id="name-input"
              type="text"
              placeholder="e.g. Fatima Khan"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
              required
            />
          </Field>

          <Button type="submit" variant="primary" size="md" loading={loading} className="w-full">
            Save &amp; Continue
          </Button>
        </form>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs">Loading...</div>}>
      <ProfileCompletionForm />
    </Suspense>
  );
}
