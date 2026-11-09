# content/

Game cases live here as JSON, one file per game and age band: `content/<game>/<band>.json`, where `<band>` is `kids`, `youth`, `adult` or `elder` (see `shared/bands.mjs`).
To add a case, add it to the right file. No code changes are needed.

Before every web build, `npm run check:content` checks every file. A missing field, an unknown id or any Thai script stops the build, and the error names the file and the field.

## Rules for every file

- Every text has both languages: `{ "en": "...", "lo": "..." }`.
- Lao is in Lao script only, never Thai script. Follow `docs/lao-style.md`.
- JSON can't hold comments, so treat every Lao string in this folder as `REVIEW-LO` (a draft until a native speaker checks it). Each file says so in its `"//"` field.
- Use made-up names, brands and numbers only. Never use a real company, official or person. Phone numbers are always masked: `+856 20 55•• 1902`.
- Hotline numbers never go here. They come from `shared/contacts.mjs`.
- Kids content stays gentle: no threats, no frightening detail. It always ends with "tell a trusted adult".

## Read-aloud

Add `"speak": true` to a text object to get a Lao recording: `{ "en": "...", "lo": "...", "speak": true }`. Add `"voice": "man"` to use the male voice (the default is the female voice). Then run:

```
npm run audio          # records new or changed lines (edge-tts; no key needed)
npm run audio:check    # lists lines that have no recording yet
```

Recordings are named after their text, so editing a line gives it a new recording. To use a human recording, put the MP3 at `frontend/public/audio/lo/human/<name>.mp3`, using the name the generated file has. The human file then always plays instead.

## call/: Scam Call days

```json
{ "days": [ {
  "id": "saeng", "bands": ["kids"], "room": "kid",          // room: kid | student | parent | elder | worker
  "hero": { "name": {...}, "age": 11, "avatar": { "skin": 0, "hair": 1, "outfit": 0, "extra": 0 } },
  "who": {...}, "intro": {...},                              // intro must contain {n} (number of calls)
  "balance": 2000000,                                        // kip at the start of the day
  "calls": [ {
    "id": "sa-aunt", "real": true, "time": "09:00",          // one call per time is played; use ≥4 times
    "voice": { "who": "woman", "rate": -6, "pitch": 0 },     // scammers: faster (rate 8–16); real callers: calmer
    "place": {...}, "note": {...}, "caller": {...},
    "number": "+856 20 58•• 4417", "saved": true, "stake": 0,
    "lines": [ {...}, {...}, {...} ],                        // 2–4 lines
    "moves":   { "trust": {...}, "check": {...}, "hangup": {...} },
    "outcome": { "trust": {...}, "check": {...}, "hangup": {...} },
    "signs": ["known", "nothing"],                           // mask clock hush scare code pay gift private switch debt docs match nothing known
    "flags": [],                                             // a scam needs ≥1: urgency upfront_fee too_good unverified_identity personal_data off_platform suspicious_link
    "remember": {...}
  } ]
} ] }
```

Mix real and scam calls in every day. After adding calls, run `node scripts/gen-call-voices.mjs` to record their phone-line voice-over.
