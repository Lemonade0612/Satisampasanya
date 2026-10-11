import { SatiLogo } from "../components/shared/Brand";
import { T } from "../lib/translations";
import { useState } from "react";
import { TOPICS, TOPIC_LABELS } from "../lib/constants";
import { Search, X, TrendingUp, Shield, Check } from "lucide-react";
import { TagChip } from "@/components/ui/TagChip";
import type { Lang, Post } from "../types";

export function ExploreScreen({ lang, posts, onOpenPost, onTopicClick }: { lang: Lang; posts: Post[]; onOpenPost: (id: string) => void; onTopicClick?: (topic: string) => void; }) {
  const t = T[lang];
  const [search, setSearch] = useState("");
  const [searchFocus, setSearchFocus] = useState(false);

  const trending = TOPICS.map(tag => ({
    tag,
    count: posts.filter(p => p.tags.includes(tag)).reduce((sum, p) => sum + p.likes + p.comments + p.reposts, 0),
  })).sort((a, b) => b.count - a.count).slice(0, 8);

  const filteredPosts = search.trim() ? posts.filter(p => {
    const searchLower = search.toLowerCase();
    // Search in both English and Lao content
    const contentMatch = p.content.toLowerCase().includes(searchLower) || 
                         (p.contentLo && p.contentLo.toLowerCase().includes(searchLower));
    // Search in both English and Lao tag labels
    const tagMatch = p.tags.some(t => {
      const label = TOPIC_LABELS[t];
      return t.toLowerCase().includes(searchLower) || 
             (label && (label.en.toLowerCase().includes(searchLower) || label.lo.toLowerCase().includes(searchLower)));
    });
    const authorMatch = p.author.name.toLowerCase().includes(searchLower);
    return contentMatch || tagMatch || authorMatch;
  }) : [];

  const safetyTips = [
    t.safety_tip_otp,
    t.safety_tip_job,
    t.safety_tip_apk,
    t.safety_tip_url,
    t.safety_tip_too_good,
  ];

  return (
    <div className="h-full flex flex-col bg-background overflow-y-auto scrollbar-hide">
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border px-4 py-3">
        <div className={`flex items-center gap-2 rounded-xl px-3 py-2.5 border transition-all ${searchFocus ? "border-primary/60 bg-white dark:bg-background" : "border-border bg-muted/50"}`}>
          <SatiLogo size={26} /><Search size={16} className="text-muted-foreground shrink-0" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onFocus={() => setSearchFocus(true)}
            onBlur={() => setSearchFocus(false)}
            placeholder={t.search_ph}
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground/60 text-foreground"
          />
          {search && <button onClick={() => setSearch("")} className="text-muted-foreground"><X size={14} /></button>}
        </div>
      </div>
      {search.trim() ? (
        <div>
          {filteredPosts.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground text-sm">No results found</div>
          ) : (
            filteredPosts.map(post => (
              <button key={post.id} onClick={() => onOpenPost(post.id)} className="w-full text-left px-4 py-3 border-b border-border hover:bg-muted/30 transition-colors">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-xs">{post.author.name}</span>
                  <span className="text-[10px] text-muted-foreground">{post.timestamp}</span>
                </div>
                <p className="text-sm text-foreground line-clamp-2">{lang === "lo" && post.contentLo ? post.contentLo : post.content}</p>
                <div className="flex gap-1.5 mt-1.5">
                  {post.tags.map(tag => (
                    <span key={tag} onClick={(e) => { e.stopPropagation(); onTopicClick && onTopicClick(tag); }}
                      className="cursor-pointer">
                      <TagChip tag={tag} lang={lang} small />
                    </span>
                  ))}
                </div>
              </button>
            ))
          )}
        </div>
      ) : (
        <div className="p-4">
          <h3 className="text-sm font-bold mb-3 flex items-center gap-1.5">
            <TrendingUp size={16} className="text-primary" /> {t.trending}
          </h3>
          <div className="space-y-2">
            {trending.map(({ tag, count }, i) => (
              <div key={tag} onClick={() => onTopicClick && onTopicClick(tag)}
                className="flex items-center justify-between p-3 rounded-xl border border-border bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer">
                <div className="flex items-center gap-3 pointer-events-none">
                  <span className="text-xs font-bold text-muted-foreground w-4">{i + 1}</span>
                  <TagChip tag={tag} lang={lang} />
                </div>
                <span className="text-xs text-muted-foreground pointer-events-none">{count.toLocaleString()} {t.topic_posts}</span>
              </div>
            ))}
          </div>
          <div className="mt-6">
            <h3 className="text-sm font-bold mb-3 flex items-center gap-1.5">
              <Shield size={16} className="text-primary" /> {t.safety_checklist}
            </h3>
            <div className="space-y-2">
              {safetyTips.map((tip, i) => (
                <div key={i} className="flex gap-2.5 p-3 rounded-xl border border-border bg-muted/30">
                  <Check size={14} className="text-primary shrink-0 mt-0.5" />
                  <p className="text-xs text-foreground leading-relaxed">{tip}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
