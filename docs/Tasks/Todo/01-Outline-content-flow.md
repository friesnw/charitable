## Content Management: Dev vs Prod

### Rule of thumb
- **Code changes** → develop in dev, deploy to prod via git
- **Content changes** (charities, locations, tags) → make directly in **prod admin**

Dev is for building and testing features, not managing content. Keeping content changes in prod avoids the complexity of syncing.

### Image population
When adding new locations in prod that need Street View photos, run the populate script pointed at prod:

```bash
cd backend && DATABASE_URL=<prod-url> npx tsx scripts/populate-street-view.ts
```

Requires: `GOOGLE_MAPS_API_KEY`, `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`

### Sync script (initial seeding / disaster recovery only)
`backend/scripts/sync-content.ts` is NOT for routine content updates. Use it for:
- **Initial seeding** — bootstrapping a fresh prod DB from dev data
- **Disaster recovery** — restoring prod content if data is lost

```bash
SOURCE_DATABASE_URL=<dev-url> TARGET_DATABASE_URL=<prod-url> npx tsx scripts/sync-content.ts
```

DATABASE_URLs are in the Render dashboard for each PostgreSQL service.
