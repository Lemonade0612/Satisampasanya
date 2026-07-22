// ═══════════════════════════════════════════════════════════════════════════════
//  POST CARD COMPONENT (Updated with AI Screening)
// ═══════════════════════════════════════════════════════════════════════════════

import { useState } from "react";
import { Heart, MessageCircle, Share2, Repeat2, Shield, Play, ExternalLink, Clock, AlertTriangle, AlertOctagon, CheckCircle } from "lucide-react";
import { Post, Lang, LeafState } from "@/satisampasanya_app/types";
import { T, COLORS } from "@/satisampasanya_app/lib/constants";
import { TagChip } from "@/components/ui/TagChip";
import { LeafMark } from "@/components/ui/LeafMark";
import { ScreeningBadge } from "./ScreeningBadge";

interface PostCardProps {
  post: Post;
  lang: Lang;
  onOpenComments: (id: string) => void;
  onLike: (id: string) => void;
  onRepost: (id: string) => void;
  onWarnedMe: (id: string) => void;
  onRepostClick: (post: Post) => void;
  onImageExpand?: (url: string) => void;
  onTopicClick?: (topic: string) => void;
  screeningStatus?: {
    isActive: boolean;
    progress: number;
    stage: string;
    message: string;
  };
}

export function PostCard({
  post, lang, onOpenComments, onLike, onRepost, onWarnedMe,
  onRepostClick, onImageExpand, onTopicClick, screeningStatus
}: PostCardProps) {
  const t = T[lang];
  const [liked, setLiked] = useState(false);
  const [reposted, setReposted] = useState(false);
  const [warned, setWarned] = useState(false);
  const [showFull, setShowFull] = useState(false);

  const content = lang === "lo" && post.contentLo ? post.contentLo : post.content;
  const isLong = content.length > 200;
  const displayContent = showFull || !isLong ? content : content.slice(0, 200) + "...";


  const getStateBanner = () => {
    if (post.state === "flagged") return (
      <div className="mx-4 mb-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 p-3 flex gap-2.5">
        <Clock size={16} className="text-amber-500 shrink-0 mt-0.5" />
        <div>
          <p className="text-xs font-semibold text-amber-700 dark:text-amber-300">{t.banner_review_title}</p>
          <p className="text-[11px] text-amber-600 dark:text-amber-400 mt-0.5">{lang === "lo" && post.flagReasonLo ? post.flagReasonLo : post.flagReason}</p>
        </div>
      </div>
    );
    if (post.state === "false") return (
      <div className="mx-4 mb-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 p-3">
        <div className="flex gap-2.5 mb-1.5">
          <AlertOctagon size={16} className="text-red-500 shrink-0 mt-0.5" />
          <p className="text-xs font-semibold text-red-700 dark:text-red-300">{t.banner_false_title}</p>
        </div>
        <p className="text-[11px] text-red-600 dark:text-red-400 ml-6">{t.banner_correction}{lang === "lo" && post.correctionLo ? post.correctionLo : post.correction}</p>
      </div>
    );
    if (post.state === "sla") return (
      <div className="mx-4 mb-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 p-3 flex gap-2.5">
        <AlertTriangle size={16} className="text-slate-500 shrink-0 mt-0.5" />
        <p className="text-[11px] text-slate-600 dark:text-slate-400">{t.banner_sla}</p>
      </div>
    );
    if (post.state === "confirmed") return (
      <div className="mx-4 mb-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 p-3 flex gap-2.5">
        <CheckCircle size={16} className="text-emerald-500 shrink-0 mt-0.5" />
        <div>
          <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-300">Verified by Expert</p>
          <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-0.5">This post has been reviewed and confirmed accurate. +{post.points} points awarded</p>
        </div>
      </div>
    );
    return null;
  };

  const getLeafState = (): LeafState => {
    if (post.state === "confirmed") return post.featuredPoints ? "featured" : "verified";
    if (post.state === "flagged" || post.state === "sla") return "pending";
    return "none";
  };

  return (
    <article className="bg-background border-b border-border">
{/* AI Screening Status Badge */}
      <ScreeningBadge 
        post={post} 
        lang={lang} 
        isActive={screeningStatus?.isActive}
        progress={screeningStatus?.progress}
      />

      <div className="px-4 pt-3 pb-2">
        <div className="flex gap-3">
          <div className="shrink-0">
            <div 
              className="w-10 h-10 rounded-full flex items-center justify-center text-white text-xs font-bold"
              style={{ background: post.author.color }}
            >
              {post.author.initials}
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-semibold text-sm text-foreground">{post.author.name}</span>
              <LeafMark state={getLeafState()} size={14} />
              {post.isNews && (
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-primary/10 text-primary">
                  {t.news_label}
                </span>
              )}
              <span className="text-xs text-muted-foreground">{post.author.handle}</span>
              <span className="text-xs text-muted-foreground">·</span>
              <span className="text-xs text-muted-foreground">{post.timestamp}</span>
            </div>

            <p className="text-sm text-foreground leading-relaxed mt-1 whitespace-pre-wrap">
              {displayContent}
            </p>

            {isLong && (
              <button 
                onClick={() => setShowFull(v => !v)} 
                className="text-xs text-primary font-semibold mt-1"
              >
                {showFull ? t.show_less : t.show_more}
              </button>
            )}

            {/* Image */}
            {post.image && (
              <div 
                className="mt-2.5 rounded-2xl overflow-hidden border border-border relative cursor-pointer"
                onClick={() => onImageExpand && onImageExpand(post.image!)}
              >
                <img src={post.image} alt="" className="w-full h-auto object-cover max-h-[400px]" />
                {post.hasVideo && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-14 h-14 rounded-full bg-black/50 flex items-center justify-center">
                      <Play size={24} className="text-white ml-1" />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Link */}
            {post.link && (
              <a 
                href={post.link} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="mt-2.5 flex items-center gap-2 rounded-xl border border-border bg-muted/30 px-3 py-2.5 hover:bg-muted/50 transition-colors"
              >
                <ExternalLink size={14} className="text-muted-foreground shrink-0" />
                <span className="text-xs text-primary truncate flex-1">{post.link}</span>
              </a>
            )}

            {/* Tags */}
            <div className="flex flex-wrap gap-1.5 mt-2.5">
              {post.tags.map(tag => (
                <span 
                  key={tag} 
                  onClick={(e) => { e.stopPropagation(); onTopicClick && onTopicClick(tag); }}
                  className="cursor-pointer"
                >
                  <TagChip tag={tag} lang={lang} small />
                </span>
              ))}
            </div>

            {/* Points */}
            {post.points !== undefined && post.state === "confirmed" && (
              <div className="flex items-center gap-3 mt-2.5 text-[11px] text-muted-foreground">
                <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                  ⚡ {post.points} {t.verified_pts}
                </span>
                {post.featuredPoints && (
                  <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
                    📈 {t.featured_bonus}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="flex items-center justify-between px-2 py-2">
        <button 
          onClick={() => { if (!liked) { setLiked(true); onLike(post.id); } }} 
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs transition-colors ${
            liked ? "text-red-500 bg-red-50 dark:bg-red-950/30" : "text-muted-foreground hover:bg-muted/50"
          }`}
        >
          <Heart size={16} fill={liked ? "currentColor" : "none"} /> 
          {post.likes + (liked ? 1 : 0)}
        </button>
        <button 
          onClick={() => onOpenComments(post.id)} 
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs text-muted-foreground hover:bg-muted/50 transition-colors"
        >
          <MessageCircle size={16} /> {post.comments}
        </button>
        <button 
          onClick={() => onRepostClick(post)} 
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs transition-colors ${
            reposted ? "text-emerald-500 bg-emerald-50 dark:bg-emerald-950/30" : "text-muted-foreground hover:bg-muted/50"
          }`}
        >
          <Repeat2 size={16} /> {post.reposts + (reposted ? 1 : 0)}
        </button>
        <button 
          onClick={() => { if (!warned) { setWarned(true); onWarnedMe(post.id); } }} 
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs transition-colors ${
            warned ? "text-amber-500 bg-amber-50 dark:bg-amber-950/30" : "text-muted-foreground hover:bg-muted/50"
          }`}
        >
          <Shield size={16} /> {post.warnedMe + (warned ? 1 : 0)}
        </button>
        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs text-muted-foreground hover:bg-muted/50 transition-colors">
          <Share2 size={16} />
        </button>
      </div>
    </article>
  );
}
