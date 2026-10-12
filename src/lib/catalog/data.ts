import { SEED_CATEGORIES, SEED_PRODUCTS } from './seed-data';
import { CatalogCategory, CatalogProduct, FilterParams } from './types';
import { createPublicClient } from '@/lib/supabase/public';

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
  let items = SEED_PRODUCTS.filter((p) => p.category_slug === params.categorySlug && p.is_active);

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
    items.sort((a, b) => a.variants[0].price_paise - b.variants[0].price_paise);
  } else if (params.sort === 'price_desc') {
    items.sort((a, b) => b.variants[0].price_paise - a.variants[0].price_paise);
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
  const product = SEED_PRODUCTS.find(
    (p) => p.category_slug === categorySlug && p.slug === productSlug && p.is_active
  );
  return product || null;
}

export async function searchProducts(query: string): Promise<CatalogProduct[]> {
  if (!query || query.trim().length === 0) return [];
  const q = query.toLowerCase().trim();

  return SEED_PRODUCTS.filter(
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

      if (data && !error) return data;
    }
  } catch {
    // fallback
  }

  // Demo review fallback for testing
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
