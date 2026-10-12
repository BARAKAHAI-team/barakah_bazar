/**
 * Validate and normalise an Indian mobile number to E.164 (+91XXXXXXXXXX) format.
 * Accepts:
 * - 10 digits starting with 6, 7, 8, 9 (e.g., 9876543210)
 * - Leading 0 (e.g., 09876543210)
 * - Country code 91 (e.g., 919876543210)
 * - Country code +91 (e.g., +919876543210)
 */
export function normalizeIndianPhone(input: string): string | null {
  if (!input) return null;

  // Strip spaces, dashes, parentheses
  const cleaned = input.replace(/[\s\-\(\)]/g, '');

  let digits = cleaned;
  if (digits.startsWith('+91')) {
    digits = digits.slice(3);
  } else if (digits.startsWith('91') && digits.length === 12) {
    digits = digits.slice(2);
  } else if (digits.startsWith('0') && digits.length === 11) {
    digits = digits.slice(1);
  }

  // Must be exactly 10 digits starting with 6-9
  if (/^[6-9]\d{9}$/.test(digits)) {
    return `+91${digits}`;
  }

  return null;
}
