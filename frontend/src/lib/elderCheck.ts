// Message check for Simple mode. Runs on the phone, so it works offline and for guests.
// It looks for the patterns behind the scams elders meet most: asking for a code, asking for money,
// pressure to act now, a prize, someone claiming authority, a relative in trouble, a link or an app.
// It is a cautious screen, not a verdict from a person, and the result always says to ask family first.

export type ElderVerdict = 'scam' | 'caution' | 'safe';

const SIGNALS: { weight: number; words: string[] }[] = [
  { weight: 2, words: ['otp', 'ລະຫັດ', 'pin', 'password', 'passcode', 'verification code'] },
  { weight: 2, words: ['http', 'www.', '.apk', 'ກົດລິ້ງ', 'link', 'ລິ້ງ', 'ດາວໂຫຼດ', 'download', 'ຕິດຕັ້ງ', 'install', 'anydesk', 'teamviewer'] },
  { weight: 1, words: ['ໂອນ', 'transfer', 'send money', 'ຈ່າຍ', 'pay ', 'ຄ່າທຳນຽມ', 'fee', 'deposit', 'ມັດຈຳ'] },
  { weight: 1, words: ['ດ່ວນ', 'ດຽວນີ້', 'ພາຍໃນ', 'urgent', 'immediately', 'right now', 'today only', 'ລະງັບ', 'suspended', 'blocked', 'ຖືກປິດ'] },
  { weight: 2, words: ['ຖືກລາງວັນ', 'ລາງວັນ', 'ຫວຍ', 'won ', 'winner', 'prize', 'lottery'] },
  { weight: 1, words: ['ຕຳຫຼວດ', 'ເຈົ້າໜ້າທີ່', 'ທະນາຄານ', 'police', 'officer', 'bank', 'ບຳນານ', 'pension'] },
  { weight: 1, words: ['ປັບໃໝ', 'a fine', 'penalty', 'ຄະດີ', 'court case'] },
  { weight: 1, words: ['ຫຼານ', 'ອຸບັດຕິເຫດ', 'ໂຮງໝໍ', 'ຕິດຄຸກ', 'accident', 'hospital', 'grandchild', 'grandson', 'granddaughter', 'arrested'] },
];
// A message that warns AGAINST sharing a code or paying is advice, not bait.
const WARNING = ['ຢ່າ', 'ບໍ່ເຄີຍ', 'never', "don't", 'do not'];

export function checkElderMessage(text: string): ElderVerdict {
  const s = ` ${text.toLowerCase()} `;
  let score = 0;
  for (const g of SIGNALS) if (g.words.some(w => s.includes(w))) score += g.weight;
  if (WARNING.some(w => s.includes(w))) score -= 2;
  return score >= 3 ? 'scam' : score >= 1 ? 'caution' : 'safe';
}
