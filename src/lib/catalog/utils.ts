/**
 * Shared Category & Catalog Utilities
 * Safe for both Server and Client Components
 */

export function cleanCategoryName(name: string): string {
  if (!name) return '';
  return name.replace(/^Barakah\s+/i, '').trim();
}
