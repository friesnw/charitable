# Preferences / Onboarding

## Zip Code Selection + Map Starting Coordinates

Replace the current Denver/Other radio buttons in Preferences with a zip code input.
When a user enters a zip, the app looks it up and displays the derived city + neighborhood
as a confirmation. Non-pilot-city zips show a static note that the pilot is Denver-only.
The selected zip also dictates the map's initial starting coordinates on the Charities page.

---

## Architecture Decision: Zip Lookup Strategy

Three options were considered. **Option 3 was chosen.**

### Option 1 — Static constants file (not chosen for production)
A single `denverZips.ts` (or per-city equivalents) hardcoded in the frontend.

```typescript
// frontend/src/constants/denverZips.ts
export const DENVER_ZIPS: Record<string, {
  neighborhood: string; city: string;
  longitude: number; latitude: number; zoom: number;
}> = {
  '80202': { neighborhood: 'LoDo / Downtown', city: 'Denver', longitude: -104.9998, latitude: 39.7527, zoom: 14 },
  '80205': { neighborhood: 'Five Points / Cole', city: 'Denver', longitude: -104.9757, latitude: 39.7566, zoom: 14 },
  // ... ~20 Denver zips
};
```

**Why we didn't choose it:**
- Doesn't scale — US has ~42k zip codes; per-city files become unmanageable
- Neighborhood mappings require manual research and ongoing maintenance per city
- Bundle size grows with every new city added
- Any zip outside the hardcoded list returns nothing (no city/state fallback)

**When to revisit:**
- If the app stays permanently Denver-only and we want zero-latency, zero-infrastructure lookup
- As a cache layer in front of the DB for the small set of pilot city zips (neighborhood enrichment only)
- For a fully offline/PWA version where no network calls are acceptable

---

### Option 2 — Third-party geocoding API (not chosen)
Call Google Maps, Mapbox, or Zippopotam.us on each zip input.

**Why we didn't choose it:**
- Network latency on every keystroke (or on blur/submit)
- Costs money at scale; adds API key management complexity
- No neighborhood-level data without premium tiers
- External dependency and rate limit risk

**When to revisit:**
- If we need international zip/postal code support
- If we want address-level geocoding (not just zip centroid)

---

### Option 3 — DB zip table + backend neighborhood config ✅ Chosen

Import all ~42k US zip codes into a `zip_codes` table (one-time, free data from
[simplemaps.com](https://simplemaps.com/data/us-zips) or Census Bureau). Maintain a small
`CITY_NEIGHBORHOODS` config on the backend (or a lean constants file) only for **pilot cities**,
mapping zip → neighborhood name. The GraphQL resolver does one indexed DB lookup, then enriches
with a neighborhood if the city is supported.

**Data flow:**
```
zip input → resolveZip(zip) GQL query
          → backend: SELECT city, state, lat, lng FROM zip_codes WHERE zip = $1
          → backend: enriches with CITY_NEIGHBORHOODS[zip] if available
          → returns { city, state, latitude, longitude, neighborhood? }
```

**Why this works:**
- Single indexed lookup on a 42k-row table is ~1ms
- Raw geo data lives in DB (maintained once); neighborhood UX lives in code (product decision)
- Adding a new city = add rows to `CITY_NEIGHBORHOODS` config, no schema changes
- Zips outside pilot cities still return city + state + coords — graceful fallback
- Bundle size unaffected regardless of coverage

---

## Changes Required

### 1. Data import — `zip_codes` table
One-time setup: download free US zip code CSV (simplemaps or Census), import into Postgres.

```sql
-- Migration: 012_create_zip_codes.sql
CREATE TABLE zip_codes (
  zip       VARCHAR(10) PRIMARY KEY,
  city      VARCHAR(100) NOT NULL,
  state     VARCHAR(2)   NOT NULL,
  latitude  DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL
);
-- Then: COPY zip_codes FROM '/path/to/uszips.csv' CSV HEADER;
-- Or use a seed script
```

### 2. Backend — neighborhood config
Small config (backend constants or a JSON file) for pilot cities only:

```typescript
// backend/src/config/cityNeighborhoods.ts
export const CITY_NEIGHBORHOODS: Record<string, { neighborhood: string; zoom: number }> = {
  '80202': { neighborhood: 'LoDo / Downtown',            zoom: 14 },
  '80203': { neighborhood: 'Capitol Hill / Uptown',      zoom: 14 },
  '80204': { neighborhood: 'West Colfax / Lincoln Park', zoom: 14 },
  '80205': { neighborhood: 'Five Points / Cole',         zoom: 14 },
  '80206': { neighborhood: 'Congress Park / Cherry Creek', zoom: 14 },
  '80207': { neighborhood: 'Park Hill',                  zoom: 14 },
  '80209': { neighborhood: 'Washington Park / Baker',    zoom: 14 },
  '80210': { neighborhood: 'Wash Park West / University', zoom: 14 },
  '80211': { neighborhood: 'Sunnyside / Highland',       zoom: 14 },
  '80212': { neighborhood: 'Berkeley / Tennyson',        zoom: 14 },
  '80216': { neighborhood: 'RiNo / Globeville',          zoom: 14 },
  '80218': { neighborhood: 'Cheesman Park',              zoom: 14 },
  '80219': { neighborhood: 'Barnum / Harvey Park',       zoom: 14 },
  '80220': { neighborhood: 'Montclair / Hale',           zoom: 14 },
  '80222': { neighborhood: 'Virginia Village',           zoom: 14 },
  '80223': { neighborhood: 'Baker / Overland',           zoom: 14 },
  '80230': { neighborhood: 'Lowry',                      zoom: 13 },
  '80238': { neighborhood: 'Central Park',               zoom: 13 },
  '80239': { neighborhood: 'Montbello',                  zoom: 13 },
  '80246': { neighborhood: 'Hilltop',                    zoom: 14 },
};
```

### 3. Backend — `backend/src/schema/typeDefs.ts`
Add a `resolveZip` query and update `UserPreferences`:

```graphql
type ZipInfo {
  zip: String!
  city: String!
  state: String!
  latitude: Float!
  longitude: Float!
  neighborhood: String   # null if outside a pilot city
  zoom: Int
  isPilotCity: Boolean!
}

type UserPreferences {
  location: String
  zipCode: String          # add
  onboardingCompleted: Boolean!
}

type Query {
  resolveZip(zip: String!): ZipInfo   # null if zip not found
}

type Mutation {
  savePreferences(location: String!, zipCode: String): UserPreferences!
}
```

### 4. Backend — resolver for `resolveZip`
```typescript
resolveZip: async (_, { zip }, { db }) => {
  const row = await db.oneOrNone('SELECT * FROM zip_codes WHERE zip = $1', [zip]);
  if (!row) return null;
  const neighborhood = CITY_NEIGHBORHOODS[zip] ?? null;
  return {
    zip,
    city: row.city,
    state: row.state,
    latitude: row.latitude,
    longitude: row.longitude,
    neighborhood: neighborhood?.neighborhood ?? null,
    zoom: neighborhood?.zoom ?? 12,
    isPilotCity: !!neighborhood,
  };
}
```

### 5. Backend — `backend/src/resolvers/preferences.ts`
- Update `toPreferences()`: add `zipCode: row.zip_code ?? null`
- Update `savePreferences` resolver to accept and persist `zipCode`

### 6. Database migration — `013_add_zip_code_to_user_preferences.sql`
```sql
ALTER TABLE user_preferences ADD COLUMN zip_code VARCHAR(10);
```

### 7. Frontend — `frontend/src/pages/Preferences.tsx`
- Remove location radio buttons
- Add `zipCode` state (`string`)
- On zip input change (when length === 5): call `resolveZip` query
- Show result below input:
  - **Pilot city zip**: `"Denver, CO · Five Points / Cole"`
  - **Valid but non-pilot zip**: `"This pilot currently covers Denver, CO only. We hope to expand soon!"`
  - **Not found / < 5 digits**: nothing
- On save: persist `zipCode`; derive `location` from `isPilotCity` (`'denver'` vs `'other'`)

### 8. Frontend — `frontend/src/pages/Charities.tsx`
- Query `myPreferences` for `zipCode`
- Call `resolveZip` with saved zip to get coords
- Pass `initialCenter` to `<CharityMap>`; fall back to `DENVER_CENTER` if no zip or zip not found

### 9. Frontend — `frontend/src/components/CharityMap.tsx`
- Add optional prop `initialCenter?: { longitude: number; latitude: number; zoom: number }`
- Use in `initialViewState`, falling back to `DENVER_CENTER` + `DEFAULT_ZOOM`

---

## Files to Change
| File | Change |
|------|--------|
| `backend/migrations/012_create_zip_codes.sql` | **New** — zip_codes table |
| `backend/migrations/013_add_zip_code_to_user_preferences.sql` | **New** — zip_code column on user_preferences |
| `backend/src/config/cityNeighborhoods.ts` | **New** — pilot city neighborhood config |
| `backend/src/schema/typeDefs.ts` | Add `ZipInfo` type, `resolveZip` query, `zipCode` field/arg |
| `backend/src/resolvers/preferences.ts` | Handle `zipCode` in query + mutation |
| `backend/src/resolvers/zip.ts` | **New** — `resolveZip` resolver |
| `frontend/src/pages/Preferences.tsx` | Replace radios with zip input + live confirmation |
| `frontend/src/pages/Charities.tsx` | Query preferences + resolveZip, pass `initialCenter` |
| `frontend/src/components/CharityMap.tsx` | Accept + use `initialCenter` prop |

---

## Verification
1. `npm run dev` at root
2. Go to `/preferences` → zip input appears
3. Type `80205` → "Denver, CO · Five Points / Cole" appears below
4. Type `80903` (Colorado Springs) → pilot message appears
5. Type `99999` (invalid) → nothing shown, save disabled
6. Save a Denver zip → reload → input shows saved zip, confirmation renders
7. Go to `/charities` → map starts centered on saved zip's neighborhood
8. No zip saved → map falls back to default Denver center
