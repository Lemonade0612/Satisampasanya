# Sati marketing website

React + Vite + TypeScript + React Router, styled with CSS modules. It lives in
`website/` and is completely separate from the mobile app in the repo root.

Routes: `/`, `/about`, `/impact`, `/help`, `/feedback`, `/policies`

## Run locally

```bash
cd website
npm install
npm run dev        # http://localhost:5173
```

## Build

```bash
cd website
npm run build      # type-checks, then writes website/dist
npm run preview    # serve the production build locally
```

## Deploy to Netlify (free tier)

1. Netlify → **Add new site → Import an existing project** → pick the
   `Lemonade0612/Satisampasanya` repo and the `website` branch (or merge first).
2. Build settings (also set in `website/netlify.toml`, so they should pre-fill):
   - **Base directory:** `website`
   - **Build command:** `npm run build`
   - **Publish directory:** `website/dist`
3. Deploy. `netlify.toml` already contains the SPA redirect `/* → /index.html 200`.
4. **Forms:** the feedback and booking forms use Netlify Forms. They are declared in
   `public/__forms.html` so Netlify detects them on deploy. After the first deploy,
   open **Site → Forms** to see submissions and add email notifications.
   Forms only work on Netlify — under plain `npm run dev` the submit shows the
   error message (use `npx netlify dev` to test them locally).

## Where to fill in content

| What | File |
| --- | --- |
| All UI text (English / Lao) | `src/i18n/en.ts`, `src/i18n/lo.ts` (`TODO` = needs Lao) |
| `[N]`, `[STAT]`, `[DATE]` placeholders | `src/data/stats.ts` |
| Emergency numbers, Facebook links | `src/data/contacts.ts` |
| Reports & guides on the Help page | `src/data/reports.ts` |
| Booking availability (example data) | `src/data/booking.ts` |
| App Store / Google Play links, contact email | `src/data/links.ts` |

## Fonts

Lao text uses **Boon Home**, self-hosted from `public/fonts/` (`@font-face` in
`src/styles/theme.css`, `font-display: swap`). Noto Sans Lao is only the fallback
while it loads. Latin text uses Inter.

## TODOs before launch

- Replace the example booking widget with a real Calendly embed.
- Fill the `[placeholders]` listed above; add real store links and Facebook pages.
- Finish the Lao translations marked `TODO` in `src/i18n/lo.ts`.
- Add governing law / full terms to the Terms of Use text.
