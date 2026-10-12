/**
 * Format an integer paise value into Indian Rupee format (en-IN).
 * - No decimals when the amount is whole rupees (e.g., ₹100, ₹15,000)
 * - 2 decimals when the amount has paise (e.g., ₹100.50)
 *
 * @param paise integer amount in paise (1 INR = 100 paise)
 * @returns formatted string with ₹ symbol and Indian grouping
 */
export function formatINR(paise: number): string {
  const rupees = paise / 100;
  const hasDecimals = paise % 100 !== 0;

  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: hasDecimals ? 2 : 0,
    maximumFractionDigits: hasDecimals ? 2 : 0,
  }).format(rupees);
}

/**
 * Format unit price for items sold by weight or volume.
 * e.g., "₹45 per 100 g" or "₹90 per 100 ml"
 */
export function formatUnitPrice(
  pricePaise: number,
  netQuantity: number,
  netUnit: 'g' | 'ml' | 'piece'
): string | null {
  if (!netQuantity || netQuantity <= 0) return null;

  if (netUnit === 'piece') {
    const perPiecePaise = Math.round(pricePaise / netQuantity);
    return `${formatINR(perPiecePaise)} per piece`;
  }

  // Base unit for food/liquids: per 100g or 100ml
  const pricePer100 = Math.round((pricePaise / netQuantity) * 100);
  return `${formatINR(pricePer100)} per 100 ${netUnit}`;
}
