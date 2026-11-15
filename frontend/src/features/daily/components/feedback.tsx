import { useEffect, useRef, useState, type ReactNode } from 'react';
import { CheckCircle2, Clock, XCircle } from 'lucide-react';
import { ANSWER_PAUSE_MS } from '../../../../../shared/game-config.mjs';
import { DT } from '../i18n';
import type { Lang } from '../types';

// Wraps the first occurrence of `part` in a strong yellow mark so the red flag stands out in a message or link.
export function Highlight({ text, part }: { text: string; part?: string }) {
  const at = part ? text.indexOf(part) : -1;
  if (!part || at < 0) return <>{text}</>;
  return <>{text.slice(0, at)}<mark className="rounded px-1 font-extrabold bg-yellow-300 text-black underline decoration-red-600 decoration-2 underline-offset-2">{part}</mark>{text.slice(at + part.length)}</>;
}

export function ProgressBar({ value, max, label }: { value: number; max: number; label: string }) {
  return <div role="progressbar" aria-label={label} aria-valuemin={0} aria-valuemax={max} aria-valuenow={value} className="h-3 w-full rounded-full bg-muted overflow-hidden">
    <div className="h-full rounded-full daily-grad transition-[width] duration-500" style={{ width: `${(value / max) * 100}%` }} />
  </div>;
}

// Large result card shown after every answer: icon + colour + words (never colour alone), the reason, the red flag, then a Next button.
// Next stays disabled for ANSWER_PAUSE_MS so the card is read before the next round.
export function FeedbackCard({ lang, ok, late, why, flag, extra, onNext, last }: {
  lang: Lang; ok: boolean; late?: boolean; why: string; flag?: ReactNode; extra?: ReactNode; onNext: () => void; last?: boolean;
}) {
  const t = DT[lang];
  const [ready, setReady] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => { const id = setTimeout(() => setReady(true), ANSWER_PAUSE_MS); return () => clearTimeout(id); }, []);
  useEffect(() => { ref.current?.scrollIntoView({ behavior: 'smooth', block: 'end' }); }, []);
  const tone = ok ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40' : 'border-red-500 bg-red-50 dark:bg-red-950/40';
  const Icon = late ? Clock : ok ? CheckCircle2 : XCircle;
  return (
    <div ref={ref} role="status" aria-live="polite" className={`daily-slide-up w-full rounded-3xl border-4 p-5 grid gap-3 shadow-lg font-lao ${tone}`}>
      <p className={`flex items-center gap-3 text-[26px] leading-tight font-extrabold ${ok ? 'text-emerald-700 dark:text-emerald-300' : 'text-red-700 dark:text-red-300'}`}>
        <Icon size={44} aria-hidden className="shrink-0" />
        <span>{late ? t.fb_late : ok ? t.fb_correct : t.fb_careful}</span>
      </p>
      <p className="text-lg leading-relaxed">{why}</p>
      {flag && <p className="text-lg leading-relaxed rounded-2xl bg-background/80 border border-border p-3"><span className="font-extrabold text-red-600">🚩 {t.fb_flag}: </span>{flag}</p>}
      {extra}
      <button onClick={onNext} disabled={!ready} className="daily-btn w-full min-h-14 rounded-2xl bg-primary text-primary-foreground text-lg font-bold shadow-[0_4px_0_#3B0FA0] disabled:opacity-40 disabled:shadow-none transition-opacity">{last ? t.end_title : t.next} →</button>
    </div>
  );
}
