import { NextRequest, NextResponse } from 'next/server';
import { getAdminProductById, updateAdminProduct, deleteAdminProduct } from '@/lib/catalog/admin-store';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await getAdminProductById(id);
  if (!product) {
    return NextResponse.json(
      { ok: false, error: { code: 'NOT_FOUND', message: 'Product not found' } },
      { status: 404 }
    );
  }
  return NextResponse.json({ ok: true, product });
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();

    const updated = await updateAdminProduct(id, body);
    if (!updated) {
      return NextResponse.json(
        { ok: false, error: { code: 'NOT_FOUND', message: 'Product not found' } },
        { status: 404 }
      );
    }
    return NextResponse.json({ ok: true, product: updated });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: { code: 'UPDATE_FAILED', message: err.message || 'Failed to update product' } },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();

    const updated = await updateAdminProduct(id, body);
    if (!updated) {
      return NextResponse.json(
        { ok: false, error: { code: 'NOT_FOUND', message: 'Product not found' } },
        { status: 404 }
      );
    }
    return NextResponse.json({ ok: true, product: updated });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: { code: 'PATCH_FAILED', message: err.message || 'Failed to patch product' } },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const success = await deleteAdminProduct(id);
    return NextResponse.json({ ok: success });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: { code: 'DELETE_FAILED', message: err.message || 'Failed to delete product' } },
      { status: 500 }
    );
  }
}
