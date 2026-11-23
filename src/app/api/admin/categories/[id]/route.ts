import { NextRequest, NextResponse } from 'next/server';
import { getAdminCategoryById, updateAdminCategory, deleteAdminCategory } from '@/lib/catalog/admin-store';
import { invalidateCategoriesCache } from '@/lib/catalog/data';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const category = await getAdminCategoryById(id);
  if (!category) {
    return NextResponse.json(
      { ok: false, error: { code: 'NOT_FOUND', message: 'Category not found' } },
      { status: 404 }
    );
  }
  return NextResponse.json({ ok: true, category });
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();

    const updated = await updateAdminCategory(id, body);
    if (!updated) {
      return NextResponse.json(
        { ok: false, error: { code: 'NOT_FOUND', message: 'Category not found' } },
        { status: 404 }
      );
    }
    invalidateCategoriesCache();
    return NextResponse.json({ ok: true, category: updated });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: { code: 'UPDATE_FAILED', message: err.message || 'Failed to update category' } },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const ok = await deleteAdminCategory(id);
    invalidateCategoriesCache();
    return NextResponse.json({ ok });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: { code: 'DELETE_FAILED', message: err.message || 'Failed to delete category' } },
      { status: 500 }
    );
  }
}
