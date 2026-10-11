// ═══════════════════════════════════════════════════════════════════════════════
//  SCREENING BADGE v2.0 (with Queue Info)
// ═══════════════════════════════════════════════════════════════════════════════

import { Clock, Shield, AlertTriangle, CheckCircle, Loader2, Users, BarChart3 } from "lucide-react";
import { Post, Lang } from "@/types";
import { T } from "@/lib/constants";
import { expertQueue } from "@/lib/ai-screening";

interface ScreeningBadgeProps {
  post: Post;
  lang: Lang;
  isActive?: boolean;
  progress?: number;
}

export function ScreeningBadge({ post, lang, isActive, progress = 100 }: ScreeningBadgeProps) {
  const t = T[lang];

  if (post.screeningStage === "completed" && post.state === "clean") return null;

  // AI Screening in progress
  if (isActive && post.screeningStage === "ai_screening") {
    return (
      <div className="mx-4 mb-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800 p-3">
        <div className="flex items-center gap-2.5">
          <Loader2 size={16} className="text-indigo-500 animate-spin shrink-0" />
          <div className="flex-1">
            <p className="text-xs font-semibold text-indigo-700 dark:text-indigo-300">
              {t.ai_screening_title}
            </p>
            <div className="mt-1.5 h-1.5 bg-indigo-100 dark:bg-indigo-900 rounded-full overflow-hidden">
              <div className="h-full bg-indigo-500 rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
            </div>
            <p className="text-[10px] text-indigo-500 mt-1">
              {progress}% — {t.ai_screening_subtitle}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Expert Review with Queue Info
  if (post.screeningStage === "expert_review") {
    const remaining = post.expertReviewDeadline ? Math.max(0, post.expertReviewDeadline - Date.now()) : 0;
    const hours = Math.floor(remaining / (1000 * 60 * 60));
    const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
    const queuePos = expertQueue.getQueuePosition(post.id);
    const queueLen = expertQueue.getQueueLength();
    const waitTime = expertQueue.getEstimatedWaitTime(post.id);

    return (
      <div className="mx-4 mb-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 p-3">
        <div className="flex items-start gap-2.5">
          <Clock size={16} className="text-amber-500 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-xs font-semibold text-amber-700 dark:text-amber-300">
              {t.ai_flagged_title}
            </p>
            <p className="text-[11px] text-amber-600 dark:text-amber-400 mt-0.5">
              {t.ai_flagged_subtitle}
            </p>

            {/* Queue Info */}
            {queuePos > 0 && (
              <div className="mt-2 flex items-center gap-3 text-[10px] text-amber-600 dark:text-amber-400">
                <span className="flex items-center gap-1">
                  <Users size={10} />
                  Queue: #{queuePos} of {queueLen}
                </span>
                <span className="flex items-center gap-1">
                  <BarChart3 size={10} />
                  Est. wait: {waitTime} min
                </span>
              </div>
            )}

            {/* SLA Timer */}
            {remaining > 0 && (
              <div className="mt-2">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] text-amber-600 dark:text-amber-400">SLA Timer</span>
                  <span className="text-[10px] text-amber-600 dark:text-amber-400 font-medium">
                    {hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`} remaining
                  </span>
                </div>
                <div className="h-1 bg-amber-100 dark:bg-amber-900 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-500 rounded-full transition-all" style={{ width: `${Math.max(0, (remaining / (48 * 60 * 60 * 1000)) * 100)}%` }} />
                </div>
              </div>
            )}

            {/* AI Flags */}
            {post.aiFlags && post.aiFlags.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {post.aiFlags.map((flag, i) => (
                  <span key={i} className="text-[9px] px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300">
                    {flag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Auto-unlocked (SLA expired)
  if (post.screeningStage === "auto_unlock" || post.state === "sla") {
    return (
      <div className="mx-4 mb-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 p-3">
        <div className="flex items-start gap-2.5">
          <AlertTriangle size={16} className="text-slate-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              {t.ai_unlocked_title}
            </p>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">
              {t.ai_unlocked_subtitle}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Verified by expert
  if (post.state === "confirmed") {
    return (
      <div className="mx-4 mb-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 p-3">
        <div className="flex items-start gap-2.5">
          <CheckCircle size={16} className="text-emerald-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-300">
              {t.ai_verified_title}
            </p>
            <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-0.5">
              {t.ai_verified_subtitle}
              {post.points && <span className="ml-1 font-bold">+{post.points} {t.ai_points_awarded}</span>}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // False / Blocked
  if (post.state === "false") {
    return (
      <div className="mx-4 mb-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 p-3">
        <div className="flex items-start gap-2.5">
          <Shield size={16} className="text-red-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-semibold text-red-700 dark:text-red-300">
              {t.banner_false_title}
            </p>
            {post.correction && (
              <p className="text-[11px] text-red-600 dark:text-red-400 mt-0.5">
                {t.banner_correction}{post.correction}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  return null;
}
