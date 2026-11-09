// The built-in scenarios that ship inside the user app, read from the same files so this list can never drift.
// They cannot be edited here; reviewers can only retire (hide) or restore them.
import data from '../../frontend/src/features/daily/data/scenarios.json';
import { BAND_SESSIONS } from '../../frontend/src/features/daily/data/bandSessions';
import type { AdminScenario, L10n } from './api';

export type BundledScenario = { id: string; title: L10n; bands: string[]; scenario: AdminScenario['scenario'] };
type Raw = { id: string; status: string; title: L10n; bands?: string[]; contact: string; channel: string; intro: L10n; explanation: L10n; warning?: L10n; redFlags: string[]; steps: unknown[] };
export const BUNDLED: BundledScenario[] = ([...data.scenarios, ...BAND_SESSIONS] as unknown as Raw[])
  .filter(s => s.status === 'verified')
  .map(s => ({ id: s.id, title: s.title, bands: s.bands ?? ['kids', 'youth', 'adult', 'elder'], scenario: { contact: s.contact, channel: s.channel, intro: s.intro, explanation: s.explanation, warning: s.warning, redFlags: s.redFlags, steps: s.steps as AdminScenario['scenario']['steps'] } }));
export const bundledTitle = (id: string) => BUNDLED.find(s => s.id === id)?.title ?? null;
