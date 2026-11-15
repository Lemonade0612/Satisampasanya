import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { BadgeCheck, ChevronLeft, ExternalLink, Phone, Pin, TriangleAlert } from "lucide-react";
import { api } from "../../lib/api";
import { bundledApprovedPosts, type CuratedPost, type CuratedType } from "../../data/posts";
import { isTrustedSource } from "../../lib/moderation";
import { openExternal } from "../../lib/external";
import { VideoPlayer } from "../shared/VideoPlayer";
import type { Lang } from "../../types";

// Posts / ຂ່າວສານ: curated, approved posts. The server decides what is public; the bundled copy covers offline use.
const TYPE_LABEL: Record<CuratedType, { lo: string; en: string }> = {
  news: { lo: "ຂ່າວ", en: "News" }, event: { lo: "ກິດຈະກຳ", en: "Event" }, hotline: { lo: "ສາຍດ່ວນ", en: "Hotline" }, job: { lo: "ວຽກ", en: "Jobs" },
  study: { lo: "ຮຽນຕໍ່", en: "Study" }, awareness: { lo: "ຄວາມຮູ້", en: "Awareness" }, video: { lo: "ວິດີໂອ", en: "Video" },
}; // REVIEW-LO
const FILTERS: (CuratedType | "all")[] = ["all", "hotline", "news", "awareness", "event", "video"];

export function CuratedFeed({ lang }: { lang: Lang }) {
  const lo = lang === "lo";
  const [posts, setPosts] = useState<CuratedPost[]>(() => bundledApprovedPosts());
  const [filter, setFilter] = useState<CuratedType | "all">("all");
  const [openId, setOpenId] = useState<string | null>(null);
  useEffect(() => {
    let live = true;
    api.curated().then(list => { if (live && Array.isArray(list)) setPosts(list); }).catch(() => { /* offline: keep the bundled approved posts */ });
    return () => { live = false; };
  }, []);
  const shown = filter === "all" ? posts : posts.filter(p => p.type === filter);
  const count = (f: CuratedType | "all") => f === "all" ? posts.length : posts.filter(p => p.type === f).length;

  return <div className="px-4 pt-3 space-y-3">
    <div role="group" aria-label={lo ? "ກັ່ນຕອງ" : "Filter"} className="flex gap-2 overflow-x-auto scrollbar-hide -mx-4 px-4 pb-1">
      {FILTERS.filter(f => f === "all" || count(f) > 0).map(f => <button key={f} type="button" aria-pressed={filter === f} onClick={() => setFilter(f)}
        className={`min-h-11 shrink-0 rounded-full px-4 text-sm font-semibold border ${filter === f ? "bg-primary text-primary-foreground border-primary" : "bg-background text-text border-border"}`}>
        {f === "all" ? (lo ? "ທັງໝົດ" : "All") : lo ? TYPE_LABEL[f].lo : TYPE_LABEL[f].en}
      </button>)}
    </div>
    {shown.length === 0 && <p className="py-12 text-center text-text-muted">{lo ? "ຍັງບໍ່ມີໂພສ" : "No posts yet"}</p>}
    {shown.map(p => <CuratedCard key={p.id} post={p} lang={lang} onOpen={() => setOpenId(p.id)} />)}
    <p className="pb-2 text-center text-xs text-text-muted">{lo ? "ເນື້ອຫາທັງໝົດເປັນຂອງຜູ້ໂພສຕົ້ນສະບັບ ແລະ ໃຫ້ເຄຣດິດຕາມແຫຼ່ງ. ຂໍຂອບໃຈ laosatd." : "All content belongs to the original posters and is shown with credit. Thanks to laosatd (facebook.com/laosatd)."}</p>
    {openId && posts.find(p => p.id === openId) && <PostDetail post={posts.find(p => p.id === openId)!} lang={lang} onClose={() => setOpenId(null)} />}
  </div>;
}

const creditOf = (p: CuratedPost) => p.credit ?? { name: p.source_name, platform: undefined, url: p.source_url ?? undefined };
const fmtDate = (p: CuratedPost, lo: boolean) => p.date ? new Date(p.date + "T00:00:00").toLocaleDateString(lo ? "lo-LA" : "en-GB", { day: "numeric", month: "short", year: "numeric" }) : "";

// Who posted it: avatar initial, name, verified tick, platform and date. Same header on the card and in the reader.
function CreditLine({ post: p, lang }: { post: CuratedPost; lang: Lang }) {
  const lo = lang === "lo", c = creditOf(p), verified = isTrustedSource(p), date = fmtDate(p, lo);
  return <div className="flex items-center gap-2.5 min-w-0">
    <span aria-hidden className="w-10 h-10 shrink-0 rounded-full bg-tint-purple-bg text-tint-purple-fg flex items-center justify-center font-bold">{Array.from(c.name.replace(/^[^\p{L}\p{N}]+/u, ""))[0]?.toUpperCase() || "S"}</span>
    <span className="min-w-0">
      <span className="flex items-center gap-1 font-bold text-[15px] leading-tight"><span className="truncate">{c.name}</span>{verified && <BadgeCheck size={15} aria-label={lo ? "ແຫຼ່ງຂ່າວທີ່ຢືນຢັນແລ້ວ" : "Verified source"} className="shrink-0 text-success" />}</span>
      <span className="block text-xs text-text-muted truncate">{[c.platform ? (lo ? `ຜ່ານ ${c.platform}` : `via ${c.platform}`) : "", date].filter(Boolean).join(" · ") || (lo ? "ແຫຼ່ງຕົ້ນສະບັບ" : "Original source")}</span>
    </span>
  </div>;
}

function CuratedCard({ post: p, lang, onOpen }: { post: CuratedPost; lang: Lang; onOpen: () => void }) {
  const lo = lang === "lo";
  const title = lo ? p.title_lo : p.title_en, summary = lo ? p.summary_lo : p.summary_en, warning = lo ? p.warning_lo : p.warning_en;
  return <article className={`rounded-2xl border bg-background overflow-hidden ${p.pinned ? "border-primary/40" : "border-border"}`}>
    <div className="px-4 pt-3"><CreditLine post={p} lang={lang} /></div>
    <div className="px-4 pt-2 flex flex-wrap items-center gap-2 text-xs">
      {p.pinned && <span className="flex items-center gap-1 font-bold text-primary-ink"><Pin size={12} aria-hidden />{lo ? "ປັກໝຸດ" : "Pinned"}</span>}
      <span className="rounded-full bg-muted px-2.5 py-1 font-semibold text-text-2">{lo ? TYPE_LABEL[p.type].lo : TYPE_LABEL[p.type].en}</span>
      {p.expired && <span className="rounded-full bg-warning-bg border border-warning-border text-warning-text px-2.5 py-1 font-semibold">{lo ? "ກິດຈະກຳສິ້ນສຸດແລ້ວ" : "Event ended"}</span>}
    </div>
    <button type="button" onClick={onOpen} className="block w-full text-left px-4 pt-2 pb-3 min-h-11">
      <h3 className="font-bold text-base leading-snug">{title}</h3>
      <p className="mt-1 text-[15px] leading-relaxed text-text-2 line-clamp-4">{summary}</p>
      <span className="mt-1 inline-block text-sm font-bold text-primary-ink">{lo ? "ອ່ານຕໍ່ໃນ Sati" : "Read in Sati"} →</span>
    </button>
    {p.video
      ? <div className="px-2 pb-2"><VideoPlayer url={p.video.url} embedUrl={p.video.embed_url} poster={p.video.poster} title={title} lang={lang} sourceName={creditOf(p).name} contentWarning={p.content_warning} /></div>
      : p.image && <button type="button" onClick={onOpen} aria-label={title} className="block w-full"><img src={p.image} alt={title} loading="lazy" className="w-full max-h-[420px] object-contain bg-muted" /></button>}
    {warning && <p role="note" className="mx-4 mb-3 rounded-xl bg-warning-bg border border-warning-border text-warning-text p-3 text-sm flex gap-2"><TriangleAlert size={18} aria-hidden className="shrink-0 mt-0.5 text-warning-icon" />{warning}</p>}
    {p.contact?.tel && <div className="px-4 pb-3"><a href={`tel:${p.contact.tel.replace(/\s/g, "")}`} className="inline-flex min-h-11 rounded-full bg-[#22C55E] text-white font-bold text-sm px-4 items-center gap-2"><Phone size={16} aria-hidden />{lo ? "ໂທ" : "Call"} {p.contact.tel}</a></div>}
  </article>; // REVIEW-LO
}

const linkify = (text: string) => text.split(/(https?:\/\/[^\s]+)/g).map((part, i) => /^https?:\/\//.test(part)
  ? <button key={i} type="button" onClick={() => void openExternal(part)} className="text-primary-ink underline break-all text-left">{part}</button> : <span key={i}>{part}</span>);

// Reader: the whole post inside Sati, with credit and a link to the original. Portalled into the app shell so it covers the phone frame only.
function PostDetail({ post: p, lang, onClose }: { post: CuratedPost; lang: Lang; onClose: () => void }) {
  const lo = lang === "lo";
  const title = lo ? p.title_lo : p.title_en, summary = lo ? p.summary_lo : p.summary_en, warning = lo ? p.warning_lo : p.warning_en;
  const body = (lo ? p.body_lo : p.body_en) || summary, c = creditOf(p);
  const original = p.credit?.url || p.source_url || p.video?.url;
  useEffect(() => { const esc = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); }; document.addEventListener("keydown", esc); return () => document.removeEventListener("keydown", esc); }, [onClose]);
  const view = <div role="dialog" aria-modal="true" aria-label={title} className="absolute inset-0 z-50 bg-background flex flex-col">
    <div className="shrink-0 flex items-center gap-1 border-b border-border px-2 min-h-14">
      <button type="button" onClick={onClose} aria-label={lo ? "ກັບຄືນ" : "Back"} className="w-11 h-11 flex items-center justify-center rounded-full"><ChevronLeft size={26} aria-hidden /></button>
      <span className="font-bold truncate">{lo ? "ຂ່າວສານ" : "Posts"}</span>
    </div>
    <div className="flex-1 min-h-0 overflow-y-auto px-4 py-4 space-y-3 pb-24">
      <CreditLine post={p} lang={lang} />
      <h2 className="text-xl font-bold leading-snug">{title}</h2>
      {p.video && <VideoPlayer url={p.video.url} embedUrl={p.video.embed_url} poster={p.video.poster} title={title} lang={lang} sourceName={c.name} contentWarning={p.content_warning} />}
      {!p.video && p.image && <img src={p.image} alt={title} className="w-full rounded-xl bg-muted" />}
      {warning && <p role="note" className="rounded-xl bg-warning-bg border border-warning-border text-warning-text p-3 text-sm flex gap-2"><TriangleAlert size={18} aria-hidden className="shrink-0 mt-0.5 text-warning-icon" />{warning}</p>}
      <div className="text-[16px] leading-relaxed whitespace-pre-line">{linkify(body)}</div>
      {p.contact?.tel && <a href={`tel:${p.contact.tel.replace(/\s/g, "")}`} className="inline-flex min-h-11 rounded-full bg-[#22C55E] text-white font-bold text-sm px-4 items-center gap-2"><Phone size={16} aria-hidden />{lo ? "ໂທ" : "Call"} {p.contact.tel}</a>}
      <p className="text-sm text-text-muted">{lo ? "ເຄຣດິດ" : "Credit"}: {c.name}{c.platform ? ` (${c.platform})` : ""}. {lo ? "ເນື້ອຫາເປັນຂອງຜູ້ໂພສຕົ້ນສະບັບ. ບາງໂພສສະແດງແຕ່ຕົວຢ່າງຂໍ້ຄວາມ; ອ່ານຄົບຖ້ວນຢູ່ຕົ້ນສະບັບ." : "Content belongs to the original poster. Some posts show only a preview of the text; read the full post at the original."}</p>
      {original && <button type="button" onClick={() => void openExternal(original)} className="min-h-11 w-full rounded-full border border-border font-bold text-sm flex items-center justify-center gap-2"><ExternalLink size={16} aria-hidden />{lo ? `ເປີດຕົ້ນສະບັບຢູ່ ${c.platform || c.name}` : `Open original${c.platform ? ` on ${c.platform}` : ""}`}</button>}
    </div>
  </div>;
  const shell = document.querySelector(".app-shell");
  return shell ? createPortal(view, shell) : view;
}
