# GoodLocal Operations

Day-to-day runbook for running and maintaining the app in production.

---

## Environments

| Environment | Frontend | Backend | Database |
|-------------|----------|---------|----------|
| **Local** | http://localhost:5173 | http://localhost:4000 | local PostgreSQL (`app_db`) |
| **Dev (Render)** | https://goodlocal-frontend.onrender.com | Render backend service | Render PostgreSQL (dev) |
| **Prod** | https://goodlocal.org | https://api.goodlocal.org | Render PostgreSQL (prod) |

Credentials and connection strings are in the Render dashboard for each service (PostgreSQL → Connect → External URL).

---

## Deploying Code Changes

Push to `main` — that's it. Render watches `main` and automatically rebuilds both services on every push.

The backend build command runs `migrate up` before starting, so new migration files apply automatically on every deploy.

**If you need to redeploy without a code change** (e.g. after updating an env var): go to the service in Render dashboard → Manual Deploy.

**Frontend env vars** (`VITE_*`) are baked in at build time. Changing them in Render requires a frontend redeploy to take effect.

---

## Content Management

**Rule:** make content changes (charities, locations, tags) directly in **prod admin**. Dev is for building and testing features, not managing content.

- New charity → prod admin → create charity
- Edit description / tags / URLs → prod admin → update charity
- Add location → prod admin → add location

### Adding Street View photos to new locations

After adding locations in prod admin, run the populate script pointed at prod:

```bash
cd backend && DATABASE_URL=<prod-external-url> npx tsx scripts/populate-street-view.ts
```

Requires these env vars set locally (add to `backend/.env`):
```
GOOGLE_MAPS_API_KEY=...
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
```

The script skips locations that already have a `photo_url`. Safe to re-run.

### Sync script (seeding / disaster recovery only)

`backend/scripts/sync-content.ts` syncs causes, charities, and locations from a source DB to a target DB. **Not for routine use** — only for:
- Bootstrapping a fresh prod DB from dev data
- Restoring prod content after data loss

```bash
SOURCE_DATABASE_URL=<dev-external-url> TARGET_DATABASE_URL=<prod-external-url> npx tsx backend/scripts/sync-content.ts
```

---

## Database Migrations

Migrations live in `backend/migrations/` and apply automatically on every backend deploy. To add one:

1. Create `backend/migrations/0XX_description.sql`
2. Test locally: `npm run migrate up` (from `backend/`)
3. Push to `main` — Render applies it on deploy

Never edit existing migration files. Never run destructive SQL (`DELETE`, `DROP`, `TRUNCATE`) without first running a `SELECT` to verify what's affected.

---

## Database Backups

Render's free PostgreSQL tier has **no automated backups** and **expires after 90 days**.

Backups run automatically before every push to `main` via a git pre-push hook. Dumps are stored in `backups/` (gitignored — keep off-machine in iCloud/Drive). The 10 most recent dumps are retained automatically.

**Setup (run once per machine):** `bash scripts/install-hooks.sh`

**Manual backup:**
```bash
npm run backup:prod --prefix backend
```

**Restore to local for verification:**
```bash
createdb goodlocal_restore_test
pg_restore --no-acl --no-owner --dbname="goodlocal_restore_test" backups/<file>.dump
psql goodlocal_restore_test -c "SELECT COUNT(*) FROM charities;"
dropdb goodlocal_restore_test
```

**Before the 90-day free tier expires:** upgrade to Render paid PostgreSQL ($7/mo) or migrate to Neon/Supabase. Set a calendar reminder when you create a new DB instance.

---

## Before Any Risky Operation

Run a manual backup before any of the following:
- Syncing data between environments (`sync-content.ts`)
- Running a script that writes directly to prod
- Applying a migration to prod manually
- Any direct `psql` session on prod

```bash
npm run backup:prod --prefix backend
```

Verify the dump file exists and is non-zero (`ls -lh backups/`) before continuing.

---

## Running Scripts Against Prod or Dev

Any script that uses `getDatabaseConfig()` from `backend/src/env.ts` can be pointed at a remote DB by passing `DATABASE_URL`:

```bash
DATABASE_URL=<render-external-url> npx tsx backend/scripts/your-script.ts
```

For scripts that take two DBs (like `sync-content.ts`):

```bash
SOURCE_DATABASE_URL=<dev-url> TARGET_DATABASE_URL=<prod-url> npx tsx backend/scripts/sync-content.ts
```

External URLs are in the Render dashboard → PostgreSQL service → Connect tab.

---

## Credentials & Env Vars

| Var | Where to find it |
|-----|-----------------|
| `DATABASE_URL` | Render dashboard → PostgreSQL → Connect → External URL |
| `JWT_SECRET` | Render dashboard → backend service → Environment |
| `RESEND_API_KEY` | [resend.com](https://resend.com) → API Keys |
| `GOOGLE_MAPS_API_KEY` | Google Cloud Console → APIs & Services |
| `CLOUDINARY_*` | Cloudinary dashboard → Settings → API Keys |
| `VITE_MAPBOX_TOKEN` | [mapbox.com](https://mapbox.com) → Tokens |

---

## Troubleshooting

**Build failed on Render:** Check build logs in the dashboard. Common causes: TypeScript error, missing env var, failed migration.

**Backend health check timing out:** Server starts but doesn't respond — check runtime logs for crashes. Usually a missing required env var or DB connection failure.

**Frontend shows wrong data / can't reach backend:** Check `VITE_API_URL` in the frontend service env vars — it must match the backend URL exactly. Requires a frontend redeploy if changed.

**CORS error in browser:** `FRONTEND_URL` on the backend must match the exact origin of the frontend (e.g. `https://goodlocal.org`). Update and redeploy backend.

**Magic links not sending:** Check `RESEND_API_KEY` is set on the backend. Verify `contact.goodlocal.org` is a verified sending domain in Resend.


# Content Management

## Logos
- Logos should be 5x4 ratio, with a white background