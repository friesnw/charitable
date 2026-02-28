# Populate Location Photos from Google Street View

One-time script to fill `charity_locations.photo_url` for locations that have coordinates or an address but no photo.

## What's already in place

- `charity_locations.photo_url` column — migration 012
- `CharityLocation.photoUrl` in GraphQL schema and `toLocation()` mapper
- `updateCharityLocation` mutation for manual overrides
- Script: `backend/scripts/populate-street-view.ts`

## Prerequisites

Add to `backend/.env` (and Render env vars if re-running in production):

```
GOOGLE_MAPS_API_KEY=...      # Street View Static API enabled in GCP console; restrict to server IP
CLOUDINARY_CLOUD_NAME=...    # same cloud as frontend
CLOUDINARY_API_KEY=...       # server-side key (not the unsigned upload preset)
CLOUDINARY_API_SECRET=...    # server-side secret
```

## How to run

```bash
cd backend && npx tsx scripts/populate-street-view.ts
```

The script:
1. Queries all locations where `photo_url IS NULL` and lat/lng or address exists
2. Calls Street View Metadata API first (free) — skips locations with no imagery
3. Downloads 600×400 street-level image
4. Uploads to Cloudinary under `charity-locations/location-{id}` with a signed request
5. Updates `charity_locations.photo_url` with the Cloudinary URL

Already-set photo URLs are never touched. Safe to re-run after clearing.

## Verify after running

```sql
SELECT id, label, photo_url FROM charity_locations WHERE photo_url IS NOT NULL;
```

Then load a charity detail page in the browser — photos should appear in the location sections.

## How to undo

**Step 1 — verify what will be cleared:**
```sql
SELECT id, label, photo_url FROM charity_locations WHERE photo_url LIKE '%res.cloudinary.com%';
```

**Step 2 — clear photo URLs from the database:**
```sql
UPDATE charity_locations SET photo_url = NULL WHERE photo_url LIKE '%res.cloudinary.com%';
```

**Step 3 — delete assets from Cloudinary:**

Option A: Cloudinary dashboard → Media Library → `charity-locations` folder → select all → delete.

Option B: via API:
```bash
curl -X DELETE https://api.cloudinary.com/v1_1/{cloud_name}/resources/image/upload \
  -u "{api_key}:{api_secret}" \
  -d "prefix=charity-locations/"
```

No migrations to roll back, no code to revert, no UI changes were made.

## Caveats

- Street View shows building exteriors from the road — may look odd for office parks, homes, or locations with poor coverage
- Locations with no Street View imagery are skipped (logged as SKIP)
- Free tier: 28,000 Street View requests/month; a few dozen locations costs nothing
- Any manually set `photo_url` is left untouched
