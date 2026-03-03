# GoodLocal — Architecture Decisions

Key technical decisions with rationale and alternatives. Ordered roughly by when the decision was made.

---

## 1. Donate-first, verify-later donation association

**Decision:** Collect the donor's email from the Every.org webhook payload, store it on the `donation_intents` row (`donor_email`), and send a post-donation magic link email. When the user eventually verifies (new or existing), retroactively associate all unlinked donations via a single `UPDATE` on `donation_intents WHERE donor_email = $email AND user_id IS NULL`.

**Rationale:** Interrupting the donation flow with a login prompt harms conversion. Every.org already collects the donor's email, so we can receive it via webhook and use it to bridge the gap asynchronously. Known verified users get a simple receipt immediately; unknown or unverified users get a "view my giving history" magic link that creates or activates their account.

**Tradeoffs / risks:**
- Relies on Every.org including `email` in the webhook payload — not guaranteed for all donation types
- Donations made without an email (anonymous donors) will never be associated with an account
- The retroactive `UPDATE` is idempotent but runs on every `verifyMagicLink` call — negligible cost

**Alternatives considered:**

### Alt A: Require login before donating
Gate the Every.org modal behind authentication. `user_id` is always known when the webhook fires.
- Pro: No deferred association complexity
- Con: Higher friction, worse conversion, contradicts "donate first" UX goal

### Alt B: Post-donation account creation prompt
After the Every.org widget closes, show an in-app prompt ("Save your giving history — create an account"). Capture email in GoodLocal UI.
- Pro: More control over the UX; email captured directly
- Con: Relies on donor returning to GoodLocal after donating; widget close event is unreliable across browsers

### Alt C: Anonymous donations only
Never associate donations with accounts. Giving history is simply not a product feature.
- Pro: No auth complexity in the donation path at all
- Con: Eliminates a key retention hook; donors have no record in GoodLocal

### Alt D: Every.org Disbursements / Partner API (future)
Pull donation history from Every.org's server-side API rather than relying on webhooks. Could supplement or replace webhook-based ingestion.
- Pro: More reliable than webhook; could backfill missing data
- Con: Requires a paid Every.org partnership tier; not available for MVP

---

## 2. Magic link auth (no passwords)

**Decision:** Passwordless auth via Resend magic links. JWT stored in `localStorage`, 15-day expiry.

**Rationale:** Simple for a civic/giving app audience. No password reset flows, no bcrypt, no session management. The 15-day JWT keeps friction low for returning users.

**Alternatives considered:**
- OAuth (Google/Apple) — better for high-volume apps; adds dependency on third-party providers; overkill for MVP
- Passkeys — ideal long-term; browser support and UX still maturing; revisit post-launch
- Password + email — adds recovery flow complexity with no meaningful UX benefit for this audience

---

## 3. Every.org embedded widget (no custom payment UI)

**Decision:** Use Every.org's embeddable donation modal for all donations. GoodLocal never touches payment data.

**Rationale:** PCI compliance, payment processor relationships, fraud handling, and disbursement infrastructure are all non-trivial. Every.org handles all of it, and their widget supports one-time and recurring giving out of the box.

**Alternatives considered:**
- Stripe Checkout — would require GoodLocal to handle disbursements to nonprofits; not viable for MVP
- Direct nonprofit payment links — no cross-charity experience; no giving history possible

---

## 4. GraphQL via Apollo (not REST)

**Decision:** All client-server communication via Apollo GraphQL, with Express alongside for webhooks and analytics endpoints that can't be GraphQL.

**Rationale:** Type-safe queries, codegen-generated frontend types, and fine-grained field selection outweigh the overhead for an app with a complex, nested data model (charities → locations → tags → user preferences).

**Alternatives considered:**
- Pure REST — simpler but no codegen, looser typing, more boilerplate for nested data
- tRPC — excellent for TypeScript monorepos but less familiar tooling; Apollo has a stronger ecosystem for this use case
