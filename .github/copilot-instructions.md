# Team Skills Matrix — Project Instructions

## Project description

Team Skills Matrix helps engineering teams track competencies and plan skill development. Users maintain skills and assessments, identify team gaps through analytics, and receive training recommendations.

## Architecture

- This npm workspaces monorepo contains `shared/`, `backend/`, and `frontend/` workspaces; Playwright end-to-end tests live separately in `e2e/`.
- `@tsm/shared` is the single source of truth for domain types and enums. Add new shared types there before referencing them from `backend/` or `frontend/`.
- Backend (Express + Lowdb) exposes `/api/*`. Frontend (Vite + React) consumes it via TanStack Query. Vite proxies `/api` in dev.
- Data is stored in JSON via Lowdb at `backend/data/db.json` (dev) and `backend/data/db.e2e.json` (Playwright). Do not hand-edit either file: `db.json` is local generated state, while `db.e2e.json` is the Playwright-managed E2E fixture.

## Conventions

- **Language**: TypeScript everywhere. ESM modules — local imports use the `.js` extension (e.g. `import { api } from '../api/client.js';`) even when the source is `.ts`.
- **Strict typing**: no `any`. Prefer `unknown` + narrowing, or extend types in `shared/src/types.ts`.
- **Validation at boundaries**: validate untrusted input (HTTP bodies, query strings) with `zod`. Do not re-validate already-typed internal calls.
- **IDs**: use `nanoid(8)` with a short prefix (`skl_`, `eng_`, `tea_`, etc.), matching existing route code.
- **Errors at HTTP boundary**: return `{ error: ... }` with the appropriate status (`400` for validation, `404` for missing, `204` for delete). Do not throw to the client.
- **No comments unless the *why* is non-obvious.** Don't restate what the code does.

## Workflow
- Keep responses concise and focused on outcomes, decisions, and relevant caveats.
- During implementation, run the affected workspace's tests or build after each meaningful change.
- Review the final diff for unintended changes before declaring the work complete.
