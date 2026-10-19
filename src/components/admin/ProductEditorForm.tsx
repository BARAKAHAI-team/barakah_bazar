'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Package,
  Layers,
  Image as ImageIcon,
  Globe,
  Sparkles,
  Plus,
  Trash2,
  Upload,
  Check,
  Star,
  ArrowLeft,
  Save,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import { CatalogProduct } from '@/lib/catalog/types';

interface FormVariant {
  id: string;
  label: string;
  sku: string;
  priceRupees: number;
  comparePriceRupees: number | string;
  stock: number;
  netQuantity: number | string;
  netUnit: 'g' | 'ml' | 'piece';
}

interface ProductFormProps {
  initialProduct?: CatalogProduct | null;
  isEditing?: boolean;
}

export function ProductEditorForm({ initialProduct, isEditing = false }: ProductFormProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'basic' | 'variants' | 'media' | 'seo' | 'visibility'>('basic');
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState(initialProduct?.name || '');
  const [slug, setSlug] = useState(initialProduct?.slug || '');
  const [slugCustomized, setSlugCustomized] = useState(isEditing);
  const [categorySlug, setCategorySlug] = useState(initialProduct?.category_slug || 'bridal');
  const [badge, setBadge] = useState(initialProduct?.badge || '');
  const [shortDescription, setShortDescription] = useState(initialProduct?.short_description || '');
  const [description, setDescription] = useState(initialProduct?.description || '');

  // Featured and Active
  const [isFeatured, setIsFeatured] = useState(initialProduct?.is_featured || false);
  const [isActive, setIsActive] = useState(initialProduct?.is_active ?? true);

  // SEO
  const [seoTitle, setSeoTitle] = useState(initialProduct?.seo_title || '');
  const [seoDescription, setSeoDescription] = useState(initialProduct?.seo_description || '');
  const [seoKeywords, setSeoKeywords] = useState(initialProduct?.seo_keywords?.join(', ') || '');

  // Variants State
  const [variants, setVariants] = useState<FormVariant[]>(
    initialProduct?.variants?.map((v) => ({
      id: v.id,
      label: v.label,
      sku: v.sku,
      priceRupees: v.price_paise / 100,
      comparePriceRupees: v.compare_at_price_paise ? v.compare_at_price_paise / 100 : '',
      stock: v.stock,
      netQuantity: v.net_quantity || '',
      netUnit: (v.net_unit as 'g' | 'ml' | 'piece') || 'piece',
    })) || [
      {
        id: `var_${Date.now()}_1`,
        label: 'Default',
        sku: 'SKU-001',
        priceRupees: 999,
        comparePriceRupees: '',
        stock: 50,
        netQuantity: '',
        netUnit: 'piece',
      },
    ]
  );

  // Media / Gallery State
  const [images, setImages] = useState(
    initialProduct?.images?.map((img) => ({
      id: img.id,
      storage_path: img.storage_path || '',
      cloudinary_public_id: img.cloudinary_public_id || null,
      alt: img.alt || '',
      is_primary: img.is_primary,
      sort_order: img.sort_order,
    })) || []
  );

  const [imageUrlInput, setImageUrlInput] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);

  // Auto-generate slug when name changes
  const handleNameChange = (val: string) => {
    setName(val);
    if (!slugCustomized) {
      const generated = val
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
      setSlug(generated);
    }
  };

  // Add / Remove Variant
  const addVariant = () => {
    setVariants((prev) => [
      ...prev,
      {
        id: `var_${Date.now()}_${prev.length + 1}`,
        label: `Option ${prev.length + 1}`,
        sku: `${slug.toUpperCase() || 'PROD'}-${prev.length + 1}`,
        priceRupees: 999,
        comparePriceRupees: '',
        stock: 25,
        netQuantity: '',
        netUnit: 'piece',
      },
    ]);
  };

  const removeVariant = (idx: number) => {
    if (variants.length <= 1) {
      alert('Product must have at least one variant.');
      return;
    }
    setVariants((prev) => prev.filter((_, i) => i !== idx));
  };

  // Cloudinary Direct Upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingImage(true);
    try {
      // 1. Get signature from backend
      const sigRes = await fetch('/api/admin/uploads/signature', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ folder: 'barakah_products' }),
      });
      const sigData = await sigRes.json();

      for (let i = 0; i < files.length; i++) {
        const file = files[i];

        // If Cloudinary credentials are mock/placeholder in dev mode, create simulated image
        if (sigData.isMock) {
          const fakeUrl = URL.createObjectURL(file);
          const newImg = {
            id: `img_${Date.now()}_${i}`,
            storage_path: fakeUrl,
            cloudinary_public_id: `dev_${file.name}`,
            alt: name || file.name.split('.')[0],
            is_primary: images.length === 0 && i === 0,
            sort_order: images.length + i,
          };
          setImages((prev) => [...prev, newImg]);
          continue;
        }

        // Real upload to Cloudinary API
        const formData = new FormData();
        formData.append('file', file);

        if (sigData.uploadPreset) {
          formData.append('upload_preset', sigData.uploadPreset);
        } else {
          formData.append('api_key', sigData.apiKey);
          formData.append('timestamp', sigData.timestamp);
          formData.append('signature', sigData.signature);
          formData.append('folder', sigData.folder);
        }

        const uploadRes = await fetch(
          `https://api.cloudinary.com/v1_1/${sigData.cloudName}/image/upload`,
          {
            method: 'POST',
            body: formData,
          }
        );
        const uploaded = await uploadRes.json();

        if (uploaded.error) {
          throw new Error(uploaded.error.message || 'Cloudinary upload error');
        }

        if (uploaded.secure_url) {
          setImages((prev) => [
            ...prev,
            {
              id: `img_${Date.now()}_${i}`,
              storage_path: uploaded.secure_url,
              cloudinary_public_id: uploaded.public_id,
              alt: name || 'Barakah Product',
              is_primary: prev.length === 0 && i === 0,
              sort_order: prev.length + i,
            },
          ]);
        }
      }
    } catch (err: any) {
      console.error('Upload failed:', err);
      alert(`Cloudinary upload failed: ${err.message || 'Unknown error'}.\n\nYou can also enter an image URL directly.`);
    } finally {
      setUploadingImage(false);
      e.target.value = '';
    }
  };

  const addManualImageUrl = () => {
    if (!imageUrlInput.trim()) return;
    setImages((prev) => [
      ...prev,
      {
        id: `img_${Date.now()}`,
        storage_path: imageUrlInput.trim(),
        cloudinary_public_id: null,
        alt: name || 'Product image',
        is_primary: prev.length === 0,
        sort_order: prev.length,
      },
    ]);
    setImageUrlInput('');
  };

  const setPrimaryThumbnail = (idx: number) => {
    setImages((prev) =>
      prev.map((img, i) => ({
        ...img,
        is_primary: i === idx,
      }))
    );
  };

  const removeImage = (idx: number) => {
    setImages((prev) => {
      const filtered = prev.filter((_, i) => i !== idx);
      // Ensure at least one is primary if any exist
      if (filtered.length > 0 && !filtered.some((img) => img.is_primary)) {
        filtered[0].is_primary = true;
      }
      return filtered;
    });
  };

  // Form Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!name.trim()) {
      setErrorMsg('Product name is required.');
      setActiveTab('basic');
      return;
    }
    if (!slug.trim()) {
      setErrorMsg('Product slug is required.');
      setActiveTab('basic');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name,
        slug,
        category_slug: categorySlug,
        badge: badge.trim() || null,
        short_description: shortDescription.trim() || null,
        description: description.trim() || null,
        is_featured: isFeatured,
        is_active: isActive,
        seo_title: seoTitle.trim() || null,
        seo_description: seoDescription.trim() || null,
        seo_keywords: seoKeywords
          ? seoKeywords
              .split(',')
              .map((k) => k.trim())
              .filter(Boolean)
          : [],
        images: images.map((img, i) => ({
          storage_path: img.storage_path,
          cloudinary_public_id: img.cloudinary_public_id,
          alt: img.alt || name,
          sort_order: i,
          is_primary: !!img.is_primary,
        })),
        variants: variants.map((v) => ({
          label: v.label,
          sku: v.sku,
          price_paise: Math.round(Number(v.priceRupees) * 100),
          compare_at_price_paise: v.comparePriceRupees
            ? Math.round(Number(v.comparePriceRupees) * 100)
            : null,
          stock: Number(v.stock) || 0,
          net_quantity: v.netQuantity ? Number(v.netQuantity) : null,
          net_unit: (v.netUnit as any) || null,
          option_values: { Label: v.label },
        })),
      };

      const url = isEditing && initialProduct
        ? `/api/admin/products/${initialProduct.id}`
        : '/api/admin/products';
      const method = isEditing ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error?.message || 'Failed to save product');
      }

      router.push('/admin/products');
      router.refresh();
    } catch (err: any) {
      setErrorMsg(err.message || 'Error saving product');
    } finally {
      setSaving(false);
    }
  };

  const effectivePrimaryImage =
    images.find((img) => img.is_primary)?.storage_path ||
    images[0]?.storage_path ||
    '/images/placeholder.png';

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Top Bar with Navigation and Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-[#E8DCC2]">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.push('/admin/products')}
            className="p-2 rounded-md hover:bg-[#E8DCC2]/40 text-[#786F5E] transition-colors"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="font-serif font-bold text-2xl text-[#16140F] m-0">
              {isEditing ? `Edit: ${initialProduct?.name}` : 'Create New Product'}
            </h1>
            <p className="text-xs text-[#786F5E] mt-0.5 m-0">
              {isEditing ? `ID: ${initialProduct?.id}` : 'Fill details below to add item to store catalog'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => router.push('/admin/products')}
            className="flex-1 sm:flex-initial px-4 py-2 border border-[#E8DCC2] rounded-md text-xs font-semibold text-[#554E41] hover:bg-[#FAF7F0] transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 bg-[#B98725] hover:bg-[#a6771d] text-white px-6 py-2 rounded-md text-xs font-bold uppercase tracking-wider shadow-md transition-all disabled:opacity-50"
          >
            <Save size={15} />
            <span>{saving ? 'Saving...' : 'Save Product'}</span>
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-md text-xs flex items-center gap-2">
          <AlertCircle size={16} className="shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Tab Selector Navigation */}
      <div className="flex overflow-x-auto border-b border-[#E8DCC2] gap-2 pb-0">
        {[
          { id: 'basic', label: '1. Basic Info', icon: Package },
          { id: 'variants', label: '2. Pricing & Variants', icon: Layers },
          { id: 'media', label: '3. Media & Thumbnail', icon: ImageIcon },
          { id: 'seo', label: '4. SEO & Preview', icon: Globe },
          { id: 'visibility', label: '5. Merchandising', icon: Sparkles },
        ].map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 border-b-2 text-xs font-bold tracking-wider uppercase transition-all whitespace-nowrap ${
                active
                  ? 'border-[#B98725] text-[#B98725] bg-[#B98725]/5'
                  : 'border-transparent text-[#786F5E] hover:text-[#16140F]'
              }`}
            >
              <Icon size={14} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ============================================================== */}
      {/* TAB 1: BASIC INFORMATION */}
      {/* ============================================================== */}
      {activeTab === 'basic' && (
        <div className="bg-white p-6 rounded-xl border border-[#E8DCC2] shadow-sm space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-[#16140F] uppercase tracking-wider mb-1">
                Product Title *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="e.g. Royal Emerald Bridal Suit"
                className="w-full px-3 py-2 border border-[#E8DCC2] rounded-md text-sm text-[#16140F] focus:outline-none focus:border-[#B98725] bg-[#FCFAF5]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#16140F] uppercase tracking-wider mb-1">
                URL Slug *
              </label>
              <div className="flex items-center">
                <span className="px-3 py-2 bg-[#FAF7F0] border border-r-0 border-[#E8DCC2] text-xs text-[#786F5E] rounded-l-md">
                  /shop/{categorySlug}/
                </span>
                <input
                  type="text"
                  required
                  value={slug}
                  onChange={(e) => {
                    setSlugCustomized(true);
                    setSlug(e.target.value);
                  }}
                  placeholder="royal-emerald-bridal-suit"
                  className="w-full px-3 py-2 border border-[#E8DCC2] rounded-r-md text-sm text-[#16140F] font-mono focus:outline-none focus:border-[#B98725] bg-[#FCFAF5]"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-[#16140F] uppercase tracking-wider mb-1">
                Store Category *
              </label>
              <select
                value={categorySlug}
                onChange={(e) => setCategorySlug(e.target.value as any)}
                className="w-full px-3 py-2 border border-[#E8DCC2] rounded-md text-sm text-[#16140F] focus:outline-none focus:border-[#B98725] bg-[#FCFAF5]"
              >
                <option value="bridal">Barakah Bridal Collections</option>
                <option value="naturals">Barakah Naturals</option>
                <option value="coconut-oil">Barakah Kerala Pure Coconut Oil</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#16140F] uppercase tracking-wider mb-1">
                Product Badge (Optional)
              </label>
              <input
                type="text"
                value={badge}
                onChange={(e) => setBadge(e.target.value)}
                placeholder="BESTSELLER, NEW, 20% OFF, LIMITED"
                className="w-full px-3 py-2 border border-[#E8DCC2] rounded-md text-sm text-[#16140F] focus:outline-none focus:border-[#B98725] bg-[#FCFAF5]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#16140F] uppercase tracking-wider mb-1">
              Short Description (Catalog Hover & WhatsApp Preview)
            </label>
            <input
              type="text"
              value={shortDescription}
              onChange={(e) => setShortDescription(e.target.value)}
              placeholder="Brief 1-sentence highlight of the item"
              className="w-full px-3 py-2 border border-[#E8DCC2] rounded-md text-sm text-[#16140F] focus:outline-none focus:border-[#B98725] bg-[#FCFAF5]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#16140F] uppercase tracking-wider mb-1">
              Full Product Description
            </label>
            <textarea
              rows={5}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detailed product composition, craftsmanship details, dimensions, and usage instructions..."
              className="w-full px-3 py-2 border border-[#E8DCC2] rounded-md text-sm text-[#16140F] focus:outline-none focus:border-[#B98725] bg-[#FCFAF5]"
            />
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 2: PRICING & VARIANTS */}
      {/* ============================================================== */}
      {activeTab === 'variants' && (
        <div className="bg-white p-6 rounded-xl border border-[#E8DCC2] shadow-sm space-y-5">
          <div className="flex items-center justify-between pb-2 border-b border-[#E8DCC2]">
            <div>
              <h3 className="font-serif font-bold text-base text-[#16140F] m-0">
                Product Variants & Inventory
              </h3>
              <p className="text-xs text-[#786F5E] mt-0.5 m-0">
                Define sizes, pack volumes, SKU codes, prices, and stock units.
              </p>
            </div>
            <button
              type="button"
              onClick={addVariant}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#0F3E2E] text-white rounded text-xs font-bold uppercase tracking-wider hover:bg-[#16503c] transition-colors"
            >
              <Plus size={14} />
              <span>Add Variant</span>
            </button>
          </div>

          <div className="space-y-4">
            {variants.map((variant, idx) => (
              <div
                key={variant.id}
                className="p-4 border border-[#E8DCC2] rounded-lg bg-[#FCFAF5] space-y-3 relative group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#B98725] uppercase tracking-wider">
                    Variant #{idx + 1}
                  </span>
                  {variants.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeVariant(idx)}
                      className="text-rose-600 hover:text-rose-800 p-1 rounded"
                      title="Remove variant"
                    >
                      <Trash2 size={15} />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-[#554E41] uppercase tracking-wider mb-1">
                      Label / Option *
                    </label>
                    <input
                      type="text"
                      required
                      value={variant.label}
                      onChange={(e) => {
                        const val = e.target.value;
                        setVariants((prev) =>
                          prev.map((v, i) => (i === idx ? { ...v, label: val } : v))
                        );
                      }}
                      placeholder="e.g. 500 ml or Size M"
                      className="w-full px-2.5 py-1.5 border border-[#E8DCC2] rounded text-xs bg-white text-[#16140F]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-[#554E41] uppercase tracking-wider mb-1">
                      SKU Code *
                    </label>
                    <input
                      type="text"
                      required
                      value={variant.sku}
                      onChange={(e) => {
                        const val = e.target.value;
                        setVariants((prev) =>
                          prev.map((v, i) => (i === idx ? { ...v, sku: val } : v))
                        );
                      }}
                      placeholder="e.g. BZ-OIL-500"
                      className="w-full px-2.5 py-1.5 border border-[#E8DCC2] rounded text-xs bg-white font-mono text-[#16140F]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-[#554E41] uppercase tracking-wider mb-1">
                      Selling Price (₹) *
                    </label>
                    <input
                      type="number"
                      required
                      min={1}
                      value={variant.priceRupees}
                      onChange={(e) => {
                        const val = e.target.value;
                        setVariants((prev) =>
                          prev.map((v, i) => (i === idx ? { ...v, priceRupees: Number(val) } : v))
                        );
                      }}
                      placeholder="399"
                      className="w-full px-2.5 py-1.5 border border-[#E8DCC2] rounded text-xs bg-white font-semibold text-[#16140F]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-[#554E41] uppercase tracking-wider mb-1">
                      Compare Price / MRP (₹)
                    </label>
                    <input
                      type="number"
                      value={variant.comparePriceRupees}
                      onChange={(e) => {
                        const val = e.target.value;
                        setVariants((prev) =>
                          prev.map((v, i) =>
                            i === idx ? { ...v, comparePriceRupees: val ? Number(val) : '' } : v
                          )
                        );
                      }}
                      placeholder="499"
                      className="w-full px-2.5 py-1.5 border border-[#E8DCC2] rounded text-xs bg-white text-[#786F5E]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1 border-t border-[#E8DCC2]/50">
                  <div>
                    <label className="block text-[11px] font-semibold text-[#554E41] uppercase tracking-wider mb-1">
                      Inventory Stock *
                    </label>
                    <input
                      type="number"
                      required
                      min={0}
                      value={variant.stock}
                      onChange={(e) => {
                        const val = e.target.value;
                        setVariants((prev) =>
                          prev.map((v, i) => (i === idx ? { ...v, stock: Number(val) } : v))
                        );
                      }}
                      className="w-full px-2.5 py-1.5 border border-[#E8DCC2] rounded text-xs bg-white font-bold text-emerald-800"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-[#554E41] uppercase tracking-wider mb-1">
                      Net Quantity
                    </label>
                    <input
                      type="number"
                      value={variant.netQuantity}
                      onChange={(e) => {
                        const val = e.target.value;
                        setVariants((prev) =>
                          prev.map((v, i) =>
                            i === idx ? { ...v, netQuantity: val ? Number(val) : '' } : v
                          )
                        );
                      }}
                      placeholder="500"
                      className="w-full px-2.5 py-1.5 border border-[#E8DCC2] rounded text-xs bg-white text-[#16140F]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-[#554E41] uppercase tracking-wider mb-1">
                      Unit
                    </label>
                    <select
                      value={variant.netUnit}
                      onChange={(e) => {
                        const val = e.target.value as 'g' | 'ml' | 'piece';
                        setVariants((prev) =>
                          prev.map((v, i) => (i === idx ? { ...v, netUnit: val } : v))
                        );
                      }}
                      className="w-full px-2.5 py-1.5 border border-[#E8DCC2] rounded text-xs bg-white text-[#16140F]"
                    >
                      <option value="piece">piece</option>
                      <option value="ml">ml</option>
                      <option value="g">g</option>
                    </select>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 3: MEDIA & THUMBNAIL (CLOUDINARY) */}
      {/* ============================================================== */}
      {activeTab === 'media' && (
        <div className="bg-white p-6 rounded-xl border border-[#E8DCC2] shadow-sm space-y-6">
          <div>
            <h3 className="font-serif font-bold text-base text-[#16140F] m-0">
              Media Gallery & Cloudinary CDN
            </h3>
            <p className="text-xs text-[#786F5E] mt-0.5 m-0">
              Upload multiple images directly to Cloudinary. Designate one image as the primary thumbnail.
            </p>
          </div>

          {/* Cloudinary File Dropzone */}
          <div className="border-2 border-dashed border-[#B98725]/60 bg-[#FAF7F0] p-6 rounded-xl text-center space-y-3">
            <Upload size={32} className="mx-auto text-[#B98725]" />
            <div>
              <p className="text-xs font-bold text-[#16140F] uppercase tracking-wider">
                Upload Product Photos to Cloudinary
              </p>
              <p className="text-[11px] text-[#786F5E] mt-0.5">
                Supports JPG, PNG, WEBP. Images are automatically transformed to WebP/AVIF with zero storage impact on database.
              </p>
            </div>
            <label className="inline-flex items-center gap-2 bg-[#0F3E2E] hover:bg-[#16503c] text-white px-4 py-2 rounded-md text-xs font-bold uppercase tracking-wider cursor-pointer shadow-sm transition-all">
              <span>{uploadingImage ? 'Uploading...' : 'Choose Files to Upload'}</span>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileUpload}
                disabled={uploadingImage}
                className="hidden"
              />
            </label>
          </div>

          {/* Or Paste URL */}
          <div className="flex gap-2">
            <input
              type="url"
              placeholder="Or paste an image URL directly (e.g. https://...)..."
              value={imageUrlInput}
              onChange={(e) => setImageUrlInput(e.target.value)}
              className="flex-1 px-3 py-2 border border-[#E8DCC2] rounded-md text-xs bg-[#FCFAF5] text-[#16140F]"
            />
            <button
              type="button"
              onClick={addManualImageUrl}
              className="px-4 py-2 bg-[#B98725] text-white rounded-md text-xs font-bold uppercase tracking-wider hover:bg-[#a6771d] transition-colors"
            >
              Add URL
            </button>
          </div>

          {/* Image Cards Grid with Primary Selector */}
          <div>
            <span className="text-xs font-bold text-[#16140F] uppercase tracking-wider block mb-3">
              Gallery Images ({images.length}) &mdash; Select Primary Thumbnail
            </span>

            {images.length === 0 ? (
              <div className="p-8 border border-[#E8DCC2] rounded-lg text-center text-xs text-[#786F5E] bg-[#FCFAF5]">
                No images added yet. Upload files or paste image URLs above.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {images.map((img, idx) => (
                  <div
                    key={img.id}
                    className={`rounded-lg border overflow-hidden bg-white shadow-sm transition-all relative ${
                      img.is_primary
                        ? 'border-[#B98725] ring-2 ring-[#B98725]/30'
                        : 'border-[#E8DCC2]'
                    }`}
                  >
                    <div className="h-44 bg-[#FAF7F0] relative overflow-hidden flex items-center justify-center">
                      <img
                        src={img.storage_path}
                        alt={img.alt || 'Preview'}
                        className="w-full h-full object-cover"
                      />
                      {img.is_primary && (
                        <div className="absolute top-2 left-2 bg-[#B98725] text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-sm flex items-center gap-1 uppercase tracking-wider">
                          <Star size={11} className="fill-white" />
                          <span>Thumbnail</span>
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={() => removeImage(idx)}
                        className="absolute top-2 right-2 bg-black/60 hover:bg-rose-700 text-white p-1 rounded-full transition-colors"
                        title="Remove image"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>

                    <div className="p-3 space-y-2">
                      <button
                        type="button"
                        onClick={() => setPrimaryThumbnail(idx)}
                        className={`w-full py-1 px-2 rounded text-[11px] font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors ${
                          img.is_primary
                            ? 'bg-[#B98725]/15 text-[#8F6616] border border-[#B98725]/40'
                            : 'bg-[#FAF7F0] text-[#554E41] hover:bg-[#E8DCC2]/50'
                        }`}
                      >
                        {img.is_primary ? <Check size={12} /> : null}
                        <span>{img.is_primary ? 'Primary Thumbnail' : 'Set as Thumbnail'}</span>
                      </button>

                      <div>
                        <label className="block text-[10px] font-semibold text-[#786F5E] uppercase mb-0.5">
                          Image Alt Text (SEO)
                        </label>
                        <input
                          type="text"
                          value={img.alt}
                          onChange={(e) => {
                            const val = e.target.value;
                            setImages((prev) =>
                              prev.map((item, i) => (i === idx ? { ...item, alt: val } : item))
                            );
                          }}
                          placeholder="e.g. Royal emerald suit front angle"
                          className="w-full px-2 py-1 border border-[#E8DCC2] rounded text-[11px] bg-[#FCFAF5]"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 4: SEO & GOOGLE PREVIEW */}
      {/* ============================================================== */}
      {activeTab === 'seo' && (
        <div className="bg-white p-6 rounded-xl border border-[#E8DCC2] shadow-sm space-y-6">
          <div>
            <h3 className="font-serif font-bold text-base text-[#16140F] m-0">
              Search Engine Optimization (SEO) & Google Preview
            </h3>
            <p className="text-xs text-[#786F5E] mt-0.5 m-0">
              Customize meta tags to rank higher on Google search results and WhatsApp social card previews.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-xs font-bold text-[#16140F] uppercase tracking-wider">
                  SEO Meta Title
                </label>
                <span
                  className={`text-[11px] font-mono ${
                    seoTitle.length > 60 ? 'text-rose-600 font-bold' : 'text-[#786F5E]'
                  }`}
                >
                  {seoTitle.length}/60 characters
                </span>
              </div>
              <input
                type="text"
                value={seoTitle}
                onChange={(e) => setSeoTitle(e.target.value)}
                placeholder={name ? `${name} | BarakahBazaar` : 'Buy Authentic Coconut Oil | BarakahBazaar'}
                className="w-full px-3 py-2 border border-[#E8DCC2] rounded-md text-sm text-[#16140F] bg-[#FCFAF5]"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-xs font-bold text-[#16140F] uppercase tracking-wider">
                  SEO Meta Description
                </label>
                <span
                  className={`text-[11px] font-mono ${
                    seoDescription.length > 160 ? 'text-rose-600 font-bold' : 'text-[#786F5E]'
                  }`}
                >
                  {seoDescription.length}/160 characters
                </span>
              </div>
              <textarea
                rows={3}
                value={seoDescription}
                onChange={(e) => setSeoDescription(e.target.value)}
                placeholder="High-converting snippet describing the product for search engine users..."
                className="w-full px-3 py-2 border border-[#E8DCC2] rounded-md text-sm text-[#16140F] bg-[#FCFAF5]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#16140F] uppercase tracking-wider mb-1">
                Target Keywords (Comma-separated)
              </label>
              <input
                type="text"
                value={seoKeywords}
                onChange={(e) => setSeoKeywords(e.target.value)}
                placeholder="coconut oil, cold pressed, edible oil, virgin oil"
                className="w-full px-3 py-2 border border-[#E8DCC2] rounded-md text-sm text-[#16140F] bg-[#FCFAF5]"
              />
            </div>
          </div>

          {/* Live Google SERP Card Preview */}
          <div className="pt-4 border-t border-[#E8DCC2] space-y-2">
            <span className="text-xs font-bold text-[#16140F] uppercase tracking-wider flex items-center gap-1.5">
              <Globe size={14} className="text-emerald-700" />
              <span>Live Google Search Snippet Preview</span>
            </span>

            <div className="p-4 bg-[#F8F9FA] border border-[#DADCE0] rounded-xl font-sans max-w-2xl space-y-1">
              <div className="flex items-center gap-2 text-xs text-[#202124]">
                <div className="w-5 h-5 rounded-full bg-[#0F3E2E] flex items-center justify-center text-[10px] text-[#C5A880] font-bold">
                  B
                </div>
                <div>
                  <span className="font-medium">BarakahBazaar</span>
                  <span className="text-[#5F6368] font-mono text-[11px] block truncate">
                    https://barakahbazaar.com › shop › {categorySlug} › {slug || 'product-slug'}
                  </span>
                </div>
              </div>

              <h4 className="text-base font-medium text-[#1a0dab] hover:underline cursor-pointer m-0 pt-1">
                {seoTitle || (name ? `${name} | BarakahBazaar` : 'BarakahBazaar Product Title')}
              </h4>

              <p className="text-xs text-[#4d5156] leading-relaxed m-0">
                {seoDescription ||
                  shortDescription ||
                  'Discover authentic luxury products handcrafted with barakah. Fast delivery across India.'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 5: MERCHANDISING & VISIBILITY */}
      {/* ============================================================== */}
      {activeTab === 'visibility' && (
        <div className="bg-white p-6 rounded-xl border border-[#E8DCC2] shadow-sm space-y-6">
          <div>
            <h3 className="font-serif font-bold text-base text-[#16140F] m-0">
              Merchandising & Storefront Visibility
            </h3>
            <p className="text-xs text-[#786F5E] mt-0.5 m-0">
              Control where and how this product appears to customers across the site.
            </p>
          </div>

          <div className="space-y-4">
            {/* Featured Toggle */}
            <div className="p-4 border border-[#E8DCC2] rounded-lg bg-[#FCFAF5] flex items-center justify-between">
              <div>
                <span className="font-bold text-sm text-[#16140F] flex items-center gap-1.5">
                  <Star size={16} className={isFeatured ? 'text-[#B98725] fill-[#B98725]' : 'text-zinc-400'} />
                  <span>Featured Product</span>
                </span>
                <p className="text-xs text-[#786F5E] mt-1 max-w-md m-0">
                  When enabled, this item will be prominently showcased in the "Our Collections / Featured Highlights" section on the homepage.
                </p>
              </div>

              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={isFeatured}
                  onChange={(e) => setIsFeatured(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-zinc-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#B98725]"></div>
              </label>
            </div>

            {/* Active / Publish Toggle */}
            <div className="p-4 border border-[#E8DCC2] rounded-lg bg-[#FCFAF5] flex items-center justify-between">
              <div>
                <span className="font-bold text-sm text-[#16140F]">
                  Publish Status (Active in Store)
                </span>
                <p className="text-xs text-[#786F5E] mt-1 max-w-md m-0">
                  Toggle to "Draft" to hide this product from the storefront catalog, search results, and checkout while working on it.
                </p>
              </div>

              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-zinc-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
              </label>
            </div>
          </div>
        </div>
      )}
    </form>
  );
}
