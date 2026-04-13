# Donation Pages & Components (Backlog)

> **Depends on:** `12-Integrate-Donations.md` (Every.org webhook integration must be complete)

## Overview

Build the complete donation experience after Every.org integration. This includes the donation flow, success confirmation, user dashboard, and giving history.

**Why deferred:** Before Every.org integration, the "Donate" button simply opens the charity's external website. No success page, tracking, or history is possible without webhooks.

---

## Donation Flow

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│ Charity Detail  │ ──▶ │ Every.org Modal  │ ──▶ │ Success Page    │
│ (Donate button) │     │ (hosted widget)  │     │ (/donate/success)│
└─────────────────┘     └──────────────────┘     └─────────────────┘
                                │
                                ▼ webhook
                        ┌──────────────────┐
                        │ Our Backend      │
                        │ (donation_intents)│
                        └──────────────────┘
                                │
                                ▼
                        ┌──────────────────┐
                        │ Dashboard/History │
                        │ (user views data) │
                        └──────────────────┘
```

---

## Components

### DonateButton
Wrapper component for Every.org embedded widget.

- [ ] **Every.org script integration** — Load widget script in index.html
- [ ] **Open modal on click** — Pass charity EIN, amount presets, frequency options
- [ ] **Handle completion callback** — Redirect to success page with params
- [ ] **Loading state** — Show spinner while widget loads
- [ ] **Error handling** — Fallback to charity website if widget fails

```tsx
<DonateButton
  charityEin="123456789"
  charityName="Denver Food Bank"
  suggestedAmounts={[25, 50, 100]}
/>
```

### DonationCard
Display a single donation (used in lists/history).

- [ ] **Charity info** — Name, logo/avatar
- [ ] **Amount** — Formatted currency
- [ ] **Date** — Relative or absolute
- [ ] **Type badge** — One-time or Monthly
- [ ] **Recurring status** — Active (green) / Inactive (gray) for monthly

### DonationTracker
Dashboard summary widget showing giving stats.

- [ ] **Total donated** — Sum of all donations
- [ ] **Charities supported** — Count of unique charities
- [ ] **Active recurring** — Count of active monthly donations
- [ ] **This year/all time toggle** — Filter stats by timeframe

### RecurringBadge
Status indicator for monthly donations.

- [ ] **Active state** — Green dot + "Active"
- [ ] **Inactive state** — Gray dot + "No recent activity"
- [ ] **Never say "Cancelled"** — We don't know; Every.org doesn't send that webhook

---

## Pages

### Donation Success (`/donate/success`)
Confirmation screen after completing donation via Every.org widget.

**Query params:** `?charity=slug&amount=5000&frequency=one-time`

- [ ] **Thank you message** — Personalized with charity name
- [ ] **Donation summary** — Amount, frequency, charity
- [ ] **What happens next** — Explain tax receipt comes from Every.org
- [ ] **Tracking note** — "This donation will appear in your history shortly"
- [ ] **Next actions** — View dashboard, discover more charities, share (stretch)
- [ ] **Unauthenticated flow** — Prompt to create account to track donations

### Dashboard (`/dashboard`)
Main hub for logged-in users.

- [ ] **DonationTracker widget** — Stats summary at top
- [ ] **Recent donations** — Last 5 donations with DonationCard
- [ ] **Active recurring section** — Charities with monthly donations
- [ ] **Quick actions** — Discover charities, view full history
- [ ] **Empty state** — Encouraging CTA if no donations yet
- [ ] **Onboarding prompt** — Complete profile if onboarding_completed = false

### Donation History (`/history`)
Full paginated list of all donations.

- [ ] **Table/list view** — Date, Charity, Amount, Type columns
- [ ] **Sorting** — By date (default newest), amount
- [ ] **Filtering** — All, one-time only, monthly only
- [ ] **Recurring grouping** — Option to group monthly donations by charity
- [ ] **Pagination** — Load more or infinite scroll
- [ ] **Export CSV** — Download history (stretch goal)
- [ ] **Manage recurring link** — "Manage on Every.org" external link
- [ ] **Empty state** — CTA to discover charities

---

## GraphQL Schema Additions

```graphql
type Donation {
  id: ID!
  charity: Charity!
  amount: Int!          # cents
  frequency: String!    # 'one-time' | 'monthly'
  donationDate: String!
  createdAt: String!
}

type DonationStats {
  totalDonated: Int!
  charitiesSupported: Int!
  activeRecurring: Int!
}

type Query {
  myDonations(limit: Int, offset: Int, frequency: String): [Donation!]!
  donationStats(year: Int): DonationStats!
}
```

---

## Database

Donations stored in `donation_intents` table (created in `12-Integrate-Donations.md`):

| Column | Type | Notes |
|--------|------|-------|
| id | SERIAL | Primary key |
| user_id | INTEGER | FK to users |
| charity_id | INTEGER | FK to charities |
| charge_id | VARCHAR | Unique ID from Every.org |
| amount | INTEGER | Cents |
| frequency | VARCHAR | 'one-time' or 'monthly' |
| donation_date | TIMESTAMP | When charge occurred |
| created_at | TIMESTAMP | When we received webhook |

---

## Design Notes

**Yellow pages** — These get full UI treatment once we have real data.

**Recurring status logic:**
- Active = last charge within 35 days
- Inactive = no charge for 35+ days
- Never show "Cancelled" — Every.org doesn't notify us

**Empty states matter** — New users will see empty dashboard/history. Make it encouraging, not sad.

---

## Verification

- [ ] DonateButton opens Every.org modal with correct charity
- [ ] Completing donation redirects to success page with correct params
- [ ] Success page displays personalized confirmation
- [ ] Dashboard shows accurate stats after webhook received
- [ ] Recent donations list updates with new donations
- [ ] History table displays all donations correctly
- [ ] Recurring badges show correct active/inactive status
- [ ] Empty states display correctly for new users
- [ ] Unauthenticated success page prompts account creation
