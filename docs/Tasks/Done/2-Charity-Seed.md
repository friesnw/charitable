## Phase 2: Charity Seed Data & Schema Enrichment

### Migration 007: Enrich charities table + create charity_locations + indexes

Schema-only migration (data imported separately via CSV script):
1. Adds new columns to `charities`
2. Creates `charity_locations` table
3. Adds indexes

#### New charities columns

| Field | Type | Purpose |
|-------|------|---------|
| `slug` | VARCHAR(255) UNIQUE | Our own URL-friendly identifier (e.g., `denver-rescue-mission`) |
| `founded_year` | INTEGER | When the charity was established |
| `volunteer_url` | VARCHAR(500) | Link to volunteer signup page |
| `every_org_claimed` | BOOLEAN DEFAULT FALSE | Whether the charity has claimed their Every.org profile |
| `is_active` | BOOLEAN DEFAULT TRUE | Soft delete / hide inactive charities |
| `primary_address` | TEXT | Primary charity address |

#### Charity locations table

```sql
CREATE TABLE charity_locations (
  id SERIAL PRIMARY KEY,
  charity_id INTEGER REFERENCES charities(id) ON DELETE CASCADE NOT NULL,
  label VARCHAR(255) NOT NULL,
  description TEXT,
  address TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

> Note: `latitude` and `longitude` columns deferred to [8-Maps-Integration](./8-Maps-Integration.md)

#### Indexes

| Index | Purpose |
|-------|---------|
| `idx_charities_slug` | Fast lookup for URL routing |
| `idx_charities_ein` | Fast lookup when matching Every.org webhook data |
| `idx_charities_every_org_slug` | Fast lookup for donate button |
| `idx_charity_locations_charity` | Fast join from charity to locations |
| `idx_donation_intents_charge_id` | Fast deduplication check on webhook |

---

### CSV Import Script

**Script:** `backend/scripts/import-charities.ts`
**Data source:** Google Sheet exported as CSV
- Charities CSV → replaces all rows in `charities` table
- Locations CSV → inserts into `charity_locations`, linked by slug

Run: `DATABASE_URL="postgresql://localhost:5432/app_db" npx tsx scripts/import-charities.ts`

---

### GraphQL + Resolver Updates

- [x] Update `Charity` type with new fields: `slug`, `foundedYear`, `volunteerUrl`, `everyOrgClaimed`, `isActive`, `primaryAddress`, `locations`
- [x] Add `CharityLocation` type: `id`, `label`, `description`, `address`
- [x] Update `charity` query to support lookup by `slug` (in addition to `id`)
- [x] Update `toCharity()` helper in resolver with new field mappings
- [x] Add `Charity.locations` field resolver (joins `charity_locations` by `charity_id`)
- [x] Register `Charity` type resolver in `resolvers/index.ts`

---

### Tasks

- [x] Write `backend/migrations/007_enrich_and_seed.sql` (schema-only: ALTER + CREATE TABLE + indexes)
- [x] Write `backend/scripts/import-charities.ts` (CSV import)
- [x] Update `backend/src/schema/typeDefs.ts`
- [x] Update `backend/src/resolvers/charities.ts`
- [x] Run migration
- [x] Run CSV import (5 charities, 17 locations)
- [ ] Verify: `charities` query returns enriched fields
- [ ] Verify: `charity(slug: "denver-rescue-mission")` returns detail with locations
- [ ] Verify: search/filter still works

---

### Decisions

- `slug` is our own routing identifier; `every_org_slug` is kept separately for the Every.org donation widget
- `mission` and `verified` removed from schema for now
- `primary_address` on charities table for the main/HQ address; `charity_locations` for additional locations
- `latitude`/`longitude` deferred to maps integration
- `neighborhood` deferred to [8-Maps-Integration](./8-Maps-Integration.md) — derived from coordinates + boundary data
- Schema migration is separate from data — CSV import script handles data population
- Import script deletes all existing charities before inserting (full replace)
