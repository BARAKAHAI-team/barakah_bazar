export interface CouponValidationResult {
  valid: boolean;
  code: string;
  type?: 'PERCENT' | 'FLAT';
  discountPaise: number;
  newTotalPaise: number;
  error?: string;
}

export interface CouponRecord {
  code: string;
  type: 'PERCENT' | 'FLAT';
  value: number; // percentage (1-100) or paise for flat
  max_discount_paise: number | null;
  min_order_paise: number;
  valid_from: string;
  valid_to: string;
  is_active: boolean;
}

export function calculateCouponDiscount(
  coupon: CouponRecord | null,
  subtotalPaise: number,
  now: Date = new Date()
): CouponValidationResult {
  if (!coupon) {
    return {
      valid: false,
      code: '',
      discountPaise: 0,
      newTotalPaise: subtotalPaise,
      error: 'Invalid or unknown coupon code.',
    };
  }

  if (!coupon.is_active) {
    return {
      valid: false,
      code: coupon.code,
      discountPaise: 0,
      newTotalPaise: subtotalPaise,
      error: 'This coupon is no longer active.',
    };
  }

  const validFrom = new Date(coupon.valid_from);
  const validTo = new Date(coupon.valid_to);

  if (now < validFrom) {
    return {
      valid: false,
      code: coupon.code,
      discountPaise: 0,
      newTotalPaise: subtotalPaise,
      error: 'This coupon is not yet valid.',
    };
  }

  if (now > validTo) {
    return {
      valid: false,
      code: coupon.code,
      discountPaise: 0,
      newTotalPaise: subtotalPaise,
      error: 'This coupon code has expired.',
    };
  }

  if (subtotalPaise < coupon.min_order_paise) {
    const minRupees = Math.round(coupon.min_order_paise / 100);
    return {
      valid: false,
      code: coupon.code,
      discountPaise: 0,
      newTotalPaise: subtotalPaise,
      error: `Minimum order of ₹${minRupees} required for this coupon.`,
    };
  }

  let discountPaise = 0;
  if (coupon.type === 'PERCENT') {
    const rawDiscount = Math.round(subtotalPaise * (coupon.value / 100));
    discountPaise = coupon.max_discount_paise
      ? Math.min(rawDiscount, coupon.max_discount_paise)
      : rawDiscount;
  } else if (coupon.type === 'FLAT') {
    discountPaise = Math.min(coupon.value, subtotalPaise);
  }

  // Discount can never exceed subtotal
  discountPaise = Math.min(discountPaise, subtotalPaise);
  const newTotalPaise = Math.max(0, subtotalPaise - discountPaise);

  return {
    valid: true,
    code: coupon.code,
    type: coupon.type,
    discountPaise,
    newTotalPaise,
  };
}
