// Run: npm run eval:screening [-- path/to/overrides.json]
// Scores the local screening engine against every labelled example and prints where the lists and weights need work.
import { existsSync, readFileSync } from "node:fs";
import { screenPost } from "../shared/screening/index";
import { loadTraining, stateOk } from "../shared/screening/training";

interface Case { text: string; link?: string; expected: string; flags: string[]; source: string }

const cases: Case[] = [];
for (const c of loadTraining("shared/screening/training.md")) cases.push({ text: c.text, expected: c.expected, flags: c.flags, source: "training.md" });
for (const c of JSON.parse(readFileSync("shared/screening/cases.json", "utf8"))) cases.push({ ...c, source: "cases.json" });
const overridesPath = process.argv[2] ?? "scripts/overrides.json";
if (existsSync(overridesPath)) {
  for (const o of JSON.parse(readFileSync(overridesPath, "utf8"))) cases.push({ text: o.text, expected: o.expert_state, flags: [], source: "expert override" });
}

const pct = (a: number, b: number) => (b ? ((a / b) * 100).toFixed(1) + "%" : "n/a");
let ok = 0;
const stateWrong: { c: Case; got: string; flags: string[] }[] = [];
const falseGreens: Case[] = [];
const falseReds: Case[] = [];
const missed: Record<string, string[]> = {};
const bySource: Record<string, [number, number]> = {};

for (const c of cases) {
  const r = screenPost(c.text, c.link);
  const got = r.flags.map((f) => f.id as string);
  const good = stateOk(c.expected, r.state);
  (bySource[c.source] ??= [0, 0])[1]++;
  if (good) { ok++; bySource[c.source][0]++; } else stateWrong.push({ c, got: r.state, flags: got });
  if (c.expected !== "clean" && r.state === "clean") falseGreens.push(c);
  if (c.expected === "clean" && r.state !== "clean") falseReds.push(c);
  for (const f of c.flags) if (!got.includes(f)) (missed[f] ??= []).push(c.text);
}

const line = "─".repeat(60);
console.log(`\nSati local screening eval\n${line}`);
console.log(`Cases: ${cases.length}   Accuracy: ${ok}/${cases.length} (${pct(ok, cases.length)})`);
for (const [s, [a, b]] of Object.entries(bySource)) console.log(`  ${s.padEnd(18)} ${a}/${b}`);
console.log(`False-greens (scam, trafficking or privacy marked clean): ${falseGreens.length}`);
console.log(`False-reds (safe post held or blocked): ${falseReds.length}`);
console.log(`\nMisses per detector (expected flag not raised)\n${line}`);
const rows = Object.entries(missed).sort((a, b) => b[1].length - a[1].length);
if (!rows.length) console.log("none");
for (const [f, t] of rows) console.log(`${f.padEnd(24)} ${t.length}   e.g. ${t[0].slice(0, 70)}`);
if (stateWrong.length) {
  console.log(`\nWrong state\n${line}`);
  for (const w of stateWrong) console.log(`expected ${w.c.expected.padEnd(8)} got ${w.got.padEnd(8)} [${w.flags.join(",")}]  ${w.c.text.slice(0, 80)}`);
}
if (falseGreens.length) { console.log(`\nFALSE-GREENS\n${line}`); for (const c of falseGreens) console.log(`- (${c.source}) ${c.text}`); }
console.log(falseGreens.length ? "\nFAIL: false-greens must be zero." : "\nPASS: zero false-greens.");
process.exit(falseGreens.length ? 1 : 0);
