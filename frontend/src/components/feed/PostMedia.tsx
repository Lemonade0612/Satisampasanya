import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, ExternalLink, Link2, Play, Volume2, VolumeX, X } from "lucide-react";
import type { Lang, Post, PostMediaItem, PostType } from "../../types";

export const mediaOf = (post: Post): PostMediaItem[] =>
  post.media?.length ? post.media : post.image ? [{ kind: "image", url: post.image }] : [];
export const sourceOf = (post: Post) => post.sourceUrl || post.link || undefined;
export const typeOf = (post: Post): PostType => {
  if (post.type) return post.type;
  const m = mediaOf(post);
  return m.some(x => x.kind === "video") ? "video" : m.length ? "poster" : sourceOf(post) ? "link" : "text";
};
export const domainOf = (url: string) => { try { return new URL(url).hostname.replace(/^www\./, ""); } catch { return url; } };
const isSocialVideo = (url: string) => /(^|\.)(facebook\.com|fb\.watch|youtube\.com|youtu\.be)$/.test(domainOf(url));
const caption = (m: PostMediaItem, lang: Lang) => (lang === "lo" ? m.caption_lo || m.caption_en : m.caption_en || m.caption_lo) || "";
const fmt = (s: number) => `${Math.floor(s / 60)}:${String(Math.round(s % 60)).padStart(2, "0")}`;
const fine = "[@media(pointer:fine)]:flex";

// Long poster text becomes a short list: 2 items, then "read N more".
const BULLET = /^\s*(?:[-•*·]|\d+[.)])\s+/;
// Lines marked with - • * or 1. are the items and anything before them is an intro; with no markers every line is an item.
export const listItems = (text: string): { intro: string; items: string[] } => {
  const lines = text.split(/\n+/).map(l => l.trim()).filter(Boolean), at = lines.findIndex(l => BULLET.test(l));
  if (at < 0) return { intro: "", items: lines };
  return { intro: lines.slice(0, at).join("\n"), items: lines.slice(at).map(l => l.replace(BULLET, "")) };
};
export function TipList({ intro, items, lang }: { intro?: string; items: string[]; lang: Lang }) {
  const [all, setAll] = useState(false), lo = lang === "lo", extra = items.length - 2;
  return <div className="mt-3">
    {intro && <p className="mb-2 text-[17px] font-bold text-text break-words">{intro}</p>}
    <ul className="flex flex-col gap-3 pl-5 list-disc marker:text-primary text-[17px] leading-relaxed text-text">
      {(all ? items : items.slice(0, 2)).map((t, i) => <li key={i} className="break-words">{t}</li>)}
    </ul>
    {extra > 0 && <button type="button" aria-expanded={all} onClick={() => setAll(v => !v)} className="min-h-11 text-[15px] font-bold text-primary-ink">
      {all ? (lo ? "ສະແດງໜ້ອຍລົງ" : "Show less") : lo ? `ອ່ານອີກ ${extra} ວິທີ` : `Read ${extra} more tips`}</button>}
  </div>;
}

function Arrow({ dir, onClick, label }: { dir: -1 | 1; onClick: () => void; label: string }) {
  return <button type="button" aria-label={label} onClick={e => { e.stopPropagation(); onClick(); }}
    className={`hidden ${fine} absolute top-1/2 -translate-y-1/2 ${dir < 0 ? "left-2" : "right-2"} w-11 h-11 items-center justify-center rounded-full bg-black/55 text-white`}>
    {dir < 0 ? <ChevronLeft size={22} aria-hidden /> : <ChevronRight size={22} aria-hidden />}</button>;
}

export function PosterCarousel({ items, lang }: { items: PostMediaItem[]; lang: Lang }) {
  const [i, setI] = useState(0), [box, setBox] = useState(false), track = useRef<HTMLDivElement>(null), lo = lang === "lo";
  const go = (n: number) => { const t = track.current; if (!t) return; const k = Math.max(0, Math.min(items.length - 1, n)); t.scrollTo({ left: k * t.clientWidth, behavior: "smooth" }); setI(k); };
  const many = items.length > 1;
  return <div className="mt-3 relative">
    <div ref={track} onScroll={e => { const t = e.currentTarget; setI(Math.round(t.scrollLeft / t.clientWidth)); }} role="group" aria-roledescription="carousel" aria-label={lo ? "ຮູບໂພສ" : "Post images"}
      className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide bg-surface-2">
      {items.map((m, k) => <button key={k} type="button" aria-label={`${lo ? "ເບິ່ງຮູບໃຫຍ່" : "Open image"} ${k + 1}/${items.length}`} onClick={() => setBox(true)} className="snap-center shrink-0 w-full block">
        <img src={m.url} alt={caption(m, lang)} loading={k ? "lazy" : "eager"} width={m.width} height={m.height} className="w-full max-h-[460px] object-cover" />
      </button>)}
    </div>
    {many && <>
      <span className="absolute top-2 right-2 rounded-full bg-black/60 px-2.5 py-0.5 text-[13px] font-bold text-white" aria-live="polite">{i + 1}/{items.length}</span>
      {i > 0 && <Arrow dir={-1} onClick={() => go(i - 1)} label={lo ? "ຮູບກ່ອນ" : "Previous image"} />}
      {i < items.length - 1 && <Arrow dir={1} onClick={() => go(i + 1)} label={lo ? "ຮູບຕໍ່ໄປ" : "Next image"} />}
      <div aria-hidden className="absolute bottom-2 inset-x-0 flex justify-center gap-1.5">{items.map((_, k) => <span key={k} className={`h-1.5 rounded-full transition-all ${k === i ? "w-4 bg-white" : "w-1.5 bg-white/60"}`} />)}</div>
    </>}
    {box && <Lightbox items={items} start={i} lang={lang} onClose={() => setBox(false)} />}
  </div>;
}

export function Lightbox({ items, start, lang, onClose }: { items: PostMediaItem[]; start: number; lang: Lang; onClose: () => void }) {
  const [i, setI] = useState(start), root = useRef<HTMLDivElement>(null), lo = lang === "lo";
  const step = useCallback((d: number) => setI(k => Math.max(0, Math.min(items.length - 1, k + d))), [items.length]);
  useEffect(() => {
    const back = document.activeElement as HTMLElement | null, prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    root.current?.querySelector<HTMLElement>("[data-close]")?.focus();
    const key = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowLeft") step(-1);
      else if (e.key === "ArrowRight") step(1);
      else if (e.key === "Tab") { // keep focus inside the dialog
        const f = [...root.current!.querySelectorAll<HTMLElement>("button")].filter(b => !b.hasAttribute("disabled"));
        const first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    document.addEventListener("keydown", key);
    return () => { document.removeEventListener("keydown", key); document.body.style.overflow = prev; back?.focus?.(); };
  }, [onClose, step]);
  const m = items[i], cap = caption(m, lang);
  return <div ref={root} role="dialog" aria-modal="true" aria-label={lo ? "ຮູບເຕັມຈໍ" : "Full-screen image"} className="fixed inset-0 z-[80] flex flex-col bg-black pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]">
    <div className="flex items-center justify-between px-3 py-2 text-white">
      <span className="text-sm font-bold" aria-live="polite">{i + 1}/{items.length}</span>
      <button type="button" data-close aria-label={lo ? "ປິດ" : "Close"} onClick={onClose} className="min-h-11 min-w-11 flex items-center justify-center rounded-full bg-white/15"><X size={24} aria-hidden /></button>
    </div>
    <div className="relative flex-1 min-h-0 flex items-center justify-center px-2">
      <img src={m.url} alt={cap} className="max-w-full max-h-full object-contain" />
      {i > 0 && <button type="button" aria-label={lo ? "ຮູບກ່ອນ" : "Previous image"} onClick={() => step(-1)} className="absolute left-2 w-11 h-11 rounded-full bg-white/15 text-white flex items-center justify-center"><ChevronLeft size={24} aria-hidden /></button>}
      {i < items.length - 1 && <button type="button" aria-label={lo ? "ຮູບຕໍ່ໄປ" : "Next image"} onClick={() => step(1)} className="absolute right-2 w-11 h-11 rounded-full bg-white/15 text-white flex items-center justify-center"><ChevronRight size={24} aria-hidden /></button>}
    </div>
    {cap && <p className="px-5 py-3 text-center text-[16px] leading-relaxed text-white">{cap}</p>}
    {items.length > 1 && <div className="flex gap-2 overflow-x-auto scrollbar-hide px-3 pb-3 justify-center">
      {items.map((t, k) => <button key={k} type="button" aria-label={`${lo ? "ຮູບ" : "Image"} ${k + 1}`} aria-current={k === i} onClick={() => setI(k)} className={`shrink-0 w-14 h-14 rounded-lg overflow-hidden border-2 ${k === i ? "border-white" : "border-transparent opacity-60"}`}>
        <img src={t.thumb_url || t.url} alt="" className="w-full h-full object-cover" /></button>)}
    </div>}
  </div>;
}

const reduceMotion = () => typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches;
const canHls = (v: HTMLVideoElement) => !!v.canPlayType("application/vnd.apple.mpegurl");

export function VideoBlock({ item, title, lang }: { item: PostMediaItem; title: string; lang: Lang }) {
  const lo = lang === "lo", ref = useRef<HTMLVideoElement>(null), wrap = useRef<HTMLDivElement>(null);
  const [playing, setPlaying] = useState(false), [muted, setMuted] = useState(true), [failed, setFailed] = useState(false);
  const hls = /\.m3u8(\?|$)/i.test(item.url);
  const social = isSocialVideo(item.url);
  const manual = useRef(false);
  useEffect(() => {
    const v = ref.current, w = wrap.current;
    if (!v || !w || social || failed) return;
    // Autoplay muted only at 60% visible and with reduced motion off; pause once it mostly leaves the screen.
    const io = new IntersectionObserver(([e]) => {
      if (e.intersectionRatio >= 0.6 && (manual.current || !reduceMotion())) { v.muted = manual.current ? v.muted : true; void v.play().catch(() => {}); }
      else if (e.intersectionRatio < 0.3) v.pause();
    }, { threshold: [0, 0.3, 0.6, 1] });
    io.observe(w);
    return () => io.disconnect();
  }, [social, failed]);
  if (social || failed || (hls && typeof document !== "undefined" && !canHls(document.createElement("video")))) {
    return <LinkCard url={social ? item.url : item.url} thumb={item.thumb_url} title={title} lang={lang} video />;
  }
  const tap = () => {
    const v = ref.current!;
    manual.current = true;
    if (v.paused) { void v.play(); return; }
    v.muted = !v.muted; setMuted(v.muted);
  };
  return <div ref={wrap} className="mt-3 relative bg-black">
    <video ref={ref} src={item.url} poster={item.thumb_url} muted playsInline loop preload="metadata" onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)} onError={() => setFailed(true)}
      aria-label={title || (lo ? "ວິດີໂອ" : "Video")} className="w-full max-h-[460px] object-cover aspect-video" />
    <button type="button" onClick={tap} aria-label={!playing ? (lo ? "ຫຼິ້ນວິດີໂອ" : "Play video") : muted ? (lo ? "ເປີດສຽງ" : "Turn sound on") : (lo ? "ປິດສຽງ" : "Mute")} className="absolute inset-0 flex items-center justify-center">
      {!playing && <span className="w-16 h-16 rounded-full bg-black/55 flex items-center justify-center"><Play size={28} className="text-white ml-1" aria-hidden fill="white" /></span>}
    </button>
    {playing && <span aria-hidden className="absolute bottom-2 left-2 w-9 h-9 rounded-full bg-black/60 flex items-center justify-center text-white">{muted ? <VolumeX size={18} /> : <Volume2 size={18} />}</span>}
    {item.duration ? <span className="absolute bottom-2 right-2 rounded-md bg-black/70 px-2 py-0.5 text-[13px] font-bold text-white">{fmt(item.duration)}</span> : null}
  </div>;
}

// OG-style preview card: the domain is the biggest, clearest line, and it opens outside the app.
export function LinkCard({ url, thumb, title, lang, video }: { url: string; thumb?: string; title: string; lang: Lang; video?: boolean }) {
  const lo = lang === "lo", host = domainOf(url);
  return <a href={url} target="_blank" rel="noopener noreferrer" className="mt-3 mx-4 flex overflow-hidden rounded-2xl border border-border bg-surface min-h-[72px]">
    {thumb ? <span className="relative w-24 shrink-0 bg-surface-2"><img src={thumb} alt="" className="absolute inset-0 w-full h-full object-cover" />{video && <span className="absolute inset-0 flex items-center justify-center"><span className="w-9 h-9 rounded-full bg-black/55 flex items-center justify-center"><Play size={16} className="text-white ml-0.5" fill="white" aria-hidden /></span></span>}</span>
      : <span aria-hidden className="w-14 shrink-0 flex items-center justify-center bg-surface-2 text-text-muted">{video ? <Play size={22} /> : <Link2 size={22} />}</span>}
    <span className="min-w-0 flex-1 px-3 py-2.5">
      <span className="block text-[16px] font-bold text-text truncate">{host}</span>
      {title && <span className="block text-[14px] leading-snug text-text-muted line-clamp-2 break-words">{title}</span>}
      <span className="mt-1 flex items-center gap-1 text-[13px] font-bold text-primary-ink">{video ? (lo ? "ເປີດວິດີໂອ" : "Watch video") : (lo ? "ເປີດລິ້ງ" : "Open link")}<ExternalLink size={13} aria-hidden /></span>
    </span>
  </a>;
}

// "Open in Facebook" or the plain source link, under any post that has a source_url.
export function SourceLink({ url, lang }: { url: string; lang: Lang }) {
  const lo = lang === "lo", host = domainOf(url), fb = /(^|\.)(facebook\.com|fb\.com|fb\.watch)$/.test(host);
  return <a href={url} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex items-center gap-1.5 min-h-11 text-[14px] font-bold text-primary-ink">
    <ExternalLink size={15} aria-hidden />{fb ? (lo ? "ເປີດໃນ Facebook" : "Open in Facebook") : `${lo ? "ແຫຼ່ງຂໍ້ມູນ" : "Source"}: ${host}`}</a>;
}
