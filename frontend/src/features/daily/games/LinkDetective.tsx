import { useState } from 'react';
import { Link2, ShieldCheck, Flag } from 'lucide-react';
import linkData from '../data/link-hunt.json';
import { TrustMeter, TopBar, haptic } from '../components/ui';
import { Burst, Combo } from '../components/juice';
import { FeedbackCard, Highlight, ProgressBar } from '../components/feedback';
import { DT } from '../i18n';
import { track } from '../lib/analytics';
import { tier } from '../lib/age';
import { useMusic } from '../lib/sound';
import { STREAK_CONFETTI, pickLinkRounds, realDomain } from '../../../../../shared/game-config.mjs';
import type { Lang } from '../types';
import type { GameResult } from './StoryGame';

// One link per round. About half are real, half are look-alikes, in a fresh order every game (data/link-hunt.json).
export type HuntLink = { url: string; isReal: boolean; explanation_lo: string; explanation_en: string; redFlagPart: string };
const pool = linkData.links as HuntLink[];

export function LinkDetective({ lang, onExit, onFinish }: { lang: Lang; onExit: () => void; onFinish: (r: GameResult) => void }) {
  const t = DT[lang];
  const [rounds] = useState(() => pickLinkRounds(pool, tier().quick));
  const [i, setI] = useState(0);
  const [pick, setPick] = useState<boolean | null>(null); // what the player said: true = "real"
  const [score, setScore] = useState(0);
  const [trust, setTrust] = useState(3);
  const [combo, setCombo] = useState(0);
  const [seen, setSeen] = useState<{ why: string; ok: boolean }[]>([]);
  const r = rounds[i];
  const why = (l: HuntLink) => (lang === 'lo' ? l.explanation_lo : l.explanation_en);
  useMusic('mystery');
  const right = pick !== null && pick === r.isReal;

  const choose = (saysReal: boolean) => {
    if (pick !== null) return;
    const ok = saysReal === r.isReal;
    setPick(saysReal); haptic(ok);
    track({ type: 'choice_made', scenarioId: `link-${i}`, scamType: 'bank_phishing', step: r.url, correct: ok });
    setSeen(l => [...l, { why: why(r), ok }]);
    if (ok) { setScore(s => s + 100 + combo * 25); setCombo(n => n + 1); }
    else { setTrust(v => v - 1); setCombo(0); track({ type: 'flag_missed', scenarioId: `link-${i}`, flag: 'suspicious_link' }); }
  };
  const lessons = () => [...new Set([...seen.filter(x => !x.ok), ...seen.filter(x => x.ok)].map(x => x.why))].slice(0, 3);
  const next = () => {
    if (trust <= 0 || i + 1 >= rounds.length) return onFinish({ score, total: rounds.length, missed: seen.some(x => !x.ok) ? ['suspicious_link'] : [], failed: trust <= 0, scenarioIds: [], lessons: lessons() });
    setI(i + 1); setPick(null);
  };

  return (
    <div className="flex flex-col h-full">
      <TopBar onBack={onExit} lang={lang}><span className="font-bold tabular-nums">{i + 1}/{rounds.length}</span><Combo n={combo} label={t.combo} /><span className="ml-auto font-extrabold tabular-nums text-primary" aria-label={t.score_label}>{score}</span><TrustMeter trust={trust} /></TopBar>
      <div className="flex-1 overflow-y-auto p-4 grid gap-4 content-start">
        <ProgressBar value={i + (pick === null ? 0 : 1)} max={rounds.length} label={t.progress_label} />
        <p className="text-xl font-bold font-lao">{t.link_q}</p>
        <div key={i} className={`daily-in relative rounded-3xl border-2 bg-card p-5 shadow-lg ${pick === null ? 'border-border' : right ? 'border-emerald-500' : 'border-red-500 daily-shake'}`}>
          {right && combo >= STREAK_CONFETTI && <Burst />}
          <p className="flex items-center gap-2 text-sm font-bold text-muted-foreground mb-2"><Link2 size={16} aria-hidden />{t.link_label}</p>
          <p className="font-mono text-xl leading-relaxed break-all select-text">{pick !== null && !r.isReal ? <Highlight text={r.url} part={r.redFlagPart} /> : r.url}</p>
        </div>
        {pick === null
          ? <div className="grid grid-cols-2 gap-3">
              <button onClick={() => choose(false)} className="daily-btn rounded-2xl bg-red-500 text-white font-bold text-lg shadow-[0_4px_0_#991b1b] min-h-16 flex items-center justify-center gap-2"><Flag size={20} />{t.fake}</button>
              <button onClick={() => choose(true)} className="daily-btn rounded-2xl bg-green-600 text-white font-bold text-lg shadow-[0_4px_0_#14532d] min-h-16 flex items-center justify-center gap-2"><ShieldCheck size={20} />{t.real}</button>
            </div>
          : <FeedbackCard lang={lang} ok={right} why={why(r)} onNext={next} last={trust <= 0 || i + 1 >= rounds.length}
              flag={!r.isReal && r.redFlagPart ? <span className="font-mono break-all"><Highlight text={r.redFlagPart} part={r.redFlagPart} /></span> : undefined}
              extra={<p className="text-lg leading-relaxed"><span className="font-extrabold">{t.fb_domain}: </span><span className="font-mono font-bold break-all">{realDomain(r.url)}</span></p>} />}
      </div>
    </div>
  );
}
