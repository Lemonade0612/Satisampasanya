import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { Capacitor } from '@capacitor/core';
// One light tick (pull-to-refresh threshold). Native haptics when running in the app, the Vibration API on Android browsers, otherwise nothing.
export function tick() {
  try {
    if (Capacitor.isNativePlatform()) { void Haptics.impact({ style: ImpactStyle.Light }).catch(() => {}); return; }
    navigator.vibrate?.(8);
  } catch { /* not available */ }
}
