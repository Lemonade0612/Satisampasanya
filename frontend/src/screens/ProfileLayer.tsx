import { useMemo } from "react";
import { useProfileTarget } from "../lib/profileNav";
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
  if (!target) return null;
  return <div className="absolute inset-0 z-40 overflow-y-auto overflow-x-hidden overscroll-y-contain bg-background" role="region" aria-label={lang === "lo" ? "ໂປຣໄຟລ" : "Profile"}>
    {target.kind === "org"
      ? <OrgProfile key={target.slug} slug={target.slug} lang={lang} card={card} live={live} canFollow={canFollow} onNeedSignup={onNeedSignup} />
      : <UserProfile key={target.handle} handle={target.handle} lang={lang} card={card} live={live} currentUserId={currentUserId} canFollow={canFollow} onNeedSignup={onNeedSignup} />}
  </div>;
}
