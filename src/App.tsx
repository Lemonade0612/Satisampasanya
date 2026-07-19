import { useState, useEffect, useCallback, useRef } from "react";
import {
  Heart, MessageCircle, Share2, Repeat2, Flag, ArrowLeft, X,
  AlertTriangle, Clock, Bell, Search, Home, User, Plus, Shield,
  Zap, Link2, Check, Send, Eye, EyeOff, Pencil, Play, ChevronRight,
  Camera, Image as ImageIcon, Moon, Sun, TrendingUp, Upload, FileImage,
  Trash2, ChevronDown, Globe, Lock, AlertOctagon, ExternalLink,
} from "lucide-react";

// ═══════════════════════════════════════════════════════════════════════════════
//  IMAGE IMPORTS
// ═══════════════════════════════════════════════════════════════════════════════
import imgBcel   from "@/imports/Screenshot_2026-07-19_at_14.04.04.png";
import imgApk    from "@/imports/Screenshot_2026-07-19_at_14.03.50.png";
import imgLaoPost from "@/imports/Screenshot_2026-07-19_at_14.05.21.png";
import imgPhoneScam from "@/imports/image-13.png";
import imgTraffickingVideo from "@/imports/image-11.png";
import imgTruck  from "@/imports/image-12.png";
import imgTraffickingPoster from "@/imports/image-10.png";
import imgTiktokScam from "@/imports/image-14.png";

// ═══════════════════════════════════════════════════════════════════════════════
//  TYPES
// ═══════════════════════════════════════════════════════════════════════════════
type PostState = "clean" | "flagged" | "confirmed" | "false" | "sla";
type ActiveView = "feed" | "explore" | "profile";
type ProfileTab = "posts" | "topics" | "points";
type AuthView = "welcome" | "login" | "register" | "forgot";
type Lang = "en" | "lo";
type LeafState = "none" | "pending" | "verified" | "featured";
type ThemeMode = "light" | "dark" | "system";

interface Author {
  name: string;
  handle: string;
  initials: string;
  color: string;
  points: number;
}

interface Post {
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
}

interface CurrentUser {
  name: string;
  email: string;
}

interface UploadedFile {
  id: string;
  file: File;
  preview: string;
  progress: number;
  status: "uploading" | "done" | "error";
}

// ═══════════════════════════════════════════════════════════════════════════════
//  BILINGUAL TOPIC LABELS
// ═══════════════════════════════════════════════════════════════════════════════
const TOPIC_LABELS: Record<string, { en: string; lo: string }> = {
  OnlineScam:    { en: "OnlineScam",    lo: "ການຫຼອກລວງອອນລາຍ" },
  Trafficking:   { en: "Trafficking",   lo: "ການຄ້າມະນຸດ" },
  DigitalSafety: { en: "DigitalSafety", lo: "ຄວາມປອດໄພດິຈິຕອລ" },
  JobScam:       { en: "JobScam",       lo: "ການຫຼອກລວງຊອກວຽກ" },
  CryptoScam:    { en: "CryptoScam",    lo: "ການຫຼອກລວງ Crypto" },
  BorderSafety:  { en: "BorderSafety",  lo: "ຄວາມປອດໄພຊາຍແດນ" },
  SocialMedia:   { en: "SocialMedia",   lo: "ສື່ສັງຄົມ" },
  PhishingAlert: { en: "PhishingAlert", lo: "ແຈ້ງເຕືອນ Phishing" },
  RomanceScam:   { en: "RomanceScam",   lo: "ການຫຼອກລວງຄວາມຮັກ" },
  DataPrivacy:   { en: "DataPrivacy",   lo: "ຄວາມເປັນສ່ວນຕົວ" },
};

// ═══════════════════════════════════════════════════════════════════════════════
//  TRANSLATIONS
// ═══════════════════════════════════════════════════════════════════════════════
const T = {
  en: {
    app_name: "Satisampasanya", app_short: "Sati",
    welcome_title: "Stay Safe\nOnline",
    welcome_sub: "Satisampasanya helps Lao youth spot scams, trafficking, and digital threats before they happen.",
    btn_login: "Sign In", btn_register: "Register",
    login_title: "Welcome back", login_sub: "You've been missed!",
    register_title: "Create Account", register_sub: "Join Lao youth keeping each other safe",
    field_name: "Full name", field_email: "Email address",
    field_password: "Password", field_confirm: "Confirm password",
    forgot_link: "Forgot your password?", btn_signin: "Sign In", btn_signup: "Sign Up",
    or_continue: "Or continue with", create_account: "Create new account",
    have_account: "Already have an account", forgot_title: "Reset Password",
    forgot_sub: "Enter your email and we'll send a reset link",
    btn_send_reset: "Send Reset Link", back_signin: "Back to Sign In",
    reset_sent: "Reset link sent! Check your email.",
    err_required: "This field is required", err_email: "Enter a valid email address",
    err_pw_short: "Password must be at least 8 characters", err_pw_match: "Passwords do not match",
    lang_switch: "ລາວ",
    nav_home: "Home", nav_explore: "Explore", nav_alerts: "Alerts", nav_profile: "Profile",
    feed_for_you: "For You", feed_following: "Following",
    caught_up_en: "You're all caught up", caught_up_lo: "ທ່ານໄດ້ອ່ານໝົດແລ້ວ",
    compose_short: "Short", compose_news: "News", compose_post: "Post",
    compose_info: "Points only for expert-verified posts. Featured bonus for verified posts that spread awareness. Limit: 2 posts + 5 comments per day.",
    compose_remaining: "posts remaining today",
    compose_ph_short: "What scam or safety issue are you seeing? (max 150 chars)",
    compose_ph_news: "Write a detailed news post with context... (500-2000 chars)",
    compose_sources: "Source Links (required for News)", compose_source_ph: "Source URL",
    compose_topics: "Topic Tags", compose_topics_hint: "pick at least one",
    compose_photos: "Attach Photos", compose_photos_hint: "Drag & drop or tap to upload",
    edit_profile: "Edit Profile", save: "Save", cancel: "Cancel",
    add_topic: "+ Add topics", posts: "Posts", topics: "Topics", points_tab: "Points",
    total_points: "Total verified points", rank: "Rank", region: "Vientiane region",
    recent_activity: "Recent Activity", post_verified: "Post verified accurate",
    trending: "Trending Topics", search_ph: "Search topics, posts, people...",
    bio_ph: "Write your bio...", social_coming_soon: "Social login coming soon",
    reply_ph: "Write a reply...", no_replies: "No replies yet — be the first to respond.",
    banner_review_title: "Under Expert Review", banner_false_title: "Confirmed False",
    banner_correction: "Correction: ", banner_sla: "Not reviewed in time — fully unlocked, no verified points",
    warned_me: "Warned me", verified_pts: "verified pts", featured_bonus: "Featured bonus",
    news_label: "News", alerts_title: "Alerts", alerts_mark_all: "Mark all read",
    topic_posts: "posts", back: "Back", posted: "Posted! Under AI screening.",
    change_avatar: "Change Avatar", change_banner: "Change Banner",
    share: "Share", remove: "Remove", uploading: "Uploading...",
    theme_light: "Light", theme_dark: "Dark", theme_system: "System",
    stats_reports: "Reports filed", stats_blocked: "Scams blocked", stats_trained: "Youth trained",
    story_breaking: "BREAKING", story_read_more: "Read full story",
    safety_checklist: "Digital Safety Checklist",
    safety_tip_otp: "Never share OTPs, passwords, or banking PINs — even with \"bank staff\"",
    safety_tip_job: "Verify job offers through official company websites, not just WhatsApp",
    safety_tip_apk: "Don't install APK files from unknown sources — they may contain malware",
    safety_tip_url: "Check URLs carefully — scammers use lookalike domains (e.g., facebo0k.com)",
    safety_tip_too_good: "If it sounds too good to be true (free money, guaranteed returns), it is",
    footer: "Satisampasanya · ສະຕິຊໍາປະຊັນຍະ · Built for Lao youth safety",
  },
  lo: {
    app_name: "ສະຕິຊໍາປະຊັນຍະ", app_short: "ສາຕິ",
    welcome_title: "ປອດໄພ\nທາງອອນລາຍ",
    welcome_sub: "ສະຕິຊໍາປະຊັນຍະ ຊ່ວຍໄວໜຸ່ມລາວຮູ້ຈັກການຫຼອກລວງ, ການຄ້າມະນຸດ ແລະ ໄພດິຈິຕອລ ກ່ອນທີ່ມັນຈະເກີດຂຶ້ນ.",
    btn_login: "ເຂົ້າສູ່ລະບົບ", btn_register: "ລົງທະບຽນ",
    login_title: "ຍິນດີຕ້ອນຮັບຄືນ", login_sub: "ພວກເຮົາຄິດຮອດທ່ານ!",
    register_title: "ສ້າງບັນຊີ", register_sub: "ເຂົ້າຮ່ວມໄວໜຸ່ມລາວທີ່ຮັກສາຄວາມປອດໄພ",
    field_name: "ຊື່ເຕັມ", field_email: "ທີ່ຢູ່ອີເມລ",
    field_password: "ລະຫັດຜ່ານ", field_confirm: "ຢືນຢັນລະຫັດຜ່ານ",
    forgot_link: "ລືມລະຫັດຜ່ານ?", btn_signin: "ເຂົ້າສູ່ລະບົບ", btn_signup: "ລົງທະບຽນ",
    or_continue: "ຫຼືດຳເນີນການດ້ວຍ", create_account: "ສ້າງບັນຊີໃໝ່",
    have_account: "ມີບັນຊີແລ້ວ", forgot_title: "ຣີເຊັດລະຫັດຜ່ານ",
    forgot_sub: "ປ້ອນອີເມລຂອງທ່ານ ແລ້ວພວກເຮົາຈະສົ່ງລິ້ງຣີເຊັດ",
    btn_send_reset: "ສົ່ງລິ້ງຣີເຊັດ", back_signin: "ກັບໄປເຂົ້າສູ່ລະບົບ",
    reset_sent: "ສົ່ງລິ້ງຣີເຊັດແລ້ວ! ກວດເບິ່ງອີເມລຂອງທ່ານ.",
    err_required: "ກະລຸນາປ້ອນຂໍ້ມູນ", err_email: "ປ້ອນທີ່ຢູ່ອີເມລທີ່ຖືກຕ້ອງ",
    err_pw_short: "ລະຫັດຜ່ານຕ້ອງມີຢ່າງໜ້ອຍ 8 ຕົວອັກສອນ", err_pw_match: "ລະຫັດຜ່ານບໍ່ກົງກັນ",
    lang_switch: "EN",
    nav_home: "ໜ້າຫຼັກ", nav_explore: "ຄົ້ນຫາ", nav_alerts: "ແຈ້ງເຕືອນ", nav_profile: "ໂປຣໄຟລ",
    feed_for_you: "ສຳລັບທ່ານ", feed_following: "ຕິດຕາມ",
    caught_up_en: "You're all caught up", caught_up_lo: "ທ່ານໄດ້ອ່ານໝົດແລ້ວ",
    compose_short: "ສັ້ນ", compose_news: "ຂ່າວ", compose_post: "ໂພສ",
    compose_info: "ຄະແນນສຳລັບໂພສທີ່ຜ່ານການກວດສອບໂດຍຜູ້ຊ່ຽວຊານເທົ່ານັ້ນ. ຈຳກັດ: 2 ໂພສ + 5 ຄອມເມັນຕໍ່ວັນ.",
    compose_remaining: "ໂພສຍັງເຫຼືອ",
    compose_ph_short: "ທ່ານເຫັນການຫຼອກລວງຫຍັງ? (ສູງສຸດ 150 ຕົວອັກສອນ)",
    compose_ph_news: "ຂຽນໂພສຂ່າວລະອຽດ...",
    compose_sources: "ລິ້ງແຫຼ່ງຂໍ້ມູນ", compose_source_ph: "URL ແຫຼ່ງຂໍ້ມູນ",
    compose_topics: "ໝວດໝູ່", compose_topics_hint: "ເລືອກຢ່າງໜ້ອຍໜຶ່ງ",
    compose_photos: "ແນບຮູບ", compose_photos_hint: "ລາກ ແລະ ວາງ ຫຼື ແຕະເພື່ອອັບໂຫຼດ",
    edit_profile: "ແກ້ໄຂໂປຣໄຟລ", save: "ບັນທຶກ", cancel: "ຍົກເລີກ",
    add_topic: "+ ເພີ່ມໝວດ", posts: "ໂພສ", topics: "ໝວດໝູ່", points_tab: "ຄະແນນ",
    total_points: "ຄະແນນທີ່ໄດ້ຮັບ", rank: "ອັນດັບ", region: "ເຂດວຽງຈັນ",
    recent_activity: "ກິດຈະກຳຫຼ້າສຸດ", post_verified: "ໂພສໄດ້ຮັບການຢືນຢັນ",
    trending: "ໝວດໝູ່ທີ່ກຳລັງນິຍົມ", search_ph: "ຄົ້ນຫາໝວດໝູ່, ໂພສ, ຄົນ...",
    bio_ph: "ຂຽນປະຫວັດຂອງທ່ານ...", social_coming_soon: "ກຳລັງມາໄວໆນີ້",
    reply_ph: "ຂຽນຄຳຕອບ...", no_replies: "ຍັງບໍ່ມີຄຳຕອບ — ເປັນຄົນທຳອິດ.",
    banner_review_title: "ພາຍໃຕ້ການກວດສອບຂອງຜູ້ຊ່ຽວຊານ",
    banner_false_title: "ຢືນຢັນວ່າເປັນຂໍ້ມູນທີ່ຜິດ",
    banner_correction: "ຄຳແກ້ໄຂ: ",
    banner_sla: "ບໍ່ໄດ້ຮັບການກວດສອບທັນເວລາ — ໂພສຖືກປົດລ໋ອກ, ແຕ່ບໍ່ໄດ້ຄະແນນ",
    warned_me: "ເຕືອນຂ້ອຍ", verified_pts: "ຄະແນນຢືນຢັນ", featured_bonus: "ໂບນັດຍອດນິຍົມ",
    news_label: "ຂ່າວ", alerts_title: "ແຈ້ງເຕືອນ", alerts_mark_all: "ໝາຍທັງໝົດວ່າອ່ານແລ້ວ",
    topic_posts: "ໂພສ", back: "ກັບ", posted: "ໂພສແລ້ວ! ກຳລັງກວດສອບໂດຍ AI.",
    change_avatar: "ປ່ຽນ Avatar", change_banner: "ປ່ຽນ Banner",
    share: "ແຊຣ໌", remove: "ລຶບ", uploading: "ກຳລັງອັບໂຫຼດ...",
    theme_light: "ສະຫວ່າງ", theme_dark: "ມືດ", theme_system: "ລະບົບ",
    stats_reports: "ລາຍງານແລ້ວ", stats_blocked: "ຫຼອກລວງຖືກບລັອກ", stats_trained: "ໄວໜຸ່ມທີ່ຜ່ານການຝຶກ",
    story_breaking: "ຂ່າວດ່ວນ", story_read_more: "ອ່ານຕໍ່",
    safety_checklist: "ລາຍການກວດສອບຄວາມປອດໄພດິຈິຕອລ",
    safety_tip_otp: "ຢ່າແຊຣ໌ OTP, ລະຫັດຜ່ານ, ຫຼື PIN ເງິນຝາກ — ເຖິງແມ່ນກັບ \"ພະນັກງານທະນາຄານ\"",
    safety_tip_job: "ຢືນຢັນຂໍ້ສະເໜີວຽກຜ່ານເວັບໄຊທາງການ, ບໍ່ແມ່ນແຕ່ WhatsApp",
    safety_tip_apk: "ຢ່າຕິດຕັ້ງໄຟລ APK ຈາກແຫຼ່ງທີ່ບໍ່ຮູ້ຈັກ — ອາດມີ malware",
    safety_tip_url: "ກວດເບິ່ງ URL ໃຫ້ລະອຽດ — ຜູ້ຫຼອກລວງໃຊ້ໂດເມນທີ່ຄ້າຍຄືກັນ",
    safety_tip_too_good: "ຖ້າມັນດີເກີນຈິງ (ເງິນຟຣີ, ຜົນຕອບແທນຮັບປະກັນ), ມັນກໍ່ແມ່ນ",
    footer: "Satisampasanya · ສະຕິຊໍາປະຊັນຍະ · Built for Lao youth safety",
  },
} as const;

// ═══════════════════════════════════════════════════════════════════════════════
//  DESIGN TOKENS
// ═══════════════════════════════════════════════════════════════════════════════
const COLORS = {
  primary: "#5B21D1",
  primaryLight: "#84ADEF",
  primaryDark: "#4318B0",
  accent: "#6366F1",
  success: "#16A34A",
  warning: "#F59E0B",
  danger: "#EF4444",
  info: "#0891B2",
};

const AVATAR_GRADIENTS = [
  "linear-gradient(135deg,#5B21D1,#93C5FD)",
  "linear-gradient(135deg,#5B21D1,#DB2777)",
  "linear-gradient(135deg,#0891B2,#5B21D1)",
  "linear-gradient(135deg,#16A34A,#5B21D1)",
  "linear-gradient(135deg,#EA580C,#5B21D1)",
  "linear-gradient(135deg,#DB2777,#93C5FD)",
];

const BANNER_GRADIENTS = [
  "linear-gradient(135deg,#1E1B4B,#3B0FA0)",
  "linear-gradient(135deg,#5B21D1,#93C5FD)",
  "linear-gradient(135deg,#0C1445,#5B21D1)",
  "linear-gradient(135deg,#064E3B,#3B0FA0)",
  "linear-gradient(135deg,#1E1B4B,#DB2777)",
  "linear-gradient(135deg,#0C1445,#0891B2)",
];

const TOPICS = ["OnlineScam","Trafficking","DigitalSafety","JobScam","CryptoScam","BorderSafety","SocialMedia","PhishingAlert","RomanceScam","DataPrivacy"];

const FEED_TABS_EN = ["For You","Following","#OnlineScam","#Trafficking","#DigitalSafety"];
const FEED_TABS_LO = ["ສຳລັບທ່ານ","ຕິດຕາມ","#ການຫຼອກລວງ","#ການຄ້າມະນຸດ","#ຄວາມປອດໄພດິຈິຕອລ"];

// ═══════════════════════════════════════════════════════════════════════════════
//  SATI LOGO (SVG - Professional, scalable, theme-aware)
// ═══════════════════════════════════════════════════════════════════════════════
function SatiLogo({ size = 28, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={Math.round(size * 1.1)} viewBox="0 0 100 110" fill="none" className={className}>
      <defs>
        <linearGradient id="satilogo-purple" x1="0" y1="0" x2="100" y2="0">
          <stop offset="0%" stopColor={COLORS.primary} />
          <stop offset="100%" stopColor={COLORS.accent} />
        </linearGradient>
        <linearGradient id="satilogo-blue" x1="0" y1="0" x2="100" y2="100">
          <stop offset="0%" stopColor={COLORS.primaryLight} />
          <stop offset="100%" stopColor="#A78BFA" />
        </linearGradient>
      </defs>
      <path d="M6 54 L30 54 L30 82 L82 82 L82 104 L18 104 L6 80 Z" fill="url(#satilogo-blue)" />
      <path d="M18 6 L82 6 L94 30 L94 56 L70 56 L70 28 L18 28 Z" fill="url(#satilogo-purple)" />
      <path d="M50 32 L64 40 L64 60 L50 68 L36 60 L36 40 Z" fill="white" opacity="0.08" />
    </svg>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
//  LEAF TRUST MARK
// ═══════════════════════════════════════════════════════════════════════════════
function LeafMark({ state, size = 16 }: { state: LeafState; size?: number }) {
  if (state === "none") return null;
  const fill = state === "verified" || state === "featured" ? COLORS.success : "#A5B4FC";
  return (
    <span className="inline-flex items-center gap-0.5 shrink-0">
      <svg width={size} height={size} viewBox="0 0 20 20" fill="none">
        <path d="M10 2C6.5 4 3.5 7.5 3.5 11.5c0 2 .75 3.8 2 5.1C6.8 18 8.3 18.9 10 19.3c1.7-.4 3.2-1.3 4.5-2.7 1.25-1.3 2-3.1 2-5.1C16.5 7.5 13.5 4 10 2z" fill={fill} />
        {(state === "verified" || state === "featured") && (
          <path d="M7.5 10l2 2 3-3.5" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        )}
        {state === "pending" && (
          <path d="M10 7v3.5M10 12.5v.5" stroke="white" strokeWidth="1.6" strokeLinecap="round" />
        )}
      </svg>
      {state === "featured" && (
        <svg width={size - 3} height={size - 3} viewBox="0 0 20 20" fill={COLORS.warning}>
          <path d="M10 2l2.4 5.1H18l-4.5 3.3 1.7 5.2L10 13l-5.2 2.6 1.7-5.2L2 7.1h5.6z" />
        </svg>
      )}
    </span>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
//  TAG CHIP (Bilingual)
// ═══════════════════════════════════════════════════════════════════════════════
function TagChip({ tag, lang, small }: { tag: string; lang: Lang; small?: boolean }) {
  const label = TOPIC_LABELS[tag];
  const base = `font-medium text-indigo-600 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800`;
  if (!label) return (
    <span className={`${base} rounded-full ${small ? "text-[10px] px-2 py-0.5" : "text-[11px] px-2.5 py-0.5"}`}>#{tag}</span>
  );
  return (
    <span className={`inline-flex flex-col ${base} rounded-xl ${small ? "px-2 py-0.5" : "px-2.5 py-1"}`}>
      <span className={small ? "text-[9px] leading-tight" : "text-[10px] leading-tight"}>#{lang === "lo" ? label.lo : label.en}</span>
      {!small && <span className="text-[8px] text-indigo-400 dark:text-indigo-500 leading-tight">{lang === "lo" ? label.en : label.lo}</span>}
    </span>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
//  DATA
// ═══════════════════════════════════════════════════════════════════════════════
const AUTHORS: Record<string, Author> = {
  sara:  { name: "Sarak Sivilay",   handle: "@sarak_s",   initials: "SS", color: "#5B21D1", points: 1240 },
  kham:  { name: "Khamla Vongsa",   handle: "@khamla_v",  initials: "KV", color: "#2563EB", points: 820  },
  admin: { name: "Sati Team",       handle: "@sati_team", initials: "ST", color: "#16A34A", points: 9999 },
  boun:  { name: "Bounmy Thao",     handle: "@bounmy_t",  initials: "BT", color: "#DB2777", points: 210  },
  naly:  { name: "Naly Phommasack", handle: "@naly_ph",   initials: "NP", color: "#EA580C", points: 340  },
  phone: { name: "Phonesavanh K.",  handle: "@phsavanh",  initials: "PK", color: "#0891B2", points: 590  },
  malee: { name: "Malee Souphanh",  handle: "@malee_sp",  initials: "MS", color: "#7C3AED", points: 430  },
};

const INITIAL_POSTS: Post[] = [
  {
    id: "p1", author: AUTHORS.sara,
    content: 'WARNING: Fake "BCEL Bank" WhatsApp message asking you to verify your account. The number +856 20 97 386 532 is NOT BCEL. Do not click any links or share your OTP. Screenshot attached — save and share.',
    contentLo: 'ຄຳເຕືອນ: ຂໍ້ຄວາມ WhatsApp ປອມ "BCEL Bank" ຮຽກໃຫ້ຢືນຢັນບັນຊີ. ເບີ +856 20 97 386 532 ບໍ່ແມ່ນ BCEL. ຢ່າກົດລິ້ງ ຫຼື ແຊຣ໌ OTP ຂອງທ່ານ.',
    tags: ["OnlineScam", "PhishingAlert"], timestamp: "2h", state: "confirmed",
    likes: 847, comments: 92, reposts: 431, warnedMe: 203,
    points: 50, featuredPoints: true, image: imgBcel,
  },
  {
    id: "p2", author: AUTHORS.kham,
    content: 'SCAM ALERT: Someone sent me a WhatsApp message with a "LaoKYC.apk" file to download. This is malware — it steals banking apps and contacts. The sender pretended to be from a government agency. DO NOT install any APK from WhatsApp.',
    contentLo: 'ການຫຼອກລວງ: ມີຄົນສົ່ງໄຟລ "LaoKYC.apk" ຜ່ານ WhatsApp. ນີ້ແມ່ນ malware — ລັກຂໍ້ມູນ banking ແລະ ລາຍຊື່ຜູ້ຕິດຕໍ່. ຢ່າຕິດຕັ້ງ APK ຈາກ WhatsApp.',
    tags: ["OnlineScam", "DigitalSafety"], timestamp: "5h", state: "flagged",
    likes: 34, comments: 8, reposts: 12, warnedMe: 19,
    flagReason: "APK malware claims need source verification before amplification. Expert reviewing — usually within 48h.",
    flagReasonLo: "ຄຳອ້າງກ່ຽວກັບ malware ຕ້ອງການການຢືນຢັນ. ຜູ້ຊ່ຽວຊານກຳລັງກວດສອບ — ພາຍໃນ 48 ຊ.ມ.",
    image: imgApk,
  },
  {
    id: "p3", author: AUTHORS.admin,
    content: "How phone scams in Laos work — recognize the signs:\n\n• Product offers that sound too good to be true\n• Unsolicited calls from government agencies or big companies\n• Asking for personal info or threatening harm if you don't comply\n\nHow to protect yourself: End the call. Block the number. Never click links in messages. Never wire money to a stranger.",
    contentLo: "ວິທີການຫຼອກລວງທາງໂທລະສັບໃນລາວ:\n\n• ສະເໜີສິນຄ້າທີ່ດີເກີນຈິງ\n• ໂທຫາໂດຍໄຮ້ນັດໝາຍຈາກໜ່ວຍງານລັດ\n• ຮຽກຂໍ້ມູນສ່ວນຕົວ ຫຼື ຂູ່ຮ້າຍ\n\nວິທີປ້ອງກັນ: ວາງສາຍ. ບ໋ອກເບີ. ຢ່າກົດລິ້ງ. ຢ່າໂອນເງິນໃຫ້ຄົນແປກໜ້າ.",
    tags: ["OnlineScam", "PhishingAlert", "DigitalSafety"], timestamp: "1d", state: "confirmed",
    likes: 2341, comments: 187, reposts: 1204, warnedMe: 891,
    points: 75, featuredPoints: false, isNews: true, image: imgPhoneScam,
  },
  {
    id: "p4", author: AUTHORS.boun,
    content: "A TikTok video showing a chained woman in China went viral — she is one of thousands trafficked for forced marriage and labour. This happens to Lao women too. If someone offers you a job or marriage in China without meeting in person first, report it immediately: 1800 (Lao anti-trafficking hotline).",
    contentLo: "ວິດີໂອ TikTok ສະແດງຜູ້ຍິງຖືກຕ່ວນໃນຈີນ — ນາງແມ່ນໜຶ່ງໃນຫຼາຍພັນຄົນທີ່ຖືກຄ້າ. ນີ້ເກີດຂຶ້ນກັບຜູ້ຍິງລາວດ້ວຍ. ຖ້າໃຜສະເໜີວຽກ ຫຼື ການແຕ່ງງານໃນຈີນໂດຍບໍ່ໄດ້ພົບກ່ອນ, ລາຍງານທັນທີ: 1800.",
    tags: ["Trafficking", "BorderSafety"], timestamp: "3h", state: "sla",
    likes: 156, comments: 43, reposts: 89, warnedMe: 74,
    hasVideo: true, image: imgTraffickingVideo,
  },
  {
    id: "p5", author: AUTHORS.naly,
    content: "Reporting scams to the Lao cybercrime police is pointless. They just warn the scammer and nothing happens. Don't bother — just warn friends directly.",
    contentLo: "ການລາຍງານການຫຼອກລວງໃຫ້ຕຳຫຼວດອາຊະຍາກຳໄຊເບີລາວແມ່ນໄຮ້ປະໂຫຍດ. ພວກເຂົາພຽງແຕ່ເຕືອນຜູ້ຫຼອກລວງ. ຢ່າເສຍເວລາ.",
    tags: ["DigitalSafety"], timestamp: "8h", state: "false",
    likes: 12, comments: 5, reposts: 3, warnedMe: 0,
    correction: "Lao cybercrime police do file and act on reports. Report at cybercrime.gov.la or call 021-212-516. Filings compile evidence to identify and dismantle scam networks.",
    correctionLo: "ຕຳຫຼວດອາຊະຍາກຳໄຊເບີລາວຮັບ ແລະ ດຳເນີນການ. ລາຍງານທີ່ cybercrime.gov.la ຫຼື 021-212-516.",
  },
  {
    id: "p6", author: AUTHORS.phone,
    content: "This Facebook post in Lao is spreading dangerous misinformation about border crossing. The post claims it's safe to cross with a broker — it is NOT. This is how trafficking starts. Shared as a WARNING, not an endorsement.",
    contentLo: "ໂພສ Facebook ນີ້ແຜ່ຂໍ້ມູນຜິດກ່ຽວກັບການຂ້າມຊາຍແດນ. ໂພສອ້າງວ່າການຂ້າມຜ່ານນາຍໜ້າປອດໄພ — ບໍ່ປອດໄພ. ນີ້ແມ່ນຈຸດເລີ່ມຕົ້ນຂອງການຄ້າມະນຸດ. ແຊຣ໌ເພື່ອເຕືອນ.",
    tags: ["Trafficking", "SocialMedia"], timestamp: "1h", state: "clean",
    likes: 67, comments: 14, reposts: 38, warnedMe: 29, image: imgLaoPost,
  },
  {
    id: "p7", author: AUTHORS.malee,
    content: "Human trafficking takes many forms — sexual exploitation, forced labor, child trafficking, forced marriage, organ trafficking. Know the signs. The Church and NGOs in Laos offer free support. #TogetherAgainstHumanTrafficking",
    contentLo: "ການຄ້າມະນຸດມີຫຼາຍຮູບແບບ — ການຂູດຮີດທາງເພດ, ແຮງງານບັງຄັບ, ການຄ້າເດັກ, ການແຕ່ງງານບັງຄັບ, ການຄ້າອະໄວຍະວະ. ຮູ້ຈັກສັນຍານ. NGO ໃນລາວໃຫ້ການຊ່ວຍເຫຼືອຟຣີ.",
    tags: ["Trafficking", "BorderSafety"], timestamp: "4h", state: "confirmed",
    likes: 312, comments: 28, reposts: 145, warnedMe: 118,
    points: 40, featuredPoints: false, image: imgTraffickingPoster,
  },
  {
    id: "p8", author: AUTHORS.kham,
    content: "FOUND IN A TRUCK: This photo shows people smuggled in a truck container on the Lao-Thai border. If you see suspicious vehicles, call 1800 or the police immediately. Do not engage the traffickers.",
    contentLo: "ພົບໃນລົດບັນທຸກ: ຮູບນີ້ສະແດງຄົນທີ່ຖືກລັກລອບຂ້າມຊາຍແດນ. ຖ້າເຫັນລົດໜ້າສົງໄສ, ໂທ 1800 ທັນທີ.",
    tags: ["Trafficking", "BorderSafety"], timestamp: "6h", state: "confirmed",
    likes: 523, comments: 61, reposts: 287, warnedMe: 201,
    points: 45, featuredPoints: true, image: imgTruck,
  },
  {
    id: "p9", author: AUTHORS.phone,
    content: "TikTok scam: 'Joybuy' pop-ups appearing in videos promise prizes if you click. This is a phishing page — it collects your phone number and payment details. If you see this popup while watching TikTok, close it immediately.",
    contentLo: "ການຫຼອກລວງ TikTok: ປ໊ອບອັບ 'Joybuy' ສັນຍາລາງວັນຖ້າກົດ. ນີ້ແມ່ນໜ້າ phishing — ເກັບເບີໂທ ແລະ ຂໍ້ມູນການຊຳລະ. ຖ້າເຫັນ popup ນີ້, ປິດທັນທີ.",
    tags: ["OnlineScam", "SocialMedia"], timestamp: "30m", state: "clean",
    likes: 89, comments: 17, reposts: 52, warnedMe: 41,
    hasVideo: true, image: imgTiktokScam,
  },
];

// ═══════════════════════════════════════════════════════════════════════════════
//  SATI ILLUSTRATION (Welcome Screen)
// ═══════════════════════════════════════════════════════════════════════════════
function SatiIllustration() {
  return (
    <svg viewBox="0 0 240 230" fill="none" className="w-full max-w-[240px]">
      <circle cx="120" cy="125" r="85" fill="#EEF2FF" opacity="0.8" />
      <rect x="74" y="165" width="72" height="7" rx="3.5" fill="#A5B4FC" />
      <rect x="78" y="172" width="7" height="30" rx="3.5" fill="#A5B4FC" />
      <rect x="135" y="172" width="7" height="30" rx="3.5" fill="#A5B4FC" />
      <path d="M94 165 L88 200" stroke="#13112B" strokeWidth="7" strokeLinecap="round" />
      <path d="M126 165 L132 200" stroke="#13112B" strokeWidth="7" strokeLinecap="round" />
      <rect x="92" y="115" width="46" height="55" rx="14" fill="#5B21D1" />
      <circle cx="115" cy="100" r="19" fill="#FBBF24" opacity="0.9" />
      <path d="M97 95 Q100 77 115 80 Q130 77 133 95" fill="#13112B" />
      <rect x="94" y="136" width="32" height="50" rx="5" fill="#1E1B4B" opacity="0.9" />
      <rect x="99" y="143" width="22" height="35" rx="3" fill="#F7F8FF" />
      <rect x="104" y="149" width="6" height="10" rx="1" fill="#5B21D1" />
      <rect x="104" y="159" width="6" height="10" rx="1" fill="#93C5FD" />
      <rect x="110" y="149" width="6" height="10" rx="1" fill="#4318B0" />
      <circle cx="178" cy="55" r="20" fill="#EEF2FF" stroke="#5B21D1" strokeWidth="1.5" opacity="0.9" />
      <path d="M168 52 L174 58 L188 46" stroke="#5B21D1" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="38" cy="105" r="17" fill="#FEF3C7" stroke="#F59E0B" strokeWidth="2" />
      <path d="M38 97v9M38 108v2" stroke="#D97706" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="24" y1="91" x2="52" y2="119" stroke="#EF4444" strokeWidth="2.5" strokeLinecap="round" opacity="0.65" />
      <line x1="52" y1="91" x2="24" y2="119" stroke="#EF4444" strokeWidth="2.5" strokeLinecap="round" opacity="0.65" />
      <circle cx="200" cy="90" r="13" fill="#FEE2E2" stroke="#EF4444" strokeWidth="1.5" opacity="0.8" />
      <path d="M200 83v7M200 92v2" stroke="#DC2626" strokeWidth="2" strokeLinecap="round" />
      <circle cx="52" cy="55" r="5" fill="#5B21D1" opacity="0.22" />
      <circle cx="190" cy="155" r="4" fill="#93C5FD" opacity="0.28" />
      <circle cx="32" cy="160" r="3.5" fill="#5B21D1" opacity="0.18" />
    </svg>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
//  FORM INPUT (Enhanced)
// ═══════════════════════════════════════════════════════════════════════════════
function FormInput({ value, onChange, placeholder, type = "text", error, right }: {
  value: string; onChange: (v: string) => void; placeholder: string;
  type?: string; error?: string; right?: React.ReactNode;
}) {
  return (
    <div className="mb-3">
      <div className={`flex items-center rounded-xl px-4 py-3.5 border transition-all ${error ? "border-red-400 bg-red-50/30" : "border-border bg-muted/50 focus-within:border-primary/60 focus-within:bg-white dark:focus-within:bg-background"}`}>
        <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} type={type}
          className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground/60 text-foreground" />
        {right}
      </div>
      {error && <p className="text-[11px] text-red-500 mt-1 ml-1">{error}</p>}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
//  SOCIAL BUTTONS
// ═══════════════════════════════════════════════════════════════════════════════
function SocialButtons({ onPress, label }: { onPress: () => void; label: string }) {
  return (
    <div className="mt-5 mb-2">
      <p className="text-xs text-muted-foreground text-center mb-3">{label}</p>
      <div className="flex justify-center gap-4">
        {[
          <svg key="g" width="18" height="18" viewBox="0 0 18 18"><path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908C16.658 14.251 17.64 11.945 17.64 9.2z" fill="#4285F4"/><path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/><path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/><path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/></svg>,
          <svg key="f" width="18" height="18" viewBox="0 0 24 24" fill="#1877F2"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>,
          <svg key="a" width="15" height="18" viewBox="0 0 814 1000" fill="currentColor" className="text-foreground"><path d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76.5 0-103.7 40.8-165.9 40.8s-105-57.8-155.5-127.4C46 537.8 10.3 427.8 10.3 321.7c0-178.5 116.4-272.8 230.7-272.8 61.3 0 112.4 40.8 150.8 40.8 36.7 0 94.7-43.1 163.7-43.1 26.4 0 108.2 2.6 163.7 80.3zm-234.4-181.9c30.3-36.2 52.2-86.5 52.2-136.7 0-7.1-.6-14.3-1.9-20.1-49.3 1.9-108.2 33.2-142.6 75.2-28.1 32.2-55.9 82.5-55.9 133.3 0 7.7 1.3 15.4 1.9 17.9 3.2.6 8.4 1.3 13.6 1.3 44.1 0 100.9-30.3 132.7-70.9z"/></svg>,
        ].map((icon, i) => (
          <button key={i} onClick={onPress} className="w-12 h-12 rounded-full border border-border bg-white dark:bg-background flex items-center justify-center hover:bg-gray-50 dark:hover:bg-muted active:scale-95 transition-all shadow-sm">{icon}</button>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
//  LANG TOGGLE
// ═══════════════════════════════════════════════════════════════════════════════
function LangToggle({ lang, onToggle }: { lang: Lang; onToggle: () => void }) {
  return (
    <button onClick={onToggle} className="flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-full border border-primary/30 bg-white/70 dark:bg-background/70 text-primary hover:bg-primary/5 active:scale-95 transition-all backdrop-blur-sm">
      <Globe size={12} />
      <span className="font-lao text-[11px]">{T[lang].lang_switch}</span>
    </button>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
//  THEME TOGGLE
// ═══════════════════════════════════════════════════════════════════════════════
function ThemeToggle({ mode, onChange }: { mode: ThemeMode; onChange: (m: ThemeMode) => void }) {
  const modes: { key: ThemeMode; icon: typeof Sun; label: string }[] = [
    { key: "light", icon: Sun, label: "Light" },
    { key: "dark", icon: Moon, label: "Dark" },
    { key: "system", icon: MonitorIcon, label: "System" },
  ];
  return (
    <div className="flex items-center gap-1 bg-muted/60 rounded-full p-1">
      {modes.map(({ key, icon: Icon, label }) => (
        <button key={key} onClick={() => onChange(key)}
          className={`flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-medium transition-all ${mode === key ? "bg-primary text-white shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
          title={label}>
          <Icon size={13} />
        </button>
      ))}
    </div>
  );
}

function MonitorIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="3" width="20" height="14" rx="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" />
    </svg>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
//  AUTH SCREEN
// ═══════════════════════════════════════════════════════════════════════════════
function AuthScreen({ lang, onLangToggle, onLogin }: { lang: Lang; onLangToggle: () => void; onLogin: (u: CurrentUser) => void; }) {
  const t = T[lang];
  const [view, setView] = useState<AuthView>("welcome");
  const [socialNotice, setSocialNotice] = useState(false);
  const [loginEmail, setLoginEmail] = useState(""); const [loginPw, setLoginPw] = useState(""); const [showLoginPw, setShowLoginPw] = useState(false); const [loginErrors, setLoginErrors] = useState<Record<string,string>>({});
  const [regName, setRegName] = useState(""); const [regEmail, setRegEmail] = useState(""); const [regPw, setRegPw] = useState(""); const [regConfirm, setRegConfirm] = useState(""); const [showRegPw, setShowRegPw] = useState(false); const [showConfirmPw, setShowConfirmPw] = useState(false); const [regErrors, setRegErrors] = useState<Record<string,string>>({});
  const [forgotEmail, setForgotEmail] = useState(""); const [forgotError, setForgotError] = useState(""); const [resetSent, setResetSent] = useState(false);
  const isValidEmail = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

  const handleLogin = () => {
    const errs: Record<string,string> = {};
    if (!loginEmail) errs.email = t.err_required; else if (!isValidEmail(loginEmail)) errs.email = t.err_email;
    if (!loginPw) errs.pw = t.err_required;
    setLoginErrors(errs);
    if (Object.keys(errs).length > 0) return;
    onLogin({ name: loginEmail.split("@")[0], email: loginEmail });
  };
  const handleRegister = () => {
    const errs: Record<string,string> = {};
    if (!regName.trim()) errs.name = t.err_required;
    if (!regEmail) errs.email = t.err_required; else if (!isValidEmail(regEmail)) errs.email = t.err_email;
    if (!regPw) errs.pw = t.err_required; else if (regPw.length < 8) errs.pw = t.err_pw_short;
    if (!regConfirm) errs.confirm = t.err_required; else if (regConfirm !== regPw) errs.confirm = t.err_pw_match;
    setRegErrors(errs);
    if (Object.keys(errs).length > 0) return;
    onLogin({ name: regName.trim(), email: regEmail });
  };
  const handleForgot = () => {
    if (!forgotEmail) { setForgotError(t.err_required); return; }
    if (!isValidEmail(forgotEmail)) { setForgotError(t.err_email); return; }
    setForgotError(""); setResetSent(true);
  };
  const handleSocial = () => { setSocialNotice(true); setTimeout(() => setSocialNotice(false), 2500); };

  if (view === "welcome") return (
    <div className="h-full flex flex-col bg-secondary/60 dark:bg-background">
      <div className="flex justify-end px-5 pt-3"><LangToggle lang={lang} onToggle={onLangToggle} /></div>
      <div className="flex-1 flex items-center justify-center px-8"><SatiIllustration /></div>
      <div className="bg-background rounded-t-3xl px-7 pt-7 pb-8 shadow-[0_-8px_32px_rgba(91,33,209,0.08)] border-t border-border">
        <div className="flex items-center gap-2 mb-3"><SatiLogo size={22} /><span className="font-display font-bold text-base" style={{ letterSpacing:"-0.02em" }}>{t.app_short}</span></div>
        <h1 className="font-display font-bold mb-3 whitespace-pre-line leading-tight text-foreground" style={{ fontSize:"clamp(24px,7vw,30px)", letterSpacing:"-0.02em" }}>{t.welcome_title}</h1>
        <p className="text-sm text-muted-foreground leading-relaxed mb-7 font-lao">{t.welcome_sub}</p>
        <div className="flex gap-3">
          <button onClick={() => setView("login")} className="flex-1 bg-primary text-white font-semibold py-3.5 rounded-2xl text-sm active:scale-[0.98] transition-transform font-lao" style={{ boxShadow:"0 4px 14px rgba(91,33,209,0.35)" }}>{t.btn_login}</button>
          <button onClick={() => setView("register")} className="flex-1 border-2 border-primary text-primary font-semibold py-3.5 rounded-2xl text-sm active:scale-[0.98] transition-transform font-lao">{t.btn_register}</button>
        </div>
      </div>
    </div>
  );

  if (view === "login") return (
    <div className="h-full flex flex-col bg-background overflow-y-auto scrollbar-hide">
      <div className="px-5 pt-3 pb-6 bg-secondary/60 dark:bg-muted/30">
        <div className="flex items-center justify-between mb-5">
          <button onClick={() => setView("welcome")} className="p-2 -ml-2"><ArrowLeft size={20} strokeWidth={1.75} /></button>
          <LangToggle lang={lang} onToggle={onLangToggle} />
        </div>
        <h2 className="font-display font-bold text-2xl mb-1 font-lao" style={{ letterSpacing:"-0.02em" }}>{t.login_title}</h2>
        <p className="text-sm text-muted-foreground font-semibold font-lao">{t.login_sub}</p>
      </div>
      <div className="flex-1 px-5 pt-6 pb-4">
        <FormInput value={loginEmail} onChange={(v) => { setLoginEmail(v); setLoginErrors(e => ({...e,email:""})); }} placeholder={t.field_email} type="email" error={loginErrors.email} />
        <FormInput value={loginPw} onChange={(v) => { setLoginPw(v); setLoginErrors(e => ({...e,pw:""})); }} placeholder={t.field_password} type={showLoginPw?"text":"password"} error={loginErrors.pw}
          right={<button onClick={() => setShowLoginPw(v => !v)} className="text-muted-foreground/60 p-0.5 ml-1">{showLoginPw ? <EyeOff size={16} /> : <Eye size={16} />}</button>} />
        <div className="flex justify-end mb-5"><button onClick={() => setView("forgot")} className="text-xs font-semibold text-primary font-lao">{t.forgot_link}</button></div>
        <button onClick={handleLogin} className="w-full bg-primary text-white font-semibold py-3.5 rounded-2xl text-sm mb-2 active:scale-[0.98] transition-transform font-lao" style={{ boxShadow:"0 4px 14px rgba(91,33,209,0.35)" }}>{t.btn_signin}</button>
        <SocialButtons onPress={handleSocial} label={t.or_continue} />
        {socialNotice && <p className="text-center text-xs text-muted-foreground mt-2 animate-pulse font-lao">{t.social_coming_soon}</p>}
        <div className="mt-4 text-center">
          <button onClick={() => setView("register")} className="text-sm text-muted-foreground font-lao">{t.create_account} <span className="text-primary font-semibold">{t.btn_register}</span></button>
        </div>
      </div>
    </div>
  );

  if (view === "register") return (
    <div className="h-full flex flex-col bg-background overflow-y-auto scrollbar-hide">
      <div className="px-5 pt-3 pb-6 bg-secondary/60 dark:bg-muted/30">
        <div className="flex items-center justify-between mb-5">
          <button onClick={() => setView("welcome")} className="p-2 -ml-2"><ArrowLeft size={20} strokeWidth={1.75} /></button>
          <LangToggle lang={lang} onToggle={onLangToggle} />
        </div>
        <h2 className="font-display font-bold text-2xl mb-1 font-lao" style={{ letterSpacing:"-0.02em" }}>{t.register_title}</h2>
        <p className="text-sm text-muted-foreground font-semibold font-lao">{t.register_sub}</p>
      </div>
      <div className="flex-1 px-5 pt-6 pb-4">
        <FormInput value={regName} onChange={(v) => { setRegName(v); setRegErrors(e=>({...e,name:""})); }} placeholder={t.field_name} error={regErrors.name} />
        <FormInput value={regEmail} onChange={(v) => { setRegEmail(v); setRegErrors(e=>({...e,email:""})); }} placeholder={t.field_email} type="email" error={regErrors.email} />
        <FormInput value={regPw} onChange={(v) => { setRegPw(v); setRegErrors(e=>({...e,pw:""})); }} placeholder={t.field_password} type={showRegPw?"text":"password"} error={regErrors.pw}
          right={<button onClick={() => setShowRegPw(v=>!v)} className="text-muted-foreground/60 p-0.5 ml-1">{showRegPw?<EyeOff size={16}/>:<Eye size={16}/>}</button>} />
        <FormInput value={regConfirm} onChange={(v) => { setRegConfirm(v); setRegErrors(e=>({...e,confirm:""})); }} placeholder={t.field_confirm} type={showConfirmPw?"text":"password"} error={regErrors.confirm}
          right={<button onClick={() => setShowConfirmPw(v=>!v)} className="text-muted-foreground/60 p-0.5 ml-1">{showConfirmPw?<EyeOff size={16}/>:<Eye size={16}/>}</button>} />
        <button onClick={handleRegister} className="w-full bg-primary text-white font-semibold py-3.5 rounded-2xl text-sm mt-2 mb-2 active:scale-[0.98] transition-transform font-lao" style={{ boxShadow:"0 4px 14px rgba(91,33,209,0.35)" }}>{t.btn_signup}</button>
        <SocialButtons onPress={handleSocial} label={t.or_continue} />
        {socialNotice && <p className="text-center text-xs text-muted-foreground mt-2 animate-pulse font-lao">{t.social_coming_soon}</p>}
        <div className="mt-4 text-center">
          <button onClick={() => setView("login")} className="text-sm text-muted-foreground font-lao">{t.have_account} <span className="text-primary font-semibold">{t.btn_signin}</span></button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="h-full flex flex-col bg-background">
      <div className="px-5 pt-3 pb-6 bg-secondary/60 dark:bg-muted/30">
        <div className="flex items-center justify-between mb-5">
          <button onClick={() => setView("login")} className="p-2 -ml-2"><ArrowLeft size={20} strokeWidth={1.75} /></button>
          <LangToggle lang={lang} onToggle={onLangToggle} />
        </div>
        <h2 className="font-display font-bold text-2xl mb-1 font-lao" style={{ letterSpacing:"-0.02em" }}>{t.forgot_title}</h2>
        <p className="text-sm text-muted-foreground font-lao">{t.forgot_sub}</p>
      </div>
      <div className="flex-1 px-5 pt-6">
        {resetSent ? (
          <div className="rounded-2xl p-5 bg-green-50 border border-green-200 flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center shrink-0"><Check size={16} className="text-green-600" /></div>
            <p className="text-sm text-green-800 leading-relaxed font-lao">{t.reset_sent}</p>
          </div>
        ) : (
          <>
            <FormInput value={forgotEmail} onChange={(v) => { setForgotEmail(v); setForgotError(""); }} placeholder={t.field_email} type="email" error={forgotError} />
            <button onClick={handleForgot} className="w-full bg-primary text-white font-semibold py-3.5 rounded-2xl text-sm mt-2 active:scale-[0.98] transition-transform font-lao" style={{ boxShadow:"0 4px 14px rgba(91,33,209,0.35)" }}>{t.btn_send_reset}</button>
          </>
        )}
        <div className="mt-5 text-center"><button onClick={() => setView("login")} className="text-sm text-primary font-semibold font-lao">← {t.back_signin}</button></div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
//  STATE BANNER
// ═══════════════════════════════════════════════════════════════════════════════
function StateBanner({ state, flagReason, flagReasonLo, correction, correctionLo, lang }: Pick<Post,"state"|"flagReason"|"flagReasonLo"|"correction"|"correctionLo"> & { lang: Lang }) {
  const t = T[lang];
  if (state === "clean" || state === "confirmed") return null;
  if (state === "flagged") return (
    <div className="mx-4 mb-2 rounded-xl p-3 bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800">
      <div className="flex items-start gap-2">
        <AlertTriangle size={13} className="text-amber-500 mt-0.5 shrink-0" />
        <div>
          <p className="text-[10px] font-bold tracking-wider uppercase text-amber-800 dark:text-amber-400 mb-0.5">{t.banner_review_title}</p>
          <p className="text-xs text-amber-700 dark:text-amber-300 leading-relaxed font-lao">{lang==="lo"&&flagReasonLo ? flagReasonLo : flagReason}</p>
        </div>
      </div>
    </div>
  );
  if (state === "false") return (
    <div className="mx-4 mb-2 rounded-xl p-3 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800">
      <div className="flex items-start gap-2">
        <X size={13} className="text-red-500 mt-0.5 shrink-0" />
        <div>
          <p className="text-[10px] font-bold tracking-wider uppercase text-red-800 dark:text-red-400 mb-0.5">{t.banner_false_title}</p>
          {(correction||correctionLo) && <p className="text-xs text-red-700 dark:text-red-300 leading-relaxed font-lao"><span className="font-semibold">{t.banner_correction}</span>{lang==="lo"&&correctionLo ? correctionLo : correction}</p>}
        </div>
      </div>
    </div>
  );
  if (state === "sla") return (
    <div className="mx-4 mb-2 rounded-xl p-3 bg-gray-100 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-700">
      <div className="flex items-center gap-2">
        <Clock size={13} className="text-gray-400 shrink-0" />
        <p className="text-[11px] text-gray-500 dark:text-gray-400 font-lao">{t.banner_sla}</p>
      </div>
    </div>
  );
  return null;
}

// ═══════════════════════════════════════════════════════════════════════════════
//  IMAGE LIGHTBOX
// ═══════════════════════════════════════════════════════════════════════════════
function ImageLightbox({ src, onClose }: { src: string; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[200] bg-black/95 flex flex-col" onClick={onClose}>
      <button className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-white/10 flex items-center justify-center" onClick={onClose}>
        <X size={18} className="text-white" />
      </button>
      <div className="flex-1 flex items-center justify-center p-4" onClick={(e) => e.stopPropagation()}>
        <img src={src} alt="Full size" className="max-w-full max-h-full object-contain rounded-xl" />
      </div>
      <p className="text-center text-white/30 text-[11px] pb-6">Tap anywhere to close</p>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
//  POST CARD (Enhanced with Photo Upload Preview)
// ═══════════════════════════════════════════════════════════════════════════════
function PostCard({ post, onTap, lang }: { post: Post; onTap: () => void; lang: Lang }) {
  const [liked, setLiked] = useState(false);
  const [warned, setWarned] = useState(false);
  const [reposted, setReposted] = useState(false);
  const [shareToast, setShareToast] = useState(false);
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);
  const t = T[lang];
  const locked = post.state === "flagged" || post.state === "false";
  const leafState: LeafState = post.state==="confirmed" ? (post.featuredPoints?"featured":"verified") : post.state==="flagged"||post.state==="sla" ? "pending" : "none";
  const displayContent = lang==="lo"&&post.contentLo ? post.contentLo : post.content;

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShareToast(true);
    setTimeout(() => setShareToast(false), 2000);
  };

  return (
    <article className="border-b border-border cursor-pointer active:bg-indigo-50/30 transition-colors relative" onClick={onTap}>
      <div className="pt-3">
        <StateBanner state={post.state} flagReason={post.flagReason} flagReasonLo={post.flagReasonLo} correction={post.correction} correctionLo={post.correctionLo} lang={lang} />
      </div>
      <div className={`px-4 pb-4 ${post.state==="false"?"opacity-60":""}`}>
        {/* Author */}
        <div className="flex items-start gap-3 mb-3">
          <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0" style={{ background: post.author.color }}>{post.author.initials}</div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-semibold text-sm">{post.author.name}</span>
              <LeafMark state={leafState} size={15} />
              {post.isNews && <span className="text-[10px] font-bold bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 px-2 py-0.5 rounded-full uppercase tracking-wide font-lao">{t.news_label}</span>}
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <span>{post.author.handle}</span><span>·</span><span>{post.timestamp}</span>
            </div>
          </div>
          <button className="p-1.5 text-muted-foreground/50 hover:text-muted-foreground transition-colors" onClick={(e) => e.stopPropagation()}><Flag size={13} /></button>
        </div>

        {/* Content */}
        <p className="text-sm leading-relaxed mb-3 whitespace-pre-line font-lao">{displayContent}</p>

        {/* Image */}
        {post.image && !post.hasVideo && (
          <div className="relative rounded-2xl overflow-hidden mb-3 bg-muted cursor-zoom-in" onClick={(e) => { e.stopPropagation(); setLightboxSrc(post.image!); }}>
            <img src={post.image} alt="Post media" className="w-full object-cover" style={{ maxHeight: 260 }} loading="lazy" />
            <div className="absolute bottom-2 right-2 bg-black/50 text-white text-[9px] px-1.5 py-0.5 rounded-md">⤢ expand</div>
          </div>
        )}

        {/* Video */}
        {post.hasVideo && post.image && (
          <div className="relative rounded-2xl overflow-hidden mb-3 bg-muted cursor-pointer" onClick={(e) => e.stopPropagation()}>
            <img src={post.image} alt="Video thumbnail" className="w-full object-cover" style={{ maxHeight: 250 }} loading="lazy" />
            <div className="absolute inset-0 flex items-center justify-center bg-black/30">
              <div className="w-14 h-14 rounded-full bg-white/90 flex items-center justify-center shadow-lg">
                <Play size={20} fill="currentColor" className="text-primary ml-1" />
              </div>
            </div>
            <div className="absolute bottom-2.5 right-3 bg-black/65 text-white text-[10px] px-2 py-0.5 rounded-md font-mono">1:24</div>
          </div>
        )}
        {lightboxSrc && <ImageLightbox src={lightboxSrc} onClose={() => setLightboxSrc(null)} />}

        {/* Tags */}
        {post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {post.tags.map((tag) => <TagChip key={tag} tag={tag} lang={lang} />)}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between" onClick={(e) => e.stopPropagation()}>
          <button disabled={locked} onClick={() => !locked && setLiked(v=>!v)}
            className={`flex items-center gap-1.5 text-xs transition-colors ${locked?"text-gray-300 cursor-not-allowed":liked?"text-red-500":"text-muted-foreground hover:text-red-400"}`}>
            <Heart size={15} strokeWidth={1.75} fill={liked?"currentColor":"none"} /><span>{post.likes+(liked?1:0)}</span>
          </button>
          <button disabled={locked} onClick={(e) => { e.stopPropagation(); if(!locked) onTap(); }}
            className={`flex items-center gap-1.5 text-xs transition-colors ${locked?"text-gray-300 cursor-not-allowed":"text-muted-foreground hover:text-indigo-500"}`}>
            <MessageCircle size={15} strokeWidth={1.75} /><span>{post.comments}</span>
          </button>
          <button disabled={locked} onClick={(e) => { e.stopPropagation(); if(!locked) setReposted(v=>!v); }}
            className={`flex items-center gap-1.5 text-xs transition-colors ${locked?"text-gray-300 cursor-not-allowed":reposted?"text-green-600 font-semibold":"text-muted-foreground hover:text-green-600"}`}>
            <Repeat2 size={15} strokeWidth={1.75} fill={reposted?"currentColor":"none"} /><span>{post.reposts+(reposted?1:0)}</span>
          </button>
          <button disabled={locked} onClick={(e) => { e.stopPropagation(); if(!locked) setWarned(v=>!v); }}
            className={`flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-full border transition-all font-medium ${locked?"border-gray-200 text-gray-300 cursor-not-allowed":warned?"bg-primary border-primary text-white":"border-indigo-200 text-indigo-600 hover:bg-indigo-50"}`}>
            <Shield size={11} /><span className="font-lao">{t.warned_me}{warned?" ✓":""}</span>
          </button>
          <button disabled={locked} onClick={handleShare}
            className={`flex items-center gap-1.5 text-xs transition-colors ${locked?"text-gray-300 cursor-not-allowed":"text-muted-foreground hover:text-indigo-500"}`}>
            <Share2 size={14} strokeWidth={1.75} />
          </button>
        </div>

        {/* Points footer */}
        {post.state==="confirmed" && post.points && (
          <div className="mt-3 flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 bg-green-50 dark:bg-green-950/50 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 text-[11px] font-semibold px-2.5 py-1 rounded-full">
              <LeafMark state="verified" size={11} />+{post.points} <span className="font-lao">{t.verified_pts}</span>
            </span>
            {post.featuredPoints && (
              <span className="inline-flex items-center gap-1.5 bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400 text-[11px] font-semibold px-2.5 py-1 rounded-full">
                <Zap size={10} /><span className="font-lao">{t.featured_bonus}</span>
              </span>
            )}
          </div>
        )}
      </div>
      {shareToast && (
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-foreground text-background text-[11px] font-semibold px-3 py-1.5 rounded-full z-10 whitespace-nowrap">{t.share} ✓</div>
      )}
    </article>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
//  POST DETAIL
// ═══════════════════════════════════════════════════════════════════════════════
function PostDetail({ post, onBack, lang }: { post: Post; onBack: () => void; lang: Lang }) {
  const [reply, setReply] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [replies, setReplies] = useState<string[]>([]);
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);
  const t = T[lang];
  const leafState: LeafState = post.state==="confirmed"?(post.featuredPoints?"featured":"verified"):"none";
  const displayContent = lang==="lo"&&post.contentLo ? post.contentLo : post.content;

  const handleReply = () => {
    if (!reply.trim()) return;
    setReplies(r => [reply.trim(), ...r]);
    setReply(""); setSubmitted(true);
    setTimeout(() => setSubmitted(false), 2000);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border sticky top-0 bg-background/95 backdrop-blur-sm z-10">
        <button onClick={onBack} className="p-1 -ml-1 hover:text-muted-foreground transition-colors"><ArrowLeft size={20} strokeWidth={1.75} /></button>
        <h2 className="font-display font-semibold text-base">Post</h2>
      </div>
      <div className="flex-1 overflow-y-auto scrollbar-hide">
        <div className="px-4 pt-4 pb-4 border-b border-border">
          <StateBanner state={post.state} flagReason={post.flagReason} flagReasonLo={post.flagReasonLo} correction={post.correction} correctionLo={post.correctionLo} lang={lang} />
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-white text-base shrink-0" style={{ background: post.author.color }}>{post.author.initials}</div>
            <div>
              <div className="flex items-center gap-1.5"><span className="font-semibold text-sm">{post.author.name}</span><LeafMark state={leafState} size={15} /></div>
              <span className="text-xs text-muted-foreground">{post.author.handle}</span>
            </div>
          </div>
          <p className="text-base leading-relaxed mb-4 whitespace-pre-line font-lao">{displayContent}</p>
          {post.image && !post.hasVideo && (
            <div className="relative rounded-2xl overflow-hidden mb-4 bg-muted cursor-zoom-in" onClick={() => setLightboxSrc(post.image!)}>
              <img src={post.image} alt="Post media" className="w-full object-contain" style={{ maxHeight: 420 }} />
              <div className="absolute bottom-2 right-2 bg-black/50 text-white text-[9px] px-1.5 py-0.5 rounded-md">⤢ expand</div>
            </div>
          )}
          {post.hasVideo && post.image && (
            <div className="relative rounded-2xl overflow-hidden mb-4 bg-muted">
              <img src={post.image} alt="Video thumbnail" className="w-full object-cover" style={{ maxHeight: 280 }} />
              <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                <div className="w-14 h-14 rounded-full bg-white/90 flex items-center justify-center shadow-lg"><Play size={20} fill="currentColor" className="text-primary ml-1" /></div>
              </div>
              <div className="absolute bottom-2.5 right-3 bg-black/65 text-white text-[10px] px-2 py-0.5 rounded-md font-mono">1:24</div>
            </div>
          )}
          {lightboxSrc && <ImageLightbox src={lightboxSrc} onClose={() => setLightboxSrc(null)} />}
          {post.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-4">{post.tags.map(tag => <TagChip key={tag} tag={tag} lang={lang} />)}</div>
          )}
          <p className="text-xs text-muted-foreground mb-4">{post.timestamp} · via Satisampasanya</p>
          <div className="flex gap-5 text-sm border-t border-b border-border py-3">
            <span><b>{post.reposts}</b> <span className="text-muted-foreground">Reposts</span></span>
            <span><b>{post.likes}</b> <span className="text-muted-foreground">Likes</span></span>
            <span><b>{post.warnedMe}</b> <span className="text-muted-foreground font-lao">{t.warned_me}</span></span>
          </div>
        </div>
        {submitted && <div className="px-4 py-3 text-xs text-green-600 font-semibold bg-green-50 border-b border-green-100">Reply posted!</div>}
        {replies.map((r, i) => (
          <div key={i} className="px-4 py-3 border-b border-border/40 flex gap-3">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-xs font-bold text-white shrink-0">VK</div>
            <p className="text-sm leading-relaxed font-lao">{r}</p>
          </div>
        ))}
        <div className="py-8 text-center text-xs text-muted-foreground font-lao">{t.no_replies}</div>
      </div>
      <div className="border-t border-border p-3 flex items-center gap-2.5 bg-background">
        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-xs font-bold text-white shrink-0">VK</div>
        <input value={reply} onChange={(e) => setReply(e.target.value)} onKeyDown={(e) => e.key==="Enter"&&handleReply()} placeholder={t.reply_ph}
          className="flex-1 bg-muted/60 rounded-full px-4 py-2 text-sm outline-none border border-border focus:border-primary/40 transition-colors placeholder:text-muted-foreground/60 font-lao" />
        <button onClick={handleReply} disabled={!reply.trim()} className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-all ${reply.trim()?"bg-primary text-white":"bg-muted text-muted-foreground cursor-not-allowed"}`}>
          <Send size={13} strokeWidth={2} />
        </button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
//  FEED VIEW
// ═══════════════════════════════════════════════════════════════════════════════
function FeedView({ posts, onPostTap, lang }: { posts: Post[]; onPostTap: (p: Post) => void; lang: Lang }) {
  const [activeTab, setActiveTab] = useState(0);
  const t = T[lang];
  const tabs = lang==="en" ? FEED_TABS_EN : FEED_TABS_LO;
  const tabTagFilters = [null, null, "OnlineScam", "Trafficking", "DigitalSafety"];
  const tagFilter = tabTagFilters[activeTab];
  const visiblePosts = tagFilter ? posts.filter(p => p.tags.includes(tagFilter)) : posts;

  return (
    <div className="flex flex-col h-full">
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="flex overflow-x-auto scrollbar-hide px-1">
          {tabs.map((tab, i) => (
            <button key={i} onClick={() => setActiveTab(i)}
              className={`shrink-0 px-3.5 py-3.5 text-sm font-medium transition-colors border-b-2 whitespace-nowrap font-lao ${activeTab===i?"border-primary text-primary":"border-transparent text-muted-foreground hover:text-foreground"}`}>
              {tab}
            </button>
          ))}
        </div>
      </div>
      <div className="flex-1 overflow-y-auto scrollbar-hide">
        {visiblePosts.map(post => <PostCard key={post.id} post={post} onTap={() => onPostTap(post)} lang={lang} />)}
        <div className="py-10 text-center space-y-1">
          <p className="text-xs text-muted-foreground">{t.caught_up_en}</p>
          <p className="text-xs text-muted-foreground/50 font-lao">{t.caught_up_lo}</p>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
//  PHOTO UPLOAD COMPONENT (New - Professional)
// ═══════════════════════════════════════════════════════════════════════════════
function PhotoUpload({ onFilesChange, lang }: { onFilesChange: (files: UploadedFile[]) => void; lang: Lang }) {
  const t = T[lang];
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const processFiles = (fileList: FileList | null) => {
    if (!fileList) return;
    const newFiles: UploadedFile[] = Array.from(fileList).filter(f => f.type.startsWith("image/")).map(file => ({
      id: Math.random().toString(36).slice(2),
      file,
      preview: URL.createObjectURL(file),
      progress: 0,
      status: "uploading" as const,
    }));

    const updated = [...files, ...newFiles];
    setFiles(updated);
    onFilesChange(updated);

    // Simulate upload progress
    newFiles.forEach((uf) => {
      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.random() * 25;
        if (progress >= 100) {
          progress = 100;
          clearInterval(interval);
          setFiles(prev => {
            const next = prev.map(f => f.id === uf.id ? { ...f, progress: 100, status: "done" as const } : f);
            onFilesChange(next);
            return next;
          });
        } else {
          setFiles(prev => prev.map(f => f.id === uf.id ? { ...f, progress } : f));
        }
      }, 200);
    });
  };

  const removeFile = (id: string) => {
    const updated = files.filter(f => f.id !== id);
    setFiles(updated);
    onFilesChange(updated);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    processFiles(e.dataTransfer.files);
  };

  return (
    <div className="mb-4">
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
          isDragging 
            ? "border-primary bg-indigo-50 dark:bg-indigo-950/30" 
            : "border-border bg-muted/30 hover:border-primary/50 hover:bg-muted/50"
        }`}
      >
        <input ref={inputRef} type="file" multiple accept="image/*" className="hidden" onChange={(e) => processFiles(e.target.files)} />
        <div className="flex flex-col items-center gap-2">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${isDragging ? "bg-primary text-white" : "bg-muted text-muted-foreground"}`}>
            <Upload size={22} />
          </div>
          <p className="text-sm font-medium text-foreground">{t.compose_photos}</p>
          <p className="text-xs text-muted-foreground">{t.compose_photos_hint}</p>
        </div>
      </div>

      {/* Preview grid */}
      {files.length > 0 && (
        <div className="grid grid-cols-4 gap-2 mt-3">
          {files.map((file) => (
            <div key={file.id} className="relative aspect-square rounded-xl overflow-hidden border border-border group">
              <img src={file.preview} alt="Preview" className="w-full h-full object-cover" />
              {/* Progress overlay */}
              {file.status === "uploading" && (
                <div className="absolute inset-0 bg-black/40 flex items-end p-1.5">
                  <div className="w-full h-1 bg-white/20 rounded-full overflow-hidden">
                    <div className="h-full bg-white rounded-full transition-all" style={{ width: `${file.progress}%` }} />
                  </div>
                </div>
              )}
              {/* Remove button */}
              <button
                onClick={() => removeFile(file.id)}
                className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X size={12} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
//  COMPOSE OVERLAY (Enhanced with Photo Upload)
// ═══════════════════════════════════════════════════════════════════════════════
function ComposeOverlay({ onClose, onPost, lang, currentUser }: {
  onClose: () => void; onPost: (p: Post) => void; lang: Lang; currentUser: CurrentUser;
}) {
  const t = T[lang];
  const [type, setType] = useState<"short"|"news">("short");
  const [text, setText] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [links, setLinks] = useState(["",""]);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const limit = type==="short" ? 150 : 2000;
  const remaining = limit - text.length;
  const overLimit = remaining < 0;
  const linksOk = type==="short" || (links[0].startsWith("http") && links[1].startsWith("http"));
  const canPost = text.trim().length>0 && !overLimit && tags.length>0 && linksOk;
  const toggleTag = (tag: string) => setTags(p => p.includes(tag)?p.filter(x=>x!==tag):[...p,tag]);
  const userInitials = currentUser.name.split(" ").map(w=>w[0]).slice(0,2).join("").toUpperCase()||"VK";

  const handlePost = () => {
    if (!canPost) return;
    onPost({
      id: `user_${Date.now()}`, author: { name:currentUser.name, handle:`@${currentUser.name.toLowerCase().replace(/\s+/g,"_")}`, initials:userInitials, color:"#5B21D1", points:580 },
      content: text, tags, timestamp:"now", state:"clean", likes:0, comments:0, reposts:0, warnedMe:0, isNews:type==="news",
    });
    onClose();
  };

  return (
    <div className="absolute inset-0 z-50 flex flex-col bg-background">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border shrink-0">
        <button onClick={onClose} className="p-1 text-foreground"><X size={20} /></button>
        <div className="flex items-center gap-1 bg-muted/60 rounded-full p-1">
          <button onClick={() => setType("short")} className={`text-xs font-semibold px-4 py-1.5 rounded-full transition-all font-lao ${type==="short"?"bg-primary text-white":"text-muted-foreground"}`}>{t.compose_short}</button>
          <button onClick={() => setType("news")} className={`text-xs font-semibold px-4 py-1.5 rounded-full transition-all font-lao ${type==="news"?"bg-primary text-white":"text-muted-foreground"}`}>{t.compose_news}</button>
        </div>
        <button onClick={handlePost} disabled={!canPost} className={`text-sm font-semibold px-4 py-1.5 rounded-full transition-all font-lao ${canPost?"bg-primary text-white shadow-sm":"bg-primary/15 text-primary/40 cursor-not-allowed"}`}>{t.compose_post}</button>
      </div>
      <div className="mx-4 mt-3 rounded-xl p-3 bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 shrink-0">
        <p className="text-[11px] text-indigo-700 dark:text-indigo-300 leading-relaxed font-lao">{t.compose_info}</p>
      </div>
      <div className="flex-1 overflow-y-auto scrollbar-hide px-4 py-4">
        <div className="flex items-start gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center font-bold text-white text-sm shrink-0">{userInitials}</div>
          <div>
            <p className="text-sm font-semibold">{currentUser.name}</p>
            <p className="text-xs text-muted-foreground font-lao">@{currentUser.name.toLowerCase().replace(/\s+/g,"_")} · 2 {t.compose_remaining}</p>
          </div>
        </div>
        <textarea value={text} onChange={(e) => setText(e.target.value)} placeholder={type==="short"?t.compose_ph_short:t.compose_ph_news}
          className={`w-full min-h-[100px] bg-transparent text-sm leading-relaxed outline-none resize-none placeholder:text-muted-foreground/50 font-lao ${overLimit?"text-red-500":""}`} />
        <div className={`text-right text-xs font-medium mb-4 ${remaining<=20?(overLimit?"text-red-500":"text-amber-500"):"text-muted-foreground"}`}>{remaining}</div>

        {/* Photo Upload */}
        <PhotoUpload onFilesChange={setUploadedFiles} lang={lang} />

        {type==="news" && (
          <div className="mb-5">
            <p className="text-[10px] font-bold tracking-wider uppercase text-foreground/50 mb-2.5 font-lao">{t.compose_sources}</p>
            <div className="space-y-2">
              {links.map((link, i) => (
                <div key={i} className="flex items-center gap-2 bg-muted/50 rounded-xl px-3 py-2.5 border border-border">
                  <Link2 size={13} className="text-muted-foreground shrink-0" />
                  <input value={link} onChange={(e) => { const n=[...links]; n[i]=e.target.value; setLinks(n); }} placeholder={`${t.compose_source_ph} ${i+1}...`}
                    className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground/50" />
                  {link.startsWith("http") && <Check size={13} className="text-green-500 shrink-0" />}
                </div>
              ))}
            </div>
          </div>
        )}
        <div>
          <p className="text-[10px] font-bold tracking-wider uppercase text-foreground/50 mb-2.5">
            <span className="font-lao">{t.compose_topics}</span> <span className="text-muted-foreground normal-case font-normal tracking-normal font-lao">({t.compose_topics_hint})</span>
          </p>
          <div className="flex flex-wrap gap-2">
            {TOPICS.map(tag => (
              <button key={tag} onClick={() => toggleTag(tag)}
                className={`text-xs font-medium px-3 py-1.5 rounded-full border transition-all font-lao ${tags.includes(tag)?"bg-primary text-white border-primary":"border-border text-foreground/70 hover:border-primary/40 bg-background"}`}>
                #{lang==="lo" ? TOPIC_LABELS[tag]?.lo||tag : tag}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
//  ALERTS SHEET
// ═══════════════════════════════════════════════════════════════════════════════
function AlertsSheet({ onClose, lang }: { onClose: () => void; lang: Lang }) {
  const t = T[lang];
  const [read, setRead] = useState<Set<number>>(new Set());
  const alerts = lang==="en" ? [
    { icon:"✅", text:"Sarak's post was expert verified (+50 pts)", time:"2h", type:"verify" },
    { icon:"🛡️", text:"Your post received 12 \"Warned me\" reactions", time:"4h", type:"engage" },
    { icon:"⚠️", text:"A new post in #OnlineScam is under expert review", time:"5h", type:"review" },
    { icon:"🌿", text:"Bounmy's trafficking post was unlocked (SLA)", time:"8h", type:"sla" },
    { icon:"📢", text:"New expert-confirmed post in #DigitalSafety", time:"1d", type:"verify" },
    { icon:"🔴", text:"Naly's post was confirmed false — correction issued", time:"1d", type:"false" },
    { icon:"🛡️", text:"1,800 people tapped 'Warned me' on the BCEL scam post", time:"2d", type:"engage" },
  ] : [
    { icon:"✅", text:"ໂພສຂອງ Sarak ໄດ້ຮັບການຢືນຢັນ (+50 ຄະແນນ)", time:"2h", type:"verify" },
    { icon:"🛡️", text:"ໂພສຂອງທ່ານໄດ້ຮັບ 12 'ເຕືອນຂ້ອຍ'", time:"4h", type:"engage" },
    { icon:"⚠️", text:"ໂພສໃໝ່ໃນ #ການຫຼອກລວງ ກຳລັງຖືກກວດສອບ", time:"5h", type:"review" },
    { icon:"🌿", text:"ໂພສຂອງ Bounmy ຖືກປົດລ໋ອກ (ໝົດເວລາ)", time:"8h", type:"sla" },
    { icon:"📢", text:"ໂພສໃໝ່ທີ່ໄດ້ຮັບການຢືນຢັນໃນ #ຄວາມປອດໄພດິຈິຕອລ", time:"1d", type:"verify" },
    { icon:"🔴", text:"ໂພສຂອງ Naly ໄດ້ຮັບການຢືນຢັນວ່າເປັນຂໍ້ມູນຜິດ", time:"1d", type:"false" },
    { icon:"🛡️", text:"1,800 ຄົນກົດ 'ເຕືອນຂ້ອຍ' ໃນໂພສ BCEL", time:"2d", type:"engage" },
  ];
  const typeColors: Record<string,string> = {
    verify: "bg-green-50 dark:bg-green-950/50 border-green-200 dark:border-green-800",
    engage: "bg-indigo-50 dark:bg-indigo-950/50 border-indigo-200 dark:border-indigo-800",
    review: "bg-amber-50 dark:bg-amber-950/50 border-amber-200 dark:border-amber-800",
    sla:    "bg-gray-100 dark:bg-gray-900/60 border-gray-200 dark:border-gray-700",
    false:  "bg-red-50 dark:bg-red-950/50 border-red-200 dark:border-red-800",
  };

  return (
    <div className="absolute inset-0 z-50 flex flex-col bg-background">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <h2 className="font-display font-bold text-base font-lao">{t.alerts_title}</h2>
        <div className="flex items-center gap-3">
          <button onClick={() => setRead(new Set(alerts.map((_,i)=>i)))} className="text-xs text-primary font-semibold font-lao">{t.alerts_mark_all}</button>
          <button onClick={onClose} className="p-1 text-muted-foreground"><X size={20} /></button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto scrollbar-hide divide-y divide-border/50">
        {alerts.map((alert, i) => (
          <button key={i} onClick={() => setRead(r => new Set([...r, i]))}
            className={`w-full text-left flex items-start gap-3 px-4 py-3.5 transition-colors hover:bg-muted/30 ${read.has(i)?"opacity-60":""}`}>
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 border text-base ${typeColors[alert.type]}`}>{alert.icon}</div>
            <div className="flex-1 min-w-0">
              <p className="text-sm leading-relaxed font-lao">{alert.text}</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">{alert.time}</p>
            </div>
            {!read.has(i) && <div className="w-2 h-2 rounded-full bg-primary shrink-0 mt-1.5" />}
          </button>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
//  EXPLORE VIEW
// ═══════════════════════════════════════════════════════════════════════════════
function ExploreView({ posts, onPostTap, lang }: { posts: Post[]; onPostTap: (p: Post) => void; lang: Lang }) {
  const [search, setSearch] = useState("");
  const [selectedTopic, setSelectedTopic] = useState<string|null>(null);
  const t = T[lang];
  const trending = [
    { tag:"OnlineScam", count:"2.4k", hot:true },
    { tag:"JobScam", count:"1.1k", hot:true },
    { tag:"Trafficking", count:"890", hot:false },
    { tag:"DigitalSafety", count:"743", hot:false },
    { tag:"CryptoScam", count:"512", hot:false },
    { tag:"RomanceScam", count:"387", hot:false },
    { tag:"BorderSafety", count:"298", hot:false },
    { tag:"PhishingAlert", count:"201", hot:false },
  ];
  const filtered = trending.filter(item => !search || item.tag.toLowerCase().includes(search.toLowerCase()) || (TOPIC_LABELS[item.tag]?.lo||"").includes(search));

  if (selectedTopic) {
    const topicPosts = posts.filter(p => p.tags.includes(selectedTopic));
    const label = TOPIC_LABELS[selectedTopic];
    return (
      <div className="flex flex-col h-full">
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border sticky top-0 bg-background/95 backdrop-blur-sm z-10">
          <button onClick={() => setSelectedTopic(null)} className="p-1 -ml-1"><ArrowLeft size={20} strokeWidth={1.75} /></button>
          <div>
            <h2 className="font-display font-bold text-base">#{lang==="lo"&&label ? label.lo : selectedTopic}</h2>
            {label && <p className="text-[10px] text-muted-foreground">#{lang==="lo" ? label.en : label.lo}</p>}
            <p className="text-[11px] text-muted-foreground">{topicPosts.length} {t.topic_posts}</p>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto scrollbar-hide">
          {topicPosts.length===0
            ? <div className="py-16 text-center text-sm text-muted-foreground">No posts yet.</div>
            : topicPosts.map(post => <PostCard key={post.id} post={post} onTap={() => onPostTap(post)} lang={lang} />)
          }
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-y-auto scrollbar-hide">
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm px-4 py-3 border-b border-border">
        <div className="flex items-center gap-2.5 bg-muted/60 rounded-2xl px-4 py-2.5 border border-border/50 focus-within:border-primary/30 transition-colors">
          <Search size={15} className="text-muted-foreground shrink-0" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t.search_ph}
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground/60 font-lao" />
          {search && <button onClick={() => setSearch("")}><X size={14} className="text-muted-foreground" /></button>}
        </div>
      </div>
      <div className="px-4 py-4">
        <h3 className="font-display font-bold text-base mb-3 font-lao">{t.trending}</h3>
        <div className="space-y-0.5">
          {filtered.map((item, i) => {
            const label = TOPIC_LABELS[item.tag];
            return (
              <button key={item.tag} onClick={() => setSelectedTopic(item.tag)}
                className="w-full flex items-center justify-between py-3.5 border-b border-border/40 hover:bg-indigo-50/40 -mx-1 px-1 rounded-lg transition-colors text-left group">
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-sm font-semibold text-indigo-700">#{lang==="lo"&&label ? label.lo : item.tag}</span>
                    {label && <span className="text-[10px] text-indigo-400">#{lang==="lo" ? label.en : label.lo}</span>}
                    {item.hot && <span className="text-[10px] font-bold bg-orange-100 text-orange-600 px-1.5 py-0.5 rounded-full">HOT</span>}
                  </div>
                  <span className="text-xs text-muted-foreground">{item.count} {t.topic_posts}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground/50 font-medium">#{i+1}</span>
                  <ChevronRight size={14} className="text-muted-foreground/40 group-hover:text-indigo-500 transition-colors" />
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
//  PROFILE VIEW
// ═══════════════════════════════════════════════════════════════════════════════
function ProfileView({ currentUser, posts, lang }: { currentUser: CurrentUser; posts: Post[]; lang: Lang }) {
  const t = T[lang];
  const [activeTab, setActiveTab] = useState<ProfileTab>("posts");
  const [editing, setEditing] = useState(false);
  const [displayName, setDisplayName] = useState(currentUser.name);
  const [editName, setEditName] = useState(currentUser.name);
  const [bio, setBio] = useState("Student in Vientiane. Sharing scam warnings to keep my community safe online.");
  const [editBio, setEditBio] = useState(bio);
  const [followed, setFollowed] = useState(["OnlineScam","JobScam","Trafficking","DigitalSafety"]);
  const [avatarGradient, setAvatarGradient] = useState(AVATAR_GRADIENTS[0]);
  const [bannerGradient, setBannerGradient] = useState(BANNER_GRADIENTS[0]);
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [showBannerPicker, setShowBannerPicker] = useState(false);
  const initials = displayName.split(" ").map(w=>w[0]).slice(0,2).join("").toUpperCase()||"VK";

  const saveEdit = () => { setDisplayName(editName||displayName); setBio(editBio); setEditing(false); setShowAvatarPicker(false); setShowBannerPicker(false); };
  const cancelEdit = () => { setEditName(displayName); setEditBio(bio); setEditing(false); setShowAvatarPicker(false); setShowBannerPicker(false); };
  const toggleFollow = (topic: string) => setFollowed(p => p.includes(topic)?p.filter(x=>x!==topic):[...p,topic]);
  const myPosts = posts.filter(p=>p.id.startsWith("user_")).concat(posts.slice(0,2));

  return (
    <div className="flex flex-col h-full overflow-y-auto scrollbar-hide bg-background">
      {/* Banner */}
      <div className="relative h-28 shrink-0" style={{ background: bannerGradient }}>
        {editing && (
          <button onClick={() => { setShowBannerPicker(v=>!v); setShowAvatarPicker(false); }}
            className="absolute top-2 right-2 flex items-center gap-1.5 bg-black/40 text-white text-xs font-semibold px-3 py-1.5 rounded-full backdrop-blur-sm">
            <ImageIcon size={12} />{t.change_banner}
          </button>
        )}
        {showBannerPicker && (
          <div className="absolute top-10 right-2 z-20 bg-white dark:bg-background rounded-2xl p-3 shadow-xl border border-border flex gap-2 flex-wrap w-52">
            {BANNER_GRADIENTS.map((g, i) => (
              <button key={i} onClick={() => { setBannerGradient(g); setShowBannerPicker(false); }}
                className={`w-10 h-10 rounded-xl border-2 transition-all ${bannerGradient===g?"border-primary scale-110":"border-transparent"}`}
                style={{ background: g }} />
            ))}
          </div>
        )}
        <div className="absolute -bottom-7 left-4">
          <div className="relative">
            <div className="w-16 h-16 rounded-full border-4 border-background flex items-center justify-center font-bold text-xl text-white" style={{ background: avatarGradient }}>
              {initials}
            </div>
            {editing && (
              <button onClick={() => { setShowAvatarPicker(v=>!v); setShowBannerPicker(false); }}
                className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-primary border-2 border-background flex items-center justify-center">
                <Camera size={10} className="text-white" />
              </button>
            )}
          </div>
          {showAvatarPicker && (
            <div className="absolute top-14 left-0 z-20 bg-white dark:bg-background rounded-2xl p-3 shadow-xl border border-border flex gap-2 flex-wrap w-52">
              {AVATAR_GRADIENTS.map((g, i) => (
                <button key={i} onClick={() => { setAvatarGradient(g); setShowAvatarPicker(false); }}
                  className={`w-10 h-10 rounded-full border-2 transition-all ${avatarGradient===g?"border-primary scale-110":"border-transparent"}`}
                  style={{ background: g }} />
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="pt-10 px-4 pb-4 border-b border-border">
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1 min-w-0 mr-3">
            {editing
              ? <input value={editName} onChange={(e) => setEditName(e.target.value)} className="font-display font-bold text-xl outline-none border-b-2 border-primary bg-transparent w-full mb-0.5" />
              : <h2 className="font-display font-bold text-xl">{displayName}</h2>
            }
            <p className="text-sm text-muted-foreground">@{displayName.toLowerCase().replace(/\s+/g,"_")}</p>
          </div>
          {editing
            ? <div className="flex gap-2 shrink-0">
                <button onClick={saveEdit} className="text-xs font-semibold bg-primary text-white px-3 py-1.5 rounded-full font-lao">{t.save}</button>
                <button onClick={cancelEdit} className="text-xs font-semibold border border-border rounded-full px-3 py-1.5 font-lao">{t.cancel}</button>
              </div>
            : <button onClick={() => { setEditing(true); setEditName(displayName); setEditBio(bio); }}
                className="flex items-center gap-1.5 text-xs font-semibold border border-border rounded-full px-3 py-1.5 hover:bg-muted/50 transition-colors shrink-0 font-lao">
                <Pencil size={12} />{t.edit_profile}
              </button>
          }
        </div>
        <div className="flex items-center gap-1.5 mb-2">
          <LeafMark state="verified" size={14} />
          <span className="text-xs font-medium text-green-700">Verified contributor</span>
        </div>
        {editing
          ? <textarea value={editBio} onChange={(e) => setEditBio(e.target.value)} placeholder={t.bio_ph}
              className="text-sm leading-relaxed w-full outline-none border border-border rounded-xl p-2.5 resize-none bg-muted/30 mb-3 min-h-[56px] font-lao" />
          : <p className="text-sm leading-relaxed mb-3 text-foreground/80 font-lao">{bio}</p>
        }
        <div className="flex gap-5 text-sm mb-4">
          <span><b>{myPosts.length}</b> <span className="text-muted-foreground font-lao">{t.posts}</span></span>
          <span><b>340</b> <span className="text-muted-foreground">Following</span></span>
          <span><b>580</b> <span className="text-muted-foreground font-lao">{t.points_tab}</span></span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {followed.map(topic => (
            <span key={topic} className="text-[10px] font-medium bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 px-2.5 py-1 rounded-full flex flex-col">
              <span>#{lang==="lo"&&TOPIC_LABELS[topic] ? TOPIC_LABELS[topic].lo : topic}</span>
            </span>
          ))}
          <button onClick={() => setActiveTab("topics")} className="text-xs font-medium text-muted-foreground border border-border px-2.5 py-1 rounded-full hover:border-primary/30 font-lao">{t.add_topic}</button>
        </div>
      </div>

      <div className="flex border-b border-border shrink-0 sticky top-0 bg-background/95 backdrop-blur-sm z-10">
        {(["posts","topics","points"] as ProfileTab[]).map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`flex-1 py-3 text-sm font-medium transition-colors border-b-2 font-lao ${activeTab===tab?"border-primary text-primary":"border-transparent text-muted-foreground"}`}>
            {tab==="posts"?t.posts:tab==="topics"?t.topics:t.points_tab}
          </button>
        ))}
      </div>

      {activeTab==="posts" && (
        myPosts.length===0
          ? <div className="py-12 text-center text-sm text-muted-foreground">No posts yet.</div>
          : myPosts.map(p => <PostCard key={p.id} post={p} onTap={()=>{}} lang={lang} />)
      )}

      {activeTab==="topics" && (
        <div className="p-4 space-y-0.5">
          {TOPICS.map(topic => {
            const label = TOPIC_LABELS[topic];
            return (
              <div key={topic} className="flex items-center justify-between py-3 border-b border-border/40">
                <div>
                  <span className="text-sm font-semibold text-indigo-700">#{lang==="lo"&&label ? label.lo : topic}</span>
                  {label && <span className="text-[10px] text-muted-foreground ml-2">#{lang==="lo" ? label.en : label.lo}</span>}
                </div>
                <button onClick={() => toggleFollow(topic)}
                  className={`text-xs font-semibold px-3.5 py-1.5 rounded-full transition-all font-lao ${followed.includes(topic)?"bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300":"border border-border text-foreground/60 hover:border-primary/30"}`}>
                  {followed.includes(topic)?"Following":"Follow"}
                </button>
              </div>
            );
          })}
        </div>
      )}

      {activeTab==="points" && (
        <div className="p-4">
          <div className="flex items-center justify-between mb-5">
            <div>
              <p className="text-3xl font-bold font-display text-foreground">580</p>
              <p className="text-xs text-muted-foreground mt-0.5 font-lao">{t.total_points}</p>
            </div>
            <div className="flex items-center gap-2 bg-green-50 dark:bg-green-950/50 border border-green-200 dark:border-green-800 rounded-2xl px-3.5 py-2.5">
              <LeafMark state="verified" size={16} />
              <div>
                <p className="text-xs font-bold text-green-800 dark:text-green-400 font-lao">{t.rank} #47</p>
                <p className="text-[10px] text-green-600 dark:text-green-500 font-lao">{t.region}</p>
              </div>
            </div>
          </div>
          <p className="text-[10px] font-bold tracking-wider uppercase text-foreground/40 mb-3 font-lao">{t.recent_activity}</p>
          <div className="space-y-2.5">
            {[{pts:"+50",date:"Jul 10",state:"featured" as LeafState},{pts:"+30",date:"Jul 7",state:"verified" as LeafState},{pts:"+25",date:"Jun 29",state:"verified" as LeafState}].map((item,i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-muted/40 dark:bg-muted/20 rounded-xl border border-border/40">
                <div className="flex items-center gap-2.5">
                  <LeafMark state={item.state} size={15} />
                  <div>
                    <p className="text-xs font-medium font-lao">{t.post_verified}</p>
                    <p className="text-[10px] text-muted-foreground">{item.date}</p>
                  </div>
                </div>
                <span className="text-sm font-bold text-green-700">{item.pts}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
//  SPLASH SCREEN
// ═══════════════════════════════════════════════════════════════════════════════
function SplashScreen({ onDone }: { onDone: () => void }) {
  const [fading, setFading] = useState(false);
  useEffect(() => {
    const t1 = setTimeout(() => setFading(true), 1700);
    const t2 = setTimeout(() => onDone(), 2200);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [onDone]);

  return (
    <div className="absolute inset-0 z-[100] flex flex-col items-center justify-center"
      style={{ background:"linear-gradient(160deg,#1E1B4B 0%,#3B0FA0 45%,#1a365d 100%)", opacity:fading?0:1, transition:"opacity 0.5s ease-in-out" }}>
      <div className="absolute inset-0" style={{ background:"radial-gradient(circle at 50% 40%, rgba(147,197,253,0.12) 0%, transparent 60%)" }} />
      <SatiLogo size={72} />
      <h1 className="font-display font-bold text-white text-center mt-5 leading-none" style={{ fontSize:28, letterSpacing:"-0.03em" }}>
        Satisampasanya
      </h1>
      <p className="font-lao text-white/50 mt-2 text-sm" style={{ letterSpacing:"0.04em" }}>ສະຕິຊໍາປະຊັນຍະ</p>
      <p className="absolute bottom-12 text-white/25 text-[10px] tracking-widest uppercase font-medium">Stay safe · ປອດໄພທາງອອນລາຍ</p>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
//  APP ROOT
// ═══════════════════════════════════════════════════════════════════════════════
export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [lang, setLang] = useState<Lang>("en");
  const [themeMode, setThemeMode] = useState<ThemeMode>("system");
  const [currentUser, setCurrentUser] = useState<CurrentUser>({ name:"Vilay Ketmany", email:"vilay@example.com" });
  const [view, setView] = useState<ActiveView>("feed");
  const [selectedPost, setSelectedPost] = useState<Post|null>(null);
  const [composeOpen, setComposeOpen] = useState(false);
  const [alertsOpen, setAlertsOpen] = useState(false);
  const [posts, setPosts] = useState<Post[]>(INITIAL_POSTS);
  const [postToast, setPostToast] = useState(false);

  const toggleLang = () => setLang(l => l==="en"?"lo":"en");
  const t = T[lang];

  const handleNewPost = (post: Post) => {
    setPosts(prev => [post, ...prev]);
    setPostToast(true);
    setTimeout(() => setPostToast(false), 3000);
  };

  const showHeader = !selectedPost && !composeOpen && !alertsOpen;

  return (
    <div className="size-full flex items-center justify-center bg-slate-200/60 dark:bg-slate-900">
      <div className="relative w-full max-w-[390px] h-full max-h-[844px] bg-background flex flex-col overflow-hidden dark"
        style={{ boxShadow:"0 0 0 1px rgba(0,0,0,.08),0 24px 48px rgba(0,0,0,.22)" }}>

        {showSplash && <SplashScreen onDone={() => setShowSplash(false)} />}

        {!isAuthenticated ? (
          <div className="flex-1 overflow-hidden">
            <AuthScreen lang={lang} onLangToggle={toggleLang} onLogin={(user) => { setCurrentUser(user); setIsAuthenticated(true); }} />
          </div>
        ) : (
          <>
            {showHeader && (
              <div className="flex items-center justify-between px-4 py-2.5 border-b border-border shrink-0">
                <div className="flex items-center gap-2 min-w-0">
                  <SatiLogo size={22} />
                  <span className="font-display font-bold text-sm truncate font-lao" style={{ letterSpacing:"-0.01em" }}>{t.app_name}</span>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <LangToggle lang={lang} onToggle={toggleLang} />
                  <ThemeToggle mode={themeMode} onChange={setThemeMode} />
                  <button onClick={() => setAlertsOpen(true)} className="p-2 text-muted-foreground hover:text-foreground transition-colors relative">
                    <Bell size={20} strokeWidth={1.75} />
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full border-2 border-background" />
                  </button>
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                    style={{ background:"linear-gradient(135deg,#5B21D1,#84ADEF)" }}>
                    {currentUser.name.split(" ").map(w=>w[0]).slice(0,2).join("").toUpperCase()||"VK"}
                  </div>
                </div>
              </div>
            )}

            <div className="flex-1 overflow-hidden relative">
              {selectedPost ? (
                <PostDetail post={selectedPost} onBack={() => setSelectedPost(null)} lang={lang} />
              ) : view==="feed" ? (
                <FeedView posts={posts} onPostTap={p=>setSelectedPost(p)} lang={lang} />
              ) : view==="explore" ? (
                <ExploreView posts={posts} onPostTap={p=>setSelectedPost(p)} lang={lang} />
              ) : (
                <ProfileView currentUser={currentUser} posts={posts} lang={lang} />
              )}
              {composeOpen && <ComposeOverlay onClose={() => setComposeOpen(false)} onPost={handleNewPost} lang={lang} currentUser={currentUser} />}
              {alertsOpen && <AlertsSheet onClose={() => setAlertsOpen(false)} lang={lang} />}
            </div>

            {postToast && (
              <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-50 bg-foreground text-background text-xs font-semibold px-4 py-2 rounded-full shadow-lg font-lao whitespace-nowrap">{t.posted}</div>
            )}

            {showHeader && (
              <div className="border-t border-border bg-background shrink-0">
                <div className="flex items-center justify-around px-2 py-1.5">
                  {[
                    { id:"feed" as ActiveView, icon:Home, label:t.nav_home },
                    { id:"explore" as ActiveView, icon:Search, label:t.nav_explore },
                  ].map(({ id, icon:Icon, label }) => (
                    <button key={id} onClick={() => setView(id)}
                      className={`flex flex-col items-center gap-0.5 px-4 py-1.5 transition-colors ${view===id?"text-primary":"text-muted-foreground"}`}>
                      <Icon size={22} strokeWidth={view===id?2.25:1.75} />
                      <span className="text-[10px] font-medium font-lao">{label}</span>
                    </button>
                  ))}
                  <button onClick={() => setComposeOpen(true)}
                    className="w-12 h-12 -mt-3 rounded-full text-white flex items-center justify-center active:scale-95 transition-transform"
                    style={{ background:"linear-gradient(135deg,#5B21D1,#84ADEF)", boxShadow:"0 4px 16px rgba(91,33,209,0.4)" }}>
                    <Plus size={22} strokeWidth={2.5} />
                  </button>
                  <button onClick={() => setAlertsOpen(true)}
                    className="flex flex-col items-center gap-0.5 px-4 py-1.5 text-muted-foreground relative hover:text-foreground transition-colors">
                    <Bell size={22} strokeWidth={1.75} />
                    <span className="absolute top-0.5 right-3 w-1.5 h-1.5 bg-primary rounded-full" />
                    <span className="text-[10px] font-medium font-lao">{t.nav_alerts}</span>
                  </button>
                  <button onClick={() => setView("profile")}
                    className={`flex flex-col items-center gap-0.5 px-4 py-1.5 transition-colors ${view==="profile"?"text-primary":"text-muted-foreground"}`}>
                    <User size={22} strokeWidth={view==="profile"?2.25:1.75} />
                    <span className="text-[10px] font-medium font-lao">{t.nav_profile}</span>
                  </button>
                </div>
                <div className="flex justify-center pb-1.5 pt-0.5">
                  <div className="w-28 h-1 bg-foreground/20 rounded-full" />
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
