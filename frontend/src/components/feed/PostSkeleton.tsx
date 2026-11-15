import type { PostType } from "../../types";
const bar = (w: string, h = "h-3.5") => <span className={`block ${h} ${w} rounded-md bg-surface-2 animate-pulse motion-reduce:animate-none`} />;
// Placeholder shaped like each post type, so the feed does not jump when posts arrive.
export function PostSkeleton({ type = "text" }: { type?: PostType }) {
  return <div role="status" aria-busy="true" aria-label="Loading" className="bg-background rounded-2xl overflow-hidden pt-4">
    <div className="px-4 flex items-center gap-3"><span className="w-[42px] h-[42px] rounded-full bg-surface-2 animate-pulse motion-reduce:animate-none" /><div className="flex-1 flex flex-col gap-2">{bar("w-1/3")}{bar("w-1/5", "h-3")}</div></div>
    <div className="px-4 mt-3 flex flex-col gap-2">{bar("w-full", "h-4")}{bar(type === "text" ? "w-5/6" : "w-2/3", "h-4")}{type === "text" && bar("w-3/4", "h-4")}</div>
    {(type === "poster" || type === "video") && <span className="mt-3 block w-full aspect-[4/3] bg-surface-2 animate-pulse motion-reduce:animate-none" />}
    {type === "link" && <div className="mx-4 mt-3 h-[72px] rounded-2xl bg-surface-2 animate-pulse motion-reduce:animate-none" />}
    <div className="mt-3 h-[58px] border-t border-border" />
  </div>;
}
