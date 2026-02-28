## Content Flow: Local → Dev → Prod

### What gets synced
- **causes** — all cause tags
- **charities** — all charity fields (name, EIN, slug, description, URLs, tags, etc.)
- **charity_locations** — label, address, lat/lng, photo_url (Cloudinary URLs are env-agnostic)

Not synced: users, donations, magic link tokens, preferences (prod-specific).

### Image population
The Street View script runs **on dev only** and writes `photo_url` (Cloudinary URLs) directly into dev's database. Because the sync copies full location rows including `photo_url`, images come along automatically — no need to run Street View on prod separately.

```bash
# Run on dev before syncing — populates photo_url for any locations missing images
cd backend && npx tsx scripts/populate-street-view.ts
```
Requires: `GOOGLE_MAPS_API_KEY`, `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`

Note: if you sync before running Street View, new locations will arrive in prod with `photo_url = null`. Always run Street View on dev first.

### Dev → Prod sync (to be built)
Create `backend/scripts/sync-content.ts`:
- Reads causes, charities, locations (including `photo_url`) from source DB
- Upserts causes by `tag`, upserts charities by `ein`
- Replaces locations per charity (delete + reinsert wrapped in a transaction — safe rollback if anything fails; avoids needing unique constraint)

**Usage:**
```bash
SOURCE_DATABASE_URL=<dev-url> TARGET_DATABASE_URL=<prod-url> npx tsx scripts/sync-content.ts
```

DATABASE_URLs are in the Render dashboard for each PostgreSQL service.

### Workflow
1. Update/add charity data in dev via admin UI
2. Run Street View script on dev to populate images for new locations
3. Review data on dev frontend
4. Run sync script: dev → prod (photo_urls included automatically)
5. Verify on goodlocal.org
