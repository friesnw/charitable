# Analytics Tracking Checklist

Use this to manually verify each event is firing and appearing in the `analytics_events` table.

**How to verify:** After each action, run:
```sql
SELECT event_name, event_data, page_url, created_at
FROM analytics_events
ORDER BY created_at DESC
LIMIT 5;
```

---

## Frontend Events

### `page_view`
- **Fired by:** `PageShell.tsx` on every route change
- **Data:** `{ page: '/map' }` (pathname)
- **How to test:** Navigate between any two pages
- **Edge cases:**
  - [x] Refreshing a page fires exactly ONE event (not two — StrictMode double-invoke is guarded by ref)
  - [x] Navigating `/map` → `/list` → `/map` fires a `page_view` each time
  - [x] Navigating to the same page you're already on does NOT fire again
- [x] Verified

---

### `charity_view`
- **Fired by:** `CharityDetail.tsx` (page) when charity data loads
- **Data:** `{ charityId, charityName }`
- **How to test:** Open any charity detail page
- **Edge cases:**
  - [x] Refreshing a charity page fires exactly ONE event (StrictMode guard active)
  - [x] Navigating from one charity to another fires a new event for the second charity only
  - [x] Hitting back and reopening the same charity fires again (new page mount)
- [x] Verified

---

### `donate_click`
- **Fired by:** `CharityDetail.tsx` (component) — sticky Donate button
- **Data:** `{ charityId, charityName }`
- **How to test:** Open a charity page → click the Donate button in the bottom bar
- [x] Verified

---

### `volunteer_click`
- **Fired by:** `CharityDetail.tsx` (component) — sticky Volunteer / CTA button
- **Data:** `{ charityId, charityName }`
- **How to test:** Open a charity page that has a volunteer URL → click the Volunteer button in the bottom bar
- [x] Verified

---

### `website_click`
- **Fired by:** `CharityDetail.tsx` (component) — two locations:
  1. Inline link inside the "About this organization" section
  2. Standalone website link below the location map
- **Data:** `{ charityId, charityName }`
- **How to test:** Open a charity page → click either website link
- [x] Verified (About section link)
- [x] Verified (standalone link)

---

### `map_pin_click`
- **Fired by:** `Charities.tsx` — individual map pin Marker `onClick` (not cluster pins)
- **Data:** `{ charityId, charityName }`
- **How to test:** Go to `/map` → click a single charity pin (not a cluster)
- **Edge cases:**
  - [x] Clicking a cluster pin does NOT fire this event (clusters expand zoom only)
  - [x] Clicking the same pin a second time (to deselect) does NOT fire again
- [x] Verified

---

### `filter_tag`
- **Fired by:** `CauseFilterBar.tsx` — used on both `/map` and `/list` — only when selecting, not deselecting
- **Data:** `{ tag }` e.g. `{ tag: 'food-security' }`
- **How to test:**
  - Go to `/map` → click a cause tag pill to activate it
  - Go to `/list` → click a cause tag pill to activate it
- **Edge cases:**
  - [x] Clicking an already-active tag (deselecting) does NOT fire
  - [x] Clicking "All" to clear tags does NOT fire
- [x] Verified (`/map`)
- [x] Verified (`/list`)

---

### `onboarding_cause_select`
- **Fired by:** `Causes.tsx` — the first-time cause picker at `/causes` — only when selecting, not deselecting
- **Data:** `{ tag }` e.g. `{ tag: 'food-security' }`
- **Note:** Tracked separately from `filter_tag` — this is onboarding intent, not a filter action
- **How to test:** Go to `/causes` → click a cause card to select it
- **Edge cases:**
  - [x] Selecting multiple causes fires one event per cause (not one combined event)
  - [x] Deselecting a cause does NOT fire
  - [x] Clicking "Browse all organizations →" (skip) does NOT fire
- [x] Verified

---

### `neighborhood_select`
- **Fired by:** Four places:
  1. `Home.tsx` — neighborhood pills on the home page
  2. `Charities.tsx` `handleNeighborhoodSelect` — map sidebar neighborhood picker
  3. `Charities.tsx` `handleSidebarNeighborhoodSelect` — changing neighborhood from the map sidebar
  4. `Preferences.tsx` — neighborhood saved from the account preferences page
- **Data:** `{ neighborhood }` e.g. `{ neighborhood: 'Capitol Hill' }`
- **How to test:**
  - Go to `/` → click a neighborhood pill
  - On `/map` → open the sidebar location editor → select a neighborhood
  - Go to `/preferences` → set a neighborhood → save
- **Edge cases:**
  - [x] Selecting the same neighborhood you're already on still fires (intentional re-selection)
  - [x] Picking from the autocomplete dropdown (not just typing) fires the event
- [x] Verified (home page pill)
- [x] Verified (sidebar change)
- [ ] Verified (preferences page)

---

### `zip_select`
- **Fired by:** Two places:
  1. `Charities.tsx` — ZIP entry in the sidebar location editor
  2. `Preferences.tsx` — ZIP saved from the account preferences page
- **Data:** `{ zip }` e.g. `{ zip: '80203' }`
- **How to test:**
  - On `/map` → click the location row to open the editor → type a ZIP → submit
  - Go to `/preferences` → enter a ZIP → save
- **Edge cases:**
  - [ ] An invalid ZIP (one that fails to resolve) still fires the event (the track fires before the resolve)
  - [ ] Submitting the same ZIP twice fires twice
- [ ] Verified

---

### `sign_in_start`
- **Fired by:** `Login.tsx` — on form submit, before the magic link request
- **Data:** _(none — no PII)_
- **How to test:** Go to `/login` → enter any email → click "Send magic link"
- **Edge cases:**
  - [ ] Submitting an invalid email format does NOT fire (blocked by browser form validation before JS runs)
  - [ ] Confirm no email address appears in `event_data`
- [ ] Verified

---

## Backend Events

These are inserted directly into `analytics_events` from the backend resolver, not via the frontend `trackEvent()` helper.

### `sign_in_complete`
- **Fired by:** `resolvers/auth.ts` — `verifyMagicLink` mutation, for all users (new and returning)
- **Data:** `{ userId }`
- **How to test:** Click a magic link in your email and complete sign-in
- **Edge cases:**
  - [ ] A returning user signing in fires `sign_in_complete` but NOT `account_created`
  - [ ] Both events appear in the DB within the same second
- [ ] Verified

---

### `account_created`
- **Fired by:** `resolvers/auth.ts` — `verifyMagicLink` mutation, only when a new user row is created
- **Data:** `{ userId }`
- **How to test:** Sign in with an email that has never been used before
- **Edge cases:**
  - [ ] A new user gets both `sign_in_complete` AND `account_created` in the same session
  - [ ] A returning user gets only `sign_in_complete`
- [ ] Verified

---

## Spot-Check Queries

**All events, most recent first:**
```sql
SELECT event_name, event_data, page_url, created_at
FROM analytics_events
ORDER BY created_at DESC
LIMIT 20;
```

**Count by event type:**
```sql
SELECT event_name, COUNT(*) AS count
FROM analytics_events
GROUP BY event_name
ORDER BY count DESC;
```

**Cause tag popularity (filter + onboarding combined):**
```sql
SELECT event_data->>'tag' AS tag, COUNT(*) AS selections
FROM analytics_events
WHERE event_name IN ('filter_tag', 'onboarding_cause_select')
GROUP BY tag
ORDER BY selections DESC;
```

**Confirm no PII in event_data:**
```sql
SELECT event_name, event_data
FROM analytics_events
WHERE event_data::text ILIKE '%@%';
```
_Should return 0 rows._
