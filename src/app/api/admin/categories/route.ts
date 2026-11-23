import { NextRequest, NextResponse } from 'next/server';
import { getAllAdminCategories, createAdminCategory } from '@/lib/catalog/admin-store';
import { invalidateCategoriesCache } from '@/lib/catalog/data';
import { z } from 'zod';

const createCategorySchema = z.object({
  name: z.string().min(2, 'Category name required'),
  slug: z.string().min(2, 'Slug required'),
  tagline: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  eyebrow: z.string().nullable().optional(),
  accent: z.string().default('#B8892D'),
  imageUrl: z.string().nullable().optional(),
  sort_order: z.number().default(0),
  is_active: z.boolean().default(true),
  seo_title: z.string().nullable().optional(),
  seo_description: z.string().nullable().optional(),
});

export async function GET() {
  try {
    const categories = await getAllAdminCategories();
    return NextResponse.json({ ok: true, count: categories.length, categories });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: { code: 'FETCH_ERROR', message: err.message || 'Failed to list categories' } },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = createCategorySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, error: { code: 'INVALID_INPUT', issues: parsed.error.issues } },
        { status: 400 }
      );
    }

    const created = await createAdminCategory(parsed.data);
    invalidateCategoriesCache();
    return NextResponse.json({ ok: true, category: created }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: { code: 'CREATE_FAILED', message: err.message || 'Failed to create category' } },
      { status: 500 }
    );
  }
}
