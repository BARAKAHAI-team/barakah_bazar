'use client';

import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { formatINR } from '@/lib/pricing/money';
import { useToast } from '@/components/ui/Toast';

export default function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { toast } = useToast();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [retrying, setRetrying] = useState(false);

  useEffect(() => {
    fetch(`/api/orders/${id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.ok) setOrder(data.order);
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handleRetryPayment = async () => {
    if (!order) return;
    setRetrying(true);

    try {
      const payRes = await fetch('/api/payments/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: order.id }),
      });

      const payData = await payRes.json();
      if (!payRes.ok) {
        toast(payData.error?.message || 'Failed to initialize payment', 'error');
        setRetrying(false);
        return;
      }

      // Check if Razorpay is loaded
      if (typeof window !== 'undefined' && (window as any).Razorpay) {
        const rzp = new (window as any).Razorpay({
          key: payData.keyId,
          amount: payData.amount,
          currency: 'INR',
          name: 'Barakah Bazaar',
          description: `Order ${order.order_number}`,
          order_id: payData.razorpayOrderId,
          handler: async (response: any) => {
            const verifyRes = await fetch('/api/payments/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });
            const vData = await verifyRes.json();
            if (vData.ok) {
              window.location.href = `/checkout/success?order=${order.order_number}`;
            } else {
              toast('Payment signature verification failed', 'error');
            }
          },
          prefill: {
            contact: order.notify_phone,
            email: order.notify_email || '',
          },
        });
        rzp.open();
      } else {
        toast('Confirming mock payment for development...', 'info');
        const verifyRes = await fetch('/api/payments/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            razorpay_order_id: payData.razorpayOrderId,
            razorpay_payment_id: `pay_mock_${Date.now()}`,
            razorpay_signature: 'mock_signature_for_dev_mode',
          }),
        });
        const vData = await verifyRes.json();
        if (vData.ok) {
          window.location.href = `/checkout/success?order=${order.order_number}`;
        }
      }
    } catch {
      toast('Payment error occurred', 'error');
    } finally {
      setRetrying(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-[900px] mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-8 animate-pulse">
        <div className="h-4 bg-[var(--surface-sunken,#f0f0f0)] w-48 rounded" />
        <div className="border-b border-[var(--line)] pb-6 space-y-3">
          <div className="h-4 bg-[var(--surface-sunken,#f0f0f0)] w-28 rounded" />
          <div className="h-8 bg-[var(--surface-sunken,#f0f0f0)] w-64 rounded" />
        </div>
        <div className="h-40 bg-[var(--surface-sunken,#f0f0f0)] rounded" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-36 bg-[var(--surface-sunken,#f0f0f0)] rounded" />
          <div className="h-36 bg-[var(--surface-sunken,#f0f0f0)] rounded" />
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-[900px] mx-auto px-4 py-16 text-center">
        <p className="text-sm text-[var(--ink-muted)] mb-4">Order not found.</p>
        <Link href="/orders">
          <Button variant="secondary" size="md">
            Back to Orders
          </Button>
        </Link>
      </div>
    );
  }

  const isPending = order.order_status === 'PENDING_PAYMENT';
  const address = typeof order.address_snapshot === 'string'
    ? JSON.parse(order.address_snapshot)
    : (order.address_snapshot || {});

  return (
    <div className="max-w-[900px] mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-8">
      <Breadcrumbs
        items={[
          { label: 'Account', href: '/account' },
          { label: 'Orders', href: '/orders' },
          { label: order.order_number },
        ]}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[var(--line)] pb-6">
        <div>
          <span className="text-xs uppercase tracking-wider text-[var(--ink-muted)] block mb-1">
            Order Reference
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl text-[var(--ink)] m-0">
            {order.order_number}
          </h1>
          <span className="text-xs text-[var(--ink-muted)] block mt-1">
            Placed on {new Date(order.created_at).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <Badge variant={order.order_status === 'DELIVERED' ? 'success' : isPending ? 'danger' : 'neutral'}>
            {order.order_status}
          </Badge>
          {isPending && (
            <Button
              variant="primary"
              size="sm"
              loading={retrying}
              onClick={handleRetryPayment}
            >
              Retry Payment
            </Button>
          )}
        </div>
      </div>

      {/* Order Items */}
      <section className="p-6 border border-[var(--line)] bg-[var(--surface)] rounded-[2px] space-y-4">
        <h2 className="font-serif text-lg text-[var(--ink)] m-0">Ordered Items</h2>
        <div className="divide-y divide-[var(--line)]">
          {(order.items || []).map((it: any) => (
            <div key={it.id} className="py-3 flex justify-between items-center text-xs">
              <div>
                <span className="font-semibold text-sm text-[var(--ink)] block">{it.name_snapshot}</span>
                <span className="text-[var(--ink-muted)]">
                  {it.variant_label_snapshot || 'Standard'} &bull; SKU: {it.sku_snapshot || 'N/A'} &times; {it.qty}
                </span>
              </div>
              <span className="font-semibold tabular-nums text-sm">
                {formatINR(it.unit_price_paise * it.qty)}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Address & Totals */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Address */}
        <div className="p-6 border border-[var(--line)] bg-[var(--surface)] rounded-[2px] space-y-2 text-xs">
          <h2 className="font-serif text-lg text-[var(--ink)] m-0 mb-3">Delivery Address</h2>
          <p className="font-semibold text-sm m-0 text-[var(--ink)]">{address.name || 'Recipient'}</p>
          <p className="m-0 text-[var(--ink-muted)]">
            {address.line1}{address.line2 ? `, ${address.line2}` : ''}
          </p>
          <p className="m-0 text-[var(--ink-muted)]">
            {[address.city, address.state].filter(Boolean).join(', ')} {address.pincode ? `- ${address.pincode}` : ''}
          </p>
          {address.phone && (
            <p className="m-0 text-[var(--ink-muted)]">
              Contact: {address.phone}
            </p>
          )}
          {address.latitude && address.longitude && (
            <p className="text-[11px] text-[var(--ink-muted)] m-0 pt-2 border-t border-[var(--line)]">
              GPS Coordinates: {Number(address.latitude).toFixed(4)}, {Number(address.longitude).toFixed(4)}
            </p>
          )}
        </div>

        {/* Totals */}
        <div className="p-6 border border-[var(--line)] bg-[var(--surface)] rounded-[2px] space-y-2 text-xs">
          <h2 className="font-serif text-lg text-[var(--ink)] m-0 mb-3">Payment Summary</h2>
          <div className="flex justify-between text-[var(--ink-muted)]">
            <span>Subtotal</span>
            <span className="tabular-nums">{formatINR(order.subtotal_paise)}</span>
          </div>
          {order.discount_paise > 0 && (
            <div className="flex justify-between text-[var(--success)] font-medium">
              <span>Discount ({order.coupon_code})</span>
              <span className="tabular-nums">-{formatINR(order.discount_paise)}</span>
            </div>
          )}
          <div className="flex justify-between text-sm font-semibold text-[var(--ink)] pt-2 border-t border-[var(--line)]">
            <span>Total Amount</span>
            <span className="tabular-nums font-serif text-lg">{formatINR(order.total_paise)}</span>
          </div>
          <div className="pt-2 text-[11px] text-[var(--ink-muted)]">
            Payment Status: <strong className="uppercase">{order.payment_status}</strong>
          </div>
        </div>
      </div>

      {/* Status History Timeline */}
      <section className="p-6 border border-[var(--line)] bg-[var(--surface)] rounded-[2px] space-y-4">
        <h2 className="font-serif text-lg text-[var(--ink)] m-0">Order Status Timeline</h2>
        <div className="space-y-3">
          {(order.status_history || []).map((h: any, i: number) => (
            <div key={i} className="flex gap-4 text-xs items-start">
              <span className="text-[var(--ink-muted)] tabular-nums whitespace-nowrap min-w-[140px]">
                {new Date(h.created_at).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}
              </span>
              <div>
                <span className="font-semibold text-[var(--ink)] block">{h.status}</span>
                <span className="text-[var(--ink-muted)]">{h.note}</span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
