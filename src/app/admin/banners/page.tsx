'use client';

import React, { useState, useEffect } from 'react';
import {
  Megaphone,
  Plus,
  Trash2,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Sparkles,
  Eye,
  Save,
} from 'lucide-react';
import { SiteBanner } from '@/lib/banners/banner-store';

const THEME_PRESETS = [
  { name: 'Dark Forest (Brand Signature)', bg: '#0F3E2E', text: '#F9F6EE' },
  { name: 'Royal Crimson (Bridal Sale)', bg: '#7A1A28', text: '#F9F6EE' },
  { name: 'Arabian Gold (Luxury Festive)', bg: '#B98725', text: '#FFFFFF' },
  { name: 'Midnight Charcoal (Subtle)', bg: '#1E1B15', text: '#E8DCC2' },
];

export default function AdminBannersPage() {
  const [banners, setBanners] = useState<SiteBanner[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form State
  const [text, setText] = useState('');
  const [highlightText, setHighlightText] = useState('LIMITED TIME');
  const [linkUrl, setLinkUrl] = useState('/coconut-oil');
  const [badgeText, setBadgeText] = useState('BARAKAH SALE');
  const [bgColor, setBgColor] = useState('#0F3E2E');
  const [textColor, setTextColor] = useState('#F9F6EE');
  const [isActive, setIsActive] = useState(true);

  const fetchBanners = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/banners');
      if (res.ok) {
        const data = await res.json();
        setBanners(data.banners || []);
      }
    } catch (err) {
      console.error('Failed to fetch banners:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const handleCreateBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) {
      alert('Banner text is required');
      return;
    }

    setSaving(true);
    try {
      const res = await fetch('/api/admin/banners', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: text.trim(),
          highlight_text: highlightText.trim() || null,
          link_url: linkUrl.trim() || null,
          badge_text: badgeText.trim() || null,
          bg_color: bgColor,
          text_color: textColor,
          is_active: isActive,
        }),
      });

      if (res.ok) {
        setText('');
        setHighlightText('');
        fetchBanners();
      } else {
        alert('Failed to create banner');
      }
    } catch {
      alert('Error creating banner');
    } finally {
      setSaving(false);
    }
  };

  const toggleBannerStatus = async (banner: SiteBanner) => {
    const updatedStatus = !banner.is_active;
    try {
      const res = await fetch(`/api/admin/banners/${banner.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: updatedStatus }),
      });
      if (res.ok) {
        setBanners((prev) =>
          prev.map((b) => (b.id === banner.id ? { ...b, is_active: updatedStatus } : b))
        );
      }
    } catch {
      alert('Failed to update banner status');
    }
  };

  const handleDeleteBanner = async (banner: SiteBanner) => {
    if (!confirm('Are you sure you want to delete this promotional banner?')) return;
    try {
      const res = await fetch(`/api/admin/banners/${banner.id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setBanners((prev) => prev.filter((b) => b.id !== banner.id));
      }
    } catch {
      alert('Failed to delete banner');
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-serif font-bold text-2xl sm:text-3xl text-[#16140F] m-0">
          Sale & Promotional Banners
        </h1>
        <p className="text-xs sm:text-sm text-[#786F5E] mt-1 m-0">
          Create and schedule top-of-page announcement ribbons, festive deals, and flash sale callouts.
        </p>
      </div>

      {/* Live Preview Card */}
      <div className="bg-white p-5 rounded-xl border border-[#E8DCC2] shadow-sm space-y-3">
        <span className="text-xs font-bold text-[#16140F] uppercase tracking-wider flex items-center gap-1.5">
          <Eye size={14} className="text-[#B98725]" />
          <span>Live Storefront Header Ribbon Preview</span>
        </span>

        <div
          className="rounded-lg p-3 sm:px-6 shadow-inner flex flex-wrap items-center justify-between gap-3 text-xs font-medium transition-all"
          style={{ backgroundColor: bgColor, color: textColor }}
        >
          <div className="flex items-center gap-2 flex-wrap">
            {badgeText && (
              <span className="bg-white/20 px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase">
                {badgeText}
              </span>
            )}
            <span>
              {text || '✨ Special Announcement: Free Shipping on Orders Above ₹1,499!'}
            </span>
            {highlightText && (
              <span className="font-bold underline decoration-white/60">
                {highlightText}
              </span>
            )}
          </div>

          {linkUrl && (
            <span className="text-[11px] font-bold flex items-center gap-1 opacity-90 hover:opacity-100 underline">
              <span>Shop Now</span>
              <span>&rarr;</span>
            </span>
          )}
        </div>
      </div>

      {/* Banner Creation Form */}
      <div className="bg-white p-6 rounded-xl border border-[#E8DCC2] shadow-sm space-y-5">
        <h3 className="font-serif font-bold text-base text-[#16140F] m-0">
          Create New Promotion Banner
        </h3>

        <form onSubmit={handleCreateBanner} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#16140F] uppercase tracking-wider mb-1">
                Announcement Copy *
              </label>
              <input
                type="text"
                required
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="e.g. Ramadan Special: Flat 20% OFF on all Natural Spices & Candles!"
                className="w-full px-3 py-2 border border-[#E8DCC2] rounded-md text-sm text-[#16140F] bg-[#FCFAF5]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#16140F] uppercase tracking-wider mb-1">
                Highlight Tag (Optional)
              </label>
              <input
                type="text"
                value={highlightText}
                onChange={(e) => setHighlightText(e.target.value)}
                placeholder="USE CODE: FESTIVE20 or LIMITED TIME"
                className="w-full px-3 py-2 border border-[#E8DCC2] rounded-md text-sm text-[#16140F] bg-[#FCFAF5]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#16140F] uppercase tracking-wider mb-1">
                Target Link URL
              </label>
              <input
                type="text"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                placeholder="/shop/coconut-oil or /bridal"
                className="w-full px-3 py-2 border border-[#E8DCC2] rounded-md text-sm text-[#16140F] bg-[#FCFAF5]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#16140F] uppercase tracking-wider mb-1">
                Badge Label (Optional)
              </label>
              <input
                type="text"
                value={badgeText}
                onChange={(e) => setBadgeText(e.target.value)}
                placeholder="SALE, EXCLUSIVE, NEW LAUNCH"
                className="w-full px-3 py-2 border border-[#E8DCC2] rounded-md text-sm text-[#16140F] bg-[#FCFAF5]"
              />
            </div>
          </div>

          {/* Color Themes */}
          <div>
            <label className="block text-xs font-bold text-[#16140F] uppercase tracking-wider mb-2">
              Color Theme Presets
            </label>
            <div className="flex flex-wrap gap-2">
              {THEME_PRESETS.map((preset) => (
                <button
                  key={preset.name}
                  type="button"
                  onClick={() => {
                    setBgColor(preset.bg);
                    setTextColor(preset.text);
                  }}
                  className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-2 border transition-all ${
                    bgColor === preset.bg
                      ? 'border-[#B98725] ring-2 ring-[#B98725]/30'
                      : 'border-[#E8DCC2]'
                  }`}
                  style={{ backgroundColor: preset.bg, color: preset.text }}
                >
                  <span className="w-2.5 h-2.5 rounded-full border border-white/40" />
                  <span>{preset.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Active Switch & Submit */}
          <div className="flex items-center justify-between pt-3 border-t border-[#E8DCC2]">
            <div className="flex items-center gap-3">
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-zinc-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
              </label>
              <span className="text-xs font-bold text-[#16140F]">
                Make active immediately on site header
              </span>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 bg-[#B98725] hover:bg-[#a6771d] text-white px-5 py-2 rounded-md text-xs font-bold uppercase tracking-wider shadow-md transition-all disabled:opacity-50"
            >
              <Save size={14} />
              <span>{saving ? 'Creating...' : 'Publish Banner'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Existing Banners List */}
      <div className="bg-white rounded-xl border border-[#E8DCC2] shadow-sm overflow-hidden">
        <div className="p-5 border-b border-[#E8DCC2]">
          <h3 className="font-serif font-bold text-base text-[#16140F] m-0">Existing Banners</h3>
          <p className="text-xs text-[#786F5E] mt-0.5 m-0">
            Active banners will show on the storefront navigation bar.
          </p>
        </div>

        {loading ? (
          <div className="p-8 text-center text-xs text-[#786F5E]">Loading banners...</div>
        ) : banners.length === 0 ? (
          <div className="p-8 text-center text-xs text-[#786F5E]">
            No banners created yet. Use the form above to add an announcement banner.
          </div>
        ) : (
          <div className="divide-y divide-[#F0E8D5]">
            {banners.map((b) => (
              <div
                key={b.id}
                className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-[#FCFAF5] transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-3 h-3 rounded-full shrink-0 border"
                      style={{ backgroundColor: b.bg_color }}
                    />
                    <span className="font-semibold text-xs text-[#16140F]">{b.text}</span>
                  </div>
                  <div className="flex items-center gap-3 text-[11px] text-[#786F5E]">
                    {b.highlight_text && <span>Highlight: <strong>{b.highlight_text}</strong></span>}
                    {b.link_url && <span>Target: <code>{b.link_url}</code></span>}
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-center">
                  <button
                    onClick={() => toggleBannerStatus(b)}
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition-colors ${
                      b.is_active
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-zinc-100 text-zinc-600'
                    }`}
                  >
                    {b.is_active ? <CheckCircle2 size={11} /> : <XCircle size={11} />}
                    <span>{b.is_active ? 'Active' : 'Disabled'}</span>
                  </button>

                  <button
                    onClick={() => handleDeleteBanner(b)}
                    className="p-1.5 rounded hover:bg-rose-50 text-rose-600 transition-colors"
                    title="Delete banner"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
