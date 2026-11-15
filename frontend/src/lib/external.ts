import { Capacitor } from "@capacitor/core";
import { Browser } from "@capacitor/browser";

/** Opens a source link: in-app browser on the phone, a new tab with no opener access on the web. https only. */
export async function openExternal(url: string): Promise<void> {
  if (!/^https:\/\//i.test(url)) return;
  if (Capacitor.isNativePlatform()) {
    try { await Browser.open({ url }); return; } catch { /* fall through to the plain open */ }
  }
  window.open(url, "_blank", "noopener,noreferrer");
}
