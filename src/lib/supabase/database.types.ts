export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      categories: {
        Row: {
          id: string;
          slug: 'bridal' | 'naturals' | 'coconut-oil';
          name: string;
          tagline: string | null;
          description: string | null;
          parent_id: string | null;
          sort_order: number;
          is_active: boolean;
          seo_title: string | null;
          seo_description: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          slug: 'bridal' | 'naturals' | 'coconut-oil';
          name: string;
          tagline?: string | null;
          description?: string | null;
          parent_id?: string | null;
          sort_order?: number;
          is_active?: boolean;
          seo_title?: string | null;
          seo_description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          slug?: 'bridal' | 'naturals' | 'coconut-oil';
          name?: string;
          tagline?: string | null;
          description?: string | null;
          parent_id?: string | null;
          sort_order?: number;
          is_active?: boolean;
          seo_title?: string | null;
          seo_description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      products: {
        Row: {
          id: string;
          category_id: string;
          slug: string;
          name: string;
          short_description: string | null;
          description: string | null;
          attributes: Record<string, unknown>;
          option_names: string[];
          badge: string | null;
          is_active: boolean;
          is_featured: boolean;
          seo_title: string | null;
          seo_description: string | null;
          seo_keywords: string[];
          thumbnail_url: string | null;
          created_at: string;
          updated_at: string;
          search_vector: unknown | null;
        };
        Insert: {
          id?: string;
          category_id: string;
          slug: string;
          name: string;
          short_description?: string | null;
          description?: string | null;
          attributes?: Record<string, unknown>;
          option_names?: string[];
          badge?: string | null;
          is_active?: boolean;
          is_featured?: boolean;
          seo_title?: string | null;
          seo_description?: string | null;
          seo_keywords?: string[];
          thumbnail_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          category_id?: string;
          slug?: string;
          name?: string;
          short_description?: string | null;
          description?: string | null;
          attributes?: Record<string, unknown>;
          option_names?: string[];
          badge?: string | null;
          is_active?: boolean;
          is_featured?: boolean;
          seo_title?: string | null;
          seo_description?: string | null;
          seo_keywords?: string[];
          thumbnail_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      product_variants: {
        Row: {
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
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          product_id: string;
          sku: string;
          label: string;
          option_values?: Record<string, string>;
          price_paise: number;
          compare_at_price_paise?: number | null;
          stock?: number;
          net_quantity?: number | null;
          net_unit?: 'g' | 'ml' | 'piece' | null;
          is_active?: boolean;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          product_id?: string;
          sku?: string;
          label?: string;
          option_values?: Record<string, string>;
          price_paise?: number;
          compare_at_price_paise?: number | null;
          stock?: number;
          net_quantity?: number | null;
          net_unit?: 'g' | 'ml' | 'piece' | null;
          is_active?: boolean;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      product_images: {
        Row: {
          id: string;
          product_id: string;
          variant_id: string | null;
          storage_path: string | null;
          alt: string;
          sort_order: number;
          is_primary: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          product_id: string;
          variant_id?: string | null;
          storage_path?: string | null;
          alt?: string;
          sort_order?: number;
          is_primary?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          product_id?: string;
          variant_id?: string | null;
          storage_path?: string | null;
          alt?: string;
          sort_order?: number;
          is_primary?: boolean;
          created_at?: string;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          id: string;
          name: string | null;
          phone: string;
          email: string | null;
          profile_completed: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          name?: string | null;
          phone: string;
          email?: string | null;
          profile_completed?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string | null;
          phone?: string;
          email?: string | null;
          profile_completed?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      otp_requests: {
        Row: {
          id: string;
          phone: string;
          otp_hash: string;
          expires_at: string;
          attempts: number;
          consumed_at: string | null;
          ip: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          phone: string;
          otp_hash: string;
          expires_at: string;
          attempts?: number;
          consumed_at?: string | null;
          ip?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          phone?: string;
          otp_hash?: string;
          expires_at?: string;
          attempts?: number;
          consumed_at?: string | null;
          ip?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      cart_items: {
        Row: {
          id: string;
          user_id: string;
          variant_id: string;
          qty: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          variant_id: string;
          qty: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          variant_id?: string;
          qty?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      wishlist_items: {
        Row: {
          user_id: string;
          product_id: string;
          created_at: string;
        };
        Insert: {
          user_id: string;
          product_id: string;
          created_at?: string;
        };
        Update: {
          user_id?: string;
          product_id?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      addresses: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          phone: string;
          line1: string;
          line2: string | null;
          landmark: string | null;
          city: string;
          state: string;
          pincode: string;
          latitude: number;
          longitude: number;
          is_default: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          phone: string;
          line1: string;
          line2?: string | null;
          landmark?: string | null;
          city: string;
          state: string;
          pincode: string;
          latitude: number;
          longitude: number;
          is_default?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          phone?: string;
          line1?: string;
          line2?: string | null;
          landmark?: string | null;
          city?: string;
          state?: string;
          pincode?: string;
          latitude?: number;
          longitude?: number;
          is_default?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      coupons: {
        Row: {
          id: string;
          code: string;
          type: 'PERCENT' | 'FLAT';
          value: number;
          max_discount_paise: number | null;
          min_order_paise: number;
          valid_from: string;
          valid_to: string;
          is_active: boolean;
          used_count: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          code: string;
          type: 'PERCENT' | 'FLAT';
          value: number;
          max_discount_paise?: number | null;
          min_order_paise?: number;
          valid_from: string;
          valid_to: string;
          is_active?: boolean;
          used_count?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          code?: string;
          type?: 'PERCENT' | 'FLAT';
          value?: number;
          max_discount_paise?: number | null;
          min_order_paise?: number;
          valid_from?: string;
          valid_to?: string;
          is_active?: boolean;
          used_count?: number;
          created_at?: string;
        };
        Relationships: [];
      };
      orders: {
        Row: {
          id: string;
          order_number: string;
          user_id: string;
          address_snapshot: Record<string, unknown>;
          notify_phone: string;
          notify_email: string | null;
          subtotal_paise: number;
          coupon_code: string | null;
          discount_paise: number;
          total_paise: number;
          payment_status: 'PENDING' | 'PAID';
          order_status: 'PENDING_PAYMENT' | 'CONFIRMED' | 'DELIVERED';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          order_number?: string;
          user_id: string;
          address_snapshot: Record<string, unknown>;
          notify_phone: string;
          notify_email?: string | null;
          subtotal_paise: number;
          coupon_code?: string | null;
          discount_paise?: number;
          total_paise: number;
          payment_status?: 'PENDING' | 'PAID';
          order_status?: 'PENDING_PAYMENT' | 'CONFIRMED' | 'DELIVERED';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          order_number?: string;
          user_id?: string;
          address_snapshot?: Record<string, unknown>;
          notify_phone?: string;
          notify_email?: string | null;
          subtotal_paise?: number;
          coupon_code?: string | null;
          discount_paise?: number;
          total_paise?: number;
          payment_status?: 'PENDING' | 'PAID';
          order_status?: 'PENDING_PAYMENT' | 'CONFIRMED' | 'DELIVERED';
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      order_items: {
        Row: {
          id: string;
          order_id: string;
          product_id: string;
          variant_id: string;
          name_snapshot: string;
          variant_label_snapshot: string;
          sku_snapshot: string;
          image_path_snapshot: string | null;
          qty: number;
          unit_price_paise: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          order_id: string;
          product_id: string;
          variant_id: string;
          name_snapshot: string;
          variant_label_snapshot: string;
          sku_snapshot: string;
          image_path_snapshot?: string | null;
          qty: number;
          unit_price_paise: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          order_id?: string;
          product_id?: string;
          variant_id?: string;
          name_snapshot?: string;
          variant_label_snapshot?: string;
          sku_snapshot?: string;
          image_path_snapshot?: string | null;
          qty?: number;
          unit_price_paise?: number;
          created_at?: string;
        };
        Relationships: [];
      };
      order_status_history: {
        Row: {
          id: string;
          order_id: string;
          status: string;
          note: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          order_id: string;
          status: string;
          note?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          order_id?: string;
          status?: string;
          note?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      payments: {
        Row: {
          id: string;
          order_id: string;
          razorpay_order_id: string;
          razorpay_payment_id: string | null;
          status: 'CREATED' | 'CAPTURED' | 'FAILED';
          amount_paise: number;
          method: string | null;
          raw_payload: Json | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          order_id: string;
          razorpay_order_id: string;
          razorpay_payment_id?: string | null;
          status?: 'CREATED' | 'CAPTURED' | 'FAILED';
          amount_paise: number;
          method?: string | null;
          raw_payload?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          order_id?: string;
          razorpay_order_id?: string;
          razorpay_payment_id?: string | null;
          status?: 'CREATED' | 'CAPTURED' | 'FAILED';
          amount_paise?: number;
          method?: string | null;
          raw_payload?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      reviews: {
        Row: {
          id: string;
          product_id: string;
          user_id: string;
          rating: number;
          comment: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          product_id: string;
          user_id: string;
          rating: number;
          comment: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          product_id?: string;
          user_id?: string;
          rating?: number;
          comment?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          order_id: string;
          channel: 'WHATSAPP' | 'EMAIL';
          recipient: string;
          template: string;
          payload: Json;
          status: 'PENDING' | 'SENT' | 'FAILED';
          attempts: number;
          last_error: string | null;
          created_at: string;
          sent_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          order_id: string;
          channel: 'WHATSAPP' | 'EMAIL';
          recipient: string;
          template: string;
          payload: Json;
          status?: 'PENDING' | 'SENT' | 'FAILED';
          attempts?: number;
          last_error?: string | null;
          created_at?: string;
          sent_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          order_id?: string;
          channel?: 'WHATSAPP' | 'EMAIL';
          recipient?: string;
          template?: string;
          payload?: Json;
          status?: 'PENDING' | 'SENT' | 'FAILED';
          attempts?: number;
          last_error?: string | null;
          created_at?: string;
          sent_at?: string | null;
        };
        Relationships: [];
      };
      site_banners: {
        Row: {
          id: string;
          text: string;
          highlight_text: string | null;
          link_url: string | null;
          badge_text: string | null;
          bg_color: string;
          text_color: string;
          is_active: boolean;
          starts_at: string;
          ends_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          text: string;
          highlight_text?: string | null;
          link_url?: string | null;
          badge_text?: string | null;
          bg_color?: string;
          text_color?: string;
          is_active?: boolean;
          starts_at?: string;
          ends_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          text?: string;
          highlight_text?: string | null;
          link_url?: string | null;
          badge_text?: string | null;
          bg_color?: string;
          text_color?: string;
          is_active?: boolean;
          starts_at?: string;
          ends_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      public_reviews: {
        Row: {
          id: string;
          product_id: string;
          rating: number;
          comment: string;
          created_at: string;
          reviewer_name: string;
        };
        Relationships: [];
      };
      product_rating_summary: {
        Row: {
          product_id: string;
          avg_rating: number;
          review_count: number;
        };
        Relationships: [];
      };
    };
    Functions: {
      next_order_number: {
        Args: Record<PropertyKey, never>;
        Returns: string;
      };
      confirm_payment: {
        Args: {
          p_razorpay_order_id: string;
          p_razorpay_payment_id: string;
          p_method?: string | null;
          p_raw_payload?: Json | null;
        };
        Returns: Json;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
