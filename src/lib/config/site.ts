/**
 * Site configuration for Barakah Bazaar.
 * Values are environment driven and only displayed when explicitly provided.
 */
export const SITE_CONFIG = {
  // Regional tagline slot (empty by default; never invent copy)
  regionalTagline: process.env.NEXT_PUBLIC_REGIONAL_TAGLINE || '',

  // WhatsApp customer care number (only rendered when provided)
  whatsappNumber: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '',

  // Tax disclosure confirmed by client
  confirmTaxInclusive: process.env.NEXT_PUBLIC_CONFIRM_TAX_INCLUSIVE === 'true',
};
