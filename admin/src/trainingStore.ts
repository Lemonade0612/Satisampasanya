import { screenPost } from '../../shared/screening';
import { makeOverride, type OverrideExample } from '../../shared/screening/overrides';

const KEY = 'sati.screening.overrides';
const read = (): OverrideExample[] => { try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch { return []; } };

/** Called after an expert reviews a post: if the expert disagrees with the local engine, keep the example for scripts/eval.ts. */
export function recordOverride(text: string, expertState: string) {
  if (!text.trim()) return;
  const ai = screenPost(text);
  const entry = makeOverride(text, ai.state, expertState, ai.flags);
  if (!entry) return;
  try { localStorage.setItem(KEY, JSON.stringify([...read(), entry])); } catch { /* storage full or blocked: the review itself still went through */ }
}

export const overrideCount = () => read().length;

/** Download the saved overrides as JSON; put the file at scripts/overrides.json for the eval. */
export function exportOverrides() {
  const url = URL.createObjectURL(new Blob([JSON.stringify(read(), null, 2)], { type: 'application/json' }));
  const a = document.createElement('a'); a.href = url; a.download = 'overrides.json'; a.click(); URL.revokeObjectURL(url);
}
