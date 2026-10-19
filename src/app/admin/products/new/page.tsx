'use client';

import React from 'react';
import { ProductEditorForm } from '@/components/admin/ProductEditorForm';

export default function NewProductPage() {
  return <ProductEditorForm isEditing={false} />;
}
