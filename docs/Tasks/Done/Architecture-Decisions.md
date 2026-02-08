## Architecture & Decisions Review

### Context
The existing starter codebase was provided by absolute legend dev Sam as a generic GraphQL + React template before functional requirements were known. Now that we have clearer requirements (Every.org webhook integration, donation tracking, local charity discovery), some architectural decisions need to be revisited.

This document summarizes what exists, what we now need, and questions to discuss.

---

### MVP User Flow

I had to make a few necessary concessions for the MVP. Initially I wanted to use Stripe & a backend-only donation partner to better own the payment process in-app but based on costs that doesn't make sense right now which will simplify things anyway.

Here's the flow:

1. Discover 
	1. Browse charities in Denver by tags / filters
	2. Possibly a map integration, possibly overkill, not as concerned on that atm
2. Donate
	1. User clicks Donate from a charity page
	2. Every.org (non-profit donation partner that provides free donation infra to other non-profits) modal opens / embedded widget to pick amount + frequency (one-time vs recurring)
	3. Every.org handles payment processing, tax receipts, and compliance
3. Track
	1. Every.org sends us a webhook (HTTP POST) with the donation details, including any time a recurring payment is processed
	2. We save donation in our donation_intents DB to show the user's giving history
	3. User can create an account to track donations over time (might move account creation to different areas in the flow, tbd). 


---

### Current State

| Layer | What's Implemented |
|-------|-------------------|
| **Backend** | Apollo Server in standalone mode (no Express), PostgreSQL via `pg`, Zod env validation, `node-pg-migrate` migrations |
| **Frontend** | React 18 + Vite, Apollo Client, GraphQL Codegen for type-safe queries |
| **Database** | `users` table (with auth fields), `charities` table, `donation_intents` table |
| **Auth** | Not implemented (JWT planned per CLAUDE.md) — schema ready |
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

✅ **Sam's decision:** Add Express alongside Apollo.

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

✅ **Sam's decision:** Not important for MVP. Just get it working first, optimize security later. Rely on `charge_id` idempotency for now.

---

#### 3. Database Schema — Donations Table Design ✅ COMPLETE

**Status:** Migration `004_create_donation_intents.sql` implemented

**What I added:**
- `user_id` — nullable (allows anonymous donations)
- `charity_id` — required, references charities
- `charge_id` — unique, for idempotency
- `amount` — DECIMAL(10,2)
- `frequency` — VARCHAR(20), flexible (no CHECK constraint)
- `is_initial` — BOOLEAN, to distinguish first donation from recurring charges
- `donation_date`, `created_at` — timestamps
- Indexes on `user_id` and `charity_id`

---

#### 4. Charity Data Model — What Do We Actually Need? ✅ COMPLETE (MVP)

**Status:** Migration `002_create_charities_table.sql` implemented

**What I added:**
- `id`, `name`, `description`, `website_url`, `logo_url`
- `cause_tags` — TEXT[] with GIN index
- `every_org_slug` — UNIQUE, for donate links
- `ein` — UNIQUE NOT NULL, for webhook matching
- `created_at`, `updated_at` — timestamps

**Might add later (captured in `Enrich-DB-Tables.md`):**
- `slug` — URL-friendly identifier
- `mission` — separate from description
- `trust_summary` — human-readable trust explanation
- `founded_year`, `is_active`
- Additional indexes on `ein` and `every_org_slug`
- Location data (lat/lng, neighborhood) for maps

---

#### 5. User/Auth Schema — What's the Minimum? ✅ COMPLETE

**Status:** Migration `003_add_user_auth_fields.sql` implemented

**What I added:**
- `password_hash` — VARCHAR(255), nullable (not used — see Sam's decision below)
- `email_verified` — BOOLEAN DEFAULT FALSE
- `last_login` — TIMESTAMP

✅ **Sam's decision:** Skip passwords entirely. Use **email-based 2FA with Resend**:
1. User enters email
2. Send magic link / code via Resend
3. User clicks link / enters code
4. Store JWT token in browser when verified

This simplifies auth significantly — no password hashing, no "forgot password" flow, no password validation rules.

---

#### 6. Frontend Every.org Widget — Type Definitions

**Current decision:** `vite-env.d.ts` exists but has no Every.org types

**Requirement:** Every.org's donate widget is loaded via script tag and exposes global functions

✅ **Sam's decision:** Do web research to figure out the best implementation approach when building this feature.

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

#### 7. Environment Variables — What's Missing?

**Current backend `.env`:**
```
NODE_ENV, PORT, DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD, DATABASE_URL
```

**Additional variables needed:**

```
# Every.org integration
EVERY_ORG_WEBHOOK_TOKEN=      # Token from Every.org for donate links

# Auth (Email 2FA via Resend)
RESEND_API_KEY=               # For sending magic link emails
JWT_SECRET=                   # For signing tokens
JWT_EXPIRES_IN=7d             # Token expiration

# Frontend URL (for CORS, redirects, magic links)
FRONTEND_URL=http://localhost:3000
```

**Action needed:** Update `backend/src/env.ts` Zod schema to include new variables.

---

### Summary: What Needs to Change

| Item | Change Required | Priority | Status |
|------|-----------------|----------|--------|
| `charities` table + schema | Yes — new migration | High | ✅ Done |
| `donation_intents` table | Yes — new migration | High | ✅ Done |
| User auth schema | Yes — new migration | High | ✅ Done |
| Add Express to backend | Yes — needed for webhook endpoint | High | Todo |
| Webhook route + handler | Yes — new code | High | Todo |
| User auth (Email 2FA + Resend + JWT) | Yes — new code | Medium | Todo |
| Every.org widget types | Yes — update `vite-env.d.ts` | Medium | Todo |
| Env variable additions | Yes — update Zod schema | Medium | Todo |
| GraphQL schema expansion | Yes — charities, donations queries/mutations | High | Todo |

---

### Questions for Architecture Review ✅ ANSWERED

1. **Express integration:** Any concerns with mixing Express + Apollo in the same process?
   - **Sam:** No concerns. Do it.

2. **Webhook idempotency:** The `charge_id` unique constraint handles duplicate webhooks. Is there a race condition concern if Every.org sends retries quickly?
   - **Sam:** Don't worry about it for MVP.

3. **Auth approach:** Stateless JWT vs. session-based? Trade-offs for this use case?
   - **Sam:** Stateless JWT, stored in browser. Use email 2FA via Resend instead of passwords.

4. **Every.org dependency:** The entire donation flow depends on Every.org. Should we abstract the payment layer in case we switch providers later, or is that premature?
   - **Nick:** Premature.
   - **Sam:** (implied agreement — focus on MVP) 

---

### References

- [Every.org Partner Webhook Docs](https://docs.every.org/docs/webhooks/partner-webhook)
- [Apollo Server 4 Express Integration](https://www.apollographql.com/docs/apollo-server/api/express-middleware)
- [Phase 5 Donations Task](../Todo/5-Donations-Integration.md)
- [Recurring Donations Research](../../Research/User-Journey-and-Activation.md)
