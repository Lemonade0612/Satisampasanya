import logoImage from "/images/sati-mark.png";
import { T } from "../lib/translations";
import { DailySafetyTip } from "../components/feed/DailySafetyTip";
import { Bell, ShieldCheck, ChevronDown, Check, Globe } from "lucide-react";
import { BANDS, canInteract, changeBand, leavingKidsNeedsPassword, postsForBand, useBand } from "../lib/band";
import { useEffect, useRef, useState } from "react";
import { TIERS } from "../features/daily/lib/age";
import { DT } from "../features/daily/i18n";
import { PostCard } from "../components/feed/PostCard";
import { BaitFeed } from "../features/kids/BaitFeed";
import { Fragment } from "react";
import { ASK_SATI_PAD } from "../components/shared/AskSatiButton";
import { Clock, TrendingUp } from "lucide-react";
import { GAMES, picksForToday } from "../features/daily/screens/DailyHome";
import { scamTypeLabel, weeklyTrend } from "../lib/scamTypes";
import type { GameId } from "../features/daily/types";
import type { Band, Lang, Post } from "../types";

export function FeedScreen({ lang, posts, activeTab, onTabChange, onOpenComments, onLike, onRepost, onWarnedMe, onOpenAlerts, alertCount, onRepostClick, onLangToggle, onChangeBand, onImageExpand, onTopicClick, onPlayGame, followedTopics, customTopic, following, currentUserId, onFollow }: {
  following: string[]; currentUserId?:string; onFollow:(id:string)=>void;
  followedTopics: string[]; customTopic?: string|null;
  lang: Lang; posts: Post[]; activeTab: number; onTabChange: (i: number) => void;
  onOpenComments: (id: string) => void; onLike: (id: string) => void; onRepost: (id: string) => void;
  onWarnedMe: (id: string) => void; onCompose: () => void; onOpenAlerts: () => void; alertCount: number;
  onRepostClick: (post: Post) => void; onLangToggle: () => void; onChangeBand: () => void; onImageExpand?: (url: string) => void; onTopicClick?: (topic: string) => void; onPlayGame?: (game: GameId) => void;
}) {
  const t = T[lang];
  // Kids: verified, kid-safe posts only and no interactions. Everyone else: the full feed.
  const band = useBand();
  const readOnly = !canInteract(band);
  posts = postsForBand(posts, band);
  const youth = band === "youth";
  const games = picksForToday(band);
  const tabs = lang === "lo" ? ["ສຳລັບທ່ານ", "ຕິດຕາມ", "ຫຼ້າສຸດ", "ຍອດນິຍົມ"] : ["For you", "Following", "Latest", "Popular"];
  const score = (p: Post) => p.communityRanking?.rank || 0;
  const filteredPosts = (customTopic ? posts.filter(p => p.tags.includes(customTopic)) : activeTab === 1 ? posts.filter(p => !!p.author.id && following.includes(p.author.id)) : [...posts]);
  if (activeTab === 2) filteredPosts.sort((a,b) => (b.createdAt || 0) - (a.createdAt || 0));
  if (activeTab === 3) filteredPosts.sort((a,b) => score(b) - score(a) || (b.createdAt || 0) - (a.createdAt || 0));
  if (activeTab === 0 && !customTopic) filteredPosts.sort((a,b) => Number(b.communityRanking?.eligible || false) - Number(a.communityRanking?.eligible || false) || Number(following.includes(b.author.id || "") || b.tags.some(t=>followedTopics.includes(t))) - Number(following.includes(a.author.id || "") || a.tags.some(t=>followedTopics.includes(t))) || score(b) - score(a) || (b.createdAt || 0) - (a.createdAt || 0));

  return (
    <div className="h-full flex flex-col bg-background text-text">
      <div className="sticky top-0 z-10 bg-background border-b border-border">
        <div className="flex items-center gap-2.5 px-4 py-2">
          <img src={logoImage} alt="Sati" className="w-8 h-8 object-contain shrink-0" />
          <span aria-hidden className="w-px h-5 bg-border shrink-0" />
          <BandMenu band={band} lang={lang} onOpenSheet={onChangeBand} />
          <span className="flex-1" />
          <button type="button" aria-label={lang === "lo" ? "ແຈ້ງເຕືອນ" : "Notifications"} onClick={onOpenAlerts} className="relative min-h-11 min-w-11 flex items-center justify-center rounded-full text-text-2">
            <Bell size={22} aria-hidden />
            {alertCount > 0 && (
              <span key={alertCount} aria-label={`${alertCount} unread`} className="badge-pop absolute top-1 right-1 min-w-4 h-4 px-1 rounded-full bg-danger text-background text-xs font-bold flex items-center justify-center ring-2 ring-background">{alertCount > 9 ? "9+" : alertCount}</span>
            )}
          </button>
          <button type="button" aria-label={lang === "lo" ? "ປ່ຽນພາສາ" : "Change language"} onClick={onLangToggle} className="min-h-11 min-w-11 flex items-center justify-center rounded-full text-text-2"><Globe size={22} aria-hidden /></button>
        </div>
        <div className="feed-tabs flex justify-between px-4">
          {tabs.map((tab, i) => (
            <button type="button" key={i} aria-current={activeTab === i ? "true" : undefined} onClick={() => onTabChange(i)} className={`min-h-12 py-2 text-[17px] font-bold whitespace-nowrap relative ${activeTab === i ? "text-primary-ink" : "text-text-muted"}`}>
              {tab}
              {activeTab === i && <span aria-hidden className="absolute bottom-0 left-0 right-0 h-[3px] bg-primary rounded-full" />}
            </button>
          ))}
        </div>
      </div>
      {customTopic && <button className="shrink-0 min-h-11 px-4 text-left text-primary text-sm font-bold border-b border-border" onClick={()=>onTabChange(0)}>#{customTopic} · {lang==='lo'?'ສະແດງທັງໝົດ':'Show all posts'}</button>}
      <div className={`flex-1 min-h-0 overflow-y-auto overflow-x-hidden scrollbar-hide bg-background ${ASK_SATI_PAD}`}>
        <div className="flex flex-col gap-2 px-2 pt-2">
        {readOnly && <p role="note" className="rounded-2xl bg-success-bg border border-success-border text-success p-3 text-sm flex gap-2"><ShieldCheck size={18} aria-hidden className="shrink-0 mt-0.5" />{lang === "lo" ? "ໂໝດເດັກ: ສະແດງແຕ່ໂພສທີ່ກວດແລ້ວ. ເຫັນຫຍັງແປກ? ຢຸດ ແລ້ວບອກຜູ້ໃຫຍ່ທີ່ໄວ້ໃຈ." : "Kids mode: only checked posts. See something strange? Stop and tell a trusted adult."}</p>}
        {/* Kids always get the practice feed first, so their page is never empty even when no post is kid-safe yet. */}
        {band === "kids" && <BaitFeed lang={lang} />}
        {youth && <TrendCard posts={posts} lang={lang} />}
        <DailySafetyTip lang={lang} />
        </div>
        {activeTab===1 && !filteredPosts.length && <p className="p-6 bg-background text-center text-sm text-text-muted">{lang==="lo"?"ຕິດຕາມຜູ້ໃຊ້ຈາກໜ້າສຳລັບທ່ານ ເພື່ອເບິ່ງໂພສຢູ່ນີ້.":"Follow people from For you to see their posts here."}</p>}
        <div className="flex flex-col gap-2 px-2 pt-2">
        {filteredPosts.map((post, i) => (
          <Fragment key={post.id}>
          <PostCard
            post={post}
            lang={lang}
            onOpenComments={onOpenComments}
            onLike={onLike}
            onRepost={onRepost}
            onWarnedMe={onWarnedMe}
            onRepostClick={onRepostClick}
            onImageExpand={onImageExpand}
            onTopicClick={onTopicClick}
            following={following.includes(post.author.id || "")}
            onFollow={!readOnly && post.author.id && post.author.id !== currentUserId ? onFollow : undefined}
            readOnly={readOnly}
            compact={youth}
          />
          {youth && onPlayGame && i % 3 === 2 && <PlayCard game={games[Math.floor(i / 3) % games.length]} lang={lang} onPlay={onPlayGame} />}
          </Fragment>
        ))}
        </div>
        <div className="py-8 text-center">
          <p className="text-xs text-text-muted">{t.caught_up_en}</p>
          <p className="text-xs text-text-muted">{t.caught_up_lo}</p>
        </div>
      </div>
    </div>
  );
}

// Who the feed is set for, always visible. Opens a small menu of the 4 groups; anything needing a password
// (leaving Kids on an account) or refused by the server falls back to the full BandSheet.
const chipLabel = (b: Band, lang: Lang) => `${DT[lang][`age_${b}`]} ${TIERS[b].range}`;
function BandMenu({ band, lang, onOpenSheet }: { band: Band; lang: Lang; onOpenSheet: () => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const close = (e: PointerEvent) => { if (!ref.current?.contains(e.target as Node)) setOpen(false); };
    const esc = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("pointerdown", close); document.addEventListener("keydown", esc);
    return () => { document.removeEventListener("pointerdown", close); document.removeEventListener("keydown", esc); };
  }, [open]);
  const pick = (b: Band) => {
    setOpen(false);
    if (b === band) return;
    if (b === "kids" || leavingKidsNeedsPassword(b)) { onOpenSheet(); return; }
    changeBand(b).catch(onOpenSheet);
  };
  const label = chipLabel(band, lang);
  return <div ref={ref} className="relative min-w-0">
    <button type="button" onClick={() => setOpen(o => !o)} aria-haspopup="menu" aria-expanded={open} aria-label={`${DT[lang].age_title} ${label}`}
      className="relative h-8 min-w-0 flex items-center gap-1 rounded-full border border-border bg-background px-3 text-[13px] font-semibold text-text before:absolute before:-inset-y-1.5 before:inset-x-0 before:content-['']">
      <span className="truncate">{label}</span><ChevronDown size={14} aria-hidden className={`shrink-0 transition-transform ${open ? "rotate-180" : ""}`} />
    </button>
    {open && <div role="menu" className="absolute left-0 top-full mt-2 z-30 w-56 rounded-2xl border border-border bg-background shadow-lg py-1">
      {BANDS.map(b => <button key={b} type="button" role="menuitemradio" aria-checked={b === band} onClick={() => pick(b)}
        className={`w-full min-h-11 flex items-center gap-2 px-4 text-left text-sm ${b === band ? "font-semibold text-primary" : "text-text"}`}>
        <span className="flex-1">{chipLabel(b, lang)}</span>{b === band && <Check size={16} aria-hidden />}
      </button>)}
    </div>}
  </div>;
}

// Youth: one card with this week's community trend, built from the youth posts themselves.
function TrendCard({ posts, lang }: { posts: Post[]; lang: Lang }) {
  const trend = weeklyTrend(posts);
  if (!trend) return null;
  const lo = lang === "lo", type = scamTypeLabel(trend.type, lang);
  return <section className="rounded-2xl p-4 bg-tint-purple-bg">
    <p className="flex items-center gap-1.5 text-sm font-bold text-tint-purple-fg"><TrendingUp size={16} aria-hidden />{lo ? "ຊຸມຊົນໄວໜຸ່ມ · ອາທິດນີ້" : "Youth community · this week"}</p>
    <p className="mt-1 text-base font-bold text-text">{lo ? `ເລື່ອງທີ່ຖືກເຕືອນຫຼາຍທີ່ສຸດ: ${type} · ${trend.count} ໂພສ` : `Most warned about: ${type} · ${trend.count} posts`}</p>
  </section>; // REVIEW-LO
}

// Youth: after every 3 posts, one of today's picked games.
function PlayCard({ game, lang, onPlay }: { game: GameId; lang: Lang; onPlay: (g: GameId) => void }) {
  const g = GAMES.find(x => x.id === game);
  if (!g) return null;
  const Icon = g.icon, t = DT[lang];
  return <div><button type="button" onClick={() => onPlay(game)} className="w-full rounded-2xl bg-background p-4 flex items-center gap-3 text-left">
    <span className="w-12 h-12 rounded-xl bg-tint-purple-bg text-tint-purple-fg flex items-center justify-center shrink-0"><Icon size={24} aria-hidden /></span>
    <span className="flex-1 min-w-0"><span className="block text-[13px] font-bold text-primary">{lang === "lo" ? "ຫຼິ້ນມື້ນີ້" : "Play today"}</span>{/* REVIEW-LO */}
      <span className="block font-bold text-text">{t[`g_${game}`]}</span>
      <span className="flex items-center gap-1 text-[13px] text-text-muted"><Clock size={12} aria-hidden />{lang === "lo" ? "2 ນາທີ" : "2 min"}</span></span>
    <span className="rounded-full bg-primary text-primary-foreground text-sm font-bold px-4 min-h-11 flex items-center">{t.play}</span>
  </button></div>;
}
