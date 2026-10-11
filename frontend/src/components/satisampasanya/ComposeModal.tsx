// ═══════════════════════════════════════════════════════════════════════════════
//  COMPOSE MODAL (Updated with AI Screening Flow)
// ═══════════════════════════════════════════════════════════════════════════════

import { useState, useRef } from "react";
import { X, Upload, Loader2 } from "lucide-react";
import { Post, Lang, UploadedFile } from "@/types";
import { T, TOPICS, AI_SCREENING_CONFIG } from "@/lib/constants";

interface ComposeModalProps {
  lang: Lang;
  onClose: () => void;
  onPost: (post: Post) => void;
  isSubmitting?: boolean;
}

export function ComposeModal({ lang, onClose, onPost, isSubmitting }: ComposeModalProps) {
  const t = T[lang];
  const [text, setText] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [sourceUrl, setSourceUrl] = useState("");
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [remaining, setRemaining] = useState(2);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const canPost = text.trim().length >= AI_SCREENING_CONFIG.MIN_CONTENT_LENGTH 
    && text.length <= AI_SCREENING_CONFIG.MAX_CONTENT_LENGTH 
    && selectedTags.length > 0 
    && sourceUrl.trim().length > 0;

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const newFiles: UploadedFile[] = Array.from(e.target.files).map((file, i) => ({
      id: `f-${Date.now()}-${i}`,
      file,
      preview: URL.createObjectURL(file),
      progress: 0,
      status: "uploading" as const,
    }));
    setFiles(prev => [...prev, ...newFiles]);
    newFiles.forEach((f, idx) => {
      setTimeout(() => {
        setFiles(prev => prev.map(pf => pf.id === f.id ? { ...pf, progress: 100, status: "done" as const } : pf));
      }, 800 + idx * 300);
    });
  };

  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  };

  const handlePost = () => {
    if (!canPost || isSubmitting) return;

    const newPost: Post = {
      id: `p-${Date.now()}`,
      author: { name: "You", handle: "@you", initials: "YO", color: "#5B21D1", points: 0 },
      content: text,
      tags: selectedTags,
      timestamp: "Just now",
      state: "flagged", // Will be updated by AI screening
      likes: 0, comments: 0, reposts: 0, warnedMe: 0,
      screeningStage: "ai_screening",
      screeningLogs: [{
        stage: "ai_screening",
        timestamp: Date.now(),
        message: "Post submitted. AI screening initiated.",
      }],
      isNews: true,
      link: sourceUrl,
    };

    onPost(newPost);
    setRemaining(v => Math.max(0, v - 1));
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <button onClick={onClose} className="p-1" disabled={isSubmitting}>
          <X size={20} />
        </button>
        <span className="text-sm font-semibold">{t.compose_news}</span>
        <button 
          onClick={handlePost} 
          disabled={!canPost || isSubmitting}
          className="bg-primary text-white text-xs font-semibold px-4 py-1.5 rounded-full disabled:opacity-40 active:scale-95 transition-transform flex items-center gap-1.5"
        >
          {isSubmitting ? (
            <>
              <Loader2 size={12} className="animate-spin" />
              AI Screening...
            </>
          ) : (
            t.compose_post
          )}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pt-4 pb-4">
        {/* Info */}
        <p className="text-[11px] text-muted-foreground mb-3">{t.compose_info}</p>
        <p className="text-[11px] text-primary font-semibold mb-3">
          {remaining} {t.compose_remaining}
        </p>

        {/* Content textarea */}
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={t.compose_ph_news}
          disabled={isSubmitting}
          className="w-full min-h-[120px] bg-transparent text-sm outline-none resize-none placeholder:text-muted-foreground/60 text-foreground leading-relaxed disabled:opacity-50"
        />

        {/* Character count */}
        <div className={`text-right text-xs mb-4 ${
          text.length < AI_SCREENING_CONFIG.MIN_CONTENT_LENGTH ? "text-red-500" : "text-muted-foreground"
        }`}>
          {text.length} / {AI_SCREENING_CONFIG.MIN_CONTENT_LENGTH} min
        </div>

        {/* Source URL */}
        <div className="mt-3">
          <p className="text-xs font-semibold mb-1.5">{t.compose_sources}</p>
          <input 
            value={sourceUrl} 
            onChange={(e) => setSourceUrl(e.target.value)} 
            placeholder={t.compose_source_ph}
            disabled={isSubmitting}
            className="w-full rounded-xl border border-border bg-muted/50 px-3 py-2 text-sm outline-none placeholder:text-muted-foreground/60 disabled:opacity-50" 
          />
        </div>

        {/* Topic Tags */}
        <div className="mt-4">
          <p className="text-xs font-semibold mb-1.5">
            {t.compose_topics} <span className="text-muted-foreground font-normal">({t.compose_topics_hint})</span>
          </p>
          <div className="flex flex-wrap gap-1.5">
            {TOPICS.map(tag => (
              <button 
                key={tag} 
                onClick={() => {
                  if (isSubmitting) return;
                  setSelectedTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
                }}
                disabled={isSubmitting}
                className={`px-2.5 py-1 rounded-full text-[11px] font-medium border transition-all disabled:opacity-50 ${
                  selectedTags.includes(tag) 
                    ? "bg-primary text-white border-primary" 
                    : "bg-muted text-muted-foreground border-border hover:border-primary/30"
                }`}
              >
                #{lang === "lo" ? ({
                  OnlineScam: "ການຫຼອກລວງອອນລາຍ", Trafficking: "ການຄ້າມະນຸດ", DigitalSafety: "ຄວາມປອດໄພດິຈິຕອລ",
                  JobScam: "ການຫຼອກລວງຊອກວຽກ", CryptoScam: "ການຫຼອກລວງ Crypto", BorderSafety: "ຄວາມປອດໄພຊາຍແດນ",
                  SocialMedia: "ສື່ສັງຄົມ", PhishingAlert: "ແຈ້ງເຕືອນ Phishing", RomanceScam: "ການຫຼອກລວງຄວາມຮັກ", DataPrivacy: "ຄວາມເປັນສ່ວນຕົວ"
                } as Record<string, string>)[tag] || tag : tag}
              </button>
            ))}
          </div>
        </div>

        {/* Photo Upload */}
        <div className="mt-4">
          <p className="text-xs font-semibold mb-1.5">
            {t.compose_photos} <span className="text-muted-foreground font-normal">({t.compose_photos_hint})</span>
          </p>
          <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleFileSelect} />
          <button 
            onClick={() => fileInputRef.current?.click()} 
            disabled={isSubmitting}
            className="w-full border-2 border-dashed border-border rounded-2xl py-6 flex flex-col items-center gap-2 text-muted-foreground hover:border-primary/30 hover:bg-primary/5 transition-all disabled:opacity-50"
          >
            <Upload size={20} />
            <span className="text-xs">{t.compose_photos}</span>
          </button>

          {files.length > 0 && (
            <div className="flex gap-2 mt-3 flex-wrap">
              {files.map(f => (
                <div key={f.id} className="relative w-20 h-20 rounded-xl overflow-hidden border border-border">
                  <img src={f.preview} alt="" className="w-full h-full object-cover" />
                  <button 
                    onClick={() => removeFile(f.id)} 
                    className="absolute top-0.5 right-0.5 w-5 h-5 rounded-full bg-black/50 text-white flex items-center justify-center"
                  >
                    <X size={10} />
                  </button>
                  {f.status === "uploading" && (
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/20">
                      <div className="h-full bg-primary transition-all" style={{ width: `${f.progress}%` }} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
