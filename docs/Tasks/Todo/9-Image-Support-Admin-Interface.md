# Task 9: Image Support + Full Admin Interface for Charities

## Context

The platform currently has `logo_url` on the `charities` table (NULL for all rows) and no image support on `charity_locations`. Charity data is managed via a CSV import script (`backend/scripts/import-charities.ts`) that does a full delete+reinsert, which would overwrite any manual edits. The goal is to:

1. Add image fields (logo, location photos) with real file upload capability via Cloudinary
2. Build a full admin CRUD interface so the CSV import script can be retired as the source of truth
3. Protect the admin area via a database `is_admin` flag on users

**What prompted this:** Ongoing content management friction — editing charity data requires SQL or re-running the import script. A proper admin UI eliminates that.

---

## Storage Strategy: Cloudinary (Free Tier)

**Why Cloudinary**: Direct browser uploads (no backend file handling), CDN built-in, image transformations, 25GB bandwidth/month on free tier, generous for an MVP.

**Upload flow**: Browser → Cloudinary (unsigned upload preset) → returns `secure_url` → browser sends URL via GraphQL mutation to store in PostgreSQL. No file bytes ever touch the backend.

**Cloudinary setup required (manual, one-time)**:
1. Create account at cloudinary.com
2. Create unsigned upload preset named `charitable_images`, folder: `charitable/`, max size 5MB, allowed formats: jpg/jpeg/png/webp

**New env vars**:
- `frontend/.env.local`: `VITE_CLOUDINARY_CLOUD_NAME`, `VITE_CLOUDINARY_UPLOAD_PRESET`
- `backend/.env`: `ADMIN_EMAIL` (for initial admin promotion reference)

---

## Schema Changes (Migration 012)

**File**: `backend/migrations/012_add_image_fields.sql`

```sql
-- Add photo to charity locations (logo_url already exists on charities from migration 002)
ALTER TABLE charity_locations ADD COLUMN photo_url VARCHAR(500);

-- Add admin flag to users
ALTER TABLE users ADD COLUMN is_admin BOOLEAN NOT NULL DEFAULT FALSE;
```

**Note**: EIN and slug are intentionally not editable via admin UI (read-only display) since changing them has downstream effects (slug changes break URLs, EIN is a legal identifier).

---

## GraphQL Changes

### `backend/src/schema/typeDefs.ts`

Add to `CharityLocation` type:
```graphql
photoUrl: String
```

Add to `User` type:
```graphql
isAdmin: Boolean!
```

New mutations:
```graphql
updateCharity(
  id: ID!
  name: String
  description: String
  websiteUrl: String
  volunteerUrl: String
  primaryAddress: String
  causeTags: [String!]
  everyOrgSlug: String
  everyOrgClaimed: Boolean
  foundedYear: Int
  isActive: Boolean
  logoUrl: String
): Charity!

updateCharityLocation(
  id: ID!
  label: String
  description: String
  address: String
  latitude: Float
  longitude: Float
  photoUrl: String
): CharityLocation!

createCharity(
  name: String!
  ein: String!
  slug: String!
  description: String
  websiteUrl: String
  volunteerUrl: String
  primaryAddress: String
  causeTags: [String!]
  everyOrgSlug: String
  foundedYear: Int
): Charity!

createCharityLocation(
  charityId: ID!
  label: String!
  description: String
  address: String
  latitude: Float
  longitude: Float
): CharityLocation!

deleteCharityLocation(id: ID!): Boolean!
```

### `backend/src/resolvers/charities.ts`

1. Extend `toLocation()` mapper: add `photoUrl: row.photo_url`
3. Add `requireAdmin(context)` helper (mirrors existing `requireAuth` pattern)
4. Add all new Mutation resolvers using dynamic SET clause pattern (build only provided fields):
   - `updateCharity` — updates provided fields only, returns full charity
   - `updateCharityLocation` — updates provided fields only
   - `createCharity` — inserts new charity, returns it
   - `createCharityLocation` — inserts new location, returns it
   - `deleteCharityLocation` — deletes by ID

### `backend/src/auth.ts`

Add `isAdmin: boolean` to `JwtPayload` interface.

### `backend/src/resolvers/auth.ts`

In `verifyMagicLink`: query `is_admin` from users row, include in `signToken()` call. Also return `isAdmin` from the `me` query.

### `backend/src/resolvers/index.ts`

Spread `charityResolvers.Mutation` into the `Mutation` root.

---

## Admin Interface

### Auth guard

`frontend/src/components/layout/AdminRoute.tsx` — mirrors existing `ProtectedRoute.tsx`:
- Not authenticated → redirect to `/login`
- Authenticated but `!user.isAdmin` → redirect to `/`
- Authenticated admin → render children

### Route

Add to `frontend/src/routes.tsx`:
```
/admin  →  <AdminRoute><Admin /></AdminRoute>
```

### `frontend/src/pages/Admin.tsx` — Page structure

**Sidebar/tabs**: Charities | (future: Users, Settings)

**Charity list view**:
- Table with columns: Logo (thumbnail), Name, Tags, Active toggle, Edit button
- "Add charity" button opens a creation form/modal
- Search/filter to find charities quickly

**Charity edit panel** (side drawer or full section below the list):
- **Read-only fields** (display only): EIN, Slug — each with a tooltip explaining why they're not editable
- **Editable fields**: Name, Description (textarea), Website URL, Volunteer URL, Primary Address, Founded Year, Every.org Slug, Every.org Claimed (checkbox), Is Active (toggle)
- **Tags**: multi-select from `causes` table (all 19 tags)
- **Logo**: thumbnail + "Upload logo" button → file picker → Cloudinary → `updateCharity(logoUrl: ...)`
- **Locations section**: list of this charity's locations, each with:
  - Label, Description, Address, Lat/Lng (text inputs)
  - Photo: thumbnail + "Upload photo" → `updateCharityLocation(photoUrl: ...)`
  - Delete location button
  - "Add location" button → inline form

**Admin link in header**: Add conditional "Admin" link in `Header.tsx` when `user?.isAdmin`

### `frontend/src/lib/cloudinary.ts`

```typescript
export async function uploadToCloudinary(file: File): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET);
  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`,
    { method: 'POST', body: formData }
  );
  if (!res.ok) throw new Error('Cloudinary upload failed');
  const data = await res.json();
  return data.secure_url as string;
}
```

### `frontend/src/context/AuthContext.tsx`

Add `isAdmin?: boolean` to `User` interface. Ensure `isAdmin` is included in the user object stored to localStorage on login (from `verifyMagicLink` response).

---

## Frontend Display Changes (Public Pages)

### `frontend/src/pages/Charities.tsx`

- Add `logoUrl` to `GET_CHARITIES` query
- List cards: small 40×40 logo thumbnail (left of card), with initial-letter avatar fallback
- Map sidebar entries: same small logo treatment

### `frontend/src/pages/CharityDetail.tsx`

- Add `logoUrl` to `GET_CHARITY` query
- Add `photoUrl` to locations sub-query
- **Logo**: 64×64 beside charity name in the header
- **Location photos**: `h-32` image block within each location item when `photoUrl` is present

---

## Retiring the CSV Import Script

- Add a large warning comment block to `backend/scripts/import-charities.ts` documenting that it should not be re-run in production (it will wipe all admin UI edits)
- Keep the file in repo for reference / emergency re-seed from scratch
- The admin UI is now the canonical source of truth for charity data

---

## Implementation Order

### Phase 1 — Backend
- [ ] Create `backend/migrations/012_add_image_fields.sql`, run locally
- [ ] Update `backend/src/env.ts`: add `ADMIN_EMAIL` to Zod schema
- [ ] Update `backend/src/auth.ts`: add `isAdmin` to `JwtPayload`
- [ ] Update auth resolver: query+include `is_admin` in token and `me` response
- [ ] Update `typeDefs.ts`: new fields + all new mutations
- [ ] Update `resolvers/charities.ts`: extend mappers, add `requireAdmin`, add all mutation resolvers
- [ ] Update `resolvers/index.ts`: spread `charityResolvers.Mutation`
- [ ] **Manual step**: `UPDATE users SET is_admin = TRUE WHERE email = 'your@email.com';` in local DB

### Phase 2 — Frontend auth
- [ ] Update `AuthContext.tsx`: add `isAdmin` to User interface
- [ ] Update `Verify.tsx`: include `isAdmin` in user object passed to `login()`
- [ ] Create `AdminRoute.tsx`
- [ ] Add `/admin` route to `routes.tsx`
- [ ] Create stub `Admin.tsx`, verify route guard works

### Phase 3 — Cloudinary + Admin UI
- [ ] Add `VITE_CLOUDINARY_*` vars to `frontend/.env.local`
- [ ] Create `frontend/src/lib/cloudinary.ts`
- [ ] Build out full `Admin.tsx` (charity list, edit panel, location management, image uploads)
- [ ] Add conditional "Admin" link to `Header.tsx`

### Phase 4 — Public display
- [ ] Update `Charities.tsx`: add logo to query + card display
- [ ] Update `CharityDetail.tsx`: add logo, location photos to query + display

### Phase 5 — Deploy
- [ ] Add Cloudinary env vars to Render frontend service
- [ ] Add `ADMIN_EMAIL` to Render backend service
- [ ] Run admin promotion SQL against production DB via Render shell

---

## Verification Checklist

- [ ] **Migration**: `npm run db:migrate` locally; confirm new columns exist in psql
- [ ] **Auth**: Log in, decode JWT at jwt.io, confirm `isAdmin: true` in payload
- [ ] **Admin route guard**: Log out, visit `/admin` directly → should redirect to `/login`
- [ ] **Image upload**: In admin, upload a logo → verify URL appears in DB and renders on public charity card
- [ ] **Charity edit**: Change a description in admin UI → verify change appears on public detail page
- [ ] **Location edit**: Add a new location → verify it appears on the map
- [ ] **Public display**: Charity cards show logo thumbnails; detail page shows logo + location photos
- [ ] **Import script warning**: Confirm the warning comment is visible in `import-charities.ts`

---

## Critical Files

| File | Change |
|------|--------|
| `backend/migrations/012_add_image_fields.sql` | **New** — schema changes |
| `backend/src/schema/typeDefs.ts` | New fields + mutations |
| `backend/src/resolvers/charities.ts` | Extend mappers, add admin mutations |
| `backend/src/auth.ts` | `isAdmin` on JwtPayload |
| `backend/src/resolvers/auth.ts` | Include `isAdmin` in token + me query |
| `backend/src/resolvers/index.ts` | Wire charity mutations |
| `frontend/src/lib/cloudinary.ts` | **New** — upload utility |
| `frontend/src/pages/Admin.tsx` | **New** — full admin UI |
| `frontend/src/components/layout/AdminRoute.tsx` | **New** — route guard |
| `frontend/src/context/AuthContext.tsx` | Add `isAdmin` to User |
| `frontend/src/routes.tsx` | Add `/admin` route |
| `frontend/src/pages/CharityDetail.tsx` | Logo + location photos in query + display |
| `frontend/src/pages/Charities.tsx` | Logo in query + card display |
| `frontend/src/components/layout/Header.tsx` | Conditional admin link |
| `backend/scripts/import-charities.ts` | Add deprecation warning comment |

---

## Future Enhancements

### Cover / Hero Image for Charities

Add a full-width cover image to each charity's detail page.

**Schema**: `ALTER TABLE charities ADD COLUMN cover_image_url VARCHAR(500);`

**GraphQL**:
- Add `coverImageUrl: String` to `Charity` type
- Add `coverImageUrl: String` arg to `updateCharity` mutation
- Extend `toCharity()` mapper with `coverImageUrl: row.cover_image_url`

**Admin UI**: Add "Upload cover" button in the charity edit panel (same Cloudinary flow as logo).

**Public display** (`CharityDetail.tsx`):
- Full-width hero banner (`h-48`, `object-cover`) above charity name when present; renders nothing when null
- Include `coverImageUrl` in `GET_CHARITY` query
