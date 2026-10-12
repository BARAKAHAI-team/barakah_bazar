'use client';

import React, { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { formatINR } from '@/lib/pricing/money';

function SuccessContent() {
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get('order');
  const [order, setOrder] = useState<any>(null);
  const [rememberedCategory, setRememberedCategory] = useState('bridal');

  useEffect(() => {
    // Read bz_category cookie
    const cookies = document.cookie.split(';');
    for (const c of cookies) {
      const [k, v] = c.trim().split('=');
      if (k === 'bz_category' && v) {
        setRememberedCategory(v);
        break;
      }
    }

    if (orderNumber) {
      fetch(`/api/orders/${orderNumber}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.ok) setOrder(data.order);
        })
        .catch(() => {});
    }
  }, [orderNumber]);

  return (
    <div className="max-w-[700px] mx-auto px-4 sm:px-6 py-12 sm:py-20 text-center">
      <div className="p-8 sm:p-12 border border-[var(--line)] bg-[var(--surface)] rounded-[2px] space-y-6">
        <div className="flex justify-center text-[var(--success)]">
          <CheckCircle size={48} strokeWidth={1.5} />
        </div>

        <div>
          <span className="text-xs uppercase tracking-widest font-semibold text-[var(--success)] block mb-1">
            Payment Confirmed
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl text-[var(--ink)] m-0">
            Thank you for your order
          </h1>
          <p className="text-xs sm:text-sm text-[var(--ink-muted)] mt-2">
            Order Reference: <strong className="text-[var(--ink)]">{orderNumber || 'Confirmed'}</strong>
          </p>
        </div>

        {order && (
          <div className="text-left border-y border-[var(--line)] py-5 my-6 space-y-3 text-xs">
            <div className="flex justify-between items-center text-sm font-semibold">
              <span>Total Paid</span>
              <span className="tabular-nums">{formatINR(order.total_paise)}</span>
            </div>

            <div className="pt-2">
              <span className="text-[var(--ink-muted)] font-medium block mb-1">Delivery Address</span>
              <p className="m-0 text-[var(--ink)]">
                {order.address_snapshot.name}, {order.address_snapshot.line1}, {order.address_snapshot.city} - {order.address_snapshot.pincode}
              </p>
            </div>
          </div>
        )}

        <p className="text-xs text-[var(--ink-muted)] m-0">
          A confirmation update has been queued for your verified phone number.
        </p>

        <div className="flex flex-col sm:flex-row justify-center gap-3 pt-4">
          <Link href={`/${rememberedCategory}`}>
            <Button variant="primary" size="md">
              Continue Shopping
            </Button>
          </Link>

          {order && (
            <Link href={`/orders/${order.id}`}>
              <Button variant="secondary" size="md">
                View Order Details
              </Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-xs">Loading order confirmation...</div>}>
      <SuccessContent />
    </Suspense>
  );
}
