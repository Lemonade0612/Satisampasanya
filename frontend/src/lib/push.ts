import { Capacitor } from '@capacitor/core';
import { PushNotifications } from '@capacitor/push-notifications';
import { Badge } from '@capawesome/capacitor-badge';
import { api } from './api';

// Off-ground notifications (app closed or in the background) arrive as APNs pushes
// sent by the backend. While the app is open, pushes only refresh the alert list;
// the in-app banner in App.tsx is the on-ground notification.
const native = () => Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'ios';
let deviceToken: string | null = null;

export async function startPush(lang: string, handlers: { onForeground: () => void; onOpen: (postId: string, alertId?: string) => void }) {
  if (!native()) return () => {};
  const listeners = await Promise.all([
    PushNotifications.addListener('registration', ({ value }) => { deviceToken = value; void api.registerDevice(value, lang).catch(() => {}); }),
    PushNotifications.addListener('registrationError', error => console.warn('Push registration failed:', error.error)),
    PushNotifications.addListener('pushNotificationReceived', () => handlers.onForeground()),
    PushNotifications.addListener('pushNotificationActionPerformed', ({ notification }) => {
      const postId = notification.data?.postId;
      const alertId = notification.data?.alertId;
      if (typeof postId === 'string') handlers.onOpen(postId, typeof alertId === 'string' ? alertId : undefined);
    }),
  ]);
  let permission = await PushNotifications.checkPermissions();
  if (permission.receive === 'prompt' || permission.receive === 'prompt-with-rationale') permission = await PushNotifications.requestPermissions();
  if (permission.receive === 'granted') await PushNotifications.register();
  return () => { for (const listener of listeners) void listener.remove(); };
}

// Keeps the iOS app-icon badge equal to the unread alert count.
export async function setAppBadge(count: number) {
  if (!native()) return;
  try {
    if (count > 0) await Badge.set({ count }); else await Badge.clear();
    if (count === 0) await PushNotifications.removeAllDeliveredNotifications();
  } catch { /* badge permission not granted */ }
}

export async function stopPush() {
  if (!native()) return;
  if (deviceToken) await api.removeDevice(deviceToken).catch(() => {});
  deviceToken = null;
  await setAppBadge(0);
  await PushNotifications.unregister().catch(() => {});
}

export function updatePushLang(lang: string) {
  if (deviceToken) void api.registerDevice(deviceToken, lang).catch(() => {});
}
