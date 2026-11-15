import logoImage from "/images/sati-mark.png";
import { T } from "../lib/translations";
import { DailySafetyTip } from "../components/feed/DailySafetyTip";
import { Landmark, Bell, Globe, Phone, X, ShieldCheck, ChevronDown, Check, ArrowUp, WifiOff } from "lucide-react";
import { BANDS, canInteract, changeBand, leavingKidsNeedsPassword, postsForBand, useBand } from "../lib/band";
import { createPortal } from "react-dom";
import { useEffect, useMemo, useRef, useState } from "react";
import { TIERS } from "../features/daily/lib/age";
import { DT } from "../features/daily/i18n";
import { PostCard } from "../components/feed/PostCard";
import { OrgPostCard } from "../components/feed/OrgPostCard";
import { ColorCodeButton, ColorCodeSheet } from "../components/feed/colorCode";
import { isBlocked } from "../lib/blocked";
import { PostSkeleton } from "../components/feed/PostSkeleton";
import { usePullToRefresh } from "../components/feed/PullToRefresh";
import { useFeedPages } from "../hooks/useFeedPages";
import { BaitFeed } from "../features/kids/BaitFeed";
import { ASK_SATI_PAD } from "../components/shared/AskSatiButton";
import { Clock, TrendingUp } from "lucide-react";
import { GAMES, picksForToday } from "../features/daily/screens/DailyHome";
import { scamTypeLabel, weeklyTrend } from "../lib/scamTypes";
import type { GameId } from "../features/daily/types";
import type { Band, Lang, Post } from "../types";

export function FeedScreen({ lang, posts, activeTab, onTabChange, onOpenComments, onLike, onRepost, onWarnedMe, onOpenAlerts, onLangToggle, onOpenExplore, alertCount, onRepostClick, onChangeBand, onImageExpand, onTopicClick, onPlayGame, followedTopics, customTopic, following, currentUserId, onFollow }: {
  following: string[]; currentUserId?:string; onFollow:(id:string)=>void;
  followedTopics: string[]; customTopic?: string|null;
  lang: Lang; posts: Post[]; activeTab: number; onTabChange: (i: number) => void;
  onOpenComments: (id: string) => void; onLike: (id: string) => void; onRepost: (id: string) => void;
  onWarnedMe: (id: string) => void; onCompose: () => void; onOpenAlerts: () => void; onOpenExplore?: () => void; alertCount: number;
  onRepostClick: (post: Post) => void; onLangToggle: () => void; onChangeBand: () => void; onImageExpand?: (url: string) => void; onTopicClick?: (topic: string) => void; onPlayGame?: (game: GameId) => void;
}) {
  const t = T[lang];
  const allLive = posts;
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

  // For you and Following read the cursor-paged /api/feed. Each card shows its live copy so likes and comments stay fresh.
  const paged = (activeTab === 0 || activeTab === 1) && !customTopic;
  const feed = useFeedPages(activeTab === 1 ? "following" : "foryou", band, paged, currentUserId);
  const live = useMemo(() => new Map(allLive.map(p => [p.id, p])), [allLive]);
  const pagedPosts = useMemo(() => postsForBand(feed.items.map(p => live.get(p.id) ?? p), band), [feed.items, live, band]);
  const basePosts = (paged ? pagedPosts : filteredPosts).filter(p => !isBlocked(p.author.id));
  // Endless scroll. When the server runs out: one honest divider, then posts the reader has not seen (organisation posts,
  // then the rest by popularity), and only then already-seen posts. The pool is cycled in a fixed order, so the same post
  // is never closer than the pool size (15+ whenever the pool is big enough) and every copy still reads live data by post.id.
  const [loopCount, setLoopCount] = useState(0);
  useEffect(() => { setLoopCount(0); }, [activeTab, band, customTopic]);
  const endless = paged && !feed.hasMore && feed.status === "ok" && basePosts.length >= 3;
  const pool = useMemo(() => {
    if (!endless) return [] as Post[];
    const seen = new Set(basePosts.map(p => p.id));
    const rank = (p: Post) => p.communityRanking?.rank || 0;
    const byPop = (a: Post, b: Post) => rank(b) - rank(a) || (a.createdAt || 0) - (b.createdAt || 0);
    const unseen = postsForBand(allLive.map(p => live.get(p.id) ?? p), band).filter(p => !seen.has(p.id) && !isBlocked(p.author.id));
    return [...unseen.filter(p => p.org).sort(byPop), ...unseen.filter(p => !p.org).sort(byPop), ...[...basePosts].sort(byPop)];
  }, [endless, basePosts, allLive, live, band]);
  type Row = { post: Post; key: string; divider?: boolean };
  const rows: Row[] = useMemo(() => {
    const r: Row[] = basePosts.map(post => ({ post, key: post.id }));
    if (endless && pool.length) for (let k = 0; k < loopCount; k++) r.push({ post: pool[k % pool.length], key: `${pool[k % pool.length].id}-loop${Math.floor(k / pool.length) + 1}`, divider: k === 0 });
    return r;
  }, [basePosts, endless, pool, loopCount]);
  // Windowing: at most MAX_CARDS cards are mounted. Cards dropped from the top are replaced by a spacer of their measured height, so scroll position stays put.
  const MAX_CARDS = 60;
  const start = Math.max(0, rows.length - MAX_CARDS);
  const heights = useRef(new Map<string, number>());
  const spacer = useMemo(() => rows.slice(0, start).reduce((h, r) => h + (heights.current.get(r.key) ?? 0), 0), [rows, start]);
  const shownPosts = rows.map(r => r.post);
  const [helpHidden, setHelpHidden] = useState(false);
  const hideHelp = () => setHelpHidden(true);
  const scroller = useRef<HTMLDivElement>(null);
  const ptr = usePullToRefresh(scroller, () => feed.refresh(), feed.refreshing && paged);
  const sentinel = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = sentinel.current, root = scroller.current;
    if (!paged || !el || !root || (!feed.hasMore && !endless)) return;
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { if (feed.hasMore) void feed.loadMore(); else setLoopCount(c => c + 10); } }, { root, rootMargin: "500px" });
    io.observe(el);
    return () => io.disconnect();
  }, [paged, endless, feed.hasMore, feed.loadMore, feed.items.length, loopCount]);
  const showNew = () => { const n = feed.showPending(); if (n) requestAnimationFrame(() => scroller.current?.scrollTo({ top: 0, behavior: "smooth" })); };
  const offline = paged && feed.status === "error" && !shownPosts.length;

  return (
    <div className="h-full flex flex-col bg-[#F7F7FA] text-[#14112B]">
      <div className="sticky top-0 z-10 bg-white border-b border-[#ECECF4]">
        <div className="flex items-center gap-3 px-4 py-[10px]">
          <img src={logoImage} alt="Sati" className="w-[30px] h-[30px] object-contain shrink-0" />
          <span aria-hidden className="w-px h-5 bg-[#E6E6F0] shrink-0" />
          <BandMenu band={band} lang={lang} onOpenSheet={onChangeBand} />
          <span className="flex-1" />
          <button type="button" aria-label={lang === "lo" ? "ແຈ້ງເຕືອນ" : "Notifications"} onClick={onOpenAlerts} className="relative flex w-10 h-10 items-center justify-center text-[#5F6390]">
            <Bell size={20} aria-hidden />
            {alertCount > 0 && <span key={alertCount} aria-label={`${alertCount} unread`} className="badge-pop absolute top-2 right-[9px] w-2 h-2 rounded-full bg-[#EF4444] shadow-[0_0_0_2px_#fff]" />}
          </button>
          <LangButton lang={lang} onPick={onLangToggle} />
        </div>
        <div role="tablist" className="feed-tabs flex px-2">
          {tabs.map((tab, i) => (
            <button type="button" role="tab" aria-selected={activeTab === i} key={i} onClick={() => onTabChange(i)} className={`flex-1 basis-0 relative py-3 text-[14px] whitespace-nowrap ${activeTab === i ? "text-[#5B21D1] font-bold" : "text-[#5F6390] font-semibold"}`}>
              {tab}
              {activeTab === i && <span aria-hidden className="absolute left-[22%] right-[22%] bottom-0 h-[3px] rounded-full bg-[#5B21D1]" />}
            </button>
          ))}
        </div>
      </div>
      <ColorCodeSheet lang={lang} />
      {customTopic && <button className="shrink-0 min-h-11 px-4 text-left text-primary text-sm font-bold border-b border-border" onClick={()=>onTabChange(0)}>#{customTopic} · {lang==='lo'?'ສະແດງທັງໝົດ':'Show all posts'}</button>}
      <div className="relative flex-1 min-h-0 flex flex-col">
      {ptr.node}
      {paged && feed.pending > 0 && <button type="button" onClick={showNew} className="absolute left-1/2 -translate-x-1/2 top-2 z-30 min-h-11 px-4 rounded-full bg-primary text-primary-foreground text-sm font-bold shadow-[var(--shadow-soft)] flex items-center gap-1.5"><ArrowUp size={16} aria-hidden />{lang === "lo" ? `ໂພສໃໝ່ ${feed.pending} ລາຍການ` : `${feed.pending} new post${feed.pending > 1 ? "s" : ""}`}</button>}
      <div ref={scroller} {...ptr.bind} className={`flex-1 min-h-0 overflow-y-auto overflow-x-hidden overscroll-y-contain scrollbar-hide bg-[#F7F7FA] ${ASK_SATI_PAD}`}>
        <div className="flex flex-col gap-3 px-3 pt-3">
        <div className="flex items-center justify-end -mt-1 -mb-1 mx-0.5"><ColorCodeButton lang={lang} /></div>
        {!helpHidden && <HelpBar lang={lang} onHide={hideHelp} onAll={onOpenExplore} />}
        {activeTab === 0 && !customTopic && band !== "kids" && <PinnedOfficial lang={lang} />}
        {paged && feed.status === "error" && shownPosts.length > 0 && <p role="status" className="mx-2 mt-2 rounded-xl bg-warning-bg text-warning-text text-sm p-3 flex items-center gap-2"><WifiOff size={16} aria-hidden />{lang==="lo"?"ບໍ່ໄດ້ອັບເດດ. ສະແດງໂພສທີ່ບັນທຶກໄວ້.":"Offline. Showing saved posts."}<button type="button" onClick={feed.retry} className="ml-auto min-h-11 font-bold">{lang==="lo"?"ລອງໃໝ່":"Retry"}</button></p>}
        {readOnly && <p role="note" className="rounded-2xl bg-success-bg border border-success-border text-success p-3 text-sm flex gap-2"><ShieldCheck size={18} aria-hidden className="shrink-0 mt-0.5" />{lang === "lo" ? "ໂໝດເດັກ: ສະແດງແຕ່ໂພສທີ່ກວດແລ້ວ. ເຫັນຫຍັງແປກ? ຢຸດ ແລ້ວບອກຜູ້ໃຫຍ່ທີ່ໄວ້ໃຈ." : "Kids mode: only checked posts. See something strange? Stop and tell a trusted adult."}</p>}
        {/* Kids always get the practice feed first, so their page is never empty even when no post is kid-safe yet. */}
        {band === "kids" && <BaitFeed lang={lang} />}
        {youth && <TrendCard posts={posts} lang={lang} />}
        </div>
        {offline && <div role="alert" className="p-8 flex flex-col items-center gap-4 text-center"><WifiOff size={32} aria-hidden className="text-text-muted" /><p className="text-base text-text">{lang==="lo"?"ເຊື່ອມຕໍ່ບໍ່ໄດ້. ກວດອິນເຕີເນັດແລ້ວລອງໃໝ່.":"Cannot connect. Check your internet and try again."}</p><button type="button" onClick={feed.retry} className="min-h-[52px] px-6 rounded-2xl bg-primary text-primary-foreground font-bold shadow-[0_5px_0_#3B0E91] active:translate-y-[3px] active:shadow-[0_2px_0_#3B0E91]">{lang==="lo"?"ລອງໃໝ່":"Try again"}</button></div>}
        {activeTab===1 && !shownPosts.length && !offline && feed.status !== "loading" && <div className="p-8 flex flex-col items-center gap-4 text-center"><p className="text-base text-text-muted">{lang==="lo"?"ຍັງບໍ່ໄດ້ຕິດຕາມໃຜ":"You are not following anyone yet"}</p><button type="button" onClick={()=>onTabChange(0)} className="min-h-[52px] px-6 rounded-2xl bg-primary text-primary-foreground font-bold shadow-[0_5px_0_#3B0E91] active:translate-y-[3px] active:shadow-[0_2px_0_#3B0E91]">{lang==="lo"?"ໄປທີ່ ສຳລັບເຈົ້າ":"Go to For you"}</button></div>}
        {activeTab===0 && paged && feed.status === "ok" && !shownPosts.length && <p className="p-8 text-center text-base text-text-muted">{lang==="lo"?"ຍັງບໍ່ມີໂພສ":"No posts yet"}</p>}
        {!offline && !shownPosts.length && activeTab!==1 && (paged ? feed.status === "loading" : true) && <div className="flex flex-col gap-3 px-3 pt-3" aria-live="polite">{(["text","poster","video","link"] as const).map(k=><PostSkeleton key={k} type={k}/>)}</div>}
        <div className="flex flex-col gap-3 px-3 pt-3">
        {spacer > 0 && <div aria-hidden style={{ height: spacer }} />}
        {rows.slice(start).map((row, j) => { const post = row.post, i = start + j; return (
          <div key={row.key} data-card={row.key} ref={el => { if (el) heights.current.set(row.key, el.offsetHeight + 8); }} className="flex flex-col gap-2">
          {row.divider && <div role="separator" className="rounded-2xl bg-white border border-[#E6E6F0] p-4 text-center"><p className="font-bold text-[#14112B]">{lang==="lo"?"ເຈົ້າເບິ່ງໂພສໃໝ່ໝົດແລ້ວ":"You have seen all the new posts"}</p><p className="text-sm text-[#5F6390]">{lang==="lo"?"ໂພສທີ່ເຈົ້າອາດພາດ":"Posts you may have missed"}</p></div>}
          {post.org ? <OrgPostCard post={post} lang={lang} onOpenComments={readOnly ? undefined : onOpenComments} /> : <PostCard
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
            canReport={!readOnly && !!currentUserId && post.author.id !== currentUserId}
            compact={youth}
          />}
          {youth && onPlayGame && i % 3 === 2 && <PlayCard game={games[Math.floor(i / 3) % games.length]} lang={lang} onPlay={onPlayGame} />}
          {i === 2 && <div className="flex flex-col gap-3">
        <DailySafetyTip lang={lang} />
          </div>}
          </div>
        ); })}
        </div>
        {paged && (feed.hasMore || endless) && <div ref={sentinel} className="flex flex-col gap-3 px-3 pt-3" aria-live="polite">{feed.loadingMore && <PostSkeleton type="text" />}<div className="h-8" /></div>}
        {(!paged || (!feed.hasMore && !endless)) && !!shownPosts.length && <div className="py-8 text-center">
          <p className="text-xs text-text-muted">{lang === "lo" ? t.caught_up_lo : t.caught_up_en}</p>
        </div>}
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
      className="relative h-8 min-w-0 flex items-center gap-1 rounded-full border border-[#E6E6F0] bg-white pl-3 pr-2 text-[12px] font-bold text-[#14112B] before:absolute before:-inset-y-1.5 before:inset-x-0 before:content-['']">
      <span className="truncate">{DT[lang][`age_${band}`]} <span className="font-[Inter,sans-serif] text-[#5F6390]">{TIERS[band].range}</span></span><ChevronDown size={13} aria-hidden className={`shrink-0 transition-transform ${open ? "rotate-180" : ""}`} />
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

// The "need help?" bar from the design: hotline numbers up front, dismissible for this visit.
function HelpBar({ lang, onHide, onAll }: { lang: Lang; onHide: () => void; onAll?: () => void }) {
  const lo = lang === "lo";
  return (
    <div className="flex items-center gap-3 p-3 rounded-2xl bg-white border border-[#ECECF4]">
      <span className="flex shrink-0 w-9 h-9 rounded-[10px] bg-[#FFF1F2] text-[#E11D48] items-center justify-center"><Phone size={18} aria-hidden /></span>
      <span className="flex-1 min-w-0">
        <span className="block text-[14px] font-bold">{lo ? "ຕ້ອງການຄວາມຊ່ວຍເຫຼືອ?" : "Need help?"}</span>
        <span className="block text-[12px] text-[#5F6390]">{lo ? "ໂທຟຣີ" : "Free call"} · <a href="tel:1533" className="font-[Inter,sans-serif] font-bold text-[#E11D48]">1533</a> {lo ? "ການຫຼອກລວງ" : "scams"} · <a href="tel:1362" className="font-[Inter,sans-serif] font-bold text-[#E11D48]">1362</a> {lo ? "ໃຫ້ຄຳປຶກສາ" : "counselling"}</span>
      </span>
      <button type="button" onClick={onAll} className="shrink-0 text-[13px] font-bold text-[#5B21D1]">{lo ? "ເບີທັງໝົດ" : "All numbers"}</button>
      <button type="button" onClick={onHide} aria-label={lo ? "ປິດ" : "Close"} className="flex shrink-0 w-7 h-7 -mr-1 items-center justify-center text-[#A3A6C2]"><X size={14} aria-hidden /></button>
    </div>
  );
}

// Pinned official notice from the design: Ministry of Technology and Communications, 1533.
function PinnedOfficial({ lang }: { lang: Lang }) {
  const lo = lang === "lo";
  return (
    <article className="p-[14px] rounded-[18px] bg-white border border-[#ECECF4]">
      <div className="flex items-center gap-[10px] mb-[10px]">
        <span className="flex shrink-0 w-10 h-10 rounded-xl bg-[#EFF6FF] text-[#2563EB] items-center justify-center"><Landmark size={20} aria-hidden /></span>
        <span className="flex-1 min-w-0">
          <span className="flex items-center gap-1 text-[14px] font-bold">{lo ? "ກະຊວງເຕັກໂນໂລຊີ ແລະ ການສື່ສານ" : "Ministry of Technology and Communications"}
            <svg width="14" height="14" viewBox="0 0 24 24" role="img" aria-label={lo ? "ຢືນຢັນແລ້ວ" : "Verified"} className="shrink-0"><circle cx="12" cy="12" r="10" fill="#2563EB" /><path d="m8 12 3 3 5-6" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /></svg></span>
          <span className="block text-[12px] text-[#5F6390]">{lo ? "ປັກໝຸດ · ແຈ້ງການທາງການ" : "Pinned · official notice"}</span>
        </span>
      </div>
      <p className="mb-3 text-[14px] leading-[1.6]">{lo ? <>ພົບການຫຼອກລວງອອນລາຍ? ໂທລາຍງານ <b className="font-[Inter,sans-serif]">1533</b> ສູນຕ້ານການສໍ້ໂກງອອນລາຍ ເປີດ 24 ຊົ່ວໂມງ.</> : <>Found an online scam? Report it on <b>1533</b>, the Anti-Online Fraud Centre, open 24 hours.</>}</p>
      <div className="flex gap-2">
        <a href="tel:1533" className="flex items-center gap-1.5 h-[38px] min-h-11 px-[14px] rounded-[10px] bg-[#14112B] text-white text-[13px] font-bold"><Phone size={14} aria-hidden />{lo ? "ໂທ 1533" : "Call 1533"}</a>
        <a href="https://kpl.gov.la/detail.aspx?id=96241" target="_blank" rel="noopener noreferrer" className="flex items-center h-[38px] min-h-11 px-[14px] rounded-[10px] border border-[#E6E6F0] text-[#14112B] text-[13px] font-semibold">{lo ? "ແຫຼ່ງທີ່ມາ" : "Source"}</a>
      </div>
    </article>
  );
}

// Language switch: one globe button that opens a bottom sheet with the two languages (current one ticked).
function LangButton({ lang, onPick }: { lang: Lang; onPick: () => void }) {
  const [open, setOpen] = useState(false);
  const lo = lang === "lo";
  useEffect(() => { if (!open) return; const esc = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); }; document.addEventListener("keydown", esc); return () => document.removeEventListener("keydown", esc); }, [open]);
  const choose = (l: Lang) => { setOpen(false); if (l !== lang) onPick(); };
  return <>
    <button type="button" aria-label={lo ? "ປ່ຽນພາສາ" : "Change language"} aria-haspopup="dialog" onClick={() => setOpen(true)} className="flex h-10 px-2 items-center gap-1 text-[#5F6390]"><Globe size={20} aria-hidden /><span className="text-[12px] font-bold font-[Inter,sans-serif]">{lo ? "ລາວ" : "EN"}</span></button>
    {open && createPortal(<div className="fixed inset-0 z-[100] flex flex-col justify-end bg-[rgba(20,17,43,0.45)]">
      <button type="button" aria-label={lo ? "ປິດ" : "Close"} onClick={() => setOpen(false)} className="flex-1" />
      <div role="dialog" aria-modal="true" aria-label={lo ? "ພາສາ" : "Language"} className="mx-auto w-full max-w-[480px] bg-white rounded-t-[26px] px-5 pt-2.5 pb-[calc(24px+env(safe-area-inset-bottom))]">
        <div className="flex justify-center mb-2.5"><span className="w-10 h-[5px] rounded-full bg-[#E0E1EB]" /></div>
        <h2 className="mb-3 text-[20px] font-bold">{lo ? "ເລືອກພາສາ" : "Choose language"}</h2>
        <div className="flex flex-col gap-2.5">
          {([["lo", "ລາວ", "Lao"], ["en", "English", "ອັງກິດ"]] as const).map(([l, name, sub]) => <button key={l} type="button" autoFocus={l === lang} aria-pressed={l === lang} onClick={() => choose(l)} className={`min-h-14 flex items-center gap-3 px-4 rounded-2xl border-2 text-left ${l === lang ? "border-[#5B21D1] bg-[#F3F0FC]" : "border-[#ECECF4] bg-white"}`}>
            <span className="flex-1"><span className="block text-[16px] font-bold">{name}</span><span className="block text-[12px] text-[#5F6390]">{sub}</span></span>{l === lang && <Check size={20} aria-hidden className="text-[#5B21D1]" />}</button>)}
        </div>
        <button type="button" onClick={() => setOpen(false)} className="w-full min-h-[50px] mt-4 rounded-[14px] bg-[#14112B] text-white text-[15px] font-bold">{lo ? "ປິດ" : "Done"}</button>
      </div>
    </div>, document.body)}
  </>;
}
