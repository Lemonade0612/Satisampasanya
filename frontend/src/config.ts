// Build-time settings. Override with VITE_* variables in .env.local (see .env.example).

/** The Sati website. TODO: replace the placeholder default with the real domain. */
export const SITE_URL: string = (import.meta.env.VITE_SITE_URL as string | undefined) || 'https://YOUR-DOMAIN.example';
