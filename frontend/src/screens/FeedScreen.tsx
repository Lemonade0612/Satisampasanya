import logoImage from "/images/Satisampasanya_Logo_app.png";
import { T } from "../lib/translations";
import { FEED_TABS_LO, FEED_TABS_EN } from "../lib/constants";
import { Bell } from "lucide-react";
import { ThemeToggle, LangToggle } from "../components/shared/Controls";
import { PostCard } from "../components/feed/PostCard";
import type { Lang, Post, ThemeMode } from "../types";

export function FeedScreen({ lang, posts, activeTab, onTabChange, onOpenComments, onLike, onRepost, onWarnedMe, onOpenAlerts, alertCount, onRepostClick, themeMode, onThemeChange, onLangToggle, onImageExpand, onTopicClick, followedTopics, customTopic }: {
  followedTopics: string[]; customTopic?: string|null;
  lang: Lang; posts: Post[]; activeTab: number; onTabChange: (i: number) => void;
  onOpenComments: (id: string) => void; onLike: (id: string) => void; onRepost: (id: string) => void;
  onWarnedMe: (id: string) => void; onCompose: () => void; onOpenAlerts: () => void; alertCount: number;
  onRepostClick: (post: Post) => void; themeMode: ThemeMode; onThemeChange: (m: ThemeMode) => void; onLangToggle: () => void; onImageExpand?: (url: string) => void; onTopicClick?: (topic: string) => void;
}) {
  const t = T[lang];
  const tabs = lang === "lo" ? FEED_TABS_LO : FEED_TABS_EN;

  const filteredPosts = customTopic ? posts.filter(p=>p.tags.includes(customTopic)) : activeTab === 0 ? posts :
    activeTab === 1 ? posts.filter(p => p.tags.some(tag => followedTopics.includes(tag))) :
    posts.filter(p => {
      const tagMap = ["", "", "OnlineScam", "Trafficking", "DigitalSafety"];
      return p.tags.includes(tagMap[activeTab]);
    });

  return (
    <div className="h-full flex flex-col bg-background">
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="flex items-center justify-between px-4 py-2.5">
          <img src={logoImage} alt="Sati" className="w-8 h-8 rounded-lg object-contain" />
          <div className="flex items-center gap-2">
            <button onClick={onOpenAlerts} className="relative p-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors">
              <Bell size={18} />
              {alertCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center">{alertCount}</span>
              )}
            </button>
            <ThemeToggle mode={themeMode} onChange={onThemeChange} />
            <LangToggle lang={lang} onToggle={onLangToggle} />
          </div>
        </div>
        <div className="flex overflow-x-auto scrollbar-hide">
          {tabs.map((tab, i) => (
            <button key={i} onClick={() => onTabChange(i)} className={`px-4 py-3 text-xs font-semibold whitespace-nowrap transition-colors relative ${activeTab === i ? "text-primary" : "text-muted-foreground"}`}>
              {tab}
              {activeTab === i && <div className="absolute bottom-0 left-2 right-2 h-0.5 bg-primary rounded-full" />}
            </button>
          ))}
        </div>
      </div>
      {customTopic && <button className="touch-target text-primary text-sm border-b border-border" onClick={()=>onTabChange(0)}>#{customTopic} · {lang==='lo'?'ສະແດງທັງໝົດ':'Show all posts'}</button>}
      <div className="flex-1 min-h-0 overflow-y-auto scrollbar-hide">
        {/* Compose bar hidden — users use the + button in bottom nav */}
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
