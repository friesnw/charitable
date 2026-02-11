## Phase 5: Donations + Every.org Integration

**Note:** This is a *later* phase. Initial launch uses simple donation links to charity websites. Every.org integration adds tracked donations, giving history, and recurring donation support.

---

### Prerequisites (Before Every.org)

For initial launch, charity pages will have:
- "Donate" button → links directly to charity's website (`websiteUrl`)
- No donation tracking, no giving history
- This lets us ship something live while we coordinate with Every.org

---

### Backend Setup (When Ready for Every.org)

- [ ] **Add donation types to `typeDefs.ts`**: `DonationIntent`, `createDonationIntent`, `myDonations`
- [ ] **Create `backend/src/resolvers/donations.ts`**: `createDonationIntent`, `myDonations` resolvers
- [ ] **Create `backend/src/routes/webhooks.ts`**: POST `/api/webhooks/every-org` endpoint

---

### Every.org Webhook Setup

- [ ] **Email support@every.org** to set up a Partner Webhook

**Include in your email:**
- A couple sentences about your use case
- Your webhook endpoint (e.g., `https://yourdomain.com/api/webhooks/every-org`)

**They will send you:**
- A unique `webhook_token` to include as a parameter on your Donate Link
- All donations made via your Donate Link with your `webhook_token` will trigger a notification to your webhook

**Questions to ask Every.org:**
- [ ] How do you handle recurring/monthly donations with webhooks?
- [ ] Do we receive a webhook notification for each monthly charge, or only the initial donation?
- [ ] Is there a way to identify the first donation vs subsequent recurring charges in the webhook payload?
- [ ] Do you send webhooks for failed charges or cancellations?

---

### One-Time Donations
- [ ] **Update `frontend/src/vite-env.d.ts`**: Add Every.org global types
- [ ] **Create `frontend/src/components/DonateButton.tsx`**: Every.org widget wrapper (modal opens with frequency toggle)
- [ ] **Create backend migration**: `donation_intents` table with columns: id, user_id, charity_id, charge_id (unique), amount, frequency ('one-time' | 'monthly'), donation_date, created_at
- [ ] **Wire webhook handler** (`/api/webhooks/every-org`): Parse chargeId, amount, frequency, donationDate, toNonprofit from Every.org payload; deduplicate on charge_id; insert into donation_intents

### Recurring Donations
- [ ] **Webhook handles recurring charges**: Each monthly charge from Every.org triggers a new webhook with a unique chargeId — store each as a separate row in donation_intents
- [ ] **GraphQL resolver for recurring status**: Group monthly donations by (user_id, charity_id); derive status from recency — "active" if last charge within ~35 days, "inactive" otherwise
- [ ] **Note**: Every.org does NOT send cancellation/failure webhooks. Status is inferred from charge recency. UI must not show false certainty (never say "Cancelled" — say "No recent activity").

### Giving History
- [ ] **Create `frontend/src/pages/GivingHistoryPage.tsx`**: Protected route showing donation history
- [ ] **One-time donations**: Show as simple line items
- [ ] **Monthly donations**: Group by charity, show charge history, badge as "Monthly"
- [ ] **Active recurring indicator**: Green indicator + "Last charged [date]"
- [ ] **Inactive recurring indicator**: Gray indicator + "No charge since [date]"
- [ ] **Management link**: "Manage your recurring donations on Every.org" linking to Every.org dashboard

### Verification
- [ ] Donate button opens Every.org modal with monthly toggle visible
- [ ] Webhook stores one-time donation correctly
- [ ] Webhook stores recurring monthly charge correctly (each month = new row)
- [ ] Giving history displays one-time and monthly donations with correct badges
- [ ] Recurring status inference works: recent charge = green, stale = gray
- [ ] No misleading subscription status language in UI
