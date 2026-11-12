import { useState } from "react";
import { TOPIC_LABELS, TOPIC_EN_NAMES, TOPIC_ORDER, TOPIC_SHORT_LO } from "../lib/constants";
import { Search, X, TrendingUp, Tag, ChevronRight, Link2, FileText, Phone, ExternalLink } from "lucide-react";
import { HOTLINES, type Hotline } from "../lib/hotlines";
import { DOC_KIND_LABEL, OFFICIAL_DOCS, TRAFFICKING_STATS_2024, type DocKind } from "../lib/officialDocs";
import { ASK_SATI_PAD } from "../components/shared/AskSatiButton";
import { TagChip } from "@/components/ui/TagChip";
import type { Lang, Post } from "../types";

type ExploreTab = "explore" | "hotlines" | "docs";

export function ExploreScreen({ lang, posts, onOpenPost, onTopicClick, onCheckLink }: { lang: Lang; posts: Post[]; onOpenPost: (id: string) => void; onTopicClick?: (topic: string) => void; onCheckLink?: () => void }) {
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState<ExploreTab>("explore");
  const lo = lang === "lo";
  const dayAgo = Date.now() - 86400000;

  // Rank by number of posts; topics with no posts are never ranked.
  const ranked = TOPIC_ORDER.map(tag => {
    const tagged = posts.filter(p => p.tags.includes(tag));
    return { tag, count: tagged.length, today: tagged.filter(p => (p.createdAt || 0) > dayAgo).length };
  }).filter(c => c.count > 0).sort((a, b) => b.count - a.count);
  const max = ranked[0]?.count || 1;
  const topicName = (tag: string) => lo ? (TOPIC_SHORT_LO[tag] || TOPIC_LABELS[tag]?.lo || tag) : (TOPIC_EN_NAMES[tag] || TOPIC_LABELS[tag]?.en || tag);

  const q = search.trim().toLowerCase();
  const filteredPosts = q ? posts.filter(p => {
    const contentMatch = p.content.toLowerCase().includes(q) || (p.contentLo && p.contentLo.toLowerCase().includes(q));
    const tagMatch = p.tags.some(tag => {
      const label = TOPIC_LABELS[tag];
      return tag.toLowerCase().includes(q) || (label && (label.en.toLowerCase().includes(q) || label.lo.toLowerCase().includes(q))) || (TOPIC_EN_NAMES[tag]?.toLowerCase().includes(q) ?? false);
    });
    return contentMatch || tagMatch || p.author.name.toLowerCase().includes(q);
  }) : [];

  const hotHits = q ? HOTLINES.flatMap(g => g.items).filter(h => [h.number, h.name.lo, h.name.en, h.org?.lo, h.org?.en].some(v => v?.toLowerCase().includes(q))) : [];
  const open = (tag: string) => onTopicClick?.(tag);

  return (
    <div className="h-full flex flex-col bg-background text-text overflow-y-auto overflow-x-hidden scrollbar-hide">
      <div className="sticky top-0 z-10 bg-background border-b border-border">
        <div className="px-4 pt-3 pb-1">
          <label className="flex items-center gap-2 h-12 rounded-[14px] px-4 bg-[#F3F4F8] dark:bg-muted focus-within:ring-2 focus-within:ring-primary/30">
            <Search size={20} aria-hidden className="text-text-muted shrink-0" />
            <span className="sr-only">{lo ? "ຄົ້ນຫາ" : "Search"}</span>
            <input type="search" value={search} onChange={e => setSearch(e.target.value)} placeholder={lo ? "ຄົ້ນຫາ ເຊັ່ນ: ວຽກຕ່າງປະເທດ, 1533" : "Search e.g. jobs abroad, 1533"}
              className="flex-1 min-w-0 bg-transparent text-base outline-none placeholder:text-text-muted" />
            {search && <button type="button" aria-label={lo ? "ລຶບຄຳຄົ້ນຫາ" : "Clear search"} onClick={() => setSearch("")} className="w-11 h-11 -mr-3 flex items-center justify-center text-text-muted"><X size={18} aria-hidden /></button>}
          </label>
        </div>
        {!q && <div role="tablist" className="grid grid-cols-3 px-4">
          {TABS.map(([id, l]) => <button key={id} type="button" role="tab" aria-selected={tab === id} onClick={() => setTab(id)}
            className={`relative justify-self-center min-h-12 px-1 text-[15px] font-bold ${tab === id ? "text-primary-ink" : "text-text-muted"}`}>
            {lo ? l.lo : l.en}{tab === id && <span aria-hidden className="absolute bottom-0 left-0 right-0 h-[3px] bg-primary rounded-full" />}
          </button>)}
        </div>}
      </div>

      {q ? (
        <div className={`px-4 pt-3 ${ASK_SATI_PAD} space-y-2`}>
          {hotHits.map(h => <a key={h.number} href={`tel:${h.tel}`} className="flex items-center gap-3 rounded-2xl border border-border bg-background p-3 min-h-11">
            <span className="w-11 h-11 shrink-0 rounded-full bg-[#22C55E] text-white flex items-center justify-center"><Phone size={18} aria-hidden /></span>
            <span className="min-w-0"><b className="block">{h.number}</b><span className="block text-xs text-text-muted">{lo ? h.name.lo : h.name.en}</span></span>
          </a>)}
          {filteredPosts.length === 0 && !hotHits.length ? (
            <p className="text-center py-12 text-text-muted">{lo ? "ບໍ່ພົບຜົນການຄົ້ນຫາ" : "No results found"}</p>
          ) : filteredPosts.map(post => (
            <div key={post.id} className="rounded-2xl border border-border bg-surface">
              <button type="button" onClick={() => onOpenPost(post.id)} className="w-full text-left px-4 pt-3 pb-2 min-h-11">
                <span className="flex items-center gap-2 mb-1"><span className="font-bold text-sm">{post.author.name}</span><span className="text-xs text-text-muted">{post.timestamp}</span></span>
                <span className="block text-base line-clamp-2">{lo && post.contentLo ? post.contentLo : post.content}</span>
              </button>
              {post.tags.length > 0 && <div className="flex flex-wrap gap-1.5 px-4 pb-3">
                {post.tags.map(tag => <button type="button" key={tag} onClick={() => open(tag)} className="min-h-11 flex items-center"><TagChip tag={tag} lang={lang} small /></button>)}
              </div>}
            </div>
          ))}
        </div>
      ) : tab === "hotlines" ? <Hotlines lang={lang} /> : tab === "docs" ? <Docs lang={lang} /> : (
        <div className={`px-4 pt-4 ${ASK_SATI_PAD} space-y-6`}>
          {/* Help card */}
          <section className="rounded-3xl border border-rose-200 p-4" style={{ background: "linear-gradient(135deg, #FFF1F2, #FFEDD5)" }}>
            <div className="flex items-start justify-between gap-2">
              <div><h2 className="font-bold text-lg text-rose-900">{lo ? "ຖືກຫຼອກ ຫຼື ສົງໄສ?" : "Scammed or unsure?"}</h2><p className="text-sm text-rose-800/80">{lo ? "ໂທຟຣີ ລາຍງານໄດ້ທັນທີ" : "Free call, report right away"}</p></div>
              <button type="button" onClick={() => setTab("hotlines")} className="min-h-11 shrink-0 flex items-center text-sm font-bold text-rose-700">{lo ? "ເບີທັງໝົດ" : "All numbers"}<ChevronRight size={16} aria-hidden /></button>
            </div>
            <div className="grid grid-cols-2 gap-2.5 mt-3">
              <a href="tel:1533" className="rounded-2xl bg-white p-3 min-h-11 shadow-sm"><span className="block text-2xl font-extrabold text-rose-600">1533</span><span className="block text-xs text-slate-600 leading-snug">{lo ? "ລາຍງານການສໍ້ໂກງອອນລາຍ" : "Report online fraud"}</span></a>
              <a href="tel:1191" className="rounded-2xl bg-white p-3 min-h-11 shadow-sm"><span className="block text-2xl font-extrabold text-slate-800">1191</span><span className="block text-xs text-slate-600 leading-snug">{lo ? "ຕຳຫຼວດ · ສຸກເສີນ" : "Police · emergency"}</span></a>
            </div>
          </section>

          <button type="button" onClick={onCheckLink} className="w-full min-h-[72px] rounded-2xl border border-border bg-background p-3.5 flex items-center gap-3 text-left">
            <span aria-hidden className="w-11 h-11 shrink-0 rounded-xl bg-[#EDE7FB] text-primary flex items-center justify-center"><Link2 size={22} /></span>
            <span className="flex-1 min-w-0">
              <span className="block font-bold text-base leading-snug text-text">{lo ? "ກວດລິ້ງທີ່ໜ້າສົງໄສ" : "Check a suspicious link"}</span>
              <span className="block text-[13px] leading-snug text-text-muted">{lo ? "ວາງລິ້ງ ແລ້ວ Sati ຈະບອກວ່າປອດໄພບໍ" : "Paste a link and Sati tells you if it's safe"}</span>
            </span>
            <ChevronRight size={20} aria-hidden className="text-text-muted shrink-0" />
          </button>

          {ranked.length > 0 && <section>
            <h2 className="flex items-center gap-2 font-bold mb-3"><TrendingUp size={18} className="text-rose-500" aria-hidden />{lo ? "ກຳລັງເປັນກະແສ" : "Trending"}</h2>
            <ol className="flex gap-3 overflow-x-auto scrollbar-hide -mx-4 px-4 pb-1">
              {ranked.slice(0, 8).map(({ tag, count, today }, i) => (
                <li key={tag} className="shrink-0">
                  <button type="button" onClick={() => open(tag)} className="relative w-[190px] h-[132px] rounded-3xl p-4 text-left text-white overflow-hidden" style={{ background: TREND_GRADS[i % TREND_GRADS.length] }}>
                    <span aria-hidden className="absolute -top-2 right-2 text-6xl font-extrabold text-white/20">#{i + 1}</span>
                    <span className="relative block font-bold text-base leading-snug line-clamp-2">{topicName(tag)}</span>
                    <span className="absolute left-4 right-4 bottom-4">
                      <span className="flex items-center justify-between text-xs font-semibold"><span>{count} {lo ? "ໂພສ" : "posts"}</span>{today > 0 && <span className="rounded-full bg-white/25 px-2 py-0.5">{lo ? "ມື້ນີ້" : "today"} +{today}</span>}</span>
                      <span aria-hidden className="mt-1.5 block h-1.5 rounded-full bg-white/25 overflow-hidden"><span className="block h-full rounded-full bg-white" style={{ width: `${(count / max) * 100}%` }} /></span>
                    </span>
                  </button>
                </li>
              ))}
            </ol>
          </section>}

          <section>
            <h2 className="flex items-center gap-2 font-bold mb-3"><Tag size={18} className="text-blue-600" aria-hidden />{lo ? "ຫົວຂໍ້" : "Topics"}</h2>
            <ul className="flex flex-wrap gap-2">
              {TOPIC_ORDER.map((tag, i) => { const c = TOPIC_TINTS[i % TOPIC_TINTS.length]; return <li key={tag}><button type="button" onClick={() => open(tag)} className={`min-h-11 px-3.5 rounded-full text-sm font-semibold ${c}`}>{topicName(tag)}</button></li>; })}
            </ul>
          </section>

          <button type="button" onClick={() => setTab("docs")} className="w-full min-h-[64px] rounded-2xl border border-border bg-background p-3.5 flex items-center gap-3 text-left">
            <span aria-hidden className="w-11 h-11 shrink-0 rounded-xl bg-[#DCEBFE] text-[#2563EB] flex items-center justify-center"><FileText size={22} /></span>
            <span className="flex-1 min-w-0 font-bold">{lo ? "ເອກະສານທາງການ" : "Official documents"}</span>
            <ChevronRight size={20} aria-hidden className="text-text-muted shrink-0" />
          </button>
        </div>
      )}
    </div>
  );
}

const TABS: [ExploreTab, { lo: string; en: string }][] = [["explore", { lo: "ສຳຫຼວດ", en: "Explore" }], ["hotlines", { lo: "ສາຍດ່ວນ", en: "Hotlines" }], ["docs", { lo: "ເອກະສານ", en: "Documents" }]];
const TREND_GRADS = ["linear-gradient(140deg,#5B21D1,#2563EB)", "linear-gradient(140deg,#E11D48,#F97316)", "linear-gradient(140deg,#0EA5E9,#10B981)", "linear-gradient(140deg,#7C3AED,#EC4899)"];
const TOPIC_TINTS = ["bg-violet-50 text-violet-700", "bg-blue-50 text-blue-700", "bg-rose-50 text-rose-700", "bg-emerald-50 text-emerald-700", "bg-amber-50 text-amber-800", "bg-sky-50 text-sky-700", "bg-fuchsia-50 text-fuchsia-700", "bg-teal-50 text-teal-700"];
const TONES: Record<Hotline["tone"], string> = { rose: "bg-rose-50 text-rose-600", blue: "bg-blue-50 text-blue-700", violet: "bg-violet-50 text-violet-700", amber: "bg-amber-50 text-amber-700", emerald: "bg-emerald-50 text-emerald-700", sky: "bg-sky-50 text-sky-700", slate: "bg-slate-100 text-slate-700" };

function Hotlines({ lang }: { lang: Lang }) {
  const lo = lang === "lo";
  return <div className={`px-4 pt-4 ${ASK_SATI_PAD} space-y-5`}>
    <p className="text-sm text-text-muted">{lo ? "ສາຍດ່ວນເຫຼົ່ານີ້ໂທຟຣີ. ກົດປຸ່ມສີຂຽວເພື່ອໂທ." : "These lines are free. Tap the green button to call."}</p>
    {HOTLINES.map(g => <section key={g.title.en}>
      <h2 className="px-1 mb-2 text-xs font-semibold text-text-muted">{lo ? g.title.lo : g.title.en}</h2>
      <ul className="rounded-2xl border border-border bg-background divide-y divide-border overflow-hidden">
        {g.items.map(h => <li key={h.number} className="flex items-center gap-3 p-3">
          <span className={`w-16 min-h-12 shrink-0 rounded-xl px-1 flex items-center justify-center text-center font-extrabold leading-tight ${h.number.length > 5 ? "text-[11px]" : "text-lg"} ${TONES[h.tone]}`}>{h.number}</span>
          <span className="flex-1 min-w-0">
            <span className="block font-bold text-sm leading-snug">{lo ? h.name.lo : h.name.en}</span>
            {h.org && <span className="block text-xs text-text-muted">{lo ? h.org.lo : h.org.en}</span>}
            {h.extra && <span className="block text-xs text-text-2 mt-0.5">{lo ? h.extra.lo : h.extra.en}</span>}
          </span>
          <a href={`tel:${h.tel}`} aria-label={`${lo ? "ໂທ" : "Call"} ${h.number} ${lo ? h.name.lo : h.name.en}`} className="w-11 h-11 shrink-0 rounded-full bg-[#22C55E] text-white flex items-center justify-center shadow-sm"><Phone size={20} aria-hidden /></a>
        </li>)}
      </ul>
    </section>)}
    <p className="text-sm font-semibold text-rose-700 text-center">{lo ? "ຖ້າມີອັນຕະລາຍທັນທີ ໂທ 1191." : "If someone is in danger now, call 1191."}</p>
  </div>;
}

function Docs({ lang }: { lang: Lang }) {
  const lo = lang === "lo";
  const [kind, setKind] = useState<DocKind | "all">("all");
  const s = TRAFFICKING_STATS_2024;
  const tints: Record<DocKind, string> = { notice: "bg-rose-50 text-rose-600", guide: "bg-blue-50 text-blue-700", plan: "bg-violet-50 text-violet-700" };
  return <div className={`px-4 pt-4 ${ASK_SATI_PAD} space-y-4`}>
    <section className="relative rounded-3xl p-5 text-white overflow-hidden" style={{ background: "linear-gradient(140deg, #1D4ED8, #2563EB 50%, #60A5FA)" }}>
      <span aria-hidden className="absolute -top-10 -right-10 w-36 h-36 rounded-full bg-white/15" />
      <p className="relative text-xs font-semibold opacity-90">{lo ? "ຕົວເລກຈາກລັດ · ປີ 2024" : "Government figures · 2024"}</p>
      <h2 className="relative text-lg font-bold">{lo ? "ການຄ້າມະນຸດໃນລາວ" : "Human trafficking in Laos"}</h2>
      <div className="relative grid grid-cols-3 gap-2 mt-3">
        {[[s.cases, lo ? "ຄະດີໃໝ່" : "new cases"], [s.victims, lo ? "ຜູ້ຖືກເຄາະຮ້າຍ" : "victims"]].map(([n, l]) => <div key={String(l)} className="rounded-2xl bg-white/20 p-2.5"><b className="block text-2xl font-extrabold">{n}</b><span className="text-[11px] leading-tight">{l}</span></div>)}
        <div className="rounded-2xl bg-white p-2.5"><b className="block text-2xl font-extrabold text-amber-500">{s.under18}</b><span className="text-[11px] leading-tight text-slate-700">{lo ? "ອາຍຸຕ່ຳກວ່າ 18" : "under 18"}</span></div>
      </div>
      <p className="relative text-[11px] opacity-85 mt-3">{lo ? "ແຫຼ່ງ: ກອງປະຊຸມຄະນະກຳມະການແຫ່ງຊາດຕ້ານການຄ້າມະນຸດ, ມັງກອນ 2025" : "Source: National Committee for Anti-Human Trafficking meeting, January 2025"}</p>
    </section>
    <div className="flex gap-2 overflow-x-auto scrollbar-hide">
      {(["all", "notice", "guide", "plan"] as const).map(k => <button key={k} type="button" aria-pressed={kind === k} onClick={() => setKind(k)}
        className={`min-h-11 px-4 rounded-[10px] text-sm font-semibold shrink-0 ${kind === k ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900" : "bg-[#F3F4F8] dark:bg-muted text-text-2"}`}>
        {k === "all" ? (lo ? "ທັງໝົດ" : "All") : lo ? DOC_KIND_LABEL[k].lo : DOC_KIND_LABEL[k].en}
      </button>)}
    </div>
    <ul className="space-y-2.5">
      {OFFICIAL_DOCS.filter(d => kind === "all" || d.kind === kind).map(d => <li key={d.url}>
        <a href={d.url} target="_blank" rel="noopener noreferrer" className="flex items-start gap-3 rounded-2xl border border-border bg-background p-3.5 min-h-11">
          <span aria-hidden className={`w-11 h-11 shrink-0 rounded-xl flex items-center justify-center ${tints[d.kind]}`}><FileText size={20} /></span>
          <span className="flex-1 min-w-0">
            <span className={`inline-block rounded-md px-1.5 py-0.5 text-[11px] font-bold ${tints[d.kind]}`}>{lo ? DOC_KIND_LABEL[d.kind].lo : DOC_KIND_LABEL[d.kind].en}</span>
            <span className="block font-bold text-sm leading-snug mt-1 font-lao">{d.title}</span>
            <span className="block text-xs text-text-muted mt-0.5">{d.source}</span>
          </span>
          <ExternalLink size={18} aria-label={lo ? "ເປີດໃນເບົາເຊີ" : "Opens in browser"} className="text-text-muted shrink-0 mt-1" />
        </a>
      </li>)}
    </ul>
  </div>;
}
