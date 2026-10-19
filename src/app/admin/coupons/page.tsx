'use client';

import React, { useState, useEffect } from 'react';
import {
  Ticket,
  Plus,
  Trash2,
  CheckCircle2,
  XCircle,
  Clock,
  Tag,
  Percent,
  Calendar,
  IndianRupee,
  X,
  AlertCircle,
} from 'lucide-react';

interface Coupon {
  id: string;
  code: string;
  type: 'PERCENT' | 'FLAT';
  value: number;
  max_discount_paise?: number | null;
  min_order_paise: number;
  valid_from: string;
  valid_to: string;
  is_active: boolean;
  used_count: number;
}

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Form State
  const [code, setCode] = useState('');
  const [type, setType] = useState<'PERCENT' | 'FLAT'>('PERCENT');
  const [value, setValue] = useState('');
  const [maxDiscountRupees, setMaxDiscountRupees] = useState('');
  const [minOrderRupees, setMinOrderRupees] = useState('999');
  const [validDays, setValidDays] = useState('60');

  const fetchCoupons = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/coupons');
      if (res.ok) {
        const data = await res.json();
        setCoupons(data.coupons || []);
      }
    } catch (err) {
      console.error('Failed to load coupons:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const toggleCouponStatus = async (id: string, currentStatus: boolean) => {
    try {
      const res = await fetch(`/api/admin/coupons/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !currentStatus }),
      });
      if (res.ok) {
        setCoupons((prev) =>
          prev.map((c) => (c.id === id ? { ...c, is_active: !currentStatus } : c))
        );
      }
    } catch (err) {
      console.error('Failed to toggle coupon:', err);
    }
  };

  const deleteCoupon = async (id: string, couponCode: string) => {
    if (!confirm(`Are you sure you want to delete coupon "${couponCode}"?`)) return;
    try {
      const res = await fetch(`/api/admin/coupons/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setCoupons((prev) => prev.filter((c) => c.id !== id));
      }
    } catch (err) {
      console.error('Failed to delete coupon:', err);
    }
  };

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || !value) {
      setErrorMsg('Please enter a coupon code and discount value.');
      return;
    }

    setSaving(true);
    setErrorMsg(null);

    try {
      const from = new Date();
      const to = new Date();
      to.setDate(to.getDate() + (Number(validDays) || 30));

      const payload = {
        code: code.trim().toUpperCase(),
        type,
        value: Number(value),
        max_discount_paise: maxDiscountRupees ? Number(maxDiscountRupees) * 100 : null,
        min_order_paise: minOrderRupees ? Number(minOrderRupees) * 100 : 0,
        valid_from: from.toISOString(),
        valid_to: to.toISOString(),
        is_active: true,
      };

      const res = await fetch('/api/admin/coupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error?.message || 'Failed to create coupon');
      }

      setCoupons((prev) => [data.coupon, ...prev]);
      setModalOpen(false);
      setCode('');
      setValue('');
      setMaxDiscountRupees('');
    } catch (err: any) {
      setErrorMsg(err.message || 'Error saving coupon');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#E8E2D5] pb-5">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#0F3E2E] tracking-tight m-0">
            Coupons & Promotional Offers
          </h1>
          <p className="text-xs sm:text-sm text-[#736B5E] mt-1 m-0">
            Create discount codes, set minimum cart conditions, and track promotional performance.
          </p>
        </div>
        <button
          onClick={() => {
            setErrorMsg(null);
            setModalOpen(true);
          }}
          className="inline-flex items-center gap-2 bg-[#B98725] hover:bg-[#9c711e] text-white px-4 py-2.5 rounded-lg text-xs font-semibold shadow-xs transition-colors"
        >
          <Plus size={16} />
          <span>Create Coupon</span>
        </button>
      </div>

      {/* Coupons Table */}
      <div className="bg-white rounded-xl border border-[#E8E2D5] shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-[#736B5E] text-sm">
            <div className="animate-spin w-6 h-6 border-2 border-[#B98725] border-t-transparent rounded-full mx-auto mb-3" />
            Loading coupons...
          </div>
        ) : coupons.length === 0 ? (
          <div className="p-12 text-center">
            <Ticket size={36} className="text-[#C5A880] mx-auto mb-2 opacity-50" />
            <p className="text-[#1E1B15] font-semibold text-base m-0">No coupons yet</p>
            <p className="text-xs text-[#736B5E] mt-1 m-0">
              Create your first promotional discount coupon for customers.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#FAF7F0] border-b border-[#E8E2D5] text-[#5C5549] uppercase tracking-wider font-semibold">
                  <th className="py-3 px-4">Coupon Code</th>
                  <th className="py-3 px-4">Discount</th>
                  <th className="py-3 px-4">Min. Cart Value</th>
                  <th className="py-3 px-4">Usage Count</th>
                  <th className="py-3 px-4">Valid Until</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8E2D5]">
                {coupons.map((coupon) => {
                  const isExpired = new Date(coupon.valid_to) < new Date();
                  return (
                    <tr key={coupon.id} className="hover:bg-[#FAF7F0]/60 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-sm text-[#0F3E2E]">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#FAF7F0] border border-[#D5CDBD]">
                          <Tag size={12} className="text-[#B98725]" />
                          {coupon.code}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-[#1E1B15]">
                        {coupon.type === 'PERCENT' ? (
                          <span>
                            {coupon.value}% OFF
                            {coupon.max_discount_paise && (
                              <span className="text-[11px] text-[#736B5E] block font-normal">
                                (Up to ₹{(coupon.max_discount_paise / 100).toLocaleString('en-IN')})
                              </span>
                            )}
                          </span>
                        ) : (
                          <span>₹{coupon.value.toLocaleString('en-IN')} Flat Off</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-[#5C5549]">
                        {coupon.min_order_paise > 0
                          ? `₹${(coupon.min_order_paise / 100).toLocaleString('en-IN')}`
                          : 'No minimum'}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-[#1E1B15]">
                        {coupon.used_count} times
                      </td>
                      <td className="py-3.5 px-4 text-[#736B5E]">
                        {new Date(coupon.valid_to).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                        {isExpired && (
                          <span className="text-[10px] text-rose-600 block font-semibold">
                            Expired
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <button
                          onClick={() => toggleCouponStatus(coupon.id, coupon.is_active)}
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border transition-colors ${
                            coupon.is_active && !isExpired
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                              : 'bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200'
                          }`}
                        >
                          {coupon.is_active && !isExpired ? (
                            <>
                              <CheckCircle2 size={12} className="text-emerald-600" />
                              Active
                            </>
                          ) : (
                            <>
                              <XCircle size={12} className="text-gray-500" />
                              Inactive
                            </>
                          )}
                        </button>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => deleteCoupon(coupon.id, coupon.code)}
                          className="p-1 text-gray-400 hover:text-rose-600 rounded transition-colors"
                          title="Delete Coupon"
                        >
                          <Trash2 size={15} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Coupon Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-[#E8E2D5] overflow-hidden">
            <div className="bg-[#0F3E2E] text-white p-5 flex items-center justify-between">
              <div>
                <span className="text-xs text-[#C5A880] uppercase tracking-wider font-semibold block">
                  Promotions
                </span>
                <h3 className="font-serif text-lg font-bold tracking-wide mt-0.5 m-0">
                  Create Discount Coupon
                </h3>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 rounded-full text-[#E0D8C7] hover:text-white hover:bg-white/10 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateCoupon} className="p-6 space-y-4 text-xs">
              {errorMsg && (
                <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700">
                  {errorMsg}
                </div>
              )}

              <div>
                <label className="block font-semibold text-[#1E1B15] mb-1">Coupon Code *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. FESTIVE20, RAMADAN10"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  className="w-full px-3 py-2 bg-[#FBF9F5] border border-[#D5CDBD] rounded-lg font-mono font-bold tracking-wider uppercase focus:outline-none focus:border-[#B98725]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#1E1B15] mb-1">Discount Type</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as any)}
                    className="w-full px-3 py-2 bg-[#FBF9F5] border border-[#D5CDBD] rounded-lg focus:outline-none focus:border-[#B98725]"
                  >
                    <option value="PERCENT">Percentage (%) Off</option>
                    <option value="FLAT">Flat Amount (₹) Off</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-[#1E1B15] mb-1">
                    {type === 'PERCENT' ? 'Discount Percentage (%) *' : 'Discount Amount (₹) *'}
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder={type === 'PERCENT' ? 'e.g. 15' : 'e.g. 500'}
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    className="w-full px-3 py-2 bg-[#FBF9F5] border border-[#D5CDBD] rounded-lg focus:outline-none focus:border-[#B98725]"
                  />
                </div>
              </div>

              {type === 'PERCENT' && (
                <div>
                  <label className="block font-semibold text-[#1E1B15] mb-1">
                    Max Discount Cap in Rupees (Optional)
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 2000 (leaves blank for no limit)"
                    value={maxDiscountRupees}
                    onChange={(e) => setMaxDiscountRupees(e.target.value)}
                    className="w-full px-3 py-2 bg-[#FBF9F5] border border-[#D5CDBD] rounded-lg focus:outline-none focus:border-[#B98725]"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#1E1B15] mb-1">
                    Min. Cart Amount (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="e.g. 999"
                    value={minOrderRupees}
                    onChange={(e) => setMinOrderRupees(e.target.value)}
                    className="w-full px-3 py-2 bg-[#FBF9F5] border border-[#D5CDBD] rounded-lg focus:outline-none focus:border-[#B98725]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#1E1B15] mb-1">
                    Valid For (Days)
                  </label>
                  <input
                    type="number"
                    min="1"
                    placeholder="e.g. 30"
                    value={validDays}
                    onChange={(e) => setValidDays(e.target.value)}
                    className="w-full px-3 py-2 bg-[#FBF9F5] border border-[#D5CDBD] rounded-lg focus:outline-none focus:border-[#B98725]"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E8E2D5]">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-[#D5CDBD] bg-white text-xs font-semibold text-[#5C5549] hover:bg-[#F3EFE6]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 rounded-lg bg-[#0F3E2E] hover:bg-[#16503c] text-white text-xs font-semibold transition-colors"
                >
                  {saving ? 'Creating...' : 'Create Coupon'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
