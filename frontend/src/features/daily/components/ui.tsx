import { useState } from 'react';
import { Eye, Heart, ShieldCheck, ShieldAlert, Shield, Flame, ArrowLeft, Music } from 'lucide-react';
import { setSoundOn, sfx, useSoundOn, type Sfx } from '../lib/sound';
import { getLike, toggleLike } from '../lib/progress';
import { DT } from '../i18n';
import type { Lang } from '../types';

export type Mood = 'idle' | 'happy' | 'sad';

// Tiny shield guide: no mascot, just an icon that reacts to answers.
export function Guide({ mood, text }: { mood: Mood; text?: string }) {
  const Icon = mood === 'happy' ? ShieldCheck : mood === 'sad' ? ShieldAlert : Shield;
  const color = mood === 'happy' ? 'text-green-600 bg-green-50' : mood === 'sad' ? 'text-red-600 bg-red-50' : 'text-primary bg-primary/10';
  return (
    <div className="flex items-start gap-2">
      <div key={mood} className={`relative shrink-0 w-11 h-11 rounded-2xl flex items-center justify-center ${color} ${mood === 'idle' ? 'daily-float' : mood === 'happy' ? 'daily-pop' : 'daily-shake'}`}>
        <Icon size={24} />
        {mood === 'idle' && <Eye size={11} className="absolute bottom-1 right-1" />}
      </div>
      {text && <p key={text} className="daily-in text-sm font-lao bg-card border border-border rounded-2xl rounded-tl-sm px-3 py-2 leading-relaxed">{text}</p>}
    </div>
  );
}

export function TrustMeter({ trust, max = 3 }: { trust: number; max?: number }) {
  return (
    <div className="flex items-center gap-0.5" aria-label={`Trust ${trust}/${max}`}>
      {Array.from({ length: max }, (_, i) => (
        <ShieldCheck key={i} size={20} className={i < trust ? 'text-primary' : 'text-muted-foreground/30'} fill={i < trust ? 'currentColor' : 'none'} fillOpacity={0.2} />
      ))}
    </div>
  );
}

export function Streak({ days }: { days: number }) {
  return <span className="inline-flex items-center gap-1 font-bold text-orange-500"><Flame size={18} fill="currentColor" />{days}</span>;
}

export function LikeButton({ id, lang, compact }: { id: string; lang: Lang; compact?: boolean }) {
  const [like, setLike] = useState(() => getLike(id));
  const [burst, setBurst] = useState(0);
  return (
    <button
      aria-pressed={like.liked}
      aria-label={like.liked ? DT[lang].liked : DT[lang].like}
      onClick={e => { e.stopPropagation(); const next = toggleLike(id); setLike(next); if (next.liked) setBurst(b => b + 1); navigator.vibrate?.(15); }}
      className={`inline-flex items-center gap-1 rounded-full px-3 min-h-11 text-sm font-semibold transition-colors ${like.liked ? 'text-pink-600 bg-pink-50 dark:bg-pink-950/40' : 'text-muted-foreground bg-muted'}`}>
      <Heart key={burst} size={18} fill={like.liked ? 'currentColor' : 'none'} className={like.liked ? 'daily-pop' : ''} />
      {like.count}{!compact && <span className="sr-only">{DT[lang].like}</span>}
    </button>
  );
}

export function TopBar({ onBack, children, lang }: { onBack: () => void; children?: React.ReactNode; lang: Lang }) {
  return (
    <div className="shrink-0 flex items-center gap-3 px-3 py-2 border-b border-border">
      <button onClick={onBack} aria-label={DT[lang].back} className="w-11 h-11 rounded-full flex items-center justify-center hover:bg-muted"><ArrowLeft size={22} /></button>
      <div className="flex-1 flex items-center justify-between gap-2">{children}</div>
      <SoundToggle lang={lang} />
    </div>
  );
}

// Buzz plus a matching sound on every right / wrong moment; pass a different effect (or null) where it fits better.
export function haptic(ok: boolean, sound: Sfx | null = ok ? 'right' : 'wrong') {
  try { navigator.vibrate?.(ok ? 20 : [40, 40, 40]); } catch { /* not supported */ }
  if (sound) sfx(sound);
}

// Music and sound effects on/off, shared by every game.
export function SoundToggle({ lang, className = '' }: { lang: Lang; className?: string }) {
  const on = useSoundOn();
  return (
    <button onClick={() => setSoundOn(!on)} aria-pressed={on} aria-label={DT[lang].sound}
      className={`relative w-11 h-11 shrink-0 rounded-full bg-muted flex items-center justify-center ${on ? 'text-primary' : 'text-muted-foreground'} ${className}`}>
      <Music size={18} />
      {!on && <span aria-hidden className="absolute w-6 h-0.5 rounded-full bg-current rotate-45" />}
    </button>
  );
}
