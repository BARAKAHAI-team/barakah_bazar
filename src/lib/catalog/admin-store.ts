import { SEED_PRODUCTS, SEED_CATEGORIES } from './seed-data';
import { CatalogProduct, CatalogCategory } from './types';
import { createAdminClient } from '@/lib/supabase/admin';

// In-memory products store populated from seed data
let inMemoryProducts: CatalogProduct[] = [...SEED_PRODUCTS];

// In-memory categories store populated from initial categories
export let inMemoryCategories: (CatalogCategory & { productCount?: number })[] = [
  {
    id: '11111111-1111-1111-1111-111111111111',
    slug: 'bridal',
    name: 'Barakah Bridal Collections',
    tagline: 'Curated bridal couture, festive lehengas & embroidered suits',
    description: 'Exquisite bridal and festive ensembles crafted with intricate zari needlework, tilla embroidery, and rich royal silks.',
    accent: '#7A1A28',
    eyebrow: 'ROYAL ATTIRE & BESPOKE COUTURE',
    imageUrl: '/images/home/products/bridal_suit_a.jpg',
    sort_order: 1,
    is_active: true,
    seo_title: 'Barakah Bridal Collections | Royal Indian Festive & Wedding Wear',
    seo_description: 'Explore Barakah Bridal Collections: handcrafted bridal lehengas, festive suits, and heirloom wedding ensembles.',
  },
  {
    id: '22222222-2222-2222-2222-222222222222',
    slug: 'naturals',
    name: 'Barakah Naturals',
    tagline: 'Artisanal scented candles & single-origin natural spices',
    description: 'Handcrafted luxury soy candles, bespoke aromatic gifts, and organic spices sourced directly from agricultural growers.',
    accent: '#5B1730',
    eyebrow: 'BOTANICAL WELLNESS & SPICES',
    imageUrl: '/images/home/products/candle_rose_a.jpg',
    sort_order: 2,
    is_active: true,
    seo_title: 'Barakah Naturals | Luxury Scented Candles & Organic Spices',
    seo_description: 'Discover Barakah Naturals: artisanal soy wax candles, festive candle gift hampers, and single-origin Kerala spices.',
  },
  {
    id: '33333333-3333-3333-3333-333333333333',
    slug: 'coconut-oil',
    name: 'Barakah Kerala Pure Coconut Oil',
    tagline: '100% pure & natural traditional cold-pressed Kerala coconut oil',
    description: 'Pure, unrefined coconut oil extracted from handpicked sun-dried Kerala copra for culinary, hair, and holistic wellness.',
    accent: '#8A641A',
    eyebrow: 'HERITAGE OIL',
    imageUrl: '/images/home/products/oil_500ml_a.jpg',
    sort_order: 3,
    is_active: true,
    seo_title: 'Kerala Pure Coconut Oil | 100% Pure, Cold-Pressed & Unrefined',
    seo_description: 'Traditional Kerala coconut oil, cold-pressed and pure in convenient 300ml, 500ml, and 1 Litre packs.',
  },
];

export async function getAllAdminCategories() {
  let categoriesMap = new Map<string, CatalogCategory>();

  // Initialize with inMemoryCategories
  inMemoryCategories.forEach((cat) => {
    categoriesMap.set(cat.slug, { ...cat });
  });

  // Fetch from Supabase if available
  try {
    if (process.env.SUPABASE_SERVICE_ROLE_KEY && process.env.NEXT_PUBLIC_SUPABASE_URL) {
      const supabase = createAdminClient() as any;
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('sort_order', { ascending: true });

      if (!error && data && data.length > 0) {
        data.forEach((dbCat: any) => {
          const existing = categoriesMap.get(dbCat.slug);
          categoriesMap.set(dbCat.slug, {
            id: dbCat.id,
            slug: dbCat.slug,
            name: dbCat.name,
            tagline: dbCat.tagline,
            description: dbCat.description,
            accent: dbCat.accent || existing?.accent || '#B8892D',
            eyebrow: dbCat.eyebrow || existing?.eyebrow || dbCat.name.toUpperCase(),
            imageUrl: dbCat.image_url || existing?.imageUrl || null,
            sort_order: dbCat.sort_order ?? 0,
            is_active: dbCat.is_active !== undefined ? dbCat.is_active : true,
            seo_title: dbCat.seo_title,
            seo_description: dbCat.seo_description,
          });
        });
      }
    }
  } catch (err) {
    console.warn('Supabase categories fetch error:', err);
  }

  // Calculate product counts
  const allProducts = await getAllAdminProducts();
  const result = Array.from(categoriesMap.values()).map((cat) => {
    const count = allProducts.filter(
      (p: CatalogProduct) => p.category_slug === cat.slug || p.category_id === cat.id
    ).length;
    return {
      ...cat,
      productCount: count,
    };
  });

  result.sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
  return result;
}

export async function getAdminCategoryById(idOrSlug: string): Promise<CatalogCategory | null> {
  const all = await getAllAdminCategories();
  return all.find((c) => c.id === idOrSlug || c.slug === idOrSlug) || null;
}

export async function createAdminCategory(data: any): Promise<CatalogCategory> {
  const slug = (data.slug || data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')).replace(/(^-|-$)/g, '');
  const id = data.id && data.id.length === 36 ? data.id : crypto.randomUUID();

  const newCat: CatalogCategory = {
    id,
    slug,
    name: data.name,
    tagline: data.tagline || null,
    description: data.description || null,
    accent: data.accent || '#B8892D',
    eyebrow: data.eyebrow || data.name.toUpperCase(),
    imageUrl: data.imageUrl || data.image_url || null,
    sort_order: data.sort_order !== undefined ? Number(data.sort_order) : inMemoryCategories.length + 1,
    is_active: data.is_active !== undefined ? !!data.is_active : true,
    seo_title: data.seo_title || `${data.name} | BarakahBazar`,
    seo_description: data.seo_description || data.description || '',
  };

  // Update in memory
  const existingIdx = inMemoryCategories.findIndex((c) => c.slug === slug || c.id === id);
  if (existingIdx >= 0) {
    inMemoryCategories[existingIdx] = newCat;
  } else {
    inMemoryCategories.push(newCat);
  }

  // Update in Supabase
  try {
    if (process.env.SUPABASE_SERVICE_ROLE_KEY && process.env.NEXT_PUBLIC_SUPABASE_URL) {
      const supabase = createAdminClient() as any;
      const { error } = await supabase.from('categories').insert({
        id: newCat.id,
        slug: newCat.slug,
        name: newCat.name,
        tagline: newCat.tagline,
        description: newCat.description,
        sort_order: newCat.sort_order,
        is_active: newCat.is_active,
        seo_title: newCat.seo_title,
        seo_description: newCat.seo_description,
        image_url: newCat.imageUrl || null,
        accent: newCat.accent || '#B8892D',
        eyebrow: newCat.eyebrow || null,
      });

      if (error) {
        console.warn('Supabase category insert warning (check constraint or column):', error.message);
      }
    }
  } catch (err) {
    console.warn('Supabase category insert error:', err);
  }

  return newCat;
}

export async function updateAdminCategory(idOrSlug: string, updateData: any): Promise<CatalogCategory | null> {
  const current = inMemoryCategories.find((c) => c.id === idOrSlug || c.slug === idOrSlug);
  const updated: CatalogCategory = {
    ...(current || {
      id: crypto.randomUUID(),
      slug: idOrSlug,
      name: updateData.name || idOrSlug,
      accent: '#B8892D',
      tagline: null,
      description: null,
    }),
    ...updateData,
    id: current?.id || updateData.id || idOrSlug,
    slug: updateData.slug || current?.slug || idOrSlug,
  };

  const idx = inMemoryCategories.findIndex((c) => c.id === idOrSlug || c.slug === idOrSlug);
  if (idx >= 0) {
    inMemoryCategories[idx] = updated;
  } else {
    inMemoryCategories.push(updated);
  }

  try {
    if (process.env.SUPABASE_SERVICE_ROLE_KEY && process.env.NEXT_PUBLIC_SUPABASE_URL) {
      const supabase = createAdminClient() as any;
      await supabase
        .from('categories')
        .update({
          name: updated.name,
          slug: updated.slug,
          tagline: updated.tagline,
          description: updated.description,
          sort_order: updated.sort_order,
          is_active: updated.is_active,
          seo_title: updated.seo_title,
          seo_description: updated.seo_description,
          image_url: updated.imageUrl || null,
          accent: updated.accent || '#B8892D',
          eyebrow: updated.eyebrow || null,
        })
        .or(`id.eq.${updated.id},slug.eq.${idOrSlug}`);
    }
  } catch (err) {
    console.warn('Supabase category update error:', err);
  }

  return updated;
}

export async function deleteAdminCategory(idOrSlug: string): Promise<boolean> {
  const idx = inMemoryCategories.findIndex((c) => c.id === idOrSlug || c.slug === idOrSlug);
  if (idx >= 0) {
    inMemoryCategories.splice(idx, 1);
  }

  try {
    if (process.env.SUPABASE_SERVICE_ROLE_KEY && process.env.NEXT_PUBLIC_SUPABASE_URL) {
      const supabase = createAdminClient() as any;
      await supabase
        .from('categories')
        .delete()
        .or(`id.eq.${idOrSlug},slug.eq.${idOrSlug}`);
    }
  } catch (err) {
    console.warn('Supabase category delete error:', err);
  }

  return true;
}

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

  const foundCat = inMemoryCategories.find(
    (c) => c.slug === productData.category_slug || c.id === productData.category_id
  );
  const categoryId =
    productData.category_id ||
    foundCat?.id ||
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
