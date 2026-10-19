import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export let inMemoryUsers: any[] = [
  {
    id: 'usr_admin_1',
    name: 'Administrator',
    phone: '+919876543210',
    email: 'admin@barakahbazar.com',
    role: 'admin',
    orders_count: 5,
    lifetime_spend_paise: 9550000,
    created_at: new Date(Date.now() - 3600000 * 24 * 14).toISOString(),
  },
  {
    id: 'usr_sample_1',
    name: 'Aisha Khan',
    phone: '+919876543211',
    email: 'aisha.khan@example.com',
    role: 'customer',
    orders_count: 2,
    lifetime_spend_paise: 7450000,
    created_at: new Date(Date.now() - 3600000 * 24 * 7).toISOString(),
  },
  {
    id: 'usr_sample_2',
    name: 'Fatima Sheikh',
    phone: '+919845012345',
    email: 'fatima.sheikh@example.com',
    role: 'customer',
    orders_count: 3,
    lifetime_spend_paise: 385000,
    created_at: new Date(Date.now() - 3600000 * 24 * 10).toISOString(),
  },
  {
    id: 'usr_sample_3',
    name: 'Mariam Ahmed',
    phone: '+919711223344',
    email: 'mariam.ahmed@example.com',
    role: 'customer',
    orders_count: 1,
    lifetime_spend_paise: 2450000,
    created_at: new Date(Date.now() - 3600000 * 24 * 3).toISOString(),
  },
];

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const search = searchParams.get('search')?.toLowerCase();
    const roleFilter = searchParams.get('role');

    if (process.env.SUPABASE_SERVICE_ROLE_KEY && process.env.NEXT_PUBLIC_SUPABASE_URL) {
      try {
        const supabase = createAdminClient();
        const { data: profiles, error } = await supabase
          .from('profiles')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && profiles && profiles.length > 0) {
          // Get order stats per user
          const { data: orderStats } = await supabase
            .from('orders')
            .select('user_id, total_paise');

          const userStatsMap: Record<string, { count: number; spend: number }> = {};
          if (orderStats) {
            orderStats.forEach((o: any) => {
              if (!userStatsMap[o.user_id]) {
                userStatsMap[o.user_id] = { count: 0, spend: 0 };
              }
              userStatsMap[o.user_id].count += 1;
              userStatsMap[o.user_id].spend += o.total_paise || 0;
            });
          }

          const adminPhones = (process.env.ADMIN_PHONE_NUMBERS || '')
            .split(',')
            .map((p) => p.trim())
            .filter(Boolean);

          const formatted = profiles.map((p: any) => {
            const isAdmin = p.role === 'admin' || adminPhones.includes(p.phone);
            const stats = userStatsMap[p.id] || { count: 0, spend: 0 };
            return {
              id: p.id,
              name: p.name || 'Barakah Customer',
              phone: p.phone,
              email: p.email || '—',
              role: isAdmin ? 'admin' : (p.role || 'customer'),
              orders_count: stats.count,
              lifetime_spend_paise: stats.spend,
              created_at: p.created_at,
            };
          });

          let filtered = formatted;
          if (roleFilter && roleFilter !== 'ALL') {
            filtered = filtered.filter((u) => u.role === roleFilter);
          }
          if (search) {
            filtered = filtered.filter(
              (u) =>
                u.name.toLowerCase().includes(search) ||
                u.phone.toLowerCase().includes(search) ||
                u.email.toLowerCase().includes(search)
            );
          }

          return NextResponse.json({ ok: true, users: filtered, count: filtered.length });
        }
      } catch (err) {
        console.warn('Supabase users fetch fallback:', err);
      }
    }

    // Memory fallback
    let result = [...inMemoryUsers];
    if (roleFilter && roleFilter !== 'ALL') {
      result = result.filter((u) => u.role === roleFilter);
    }
    if (search) {
      result = result.filter(
        (u) =>
          u.name.toLowerCase().includes(search) ||
          u.phone.toLowerCase().includes(search) ||
          u.email.toLowerCase().includes(search)
      );
    }

    return NextResponse.json({ ok: true, users: result, count: result.length });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: { code: 'FETCH_ERROR', message: err.message || 'Failed to list users' } },
      { status: 500 }
    );
  }
}
