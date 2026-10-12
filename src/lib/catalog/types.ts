export interface CatalogCategory {
  id: string;
  slug: 'bridal' | 'naturals' | 'coconut-oil';
  name: string;
  tagline: string | null;
  description: string | null;
  accent: string;
  imageUrl?: string | null;
  seo_title?: string | null;
  seo_description?: string | null;
}

export interface CatalogVariant {
  id: string;
  product_id: string;
  sku: string;
  label: string;
  option_values: Record<string, string>;
  price_paise: number;
  compare_at_price_paise: number | null;
  stock: number;
  net_quantity: number | null;
  net_unit: 'g' | 'ml' | 'piece' | null;
  is_active: boolean;
}

export interface CatalogImage {
  id: string;
  storage_path: string | null;
  alt: string;
  sort_order: number;
  is_primary: boolean;
}

export interface CatalogProduct {
  id: string;
  category_id: string;
  category_slug: 'bridal' | 'naturals' | 'coconut-oil';
  slug: string;
  name: string;
  short_description: string | null;
  description: string | null;
  attributes: Record<string, any>;
  option_names: string[];
  badge: string | null;
  is_active: boolean;
  variants: CatalogVariant[];
  images: CatalogImage[];
  rating: {
    avg_rating: number;
    review_count: number;
  };
}

export interface FilterParams {
  categorySlug: string;
  minPrice?: number;
  maxPrice?: number;
  size?: string;
  colour?: string;
  packSize?: string;
  occasion?: string;
  subCategory?: string;
  sort?: 'newest' | 'price_asc' | 'price_desc';
  page?: number;
  limit?: number;
}
