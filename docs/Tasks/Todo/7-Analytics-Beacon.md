## Phase 7: Analytics with Beacon

**Goal:** Track user events and visualize app usage using Deloitte's Beacon library.

---

### Backend Setup

- [ ] **Migration 006**: Create `analytics_events` table
  - `id`, `event_name`, `event_data` (JSONB), `page_url`, `referrer`, `user_agent`, `session_id`, `user_id`, `created_at`
  - Indexes on `event_name`, `created_at`, `session_id`

- [ ] **Create `backend/src/routes/analytics.ts`**: POST `/api/events` endpoint
  - Receives Beacon payloads
  - Validates event structure
  - Inserts into `analytics_events` table

- [ ] **Update `backend/src/index.ts`**: Mount analytics routes
  - `app.use('/api', analyticsRoutes)`

- [ ] **Add CORS config**: Ensure frontend can POST to `/api/events`

---

### Frontend Setup

- [ ] **Add Beacon script**: Load `beacon.js` in `index.html` or via npm
  - Configure `data-api-root` to point to backend `/api/events`

- [ ] **Create `frontend/src/utils/analytics.ts`**: Helper functions
  - `trackEvent(name, data)` wrapper
  - Type definitions for event names

- [ ] **Add tracking to key interactions**:
  - [ ] Page views (route changes)
  - [ ] Charity card clicks
  - [ ] Donate button clicks
  - [ ] Search queries
  - [ ] Filter/tag selections
  - [ ] Sign-in start/complete
  - [ ] Donation complete (from Every.org callback)

---

### Dashboard (Basic Visualization)

- [ ] **Create `backend/src/resolvers/analytics.ts`**: GraphQL queries
  - `eventCounts(startDate, endDate)`: Count by event type
  - `dailyEvents(startDate, endDate)`: Events grouped by day
  - `topPages(limit)`: Most viewed pages
  - `recentEvents(limit)`: Latest events for debugging

- [ ] **Update `typeDefs.ts`**: Add analytics types
  ```graphql
  type EventCount {
    eventName: String!
    count: Int!
  }

  type DailyEventCount {
    date: String!
    count: Int!
  }

  type Query {
    eventCounts(startDate: String, endDate: String): [EventCount!]!
    dailyEvents(startDate: String, endDate: String): [DailyEventCount!]!
  }
  ```

- [ ] **Create `frontend/src/pages/AnalyticsDashboard.tsx`**:
  - Line chart: Events over time
  - Bar chart: Events by type
  - Table: Recent events

- [ ] **Install chart library**: `npm install recharts` (or Chart.js)

---

### Events to Track

| Event Name | When | Data |
|------------|------|------|
| `page_view` | Route change | `{ page, charityId? }` |
| `charity_click` | Click charity card | `{ charityId, charityName }` |
| `donate_click` | Click donate button | `{ charityId, charityName }` |
| `donate_complete` | Every.org success callback | `{ charityId, amount }` |
| `search` | Submit search | `{ query, resultsCount }` |
| `filter_tag` | Select tag filter | `{ tag }` |
| `sign_in_start` | Begin sign-in flow | `{}` |
| `sign_in_complete` | Successfully signed in | `{ userId }` |

---

### Verification

- [ ] Beacon script loads without errors
- [ ] Events POST to `/api/events` successfully
- [ ] Events appear in `analytics_events` table
- [ ] GraphQL queries return aggregated data
- [ ] Dashboard displays charts correctly
- [ ] No PII leaked in event data

---

### Future Enhancements (Post-MVP)

- [ ] Session stitching (track user journeys)
- [ ] Funnel visualization (search → view → donate)
- [ ] Retention cohorts
- [ ] Real-time event stream
- [ ] Export to CSV
- [ ] Admin-only access to dashboard

---

### Resources

- [Beacon GitHub](https://github.com/Deloitte/beacon)
- [Beacon Documentation](https://deloitte.github.io/beacon/)
- [Recharts](https://recharts.org/) (charting library)
