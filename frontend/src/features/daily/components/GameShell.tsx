import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Shield, ShieldCheck, X, Zap } from 'lucide-react';
import type { Lang } from '../types';

export const MAX_LIVES = 3;
const tx = (lang: Lang, lo: string, en: string) => (lang === 'lo' ? lo : en);

// Shared frame for every game: exit button, name, "ຂໍ້ n / N", 3 shield lives, XP chip and a segmented progress bar.
// Light and dark variants. Games take the whole screen, so there is no bottom nav during play.
// `midGame` asks "leave the game?" before exiting, because progress is lost.
export function GameShell({ lang, name, index, total, lives = MAX_LIVES, xp = 0, dark = false, midGame = true, onExit, children }: {
  lang: Lang; name: string; index: number; total: number; lives?: number; xp?: number; dark?: boolean; midGame?: boolean; onExit: () => void; children: ReactNode;
}) {
  const [confirm, setConfirm] = useState(false);
  const bar = dark ? 'bg-[#0F0B2A] text-white border-white/10' : 'bg-background text-text border-border';
  const seg = dark ? 'bg-white/20' : 'bg-[#E6E6F0]';
  return (
    <div className={`flex flex-col h-full font-lao ${dark ? 'bg-[#0F0B2A] text-white' : 'bg-[#F7F7FA] text-text'}`}>
      <header className={`shrink-0 border-b px-3 pt-[max(8px,env(safe-area-inset-top))] pb-2 ${bar}`}>
        <div className="flex items-center gap-2">
          <button type="button" aria-label={tx(lang, 'ອອກຈາກເກມ', 'Exit game')} onClick={() => (midGame ? setConfirm(true) : onExit())}
            className={`min-h-11 min-w-11 -ml-1 flex items-center justify-center rounded-full ${dark ? 'text-white' : 'text-text-2'} focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary`}><X size={24} aria-hidden /></button>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[15px] font-bold leading-tight">{name}</p>
            <p className={`text-[13px] leading-tight tabular-nums ${dark ? 'text-white/70' : 'text-text-muted'}`}>{tx(lang, 'ຂໍ້', 'Q')} {Math.min(index + 1, total)} / {total}</p>
          </div>
          <span role="img" aria-label={tx(lang, `ໂລ່ ${lives} ຈາກ ${MAX_LIVES}`, `${lives} of ${MAX_LIVES} shields left`)} className="flex items-center gap-0.5">
            {Array.from({ length: MAX_LIVES }, (_, i) => i < lives ? <ShieldCheck key={i} size={22} aria-hidden className="text-[#2563EB]" fill="#60A5FA" /> : <Shield key={i} size={22} aria-hidden className={dark ? 'text-white/35' : 'text-[#B9BCD3]'} />)}
          </span>
          <span className={`flex items-center gap-1 rounded-full px-2.5 h-8 text-[14px] font-extrabold tabular-nums ${dark ? 'bg-white/15' : 'bg-[#EDE9FE] text-[#5B21D1]'}`}><Zap size={14} aria-hidden fill="currentColor" />{xp} XP</span>
        </div>
        <div role="progressbar" aria-label={tx(lang, 'ຄວາມຄືບໜ້າ', 'Progress')} aria-valuemin={0} aria-valuemax={total} aria-valuenow={Math.min(index, total)} className="mt-2 flex gap-1">
          {Array.from({ length: total }, (_, i) => <span key={i} className={`h-2 flex-1 rounded-full transition-colors ${i < index ? 'bg-[#5B21D1]' : i === index ? 'bg-[#6E8EF0]' : seg}`} />)}
        </div>
      </header>
      <div className="flex-1 min-h-0 relative">{children}</div>
      {confirm && <ExitSheet lang={lang} onStay={() => setConfirm(false)} onExit={onExit} />}
    </div>
  );
}

function ExitSheet({ lang, onStay, onExit }: { lang: Lang; onStay: () => void; onExit: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const back = document.activeElement as HTMLElement | null; ref.current?.focus();
    const k = (e: KeyboardEvent) => { if (e.key === 'Escape') onStay(); };
    document.addEventListener('keydown', k); return () => { document.removeEventListener('keydown', k); back?.focus?.(); };
  }, [onStay]);
  return <div className="fixed inset-0 z-[70] flex items-end justify-center bg-black/50" onClick={onStay}>
    <div ref={ref} tabIndex={-1} role="alertdialog" aria-modal="true" aria-label={tx(lang, 'ອອກຈາກເກມ?', 'Leave the game?')} onClick={e => e.stopPropagation()}
      className="daily-slide-up w-full max-w-[480px] rounded-t-3xl bg-background text-text px-5 pt-5 pb-[calc(20px+env(safe-area-inset-bottom))] outline-none">
      <h2 className="text-[1.375rem] font-extrabold">{tx(lang, 'ອອກຈາກເກມ?', 'Leave the game?')}</h2>
      <p className="mt-1 text-[1.0625rem] leading-relaxed text-text-muted">{tx(lang, 'ຄວາມຄືບໜ້າໃນຮອບນີ້ຈະບໍ່ຖືກບັນທຶກ.', 'Your progress in this round will not be saved.')}</p>
      <button type="button" onClick={onStay} className="mt-4 w-full min-h-[52px] rounded-2xl bg-[#5B21D1] text-white text-[1.0625rem] font-bold shadow-[0_5px_0_#3B0E91] active:translate-y-[3px] active:shadow-[0_2px_0_#3B0E91]">{tx(lang, 'ຫຼິ້ນຕໍ່', 'Keep playing')}</button>
      <button type="button" onClick={onExit} className="mt-3 w-full min-h-[52px] rounded-2xl border-2 border-border text-[1.0625rem] font-bold text-text">{tx(lang, 'ອອກ', 'Leave')}</button>
    </div>
  </div>;
}
