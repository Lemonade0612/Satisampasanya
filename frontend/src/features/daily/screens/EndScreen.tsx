import { Trophy, ShieldAlert, Search, Flag, Share2, Lightbulb } from 'lucide-react';
import { useEffect, useState } from 'react';
import { HotlineCard } from '../../../components/shared/HotlineCard';
import { Guide, LikeButton, Streak } from '../components/ui';
import { sfx } from '../lib/sound';
import { DT, FLAG_LABEL } from '../i18n';
import type { FlagCategory, GameId, Lang } from '../types';
import type { GameResult } from '../games/StoryGame';

export function EndScreen({ lang, game, result, streak, onAgain, onHome, onCheck }: {
  lang: Lang; game: GameId; result: GameResult; streak: number; onAgain: () => void; onHome: () => void; onCheck: () => void;
}) {
  const t = DT[lang];
  const [copied, setCopied] = useState(false);
  const [hotline] = useState(() => Math.floor(Math.random() * 5));
  const share = async () => {
    const text = t.share_text.replace('{n}', String(result.score)), url = location.origin;
    try { if (navigator.share) await navigator.share({ text, url }); else { await navigator.clipboard.writeText(`${text} ${url}`); setCopied(true); setTimeout(() => setCopied(false), 2000); } } catch { /* cancelled */ }
  };
  // Scam Call already played its own fanfare on its results screen.
  useEffect(() => { if (game !== 'call') sfx(result.failed || result.score <= 0 ? 'lose' : 'win'); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const missed = Object.entries(result.missed.reduce<Record<string, number>>((m, f) => ({ ...m, [f]: (m[f] || 0) + 1 }), {})) as [FlagCategory, number][];
  return (
    <div className="h-full overflow-y-auto p-5 flex flex-col gap-4">
      <div className="daily-pop text-center pt-4">
        <div className={`mx-auto w-20 h-20 rounded-3xl flex items-center justify-center text-white ${result.failed ? 'bg-red-500' : 'daily-grad'}`}>{result.failed ? <ShieldAlert size={40} /> : <Trophy size={40} />}</div>
        <h2 className="text-2xl font-bold mt-3 font-lao">{result.failed ? t.end_fail : t.end_title}</h2>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl bg-muted p-3 text-center"><p className="text-xs text-muted-foreground">{t.score}</p><p className="text-2xl font-bold text-primary tabular-nums">{result.score}</p></div>
        <div className="rounded-2xl bg-muted p-3 text-center"><p className="text-xs text-muted-foreground font-lao">{t.streak}</p><p className="text-2xl"><Streak days={streak} /></p></div>
      </div>
      <div>
        <h3 className="font-bold mb-2 font-lao">{t.missed_flags}</h3>
        {missed.length
          ? <ul className="grid gap-2">{missed.map(([f, n]) => <li key={f} className="daily-in flex justify-between rounded-xl border border-red-200 bg-red-50 dark:bg-red-950/40 dark:border-red-900 px-3 py-2 text-sm font-lao"><span className="flex items-center gap-1.5"><Flag size={14} className="text-red-600" />{FLAG_LABEL[f][lang]}</span><span className="font-bold">×{n}</span></li>)}</ul>
          : <Guide mood="happy" text={t.no_missed} />}
      </div>
      {!!result.lessons?.length && <div>
        <h3 className="font-bold mb-2 font-lao text-lg flex items-center gap-2"><Lightbulb size={20} className="text-amber-500" aria-hidden />{t.lessons_title}</h3>
        <ol className="grid gap-2">{result.lessons.map((l, k) => <li key={k} className="daily-in flex gap-3 rounded-2xl border border-border bg-card p-3 text-lg leading-relaxed font-lao"><span className="shrink-0 w-8 h-8 rounded-full daily-grad text-white font-bold flex items-center justify-center">{k + 1}</span><span>{l}</span></li>)}</ol>
      </div>}
      <HotlineCard lang={lang} n={hotline} title={t.hotline_end} />
      <div className="flex justify-center gap-2"><button onClick={() => void share()} className="daily-btn inline-flex items-center gap-2 rounded-full bg-muted px-4 min-h-11 font-semibold"><Share2 size={18} aria-hidden />{copied ? t.share_done : t.share}</button><LikeButton id={game} lang={lang} /></div>
      <div className="mt-auto grid gap-2">
        <button onClick={onCheck} className="daily-btn rounded-2xl daily-grad text-white font-bold flex items-center justify-center gap-2 shadow-[0_4px_0_#3B0FA0]"><Search size={18} />{t.check_on_sati}</button>
        <div className="grid grid-cols-2 gap-2">
          <button onClick={onAgain} className="daily-btn rounded-2xl bg-muted font-semibold">{t.play_again}</button>
          <button onClick={onHome} className="daily-btn rounded-2xl bg-muted font-semibold">{t.home}</button>
        </div>
      </div>
    </div>
  );
}
