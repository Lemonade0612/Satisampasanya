import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Check, Clock, X } from 'lucide-react';
import { ANSWER_PAUSE_MS } from '../../../../../shared/game-config.mjs';
import type { Lang } from '../types';

export type FeedbackItem = { ok: boolean; text: ReactNode; reason: string };
const tx = (lang: Lang, lo: string, en: string) => (lang === 'lo' ? lo : en);

// Big answer feedback shared by every game. A bottom sheet slides up over a dimmed backdrop; focus moves into it and it is
// announced to screen readers. Green or red top border, 56px icon, 26px title, gain chip, 18px explanation (line-height 1.7),
// optional itemised list, a purple "remember" tip at 16px and a full-width next button.
export function FeedbackSheet({ lang, ok, late, title, subtitle, gain, gainTone, explanation, items, tip, nextLabel, onNext, extra }: {
  lang: Lang; ok: boolean; late?: boolean; title?: string; subtitle?: string; gain?: string; gainTone?: 'good' | 'bad' | 'neutral';
  explanation?: ReactNode; items?: FeedbackItem[]; tip?: ReactNode; nextLabel?: string; onNext: () => void; extra?: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const back = document.activeElement as HTMLElement | null;
    ref.current?.focus();
    const id = setTimeout(() => setReady(true), ANSWER_PAUSE_MS);
    return () => { clearTimeout(id); back?.focus?.(); };
  }, []);
  const head = title ?? (late ? tx(lang, 'ໝົດເວລາ!', "Time's up!") : ok ? tx(lang, 'ຖືກຕ້ອງ!', 'Correct!') : tx(lang, 'ຍັງບໍ່ຖືກ', 'Not quite'));
  const Icon = late ? Clock : ok ? Check : X;
  const chip = (gainTone ?? (ok ? 'good' : 'bad')) === 'good' ? 'bg-[#DCFCE7] text-[#15803D]' : gainTone === 'neutral' ? 'bg-[#EEF0F5] text-[#5F6390]' : 'bg-[#FEE2E2] text-[#B91C1C]';
  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/55">
      <div ref={ref} tabIndex={-1} role="alertdialog" aria-modal="true" aria-live="assertive" aria-label={head}
        className={`daily-slide-up w-full max-w-[480px] max-h-[88dvh] overflow-y-auto rounded-t-3xl border-t-[6px] bg-white text-[#14112B] px-5 pt-5 pb-[calc(20px+env(safe-area-inset-bottom))] outline-none font-lao ${ok ? 'border-[#16A34A]' : 'border-[#DC2626]'}`}>
        <div className="flex items-center gap-4">
          <span aria-hidden className={`w-14 h-14 shrink-0 rounded-full flex items-center justify-center text-white ${ok ? 'bg-[#16A34A]' : 'bg-[#DC2626]'}`}><Icon size={34} strokeWidth={3} /></span>
          <div className="min-w-0 flex-1">
            <h2 className={`text-[1.625rem] leading-tight font-extrabold ${ok ? 'text-[#15803D]' : 'text-[#B91C1C]'}`}>{head}</h2>
            {subtitle && <p className="mt-0.5 text-[1rem] leading-snug text-[#5F6390]">{subtitle}</p>}
          </div>
          {gain && <span className={`shrink-0 rounded-full px-3 py-1.5 text-[1rem] font-extrabold tabular-nums ${chip}`}>{gain}</span>}
        </div>
        {explanation && <div className="mt-4 text-[1.125rem] leading-[1.7]">{explanation}</div>}
        {extra}
        {!!items?.length && <ul className="mt-4 flex flex-col gap-2.5">{items.map((it, i) => <li key={i} className="flex items-start gap-3 rounded-2xl bg-[#F7F7FA] p-3 text-[1.0625rem] leading-relaxed">
          <span aria-hidden className={`mt-0.5 w-7 h-7 shrink-0 rounded-full flex items-center justify-center text-white ${it.ok ? 'bg-[#16A34A]' : 'bg-[#DC2626]'}`}>{it.ok ? <Check size={16} strokeWidth={3} /> : <X size={16} strokeWidth={3} />}</span>
          <span className="min-w-0"><span className="font-bold break-words">{it.text}</span><span className="block text-[#5F6390]">{it.reason}</span></span>
          <span className="sr-only">{it.ok ? tx(lang, 'ຖືກ', 'right') : tx(lang, 'ຜິດ', 'wrong')}</span>
        </li>)}</ul>}
        {tip && <div className="mt-4 rounded-2xl bg-[#EDE9FE] p-4 text-[1rem] leading-relaxed text-[#3B0E91]"><span className="font-extrabold">{tx(lang, 'ຈື່ໄວ້: ', 'Remember: ')}</span>{tip}</div>}
        <button type="button" onClick={onNext} disabled={!ready} className="mt-5 w-full min-h-14 rounded-2xl bg-[#5B21D1] text-white text-[1.125rem] font-bold shadow-[0_5px_0_#3B0E91] disabled:opacity-40 disabled:shadow-none active:translate-y-[3px] active:shadow-[0_2px_0_#3B0E91] focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-[#6E8EF0]">
          {nextLabel ?? tx(lang, 'ຕໍ່ໄປ', 'Next')}
        </button>
      </div>
    </div>
  );
}
