// What the app reads aloud, in one place. The games build their read-aloud parts with these helpers, and
// scripts/gen-audio.mjs calls spokenCatalog() to record exactly the same strings, so every part a player can
// hear has a matching clip (shared/audio-key.mjs turns each part into a file name).
// One part = one clip, played in order. Keep parts to whole strings from the data, never text glued at runtime,
// or the clip name will not match.
// Imports data files directly (not lib/scenarios.ts), so the generator can load this module in Node.
import scenarioData from '../data/scenarios.json';
import { BAND_SESSIONS } from '../data/bandSessions';
import { PERSONAS, type Case } from '../data/detectiveCases';
import { BAIT_POSTS, BAIT_UI, type BaitPost } from '../../kids/baitPosts';
import { DT } from '../i18n';
import { ET, VERDICT, ELDER_TIPS } from '../../elder/text';
import seedPosts from '../../../../../backend/seed.json';
import { BANDS, filterByBand, forBand, type Band } from '../../../lib/band';
import type { Lang, Scenario, Step } from '../types';

export const storyParts = (scenario: Scenario, step: Step, first: boolean, lang: Lang): string[] =>
  step.kind === 'chat'
    ? [first ? scenario.intro[lang] : '', ...step.messages.map(m => m.text[lang]), step.prompt[lang]]
    : [step.prompt[lang], step.segments.map(x => x.text[lang]).join('')];

export const detectiveLookParts = (c: Case, lang: Lang) => [c.situation[lang], c.parts.map(p => p.text[lang]).join('')];
export const detectiveDebriefParts = (c: Case, action: number, lang: Lang) => [c.actions[action].why[lang], c.lesson[lang]];

export const baitPostParts = (post: BaitPost, lang: Lang) => [post.from[lang], post.body[lang]];
export const baitRevealParts = (post: BaitPost, tapped: boolean, lang: Lang) => {
  const t = BAIT_UI[lang];
  return tapped ? [t.gotcha, post.reveal[lang], t.rule, post.rule[lang]] : [t.smart, t.rule, post.rule[lang]];
};

export type SpokenItem = { text: string; bands: Band[] };

// Every Lao part the app can ask for, tagged with the bands that can hear it (for the size report).
export function spokenCatalog(): SpokenItem[] {
  const out = new Map<string, Set<Band>>();
  const add = (bands: Band[], parts: string[]) => {
    for (const p of parts) if (p && p.trim()) { const s = out.get(p) ?? new Set<Band>(); bands.forEach(b => s.add(b)); out.set(p, s); }
  };
  const scenarios = [...(scenarioData.scenarios as unknown as Scenario[]), ...BAND_SESSIONS];
  for (const band of BANDS) {
    for (const raw of filterByBand(scenarios, band)) {
      const s = forBand(raw, band);
      s.steps.forEach((step, i) => add([band], storyParts(s, step, i === 0, 'lo')));
    }
    for (const persona of filterByBand(PERSONAS, band)) for (const c of persona.cases) {
      add([band], detectiveLookParts(c, 'lo'));
      c.parts.forEach(p => p.clue && add([band], [p.clue.note.lo]));
      c.actions.forEach((_, i) => add([band], detectiveDebriefParts(c, i, 'lo')));
      add([band], [DT.lo.det_right, DT.lo.det_wrong]);
    }
  }
  add(['kids'], [BAIT_UI.lo.intro]);
  for (const post of BAIT_POSTS) add(['kids'], [...baitPostParts(post, 'lo'), ...baitRevealParts(post, true, 'lo'), ...baitRevealParts(post, false, 'lo')]);
  // Simple mode (elder home and check result).
  // Elder example posts are read aloud in Simple mode's practice screen.
  for (const p of seedPosts as { bands?: string[]; example?: boolean; contentLo?: string; content: string }[]) if (p.example && p.bands?.includes('elder')) add(['elder'], [p.contentLo || p.content]);
  add(['elder'], [ET.lo.hello, ET.lo.tip_label, ...ELDER_TIPS.map(t => t.lo), ...Object.values(VERDICT).flatMap(v => v.lo)]);
  return [...out].map(([text, bands]) => ({ text, bands: [...bands] }));
}
