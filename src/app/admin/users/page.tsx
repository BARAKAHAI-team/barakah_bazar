'use client';

import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  Filter,
  ShieldCheck,
  UserCheck,
  ShoppingBag,
  Phone,
  Mail,
  Calendar,
  IndianRupee,
  MoreVertical,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';

interface UserProfile {
  id: string;
  name: string;
  phone: string;
  email: string;
  role: 'customer' | 'admin' | 'manager';
  orders_count: number;
  lifetime_spend_paise: number;
  created_at: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (roleFilter !== 'ALL') params.set('role', roleFilter);
      if (search.trim()) params.set('search', search.trim());

      const res = await fetch(`/api/admin/users?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users || []);
      }
    } catch (err) {
      console.error('Failed to fetch users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [roleFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchUsers();
  };

  const toggleUserRole = async (userId: string, currentRole: string) => {
    const newRole = currentRole === 'admin' ? 'customer' : 'admin';
    if (!confirm(`Are you sure you want to change this user's role to "${newRole.toUpperCase()}"?`)) {
      return;
    }

    setUpdatingId(userId);
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
      });
      if (res.ok) {
        setUsers((prev) =>
          prev.map((u) => (u.id === userId ? { ...u, role: newRole as any } : u))
        );
      }
    } catch (err) {
      console.error('Failed to change role:', err);
    } finally {
      setUpdatingId(null);
    }
  };

  const adminCount = users.filter((u) => u.role === 'admin').length;
  const customerCount = users.filter((u) => u.role !== 'admin').length;
  const repeatCustomerCount = users.filter((u) => u.orders_count > 1).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#E8E2D5] pb-5">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#0F3E2E] tracking-tight m-0">
            Customers & Users
          </h1>
          <p className="text-xs sm:text-sm text-[#736B5E] mt-1 m-0">
            Manage customer accounts, inspect lifetime order values, and configure administrative access.
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-xl border border-[#E8E2D5] shadow-xs">
          <p className="text-xs text-[#736B5E] font-medium m-0">Total Accounts</p>
          <p className="text-xl sm:text-2xl font-bold text-[#0F3E2E] mt-1 m-0">{users.length}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-[#E8E2D5] shadow-xs">
          <p className="text-xs text-[#736B5E] font-medium m-0">Customers</p>
          <p className="text-xl sm:text-2xl font-bold text-[#B98725] mt-1 m-0">{customerCount}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-[#E8E2D5] shadow-xs">
          <p className="text-xs text-[#736B5E] font-medium m-0">Repeat Buyers</p>
          <p className="text-xl sm:text-2xl font-bold text-emerald-700 mt-1 m-0">
            {repeatCustomerCount}
          </p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-[#E8E2D5] shadow-xs">
          <p className="text-xs text-[#736B5E] font-medium m-0">Admins</p>
          <p className="text-xl sm:text-2xl font-bold text-[#0F3E2E] mt-1 m-0">{adminCount}</p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-xl border border-[#E8E2D5] shadow-xs flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="flex items-center gap-1">
          {[
            { id: 'ALL', label: 'All Users' },
            { id: 'customer', label: 'Customers' },
            { id: 'admin', label: 'Administrators' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setRoleFilter(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                roleFilter === tab.id
                  ? 'bg-[#0F3E2E] text-white shadow-xs'
                  : 'text-[#5C5549] hover:bg-[#F3EFE6]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-72">
          <input
            type="text"
            placeholder="Search name, phone, email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-[#FBF9F5] border border-[#D5CDBD] rounded-lg focus:outline-none focus:border-[#B98725]"
          />
          <Search size={14} className="absolute left-3 top-2.5 text-[#8C8270]" />
        </form>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl border border-[#E8E2D5] shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-[#736B5E] text-sm">
            <div className="animate-spin w-6 h-6 border-2 border-[#B98725] border-t-transparent rounded-full mx-auto mb-3" />
            Loading user directory...
          </div>
        ) : users.length === 0 ? (
          <div className="p-12 text-center">
            <Users size={36} className="text-[#C5A880] mx-auto mb-2 opacity-50" />
            <p className="text-[#1E1B15] font-semibold text-base m-0">No users found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#FAF7F0] border-b border-[#E8E2D5] text-[#5C5549] uppercase tracking-wider font-semibold">
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Contact Phone</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Orders</th>
                  <th className="py-3 px-4">Lifetime Spend</th>
                  <th className="py-3 px-4">Joined</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8E2D5]">
                {users.map((user) => {
                  const isAdmin = user.role === 'admin';
                  return (
                    <tr key={user.id} className="hover:bg-[#FAF7F0]/60 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-[#0F3E2E] text-[#E0D8C7] font-serif font-bold flex items-center justify-center text-xs">
                            {user.name ? user.name[0].toUpperCase() : 'B'}
                          </div>
                          <div>
                            <p className="font-semibold text-[#1E1B15] m-0">
                              {user.name || 'Barakah Member'}
                            </p>
                            <p className="text-[10px] text-[#8C8270] m-0 font-mono">
                              ID: {user.id.slice(0, 8)}...
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-[#5C5549]">
                        {user.phone || '—'}
                      </td>
                      <td className="py-3.5 px-4 text-[#736B5E] max-w-xs truncate">
                        {user.email || '—'}
                      </td>
                      <td className="py-3.5 px-4">
                        {isAdmin ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#B98725]/20 text-[#855D12] border border-[#B98725]/40">
                            <ShieldCheck size={12} />
                            Admin
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-gray-100 text-gray-700">
                            Customer
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-[#1E1B15]">
                        {user.orders_count}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-[#0F3E2E]">
                        ₹{(user.lifetime_spend_paise / 100).toLocaleString('en-IN')}
                      </td>
                      <td className="py-3.5 px-4 text-[#736B5E]">
                        {new Date(user.created_at).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          disabled={updatingId === user.id}
                          onClick={() => toggleUserRole(user.id, user.role)}
                          className={`text-xs px-2.5 py-1 rounded font-semibold border transition-all ${
                            isAdmin
                              ? 'border-gray-200 text-gray-600 hover:bg-gray-100'
                              : 'border-[#B98725]/40 bg-[#FAF7F0] text-[#855D12] hover:bg-[#B98725] hover:text-white'
                          }`}
                        >
                          {isAdmin ? 'Make Customer' : 'Make Admin'}
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
    </div>
  );
}
