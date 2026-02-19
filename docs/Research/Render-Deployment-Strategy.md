# Render Deployment Strategy

*Updated: 2026-02-19*

## Overview

This app deploys as **two separate Render services**:

| Service | Render Type | What It Is |
|---------|-------------|------------|
| **Backend** | Web Service (Node) | Apollo/Express server, connects to Postgres |
| **Frontend** | Static Site | Vite build output, just HTML/CSS/JS files |

They're independent — each has its own URL, its own build process, and deploys on its own. The frontend just needs to know the backend's URL so it can make GraphQL requests.

---

## One-Time Setup

### 1. Create the Backend Web Service

In the Render dashboard: **New → Web Service → connect your GitHub repo**

| Setting        | Value                                                       |
| -------------- | ----------------------------------------------------------- |
| Root Directory | *(leave blank)*                                             |
| Build Command  | `npm install; npm run migrate up; npm run build -w backend` |
| Start Command  | `npm run start -w backend`                                  |
| Instance Type  | Starter ($7/mo)                                             |

**Why root directory blank?** npm workspaces must resolve from the repo root. If you set it to `backend/`, the workspace dependencies won't install correctly.

**Why `migrate up` in the build command?** This ensures every deploy automatically applies any new migration files before the server starts. Safe to run repeatedly — it's a no-op if there's nothing new.

### 2. Create the Frontend Static Site

In the Render dashboard: **New → Static Site → connect your GitHub repo**

| Setting | Value |
|---------|-------|
| Root Directory | *(leave blank)* |
| Build Command | `npm install; npm run build -w frontend` |
| Publish Directory | `frontend/dist` |

**Add a rewrite rule** (in the Static Site settings under "Redirects/Rewrites"):

| Source | Destination | Action |
|--------|-------------|--------|
| `/*` | `/index.html` | Rewrite |

This is required for React Router. Without it, refreshing any page other than `/` returns a 404.

### 3. Create the PostgreSQL Database

In Render dashboard: **New → PostgreSQL**

Use the Basic tier ($7/mo). Once created, Render gives you a **connection string** — you'll need this for the backend's environment variables.

### 4. Set Environment Variables

**Backend service** (set in Render dashboard → your backend service → Environment):

| Variable | Value |
|----------|-------|
| `DATABASE_URL` | The connection string from your Render Postgres |
| `JWT_SECRET` | Your secret (same value as local `.env`) |
| `RESEND_API_KEY` | Your Resend key |
| `FRONTEND_URL` | `https://your-frontend.onrender.com` |
| `NODE_ENV` | `production` |

**Frontend static site** (set in Render dashboard → your frontend service → Environment):

| Variable | Value |
|----------|-------|
| `VITE_API_URL` | `https://your-backend.onrender.com` |
| `VITE_MAPBOX_TOKEN` | Your Mapbox token |

**Important:** `VITE_*` variables are baked into the frontend at build time, not at runtime. If you change one, you need to trigger a redeploy of the frontend for it to take effect.

---

## Your Day-to-Day Workflow

### Normal code changes

```
Write code locally → git push origin main → done
```

Render watches your `main` branch. When you push, it automatically:
1. Detects the new commit
2. Rebuilds the affected service(s) — both if you push changes to both
3. Runs the build command (which includes `migrate up` for the backend)
4. Swaps in the new version — on the Starter tier this involves a brief restart

You don't run any deploy commands manually. Push to `main` = deploy.

### Adding a new migration

1. Write `backend/migrations/012_your_migration.sql` locally
2. Test it locally: `DATABASE_URL=postgresql://nickfries@localhost:5432/app_db npm run migrate up`
3. `git push origin main`
4. Render rebuilds the backend → `migrate up` runs → new migration applies to the Render DB automatically

You never need to manually run migrations against Render. The build command handles it.

### Running migrations manually against Render (if ever needed)

```bash
DATABASE_URL=<render-postgres-connection-string> npm run migrate up
```

Get the connection string from: Render dashboard → your Postgres service → "Connect" tab → "External Connection String".

### Checking what's in the Render database

Connect any Postgres client (TablePlus, psql, etc.) using the **External Connection String** from the Render Postgres dashboard. Same as connecting locally, just a different URL.

---

## How the Two Services Talk to Each Other

The frontend is just static files — it has no server of its own. When a user loads the app in their browser, their browser makes GraphQL requests directly to the backend URL.

```
User's browser
  → loads frontend from Render Static Site (https://your-frontend.onrender.com)
  → makes GraphQL requests to backend (https://your-backend.onrender.com/graphql)
```

This is why `VITE_API_URL` exists — it tells the frontend where to point those requests. Locally that's `http://localhost:4000`. On Render it's the backend's `.onrender.com` URL.

---

## Deploying Only One Service

Each service tracks the same `main` branch but they're independent. If you push a change that only touches `frontend/`, Render is smart enough to only rebuild the frontend (if you've configured it — see "Auto-Deploy" settings per service). In practice, both often rebuild on every push, which is fine since builds are fast.

You can also trigger a manual redeploy from the Render dashboard for either service independently.

---

## Pricing

| Service | Tier | Cost |
|---------|------|------|
| Backend Web Service | Starter | $7/mo |
| PostgreSQL | Basic | $7/mo |
| Frontend Static Site | — | **Free** |
| **Total** | | **$14/mo** |

Static sites are always free on Render. You're only paying for the backend and the database.

---

## When Something Goes Wrong

**Build failed:** Check the build logs in the Render dashboard. The most common causes are a missing env var or a TypeScript error that only surfaces in a clean build.

**Migration failed on deploy:** The backend won't start if `migrate up` fails. Fix the migration, push again. Check build logs for the SQL error.

**Frontend shows stale data / wrong API URL:** The `VITE_API_URL` env var is baked in at build time. If it's wrong, update it in the Render dashboard and trigger a manual redeploy of the frontend.

**CORS error in browser:** The backend's `FRONTEND_URL` env var needs to match the exact origin of your frontend (including `https://`). Update it and redeploy the backend.
