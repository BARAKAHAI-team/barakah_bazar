import { createAdminClient } from '@/lib/supabase/admin';

export interface SiteBanner {
  id: string;
  text: string;
  highlight_text?: string | null;
  link_url?: string | null;
  badge_text?: string | null;
  bg_color: string;
  text_color: string;
  is_active: boolean;
  starts_at?: string;
  ends_at?: string | null;
  created_at: string;
}

export const inMemoryBanners: SiteBanner[] = [
  {
    id: 'banner-welcome-1',
    text: '✨ Grand Festive Launch: Free Delivery across India on all orders above ₹1,499!',
    highlight_text: 'LIMITED PERIOD',
    link_url: '/coconut-oil',
    badge_text: 'BARAKAH EXCLUSIVE',
    bg_color: '#0F3E2E', // Dark Forest
    text_color: '#F9F6EE', // Warm Cream
    is_active: true,
    created_at: new Date().toISOString(),
  },
];

export async function getAllBanners(): Promise<SiteBanner[]> {
  try {
    if (process.env.SUPABASE_SERVICE_ROLE_KEY && process.env.NEXT_PUBLIC_SUPABASE_URL) {
      const supabase = createAdminClient() as any;
      const { data, error } = await supabase
        .from('site_banners')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        return data as SiteBanner[];
      }
    }
  } catch (err) {
    console.warn('Supabase site_banners fetch failed, using memory:', err);
  }

  return inMemoryBanners;
}

export async function getActiveBanner(): Promise<SiteBanner | null> {
  const all = await getAllBanners();
  return all.find((b) => b.is_active) || null;
}

export async function createBanner(data: Partial<SiteBanner>): Promise<SiteBanner> {
  const newBanner: SiteBanner = {
    id: `bnr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    text: data.text || 'Promotional Announcement',
    highlight_text: data.highlight_text || null,
    link_url: data.link_url || null,
    badge_text: data.badge_text || null,
    bg_color: data.bg_color || '#0F3E2E',
    text_color: data.text_color || '#F9F6EE',
    is_active: data.is_active !== undefined ? data.is_active : true,
    starts_at: data.starts_at || new Date().toISOString(),
    ends_at: data.ends_at || null,
    created_at: new Date().toISOString(),
  };

  inMemoryBanners.unshift(newBanner);

  try {
    if (process.env.SUPABASE_SERVICE_ROLE_KEY && process.env.NEXT_PUBLIC_SUPABASE_URL) {
      const supabase = createAdminClient() as any;
      await supabase.from('site_banners').insert(newBanner);
    }
  } catch {
    // fallback
  }

  return newBanner;
}

export async function updateBanner(id: string, data: Partial<SiteBanner>): Promise<SiteBanner | null> {
  const idx = inMemoryBanners.findIndex((b) => b.id === id);
  if (idx === -1) return null;

  inMemoryBanners[idx] = { ...inMemoryBanners[idx], ...data };

  try {
    if (process.env.SUPABASE_SERVICE_ROLE_KEY && process.env.NEXT_PUBLIC_SUPABASE_URL) {
      const supabase = createAdminClient() as any;
      await supabase.from('site_banners').update(data).eq('id', id);
    }
  } catch {
    // fallback
  }

  return inMemoryBanners[idx];
}

export async function deleteBanner(id: string): Promise<boolean> {
  const idx = inMemoryBanners.findIndex((b) => b.id === id);
  if (idx !== -1) {
    inMemoryBanners.splice(idx, 1);
  }

  try {
    if (process.env.SUPABASE_SERVICE_ROLE_KEY && process.env.NEXT_PUBLIC_SUPABASE_URL) {
      const supabase = createAdminClient() as any;
      await supabase.from('site_banners').delete().eq('id', id);
    }
  } catch {
    // fallback
  }

  return true;
}
