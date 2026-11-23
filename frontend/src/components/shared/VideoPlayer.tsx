import { useEffect, useRef, useState } from "react";
import { AlertTriangle, ExternalLink, Phone, Play } from "lucide-react";
import { openExternal } from "../../lib/external";
import { HOTLINES } from "../../lib/hotlines";
import type { Lang } from "../../types";

// Reusable video: YouTube, Facebook, direct MP4/WebM, the CNA (Brightcove) player, or anything else.
// Nothing is downloaded or rehosted. A page that cannot be framed (X-Frame-Options / CSP) falls back to a thumbnail card
// that opens the source in a new tab. Nothing third-party loads until the viewer taps play, so a content warning can come first.

export type VideoKind = "youtube" | "facebook" | "file" | "frame" | "link";
export type VideoSource = { kind: VideoKind; src: string };

const YT_ID = /^[\w-]{11}$/;
export function parseVideoUrl(url: string, embedUrl?: string): VideoSource {
  let u: URL;
  try { u = new URL(embedUrl || url); } catch { return { kind: "link", src: url }; }
  if (u.protocol !== "https:" && u.protocol !== "http:") return { kind: "link", src: url };
  const host = u.hostname.replace(/^www\.|^m\./, "");
  if (host === "youtu.be" || host === "youtube.com" || host === "youtube-nocookie.com") {
    const id = host === "youtu.be" ? u.pathname.slice(1) : u.pathname.startsWith("/embed/") ? u.pathname.split("/")[2] : u.pathname.startsWith("/shorts/") ? u.pathname.split("/")[2] : u.searchParams.get("v") || "";
    if (YT_ID.test(id)) return { kind: "youtube", src: `https://www.youtube-nocookie.com/embed/${id}?rel=0&playsinline=1` };
  }
  if (host === "facebook.com" || host === "fb.watch") {
    if (u.pathname.startsWith("/plugins/video.php")) return { kind: "facebook", src: u.toString() };
    return { kind: "facebook", src: `https://www.facebook.com/plugins/video.php?show_text=false&href=${encodeURIComponent(u.toString())}` };
  }
  if (/\.(mp4|webm|ogv|m4v)$/i.test(u.pathname)) return { kind: "file", src: u.toString() };
  // Known players that allow framing. Any other page is not assumed to be embeddable.
  if (host === "players.brightcove.net" || host === "player.vimeo.com") return { kind: "frame", src: u.toString() };
  return { kind: "link", src: url };
}

const WARN = {
  lo: "ເນື້ອຫາວິດີໂອນີ້ກ່ຽວກັບການຂູດຮີດເດັກ ແລະ ອາດເຮັດໃຫ້ບາງຄົນຮູ້ສຶກບໍ່ສະບາຍໃຈ. ຖ້າທ່ານຫຼືຄົນທີ່ທ່ານຮູ້ຈັກຕ້ອງການຄວາມຊ່ວຍເຫຼືອ ໃຫ້ໂທ 1362.", // REVIEW-LO
  en: "This video is about child exploitation and may be upsetting. If you or someone you know needs help, call 1362.",
};
const hotline1362 = HOTLINES.flatMap(g => g.items).find(h => h.number === "1362");

export function VideoPlayer({ url, embedUrl, poster, title, lang, sourceName, contentWarning = false }: {
  url: string; embedUrl?: string; poster?: string; title: string; lang: Lang; sourceName?: string; contentWarning?: boolean;
}) {
  const lo = lang === "lo";
  const source = parseVideoUrl(url, embedUrl);
  const [started, setStarted] = useState(false);
  const box = useRef<HTMLDivElement>(null);
  const [failed, setFailed] = useState(false);
  const canEmbed = source.kind !== "link" && !failed;
  const open = () => void openExternal(url);
  // Without a content warning, a Facebook or YouTube video loads its own player as the card scrolls near the screen, so the
  // viewer sees the real first frame as the preview (nothing plays until they press play inside it).
  const livePreview = !contentWarning && (source.kind === "facebook" || source.kind === "youtube");
  useEffect(() => {
    const el = box.current;
    if (!livePreview || started || !el) return;
    if (typeof IntersectionObserver === "undefined") { setStarted(true); return; }
    const io = new IntersectionObserver(es => { if (es.some(e => e.isIntersecting)) { setStarted(true); io.disconnect(); } }, { rootMargin: "200px" });
    io.observe(el);
    return () => io.disconnect();
  }, [livePreview, started]);
  const hue = [...(sourceName || title)].reduce((h, c) => (h * 31 + c.charCodeAt(0)) % 360, 7);

  return <div className="rounded-2xl overflow-hidden border border-border bg-background">
    <div ref={box} className="relative aspect-video bg-black">
      {started && canEmbed ? (
        source.kind === "file"
          ? <video className="absolute inset-0 w-full h-full" src={source.src} poster={poster} controls playsInline preload="metadata" onError={() => setFailed(true)} aria-label={title} />
          : <iframe className="absolute inset-0 w-full h-full border-0" src={source.src} title={title} loading="lazy" allowFullScreen referrerPolicy="strict-origin-when-cross-origin"
              allow="autoplay; encrypted-media; picture-in-picture; fullscreen" sandbox="allow-scripts allow-same-origin allow-presentation allow-popups" />
      ) : <>
        {poster && <img src={poster} alt="" referrerPolicy="no-referrer" loading="lazy" className={`absolute inset-0 w-full h-full object-cover ${contentWarning && !started ? "blur-md scale-105" : ""}`} onError={e => { e.currentTarget.style.display = "none"; }} />}
        {!poster && <div aria-hidden className="absolute inset-0" style={{ background: `linear-gradient(135deg, hsl(${hue} 55% 18%), hsl(${(hue + 40) % 360} 60% 34%))` }}>
          <span className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full bg-black/40 px-2.5 py-1 text-[11px] font-semibold text-white">{source.kind === "facebook" ? "Facebook" : source.kind === "youtube" ? "YouTube" : (lo ? "ວິດີໂອ" : "Video")} · {lo ? "ວິດີໂອ" : "Video"}</span>
          <span className="absolute left-3 bottom-3 text-[13px] font-semibold text-white/80">{sourceName}</span>
        </div>}
        <div className="absolute inset-0 bg-black/45 flex flex-col items-center justify-center gap-3 p-4 text-center text-white">
          {contentWarning && !started && <p role="note" className="flex items-start gap-2 text-left text-[13px] leading-snug max-w-[34ch]"><AlertTriangle size={18} aria-hidden className="shrink-0 mt-0.5 text-warning-icon" /><span>{lo ? WARN.lo : WARN.en}</span></p>}
          {source.kind === "link" || failed
            ? <><p className="text-[13px]">{lo ? "ວິດີໂອນີ້ຝັງໃນແອັບບໍ່ໄດ້. ເປີດຢູ່ເວັບຕົ້ນທາງ." : "This video can't play inside the app. Open it on the source site."}</p>
                <button type="button" onClick={open} className="min-h-11 rounded-full bg-white text-black font-bold text-sm px-5 flex items-center gap-2"><ExternalLink size={16} aria-hidden />{lo ? `ເປີດຢູ່ ${sourceName || "ເວັບຕົ້ນທາງ"}` : `Open on ${sourceName || "source site"}`}</button></>
            : <button type="button" onClick={() => setStarted(true)} className="min-h-11 rounded-full bg-primary text-primary-foreground font-bold text-sm px-5 flex items-center gap-2"><Play size={16} aria-hidden fill="currentColor" />{contentWarning ? (lo ? "ເຂົ້າໃຈແລ້ວ · ເບິ່ງວິດີໂອ" : "I understand · Play video") : (lo ? "ເບິ່ງວິດີໂອ" : "Play video")}</button>}
        </div>
      </>}
    </div>
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 px-3 py-2 text-[13px]">
      {(started || canEmbed) && <button type="button" onClick={open} className="min-h-11 flex items-center gap-1.5 text-primary-ink font-semibold"><ExternalLink size={14} aria-hidden />{lo ? "ເປີດຢູ່ເວັບຕົ້ນທາງ" : "Open source page"}</button>}
      {contentWarning && hotline1362 && <a href={`tel:${hotline1362.tel}`} className="min-h-11 flex items-center gap-1.5 font-bold text-danger"><Phone size={14} aria-hidden />{lo ? "ຕ້ອງການຄວາມຊ່ວຍເຫຼືອ? ໂທ 1362 (ຟຣີ, 24 ຊົ່ວໂມງ)" : "Need help? Call 1362 (free, 24 hours)"}</a>}
    </div>
  </div>;
}
