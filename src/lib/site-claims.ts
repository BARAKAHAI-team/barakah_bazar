export interface SiteClaim {
  id: string;
  label: string;
  description?: string;
}

/**
 * Placeholder configuration for client-supplied and verified trust/site claims.
 * Claims MUST remain empty until supplied and explicitly verified by the client.
 * UI components must render nothing when this array is empty.
 */
export const SITE_CLAIMS: SiteClaim[] = [];
