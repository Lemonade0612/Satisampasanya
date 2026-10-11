# Sati Admin

Independent React dashboard at http://127.0.0.1:5174.
Run `npm run dev` here, or use **Sati: Admin only** with F5 from the root workspace.
Start the backend separately, or use **Sati: Admin + backend**.
Build with `npm run build`; output goes to `admin/dist/`.

UI widgets live in `src/components/`. Authentication and API calls use
`src/api.ts`; polling uses `src/useAdminDashboard.ts`. Browser sessions are
separate from the user app. Admin emails are configured in the root `.env.local`.
Dependencies are installed once at the repository root.
