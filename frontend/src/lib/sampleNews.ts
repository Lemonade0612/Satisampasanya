import { screenPost, makeScreeningInfo } from "./localScreening";
import type { Post, PostState } from "../types";

const H = 3600 * 1000;
const author = { id: "sample-newsdesk", name: "Sati News Desk", handle: "@satinews", initials: "SN", color: "#5B21D1", points: 0 };

function sample(id: string, state: PostState, content: string, link: string | undefined, ageHours: number, extra: Partial<Post> = {}): Post {
  const createdAt = Date.now() - ageHours * H;
  const info = makeScreeningInfo(screenPost(content, link), createdAt);
  if (state === "screening") info.progress = 60;
  return {
    id, author, content, tags: ["News"], timestamp: ageHours < 1 ? "Just now" : `${Math.round(ageHours)}h`, state, likes: 0, comments: 0, reposts: 0, warnedMe: 0,
    isNews: true, isDemo: true, link, createdAt, contentLanguage: "en", localScreening: info, ...extra,
  };
}

/** One sample News post in each state. Shown only in development or with ?demo=1; never to real readers. */
export function sampleNews(): Post[] {
  return [
    sample("sample-news-confirmed", "confirmed", "Anti-trafficking unit reports a drop in fake overseas job ads. Read the full report from UNODC.", "https://www.unodc.org/report", 3, { likes: 24, comments: 4, warnedMe: 11 }),
    sample("sample-news-flagged", "flagged", "The government says scam centres are gone. Yeah right, the minister really cares about us.", undefined, 5),
    sample("sample-news-false", "false", "BREAKING: Free jobs in Cambodia casino, high salary, no experience needed. DM me on Telegram now!", undefined, 8, { correction: "Offers like this are a common recruitment lure. Real employers do not ask you to chat only on Telegram.", correctionLo: "ຂໍ້ສະເໜີແບບນີ້ເປັນການຊັກຊວນທີ່ພົບເລື້ອຍ. ນາຍຈ້າງແທ້ບໍ່ຂໍໃຫ້ຕິດຕໍ່ຜ່ານ Telegram ເທົ່ານັ້ນ." }),
    sample("sample-news-lure", "flagged", "Free Chinese Language Course! Starts Nov 15, 2026, 17:30–19:00, China Cultural Center, Vientiane. Limited seats! Contact on WhatsApp or scan the QR code.", undefined, 6),
    sample("sample-news-sla", "sla", "Rumour: new visa rules start next week for all workers heading to Thailand.", undefined, 49),
    sample("sample-news-screening", "screening", "New border checkpoint opens in Savannakhet, officials say.", undefined, 0.02),
  ];
}

export const showSamples = () => {
  try { return import.meta.env.DEV || new URLSearchParams(location.search).get("demo") === "1"; } catch { return false; }
};
