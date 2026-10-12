'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Stepper } from '@/components/ui/Stepper';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Field } from '@/components/ui/Field';
import { Price } from '@/components/ui/Price';
import { formatINR } from '@/lib/pricing/money';
import { useToast } from '@/components/ui/Toast';
import { AddressMapPicker } from '@/components/shop/AddressMapPicker';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';

const steps = [
  { id: 'address', label: 'Delivery Address' },
  { id: 'email', label: 'Contact' },
  { id: 'review', label: 'Order Review' },
  { id: 'payment', label: 'Payment' },
];

export default function CheckoutPage() {
  const router = useRouter();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [cartData, setCartData] = useState<any>(null);
  const [addresses, setAddresses] = useState<any[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>('');
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);

  // New Address Form State (Default to Kochi, Kerala)
  const [addrName, setAddrName] = useState('');
  const [addrPhone, setAddrPhone] = useState('');
  const [addrLine1, setAddrLine1] = useState('');
  const [addrLine2, setAddrLine2] = useState('');
  const [addrCity, setAddrCity] = useState('Kochi');
  const [addrState, setAddrState] = useState('Kerala');
  const [addrPincode, setAddrPincode] = useState('682001');
  const [addrLat, setAddrLat] = useState(9.9312);
  const [addrLng, setAddrLng] = useState(76.2673);

  // Contact Email
  const [email, setEmail] = useState('');

  // Active Order & Coupon
  const [createdOrder, setCreatedOrder] = useState<any>(null);
  const [couponCode, setCouponCode] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState<string | null>(null);

  useEffect(() => {
    const init = async () => {
      try {
        // Load cart
        const cartRes = await fetch('/api/cart');
        const cartJson = await cartRes.json();
        if (!cartRes.ok || !cartJson.items || cartJson.items.length === 0) {
          router.push('/cart');
          return;
        }
        setCartData(cartJson);

        // Load profile email
        const meRes = await fetch('/api/me');
        if (meRes.ok) {
          const meJson = await meRes.json();
          if (meJson.profile?.email) setEmail(meJson.profile.email);
          if (meJson.profile?.name) setAddrName(meJson.profile.name);
          if (meJson.profile?.phone) setAddrPhone(meJson.profile.phone);
        }

        // Load addresses
        const addrRes = await fetch('/api/addresses');
        if (addrRes.ok) {
          const addrJson = await addrRes.json();
          setAddresses(addrJson.addresses || []);
          if (addrJson.addresses && addrJson.addresses.length > 0) {
            const def = addrJson.addresses.find((a: any) => a.is_default) || addrJson.addresses[0];
            setSelectedAddressId(def.id);
          } else {
            setShowNewAddressForm(true);
          }
        }
      } catch {
        toast('Failed to load checkout details', 'error');
      } finally {
        setLoading(false);
      }
    };

    init();
  }, [router, toast]);

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/addresses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: addrName,
          phone: addrPhone,
          line1: addrLine1,
          line2: addrLine2 || null,
          city: addrCity,
          state: addrState,
          pincode: addrPincode,
          latitude: addrLat,
          longitude: addrLng,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast(data.error?.message || 'Failed to save address', 'error');
      } else {
        setAddresses((prev) => [...prev, data.address]);
        setSelectedAddressId(data.address.id);
        setShowNewAddressForm(false);
        toast('Address saved with location pin.');
      }
    } catch {
      toast('Failed to save address', 'error');
    }
  };

  const handleCreateOrder = async () => {
    if (!selectedAddressId) {
      toast('Please select or add a delivery address.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          addressId: selectedAddressId,
          email: email.trim(),
        }),
      });

      const data = await res.json();
      if (res.status === 409) {
        toast('Stock shortage detected. Please update your cart.', 'error');
        router.push('/cart');
        return;
      }

      if (!res.ok) {
        toast(data.error?.message || 'Order creation failed', 'error');
      } else {
        setCreatedOrder(data.order);
        toast(`Order ${data.order.order_number} initialized!`, 'success');
      }
    } catch {
      toast('Failed to process order', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createdOrder) {
      toast('Creating order snapshot before applying coupon...');
      await handleCreateOrder();
      return;
    }

    setCouponLoading(true);
    setCouponError(null);

    try {
      const res = await fetch(`/api/orders/${createdOrder.id}/coupon`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: couponCode }),
      });

      const data = await res.json();
      if (!res.ok) {
        setCouponError(data.error?.message || 'Invalid coupon.');
      } else {
        setCreatedOrder((prev: any) => ({
          ...prev,
          coupon_code: data.couponCode,
          discount_paise: data.discountPaise,
          total_paise: data.totalPaise,
        }));
        toast(`Coupon ${data.couponCode} applied!`, 'success');
      }
    } catch {
      setCouponError('Failed to apply coupon.');
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = async () => {
    if (!createdOrder) return;
    try {
      const res = await fetch(`/api/orders/${createdOrder.id}/coupon`, { method: 'DELETE' });
      const data = await res.json();
      if (res.ok) {
        setCreatedOrder((prev: any) => ({
          ...prev,
          coupon_code: null,
          discount_paise: 0,
          total_paise: data.totalPaise,
        }));
        setCouponCode('');
        toast('Coupon removed.');
      }
    } catch {
      toast('Failed to remove coupon', 'error');
    }
  };

  const handleProceedToPayment = async () => {
    let orderToPay = createdOrder;
    if (!orderToPay) {
      setSubmitting(true);
      try {
        const res = await fetch('/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            addressId: selectedAddressId,
            email: email.trim(),
          }),
        });
        const data = await res.json();
        if (!res.ok) {
          toast(data.error?.message || 'Failed to prepare order', 'error');
          setSubmitting(false);
          return;
        }
        orderToPay = data.order;
        setCreatedOrder(data.order);
      } catch {
        toast('Failed to prepare order', 'error');
        setSubmitting(false);
        return;
      }
    }

    // Call payment create API
    try {
      const payRes = await fetch('/api/payments/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: orderToPay.id }),
      });

      const payData = await payRes.json();
      if (!payRes.ok) {
        toast(payData.error?.message || 'Payment initiation failed', 'error');
        setSubmitting(false);
        return;
      }

      // Check if Razorpay script is ready or simulated test mode
      if (typeof window !== 'undefined' && (window as any).Razorpay) {
        const rzp = new (window as any).Razorpay({
          key: payData.keyId,
          amount: payData.amount,
          currency: 'INR',
          name: 'Barakah Bazaar',
          description: `Order ${orderToPay.order_number}`,
          order_id: payData.razorpayOrderId,
          handler: async (response: any) => {
            // Verify
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
              router.push(`/checkout/success?order=${orderToPay.order_number}`);
            } else {
              toast('Signature verification failed.', 'error');
            }
          },
          prefill: {
            contact: orderToPay.notify_phone,
            email: orderToPay.notify_email || '',
          },
        });
        rzp.open();
      } else {
        // Fallback for simulated test payment when script is not loaded
        toast('Simulating payment confirmation...', 'info');
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
          router.push(`/checkout/success?order=${orderToPay.order_number}`);
        } else {
          toast(vData.error?.message || 'Payment processing failed', 'error');
        }
      }
    } catch (err: any) {
      toast(err.message || 'Payment error', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-[900px] mx-auto px-4 py-16 text-center text-xs text-[var(--ink-muted)]">
        Preparing checkout...
      </div>
    );
  }

  const items = cartData?.items || [];
  const currentTotal = createdOrder ? createdOrder.total_paise : (cartData?.subtotalPaise || 0);

  return (
    <div className="max-w-[900px] mx-auto px-4 sm:px-6 py-6 sm:py-10">
      <Breadcrumbs items={[{ label: 'Cart', href: '/cart' }, { label: 'Checkout' }]} />

      <h1 className="font-serif text-3xl sm:text-4xl text-[var(--ink)] mt-4 mb-2">
        Checkout
      </h1>
      <Stepper steps={steps} currentStepIndex={createdOrder ? 3 : 0} />

      <div className="space-y-10 mt-8">
        {/* BLOCK 1: Delivery Address */}
        <section className="p-6 border border-[var(--line)] bg-[var(--surface)] rounded-[2px] space-y-4">
          <h2 className="font-serif text-xl text-[var(--ink)] m-0">1. Delivery Address</h2>

          {!showNewAddressForm && addresses.length > 0 ? (
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {addresses.map((a) => (
                  <label
                    key={a.id}
                    className={`p-4 border rounded-[2px] block cursor-pointer transition-colors ${
                      selectedAddressId === a.id
                        ? 'border-[var(--ink)] bg-[var(--bg)]'
                        : 'border-[var(--line)] hover:border-[var(--ink-muted)]'
                    }`}
                  >
                    <input
                      type="radio"
                      name="selectedAddress"
                      value={a.id}
                      checked={selectedAddressId === a.id}
                      onChange={() => setSelectedAddressId(a.id)}
                      className="sr-only"
                    />
                    <span className="font-semibold text-sm block">{a.name}</span>
                    <span className="text-xs text-[var(--ink-muted)] block mt-1">
                      {a.line1}{a.line2 ? `, ${a.line2}` : ''}
                    </span>
                    <span className="text-xs text-[var(--ink-muted)] block">
                      {a.city}, {a.state} - {a.pincode}
                    </span>
                    <span className="text-xs text-[var(--ink-muted)] block mt-1">
                      Phone: {a.phone}
                    </span>
                    <span className="text-[11px] text-[var(--ink-muted)] block mt-1">
                      Pin: {Number(a.latitude).toFixed(4)}, {Number(a.longitude).toFixed(4)}
                    </span>
                  </label>
                ))}
              </div>

              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => setShowNewAddressForm(true)}
              >
                + Add Another Address
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSaveAddress} className="space-y-4 pt-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Full Name" required>
                  <Input
                    value={addrName}
                    onChange={(e) => setAddrName(e.target.value)}
                    placeholder="Recipient's name"
                    required
                  />
                </Field>

                <Field label="Contact Phone" required>
                  <Input
                    type="tel"
                    value={addrPhone}
                    onChange={(e) => setAddrPhone(e.target.value)}
                    placeholder="10-digit mobile"
                    required
                  />
                </Field>
              </div>

              <Field label="Address Line 1" required>
                <Input
                  value={addrLine1}
                  onChange={(e) => setAddrLine1(e.target.value)}
                  placeholder="Flat, House no., Building, Street"
                  required
                />
              </Field>

              <Field label="Address Line 2 (Optional)">
                <Input
                  value={addrLine2}
                  onChange={(e) => setAddrLine2(e.target.value)}
                  placeholder="Apartment, Suite, Unit"
                />
              </Field>

              <div className="grid grid-cols-3 gap-3">
                <Field label="City" required>
                  <Input value={addrCity} onChange={(e) => setAddrCity(e.target.value)} required />
                </Field>
                <Field label="State" required>
                  <Input value={addrState} onChange={(e) => setAddrState(e.target.value)} required />
                </Field>
                <Field label="Pincode (6 Digits)" required>
                  <Input
                    value={addrPincode}
                    maxLength={6}
                    onChange={(e) => setAddrPincode(e.target.value.replace(/\D/g, ''))}
                    placeholder="682001"
                    required
                  />
                </Field>
              </div>

              {/* Interactive Map Pin Coordinate Picker */}
              <div className="pt-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-[var(--ink-muted)] block mb-2">
                  Doorstep Map Pin Coordinates (Required)
                </span>
                <AddressMapPicker
                  latitude={addrLat}
                  longitude={addrLng}
                  onChange={(lat, lng) => {
                    setAddrLat(lat);
                    setAddrLng(lng);
                  }}
                />
              </div>

              <div className="flex gap-3 pt-2">
                <Button type="submit" variant="primary" size="md">
                  Save Address &amp; Use
                </Button>
                {addresses.length > 0 && (
                  <Button
                    type="button"
                    variant="secondary"
                    size="md"
                    onClick={() => setShowNewAddressForm(false)}
                  >
                    Cancel
                  </Button>
                )}
              </div>
            </form>
          )}
        </section>

        {/* BLOCK 2: Contact Email */}
        <section className="p-6 border border-[var(--line)] bg-[var(--surface)] rounded-[2px] space-y-3">
          <h2 className="font-serif text-xl text-[var(--ink)] m-0">2. Contact Email (Optional)</h2>
          <p className="text-xs text-[var(--ink-muted)] m-0">
            Order updates and invoices will be sent to this email address in addition to SMS/WhatsApp notifications.
          </p>
          <div className="max-w-md pt-1">
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. fatima@example.com"
            />
          </div>
        </section>

        {/* BLOCK 3: Order Review & Coupon */}
        <section className="p-6 border border-[var(--line)] bg-[var(--surface)] rounded-[2px] space-y-5">
          <h2 className="font-serif text-xl text-[var(--ink)] m-0">3. Order Review</h2>

          <div className="divide-y divide-[var(--line)] border-y border-[var(--line)]">
            {items.map((it: any) => (
              <div key={it.id} className="py-3 flex justify-between items-center text-xs">
                <div>
                  <span className="font-semibold text-sm text-[var(--ink)] block">{it.productName}</span>
                  <span className="text-[var(--ink-muted)]">{it.variantLabel} &times; {it.qty}</span>
                </div>
                <span className="font-semibold tabular-nums text-sm">
                  {formatINR(it.unitPricePaise * it.qty)}
                </span>
              </div>
            ))}
          </div>

          {/* Coupon Input */}
          <div className="pt-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-[var(--ink-muted)] block mb-2">
              Apply Coupon Code
            </span>
            {createdOrder?.coupon_code ? (
              <div className="flex items-center justify-between p-3 bg-[var(--bg)] border border-[var(--line)] rounded-[2px]">
                <span className="text-xs font-semibold text-[var(--success)]">
                  Coupon {createdOrder.coupon_code} applied (-{formatINR(createdOrder.discount_paise)})
                </span>
                <button
                  type="button"
                  onClick={handleRemoveCoupon}
                  className="text-xs text-[var(--danger)] underline cursor-pointer"
                >
                  Remove
                </button>
              </div>
            ) : (
              <form onSubmit={handleApplyCoupon} className="flex gap-2 max-w-md">
                <Input
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  placeholder="Enter code"
                  className="uppercase text-xs"
                />
                <Button type="submit" variant="secondary" size="md" loading={couponLoading}>
                  Apply
                </Button>
              </form>
            )}
            {couponError && (
              <span className="text-xs text-[var(--danger)] block mt-1">{couponError}</span>
            )}
          </div>

          {/* Totals */}
          <div className="space-y-2 pt-4 border-t border-[var(--line)] text-xs">
            <div className="flex justify-between text-[var(--ink-muted)]">
              <span>Subtotal</span>
              <span className="tabular-nums font-medium text-[var(--ink)]">
                {formatINR(cartData?.subtotalPaise || 0)}
              </span>
            </div>

            {createdOrder?.discount_paise > 0 && (
              <div className="flex justify-between text-[var(--success)] font-medium">
                <span>Coupon Discount ({createdOrder.coupon_code})</span>
                <span className="tabular-nums">-{formatINR(createdOrder.discount_paise)}</span>
              </div>
            )}

            <div className="flex justify-between text-base font-semibold text-[var(--ink)] pt-2 border-t border-[var(--line)]">
              <span>Total Payable</span>
              <span className="tabular-nums font-serif text-xl">{formatINR(currentTotal)}</span>
            </div>
            <p className="text-[11px] text-[var(--ink-muted)] m-0">
              Inclusive of all taxes.
            </p>
          </div>
        </section>

        {/* BLOCK 4: Pay */}
        <section className="p-6 border border-[var(--line)] bg-[var(--surface)] rounded-[2px] space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-xl text-[var(--ink)] m-0">4. Payment Mode</h2>
            <span className="text-[10px] font-semibold text-[var(--ink)] px-2 py-0.5 rounded-[2px] border border-[var(--line)]">
              SECURE CHECKOUT
            </span>
          </div>

          <p className="text-xs text-[var(--ink-muted)] m-0">
            Pay safely via Razorpay with your preferred payment method:
          </p>

          <div className="flex flex-wrap items-center gap-2 py-2">
            <span className="px-3 py-1.5 bg-[var(--surface-subtle)] border border-[var(--line)] rounded-[2px] text-xs font-medium text-[var(--ink)]">
              UPI (GPay / PhonePe / Paytm)
            </span>
            <span className="px-3 py-1.5 bg-[var(--surface-subtle)] border border-[var(--line)] rounded-[2px] text-xs font-medium text-[var(--ink)]">
              Credit / Debit Cards
            </span>
            <span className="px-3 py-1.5 bg-[var(--surface-subtle)] border border-[var(--line)] rounded-[2px] text-xs font-medium text-[var(--ink)]">
              NetBanking (50+ Banks)
            </span>
          </div>

          <Button
            type="button"
            variant="primary"
            size="lg"
            loading={submitting}
            onClick={handleProceedToPayment}
            className="w-full sm:w-auto px-10 bg-[var(--ink)] hover:bg-black rounded-[2px] font-medium uppercase tracking-wider text-[var(--bg)] cursor-pointer"
          >
            Pay {formatINR(currentTotal)} via Razorpay
          </Button>
        </section>
      </div>
    </div>
  );
}
