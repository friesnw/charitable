# Charitable (brand name: GoodLocal)

Local-first charitable giving platform for Denver — discover trusted nonprofits and donate via Every.org.

I will frequently reference the /docs/tasks folder, with which we will manage our Todo tasks and want you to always update them as part of your workflow when we have new research and decisions.

## Tech Stack

- **Monorepo**: npm workspaces (`frontend/`, `backend/`)
- **Backend**: Node.js, Apollo Server (GraphQL), Express, PostgreSQL (`node-pg-migrate`), Zod for env validation, Resend (magic link emails)
- **Frontend**: React 18, React Router v7, Vite 7, Apollo Client, GraphQL Codegen, Tailwind v4, Mapbox (`react-map-gl`), Storybook 10 + Vitest 4
- **Payments**: Every.org embedded donation widget (modal); no custom payment processing
- **Auth**: Magic link email via Resend → JWT stored client-side in localStorage; no passwords; magic links expire in 15 min, JWTs in 15 days
- **Analytics**: Beacon (Deloitte) — first-party event tracking, stored in own PostgreSQL (not yet implemented; see backlog)
- **Deploy**: Render — backend as Web Service, frontend as Static Site (free), PostgreSQL as managed DB (free tier expires after 90 days)

## Architecture Decisions

- **GraphQL via Apollo** for all client-server communication
- **Express alongside Apollo** — needed for REST webhook endpoint (`/api/webhooks/every-org`) and analytics event endpoint (`/api/events`)
- **Every.org modal widget** for donations — no custom payment UI for MVP; Disbursements API is a future consideration
- **Magic link auth via Resend** — user enters email, receives link, JWT issued on verify; no passwords or bcrypt
- **JWT auth** stored in `localStorage`; `Authorization: Bearer <token>` header on all GraphQL requests
- **PostgreSQL GIN index** on `cause_tags` array column for fast tag filtering
- **Mapbox** (`react-map-gl`) for charity discovery map — split-panel view with list and pin highlighting; 50K free map loads/month
- **Beacon (Deloitte)** for analytics — lightweight, first-party, no external dashboard; events stored in `analytics_events` table in own DB
- **No linter or formatter** — TypeScript strict mode is the primary guardrail; maintain stylistic consistency manually

## Conventions

- TypeScript everywhere (strict mode)
- ESM (`"type": "module"`) in both workspaces
- Environment variables validated with Zod (`backend/src/env.ts`)
- GraphQL schema-first; codegen generates frontend types (`npm run codegen`)
- Migrations via `node-pg-migrate` (sequential numbered files)
- `npm run dev` at root starts both frontend and backend concurrently
- DB columns are snake_case; converted to camelCase in resolver mapper functions (`toCharity`, `toLocation`, etc.) — never return raw DB rows from resolvers
- Every UI component in `components/ui/` has a paired `.stories.tsx` file — add one when creating new UI components

## Working Conventions (File Change Rules)

**New GraphQL field or type:**
1. Update `backend/src/schema/typeDefs.ts`
2. Add/update resolver in the relevant `backend/src/resolvers/*.ts` file
3. Run `npm run codegen` (backend must be running first)

**New page:**
1. Create file in `frontend/src/pages/`
2. Add route to `frontend/src/routes.tsx`
3. Wrap in `ProtectedRoute` if authentication is required

**New UI component:**
1. Create file in `frontend/src/components/ui/`
2. Add a paired `ComponentName.stories.tsx` file alongside it

**New database column or table:**
1. Create a new migration file at `backend/migrations/0XX_description.sql` — never edit existing migrations
2. Seed data belongs in migration files (see `005`, `007`, `011`), not separate scripts
3. Migrations apply automatically on server startup — no manual step needed locally or on Render

## Database

- **Local**: Uses individual `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD` env vars
- **Production (Render)**: Uses `DATABASE_URL` connection string — auto-injected by Render, takes precedence over individual vars
- **Migrations**: Apply automatically on every server startup via `runMigrations()` in `db.ts`; safe to run repeatedly (no-op if nothing new)
- **Reference data**: 19 predefined cause tags live in `migration 010`; these are the only valid `cause_tags` values
- **Render free tier**: PostgreSQL expires after 90 days — upgrade before launch

## Render Deployment

- **Backend health check**: `/.well-known/apollo/server-health` — used by Render to verify the service is up
- **Frontend**: Static site with SPA rewrite rule (`/* → /index.html`) for React Router; `VITE_*` env vars are baked in at build time — a frontend redeploy is required if they change
- **Migrations on deploy**: The backend build command runs `migrate up` before starting — new migration files are applied automatically on every deploy
- **Mapbox token**: Restrict to production domain in Mapbox console after launch
