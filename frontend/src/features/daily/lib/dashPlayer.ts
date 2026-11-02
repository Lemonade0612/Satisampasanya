import { load, save } from './storage';

export type Avatar = { skin: number; hair: number; outfit: number; extra: number };
export type Player = { name: string; country: string; avatar: Avatar };
export type Entry = { name: string; country: string; score: number; avatar?: Avatar; me?: boolean };

export const SKINS = ['#F6D3B3', '#E3B08A', '#C68A5E', '#8D5A3B'];
export const OUTFITS = ['#5B21D1', '#E11D48', '#0EA5E9', '#16A34A', '#F59E0B', '#111827'];
export const HAIRS = 4; // short, long, bun, bald
export const EXTRAS = ['', '🎓', '🧢', '👓', '🌸'];

export const ASEAN: { code: string; flag: string; name: { en: string; lo: string } }[] = [
  { code: 'LA', flag: '🇱🇦', name: { en: 'Laos', lo: 'ລາວ' } },
  { code: 'TH', flag: '🇹🇭', name: { en: 'Thailand', lo: 'ໄທ' } },
  { code: 'VN', flag: '🇻🇳', name: { en: 'Vietnam', lo: 'ຫວຽດນາມ' } },
  { code: 'KH', flag: '🇰🇭', name: { en: 'Cambodia', lo: 'ກຳປູເຈຍ' } },
  { code: 'MM', flag: '🇲🇲', name: { en: 'Myanmar', lo: 'ມຽນມາ' } },
  { code: 'MY', flag: '🇲🇾', name: { en: 'Malaysia', lo: 'ມາເລເຊຍ' } },
  { code: 'SG', flag: '🇸🇬', name: { en: 'Singapore', lo: 'ສິງກະໂປ' } },
  { code: 'ID', flag: '🇮🇩', name: { en: 'Indonesia', lo: 'ອິນໂດເນເຊຍ' } },
  { code: 'PH', flag: '🇵🇭', name: { en: 'Philippines', lo: 'ຟີລິບປິນ' } },
  { code: 'BN', flag: '🇧🇳', name: { en: 'Brunei', lo: 'ບຣູໄນ' } },
  { code: 'TL', flag: '🇹🇱', name: { en: 'Timor-Leste', lo: 'ຕີມໍ-ເລສເຕ' } },
];
export const flagOf = (code: string) => ASEAN.find(c => c.code === code)?.flag ?? '🏳️';

// Demo rivals so the board isn't empty; real scores come from this device until a backend board exists.
const RIVALS: Entry[] = [
  ['Noy', 'LA', 4120], ['Somchai', 'TH', 3980], ['Linh', 'VN', 3870], ['Dara', 'KH', 3540], ['Aung', 'MM', 3310],
  ['Aisyah', 'MY', 3650], ['Wei Jie', 'SG', 3720], ['Putri', 'ID', 3460], ['Miguel', 'PH', 3590], ['Hakim', 'BN', 2980],
  ['Ana', 'TL', 2870], ['Khamla', 'LA', 3210], ['Nattaya', 'TH', 3050], ['Minh', 'VN', 2940], ['Sophea', 'KH', 2610],
  ['Thiri', 'MM', 2450], ['Farid', 'MY', 2720], ['Rizky', 'ID', 2830], ['Joy', 'PH', 2560], ['Bounmy', 'LA', 2390],
].map(([name, country, score]) => ({ name, country, score } as Entry));

const PLAYER = 'sati-dash-player';
const SCORES = 'sati-dash-scores';

export const getPlayer = () => load<Player | null>(PLAYER, null);
export const savePlayer = (p: Player) => save(PLAYER, p);

export function addScore(p: Player, score: number) {
  const mine = load<Entry[]>(SCORES, []);
  mine.push({ name: p.name, country: p.country, score, avatar: p.avatar, me: true });
  save(SCORES, mine.sort((a, b) => b.score - a.score).slice(0, 20));
}

export function board() {
  const all = [...RIVALS, ...load<Entry[]>(SCORES, [])].sort((a, b) => b.score - a.score);
  // Country rank = sum of each country's best 3 runs, so one lucky run can't carry a nation.
  const by: Record<string, number[]> = {};
  for (const e of all) (by[e.country] ??= []).push(e.score);
  const countries = ASEAN.map(c => ({ ...c, score: (by[c.code] ?? []).slice(0, 3).reduce((a, b) => a + b, 0) }))
    .sort((a, b) => b.score - a.score);
  return { players: all, countries };
}
