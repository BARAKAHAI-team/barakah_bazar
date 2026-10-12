'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Trash2 } from 'lucide-react';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Button } from '@/components/ui/Button';
import { Price } from '@/components/ui/Price';
import { useToast } from '@/components/ui/Toast';
import { clientStore } from '@/lib/store';

export default function WishlistPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<any[]>([]);

  const fetchWishlist = async () => {
    try {
      const res = await fetch('/api/wishlist');
      if (res.ok) {
        const data = await res.json();
        setProducts(data.products || []);
        clientStore.setWishlistCount((data.products || []).length);
      }
    } catch {
      toast('Failed to load wishlist', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, []);

  const handleRemove = async (productId: string) => {
    try {
      await fetch(`/api/wishlist?productId=${productId}`, { method: 'DELETE' });
      toast('Removed from wishlist');
      fetchWishlist();
    } catch {
      toast('Failed to remove item', 'error');
    }
  };

  if (loading) {
    return (
      <div className="max-w-[1000px] mx-auto px-4 py-16 text-center text-xs text-[var(--ink-muted)]">
        Loading wishlist...
      </div>
    );
  }

  return (
    <div className="max-w-[1000px] mx-auto px-4 sm:px-6 py-6 sm:py-10">
      <Breadcrumbs items={[{ label: 'Wishlist' }]} />

      <h1 className="font-serif text-3xl sm:text-4xl text-[var(--ink)] mt-4 mb-8">
        Your Wishlist ({products.length})
      </h1>

      {products.length === 0 ? (
        <div className="p-12 text-center border border-[var(--line)] bg-[var(--surface)] rounded-[2px]">
          <p className="text-sm text-[var(--ink-muted)] mb-6">You have no items saved in your wishlist.</p>
          <Link href="/">
            <Button variant="primary" size="md">
              Discover Collections
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((prod) => (
            <div
              key={prod.id}
              className="p-4 border border-[var(--line)] bg-[var(--surface)] rounded-[2px] flex flex-col justify-between"
            >
              <div>
                <div className="w-full aspect-[4/3] relative rounded-[2px] overflow-hidden bg-stone-100 border border-[var(--line)] mb-3">
                  {prod.images?.[0]?.storage_path ? (
                    <img
                      src={prod.images[0].storage_path}
                      alt={prod.name}
                      className="w-full h-full object-cover object-center"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center p-3 text-xs text-stone-500 uppercase text-center">
                      {prod.name}
                    </div>
                  )}
                </div>
                <h3 className="font-serif text-base text-[var(--ink)] m-0 line-clamp-1">{prod.name}</h3>
                <p className="text-xs text-[var(--ink-muted)] mt-1 mb-2 line-clamp-1">
                  {prod.short_description}
                </p>
                <Price pricePaise={prod.variants[0].price_paise} size="sm" />
              </div>

              <div className="flex items-center gap-2 mt-4 pt-3 border-t border-[var(--line)]">
                <Link href={`/${prod.category_slug}/${prod.slug}`} className="flex-1">
                  <Button variant="secondary" size="sm" className="w-full">
                    View Product
                  </Button>
                </Link>
                <button
                  type="button"
                  onClick={() => handleRemove(prod.id)}
                  aria-label="Remove item"
                  className="p-2 text-[var(--ink-muted)] hover:text-[var(--danger)] cursor-pointer"
                >
                  <Trash2 size={16} strokeWidth={1.5} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
