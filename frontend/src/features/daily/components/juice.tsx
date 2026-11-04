import { useEffect, useRef, useState } from 'react';
import { Flame, Timer } from 'lucide-react';
import { setUrgent, sfx } from '../lib/sound';

const COLORS = ['#F43F5E', '#F59E0B', '#10B981', '#3B82F6', '#A855F7', '#FACC15'];

// Confetti burst for right answers. Mount with a new key to fire again.
export function Burst({ count = 22 }: { count?: number }) {
  const [bits] = useState(() => Array.from({ length: count }, (_, i) => {
    const a = (i / count) * Math.PI * 2 + Math.random() * 0.4, d = 70 + Math.random() * 90;
    return { dx: Math.cos(a) * d, dy: Math.sin(a) * d - 40, r: Math.random() * 540 - 270, c: COLORS[i % COLORS.length], round: i % 3 === 0, delay: Math.random() * 0.08 };
  }));
  return (
    <span aria-hidden className="pointer-events-none absolute left-1/2 top-1/2 z-20 w-0 h-0">
      {bits.map((b, i) => <span key={i} className="juice-bit" style={{ '--dx': `${b.dx}px`, '--dy': `${b.dy}px`, '--r': `${b.r}deg`, background: b.c, borderRadius: b.round ? '50%' : '2px', animationDelay: `${b.delay}s` } as React.CSSProperties} />)}
    </span>
  );
}

// Shrinking time bar. Re-key it for every new question; onDone fires once when time runs out.
export function Countdown({ seconds, onDone, paused, label }: { seconds: number; onDone: () => void; paused?: boolean; label?: string }) {
  const [left, setLeft] = useState(seconds * 1000);
  const done = useRef(onDone); done.current = onDone;
  const leftRef = useRef(left); leftRef.current = left;
  useEffect(() => {
    if (paused) return;
    const start = performance.now(), base = leftRef.current;
    let raf = 0;
    const tick = (now: number) => {
      const l = Math.max(0, base - (now - start));
      setLeft(l);
      if (l <= 0) { done.current(); return; }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [paused]);
  const pct = left / (seconds * 1000), low = pct < 0.34;
  // Last third: the music speeds up and every second ticks.
  const sec = Math.ceil(left / 1000), lastTick = useRef(sec);
  useEffect(() => {
    if (low && !paused && sec !== lastTick.current && sec > 0) sfx('tick');
    lastTick.current = sec;
  }, [sec, low, paused]);
  useEffect(() => { setUrgent(low && !paused); }, [low, paused]);
  useEffect(() => () => setUrgent(false), []);
  return (
    <div className={`flex items-center gap-2 ${low ? 'text-red-600' : 'text-primary'}`} role="timer" aria-label={label}>
      <Timer size={18} className={low ? 'daily-shake' : ''} key={low ? 'low' : 'ok'} />
      <div className="flex-1 h-3 rounded-full bg-muted overflow-hidden">
        <div className={`h-full rounded-full ${low ? 'bg-red-500 juice-pulse' : 'daily-grad'}`} style={{ width: `${pct * 100}%` }} />
      </div>
      <span className="w-6 text-right font-bold tabular-nums">{Math.ceil(left / 1000)}</span>
    </div>
  );
}

// Streak flame that appears from 2 right answers in a row.
export function Combo({ n, label }: { n: number; label: string }) {
  if (n < 2) return null;
  return <span key={n} className="daily-pop inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-orange-500 to-rose-500 text-white px-2.5 py-1 text-xs font-extrabold shadow"><Flame size={14} fill="currentColor" />{label} ×{n}</span>;
}
