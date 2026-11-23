'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  Save,
  RotateCcw,
  Eye,
  CheckCircle2,
  ExternalLink,
  Image as ImageIcon,
  Type,
  Link2,
} from 'lucide-react';
import { HeroSettings, DEFAULT_HERO_SETTINGS } from '@/lib/hero/types';

export default function AdminHeroPage() {
  const [settings, setSettings] = useState<HeroSettings>(DEFAULT_HERO_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/hero');
      if (res.ok) {
        const data = await res.json();
        if (data.settings) {
          setSettings(data.settings);
        }
      }
    } catch {
      showToast('Failed to load hero settings', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/admin/hero', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        setSettings(data.settings);
        showToast('Hero section updated successfully!', 'success');
      } else {
        showToast(data.error?.message || 'Failed to update hero settings', 'error');
      }
    } catch {
      showToast('Network error while saving settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    if (confirm('Reset hero settings to default brand copy?')) {
      setSettings(DEFAULT_HERO_SETTINGS);
    }
  };

  if (loading) {
    return (
      <div className="p-8 max-w-6xl mx-auto flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-[#b98725] border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-semibold text-stone-500 uppercase tracking-widest">
            Loading Hero Configuration...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-lg shadow-xl text-xs font-bold tracking-wide flex items-center gap-2 border transition-all ${
            toast.type === 'success'
              ? 'bg-[#0F3E2E] text-white border-emerald-600'
              : 'bg-red-800 text-white border-red-600'
          }`}
        >
          <CheckCircle2 size={16} />
          <span>{toast.message}</span>
        </div>
      )}

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-[#EADFC8]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-[#b98725]/15 text-[#8A641A] border border-[#b98725]/30">
              Live Customizer
            </span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#1E1B15] tracking-tight m-0">
            Storefront Hero Section
          </h1>
          <p className="text-xs text-stone-500 mt-1 m-0">
            Customize the editorial headline, gold italic accents, descriptive story, and visual showcase of your landing page.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Link
            href="/"
            target="_blank"
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-stone-50 text-stone-700 border border-stone-300 rounded text-xs font-semibold no-underline transition-colors shadow-2xs"
          >
            <span>View Live Site</span>
            <ExternalLink size={13} />
          </Link>
          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-stone-50 text-stone-600 border border-stone-300 rounded text-xs font-semibold cursor-pointer transition-colors shadow-2xs"
          >
            <RotateCcw size={13} />
            <span>Reset Defaults</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Form Controls (7 cols) */}
        <form onSubmit={handleSave} className="lg:col-span-6 space-y-6 bg-white p-5 sm:p-6 rounded-xl border border-[#EADFC8] shadow-xs">
          
          {/* Section 1: Typography & Headline */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#b98725] border-b border-[#EADFC8]/60 pb-2">
              <Type size={14} />
              <span>Typography & Headlines</span>
            </div>

            {/* Eyebrow */}
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Eyebrow Tagline
              </label>
              <input
                type="text"
                value={settings.eyebrow}
                onChange={(e) => setSettings({ ...settings, eyebrow: e.target.value })}
                placeholder="e.g. A MORE BLESSED TOMORROW"
                className="w-full px-3 py-2 text-xs bg-[#FAF7F2] border border-[#EADFC8] rounded focus:bg-white focus:border-[#b98725] outline-hidden font-sans uppercase tracking-wider"
              />
              <span className="text-[10px] text-stone-400 mt-0.5 block">Small uppercase text above the main headline</span>
            </div>

            {/* Headline Main & Accent */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-3">
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Headline Primary Line
                </label>
                <input
                  type="text"
                  value={settings.headlineMain}
                  onChange={(e) => setSettings({ ...settings, headlineMain: e.target.value })}
                  placeholder="e.g. EVERYTHING"
                  className="w-full px-3 py-2 text-xs bg-[#FAF7F2] border border-[#EADFC8] rounded focus:bg-white focus:border-[#b98725] outline-hidden font-serif font-bold text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Prefix Word
                </label>
                <input
                  type="text"
                  value={settings.headlinePrefix}
                  onChange={(e) => setSettings({ ...settings, headlinePrefix: e.target.value })}
                  placeholder="e.g. WITH"
                  className="w-full px-3 py-2 text-xs bg-[#FAF7F2] border border-[#EADFC8] rounded focus:bg-white focus:border-[#b98725] outline-hidden font-serif"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Accent Highlight (Golden Italic)
                </label>
                <input
                  type="text"
                  value={settings.headlineAccent}
                  onChange={(e) => setSettings({ ...settings, headlineAccent: e.target.value })}
                  placeholder="e.g. BARAKAH"
                  className="w-full px-3 py-2 text-xs bg-[#FAF7F2] border border-[#EADFC8] rounded focus:bg-white focus:border-[#b98725] outline-hidden font-serif italic font-bold text-[#b98725]"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Story / Narrative Description
              </label>
              <textarea
                rows={3}
                value={settings.description}
                onChange={(e) => setSettings({ ...settings, description: e.target.value })}
                placeholder="Narrative describing BarakahBazar's curated collections..."
                className="w-full px-3 py-2 text-xs bg-[#FAF7F2] border border-[#EADFC8] rounded focus:bg-white focus:border-[#b98725] outline-hidden font-sans leading-relaxed resize-y"
              />
            </div>
          </div>

          {/* Section 2: Call to Action (CTA) */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#b98725] border-b border-[#EADFC8]/60 pb-2">
              <Link2 size={14} />
              <span>Call to Action Button</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Button Text
                </label>
                <input
                  type="text"
                  value={settings.ctaText}
                  onChange={(e) => setSettings({ ...settings, ctaText: e.target.value })}
                  placeholder="e.g. EXPLORE OUR COLLECTIONS"
                  className="w-full px-3 py-2 text-xs bg-[#FAF7F2] border border-[#EADFC8] rounded focus:bg-white focus:border-[#b98725] outline-hidden font-sans uppercase font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Target Destination URL / Anchor
                </label>
                <input
                  type="text"
                  value={settings.ctaLink}
                  onChange={(e) => setSettings({ ...settings, ctaLink: e.target.value })}
                  placeholder="e.g. #collections or /bridal"
                  className="w-full px-3 py-2 text-xs bg-[#FAF7F2] border border-[#EADFC8] rounded focus:bg-white focus:border-[#b98725] outline-hidden font-mono"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Visual Showcase Image */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#b98725] border-b border-[#EADFC8]/60 pb-2">
              <ImageIcon size={14} />
              <span>Showcase Image</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Hero Image URL
              </label>
              <input
                type="text"
                value={settings.imageUrl}
                onChange={(e) => setSettings({ ...settings, imageUrl: e.target.value })}
                placeholder="e.g. /images/home/barakah_hero_new.jpg or https://..."
                className="w-full px-3 py-2 text-xs bg-[#FAF7F2] border border-[#EADFC8] rounded focus:bg-white focus:border-[#b98725] outline-hidden font-mono text-[11px]"
              />
              <span className="text-[10px] text-stone-400 mt-0.5 block">
                Local public path (e.g. <code>/images/home/...</code>) or any external image URL.
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Image Alt Description
              </label>
              <input
                type="text"
                value={settings.imageAlt}
                onChange={(e) => setSettings({ ...settings, imageAlt: e.target.value })}
                placeholder="e.g. BarakahBazar Curated Collections"
                className="w-full px-3 py-2 text-xs bg-[#FAF7F2] border border-[#EADFC8] rounded focus:bg-white focus:border-[#b98725] outline-hidden font-sans"
              />
            </div>

            {/* Category Pills Toggle */}
            <div className="pt-1">
              <label className="inline-flex items-center gap-2 text-xs font-semibold text-stone-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.showCategoryPills}
                  onChange={(e) => setSettings({ ...settings, showCategoryPills: e.target.checked })}
                  className="rounded border-[#EADFC8] text-[#b98725] focus:ring-[#b98725]"
                />
                <span>Display Dynamic Category Names in Hero (e.g. BRIDAL COLLECTIONS &bull; NATURALS...)</span>
              </label>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-4 border-t border-[#EADFC8]">
            <button
              type="submit"
              disabled={saving}
              className="w-full inline-flex items-center justify-center gap-2 bg-[#0F3E2E] hover:bg-[#16503c] text-white py-3 px-6 rounded text-xs font-bold tracking-widest uppercase transition-all shadow-md cursor-pointer disabled:opacity-50"
            >
              <Save size={15} />
              <span>{saving ? 'Publishing Changes...' : 'Save & Publish Hero Section'}</span>
            </button>
          </div>
        </form>

        {/* Right Column: Live Visual Preview (6 cols) */}
        <div className="lg:col-span-6 space-y-3 sticky top-6">
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-stone-500 px-1">
            <span className="flex items-center gap-1.5">
              <Eye size={14} className="text-[#b98725]" />
              <span>Live Storefront Preview</span>
            </span>
            <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-semibold">
              Real-time update
            </span>
          </div>

          {/* Mock Browser Frame */}
          <div className="bg-white rounded-xl border border-[#EADFC8] shadow-[0_12px_40px_rgba(75,56,20,0.08)] overflow-hidden">
            {/* Browser top pill */}
            <div className="bg-[#FAF7F2] px-4 py-2.5 border-b border-[#EADFC8] flex items-center gap-2">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-red-400/80" />
                <div className="w-2.5 h-2.5 rounded-full bg-amber-400/80" />
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400/80" />
              </div>
              <div className="flex-1 max-w-[220px] mx-auto bg-white border border-[#EADFC8] rounded-full text-[10px] text-stone-500 text-center py-0.5 px-3 truncate">
                barakahbazar.com
              </div>
            </div>

            {/* Scaled-down Hero Preview */}
            <div className="p-6 sm:p-8 bg-white text-[#211e18]">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                
                {/* Left Preview Content */}
                <div className="md:col-span-7 flex flex-col items-start text-left">
                  {settings.eyebrow && (
                    <span className="text-[10px] font-bold tracking-[2.5px] text-[#b98725] uppercase mb-2 block">
                      {settings.eyebrow}
                    </span>
                  )}

                  <h1 className="font-serif text-[clamp(24px,3vw,36px)] leading-[1.05] text-[#2c2214] font-semibold tracking-tight mb-3">
                    {settings.headlineMain}
                    <br />
                    {settings.headlinePrefix}{' '}
                    <span className="italic font-normal text-[#b98725]">
                      {settings.headlineAccent}
                    </span>
                  </h1>

                  {settings.showCategoryPills && (
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[10px] font-bold tracking-[1.2px] uppercase text-[#756b58] mb-3">
                      <span className="text-[#3a2f20]">BRIDAL COLLECTIONS</span>
                      <span className="text-[#b98725]">&bull;</span>
                      <span className="text-[#3a2f20]">NATURALS</span>
                      <span className="text-[#b98725]">&bull;</span>
                      <span className="text-[#3a2f20]">COCONUT OIL</span>
                    </div>
                  )}

                  <p className="text-[#635746] text-[12px] leading-[1.65] font-normal mb-5 line-clamp-4">
                    {settings.description}
                  </p>

                  <div className="inline-flex items-center gap-2 bg-[#b98725] text-white px-4 py-2.5 rounded text-[10px] font-black tracking-widest uppercase">
                    <span>{settings.ctaText}</span>
                    <span>&rarr;</span>
                  </div>
                </div>

                {/* Right Preview Image */}
                <div className="md:col-span-5 relative">
                  <div className="relative mx-auto rounded-[14px] p-2 bg-white border border-[#e8dcc2] shadow-md">
                    <div className="relative h-[220px] rounded-[10px] overflow-hidden bg-[#f7f3ea]">
                      <img
                        src={settings.imageUrl || '/images/home/barakah_hero_new.jpg'}
                        alt={settings.imageAlt}
                        className="w-full h-full object-cover object-center"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/images/home/barakah_hero_new.jpg';
                        }}
                      />
                    </div>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
