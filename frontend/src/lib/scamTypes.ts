import type { Lang, Post } from '../types';

// Labels for the `scamType` tag on seed posts (backend/seed.json). // REVIEW-LO (all Lao below)
export const SCAM_TYPES: Record<string, Record<Lang, string>> = {
  'fake-job-abroad': { lo: 'ວຽກປອມຕ່າງປະເທດ', en: 'Fake jobs abroad' },
  'call-centre': { lo: 'ຮັບສະໝັກຄໍເຊັນເຕີ', en: 'Call-centre recruitment' },
  'study-agent': { lo: 'ນາຍໜ້າຮຽນຕໍ່', en: 'Study-abroad agents' },
  'romance-crypto': { lo: 'ຮັກອອນລາຍ → ຄຣິບໂຕ', en: 'Romance → crypto' },
  'loan-app': { lo: 'ແອັບກູ້ເງິນ', en: 'Loan apps' },
  'easy-money': { lo: 'ເງິນງ່າຍໃນ TikTok', en: 'Easy money on TikTok' },
  phishing: { lo: 'ລັກບັນຊີ / ລິ້ງປອມ', en: 'Account phishing' },
  'recruiter-parents': { lo: 'ນາຍໜ້າຫາພໍ່ແມ່', en: 'Recruiters messaging parents' },
  'marriage-broker': { lo: 'ນາຍໜ້າແຕ່ງງານ', en: 'Marriage brokers' },
  'labour-contract': { lo: 'ສັນຍາແຮງງານປອມ', en: 'Fake labour contracts' },
  'loan-shark': { lo: 'ເງິນກູ້ນອກລະບົບ', en: 'Loan sharks' },
  'bank-sms': { lo: 'SMS ທະນາຄານປອມ', en: 'Fake bank SMS' },
  investment: { lo: 'ກຸ່ມລົງທຶນປອມ', en: 'Fake investment groups' },
  shopping: { lo: 'ຊື້ເຄື່ອງອອນລາຍ', en: 'Online shopping scams' },
  'fake-official': { lo: 'ເຈົ້າໜ້າທີ່ປອມ', en: 'Fake officials' },
  'grandchild-call': { lo: 'ຫຼານມີບັນຫາ', en: '"Grandchild in trouble"' },
  prize: { lo: 'ຖືກລາງວັນປອມ', en: 'Fake prizes' },
  'fake-medicine': { lo: 'ຢາປອມ', en: 'Fake medicine' },
  'bank-call': { lo: 'ໂທຂໍ OTP', en: 'Bank OTP calls' },
  'phone-helper': { lo: 'ຄົນແປກໜ້າ "ຊ່ວຍ" ໂທລະສັບ', en: 'Strangers "helping" with your phone' },
};
export const scamTypeLabel = (key: string, lang: Lang) => SCAM_TYPES[key]?.[lang] ?? key;

// Risk shown on a post: a seed example's intended verdict, else what review decided.
export type Risk = 'red' | 'yellow' | 'green';
export function postRisk(p: Post): Risk | null {
  if (p.exampleStatus) return p.exampleStatus;
  if (p.state === 'confirmed' || p.state === 'false') return 'red';
  if (p.state === 'flagged' || p.state === 'sla') return 'yellow';
  return null;
}

// Youth trend: the scam type most posts warned about this week (posts with a risk, from the last 7 days or seeds).
export function weeklyTrend(posts: Post[]): { type: string; count: number } | null {
  const weekAgo = Date.now() - 7 * 864e5;
  const counts = new Map<string, number>();
  for (const p of posts) if (p.scamType && (p.seed || p.example || (p.createdAt ?? 0) >= weekAgo)) counts.set(p.scamType, (counts.get(p.scamType) ?? 0) + 1);
  const top = [...counts].sort((a, b) => b[1] - a[1])[0];
  return top ? { type: top[0], count: top[1] } : null;
}
