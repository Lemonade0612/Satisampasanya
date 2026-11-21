# Release report: release/sati-v3

## Decisions
- Worktree `../sati-release` branched from the committed HEAD of `feat/local-screening` (6d0e0f7). The 115 uncommitted/untracked files in the main checkout were not copied, staged or committed. `origin/develop` was already an ancestor, so the merge was a no-op with no conflicts.
- Baseline gate: the committed branch does not typecheck or build (11 TS errors, build fails) because `frontend/src/lib/flagReasons.ts`, `useTranslated.tsx`, `localScreening.ts`, `shared/screening/` etc. exist only as untracked files in the main checkout. Each commit is gated on: all backend tests pass, typecheck error count not above the 11 baseline.
- A1: Anthropic key env is `ANTHROPIC_API_KEY`, model `ANTHROPIC_MODEL` (default `claude-haiku-5-5`). The `ANTHROPIC_WORKSPACE_ID` header from an earlier note was not added (its header name is unknown).

## Blocked / needs Lemon
- Part C: `docs/elder-v3-spec.md` does not exist on any branch or in the main checkout. Part C was not started.
- B1: no 17-point harm list found in the repo. Fallback categories come from the `FlagId` type in the untracked `shared/screening/types.ts`.
- Frontend gate: commit or fix the untracked screening files so the branch builds.
