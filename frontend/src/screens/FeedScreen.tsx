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
import { useState } from "react";
import type { Band, Lang, Post, ThemeMode } from "../types";

export function FeedScreen({ lang, posts, activeTab, onTabChange, onOpenComments, onLike, onRepost, onWarnedMe, onOpenAlerts, alertCount, onRepostClick, themeMode, onThemeChange, onLangToggle, onChangeBand, onImageExpand, onTopicClick, followedTopics, customTopic, following, currentUserId, onFollow }: {
  following: string[]; currentUserId?:string; onFollow:(id:string)=>void;
  followedTopics: string[]; customTopic?: string|null;
  lang: Lang; posts: Post[]; activeTab: number; onTabChange: (i: number) => void;
  onOpenComments: (id: string) => void; onLike: (id: string) => void; onRepost: (id: string) => void;
  onWarnedMe: (id: string) => void; onCompose: () => void; onOpenAlerts: () => void; alertCount: number;
  onRepostClick: (post: Post) => void; themeMode: ThemeMode; onThemeChange: (m: ThemeMode) => void; onLangToggle: () => void; onChangeBand: () => void; onImageExpand?: (url: string) => void; onTopicClick?: (topic: string) => void;
}) {
  const t = T[lang];
  // Kids: verified, kid-safe posts only and no interactions. Everyone else: the full feed.
  const band = useBand();
  const largeText = useLargeText();
  const readOnly = !canInteract(band);
  posts = postsForBand(posts, band);
  // Youth only: Laos-only or the whole ASEAN youth community. Posts without a country count as Laos.
  const [region, setRegion] = useState<"LA" | "ASEAN">("ASEAN");
  if (band === "youth" && region === "LA") posts = posts.filter(p => !p.country || p.country === "LA");
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
            <BandChip band={band} lang={lang} onClick={onChangeBand} />
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
      {band === "youth" && <div role="radiogroup" aria-label={lang === "lo" ? "ພື້ນທີ່" : "Region"} className="flex gap-2 px-4 py-2 border-b border-border font-lao">
        {(["LA", "ASEAN"] as const).map(r => <button key={r} role="radio" aria-checked={region === r} onClick={() => setRegion(r)}
          className={`min-h-9 px-3 rounded-full text-sm font-semibold ${region === r ? "bg-primary text-white" : "bg-muted text-muted-foreground"}`}>
          {r === "LA" ? (lang === "lo" ? "🇱🇦 ລາວ" : "🇱🇦 Laos") : (lang === "lo" ? "ອາຊຽນທັງໝົດ" : "All ASEAN")}{/* REVIEW-LO */}
        </button>)}
      </div>}
      {customTopic && <button className="touch-target text-primary text-sm border-b border-border" onClick={()=>onTabChange(0)}>#{customTopic} · {lang==='lo'?'ສະແດງທັງໝົດ':'Show all posts'}</button>}
      <div className="flex-1 min-h-0 overflow-y-auto scrollbar-hide">
        {readOnly && <p role="note" className="mx-3 mt-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 p-3 text-sm flex gap-2 font-lao"><ShieldCheck size={18} className="text-emerald-600 shrink-0 mt-0.5" />{lang === "lo" ? "ໂໝດເດັກ: ສະແດງແຕ່ໂພສທີ່ກວດແລ້ວ. ເຫັນຫຍັງແປກ? ຢຸດ ແລ້ວບອກຜູ້ໃຫຍ່ທີ່ໄວ້ໃຈ." : "Kids mode: only checked posts. See something strange? Stop and tell a trusted adult."}</p>}
        {/* Kids always get the practice feed first, so their page is never empty even when no post is kid-safe yet. */}
        {band === "kids" && <BaitFeed lang={lang} />}
        <DailySafetyTip lang={lang} />
        {activeTab===1 && !filteredPosts.length && <p className="p-6 text-center text-sm text-muted-foreground font-lao">{lang==="lo"?"ຕິດຕາມຜູ້ໃຊ້ຈາກໜ້າສຳລັບທ່ານ ເພື່ອເບິ່ງໂພສຢູ່ນີ້.":"Follow people from For you to see their posts here."}</p>}
        {filteredPosts.map(post => (
          <PostCard
            key={post.id}
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
          />
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
