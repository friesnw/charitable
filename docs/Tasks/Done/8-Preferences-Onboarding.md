# Flow with questions

### Flow A - Authenticated User
1. User creates new account
2. User sees page: Enter your home zip code
	1. IF ZIP IS WITHIN DENVER REGION
		1. Once entered, page displays Neighborhood value based on system logic
		2. User is able to see the neighborhood populated, and if desired, they can type over the value to change it. This covers situations in which the neighborhood does not match accurately, and will result in us storing this value in their preferences.
	2. IF ZIP IS NOT WITHIN DENVER REGION
		1. The user will see a static note that the pilot is Denver-only  
		2. They will be prompted to enter their neighborhood regardless, even though it was not system populated (optional field)
	3. User hits save
	4. System updates user preferences:  
		1. Zip
		2. Neighborhood
	5. User lands on maps page (/charities and /explore, although we will eventually condense to one)
		1. IF ZIP IS WITHIN DENVER REGION
			1. Maps pre-populates home zip
			2. User is able to see their zip displayed in a search, that they can adjust  
		2. IF ZIP IS NOT WITHIN DENVER REGION
			1. The user is defaulted to Denver, the same load state that exists for users today.


Claude questions for Flow A:
- Does this flow make sense? Are there clear gaps or flaws in UX?
- What architecture might support this best? Our current approach to handle Charity Location Neighborhood display takes the nearest neighborhood to the location's lat long. Is this approach scalable to this situation? Or would it be worth looking at another solution to handle both situations: 1) Charity Location Neighborhood display and 2) User Onboarding Preferences.
	- For example, should we just be maintaining a table of all zips within the city region, and assigning a neighborhood to each zip?
	- For step 2, when determining if a user has a zip in denver, we don't want to mis-message zips that are near denver, like Littleton. How should we handle this?
- For step 2.2, should we still have them populate a neighborhood, even if their zip is in NY?
- Currently, the user is prompted to give access to their location when loading the maps page. is this the better experience, given people are often traveling and the pilot is only in denver? or is it better to collect home zip info more explicitly? I think probably home zip info. If agreed, we should remove this logic.
- Step 5.1.2 calls for searching based on ZIP. is this currently supported by MapBox? will it cost more $?

---

**Claude answers for Flow A:**

**Does the flow make sense? Gaps/flaws?**
The flow is solid. A few gaps worth addressing:
- **Is onboarding skippable?** No — this step is part of account creation, not a browsing gate. Unauthenticated users who just want to browse never hit this flow (they get the default Denver view per Flow B). The zip step is a required part of signing up.
- **Existing users without preferences** — Flow A as written only covers new accounts. Existing authenticated users who never went through this should also land here the first time, not just on new signup. The `onboardingCompleted` boolean in `UserPreferences` (already in the schema plan) handles this — on login, check this flag and redirect to onboarding if false.
- **Step 2.2 neighborhood field** — See separate answer below; collect as optional free-text for all zips.

**Architecture for zip-to-neighborhood:**
The architecture is already decided (see "Option 3 — DB zip table + backend neighborhood config" below). This supersedes the lat/long nearest-neighborhood approach for user preferences. The two concerns raised here are already solved:
- *Is a zip-table approach scalable?* Yes — the chosen architecture (DB `zip_codes` table + `CITY_NEIGHBORHOODS` backend config) handles both charity location display and user onboarding from a single `resolveZip` query. No need for per-city static files.
- *Mis-messaging near-Denver zips (Littleton, Aurora, etc.)?* Solved cleanly. Any Littleton or Englewood zip will return `supportedCity: null` with the correct `city: "Littleton"` from the `zip_codes` table — so the "pilot is Denver-only" message is shown without false positives. No special exclusion list needed.
- *`isPilotCity` naming:* **Replaced with `supportedCity: String | null`.** Rather than a boolean, `resolveZip` returns the city slug (e.g. `"denver"`) if the zip maps to a supported city, or `null` if not. This scales naturally to new cities — adding Chicago just means Chicago zips return `"chicago"`. The frontend branches on `supportedCity !== null` rather than a hardcoded boolean. The backend config is renamed from `CITY_NEIGHBORHOODS` to `SUPPORTED_CITIES`, keyed by city slug, with zip entries nested under each city.
- *User-overriding a system-populated neighborhood:* Correct — if the user types over the system-suggested neighborhood, we store their value in `user_preferences` only. The `zip_codes` table and `SUPPORTED_CITIES` config are never modified by user input. The user's custom value lives solely in their preferences row.

**Step 2.2 — Should we collect neighborhood for non-Denver zips?**
Yes — collect it as an optional free-text field for all zips, including unsupported ones. Two reasons:
1. Non-pilot users during this phase are intentional invitees (not random traffic), so friction is not a real concern.
2. Capturing their neighborhood now means we have the data already when we expand to their city — they won't need to re-onboard.

The field should be clearly optional and lightly labeled (e.g. "Neighborhood (optional)") below the pilot note. We store the value as entered; no system-population attempt is made for unsupported zips since we don't have neighborhood config for those cities yet.

**GPS location prompt vs. home zip:**
Agreed — remove the GPS/current location prompt from the map page. Reasons:
1. Users travel; current location is transient and often not Denver.
2. Asking for location permission is a significant trust moment — it's better spent elsewhere.
3. Home zip is intentional, persistent, and more useful for a local-giving use case.
The architecture plan (steps 8–9) already replaces GPS centering with saved zip coordinates from `resolveZip`. The browser location permission request should be removed from `CharityMap.tsx` when implementing this.

**Step 5.1.2 — MapBox zip search / cost?**
No additional Mapbox cost. The plan does **not** call Mapbox for zip geocoding. Instead, `resolveZip` returns lat/lng from our own `zip_codes` DB table, and those coordinates are passed as `initialCenter` to `<CharityMap>` which just sets the initial viewport. No Mapbox Geocoding API call is involved — the map simply pans to the stored coordinates. The "zip displayed in a search" language in the flow is slightly misleading; it should read "map is centered on the user's saved zip" rather than implying a search widget interaction.

### Flow B - UnAuthenticated User

1. User hits homepage
2. User clicks Maps page
3. On first map visit, a lightweight zip prompt appears (inline or small overlay — not a full page)
	1. User enters zip → map centers on their location immediately (same `resolveZip` logic as Flow A)
	2. Zip is stored in `localStorage` — no account required
	3. IF ZIP IS WITHIN DENVER REGION: neighborhood label shown, map centers on zip
	4. IF ZIP IS NOT WITHIN DENVER REGION: pilot note shown, map defaults to Denver center
4. On return visits, `localStorage` zip is read silently — no re-prompt
5. If/when the user creates an account:
	1. The onboarding zip step (Flow A) reads from `localStorage` and pre-fills the value
	2. User sees a confirmation screen, not a blank re-ask — one click to confirm or edit
	3. On save, zip is persisted to their `UserPreferences` and `localStorage` is cleared


Claude questions for Flow B:
- Is it better to have this experience be tied to account creation? or should it be triggered any time the user lands on the map and hasn’t entered info? Currently, this flow takes current location which we may change across the board (as explained in Flow A). Is it better to ask ZIP and Neighborhood on this page, and if they eventually create an account, this data is automatically linked? Unsure on difficulty

---

**Claude answers for Flow B:**

**Decision: Option A — anonymous zip in localStorage, pre-filled on signup**

Collecting zip anonymously on first map visit gives users immediate personalization value without requiring an account. There is currently no strong incentive to sign up before donating, so gating map personalization behind auth would remove a meaningful early benefit.

The "merge complexity" concern (raised in an earlier draft) was overstated. The actual implementation is simple:
- On map page: check `localStorage` for zip → prompt if missing → center map on result
- On signup onboarding: read `localStorage` zip → pre-populate the zip input → user confirms or edits → save to DB → clear `localStorage`

No silent background merging, no session hand-off logic — just a pre-filled form field. The user never feels like they answered the same question twice.





# Previous notes on this subjec


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
`SUPPORTED_CITIES` config on the backend keyed by city slug, with zip → neighborhood mappings nested under each city. The GraphQL resolver does one indexed DB lookup, then enriches with a neighborhood and `supportedCity` slug if the zip belongs to a supported city.

**Data flow:**
```
zip input → resolveZip(zip) GQL query
          → backend: SELECT city, state, lat, lng FROM zip_codes WHERE zip = $1
          → backend: enriches with SUPPORTED_CITIES lookup if available
          → returns { city, state, latitude, longitude, neighborhood?, supportedCity? }
```

**Why this works:**
- Single indexed lookup on a 42k-row table is ~1ms
- Raw geo data lives in DB (maintained once); neighborhood UX lives in code (product decision)
- Adding a new city = add an entry to `SUPPORTED_CITIES` config, no schema changes
- Zips outside supported cities still return city + state + coords — graceful fallback
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

### 2. Backend — supported cities config
Small config (backend constants or a JSON file) for supported cities only, keyed by city slug:

```typescript
// backend/src/config/supportedCities.ts
export const SUPPORTED_CITIES: Record<string, {
  zips: Record<string, { neighborhood: string; zoom: number }>;
}> = {
  denver: {
    zips: {
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
    },
  },
  // chicago: { zips: { ... } },  ← adding a new city is just this
};

// Helper to look up a zip across all supported cities
export function lookupZip(zip: string): { citySlug: string; neighborhood: string; zoom: number } | null {
  for (const [citySlug, city] of Object.entries(SUPPORTED_CITIES)) {
    if (zip in city.zips) return { citySlug, ...city.zips[zip] };
  }
  return null;
}
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
  neighborhood: String    # null if outside a supported city
  zoom: Int
  supportedCity: String   # city slug (e.g. "denver"), null if unsupported
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
  const match = lookupZip(zip);
  return {
    zip,
    city: row.city,
    state: row.state,
    latitude: row.latitude,
    longitude: row.longitude,
    neighborhood: match?.neighborhood ?? null,
    zoom: match?.zoom ?? 12,
    supportedCity: match?.citySlug ?? null,
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
  - **Supported city zip**: `"Denver, CO · Five Points / Cole"`
  - **Valid but unsupported zip**: `"This pilot currently covers Denver, CO only. We hope to expand soon!"`
  - **Not found / < 5 digits**: nothing
- On save: persist `zipCode`; derive `location` from `supportedCity` (`'denver'` vs `'other'`)

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
| `backend/src/config/supportedCities.ts` | **New** — supported city neighborhood config |
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
