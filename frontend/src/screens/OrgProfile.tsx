import { useEffect, useMemo, useState } from "react";
import { ExternalLink, Facebook, Globe } from "lucide-react";
import { api } from "../lib/api";
import { closeProfile } from "../lib/profileNav";
import { PostCard } from "../components/feed/PostCard";
import { PostSkeleton } from "../components/feed/PostSkeleton";
import { ProfileBar, VerifiedBadge, Tabs, Stat, lx, useCursorPosts } from "./ProfileParts";
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
  const name = org ? lx(lang, org.nameLo, org.nameEn) : "";
  return <div className="min-h-full bg-background">
    <ProfileBar lang={lang} title={name || lx(lang, "ອົງການ", "Organisation")} onBack={closeProfile} />
    {err && !org && <p role="alert" className="p-6 text-center text-text-muted">{err}</p>}
    {!org && !err && <div className="p-3"><PostSkeleton type="text" /></div>}
    {org && <>
      <div className="relative h-36 overflow-hidden bg-surface-2"><img src={org.bannerUrl ?? ""} alt="" className="absolute inset-0 w-full h-full object-cover" /></div>
      <div className="relative z-[2] -mt-10 px-4 flex items-end justify-between gap-3">
        <img src={org.logoUrl ?? ""} alt={name} className="w-20 h-20 rounded-2xl border-4 border-background bg-surface object-cover shadow-sm" />
        <button type="button" disabled={busy} aria-pressed={org.following} onClick={() => void follow()} className={`mb-1 min-h-11 px-6 rounded-full font-bold text-[15px] ${org.following ? "border-2 border-border bg-background text-text" : "bg-primary text-primary-foreground shadow-[0_4px_0_#3B0E91] active:translate-y-[2px] active:shadow-[0_2px_0_#3B0E91]"} disabled:opacity-60`}>{org.following ? lx(lang, "ກຳລັງຕິດຕາມ", "Following") : lx(lang, "ຕິດຕາມ", "Follow")}</button>
      </div>
      <div className="px-4 pt-3">
        <h1 className="text-[1.375rem] leading-snug font-extrabold text-text break-words">{name}</h1>
        <div className="mt-1.5 flex flex-wrap items-center gap-2">
          {org.verified && <VerifiedBadge lang={lang} />}
          {org.type === "gov" && <span className="rounded-full bg-[#EDE9FE] px-2 py-0.5 text-[13px] font-bold text-[#3B0E91]">{lx(lang, "ແຫຼ່ງຂໍ້ມູນພາກລັດ", "Government source")}</span>}
          <span className="text-[14px] text-text-muted">{lx(lang, TYPE[org.type][0], TYPE[org.type][1])}</span>
        </div>
        <p className="mt-3 text-[16px] leading-relaxed text-text break-words">{lx(lang, org.bioLo, org.bioEn)}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {org.website && <a href={org.website} target="_blank" rel="noopener noreferrer" className="min-h-11 inline-flex items-center gap-1.5 rounded-full border border-border px-4 text-[14px] font-bold text-primary-ink"><Globe size={16} aria-hidden />{lx(lang, "ເວັບໄຊ", "Website")}<ExternalLink size={13} aria-hidden /></a>}
          {org.facebookUrl && <a href={org.facebookUrl} target="_blank" rel="noopener noreferrer" className="min-h-11 inline-flex items-center gap-1.5 rounded-full border border-border px-4 text-[14px] font-bold text-primary-ink"><Facebook size={16} aria-hidden />Facebook<ExternalLink size={13} aria-hidden /></a>}
        </div>
        <div className="mt-4 flex rounded-2xl border border-border py-3"><Stat n={org.followers} label={lx(lang, "ຜູ້ຕິດຕາມ", "Followers")} /><Stat n={org.posts} label={lx(lang, "ໂພສ", "Posts")} /></div>
      </div>
      <div className="mt-2"><Tabs lang={lang} value={tab} onChange={setTab} items={[{ id: "posts", lo: "ໂພສ", en: "Posts" }, { id: "about", lo: "ກ່ຽວກັບ", en: "About" }]} /></div>
      <div className="px-2 pt-2 pb-[calc(32px+env(safe-area-inset-bottom))] flex flex-col gap-2">
        {tab === "posts" && <>
          {first === null && <PostSkeleton type="text" />}
          {first !== null && !posts.length && <p className="p-8 text-center text-text-muted">{lx(lang, "ຍັງບໍ່ມີໂພສ", "No posts yet")}</p>}
          {posts.map(p => <PostCard key={p.id} post={p} lang={lang} {...card} />)}
          {list.hasMore && <button type="button" disabled={list.busy} onClick={() => void list.load()} className="min-h-12 rounded-2xl border-2 border-border font-bold text-text disabled:opacity-60">{lx(lang, "ໂຫຼດເພີ່ມ", "Load more")}</button>}
        </>}
        {tab === "about" && <div className="rounded-2xl bg-surface p-4 text-[16px] leading-relaxed text-text">
          <p>{lx(lang, org.bioLo, org.bioEn)}</p>
          <p className="mt-3 text-[14px] text-text-muted">{org.verified ? lx(lang, "Sati ຢືນຢັນບັນຊີອົງການນີ້ແລ້ວ.", "Sati has verified this organisation's account.") : lx(lang, "ບັນຊີນີ້ຍັງບໍ່ໄດ້ຮັບການຢືນຢັນ.", "This account has not been verified yet.")}</p>
        </div>}
      </div>
    </>}
  </div>;
}
