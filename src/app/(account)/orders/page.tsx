'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { formatINR } from '@/lib/pricing/money';

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/orders')
      .then((res) => res.json())
      .then((data) => {
        if (data.ok) setOrders(data.orders || []);
      })
      .finally(() => setLoading(false));
  }, []);

  const getStatusBadge = (status: string) => {
    if (status === 'DELIVERED') return <Badge variant="success">Delivered</Badge>;
    if (status === 'CONFIRMED') return <Badge variant="neutral">Confirmed</Badge>;
    return <Badge variant="danger">Payment Pending</Badge>;
  };

  if (loading) {
    return (
      <div className="max-w-[1000px] mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-4 animate-pulse">
        <div className="h-4 bg-[var(--surface-sunken,#f0f0f0)] w-36 rounded" />
        <div className="h-10 bg-[var(--surface-sunken,#f0f0f0)] w-60 rounded mb-8" />
        <div className="h-28 bg-[var(--surface-sunken,#f0f0f0)] rounded" />
        <div className="h-28 bg-[var(--surface-sunken,#f0f0f0)] rounded" />
      </div>
    );
  }

  return (
    <div className="max-w-[1000px] mx-auto px-4 sm:px-6 py-6 sm:py-10">
      <Breadcrumbs items={[{ label: 'Account', href: '/account' }, { label: 'My Orders' }]} />

      <h1 className="font-serif text-3xl sm:text-4xl text-[var(--ink)] mt-4 mb-8">
        Order History ({orders.length})
      </h1>

      {orders.length === 0 ? (
        <div className="p-12 text-center border border-[var(--line)] bg-[var(--surface)] rounded-[2px]">
          <p className="text-sm text-[var(--ink-muted)] mb-6">You have not placed any orders yet.</p>
          <Link href="/">
            <Button variant="primary" size="md">
              Start Shopping
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((ord) => (
            <div
              key={ord.id}
              className="p-5 border border-[var(--line)] bg-[var(--surface)] rounded-[2px] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:border-[var(--ink)] transition-colors"
            >
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <span className="font-semibold text-sm text-[var(--ink)]">
                    {ord.order_number}
                  </span>
                  {getStatusBadge(ord.order_status)}
                </div>
                <span className="text-xs text-[var(--ink-muted)] block">
                  Placed on {new Date(ord.created_at).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </span>
                <span className="text-xs text-[var(--ink-muted)] block mt-0.5">
                  {ord.items?.length || 1} item(s) &bull; Total: {formatINR(ord.total_paise)}
                </span>
              </div>

              <Link href={`/orders/${ord.id}`} prefetch={true}>
                <Button variant="secondary" size="sm">
                  View Details &rarr;
                </Button>
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
