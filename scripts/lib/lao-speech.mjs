// What the voice says: the screen keeps digits and abbreviations, the voice gets Lao words.
// Shared by scripts/gen-call-voices.mjs and scripts/gen-audio.mjs.
const D = ['ສູນ', 'ໜຶ່ງ', 'ສອງ', 'ສາມ', 'ສີ່', 'ຫ້າ', 'ຫົກ', 'ເຈັດ', 'ແປດ', 'ເກົ້າ'];
function laoUnder1M(n) {
  let s = '';
  for (const [v, w] of [[100000, 'ແສນ'], [10000, 'ໝື່ນ'], [1000, 'ພັນ'], [100, 'ຮ້ອຍ']]) {
    const k = Math.floor(n / v); n %= v;
    if (k) s += D[k] + w;
  }
  const t = Math.floor(n / 10), u = n % 10;
  if (t) s += (t === 1 ? '' : t === 2 ? 'ຊາວ' : D[t]) + (t === 2 ? '' : 'ສິບ');
  if (u) s += u === 1 && t ? 'ເອັດ' : D[u];
  return s;
}
export function laoNumber(n) {
  if (n === 0) return D[0];
  const m = Math.floor(n / 1e6), r = n % 1e6;
  return (m ? laoNumber(m) + 'ລ້ານ' : '') + (r ? laoUnder1M(r) : '');
}
// Latin abbreviations as a Lao speaker says them.
const LAO_SAY = { PIN: 'ພິນ', QR: 'ຄິວອາ', SMS: 'ເອັສເອັມເອັສ', CV: 'ຊີວີ', OTP: 'ໂອທີພີ', ID: 'ໄອດີ' };
export function spokenLao(text) {
  return text
    .replace(/(\d{1,2}):(\d{2})/g, (_, h, m) => `${laoNumber(+h)}ໂມງ ${laoNumber(+m)}ນາທີ`)
    .replace(/\d{1,3}(?:,\d{3})+|\d+/g, x => laoNumber(Number(x.replace(/,/g, ''))))
    .replace(/\b(PIN|QR|SMS|CV|OTP|ID)\b/g, x => LAO_SAY[x])
    // "..." is a hesitation; a comma gives the voice a short natural pause instead of reading dots.
    .replace(/\.\.\.|…/g, ',');
}
export const spoken = (text, lang) => lang === 'lo' ? spokenLao(text) : text.replace(/…/g, '...');
