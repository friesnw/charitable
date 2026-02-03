## Architecture & Decisions Review

### Context
The existing starter codebase was provided by absolute legend dev Sam as a generic GraphQL + React template before functional requirements were known. Now that we have clearer requirements (Every.org webhook integration, donation tracking, local charity discovery), some architectural decisions need to be revisited.

This document summarizes what exists, what we now need, and questions to discuss.

---

### MVP User Flow

I had to make a few necessary concessions for the MVP. Initially I wanted to use Stripe x a backend-only donation partner to better own the payment process in-app but based on costs that doesn't make sense right now which will simplify things anyway.

Here's the flow:

1. Discover 
	1. Browse charities in Denver by tags / filters
	2. Possibly a map integration, possibly overkill, not as concerned on that atm
2. Donate
	1. User clicks Donate from a charity page
	2. Every.org (non-profit donation partner that provides free donation infra to other non-profits) modal opens / embedded widget to pick amount + frequency (one-time vs recurring)
	3. Every.org handles payment processing, tax receipts, and compliance


3. Track
	1. Every.org sends us a **webhook** (HTTP POST) with the donation details, including any time a recurring payment is processed
	2. We save donation in our donation_intents DB to show the user's giving history
	3. User can create an account to track donations over time (might move account creation to different areas in the flow, tbd)


---

### Current State

| Layer | What's Implemented |
|-------|-------------------|
| **Backend** | Apollo Server in standalone mode (no Express), PostgreSQL via `pg`, Zod env validation, `node-pg-migrate` migrations |
| **Frontend** | React 18 + Vite, Apollo Client, GraphQL Codegen for type-safe queries |
| **Database** | Single `users` table (template only), no charity/donation schemas |
| **Auth** | Not implemented (JWT planned per CLAUDE.md) |
| **Webhooks** | Not implemented — no Express, no routes |
| **Deployment** | Render config (`render.yaml`) with free tier DB |

---

### Decisions to Review

#### 1. GraphQL vs REST — Do We Need Both?

**Current decision:** GraphQL-only via Apollo Server standalone

**New requirement:** Every.org sends webhooks via HTTP POST to a REST endpoint (`/api/webhooks/every-org`)

**Options:**

| Option | Pros | Cons |
|--------|------|------|
| **A. Add Express alongside Apollo** | Clean separation — GraphQL for client queries, REST for webhooks. Apollo integrates easily with Express middleware. | Two paradigms in one server. More code to maintain. |
| **B. GraphQL mutation for webhook** | Single paradigm. Every.org POSTs to a mutation endpoint. | Unidiomatic — webhooks aren't really "mutations." Harder to validate webhook signatures in GraphQL context. Every.org expects a REST endpoint. |
| **C. Separate webhook microservice** | Complete isolation. Webhook service writes to DB, GraphQL service reads. | Overkill for MVP. More infrastructure. |

**Recommendation:** Option A — add Express. This is what CLAUDE.md already assumed ("Express alongside Apollo needed for REST webhook endpoint"). Apollo Server 4 has first-class Express middleware support via `expressMiddleware`. The webhook handler stays REST; everything else stays GraphQL.

**Action needed:** Install `express`, `cors`, `body-parser`. Refactor `backend/src/index.ts` from `startStandaloneServer` to Express + `expressMiddleware`.

---

#### 2. Webhook Security — How Do We Validate Every.org Requests?

**Current decision:** Not implemented

**Requirement:** Verify that incoming webhook requests actually come from Every.org, not an attacker.

**Options:**

| Option | Description |
|--------|-------------|
| **Shared secret + HMAC** | Every.org signs the payload with a secret; we verify the signature. Industry standard. |
| **IP allowlist** | Only accept requests from Every.org's IPs. Fragile — IPs change. |
| **Webhook URL obscurity** | Use a hard-to-guess URL like `/webhooks/every-org/a8f3k2m9`. Security through obscurity — not sufficient alone. |

**Question for Every.org docs:** Does Every.org's Partner Webhook support HMAC signatures? Need to verify their security model before implementing.

**Action needed:** Research Every.org webhook security. Implement signature validation if available; fall back to obscure URL + idempotency checks if not.

---

#### 3. Database Schema — Donations Table Design

**Current decision:** Only a `users` table exists (template)

**New requirement:** Track donations from Every.org webhooks

**Proposed schema** (from Phase 5 plan):

```sql
CREATE TABLE donation_intents (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),  -- nullable if anonymous
  charity_id INTEGER REFERENCES charities(id) NOT NULL,
  charge_id VARCHAR(255) UNIQUE NOT NULL, -- Every.org's chargeId, for idempotency
  amount DECIMAL(10, 2) NOT NULL,
  frequency VARCHAR(20) NOT NULL CHECK (frequency IN ('one-time', 'monthly')),
  donation_date TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_donation_intents_user ON donation_intents(user_id);
CREATE INDEX idx_donation_intents_charity ON donation_intents(charity_id);
CREATE INDEX idx_donation_intents_charge_id ON donation_intents(charge_id);
```

**Open questions:**
- Should `user_id` be nullable (allow anonymous donations tracked by email only)?
- Do we need to store the Every.org `toNonprofit` EIN to match to our `charities` table?
- Should we store the raw webhook payload for debugging/auditing?

---

#### 4. Charity Data Model — What Do We Actually Need?

**Current decision:** Not implemented

**Requirement:** Store Denver nonprofits with cause tags, trust signals, and Every.org integration.

**Proposed schema:**

```sql
CREATE TABLE charities (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,       -- URL-friendly identifier
  ein VARCHAR(10) UNIQUE,                  -- IRS EIN for matching Every.org data
  every_org_slug VARCHAR(255),             -- Every.org nonprofit slug for donate links
  mission TEXT,
  description TEXT,
  cause_tags TEXT[] NOT NULL DEFAULT '{}', -- Array for GIN index
  trust_summary TEXT,                      -- Human-readable trust explanation
  website_url VARCHAR(500),
  logo_url VARCHAR(500),
  founded_year INTEGER,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_charities_cause_tags ON charities USING GIN(cause_tags);
CREATE INDEX idx_charities_ein ON charities(ein);
CREATE INDEX idx_charities_every_org_slug ON charities(every_org_slug);
```

**Open questions:**
- Do we need location data (lat/lng, neighborhood) for future map features?
- Should `trust_summary` be structured (JSON with fields) or freeform text?
- How do we handle charities that aren't on Every.org? (MVP: require Every.org presence)

---

#### 5. User/Auth Schema — What's the Minimum?

**Current decision:** Basic `users` table with name, email, created_at

**Requirement:** JWT auth, password storage, link donations to users

**Proposed additions:**

```sql
ALTER TABLE users ADD COLUMN password_hash VARCHAR(255);
ALTER TABLE users ADD COLUMN email_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN last_login TIMESTAMP;
```

**Open questions:**
- Do we need email verification for MVP, or is it post-launch?
- Should we support OAuth (Google, Apple) or password-only for MVP?
- Do we need a `sessions` table, or is stateless JWT sufficient?

---

#### 6. Frontend Every.org Widget — Type Definitions

**Current decision:** `vite-env.d.ts` exists but has no Every.org types

**Requirement:** Every.org's donate widget is loaded via script tag and exposes global functions

**Action needed:** Add type definitions to `frontend/src/vite-env.d.ts`:

```typescript
interface EveryOrgOptions {
  nonprofitSlug: string;
  fundraiserSlug?: string;
  frequency?: 'once' | 'monthly';
  amount?: number;
  onSuccess?: (data: { chargeId: string }) => void;
}

interface Window {
  everyDotOrgDonateButton?: {
    createButton: (options: EveryOrgOptions) => void;
    createWidget: (options: EveryOrgOptions) => void;
  };
}
```

---

#### 7. Monorepo Structure — Is npm Workspaces Sufficient?

**Current decision:** npm workspaces with `frontend/` and `backend/` packages

**Assessment:** This is working fine. No change needed for MVP.

**Future consideration:** If we add more packages (shared types, email service, etc.), consider migrating to Turborepo or Nx for better caching and task orchestration. Not needed now.

---

#### 8. Environment Variables — What's Missing?

**Current backend `.env`:**
```
NODE_ENV, PORT, DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD, DATABASE_URL
```

**Additional variables needed:**

```
# Every.org integration
EVERY_ORG_WEBHOOK_SECRET=     # For validating webhook signatures (if supported)
EVERY_ORG_PARTNER_ID=         # If required by Every.org API

# JWT auth
JWT_SECRET=                   # For signing tokens
JWT_EXPIRES_IN=7d             # Token expiration

# Frontend URL (for CORS, redirects)
FRONTEND_URL=http://localhost:3000
```

**Action needed:** Update `backend/src/env.ts` Zod schema to include new variables.

---

### Summary: What Needs to Change

| Item | Change Required | Priority |
|------|-----------------|----------|
| Add Express to backend | Yes — needed for webhook endpoint | High (blocks donation tracking) |
| Webhook route + handler | Yes — new code | High |
| `charities` table + schema | Yes — new migration | High (blocks charity pages) |
| `donation_intents` table | Yes — new migration | High (blocks giving history) |
| User auth (JWT + bcrypt) | Yes — new code | Medium (blocks protected routes) |
| Every.org widget types | Yes — update `vite-env.d.ts` | Medium |
| Env variable additions | Yes — update Zod schema | Medium |
| GraphQL schema expansion | Yes — charities, donations queries/mutations | High |

---

### Questions for Architecture Review

1. **Express integration:** Any concerns with mixing Express + Apollo in the same process? 

2. **Webhook idempotency:** The `charge_id` unique constraint handles duplicate webhooks. Is there a race condition concern if Every.org sends retries quickly?

3. **GIN index on cause_tags:** This is PostgreSQL-specific. Any concern about portability, or is Postgres the long-term choice?

4. **Auth approach:** Stateless JWT vs. session-based? Trade-offs for this use case?

5. **Every.org dependency:** The entire donation flow depends on Every.org. Should we abstract the payment layer in case we switch providers later, or is that premature?
	1. Nick: i'm assuming that is premature 

---

### References

- [Every.org Partner Webhook Docs](https://docs.every.org/docs/webhooks/partner-webhook)
- [Apollo Server 4 Express Integration](https://www.apollographql.com/docs/apollo-server/api/express-middleware)
- [Phase 5 Donations Task](../Todo/5-Donations-Integration.md)
- [Recurring Donations Research](../../Research/User-Journey-and-Activation.md)
