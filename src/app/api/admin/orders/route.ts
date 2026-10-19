import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

// In-memory fallback orders if Supabase is initializing or offline
export let inMemoryOrders: any[] = [
  {
    id: 'ord-8921-a1b2',
    order_number: 'BB-2026-1001',
    user_id: 'usr_sample_1',
    notify_phone: '+919876543210',
    notify_email: 'aisha.khan@example.com',
    customer_name: 'Aisha Khan',
    subtotal_paise: 6800000,
    discount_paise: 200000,
    coupon_code: 'WELCOME10',
    total_paise: 6600000,
    payment_status: 'PAID',
    order_status: 'CONFIRMED',
    created_at: new Date(Date.now() - 3600000 * 4).toISOString(),
    address_snapshot: {
      name: 'Aisha Khan',
      phone: '+919876543210',
      line1: 'B-402, Royal Palms Residency',
      line2: 'Near Jubilee Hills Check Post',
      city: 'Hyderabad',
      state: 'Telangana',
      pincode: '500033',
    },
    items: [
      {
        id: 'item-1',
        product_name: 'Handcrafted Velvet Bridal Anarkali',
        variant_label: 'XS / Royal Maroon',
        quantity: 1,
        price_paise: 6800000,
        thumbnail_url: '/images/bridal/02.jpeg',
      },
    ],
  },
  {
    id: 'ord-8922-c3d4',
    order_number: 'BB-2026-1002',
    user_id: 'usr_sample_2',
    notify_phone: '+919845012345',
    notify_email: 'fatima.sheikh@example.com',
    customer_name: 'Fatima Sheikh',
    subtotal_paise: 135000,
    discount_paise: 0,
    coupon_code: null,
    total_paise: 135000,
    payment_status: 'PAID',
    order_status: 'PROCESSING',
    created_at: new Date(Date.now() - 3600000 * 18).toISOString(),
    address_snapshot: {
      name: 'Fatima Sheikh',
      phone: '+919845012345',
      line1: 'House 14, 2nd Cross, Koramangala 4th Block',
      line2: 'Opposite Wipro Park',
      city: 'Bengaluru',
      state: 'Karnataka',
      pincode: '560034',
    },
    items: [
      {
        id: 'item-2',
        product_name: 'Barakah Kerala Pure Cold-Pressed Coconut Oil (1000ml)',
        variant_label: '1000ml Glass Jar',
        quantity: 2,
        price_paise: 67500,
        thumbnail_url: '/images/oil/product-1.jpeg',
      },
    ],
  },
  {
    id: 'ord-8923-e5f6',
    order_number: 'BB-2026-1003',
    user_id: 'usr_sample_3',
    notify_phone: '+919711223344',
    notify_email: 'mariam.ahmed@example.com',
    customer_name: 'Mariam Ahmed',
    subtotal_paise: 2450000,
    discount_paise: 0,
    coupon_code: null,
    total_paise: 2450000,
    payment_status: 'PAID',
    order_status: 'DELIVERED',
    created_at: new Date(Date.now() - 3600000 * 72).toISOString(),
    address_snapshot: {
      name: 'Mariam Ahmed',
      phone: '+919711223344',
      line1: 'Flat 12B, Al-Noor Heights',
      line2: 'Zakur Road, Hazratbal',
      city: 'Srinagar',
      state: 'Jammu and Kashmir',
      pincode: '190006',
    },
    items: [
      {
        id: 'item-3',
        product_name: 'Mustard Georgette Sharara Set',
        variant_label: 'M / Mustard Gold',
        quantity: 1,
        price_paise: 2450000,
        thumbnail_url: '/images/bridal/04.jpeg',
      },
    ],
  },
];

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const status = searchParams.get('status');
    const search = searchParams.get('search')?.toLowerCase();

    // Query Supabase if connected
    if (process.env.SUPABASE_SERVICE_ROLE_KEY && process.env.NEXT_PUBLIC_SUPABASE_URL) {
      try {
        const supabase = createAdminClient() as any;
        let query = supabase
          .from('orders')
          .select(`
            *,
            profiles:user_id(name, phone, email),
            order_items(
              id,
              quantity,
              price_paise,
              products:product_id(name, thumbnail_url),
              product_variants:variant_id(label, sku)
            )
          `)
          .order('created_at', { ascending: false });

        if (status && status !== 'ALL') {
          query = query.eq('order_status', status);
        }

        const { data: dbOrders, error } = await query;
        if (!error && dbOrders && dbOrders.length > 0) {
          const formatted = dbOrders.map((o: any) => ({
            id: o.id,
            order_number: o.order_number,
            user_id: o.user_id,
            notify_phone: o.notify_phone || o.profiles?.phone,
            notify_email: o.notify_email || o.profiles?.email,
            customer_name: o.profiles?.name || o.address_snapshot?.name || 'Customer',
            subtotal_paise: o.subtotal_paise,
            discount_paise: o.discount_paise || 0,
            coupon_code: o.coupon_code,
            total_paise: o.total_paise,
            payment_status: o.payment_status,
            order_status: o.order_status,
            created_at: o.created_at,
            address_snapshot: o.address_snapshot,
            items: (o.order_items || []).map((it: any) => ({
              id: it.id,
              product_name: it.products?.name || 'Barakah Product',
              variant_label: it.product_variants?.label || 'Default',
              quantity: it.quantity,
              price_paise: it.price_paise,
              thumbnail_url: it.products?.thumbnail_url || null,
            })),
          }));

          let filtered = formatted;
          if (search) {
            filtered = filtered.filter(
              (o: any) =>
                o.order_number.toLowerCase().includes(search) ||
                o.customer_name.toLowerCase().includes(search) ||
                o.notify_phone.toLowerCase().includes(search)
            );
          }

          return NextResponse.json({ ok: true, orders: filtered, count: filtered.length });
        }
      } catch (err) {
        console.warn('Supabase orders fetch fallback to memory:', err);
      }
    }

    // Memory fallback
    let result = [...inMemoryOrders];
    if (status && status !== 'ALL') {
      result = result.filter((o) => o.order_status === status);
    }
    if (search) {
      result = result.filter(
        (o) =>
          o.order_number.toLowerCase().includes(search) ||
          o.customer_name.toLowerCase().includes(search) ||
          o.notify_phone.toLowerCase().includes(search)
      );
    }

    return NextResponse.json({ ok: true, orders: result, count: result.length });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: { code: 'FETCH_ERROR', message: err.message || 'Failed to list orders' } },
      { status: 500 }
    );
  }
}
