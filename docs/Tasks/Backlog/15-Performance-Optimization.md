# Performance Optimization (Pre-Launch + Early Growth)

> **Context:** Audit of query patterns, data transfer, and database configuration. Items marked HIGH will degrade user experience at even modest traffic. Items marked MEDIUM become problems as the charity count grows past ~100.

---

## HIGH — Fix before launch

### 1. Add Pagination to the Charities Query
**Files:** `backend/src/schema/typeDefs.ts` line 62, `backend/src/resolvers/charities.ts` lines 49–70

The `charities` query returns every row in the table with no limit. At 100+ charities this creates large payloads and slow renders. At 1,000+ it will cause timeouts.

- [ ] Add `limit: Int` and `offset: Int` args to the `charities` GraphQL query in `typeDefs.ts`
- [ ] Add `LIMIT $n OFFSET $m` to the SQL query in the resolver (default limit: 24)
- [ ] Add a `charitiesCount` query (or `totalCount` field on a `CharitiesPage` type) for pagination UI
- [ ] Update `frontend/src/pages/Charities.tsx` to pass `limit`/`offset` and render a "Load More" button or page controls
- [ ] Run `npm run codegen` after schema changes

---

### 2. Fix N+1 Query Problem on Charity Locations
**File:** `backend/src/resolvers/charities.ts` lines 98–105

The `Charity.locations` field resolver fires a separate SQL query for every charity in the list. Loading 20 charities triggers 21 database queries.

- [ ] Install `dataloader` in `backend/`: `npm install dataloader`
- [ ] Create `backend/src/loaders/locationLoader.ts` — batch-loads locations by `charity_id` using `WHERE charity_id = ANY($1)` and groups results
- [ ] Pass the loader instance through GraphQL context (create fresh per-request to avoid cross-request cache bleed)
- [ ] Replace the per-charity location query in the resolver with `context.loaders.locationLoader.load(charity.id)`

---

### 3. Add Missing Database Indexes
**Files:** `backend/migrations/` (add a new `0XX_add_indexes.sql`)

Several frequently queried columns have no index, causing full table scans.

- [ ] Create `backend/migrations/014_add_performance_indexes.sql`
- [ ] Add: `CREATE INDEX IF NOT EXISTS idx_magic_link_tokens_email ON magic_link_tokens(email);`
- [ ] Add: `CREATE INDEX IF NOT EXISTS idx_charities_slug ON charities(slug);`
- [ ] Add: `CREATE INDEX IF NOT EXISTS idx_charity_locations_charity_id ON charity_locations(charity_id);`
- [ ] Add: `CREATE INDEX IF NOT EXISTS idx_magic_link_tokens_expires_at ON magic_link_tokens(expires_at);` (for cleanup job)
- [ ] Verify via `EXPLAIN ANALYZE` locally that the new indexes are being used

---

## MEDIUM — Address in first weeks after launch

### 4. Configure Database Connection Pool Explicitly
**File:** `backend/src/db.ts` line 10

The connection pool uses library defaults (max 10 connections, no timeouts). In production this can cause connection exhaustion or slow connection acquisition under load.

- [ ] Add explicit pool config to the `new Pool({...})` call:
  ```typescript
  max: 20,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 3_000,
  ```
- [ ] Confirm Render's managed Postgres tier supports at least 20 concurrent connections
- [ ] Add a pool `error` event handler to log unexpected pool errors (prevents unhandled rejections)

---

### 5. Cache the Causes List
**Files:** `backend/src/resolvers/charities.ts`, `frontend/src/pages/Charities.tsx`

The 19-item causes list is fetched on every page load and never changes at runtime. It hits the database on every `GET_CAUSES` call.

- [ ] **Short-term (in-process):** In the `causes` resolver, cache the result in a module-level variable after the first query; invalidate on server restart
- [ ] **Longer term (Redis):** When Redis is introduced (see scalability task), move the causes cache there with a 1-hour TTL
- [ ] On the frontend, ensure `GET_CAUSES` uses Apollo's default `cache-first` fetch policy so the browser doesn't re-fetch on re-renders

---

### 6. Reduce Data Fetched in Charities List View
**File:** `frontend/src/pages/Charities.tsx` lines 81–86

The list view fetches `locations` for all charities even though only the selected/hovered charity uses them in the sidebar. This inflates every charities list response.

- [ ] Remove `locations` from the `GET_CHARITIES` list query
- [ ] Add a separate `GET_CHARITY_LOCATIONS` query used only when a charity is selected/focused
- [ ] Update the map pin logic to derive lat/lng from a lightweight `primaryLocation` field instead of the full locations array

---

### 7. Add GraphQL Query Complexity Limits
**File:** `backend/src/index.ts`

Without depth or cost limits, a single deeply nested or wide query can spike CPU and memory usage on the Node.js process.

- [ ] `npm install graphql-depth-limit` in `backend/`
- [ ] Add `validationRules: [depthLimit(6)]` to Apollo Server config
- [ ] Monitor query shapes in logs early post-launch and tune the limit accordingly

---

### 8. Eliminate Redundant COUNT Queries in Admin Mutations
**File:** `backend/src/resolvers/charities.ts` lines 230–243, 246–257

`updateCause` and `deleteCause` each fire a separate `SELECT COUNT(*)` query when the count could be returned as part of the main operation.

- [ ] Refactor `deleteCause`: use `WITH deleted AS (DELETE ... RETURNING id) SELECT count(*) FROM charities WHERE ...` in one round-trip
- [ ] Refactor `updateCause`: return the count from a subquery in the UPDATE response rather than a follow-up query

---

## Verification Checklist

- [ ] Loading `/charities` with 50+ charities in the DB returns within 500ms (check via Network tab)
- [ ] With DataLoader, loading 20 charities triggers ≤ 3 DB queries total (confirm via `pg` query logging)
- [ ] `EXPLAIN ANALYZE` on `magic_link_tokens WHERE email = $1` shows an index scan, not a seq scan
- [ ] `GET_CAUSES` is not refetching on Charities page re-renders (check Apollo devtools)
