import { useEffect, useMemo, useState } from "react";
import { Ban, Flag, Link2, MoreHorizontal, Share2, ShieldCheck } from "lucide-react";
import { api } from "../lib/api";
import { closeProfile, profileHref } from "../lib/profileNav";
import { setBlocked, useBlocked } from "../lib/blocked";
import { PostCard } from "../components/feed/PostCard";
import { PostSkeleton } from "../components/feed/PostSkeleton";
import { ProfileBar, Tabs, Stat, Sheet, SheetItem, lx, useCursorPosts } from "./ProfileParts";
import { tagLabel } from "../lib/scamTypes";
import { BANDS } from "../lib/band";
import { DT } from "../features/daily/i18n";
import type { FeedPage, Lang, Post, PublicUser } from "../types";
import type { CardProps } from "./ProfileLayer";

type Data = { user: PublicUser; stats: { followers: number; posts: number; helpful: number }; following: boolean; posts: FeedPage };
const REPORT = [["scam", "ການຫຼອກລວງ", "Scam"], ["fake", "ບັນຊີປອມ", "Fake account"], ["abuse", "ຮຸກຮານ / ລົບກວນ", "Abuse or harassment"], ["other", "ອື່ນໆ", "Something else"]] as const;

// Public profile: @handle, band chip, bio, follow + share, a ••• sheet (copy link, report, block), stats, badges, and posts / topics tabs.
export function UserProfile({ handle, lang, card, live, currentUserId, canFollow, onNeedSignup }: { handle: string; lang: Lang; card: CardProps; live: Map<string, Post>; currentUserId?: string; canFollow: boolean; onNeedSignup: () => void }) {
  const [data, setData] = useState<Data | null>(null), [err, setErr] = useState(""), [tab, setTab] = useState<"posts" | "topics">("posts"), [sheet, setSheet] = useState<"menu" | "report" | null>(null), [note, setNote] = useState(""), [busy, setBusy] = useState(false);
  const blocked = useBlocked();
  useEffect(() => { setData(null); setErr(""); api.userProfile(handle).then(setData).catch(e => setErr((e as Error).message)); }, [handle]);
  const list = useCursorPosts(data?.posts ?? null, c => api.userPosts(handle, c));
  const posts = useMemo(() => list.items.map(p => live.get(p.id) ?? p), [list.items, live]);
  const u = data?.user, isBlocked = !!u && blocked.includes(u.id), mine = !!u && u.id === currentUserId;
  const url = () => location.origin + location.pathname + profileHref({ kind: "user", handle });
  const flash = (m: string) => { setNote(m); setTimeout(() => setNote(""), 2500); };
  const follow = async () => { if (!data || !u) return; if (!canFollow) { onNeedSignup(); return; } setBusy(true); try { const r = await api.follow("user", u.id, !data.following); setData({ ...data, following: r.following, stats: { ...data.stats, followers: r.followers } }); } catch (e) { setErr((e as Error).message); } finally { setBusy(false); } };
  const share = async () => { try { if (navigator.share) await navigator.share({ title: u!.name, url: url() }); else { await navigator.clipboard.writeText(url()); flash(lx(lang, "ຄັດລອກລິ້ງແລ້ວ", "Link copied")); } } catch { /* cancelled */ } };
  const topics = useMemo(() => { const n = new Map<string, number>(); posts.forEach(p => p.tags.forEach(t => n.set(t, (n.get(t) || 0) + 1))); return [...n].sort((a, b) => b[1] - a[1]); }, [posts]);
  const badges = data ? [
    data.stats.posts >= 1 && { id: "first", lo: "ໂພສທຳອິດ", en: "First post" },
    data.stats.helpful >= 5 && { id: "helpful", lo: "ຊ່ວຍຊຸມຊົນ", en: "Helpful" },
    data.stats.followers >= 10 && { id: "voice", lo: "ສຽງຊຸມຊົນ", en: "Community voice" },
  ].filter(Boolean) as { id: string; lo: string; en: string }[] : [];

  return <div className="min-h-full bg-background">
    <ProfileBar lang={lang} title={u ? u.name : lx(lang, "ໂປຣໄຟລ", "Profile")} onBack={closeProfile} right={u && <button type="button" aria-label={lx(lang, "ຕົວເລືອກເພີ່ມເຕີມ", "More options")} onClick={() => setSheet("menu")} className="min-h-11 min-w-11 flex items-center justify-center rounded-full text-text"><MoreHorizontal size={22} aria-hidden /></button>} />
    {err && !data && <p role="alert" className="p-6 text-center text-text-muted">{err}</p>}
    {!data && !err && <div className="p-3"><PostSkeleton type="text" /></div>}
    {data && u && <>
      <div className="relative h-28 overflow-hidden bg-gradient-to-br from-[#5B21D1] to-[#14112B]">{u.banner && <img src={u.banner} alt="" className="absolute inset-0 w-full h-full object-cover" />}</div>
      <div className="relative z-[2] -mt-10 px-4 flex items-end justify-between gap-3">
        {u.avatar ? <img src={u.avatar} alt="" className="w-20 h-20 rounded-full border-4 border-background object-cover" /> : <span aria-hidden className="w-20 h-20 rounded-full border-4 border-background bg-primary text-primary-foreground text-2xl font-extrabold flex items-center justify-center">{u.initials}</span>}
        {!mine && <div className="mb-1 flex items-center gap-2">
          <button type="button" aria-label={lx(lang, "ແບ່ງປັນ", "Share profile")} onClick={() => void share()} className="min-h-11 min-w-11 flex items-center justify-center rounded-full border-2 border-border text-text"><Share2 size={18} aria-hidden /></button>
          <button type="button" disabled={busy || isBlocked} aria-pressed={data.following} onClick={() => void follow()} className={`min-h-11 px-6 rounded-full font-bold text-[15px] ${data.following ? "border-2 border-border bg-background text-text" : "bg-primary text-primary-foreground shadow-[0_4px_0_#3B0E91] active:translate-y-[2px] active:shadow-[0_2px_0_#3B0E91]"} disabled:opacity-60`}>{data.following ? lx(lang, "ກຳລັງຕິດຕາມ", "Following") : lx(lang, "ຕິດຕາມ", "Follow")}</button>
        </div>}
      </div>
      <div className="px-4 pt-3">
        <h1 className="text-[1.375rem] font-extrabold text-text break-words">{u.name}</h1>
        <div className="mt-1 flex flex-wrap items-center gap-2"><span className="text-[15px] text-text-muted break-all">{u.handle}</span>
          {u.ageBand && BANDS.includes(u.ageBand) && <span className="rounded-full bg-[#EDE9FE] px-2.5 py-0.5 text-[13px] font-bold text-[#3B0E91]">{DT[lang][`age_${u.ageBand}`]}</span>}</div>
        {u.bio && <p className="mt-3 text-[16px] leading-relaxed text-text break-words">{u.bio}</p>}
        {isBlocked && <p role="status" className="mt-3 rounded-xl bg-surface p-3 text-[15px] text-text-muted">{lx(lang, "ທ່ານບລັອກຄົນນີ້. ໂພສຂອງເຂົາຈະບໍ່ສະແດງ.", "You blocked this person. Their posts are hidden.")}</p>}
        <div className="mt-4 flex rounded-2xl border border-border py-3"><Stat n={data.stats.posts} label={lx(lang, "ໂພສ", "Posts")} /><Stat n={data.stats.followers} label={lx(lang, "ຜູ້ຕິດຕາມ", "Followers")} /><Stat n={data.stats.helpful} label={lx(lang, "ມີປະໂຫຍດ", "Helpful")} /></div>
        {!!badges.length && <ul className="mt-3 flex flex-wrap gap-2" aria-label={lx(lang, "ຫຼຽນ", "Badges")}>{badges.map(b => <li key={b.id} className="inline-flex items-center gap-1.5 rounded-full bg-[#DCFCE7] px-3 py-1 text-[13px] font-bold text-[#15803D]"><ShieldCheck size={14} aria-hidden />{lx(lang, b.lo, b.en)}</li>)}</ul>}
      </div>
      <div className="mt-2"><Tabs lang={lang} value={tab} onChange={setTab} items={[{ id: "posts", lo: "ໂພສ", en: "Posts" }, { id: "topics", lo: "ຫົວຂໍ້", en: "Topics" }]} /></div>
      <div className="px-2 pt-2 pb-[calc(32px+env(safe-area-inset-bottom))] flex flex-col gap-2">
        {tab === "posts" && !isBlocked && <>
          {!posts.length && <p className="p-8 text-center text-text-muted">{lx(lang, "ຍັງບໍ່ມີໂພສ", "No posts yet")}</p>}
          {posts.map(p => <PostCard key={p.id} post={p} lang={lang} {...card} />)}
          {list.hasMore && <button type="button" disabled={list.busy} onClick={() => void list.load()} className="min-h-12 rounded-2xl border-2 border-border font-bold text-text disabled:opacity-60">{lx(lang, "ໂຫຼດເພີ່ມ", "Load more")}</button>}
        </>}
        {tab === "topics" && (topics.length ? <ul className="flex flex-wrap gap-2 p-2">{topics.map(([t, n]) => <li key={t} className="rounded-full border border-border bg-surface px-3 py-1.5 text-[15px] text-text">#{tagLabel(t, lang)} <span className="font-bold text-text-muted">{n}</span></li>)}</ul> : <p className="p-8 text-center text-text-muted">{lx(lang, "ຍັງບໍ່ມີຫົວຂໍ້", "No topics yet")}</p>)}
      </div>
    </>}
    {note && <p role="status" className="fixed left-1/2 -translate-x-1/2 bottom-[calc(96px+env(safe-area-inset-bottom))] z-[80] rounded-full bg-[#14112B] px-4 py-2 text-sm font-bold text-white">{note}</p>}
    {sheet === "menu" && u && <Sheet lang={lang} title={u.name} onClose={() => setSheet(null)}>
      <SheetItem onClick={() => { setSheet(null); void navigator.clipboard?.writeText(url()).then(() => flash(lx(lang, "ຄັດລອກລິ້ງແລ້ວ", "Link copied"))); }}><Link2 size={20} aria-hidden />{lx(lang, "ຄັດລອກລິ້ງ", "Copy link")}</SheetItem>
      {!mine && <SheetItem onClick={() => setSheet("report")}><Flag size={20} aria-hidden />{lx(lang, "ລາຍງານ", "Report")}</SheetItem>}
      {!mine && <SheetItem danger onClick={() => { setBlocked(u.id, !isBlocked); setSheet(null); flash(isBlocked ? lx(lang, "ເຊົາບລັອກແລ້ວ", "Unblocked") : lx(lang, "ບລັອກແລ້ວ", "Blocked")); }}><Ban size={20} aria-hidden />{isBlocked ? lx(lang, "ເຊົາບລັອກ", "Unblock") : lx(lang, "ບລັອກ", "Block")}</SheetItem>}
    </Sheet>}
    {sheet === "report" && u && <Sheet lang={lang} title={lx(lang, "ລາຍງານໂປຣໄຟລນີ້", "Report this profile")} onClose={() => setSheet(null)}>
      {REPORT.map(([id, lo, en]) => <SheetItem key={id} onClick={() => { setSheet(null); void api.satiFeedback("down", `profile-report:${u.handle}`, lang, id).then(() => flash(lx(lang, "ສົ່ງລາຍງານແລ້ວ", "Report sent"))).catch(e => flash((e as Error).message)); }}>{lx(lang, lo, en)}</SheetItem>)}
    </Sheet>}
  </div>;
}
