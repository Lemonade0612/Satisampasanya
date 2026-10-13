import logoImage from "/images/Satisampasanya_Logo_app.png";
import { T } from "../lib/translations";
import {RiskLegend} from "../components/safety/RiskLegend";
import { DailySafetyTip } from "../components/feed/DailySafetyTip";
import { Bell } from "lucide-react";
import { ThemeToggle, LangToggle } from "../components/shared/Controls";
import { PostCard } from "../components/feed/PostCard";
import type { Lang, Post, ThemeMode } from "../types";

export function FeedScreen({ lang, posts, activeTab, onTabChange, onOpenComments, onLike, onRepost, onWarnedMe, onOpenAlerts, alertCount, onRepostClick, themeMode, onThemeChange, onLangToggle, onImageExpand, onTopicClick, followedTopics, customTopic, following, currentUserId, onFollow }: {
  following: string[]; currentUserId?:string; onFollow:(id:string)=>void;
  followedTopics: string[]; customTopic?: string|null;
  lang: Lang; posts: Post[]; activeTab: number; onTabChange: (i: number) => void;
  onOpenComments: (id: string) => void; onLike: (id: string) => void; onRepost: (id: string) => void;
  onWarnedMe: (id: string) => void; onCompose: () => void; onOpenAlerts: () => void; alertCount: number;
  onRepostClick: (post: Post) => void; themeMode: ThemeMode; onThemeChange: (m: ThemeMode) => void; onLangToggle: () => void; onImageExpand?: (url: string) => void; onTopicClick?: (topic: string) => void;
}) {
  const t = T[lang];
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
          <img src={logoImage} alt="Sati" className="w-11 h-11 rounded-lg object-contain" />
          <div className="flex items-center gap-2">
            <button aria-label={lang === "lo" ? "ແຈ້ງເຕືອນ" : "Notifications"} onClick={onOpenAlerts} className="relative min-h-11 min-w-11 p-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors">
              <Bell size={18} />
              {alertCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center">{alertCount}</span>
              )}
            </button>
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
        <DailySafetyTip lang={lang} />
        <RiskLegend lang={lang}/>
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
            onFollow={post.author.id && post.author.id !== currentUserId ? onFollow : undefined}
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
