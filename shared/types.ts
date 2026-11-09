// ═══════════════════════════════════════════════════════════════════════════════
//  TYPES
// ═══════════════════════════════════════════════════════════════════════════════
export type PostState = "clean" | "flagged" | "confirmed" | "false" | "sla" | "rejected";
export type ActiveView = "feed" | "explore" | "profile" | "assistant" | "daily";
export type ProfileTab = "posts" | "topics" | "points";
export type AuthView = "welcome" | "login" | "register" | "forgot";
export type Lang = "en" | "lo";
// Age band the viewer picked. Only this id is stored (on the device, and on the account when signed in),
// never a birth date or exact age.
export type Band = "kids" | "youth" | "adult" | "elder";
export type LeafState = "none" | "pending" | "verified" | "featured";
export type ThemeMode = "light" | "dark" | "system";
export type ScreeningStage = "ai_screening" | "expert_review" | "auto_unlock" | "completed";

export interface Author {
  id?: string;
  name: string;
  handle: string;
  initials: string;
  color: string;
  points: number;
}

export interface ScreeningLog {
  stage: ScreeningStage;
  timestamp: number;
  message: string;
  severity?: "low" | "medium" | "high" | "severe";
}

export interface CheckResult {
 source?:'training';
 verdict:'approved'|'caution'|'needs_expert';risk:'low'|'medium'|'high';labels:string[];on_topic:boolean;
 reasons:{text:string;evidence:string}[];suggested_edit:string;summary:string;language:Lang;checkedAt?:number;
}
export interface Post {
 communityRanking?:{eligible:boolean;score:number;rank:number;parts:{review:number;safety:number;engagement:number}};
 review?:{state:string;note:string;reviewedAt:number;reviewerName:string};
 check?:CheckResult;seed?:boolean;frozen?:boolean;
  screening?: {mode:'rules'|'ai'|'rules-fallback';severity:string;flags:string[];note:string;noteLo:string;checkedAt:number};
  translationText?:string;
  translationStatus?: 'manual'|'generated'|'unavailable'|'failed';
  createdAt?: number;
  contentLanguage?: Lang;
  liked?: boolean;
  warned?: boolean;
  isDemo?: boolean;
  id: string;
  author: Author;
  content: string;
  contentLo?: string;
  tags: string[];
  timestamp: string;
  state: PostState;
  likes: number;
  comments: number;
  reposts: number;
  warnedMe: number;
  shares?: number;
  flagReason?: string;
  flagReasonLo?: string;
  correction?: string;
  correctionLo?: string;
  points?: number;
  featuredPoints?: boolean;
  isNews?: boolean;
  image?: string;
  // Age targeting: no `bands` = everyone; `essential` = safety basics shown to every band.
  bands?: Band[];
  essential?: boolean;
  // Gentle text for Kids; falls back to content/contentLo.
  contentKids?: string;
  contentKidsLo?: string;
  hasVideo?: boolean;
  link?: string;
  interactionPeople?: Author[];
  originalPost?: Post;
  repostOf?: string;
  repostText?: string;
  // AI Screening fields
  screeningStage?: ScreeningStage;
  screeningLogs?: ScreeningLog[];
  aiSeverity?: "none" | "low" | "medium" | "high" | "severe";
  aiFlags?: string[];
  expertAssigned?: boolean;
  expertReviewDeadline?: number;
  autoUnlockTimer?: number;
}

export interface CurrentUser {
  id?: string;
  ageBand?: Band | null;
  handle?: string;
  bio?: string;
  followed?: string[];
  following?: string[];
  avatar?: string | null;
  banner?: string | null;
  name: string;
  email: string;
}

export interface UploadedFile {
  id: string;
  file: File;
  preview: string;
  progress: number;
  status: "uploading" | "done" | "error";
}

export interface AIAnalysisResult {
  severity: "none" | "low" | "medium" | "high" | "severe";
  flags: string[];
  confidence: number;
  recommendedAction: "publish" | "publish_with_disclaimer" | "flag_for_review" | "block";
  reasoning: string;
}

export interface PostDraft {
  contentLanguage?:Lang;
  content: string;
  contentLo?: string;
  tags: string[];
  link?: string;
  image?: string;
  isNews?: boolean;
}
export interface Comment {
  id: string;
  text: string;
  createdAt: number;
  author: Author;
}

export interface Notification {
  id: string;
  actor_name: string;
  review_state?: PostState;
  kind: 'comment'|'like'|'warned'|'repost'|'review'|'news'|'safety'|'review_requested'|'review_overdue';
  post_id: string;
  created: number;
  read: number;
}
