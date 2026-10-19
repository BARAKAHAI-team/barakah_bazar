'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  Megaphone,
  ShoppingBag,
  Users,
  Ticket,
  ExternalLink,
  Menu,
  X,
  ShieldCheck,
  LogOut,
} from 'lucide-react';

const ADMIN_NAV = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/products', label: 'Products & Catalog', icon: Package },
  { href: '/admin/orders', label: 'Orders & Fulfillment', icon: ShoppingBag },
  { href: '/admin/users', label: 'Customers & Users', icon: Users },
  { href: '/admin/coupons', label: 'Coupons & Promos', icon: Ticket },
  { href: '/admin/banners', label: 'Sale Banners', icon: Megaphone },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (href: string) => {
    if (href === '/admin') return pathname === '/admin';
    return pathname.startsWith(href);
  };

  return (
    <div className="min-h-screen bg-[#FBF9F5] text-[#1E1B15] flex flex-col md:flex-row">
      {/* Mobile Top Header */}
      <header className="md:hidden bg-[#0F3E2E] text-white px-4 py-3 flex items-center justify-between shadow-md sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 rounded bg-[#16503c] text-[#F9F6EE] hover:text-[#C5A880]"
            aria-label="Toggle Navigation"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <span className="font-serif font-bold text-lg tracking-wider text-[#C5A880]">BARAKAH</span>
          <span className="text-xs bg-[#B98725]/30 text-[#E6CA85] px-2 py-0.5 rounded border border-[#B98725]/50 uppercase tracking-widest font-semibold">
            Admin
          </span>
        </div>
        <Link
          href="/"
          target="_blank"
          className="text-xs flex items-center gap-1 text-[#C5A880] hover:text-white transition-colors"
        >
          <span>Store</span>
          <ExternalLink size={13} />
        </Link>
      </header>

      {/* Sidebar: Desktop */}
      <aside
        className={`fixed md:sticky top-0 left-0 h-screen w-64 bg-[#0F3E2E] text-[#F9F6EE] flex flex-col justify-between z-40 transition-transform duration-300 shadow-xl ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div>
          {/* Brand header */}
          <div className="p-6 border-b border-[#1b5c45]">
            <Link href="/admin" className="block">
              <span className="font-serif font-bold text-2xl tracking-wider text-[#C5A880] block">
                BARAKAH BAZAAR
              </span>
              <div className="flex items-center gap-2 mt-1">
                <ShieldCheck size={14} className="text-[#B98725]" />
                <span className="text-[11px] tracking-widest uppercase font-semibold text-[#B98725]">
                  Control Center
                </span>
              </div>
            </Link>
          </div>

          {/* Navigation Items */}
          <nav className="p-4 space-y-1">
            {ADMIN_NAV.map((item) => {
              const active = isActive(item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-md text-sm font-medium transition-all ${
                    active
                      ? 'bg-[#B98725] text-white shadow-md font-semibold'
                      : 'text-[#E0D8C7] hover:bg-[#16503c] hover:text-white'
                  }`}
                >
                  <Icon size={18} className={active ? 'text-white' : 'text-[#C5A880]'} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Actions */}
        <div className="p-4 border-t border-[#1b5c45] space-y-2">
          <Link
            href="/"
            target="_blank"
            className="flex items-center justify-between w-full px-4 py-2.5 rounded-md text-xs font-semibold text-[#E0D8C7] hover:bg-[#16503c] hover:text-white transition-colors"
          >
            <span className="flex items-center gap-2">
              <ExternalLink size={14} className="text-[#C5A880]" />
              View Customer Store
            </span>
            <span className="text-[10px] bg-[#16503c] px-2 py-0.5 rounded text-[#C5A880]">LIVE</span>
          </Link>
          <button
            onClick={async () => {
              await fetch('/api/auth/logout', { method: 'POST' });
              window.location.href = '/login';
            }}
            className="flex items-center gap-2 w-full px-4 py-2.5 rounded-md text-xs font-semibold text-rose-300 hover:bg-rose-950/40 transition-colors"
          >
            <LogOut size={14} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 p-4 sm:p-6 md:p-8 max-w-7xl mx-auto w-full">
        {children}
      </main>
    </div>
  );
}
