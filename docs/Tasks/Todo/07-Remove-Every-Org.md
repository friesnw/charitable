# Remove Every.org Integration

Replace Every.org donation flow with direct links to each charity's external donation page. Remove all donation tracking copy and infrastructure.

> **Product context:** The product position doc frames the feature set as Discovery → Trust → Ease → Continuity. Removing Every.org means deferring "Continuity" (giving history, financial tracking) to a later phase — which is the right call. Validate discovery and trust first, before building tracking infrastructure. Financial tracking remains a planned product evolution once there's user traction.

> **Accounts note:** With tracking gone, there's less reason to push hard auth at the donate step. A future task (`08-Softer-Auth`) should explore a lighter account model — e.g., an unauth map user gets a gentle "save your preferences with your email" prompt rather than a full login gate. Tracked separately.

---

## Tasks

### Data (do this first)

- [x] **Research `donateUrl` for each charity** — Find and record each charity's direct donation page URL (their website donate page, or a platform like PayPal Giving Fund, Benevity, Stripe, etc.). This is manual research; go through each charity in the DB and find the correct link.
- [x] **Add `donate_url` column** — Write migration `backend/migrations/0XX_add_donate_url.sql` adding a nullable `donate_url` text column to `charities`
- [x] **Populate `donate_url`** — Update each charity row with the researched URLs (use the sync script or direct DB update)
- [x] **Admin interface** — Ensure `donate_url` is editable per charity in the admin panel

### Frontend

- [x] **`DonateButton.tsx`** — Remove the modal entirely; clicking Donate should call `window.open(charity.donateUrl, '_blank')` directly. No modal needed. (All modal copy is preserved in the Reference section below.)
- [x] **Remove "tracking donations" copy** — Delete line: *"Your donation is saved to GoodLocal so you can track all giving history in one place"*
- [x] **Remove "View my giving history →" CTA** — Delete the post-donation giving history button shown to authenticated users
- [x] **Remove Every.org intro step copy** — Delete: *"To process your payment, GoodLocal partners with Every.org, a nonprofit payment platform for charitable giving without platform fees."*
- [x] **`index.html`** — Remove the Every.org embed script tag: `<script async defer src="https://embeds.every.org/0.4/button.js?explicit=1" ...>`
- [x] **`vite-env.d.ts`** — Remove `VITE_EVERY_ORG_WEBHOOK_TOKEN` type declaration and `EveryDotOrgDonateButton` interface
- [x] **`frontend/.env.example`** — Remove `VITE_EVERY_ORG_WEBHOOK_TOKEN`
- [x] **`Charities.tsx`** — Replace `everyOrgSlug` in GraphQL query with `donateUrl`
- [x] **`CharityDetail.tsx`** — Same as above
- [x] **`CharityDetailStory.tsx`** — Update `<DonateButton>` props; remove `everyOrgSlug` reference
- [x] Remove every.org slug from admin view to not distract, same with "every_org_claimed"

### Backend

- [x] **`everyOrg.ts` webhook handler** — Delete file (`backend/src/webhooks/everyOrg.ts`)
- [x] **`index.ts`** — Remove webhook route registration (`app.post('/api/webhooks/every-org', ...)`)
- [x] **`env.ts`** — Remove `EVERY_ORG_WEBHOOK_TOKEN` and `EVERY_ORG_AUTH_TOKEN` env vars
- [x] **`email.ts`** — Remove `sendDonationConfirmation()` function (or repurpose if still needed elsewhere)

### Database

- [ ] **`donation_intents` table** — No new data will flow in; we will keep for historical reference 
- [ ] **`everyOrgSlug` / `everyOrgClaimed` columns** — Keep in schema for reference 
- [x] **GraphQL schema (`typeDefs.ts`)** — Remove `everyOrgSlug` and `everyOrgClaimed` from `Charity` type; add `donateUrl: String`; update `createCharity`/`updateCharity` mutations accordingly
- [x] **Resolvers** — Remove `everyOrgSlug`/`everyOrgClaimed` from charity resolver mapper; add `donateUrl` mapping from `donate_url` DB column
- [x] **Run `npm run codegen`** after schema changes

### Docs / Flows

- [x] **`docs/Product/flows.md`** — Remove or archive sections 7a–7e (drawer donation, detail page donation, post-donation flows); replace with updated direct-link donate flow

### Cleanup

- [x] **Remove `EVERY_ORG_*` env vars from Render** (dev and prod) after deploy
- [x] **Storybook (`DonateButton.stories.tsx`)** — Update stories to reflect new simplified donate behavior; remove note about Every.org `button.js` requirement

---

## Previously: What We Had (Reference)

This section documents the Every.org integration as it existed, in case we want to restore it later.

### How It Worked

Clicking "Donate" on a charity opened a multi-step GoodLocal modal:
1. **Intro step** — Explained the Every.org partnership and that there are no platform fees
2. **Frequency selection** — User chose "Give monthly" or "Once"
3. **Redirect** — Opened `https://www.every.org/{nonprofitSlug}/donate#frequency={frequency}` in a new tab
4. **Thank you step** — Confirmed Every.org opened in a new tab; showed "View my giving history →" for authenticated users

The donate button passed `partnerMetadata` (base64-encoded `{ userId }`) and `webhookToken` to the Every.org embed widget so donations could be attributed back to GoodLocal accounts.

### Webhook (Backend)

**Endpoint:** `POST /api/webhooks/every-org`
**File:** `backend/src/webhooks/everyOrg.ts`

Every.org called this endpoint after a successful donation. The handler:
- Validated auth via `Authorization` header and/or `webhookToken`
- Looked up the charity by `every_org_slug`
- Inserted a record into `donation_intents` (deduplicated by `charge_id`)
- Associated the donation with a user via three paths:
  1. **Fast path:** `partnerMetadata` contained a `userId` → immediate association
  2. **Email lookup:** Known verified user found by email → association + receipt email
  3. **Magic link:** Unknown user → generated a magic link token for post-donation signup/claiming

### Donation Storage

Table: `donation_intents`
| Column | Type | Notes |
|--------|------|-------|
| `id` | PK | |
| `charity_id` | FK | |
| `charge_id` | unique string | From Every.org, used for deduplication |
| `user_id` | FK (nullable) | Null until user is associated |
| `amount` | decimal | |
| `frequency` | `one-time` \| `monthly` | |
| `donation_date` | timestamp | |
| `donor_email` | string | For unverified donors |
| `created_at` | timestamp | |

### Charity DB Columns

- `every_org_slug` — The nonprofit's slug on Every.org (e.g. `denver-rescue-mission`)
- `every_org_claimed` — Whether the nonprofit had claimed their Every.org page

### Email Notifications

**Function:** `sendDonationConfirmation(email, charityName, token?)`
**File:** `backend/src/services/email.ts`

- **Existing verified user:** Receipt email with "Visit GoodLocal" CTA
- **New/unverified user:** Receipt email with "View my giving history" magic link CTA (15-min expiry)

### Frontend Copy Removed

- *"To process your payment, GoodLocal partners with Every.org, a nonprofit payment platform for charitable giving without platform fees."*
- *"Your donation is saved to GoodLocal so you can track all giving history in one place."*
- *"We've opened Every.org in a new tab so you can complete your donation securely."*
- "View my giving history →" CTA (linked to `/dashboard`)

### Planned But Never Built

- `GivingHistoryPage.tsx` — A giving history dashboard showing one-time donations as line items and monthly donations grouped by charity with Active/Inactive badges and "Manage on Every.org" link
