import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { memoryCart } from '../cart/route';
import { memoryAddresses } from '../addresses/route';
import { SEED_PRODUCTS } from '@/lib/catalog/seed-data';
import { createAdminClient } from '@/lib/supabase/admin';

export interface MemoryOrder {
  id: string;
  order_number: string;
  user_id: string;
  address_snapshot: any;
  notify_phone: string;
  notify_email?: string | null;
  subtotal_paise: number;
  coupon_code?: string | null;
  discount_paise: number;
  total_paise: number;
  payment_status: 'PENDING' | 'PAID';
  order_status: 'PENDING_PAYMENT' | 'CONFIRMED' | 'DELIVERED';
  items: any[];
  status_history: { status: string; note: string; created_at: string }[];
  created_at: string;
  updated_at: string;
}

export const memoryOrders: Map<string, MemoryOrder[]> = new Map();
let orderSeq = 1;

const createOrderSchema = z.object({
  addressId: z.string(),
  email: z.string().email().optional().or(z.literal('')),
});

function getSessionUser(req: NextRequest) {
  const cookie = req.cookies.get('bz_session');
  if (!cookie?.value) return null;
  try {
    return JSON.parse(cookie.value);
  } catch {
    return null;
  }
}

export async function GET(req: NextRequest) {
  const session = getSessionUser(req);
  if (!session) {
    return NextResponse.json(
      { ok: false, error: { code: 'UNAUTHORIZED', message: 'Login required.' } },
      { status: 401 }
    );
  }

  // 1. Check Supabase first
  try {
    if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
      const supabase = createAdminClient() as any;
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (*)
        `)
        .eq('user_id', session.userId)
        .order('created_at', { ascending: false });

      if (!error && data) {
        const formatted = data.map((o: any) => ({
          id: o.id,
          order_number: o.order_number,
          user_id: o.user_id,
          address_snapshot: o.address_snapshot,
          notify_phone: o.notify_phone,
          notify_email: o.notify_email,
          subtotal_paise: o.subtotal_paise,
          coupon_code: o.coupon_code,
          discount_paise: o.discount_paise,
          total_paise: o.total_paise,
          payment_status: o.payment_status,
          order_status: o.order_status,
          items: (o.order_items || []).map((it: any) => ({
            id: it.id,
            variantId: it.variant_id,
            name_snapshot: it.name_snapshot,
            variant_label_snapshot: it.variant_label_snapshot,
            sku_snapshot: it.sku_snapshot,
            image_path_snapshot: it.image_path_snapshot,
            qty: it.qty,
            unit_price_paise: it.unit_price_paise,
          })),
          status_history: [
            {
              status: o.order_status,
              note: `Order is ${o.order_status}`,
              created_at: o.created_at,
            },
          ],
          created_at: o.created_at,
          updated_at: o.updated_at,
        }));

        return NextResponse.json({ ok: true, orders: formatted });
      }
    }
  } catch (err) {
    console.warn('Supabase orders fetch error, using memory:', err);
  }

  const orders = memoryOrders.get(session.userId) || [];
  return NextResponse.json({ ok: true, orders });
}

export async function POST(req: NextRequest) {
  const session = getSessionUser(req);
  if (!session) {
    return NextResponse.json(
      { ok: false, error: { code: 'UNAUTHORIZED', message: 'Login required.' } },
      { status: 401 }
    );
  }

  try {
    const body = await req.json();
    const parsed = createOrderSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, error: { code: 'INVALID_INPUT', message: 'Address is required.' } },
        { status: 400 }
      );
    }

    // 1. Load user cart items (Supabase or Memory)
    let cartLines: { variantId: string; qty: number }[] = [];

    try {
      if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
        const supabase = createAdminClient() as any;
        const { data: dbCart } = await supabase
          .from('cart_items')
          .select('variant_id, qty')
          .eq('user_id', session.userId);

        if (dbCart && dbCart.length > 0) {
          cartLines = dbCart.map((it: any) => ({ variantId: it.variant_id, qty: it.qty }));
        }
      }
    } catch {}

    if (cartLines.length === 0) {
      const memoryLines = memoryCart.get(session.userId) || [];
      cartLines = memoryLines.map((it) => ({ variantId: it.variantId, qty: it.qty }));
    }

    if (cartLines.length === 0) {
      return NextResponse.json(
        { ok: false, error: { code: 'EMPTY_CART', message: 'Your cart is empty.' } },
        { status: 400 }
      );
    }

    // 2. Validate line stock & build order lines
    const failedLines: { variantId: string; requested: number; available: number }[] = [];
    const hydratedLines: any[] = [];
    let subtotalPaise = 0;

    for (const item of cartLines) {
      let variant = null;
      let product = null;

      // Try checking Supabase variant
      try {
        if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
          const supabase = createAdminClient() as any;
          const { data: vData } = await supabase
            .from('product_variants')
            .select('*, products(*)')
            .eq('id', item.variantId)
            .maybeSingle();

          if (vData) {
            variant = vData;
            product = vData.products;
          }
        }
      } catch {}

      if (!variant) {
        for (const p of SEED_PRODUCTS) {
          const v = p.variants.find((varItem) => varItem.id === item.variantId);
          if (v) {
            product = p;
            variant = v;
            break;
          }
        }
      }

      if (!variant || !product || !variant.is_active || variant.stock < item.qty) {
        failedLines.push({
          variantId: item.variantId,
          requested: item.qty,
          available: variant ? variant.stock : 0,
        });
      } else {
        subtotalPaise += variant.price_paise * item.qty;
        hydratedLines.push({
          id: `item_${Math.random().toString(36).substring(2, 9)}`,
          productId: product.id,
          variantId: variant.id,
          name_snapshot: product.name,
          variant_label_snapshot: variant.label,
          sku_snapshot: variant.sku,
          image_path_snapshot: product.thumbnail_url || null,
          qty: item.qty,
          unit_price_paise: variant.price_paise,
        });
      }
    }

    if (failedLines.length > 0) {
      return NextResponse.json(
        {
          ok: false,
          error: {
            code: 'STOCK_SHORTAGE',
            message: 'Some items in your cart are no longer available in the requested quantities.',
            failedLines,
          },
        },
        { status: 409 }
      );
    }

    // Find address
    let chosenAddress: any = null;
    try {
      if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
        const supabase = createAdminClient() as any;
        const { data: addr } = await supabase
          .from('addresses')
          .select('*')
          .eq('id', parsed.data.addressId)
          .eq('user_id', session.userId)
          .maybeSingle();

        if (addr) chosenAddress = addr;
      }
    } catch {}

    if (!chosenAddress) {
      const addresses = memoryAddresses.get(session.userId) || [];
      chosenAddress = addresses.find((a) => a.id === parsed.data.addressId);
    }

    if (!chosenAddress) {
      return NextResponse.json(
        { ok: false, error: { code: 'INVALID_ADDRESS', message: 'Delivery address not found.' } },
        { status: 400 }
      );
    }

    const addressSnapshot = {
      name: chosenAddress.name,
      phone: chosenAddress.phone,
      line1: chosenAddress.line1,
      line2: chosenAddress.line2 || null,
      landmark: chosenAddress.landmark || null,
      city: chosenAddress.city,
      state: chosenAddress.state,
      pincode: chosenAddress.pincode,
      latitude: Number(chosenAddress.latitude),
      longitude: Number(chosenAddress.longitude),
    };

    // 3. Create Order in Supabase if connected
    try {
      if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
        const supabase = createAdminClient() as any;

        const { data: createdOrder, error: ordErr } = await supabase
          .from('orders')
          .insert({
            user_id: session.userId,
            address_snapshot: addressSnapshot,
            notify_phone: session.phone,
            notify_email: parsed.data.email || session.email || null,
            subtotal_paise: subtotalPaise,
            discount_paise: 0,
            total_paise: subtotalPaise,
            payment_status: 'PENDING',
            order_status: 'PENDING_PAYMENT',
          })
          .select()
          .single();

        if (!ordErr && createdOrder) {
          // Insert order items
          const orderItemsPayload = hydratedLines.map((it) => ({
            order_id: createdOrder.id,
            variant_id: it.variantId,
            name_snapshot: it.name_snapshot,
            variant_label_snapshot: it.variant_label_snapshot,
            sku_snapshot: it.sku_snapshot,
            image_path_snapshot: it.image_path_snapshot,
            qty: it.qty,
            unit_price_paise: it.unit_price_paise,
          }));

          await supabase.from('order_items').insert(orderItemsPayload);

          return NextResponse.json({
            ok: true,
            order: {
              ...createdOrder,
              items: hydratedLines,
            },
          });
        }
      }
    } catch (err) {
      console.warn('Supabase order insert error, using memory:', err);
    }

    // Memory fallback
    const orderNumber = `BZ-${new Date().toISOString().slice(2, 10).replace(/-/g, '')}-${String(orderSeq++).padStart(4, '0')}`;
    const orderId = `ord_${Math.random().toString(36).substring(2, 10)}`;

    const newOrder: MemoryOrder = {
      id: orderId,
      order_number: orderNumber,
      user_id: session.userId,
      address_snapshot: addressSnapshot,
      notify_phone: session.phone,
      notify_email: parsed.data.email || session.email || null,
      subtotal_paise: subtotalPaise,
      discount_paise: 0,
      total_paise: subtotalPaise,
      payment_status: 'PENDING',
      order_status: 'PENDING_PAYMENT',
      items: hydratedLines,
      status_history: [
        {
          status: 'PENDING_PAYMENT',
          note: 'Order created, awaiting payment authorization.',
          created_at: new Date().toISOString(),
        },
      ],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const userOrders = memoryOrders.get(session.userId) || [];
    userOrders.unshift(newOrder);
    memoryOrders.set(session.userId, userOrders);

    return NextResponse.json({
      ok: true,
      order: newOrder,
    });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: { code: 'SERVER_ERROR', message: err.message } },
      { status: 500 }
    );
  }
}
