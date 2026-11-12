import { useState } from 'react';
import { Lock } from 'lucide-react';
import mini from '../data/minigames.json';
import { Guide, TrustMeter, TopBar, haptic } from '../components/ui';
import { DT } from '../i18n';
import { track } from '../lib/analytics';
import { useMusic } from '../lib/sound';
import { filterByBand, getBand } from '../../../lib/band';
import type { Lang, LinkRound } from '../types';
import type { GameResult } from './StoryGame';

const all = mini.links as LinkRound[];

export function LinkDetective({ lang, onExit, onFinish }: { lang: Lang; onExit: () => void; onFinish: (r: GameResult) => void }) {
  const t = DT[lang];
  const [rounds] = useState(() => filterByBand(all, getBand()));
  const [i, setI] = useState(0);
  const [pick, setPick] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [trust, setTrust] = useState(3);
  const r = rounds[i];
  useMusic('mystery');

  const choose = (k: number) => {
    if (pick !== null) return;
    const ok = k === r.safe;
    setPick(k); haptic(ok);
    track({ type: 'choice_made', scenarioId: `link-${r.id}`, scamType: 'bank_phishing', step: r.id, correct: ok });
    if (ok) setScore(s => s + 100);
    else { setTrust(v => v - 1); track({ type: 'flag_missed', scenarioId: `link-${r.id}`, flag: 'suspicious_link' }); }
  };
  const next = () => {
    if (trust <= 0 || i + 1 >= rounds.length) return onFinish({ score, total: rounds.length, missed: score < rounds.length * 100 ? ['suspicious_link'] : [], failed: trust <= 0, scenarioIds: [] });
    setI(i + 1); setPick(null);
  };

  return (
    <div className="flex flex-col h-full">
      <TopBar onBack={onExit} lang={lang}><span className="font-bold">{i + 1}/{rounds.length}</span><TrustMeter trust={trust} /></TopBar>
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <Guide mood={pick === null ? 'idle' : pick === r.safe ? 'happy' : 'sad'} text={pick === null ? `${t.which_safe} (${r.brand})` : r.why[lang]} />
        <div key={r.id} className="grid gap-2">
          {r.options.map((url, k) => {
            const state = pick === null ? '' : k === r.safe ? 'border-green-500 bg-green-50 dark:bg-green-950/40 daily-pop' : k === pick ? 'border-red-500 bg-red-50 dark:bg-red-950/40 daily-shake' : 'opacity-50';
            return (
              <button key={url} onClick={() => choose(k)} className={`daily-btn daily-in flex items-center gap-2 text-left rounded-2xl border-2 border-border bg-card px-4 py-3 font-mono text-sm break-all ${state}`} style={{ animationDelay: `${k * 0.06}s` }}>
                <Lock size={14} className="shrink-0 text-muted-foreground" />https://{url}/
              </button>
            );
          })}
        </div>
        {pick !== null && <button onClick={next} className="daily-btn daily-in w-full rounded-2xl daily-grad text-white font-bold">{t.next} →</button>}
      </div>
    </div>
  );
}
