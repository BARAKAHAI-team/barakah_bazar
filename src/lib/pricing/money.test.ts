import { describe, it, expect } from 'vitest';
import { formatINR, formatUnitPrice } from './money';

describe('formatINR', () => {
  it('formats zero paise without decimals', () => {
    expect(formatINR(0)).toBe('₹0');
  });

  it('formats whole rupee amounts without decimals', () => {
    expect(formatINR(100)).toBe('₹1');
    expect(formatINR(10000)).toBe('₹100');
    expect(formatINR(1500000)).toBe('₹15,000');
    expect(formatINR(9000000)).toBe('₹90,000');
  });

  it('formats amounts with fractional paise with exactly 2 decimal places', () => {
    expect(formatINR(10050)).toBe('₹100.50');
    expect(formatINR(10005)).toBe('₹100.05');
    expect(formatINR(15000075)).toBe('₹1,50,000.75');
  });

  it('handles negative amounts correctly', () => {
    expect(formatINR(-50000)).toBe('-₹500');
    expect(formatINR(-50025)).toBe('-₹500.25');
  });
});

describe('formatUnitPrice', () => {
  it('calculates price per 100g for powders and spices', () => {
    // 250g turmeric at ₹150 (15000 paise) -> ₹60 per 100 g
    expect(formatUnitPrice(15000, 250, 'g')).toBe('₹60 per 100 g');
  });

  it('calculates price per 100ml for liquids', () => {
    // 500ml coconut oil at ₹350 (35000 paise) -> ₹70 per 100 ml
    expect(formatUnitPrice(35000, 500, 'ml')).toBe('₹70 per 100 ml');
  });

  it('calculates price per piece', () => {
    // 2 pieces at ₹500 (50000 paise) -> ₹250 per piece
    expect(formatUnitPrice(50000, 2, 'piece')).toBe('₹250 per piece');
  });

  it('returns null for zero or negative quantity', () => {
    expect(formatUnitPrice(1000, 0, 'g')).toBeNull();
    expect(formatUnitPrice(1000, -10, 'g')).toBeNull();
  });
});
