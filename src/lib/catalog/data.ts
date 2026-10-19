import { SEED_CATEGORIES, SEED_PRODUCTS } from './seed-data';
import { CatalogCategory, CatalogProduct, FilterParams } from './types';
import { createPublicClient } from '@/lib/supabase/public';

// Helper to fetch live products from Supabase
async function fetchDbProducts(categorySlug?: string): Promise<CatalogProduct[] | null> {
  try {
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      const supabase = createPublicClient() as any;
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
        .eq('is_active', true);

      if (categorySlug) {
        query = query.eq('categories.slug', categorySlug);
      }

      const { data, error } = await query;
      if (!error && data && data.length > 0) {
        return data.map((p: any) => ({
          id: p.id,
          category_id: p.category_id,
          category_slug: p.categories?.slug || categorySlug || 'bridal',
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
          variants: (p.product_variants || []).map((v: any) => ({
            id: v.id,
            product_id: p.id,
            sku: v.sku,
            label: v.label,
            option_values: v.option_values || {},
            price_paise: v.price_paise,
            compare_at_price_paise: v.compare_at_price_paise,
            stock: v.stock,
            net_quantity: v.net_quantity,
            net_unit: v.net_unit,
            is_active: v.is_active,
          })),
          images: (p.product_images || []).map((img: any) => ({
            id: img.id,
            storage_path: img.storage_path,
            alt: img.alt || p.name,
            sort_order: img.sort_order || 0,
            is_primary: img.is_primary || false,
          })),
          created_at: p.created_at,
          rating: { avg_rating: 4.8, review_count: 14 },
        }));
      }
    }
  } catch (err) {
    console.warn('Supabase products fetch failed, falling back to seed:', err);
  }
  return null;
}

export async function getCategoryBySlug(slug: string): Promise<CatalogCategory | null> {
  const category = SEED_CATEGORIES[slug];
  if (!category) return null;

  try {
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      const supabase = createPublicClient();
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('slug', slug as 'bridal' | 'naturals' | 'coconut-oil')
        .eq('is_active', true)
        .single();

      if (data && !error) {
        return {
          ...category,
          id: data.id,
          name: data.name,
          tagline: data.tagline,
          description: data.description,
          seo_title: data.seo_title,
          seo_description: data.seo_description,
        };
      }
    }
  } catch {
    // fallback
  }

  return category;
}

export async function listCategoryProducts(params: FilterParams): Promise<{
  products: CatalogProduct[];
  total: number;
  totalPages: number;
}> {
  // Query Supabase live products first
  const dbProducts = await fetchDbProducts(params.categorySlug);
  let items = dbProducts || SEED_PRODUCTS.filter((p) => p.category_slug === params.categorySlug && p.is_active);

  // Price filter
  if (params.minPrice !== undefined) {
    items = items.filter((p) => p.variants.some((v) => v.price_paise >= (params.minPrice! * 100)));
  }
  if (params.maxPrice !== undefined) {
    items = items.filter((p) => p.variants.some((v) => v.price_paise <= (params.maxPrice! * 100)));
  }

  // Option filters (size, colour, packSize, occasion)
  if (params.size) {
    items = items.filter((p) =>
      p.variants.some((v) => v.option_values['Size']?.toLowerCase() === params.size?.toLowerCase())
    );
  }
  if (params.colour) {
    items = items.filter((p) =>
      p.variants.some((v) => v.option_values['Colour']?.toLowerCase() === params.colour?.toLowerCase())
    );
  }
  if (params.packSize) {
    items = items.filter((p) =>
      p.variants.some((v) => v.option_values['Pack size']?.toLowerCase() === params.packSize?.toLowerCase())
    );
  }
  if (params.occasion) {
    items = items.filter(
      (p) => p.attributes?.occasion?.toLowerCase() === params.occasion?.toLowerCase()
    );
  }
  if (params.subCategory) {
    items = items.filter(
      (p) => p.attributes?.sub_category?.toLowerCase() === params.subCategory?.toLowerCase()
    );
  }

  // Sort
  if (params.sort === 'price_asc') {
    items.sort((a, b) => (a.variants[0]?.price_paise || 0) - (b.variants[0]?.price_paise || 0));
  } else if (params.sort === 'price_desc') {
    items.sort((a, b) => (b.variants[0]?.price_paise || 0) - (a.variants[0]?.price_paise || 0));
  }

  const page = params.page || 1;
  const limit = params.limit || 24;
  const total = items.length;
  const totalPages = Math.ceil(total / limit) || 1;
  const offset = (page - 1) * limit;

  return {
    products: items.slice(offset, offset + limit),
    total,
    totalPages,
  };
}

export async function getProductBySlug(
  categorySlug: string,
  productSlug: string
): Promise<CatalogProduct | null> {
  // Query Supabase directly
  try {
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      const supabase = createPublicClient() as any;
      const { data, error } = await supabase
        .from('products')
        .select(`
          id, category_id, slug, name, short_description, description, attributes,
          option_names, badge, is_active, is_featured, seo_title, seo_description,
          seo_keywords, thumbnail_url, created_at,
          categories!inner(slug),
          product_variants(*),
          product_images(*)
        `)
        .eq('slug', productSlug)
        .eq('categories.slug', categorySlug)
        .eq('is_active', true)
        .maybeSingle();

      if (!error && data) {
        return {
          id: data.id,
          category_id: data.category_id,
          category_slug: data.categories?.slug || categorySlug,
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
          variants: (data.product_variants || []).map((v: any) => ({
            id: v.id,
            product_id: data.id,
            sku: v.sku,
            label: v.label,
            option_values: v.option_values || {},
            price_paise: v.price_paise,
            compare_at_price_paise: v.compare_at_price_paise,
            stock: v.stock,
            net_quantity: v.net_quantity,
            net_unit: v.net_unit,
            is_active: v.is_active,
          })),
          images: (data.product_images || []).map((img: any) => ({
            id: img.id,
            storage_path: img.storage_path,
            alt: img.alt || data.name,
            sort_order: img.sort_order || 0,
            is_primary: img.is_primary || false,
          })),
          created_at: data.created_at,
          rating: { avg_rating: 4.8, review_count: 14 },
        };
      }
    }
  } catch {
    // fallback
  }

  // Fallback to memory
  const product = SEED_PRODUCTS.find(
    (p) => p.category_slug === categorySlug && p.slug === productSlug && p.is_active
  );
  return product || null;
}

export async function searchProducts(query: string): Promise<CatalogProduct[]> {
  if (!query || query.trim().length === 0) return [];
  const q = query.toLowerCase().trim();

  // Try live database first
  const dbProducts = await fetchDbProducts();
  const source = dbProducts || SEED_PRODUCTS;

  return source.filter(
    (p) =>
      p.is_active &&
      (p.name.toLowerCase().includes(q) ||
        p.short_description?.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q) ||
        p.category_slug.includes(q))
  );
}

export async function getProductReviews(productId: string) {
  try {
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      const supabase = createPublicClient();
      const { data, error } = await supabase
        .from('public_reviews')
        .select('*')
        .eq('product_id', productId)
        .order('created_at', { ascending: false });

      if (data && !error && data.length > 0) return data;
    }
  } catch {
    // fallback
  }

  // Demo reviews fallback
  return [
    {
      id: 'rev-1',
      product_id: productId,
      rating: 5,
      comment: 'Exceptional craftsmanship and authentic finish. Delivered in pristine condition.',
      reviewer_name: 'Amina',
      created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
    },
    {
      id: 'rev-2',
      product_id: productId,
      rating: 5,
      comment: 'Very pleased with the purity and quality. Exceeded expectations.',
      reviewer_name: 'Rahul',
      created_at: new Date(Date.now() - 86400000 * 7).toISOString(),
    },
  ];
}
