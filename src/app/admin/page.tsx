'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Package,
  Megaphone,
  ShoppingBag,
  Users,
  Ticket,
  Plus,
  ArrowRight,
  TrendingUp,
  CheckCircle2,
  Clock,
  IndianRupee,
  ShieldCheck,
  Truck,
  ExternalLink,
} from 'lucide-react';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<{
    totalRevenueRupees: number;
    ordersCount: number;
    pendingFulfillments: number;
    customersCount: number;
    productsCount: number;
    recentOrders: any[];
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const res = await fetch('/api/admin/stats');
        if (res.ok) {
          const data = await res.json();
          setStats(data.stats);
        }
      } catch (err) {
        console.error('Failed to load dashboard stats:', err);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-[#0F3E2E] via-[#16503c] to-[#0F3E2E] rounded-2xl p-6 sm:p-8 text-white shadow-xl border border-[#B98725]/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <span className="text-xs uppercase tracking-widest font-bold text-[#E6CA85] flex items-center gap-1.5 mb-1.5">
            <ShieldCheck size={14} className="text-[#B98725]" />
            Enterprise Control Center
          </span>
          <h1 className="font-serif font-bold text-2xl sm:text-3xl text-[#F9F6EE] tracking-tight m-0">
            Welcome to BarakahBazaar Admin
          </h1>
          <p className="text-xs sm:text-sm text-[#E0D8C7] mt-2 max-w-xl leading-relaxed m-0">
            Monitor real-time pan-India orders, manage luxury bridal & natural product catalog, configure Cloudinary CDN media, and track registered customers.
          </p>
        </div>
        <div className="flex flex-wrap gap-2.5">
          <Link
            href="/admin/products/new"
            className="inline-flex items-center gap-1.5 bg-[#B98725] hover:bg-[#a6771d] text-white px-4 py-2.5 rounded-lg text-xs font-bold tracking-wider uppercase transition-all shadow-md no-underline"
          >
            <Plus size={15} />
            <span>Add Product</span>
          </Link>
          <Link
            href="/admin/orders"
            className="inline-flex items-center gap-1.5 bg-[#1b5c45] hover:bg-[#206f53] text-[#F9F6EE] border border-[#B98725]/50 px-4 py-2.5 rounded-lg text-xs font-bold tracking-wider uppercase transition-all no-underline"
          >
            <ShoppingBag size={15} />
            <span>View Orders</span>
          </Link>
          <Link
            href="/admin/coupons"
            className="inline-flex items-center gap-1.5 bg-[#1b5c45] hover:bg-[#206f53] text-[#F9F6EE] border border-[#B98725]/50 px-4 py-2.5 rounded-lg text-xs font-bold tracking-wider uppercase transition-all no-underline"
          >
            <Ticket size={15} />
            <span>Coupons</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Revenue */}
        <div className="bg-white rounded-xl p-5 border border-[#E8E2D5] shadow-xs">
          <span className="text-xs font-semibold text-[#8C8270] uppercase tracking-wider block">
            Total Revenue
          </span>
          <span className="text-xl sm:text-2xl font-bold font-serif text-[#0F3E2E] mt-1 block">
            {loading ? '...' : `₹${(stats?.totalRevenueRupees || 0).toLocaleString('en-IN')}`}
          </span>
          <span className="text-[11px] text-emerald-700 font-medium flex items-center gap-1 mt-1.5">
            <TrendingUp size={13} />
            <span>Verified Orders</span>
          </span>
        </div>

        {/* Total Orders */}
        <div className="bg-white rounded-xl p-5 border border-[#E8E2D5] shadow-xs">
          <span className="text-xs font-semibold text-[#8C8270] uppercase tracking-wider block">
            Total Orders
          </span>
          <span className="text-xl sm:text-2xl font-bold font-serif text-[#1E1B15] mt-1 block">
            {loading ? '...' : stats?.ordersCount || 0}
          </span>
          <span className="text-[11px] text-amber-700 font-medium flex items-center gap-1 mt-1.5">
            <Clock size={13} />
            <span>{stats?.pendingFulfillments || 0} to fulfill</span>
          </span>
        </div>

        {/* Catalog Products */}
        <div className="bg-white rounded-xl p-5 border border-[#E8E2D5] shadow-xs">
          <span className="text-xs font-semibold text-[#8C8270] uppercase tracking-wider block">
            Catalog Products
          </span>
          <span className="text-xl sm:text-2xl font-bold font-serif text-[#1E1B15] mt-1 block">
            {loading ? '...' : stats?.productsCount || 0}
          </span>
          <Link
            href="/admin/products"
            className="text-[11px] text-[#0F3E2E] font-semibold hover:underline flex items-center gap-1 mt-1.5"
          >
            <span>Manage Catalog</span> &rarr;
          </Link>
        </div>

        {/* Registered Customers */}
        <div className="bg-white rounded-xl p-5 border border-[#E8E2D5] shadow-xs">
          <span className="text-xs font-semibold text-[#8C8270] uppercase tracking-wider block">
            Registered Customers
          </span>
          <span className="text-xl sm:text-2xl font-bold font-serif text-[#1E1B15] mt-1 block">
            {loading ? '...' : stats?.customersCount || 0}
          </span>
          <Link
            href="/admin/users"
            className="text-[11px] text-[#0F3E2E] font-semibold hover:underline flex items-center gap-1 mt-1.5"
          >
            <span>View User Directory</span> &rarr;
          </Link>
        </div>
      </div>

      {/* Quick Action Navigation Grid */}
      <div>
        <h2 className="font-serif text-lg font-bold text-[#0F3E2E] mb-3 m-0">Quick Management</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            href="/admin/orders"
            className="p-5 rounded-xl bg-white border border-[#E8E2D5] shadow-xs hover:border-[#B98725] hover:shadow-md transition-all group no-underline"
          >
            <div className="w-10 h-10 rounded-lg bg-emerald-50 text-[#0F3E2E] flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <ShoppingBag size={20} />
            </div>
            <h3 className="font-serif font-bold text-base text-[#1E1B15] m-0 group-hover:text-[#0F3E2E]">
              Orders & Fulfillment
            </h3>
            <p className="text-xs text-[#736B5E] mt-1 m-0">
              Track dispatches, update order statuses, and print packing slips.
            </p>
          </Link>

          <Link
            href="/admin/products"
            className="p-5 rounded-xl bg-white border border-[#E8E2D5] shadow-xs hover:border-[#B98725] hover:shadow-md transition-all group no-underline"
          >
            <div className="w-10 h-10 rounded-lg bg-amber-50 text-[#B98725] flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <Package size={20} />
            </div>
            <h3 className="font-serif font-bold text-base text-[#1E1B15] m-0 group-hover:text-[#0F3E2E]">
              Products & Catalog
            </h3>
            <p className="text-xs text-[#736B5E] mt-1 m-0">
              Edit variants, adjust prices, and upload photos to Cloudinary.
            </p>
          </Link>

          <Link
            href="/admin/users"
            className="p-5 rounded-xl bg-white border border-[#E8E2D5] shadow-xs hover:border-[#B98725] hover:shadow-md transition-all group no-underline"
          >
            <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-800 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <Users size={20} />
            </div>
            <h3 className="font-serif font-bold text-base text-[#1E1B15] m-0 group-hover:text-[#0F3E2E]">
              Customers & Users
            </h3>
            <p className="text-xs text-[#736B5E] mt-1 m-0">
              Inspect repeat buyers, lifetime value, and assign admin roles.
            </p>
          </Link>

          <Link
            href="/admin/coupons"
            className="p-5 rounded-xl bg-white border border-[#E8E2D5] shadow-xs hover:border-[#B98725] hover:shadow-md transition-all group no-underline"
          >
            <div className="w-10 h-10 rounded-lg bg-purple-50 text-purple-800 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <Ticket size={20} />
            </div>
            <h3 className="font-serif font-bold text-base text-[#1E1B15] m-0 group-hover:text-[#0F3E2E]">
              Coupons & Promos
            </h3>
            <p className="text-xs text-[#736B5E] mt-1 m-0">
              Configure promo codes, cart minimums, and percentage discounts.
            </p>
          </Link>
        </div>
      </div>

      {/* Recent Orders Overview */}
      <div className="bg-white rounded-xl border border-[#E8E2D5] shadow-xs overflow-hidden">
        <div className="p-5 border-b border-[#E8E2D5] flex items-center justify-between">
          <div>
            <h2 className="font-serif font-bold text-base sm:text-lg text-[#0F3E2E] m-0">
              Recent Orders
            </h2>
            <p className="text-xs text-[#736B5E] mt-0.5 m-0">
              Latest transactions placed across all collections.
            </p>
          </div>
          <Link
            href="/admin/orders"
            className="text-xs font-semibold text-[#B98725] hover:text-[#9c711e] flex items-center gap-1"
          >
            <span>All Orders</span> &rarr;
          </Link>
        </div>

        {stats?.recentOrders && stats.recentOrders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#FAF7F0] border-b border-[#E8E2D5] text-[#5C5549] uppercase tracking-wider font-semibold">
                  <th className="py-3 px-4">Order #</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Payment</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">View</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8E2D5]">
                {stats.recentOrders.map((ord: any) => (
                  <tr key={ord.id} className="hover:bg-[#FAF7F0]/60 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-[#0F3E2E]">
                      {ord.order_number}
                    </td>
                    <td className="py-3 px-4 font-medium text-[#1E1B15]">{ord.customer_name}</td>
                    <td className="py-3 px-4 font-semibold text-[#1E1B15]">
                      ₹{(ord.total_paise / 100).toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                          ord.payment_status === 'PAID'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {ord.payment_status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#FAF7F0] border border-[#D5CDBD] text-[#5C5549]">
                        {ord.order_status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Link
                        href="/admin/orders"
                        className="text-[#0F3E2E] font-semibold hover:text-[#B98725] transition-colors"
                      >
                        Inspect &rarr;
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center text-xs text-[#736B5E]">
            No recent orders to display.
          </div>
        )}
      </div>
    </div>
  );
}
