import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { BadgeCheck, ChevronLeft, ExternalLink, Phone, Pin, TriangleAlert } from "lucide-react";
import { api } from "../../lib/api";
import { bundledApprovedPosts, type CuratedPost, type CuratedType } from "../../data/posts";
import { isTrustedSource, moderate, REDFLAG_NAMES } from "../../lib/moderation";
import { FLAG_NOTE } from "../../lib/flagReasons";
import { STATUS } from "../feed/colorCode";
import { openExternal } from "../../lib/external";
import { openProfile } from "../../lib/profileNav";
import { VideoPlayer } from "../shared/VideoPlayer";
import type { Lang } from "../../types";

// Posts / ຂ່າວສານ: curated, approved posts. The server decides what is public; the bundled copy covers offline use.
const TYPE_LABEL: Record<CuratedType, { lo: string; en: string }> = {
  news: { lo: "ຂ່າວ", en: "News" }, event: { lo: "ກິດຈະກຳ", en: "Event" }, hotline: { lo: "ສາຍດ່ວນ", en: "Hotline" }, job: { lo: "ວຽກ", en: "Jobs" },
  study: { lo: "ຮຽນຕໍ່", en: "Study" }, awareness: { lo: "ຄວາມຮູ້", en: "Awareness" }, video: { lo: "ວິດີໂອ", en: "Video" },
}; // REVIEW-LO
const FILTERS: (CuratedType | "all")[] = ["all", "hotline", "news", "awareness", "event", "video"];

// One shared store so every card in the feed reads the same list and the server is asked once.
// The list is mixed (videos, hotlines, news, awareness, events, jobs and study taking turns) so no one type arrives in a block.
const ROTATION: CuratedType[] = ["video", "hotline", "news", "awareness", "video", "event", "job", "study"];
export function mixCurated(list: CuratedPost[]): CuratedPost[] {
  const pinned: CuratedPost[] = [], shown = list.filter(p => !p.profileOnly), rest = shown.filter(p => !p.expired), ended = shown.filter(p => p.expired); // profileOnly: listed on the organisation's profile, not repeated in the feed
  const queues = new Map<CuratedType, CuratedPost[]>();
  for (const p of rest) queues.set(p.type, [...(queues.get(p.type) || []), p]);
  const out: CuratedPost[] = [];
  while ([...queues.values()].some(q => q.length)) for (const t of ROTATION) { const next = queues.get(t)?.shift(); if (next) out.push(next); }
  for (const q of queues.values()) out.push(...q);
  return [...pinned, ...out, ...ended];
}
let store: CuratedPost[] = mixCurated(bundledApprovedPosts());
let started = false;
const subs = new Set<() => void>();
const subscribe = (f: () => void) => { subs.add(f); return () => { subs.delete(f); }; };
function load() {
  if (started) return; started = true;
  api.curated().then(list => { if (Array.isArray(list)) { store = mixCurated(list); subs.forEach(f => f()); } }).catch(() => { started = false; /* offline: keep the bundled approved posts */ });
}
export function useCuratedPosts(): CuratedPost[] {
  useEffect(load, []);
  return useSyncExternalStore(subscribe, () => store);
}

// One curated post as it appears between normal feed posts; it owns its reader screen.
export function CuratedItem({ post, lang }: { post: CuratedPost; lang: Lang }) {
  const [open, setOpen] = useState(false);
  return <>
    <CuratedCard post={post} lang={lang} onOpen={() => setOpen(true)} />
    {open && <PostDetail post={post} lang={lang} onClose={() => setOpen(false)} />}
  </>;
}

// The reader for one curated post by id (used from organisation profiles, where the post is listed as `cur-<id>`).
export function CuratedReader({ id, lang, onClose }: { id: string; lang: Lang; onClose: () => void }) {
  const post = useCuratedPosts().find(p => p.id === id);
  return post ? <PostDetail post={post} lang={lang} onClose={onClose} /> : null;
}

// Explore → Posts: the whole list with type filters.
export function CuratedFeed({ lang }: { lang: Lang }) {
  const lo = lang === "lo";
  const posts = useCuratedPosts();
  const [filter, setFilter] = useState<CuratedType | "all">("all");
  const shown = useMemo(() => filter === "all" ? posts : posts.filter(p => p.type === filter), [posts, filter]);
  const count = (f: CuratedType | "all") => f === "all" ? posts.length : posts.filter(p => p.type === f).length;

  return <div className="px-4 pt-3 space-y-3">
    <div role="group" aria-label={lo ? "ກັ່ນຕອງ" : "Filter"} className="flex gap-2 overflow-x-auto scrollbar-hide -mx-4 px-4 pb-1">
      {FILTERS.filter(f => f === "all" || count(f) > 0).map(f => <button key={f} type="button" aria-pressed={filter === f} onClick={() => setFilter(f)}
        className={`min-h-11 shrink-0 rounded-full px-4 text-sm font-semibold border ${filter === f ? "bg-primary text-primary-foreground border-primary" : "bg-background text-text border-border"}`}>
        {f === "all" ? (lo ? "ທັງໝົດ" : "All") : lo ? TYPE_LABEL[f].lo : TYPE_LABEL[f].en}
      </button>)}
    </div>
    {shown.length === 0 && <p className="py-12 text-center text-text-muted">{lo ? "ຍັງບໍ່ມີໂພສ" : "No posts yet"}</p>}
    {shown.map(p => <CuratedItem key={p.id} post={p} lang={lang} />)}
    <p className="pb-2 text-center text-xs text-text-muted">{lo ? "ເນື້ອຫາທັງໝົດເປັນຂອງຜູ້ໂພສຕົ້ນສະບັບ ແລະ ໃຫ້ເຄຣດິດຕາມແຫຼ່ງ. ຂໍຂອບໃຈ laosatd." : "All content belongs to the original posters and is shown with credit. Thanks to laosatd (facebook.com/laosatd)."}</p>
  </div>;
}

// Lao names for the credited sources (same as their profile pages), so Lao mode shows no English-only source names.
const NAME_LO: Record<string, string> = {
  "iom-laos": "ອົງການ IOM ລາວ (UN Migration)", "village-focus": "Village Focus International", "pfha-bokeo": "ສະມາຄົມສົ່ງເສີມສຸຂະພາບຄອບຄົວ ບໍ່ແກ້ວ", "laotian-times": "Laotian Times",
  "oudomxay-police": "ປກສ ແຂວງອຸດົມໄຊ", "rfa-lao": "RFA Lao", "target-magazine-laos": "Target Magazine Laos", "ilsta": "ILSTA", "laophattana-news": "ຂ່າວວີດີໂອລາວພັດທະນາ",
  "labdelines": "labdelines", "molsw-news": "ຂ່າວສານແຮງງານ ແລະ ສະຫວັດດີການສັງຄົມ (ຮສສ)", "optahanhet": "ເປີດຕາທັນເຫດ", "laosatd": "laosatd", "cna-insight": "CNA Insight",
  "lao-womens-union": "ສະຫະພັນແມ່ຍິງລາວ", "unicef-laos": "ຢູນິເຊັບ ລາວ",
}; // REVIEW-LO

// Colour and notes for a curated post: "Check first" when the rules found a warning sign, otherwise "Safe".
function useModNote(p: CuratedPost, lang: Lang) {
  const m = moderate(p), signs = m.flags.filter(f => REDFLAG_NAMES.includes(f) || f === "involves_children").filter(f => FLAG_NOTE[f]);
  const status = signs.some(f => REDFLAG_NAMES.includes(f)) ? "check" : "safe";
  return { status: status as "check" | "safe", notes: signs.map(f => FLAG_NOTE[f][lang]) };
}
const creditOf = (p: CuratedPost, lang: Lang = "en") => {
  const c = p.credit ?? { name: p.source_name, platform: undefined, url: p.source_url ?? undefined };
  if (lang !== "lo") return c;
  const name = (p.org && NAME_LO[p.org]) || (c.name === "Facebook groups (unofficial)" ? "ກຸ່ມ Facebook (ບໍ່ເປັນທາງການ)" : c.name);
  return { ...c, name };
};
const LO_MONTHS = ["ມັງກອນ", "ກຸມພາ", "ມີນາ", "ເມສາ", "ພຶດສະພາ", "ມິຖຸນາ", "ກໍລະກົດ", "ສິງຫາ", "ກັນຍາ", "ຕຸລາ", "ພະຈິກ", "ທັນວາ"];
const fmtDate = (p: CuratedPost, lo: boolean) => { if (!p.date) return ""; const d = new Date(p.date + "T00:00:00"); return lo ? `${d.getDate()} ${LO_MONTHS[d.getMonth()]} ${d.getFullYear()}` : d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }); };

// Who posted it: avatar initial, name, verified tick, platform and date. Same header on the card and in the reader.
function CreditLine({ post: p, lang, onBeforeOpen }: { post: CuratedPost; lang: Lang; onBeforeOpen?: () => void }) {
  const lo = lang === "lo", c = creditOf(p, lang), verified = isTrustedSource(p), date = fmtDate(p, lo);
  const open = p.org ? () => { onBeforeOpen?.(); openProfile({ kind: "org", slug: p.org! }); } : undefined;
  const Wrap = (props: { children: React.ReactNode }) => open
    ? <button type="button" onClick={open} aria-label={lo ? `ເບິ່ງໂປຣໄຟລ໌ ${c.name}` : `View ${c.name} profile`} className="flex items-center gap-2.5 min-w-0 text-left">{props.children}</button>
    : <div className="flex items-center gap-2.5 min-w-0">{props.children}</div>;
  return <Wrap>
    <span aria-hidden className="w-10 h-10 shrink-0 rounded-full bg-tint-purple-bg text-tint-purple-fg flex items-center justify-center font-bold">{Array.from(c.name.replace(/^[^\p{L}\p{N}]+/u, ""))[0]?.toUpperCase() || "S"}</span>
    <span className="min-w-0">
      <span className="flex items-center gap-1 font-bold text-[15px] leading-tight font-[BoonHome,sans-serif]"><span className="truncate">{c.name}</span>{verified && <BadgeCheck size={15} aria-label={lo ? "ແຫຼ່ງຂ່າວທີ່ຢືນຢັນແລ້ວ" : "Verified source"} className="shrink-0 text-success" />}</span>
      <span className="block text-xs text-text-muted truncate">{[c.platform ? (lo ? `ຜ່ານ ${c.platform}` : `via ${c.platform}`) : "", date].filter(Boolean).join(" · ") || (lo ? "ແຫຼ່ງຕົ້ນສະບັບ" : "Original source")}</span>
    </span>
  </Wrap>;
}

function CuratedCard({ post: p, lang, onOpen }: { post: CuratedPost; lang: Lang; onOpen: () => void }) {
  const lo = lang === "lo";
  const title = lo ? p.title_lo : p.title_en, summary = lo ? p.summary_lo : p.summary_en, warning = lo ? p.warning_lo : p.warning_en;
  const mod = useModNote(p, lang), st = STATUS[mod.status];
  const pill = "rounded-full bg-[#F3F0FC] text-[#5B21D1] px-2.5 py-0.5 text-[11px] font-bold";
  const more = <span className="mt-1.5 inline-block text-[14px] font-bold text-[#5F6390]">{lo ? "ອ່ານຕໍ່ໃນ Sati" : "Read in Sati"} →</span>;
  const chips = <span className="flex items-center gap-1.5 shrink-0">{p.pinned && <Pin size={12} aria-label={lo ? "ປັກໝຸດ" : "Pinned"} className="text-[#5B21D1]" />}{p.expired && <span className="rounded-full bg-warning-bg text-warning-text px-2 py-0.5 text-[11px] font-bold">{lo ? "ສິ້ນສຸດແລ້ວ" : "Ended"}</span>}<span className={pill}>{lo ? TYPE_LABEL[p.type].lo : TYPE_LABEL[p.type].en}</span><span className={`flex items-center gap-1 h-[22px] px-2 rounded-full text-[11px] font-bold ${st.cls}`}><span className="w-1.5 h-1.5 rounded-full" style={{ background: st.dot }} />{st[lang]}</span></span>;
  return <article className="p-3.5 rounded-[18px] bg-white border border-[#ECECF4] shadow-[0_1px_2px_rgba(20,17,43,0.04)]">
    <div className="flex items-start gap-2"><div className="flex-1 min-w-0"><CreditLine post={p} lang={lang} /></div>{chips}</div>
    {p.video ? <>
      <button type="button" onClick={onOpen} className="block w-full text-left mt-3"><h3 className="text-[15px] font-bold leading-[1.45]">{title}</h3></button>
      <div className="mt-2.5"><VideoPlayer url={p.video.url} embedUrl={p.video.embed_url} poster={p.video.poster} title={title} lang={lang} sourceName={creditOf(p, lang).name} contentWarning={p.content_warning} /></div>
      <button type="button" onClick={onOpen} className="block text-left">{more}</button>
    </> : p.image ? <>
      <button type="button" onClick={onOpen} className="block w-full text-left mt-3"><h3 className="text-[16px] font-bold leading-[1.45]">{title}</h3><p className="mt-1.5 text-[15px] leading-[1.75] text-[#3F4268] line-clamp-4">{summary}</p>{more}</button>
      {/* Same as normal posts: media below the text, full card width on light grey, tall images capped and shown whole in the reader. */}
      <button type="button" onClick={onOpen} aria-label={title} className="block -mx-3.5 mt-3 w-[calc(100%+28px)] bg-[#F1F1F6]"><img src={p.image} alt="" loading="lazy" className="block mx-auto max-w-full max-h-[500px] object-cover object-top" /></button>
    </> : <button type="button" onClick={onOpen} className="block w-full text-left mt-3"><h3 className="text-[15px] font-bold leading-[1.4]">{title}</h3><p className="mt-1.5 text-[15px] leading-[1.75] text-[#3F4268] line-clamp-3">{summary}</p>{more}</button>}
    {mod.status === "check" && <ul aria-label={lo ? "ເຫດຜົນ" : "Why"} className="mt-3 rounded-xl bg-[#FFFBEB] border border-[#FCE7C3] p-3 flex flex-col gap-1.5 text-[14px] leading-[1.6] text-[#92400E]">{mod.notes.map(n => <li key={n} className="flex gap-1.5"><TriangleAlert size={14} aria-hidden className="shrink-0 mt-0.5" />{n}</li>)}</ul>}
    {warning && <p role="note" className="mt-3 rounded-xl bg-warning-bg border border-warning-border text-warning-text p-2.5 text-[13px] flex gap-2"><TriangleAlert size={16} aria-hidden className="shrink-0 mt-0.5 text-warning-icon" /><span className="line-clamp-3">{warning}</span></p>}
    {p.contact?.tel && <a href={`tel:${p.contact.tel.replace(/\s/g, "")}`} className="mt-3 inline-flex h-[38px] rounded-[10px] bg-[#14112B] text-white px-3.5 items-center gap-1.5 text-[13px] font-bold"><Phone size={14} aria-hidden />{lo ? "ໂທ" : "Call"} {p.contact.tel}</a>}
  </article>; // REVIEW-LO
}

// Long Lao text with no line breaks: one paragraph per sentence, so it reads in short blocks instead of a dense wall.
const paras = (t: string) => /[\u0E80-\u0EFF]/.test(t) && !t.includes("\n") ? t.replace(/([.!?;])\s+(?=\S)/g, "$1\n\n") : t;
const linkify = (text: string) => text.split(/(https?:\/\/[^\s]+)/g).map((part, i) => /^https?:\/\//.test(part)
  ? <button key={i} type="button" onClick={() => void openExternal(part)} className="text-primary-ink underline break-all text-left">{part}</button> : <span key={i}>{part}</span>);

// Reader: the whole post inside Sati, with credit and a link to the original. Portalled into the app shell so it covers the phone frame only.
function PostDetail({ post: p, lang, onClose }: { post: CuratedPost; lang: Lang; onClose: () => void }) {
  const lo = lang === "lo";
  const title = lo ? p.title_lo : p.title_en, summary = lo ? p.summary_lo : p.summary_en, warning = lo ? p.warning_lo : p.warning_en;
  const body = (lo ? p.body_lo : p.body_en) || summary, c = creditOf(p, lang), mod = useModNote(p, lang);
  const original = p.credit?.url || p.source_url || p.video?.url;
  useEffect(() => { const esc = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); }; document.addEventListener("keydown", esc); return () => document.removeEventListener("keydown", esc); }, [onClose]);
  const view = <div role="dialog" aria-modal="true" aria-label={title} className="absolute inset-0 z-50 bg-background flex flex-col">
    <div className="shrink-0 flex items-center gap-1 border-b border-border px-2 min-h-14">
      <button type="button" onClick={onClose} aria-label={lo ? "ກັບຄືນ" : "Back"} className="w-11 h-11 flex items-center justify-center rounded-full"><ChevronLeft size={26} aria-hidden /></button>
      <span className="font-bold truncate">{lo ? "ຂ່າວສານ" : "Posts"}</span>
    </div>
    <div className="flex-1 min-h-0 overflow-y-auto px-4 py-4 space-y-3 pb-24">
      <CreditLine post={p} lang={lang} onBeforeOpen={onClose} />
      <h2 className="text-xl font-bold leading-snug">{title}</h2>
      {p.video && <VideoPlayer url={p.video.url} embedUrl={p.video.embed_url} poster={p.video.poster} title={title} lang={lang} sourceName={c.name} contentWarning={p.content_warning} />}
      {!p.video && p.image && <img src={p.image} alt={title} className="w-full rounded-xl bg-muted" />}
      {mod.status === "check" && <ul className="rounded-xl bg-[#FFFBEB] border border-[#FCE7C3] p-3 flex flex-col gap-1.5 text-sm text-[#92400E]"><li className="font-bold">{lo ? "ກວດກ່ອນ: ພົບສັນຍານເຕືອນ" : "Check first: warning signs found"}</li>{mod.notes.map(n => <li key={n} className="flex gap-1.5"><TriangleAlert size={15} aria-hidden className="shrink-0 mt-0.5" />{n}</li>)}</ul>}
      {warning && <p role="note" className="rounded-xl bg-warning-bg border border-warning-border text-warning-text p-3 text-sm flex gap-2"><TriangleAlert size={18} aria-hidden className="shrink-0 mt-0.5 text-warning-icon" />{warning}</p>}
      <div className="text-[16px] leading-[1.85] whitespace-pre-line ">{linkify(paras(body))}</div>
      {p.contact?.tel && <a href={`tel:${p.contact.tel.replace(/\s/g, "")}`} className="inline-flex min-h-11 rounded-full bg-[#22C55E] text-white font-bold text-sm px-4 items-center gap-2"><Phone size={16} aria-hidden />{lo ? "ໂທ" : "Call"} {p.contact.tel}</a>}
      <p className="rounded-xl bg-[#F7F7FA] p-3 text-[14px] leading-[1.75] text-[#5F6390]"><b className="block text-[#14112B]">{lo ? "ເຄຣດິດ" : "Credit"}: {c.name}{c.platform ? ` (${c.platform})` : ""}</b>{lo ? "ເນື້ອຫາເປັນຂອງຜູ້ໂພສຕົ້ນສະບັບ. ບາງໂພສສະແດງແຕ່ຕົວຢ່າງຂໍ້ຄວາມ; ອ່ານຄົບຖ້ວນຢູ່ຕົ້ນສະບັບ." : "Content belongs to the original poster. Some posts show only a preview of the text; read the full post at the original."}</p>
      {original && <button type="button" onClick={() => void openExternal(original)} className="min-h-11 w-full rounded-full border border-border font-bold text-sm flex items-center justify-center gap-2"><ExternalLink size={16} aria-hidden />{lo ? `ເປີດຕົ້ນສະບັບຢູ່ ${c.platform || c.name}` : `Open original${c.platform ? ` on ${c.platform}` : ""}`}</button>}
    </div>
  </div>;
  const shell = document.querySelector(".app-shell");
  return shell ? createPortal(view, shell) : view;
}
