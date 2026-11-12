import { useState } from 'react';
import { GraduationCap, Star, ShieldCheck, Ban, Link2 } from 'lucide-react';
import '../daily/daily.css';
import { ReadAloud } from '../daily/components/ReadAloud';
import { baitPostParts, baitRevealParts } from '../daily/lib/spoken';
import { BAIT_POSTS, BAIT_UI, type BaitPost } from './baitPosts';
import type { Lang } from '../daily/types';

// Kids bait-post simulator: a feed of tempting practice posts. Tapping the bait shows a "Gotcha!" reveal
// (never a punishment), scrolling past is praised; either way the kid hears one rule and earns a star.
// Kids mode is anonymous: stars live only on this device, and storage failures fall back to memory.
const KEY = 'sati-kids-bait-stars';
function readStars(): string[] {
  try { const v = JSON.parse(localStorage.getItem(KEY) || '[]'); return Array.isArray(v) ? v.filter(x => typeof x === 'string') : []; } catch { return []; }
}
function writeStars(ids: string[]) {
  try { localStorage.setItem(KEY, JSON.stringify(ids)); } catch { /* storage unavailable: memory only */ }
}

type Open = { post: BaitPost; tapped: boolean };

export function BaitFeed({ lang }: { lang: Lang }) {
  const t = BAIT_UI[lang];
  const [stars, setStars] = useState<string[]>(readStars);
  const [open, setOpen] = useState<Open | null>(null);
  const left = BAIT_POSTS.filter(p => !stars.includes(p.id));

  const finish = () => {
    if (!open) return;
    const next = stars.includes(open.post.id) ? stars : [...stars, open.post.id];
    setStars(next); writeStars(next); setOpen(null);
  };
  const reset = () => { setStars([]); writeStars([]); };

  return (
    <section aria-labelledby="bait-title" className="mx-3 mt-3 rounded-3xl border-2 border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/30 p-3">
      <div className="flex items-center justify-between gap-2">
        <h2 id="bait-title" className="text-lg font-bold font-lao flex items-center gap-2"><GraduationCap size={22} className="text-amber-600" />{t.title}</h2>
        <span className="flex items-center gap-1 text-sm font-bold text-amber-700 dark:text-amber-300 tabular-nums" aria-label={t.stars.replace('{n}', String(stars.length)).replace('{total}', String(BAIT_POSTS.length))}>
          <Star size={18} fill="currentColor" />{stars.length}/{BAIT_POSTS.length}
        </span>
      </div>
      <p className="text-sm font-lao mt-1">{t.intro}</p>
      <div className="mt-2"><ReadAloud parts={[t.intro]} lang={lang} /></div>

      {left.length === 0 ? (
        <div className="daily-pop mt-3 rounded-2xl bg-card border border-border p-4 text-center">
          <p className="text-3xl" aria-hidden>🌟</p>
          <p className="font-bold font-lao mt-1">{t.all_done}</p>
          <button onClick={reset} className="daily-btn mt-3 w-full rounded-2xl daily-grad text-white font-bold font-lao">{t.again}</button>
        </div>
      ) : (
        <div className="grid gap-3 mt-3">
          {left.map((post, i) => (
            <article key={post.id} className="daily-in rounded-2xl bg-card border border-border p-3 shadow-sm" style={{ animationDelay: `${i * 0.05}s` }}>
              <div className="flex items-center gap-2">
                <span aria-hidden className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-xl">{post.emoji}</span>
                <span className="flex-1 min-w-0 font-bold font-lao truncate">{post.from[lang]}</span>
                <span className="shrink-0 rounded-full bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-200 px-2 py-0.5 text-[11px] font-bold font-lao">🎓 {t.badge}</span>
              </div>
              <p className="mt-2 text-base font-lao leading-relaxed">{post.body[lang]}</p>
              {/* Plain text on purpose: practice posts never contain a real, clickable link. */}
              {post.fakeLink && <p className="mt-2 flex items-center gap-1 text-sm text-sky-700 dark:text-sky-300 select-none"><Link2 size={14} />{post.fakeLink}</p>}
              <div className="mt-2"><ReadAloud parts={baitPostParts(post, lang)} lang={lang} /></div>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <button onClick={() => setOpen({ post, tapped: true })} className="daily-btn rounded-2xl bg-gradient-to-br from-pink-500 to-orange-400 text-white font-bold font-lao px-2">{post.cta[lang]}</button>
                <button onClick={() => setOpen({ post, tapped: false })} className="daily-btn rounded-2xl bg-muted font-bold font-lao px-2 flex items-center justify-center gap-1"><Ban size={18} />{t.skip}</button>
              </div>
            </article>
          ))}
        </div>
      )}
      <p className="mt-3 text-sm font-semibold font-lao text-center">{t.adult}</p>

      {open && <Reveal lang={lang} open={open} onDone={finish} />}
    </section>
  );
}

// Reveal → lesson in one sheet: what would have happened (or praise), then the single rule, read aloud.
function Reveal({ lang, open, onDone }: { lang: Lang; open: Open; onDone: () => void }) {
  const t = BAIT_UI[lang];
  const { post, tapped } = open;
  const head = tapped ? t.gotcha : t.smart;
  const sub = tapped ? t.gotcha_sub : t.smart_sub;
  return (
    <div role="dialog" aria-modal="true" aria-labelledby="bait-reveal" className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center p-3">
      <div className="daily-pop w-full max-w-md rounded-3xl bg-card p-5 shadow-xl max-h-[90vh] overflow-y-auto">
        <p className="text-5xl text-center" aria-hidden>{tapped ? '🎣' : '🛡️'}</p>
        <h3 id="bait-reveal" className={`text-2xl font-bold text-center font-lao mt-2 ${tapped ? 'text-pink-600' : 'text-emerald-600'}`}>{head}</h3>
        <p className="text-sm text-muted-foreground text-center font-lao mt-1">{sub}</p>
        {tapped && <p className="mt-3 rounded-2xl bg-pink-50 dark:bg-pink-950/30 border border-pink-200 dark:border-pink-800 p-3 font-lao">{post.reveal[lang]}</p>}
        <div className="mt-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 p-3">
          <p className="text-xs font-bold uppercase tracking-wide text-emerald-700 dark:text-emerald-300 font-lao flex items-center gap-1"><ShieldCheck size={14} />{t.rule}</p>
          <p className="mt-1 text-lg font-bold font-lao">{post.rule[lang]}</p>
        </div>
        <div className="mt-3"><ReadAloud key={post.id + tapped} parts={baitRevealParts(post, tapped, lang)} lang={lang} /></div>
        <button onClick={onDone} className="daily-btn mt-4 w-full rounded-2xl daily-grad text-white font-bold font-lao flex items-center justify-center gap-2"><Star size={18} fill="currentColor" className="juice-star" />{t.next}</button>
      </div>
    </div>
  );
}
