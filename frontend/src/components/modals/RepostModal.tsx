import { T } from "../../lib/translations";
import { useState } from "react";
import { X } from "lucide-react";
import type { Post, Lang } from "../../types";

export function RepostModal({ post, lang, onClose, onRepost }: {
  post: Post | null; lang: Lang; onClose: () => void;
  onRepost: (originalPost: Post, text: string) => Promise<void>;
}) {
  const t = T[lang];
  const [busy,setBusy] = useState(false);
  const [error,setError] = useState('');
  const [text, setText] = useState("");
  if (!post) return null;

  const content = lang === "lo" && post.contentLo ? post.contentLo : post.content;
  const canRepost = text.length === 0 || (text.length >= 1 && text.length <= 150);

  return (
    <div className="phone-modal fixed inset-0 z-50 flex flex-col bg-background">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <button onClick={onClose} className="p-1"><X size={20} /></button>
        <span className="text-sm font-semibold">{t.repost}</span>
        <button onClick={async () => {if(!canRepost || busy)return;setBusy(true);setError('');try{await onRepost(post,text);onClose();}catch(e){setError((e as Error).message);}finally{setBusy(false);}}} disabled={!canRepost || busy} className="bg-primary text-white text-xs font-semibold px-4 py-1.5 rounded-full disabled:opacity-40 active:scale-95 transition-transform">
          {t.repost}
        </button>
      </div>
      <div className="flex-1 min-h-0 overflow-y-auto px-4 pt-4 pb-4">{error && <p role="alert" className="text-sm text-red-600 mb-3">{error}</p>}
        <div className="flex gap-3 mb-4">
          <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0" style={{ background: "linear-gradient(135deg,#5B21D1,#84ADEF)" }}>
            YO
          </div>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={t.repost_ph}
            className="flex-1 bg-transparent text-sm outline-none resize-none placeholder:text-muted-foreground/60 min-h-[80px]"
            maxLength={150}
          />
        </div>
        <div className="text-right text-xs text-muted-foreground mb-4">{150 - text.length} remaining</div>
        <div className="rounded-xl border border-border bg-muted/30 p-3">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[10px] font-bold" style={{ background: post.author.color }}>
              {post.author.initials}
            </div>
            <div>
              <span className="text-xs font-semibold">{post.author.name}</span>
              <span className="text-[10px] text-muted-foreground ml-1">{post.author.handle}</span>
            </div>
          </div>
          <p className="text-xs text-muted-foreground line-clamp-3">{content}</p>
        </div>
      </div>
    </div>
  );
}
