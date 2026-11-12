import {PeoplePanel,type PeopleTarget} from './PeoplePanel';
import {CommunityScore} from './CommunityScore';
import { PostScreening } from "./PostScreening";
import { request } from "../../lib/api";
import { T } from "../../lib/translations";
import { useEffect, useState } from "react";
import { Clock, AlertOctagon, AlertTriangle, Check, Play, Link2, ExternalLink, Zap, TrendingUp, Heart, MessageCircle, Repeat2, ShieldCheck, Share2, TriangleAlert, Shield, Ellipsis } from "lucide-react";
import { LeafMark } from "@/components/ui/LeafMark";
import { postText } from "../../lib/band";
import { postRisk, scamTypeLabel } from "../../lib/scamTypes";
import type { Post, Lang, LeafState } from "../../types";

let autoTranslations = 8;

// compact (the Youth feed): name + time, risk pill, text, a translate link only for non-Lao posts, and the action row.
// readOnly (the Kids feed): no comments, reposts, shares or stranger profiles; Kids get gentle text when a post has it.
export function PostCard({ post, lang, onOpenComments, onLike, onWarnedMe, onRepostClick, onImageExpand, onTopicClick, following, onFollow, readOnly = false, compact = false }: {
  following?:boolean; onFollow?:(id:string)=>void; readOnly?:boolean; compact?:boolean;
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
  const content = readOnly ? postText(post, lang, "kids") || original : (showAlt && alt) || original;
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
  const isLong = content.length > 200;
  const displayContent = showFull || !isLong ? content : content.slice(0, 200) + "...";

  const getLeafState = (): LeafState => {
    if (post.state === "confirmed") return post.featuredPoints ? "featured" : "verified";
    if (post.state === "flagged" || post.state === "sla") return "pending";
    return "none";
  };

  const getStateBanner = () => {
    if (post.state === "flagged") return (
      <div className="mb-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 p-3 flex gap-2.5">
        <Clock size={16} className="text-amber-500 shrink-0 mt-0.5" />
        <div>
          <p className="text-xs font-semibold text-amber-700 dark:text-amber-300">{t.banner_review_title}</p>
          <p className="text-[11px] text-amber-600 dark:text-amber-400 mt-0.5">{lang === "lo" && post.flagReasonLo ? post.flagReasonLo : post.flagReason}</p>
        </div>
      </div>
    );
    if (post.state === "false") return (
      <div className="mb-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 p-3">
        <div className="flex gap-2.5 mb-1.5">
          <AlertOctagon size={16} className="text-red-500 shrink-0 mt-0.5" />
          <p className="text-xs font-semibold text-red-700 dark:text-red-300">{t.banner_false_title}</p>
        </div>
        {(post.correction || post.correctionLo) && <p className="text-[11px] text-red-600 dark:text-red-400 ml-6">{t.banner_correction}{lang === "lo" && post.correctionLo ? post.correctionLo : post.correction}</p>}
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
          <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-300">Reviewed: scam confirmed</p>
          <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-0.5">A reviewer confirmed the reported scam. Read the review note before sharing.</p>
        </div>
      </div>
    );
    return null;
  };


  const when = timeAgo(post.timestamp, lang);
  const firstTag = post.tags[0];
  const risk = postRisk(post);
  const verdict = post.check?.verdict;
  const risky = verdict ? verdict !== "approved" : risk === "red" || risk === "yellow";
  const safe = verdict ? verdict === "approved" : risk === "green";
  const chips = post.check?.labels?.length ? post.check.labels.slice(0, 3) : post.scamType ? [scamTypeLabel(post.scamType, lang)] : [];
  const lo = lang === "lo";
  const act = "disabled:opacity-40 min-h-[58px] flex flex-col items-center justify-center gap-1 text-[13px] leading-tight";
  const share = async () => { setShareError('');try{const checked=await request<Post>(`/posts/${post.id}/share`,'POST',{});const value={title:checked.author.name,text:content,...(checked.link?{url:checked.link}:{})};if(navigator.share){await navigator.share(value);await request(`/posts/${post.id}/share`,'POST',{completed:true});}else if(navigator.clipboard)await navigator.clipboard.writeText(content+(checked.link?'\n'+checked.link:''));}catch(error){if((error as Error).name!=='AbortError')setShareError((error as Error).message);} };
  const [menu, setMenu] = useState(false);
  const canMenu = !!onFollow && !!post.author.id;

  return (
    <article ref={setCard} className="bg-background pt-4 rounded-2xl overflow-hidden">
      <div className="px-4">
      {post.repostOf&&<p className="mb-2 text-[13px] text-text-muted flex gap-2 items-center"><Repeat2 size={14} aria-hidden/>{post.author.name} · {lo?'ແຊຣ໌ໂພສ':'reposted'}</p>}
      {!compact && !post.check && !post.seed && !post.isDemo && getStateBanner()}
      <div className="flex gap-3 items-center relative">
        <div aria-hidden className="w-[42px] h-[42px] shrink-0 rounded-full flex items-center justify-center text-white text-sm font-bold" style={{ background: post.author.color }}>{post.author.initials}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <button type="button" onClick={()=>!readOnly&&post.author.id&&setPeopleTarget({kind:"person",id:post.author.id})} className="font-bold text-base text-text text-left">{post.author.name}</button>
            <LeafMark state={getLeafState()} size={14} />
            {post.isNews && <span className="text-xs font-bold px-1.5 py-0.5 rounded bg-surface-2 text-primary">{t.news_label}</span>}
            {post.country && <span className="text-xs font-bold px-1.5 py-0.5 rounded bg-surface-2 text-text">{countryLabel(post.country, lang)}</span>}
          </div>
          <p className="text-[13px] text-text-muted leading-snug">{when}{firstTag ? <> · <button type="button" onClick={()=>onTopicClick?.(firstTag)} className="text-text-muted">#{firstTag}</button></> : null}</p>
        </div>
        {canMenu && <button type="button" aria-label={lo?'ຕົວເລືອກເພີ່ມເຕີມ':'More options'} aria-expanded={menu} onClick={()=>setMenu(v=>!v)} className="min-h-11 min-w-11 -mr-2 flex items-center justify-center rounded-full text-text-2"><Ellipsis size={22} aria-hidden/></button>}
        {menu && canMenu && <div className="absolute right-0 top-11 z-10 rounded-xl border border-border bg-background shadow-[var(--shadow-soft)]"><button type="button" onClick={()=>{setMenu(false);onFollow!(post.author.id!);}} className="min-h-11 px-4 text-sm font-bold text-text whitespace-nowrap">{lo?(following?"ເຊົາຕິດຕາມ":"ຕິດຕາມ"):(following?"Unfollow":"Follow")}</button></div>}
      </div>
      {post.example && <ExampleBadge status={post.exampleStatus} lang={lang} />}
      {(!post.repostOf||post.repostText)&&<p className="text-[17px] text-text mt-3 whitespace-pre-wrap break-words">{displayContent}</p>}
      {isLong && <button type="button" onClick={() => setShowFull(v => !v)} className="min-h-11 text-[14px] font-bold text-text-muted">{showFull ? t.show_less : t.show_more}</button>}
      {needsAlt && <button type="button" disabled={translating} onClick={()=>void toggleAlt()} className="block min-h-11 text-[14px] font-bold text-text-muted disabled:opacity-60">{translating?(lo?'ກຳລັງແປ…':'Translating…'):showAlt?(lo?'ເບິ່ງຕົ້ນສະບັບ':'See original'):(lo?'ເບິ່ງຄຳແປ':'See translation')}</button>}
      {translationError && <p role="alert" className="text-[13px] text-danger">{translationError}</p>}
      {post.originalPost&&<div className="mt-3 rounded-2xl border border-border p-3"><button type="button" className="font-bold min-h-11" onClick={()=>post.originalPost?.author.id&&setPeopleTarget({kind:"person",id:post.originalPost.author.id})}>{post.originalPost.author.name}</button><span className="ml-2 text-[13px] text-text-muted">{post.originalPost.author.handle}</span><p className="mt-1 text-base whitespace-pre-wrap">{post.originalPost.contentLanguage==='lo'?(post.originalPost.contentLo||post.originalPost.content):post.originalPost.content}</p></div>}
      </div>
      {post.image && (
        <button type="button" aria-label={lo?'ເບິ່ງຮູບໃຫຍ່':'Expand image'} className="mt-3 block w-full relative" onClick={() => onImageExpand && onImageExpand(post.image!)}>
          <img src={post.image} alt="" className="w-full h-auto object-cover max-h-[420px]" />
          {post.hasVideo && <span className="absolute inset-0 flex items-center justify-center"><span className="w-14 h-14 rounded-full bg-black/50 flex items-center justify-center"><Play size={24} className="text-white ml-1" aria-hidden /></span></span>}
        </button>
      )}
      <div className="px-4">
      {post.link && (
        <a href={post.link} target="_blank" rel="noopener noreferrer" className="mt-3 flex items-center gap-2 min-h-11 rounded-xl border border-border bg-surface px-3 py-2">
          <Link2 size={14} className="text-text-muted shrink-0" aria-hidden />
          <span className="text-[13px] text-primary truncate flex-1">{post.link}</span>
          <ExternalLink size={12} className="text-text-muted shrink-0" aria-hidden />
        </a>
      )}
      {risky && (
        <div className="mt-3 rounded-2xl border border-warning-border bg-warning-bg p-3.5 text-warning-text">
          <div className="flex items-center gap-2.5">
            <span aria-hidden className="w-9 h-9 shrink-0 rounded-[10px] bg-warning-icon text-white flex items-center justify-center"><TriangleAlert size={20} /></span>
            <div className="min-w-0"><p className="font-bold text-base leading-snug">ອາດເປັນການຫຼອກລວງ</p><p className="text-[13px] leading-snug">Sati ກວດສອບໂພສນີ້ແລ້ວ</p></div>
          </div>
          {chips.length > 0 && <ul className="mt-2.5 flex flex-wrap gap-2">{chips.map(c => <li key={c} className="rounded-full border border-warning-border bg-background px-3 py-1 text-[13px] text-warning-text">{c}</li>)}</ul>}
          <button type="button" aria-expanded={why} onClick={() => setWhy(v => !v)} className="mt-2.5 w-full h-10 rounded-xl border border-warning-border bg-background text-sm font-bold text-warning-text">ເບິ່ງວ່າເປັນຫຍັງ ›</button>
          {why && <div className="text-text text-sm"><PostScreening post={post} lang={lang}/></div>}
        </div>
      )}
      {safe && (
        <p className="mt-3 text-sm font-bold text-success flex items-center gap-2"><ShieldCheck size={18} aria-hidden className="shrink-0" />Sati: ຄຳແນະນຳທີ່ປອດໄພ</p>
      )}
      {!risky && !safe && !compact && <PostScreening post={post} lang={lang}/>}
      <CommunityScore post={post} lang={lang}/>
      {post.points !== undefined && post.state === "confirmed" && (
        <div className="flex items-center gap-3 mt-2 text-[13px] text-text-muted">
          <span className="flex items-center gap-1 text-success"><Zap size={12} aria-hidden /> {post.points} {t.verified_pts}</span>
          {post.featuredPoints && <span className="flex items-center gap-1 text-text-2"><TrendingUp size={12} aria-hidden /> {t.featured_bonus}</span>}
        </div>
      )}
      {!readOnly&&!!post.interactionPeople?.length&&<button type="button" className="flex items-center gap-2 min-h-11 text-[13px] text-text-muted text-left" onClick={()=>setPeopleTarget({kind:'activity',id:post.id})}><span className="flex -space-x-2">{post.interactionPeople.map(person=><span key={person.id} aria-hidden className="w-6 h-6 rounded-full border-2 border-background flex items-center justify-center text-white text-xs" style={{background:person.color}}>{person.initials}</span>)}</span><span>{post.interactionPeople.map(p=>p.name).join(', ')} · {lo?'ເບິ່ງຜູ້ມີສ່ວນຮ່ວມ':'See activity'}</span></button>}
      <div className="mt-3 pb-2 flex items-center justify-between gap-3 text-[13px] text-text-muted">
        <span>{post.likes} {lo?'ຄົນມັກ':'likes'}</span>
        {!readOnly&&<span>{post.comments} {lo?'ຄຳເຫັນ':'comments'} · {(post.shares||0)+(post.reposts||0)} {lo?'ແບ່ງປັນ':'shares'}</span>}
      </div>
      {shareError&&<p role="alert" className="text-sm text-danger">{shareError}</p>}
      </div>
      <div className={`grid border-t border-border ${readOnly?'grid-cols-2':'grid-cols-4'}`}>
        <button type="button" disabled={post.frozen} aria-pressed={liked} onClick={() => onLike(post.id)} className={`${act} ${liked?'text-danger font-bold':'text-text-2'}`}><Heart size={22} aria-hidden fill={liked?'currentColor':'none'} />{lo?'ມັກ':'Like'}</button>
        {!readOnly&&<button type="button" disabled={post.frozen} onClick={() => onOpenComments(post.id)} className={`${act} text-text-2`}><MessageCircle size={22} aria-hidden />{lo?'ຄຳເຫັນ':'Comment'}</button>}
        <button type="button" disabled={post.frozen} aria-pressed={warned} onClick={() => onWarnedMe(post.id)} className={`${act} ${warned?'text-primary font-bold':'text-text-2'}`}>{warned?<ShieldCheck size={22} aria-hidden />:<Shield size={22} aria-hidden />}{lo?'ມີປະໂຫຍດ':'Helpful'}</button>
        {!readOnly&&<button type="button" disabled={post.frozen} onClick={() => void share()} className={`${act} text-text-2`}><Share2 size={22} aria-hidden />{lo?'ແບ່ງປັນ':'Share'}</button>}
      </div>
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
  return lo ? `${n} ${names[0]}ກ່ອນ` : `${n}${names[1]} ago`;
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
