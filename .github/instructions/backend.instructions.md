---
description: "Use when editing or adding Express routes, Lowdb data access, zod schemas, analytics, or backend Vitest tests under backend/."
applyTo: "backend/**/*.ts"
---

# Backend Instructions (`@tsm/backend`)

## Tech Stack

The backend is a Node.js 20+ ESM service built with Express 4, Lowdb, and Zod.

## Routes

- Register routes in `src/server.ts`; each resource lives in `src/routes/<name>.ts` and exports a factory `xxxRouter(db: DB): Router`.
- Validate every request body and query with `zod`. On failure return `res.status(400).json({ error: parsed.error.flatten() })`.
- Status codes: `201` on create, `200` on read/update, `204` on delete, `404` for missing entities, `400` for validation errors.
- New entities: generate IDs as `` `<prefix>_${nanoid(8)}` `` and `await db.write()` after every mutation.
- When deleting an entity, also clean up dependent rows (see `skills.ts` removing assessments).

## Data layer

- `db.ts` owns the Lowdb instance and the `DB` type. Don't read or write JSON files directly from routes.
- Update `seed.json` when a persisted shape needs seeded values.
- The dev DB is re-seeded from `src/seed.json` when missing.

## Tests

- Specs go in `backend/test/*.test.ts`. Use `supertest` against the Express app (see existing patterns) rather than starting a real server.
- After changing analytics or routes, run `npm run test -w backend`. Use `npm run test:coverage -w backend` to check coverage; analyze with `node scripts/analyze-coverage.mjs`.
