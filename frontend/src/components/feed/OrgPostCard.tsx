import { useState } from "react";
import { ChevronLeft, ChevronRight, Landmark, Phone, Play, Share2 } from "lucide-react";
import { openProfile } from "../../lib/profileNav";
import { tagLabel } from "../../lib/scamTypes";
import { Lightbox, VideoBlock, listItems, mediaOf, sourceOf, typeOf } from "./PostMedia";
import { STATUS, statusOf } from "./colorCode";
import type { Lang, Post } from "../../types";

// Organisation posts (design: FeedOrgs.html / HomeV2.html pinned card). Three layouts: a photo carousel with numbered tips,
// a compact poster with a thumbnail, and a compact video/link block. Every card starts with the org avatar, name + verified badge,
// a type · date · source line and the Sati status pill.
const TYPE_LABEL: Record<string, [string, string]> = { gov: ["ພາກລັດ", "Government"], ngo: ["ສະມາຄົມ", "Association"], intl: ["ອົງການສາກົນ", "International organisation"], media: ["ສື່ມວນຊົນ", "Media"] };
const Verified = ({ size = 14, label }: { size?: number; label: string }) => <svg width={size} height={size} viewBox="0 0 24 24" role="img" aria-label={label} className="shrink-0"><circle cx="12" cy="12" r="10" fill="#2563EB" /><path d="m8 12 3 3 5-6" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /></svg>;
const fromFacebook = (p: Post) => /facebook\.com|fb\.watch/.test(sourceOf(p) || "");
const when = (ts: string, lang: Lang) => {
  const m = /^(\d+)\s*(m|h|d|w)/i.exec(ts); if (!m) return ts;
  const u = ({ m: ["ນາທີ", "min"], h: ["ຊົ່ວໂມງ", "h"], d: ["ມື້", "d"], w: ["ອາທິດ", "w"] } as Record<string, [string, string]>)[m[2].toLowerCase()];
  return lang === "lo" ? `${m[1]} ${m[2].toLowerCase() === "h" ? "ຊມ" : u[0]}` : `${m[1]}${u[1]} ago`;
};
const COLORS = ["#1CABE2", "#7C3AED", "#1E3A8A", "#0E7FB8", "#5B21D1"];

export function OrgPostCard({ post, lang, onOpenComments }: { post: Post; lang: Lang; onOpenComments?: (id: string) => void }) {
  const lo = lang === "lo", org = post.org!, kind = typeOf(post), media = mediaOf(post), source = sourceOf(post);
  const [more, setMore] = useState(false), [i, setI] = useState(0), [lb, setLb] = useState<number | null>(null);
  const st = STATUS[statusOf(post)];
  const name = lo ? org.nameLo : org.nameEn;
  const content = (lo ? post.contentLo : undefined) || post.content || "";
  const lines = content.split(/\n+/).map(l => l.trim()).filter(Boolean);
  const color = post.author.color || COLORS[org.slug.length % COLORS.length];
  const notice = kind === "text" && !!post.pinned;
  const open = () => openProfile({ kind: "org", slug: org.slug });
  const share = async () => { try { const v = { title: name, text: content, ...(source ? { url: source } : {}) }; if (navigator.share) await navigator.share(v); else await navigator.clipboard?.writeText(content + (source ? "\n" + source : "")); } catch { /* cancelled */ } };
  const meta = (notice ? [lo ? "ປັກໝຸດ" : "Pinned", lo ? "ແຈ້ງການທາງການ" : "Official notice"] : [lo ? TYPE_LABEL[org.type]?.[0] : TYPE_LABEL[org.type]?.[1], when(post.timestamp, lang), fromFacebook(post) ? (lo ? "ຈາກ Facebook" : "from Facebook") : null]).filter(Boolean).join(" · ");
  const initial = (org.nameEn || name).slice(0, 1).toUpperCase();

  const header = <div className="flex items-center gap-2.5">
    <button type="button" onClick={open} aria-label={lo ? `ເບິ່ງໂປຣໄຟລ໌ ${name}` : `View ${name} profile`} className={`flex shrink-0 w-10 h-10 overflow-hidden items-center justify-center ${notice ? "rounded-xl bg-[#EFF6FF] text-[#2563EB]" : "rounded-full text-white text-[13px] font-extrabold font-[Inter,sans-serif]"}`} style={notice ? undefined : { background: color }}>
      {notice ? <Landmark size={20} aria-hidden /> : org.logoUrl ? <img src={org.logoUrl} alt="" className="w-full h-full object-cover" /> : initial}
    </button>
    <button type="button" onClick={open} className="flex-1 min-w-0 text-left">
      <span className="flex items-center gap-1 text-[14px] font-bold font-[Inter,BoonHome,sans-serif]"><span className="truncate">{name}</span>{org.verified && <Verified label={lo ? "ຢືນຢັນແລ້ວ" : "Verified"} />}</span>
      <span className="block text-[12px] text-[#5F6390] truncate">{meta}</span>
    </button>
    {!notice && <span className="flex items-center gap-[5px] h-[26px] px-2.5 rounded-full text-[12px] font-bold shrink-0" style={{ background: st.tint, color: st.dot }}><span className="w-[7px] h-[7px] rounded-full" style={{ background: st.dot }} />{st[lang]}</span>}
  </div>;

  // ---- photo carousel with numbered tips
  if (kind === "poster" && media.filter(m => m.kind === "image").length > 1) {
    const imgs = media.filter(m => m.kind === "image");
    const { intro, items } = listItems(lines.slice(1).join("\n"));
    const tips = items.map(t => { const k = t.search(/\s[–—-]\s|:\s/); return k > 0 ? [t.slice(0, k), t.slice(k).replace(/^\s*[–—:-]\s*/, "")] : [t, ""]; });
    const shown = more ? tips : tips.slice(0, 2), extra = tips.length - 2;
    return <article className="rounded-[18px] bg-white border border-[#ECECF4] overflow-hidden">
      <div className="px-3.5 pt-3.5">
        {header}
        <p className="mt-3 mb-1 text-[16px] font-bold leading-[1.4]">{lines[0]}</p>
        {intro && <p className="mb-3 text-[14px] leading-[1.6] text-[#3F4268]">{intro}</p>}
        <ul className="flex flex-col gap-3">{shown.map(([t, d], k) => <li key={k} className="flex gap-3">
          <span className="flex shrink-0 w-[26px] h-[26px] rounded-lg bg-[#E0F2FE] text-[#0369A1] text-[13px] font-bold items-center justify-center font-[Inter,sans-serif]">{k + 1}</span>
          <span className="min-w-0"><span className="block text-[14px] font-bold leading-[1.45]">{t}</span>{d && <span className="block mt-0.5 text-[13px] leading-[1.6] text-[#5F6390]">{d}</span>}</span></li>)}</ul>
        {extra > 0 && <button type="button" onClick={() => setMore(v => !v)} className="py-2.5 pb-3 text-[13px] font-bold text-[#5B21D1]">{more ? (lo ? "ສະແດງໜ້ອຍລົງ" : "Show less") : (lo ? `ອ່ານອີກ ${extra} ວິທີ` : `Read ${extra} more`)}</button>}
      </div>
      <div className="relative bg-[#F1F1F6]">
        <button type="button" onClick={() => setLb(i)} aria-label={lo ? "ເປີດຮູບໃຫຍ່" : "Open large photo"} className="block w-full h-[364px] p-0 bg-[#F1F1F6]"><img src={imgs[i].url} alt={(lo ? imgs[i].caption_lo : imgs[i].caption_en) || ""} className="block w-full h-[364px] object-cover" /></button>
        <span className="absolute top-2.5 right-2.5 px-2.5 py-[3px] rounded-full bg-[rgba(20,17,43,0.65)] text-white text-[12px] font-semibold font-[Inter,sans-serif]">{i + 1} / {imgs.length}</span>
        {i > 0 && <button type="button" onClick={() => setI(i - 1)} aria-label={lo ? "ຮູບກ່ອນ" : "Previous photo"} className="absolute left-2 top-1/2 -mt-[18px] flex w-9 h-9 rounded-full bg-white/90 text-[#14112B] items-center justify-center shadow-[0_2px_8px_rgba(0,0,0,0.15)]"><ChevronLeft size={18} /></button>}
        {i < imgs.length - 1 && <button type="button" onClick={() => setI(i + 1)} aria-label={lo ? "ຮູບຕໍ່ໄປ" : "Next photo"} className="absolute right-2 top-1/2 -mt-[18px] flex w-9 h-9 rounded-full bg-white/90 text-[#14112B] items-center justify-center shadow-[0_2px_8px_rgba(0,0,0,0.15)]"><ChevronRight size={18} /></button>}
      </div>
      <div className="flex justify-center gap-[5px] pt-2.5 pb-0.5">{imgs.map((_, k) => <span key={k} className="h-1.5 rounded-full transition-all" style={{ width: k === i ? 18 : 6, background: k === i ? "#5B21D1" : "#D4D2E3" }} />)}</div>
      <div className="flex items-center gap-1 px-2 pt-1 pb-2 text-[#5F6390]">
        <button type="button" onClick={() => void share()} aria-label={lo ? "ແບ່ງປັນ" : "Share"} className="flex items-center h-9 px-2"><Share2 size={18} aria-hidden /></button>
        <span className="flex-1" />
        {onOpenComments && <button type="button" onClick={() => onOpenComments(post.id)} className="h-9 px-2 text-[12px] font-bold text-[#5B21D1]">{lo ? "ຄຳເຫັນ" : "Comments"} {post.comments || ""}</button>}
      </div>
      {lb !== null && <Lightbox items={imgs} start={lb} lang={lang} onClose={() => setLb(null)} />}
    </article>;
  }

  // ---- compact poster
  if (kind === "poster" && media.length) {
    const img = media.find(m => m.kind === "image")!;
    return <article className="p-3.5 rounded-[18px] bg-white border border-[#ECECF4]">
      {header}
      <div className="flex gap-3 mt-3">
        <button type="button" onClick={() => setLb(0)} aria-label={lo ? "ເບິ່ງໂປສເຕີເຕັມ" : "View full poster"} className="relative shrink-0 w-28 h-[140px] rounded-xl overflow-hidden bg-[#F1F1F6]">
          <img src={img.url} alt={(lo ? img.caption_lo : img.caption_en) || ""} className="w-full h-full object-cover" style={{ objectPosition: "70% 30%" }} />
          <span className="absolute left-1.5 right-1.5 bottom-1.5 py-[3px] rounded-lg bg-[rgba(20,17,43,0.7)] text-white text-[11px] font-bold text-center">{lo ? "ເບິ່ງໂປສເຕີ" : "View poster"}</span>
        </button>
        <div className="flex-1 min-w-0">
          {post.tags[0] && <span className="inline-block px-2 py-px mb-1 rounded-md bg-[#F3F0FC] text-[#5B21D1] text-[11px] font-bold">{tagLabel(post.tags[0], lang)}</span>}
          <p className="mb-1 text-[15px] font-bold leading-[1.4]">{lines[0]}</p>
          {lines.length > 1 && <p className="mb-2 text-[13px] leading-[1.5] text-[#3F4268] line-clamp-5">{lines.slice(1).join(" ")}</p>}
        </div>
      </div>
      {lb !== null && <Lightbox items={[img]} start={0} lang={lang} onClose={() => setLb(null)} />}
    </article>;
  }

  // ---- video / link: preview frame, play badge, then opens at the source (or plays inline when it is a direct file)
  if (kind === "video" || (kind === "link" && source)) {
    const vid = media.find(m => m.kind === "video");
    if (vid && !/facebook\.com|fb\.watch|youtu\.?be/.test(vid.url)) return <article className="rounded-[18px] bg-white border border-[#ECECF4] overflow-hidden"><div className="p-3.5 pb-0">{header}<p className="mt-3 text-[15px] font-bold leading-[1.45]">{lines[0]}</p></div><VideoBlock item={vid} title={lines[0] || ""} lang={lang} /><div className="h-3.5" /></article>;
    const thumb = media.find(m => m.kind === "image")?.url ?? vid?.thumb_url;
    const dur = vid?.duration ? `${Math.floor(vid.duration / 60)}:${String(Math.round(vid.duration % 60)).padStart(2, "0")}` : "";
    return <article className="p-3.5 rounded-[18px] bg-white border border-[#ECECF4]">
      {header}
      <p className="mt-3 mb-2.5 text-[15px] font-bold leading-[1.45]">{lines[0]}</p>
      <a href={source || vid?.url} target="_blank" rel="noopener noreferrer" aria-label={lo ? "ເປີດວິດີໂອ" : "Open video"} className="relative flex h-[200px] rounded-[14px] overflow-hidden items-center justify-center text-white" style={{ background: thumb ? `center/cover url(${thumb})` : "linear-gradient(135deg, #1E1B4B, #312E81 60%, #1D4ED8)" }}>
        {kind === "video" && <span className="flex w-14 h-14 rounded-full bg-black/55 items-center justify-center"><Play size={26} className="ml-1" fill="white" aria-hidden /></span>}
        <span className="absolute left-2.5 bottom-2.5 flex items-center gap-[5px] px-[9px] py-[3px] rounded-full bg-black/50 text-[11px] font-semibold">{kind === "video" ? (lo ? "ວິດີໂອ · " : "Video · ") : ""}{fromFacebook(post) ? (lo ? "ເປີດໃນ Facebook" : "Open on Facebook") : (lo ? "ເປີດລິ້ງ" : "Open link")}</span>
        {dur && <span className="absolute right-2.5 bottom-2.5 rounded-md bg-black/70 px-2 py-0.5 text-[12px] font-bold font-[Inter,sans-serif]">{dur}</span>}
      </a>
    </article>;
  }

  // ---- text (hotlines, notices): pinned-card layout from the Home design
  const phone = /(\+?856[\d\s-]{7,}|\b1[1-9]\d{2}\b)/.exec(content)?.[0]?.replace(/\s+/g, "");
  return <article className="p-3.5 rounded-[18px] bg-white border border-[#ECECF4]">
    {header}
    <p className="mt-3 mb-3 text-[14px] leading-[1.6] whitespace-pre-wrap break-words">{lines.join("\n")}</p>
    {(phone || source) && <div className="flex gap-2">
      {phone && <a href={`tel:${phone}`} className="flex items-center gap-1.5 h-[38px] px-3.5 rounded-[10px] bg-[#14112B] text-white text-[13px] font-bold"><Phone size={14} aria-hidden />{lo ? "ໂທ" : "Call"} {phone.replace(/^\+?856/, "+856 ")}</a>}
      {source && <a href={source} target="_blank" rel="noopener noreferrer" className="flex items-center h-[38px] px-3.5 rounded-[10px] border border-[#E6E6F0] text-[#14112B] text-[13px] font-semibold">{lo ? "ແຫຼ່ງທີ່ມາ" : "Source"}</a>}
    </div>}
  </article>;
}
