export type CuratedType = 'news' | 'event' | 'hotline' | 'job' | 'study' | 'awareness' | 'video';
export type CuratedStatus = 'approved' | 'pending' | 'rejected';
export interface CuratedVideo { url: string; embed_url?: string; poster?: string }
export interface CuratedPost {
  id: string; type: CuratedType; status: CuratedStatus; needs_human_review: boolean; verified: boolean; pinned: boolean;
  title_lo: string; title_en: string; summary_lo: string; summary_en: string;
  image: string | null; source_name: string; source_url: string | null; date: string | null; tags: string[];
  warning_lo?: string; warning_en?: string; review_note?: string; shows_minors?: boolean; content_warning?: boolean; owner_override?: string; credit?: { name: string; platform?: string; url?: string }; body_lo?: string; body_en?: string;
  expired?: boolean; expires?: string; contact?: { tel?: string; email?: string }; video?: CuratedVideo;
}
export declare const CURATED_POSTS: CuratedPost[];
export declare const STATUSES: CuratedStatus[];
export declare function isExpired(post: Pick<CuratedPost, 'expired' | 'expires'>, now?: number): boolean;
export declare function sortFeed<T extends Pick<CuratedPost, 'pinned' | 'date'>>(posts: T[]): T[];
