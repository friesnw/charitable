## Phase 2: Charity Seed Data & Schema Enrichment

### Schema Enrichment Migration

Add columns to `charities`:

| Field | Type | Purpose |
|-------|------|---------|
| `slug` | VARCHAR(255) UNIQUE NOT NULL | Our own URL-friendly identifier (e.g., `denver-rescue-mission`) |
| `mission` | TEXT | Short mission statement, separate from longer description |
| `founded_year` | INTEGER | When the charity was established |
| `volunteer_url` | VARCHAR(500) | Link to volunteer signup page |
| `verified` | BOOLEAN DEFAULT FALSE | Internal tracking only — not exposed via GraphQL |
| `every_org_claimed` | BOOLEAN DEFAULT FALSE | Whether the charity has claimed their Every.org profile |
| `is_active` | BOOLEAN DEFAULT TRUE | Soft delete / hide inactive charities |

---

### Charity Locations Table (new)

Charities can have **multiple locations**. Each location has its own label and address, but maps back to one parent charity (one slug, one EIN, one donation page).

```sql
CREATE TABLE charity_locations (
  id SERIAL PRIMARY KEY,
  charity_id INTEGER REFERENCES charities(id) ON DELETE CASCADE NOT NULL,
  label VARCHAR(255) NOT NULL,        -- e.g. "Main Office", "Downtown Shelter"
  description TEXT,                    -- optional longer description of this location
  address TEXT,
  latitude DECIMAL(10,8),             -- nullable; locations without coords won't show on map
  longitude DECIMAL(11,8),            -- nullable
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

### Additional Indexes

| Index | Purpose |
|-------|---------|
| `idx_charities_slug` | Fast lookup for URL routing |
| `idx_charities_ein` | Fast lookup when matching Every.org webhook data |
| `idx_charities_every_org_slug` | Fast lookup for donate button |
| `idx_charity_locations_charity` | Fast join from charity to locations |
| `idx_donation_intents_charge_id` | Fast deduplication check on webhook |

---

### Seed Data

- [ ] **Seed ~13 Denver charities** with all fields: name, description, EIN, Every.org slug, slug, cause tags, mission, founded year, volunteer URL, every_org_claimed, is_active
- [ ] **Seed charity_locations** — at least one location per charity with label and address; lat/lng optional (locations missing coordinates won't display on maps)
- [ ] **Update GraphQL schema** to expose new fields on `Charity` type and add `CharityLocation` type
- [ ] **Update resolvers** to return new fields + locations
- [ ] **Verify**: `charities` query returns data, search/filter works, `charity(slug)` returns detail with locations

---

### Decisions

- `slug` is our own routing identifier; `every_org_slug` is kept separately for the Every.org donation widget (which requires their slug, not EIN)
- `verified` is internal-only — not exposed in the GraphQL API
- `trust_summary` dropped — `mission` is sufficient for now
- Location data lives in `charity_locations`, not on the charity row (one-to-many)
- `neighborhood` is deferred to [8-Maps-Integration](./8-Maps-Integration.md) — will be derived from lat/lng + Denver boundary GeoJSON, not stored
