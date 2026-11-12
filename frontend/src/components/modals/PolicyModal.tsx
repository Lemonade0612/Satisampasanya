import { Fragment, type ReactNode } from "react";
import { X, Mail } from "lucide-react";
import raw from "../../content/policies.md?raw";
import type { Lang } from "../../types";

export type PolicyId = "privacy" | "guidelines" | "terms";

const CONTACT = "satisampasanya@gmail.com";
const TITLES: Record<PolicyId, { en: string; lo: string }> = {
  privacy: { en: "Privacy Policy", lo: "ນະໂຍບາຍຄວາມເປັນສ່ວນຕົວ" },
  guidelines: { en: "Community Guidelines", lo: "ກົດລະບຽບຊຸມຊົນ" },
  terms: { en: "Terms of Use", lo: "ເງື່ອນໄຂການນຳໃຊ້" },
};
const ORDER: PolicyId[] = ["privacy", "guidelines", "terms"];

// Split the markdown on its three top-level "# " headings, in ORDER.
const SECTIONS: Record<PolicyId, string> = (() => {
  const parts = raw.replace(/<!--[\s\S]*?-->/g, "").split(/^# .+$/m).slice(1);
  return Object.fromEntries(ORDER.map((id, i) => [id, (parts[i] || "").trim()])) as Record<PolicyId, string>;
})();

// **bold** and plain e-mail links; everything else is plain text.
function inline(text: string): ReactNode[] {
  return text.split(/(\*\*[^*]+\*\*|[\w.+-]+@[\w-]+\.[\w.]+)/g).map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) return <strong key={i} className="font-semibold text-foreground">{part.slice(2, -2)}</strong>;
    if (/^[\w.+-]+@[\w-]+\.[\w.]+$/.test(part)) return <a key={i} href={`mailto:${part}`} className="text-primary underline">{part}</a>;
    return <Fragment key={i}>{part}</Fragment>;
  });
}

function render(md: string): ReactNode[] {
  const out: ReactNode[] = [];
  let list: string[] = [];
  const flush = () => {
    if (!list.length) return;
    out.push(<ul key={out.length} className="list-disc pl-5 space-y-1.5 mb-3">{list.map((li, i) => <li key={i}>{inline(li)}</li>)}</ul>);
    list = [];
  };
  for (const line of md.split("\n")) {
    const l = line.trim();
    if (l.startsWith("- ")) { list.push(l.slice(2)); continue; }
    flush();
    if (!l || l === "---") continue;
    if (l.startsWith("## ")) out.push(<h3 key={out.length} className="font-display font-bold text-base text-foreground mt-5 mb-2">{l.slice(3)}</h3>);
    else out.push(<p key={out.length} className="mb-3">{inline(l)}</p>);
  }
  flush();
  return out;
}

export function PolicyModal({ lang, policy, onChange, onClose }: {
  lang: Lang; policy: PolicyId | null; onChange: (p: PolicyId) => void; onClose: () => void;
}) {
  if (!policy) return null;
  return (
    <div className="fixed inset-0 z-[60] bg-background flex flex-col" role="dialog" aria-modal="true" aria-label={TITLES[policy].en}>
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <h2 className="font-display font-bold text-lg font-lao">{TITLES[policy][lang]}</h2>
        <button onClick={onClose} aria-label="Close" className="p-2 -mr-2 rounded-full hover:bg-muted/50"><X size={20} /></button>
      </div>
      <div className="flex gap-1.5 px-4 py-2 border-b border-border overflow-x-auto scrollbar-hide">
        {ORDER.map(id => (
          <button key={id} onClick={() => onChange(id)}
            className={`shrink-0 text-xs font-semibold px-3 py-1.5 rounded-full font-lao ${id === policy ? "bg-primary text-white" : "border border-border text-foreground/70"}`}>
            {TITLES[id][lang]}
          </button>
        ))}
      </div>
      <div className="flex-1 overflow-y-auto px-5 py-4 text-sm leading-relaxed text-foreground/85">
        {lang === "lo" && (
          <p className="mb-4 rounded-xl bg-muted/50 p-3 text-xs font-lao">ສະບັບພາສາລາວກຳລັງກະກຽມ. ຫາກມີຄຳຖາມ ຕິດຕໍ່ <a href={`mailto:${CONTACT}`} className="text-primary underline">{CONTACT}</a></p>
        )}
        {render(SECTIONS[policy])}
        <a href={`mailto:${CONTACT}`} className="mt-4 mb-8 flex items-center justify-center gap-2 py-3 rounded-2xl border border-border text-sm font-semibold">
          <Mail size={16} /> {CONTACT}
        </a>
      </div>
    </div>
  );
}

/** Small row of links to the three policies. */
export function PolicyLinks({ lang, onOpen, className = "" }: { lang: Lang; onOpen: (p: PolicyId) => void; className?: string }) {
  return (
    <div className={`flex flex-wrap justify-center gap-x-3 gap-y-1 text-xs text-muted-foreground font-lao ${className}`}>
      {ORDER.map(id => <button key={id} type="button" onClick={() => onOpen(id)} className="underline hover:text-primary">{TITLES[id][lang]}</button>)}
    </div>
  );
}
