// All remaining placeholders live here (or in links.ts) so they can be filled in one place.
// Never invent statistics: replace each "[N]" with a real, sourced figure.

// Home — stats row: Active users, Posts checked, Scams flagged, Expert verification
export const HOME_STATS = ["[N]", "[N]", "[N]", "48h"];
export const STREAK_DAYS = "[N]";

// About — roadmap. Replace each placeholder with real text in BOTH languages ({ en, lo }) and add photos (photo: "/images/xyz.jpg").
export type RoadmapStatus = "done" | "now" | "next";
type L = { en: string; lo: string };
const DATE: L = { en: "[Month] [Year]", lo: "[ເດືອນ] [ປີ]" };
const TITLE: L = { en: "[Milestone]", lo: "[ຜົນສຳເລັດ]" };
const LINE: L = { en: "[Short line]", lo: "[ຄຳອະທິບາຍສັ້ນໆ]" };
export const ROADMAP: { date: L; title: L; line: L; status: RoadmapStatus; photo?: string }[] = [
  { date: DATE, title: TITLE, line: LINE, status: "done" },
  { date: DATE, title: TITLE, line: LINE, status: "done" },
  { date: DATE, title: TITLE, line: LINE, status: "done" },
  { date: DATE, title: TITLE, line: LINE, status: "now" },
  { date: DATE, title: { en: "[Next goal]", lo: "[ເປົ້າໝາຍຕໍ່ໄປ]" }, line: LINE, status: "next" },
];

// Impact — hero card, number cards, chart. Replace every "[N]".
export const IMPACT_FLAGGED_RED = "[N]%";
export const IMPACT_VERIFIED_48H = "[N]%";
export const IMPACT_NUMBERS = ["[N]", "[N]", "[N]", "[N]"]; // users, posts checked, games played, experts
export const POSTS_PER_MONTH = ["[N]", "[N]", "[N]", "[N]", "[N]", "[N]"]; // Jun–Nov labels
export const POSTS_BAR_HEIGHTS = [30, 42, 38, 55, 68, 85]; // % — illustrative until real data is in
export const POST_RESULTS_TOTAL = "[N]";
export const POST_RESULTS = { green: "[N]%", yellow: "[N]%", red: "[N]%" };
export const POST_RESULTS_SHARE = { green: 55, yellow: 25, red: 20 }; // donut slice sizes (illustrative)

// Facebook links (replace "#" and the "[link]" text in both languages)
export const FACEBOOK_LINKS: Record<"sati" | "laocert" | "womensUnion", { label: L; url: string }> = {
  sati: { label: { en: "Sati on Facebook [link]", lo: "Sati ໃນ Facebook [ລິ້ງ]" }, url: "#" },
  laocert: { label: { en: "LaoCERT on Facebook [link]", lo: "LaoCERT ໃນ Facebook [ລິ້ງ]" }, url: "#" },
  womensUnion: { label: { en: "Lao Women's Union on Facebook [link]", lo: "ສະຫະພັນແມ່ຍິງລາວ ໃນ Facebook [ລິ້ງ]" }, url: "#" },
};

// Policies
export const POLICY_LAST_UPDATED = "[DATE]";
