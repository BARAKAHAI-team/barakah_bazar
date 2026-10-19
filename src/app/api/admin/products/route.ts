import { NextRequest, NextResponse } from 'next/server';
import { getAllAdminProducts, createAdminProduct } from '@/lib/catalog/admin-store';
import { z } from 'zod';

const createProductSchema = z.object({
  name: z.string().min(2, 'Product name required'),
  slug: z.string().min(2, 'Slug required'),
  category_slug: z.enum(['bridal', 'naturals', 'coconut-oil']),
  badge: z.string().nullable().optional(),
  short_description: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  is_featured: z.boolean().default(false),
  is_active: z.boolean().default(true),
  seo_title: z.string().nullable().optional(),
  seo_description: z.string().nullable().optional(),
  seo_keywords: z.array(z.string()).default([]),
  images: z.array(
    z.object({
      storage_path: z.string(),
      cloudinary_public_id: z.string().nullable().optional(),
      alt: z.string().default(''),
      sort_order: z.number().default(0),
      is_primary: z.boolean().default(false),
      width: z.number().nullable().optional(),
      height: z.number().nullable().optional(),
    })
  ).default([]),
  variants: z.array(
    z.object({
      label: z.string().min(1, 'Variant label required'),
      sku: z.string().min(1, 'SKU required'),
      price_paise: z.number().min(1, 'Price must be greater than 0'),
      compare_at_price_paise: z.number().nullable().optional(),
      stock: z.number().min(0, 'Stock cannot be negative'),
      net_quantity: z.number().nullable().optional(),
      net_unit: z.enum(['g', 'ml', 'piece']).nullable().optional(),
      option_values: z.record(z.string(), z.any()).default({}),
    })
  ).min(1, 'At least one variant required'),
});

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const search = searchParams.get('search') || undefined;
    const category = searchParams.get('category') || undefined;

    const products = await getAllAdminProducts(search, category);
    return NextResponse.json({ ok: true, count: products.length, products });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: { code: 'FETCH_ERROR', message: err.message || 'Failed to list products' } },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = createProductSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, error: { code: 'INVALID_INPUT', issues: parsed.error.issues } },
        { status: 400 }
      );
    }

    const created = await createAdminProduct(parsed.data);
    return NextResponse.json({ ok: true, product: created }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: { code: 'CREATE_FAILED', message: err.message || 'Failed to create product' } },
      { status: 500 }
    );
  }
}
