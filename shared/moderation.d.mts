export type ModerationDecision = 'approve' | 'review' | 'reject';
export interface ModerationResult { decision: ModerationDecision; reasons: string[]; flags: string[] }
export interface ModerationInput {
  type?: string; title_lo?: string; title_en?: string; summary_lo?: string; summary_en?: string; title?: string; summary?: string; text?: string;
  tags?: string[]; source_name?: string; source_url?: string | null; shows_minors?: boolean; needs_human_review?: boolean;
}
export declare const CORE_TOPICS: string[];
export declare const SENSITIVE_TYPES: string[];
export declare const REDFLAG_NAMES: string[];
export declare const trustedSources: { id: string; names: string[]; domains: string[] }[];
export declare function trustedSourceId(post: Pick<ModerationInput, 'source_name' | 'source_url'>): string | null;
export declare function isTrustedSource(post: Pick<ModerationInput, 'source_name' | 'source_url'>): boolean;
export declare function postText(post: ModerationInput): string;
export declare function moderate(post: ModerationInput): ModerationResult;
export declare function moderateWithAI(post: ModerationInput, check?: (text: string) => Promise<{ verdict?: string; on_topic?: boolean; labels?: string[]; summary?: string } | null | undefined>): Promise<ModerationResult>;
