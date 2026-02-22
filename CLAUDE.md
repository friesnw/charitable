# Charitable

Local-first charitable giving platform for Denver — discover trusted nonprofits and donate via Every.org.

I will frequently reference the /docs/tasks folder, with which we will manage our Todo tasks and want you to always update them as part of your workflow when we have new research and decisions. 

## Tech Stack

- **Monorepo**: npm workspaces (`frontend/`, `backend/`)
- **Backend**: Node.js, Apollo Server (GraphQL), Express, PostgreSQL (`node-pg-migrate`), Zod for env validation
- **Frontend**: React 18, Vite, Apollo Client, GraphQL Codegen
- **Payments**: Every.org embedded donation widget (modal); no custom payment processing
- **Auth**: JWT (bcrypt for passwords)
- **Deploy**: Render

## Architecture Decisions

- **GraphQL via Apollo** for all client-server communication
- **Express alongside Apollo** — needed for REST webhook endpoint (`/api/webhooks/every-org`) and future routes
- **Every.org modal widget** for donations — no custom payment UI for MVP; Disbursements API is a future consideration
- **JWT auth** stored client-side; `Authorization` header on all GraphQL requests
- **PostgreSQL GIN index** on `cause_tags` array column for fast tag filtering

## Conventions

- TypeScript everywhere (strict mode)
- ESM (`"type": "module"`) in both workspaces
- Environment variables validated with Zod (`backend/src/env.ts`)
- GraphQL schema-first; codegen generates frontend types (`npm run codegen`)
- Migrations via `node-pg-migrate` (sequential numbered files)
- `npm run dev` at root starts both frontend and backend concurrently
