import { Capacitor } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';
import { load, save } from './storage';

// "Remind me": one local notification every day at 19:00 Lao time. Native app: Capacitor LocalNotifications.
// Browser: stores the choice and asks for notification permission (browsers cannot fire a timed notification while closed).
const KEY = 'sati-reminder', ID = 7101;
export type ReminderResult = 'set' | 'denied' | 'unsupported';
export const reminderOn = () => load<boolean>(KEY, false);
export async function setReminder(lang: 'lo' | 'en'): Promise<ReminderResult> {
  try {
    if (Capacitor.isNativePlatform()) {
      const perm = await LocalNotifications.requestPermissions();
      if (perm.display !== 'granted') return 'denied';
      await LocalNotifications.cancel({ notifications: [{ id: ID }] }).catch(() => {});
      await LocalNotifications.schedule({ notifications: [{ id: ID, title: lang === 'lo' ? 'ສິ່ງທ້າທາຍມື້ນີ້ພ້ອມແລ້ວ' : "Today's challenge is ready", body: lang === 'lo' ? '2 ນາທີ ເພື່ອຝຶກສະຕິຈັບການຫຼອກລວງ' : 'Two minutes to sharpen your scam sense.', schedule: { on: { hour: 19, minute: 0 }, allowWhileIdle: true } }] });
    } else {
      if (typeof Notification === 'undefined') return 'unsupported';
      if ((await Notification.requestPermission()) !== 'granted') return 'denied';
    }
    save(KEY, true);
    return 'set';
  } catch { return 'unsupported'; }
}
export async function clearReminder() { try { if (Capacitor.isNativePlatform()) await LocalNotifications.cancel({ notifications: [{ id: ID }] }); } catch { /* ignore */ } save(KEY, false); }
