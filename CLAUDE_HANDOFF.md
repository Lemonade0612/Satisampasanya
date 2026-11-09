# Sati (Satisampasanya) — Claude Code Handoff

> Read this whole file before touching code. Hard deadline: **everything submitted before 16 Nov 2026** (ASEAN DSE regional final, Manila, 24–26 Nov). Judges include practitioners and anti-scam experts: accuracy, safety and sourcing matter more than feature count.

---

## 0. Ground rules for Claude Code

1. **Stay in TypeScript/React/Vite.** Do NOT port to Dart/Flutter or React Native. Mobile = wrap the existing web app with **Capacitor**.
2. **Audit first, then build.** Before writing code, report back:
   - folder structure of `src/`, routing, state management, styling system
   - whether any backend exists (Vercel `api/`, Netlify `netlify/functions/`, or none)
   - where the age picker ("Who is playing?") lives and how bands are passed around
   - current games list and where game content is stored
   - any secrets currently in client code (`VITE_*` vars, hard-coded keys) → flag immediately
3. Small, reviewable commits. One feature per commit. Run `npm run build` after each.
4. All user-facing strings go through the existing i18n layer (Lao + English). **Lao first** for Kids and Elders.
5. Never put real external links, real phone numbers to call, or real brand logos inside simulated scam posts (see §4.4).
6. Ask the owner (Lemon) before deleting any existing game or content file.

---

## 1. Current state (as told by owner)

- React + Vite + TypeScript, modularized `src/` architecture. Deployed on Vercel (`satii/sati`, alias `sati-coral.vercel.app`); Netlify used as fallback because Vercel is blocked on local wifi.
- Bilingual Lao/English UI. Social feed with post states, expert verification, 48-hour SLA fallback.
- "Sati Daily" has an age picker with 4 bands: **Kids 6–14, Youth 15–24, Adults 25–59, Elders 60+**. Today it only changes game pace.
- AI currently only *checks* posts (moderation); it does not *answer* questions. Wants a progress bar while AI checks a post.
- **Kids page is blank.**
- Too many games; several don't hold attention.
- Planned: age asked at login, sample posts per band with green/yellow/red status, impact + verification only in the admin app behind admin sign-in.

---

## 2. Goals for this sprint (priority order)

| P | Goal | Done when |
|---|------|-----------|
| P0 | Secure AI chat via server function (Youth+ only) | Chat answers in Lao/English, key never in bundle, off-topic refused |
| P0 | Moderation v2 (bullying, profanity, political, off-topic) | Test-post suite (§6.4) passes with expected status |
| P0 | Kids page: bait-post simulator + 3 games | Kid can tap bait → reveal → lesson, fully in Lao with voice |
| P1 | Age band filters content, games, and info intensity | Switching band changes feed, games, copy depth |
| P1 | Elders + Youth/Adults content packs (§4) | 5 games each, scenarios sourced |
| P1 | Capacitor iOS + Android builds run on simulators | App launches, chat works from simulator |
| P2 | Progress bar for AI post check | Visible states: queued → checking → result |
| P2 | Feasibility appendix data (§8) | Cost-per-user table filled with real current pricing |

---

## 3. Architecture

```
React/Vite app (TS)  ──build──►  dist/
   │                               │
   │                       Capacitor (ios/, android/)
   ▼
/api/chat      ─┐   serverless (Vercel or Netlify functions)
/api/moderate  ─┴─► Anthropic API  (key = server env var only)
```

### 3.1 Mobile (Capacitor)
```bash
npm i @capacitor/core @capacitor/cli @capacitor/ios @capacitor/android
npx cap init "Sati" "la.sati.app" --web-dir=dist
npm run build && npx cap add android && npx cap add ios
npx cap sync
npx cap open android   # Android Studio → run on emulator
npx cap open ios       # Xcode → run on iOS Simulator (macOS ONLY)
```
- iOS Simulator needs a Mac with Xcode. If no Mac is available, ship Android emulator demo + iOS as "build-ready". Tell the owner early.
- Inside Capacitor the app is served locally, so API calls must use an **absolute URL** (`import.meta.env.VITE_API_BASE`, e.g. `https://<deploy>/api`). Configure CORS on the functions to allow `capacitor://localhost` and `http://localhost`.
- Lao font: bundle a Lao web font (e.g. Noto Sans Lao / Phetsarath) locally so it renders on Android emulators without system Lao fonts.
- Voice: use Web Speech API where a Lao voice exists; otherwise pre-generated audio files in `public/audio/lo/`. Check Lao TTS availability on Android emulator before relying on it.

### 3.2 Secrets
- `ANTHROPIC_API_KEY` lives **only** in the host's environment variables (Vercel/Netlify dashboard) and local `.env` (git-ignored).
- **Never** prefix it with `VITE_` — Vite inlines every `VITE_*` var into the public JS bundle.
- Add `.env*` to `.gitignore`; scan git history for leaked keys (`git log -p | grep -i "sk-ant"`). If found: tell owner to rotate the key in the Anthropic Console.

### 3.3 Hosting note
Vercel is blocked on the owner's local wifi. Implement functions so they work on **both** (`api/chat.ts` for Vercel, `netlify/functions/chat.ts` for Netlify) sharing one core module `server/chatCore.ts`. Demo from whichever is reachable.

---

## 4. Content by age band

Band config lives in one file, e.g. `src/config/bands.ts`:

```ts
export type Band = 'kids' | 'youth' | 'adults' | 'elders';
export const BANDS: Record<Band, {
  ages: [number, number];
  langDefault: 'lo' | 'en';
  chat: boolean;
  canPost: boolean;
  needsAccount: boolean;
  infoIntensity: 1 | 2 | 3;   // 1 = icons/voice, 3 = full detail + sources
  gameCount: number;
  topics: string[];
}> = {
  kids:   { ages:[6,14],  langDefault:'lo', chat:false, canPost:false, needsAccount:false, infoIntensity:1, gameCount:3, topics:['game-currency','giveaway','hacked-friend','stranger-dm','fake-reel'] },
  youth:  { ages:[15,24], langDefault:'lo', chat:true,  canPost:true,  needsAccount:true,  infoIntensity:2, gameCount:5, topics:['fake-job','romance','task-scam','labour-broker','sextortion-awareness'] },
  adults: { ages:[25,59], langDefault:'lo', chat:true,  canPost:true,  needsAccount:true,  infoIntensity:3, gameCount:5, topics:['fake-job','investment','romance','labour-broker','impersonation'] },
  elders: { ages:[60,120],langDefault:'lo', chat:true,  canPost:true,  needsAccount:true,  infoIntensity:1, gameCount:5, topics:['official-call','prize-sms','fake-brand-page','investment-group','family-emergency','fake-charity'] },
};
```

### 4.1 Kids (6–14) — Lao-first, no account, no chat, no posting
**Privacy rule:** kids mode is anonymous. No sign-up, no name, no photo, no chat, no free-text input. Progress saved only in local storage (wrapped in try/catch). This is the answer to the judges' question about children's data.

**UX:** big icons, short Lao sentences, every screen has a 🔊 voice button, minimal reading needed for 6–9 year olds. Older kids (10–14) can toggle English.

**Bait-post simulator (core feature).** A fake feed of posts that look tempting. The kid can tap them. Tapping triggers a "Gotcha!" reveal, not a punishment.

Flow: `BaitPost` → kid taps CTA → `RevealScreen` (what would have happened) → `LessonCard` (1 rule, voiced) → back to feed with a star.

Bait post templates (generic names, no real logos):

| id | Bait | What would have happened | Rule |
|----|------|--------------------------|------|
| k1 | "Free 10,000 game coins! Enter your username + password" | Account stolen, items gone | Free coin generators are always fake. Never type your password outside the real game app. |
| k2 | Video says "Click link in bio for free skins" | Fake login page | Free-item links on video apps are traps. |
| k3 | Message from a *friend*: "Vote for me, log in here" | Friend's account was hacked | Even a friend's message can be a scammer. Ask them in person. |
| k4 | "Top-up 90% off, send money to this account" | Money gone, no top-up | Only buy through the official store with a parent. |
| k5 | Stranger: "You're cool, let's talk on another app, don't tell your parents" | Grooming warning | Secrets + moving apps = tell a trusted adult now. |
| k6 | "Watch this reel to win a phone! Share to 10 friends" | Spreads scam to friends | Prizes you didn't enter are fake. |

Real-world basis: free-currency generators and fake-login phishing aimed at children are widely documented (Cisco Talos Roblox scam overview; NordVPN research reported Sept 2026 finding ~200 phishing-kit addresses in 7 days; Roblox's own guidance that free-Robux generators are scams). Use the word "game coins" in UI; if naming a real game, text only, no logos.

**k5 note:** keep it age-appropriate and non-graphic. The lesson is only "secrets + moving apps → tell an adult". Do not depict anything beyond that.

**3 Kids games:**
1. **Tap or Trap** — swipe safe/trap on 8 bait posts (voiced).
2. **Password Guard** — drag the password away from fake login boxes; only the real app's box is allowed.
3. **Who Do I Tell?** — scenario card → pick trusted adult (parent, teacher) vs. "keep secret". Always reveals "tell someone".

### 4.2 Elders (60+) — Lao-first, voice, huge text, "slow mode"
Laos context: the Ministry of Public Security issued a nationwide scam warning on 30 Sept 2025; Lao Telecom and Lao Airlines have been impersonated by fake pages; Digital 2025 data puts mobile connections near 87% of the population, with older users flagged as particularly at risk (Laotian Times, 2025). Vientiane Times reporting also urges young people to help elderly relatives with digital literacy → **"Teach your grandparent" mode** (youth plays the elder scenario with them).

Elder scenarios (each becomes cards for the 5 games):

| id | Scam | Red flags | Safe action |
|----|------|-----------|-------------|
| e1 | Call from "police / bank / court": your account is involved in a crime, move money to a "safe account" | Fear + urgency + "safe account" + "don't tell family" | Hang up. Officials never ask for transfers by phone. Call back on a number you look up yourself. |
| e2 | SMS: you won a prize / bill refund, click link | Unknown link, prize you didn't enter | Don't click. Ask family. |
| e3 | Fake Facebook page copying a known company or news page with a giveaway | Page is new, few posts, asks for personal info | Check official page; never send ID photos. |
| e4 | Investment group on a chat app promising high daily returns | Guaranteed daily %, pressure to recruit | No real investment guarantees daily returns. (Real case: fake "ATFX" platform busted in the Golden Triangle promised up to 24% daily — Laotian Times, Oct 2025.) |
| e5 | Crying call: "Grandma, I'm in trouble, send money, don't tell Mum" (possible AI-cloned voice) | Secrecy + emergency + new number | Hang up, call the grandchild or parents directly. |
| e6 | Fake charity / fake monk collecting to a personal account | Personal account, pressure | Give only through known temples/organisations. |
| e7 | Someone asks for the OTP code "to stop a hacker" | Any OTP request | Never share OTP with anyone. |

One rule to repeat everywhere for elders (voiced): **"Hang up → Check → Tell family."** (ວາງສາຍ → ກວດສອບ → ບອກຄອບຄົວ — owner to verify Lao wording.)

**5 Elder games:** Answer or Hang Up (audio call sim) · Real or Fake Page · Link or No Link · Too Good to Be True (investment returns slider) · Call Family First (choose who to call).

### 4.3 Youth (15–24) and Adults (25–59)
Context: scam compounds in the Golden Triangle SEZ (Bokeo) recruit through fake job offers; UNODC (2023) described scam-centre trafficking as one of the largest coordinated trafficking operations in history; RFA reporting documented Lao teenagers lured by a Facebook message offering pay and trafficked into scam compounds; Indian, Filipino and other embassies have issued advisories about fake customer-service / data-entry jobs leading to GTSEZ; GASA's 2025 survey of 6,000 SEA adults found 63% had a scam experience in 12 months and ~1 in 5 lost money, with investment scams most common.

| id | Scam | Red flags | Safe action |
|----|------|-----------|-------------|
| y1 | Job ad: customer service / data entry abroad, high salary, no experience, free travel via Thailand | Pay far above market, vague company, travel by road to border, "employer keeps passport" | Verify with Ministry of Labour / registered agency; never hand over passport. |
| y2 | Friend-of-friend recruiter: "I work there, it's easy money" | Trust shortcut, rushed decision | Same checks apply to friends' offers. |
| y3 | Romance → crypto: new online partner introduces "investment platform" | Never video-calls, moves fast, asks to invest | Never send money to someone you haven't met. |
| y4 | Task scam: like/review videos for pay, then "pay to unlock" bigger tasks | Pay-to-earn | Real jobs never ask you to pay. |
| y5 | Unregistered labour broker for Thailand/Korea/Japan | Upfront fees, no contract in Lao | Use official channels; get contract in a language you read. |
| y6 (youth) | Sextortion awareness: someone threatens to share private photos unless you pay | Threat + payment demand | Don't pay, don't delete evidence, tell a trusted adult, report. Keep non-graphic. |
| a1 (adults) | Impersonation of officials / banks (as e1) | | |
| a2 (adults) | Investment / trading group with fake dashboards | | |

**5 games each (mixed pool, band-tagged):** Job Offer Detective · Swipe Right on Red Flags (romance) · Pay-to-Earn? · Broker Check · Story Mode (choose-your-path short story ending in safe/unsafe outcome).

Games share one engine: `ScenarioCard { id, band[], topic, lo, en, redFlags[], correct, source }`. Daily refresh = seeded shuffle by date.

### 4.4 Content safety rules for ALL simulated posts
- No real clickable URLs. Use `example.invalid`-style or non-link text.
- No real logos or exact brand pages. Generic names ("Game Coins", "LaoNet Bank" is NOT ok if close to a real bank — use clearly fictional names).
- No real phone numbers or account numbers.
- Label simulated content: small "🎓 Practice post" badge.
- Every scenario card has `source` (citation id from §9) or `source: 'pattern'` meaning "composite based on reported patterns" — never claim a made-up case is real.

---

## 5. AI chat (Youth, Adults, Elders only)

### 5.1 Server function (sketch)
```ts
// server/chatCore.ts
import Anthropic from '@anthropic-ai/sdk';
const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function chat(messages: {role:'user'|'assistant';content:string}[], band: string, lang: 'lo'|'en') {
  if (band === 'kids') throw new Error('chat_not_allowed');
  return client.messages.create({
    model: 'claude-haiku-5-5',          // fast + cheap; confirm current model string in docs
    max_tokens: 600,
    system: SYSTEM_PROMPT(band, lang),
    messages: messages.slice(-10),       // cap history
  });
}
```
- Server enforces band (don't trust the client). Rate-limit per IP/session (e.g. 20 msgs/hour).
- Don't log full chat text with personal data; log only category + length.

### 5.2 System prompt requirements
- Identity: "Sati Assistant", helps with scams, online safety, trafficking/unsafe migration, verifying offers.
- Reply in the user's language; Lao default.
- **In scope:** checking if a message/offer/job is a scam, what to do after being scammed, safe migration, reporting steps, explaining red flags.
- **Out of scope → polite refusal + redirect:** politics and government opinions, homework, coding, entertainment, medical/legal advice beyond "contact X".
- Never ask for passwords, OTPs, ID numbers, bank details. If user pastes them, tell them not to share and to change them.
- If someone describes being trapped / trafficked / in danger now → give emergency guidance and official contacts (owner to supply verified Lao hotline numbers; **do not let the model invent numbers**).
- No sexual content; sextortion handled only as safety guidance.
- Short answers (≤120 words), bullet red flags, end with one clear action.

### 5.3 Owner must verify
A list of **verified** Lao reporting contacts (police, anti-trafficking hotline, Ministry of Labour) in `src/config/contacts.ts`. The model receives these in the system prompt and may only cite numbers from that list.

---

## 6. Moderation v2

### 6.1 Two layers
1. **Fast filter (client + server):** `src/moderation/wordlist.ts` with Lao + English profanity/slur lists, normalised (strip tone marks/spacing tricks, leetspeak). Owner provides/approves the Lao list.
2. **AI classifier** (`/api/moderate`) returning strict JSON:
```json
{ "category": "scam_report|trafficking|safety_question|off_topic|profanity|bullying|hate|political|sexual|self_harm|spam",
  "status": "green|yellow|red",
  "confidence": 0.0,
  "reason_lo": "...", "reason_en": "...",
  "needs_expert": true }
```

### 6.2 Policy table
| Category | Action |
|----------|--------|
| scam_report / trafficking / safety_question | Allow → yellow until expert verifies (48h SLA), green after verification |
| off_topic | Reject: "Sati only accepts posts about scams and online safety" |
| profanity only | Reject, show which rule |
| profanity inside a genuine scam report | Allow with masked words, yellow |
| bullying / hate / harassment | Reject; repeated → temporary posting block |
| **political** (any side, praise or criticism, true or false) | Reject as out-of-scope. Sati takes **no political position**. Do not fact-check politics. |
| sexual | Reject |
| self_harm | Don't publish; show support message + contacts |
| low confidence (<0.7) on any | Send to expert queue, yellow |

Political rule rationale for judges: neutrality protects the platform's mission and users; enforcement is topic-based, not opinion-based.

### 6.3 Progress bar
States: `submitted → scanning words → AI checking → result`. Show animated bar, then the green/yellow/red chip with the bilingual reason.

### 6.4 Test-post suite (`tests/moderation.fixtures.ts`) — must pass
Real scam warning (Lao) → green/yellow · Fake job ad report → yellow · Off-topic food post → red · Profanity-only → red · Scam report with one swear word → yellow masked · Bullying a classmate → red · Political praise → red · Political criticism → red · Political sarcasm → red · Satire about scammers → allow yellow · Over-manipulated / ALL CAPS fearmongering → yellow + expert · Post containing a phone number + OTP → red (privacy) · Mixed Lao/English slang.

---

## 7. Admin app
Impact metrics and verification queue only behind admin sign-in. Public app shows no admin data. Add a "Moderation log" view (category, status, timestamp; no personal data).

---

## 8. Feasibility appendix (for the proposal)
Claude Code: produce `docs/feasibility.md` with:
- **Cost per user:** look up current Claude Haiku API pricing on docs.claude.com / anthropic.com pricing page; assume avg chat 6 msgs × ~400 tokens, moderation ~300 tokens/post; compute cost per 1,000 monthly active users. Show formula, not just the number.
- **Offline-first:** games and bait simulator work without internet (bundled content) → low-connectivity provinces.
- **Ops:** expert queue size estimate, 48h SLA staffing assumption.
- **Risks + mitigations:** model errors (expert review), harmful content (two-layer moderation), children's data (no accounts), key leakage (server-only), political sensitivity (topic-based neutrality).
- **Scale path:** Android first (dominant in Laos — verify with a source), school partnerships, Share to Change community sessions.

---

## 9. Sources (cite these; owner should open and verify each before the pitch)
| id | Source | Used for |
|----|--------|----------|
| S1 | Laotian Times, "Ministry of Public Security Issues Nationwide Warning on Online Scams" (Oct 2025) — laotiantimes.com/?p=130534 | Lao official warning, ~87% mobile, older users at risk |
| S2 | Laotian Times, fake Facebook news pages / Lao Telecom & Lao Airlines impersonation — laotiantimes.com/?p=112361 | e3 |
| S3 | Laotian Times, Oct 2025 (ATFX fake investment, up to 24% daily) — laotiantimes.com/?p=134383 | e4, a2 |
| S4 | Vientiane Times, repatriation of call-centre suspects; advice to help elderly relatives — vientianetimes.org.la | Teach-your-grandparent mode |
| S5 | The Star/Bernama-KPL, Jan 2025: 306 call-centre rings, 15,970 members incl. 6,120 Lao nationals since 2022 | Scale of problem in Laos |
| S6 | UNODC ROSEAP, *Casinos, cyber fraud and trafficking in persons* (2023) | Trafficking for forced criminality |
| S7 | GI-TOC, *Compound Crime: Cyber Scam Operations in Southeast Asia* (May 2025), GTSEZ section | GTSEZ context |
| S8 | RFA, Lao teens trafficked to scam compounds via Facebook job lure (2023) | y1, y2 |
| S9 | ThePrint/ANI Jan 2025; Indian Cybercrime Coordination Centre advisory June 2025 (fake customer-service/data-entry jobs → GTSEZ, passports seized) | y1 red flags |
| S10 | GASA, *State of Scams in Southeast Asia 2025* (6,000 adults; 63% scam experience; ~22% lost money; investment scams most common) | Regional stats |
| S11 | Cisco Talos, "Roblox scam overview"; Guardian/NordVPN Sept 2026 (~200 phishing addresses in 7 days) | Kids bait posts |
| S12 | ChongLuaDao (Vietnam anti-scam org, CEO spoke at GASA 2025) elder-scam guides (vishing, "safe account", fake charity) | e1, e6 patterns (regional, not Lao-specific — say so) |
| S13 | Thairath, DSI data on elderly fraud in Thailand (low count, high loss per victim) | Elder rationale |
| S14 | ASEAN Foundation "Scam Ready ASEAN" (launched 28 Apr 2026) | Alignment with ASEAN Foundation (judges' org) |

**Sensitivity note:** some international reports (e.g. US TIP Report) contain allegations about Lao officials. Sati's app and pitch should stay **victim-protection focused and politically neutral** — cite UNODC, Lao MOPS, GASA, and media case patterns; do not put government-criticism claims into app content.

---

## 10. Suggested day plan (9–16 Nov)
- **D1:** Audit report (§0.2), secrets check, band config, Capacitor skeleton runs on Android emulator.
- **D2:** `/api/chat` + `/api/moderate` on Netlify/Vercel, CORS for Capacitor, system prompt, rate limit.
- **D3:** Moderation v2 + fixtures + progress bar.
- **D4:** Kids page: bait simulator + Tap or Trap + voice/Lao font.
- **D5:** Kids games 2–3; Elder content pack + 2 games.
- **D6:** Elder games 3–5; Youth/Adult pack + game engine mixing.
- **D7:** iOS build (if Mac), feasibility doc, demo recording, bug fixes, freeze **15 Nov**, submit before 16th.

## 11. Open questions for the owner (answer before D2)
1. Do you have access to a Mac for the iOS Simulator?
2. Verified Lao hotline/report numbers for `contacts.ts`?
3. Lao profanity/slur list — who compiles and reviews it?
4. Which existing games to keep (list them; we keep max 3 kids / 5 per other band)?
5. Lao wording check for all voiced rules (native review).
6. Expert verifiers: who are they in reality (club members, NGO partner)? Judges will ask.
