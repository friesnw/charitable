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

### Data Export (Simple Tables)

*No fancy visualizations needed — just export tables to Excel for analysis.*

- [ ] **Create `backend/src/resolvers/analytics.ts`**: GraphQL queries
  - `eventCounts(startDate, endDate)`: Count by event type
  - `dailyEvents(startDate, endDate)`: Events grouped by day
  - `funnelReport(startDate, endDate)`: Conversion funnel metrics
  - `recentEvents(limit)`: Latest events for debugging

- [ ] **Update `typeDefs.ts`**: Add analytics types
  ```graphql
  type EventCount {
    eventName: String!
    count: Int!
  }

  type FunnelStep {
    step: String!
    uniqueUsers: Int!
    dropoff: Float
  }

  type Query {
    eventCounts(startDate: String, endDate: String): [EventCount!]!
    funnelReport(startDate: String, endDate: String): [FunnelStep!]!
    recentEvents(limit: Int): [AnalyticsEvent!]!
  }
  ```

- [ ] **Create simple admin page** with:
  - Table view of events (sortable, filterable)
  - "Export to CSV" button for Excel import
  - Date range picker

- [ ] **Add CSV export endpoint**: `GET /api/analytics/export?start=&end=`
  - Returns CSV file of filtered events
  - Columns: timestamp, event_name, event_data, session_id, user_id

---

### Events to Track

**Core MVP Measurement Events** (from `/docs/Product/MVP Measurement Plan.md`):

| Event Name | When | Data | Measurement Goal |
|------------|------|------|------------------|
| `page_view` | Route change | `{ page: 'home' \| 'charity' \| ... }` | Funnel step 1 & 2 |
| `charity_view` | View charity detail page | `{ charityId, charityName }` | Funnel step 2 |
| `donate_click` | Click "Donate" button | `{ charityId, charityName }` | Giving types |
| `volunteer_click` | Click "Volunteer" button | `{ charityId, charityName }` | Giving types |
| `donate_complete` | Every.org webhook received | `{ charityId, amount, frequency }` | Funnel step 3, Donation types |
| `account_created` | User completes signup | `{ userId }` | Funnel step 4 |
| `search` | Submit search | `{ query, resultsCount }` | Discovery behavior |
| `filter_tag` | Select tag filter | `{ tag }` | Discovery behavior |

**Frequency values for `donate_complete`:**
- `"one-time"` — single donation
- `"monthly"` — recurring (only count when `isInitial: true` to avoid double-counting)

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
