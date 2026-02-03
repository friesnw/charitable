## Phase 5: Donations + Every.org

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
