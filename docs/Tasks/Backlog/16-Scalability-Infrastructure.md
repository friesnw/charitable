# Scalability & Infrastructure (Post-Launch Growth)

> **Context:** These items don't block a soft launch but will become urgent as real users arrive. The goal is to address them within the first 1–3 months of having paying customers. Most require architectural additions rather than code tweaks.

---

## CRITICAL — Address within 30 days of launch

### 1. JWT Cannot Be Revoked — Implement Token Revocation
**File:** `backend/src/index.ts` (context function), `backend/src/resolvers/auth.ts`

JWTs are stateless and expire after 15 days. There is no way to log out a user, invalidate a stolen token, or force re-auth after a security incident. In a multi-instance deployment, one server can't tell another to reject a token.

**Options (pick one):**
- [ ] **Short-lived JWTs + refresh tokens** — Reduce JWT TTL to 1 hour; issue a long-lived refresh token stored in an httpOnly cookie; background-refresh silently. Requires a `refresh_tokens` DB table.
- [ ] **Token blocklist in Redis** — On logout or revocation, add the JWT `jti` claim to a Redis set with TTL = token expiry. On each request, check the blocklist. Fast, scalable, low complexity.
- [ ] **Database session table** — Fully abandon stateless JWTs; store session IDs in a `sessions` table and look up on each request. Simplest to revoke, highest DB load.

Recommendation: start with the refresh token approach — it's the most standard and pairs well with moving JWTs to httpOnly cookies (see Security task #4).

---

### 2. Expire and Clean Up Magic Link Tokens
**File:** `backend/migrations/006_create_magic_link_tokens.sql`

Expired tokens accumulate in the `magic_link_tokens` table indefinitely. As usage grows, this table grows unboundedly and queries slow down.

- [ ] Create a scheduled cleanup function: `DELETE FROM magic_link_tokens WHERE expires_at < NOW()`
- [ ] **Option A (simple):** Run this cleanup query at the top of the `requestMagicLink` resolver on every call (opportunistic cleanup)
- [ ] **Option B (robust):** Set up a Render Cron Job (or `node-cron` in the server process) to run nightly
- [ ] Add a composite index on `(expires_at)` if not already present (see Performance task)

---

## HIGH — Address within 60 days of launch

### 3. Add a Caching Layer (Redis)
**Files:** Entire backend

Every query hits PostgreSQL directly — causes list, charities list, individual charity lookups. At a few hundred concurrent users, Postgres will become the bottleneck.

**What to cache:**
- [ ] Causes list (19 items, updated only by admin) — cache indefinitely, invalidate on admin update
- [ ] Charity list by filter combination — cache for 5 minutes with filter params as cache key
- [ ] Individual charity by slug — cache for 10 minutes, invalidate on admin edit
- [ ] Magic link rate-limit counters (simpler than DB queries for throttling)

**Implementation:**
- [ ] Add Redis to Render (Upstash Redis free tier or Render Redis add-on)
- [ ] `npm install ioredis` in `backend/`
- [ ] Create `backend/src/cache.ts` with typed get/set/invalidate helpers
- [ ] Wrap resolvers with cache-aside pattern: check cache → on miss, query DB and set cache

---

### 4. Add Structured Logging and Request Tracing
**Files:** `backend/src/index.ts`, all resolvers

There is no structured logging or request correlation. When something goes wrong in production, it's difficult to trace a request through the system.

- [ ] `npm install pino pino-http` in `backend/`
- [ ] Add `pino-http` middleware to Express (before Apollo) — logs method, path, status, duration
- [ ] Generate a correlation ID per request (UUID); attach to `context` and pass to all resolver logs
- [ ] Replace all `console.log` / `console.error` calls with the `pino` logger instance
- [ ] Configure `pino` for JSON output in production, pretty-print in dev
- [ ] Set up Render log drains to a log aggregator (Papertrail free tier, Logtail, or Datadog)

---

### 5. Database Connection Limit Management (Multi-Instance)
**File:** `backend/src/db.ts`

When Render auto-scales the backend to multiple instances, each instance opens its own connection pool. With 3 instances × 20 max connections = 60 connections, you risk hitting Postgres connection limits on the free/starter tier.

- [ ] Research Render managed Postgres connection limits for the tier you're on
- [ ] **Short-term:** Cap pool `max` to a conservative value (e.g., 5–10) per instance
- [ ] **Medium-term:** Deploy PgBouncer as a pooling proxy in transaction mode between the app and Postgres
- [ ] Consider Render's built-in connection pooler if available on your tier

---

## MEDIUM — Address within 90 days of launch

### 6. Add Soft Deletes to Charities
**File:** `backend/migrations/002_create_charities_table.sql` (via a new migration)

Deleting a charity hard-deletes the row, which will orphan any `donation_intents` rows referencing that charity (when donations are implemented). There's also no audit trail for removals.

- [ ] Create `backend/migrations/015_charities_soft_delete.sql`
- [ ] Add `deleted_at TIMESTAMPTZ` column to `charities` (nullable)
- [ ] Update all `SELECT` queries on charities to add `WHERE deleted_at IS NULL`
- [ ] Change the `deleteCharity` resolver to `UPDATE charities SET deleted_at = NOW() WHERE id = $1`
- [ ] Add a `deleted_at` index for admin queries showing deleted charities

---

### 7. Database Read Replica for Reporting / Heavy Queries
**File:** `backend/src/env.ts`

All reads and writes go to the same Postgres instance. Read-heavy pages (charity list, map view) and write-heavy operations (analytics events, donation inserts) compete for resources.

- [ ] Add a `DATABASE_REPLICA_URL` env var (Render supports read replicas on paid tiers)
- [ ] Create a second Pool instance in `db.ts` for the read replica
- [ ] Route read-only queries (all `SELECT`) through the replica pool
- [ ] Route writes (INSERT, UPDATE, DELETE) through the primary pool
- [ ] Ensure the replica pool is only used when the env var is present (graceful no-op in dev)

---

### 8. Monitor Slow Queries in Production
**File:** `backend/src/db.ts`

No query logging or slow query monitoring is configured. Performance regressions are invisible until users complain.

- [ ] Enable PostgreSQL slow query logging on the Render Postgres instance (log queries > 100ms)
- [ ] Alternatively, wrap the `pool.query` call in `db.ts` with a timing wrapper that logs queries taking > 200ms
- [ ] Set up a weekly review of the Render Postgres metrics dashboard (CPU, connections, query time)

---

### 9. Frontend API URL Resilience
**File:** `render.yaml` lines 41–42

`VITE_API_URL` is baked in at build time. If the backend moves, changes domains, or needs blue-green switching, the frontend must be fully rebuilt and redeployed.

- [ ] Route all API traffic through a stable base URL (e.g., `api.goodlocal.org`) backed by a Render custom domain
- [ ] Use a reverse proxy or Render routing rules so the frontend always targets the same hostname regardless of backend instance changes
- [ ] This enables future backend deployments without forced frontend rebuilds

---

## Monitoring & Observability Checklist (Ongoing)

- [ ] Set up uptime monitoring (UptimeRobot free tier — ping `/.well-known/apollo/server-health` every 5 min)
- [ ] Create a Render alert for backend CPU > 80% sustained for 5 minutes
- [ ] Create a Render alert for database connection count > 80% of max
- [ ] Set up error tracking (Sentry free tier — capture unhandled exceptions in both frontend and backend)
- [ ] Review Render metrics weekly for the first 3 months after launch
