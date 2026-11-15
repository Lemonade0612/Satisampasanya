import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, FileText, Globe, Info, ShieldCheck, Share2 } from "lucide-react";
import { api } from "../lib/api";
import { closeProfile } from "../lib/profileNav";
import { tagLabel } from "../lib/scamTypes";
import { PostSkeleton } from "../components/feed/PostSkeleton";
import { PostRow, lx, useCursorPosts } from "./ProfileParts";
import type { FeedPage, Lang, OrgProfileData, OrgType, Post } from "../types";
import type { CardProps } from "./ProfileLayer";

const TYPE: Record<OrgType, [string, string]> = { gov: ["ພາກລັດ", "Government"], ngo: ["ອົງການບໍ່ຫວັງຜົນກຳໄລ", "Non-profit"], intl: ["ອົງການສາກົນ", "International organisation"], media: ["ສື່ມວນຊົນ", "Media"] };

// Organisation page: banner, logo overlapping it (the logo row is relative z-[2] so the banner never hides it, and the Follow button
// sits in that same row), name with verified badge, bio, links, counts, and posts / about tabs. Posts use the same PostCard.
export function OrgProfile({ slug, lang, card, live, canFollow, onNeedSignup }: { slug: string; lang: Lang; card: CardProps; live: Map<string, Post>; canFollow: boolean; onNeedSignup: () => void }) {
  const [org, setOrg] = useState<OrgProfileData | null>(null), [first, setFirst] = useState<FeedPage | null>(null), [err, setErr] = useState(""), [tab, setTab] = useState<"posts" | "about">("posts"), [busy, setBusy] = useState(false);
  useEffect(() => { setOrg(null); setFirst(null); setErr(""); api.org(slug).then(setOrg).catch(e => setErr((e as Error).message)); api.orgPosts(slug).then(setFirst).catch(() => setFirst({ posts: [], nextCursor: null, newestId: null })); }, [slug]);
  const list = useCursorPosts(first, c => api.orgPosts(slug, c));
  const posts = useMemo(() => list.items.map(p => live.get(p.id) ?? p), [list.items, live]);
  const follow = async () => {
    if (!org) return; if (!canFollow) { onNeedSignup(); return; }
    setBusy(true); const next = !org.following;
    try { const r = await api.follow("org", org.id, next); setOrg({ ...org, following: r.following, followers: r.followers }); } catch (e) { setErr((e as Error).message); } finally { setBusy(false); }
  };
  const share = async () => { try { const v = { title: org ? lx(lang, org.nameLo, org.nameEn) : "", url: location.href }; if (navigator.share) await navigator.share(v); else await navigator.clipboard?.writeText(location.href); } catch { /* cancelled */ } };
  const name = org ? lx(lang, org.nameLo, org.nameEn) : "";
  const host = (u: string) => { try { const x = new URL(u); return x.host.replace(/^www\./, "") + (x.pathname.replace(/\/$/, "") || ""); } catch { return u; } };
  const topics = useMemo(() => { const n = new Map<string, number>(); posts.forEach(p => p.tags.forEach(t => n.set(t, (n.get(t) || 0) + 1))); return [...n].sort((a, b) => b[1] - a[1]).slice(0, 6).map(([t]) => t); }, [posts]);
  return <div className="min-h-full bg-white text-[#14112B]">
    {err && !org && <><div className="p-2"><button type="button" aria-label={lx(lang, "ກັບ", "Back")} onClick={closeProfile} className="w-10 h-10 rounded-full bg-white/90 border border-[#ECECF4] flex items-center justify-center"><ArrowLeft size={20} aria-hidden /></button></div><p role="alert" className="p-6 text-center text-[#5F6390]">{err}</p></>}
    {!org && !err && <div className="p-3"><PostSkeleton type="text" /></div>}
    {org && <>
      {/* "Map" area: the banner, with floating pill controls like Life360 */}
      <div className="relative h-[210px] overflow-hidden" style={{ background: "linear-gradient(135deg, #1CABE2, #0E7FB8 60%, #2563EB)" }}>
        {org.bannerUrl && <img src={org.bannerUrl} alt="" className="absolute inset-0 w-full h-full object-cover" />}
        <div className="absolute top-3 left-3 right-3 flex items-center gap-2.5">
          <button type="button" aria-label={lx(lang, "ກັບ", "Back")} onClick={closeProfile} className="shrink-0 w-11 h-11 rounded-full bg-white text-[#5B21D1] shadow-[0_4px_14px_rgba(20,17,43,0.18)] flex items-center justify-center"><ArrowLeft size={20} aria-hidden /></button>
          <span className="flex-1 min-w-0 h-11 px-4 rounded-full bg-white shadow-[0_4px_14px_rgba(20,17,43,0.18)] flex items-center justify-center gap-1.5 text-[14px] font-bold font-[Inter,BoonHome,sans-serif]"><span className="truncate">{name}</span>{org.verified && <svg width="15" height="15" viewBox="0 0 24 24" aria-hidden className="shrink-0"><circle cx="12" cy="12" r="10" fill="#2563EB" /><path d="m8 12 3 3 5-6" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /></svg>}</span>
          <button type="button" aria-label={lx(lang, "ແບ່ງປັນ", "Share")} onClick={() => void share()} className="shrink-0 w-11 h-11 rounded-full bg-white text-[#5B21D1] shadow-[0_4px_14px_rgba(20,17,43,0.18)] flex items-center justify-center"><Share2 size={19} aria-hidden /></button>
        </div>
      </div>
      {/* The sheet that slides over it */}
      <div className="relative -mt-7 min-h-[70vh] rounded-t-[28px] bg-white shadow-[0_-8px_24px_rgba(20,17,43,0.12)]">
        <div className="flex justify-center pt-2.5"><span aria-hidden className="w-10 h-[5px] rounded-full bg-[#E0E1EB]" /></div>
        <div className="px-5">
          <div className="relative z-[2] flex items-end justify-between -mt-[34px]">
            {org.logoUrl ? <img src={org.logoUrl} alt={name} className="w-[76px] h-[76px] box-border rounded-[22px] border-4 border-white bg-[#1CABE2] object-cover shadow-[0_4px_12px_rgba(20,17,43,0.18)]" /> : <span aria-hidden className="flex w-[76px] h-[76px] box-border rounded-[22px] border-4 border-white bg-[#1CABE2] text-white text-[26px] font-extrabold items-center justify-center font-[Inter,sans-serif]">{name.slice(0, 1)}</span>}
            <button type="button" disabled={busy} aria-pressed={org.following} onClick={() => void follow()} className={`h-11 px-5 rounded-full text-[14px] font-bold disabled:opacity-60 ${org.following ? "border border-[#E6E6F0] bg-white text-[#14112B]" : "border border-transparent bg-[#5B21D1] text-white"}`}>{org.following ? lx(lang, "ກຳລັງຕິດຕາມ", "Following") : lx(lang, "+ ຕິດຕາມ", "+ Follow")}</button>
          </div>
          <h1 className="flex items-center gap-1.5 mt-3 mb-0.5 text-[22px] font-extrabold font-[Inter,BoonHome,sans-serif] break-words">{name}{org.verified && <svg width="18" height="18" viewBox="0 0 24 24" role="img" aria-label={lx(lang, "ຢືນຢັນແລ້ວ", "Verified")}><circle cx="12" cy="12" r="10" fill="#2563EB" /><path d="m8 12 3 3 5-6" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /></svg>}</h1>
          <p className="mb-2.5 text-[13px] text-[#5F6390]">{lx(lang, TYPE[org.type][0], TYPE[org.type][1])}{org.type === "gov" && <> · <b className="text-[#1D4ED8]">{lx(lang, "ແຫຼ່ງຂໍ້ມູນພາກລັດ", "Government source")}</b></>}</p>
          <p className="mb-3 text-[14px] leading-[1.6] text-[#3F4268] break-words">{lx(lang, org.bioLo, org.bioEn)}</p>
          <div className="flex gap-2.5 mb-3">
            <div className="flex-1 rounded-2xl bg-[#F7F7FA] py-2.5 text-center"><p className="text-[18px] font-extrabold tabular-nums font-[Inter,sans-serif]">{(org.followers ?? 0).toLocaleString("en-US")}</p><p className="text-[12px] text-[#5F6390]">{lx(lang, "ຜູ້ຕິດຕາມ", "Followers")}</p></div>
            <div className="flex-1 rounded-2xl bg-[#F7F7FA] py-2.5 text-center"><p className="text-[18px] font-extrabold tabular-nums font-[Inter,sans-serif]">{(org.posts ?? 0).toLocaleString("en-US")}</p><p className="text-[12px] text-[#5F6390]">{lx(lang, "ໂພສ", "Posts")}</p></div>
          </div>
          {org.verified && <div className="flex gap-3 p-3 mb-3.5 rounded-[14px] bg-[#EFF6FF]">
            <ShieldCheck size={20} aria-hidden className="shrink-0 text-[#2563EB]" />
            <span className="text-[13px] leading-[1.5] text-[#1E3A8A]"><b>{lx(lang, "ບັນຊີທາງການທີ່ກວດແລ້ວ", "Verified official account")}</b><br />{lx(lang, "ທີມ Sati ຢືນຢັນວ່າບັນຊີນີ້ ເປັນຂອງອົງການແທ້.", "The Sati team confirmed this account belongs to the organisation.")}</span>
          </div>}
          <div className="flex flex-wrap gap-2 mb-4">
            {org.website && <a href={org.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 min-h-11 px-3.5 rounded-full border border-[#E6E6F0] text-[#14112B] text-[13px] font-semibold"><Globe size={15} aria-hidden />{host(org.website)}</a>}
            {org.facebookUrl && <a href={org.facebookUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 min-h-11 px-3.5 rounded-full border border-[#E6E6F0] text-[#14112B] text-[13px] font-semibold"><svg width="15" height="15" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="11" fill="#1877F2" /><path d="M13.5 19v-6h2l.3-2.3h-2.3V9.2c0-.7.2-1.1 1.1-1.1h1.3V6.1c-.2 0-1-.1-1.9-.1-1.9 0-3.2 1.2-3.2 3.3v1.4H8.6V13h2.2v6z" fill="#fff" /></svg>Facebook</a>}
          </div>
        </div>
        {/* Life360 "People / Places" row: a big title and one purple pill that switches the list */}
        <div className="flex items-center justify-between px-5 pt-3 pb-3 border-t border-[#ECECF4]">
          <h2 className="text-[22px] font-extrabold">{tab === "posts" ? lx(lang, "ໂພສ", "Posts") : lx(lang, "ກ່ຽວກັບ", "About")}</h2>
          <button type="button" onClick={() => setTab(tab === "posts" ? "about" : "posts")} className="flex items-center gap-2 min-h-11 px-4 rounded-full bg-[#5B21D1] text-white text-[14px] font-bold">{tab === "posts" ? <Info size={18} aria-hidden /> : <FileText size={18} aria-hidden />}{tab === "posts" ? lx(lang, "ກ່ຽວກັບ", "About") : lx(lang, "ໂພສ", "Posts")}</button>
        </div>
        {tab === "posts" && <div className="px-4 pb-[calc(96px+env(safe-area-inset-bottom))]">
          {first === null && <PostSkeleton type="text" />}
          {first !== null && !posts.length && <p className="p-8 text-center text-[#5F6390]">{lx(lang, "ຍັງບໍ່ມີໂພສ", "No posts yet")}</p>}
          {posts.map(p => <PostRow key={p.id} post={p} lang={lang} onOpen={card.onOpenComments} />)}
          {list.hasMore && <button type="button" disabled={list.busy} onClick={() => void list.load()} className="w-full min-h-12 rounded-2xl border border-[#E6E6F0] font-bold disabled:opacity-60">{lx(lang, "ໂຫຼດເພີ່ມ", "Load more")}</button>}
        </div>}
        {tab === "about" && <div className="px-5 pb-[calc(96px+env(safe-area-inset-bottom))] text-[14px] leading-[1.6] text-[#3F4268]">
          <p className="mb-1.5 text-[12px] font-bold text-[#5F6390]">{lx(lang, "ປະເພດ", "Type")}</p>
          <p className="mb-3.5">{lx(lang, TYPE[org.type][0], TYPE[org.type][1])}</p>
          {!!topics.length && <><p className="mb-1.5 text-[12px] font-bold text-[#5F6390]">{lx(lang, "ຫົວຂໍ້ທີ່ໂພສ", "Topics posted")}</p>
            <div className="flex flex-wrap gap-1.5 mb-3.5">{topics.map(t => <span key={t} className="px-2.5 py-1 rounded-full bg-[#F3F0FC] text-[#5B21D1] text-[12px] font-semibold">{tagLabel(t, lang)}</span>)}</div></>}
          {org.facebookUrl && <><p className="mb-1.5 text-[12px] font-bold text-[#5F6390]">{lx(lang, "ໂພສມາຈາກ", "Posts come from")}</p>
            <p>{lx(lang, "ໜ້າ Facebook ທາງການ. Sati ດຶງໂພສມາ ພ້ອມລິ້ງກັບໄປຫາຕົ້ນສະບັບທຸກຄັ້ງ.", "The official Facebook page. Sati pulls the posts in, always with a link back to the original.")}</p></>}
        </div>}
      </div>
    </>}
  </div>;
}
