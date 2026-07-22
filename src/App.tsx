import { useState, useEffect, useRef, useCallback } from "react";
import {
  Heart, MessageCircle, Share2, Repeat2, Flag, ArrowLeft, X, LogOut,
  AlertTriangle, Clock, Bell, Search, Home, User, Plus, Shield,
  Zap, Link2, Check, Send, Eye, EyeOff, Pencil, Play, ChevronRight,
  Camera, Image as ImageIcon, Moon, Sun, TrendingUp, Upload, FileImage,
  Trash2, ChevronDown, Globe, Lock, AlertOctagon, ExternalLink,
} from "lucide-react";

// ═══════════════════════════════════════════════════════════════════════════════
//  IMAGE IMPORTS
// ═══════════════════════════════════════════════════════════════════════════════
// IMPORTANT: You must rename these 2 files to remove spaces/parentheses:
//   1. "image 2.png"   -> "image_2.png"
//   2. "image (2).png" -> "image_2_apk.png"
// Run these commands in your terminal (inside the imports folder):
//   mv 'image 2.png' image_2.png
//   mv 'image (2).png' image_2_apk.png
import imgBcel from "@/imports/image_2.png";
import imgApk from "@/imports/image_2_apk.png";
import imgLaoPost from "@/imports/Screenshot_2026-07-19_at_14.05.21.png";
import imgPhoneScam from "@/imports/image-13.png";
import imgTraffickingVideo from "@/imports/image-11.png";
import imgTruck from "@/imports/image-12.png";
import imgTraffickingPoster from "@/imports/image-10.png";
import imgTiktokScam from "@/imports/image-14.png";
// IMPORTANT: Rename the file to remove spaces before running:
// "Screenshot 2026-07-19 at 14.30.16.png" -> "logo.png" (or any name without spaces)
// Then update the path below to match your renamed file
import logoImage from "@/imports/Screenshot_2026-07-19_at_14.30.16.png";

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
  link?: string;
  repostOf?: string;
  repostText?: string;
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
    app_name: "Satisampasanya", app_short: "Satisampasanya",
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
    compose_news: "News", compose_post: "Post",
    compose_info: "Points only for expert-verified posts. Featured bonus for verified posts that spread awareness. Limit: 2 posts + 5 comments per day.",
    compose_remaining: "posts remaining today",
    compose_ph_news: "What's on your mind? (1-500 chars)",
    compose_sources: "Source Links (required)", compose_source_ph: "Source URL",
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
    footer: "Your trusted source, built for youth. · ແຫຼ່ງຂໍ້ມູນທີ່ໜ້າເຊື່ອ ສໍາລັບໄວໜຸ່ມ · Built for Lao youth safety",
    repost: "Repost", repost_ph: "Add your thoughts (optional, max 150)", reposted: "Reposted!",
    show_more: "Show more", show_less: "Show less", following: "Following", follow: "Follow",
  },
  lo: {
    app_name: "ສະຕິຊໍາປະຊັນຍະ", app_short: "ສະຕິຊໍາປະຊັນຍະ",
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
    compose_news: "ຂ່າວ", compose_post: "ໂພສ",
    compose_info: "ຄະແນນສຳລັບໂພສທີ່ຜ່ານການກວດສອບໂດຍຜູ້ຊ່ຽວຊານເທົ່ານັ້ນ. ຈຳກັດ: 2 ໂພສ + 5 ຄອມເມັນຕໍ່ວັນ.",
    compose_remaining: "ໂພສຍັງເຫຼືອ",
    compose_ph_news: "ມີຫຍັງໃຈຢາກແຊຣ໌? (50-2000 ຕົວອັກສອນ)",
    compose_sources: "ລິ້ງແຫຼ່ງຂໍ້ມູນ (ບັງຄັບ)", compose_source_ph: "URL ແຫຼ່ງຂໍ້ມູນ",
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
    footer: "Your trusted source, built for youth. · ແຫຼ່ງຂໍ້ມູນທີ່ໜ້າເຊື່ອ ສໍາລັບໄວໜຸ່ມ · Built for Lao youth safety",
    repost: "Repost", repost_ph: "ເພີ່ມຄວາມຄິດເຫັນ (ບໍ່ບັງຄັບ, ສູງສຸດ 150)", reposted: "Reposted!",
    show_more: "ສະແດງເພີ່ມ", show_less: "ສະແດງໜ້ອຍ", following: "ກຳລັງຕິດຕາມ", follow: "ຕິດຕາມ",
  },
} as const;

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
//  SATI LOGO (SVG - Professional S mark)
// ═══════════════════════════════════════════════════════════════════════════════
function SatiLogo({ size = 28, className = "" }: { size?: number; className?: string }) {
  const h = Math.round(size * 1.1);
  return (
    <svg width={size} height={h} viewBox="0 0 100 110" fill="none" className={className}>
      <polygon points="6,54 30,54 30,82 82,82 82,104 18,104 6,80" fill="#84ADEF" />
      <polygon points="18,6 82,6 94,30 94,56 70,56 70,28 18,28" fill="#5B21D1" />
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
    points: 50, featuredPoints: true,
    image: imgBcel,
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
    points: 75, featuredPoints: false, isNews: true,
    image: imgPhoneScam,
  },
  {
    id: "p4", author: AUTHORS.boun,
    content: "A TikTok video showing a chained woman in China went viral — she is one of thousands trafficked for forced marriage and labour. This happens to Lao women too. If someone offers you a job or marriage in China without meeting in person first, report it immediately: 1800 (Lao anti-trafficking hotline).",
    contentLo: "ວິດີໂອ TikTok ສະແດງຜູ້ຍິງຖືກຕ່ວນໃນຈີນ — ນາງແມ່ນໜຶ່ງໃນຫຼາຍພັນຄົນທີ່ຖືກຄ້າ. ນີ້ເກີດຂຶ້ນກັບຜູ້ຍິງລາວດ້ວຍ. ຖ້າໃຜສະເໜີວຽກ ຫຼື ການແຕ່ງງານໃນຈີນໂດຍບໍ່ໄດ້ພົບກ່ອນ, ລາຍງານທັນທີ: 1800.",
    tags: ["Trafficking", "BorderSafety"], timestamp: "3h", state: "sla",
    likes: 156, comments: 43, reposts: 89, warnedMe: 74,
    hasVideo: true,
    image: imgTraffickingVideo,
  },
  {
    id: "p5", author: AUTHORS.naly,
    content: "Reporting scams to the Lao cybercrime police is pointless. They just warn the scammer and nothing happens. Don't bother — just warn friends directly.",
    contentLo: "ການລາຍງານການຫຼອກລວງໃຫ້ຕຳຫຼວດອາຊະຍາກຳໄຊເບີລາວແມ່ນໄຮ້ປະໂຫຍດ. ພວກເຂົາພຽງແຕ່ເຕືອນຜູ້ຫຼອກລວງ. ຢ່າເສຍເວລາ.",
    tags: ["DigitalSafety"], timestamp: "8h", state: "false",
    likes: 12, comments: 5, reposts: 3, warnedMe: 0,
    correction: "Lao cybercrime police do file and act on reports. Report at cybercrime.gov.la or call 021-212-516. Filings compile evidence to identify and dismantle scam networks.",
    correctionLo: "ຕຳຫຼວດອາຊະຍາກຳໄຊເບີລາວຮັບ ແລະ ດຳເນີນການ. ລາຍງານທີ່ cybercrime.gov.la ຫຼື 021-212-516.",
    image: imgLaoPost,
  },
  {
    id: "p6", author: AUTHORS.phone,
    content: "This Facebook post in Lao is spreading dangerous misinformation about border crossing. The post claims it's safe to cross with a broker — it is NOT. This is how trafficking starts. Shared as a WARNING, not an endorsement.",
    contentLo: "ໂພສ Facebook ນີ້ແຜ່ຂໍ້ມູນຜິດກ່ຽວກັບການຂ້າມຊາຍແດນ. ໂພສອ້າງວ່າການຂ້າມຜ່ານນາຍໜ້າປອດໄພ — ບໍ່ປອດໄພ. ນີ້ແມ່ນຈຸດເລີ່ມຕົ້ນຂອງການຄ້າມະນຸດ. ແຊຣ໌ເພື່ອເຕືອນ.",
    tags: ["Trafficking", "SocialMedia"], timestamp: "1h", state: "clean",
    likes: 67, comments: 14, reposts: 38, warnedMe: 29,
  },
  {
    id: "p7", author: AUTHORS.malee,
    content: "Human trafficking takes many forms — sexual exploitation, forced labor, child trafficking, forced marriage, organ trafficking. Know the signs. The Church and NGOs in Laos offer free support. #TogetherAgainstHumanTrafficking",
    contentLo: "ການຄ້າມະນຸດມີຫຼາຍຮູບແບບ — ການຂູດຮີດທາງເພດ, ແຮງງານບັງຄັບ, ການຄ້າເດັກ, ການແຕ່ງງານບັງຄັບ, ການຄ້າອະໄວຍະວະ. ຮູ້ຈັກສັນຍານ. NGO ໃນລາວໃຫ້ການຊ່ວຍເຫຼືອຟຣີ.",
    tags: ["Trafficking", "BorderSafety"], timestamp: "4h", state: "confirmed",
    likes: 312, comments: 28, reposts: 145, warnedMe: 118,
    points: 40, featuredPoints: false,
    image: imgTraffickingPoster,
  },
  {
    id: "p8", author: AUTHORS.kham,
    content: "FOUND IN A TRUCK: This photo shows people smuggled in a truck container on the Lao-Thai border. If you see suspicious vehicles, call 1800 or the police immediately. Do not engage the traffickers.",
    contentLo: "ພົບໃນລົດບັນທຸກ: ຮູບນີ້ສະແດງຄົນທີ່ຖືກລັກລອບຂ້າມຊາຍແດນ. ຖ້າເຫັນລົດໜ້າສົງໄສ, ໂທ 1800 ທັນທີ.",
    tags: ["Trafficking", "BorderSafety"], timestamp: "6h", state: "confirmed",
    likes: 523, comments: 61, reposts: 287, warnedMe: 201,
    points: 45, featuredPoints: true,
    image: imgTruck,
  },
  {
    id: "p9", author: AUTHORS.phone,
    content: "TikTok scam: 'Joybuy' pop-ups appearing in videos promise prizes if you click. This is a phishing page — it collects your phone number and payment details. If you see this popup while watching TikTok, close it immediately.",
    contentLo: "ການຫຼອກລວງ TikTok: ປ໊ອບອັບ 'Joybuy' ສັນຍາລາງວັນຖ້າກົດ. ນີ້ແມ່ນໜ້າ phishing — ເກັບເບີໂທ ແລະ ຂໍ້ມູນການຊຳລະ. ຖ້າເຫັນ popup ນີ້, ປິດທັນທີ.",
    tags: ["OnlineScam", "SocialMedia"], timestamp: "30m", state: "clean",
    likes: 89, comments: 17, reposts: 52, warnedMe: 41,
    hasVideo: true,
    image: imgTiktokScam,
  },
  {
    id: "p10", author: AUTHORS.admin,
    content: "BREAKING: 924 Indian nationals rescued from Golden Triangle SEZ in Laos. Trafficked workers forced into cyber-scam operations. This mirrors what happens to Lao citizens too. Read the full RFA report for details on how trafficking networks operate in the region.",
    contentLo: "ຂ່າວດ່ວນ: 924 ຄົນອິນເດຍຖືກຊ່ອຍຈາກເຂດສີ່ເຫຼົ່າສາມຫຼ່ຽມຄຳໃນລາວ. ແຮງງານທີ່ຖືກຄ້າຖືກບັງຄັບເຮັດວຽກ scam ໄຊເບີ. ນີ້ຄ້າຍຄືກັບສິ່ງທີ່ເກີດຂຶ້ນກັບພົນລະເມືອງລາວ. ອ່ານບົດລາຍງານ RFA ສົມບູນ.",
    tags: ["Trafficking", "BorderSafety", "DigitalSafety"], timestamp: "30m", state: "confirmed",
    likes: 1240, comments: 187, reposts: 892, warnedMe: 654,
    points: 60, featuredPoints: true, isNews: true,
    link: "https://www.rfa.org/lao/daily/southeastasia/924-indian-nationals-rescured-from-golden-triangle-sez-01302025003502.html",
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
          <svg key="a" width="15" height="18" viewBox="0 0 814 1000" fill="black"><path d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76.5 0-103.7 40.8-165.9 40.8s-105-57.8-155.5-127.4C46 537.8 10.3 427.8 10.3 321.7c0-178.5 116.4-272.8 230.7-272.8 61.3 0 112.4 40.8 150.8 40.8 36.7 0 94.7-43.1 163.7-43.1 26.4 0 108.2 2.6 163.7 80.3zm-234.4-181.9c30.3-36.2 52.2-86.5 52.2-136.7 0-7.1-.6-14.3-1.9-20.1-49.3 1.9-108.2 33.2-142.6 75.2-28.1 32.2-55.9 82.5-55.9 133.3 0 7.7 1.3 15.4 1.9 17.9 3.2.6 8.4 1.3 13.6 1.3 44.1 0 100.9-30.3 132.7-70.9z"/></svg>,
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
  const isDark = mode === "dark" || (mode === "system" && window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches);
  return (
    <button
      onClick={() => onChange(isDark ? "light" : "dark")}
      className="p-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
      title={isDark ? "Switch to light" : "Switch to dark"}
    >
      {isDark ? <Sun size={16} /> : <Moon size={16} />}
    </button>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
//  SPLASH SCREEN
// ═══════════════════════════════════════════════════════════════════════════════
function SplashScreen({ onDone }: { onDone: () => void }) {
  const [fading, setFading] = useState(false);
  useEffect(() => {
    const t1 = setTimeout(() => setFading(true), 2000);
    const t2 = setTimeout(() => onDone(), 2600);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [onDone]);

  return (
    <div className="absolute inset-0 z-[100] flex flex-col items-center justify-center"
      style={{ background: "linear-gradient(160deg,#1E1B4B 0%,#3B0FA0 45%,#1a365d 100%)", opacity: fading ? 0 : 1, transition: "opacity 0.6s ease-in-out" }}>
      <div className="absolute inset-0" style={{ background: "radial-gradient(circle at 50% 40%, rgba(147,197,253,0.12) 0%, transparent 60%)" }} />
      <div className="relative">
        <img src={logoImage} alt="Sati Logo" className="w-20 h-20 rounded-2xl object-cover shadow-2xl" />
      </div>
      <h1 className="font-display font-bold text-white text-center mt-6 leading-none" style={{ fontSize: 32, letterSpacing: "-0.03em" }}>
        Satisampasanya
      </h1>
      <p className="font-lao text-white/50 mt-3 text-base" style={{ letterSpacing: "0.04em" }}>ສະຕິຊໍາປະຊັນຍະ</p>

      <div className="absolute bottom-16 flex flex-col items-center gap-2">
        <div className="w-8 h-8 rounded-full border-2 border-white/20 border-t-white/80 animate-spin" />
        <p className="text-white/40 text-[10px] text-center leading-relaxed">
          Your trusted source, built for youth.
        </p>
        <p className="font-lao text-white/30 text-[10px] text-center mt-0.5">
          ແຫຼ່ງຂໍ້ມູນທີ່ໜ້າເຊື່ອ ສໍາລັບໄວໜຸ່ມ
        </p>
      </div>
    </div>
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
        <div className="flex items-center gap-2 mb-3">
          <img src={logoImage} alt="Sati Logo" className="w-8 h-8 rounded-lg object-cover" />
          <span className="font-display font-bold text-base" style={{ letterSpacing:"-0.02em" }}>{t.app_short}</span>
        </div>
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
          <div className="rounded-2xl p-5 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-center">
              <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center mx-auto mb-3">
                <Check size={24} className="text-emerald-600 dark:text-emerald-400" />
              </div>
              <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-300 font-lao">{t.reset_sent}</p>
            </div>
          ) : (
            <>
              <FormInput value={forgotEmail} onChange={(v) => { setForgotEmail(v); setForgotError(""); }} placeholder={t.field_email} type="email" error={forgotError} />
              <button onClick={handleForgot} className="w-full bg-primary text-white font-semibold py-3.5 rounded-2xl text-sm mb-3 active:scale-[0.98] transition-transform font-lao" style={{ boxShadow:"0 4px 14px rgba(91,33,209,0.35)" }}>{t.btn_send_reset}</button>
            </>
          )}
        </div>
        <div className="px-5 pb-6 text-center">
          <button onClick={() => setView("login")} className="text-sm text-muted-foreground font-lao">{t.back_signin}</button>
        </div>
      </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
//  POST CARD
// ═══════════════════════════════════════════════════════════════════════════════
function PostCard({ post, lang, onOpenComments, onLike, onRepost, onWarnedMe, onRepostClick, onImageExpand, onTopicClick }: {
  post: Post; lang: Lang; onOpenComments: (id: string) => void;
  onLike: (id: string) => void; onRepost: (id: string) => void; onWarnedMe: (id: string) => void;
  onRepostClick: (post: Post) => void; onImageExpand?: (url: string) => void; onTopicClick?: (topic: string) => void;
}) {
  const t = T[lang];
  const [liked, setLiked] = useState(false);
  const [reposted, setReposted] = useState(false);
  const [warned, setWarned] = useState(false);
  const [showFull, setShowFull] = useState(false);
  const content = lang === "lo" && post.contentLo ? post.contentLo : post.content;
  const isLong = content.length > 200;
  const displayContent = showFull || !isLong ? content : content.slice(0, 200) + "...";

  const getLeafState = (): LeafState => {
    if (post.state === "confirmed") return post.featuredPoints ? "featured" : "verified";
    if (post.state === "flagged" || post.state === "sla") return "pending";
    return "none";
  };


  return (
    <article className="bg-background border-b border-border">
      {getStateBanner()}
      <div className="px-4 pt-3 pb-2">
        <div className="flex gap-3">
          <div className="shrink-0">
            <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ background: post.author.color }}>
              {post.author.initials}
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-semibold text-sm text-foreground">{post.author.name}</span>
              <LeafMark state={getLeafState()} size={14} />
              {post.isNews && <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-primary/10 text-primary">{t.news_label}</span>}
              <span className="text-xs text-muted-foreground">{post.author.handle}</span>
              <span className="text-xs text-muted-foreground">·</span>
              <span className="text-xs text-muted-foreground">{post.timestamp}</span>
            </div>
            <p className="text-sm text-foreground leading-relaxed mt-1 whitespace-pre-wrap">{displayContent}</p>
            {isLong && (
              <button onClick={() => setShowFull(v => !v)} className="text-xs text-primary font-semibold mt-1">
                {showFull ? t.show_less : t.show_more}
              </button>
            )}
            {post.image && (
              <div className="mt-2.5 rounded-2xl overflow-hidden border border-border relative cursor-pointer" onClick={() => onImageExpand && onImageExpand(post.image!)}>
                <img src={post.image} alt="" className="w-full h-auto object-cover max-h-[400px]" />
                {post.hasVideo && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-14 h-14 rounded-full bg-black/50 flex items-center justify-center">
                      <Play size={24} className="text-white ml-1" />
                    </div>
                  </div>
                )}
              </div>
            )}
            {post.link && (
              <a href={post.link} target="_blank" rel="noopener noreferrer" className="mt-2.5 flex items-center gap-2 rounded-xl border border-border bg-muted/30 px-3 py-2.5 hover:bg-muted/50 transition-colors">
                <Link2 size={14} className="text-muted-foreground shrink-0" />
                <span className="text-xs text-primary truncate flex-1">{post.link}</span>
                <ExternalLink size={12} className="text-muted-foreground shrink-0" />
              </a>
            )}
            <div className="flex flex-wrap gap-1.5 mt-2.5">
              {post.tags.map(tag => (
                <span key={tag} onClick={(e) => { e.stopPropagation(); onTopicClick && onTopicClick(tag); }}
                  className="cursor-pointer">
                  <TagChip tag={tag} lang={lang} small />
                </span>
              ))}
            </div>
            {post.points !== undefined && post.state === "confirmed" && (
              <div className="flex items-center gap-3 mt-2.5 text-[11px] text-muted-foreground">
                <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                  <Zap size={12} /> {post.points} {t.verified_pts}
                </span>
                {post.featuredPoints && (
                  <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
                    <TrendingUp size={12} /> {t.featured_bonus}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="flex items-center justify-between px-2 py-2">
        <button onClick={() => { if (!liked) { setLiked(true); onLike(post.id); } }} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs transition-colors ${liked ? "text-red-500 bg-red-50 dark:bg-red-950/30" : "text-muted-foreground hover:bg-muted/50"}`}>
          <Heart size={16} fill={liked ? "currentColor" : "none"} /> {post.likes + (liked ? 1 : 0)}
        </button>
        <button onClick={() => onOpenComments(post.id)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs text-muted-foreground hover:bg-muted/50 transition-colors">
          <MessageCircle size={16} /> {post.comments}
        </button>
        <button onClick={() => onRepostClick(post)} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs transition-colors ${reposted ? "text-emerald-500 bg-emerald-50 dark:bg-emerald-950/30" : "text-muted-foreground hover:bg-muted/50"}`}>
          <Repeat2 size={16} /> {post.reposts + (reposted ? 1 : 0)}
        </button>
        <button onClick={() => { if (!warned) { setWarned(true); onWarnedMe(post.id); } }} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs transition-colors ${warned ? "text-amber-500 bg-amber-50 dark:bg-amber-950/30" : "text-muted-foreground hover:bg-muted/50"}`}>
          <Shield size={16} /> {post.warnedMe + (warned ? 1 : 0)}
        </button>
        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs text-muted-foreground hover:bg-muted/50 transition-colors">
          <Share2 size={16} />
        </button>
      </div>
    </article>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
//  REPOST MODAL
// ═══════════════════════════════════════════════════════════════════════════════
function RepostModal({ post, lang, onClose, onRepost }: {
  post: Post | null; lang: Lang; onClose: () => void;
  onRepost: (originalPost: Post, text: string) => void;
}) {
  const t = T[lang];
  const [text, setText] = useState("");
  if (!post) return null;

  const content = lang === "lo" && post.contentLo ? post.contentLo : post.content;
  const canRepost = text.length === 0 || (text.length >= 1 && text.length <= 150);

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <button onClick={onClose} className="p-1"><X size={20} /></button>
        <span className="text-sm font-semibold">{t.repost}</span>
        <button onClick={() => { if (canRepost) { onRepost(post, text); onClose(); } }} disabled={!canRepost} className="bg-primary text-white text-xs font-semibold px-4 py-1.5 rounded-full disabled:opacity-40 active:scale-95 transition-transform">
          {t.repost}
        </button>
      </div>
      <div className="flex-1 overflow-y-auto px-4 pt-4 pb-4">
        <div className="flex gap-3 mb-4">
          <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0" style={{ background: "linear-gradient(135deg,#5B21D1,#84ADEF)" }}>
            YO
          </div>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={t.repost_ph}
            className="flex-1 bg-transparent text-sm outline-none resize-none placeholder:text-muted-foreground/60 min-h-[80px]"
            maxLength={500}
          />
        </div>
        <div className="text-right text-xs text-muted-foreground mb-4">{150 - text.length} remaining</div>
        <div className="rounded-xl border border-border bg-muted/30 p-3">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[10px] font-bold" style={{ background: post.author.color }}>
              {post.author.initials}
            </div>
            <div>
              <span className="text-xs font-semibold">{post.author.name}</span>
              <span className="text-[10px] text-muted-foreground ml-1">{post.author.handle}</span>
            </div>
          </div>
          <p className="text-xs text-muted-foreground line-clamp-3">{content}</p>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
//  COMMENTS MODAL
// ═══════════════════════════════════════════════════════════════════════════════
function CommentsModal({ postId, posts, lang, onClose, onAddComment }: {
  postId: string | null; posts: Post[]; lang: Lang; onClose: () => void;
  onAddComment: (postId: string, text: string) => void;
}) {
  const t = T[lang];
  const post = posts.find(p => p.id === postId);
  const [reply, setReply] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  if (!post) return null;

  const dummyReplies = [
    { id: "r1", author: AUTHORS.phone, text: "Thanks for sharing this! I almost fell for a similar scam last week.", time: "1h" },
    { id: "r2", author: AUTHORS.malee, text: "Everyone should be careful with these messages. Always verify through official channels.", time: "45m" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background">
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-background/80 backdrop-blur-md">
        <button onClick={onClose} className="p-1 -ml-1"><ArrowLeft size={20} /></button>
        <h3 className="font-semibold text-sm">{t.posts}</h3>
      </div>
      <div ref={scrollRef} className="flex-1 overflow-y-auto">
        <div className="px-4 pt-4 pb-2">
          <div className="flex gap-3">
            <div className="shrink-0">
              <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ background: post.author.color }}>
                {post.author.initials}
              </div>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-sm">{post.author.name}</span>
                <span className="text-xs text-muted-foreground">{post.author.handle}</span>
                <span className="text-xs text-muted-foreground">· {post.timestamp}</span>
              </div>
              <p className="text-sm text-foreground leading-relaxed mt-1 whitespace-pre-wrap">{lang === "lo" && post.contentLo ? post.contentLo : post.content}</p>
              {post.image && <img src={post.image} alt="" className="mt-2 rounded-xl border border-border w-full max-h-[300px] object-cover" />}
            </div>
          </div>
        </div>
        <div className="flex items-center justify-between px-6 py-3 border-y border-border">
          <span className="text-xs text-muted-foreground">{post.likes} likes</span>
          <span className="text-xs text-muted-foreground">{post.reposts} reposts</span>
          <span className="text-xs text-muted-foreground">{post.comments} comments</span>
        </div>
        <div className="px-4 py-4">
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Replies</h4>
          {dummyReplies.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">{t.no_replies}</p>
          ) : (
            <div className="space-y-4">
              {dummyReplies.map(r => (
                <div key={r.id} className="flex gap-3">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[10px] font-bold shrink-0" style={{ background: r.author.color }}>
                    {r.author.initials}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-xs">{r.author.name}</span>
                      <span className="text-[10px] text-muted-foreground">{r.author.handle}</span>
                      <span className="text-[10px] text-muted-foreground">· {r.time}</span>
                    </div>
                    <p className="text-sm text-foreground mt-0.5">{r.text}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <div className="border-t border-border p-3 bg-background">
        <div className="flex items-center gap-2">
          <input
            value={reply}
            onChange={(e) => setReply(e.target.value)}
            placeholder={t.reply_ph}
            className="flex-1 bg-muted/50 rounded-full px-4 py-2.5 text-sm outline-none placeholder:text-muted-foreground/60"
            onKeyDown={(e) => { if (e.key === "Enter" && reply.trim()) { onAddComment(post.id, reply); setReply(""); }}}
          />
          <button
            onClick={() => { if (reply.trim()) { onAddComment(post.id, reply); setReply(""); }}}
            disabled={!reply.trim()}
            className="p-2.5 rounded-full bg-primary text-white disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 transition-transform"
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
//  COMPOSE MODAL (News Only)
// ═══════════════════════════════════════════════════════════════════════════════
function ComposeModal({ lang, onClose, onPost }: { lang: Lang; onClose: () => void; onPost: (post: Post) => void; }) {
  const t = T[lang];
  const [text, setText] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [sourceUrl, setSourceUrl] = useState("");
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [remaining, setRemaining] = useState(2);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const canPost = text.trim().length >= 50 && text.length <= 2000 && selectedTags.length > 0 && sourceUrl.trim().length > 0;

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const newFiles: UploadedFile[] = Array.from(e.target.files).map((file, i) => ({
      id: `f-${Date.now()}-${i}`,
      file,
      preview: URL.createObjectURL(file),
      progress: 0,
      status: "uploading" as const,
    }));
    setFiles(prev => [...prev, ...newFiles]);
    newFiles.forEach((f, idx) => {
      setTimeout(() => {
        setFiles(prev => prev.map(pf => pf.id === f.id ? { ...pf, progress: 100, status: "done" as const } : pf));
      }, 800 + idx * 300);
    });
  };

  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  };

  const handlePost = () => {
    if (!canPost) return;
    const newPost: Post = {
      id: `p-${Date.now()}`,
      author: { name: "You", handle: "@you", initials: "YO", color: COLORS.primary, points: 0 },
      content: text,
      tags: selectedTags,
      timestamp: "Just now",
      state: "flagged",
      likes: 0, comments: 0, reposts: 0, warnedMe: 0,
      flagReason: "Under AI screening. Usually reviewed within 2 hours.",
      isNews: true,
      link: sourceUrl,
    };
    onPost(newPost);
    setRemaining(v => Math.max(0, v - 1));
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <button onClick={onClose} className="p-1"><X size={20} /></button>
        <span className="text-sm font-semibold">{t.compose_news}</span>
        <button onClick={handlePost} disabled={!canPost} className="bg-primary text-white text-xs font-semibold px-4 py-1.5 rounded-full disabled:opacity-40 active:scale-95 transition-transform">
          {t.compose_post}
        </button>
      </div>
      <div className="flex-1 overflow-y-auto px-4 pt-4 pb-4">
        <p className="text-[11px] text-muted-foreground mb-3">{t.compose_info}</p>
        <p className="text-[11px] text-primary font-semibold mb-3">{remaining} {t.compose_remaining}</p>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={t.compose_ph_news}
          className="w-full min-h-[120px] bg-transparent text-sm outline-none resize-none placeholder:text-muted-foreground/60 text-foreground leading-relaxed"
        />
        <div className={`text-right text-xs mb-4 ${text.length < 50 ? "text-red-500" : "text-muted-foreground"}`}>
          {text.length} / 500 max
        </div>
        <div className="mt-3">
          <p className="text-xs font-semibold mb-1.5">{t.compose_sources}</p>
          <input value={sourceUrl} onChange={(e) => setSourceUrl(e.target.value)} placeholder={t.compose_source_ph}
            className="w-full rounded-xl border border-border bg-muted/50 px-3 py-2 text-sm outline-none placeholder:text-muted-foreground/60" />
        </div>
        <div className="mt-4">
          <p className="text-xs font-semibold mb-1.5">{t.compose_topics} <span className="text-muted-foreground font-normal">({t.compose_topics_hint})</span></p>
          <div className="flex flex-wrap gap-1.5">
            {TOPICS.map(tag => (
              <button key={tag} onClick={() => setSelectedTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag])}
                className={`px-2.5 py-1 rounded-full text-[11px] font-medium border transition-all ${selectedTags.includes(tag) ? "bg-primary text-white border-primary" : "bg-muted text-muted-foreground border-border hover:border-primary/30"}`}>
                #{lang === "lo" ? TOPIC_LABELS[tag].lo : TOPIC_LABELS[tag].en}
              </button>
            ))}
          </div>
        </div>
        <div className="mt-4">
          <p className="text-xs font-semibold mb-1.5">{t.compose_photos} <span className="text-muted-foreground font-normal">({t.compose_photos_hint})</span></p>
          <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleFileSelect} />
          <button onClick={() => fileInputRef.current?.click()} className="w-full border-2 border-dashed border-border rounded-2xl py-6 flex flex-col items-center gap-2 text-muted-foreground hover:border-primary/30 hover:bg-primary/5 transition-all">
            <Upload size={20} />
            <span className="text-xs">{t.compose_photos}</span>
          </button>
          {files.length > 0 && (
            <div className="flex gap-2 mt-3 flex-wrap">
              {files.map(f => (
                <div key={f.id} className="relative w-20 h-20 rounded-xl overflow-hidden border border-border">
                  <img src={f.preview} alt="" className="w-full h-full object-cover" />
                  <button onClick={() => removeFile(f.id)} className="absolute top-0.5 right-0.5 w-5 h-5 rounded-full bg-black/50 text-white flex items-center justify-center">
                    <X size={10} />
                  </button>
                  {f.status === "uploading" && (
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/20">
                      <div className="h-full bg-primary transition-all" style={{ width: `${f.progress}%` }} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
//  PROFILE SCREEN (Editable Banner & Avatar)
// ═══════════════════════════════════════════════════════════════════════════════
function ProfileScreen({ lang, user, posts, onLogout }: {
  lang: Lang; user: CurrentUser; posts: Post[]; onLogout: () => void;
}) {
  const t = T[lang];
  const [tab, setTab] = useState<ProfileTab>("posts");
  const [editing, setEditing] = useState(false);
  const [bio, setBio] = useState("Student in Vientiane. Sharing scam warnings to keep my community safe online.");
  const [editBio, setEditBio] = useState(bio);
  const [displayName, setDisplayName] = useState(user.name);
  const [editName, setEditName] = useState(user.name);
  const [avatarGradient, setAvatarGradient] = useState(AVATAR_GRADIENTS[0]);
  const [bannerGradient, setBannerGradient] = useState(BANNER_GRADIENTS[0]);
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [showBannerPicker, setShowBannerPicker] = useState(false);
  const [followed, setFollowed] = useState(["OnlineScam","JobScam","Trafficking","DigitalSafety"]);
  const [avatarFile, setAvatarFile] = useState<string | null>(null);
  const [bannerFile, setBannerFile] = useState<string | null>(null);

  const userPosts = posts.filter(p => p.author.name === "You" || p.author.handle === "@you");
  const totalPoints = userPosts.reduce((sum, p) => sum + (p.points || 0), 0);
  const initials = displayName.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase() || "YO";

  const saveEdit = () => {
    setDisplayName(editName || displayName);
    setBio(editBio);
    setEditing(false);
    setShowAvatarPicker(false);
    setShowBannerPicker(false);
  };

  const cancelEdit = () => {
    setEditName(displayName);
    setEditBio(bio);
    setEditing(false);
    setShowAvatarPicker(false);
    setShowBannerPicker(false);
  };

  const toggleFollow = (topic: string) => {
    setFollowed(p => p.includes(topic) ? p.filter(x => x !== topic) : [...p, topic]);
  };

  return (
    <div className="h-full flex flex-col bg-background overflow-y-auto scrollbar-hide">
      {/* Banner */}
      <div className="relative h-32 w-full shrink-0" style={{ background: bannerFile ? undefined : bannerGradient }}>
        {bannerFile && <img src={bannerFile} alt="banner" className="w-full h-full object-cover" />}
        {editing && (
          <>
            <input type="file" accept="image/*" className="hidden" id="banner-upload" onChange={(e) => {
              if (e.target.files?.[0]) {
                const url = URL.createObjectURL(e.target.files[0]);
                setBannerFile(url);
              }
            }} />
            <label htmlFor="banner-upload" className="absolute top-2 right-2 flex items-center gap-1.5 bg-black/40 text-white text-xs font-semibold px-3 py-1.5 rounded-full backdrop-blur-sm cursor-pointer z-10">
              <ImageIcon size={12} />{t.change_banner}
            </label>
          </>
        )}
      </div>
      {/* Avatar - positioned between banner and card */}
      <div className="relative -mt-8 ml-4 z-30 w-fit">
        <div className="w-16 h-16 rounded-full border-4 border-background flex items-center justify-center font-bold text-xl text-white overflow-hidden bg-gradient-to-br from-primary to-primaryLight"
          style={avatarFile ? undefined : { background: avatarGradient }}>
          {avatarFile ? <img src={avatarFile} alt="avatar" className="w-full h-full object-cover" /> : initials}
        </div>
        {editing && (
          <>
            <input type="file" accept="image/*" className="hidden" id="avatar-upload" onChange={(e) => {
              if (e.target.files?.[0]) {
                const url = URL.createObjectURL(e.target.files[0]);
                setAvatarFile(url);
              }
            }} />
            <label htmlFor="avatar-upload" className="absolute bottom-0 right-0 w-6 h-6 rounded-full bg-primary border-2 border-background flex items-center justify-center cursor-pointer">
              <Camera size={10} className="text-white" />
            </label>
          </>
        )}
      </div>

      {/* Identity */}
      <div className="px-4 pt-3 pb-4 border-b border-border bg-background">
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1 min-w-0 mr-3">
            {editing
              ? <input value={editName} onChange={(e) => setEditName(e.target.value)} className="font-display font-bold text-xl outline-none border-b-2 border-primary bg-transparent w-full mb-0.5" />
              : <h2 className="font-display font-bold text-xl">{displayName}</h2>
            }
            <p className="text-sm text-muted-foreground">@{displayName.toLowerCase().replace(/\s+/g, "_")}</p>
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
        {/* Trust badge */}
        <div className="flex items-center gap-1.5 mb-2">
          <LeafMark state="verified" size={14} />
          <span className="text-xs font-medium text-green-700 dark:text-green-400">Verified contributor</span>
        </div>
        {editing
          ? <textarea value={editBio} onChange={(e) => setEditBio(e.target.value)} placeholder={t.bio_ph}
              className="text-sm leading-relaxed w-full outline-none border border-border rounded-xl p-2.5 resize-none bg-muted/30 mb-3 min-h-[56px] font-lao" />
          : <p className="text-sm leading-relaxed mb-3 text-foreground/80 font-lao">{bio}</p>
        }
        <div className="flex gap-5 text-sm mb-4">
          <span><strong className="text-foreground">{userPosts.length}</strong> <span className="text-muted-foreground font-lao">{t.posts}</span></span>
          <span><strong className="text-foreground">340</strong> <span className="text-muted-foreground">Following</span></span>
          <span><strong className="text-foreground">{totalPoints}</strong> <span className="text-muted-foreground font-lao">{t.points_tab}</span></span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {followed.map(topic => (
            <span key={topic} className="text-[10px] font-medium bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 px-2.5 py-1 rounded-full flex flex-col">
              <span>#{lang === "lo" && TOPIC_LABELS[topic] ? TOPIC_LABELS[topic].lo : topic}</span>
            </span>
          ))}
          <button onClick={() => setTab("topics")} className="text-xs font-medium text-muted-foreground border border-border px-2.5 py-1 rounded-full hover:border-primary/30 font-lao">{t.add_topic}</button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border shrink-0 sticky top-0 bg-background/95 backdrop-blur-sm z-10">
        {(["posts","topics","points"] as ProfileTab[]).map(tabKey => (
          <button key={tabKey} onClick={() => setTab(tabKey)}
            className={`flex-1 py-3 text-sm font-medium transition-colors border-b-2 font-lao ${tab === tabKey ? "border-primary text-primary" : "border-transparent text-muted-foreground"}`}>
            {tabKey === "posts" ? t.posts : tabKey === "topics" ? t.topics : t.points_tab}
          </button>
        ))}
      </div>

      <div className="flex-1">
        {tab === "posts" && (
          <div>
            {userPosts.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground text-sm">No posts yet</div>
            ) : (
              userPosts.map(post => (
                <div key={post.id} className="px-4 py-3 border-b border-border">
                  <p className="text-sm text-foreground line-clamp-2">{lang === "lo" && post.contentLo ? post.contentLo : post.content}</p>
                  <div className="flex gap-2 mt-2">
                    {post.tags.map(tag => <TagChip key={tag} tag={tag} lang={lang} small />)}
                  </div>
                  <div className="flex items-center gap-3 mt-2 text-[11px] text-muted-foreground">
                    <span>{post.timestamp}</span>
                    <span>{post.likes} likes</span>
                    {post.points && <span className="text-emerald-600">{post.points} pts</span>}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
        {tab === "topics" && (
          <div className="p-4 space-y-0.5">
            {TOPICS.map(topic => {
              const label = TOPIC_LABELS[topic];
              return (
                <div key={topic} className="flex items-center justify-between py-3 border-b border-border/40">
                  <div>
                    <span className="text-sm font-semibold text-indigo-700">#{lang === "lo" && label ? label.lo : topic}</span>
                    {label && <span className="text-[10px] text-muted-foreground ml-2">#{lang === "lo" ? label.en : label.lo}</span>}
                  </div>
                  <button onClick={() => toggleFollow(topic)}
                    className={`text-xs font-semibold px-3.5 py-1.5 rounded-full transition-all font-lao ${followed.includes(topic) ? "bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300" : "border border-border text-foreground/60 hover:border-primary/30"}`}>
                    {followed.includes(topic) ? t.following : t.follow}
                  </button>
                </div>
              );
            })}
          </div>
        )}
        {tab === "points" && (
          <div className="p-4">
            <div className="flex items-center justify-between mb-5">
              <div>
                <p className="text-3xl font-bold font-display text-foreground">{totalPoints}</p>
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
      <div className="p-4 border-t border-border">
        <button onClick={onLogout} className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm font-semibold hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors">
          <LogOut size={16} /> Sign Out
        </button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
//  EXPLORE SCREEN (with Safety Checklist)
// ═══════════════════════════════════════════════════════════════════════════════
function ExploreScreen({ lang, posts, onOpenPost, onTopicClick }: { lang: Lang; posts: Post[]; onOpenPost: (id: string) => void; onTopicClick?: (topic: string) => void; }) {
  const t = T[lang];
  const [search, setSearch] = useState("");
  const [searchFocus, setSearchFocus] = useState(false);

  const trending = TOPICS.map(tag => ({
    tag,
    count: posts.filter(p => p.tags.includes(tag)).reduce((sum, p) => sum + p.likes + p.comments + p.reposts, 0),
  })).sort((a, b) => b.count - a.count).slice(0, 8);

  const filteredPosts = search.trim() ? posts.filter(p => {
    const searchLower = search.toLowerCase();
    // Search in both English and Lao content
    const contentMatch = p.content.toLowerCase().includes(searchLower) || 
                         (p.contentLo && p.contentLo.toLowerCase().includes(searchLower));
    // Search in both English and Lao tag labels
    const tagMatch = p.tags.some(t => {
      const label = TOPIC_LABELS[t];
      return t.toLowerCase().includes(searchLower) || 
             (label && (label.en.toLowerCase().includes(searchLower) || label.lo.toLowerCase().includes(searchLower)));
    });
    const authorMatch = p.author.name.toLowerCase().includes(searchLower);
    return contentMatch || tagMatch || authorMatch;
  }) : [];

  const safetyTips = [
    t.safety_tip_otp,
    t.safety_tip_job,
    t.safety_tip_apk,
    t.safety_tip_url,
    t.safety_tip_too_good,
  ];

  return (
    <div className="h-full flex flex-col bg-background overflow-y-auto scrollbar-hide">
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border px-4 py-3">
        <div className={`flex items-center gap-2 rounded-xl px-3 py-2.5 border transition-all ${searchFocus ? "border-primary/60 bg-white dark:bg-background" : "border-border bg-muted/50"}`}>
          <Search size={16} className="text-muted-foreground shrink-0" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onFocus={() => setSearchFocus(true)}
            onBlur={() => setSearchFocus(false)}
            placeholder={t.search_ph}
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground/60 text-foreground"
          />
          {search && <button onClick={() => setSearch("")} className="text-muted-foreground"><X size={14} /></button>}
        </div>
      </div>
      {search.trim() ? (
        <div>
          {filteredPosts.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground text-sm">No results found</div>
          ) : (
            filteredPosts.map(post => (
              <button key={post.id} onClick={() => onOpenPost(post.id)} className="w-full text-left px-4 py-3 border-b border-border hover:bg-muted/30 transition-colors">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-xs">{post.author.name}</span>
                  <span className="text-[10px] text-muted-foreground">{post.timestamp}</span>
                </div>
                <p className="text-sm text-foreground line-clamp-2">{lang === "lo" && post.contentLo ? post.contentLo : post.content}</p>
                <div className="flex gap-1.5 mt-1.5">
                  {post.tags.map(tag => (
                    <span key={tag} onClick={(e) => { e.stopPropagation(); onTopicClick && onTopicClick(tag); }}
                      className="cursor-pointer">
                      <TagChip tag={tag} lang={lang} small />
                    </span>
                  ))}
                </div>
              </button>
            ))
          )}
        </div>
      ) : (
        <div className="p-4">
          <h3 className="text-sm font-bold mb-3 flex items-center gap-1.5">
            <TrendingUp size={16} className="text-primary" /> {t.trending}
          </h3>
          <div className="space-y-2">
            {trending.map(({ tag, count }, i) => (
              <div key={tag} onClick={() => onTopicClick && onTopicClick(tag)}
                className="flex items-center justify-between p-3 rounded-xl border border-border bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer">
                <div className="flex items-center gap-3 pointer-events-none">
                  <span className="text-xs font-bold text-muted-foreground w-4">{i + 1}</span>
                  <TagChip tag={tag} lang={lang} />
                </div>
                <span className="text-xs text-muted-foreground pointer-events-none">{count.toLocaleString()} {t.topic_posts}</span>
              </div>
            ))}
          </div>
          <div className="mt-6">
            <h3 className="text-sm font-bold mb-3 flex items-center gap-1.5">
              <Shield size={16} className="text-primary" /> {t.safety_checklist}
            </h3>
            <div className="space-y-2">
              {safetyTips.map((tip, i) => (
                <div key={i} className="flex gap-2.5 p-3 rounded-xl border border-border bg-muted/30">
                  <Check size={14} className="text-primary shrink-0 mt-0.5" />
                  <p className="text-xs text-foreground leading-relaxed">{tip}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
//  ALERTS SCREEN
// ═══════════════════════════════════════════════════════════════════════════════
function AlertsScreen({ lang, onMarkAllRead, onClose }: { lang: Lang; onMarkAllRead: () => void; onClose: () => void; }) {
  const t = T[lang];
  const [alerts, setAlerts] = useState([
    { id: "a1", text: "Your post about BCEL scam was verified +50 points", time: "2h", read: false },
    { id: "a2", text: "New trafficking alert in Vientiane region", time: "5h", read: false },
    { id: "a3", text: "Sati Team posted: Digital Safety Checklist updated", time: "1d", read: true },
    { id: "a4", text: "Your report was flagged for review", time: "2d", read: true },
  ]);

  const unreadCount = alerts.filter(a => !a.read).length;

  const markRead = (id: string) => {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, read: true } : a));
  };

  const markAll = () => {
    setAlerts(prev => prev.map(a => ({ ...a, read: true })));
    onMarkAllRead();
  };

  return (
    <div className="h-full flex flex-col bg-background overflow-y-auto scrollbar-hide">
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={onClose} className="p-1 -ml-1"><ArrowLeft size={20} /></button>
          <h2 className="font-bold text-base">{t.alerts_title}</h2>
        </div>
        {unreadCount > 0 && (
          <button onClick={markAll} className="text-xs text-primary font-semibold">{t.alerts_mark_all}</button>
        )}
      </div>
      <div>
        {alerts.map(alert => (
          <button key={alert.id} onClick={() => markRead(alert.id)} className={`w-full text-left px-4 py-3 border-b border-border flex gap-3 transition-colors ${alert.read ? "bg-transparent" : "bg-primary/5"}`}>
            <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${alert.read ? "bg-transparent" : "bg-primary"}`} />
            <div className="flex-1">
              <p className="text-sm text-foreground">{alert.text}</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">{alert.time}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
//  IMAGE EXPAND MODAL
// ═══════════════════════════════════════════════════════════════════════════════
function ImageExpandModal({ imageUrl, onClose }: { imageUrl: string | null; onClose: () => void }) {
  if (!imageUrl) return null;
  return (
    <div className="fixed inset-0 z-[60] bg-black/95 flex items-center justify-center p-4" onClick={onClose}>
      <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors">
        <X size={24} />
      </button>
      <img src={imageUrl} alt="Full size" className="max-w-full max-h-full object-contain rounded-lg" onClick={(e) => e.stopPropagation()} />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
//  FEED SCREEN
// ═══════════════════════════════════════════════════════════════════════════════
function FeedScreen({ lang, posts, activeTab, onTabChange, onOpenComments, onLike, onRepost, onWarnedMe, onCompose, onOpenAlerts, alertCount, onRepostClick, themeMode, onThemeChange, onLangToggle, onImageExpand, onTopicClick }: {
  lang: Lang; posts: Post[]; activeTab: number; onTabChange: (i: number) => void;
  onOpenComments: (id: string) => void; onLike: (id: string) => void; onRepost: (id: string) => void;
  onWarnedMe: (id: string) => void; onCompose: () => void; onOpenAlerts: () => void; alertCount: number;
  onRepostClick: (post: Post) => void; themeMode: ThemeMode; onThemeChange: (m: ThemeMode) => void; onLangToggle: () => void; onImageExpand?: (url: string) => void; onTopicClick?: (topic: string) => void;
}) {
  const t = T[lang];
  const tabs = lang === "lo" ? FEED_TABS_LO : FEED_TABS_EN;

  const filteredPosts = activeTab === 0 ? posts :
    activeTab === 1 ? posts.filter(p => ["p1", "p3", "p7", "p8", "p10"].includes(p.id)) :
    posts.filter(p => {
      const tagMap = ["", "", "OnlineScam", "Trafficking", "DigitalSafety"];
      return p.tags.includes(tagMap[activeTab]);
    });

  return (
    <div className="h-full flex flex-col bg-background">
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="flex items-center justify-between px-4 py-2.5">
          <img src={logoImage} alt="Sati" className="w-8 h-8 rounded-lg object-cover" />
          <div className="flex items-center gap-2">
            <button onClick={onOpenAlerts} className="relative p-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors">
              <Bell size={18} />
              {alertCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center">{alertCount}</span>
              )}
            </button>
            <ThemeToggle mode={themeMode} onChange={onThemeChange} />
            <LangToggle lang={lang} onToggle={onLangToggle} />
          </div>
        </div>
        <div className="flex overflow-x-auto scrollbar-hide">
          {tabs.map((tab, i) => (
            <button key={i} onClick={() => onTabChange(i)} className={`px-4 py-3 text-xs font-semibold whitespace-nowrap transition-colors relative ${activeTab === i ? "text-primary" : "text-muted-foreground"}`}>
              {tab}
              {activeTab === i && <div className="absolute bottom-0 left-2 right-2 h-0.5 bg-primary rounded-full" />}
            </button>
          ))}
        </div>
      </div>
      <div className="flex-1 overflow-y-auto scrollbar-hide">
        {/* Compose bar hidden — users use the + button in bottom nav */}
        {filteredPosts.map(post => (
          <PostCard
            key={post.id}
            post={post}
            lang={lang}
            onOpenComments={onOpenComments}
            onLike={onLike}
            onRepost={onRepost}
            onWarnedMe={onWarnedMe}
            onRepostClick={onRepostClick}
            onImageExpand={onImageExpand}
            onTopicClick={onTopicClick}
          />
        ))}
        <div className="py-8 text-center">
          <p className="text-xs text-muted-foreground">{t.caught_up_en}</p>
          <p className="text-xs text-muted-foreground font-lao">{t.caught_up_lo}</p>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
//  BOTTOM NAV
// ═══════════════════════════════════════════════════════════════════════════════
function BottomNav({ active, onChange, lang, alertCount, onOpenAlerts, onCompose }: { 
  active: ActiveView; 
  onChange: (v: ActiveView) => void; 
  lang: Lang; 
  alertCount: number;
  onOpenAlerts: () => void;
  onCompose: () => void;
}) {
  const t = T[lang];

  return (
    <nav className="shrink-0 h-16 bg-background/80 backdrop-blur-md border-t border-border flex items-center justify-around px-2">
      <button onClick={() => onChange("feed")} className={`flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-xl transition-colors ${active === "feed" ? "text-primary" : "text-muted-foreground"}`}>
        <div className="relative">
          <Home size={20} />
          {alertCount > 0 && active !== "feed" && (
            <span className="absolute -top-1 -right-1.5 w-4 h-4 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center">{alertCount}</span>
          )}
        </div>
        <span className="text-[10px] font-medium">{t.nav_home}</span>
      </button>

      <button onClick={() => onChange("explore")} className={`flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-xl transition-colors ${active === "explore" ? "text-primary" : "text-muted-foreground"}`}>
        <Search size={20} />
        <span className="text-[10px] font-medium">{t.nav_explore}</span>
      </button>

      <button onClick={onCompose} className="w-12 h-12 -mt-3 rounded-full text-white flex items-center justify-center active:scale-95 transition-transform"
        style={{ background: "linear-gradient(135deg,#5B21D1,#84ADEF)", boxShadow: "0 4px 16px rgba(91,33,209,0.4)" }}>
        <Plus size={22} strokeWidth={2.5} />
      </button>

      <button onClick={onOpenAlerts} className="flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-xl transition-colors text-muted-foreground hover:text-primary">
        <div className="relative">
          <Bell size={20} />
          {alertCount > 0 && (
            <span className="absolute -top-1 -right-1.5 w-4 h-4 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center">{alertCount}</span>
          )}
        </div>
        <span className="text-[10px] font-medium">{t.nav_alerts}</span>
      </button>

      <button onClick={() => onChange("profile")} className={`flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-xl transition-colors ${active === "profile" ? "text-primary" : "text-muted-foreground"}`}>
        <User size={20} />
        <span className="text-[10px] font-medium">{t.nav_profile}</span>
      </button>
    </nav>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
//  MAIN APP
// ═══════════════════════════════════════════════════════════════════════════════
export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [lang, setLang] = useState<Lang>("en");
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [view, setView] = useState<ActiveView>("feed");
  const [feedTab, setFeedTab] = useState(0);
  const [posts, setPosts] = useState<Post[]>(INITIAL_POSTS);
  const [commentPostId, setCommentPostId] = useState<string | null>(null);
  const [showCompose, setShowCompose] = useState(false);
  const [alertCount, setAlertCount] = useState(2);
  const [showAlerts, setShowAlerts] = useState(false);
  const [repostPost, setRepostPost] = useState<Post | null>(null);
  const [postToast, setPostToast] = useState(false);
  const [themeMode, setThemeMode] = useState<ThemeMode>("light");
  const [expandedImage, setExpandedImage] = useState<string | null>(null);

  // Theme effect: apply dark class to document based on theme mode
  useEffect(() => {
    const root = document.documentElement;
    const isDark = themeMode === "dark";
    if (isDark) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [themeMode]);

  const toggleLang = () => setLang((l: Lang) => l === "en" ? "lo" : "en");

  const handleLogin = (u: CurrentUser) => {
    setUser(u);
    setView("feed");
  };

  const handleLogout = () => {
    setUser(null);
    setView("feed");
  };

  const handleAddPost = (post: Post) => {
    setPosts(prev => [post, ...prev]);
    setPostToast(true);
    setTimeout(() => setPostToast(false), 3000);
  };

  const handleAddComment = (postId: string, text: string) => {
    setPosts(prev => prev.map(p => p.id === postId ? { ...p, comments: p.comments + 1 } : p));
  };

  const handleRepost = (originalPost: Post, text: string) => {
    const newPost: Post = {
      id: `repost-${Date.now()}`,
      author: { name: "You", handle: "@you", initials: "YO", color: COLORS.primary, points: 0 },
      content: text ? `${text}\n\n— Repost from @${originalPost.author.handle}:` : `Repost from @${originalPost.author.handle}:`,
      tags: originalPost.tags,
      timestamp: "Just now",
      state: "clean",
      likes: 0, comments: 0, reposts: 0, warnedMe: 0,
      repostOf: originalPost.id,
      repostText: text,
    };
    setPosts(prev => [newPost, ...prev]);
    setPostToast(true);
    setTimeout(() => setPostToast(false), 3000);
  };

  const handleLike = (postId: string) => {
    setPosts(prev => prev.map(p => p.id === postId ? { ...p, likes: p.likes + 1 } : p));
  };

  const handleRepostCount = (postId: string) => {
    setPosts(prev => prev.map(p => p.id === postId ? { ...p, reposts: p.reposts + 1 } : p));
  };

  const handleWarnedMe = (postId: string) => {
    setPosts(prev => prev.map(p => p.id === postId ? { ...p, warnedMe: p.warnedMe + 1 } : p));
  };

  const handleOpenAlerts = () => {
    setShowAlerts(true);
    setAlertCount(0);
  };

  if (showSplash) {
    return (
      <div className="h-screen w-full max-w-md mx-auto bg-background relative overflow-hidden">
        <SplashScreen onDone={() => setShowSplash(false)} />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="h-screen w-full max-w-md mx-auto bg-background">
        <AuthScreen lang={lang} onLangToggle={toggleLang} onLogin={handleLogin} />
      </div>
    );
  }

  return (
    <div className="h-screen w-full max-w-md mx-auto bg-background flex flex-col relative overflow-hidden">
      <div className="flex-1 overflow-hidden relative">
        {view === "feed" && !showAlerts && (
          <FeedScreen
            lang={lang}
            posts={posts}
            activeTab={feedTab}
            onTabChange={setFeedTab}
            onOpenComments={setCommentPostId}
            onLike={handleLike}
            onRepost={handleRepostCount}
            onWarnedMe={handleWarnedMe}
            onCompose={() => setShowCompose(true)}
            onOpenAlerts={handleOpenAlerts}
            alertCount={alertCount}
            onRepostClick={setRepostPost}
            themeMode={themeMode}
            onThemeChange={setThemeMode}
            onLangToggle={toggleLang}
            onImageExpand={(url) => setExpandedImage(url)}
            onTopicClick={(topic) => {
              const tabMap: Record<string, number> = {
                "OnlineScam": 2, "Trafficking": 3, "DigitalSafety": 4,
                "JobScam": 2, "CryptoScam": 2, "BorderSafety": 3,
                "SocialMedia": 4, "PhishingAlert": 2, "RomanceScam": 2, "DataPrivacy": 4
              };
              setFeedTab(tabMap[topic] || 0);
            }}
          />
        )}
        {view === "explore" && !showAlerts && (
          <ExploreScreen 
            lang={lang} 
            posts={posts} 
            onOpenPost={setCommentPostId} 
            onTopicClick={(topic) => {
              setFeedTab(2 + TOPICS.indexOf(topic)); // Map to correct tab index
              setView("feed");
            }}
          />
        )}
        {view === "profile" && !showAlerts && (
          <ProfileScreen lang={lang} user={user} posts={posts} onLogout={handleLogout} />
        )}
        {showAlerts && (
          <div className="absolute inset-0 z-40">
            <AlertsScreen lang={lang} onMarkAllRead={() => setAlertCount(0)} onClose={() => setShowAlerts(false)} />
          </div>
        )}
      </div>
      {commentPostId && (
        <CommentsModal
          postId={commentPostId}
          posts={posts}
          lang={lang}
          onClose={() => setCommentPostId(null)}
          onAddComment={handleAddComment}
        />
      )}
      {showCompose && (
        <ComposeModal
          lang={lang}
          onClose={() => setShowCompose(false)}
          onPost={handleAddPost}
        />
      )}
      {repostPost && (
        <RepostModal
          post={repostPost}
          lang={lang}
          onClose={() => setRepostPost(null)}
          onRepost={handleRepost}
        />
      )}
      {expandedImage && (
        <ImageExpandModal
          imageUrl={expandedImage}
          onClose={() => setExpandedImage(null)}
        />
      )}
      {postToast && (
        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-50 bg-foreground text-background text-xs font-semibold px-4 py-2 rounded-full shadow-lg font-lao whitespace-nowrap">
          {T[lang].posted}
        </div>
      )}
      <BottomNav active={view} onChange={(v) => { setView(v); setShowAlerts(false); }} lang={lang} alertCount={alertCount} onOpenAlerts={handleOpenAlerts} onCompose={() => setShowCompose(true)} />
    </div>
  );
}