// Elder "Tell" and "Inform": the family contact, the message to send them, and the anonymous warning record.
// Pure functions, no DOM, so node --test covers them. The screens are in frontend/src/features/elder.
// All Lao below needs native review. // REVIEW-LO

export const PHONE_KEY = 'sati-family-phone';
export const NAME_KEY = 'sati-family-name';
export const SEEN_KEY = 'sati-family-setup-seen';
export const INFORM_KEY = 'sati-inform-log';

const LAO_DIGITS = '໐໑໒໓໔໕໖໗໘໙';
const toAscii = s => String(s ?? '').replace(/[໐-໙]/g, c => String(LAO_DIGITS.indexOf(c)));

/** A Lao mobile number as people type it -> "020XXXXXXXX" (11 digits), or null. */
export function normalizeLaoWhatsApp(input) {
  let d = toAscii(input).replace(/[\s\-().]/g, '');
  if (d.startsWith('+')) d = d.slice(1);
  if (!/^\d+$/.test(d)) return null;
  if (d.startsWith('856')) d = d.slice(3);
  if (/^20\d{8}$/.test(d)) d = '0' + d;
  return /^020\d{8}$/.test(d) ? d : null;
}
export const formatPhone = d => (/^020\d{8}$/.test(d) ? `${d.slice(0, 3)} ${d.slice(3, 7)} ${d.slice(7)}` : String(d ?? ''));

/** Setup form check. The name is optional (it only changes the button wording). */
export function validateFamily({ name, phone }) {
  const p = normalizeLaoWhatsApp(phone);
  const n = String(name ?? '').trim().slice(0, 30);
  return p ? { ok: true, name: n, phone: p, errors: {} } : { ok: false, name: n, phone: null, errors: { phone: 'format' } };
}

/** What the family receives. The pasted message is cut to 150 characters. */
export function tellText({ message, verdictWord }) {
  const flat = String(message ?? '').replace(/\s+/g, ' ').trim();
  const msg = flat.length > 150 ? flat.slice(0, 149) + '…' : flat;
  return `ແມ່/ພໍ່ ໄດ້ຮັບຂໍ້ຄວາມນີ້: "${msg}" · ສະຕິ: ${verdictWord}. ໂທຫາແມ່/ພໍ່ແດ່.`;
}
export const waLink = (phone, text) => `https://wa.me/856${String(phone).replace(/^0/, '')}?text=${encodeURIComponent(text)}`;
export const smsLink = (phone, text) => `sms:${phone}?body=${encodeURIComponent(text)}`;

/** What the Tell button does. Without a saved number it always goes to setup. */
export function planTell({ phone, canShare, demo }) {
  if (!phone) return { action: 'setup' };
  if (demo) return { action: 'preview' };
  return canShare ? { action: 'share', fallbacks: ['whatsapp', 'sms'] } : { action: 'whatsapp', fallbacks: ['sms'] };
}

const CATEGORIES = ['otp', 'link', 'money', 'prize', 'invest', 'authority', 'relative', 'other'];
const VERDICTS = ['scam', 'caution', 'safe'];
/** The only things Inform ever stores: type, verdict, time. */
export const makeInformRecord = ({ category, verdict, now = Date.now() }) => ({
  category: CATEGORIES.includes(category) ? category : 'other',
  verdict: VERDICTS.includes(verdict) ? verdict : 'caution',
  createdAt: now,
});
export function appendInform(storage, record) {
  let list = [];
  try { list = JSON.parse(storage.getItem(INFORM_KEY) || '[]'); if (!Array.isArray(list)) list = []; } catch { list = []; }
  list.push(record);
  storage.setItem(INFORM_KEY, JSON.stringify(list.slice(-100)));
}
