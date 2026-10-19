import { SEED_PRODUCTS } from './seed-data';
import { CatalogProduct } from './types';
import { createAdminClient } from '@/lib/supabase/admin';

// In-memory products store populated from seed data
let inMemoryProducts: CatalogProduct[] = [...SEED_PRODUCTS];

export async function getAllAdminProducts(search?: string, categorySlug?: string) {
  // If Supabase is configured, fetch from database
  try {
    if (process.env.SUPABASE_SERVICE_ROLE_KEY && process.env.NEXT_PUBLIC_SUPABASE_URL) {
      const supabase = createAdminClient() as any;
      let query = supabase
        .from('products')
        .select(`
          id, category_id, slug, name, short_description, description, attributes,
          option_names, badge, is_active, is_featured, seo_title, seo_description,
          seo_keywords, thumbnail_url, created_at,
          categories!inner(slug),
          product_variants(*),
          product_images(*)
        `)
        .order('created_at', { ascending: false });

      if (categorySlug) {
        query = query.eq('categories.slug', categorySlug);
      }
      if (search) {
        query = query.ilike('name', `%${search}%`);
      }

      const { data, error } = await query;
      if (!error && data && data.length > 0) {
        return data.map((p: any) => ({
          id: p.id,
          category_id: p.category_id,
          category_slug: p.categories?.slug || 'bridal',
          slug: p.slug,
          name: p.name,
          short_description: p.short_description,
          description: p.description,
          attributes: p.attributes || {},
          option_names: p.option_names || [],
          badge: p.badge,
          is_active: p.is_active,
          is_featured: p.is_featured || false,
          seo_title: p.seo_title,
          seo_description: p.seo_description,
          seo_keywords: p.seo_keywords || [],
          thumbnail_url: p.thumbnail_url || p.product_images?.find((img: any) => img.is_primary)?.storage_path || null,
          variants: p.product_variants || [],
          images: p.product_images || [],
          created_at: p.created_at,
          rating: { avg_rating: 4.8, review_count: 12 },
        }));
      }
    }
  } catch (err) {
    console.warn('Supabase products fetch failed, using memory store:', err);
  }

  // Memory fallback filter
  let result = [...inMemoryProducts];
  if (categorySlug) {
    result = result.filter((p) => p.category_slug === categorySlug);
  }
  if (search) {
    const q = search.toLowerCase();
    result = result.filter((p) => p.name.toLowerCase().includes(q) || p.slug.toLowerCase().includes(q));
  }
  return result;
}

export async function getAdminProductById(id: string): Promise<CatalogProduct | null> {
  // Check memory first or database
  const found = inMemoryProducts.find((p) => p.id === id || p.slug === id);
  if (found) return found;

  try {
    if (process.env.SUPABASE_SERVICE_ROLE_KEY && process.env.NEXT_PUBLIC_SUPABASE_URL) {
      const supabase = createAdminClient() as any;
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          categories!inner(slug),
          product_variants(*),
          product_images(*)
        `)
        .eq('id', id)
        .single();

      if (!error && data) {
        return {
          id: data.id,
          category_id: data.category_id,
          category_slug: data.categories?.slug,
          slug: data.slug,
          name: data.name,
          short_description: data.short_description,
          description: data.description,
          attributes: data.attributes || {},
          option_names: data.option_names || [],
          badge: data.badge,
          is_active: data.is_active,
          is_featured: data.is_featured || false,
          seo_title: data.seo_title,
          seo_description: data.seo_description,
          seo_keywords: data.seo_keywords || [],
          thumbnail_url: data.thumbnail_url,
          variants: data.product_variants || [],
          images: data.product_images || [],
          created_at: data.created_at,
          rating: { avg_rating: 5, review_count: 8 },
        };
      }
    }
  } catch {
    // fallback
  }

  return null;
}

import crypto from 'crypto';

const CATEGORY_MAP: Record<string, string> = {
  bridal: '11111111-1111-1111-1111-111111111111',
  naturals: '22222222-2222-2222-2222-222222222222',
  'coconut-oil': '33333333-3333-3333-3333-333333333333',
};

export async function createAdminProduct(productData: any): Promise<CatalogProduct> {
  const newId =
    productData.id && productData.id.length === 36 && productData.id.includes('-')
      ? productData.id
      : crypto.randomUUID();

  const categoryId =
    productData.category_id ||
    CATEGORY_MAP[productData.category_slug] ||
    CATEGORY_MAP['bridal'];

  // Choose primary thumbnail
  const primaryImg = productData.images?.find((img: any) => img.is_primary);
  const thumbnailUrl = primaryImg?.storage_path || productData.images?.[0]?.storage_path || null;

  const newProduct: CatalogProduct = {
    id: newId,
    category_id: categoryId,
    category_slug: productData.category_slug || 'bridal',
    slug: productData.slug,
    name: productData.name,
    short_description: productData.short_description || null,
    description: productData.description || null,
    attributes: productData.attributes || {},
    option_names: productData.option_names || [],
    badge: productData.badge || null,
    is_active: productData.is_active !== undefined ? productData.is_active : true,
    is_featured: !!productData.is_featured,
    seo_title: productData.seo_title || `${productData.name} | BarakahBazaar`,
    seo_description: productData.seo_description || productData.short_description || '',
    seo_keywords: productData.seo_keywords || [],
    thumbnail_url: thumbnailUrl,
    variants: (productData.variants || []).map((v: any, idx: number) => ({
      id: v.id && v.id.length === 36 && v.id.includes('-') ? v.id : crypto.randomUUID(),
      product_id: newId,
      sku: v.sku || `${productData.slug.toUpperCase()}-${idx + 1}`,
      label: v.label || 'Default',
      option_values: v.option_values || {},
      price_paise: Number(v.price_paise) || 0,
      compare_at_price_paise: v.compare_at_price_paise ? Number(v.compare_at_price_paise) : null,
      stock: Number(v.stock) || 0,
      net_quantity: v.net_quantity ? Number(v.net_quantity) : null,
      net_unit: v.net_unit || null,
      is_active: v.is_active !== undefined ? v.is_active : true,
    })),
    images: (productData.images || []).map((img: any, idx: number) => ({
      id: img.id && img.id.length === 36 && img.id.includes('-') ? img.id : crypto.randomUUID(),
      storage_path: img.storage_path,
      cloudinary_public_id: img.cloudinary_public_id || null,
      width: img.width || null,
      height: img.height || null,
      alt: img.alt || productData.name,
      sort_order: img.sort_order ?? idx,
      is_primary: !!img.is_primary,
    })),
    created_at: new Date().toISOString(),
    rating: { avg_rating: 5, review_count: 0 },
  };

  // Push to memory
  inMemoryProducts.unshift(newProduct);

  // If Supabase is connected, insert to tables
  if (process.env.SUPABASE_SERVICE_ROLE_KEY && process.env.NEXT_PUBLIC_SUPABASE_URL) {
    const supabase = createAdminClient() as any;
    const { error: prodErr } = await supabase.from('products').insert({
      id: newProduct.id,
      category_id: newProduct.category_id,
      slug: newProduct.slug,
      name: newProduct.name,
      short_description: newProduct.short_description,
      description: newProduct.description,
      attributes: newProduct.attributes,
      option_names: newProduct.option_names,
      badge: newProduct.badge,
      is_active: newProduct.is_active,
      is_featured: newProduct.is_featured,
      seo_title: newProduct.seo_title,
      seo_description: newProduct.seo_description,
      seo_keywords: newProduct.seo_keywords,
      thumbnail_url: newProduct.thumbnail_url,
    });

    if (prodErr) {
      console.error('Supabase product insert error:', prodErr);
      throw new Error(prodErr.message || 'Database product insert failed');
    }

    if (newProduct.variants.length > 0) {
      const { error: varErr } = await supabase.from('product_variants').insert(
        newProduct.variants.map((v) => ({
          id: v.id,
          product_id: newProduct.id,
          sku: v.sku,
          label: v.label,
          option_values: v.option_values,
          price_paise: v.price_paise,
          compare_at_price_paise: v.compare_at_price_paise,
          stock: v.stock,
          net_quantity: v.net_quantity,
          net_unit: v.net_unit,
          is_active: v.is_active,
        }))
      );
      if (varErr) {
        console.error('Supabase variant insert error:', varErr);
      }
    }

    if (newProduct.images.length > 0) {
      const { error: imgErr } = await supabase.from('product_images').insert(
        newProduct.images.map((img) => ({
          id: img.id,
          product_id: newProduct.id,
          storage_path: img.storage_path,
          alt: img.alt,
          sort_order: img.sort_order,
          is_primary: img.is_primary,
        }))
      );
      if (imgErr) {
        console.error('Supabase image insert error:', imgErr);
      }
    }
  }

  return newProduct;
}

export async function updateAdminProduct(id: string, updateData: any): Promise<CatalogProduct | null> {
  const idx = inMemoryProducts.findIndex((p) => p.id === id);
  if (idx === -1) return null;

  const current = inMemoryProducts[idx];
  const primaryImg = updateData.images?.find((img: any) => img.is_primary);
  const thumbnailUrl = primaryImg?.storage_path || updateData.thumbnail_url || current.thumbnail_url;

  const updated: CatalogProduct = {
    ...current,
    ...updateData,
    id: current.id,
    thumbnail_url: thumbnailUrl,
    variants: updateData.variants || current.variants,
    images: updateData.images || current.images,
  };

  inMemoryProducts[idx] = updated;

  // Supabase update if configured
  try {
    if (process.env.SUPABASE_SERVICE_ROLE_KEY && process.env.NEXT_PUBLIC_SUPABASE_URL) {
      const supabase = createAdminClient() as any;
      await supabase
        .from('products')
        .update({
          name: updated.name,
          slug: updated.slug,
          category_id: updated.category_id,
          badge: updated.badge,
          short_description: updated.short_description,
          description: updated.description,
          is_active: updated.is_active,
          is_featured: updated.is_featured,
          seo_title: updated.seo_title,
          seo_description: updated.seo_description,
          seo_keywords: updated.seo_keywords,
          thumbnail_url: updated.thumbnail_url,
        })
        .eq('id', id);
    }
  } catch (err) {
    console.warn('Supabase product update error:', err);
  }

  return updated;
}

export async function deleteAdminProduct(id: string): Promise<boolean> {
  const idx = inMemoryProducts.findIndex((p) => p.id === id);
  if (idx !== -1) {
    inMemoryProducts.splice(idx, 1);
  }

  try {
    if (process.env.SUPABASE_SERVICE_ROLE_KEY && process.env.NEXT_PUBLIC_SUPABASE_URL) {
      const supabase = createAdminClient();
      await supabase.from('products').delete().eq('id', id);
    }
  } catch {
    // fallback
  }

  return true;
}
