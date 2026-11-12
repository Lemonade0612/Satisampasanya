import { Fragment, type ReactNode } from "react";
import en from "../../content/policies.md?raw";
import lo from "../../content/policies.lo.md?raw";
import type { Lang } from "../../types";

export type PolicyKind = "privacy" | "guidelines" | "terms";
export const POLICY_TITLES: Record<PolicyKind, { en: string; lo: string }> = {
  privacy: { en: "Privacy Policy", lo: "ນະໂຍບາຍຄວາມເປັນສ່ວນຕົວ" },
  guidelines: { en: "Community Guidelines", lo: "ກົດລະບຽບຊຸມຊົນ" },
  terms: { en: "Terms of Use", lo: "ເງື່ອນໄຂການນຳໃຊ້" },
};
export const EFFECTIVE = { en: "Effective date: 12 November 2026", lo: "ມີຜົນບັງຄັບໃຊ້: 12 ພະຈິກ 2026" };
const ORDER: PolicyKind[] = ["privacy", "guidelines", "terms"];

// Each file has three top-level "# " sections, in ORDER. The per-section "Effective date" line is dropped (the screen shows it).
const split = (raw: string) => {
  const parts = raw.replace(/<!--[\s\S]*?-->/g, "").split(/^# .+$/m).slice(1).map(p => p.replace(/^\*\*[^*\n]+:\*\*.*$/m, "").trim());
  return Object.fromEntries(ORDER.map((id, i) => [id, parts[i] || ""])) as Record<PolicyKind, string>;
};
const SECTIONS = { en: split(en), lo: split(lo) };

// **bold** and plain e-mail links; everything else is plain text.
function inline(text: string): ReactNode[] {
  return text.split(/(\*\*[^*]+\*\*|[\w.+-]+@[\w-]+\.[\w.]+)/g).map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) return <strong key={i} className="font-semibold text-foreground">{part.slice(2, -2)}</strong>;
    if (/^[\w.+-]+@[\w-]+\.[\w.]+$/.test(part)) return <a key={i} href={`mailto:${part}`} className="text-primary underline">{part}</a>;
    return <Fragment key={i}>{part}</Fragment>;
  });
}

/** Renders the policy markdown (## headings, - bullets, **bold**, e-mail links) in the selected language. */
export function PolicyBody({ kind, lang }: { kind: PolicyKind; lang: Lang }) {
  const out: ReactNode[] = [];
  let list: string[] = [];
  const flush = () => {
    if (!list.length) return;
    out.push(<ul key={out.length} className="list-disc pl-5 space-y-1.5 mb-3">{list.map((li, i) => <li key={i}>{inline(li)}</li>)}</ul>);
    list = [];
  };
  for (const line of SECTIONS[lang][kind].split("\n")) {
    const l = line.trim();
    if (l.startsWith("- ")) { list.push(l.slice(2)); continue; }
    flush();
    if (!l || l === "---") continue;
    if (l.startsWith("## ")) out.push(<h3 key={out.length} className="font-display font-bold text-base text-foreground mt-5 mb-2">{l.slice(3)}</h3>);
    else out.push(<p key={out.length} className="mb-3">{inline(l)}</p>);
  }
  flush();
  return <div className="text-[15px] leading-relaxed text-foreground/90">{out}</div>;
}
