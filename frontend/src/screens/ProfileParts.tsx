import { useEffect, useRef, useState, type ReactNode } from "react";
import { ArrowLeft, BadgeCheck, X } from "lucide-react";
import type { Lang } from "../types";

export const lx = (lang: Lang, lo: string, en: string) => (lang === "lo" ? lo : en);

// Sticky top bar: back button and a title that appears once the banner has scrolled away.
export function ProfileBar({ lang, title, onBack, right }: { lang: Lang; title: string; onBack: () => void; right?: ReactNode }) {
  return <div className="sticky top-0 z-20 flex items-center gap-2 px-2 h-14 bg-background/95 backdrop-blur border-b border-border">
    <button type="button" aria-label={lx(lang, "ກັບຄືນ", "Back")} onClick={onBack} className="min-h-11 min-w-11 flex items-center justify-center rounded-full text-text"><ArrowLeft size={22} aria-hidden /></button>
    <p className="flex-1 min-w-0 truncate font-bold text-[17px] text-text">{title}</p>{right}
  </div>;
}

export const VerifiedBadge = ({ lang }: { lang: Lang }) => <span className="inline-flex items-center gap-1 rounded-full bg-[#DBEAFE] px-2 py-0.5 text-[13px] font-bold text-[#1D4ED8]"><BadgeCheck size={14} aria-hidden />{lx(lang, "ຢືນຢັນແລ້ວ", "Verified")}</span>;

export function Tabs<T extends string>({ items, value, onChange, lang }: { items: { id: T; lo: string; en: string }[]; value: T; onChange: (v: T) => void; lang: Lang }) {
  return <div role="tablist" className="flex border-b border-border px-2">{items.map(t => <button key={t.id} role="tab" type="button" aria-selected={value === t.id} onClick={() => onChange(t.id)}
    className={`relative flex-1 min-h-12 text-[16px] font-bold ${value === t.id ? "text-primary-ink" : "text-text-muted"}`}>{lx(lang, t.lo, t.en)}{value === t.id && <span aria-hidden className="absolute bottom-0 left-3 right-3 h-[3px] rounded-full bg-primary" />}</button>)}</div>;
}

export function Stat({ n, label }: { n: number; label: string }) { return <div className="flex-1 text-center"><p className="text-[1.25rem] font-extrabold tabular-nums text-text">{n.toLocaleString("en-US")}</p><p className="text-[13px] text-text-muted">{label}</p></div>; }

// Bottom sheet with focus handling and Esc, for the profile ••• menu and report.
export function Sheet({ lang, title, onClose, children }: { lang: Lang; title: string; onClose: () => void; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => { const back = document.activeElement as HTMLElement | null; ref.current?.focus(); const k = (e: KeyboardEvent) => e.key === "Escape" && onClose(); document.addEventListener("keydown", k); return () => { document.removeEventListener("keydown", k); back?.focus?.(); }; }, [onClose]);
  return <div className="fixed inset-0 z-[75] flex items-end justify-center bg-black/45" onClick={onClose}>
    <div ref={ref} tabIndex={-1} role="dialog" aria-modal="true" aria-label={title} onClick={e => e.stopPropagation()} className="w-full max-w-[480px] rounded-t-3xl bg-background px-4 pt-3 pb-[calc(16px+env(safe-area-inset-bottom))] outline-none">
      <span aria-hidden className="mx-auto mb-2 block h-1 w-10 rounded-full bg-border" />
      <div className="flex items-center justify-between"><h2 className="text-[1.25rem] font-bold">{title}</h2><button type="button" aria-label={lx(lang, "ປິດ", "Close")} onClick={onClose} className="min-h-11 min-w-11 flex items-center justify-center"><X size={22} aria-hidden /></button></div>
      <div className="mt-2 flex flex-col">{children}</div>
    </div></div>;
}
export const SheetItem = ({ onClick, children, danger }: { onClick: () => void; children: ReactNode; danger?: boolean }) => <button type="button" onClick={onClick} className={`min-h-12 flex items-center gap-3 px-2 text-left text-[16px] font-bold ${danger ? "text-danger" : "text-text"}`}>{children}</button>;

// Post list with cursor paging ("Load more") shared by both profiles.
export function useCursorPosts<T>(first: { posts: T[]; nextCursor: string | null } | null, more: (cursor: string) => Promise<{ posts: T[]; nextCursor: string | null }>) {
  const [items, setItems] = useState<T[]>([]), [cursor, setCursor] = useState<string | null>(null), [busy, setBusy] = useState(false);
  useEffect(() => { if (first) { setItems(first.posts); setCursor(first.nextCursor); } }, [first]);
  const load = async () => { if (!cursor || busy) return; setBusy(true); try { const r = await more(cursor); setItems(p => [...p, ...r.posts]); setCursor(r.nextCursor); } finally { setBusy(false); } };
  return { items, hasMore: !!cursor, busy, load };
}
