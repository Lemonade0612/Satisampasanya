// ═══════════════════════════════════════════════════════════════════════════════
//  SCREENING LOG MODAL
//  Shows detailed AI screening history for a post
// ═══════════════════════════════════════════════════════════════════════════════

import { X, Clock, CheckCircle, AlertTriangle, Shield, Loader2 } from "lucide-react";
import { Post, Lang, ScreeningStage } from "@/types";
import { T } from "@/lib/constants";

interface ScreeningLogModalProps {
  post: Post | null;
  lang: Lang;
  onClose: () => void;
}

const STAGE_ICONS: Record<ScreeningStage, React.ReactNode> = {
  ai_screening: <Loader2 size={16} className="text-indigo-500" />,
  expert_review: <Clock size={16} className="text-amber-500" />,
  auto_unlock: <AlertTriangle size={16} className="text-slate-500" />,
  completed: <CheckCircle size={16} className="text-emerald-500" />,
};

const STAGE_COLORS: Record<ScreeningStage, string> = {
  ai_screening: "border-indigo-200 bg-indigo-50 dark:bg-indigo-950/20",
  expert_review: "border-amber-200 bg-amber-50 dark:bg-amber-950/20",
  auto_unlock: "border-slate-200 bg-slate-50 dark:bg-slate-900/20",
  completed: "border-emerald-200 bg-emerald-50 dark:bg-emerald-950/20",
};

export function ScreeningLogModal({ post, lang, onClose }: ScreeningLogModalProps) {
  const t = T[lang];
  if (!post || !post.screeningLogs || post.screeningLogs.length === 0) return null;

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleString(lang === "lo" ? "lo-LA" : "en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="fixed inset-0 z-[55] bg-black/60 flex items-end sm:items-center justify-center p-0 sm:p-4" onClick={onClose}>
      <div 
        className="bg-background w-full max-w-md sm:rounded-2xl rounded-t-2xl max-h-[80vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <div>
            <h3 className="font-semibold text-sm">{t.under_review}</h3>
            <p className="text-[11px] text-muted-foreground">
              {post.screeningStage === "completed" ? "Completed" : `Status: ${post.screeningStage}`}
            </p>
          </div>
          <button onClick={onClose} className="p-1">
            <X size={20} />
          </button>
        </div>

        {/* AI Analysis Summary */}
        {post.aiSeverity && (
          <div className="px-4 py-3 border-b border-border">
            <div className="flex items-center gap-2 mb-2">
              <Shield size={14} className="text-primary" />
              <span className="text-xs font-semibold">AI Analysis Result</span>
            </div>
            <div className="flex items-center gap-2 mb-2">
              <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${
                post.aiSeverity === "none" ? "bg-emerald-100 text-emerald-700" :
                post.aiSeverity === "low" ? "bg-blue-100 text-blue-700" :
                post.aiSeverity === "medium" ? "bg-amber-100 text-amber-700" :
                post.aiSeverity === "high" ? "bg-orange-100 text-orange-700" :
                "bg-red-100 text-red-700"
              }`}>
                Severity: {post.aiSeverity.toUpperCase()}
              </span>
            </div>
            {post.aiFlags && post.aiFlags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {post.aiFlags.map((flag, i) => (
                  <span key={i} className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                    {flag}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Timeline */}
        <div className="flex-1 overflow-y-auto px-4 py-3">
          <p className="text-[10px] font-bold tracking-wider uppercase text-muted-foreground mb-3">
            Screening Timeline
          </p>
          <div className="space-y-3">
            {post.screeningLogs.map((log, index) => (
              <div key={index} className="flex gap-3">
                {/* Timeline line */}
                <div className="flex flex-col items-center">
                  <div className={`w-7 h-7 rounded-full border flex items-center justify-center ${STAGE_COLORS[log.stage]}`}>
                    {STAGE_ICONS[log.stage]}
                  </div>
                  {index < post.screeningLogs!.length - 1 && (
                    <div className="w-0.5 flex-1 bg-border mt-1" />
                  )}
                </div>
                {/* Content */}
                <div className="flex-1 pb-3">
                  <p className="text-[11px] font-semibold text-foreground">
                    {log.stage === "ai_screening" ? "AI Screening" :
                     log.stage === "expert_review" ? "Expert Review" :
                     log.stage === "auto_unlock" ? "Auto-Unlock" :
                     "Completed"}
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">
                    {log.message}
                  </p>
                  <p className="text-[10px] text-muted-foreground/60 mt-1">
                    {formatTime(log.timestamp)}
                  </p>
                  {log.severity && (
                    <span className={`inline-block mt-1 text-[9px] px-1.5 py-0.5 rounded ${
                      log.severity === "low" ? "bg-blue-50 text-blue-600" :
                      log.severity === "medium" ? "bg-amber-50 text-amber-600" :
                      log.severity === "high" ? "bg-orange-50 text-orange-600" :
                      "bg-red-50 text-red-600"
                    }`}>
                      {log.severity}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-border">
          {post.expertReviewDeadline && post.screeningStage === "expert_review" && (
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-muted-foreground">{t.review_deadline}</span>
              <span className="text-[11px] font-semibold text-amber-600">
                {new Date(post.expertReviewDeadline).toLocaleString()}
              </span>
            </div>
          )}
          {post.screeningStage === "completed" && (
            <div className="text-center">
              <span className="text-[11px] text-emerald-600 font-medium">
                ✓ Screening process completed
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
