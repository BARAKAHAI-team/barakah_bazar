import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { inMemoryOrders } from '../orders/route';
import { inMemoryUsers } from '../users/route';
import { getAllAdminProducts } from '@/lib/catalog/admin-store';

export async function GET() {
  try {
    let totalRevenuePaise = 0;
    let ordersCount = 0;
    let pendingFulfillments = 0;
    let customersCount = 0;
    let productsCount = 0;
    let recentOrders: any[] = [];

    // Products count
    const prods = await getAllAdminProducts();
    productsCount = prods.length;

    if (process.env.SUPABASE_SERVICE_ROLE_KEY && process.env.NEXT_PUBLIC_SUPABASE_URL) {
      try {
        const supabase = createAdminClient();

        // Orders summary
        const { data: dbOrders } = await supabase
          .from('orders')
          .select('id, order_number, total_paise, order_status, payment_status, created_at, address_snapshot')
          .order('created_at', { ascending: false });

        if (dbOrders && dbOrders.length > 0) {
          ordersCount = dbOrders.length;
          recentOrders = dbOrders.slice(0, 5).map((o: any) => ({
            id: o.id,
            order_number: o.order_number,
            customer_name: o.address_snapshot?.name || 'Customer',
            total_paise: o.total_paise,
            order_status: o.order_status,
            payment_status: o.payment_status,
            created_at: o.created_at,
          }));

          dbOrders.forEach((o: any) => {
            if (o.payment_status === 'PAID') {
              totalRevenuePaise += o.total_paise || 0;
            }
            if (['CONFIRMED', 'PROCESSING', 'PENDING_PAYMENT'].includes(o.order_status)) {
              pendingFulfillments += 1;
            }
          });
        }

        // Customers count
        const { count: userCount } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true });
        customersCount = userCount || 0;
      } catch (err) {
        console.warn('Supabase stats fallback to memory:', err);
      }
    }

    // If no db orders, use memory fallback numbers
    if (ordersCount === 0) {
      ordersCount = inMemoryOrders.length;
      recentOrders = inMemoryOrders.slice(0, 5).map((o) => ({
        id: o.id,
        order_number: o.order_number,
        customer_name: o.customer_name,
        total_paise: o.total_paise,
        order_status: o.order_status,
        payment_status: o.payment_status,
        created_at: o.created_at,
      }));
      inMemoryOrders.forEach((o) => {
        if (o.payment_status === 'PAID') totalRevenuePaise += o.total_paise;
        if (['CONFIRMED', 'PROCESSING'].includes(o.order_status)) pendingFulfillments += 1;
      });
      customersCount = inMemoryUsers.length;
    }

    return NextResponse.json({
      ok: true,
      stats: {
        totalRevenueRupees: Math.round(totalRevenuePaise / 100),
        ordersCount,
        pendingFulfillments,
        customersCount,
        productsCount,
        recentOrders,
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: { code: 'STATS_ERROR', message: err.message || 'Failed to aggregate stats' } },
      { status: 500 }
    );
  }
}
