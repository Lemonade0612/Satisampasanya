import type { ElderVerdict } from '../../lib/elderCheck';
import videos from './data/videos.json';
import tips from './data/tips.json';

// Elder mode copy: Lao only, no English. Every string here and in data/*.json is listed in
// docs/elder-lao-review.md for a native speaker. // REVIEW-LO (all Lao in this file)
export const ET = {
  home: 'ໜ້າຫຼັກ', check: 'ກວດ', learn: 'ຮຽນ',
  hello: 'ສະບາຍດີ', listen: 'ຟັງ', stop: 'ຢຸດ', reading: 'ກຳລັງອ່ານ...', back: 'ກັບຄືນ',
  odd_q: 'ມີຂໍ້ຄວາມແປກໆ ບໍ?', odd_tap: 'ກົດບ່ອນນີ້ ເພື່ອກວດ',
  videos_today: 'ວິດີໂອມື້ນີ້', play: 'ເບິ່ງວິດີໂອ', pause: 'ຢຸດຊົ່ວຄາວ', resume: 'ເບິ່ງຕໍ່', replay: 'ເບິ່ງໃໝ່',
  minutes: 'ນາທີ', seconds: 'ວິນາທີ',
  what_do: 'ທ່ານຈະເຮັດແນວໃດ?', great: 'ເກັ່ງຫຼາຍ!', watch_again: 'ເບິ່ງອີກ', next_video: 'ວິດີໂອຕໍ່ໄປ', not_quite: 'ຍັງບໍ່ຖືກ',
  check_title: 'ກວດຂໍ້ຄວາມ', paste_here: 'ວາງຂໍ້ຄວາມແປກໆ ໃສ່ບ່ອນນີ້', paste: 'ວາງຂໍ້ຄວາມ',
  paste_help: "ຄັດລອກຂໍ້ຄວາມ ຈາກ SMS ຫຼື Messenger ແລ້ວກົດ 'ວາງຂໍ້ຄວາມ'", run: 'ກວດເລີຍ', checking: 'ກຳລັງກວດ...',
  result_title: 'ຜົນການກວດ', do_this: 'ຄວນເຮັດແນວນີ້', call: 'ໂທຫາລູກຫຼານ', again: 'ກວດອີກ',
  learn_title: 'ຮຽນມື້ນີ້', tip_label: 'ຄຳແນະນຳມື້ນີ້', full_app: 'ເປີດແອັບເຕັມ',
  elder_entry: 'ຜູ້ສູງອາຍຸ / ໂໝດໃຊ້ງ່າຍ',
  slogan: 'ກວດກ່ອນ ເຊື່ອ',
} as const;

export type VerdictCopy = { bg: string; word: string; line: string; steps: [string, string, string] };
// Solid colours; white text on each is >= 4.5:1 (B91C1C 6.5, B45309 5.0, 15803D 5.0).
export const VERDICT: Record<ElderVerdict, VerdictCopy> = {
  scam: { bg: '#B91C1C', word: 'ຫຼອກລວງ', line: 'ຢ່າບອກລະຫັດ. ຢ່າໂອນເງິນ.', steps: ['ຢ່າຕອບ ແລະ ຢ່າກົດລິ້ງ', 'ລຶບຂໍ້ຄວາມນີ້ຖິ້ມ', 'ໂທຖາມລູກຫຼານ'] },
  caution: { bg: '#B45309', word: 'ລະວັງ', line: 'ຢ່າເພິ່ງເຊື່ອ. ໂທຖາມລູກຫຼານກ່ອນ.', steps: ['ຢ່າໂອນເງິນ ແລະ ຢ່າບອກລະຫັດ', 'ໂທຖາມລູກຫຼານ', 'ກວດກັບໜ່ວຍງານ ດ້ວຍເບີທີ່ທ່ານຮູ້'] },
  safe: { bg: '#15803D', word: 'ປອດໄພ', line: 'ບໍ່ເຫັນສັນຍານຫຼອກລວງ.', steps: ['ຖ້າມີຄົນຂໍເງິນ ຫຼື ລະຫັດ ໃຫ້ລະວັງ', 'ຖ້າສົງໃສ ໃຫ້ກວດອີກ', 'ຖາມລູກຫຼານໄດ້ສະເໝີ'] },
};

export type ElderVideo = (typeof videos)[number] & { src?: string; poster?: string };
export type ElderTip = (typeof tips)[number];
export const VIDEOS = videos as ElderVideo[];
export const TIPS = tips as ElderTip[];

// Deterministic daily rotation (Lao calendar day): 2 videos a day walk through all 7, one tip of 8.
const mod = (n: number, m: number) => ((n % m) + m) % m;
export const videosForDay = (day: number): [ElderVideo, ElderVideo] => [VIDEOS[mod(day * 2, VIDEOS.length)], VIDEOS[mod(day * 2 + 1, VIDEOS.length)]];
export const tipForDay = (day: number) => TIPS[mod(day, TIPS.length)];
export const durationLabel = (sec: number) => (sec >= 60 ? `${Math.round(sec / 60)} ${ET.minutes}` : `${sec} ${ET.seconds}`);

/** Every line elder mode can read aloud, for scripts/gen-audio.mjs. */
export const elderSpokenLines = (): string[] => [
  ...Object.values(ET),
  ...Object.values(VERDICT).flatMap(v => [v.word, v.line, ...v.steps]),
  ...VIDEOS.flatMap(v => [v.titleLo, ...v.captions, v.question, ...v.answers, v.explainLo]),
  ...TIPS.flatMap(t => [t.headlineLo, ...t.steps]),
];
