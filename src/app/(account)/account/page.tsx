'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Field } from '@/components/ui/Field';
import { useToast } from '@/components/ui/Toast';
import { clientStore } from '@/lib/store';
import { AddressMapPicker } from '@/components/shop/AddressMapPicker';
import { Package, Heart, LogOut } from 'lucide-react';

export default function AccountPage() {
  const router = useRouter();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [updatingProfile, setUpdatingProfile] = useState(false);

  const [addresses, setAddresses] = useState<any[]>([]);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [addrName, setAddrName] = useState('');
  const [addrPhone, setAddrPhone] = useState('');
  const [addrLine1, setAddrLine1] = useState('');
  const [addrCity, setAddrCity] = useState('Kochi');
  const [addrState, setAddrState] = useState('Kerala');
  const [addrPincode, setAddrPincode] = useState('682001');
  const [addrLat, setAddrLat] = useState(9.9312);
  const [addrLng, setAddrLng] = useState(76.2673);

  const fetchProfile = async () => {
    try {
      const res = await fetch('/api/me');
      if (res.ok) {
        const data = await res.json();
        setProfile(data.profile);
        setName(data.profile.name || '');
        setEmail(data.profile.email || '');
      }

      const addrRes = await fetch('/api/addresses');
      if (addrRes.ok) {
        const addrData = await addrRes.json();
        setAddresses(addrData.addresses || []);
      }
    } catch {
      toast('Failed to load profile', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdatingProfile(true);

    try {
      const res = await fetch('/api/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), email: email.trim() }),
      });

      if (res.ok) {
        toast('Profile updated successfully!', 'success');
        clientStore.setAuth(true, name.trim());
      } else {
        toast('Failed to update profile', 'error');
      }
    } catch {
      toast('Error communicating with server', 'error');
    } finally {
      setUpdatingProfile(false);
    }
  };

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/addresses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: addrName,
          phone: addrPhone,
          line1: addrLine1,
          city: addrCity,
          state: addrState,
          pincode: addrPincode,
          latitude: addrLat,
          longitude: addrLng,
        }),
      });

      if (res.ok) {
        toast('Address saved successfully!');
        setShowAddressModal(false);
        fetchProfile();
      } else {
        toast('Failed to save address', 'error');
      }
    } catch {
      toast('Error saving address', 'error');
    }
  };

  const handleDeleteAddress = async (id: string) => {
    try {
      await fetch(`/api/addresses/${id}`, { method: 'DELETE' });
      toast('Address removed.');
      fetchProfile();
    } catch {
      toast('Failed to delete address', 'error');
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      clientStore.setAuth(false, null);
      clientStore.setCartCount(0);
      clientStore.setWishlistCount(0);
      toast('Logged out.');
      router.push('/');
    } catch {
      toast('Failed to log out', 'error');
    }
  };

  if (loading) {
    return (
      <div className="max-w-[900px] mx-auto px-4 py-16 text-center text-xs text-[var(--ink-muted)]">
        Loading account...
      </div>
    );
  }

  return (
    <div className="max-w-[900px] mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-8">
      <Breadcrumbs items={[{ label: 'Account' }]} />

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[var(--line)] pb-6">
        <div>
          <h1 className="font-serif text-3xl sm:text-4xl text-[var(--ink)] m-0">
            My Account
          </h1>
          <span className="text-xs text-[var(--ink-muted)] block mt-1">
            Registered phone: <strong>{profile?.phone}</strong>
          </span>
        </div>

        <Button variant="secondary" size="sm" onClick={handleLogout} className="text-xs">
          <LogOut size={14} className="mr-1.5" /> Log Out
        </Button>
      </div>

      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link
          href="/orders"
          className="p-5 border border-[var(--line)] bg-[var(--surface)] rounded-[2px] flex items-center justify-between hover:border-[var(--ink)] transition-colors no-underline text-inherit"
        >
          <div className="flex items-center gap-3">
            <Package size={20} className="text-[var(--ink)]" />
            <div>
              <span className="font-semibold text-sm block">Orders &amp; Invoices</span>
              <span className="text-xs text-[var(--ink-muted)]">Track past and ongoing deliveries</span>
            </div>
          </div>
          <span className="text-sm font-semibold">&rarr;</span>
        </Link>

        <Link
          href="/wishlist"
          className="p-5 border border-[var(--line)] bg-[var(--surface)] rounded-[2px] flex items-center justify-between hover:border-[var(--ink)] transition-colors no-underline text-inherit"
        >
          <div className="flex items-center gap-3">
            <Heart size={20} className="text-[var(--ink)]" />
            <div>
              <span className="font-semibold text-sm block">Saved Wishlist</span>
              <span className="text-xs text-[var(--ink-muted)]">View and manage saved items</span>
            </div>
          </div>
          <span className="text-sm font-semibold">&rarr;</span>
        </Link>
      </div>

      {/* Edit Profile Info */}
      <section className="p-6 border border-[var(--line)] bg-[var(--surface)] rounded-[2px] space-y-4">
        <h2 className="font-serif text-xl text-[var(--ink)] m-0">Profile Information</h2>
        <form onSubmit={handleUpdateProfile} className="space-y-4 max-w-md">
          <Field label="Full Name" required>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your full name"
              required
            />
          </Field>

          <Field label="Notification Email (Optional)" hint="Used for digital receipts and order updates.">
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
            />
          </Field>

          <Button type="submit" variant="primary" size="md" loading={updatingProfile}>
            Save Changes
          </Button>
        </form>
      </section>

      {/* Saved Addresses */}
      <section className="p-6 border border-[var(--line)] bg-[var(--surface)] rounded-[2px] space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="font-serif text-xl text-[var(--ink)] m-0">Saved Addresses</h2>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => setShowAddressModal(!showAddressModal)}
          >
            {showAddressModal ? 'Cancel' : '+ Add Address'}
          </Button>
        </div>

        {showAddressModal && (
          <form onSubmit={handleAddAddress} className="p-4 border border-[var(--line)] bg-[var(--bg)] rounded-[2px] space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Field label="Name" required>
                <Input value={addrName} onChange={(e) => setAddrName(e.target.value)} required />
              </Field>
              <Field label="Phone" required>
                <Input value={addrPhone} onChange={(e) => setAddrPhone(e.target.value)} required />
              </Field>
            </div>
            <Field label="Address Line" required>
              <Input value={addrLine1} onChange={(e) => setAddrLine1(e.target.value)} required />
            </Field>
            <div className="grid grid-cols-3 gap-2">
              <Field label="City" required>
                <Input value={addrCity} onChange={(e) => setAddrCity(e.target.value)} required />
              </Field>
              <Field label="State" required>
                <Input value={addrState} onChange={(e) => setAddrState(e.target.value)} required />
              </Field>
              <Field label="Pincode" required>
                <Input
                  value={addrPincode}
                  maxLength={6}
                  onChange={(e) => setAddrPincode(e.target.value.replace(/\D/g, ''))}
                  required
                />
              </Field>
            </div>
            <AddressMapPicker
              latitude={addrLat}
              longitude={addrLng}
              onChange={(lat, lng) => {
                setAddrLat(lat);
                setAddrLng(lng);
              }}
            />
            <Button type="submit" variant="primary" size="sm">
              Save Address
            </Button>
          </form>
        )}

        {addresses.length === 0 ? (
          <p className="text-xs text-[var(--ink-muted)] m-0">No saved addresses yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            {addresses.map((a) => (
              <div key={a.id} className="p-4 border border-[var(--line)] rounded-[2px] text-xs space-y-1">
                <span className="font-semibold text-sm text-[var(--ink)] block">{a.name}</span>
                <span className="text-[var(--ink-muted)] block">{a.line1}</span>
                <span className="text-[var(--ink-muted)] block">{a.city}, {a.state} - {a.pincode}</span>
                <span className="text-[var(--ink-muted)] block">Phone: {a.phone}</span>
                <div className="pt-2 flex justify-between items-center">
                  <span className="text-[11px] text-[var(--ink-muted)]">
                    GPS: {Number(a.latitude).toFixed(4)}, {Number(a.longitude).toFixed(4)}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleDeleteAddress(a.id)}
                    className="text-[var(--danger)] underline cursor-pointer"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
