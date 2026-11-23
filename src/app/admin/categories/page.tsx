'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Layers,
  Plus,
  Edit2,
  Trash2,
  ExternalLink,
  CheckCircle2,
  XCircle,
  Search,
  RefreshCw,
  FolderPlus,
  AlertCircle,
  Copy,
  Check,
  Eye,
} from 'lucide-react';

interface CategoryItem {
  id: string;
  slug: string;
  name: string;
  tagline: string | null;
  description: string | null;
  accent: string;
  eyebrow?: string | null;
  imageUrl?: string | null;
  sort_order?: number;
  is_active?: boolean;
  productCount?: number;
  seo_title?: string | null;
  seo_description?: string | null;
}

const PRESET_ACCENTS = [
  { name: 'Antique Gold', color: '#B8892D' },
  { name: 'Heritage Ochre', color: '#8A641A' },
  { name: 'Forest Emerald', color: '#0F3E2E' },
  { name: 'Royal Burgundy', color: '#7A1A28' },
  { name: 'Botanical Plum', color: '#5B1730' },
  { name: 'Deep Midnight', color: '#1A1A17' },
];

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryItem | null>(null);
  const [saving, setSaving] = useState(false);
  const [sqlCopied, setSqlCopied] = useState(false);
  const [toastMsg, setToastMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Form fields
  const [formName, setFormName] = useState('');
  const [formSlug, setFormSlug] = useState('');
  const [formEyebrow, setFormEyebrow] = useState('');
  const [formTagline, setFormTagline] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formAccent, setFormAccent] = useState('#B8892D');
  const [formImageUrl, setFormImageUrl] = useState('');
  const [formSortOrder, setFormSortOrder] = useState(1);
  const [formIsActive, setFormIsActive] = useState(true);
  const [formSeoTitle, setFormSeoTitle] = useState('');
  const [formSeoDesc, setFormSeoDesc] = useState('');

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMsg({ text, type });
    setTimeout(() => setToastMsg(null), 3500);
  };

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/categories');
      const data = await res.json();
      if (data.ok && Array.isArray(data.categories)) {
        setCategories(data.categories);
      } else {
        showToast(data.error?.message || 'Failed to load categories', 'error');
      }
    } catch {
      showToast('Network error while loading categories', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const openCreateModal = () => {
    setEditingCategory(null);
    setFormName('');
    setFormSlug('');
    setFormEyebrow('');
    setFormTagline('');
    setFormDescription('');
    setFormAccent('#B8892D');
    setFormImageUrl('');
    setFormSortOrder(categories.length + 1);
    setFormIsActive(true);
    setFormSeoTitle('');
    setFormSeoDesc('');
    setModalOpen(true);
  };

  const openEditModal = (cat: CategoryItem) => {
    setEditingCategory(cat);
    setFormName(cat.name);
    setFormSlug(cat.slug);
    setFormEyebrow(cat.eyebrow || '');
    setFormTagline(cat.tagline || '');
    setFormDescription(cat.description || '');
    setFormAccent(cat.accent || '#B8892D');
    setFormImageUrl(cat.imageUrl || '');
    setFormSortOrder(cat.sort_order ?? 1);
    setFormIsActive(cat.is_active !== false);
    setFormSeoTitle(cat.seo_title || '');
    setFormSeoDesc(cat.seo_description || '');
    setModalOpen(true);
  };

  const handleNameChange = (name: string) => {
    setFormName(name);
    if (!editingCategory) {
      const generatedSlug = name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      setFormSlug(generatedSlug);
      setFormEyebrow(name.toUpperCase());
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formSlug.trim()) {
      showToast('Name and URL slug are required', 'error');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name: formName.trim(),
        slug: formSlug.trim(),
        eyebrow: formEyebrow.trim() || null,
        tagline: formTagline.trim() || null,
        description: formDescription.trim() || null,
        accent: formAccent,
        imageUrl: formImageUrl.trim() || null,
        sort_order: Number(formSortOrder) || 1,
        is_active: formIsActive,
        seo_title: formSeoTitle.trim() || null,
        seo_description: formSeoDesc.trim() || null,
      };

      let res;
      if (editingCategory) {
        res = await fetch(`/api/admin/categories/${editingCategory.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch('/api/admin/categories', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }

      const data = await res.json();
      if (res.ok && data.ok) {
        showToast(
          editingCategory ? `Category "${formName}" updated!` : `Category "${formName}" created!`,
          'success'
        );
        setModalOpen(false);
        fetchCategories();
        if (typeof window !== 'undefined') {
          try {
            localStorage.removeItem('bz_nav_categories_cache_v4');
          } catch {}
          window.dispatchEvent(new Event('bz_categories_updated'));
        }
      } else {
        showToast(data.error?.message || 'Failed to save category', 'error');
      }
    } catch {
      showToast('Network error while saving category', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (cat: CategoryItem) => {
    if (!confirm(`Are you sure you want to remove the category "${cat.name}"? Products in this collection will remain safe.`)) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/categories/${cat.id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        showToast(`Category "${cat.name}" deleted`, 'success');
        fetchCategories();
        if (typeof window !== 'undefined') {
          try {
            localStorage.removeItem('bz_nav_categories_cache_v4');
          } catch {}
          window.dispatchEvent(new Event('bz_categories_updated'));
        }
      } else {
        showToast(data.error?.message || 'Could not delete category', 'error');
      }
    } catch {
      showToast('Network error while deleting category', 'error');
    }
  };

  const handleToggleActive = async (cat: CategoryItem) => {
    const newStatus = cat.is_active === false ? true : false;
    try {
      const res = await fetch(`/api/admin/categories/${cat.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: newStatus }),
      });
      if (res.ok) {
        setCategories((prev) =>
          prev.map((c) => (c.id === cat.id ? { ...c, is_active: newStatus } : c))
        );
        showToast(`Category is now ${newStatus ? 'Active' : 'Hidden'}`, 'success');
        if (typeof window !== 'undefined') {
          try {
            localStorage.removeItem('bz_nav_categories_cache_v4');
          } catch {}
          window.dispatchEvent(new Event('bz_categories_updated'));
        }
      }
    } catch {
      showToast('Failed to toggle status', 'error');
    }
  };

  const filteredCategories = categories.filter((c) => {
    const q = search.toLowerCase();
    return c.name.toLowerCase().includes(q) || c.slug.toLowerCase().includes(q);
  });

  const sqlCode = `ALTER TABLE public.categories DROP CONSTRAINT IF EXISTS categories_slug_check;`;

  const copySql = () => {
    navigator.clipboard.writeText(sqlCode);
    setSqlCopied(true);
    setTimeout(() => setSqlCopied(false), 2000);
  };

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto">
      {/* Toast Notification */}
      {toastMsg && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-lg shadow-xl text-white text-xs font-semibold flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2 ${
            toastMsg.type === 'success' ? 'bg-emerald-700' : 'bg-rose-700'
          }`}
        >
          {toastMsg.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
          <span>{toastMsg.text}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="p-2 bg-[#B98725]/15 text-[#B98725] rounded-lg">
              <Layers size={22} />
            </span>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#16140F]">
              Categories & Collections
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-[#786F5E] mt-1">
            Manage your storefront collection pages, category slugs, headers, accents, and product assignments.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={fetchCategories}
            className="p-2.5 bg-white border border-[#E8DCC2] text-[#786F5E] hover:text-[#16140F] rounded-lg shadow-2xs hover:bg-[#FAF7F0] transition-colors"
            title="Refresh"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
          <button
            type="button"
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#0F3E2E] hover:bg-[#16503c] text-white rounded-lg text-xs font-bold uppercase tracking-wider shadow-sm transition-all cursor-pointer"
          >
            <Plus size={16} />
            <span>Add Collection</span>
          </button>
        </div>
      </div>

      {/* Database Setup Helper Box */}
      <div className="mb-6 p-4 rounded-xl border border-[#E8DCC2] bg-[#FAF7F0] flex flex-col md:flex-row items-start md:items-center justify-between gap-3 shadow-2xs">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-[#B98725]/10 text-[#8A641A] mt-0.5">
            <AlertCircle size={18} />
          </div>
          <div>
            <h4 className="text-xs font-bold text-[#16140F] uppercase tracking-wider mb-0.5">
              Supabase Dynamic Category Constraint Tip
            </h4>
            <p className="text-xs text-[#786F5E] leading-relaxed m-0">
              Categories added here work instantly in memory. If your Supabase SQL editor has an old check constraint, run this 1-line SQL in your Supabase SQL Editor:
            </p>
            <code className="inline-block mt-1 px-2 py-0.5 bg-white border border-[#E8DCC2] rounded text-[11px] font-mono text-[#0F3E2E]">
              {sqlCode}
            </code>
          </div>
        </div>
        <button
          type="button"
          onClick={copySql}
          className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#E8DCC2] hover:bg-[#F2ECE1] text-[#16140F] rounded-md text-xs font-semibold shadow-2xs transition-colors"
        >
          {sqlCopied ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
          <span>{sqlCopied ? 'Copied SQL!' : 'Copy SQL'}</span>
        </button>
      </div>

      {/* Filter and Search */}
      <div className="mb-6 flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#786F5E]" />
          <input
            type="text"
            placeholder="Search categories by name or slug..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-white border border-[#E8DCC2] rounded-lg text-xs text-[#16140F] focus:outline-none focus:border-[#B98725] shadow-2xs"
          />
        </div>
        <span className="text-xs text-[#786F5E] hidden sm:inline">
          Total: <strong>{filteredCategories.length}</strong> collections
        </span>
      </div>

      {/* Categories Table / Card Grid */}
      <div className="bg-white rounded-xl border border-[#E8DCC2] shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-20 text-center text-[#786F5E] flex flex-col items-center justify-center gap-2">
            <RefreshCw size={24} className="animate-spin text-[#B98725]" />
            <span className="text-xs">Loading collections...</span>
          </div>
        ) : filteredCategories.length === 0 ? (
          <div className="py-16 text-center text-[#786F5E]">
            <FolderPlus size={36} className="mx-auto text-stone-300 mb-2" />
            <p className="text-sm font-semibold text-[#16140F]">No collections found</p>
            <p className="text-xs text-[#786F5E] max-w-sm mx-auto mb-4">
              Get started by creating your first custom collection or adjust your search filter.
            </p>
            <button
              onClick={openCreateModal}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#0F3E2E] text-white rounded-lg text-xs font-bold uppercase tracking-wider"
            >
              <Plus size={14} />
              <span>Create Collection</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAF7F0] border-b border-[#E8DCC2] text-[#786F5E] font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4 w-12 text-center">Order</th>
                  <th className="py-3 px-4">Collection</th>
                  <th className="py-3 px-4">URL Slug</th>
                  <th className="py-3 px-4">Accent</th>
                  <th className="py-3 px-4 text-center">Products</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8DCC2]/60">
                {filteredCategories.map((cat) => (
                  <tr key={cat.id} className="hover:bg-[#FAF7F0]/40 transition-colors">
                    <td className="py-3.5 px-4 text-center font-bold text-stone-400">
                      {cat.sort_order ?? 0}
                    </td>
                    <td className="py-3.5 px-4">
                      <div>
                        {cat.eyebrow && (
                          <span className="text-[9.5px] font-bold tracking-[1.5px] text-[#8A641A] uppercase block mb-0.5">
                            {cat.eyebrow}
                          </span>
                        )}
                        <span className="font-serif font-bold text-sm text-[#16140F] block">
                          {cat.name}
                        </span>
                        {cat.description && (
                          <p className="text-[11px] text-[#786F5E] line-clamp-1 max-w-md m-0 mt-0.5">
                            {cat.description}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <Link
                        href={`/${cat.slug}`}
                        target="_blank"
                        className="font-mono text-[11px] text-[#0F3E2E] hover:text-[#B98725] hover:underline flex items-center gap-1"
                      >
                        <span>/{cat.slug}</span>
                        <ExternalLink size={11} />
                      </Link>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-4 h-4 rounded-full border border-stone-300 shadow-2xs shrink-0"
                          style={{ backgroundColor: cat.accent || '#B8892D' }}
                        />
                        <span className="font-mono text-[10px] text-stone-500">{cat.accent}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <Link
                        href={`/admin/products?category=${cat.slug}`}
                        className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-[#FAF7F0] text-stone-800 border border-[#E8DCC2] hover:bg-[#F2ECE1] transition-colors no-underline"
                      >
                        {cat.productCount ?? 0}
                      </Link>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <button
                        type="button"
                        onClick={() => handleToggleActive(cat)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10.5px] font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                          cat.is_active !== false
                            ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                            : 'bg-stone-200 text-stone-600 hover:bg-stone-300'
                        }`}
                      >
                        {cat.is_active !== false ? (
                          <>
                            <CheckCircle2 size={12} />
                            <span>Active</span>
                          </>
                        ) : (
                          <>
                            <XCircle size={12} />
                            <span>Hidden</span>
                          </>
                        )}
                      </button>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          href={`/${cat.slug}`}
                          target="_blank"
                          className="p-1.5 text-stone-500 hover:text-[#0F3E2E] hover:bg-white rounded-md transition-colors"
                          title="View live collection page"
                        >
                          <Eye size={15} />
                        </Link>
                        <button
                          type="button"
                          onClick={() => openEditModal(cat)}
                          className="p-1.5 text-stone-500 hover:text-[#B98725] hover:bg-white rounded-md transition-colors cursor-pointer"
                          title="Edit collection"
                        >
                          <Edit2 size={15} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(cat)}
                          className="p-1.5 text-stone-500 hover:text-rose-600 hover:bg-white rounded-md transition-colors cursor-pointer"
                          title="Delete collection"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create / Edit Category Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto border border-[#E8DCC2] shadow-2xl">
            <div className="p-6 border-b border-[#E8DCC2] flex items-center justify-between sticky top-0 bg-white z-10">
              <div>
                <h3 className="font-serif text-lg font-bold text-[#16140F]">
                  {editingCategory ? 'Edit Collection' : 'Create New Collection'}
                </h3>
                <p className="text-xs text-[#786F5E] m-0 mt-0.5">
                  Configure the collection name, URL route, luxury styling, and description.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="text-stone-400 hover:text-stone-700 p-1 rounded-md"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4">
              {/* Name & Slug */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#16140F] uppercase tracking-wider mb-1">
                    Collection Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Barakah Luxury Attars"
                    value={formName}
                    onChange={(e) => handleNameChange(e.target.value)}
                    className="w-full px-3 py-2 border border-[#E8DCC2] rounded-lg text-xs text-[#16140F] focus:outline-none focus:border-[#B98725]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#16140F] uppercase tracking-wider mb-1">
                    URL Route Slug *
                  </label>
                  <div className="flex">
                    <span className="px-2.5 py-2 bg-[#FAF7F0] border border-r-0 border-[#E8DCC2] text-xs text-[#786F5E] rounded-l-lg font-mono">
                      /
                    </span>
                    <input
                      type="text"
                      required
                      placeholder="e.g. attars"
                      value={formSlug}
                      onChange={(e) => setFormSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                      className="w-full px-3 py-2 border border-[#E8DCC2] rounded-r-lg text-xs font-mono text-[#16140F] focus:outline-none focus:border-[#B98725]"
                    />
                  </div>
                </div>
              </div>

              {/* Eyebrow Label & Sort Order */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#16140F] uppercase tracking-wider mb-1">
                    Eyebrow / Category Tag
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. PURE ESSENTIAL OILS"
                    value={formEyebrow}
                    onChange={(e) => setFormEyebrow(e.target.value)}
                    className="w-full px-3 py-2 border border-[#E8DCC2] rounded-lg text-xs text-[#16140F] focus:outline-none focus:border-[#B98725]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#16140F] uppercase tracking-wider mb-1">
                    Display Order
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formSortOrder}
                    onChange={(e) => setFormSortOrder(parseInt(e.target.value, 10) || 1)}
                    className="w-full px-3 py-2 border border-[#E8DCC2] rounded-lg text-xs text-[#16140F] focus:outline-none focus:border-[#B98725]"
                  />
                </div>
              </div>

              {/* Tagline */}
              <div>
                <label className="block text-xs font-bold text-[#16140F] uppercase tracking-wider mb-1">
                  Tagline (Subtitle)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Curated royal botanical fragrances and non-alcoholic perfumes"
                  value={formTagline}
                  onChange={(e) => setFormTagline(e.target.value)}
                  className="w-full px-3 py-2 border border-[#E8DCC2] rounded-lg text-xs text-[#16140F] focus:outline-none focus:border-[#B98725]"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-[#16140F] uppercase tracking-wider mb-1">
                  Editorial Description
                </label>
                <textarea
                  rows={2}
                  placeholder="Appears on the collection header page and SEO descriptions..."
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-[#E8DCC2] rounded-lg text-xs text-[#16140F] focus:outline-none focus:border-[#B98725]"
                />
              </div>

              {/* Accent Color Preset Picker */}
              <div>
                <label className="block text-xs font-bold text-[#16140F] uppercase tracking-wider mb-1.5">
                  Collection Accent Color
                </label>
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  {PRESET_ACCENTS.map((item) => (
                    <button
                      key={item.color}
                      type="button"
                      onClick={() => setFormAccent(item.color)}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-all ${
                        formAccent === item.color
                          ? 'border-[#0F3E2E] bg-[#FAF7F0] font-bold text-[#0F3E2E] ring-1 ring-[#0F3E2E]'
                          : 'border-stone-200 text-stone-600 hover:border-stone-400'
                      }`}
                    >
                      <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                      <span>{item.name}</span>
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={formAccent}
                    onChange={(e) => setFormAccent(e.target.value)}
                    className="w-8 h-8 rounded border border-[#E8DCC2] cursor-pointer p-0.5"
                  />
                  <input
                    type="text"
                    value={formAccent}
                    onChange={(e) => setFormAccent(e.target.value)}
                    className="w-28 px-2 py-1 border border-[#E8DCC2] rounded text-xs font-mono"
                  />
                </div>
              </div>

              {/* Banner Image URL */}
              <div>
                <label className="block text-xs font-bold text-[#16140F] uppercase tracking-wider mb-1">
                  Collection Hero Image (Optional)
                </label>
                <input
                  type="text"
                  placeholder="/images/home/products/oil_500ml_a.jpg or Cloudinary URL"
                  value={formImageUrl}
                  onChange={(e) => setFormImageUrl(e.target.value)}
                  className="w-full px-3 py-2 border border-[#E8DCC2] rounded-lg text-xs font-mono text-[#16140F] focus:outline-none focus:border-[#B98725]"
                />
              </div>

              {/* Is Active Toggle */}
              <div className="pt-2">
                <label className="inline-flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formIsActive}
                    onChange={(e) => setFormIsActive(e.target.checked)}
                    className="w-4 h-4 text-[#0F3E2E] rounded border-[#E8DCC2] focus:ring-[#B98725]"
                  />
                  <span className="text-xs font-bold text-[#16140F]">
                    Publish on Storefront (Active)
                  </span>
                </label>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-[#E8DCC2] flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 border border-[#E8DCC2] hover:bg-[#FAF7F0] text-stone-700 rounded-lg text-xs font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 bg-[#0F3E2E] hover:bg-[#16503c] text-white rounded-lg text-xs font-bold uppercase tracking-wider shadow-sm transition-all flex items-center gap-2"
                >
                  {saving && <RefreshCw size={13} className="animate-spin" />}
                  <span>{editingCategory ? 'Update Collection' : 'Create Collection'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
