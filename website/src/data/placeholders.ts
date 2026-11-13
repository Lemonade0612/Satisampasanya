// All remaining placeholders live here (or in links.ts) so they can be filled in one place.
// Never invent statistics: replace each "[N]" with a real, sourced figure.

// Home — stats row: Active users, Posts checked, Scams flagged, Expert verification
export const HOME_STATS = ["[N]", "[N]", "[N]", "48h"];
export const STREAK_DAYS = "[N]";

// About — roadmap. Replace [Month]/[Year]/[Milestone]/[Short line] and add photos (photo: "/images/xyz.jpg").
export type RoadmapStatus = "done" | "now" | "next";
export const ROADMAP: { date: string; title: string; line: string; status: RoadmapStatus; photo?: string }[] = [
  { date: "[Month] [Year]", title: "[Milestone]", line: "[Short line]", status: "done" },
  { date: "[Month] [Year]", title: "[Milestone]", line: "[Short line]", status: "done" },
  { date: "[Month] [Year]", title: "[Milestone]", line: "[Short line]", status: "done" },
  { date: "[Month] [Year]", title: "[Milestone]", line: "[Short line]", status: "now" },
  { date: "[Month] [Year]", title: "[Next goal]", line: "[Short line]", status: "next" },
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

// Help — Facebook links (replace "#")
export const FACEBOOK_LINKS = {
  sati: { label: "Sati on Facebook [link]", url: "#" },
  laocert: { label: "LaoCERT on Facebook [link]", url: "#" },
  womensUnion: { label: "Lao Women's Union on Facebook [link]", url: "#" },
};

// Policies
export const POLICY_LAST_UPDATED = "[DATE]";
