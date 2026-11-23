import { readFileSync } from "node:fs";

export interface TrainingCase { text: string; expected: string; flags: string[]; notes: string; section: string }

/** Parse the markdown tables in training.md: `text | expected | flags | notes`. */
export function loadTraining(path: string): TrainingCase[] {
  const out: TrainingCase[] = [];
  let section = "";
  for (const line of readFileSync(path, "utf8").split("\n")) {
    if (line.startsWith("## ")) { section = line.slice(3).trim(); continue; }
    if (!line.startsWith("|") || /^\|\s*(text|---)/.test(line)) continue;
    const cells = line.slice(1, line.lastIndexOf("|")).split(/ \| /).map((c) => c.trim());
    if (cells.length < 3) continue;
    const flags = cells[2] === "—" || !cells[2] ? [] : cells[2].split(",").map((f) => f.trim()).filter(Boolean);
    out.push({ text: cells[0], expected: cells[1], flags, notes: cells[3] ?? "", section });
  }
  return out;
}

/** "≥flagged" accepts flagged or false. */
export function stateOk(expected: string, actual: string): boolean {
  return expected === "≥flagged" ? actual === "flagged" || actual === "false" : expected === actual;
}
