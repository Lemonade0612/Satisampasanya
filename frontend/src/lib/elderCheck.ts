// Message check for Simple mode. Runs on the phone, so it works offline and for guests.
// It looks for the patterns behind the scams elders meet most: asking for a code, asking for money,
// pressure to act now, a prize, someone claiming authority, a relative in trouble, a link or an app.
// It is a cautious screen, not a verdict from a person, and the result always says to ask family first.

export type ElderVerdict = 'scam' | 'caution' | 'safe';

// weak: short tech words ("pin", "otp", "link") that are everyday words too. They only count next to another signal.
// kind: a weak and a strong group asking for the same thing (a code, a link) count once.
const SIGNALS: { weight: number; words: string[]; weak?: boolean; kind?: string }[] = [
  { weight: 2, words: ['ລະຫັດ', 'password', 'passcode', 'verification code'], kind: 'code' },
  { weight: 2, words: ['otp', 'pin', 'code'], weak: true, kind: 'code' },
  { weight: 2, words: ['http', 'https', 'www', '.apk', 'ກົດລິ້ງ', 'ລິ້ງ', 'ດາວໂຫຼດ', 'ຕິດຕັ້ງ', 'anydesk', 'teamviewer'], kind: 'link' },
  { weight: 2, words: ['link', 'download', 'install', 'app', 'apk'], weak: true, kind: 'link' },
  { weight: 1, words: ['ໂອນ', 'transfer', 'send money', 'ຈ່າຍ', 'pay', 'ຄ່າທຳນຽມ', 'fee', 'deposit', 'ມັດຈຳ'] },
  { weight: 1, words: ['ດ່ວນ', 'ດຽວນີ້', 'ພາຍໃນ', 'urgent', 'immediately', 'right now', 'today only', 'ລະງັບ', 'suspended', 'blocked', 'ຖືກປິດ'] },
  { weight: 2, words: ['ຖືກລາງວັນ', 'ລາງວັນ', 'ຫວຍ', 'won', 'winner', 'prize', 'lottery'] },
  { weight: 2, words: ['ລົງທຶນ', 'ກຳໄລ', 'ຮັບປະກັນ', 'invest', 'guaranteed profit', 'usdt', 'crypto', 'bitcoin'] },
  { weight: 1, words: ['ຕຳຫຼວດ', 'ເຈົ້າໜ້າທີ່', 'ທະນາຄານ', 'police', 'officer', 'bank', 'ບຳນານ', 'pension'] },
  { weight: 1, words: ['ປັບໃໝ', 'a fine', 'penalty', 'ຄະດີ', 'court case'] },
  { weight: 1, words: ['ຫຼານ', 'ອຸບັດຕິເຫດ', 'ໂຮງໝໍ', 'ຕິດຄຸກ', 'accident', 'hospital', 'grandchild', 'grandson', 'granddaughter', 'arrested'] },
];
// A message that warns AGAINST sharing a code or paying is advice, not bait.
// "ຢ່າ" (don't) must not match inside "ຢ່າງ" (like / kind of), an everyday word.
const WARNING = ['ຢ່າ', 'ບໍ່ເຄີຍ', 'ຈະບໍ່ຂໍ', 'never', "don't", 'do not'];

// Latin words match whole words only ("pin" is not in "ping" or "shopping").
// Lao is written without spaces, so Lao words match inside the text, except where a longer word starts the same way.
const LAO_LONGER: Record<string, string> = { 'ຢ່າ': 'ງ' };
const escape = (w: string) => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const matcher = (w: string) => /[\u0E80-\u0EFF]/.test(w)
  ? new RegExp(escape(w) + (LAO_LONGER[w] ? `(?![${LAO_LONGER[w]}])` : ''), 'u')
  : new RegExp(`(?<![a-z0-9])${escape(w)}(?![a-z0-9'])`, 'u');
const compile = (words: string[]) => words.map(matcher);
const GROUPS = SIGNALS.map(g => ({ ...g, res: compile(g.words) }));
const WARNINGS = compile(WARNING);

export function checkElderMessage(text: string): ElderVerdict {
  const s = text.toLowerCase();
  const hit = GROUPS.filter(g => g.res.some(r => r.test(s)));
  const strong = hit.filter(g => !g.weak);
  const kinds = new Set<string>();
  let score = 0;
  if (strong.length) for (const g of hit) { if (g.kind && kinds.has(g.kind)) continue; if (g.kind) kinds.add(g.kind); score += g.weight; }
  if (WARNINGS.some(r => r.test(s))) score -= 2;
  return score >= 3 ? 'scam' : score >= 1 ? 'caution' : 'safe';
}
