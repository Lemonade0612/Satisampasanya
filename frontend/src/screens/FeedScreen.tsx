import logoImage from "/images/Satisampasanya_Logo_app.png";
import { T } from "../lib/translations";
import { DailySafetyTip } from "../components/feed/DailySafetyTip";
import { Bell, ShieldCheck, ALargeSmall } from "lucide-react";
import { canInteract, postsForBand, setLargeText, useBand, useLargeText } from "../lib/band";
import { ThemeToggle, LangToggle } from "../components/shared/Controls";
import { TIERS } from "../features/daily/lib/age";
import { DT } from "../features/daily/i18n";
import { PostCard } from "../components/feed/PostCard";
import { BaitFeed } from "../features/kids/BaitFeed";
import { Fragment } from "react";
import { Clock, TrendingUp } from "lucide-react";
import { GAMES, picksForToday } from "../features/daily/screens/DailyHome";
import { scamTypeLabel, weeklyTrend } from "../lib/scamTypes";
import type { GameId } from "../features/daily/types";
import type { Band, Lang, Post, ThemeMode } from "../types";

export function FeedScreen({ lang, posts, activeTab, onTabChange, onOpenComments, onLike, onRepost, onWarnedMe, onOpenAlerts, alertCount, onRepostClick, themeMode, onThemeChange, onLangToggle, onChangeBand, onImageExpand, onTopicClick, onPlayGame, followedTopics, customTopic, following, currentUserId, onFollow }: {
  following: string[]; currentUserId?:string; onFollow:(id:string)=>void;
  followedTopics: string[]; customTopic?: string|null;
  lang: Lang; posts: Post[]; activeTab: number; onTabChange: (i: number) => void;
  onOpenComments: (id: string) => void; onLike: (id: string) => void; onRepost: (id: string) => void;
  onWarnedMe: (id: string) => void; onCompose: () => void; onOpenAlerts: () => void; alertCount: number;
  onRepostClick: (post: Post) => void; themeMode: ThemeMode; onThemeChange: (m: ThemeMode) => void; onLangToggle: () => void; onChangeBand: () => void; onImageExpand?: (url: string) => void; onTopicClick?: (topic: string) => void; onPlayGame?: (game: GameId) => void;
}) {
  const t = T[lang];
  // Kids: verified, kid-safe posts only and no interactions. Everyone else: the full feed.
  const band = useBand();
  const largeText = useLargeText();
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
    <div className="h-full flex flex-col bg-background">
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="flex items-center justify-between px-5 py-3.5">
          <div className="flex items-center gap-2 min-w-0">
            <img src={logoImage} alt="Sati" className="w-11 h-11 rounded-lg object-contain shrink-0" />
            {band === "youth" ? <button onClick={onChangeBand} className="rounded-full bg-[#EEF2FF] text-[#3B0FA0] px-3 min-h-9 text-sm font-bold font-lao whitespace-nowrap">{lang === "lo" ? "ໄວໜຸ່ມ 15–24" : "Youth 15–24"}</button>/* REVIEW-LO */ : <BandChip band={band} lang={lang} onClick={onChangeBand} />}
          </div>
          <div className="flex items-center gap-1">
            <button aria-label={lang === "lo" ? "ແຈ້ງເຕືອນ" : "Notifications"} onClick={onOpenAlerts} className="relative min-h-11 min-w-11 p-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors">
              <Bell size={18} />
              {alertCount > 0 && (
                <span key={alertCount} aria-label={`${alertCount} unread`} className="badge-pop absolute top-0.5 right-0.5 min-w-4 h-4 px-1 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center ring-2 ring-background">{alertCount > 9 ? "9+" : alertCount}</span>
              )}
            </button>
            {band === "elder" && <button aria-pressed={largeText} aria-label={lang === "lo" ? "ຕົວອັກສອນໃຫຍ່" : "Larger text"} onClick={() => setLargeText(!largeText)} className={`min-h-11 min-w-11 p-2 rounded-full transition-colors ${largeText ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted/60"}`}><ALargeSmall size={20} /></button>}
            <ThemeToggle mode={themeMode} onChange={onThemeChange} />
            <LangToggle lang={lang} onToggle={onLangToggle} />
          </div>
        </div>
        <div className="feed-tabs flex justify-center overflow-x-auto scrollbar-hide px-2">
          {tabs.map((tab, i) => (
            <button key={i} onClick={() => onTabChange(i)} className={`flex-1 min-w-0 px-2 py-4 text-sm font-semibold text-center font-lao whitespace-nowrap transition-colors relative ${activeTab === i ? "text-primary" : "text-muted-foreground"}`}>
              {tab}
              {activeTab === i && <div className="absolute bottom-0 left-2 right-2 h-1 bg-primary rounded-full" />}
            </button>
          ))}
        </div>
      </div>
      {customTopic && <button className="touch-target text-primary text-sm border-b border-border" onClick={()=>onTabChange(0)}>#{customTopic} · {lang==='lo'?'ສະແດງທັງໝົດ':'Show all posts'}</button>}
      <div className="flex-1 min-h-0 overflow-y-auto scrollbar-hide">
        {readOnly && <p role="note" className="mx-3 mt-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 p-3 text-sm flex gap-2 font-lao"><ShieldCheck size={18} className="text-emerald-600 shrink-0 mt-0.5" />{lang === "lo" ? "ໂໝດເດັກ: ສະແດງແຕ່ໂພສທີ່ກວດແລ້ວ. ເຫັນຫຍັງແປກ? ຢຸດ ແລ້ວບອກຜູ້ໃຫຍ່ທີ່ໄວ້ໃຈ." : "Kids mode: only checked posts. See something strange? Stop and tell a trusted adult."}</p>}
        {/* Kids always get the practice feed first, so their page is never empty even when no post is kid-safe yet. */}
        {band === "kids" && <BaitFeed lang={lang} />}
        {youth ? <TrendCard posts={posts} lang={lang} /> : <DailySafetyTip lang={lang} />}
        {activeTab===1 && !filteredPosts.length && <p className="p-6 text-center text-sm text-muted-foreground font-lao">{lang==="lo"?"ຕິດຕາມຜູ້ໃຊ້ຈາກໜ້າສຳລັບທ່ານ ເພື່ອເບິ່ງໂພສຢູ່ນີ້.":"Follow people from For you to see their posts here."}</p>}
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
        <div className="py-8 text-center">
          <p className="text-xs text-muted-foreground">{t.caught_up_en}</p>
          <p className="text-xs text-muted-foreground font-lao">{t.caught_up_lo}</p>
        </div>
      </div>
    </div>
  );
}

// Who the feed is set for, always visible. Tap to change (an account saves it; leaving Kids asks for the password).
function BandChip({ band, lang, onClick }: { band: Band; lang: Lang; onClick: () => void }) {
  const Icon = TIERS[band].icon;
  return <button onClick={onClick} aria-label={`${DT[lang].age_title} ${DT[lang][`age_${band}`]}`}
    className="flex items-center gap-1 rounded-full bg-muted px-2.5 min-h-9 text-xs font-bold font-lao min-w-0">
    <Icon size={14} className="shrink-0 text-primary" /><span className="truncate">{DT[lang][`age_${band}`]}</span><span className="text-muted-foreground tabular-nums">{TIERS[band].range}</span>
  </button>;
}

// Youth: one gradient card with this week's community trend, built from the youth posts themselves.
function TrendCard({ posts, lang }: { posts: Post[]; lang: Lang }) {
  const trend = weeklyTrend(posts);
  if (!trend) return null;
  const lo = lang === "lo", type = scamTypeLabel(trend.type, lang);
  return <section className="mx-3 mt-3 rounded-3xl p-4 text-white" style={{ background: "linear-gradient(135deg, #5B21D1 0%, #5B21D1 50%, #93C5FD 140%)" }}>
    <p className="flex items-center gap-1.5 text-sm font-semibold opacity-95 font-lao"><TrendingUp size={16} />{lo ? "ຊຸມຊົນໄວໜຸ່ມ · ອາທິດນີ້" : "Youth community · this week"}</p>
    <p className="mt-1 text-lg font-bold leading-snug font-lao">{lo ? `ເລື່ອງທີ່ຖືກເຕືອນຫຼາຍທີ່ສຸດ: ${type} · ${trend.count} ໂພສ` : `Most warned about: ${type} · ${trend.count} posts`}</p>
  </section>; // REVIEW-LO
}

// Youth: after every 3 posts, one of today's picked games.
function PlayCard({ game, lang, onPlay }: { game: GameId; lang: Lang; onPlay: (g: GameId) => void }) {
  const g = GAMES.find(x => x.id === game);
  if (!g) return null;
  const Icon = g.icon, t = DT[lang];
  return <button onClick={() => onPlay(game)} className="mx-3 my-3 w-[calc(100%-1.5rem)] rounded-3xl bg-[#EEF2FF] p-4 flex items-center gap-3 text-left font-lao">
    <span className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${g.tint} text-white flex items-center justify-center shrink-0`}><Icon size={24} /></span>
    <span className="flex-1 min-w-0"><span className="block text-xs font-bold text-[#3B0FA0]">{lang === "lo" ? "ຫຼິ້ນມື້ນີ້" : "Play today"}</span>{/* REVIEW-LO */}
      <span className="block font-bold text-foreground">{t[`g_${game}`]}</span>
      <span className="flex items-center gap-1 text-xs text-muted-foreground"><Clock size={12} />{lang === "lo" ? "2 ນາທີ" : "2 min"}</span></span>
    <span className="rounded-full daily-grad text-white text-sm font-bold px-4 min-h-10 flex items-center">{t.play}</span>
  </button>;
}
