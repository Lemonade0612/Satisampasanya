// ═══════════════════════════════════════════════════════════════════════════════
//  TYPES
// ═══════════════════════════════════════════════════════════════════════════════
export type PostState = "clean" | "flagged" | "confirmed" | "false" | "sla";
export type ActiveView = "feed" | "explore" | "profile";
export type ProfileTab = "posts" | "topics" | "points";
export type AuthView = "welcome" | "login" | "register" | "forgot";
export type Lang = "en" | "lo";
export type LeafState = "none" | "pending" | "verified" | "featured";
export type ThemeMode = "light" | "dark" | "system";
export type ScreeningStage = "ai_screening" | "expert_review" | "auto_unlock" | "completed";

export interface Author {
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

export interface Post {
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
  flagReason?: string;
  flagReasonLo?: string;
  correction?: string;
  correctionLo?: string;
  points?: number;
  featuredPoints?: boolean;
  isNews?: boolean;
  image?: string;
  hasVideo?: boolean;
  link?: string;
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
