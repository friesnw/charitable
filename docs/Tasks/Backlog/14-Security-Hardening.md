# Security Hardening (Pre-Launch Required)

> **Context:** Audit of the codebase against OWASP top 10 and production security best practices. All HIGH items below are blocking for a real-user launch. MEDIUM items should be addressed in the first week post-launch.

---

## HIGH — Must fix before launch

### 1. Restrict CORS to Frontend Domain
**File:** `backend/src/index.ts` line 24

The server uses `cors()` with no arguments, which allows requests from **any origin** on the internet. Any website can call your GraphQL API.

- [ ] Add `FRONTEND_URL` to `backend/src/env.ts` Zod schema
- [ ] Update CORS config: `app.use(cors({ origin: env.FRONTEND_URL, credentials: true }))`
- [ ] Add `FRONTEND_URL` env var to Render backend service settings
- [ ] Verify in browser devtools that cross-origin requests from other domains are rejected

---

### 2. Add Security Headers (Helmet)
**File:** `backend/src/index.ts`

No HTTP security headers are set. The app is currently vulnerable to clickjacking, MIME sniffing, and XSS without browser-level mitigations.

- [ ] `npm install helmet` in `backend/`
- [ ] Add `app.use(helmet())` before all other middleware in `index.ts`
- [ ] Tune CSP if the Every.org widget breaks (it loads from `every.org` and `everyaction.com`)
- [ ] Verify headers using [securityheaders.com](https://securityheaders.com) after deploy

---

### 3. Rate Limit Magic Link Requests
**File:** `backend/src/resolvers/auth.ts` lines 27–45

`requestMagicLink` has no throttling. An attacker can spam any email address with magic links, abuse your Resend quota, and cause disruption.

- [ ] `npm install express-rate-limit` in `backend/`
- [ ] Apply a per-IP rate limit of 10 requests/15 min on the Express layer (or within the resolver via IP from `context.req`)
- [ ] Apply a per-email rate limit: before sending, check `magic_link_tokens` for recent tokens in the last 15 min for that email; reject if found
- [ ] Return a generic success message even on rejection to avoid email enumeration

---

### 4. Fix SSL Certificate Validation for Database
**File:** `backend/src/env.ts` line 36

Production database connections use `ssl: { rejectUnauthorized: false }`, which disables certificate verification and opens the connection to MITM attacks.

- [ ] Change to `ssl: { rejectUnauthorized: true }` for production
- [ ] If Render's managed Postgres still fails with `true`, investigate whether Render provides a CA cert and configure it properly
- [ ] Keep `rejectUnauthorized: false` only in local dev (non-`DATABASE_URL` path)

---

### 5. Add Authorization Check on `createUser` Mutation
**File:** `backend/src/resolvers/index.ts` line 37

The `createUser` mutation has no `requireAdmin` guard. Any unauthenticated caller can create user records in your database.

- [ ] Add `requireAdmin(context)` call at the top of the `createUser` resolver
- [ ] Verify via GraphQL Playground that unauthenticated `createUser` calls return a 401/403 error

---

## MEDIUM — Address within first week of launch

### 6. Validate All GraphQL Resolver Inputs with Zod
**Files:** `backend/src/resolvers/auth.ts`, `backend/src/resolvers/charities.ts`

Resolver arguments (email, search strings, tags arrays, slug) are not validated. Malformed or excessively long inputs reach the database.

- [ ] Create a `backend/src/validators.ts` file with Zod schemas for common argument shapes
- [ ] Validate `email` arg in `requestMagicLink`: must be valid email format, max 254 chars
- [ ] Validate `search` arg in `charities`: max 200 chars, strip special chars
- [ ] Validate `causeTags` arrays: each tag must be a non-empty string, max 20 chars per tag, max 10 tags
- [ ] Validate `slug` in `charity(slug:)`: alphanumeric + hyphens only, max 80 chars

---

### 7. Validate Cause Tags Against Database Enum
**File:** `backend/src/resolvers/charities.ts` line 163

When creating or updating charities, the `causeTags` field is not checked against the 19 predefined valid tags in the `causes` table. Any string can be inserted.

- [ ] In the `updateCharityCauseTags` resolver, query the `causes` table for all valid tag names
- [ ] Reject the mutation with a descriptive error if any tag in the request does not exist in `causes`
- [ ] Add a test case: send an invalid tag and verify it's rejected

---

### 8. Add GraphQL Query Complexity / Depth Limits
**File:** `backend/src/index.ts`

Apollo Server has no depth limit or complexity analyzer. A malicious user could craft a deeply nested query to exhaust server resources.

- [ ] `npm install graphql-depth-limit` in `backend/`
- [ ] Add `validationRules: [depthLimit(5)]` to the Apollo Server config
- [ ] Optionally add `graphql-cost-analysis` for cost-based limits on field count

---

### 9. Log Failed Authentication Attempts
**File:** `backend/src/index.ts` lines 29–36

Failed JWT verifications are silently swallowed. There is no audit trail for detecting brute-force or token replay attacks.

- [ ] In the `context` function, log when `verifyToken()` returns null: include request IP and a truncated token hash (never the token itself)
- [ ] Use structured logging (JSON) so logs can be parsed by Render's log drains

---

### 10. Add Webhook Signature Verification (When Implemented)
**File:** `backend/src/index.ts` (future webhook route)

Every.org webhooks are not yet implemented. When they are, the endpoint must verify the request signature to prevent spoofed events.

- [ ] When wiring the `/api/webhooks/every-org` handler, verify the `webhook_token` query param matches the stored secret
- [ ] Do not process any payload until signature is confirmed
- [ ] Return 401 (not 403) for invalid signatures to avoid leaking information

---

## Verification Checklist (before go-live)

- [ ] `curl` from a non-whitelisted origin returns CORS error
- [ ] Sending 10+ magic link requests in 15 min for same email is rejected
- [ ] `securityheaders.com` scan returns A or B grade
- [ ] Unauthenticated `createUser` mutation returns auth error
- [ ] DB connection in production uses TLS with cert validation
