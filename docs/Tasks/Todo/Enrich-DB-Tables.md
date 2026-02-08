## Enrich Database Tables

Future migrations to add fields that were deferred from MVP.

---

### Charities Table Enhancements

| Field | Type | Purpose | Priority |
|-------|------|---------|----------|
| `slug` | VARCHAR(255) UNIQUE NOT NULL | URL-friendly identifier (e.g., `/charity/denver-animal-shelter`) | Medium |
| `mission` | TEXT | Short mission statement, separate from longer description | Low |
| `trust_summary` | TEXT | Human-readable explanation of why this charity is trustworthy | Low |
| `founded_year` | INTEGER | When the charity was established | Low |
| `is_active` | BOOLEAN DEFAULT TRUE | Soft delete / hide inactive charities | Medium |

**Example migration:**

```sql
-- Up Migration
ALTER TABLE charities ADD COLUMN slug VARCHAR(255) UNIQUE;
ALTER TABLE charities ADD COLUMN mission TEXT;
ALTER TABLE charities ADD COLUMN trust_summary TEXT;
ALTER TABLE charities ADD COLUMN founded_year INTEGER;
ALTER TABLE charities ADD COLUMN is_active BOOLEAN DEFAULT TRUE;

---- Down Migration
ALTER TABLE charities DROP COLUMN is_active;
ALTER TABLE charities DROP COLUMN founded_year;
ALTER TABLE charities DROP COLUMN trust_summary;
ALTER TABLE charities DROP COLUMN mission;
ALTER TABLE charities DROP COLUMN slug;
```

---

### Additional Indexes

| Index | Purpose |
|-------|---------|
| `idx_charities_ein` | Fast lookup when matching Every.org webhook data |
| `idx_charities_every_org_slug` | Fast lookup for donate button |
| `idx_donation_intents_charge_id` | Fast deduplication check on webhook |

**Example migration:**

```sql
-- Up Migration
CREATE INDEX idx_charities_ein ON charities(ein);
CREATE INDEX idx_charities_every_org_slug ON charities(every_org_slug);
CREATE INDEX idx_donation_intents_charge_id ON donation_intents(charge_id);

---- Down Migration
DROP INDEX IF EXISTS idx_donation_intents_charge_id;
DROP INDEX IF EXISTS idx_charities_every_org_slug;
DROP INDEX IF EXISTS idx_charities_ein;
```

---

### Future: Location Data (for Maps)

If/when we add map features:

| Field | Type | Purpose |
|-------|------|---------|
| `latitude` | DECIMAL(10,8) | GPS coordinate |
| `longitude` | DECIMAL(11,8) | GPS coordinate |
| `neighborhood` | VARCHAR(100) | Denver neighborhood name |
| `address` | TEXT | Full street address |

---

### Notes

- These are "nice to have" fields that didn't block MVP
- Add them as needed when building specific features
- Each enhancement should be its own migration file
