import { Armchair, Backpack, Briefcase, Headphones, type LucideIcon } from 'lucide-react';
import { load, save } from './storage';

// Age groups tune every game: kids and elders get a calmer pace and visible hints,
// youth and adults get timers, hidden clues and faster runs.
export type AgeTier = 'kid' | 'youth' | 'adult' | 'elder';
export const TIER_IDS: AgeTier[] = ['kid', 'youth', 'adult', 'elder'];

export type TierConfig = {
  icon: LucideIcon; range: string; tint: string;
  // Scam Dash: base speed, hearts, chance a trap flies (needs a duck), spawn gap, gate timer (0 = none), speed-up per round.
  dash: { speed: number; hearts: number; air: number; airFrom: number; gap: [number, number]; gateSec: number; lapBoost: number };
  calls: number; callSec: number;   // Scam Call: calls per day, seconds to decide (0 = no timer)
  quick: number; quickSec: number;  // Real or Scam: cards per round, seconds per card
  hiddenClues: boolean;             // Scam Detective: clues are not highlighted, wrong taps cost points
  voice: boolean;                   // read aloud on by default
};

export const TIERS: Record<AgeTier, TierConfig> = {
  kid: {
    icon: Backpack, range: '6–14', tint: 'from-amber-400 to-orange-500',
    dash: { speed: 0.022, hearts: 5, air: 0.12, airFrom: 140, gap: [44, 36], gateSec: 0, lapBoost: 0.1 },
    calls: 3, callSec: 0, quick: 6, quickSec: 0, hiddenClues: false, voice: false,
  },
  youth: {
    icon: Headphones, range: '15–24', tint: 'from-fuchsia-500 to-violet-600',
    dash: { speed: 0.038, hearts: 3, air: 0.45, airFrom: 60, gap: [26, 26], gateSec: 7, lapBoost: 0.18 },
    calls: 5, callSec: 12, quick: 10, quickSec: 6, hiddenClues: true, voice: false,
  },
  adult: {
    icon: Briefcase, range: '25–59', tint: 'from-sky-500 to-indigo-600',
    dash: { speed: 0.032, hearts: 3, air: 0.38, airFrom: 80, gap: [30, 28], gateSec: 9, lapBoost: 0.15 },
    calls: 5, callSec: 15, quick: 10, quickSec: 8, hiddenClues: true, voice: false,
  },
  elder: {
    icon: Armchair, range: '60+', tint: 'from-emerald-500 to-teal-600',
    dash: { speed: 0.02, hearts: 5, air: 0.08, airFrom: 160, gap: [46, 38], gateSec: 0, lapBoost: 0.08 },
    calls: 4, callSec: 0, quick: 6, quickSec: 0, hiddenClues: false, voice: true,
  },
};

const KEY = 'sati-age-tier';
export const hasAge = () => load<AgeTier | null>(KEY, null) !== null;
export const getAge = (): AgeTier => { const v = load<AgeTier | null>(KEY, null); return v && v in TIERS ? v : 'youth'; };
export const setAge = (t: AgeTier) => save(KEY, t);
export const tier = () => TIERS[getAge()];
