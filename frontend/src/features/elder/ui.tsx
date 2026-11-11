import { useEffect, useRef, useState, type ReactNode } from 'react';
import { ArrowLeft, BookOpen, House, ShieldCheck, Volume2, VolumeX } from 'lucide-react';
import { SatiLogo } from '../../components/shared/Brand';
import { useSpeak } from '../daily/lib/useSpeak';
import { ET } from './text';
import './elder.css';

// Elder mode building blocks. Sizes are in rem so the OS text size scales everything (16px = 1rem).
// Rules: header -> one main block -> max 2 list items -> one main button. No shadows, no gradients.

export type Tab = 'home' | 'check' | 'learn';

/** Reads Lao lines aloud: the bundled recordings first, a Lao device voice if a line has no recording. */
export function useElderSpeak(parts: string[]) {
  const s = useSpeak(parts, 'lo', 'elder');
  const [device, setDevice] = useState(false);
  const laoVoice = () => (typeof speechSynthesis !== 'undefined' ? speechSynthesis.getVoices().find(v => v.lang.toLowerCase().startsWith('lo')) : undefined);
  const play = (onEnd?: () => void) => {
    if (s.status === 'ready') return s.play(onEnd);
    const voice = laoVoice();
    if (!voice) return onEnd?.();
    const u = new SpeechSynthesisUtterance(parts.filter(Boolean).join('. '));
    u.voice = voice; u.lang = voice.lang; u.rate = 0.85;
    u.onend = u.onerror = () => { setDevice(false); onEnd?.(); };
    setDevice(true); speechSynthesis.speak(u);
  };
  const stop = () => { s.stop(); if (device) { speechSynthesis.cancel(); setDevice(false); } };
  useEffect(() => () => { if (typeof speechSynthesis !== 'undefined') speechSynthesis.cancel(); }, []);
  return { speaking: s.speaking || device, canSpeak: s.status === 'ready' || !!laoVoice(), loading: s.status === 'loading', play, stop };
}

/** 56px round listen button. Reads `parts` (the whole screen); tap again to stop. `auto` reads once on mount. */
export function ListenButton({ parts, auto = false, onSpeaking }: { parts: string[]; auto?: boolean; onSpeaking?: (on: boolean) => void }) {
  const s = useElderSpeak(parts);
  useEffect(() => { onSpeaking?.(s.speaking); }, [s.speaking]); // eslint-disable-line react-hooks/exhaustive-deps
  const done = useRef(false);
  useEffect(() => { if (auto && !done.current && !s.loading) { done.current = true; s.play(); } }, [auto, s.loading]); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <button type="button" onClick={() => (s.speaking ? s.stop() : s.play())} aria-pressed={s.speaking}
      aria-label={s.speaking ? ET.reading : ET.listen} className="shrink-0 flex flex-col items-center gap-1 min-w-[4.5rem]">
      <span className="w-14 h-14 rounded-full bg-[#EEF2FF] text-[#5B21D1] flex items-center justify-center">{s.speaking ? <VolumeX size={30} aria-hidden /> : <Volume2 size={30} aria-hidden />}</span>
      <span className="text-[1.125rem] font-bold leading-tight text-[#3B0FA0] whitespace-nowrap">{s.speaking ? ET.stop : ET.listen}</span>
    </button>
  );
}

export function Header({ title, listen, onBack, autoRead = false }: { title: string; listen: string[]; onBack?: () => void; autoRead?: boolean }) {
  const [reading, setReading] = useState(false);
  return (
    <>
    <header className="flex items-center gap-3 px-5 pt-4 pb-2">
      {onBack ? (
        <button type="button" onClick={onBack} aria-label={ET.back} className="shrink-0 flex flex-col items-center gap-1 min-w-[4.5rem]">
          <span className="w-14 h-14 rounded-full bg-[#EEF2FF] text-[#5B21D1] flex items-center justify-center"><ArrowLeft size={30} aria-hidden /></span>
          <span className="text-[1.125rem] font-bold leading-tight text-[#3B0FA0]">{ET.back}</span>
        </button>
      ) : <SatiLogo size={48} />}
      <h1 className="flex-1 min-w-0 text-[1.625rem] font-bold leading-snug break-words">{title}</h1>
      <ListenButton parts={[title, ...listen]} auto={autoRead} onSpeaking={setReading} />
    </header>
    {reading && <p role="status" className="mx-5 mb-1 rounded-full bg-[#EEF2FF] px-4 py-1 text-[1.125rem] font-bold text-[#3B0FA0] text-center">{ET.reading}</p>}
    </>
  );
}

/** Header, a scrolling main block, then one main button pinned above the tab bar. */
export function Page({ header, children, main }: { header: ReactNode; children: ReactNode; main?: ReactNode }) {
  return (
    <div className="flex-1 min-h-0 flex flex-col">
      {header}
      <main className="flex-1 min-h-0 overflow-y-auto px-5 pt-2 pb-4 flex flex-col gap-4">{children}</main>
      {main && <div className="px-5 pb-4 pt-2 border-t border-[#E4E2EE] bg-white">{main}</div>}
    </div>
  );
}

export function MainButton({ icon, label, onClick, kind = 'primary', href }: { icon: ReactNode; label: string; onClick?: () => void; kind?: 'primary' | 'secondary'; href?: string }) {
  const cls = `w-full min-h-[5.25rem] rounded-[1.375rem] px-5 flex items-center justify-center gap-3 text-[1.4375rem] font-bold leading-snug text-center ${
    kind === 'primary' ? 'bg-[#5B21D1] text-white' : 'bg-[#EEF2FF] text-[#3B0FA0]'}`;
  const body = <><span className="shrink-0 [&>svg]:w-[1.875rem] [&>svg]:h-[1.875rem]" aria-hidden>{icon}</span><span>{label}</span></>;
  return href ? <a href={href} className={cls}>{body}</a> : <button type="button" onClick={onClick} className={cls}>{body}</button>;
}

/** 40px numbered circles with 20px text. */
export function Steps({ steps }: { steps: readonly string[] }) {
  return (
    <ol className="grid gap-3">
      {steps.map((s, i) => (
        <li key={i} className="flex items-start gap-3">
          <span className="shrink-0 w-10 h-10 rounded-full bg-[#EEF2FF] text-[#5B21D1] text-[1.25rem] font-bold flex items-center justify-center" aria-hidden>{i + 1}</span>
          <span className="text-[1.25rem] leading-normal pt-1">{s}</span>
        </li>
      ))}
    </ol>
  );
}

const TABS: { id: Tab; label: string; icon: typeof House }[] = [
  { id: 'home', label: ET.home, icon: House }, { id: 'check', label: ET.check, icon: ShieldCheck }, { id: 'learn', label: ET.learn, icon: BookOpen },
];
export function BottomBar({ tab, onTab }: { tab: Tab; onTab: (t: Tab) => void }) {
  return (
    <nav aria-label={ET.home} className="shrink-0 min-h-[5.75rem] bg-white border-t border-[#E4E2EE] grid grid-cols-3 gap-2 px-3 py-2">
      {TABS.map(({ id, label, icon: Icon }) => {
        const on = id === tab;
        return (
          <button key={id} type="button" onClick={() => onTab(id)} aria-current={on ? 'page' : undefined}
            className={`min-h-[4.5rem] rounded-[1.25rem] flex flex-col items-center justify-center gap-1 ${on ? 'bg-[#EEF2FF] text-[#5B21D1]' : 'text-[#4B4870]'}`}>
            <Icon size={32} aria-hidden />
            <span className="text-[1.125rem] font-bold leading-tight">{label}</span>
          </button>
        );
      })}
    </nav>
  );
}
