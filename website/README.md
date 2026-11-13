# Sati marketing website

React + Vite + TypeScript + React Router, plain CSS modules. Separate from the mobile app: **never import from `frontend/`** — copy data into `src/data/` with a source comment instead.

Pages: `/` Home, `/about`, `/impact`, `/help`, `/feedback` (feedback form + booking), `/policies`.

## Run and build

```bash
cd website
npm install
npm run dev        # http://localhost:5173
npm run build      # type-check + production build into website/dist
npm run preview    # serve the build locally
```

## Deploy on Netlify (free tier)

`netlify.toml` is already set up:

- Base directory: `website`
- Build command: `npm run build`
- Publish directory: `website/dist`
- SPA redirect: `/* → /index.html (200)`

Steps: Netlify → *Add new site → Import from Git* → pick the repo and the `website` branch. No environment variables needed.

**Forms.** The feedback form (with up to 5 file attachments) and the booking form post to Netlify Forms. `public/__forms.html` holds static copies of both forms so Netlify detects them at deploy time. After the first deploy, check *Forms* in the Netlify dashboard and add email notifications. Forms do not work in `npm run dev` (sending shows an error there); test on a deploy preview.

**Booking.** `src/components/BookingWidget.tsx` is a placeholder calendar with example availability (`src/data/booking.ts`). TODO: replace it with a Calendly embed.

## Where to edit things

| What | File |
| --- | --- |
| All English text | `src/i18n/en.ts` |
| All Lao text | `src/i18n/lo.ts` (typed as `Dict`: a missing key fails the build). Lines marked `TODO-LO-REVIEW` are AI drafts that need a native speaker. |
| Placeholders to fill (`[N]`, roadmap `[Milestone]`, `[Year]`, Facebook `[link]`, photos, policy date) | `src/data/placeholders.ts` |
| Contact email, store links, Facebook page, police / scam numbers in the footer | `src/data/links.ts` |
| Hotlines | `src/data/hotlines.ts` (copied from `frontend/src/lib/hotlines.ts`) |
| Official documents + trafficking stats | `src/data/officialDocs.ts` (copied from `frontend/src/lib/officialDocs.ts`) |
| Booking availability | `src/data/booking.ts` |
| Colours, fonts, shared motion | `src/styles/theme.css` |

When the app's hotline or document lists change, copy the files again by hand.

## Language and fonts

The header has an EN | ລາວ switch. Exactly one language shows at a time; the choice is saved in `localStorage` and sets `<html lang>`. All text, Lao and English, uses the self-hosted **Boon Home** font (`public/fonts/`). The phone mockups and the Lao official document titles stay in Lao in both languages on purpose.

## Motion and accessibility

Entrance animations only use `transform`, so content is never hidden. Everything respects `prefers-reduced-motion`. Touch targets are at least 44px and the layout is built mobile-first (360–430px phone, 768px tablet, 1280px+ desktop).
