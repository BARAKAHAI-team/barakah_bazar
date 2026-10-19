'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { ProductEditorForm } from '@/components/admin/ProductEditorForm';
import { CatalogProduct } from '@/lib/catalog/types';

export default function EditProductPage() {
  const params = useParams();
  const id = params?.id as string;
  const [product, setProduct] = useState<CatalogProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    async function fetchProduct() {
      if (!id) return;
      try {
        const res = await fetch(`/api/admin/products/${id}`);
        if (res.ok) {
          const data = await res.json();
          setProduct(data.product);
        } else {
          setNotFound(true);
        }
      } catch {
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    }
    fetchProduct();
  }, [id]);

  if (loading) {
    return (
      <div className="p-12 text-center text-sm text-[#786F5E]">
        Loading product details...
      </div>
    );
  }

  if (notFound || !product) {
    return (
      <div className="p-12 text-center space-y-3 bg-white rounded-xl border border-[#E8DCC2]">
        <h2 className="text-lg font-bold text-[#16140F]">Product Not Found</h2>
        <p className="text-xs text-[#786F5E]">
          The requested product ID could not be loaded from the catalog.
        </p>
      </div>
    );
  }

  return <ProductEditorForm initialProduct={product} isEditing={true} />;
}
