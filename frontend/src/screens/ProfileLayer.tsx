import { useEffect, useMemo } from "react";
import { closeProfile, useProfileTarget } from "../lib/profileNav";
import { OrgProfile } from "./OrgProfile";
import { UserProfile } from "./UserProfile";
import type { Lang, Post } from "../types";

export type CardProps = {
  onOpenComments: (id: string) => void; onLike: (id: string) => void; onRepost: (id: string) => void; onWarnedMe: (id: string) => void;
  onRepostClick: (post: Post) => void; onImageExpand?: (url: string) => void; onTopicClick?: (topic: string) => void; readOnly?: boolean; canReport?: boolean;
};

// A profile opens over whatever screen is showing, inside the content area (above the bottom nav, never under it), and also
// works as a page through the URL (#/org/<slug>, #/u/<handle>). It scrolls fully and keeps the safe area clear.
export function ProfileLayer({ lang, posts, card, currentUserId, canFollow, onNeedSignup }: { lang: Lang; posts: Post[]; card: CardProps; currentUserId?: string; canFollow: boolean; onNeedSignup: () => void }) {
  const target = useProfileTarget();
  const live = useMemo(() => new Map(posts.map(p => [p.id, p])), [posts]);
  useEffect(() => {
    if (target?.kind !== "org") return;
    const esc = (e: KeyboardEvent) => { if (e.key === "Escape") closeProfile(); };
    document.addEventListener("keydown", esc); return () => document.removeEventListener("keydown", esc);
  }, [target?.kind]);
  if (!target) return null;
  // Organisations pop up over the feed like a sheet: dimmed feed behind, tap outside or Esc to close, nav stays visible.
  if (target.kind === "org") return <div className="absolute inset-0 z-40 bg-[rgba(20,17,43,0.45)] sati-pop-bg">
    <style>{`@keyframes satiPopUp{from{transform:translateY(40px) scale(.96);opacity:0}to{transform:none;opacity:1}}@keyframes satiFade{from{opacity:0}to{opacity:1}}.sati-pop{animation:satiPopUp .28s cubic-bezier(.2,.9,.3,1.1)}.sati-pop-bg{animation:satiFade .2s}@media (prefers-reduced-motion:reduce){.sati-pop,.sati-pop-bg{animation:none}}`}</style>
    <button type="button" aria-label={lang === "lo" ? "ປິດ" : "Close"} onClick={closeProfile} className="absolute inset-0 w-full h-full cursor-default" />
    <div role="dialog" aria-modal="true" aria-label={lang === "lo" ? "ໂປຣໄຟລ໌ອົງການ" : "Organisation profile"} className="sati-pop absolute left-0 right-0 bottom-0 top-14 mx-auto max-w-[480px] overflow-y-auto overflow-x-hidden overscroll-y-contain rounded-t-[28px] bg-white shadow-[0_-12px_40px_rgba(20,17,43,0.28)]">
      <OrgProfile key={target.slug} slug={target.slug} lang={lang} card={card} live={live} canFollow={canFollow} onNeedSignup={onNeedSignup} />
    </div>
  </div>;
  return <div className="absolute inset-0 z-40 overflow-y-auto overflow-x-hidden overscroll-y-contain bg-background" role="region" aria-label={lang === "lo" ? "ໂປຣໄຟລ" : "Profile"}>
    <UserProfile key={target.handle} handle={target.handle} lang={lang} card={card} live={live} currentUserId={currentUserId} canFollow={canFollow} onNeedSignup={onNeedSignup} />
  </div>;
}
