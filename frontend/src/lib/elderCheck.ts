// Message check for Simple mode. Runs on the phone, so it works offline and for guests.
// It looks for the patterns behind the scams elders meet most: asking for a code, asking for money,
// pressure to act now, a prize, someone claiming authority, a relative in trouble, a link or an app.
// It is a cautious screen, not a verdict from a person, and the result always says to ask family first.

export type ElderVerdict = 'scam' | 'caution' | 'safe';

// weak: short tech words ("pin", "otp", "link") that are everyday words too. They only count next to another signal.
// kind: a weak and a strong group asking for the same thing (a code, a link) count once.
const SIGNALS: { weight: number; words: string[]; weak?: boolean; kind?: string; cat?: string }[] = [
  { weight: 2, words: ['ລະຫັດ', 'password', 'passcode', 'verification code'], kind: 'code', cat: 'otp' },
  { weight: 2, words: ['otp', 'pin', 'code'], weak: true, kind: 'code', cat: 'otp' },
  { weight: 2, words: ['http', 'https', 'www', '.apk', 'ກົດລິ້ງ', 'ລິ້ງ', 'ດາວໂຫຼດ', 'ຕິດຕັ້ງ', 'anydesk', 'teamviewer'], kind: 'link', cat: 'link' },
  { weight: 2, words: ['link', 'download', 'install', 'app', 'apk'], weak: true, kind: 'link', cat: 'link' },
  { weight: 1, words: ['ໂອນ', 'ໂອນເງິນ', 'ຊ່ວຍໂອນ', 'โอน', 'โอนเงิน', 'transfer', 'send money', 'ຈ່າຍ', 'pay', 'ຄ່າທຳນຽມ', 'fee', 'deposit', 'ມັດຈຳ'], cat: 'money' },
  { weight: 1, words: ['ດ່ວນ', 'ດຽວນີ້', 'ພາຍໃນ', 'urgent', 'immediately', 'right now', 'today only', 'ລະງັບ', 'suspended', 'blocked', 'ຖືກປິດ', 'ด่วน'] },
  { weight: 2, words: ['ຖືກລາງວັນ', 'ລາງວັນ', 'ຫວຍ', 'won', 'winner', 'prize', 'lottery'], cat: 'prize' },
  { weight: 2, words: ['ລົງທຶນ', 'ກຳໄລ', 'ຮັບປະກັນ', 'invest', 'guaranteed profit', 'usdt', 'crypto', 'bitcoin'], cat: 'invest' },
  { weight: 1, words: ['ຕຳຫຼວດ', 'ຢາບ້າ', 'ตำรวจ', 'ເຈົ້າໜ້າທີ່', 'ທະນາຄານ', 'police', 'officer', 'bank', 'ບຳນານ', 'pension'], cat: 'authority' },
  { weight: 1, words: ['ປັບໃໝ', 'a fine', 'penalty', 'ຄະດີ', 'คดี', 'court case', 'police case'], cat: 'authority' },
  { weight: 1, words: ['ຫຼານ', 'ອຸບັດຕິເຫດ', 'ໂຮງໝໍ', 'โรงพยาบาล', 'ຕິດຄຸກ', 'accident', 'hospital', 'grandchild', 'grandson', 'granddaughter', 'arrested'], cat: 'relative' },
  // Added for the demo: who is asking, a secret (weight 0: they only matter next to a transfer, see checkElderMessage), a threat to the account, a job abroad.
  { weight: 0, words: ['ເບີໃໝ່', 'ແມ່ນລູກເອງ', 'ລູກເອງ', 'ປ່ຽນເບີ', 'เบอร์ใหม่', 'new number', "it's me", 'its me'], cat: 'relative' },
  { weight: 0, words: ['ຢ່າບອກໃຜ', 'ຢ່າບອກ', 'ຢ່າບອກຄົນອື່ນ', 'อย่าบอกใคร', "don't tell", 'do not tell', 'tell nobody', 'tell no one', 'keep it secret'], cat: 'secrecy' },
  { weight: 2, words: ['ບັນຊີຈະຖືກປິດ', 'ບັນຊີຂອງທ່ານຈະ', 'will be closed', 'will be suspended', 'will be blocked', 'verify now', 'verify your account'], cat: 'threat' },
  { weight: 2, words: ['ວຽກຕ່າງປະເທດ', 'ເງິນເດືອນດີ', 'ເງິນເດືອນສູງ', 'ຟຣີທຸກຢ່າງ', 'ຄ່າເດີນທາງ', 'ເກົາຫຼີ', 'job abroad', 'work abroad', 'high pay', 'free flight', 'free travel', 'free hotel'], cat: 'job' },
  { weight: 1, words: ['ໜັງສືຜ່ານແດນ', 'ພາສປອດ', 'passport'], cat: 'job' },
];
// A message that warns AGAINST sharing a code or paying is advice, not bait.
// "ຢ່າ" (don't) must not match inside "ຢ່າງ" (like / kind of), an everyday word.
// "ຢ່າ" is not here: "ຢ່າບອກໃຜ" (tell nobody) is what a scammer says, so it adds risk (see SIGNALS 'secrecy').
const WARNING = ['ບໍ່ເຄີຍ', 'ຈະບໍ່ຂໍ', 'never', "don't", 'do not'];

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
// "don't tell anyone" contains "don't" but is secrecy, not advice, so it is cut out before the advice check.
const SECRECY_RE = /ຢ່າບອກ[ໃຜຄົນອື່ນ]*|อย่าบอกใคร|(?:do not|don't) tell (?:anyone|anybody|no one|nobody)|tell (?:nobody|no one)/gu;
const TRANSFER = [...compile(['ໂອນ', 'ໂອນເງິນ', 'ຊ່ວຍໂອນ', 'โอน', 'โอนเงิน', 'transfer', 'send money']), /(?<![a-z])send\s+[\d,.]+/u];

export function checkElderMessage(text: string): ElderVerdict {
  const s = text.toLowerCase();
  const hit = GROUPS.filter(g => g.res.some(r => r.test(s)));
  const strong = hit.filter(g => !g.weak);
  const kinds = new Set<string>();
  let score = 0;
  if (strong.length) for (const g of hit) { if (g.kind && kinds.has(g.kind)) continue; if (g.kind) kinds.add(g.kind); score += g.weight; }
  const cats = new Set(hit.map(g => g.cat));
  const transfer = TRANSFER.some(r => r.test(s));
  // Money asked for + someone close, an emergency, the police or a secret = the classic scam, whatever the score.
  if (transfer && ['relative', 'authority', 'secrecy'].some(c => cats.has(c)) && !(cats.size === 1 && cats.has('authority') && WARNINGS.some(r => r.test(s)))) return 'scam';
  const advice = WARNINGS.some(r => r.test(s.replace(SECRECY_RE, ' ')));
  // Plain advice ("the bank never asks for your OTP") is safe; bait that happens to say "never" stays scored.
  if (advice && !cats.has('secrecy') && !transfer && [...cats].every(c => c === 'otp' || c === 'authority')) return 'safe';
  const bait = ['link', 'prize', 'invest', 'job', 'threat'].some(c => cats.has(c));
  if (advice && !bait) score -= 2;
  return score >= 3 ? 'scam' : score >= 1 ? 'caution' : 'safe';
}

/** The kind of message, for the anonymous warning (Inform). Stored with the verdict and nothing else. */
export function elderCategory(text: string): string {
  const s = text.toLowerCase();
  const hit = GROUPS.filter(g => g.cat && g.res.some(r => r.test(s))).sort((a, b) => b.weight - a.weight);
  return hit[0]?.cat ?? 'other';
}
