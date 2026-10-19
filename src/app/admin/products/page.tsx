'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Package,
  Plus,
  Search,
  Filter,
  Trash2,
  Edit,
  ExternalLink,
  Star,
  CheckCircle2,
  XCircle,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import { CatalogProduct } from '@/lib/catalog/types';

export default function AdminProductsPage() {
  const [products, setProducts] = useState<CatalogProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      let url = '/api/admin/products';
      const params = new URLSearchParams();
      if (search.trim()) params.set('search', search.trim());
      if (categoryFilter) params.set('category', categoryFilter);
      if (params.toString()) url += `?${params.toString()}`;

      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setProducts(data.products || []);
      }
    } catch (err) {
      console.error('Failed to fetch products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [categoryFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchProducts();
  };

  const toggleFeatured = async (product: CatalogProduct) => {
    setUpdatingId(product.id);
    const newFeatured = !product.is_featured;
    try {
      const res = await fetch(`/api/admin/products/${product.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_featured: newFeatured }),
      });
      if (res.ok) {
        setProducts((prev) =>
          prev.map((p) => (p.id === product.id ? { ...p, is_featured: newFeatured } : p))
        );
      }
    } catch (err) {
      alert('Failed to update featured status');
    } finally {
      setUpdatingId(null);
    }
  };

  const toggleActive = async (product: CatalogProduct) => {
    setUpdatingId(product.id);
    const newActive = !product.is_active;
    try {
      const res = await fetch(`/api/admin/products/${product.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: newActive }),
      });
      if (res.ok) {
        setProducts((prev) =>
          prev.map((p) => (p.id === product.id ? { ...p, is_active: newActive } : p))
        );
      }
    } catch (err) {
      alert('Failed to update active status');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDelete = async (product: CatalogProduct) => {
    if (!confirm(`Are you sure you want to delete "${product.name}"?`)) return;
    try {
      const res = await fetch(`/api/admin/products/${product.id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setProducts((prev) => prev.filter((p) => p.id !== product.id));
      } else {
        alert('Failed to delete product');
      }
    } catch {
      alert('Error deleting product');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Title and Add Button */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif font-bold text-2xl sm:text-3xl text-[#16140F] m-0">
            Products & Catalog
          </h1>
          <p className="text-xs sm:text-sm text-[#786F5E] mt-1 m-0">
            Create, update, organize multiple images, optimize SEO, and manage stock inventory.
          </p>
        </div>
        <Link
          href="/admin/products/new"
          className="inline-flex items-center gap-2 bg-[#B98725] hover:bg-[#a6771d] text-white px-5 py-2.5 rounded-md text-xs font-bold tracking-wider uppercase transition-all shadow-md no-underline whitespace-nowrap"
        >
          <Plus size={16} />
          <span>Add New Product</span>
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-[#E8DCC2] shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <form onSubmit={handleSearchSubmit} className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8C8270]" />
          <input
            type="text"
            placeholder="Search by product name or slug..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-[#E8DCC2] rounded-md text-xs text-[#16140F] focus:outline-none focus:border-[#B98725] bg-[#FCFAF5]"
          />
        </form>

        <div className="flex items-center gap-2">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 border border-[#E8DCC2] rounded-md text-xs text-[#16140F] bg-[#FCFAF5] focus:outline-none focus:border-[#B98725]"
          >
            <option value="">All Categories</option>
            <option value="bridal">Bridal Collections</option>
            <option value="naturals">Barakah Naturals</option>
            <option value="coconut-oil">Kerala Pure Coconut Oil</option>
          </select>

          <button
            onClick={fetchProducts}
            className="p-2 border border-[#E8DCC2] rounded-md hover:bg-[#FAF7F0] text-[#786F5E] transition-colors"
            title="Refresh Catalog"
          >
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Catalog Table */}
      <div className="bg-white rounded-xl border border-[#E8DCC2] shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-sm text-[#786F5E]">Loading products catalog...</div>
        ) : products.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <Package size={36} className="mx-auto text-[#C5A880]" />
            <p className="text-sm font-semibold text-[#16140F]">No products found</p>
            <p className="text-xs text-[#786F5E]">Try adjusting your search filter or create a new product.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAF7F0] text-[#786F5E] uppercase tracking-wider border-b border-[#E8DCC2]">
                <tr>
                  <th className="px-5 py-3">Thumbnail</th>
                  <th className="px-5 py-3">Product Name</th>
                  <th className="px-5 py-3">Category</th>
                  <th className="px-5 py-3">Pricing</th>
                  <th className="px-5 py-3">Stock</th>
                  <th className="px-5 py-3 text-center">Featured</th>
                  <th className="px-5 py-3 text-center">Status</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0E8D5]">
                {products.map((prod) => {
                  const thumbnail =
                    prod.thumbnail_url ||
                    prod.images?.find((img) => img.is_primary)?.storage_path ||
                    prod.images?.[0]?.storage_path ||
                    '/images/placeholder.png';
                  const baseVariant = prod.variants?.[0];
                  const price = baseVariant ? `₹${(baseVariant.price_paise / 100).toLocaleString('en-IN')}` : '₹0';
                  const totalStock = prod.variants?.reduce((sum, v) => sum + v.stock, 0) || 0;
                  const isUpdating = updatingId === prod.id;

                  return (
                    <tr key={prod.id} className="hover:bg-[#FCFAF5] transition-colors">
                      {/* Thumbnail */}
                      <td className="px-5 py-3">
                        <div className="relative w-12 h-12 rounded border border-[#E8DCC2] overflow-hidden bg-[#FAF7F0] shrink-0">
                          <img src={thumbnail} alt={prod.name} className="w-full h-full object-cover" />
                          {prod.images && prod.images.length > 1 && (
                            <span className="absolute bottom-0 right-0 bg-[#0F3E2E] text-white text-[9px] px-1 font-bold rounded-tl">
                              +{prod.images.length}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Name & Slug */}
                      <td className="px-5 py-3 max-w-xs">
                        <span className="font-semibold text-[#16140F] block truncate">{prod.name}</span>
                        <span className="text-[11px] text-[#8C8270] font-mono block">/{prod.slug}</span>
                        {prod.badge && (
                          <span className="inline-block mt-1 text-[9px] font-bold uppercase bg-[#B98725]/15 text-[#8F6616] px-1.5 py-0.2 rounded border border-[#B98725]/30">
                            {prod.badge}
                          </span>
                        )}
                      </td>

                      {/* Category */}
                      <td className="px-5 py-3">
                        <span className="capitalize font-medium text-[#554E41] bg-[#FAF7F0] px-2 py-1 rounded border border-[#E8DCC2]/60">
                          {prod.category_slug}
                        </span>
                      </td>

                      {/* Pricing */}
                      <td className="px-5 py-3">
                        <span className="font-bold text-[#16140F]">{price}</span>
                        {prod.variants && prod.variants.length > 1 && (
                          <span className="block text-[10px] text-[#8C8270]">
                            {prod.variants.length} variants
                          </span>
                        )}
                      </td>

                      {/* Stock */}
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`font-semibold ${
                              totalStock <= 0
                                ? 'text-rose-600'
                                : totalStock < 5
                                ? 'text-amber-600'
                                : 'text-emerald-700'
                            }`}
                          >
                            {totalStock} in stock
                          </span>
                          {totalStock < 5 && (
                            <span title="Low inventory">
                              <AlertCircle size={12} className="text-amber-600" />
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Featured Toggle */}
                      <td className="px-5 py-3 text-center">
                        <button
                          onClick={() => toggleFeatured(prod)}
                          disabled={isUpdating}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all ${
                            prod.is_featured
                              ? 'bg-[#B98725] text-white shadow-xs'
                              : 'bg-zinc-100 text-zinc-500 hover:bg-zinc-200'
                          }`}
                          title="Click to toggle featured status on homepage"
                        >
                          <Star size={11} className={prod.is_featured ? 'fill-white' : ''} />
                          <span>{prod.is_featured ? 'Featured' : 'Standard'}</span>
                        </button>
                      </td>

                      {/* Active Status Toggle */}
                      <td className="px-5 py-3 text-center">
                        <button
                          onClick={() => toggleActive(prod)}
                          disabled={isUpdating}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all ${
                            prod.is_active
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-zinc-100 text-zinc-500 hover:bg-zinc-200'
                          }`}
                          title="Click to publish or draft"
                        >
                          {prod.is_active ? <CheckCircle2 size={11} /> : <XCircle size={11} />}
                          <span>{prod.is_active ? 'Active' : 'Draft'}</span>
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/admin/products/${prod.id}`}
                            className="p-1.5 rounded hover:bg-[#FAF7F0] text-[#B98725] transition-colors"
                            title="Edit Product"
                          >
                            <Edit size={15} />
                          </Link>
                          <button
                            onClick={() => handleDelete(prod)}
                            className="p-1.5 rounded hover:bg-rose-50 text-rose-600 transition-colors"
                            title="Delete Product"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
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
