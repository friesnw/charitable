# Render Deployment Strategy

*Research date: 2026-02-19*

## TL;DR

**Yes, it's worthwhile — and manageable.** The `render.yaml` config already exists, a dev environment costs ~$14/mo, and the free tier is not suitable for ongoing use. The main extra step vs. a greenfield deploy: your local DB has diverged from the migration files, so you'll need to export your current data and load it into Render. Recommended path: deploy a dev environment on paid Render tiers, which becomes your shared dev DB for collaborators and a rehearsal for production.

---

## Your Data Situation

Your local DB has **diverged from the migration files** — you've made changes directly in Postgres (adding/removing charities, adding location data, etc.) that were never written back into a migration. The migration files produce a different dataset than what you currently have locally.

This means you have two options for getting your data into Render:

### Option A: pg_dump (Faster, one-time)

Export your local data and restore it directly to the Render DB. This is the fastest path and captures your exact current state.

```bash
# Dump only the reference tables (not users/runtime data)
pg_dump \
  --data-only \
  --table=charities \
  --table=charity_locations \
  --table=causes \
  -d app_db > local_seed.sql

# After Render DB is up and migrations have run, restore:
psql <render-db-url> < local_seed.sql
```

**Tradeoff:** Your migrations become out of sync with reality. If you ever spin up a fresh DB (a second developer, production), they won't get the current charity data from migrations alone.

### Option B: Write a new migration to capture current state (Cleaner, recommended)

Write a migration file (e.g., `011_reseed_charities.sql`) that deletes the old seeded data and inserts your current local data. Then all future environments get the right data automatically just by running migrations.

This is more work upfront but the right long-term approach — especially since you said you want to promote this data to production eventually.

**Recommended:** Use pg_dump to get unblocked now, then at a natural stopping point write a proper reseed migration so the data is in version control.

**What won't transfer and shouldn't:** users, user_preferences, magic_link_tokens, donation_intents. These are runtime data — each environment should start with an empty user table.

---

## Render Pricing: What Actually Matters

### Free Tier — Don't Rely On It

| Resource | Free Tier Behavior |
|----------|-------------------|
| Web Service | Spins down after 15 min inactivity. First request has ~30s cold start. |
| PostgreSQL | **Expires after 30 days — data is deleted.** |

The free PostgreSQL expiration alone makes it unsuitable for anything beyond a quick test. Your designer would hit a dead site or corrupt DB within a month.

### Recommended: Paid Tiers (~$14/mo for dev)

| Service | Tier | Cost | Specs |
|---------|------|------|-------|
| Backend web service | Starter | $7/mo | 512MB RAM, 0.5 CPU, always-on |
| PostgreSQL | Basic (lowest) | $7/mo | 256MB RAM, 100 connections, persistent |
| **Total** | | **$14/mo** | |

At this scale (handful of charities, a few collaborators) these specs are more than sufficient for development.

### Production (Later)

Same tiers likely work for MVP launch. Upgrade if you see performance issues. $14/mo stays reasonable unless you're handling significant traffic.

---

## What Deployment Actually Looks Like

### One-Time Setup (~45 min)

1. **Push current code to GitHub** (already using git, so this is just `git push`)
2. **Connect repo to Render** — log into render.com → "New" → "Blueprint" → select your repo
3. **Render reads `render.yaml`** — automatically creates the backend service and DB
4. **Set missing env vars** in Render dashboard (these aren't in `render.yaml` for security):
   - `JWT_SECRET`
   - `RESEND_API_KEY`
   - `VITE_MAPBOX_TOKEN` (frontend)
5. **Run migrations** against the Render DB once:
   ```bash
   DATABASE_URL=<render-db-url> npm run migrate up
   ```
   This creates the schema but **not your current local data** (see Data Situation above).
6. **Load your local data** via pg_dump restore (Option A) or a new migration (Option B).
7. Done. You have a live dev URL.

### Ongoing Workflow (After Setup)

```
You write code locally → git push → Render auto-deploys
```

New migrations run as part of deploy (you'd add a `prestart` script or run them manually). This is a one-line addition to `render.yaml`.

---

## Collaboration Benefits

Once deployed, your designer's setup becomes:

1. Clone repo
2. Create `frontend/.env`:
   ```
   VITE_API_URL=https://your-render-backend.onrender.com
   VITE_MAPBOX_TOKEN=...
   ```
3. `cd frontend && npm run dev`

She sees all your charities and causes. She can sign up and you'd see her user in the Render DB (accessible via Render dashboard or any Postgres client pointed at the Render connection string). No local backend, no local Postgres needed.

---

## Dev → Production Promotion Path

When you're ready for production, you'd create a second environment on Render (or use the same config with a `prod` branch):

```
dev DB  →  run same migrations  →  prod DB
```

User data stays separate by environment (correct). For reference data (charities, causes, locations), you have two paths:

- **If you pg_dump'd into Render dev:** you'd repeat a similar restore for production, or better — write a proper reseed migration before launch so production setup is just `migrate up`.
- **If you wrote a reseed migration:** production is automatic. Just run migrations and you're done.

**Rule of thumb going forward:** If data should exist in production (charities, causes, locations), it belongs in a migration. If it's runtime data (users, donations), it starts fresh per environment. The divergence you have now is worth fixing before launch.

---

## When NOT to Bother

- **Solo development only, no collaborators** — your local setup is fine, ngrok is free for occasional sharing
- **Actively building features that break the schema** — avoid deploying until the schema stabilizes a bit (you're close)
- **Not ready to spend $14/mo** — totally valid early on, revisit when collaborators need access regularly

---

## Recommendation

**Deploy a dev environment now.** You have:
- A `render.yaml` that's already written
- A clear path to get your local data into Render (pg_dump short-term, reseed migration long-term)
- A designer who needs to collaborate
- A future production environment that needs a rehearsal path

The $14/mo is worth it for the shared environment, the practice deploying, and eliminating "works on my machine" issues. The setup is a one-afternoon task, not a project.

**First step:** Check render.com to see if the services already exist from a previous attempt. If not, it's a fresh deploy.
