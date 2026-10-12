'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Trash2, AlertCircle } from 'lucide-react';
import { QuantityStepper } from '@/components/ui/QuantityStepper';
import { Button } from '@/components/ui/Button';
import { formatINR } from '@/lib/pricing/money';
import { useToast } from '@/components/ui/Toast';
import { clientStore } from '@/lib/store';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';

export default function CartPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [cartData, setCartData] = useState<any>(null);

  const fetchCart = async () => {
    try {
      const res = await fetch('/api/cart');
      if (res.ok) {
        const data = await res.json();
        setCartData(data);
        clientStore.setCartCount(data.totalItems || 0);
      }
    } catch {
      toast('Failed to load cart', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const handleUpdateQty = async (itemId: string, newQty: number) => {
    try {
      const res = await fetch(`/api/cart/items/${itemId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ qty: newQty }),
      });
      const data = await res.json();
      if (data.capped) {
        toast(`Quantity capped to available stock (${data.qty})`, 'info');
      }
      fetchCart();
    } catch {
      toast('Failed to update quantity', 'error');
    }
  };

  const handleRemove = async (itemId: string) => {
    try {
      await fetch(`/api/cart/items/${itemId}`, { method: 'DELETE' });
      toast('Item removed from cart.');
      fetchCart();
    } catch {
      toast('Failed to remove item', 'error');
    }
  };

  if (loading) {
    return (
      <div className="max-w-[1000px] mx-auto px-4 py-16 text-center text-xs text-[var(--ink-muted)]">
        Loading cart...
      </div>
    );
  }

  const items = cartData?.items || [];
  const canCheckout = cartData?.canCheckout && items.length > 0;

  return (
    <div className="max-w-[1000px] mx-auto px-4 sm:px-6 py-6 sm:py-10">
      <Breadcrumbs items={[{ label: 'Shopping Cart' }]} />

      <h1 className="font-serif text-3xl sm:text-4xl text-[var(--ink)] mt-4 mb-8">
        Your Cart ({items.length})
      </h1>

      {items.length === 0 ? (
        <div className="p-12 text-center border border-[var(--line)] bg-[var(--surface)] rounded-[2px]">
          <p className="text-sm text-[var(--ink-muted)] mb-6">Your shopping cart is empty.</p>
          <Link href="/">
            <Button variant="primary" size="md">
              Explore Collections
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 sm:gap-12 items-start">
          {/* Cart Items List */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item: any) => {
              const hasProblem = item.unavailable || item.short;

              return (
                <div
                  key={item.id}
                  id={`cart-line-${item.id}`}
                  className="p-4 sm:p-5 border border-[var(--line)] bg-[var(--surface)] rounded-[2px] flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between"
                >
                  <div className="flex gap-4 items-center">
                    <div className="w-18 h-18 relative rounded-[2px] overflow-hidden bg-stone-100 border border-[var(--line)] shrink-0">
                      {item.imageUrl ? (
                        <img
                          src={item.imageUrl}
                          alt={item.productName}
                          className="w-full h-full object-cover object-center"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[10px] text-stone-500 uppercase text-center p-1">
                          {item.productName || 'Item'}
                        </div>
                      )}
                    </div>

                    <div>
                      <Link
                        href={`/${item.categorySlug}/${item.productSlug}`}
                        className="text-sm font-semibold text-[var(--ink)] hover:underline block"
                      >
                        {item.productName}
                      </Link>
                      <span className="text-xs text-[var(--ink-muted)] block">
                        {item.variantLabel}
                      </span>
                      <span className="text-xs font-medium text-[var(--ink)] block mt-1 tabular-nums">
                        {formatINR(item.unitPricePaise)} each
                      </span>

                      {/* Warnings */}
                      {item.unavailable && (
                        <span className="inline-flex items-center gap-1 text-xs text-[var(--danger)] font-medium mt-1">
                          <AlertCircle size={12} />
                          No longer available. Please remove to proceed.
                        </span>
                      )}
                      {item.short && (
                        <span className="inline-flex items-center gap-1 text-xs text-[var(--accent-coconut)] font-medium mt-1">
                          <AlertCircle size={12} />
                          Only {item.available} available. Please adjust quantity.
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-4 pt-2 sm:pt-0 border-t sm:border-0 border-[var(--line)]">
                    <QuantityStepper
                      value={item.qty}
                      min={1}
                      max={item.available || 1}
                      disabled={item.unavailable}
                      onChange={(newQty) => handleUpdateQty(item.id, newQty)}
                    />

                    <span className="text-sm font-semibold text-[var(--ink)] tabular-nums min-w-[70px] text-right">
                      {formatINR(item.unitPricePaise * item.qty)}
                    </span>

                    <button
                      type="button"
                      onClick={() => handleRemove(item.id)}
                      aria-label="Remove item"
                      className="p-2 text-[var(--ink-muted)] hover:text-[var(--danger)] cursor-pointer"
                    >
                      <Trash2 size={16} strokeWidth={1.5} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Cart Summary */}
          <div className="p-6 border border-[var(--line)] bg-[var(--surface)] rounded-[2px] space-y-5">
            <h2 className="font-serif text-xl text-[var(--ink)] m-0">Order Summary</h2>

            <div className="flex justify-between items-baseline text-sm border-b border-[var(--line)] pb-4">
              <span className="text-[var(--ink-muted)]">Subtotal</span>
              <span className="font-semibold text-lg text-[var(--ink)] tabular-nums">
                {formatINR(cartData?.subtotalPaise || 0)}
              </span>
            </div>

            <p className="text-xs text-[var(--ink-muted)] m-0">
              Inclusive of all taxes. Coupons can be applied at the checkout review step.
            </p>

            {!canCheckout && items.length > 0 && (
              <p className="text-xs text-[var(--danger)] font-medium m-0 p-3 bg-[var(--bg)] border border-[var(--line)]">
                Some items in your cart exceed current stock or are unavailable. Please adjust before checkout.
              </p>
            )}

            <Button
              variant="primary"
              size="lg"
              disabled={!canCheckout}
              onClick={() => router.push('/checkout')}
              className="w-full"
            >
              Proceed to Checkout
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
