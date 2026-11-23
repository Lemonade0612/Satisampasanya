import { describe, expect, it } from "vitest";
import { fileURLToPath } from "node:url";
import { screenPost } from "./index";
import { loadTraining, stateOk } from "./training";

const cases = loadTraining(fileURLToPath(new URL("./training.md", import.meta.url)));

describe("training.md", () => {
  it("parses a sensible number of cases", () => expect(cases.length).toBeGreaterThan(80));
  for (const c of cases) {
    it(`[${c.section.slice(0, 18)}] ${c.text.slice(0, 60)}`, () => {
      const r = screenPost(c.text);
      expect(stateOk(c.expected, r.state), `state ${r.state}, flags ${r.flags.map((f) => f.id).join(",")}`).toBe(true);
      const got = r.flags.map((f) => f.id as string);
      for (const f of c.flags) expect(got, `missing ${f}`).toContain(f);
    });
  }
  it("section 12 (Lao bad words + look-alikes) passes 100%", () => {
    const s12 = cases.filter((c) => c.section.startsWith("12."));
    expect(s12.length).toBeGreaterThan(10);
    expect(s12.filter((c) => !stateOk(c.expected, screenPost(c.text).state))).toEqual([]);
  });
  it("zero false-greens: no scam, trafficking or privacy case is clean", () => {
    const bad = cases.filter((c) => c.expected !== "clean" && screenPost(c.text).state === "clean");
    expect(bad.map((c) => c.text)).toEqual([]);
  });
});
