import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Ban, Flag, Link2, MoreHorizontal, ShieldCheck } from "lucide-react";
import { api } from "../lib/api";
import { closeProfile, profileHref } from "../lib/profileNav";
import { setBlocked, useBlocked } from "../lib/blocked";
import { PostSkeleton } from "../components/feed/PostSkeleton";
import { Tabs, Sheet, SheetItem, lx, useCursorPosts } from "./ProfileParts";
import { statusOf, STATUS } from "../components/feed/colorCode";
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

  const TOPIC_TONE = ["bg-[#FFF1F2] text-[#BE123C]", "bg-[#ECFDF5] text-[#047857]", "bg-[#EFF6FF] text-[#1D4ED8]"];
  const BADGE_TONE: Record<string, string> = { first: "bg-[#FFF7ED] text-[#C2410C]", helpful: "bg-[#F3F0FC] text-[#5B21D1]", voice: "bg-[#ECFDF5] text-[#047857]" };
  const gradient = u ? `linear-gradient(135deg, ${u.id.length % 2 ? "#7F1D1D" : "#4A16B5"}, ${u.id.length % 2 ? "#E11D48" : "#6E8EF0"})` : undefined;
  return <div className="min-h-full bg-white text-[#14112B]">
    <header className="flex items-center gap-2 px-3 py-2">
      <button type="button" aria-label={lx(lang, "ກັບ", "Back")} onClick={closeProfile} className="w-11 h-11 flex items-center justify-center"><ArrowLeft size={22} aria-hidden /></button>
      <span className="flex-1 text-[15px] font-bold font-[BoonHome,sans-serif] truncate">{u ? u.handle : lx(lang, "ໂປຣໄຟລ", "Profile")}</span>
      {u && <button type="button" aria-label={lx(lang, "ຕົວເລືອກເພີ່ມເຕີມ", "More options")} onClick={() => setSheet("menu")} className="w-11 h-11 rounded-full text-[#3F4268] flex items-center justify-center"><MoreHorizontal size={20} aria-hidden /></button>}
    </header>
    {err && !data && <p role="alert" className="p-6 text-center text-[#5F6390]">{err}</p>}
    {!data && !err && <div className="p-3"><PostSkeleton type="text" /></div>}
    {data && u && <>
      <section className="px-5 pt-1 text-center">
        {u.avatar ? <img src={u.avatar} alt="" className="inline-block w-[88px] h-[88px] rounded-full object-cover shadow-[0_0_0_4px_#fff,0_0_0_6px_#F3F0FC]" /> : <span aria-hidden className="inline-flex w-[88px] h-[88px] rounded-full text-white text-[30px] font-extrabold items-center justify-center font-[BoonHome,sans-serif] shadow-[0_0_0_4px_#fff,0_0_0_6px_#F3F0FC]" style={{ background: gradient }}>{u.initials}</span>}
        <h1 className="mt-3 mb-0.5 text-[22px] font-extrabold font-[BoonHome,sans-serif] break-words">{u.name}</h1>
        <p className="flex justify-center items-center gap-2 mb-2.5 text-[13px] text-[#5F6390]">
          {u.ageBand && BANDS.includes(u.ageBand) && <span className="px-2.5 py-0.5 rounded-full bg-[#EEF0FA] text-[#5B21D1] text-[12px] font-bold">{DT[lang][`age_${u.ageBand}`]}</span>}
        </p>
        {u.bio && <p className="mx-auto mb-3.5 max-w-[300px] text-[14px] leading-[1.6] text-[#3F4268] break-words">{u.bio}</p>}
        {isBlocked && <p role="status" className="mb-3 rounded-xl bg-[#F6F7FC] p-3 text-[14px] text-[#5F6390]">{lx(lang, "ທ່ານບລັອກຄົນນີ້. ໂພສຂອງເຂົາຈະບໍ່ສະແດງ.", "You blocked this person. Their posts are hidden.")}</p>}
        {!mine && <div className="grid grid-cols-2 gap-2 mb-3.5">
          <button type="button" disabled={busy || isBlocked} aria-pressed={data.following} onClick={() => void follow()} className={`h-[42px] rounded-xl text-[14px] font-bold disabled:opacity-60 ${data.following ? "border border-[#E6E6F0] bg-white text-[#14112B]" : "border border-transparent bg-[#5B21D1] text-white"}`}>{data.following ? lx(lang, "ກຳລັງຕິດຕາມ", "Following") : lx(lang, "+ ຕິດຕາມ", "+ Follow")}</button>
          <button type="button" onClick={() => void share()} className="h-[42px] rounded-xl border border-[#E6E6F0] bg-white text-[#14112B] text-[14px] font-bold">{lx(lang, "ແບ່ງປັນໂປຣໄຟລ໌", "Share profile")}</button>
        </div>}
      </section>
      <div className="grid grid-cols-3 gap-2 px-5 pb-3.5">
        {([[data.stats.posts, lx(lang, "ໂພສ", "Posts")], [data.stats.helpful, lx(lang, "ຄົນເຫັນວ່າມີປະໂຫຍດ", "Found helpful")], [data.stats.followers, lx(lang, "ຜູ້ຕິດຕາມ", "Followers")]] as [number, string][]).map(([n, l]) => <div key={l} className="py-2.5 rounded-[14px] bg-[#F6F7FC] text-center"><p className="text-[19px] font-extrabold font-[BoonHome,sans-serif] leading-tight">{n.toLocaleString("en-US")}</p><p className="px-1 text-[12px] leading-tight text-[#5F6390]">{l}</p></div>)}
      </div>
      {!!badges.length && <ul className="flex flex-wrap gap-2 px-5 pb-4" aria-label={lx(lang, "ຫຼຽນ", "Badges")}>{badges.map(bd => <li key={bd.id} className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-[10px] text-[12px] font-bold ${BADGE_TONE[bd.id] ?? "bg-[#F3F0FC] text-[#5B21D1]"}`}><ShieldCheck size={14} aria-hidden />{lx(lang, bd.lo, bd.en)}</li>)}</ul>}
      <Tabs lang={lang} value={tab} onChange={setTab} items={[{ id: "posts", lo: "ໂພສ", en: "Posts" }, { id: "topics", lo: "ຫົວຂໍ້", en: "Topics" }]} />
      {tab === "posts" && !isBlocked && <div className="px-4 pt-3 pb-[calc(24px+env(safe-area-inset-bottom))]">
        {!posts.length && <p className="p-8 text-center text-[#5F6390]">{lx(lang, "ຍັງບໍ່ມີໂພສ", "No posts yet")}</p>}
        {posts.map(p => <UserRow key={p.id} post={p} lang={lang} onOpen={card.onOpenComments} />)}
        {list.hasMore && <button type="button" disabled={list.busy} onClick={() => void list.load()} className="w-full min-h-12 rounded-2xl border border-[#E6E6F0] font-bold disabled:opacity-60">{lx(lang, "ໂຫຼດເພີ່ມ", "Load more")}</button>}
      </div>}
      {tab === "topics" && (topics.length ? <ul className="flex flex-wrap gap-2 px-5 pt-4 pb-6">{topics.map(([t], i) => <li key={t} className={`px-3.5 py-2 rounded-full text-[13px] font-semibold ${TOPIC_TONE[i % 3]}`}>{tagLabel(t, lang)}</li>)}</ul> : <p className="p-8 text-center text-[#5F6390]">{lx(lang, "ຍັງບໍ່ມີຫົວຂໍ້", "No topics yet")}</p>)}
    </>}
    {note && <p role="status" className="fixed left-1/2 -translate-x-1/2 bottom-[calc(96px+env(safe-area-inset-bottom))] z-[80] rounded-full bg-[#14112B] px-4 py-2 text-sm font-bold text-white">{note}</p>}
    {sheet === "menu" && u && <Sheet bare lang={lang} title={u.name} onClose={() => setSheet(null)}>
      <SheetItem onClick={() => { setSheet(null); void navigator.clipboard?.writeText(url()).then(() => flash(lx(lang, "ຄັດລອກລິ້ງແລ້ວ", "Link copied"))); }}><Link2 size={20} aria-hidden />{lx(lang, "ສຳເນົາລິ້ງໂປຣໄຟລ໌", "Copy profile link")}</SheetItem>
      {!mine && <SheetItem onClick={() => setSheet("report")}><Flag size={20} aria-hidden />{lx(lang, "ລາຍງານບັນຊີນີ້", "Report this account")}</SheetItem>}
      {!mine && <SheetItem danger onClick={() => { setBlocked(u.id, !isBlocked); setSheet(null); flash(isBlocked ? lx(lang, "ເຊົາບລັອກແລ້ວ", "Unblocked") : lx(lang, "ບລັອກແລ້ວ", "Blocked")); }}><Ban size={20} aria-hidden />{isBlocked ? lx(lang, "ເຊົາບລັອກ", "Unblock") : lx(lang, "ບລັອກ", "Block")}</SheetItem>}
    </Sheet>}
    {sheet === "report" && u && <Sheet lang={lang} title={lx(lang, "ລາຍງານໂປຣໄຟລນີ້", "Report this profile")} onClose={() => setSheet(null)}>
      {REPORT.map(([id, lo, en]) => <SheetItem key={id} onClick={() => { setSheet(null); void api.satiFeedback("down", `profile-report:${u.handle}`, lang, id).then(() => flash(lx(lang, "ສົ່ງລາຍງານແລ້ວ", "Report sent"))).catch(e => flash((e as Error).message)); }}>{lx(lang, lo, en)}</SheetItem>)}
    </Sheet>}
  </div>;
}

// Compact post row on a person's profile: when and topic on the left, the Sati status pill on the right, two lines of text.
function UserRow({ post, lang, onOpen }: { post: Post; lang: Lang; onOpen: (id: string) => void }) {
  const st = STATUS[statusOf(post)], tag = post.tags[0] ? tagLabel(post.tags[0], lang) : "";
  const m = /^(\d+)\s*(m|h|d|w)/i.exec(post.timestamp);
  const ago = m ? `${m[1]} ${({ m: lx(lang, "ນາທີ", "min"), h: lx(lang, "ຊົ່ວໂມງ", "h"), d: lx(lang, "ມື້", "d"), w: lx(lang, "ອາທິດ", "w") } as Record<string, string>)[m[2].toLowerCase()]}` : post.timestamp;
  return <button type="button" onClick={() => onOpen(post.id)} className="block w-full px-3.5 py-3 mb-2.5 rounded-2xl border border-[#ECECF4] bg-white text-left">
    <span className="flex items-center gap-2 mb-1.5"><span className="text-[12px] text-[#5F6390]">{ago}{tag ? ` · #${tag}` : ""}</span><span className="flex-1" />
      <span className={`flex items-center gap-[5px] h-6 px-[9px] rounded-full text-[11px] font-bold ${st.cls}`}><span className="w-1.5 h-1.5 rounded-full" style={{ background: st.dot }} />{st[lang]}</span></span>
    <span className="block text-[14px] leading-[1.55] line-clamp-2 font-[BoonHome,sans-serif]">{(lang === "lo" ? post.contentLo : undefined) || post.content}</span>
  </button>;
}
