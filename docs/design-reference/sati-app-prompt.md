 Application Generation Prompt — Sati

Use the text below as a single prompt for an AI app-generation tool (Figma Make, v0, Cursor, Bolt, etc.). Adjust the "Scope for this generation" section depending on whether you want the full app or just specific screens.

---

## PROMPT

Build a mobile-first social app called **Sati** — a youth-focused anti-scam and anti-trafficking awareness platform for Lao youth aged 15–24. It should feel like a modern social feed app (X/Twitter-style layout and interaction patterns), but purpose-built around verified information instead of open engagement.

### Core concept

People come here to learn about and report online scams, human trafficking patterns, and digital safety — through a mix of expert-written news, peer reports, and community discussion. The platform's core promise: information here isn't random or unverified — every post that gains real reach has been checked by AI screening and, for anything risky, by a human expert or admin. Corrections reach the people who saw the original claim, not just the general public.

### Target audience

Lao youth, 15–24. Design and copy should read as modern, energetic, and peer-to-peer — not clinical, not preachy, not like a government safety pamphlet. Bilingual support (Lao + English) should be considered in the content structure.

### Design system

- **Colors**: three-color base — white/off-white, a confident violet/purple as the primary brand color, and a growth-green reserved specifically for _verified/trusted_ content states (not decorative). Locked/pending states use muted purple-gray tints, not new hues.
- **Typography**: a bold geometric display font for headers (e.g. Space Grotesk) paired with a clean body font (e.g. Inter); Noto Sans Lao (or equivalent) for Lao-script content.
- **Signature mark**: a leaf-shaped "trust mark" icon that fills green only once a post is expert-confirmed — used instead of a generic checkmark badge, so the icon itself communicates the platform's core mechanic (trust is earned, not assumed).
- **Tone**: modern, rounded, friendly — should read as "peer community," not "compliance app."

### Key features to build

**1. Feed** Tabs for "For You," "Following," and topic/hashtag browsing (e.g. #OnlineScam, #Trafficking, #DigitalSafety). Feed ranking favors on-topic, engaged, and expert-confirmed content. Posts can include text, photos, or video.

**2. Post states (this is the core mechanic — implement all four)**

- _Clean/mild_: publishes immediately, full interaction (like, comment, share, repost) enabled.
- _Severe flag_: publishes with a visible disclaimer, interactions locked (read-only), author is notified with the specific reason. A banner explains in plain language why it's locked and that review typically completes within 48 hours.
- _Expert/admin confirmed accurate_: disclaimer removed, interactions unlock, author earns points.
- _Confirmed false_: post stays locked; a correction is generated and routed specifically to users who already saw/interacted with the original post, rather than being pushed to the whole platform algorithmically.
- _SLA fallback_: if no expert reviews within 48 hours, the post auto-unlocks with a neutral "not reviewed in time" tag — full interaction restored, but no confirmed-accurate points (this prevents gaming slow review times for rewards).

**3. Compose / write flow** Toggle between a short post (150 characters) and a "news" post (500–2000 characters, requires 2 source links before it can be submitted). Users select relevant topic tags from a pill selector. Daily limits: 2 combined original posts/news + 5 comments per user per day (likes/shares/reposts are unlimited). Show a live character counter. Include a visible note explaining the two-tier points system (see below) before posting.

**4. Points and rewards (two-tier)**

- Base points awarded only when a post is confirmed accurate by expert/admin review — not from likes or activity alone.
- Bonus/"featured" points awarded on top when a confirmed-accurate post also achieves high engagement and demonstrably spreads awareness — shown as a visually distinct badge from the base "verified" badge.
- A "this warned me" self-report action separate from likes, used as the platform's real impact metric.

**5. Content relevance (topic scope, not just misinformation)** AI screening should also check topic relevance — is this post actually about scams, trafficking, or digital safety? Off-topic posts are **not blocked or rejected**. Instead they're soft-deprioritized: excluded from points eligibility and from the on-mission topic feeds, but still visible in a separate casual/community space. This avoids punishing users for posting off-topic while keeping the core feed focused. Do not implement hard content rejection based on topic relevance.

**6. Profile** Avatar, bio, stats (points, posts, topics followed), topic-follow chips, tabbed view of the user's posts/topics/points history.

**7. Reporting an already-published post** Any user can report a live post for review after the fact, which routes it back into the expert/admin review queue — this is separate from the initial AI screening at post time.

### Scope for this generation

[Specify here: e.g. "Generate the Feed, Compose, and Post Detail (locked state) screens first" or "Generate the full app: Feed, Compose, Post Detail (both locked and confirmed states), Profile, and a lightweight Community/casual tab."]
