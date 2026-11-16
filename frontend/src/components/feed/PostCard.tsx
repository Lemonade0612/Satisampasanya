import {PeoplePanel,type PeopleTarget} from './PeoplePanel';
import { PostScreening } from "./PostScreening";
import { riskLevel, YellowBanner, RedOverlay, ReportButton } from "./RiskFlag";
import { StatusPill, STATUS, statusOf } from "./colorCode";
import { openProfile } from "../../lib/profileNav";
import { BadgeCheck } from "lucide-react";
import { PosterCarousel, VideoBlock, LinkCard, SourceLink, TipList, listItems, mediaOf, sourceOf, typeOf } from "./PostMedia";
import { request } from "../../lib/api";
import { flagReasons } from "../../lib/flagReasons";
import { T } from "../../lib/translations";
import { Tr } from "../../lib/useTranslated";
import { useEffect, useState } from "react";
import { Pin, Clock, AlertOctagon, AlertTriangle, Check, Play, Link2, ExternalLink, Zap, TrendingUp, Heart, MessageCircle, Repeat2, ShieldCheck, Share2, Shield, Ellipsis } from "lucide-react";
import { LeafMark } from "@/components/ui/LeafMark";
import { postText } from "../../lib/band";
import { postRisk, scamTypeLabel, checkLabel, tagLabel, reasonNote } from "../../lib/scamTypes";
import type { Post, Lang, LeafState } from "../../types";

let autoTranslations = 40;

// compact (the Youth feed): name + time, risk pill, text, a translate link only for non-Lao posts, and the action row.
// readOnly (the Kids feed): no comments, reposts, shares or stranger profiles; Kids get gentle text when a post has it.
export function PostCard({ post, lang, onOpenComments, onLike, onWarnedMe, onRepostClick, onImageExpand, onTopicClick, following, onFollow, readOnly = false, compact = false, canReport = false }: {
  canReport?:boolean; following?:boolean; onFollow?:(id:string)=>void; readOnly?:boolean; compact?:boolean;
  post: Post; lang: Lang; onOpenComments: (id: string) => void;
  onLike: (id: string) => void; onRepost: (id: string) => void; onWarnedMe: (id: string) => void;
  onRepostClick: (post: Post) => void; onImageExpand?: (url: string) => void; onTopicClick?: (topic: string) => void;
}) {
  const t = T[lang];
  const [peopleTarget,setPeopleTarget]=useState<PeopleTarget|null>(null);
  const [translating,setTranslating]=useState(false);
  const [translationError,setTranslationError]=useState('');
  const [shareError,setShareError]=useState('');
  const [translatedContent,setTranslatedContent]=useState<string|null>(null);
  const liked = !!post.liked;
  const warned = !!post.warned;
  const [showFull, setShowFull] = useState(false);
  // The post shows in its own language; one pill switches it to the app language's translation and back.
  const loPost = post.contentLanguage === "lo";
  const original = loPost ? post.contentLo || post.content : post.content;
  const stored = lang === "lo" ? (loPost ? undefined : post.contentLo) : (loPost ? post.translationText : undefined);
  const needsAlt = !post.repostOf && !readOnly && (lang === "lo" ? !loPost : loPost);
  const [showAlt, setShowAlt] = useState(false);
  const alt = stored || translatedContent;
  const rawContent = readOnly ? postText(post, lang, "kids") || original : (showAlt && alt) || original;
  // Long Lao text without line breaks reads as a wall: start a new paragraph after each sentence.
  const translated = !readOnly && showAlt && !!alt;
  // Long Lao text with no line breaks reads as a wall: break it after sentences. Translations keep the original's shape.
  const content = !translated && rawContent.length > 220 && /[\u0E80-\u0EFF]/.test(rawContent) && !rawContent.includes("\n") ? rawContent.replace(/([.!?])\s+(?=\S)/g, "$1\n\n") : rawContent;
  useEffect(() => { setTranslatedContent(null); setShowAlt(false); }, [lang]);
  const [card, setCard] = useState<HTMLElement | null>(null);
  useEffect(() => {
    if (!needsAlt || alt || !card || autoTranslations <= 0) return;
    let alive = true;
    // Only cards actually on screen, and only a few per session: translation shares the sign-in rate limit.
    const seen = new IntersectionObserver(entries => {
      if (!entries.some(e => e.isIntersecting) || autoTranslations <= 0) return;
      seen.disconnect(); autoTranslations--;
      request<Post>(`/posts/${post.id}/translate`, 'POST', {}).then(result => { if (alive) setTranslatedContent((loPost ? result.translationText : result.contentLo) || null); }).catch(() => { /* the pill below stays as a fallback */ });
    });
    seen.observe(card);
    return () => { alive = false; seen.disconnect(); };
  }, [needsAlt, lang, post.id, card, !!alt]);
  const toggleAlt = async () => {
    if (showAlt) { setShowAlt(false); return; }
    if (!alt) {
      setTranslating(true); setTranslationError('');
      try { const result = await request<Post>(`/posts/${post.id}/translate`, 'POST', {}); setTranslatedContent((loPost ? result.translationText : result.contentLo) || null); }
      catch (e) { setTranslationError((e as Error).message); setTranslating(false); return; }
      setTranslating(false);
    }
    setShowAlt(true);
  };
  const [why, setWhy] = useState(false);
  const kind = typeOf(post), media = mediaOf(post), source = sourceOf(post);
  const tips = kind === "poster" && !translated ? listItems(rawContent) : { intro: "", items: [] as string[] };
  const asList = tips.items.length >= 3;
  const titleText = (post as Post & { title?: string; titleLo?: string });
  const title = (lang === "lo" || (loPost && !translated) ? titleText.titleLo || titleText.title : titleText.title || titleText.titleLo) || "";
  const body = content;
  const isLong = !asList && (content.length > 160 || content.split("\n").length > 4);

  const getLeafState = (): LeafState => {
    if (post.state === "confirmed") return post.featuredPoints ? "featured" : "verified";
    if (post.state === "flagged" || post.state === "sla") return "pending";
    return "none";
  };

  // Text stored in both languages: the app language first, the other as fallback (<Tr> translates a fallback when it can).
  const pick = (en?: string, loText?: string) => (lang === "lo" ? loText || en : en || loText) || "";
  const getStateBanner = () => {
    if (post.state === "flagged") return (
      <div className="mb-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 p-3 flex gap-2.5">
        <Clock size={16} className="text-amber-500 shrink-0 mt-0.5" />
        <div>
          <p className="text-xs font-semibold text-amber-700 dark:text-amber-300">{t.banner_review_title}</p>
          <p className="text-[11px] text-amber-600 dark:text-amber-400 mt-0.5"><Tr lang={lang} text={pick(post.flagReason, post.flagReasonLo) || t.banner_review_body} /></p>
          {flagReasons(post, lang).length > 0 && <ul className="mt-1.5 flex flex-wrap gap-1.5">{flagReasons(post, lang).map(r => <li key={r} className="rounded-full bg-white/70 border border-amber-200 px-2 py-0.5 text-[11px] font-bold text-amber-700">{r}</li>)}</ul>}
        </div>
      </div>
    );
    if (post.state === "false") return (
      <div className="mb-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 p-3">
        <div className="flex gap-2.5 mb-1.5">
          <AlertOctagon size={16} className="text-red-500 shrink-0 mt-0.5" />
          <p className="text-xs font-semibold text-red-700 dark:text-red-300">{t.banner_false_title}</p>
        </div>
        {(post.correction || post.correctionLo) && <p className="text-[11px] text-red-600 dark:text-red-400 ml-6">{t.banner_correction}<Tr lang={lang} text={pick(post.correction, post.correctionLo)} /></p>}
      </div>
    );
    if (post.state === "sla") return (
      <div className="mb-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 p-3 flex gap-2.5">
        <AlertTriangle size={16} className="text-slate-500 shrink-0 mt-0.5" />
        <p className="text-[11px] text-slate-600 dark:text-slate-400">{t.banner_sla}</p>
      </div>
    );
    if (post.state === "confirmed") return (
      <div className="mb-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 p-3 flex gap-2.5">
        <Check size={16} className="text-emerald-500 shrink-0 mt-0.5" />
        <div>
          <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-300">{lang === "lo" ? "ກວດສອບແລ້ວ: ຢືນຢັນວ່າເປັນການຫຼອກລວງ" : "Reviewed: scam confirmed"}</p>
          <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-0.5">{lang === "lo" ? "ຜູ້ກວດສອບຢືນຢັນແລ້ວວ່າເປັນການຫຼອກລວງ. ກະລຸນາອ່ານໝາຍເຫດຂອງການກວດສອບກ່ອນແບ່ງປັນ." : "A reviewer confirmed the reported scam. Read the review note before sharing."}</p>
        </div>
      </div>
    );
    return null;
  };


  const when = timeAgo(post.timestamp, lang);
  const firstTag = post.tags[0];
  const risk = postRisk(post);
  const verdict = post.check?.verdict;
  const sv = statusOf(post);
  const risky = verdict ? verdict !== "approved" : sv === "warn" || sv === "check" || risk === "red" || risk === "yellow";
  const safe = verdict ? verdict === "approved" : (sv === "safe" && !risky) || risk === "green" || (!!post.org?.verified && !risky);
  const chips = post.check?.labels?.length ? post.check.labels.slice(0, 3).map(l => checkLabel(l, lang)) : post.scamType ? [scamTypeLabel(post.scamType, lang)] : [];
  const lo = lang === "lo";
  const abtn = "disabled:opacity-40 flex items-center gap-1.5 h-10 px-1.5 text-[15px]";
  const share = async () => { setShareError('');try{const checked=await request<Post>(`/posts/${post.id}/share`,'POST',{});const value={title:checked.author.name,text:content,...(checked.link?{url:checked.link}:{})};if(navigator.share){await navigator.share(value);await request(`/posts/${post.id}/share`,'POST',{completed:true});}else if(navigator.clipboard)await navigator.clipboard.writeText(content+(checked.link?'\n'+checked.link:''));}catch(error){if((error as Error).name!=='AbortError')setShareError((error as Error).message);} };
  const [menu, setMenu] = useState(false);
  // Organisations open their organisation page; members open their public profile (by @handle).
  const profileTarget = post.org ? { kind: "org" as const, slug: post.org.slug } : post.author.handle ? { kind: "user" as const, handle: post.author.handle } : null;
  const openAuthor = () => { if (profileTarget) openProfile(profileTarget); };
  const canMenu = !!onFollow && !!post.author.id;

  return (
    <article ref={setCard} className="bg-white border border-[#ECECF4] p-4 rounded-[20px] overflow-hidden">
      <div>
      {post.repostOf&&<p className="mb-2.5 inline-flex max-w-full items-center gap-2 rounded-full bg-[#F1ECFE] border border-[#DDD3FB] pl-1 pr-3 py-1 text-[13px] text-[#5B21D1]"><span aria-hidden className="flex shrink-0 w-6 h-6 rounded-full bg-[#5B21D1] text-white items-center justify-center"><Repeat2 size={14} strokeWidth={2.5}/></span><b className="font-extrabold text-[#14112B] truncate font-[BoonHome,sans-serif]">{post.author.name}</b><span className="font-bold whitespace-nowrap">{lo?'ແບ່ງປັນຕໍ່':'reposted'}</span></p>}
      {!compact && !post.check && !post.seed && !post.isDemo && getStateBanner()}
      <div className="flex gap-2.5 items-center relative">
        <button type="button" tabIndex={-1} aria-hidden={!profileTarget} onClick={openAuthor} className="w-10 h-10 shrink-0 rounded-full overflow-hidden flex items-center justify-center text-white text-sm font-bold" style={{ background: post.author.color }}>{post.org?.logoUrl ? <img src={post.org.logoUrl} alt="" className="w-full h-full object-cover" /> : post.author.initials}</button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <button type="button" onClick={openAuthor} className="font-bold text-[16px] text-[#14112B] text-left min-h-11 -my-2 font-[BoonHome,sans-serif] break-words max-w-full">{post.org ? (lang === "lo" ? post.org.nameLo : post.org.nameEn) : post.author.name}</button>{post.org?.verified && <span role="img" aria-label={lo ? "ຢືນຢັນແລ້ວ" : "Verified"} className="text-[#2563EB]"><BadgeCheck size={16} aria-hidden /></span>}
            <LeafMark state={getLeafState()} size={14} />
            {post.isNews && <span className="text-xs font-bold px-1.5 py-0.5 rounded bg-surface-2 text-primary">{t.news_label}</span>}
            {post.country && <span className="text-xs font-bold px-1.5 py-0.5 rounded bg-surface-2 text-text">{countryLabel(post.country, lang)}</span>}
          </div>
          <p className="text-[13px] text-[#5F6390] leading-snug">{when}{firstTag ? <> · <button type="button" onClick={()=>onTopicClick?.(firstTag)} className="text-[12px] text-[#5F6390]">#{tagLabel(firstTag, lang)}</button></> : null}</p>
        </div>
        <StatusPill post={post} lang={lang} />
        {canMenu && <button type="button" aria-label={lo?'ຕົວເລືອກເພີ່ມເຕີມ':'More options'} aria-expanded={menu} onClick={()=>setMenu(v=>!v)} className="min-h-11 min-w-11 -mr-2 flex items-center justify-center rounded-full text-text-2"><Ellipsis size={22} aria-hidden/></button>}
        {menu && canMenu && <div className="absolute right-0 top-11 z-10 rounded-xl border border-border bg-background shadow-[var(--shadow-soft)]"><button type="button" onClick={()=>{setMenu(false);onFollow!(post.author.id!);}} className="min-h-11 px-4 text-sm font-bold text-text whitespace-nowrap">{lo?(following?"ເຊົາຕິດຕາມ":"ຕິດຕາມ"):(following?"Unfollow":"Follow")}</button></div>}
      </div>
      {post.example && <ExampleBadge status={post.exampleStatus} lang={lang} />}
      <div className="mt-2 flex items-center gap-2 flex-wrap">{post.pinned && <span className="inline-flex items-center gap-1 text-[13px] font-bold text-text-muted"><Pin size={13} aria-hidden />{lo ? "ປັກໝຸດ" : "Pinned"}</span>}</div>
      {!(risky || safe) && <RedOverlay post={post} lang={lang} />}
      {(!post.repostOf||post.repostText)&&(asList ? <TipList intro={tips.intro} items={tips.items} lang={lang} /> : <div className="mt-2.5">{title && <p className="text-[16px] font-bold leading-[1.5] text-[#14112B] text-left [overflow-wrap:anywhere] font-[BoonHome,sans-serif]">{title}</p>}<p className={`text-[15px] leading-[1.7] text-[#14112B] text-left whitespace-pre-wrap [overflow-wrap:anywhere] font-[BoonHome,sans-serif] ${title ? "mt-[6px]" : ""} ${!showFull ? "line-clamp-3" : ""}`}>{body}</p></div>)}
      {!(risky || safe) && <YellowBanner post={post} lang={lang} />}
      {((isLong || body.split("\n").length > 3) && !showFull) || needsAlt ? <div className="mt-[2px] flex items-center gap-4">
      {(isLong || body.split("\n").length > 3) && !showFull && <button type="button" onClick={() => setShowFull(true)} className="relative text-[14px] font-bold text-[#5B21D1] before:absolute before:-inset-y-3 before:-inset-x-1 before:content-['']">{lo ? "ອ່ານຕໍ່" : "Read more"}</button>}
      {needsAlt && <button type="button" disabled={translating} onClick={()=>void toggleAlt()} className="relative text-[14px] font-bold text-text-muted disabled:opacity-60 before:absolute before:-inset-y-3 before:-inset-x-1 before:content-['']">{translating?(lo?'ກຳລັງແປ…':'Translating…'):showAlt?(lo?'ເບິ່ງຕົ້ນສະບັບ':'See original'):(lo?'ເບິ່ງຄຳແປ':'See translation')}</button>}</div> : null}
      {translationError && <p role="alert" className="text-[13px] text-danger">{translationError}</p>}
      {post.originalPost&&<div className="mt-3 rounded-2xl border border-border p-3"><button type="button" className="font-bold min-h-11" onClick={()=>post.originalPost?.author.id&&setPeopleTarget({kind:"person",id:post.originalPost.author.id})}>{post.originalPost.author.name}</button><span className="ml-2 text-[13px] text-text-muted">{post.originalPost.author.handle}</span><p className="mt-1 text-base whitespace-pre-wrap">{post.originalPost.contentLanguage==='lo'?(post.originalPost.contentLo||post.originalPost.content):post.originalPost.content}</p></div>}
      </div>
      {kind !== "text" && <div className="-mx-4 my-3 [&>*]:!mt-0">
      {kind === "poster" && media.length > 0 && <PosterCarousel items={media.filter(m => m.kind === "image")} lang={lang} />}
      {kind === "video" && media.find(m => m.kind === "video") && <VideoBlock item={media.find(m => m.kind === "video")!} title={content.split("\n")[0].slice(0, 120)} lang={lang} />}
      {kind === "link" && source && <LinkCard url={source} thumb={media.find(m => m.kind === "image")?.url} title={content.split("\n")[0].slice(0, 140)} lang={lang} />}
      </div>}
      <div>
      {source && kind !== "link" && <SourceLink url={source} lang={lang} />}
      {(risky || safe) && (() => { const k = statusOf(post), st = STATUS[k], note = safe ? (lo ? "Sati ກວດສອບໂພສນີ້ແລ້ວ" : "Sati checked this post") : (lo ? (/[\u0E80-\u0EFF]/.test(post.screening?.noteLo || "") ? post.screening?.noteLo : null) : post.screening?.note) || reasonNote(post.check?.labels, lang) || (lo ? st.loWhy : st.enWhy); return (
        <p role={k === "warn" ? "alert" : undefined} className="mt-3 flex items-start gap-1.5 border-l-[3px] pl-2 text-[13px] leading-[1.5] text-[#3F4268] [overflow-wrap:anywhere]" style={{ borderColor: st.dot }}>
          <Shield size={14} aria-hidden className="shrink-0 mt-[3px]" style={{ color: st.dot }} /><span><b>Sati:</b> <Tr lang={lang} text={note || ""} /></span>
        </p>); })()}
      {!risky && !safe && !compact && <PostScreening post={post} lang={lang}/>}
      {post.points !== undefined && post.state === "confirmed" && (
        <div className="flex items-center gap-3 mt-2 text-[13px] text-text-muted">
          <span className="flex items-center gap-1 text-success"><Zap size={12} aria-hidden /> {post.points} {t.verified_pts}</span>
          {post.featuredPoints && <span className="flex items-center gap-1 text-text-2"><TrendingUp size={12} aria-hidden /> {t.featured_bonus}</span>}
        </div>
      )}
      {shareError&&<p role="alert" className="text-sm text-danger">{shareError}</p>}
      </div>
      <div className="flex justify-around items-center -mb-2 mt-2 text-[#5F6390]">
        <button type="button" disabled={post.frozen} aria-pressed={liked} aria-label={lo?'ມັກ':'Like'} onClick={() => onLike(post.id)} className={`${abtn} ${liked?'text-[#E11D48]':''}`}><Heart size={18} aria-hidden fill={liked?'currentColor':'none'} /><span className="font-[BoonHome,sans-serif]">{post.likes}</span></button>
        {!readOnly&&<button type="button" disabled={post.frozen} aria-label={lo?'ຄຳເຫັນ':'Comment'} onClick={() => onOpenComments(post.id)} className={abtn}><MessageCircle size={18} aria-hidden /><span className="font-[BoonHome,sans-serif]">{post.comments}</span></button>}
        <button type="button" disabled={post.frozen} aria-pressed={warned} onClick={() => onWarnedMe(post.id)} className={`${abtn} ${warned?'text-[#5B21D1] font-bold':''}`}>{warned?<ShieldCheck size={18} aria-hidden />:<Shield size={18} aria-hidden />}{lo?'ມີປະໂຫຍດ':'Helpful'} {post.communityRanking?.eligible ? post.communityRanking.score : post.warnedMe}</button>
        {!readOnly&&<button type="button" disabled={post.frozen} aria-label={lo?'ແບ່ງປັນ':'Share'} onClick={() => void share()} className={abtn}><Share2 size={18} aria-hidden /></button>}
        {canReport&&<ReportButton post={post} lang={lang} />}
      </div>
      {!readOnly && !!post.interactionPeople?.length && (() => { const ppl = post.interactionPeople!, [a, b] = ppl[0].name.split(" "), first = b ? `${a} ${b[0]}.` : a, more = Math.max(post.comments, ppl.length) - 1; return (
        <button type="button" onClick={()=>setPeopleTarget({kind:'activity',id:post.id})} className="mt-2 pt-3 w-full border-t border-[#F0EFF6] flex items-center gap-2 text-left min-w-0">
          <span className="flex -space-x-2 shrink-0">{ppl.slice(0,3).map(p=><span key={p.id} aria-hidden className="w-6 h-6 rounded-full border-2 border-white flex items-center justify-center text-white text-[10px]" style={{background:p.color}}>{p.initials}</span>)}</span>
          <span className="min-w-0 truncate text-[13px] text-[#5F6390]">{more > 0 ? (lo ? `${first} ແລະ ອີກ ${more} ຄົນ ສະແດງຄວາມຄິດເຫັນ` : `${first} and ${more} others commented`) : (lo ? `${first} ສະແດງຄວາມຄິດເຫັນ` : `${first} commented`)}</span>
        </button>); })()}
      {peopleTarget&&<PeoplePanel target={peopleTarget} lang={lang} onClose={()=>setPeopleTarget(null)} onOpenPost={onOpenComments}/>}
    </article>
  );
}

// "2h" / "3d" / "30m" -> "2 ຊົ່ວໂມງກ່ອນ" (written out in full).
function timeAgo(ts: string, lang: Lang) {
  const lo = lang === "lo";
  if (ts === "Just now") return lo ? "ດຽວນີ້" : "Just now";
  const m = /^(\d+)\s*(m|h|d|w)/i.exec(ts);
  if (!m) return ts;
  const n = m[1], u = m[2].toLowerCase();
  const names = { m: ["ນາທີ", "min"], h: ["ຊົ່ວໂມງ", "h"], d: ["ມື້", "d"], w: ["ອາທິດ", "w"] }[u as "m" | "h" | "d" | "w"];
  return lo ? `${n} ${u === "h" ? "ຊມ" : names[0]}` : `${n}${names[1]} ago`;
}

// ASEAN country chip on youth posts. Flags are emoji, so they need no image files.
const COUNTRIES: Record<string, { flag: string; en: string; lo: string }> = {
  LA: { flag: "🇱🇦", en: "Laos", lo: "ລາວ" }, TH: { flag: "🇹🇭", en: "Thailand", lo: "ໄທ" }, VN: { flag: "🇻🇳", en: "Vietnam", lo: "ຫວຽດນາມ" },
  PH: { flag: "🇵🇭", en: "Philippines", lo: "ຟີລິບປິນ" }, KH: { flag: "🇰🇭", en: "Cambodia", lo: "ກຳປູເຈຍ" }, MM: { flag: "🇲🇲", en: "Myanmar", lo: "ມຽນມາ" },
};
export const countryLabel = (code: string, lang: Lang) => { const c = COUNTRIES[code]; return c ? `${c.flag} ${c[lang]}` : code; };

// "Example" label on seed teaching posts, coloured like the risk legend (green / yellow / red).
function ExampleBadge({ status, lang }: { status?: "green" | "yellow" | "red"; lang: Lang }) {
  const lo = lang === "lo";
  const look = status === "red" ? { cls: "text-danger bg-danger-bg", text: lo ? "ຕົວຢ່າງ · ການຫຼອກລວງ" : "Example · Scam" }
    : status === "yellow" ? { cls: "text-warning-text bg-warning-bg", text: lo ? "ຕົວຢ່າງ · ໜ້າສົງໄສ" : "Example · Suspicious" }
    : { cls: "text-success bg-success-bg", text: lo ? "ຕົວຢ່າງ · ປອດໄພ" : "Example · Safe" }; // REVIEW-LO
  return <p className="mt-1"><span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-bold ${look.cls}`}><span aria-hidden="true">● </span>{look.text}</span></p>;
}
