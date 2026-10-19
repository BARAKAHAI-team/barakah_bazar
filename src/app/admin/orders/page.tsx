'use client';

import React, { useState, useEffect } from 'react';
import {
  ShoppingBag,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Truck,
  Package,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  X,
  Printer,
  Calendar,
  CreditCard,
  MapPin,
  Phone,
  Mail,
  User,
} from 'lucide-react';
import Image from 'next/image';

interface OrderItem {
  id: string;
  product_name: string;
  variant_label: string;
  quantity: number;
  price_paise: number;
  thumbnail_url?: string | null;
}

interface Order {
  id: string;
  order_number: string;
  user_id: string;
  notify_phone: string;
  notify_email?: string | null;
  customer_name: string;
  subtotal_paise: number;
  discount_paise: number;
  coupon_code?: string | null;
  total_paise: number;
  payment_status: 'PAID' | 'PENDING' | 'FAILED';
  order_status: 'CONFIRMED' | 'PROCESSING' | 'DELIVERED' | 'PENDING_PAYMENT' | 'CANCELLED';
  created_at: string;
  address_snapshot?: {
    name: string;
    phone: string;
    line1: string;
    line2?: string;
    city: string;
    state: string;
    pincode: string;
  };
  items?: OrderItem[];
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== 'ALL') params.set('status', statusFilter);
      if (search.trim()) params.set('search', search.trim());

      const res = await fetch(`/api/admin/orders?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setOrders(data.orders || []);
      }
    } catch (err) {
      console.error('Failed to fetch orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchOrders();
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    setUpdatingId(orderId);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order_status: newStatus }),
      });
      if (res.ok) {
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, order_status: newStatus as any } : o))
        );
        if (selectedOrder && selectedOrder.id === orderId) {
          setSelectedOrder((prev) => (prev ? { ...prev, order_status: newStatus as any } : null));
        }
      }
    } catch (err) {
      console.error('Failed to update status:', err);
    } finally {
      setUpdatingId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
            <CheckCircle2 size={12} className="text-emerald-600" />
            Confirmed
          </span>
        );
      case 'PROCESSING':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-800 border border-blue-200">
            <Package size={12} className="text-blue-600" />
            Processing
          </span>
        );
      case 'DELIVERED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-50 text-purple-800 border border-purple-200">
            <Truck size={12} className="text-purple-600" />
            Delivered
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-800 border border-rose-200">
            <X size={12} className="text-rose-600" />
            Cancelled
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
            <Clock size={12} className="text-amber-600" />
            {status}
          </span>
        );
    }
  };

  const confirmedCount = orders.filter((o) => o.order_status === 'CONFIRMED').length;
  const processingCount = orders.filter((o) => o.order_status === 'PROCESSING').length;
  const deliveredCount = orders.filter((o) => o.order_status === 'DELIVERED').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#E8E2D5] pb-5">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#0F3E2E] tracking-tight m-0">
            Orders & Fulfillment
          </h1>
          <p className="text-xs sm:text-sm text-[#736B5E] mt-1 m-0">
            Track customer shipments, verify payment statuses, and manage deliveries.
          </p>
        </div>
      </div>

      {/* KPI mini-cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-xl border border-[#E8E2D5] shadow-xs">
          <p className="text-xs text-[#736B5E] font-medium m-0">Total Orders</p>
          <p className="text-xl sm:text-2xl font-bold text-[#0F3E2E] mt-1 m-0">{orders.length}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-[#E8E2D5] shadow-xs">
          <p className="text-xs text-[#736B5E] font-medium m-0">To Fulfill</p>
          <p className="text-xl sm:text-2xl font-bold text-amber-600 mt-1 m-0">
            {confirmedCount + processingCount}
          </p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-[#E8E2D5] shadow-xs">
          <p className="text-xs text-[#736B5E] font-medium m-0">Processing</p>
          <p className="text-xl sm:text-2xl font-bold text-blue-600 mt-1 m-0">{processingCount}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-[#E8E2D5] shadow-xs">
          <p className="text-xs text-[#736B5E] font-medium m-0">Delivered</p>
          <p className="text-xl sm:text-2xl font-bold text-purple-600 mt-1 m-0">{deliveredCount}</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-[#E8E2D5] shadow-xs flex flex-col md:flex-row gap-4 justify-between items-center">
        {/* Status Pills */}
        <div className="flex items-center gap-1 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {[
            { id: 'ALL', label: 'All Orders' },
            { id: 'CONFIRMED', label: 'Confirmed' },
            { id: 'PROCESSING', label: 'Processing' },
            { id: 'DELIVERED', label: 'Delivered' },
            { id: 'PENDING_PAYMENT', label: 'Pending Payment' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                statusFilter === tab.id
                  ? 'bg-[#0F3E2E] text-white shadow-xs'
                  : 'text-[#5C5549] hover:bg-[#F3EFE6]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-72">
          <input
            type="text"
            placeholder="Search order #, customer, phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-[#FBF9F5] border border-[#D5CDBD] rounded-lg focus:outline-none focus:border-[#B98725]"
          />
          <Search size={14} className="absolute left-3 top-2.5 text-[#8C8270]" />
        </form>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-xl border border-[#E8E2D5] shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-[#736B5E] text-sm">
            <div className="animate-spin w-6 h-6 border-2 border-[#B98725] border-t-transparent rounded-full mx-auto mb-3" />
            Loading orders...
          </div>
        ) : orders.length === 0 ? (
          <div className="p-12 text-center">
            <ShoppingBag size={36} className="text-[#C5A880] mx-auto mb-2 opacity-50" />
            <p className="text-[#1E1B15] font-semibold text-base m-0">No orders found</p>
            <p className="text-xs text-[#736B5E] mt-1 m-0">
              Orders placed by customers will automatically appear here in real time.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#FAF7F0] border-b border-[#E8E2D5] text-[#5C5549] uppercase tracking-wider font-semibold">
                  <th className="py-3 px-4">Order #</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Items</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Payment</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8E2D5]">
                {orders.map((order) => (
                  <tr
                    key={order.id}
                    className="hover:bg-[#FAF7F0]/60 transition-colors cursor-pointer"
                    onClick={() => setSelectedOrder(order)}
                  >
                    <td className="py-3.5 px-4 font-mono font-bold text-[#0F3E2E]">
                      {order.order_number}
                    </td>
                    <td className="py-3.5 px-4 text-[#736B5E]">
                      {new Date(order.created_at).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="py-3.5 px-4">
                      <p className="font-semibold text-[#1E1B15] m-0">{order.customer_name}</p>
                      <p className="text-[11px] text-[#736B5E] m-0 font-mono">{order.notify_phone}</p>
                    </td>
                    <td className="py-3.5 px-4 text-[#5C5549]">
                      {order.items?.length || 1} item{(order.items?.length || 1) > 1 ? 's' : ''}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-[#1E1B15]">
                      ₹{(order.total_paise / 100).toLocaleString('en-IN')}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                          order.payment_status === 'PAID'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {order.payment_status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4" onClick={(e) => e.stopPropagation()}>
                      <select
                        value={order.order_status}
                        disabled={updatingId === order.id}
                        onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                        className="text-xs bg-white border border-[#D5CDBD] rounded-md px-2 py-1 font-semibold focus:outline-none focus:border-[#B98725]"
                      >
                        <option value="PENDING_PAYMENT">Pending Payment</option>
                        <option value="CONFIRMED">Confirmed</option>
                        <option value="PROCESSING">Processing</option>
                        <option value="DELIVERED">Delivered</option>
                        <option value="CANCELLED">Cancelled</option>
                      </select>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="text-xs text-[#0F3E2E] font-semibold hover:text-[#B98725] transition-colors"
                      >
                        Details &rarr;
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Order Detail Modal / Flyout */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-[#E8E2D5] overflow-hidden max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="bg-[#0F3E2E] text-white p-5 flex items-center justify-between">
              <div>
                <span className="text-xs text-[#C5A880] uppercase tracking-wider font-semibold block">
                  Order Details
                </span>
                <h3 className="font-serif text-xl font-bold tracking-wide mt-0.5 m-0">
                  {selectedOrder.order_number}
                </h3>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-1 rounded-full text-[#E0D8C7] hover:text-white hover:bg-white/10 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="p-6 overflow-y-auto space-y-6 text-xs text-[#1E1B15]">
              {/* Status and Action banner */}
              <div className="flex flex-wrap items-center justify-between gap-3 bg-[#FAF7F0] p-4 rounded-xl border border-[#E8E2D5]">
                <div className="flex items-center gap-2">
                  <span className="text-[#736B5E] font-medium">Current Status:</span>
                  {getStatusBadge(selectedOrder.order_status)}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[#736B5E] font-medium">Update to:</span>
                  <select
                    value={selectedOrder.order_status}
                    onChange={(e) => updateOrderStatus(selectedOrder.id, e.target.value)}
                    className="bg-white border border-[#D5CDBD] rounded-md px-2.5 py-1 text-xs font-semibold focus:outline-none"
                  >
                    <option value="CONFIRMED">Confirmed</option>
                    <option value="PROCESSING">Processing</option>
                    <option value="DELIVERED">Delivered</option>
                    <option value="CANCELLED">Cancelled</option>
                  </select>
                </div>
              </div>

              {/* Customer and Shipping Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Customer Details */}
                <div className="p-4 rounded-xl border border-[#E8E2D5] space-y-2">
                  <h4 className="font-serif font-bold text-sm text-[#0F3E2E] flex items-center gap-1.5 m-0">
                    <User size={15} className="text-[#B98725]" />
                    Customer Information
                  </h4>
                  <p className="font-semibold text-sm m-0">{selectedOrder.customer_name}</p>
                  <p className="text-[#736B5E] flex items-center gap-1.5 m-0 font-mono">
                    <Phone size={12} /> {selectedOrder.notify_phone}
                  </p>
                  {selectedOrder.notify_email && (
                    <p className="text-[#736B5E] flex items-center gap-1.5 m-0">
                      <Mail size={12} /> {selectedOrder.notify_email}
                    </p>
                  )}
                </div>

                {/* Delivery Address */}
                <div className="p-4 rounded-xl border border-[#E8E2D5] space-y-2">
                  <h4 className="font-serif font-bold text-sm text-[#0F3E2E] flex items-center gap-1.5 m-0">
                    <MapPin size={15} className="text-[#B98725]" />
                    Delivery Address
                  </h4>
                  {selectedOrder.address_snapshot ? (
                    <div className="text-[#5C5549] leading-relaxed">
                      <p className="font-semibold text-[#1E1B15] m-0">
                        {selectedOrder.address_snapshot.name}
                      </p>
                      <p className="m-0">{selectedOrder.address_snapshot.line1}</p>
                      {selectedOrder.address_snapshot.line2 && (
                        <p className="m-0">{selectedOrder.address_snapshot.line2}</p>
                      )}
                      <p className="m-0">
                        {selectedOrder.address_snapshot.city}, {selectedOrder.address_snapshot.state} -{' '}
                        <span className="font-mono font-bold">
                          {selectedOrder.address_snapshot.pincode}
                        </span>
                      </p>
                    </div>
                  ) : (
                    <p className="text-[#8C8270] italic">Standard Delivery</p>
                  )}
                </div>
              </div>

              {/* Items List */}
              <div className="space-y-3">
                <h4 className="font-serif font-bold text-sm text-[#0F3E2E] m-0">
                  Ordered Products
                </h4>
                <div className="border border-[#E8E2D5] rounded-xl divide-y divide-[#E8E2D5] overflow-hidden">
                  {(selectedOrder.items || []).map((item, idx) => (
                    <div key={idx} className="p-3.5 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg bg-[#FAF7F0] border border-[#E8E2D5] overflow-hidden relative flex-shrink-0">
                          {item.thumbnail_url ? (
                            <Image
                              src={item.thumbnail_url}
                              alt={item.product_name}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-[#B98725]">
                              <ShoppingBag size={18} />
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-xs text-[#1E1B15] m-0">
                            {item.product_name}
                          </p>
                          <p className="text-[11px] text-[#736B5E] m-0">
                            Variant: {item.variant_label}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-semibold text-[#1E1B15] m-0">
                          Qty: {item.quantity} &times; ₹{(item.price_paise / 100).toLocaleString('en-IN')}
                        </p>
                        <p className="text-xs font-bold text-[#0F3E2E] mt-0.5 m-0">
                          ₹{((item.price_paise * item.quantity) / 100).toLocaleString('en-IN')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Financial Calculation */}
              <div className="bg-[#FAF7F0] p-4 rounded-xl border border-[#E8E2D5] space-y-2">
                <div className="flex justify-between text-xs text-[#736B5E]">
                  <span>Subtotal:</span>
                  <span>₹{(selectedOrder.subtotal_paise / 100).toLocaleString('en-IN')}</span>
                </div>
                {selectedOrder.discount_paise > 0 && (
                  <div className="flex justify-between text-xs text-emerald-700 font-medium">
                    <span>Discount ({selectedOrder.coupon_code || 'Promo'}):</span>
                    <span>-₹{(selectedOrder.discount_paise / 100).toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div className="flex justify-between text-xs text-[#736B5E]">
                  <span>Shipping:</span>
                  <span className="text-emerald-700 font-semibold">FREE (Grand Launch)</span>
                </div>
                <div className="border-t border-[#D5CDBD] pt-2 flex justify-between text-sm font-bold text-[#0F3E2E]">
                  <span>Total Amount:</span>
                  <span>₹{(selectedOrder.total_paise / 100).toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-[#FAF7F0] p-4 border-t border-[#E8E2D5] flex items-center justify-between">
              <button
                onClick={() => window.print()}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-[#D5CDBD] bg-white text-xs font-semibold text-[#5C5549] hover:bg-[#F3EFE6] transition-colors"
              >
                <Printer size={14} />
                <span>Print Packing Slip</span>
              </button>
              <button
                onClick={() => setSelectedOrder(null)}
                className="px-5 py-2 rounded-lg bg-[#0F3E2E] text-white text-xs font-semibold hover:bg-[#16503c] transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
