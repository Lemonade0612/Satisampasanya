import { Capacitor } from '@capacitor/core';
import { Browser } from '@capacitor/browser';
import { SITE_URL } from '../config';

/** Where in the app the visit started; becomes utm_medium so the site can tell the entries apart. */
export type SiteSource = 'profile' | 'explore';

export function siteUrl(source: SiteSource): string {
  const url = new URL(SITE_URL);
  url.searchParams.set('utm_source', 'app');
  url.searchParams.set('utm_medium', source);
  return url.toString();
}

/** Native: in-app browser tab. Web: new tab with no access back to the opener. */
export async function openWebsite(source: SiteSource): Promise<void> {
  const url = siteUrl(source);
  if (Capacitor.isNativePlatform()) {
    try { await Browser.open({ url }); return; } catch { /* fall through to the plain open */ }
  }
  window.open(url, '_blank', 'noopener');
}
