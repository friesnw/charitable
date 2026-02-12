## Phase 8: Maps Integration

**Goal:** Create a neighborhood-first charity discovery experience using Mapbox + Google Street View.

---

### Setup & Accounts

- [ ] **Sign up for Mapbox** (free tier: 50K loads/month)
- [ ] **Create Mapbox access token** and add to `.env`
- [ ] **Sign up for Google Maps API** (for Street View only)
- [ ] **Add API keys to `backend/src/env.ts`** Zod schema

---

### Database: Location Data

The `charity_locations` table (with `label`, `description`, `address`, `latitude`, `longitude`) is created in [Phase 2: Charity Seed](./2-Charity-Seed.md). Charities can have multiple locations; each maps back to one parent charity.

- [ ] **Backfill lat/lng** for any locations seeded without coordinates
- [ ] **Determine neighborhood from coordinates** — use Denver neighborhood GeoJSON boundaries to derive which neighborhood a charity falls in (computed from lat/lng + boundary polygons, not stored on any row)

---

### Denver Neighborhood Data

- [ ] **Download Denver neighborhoods GeoJSON** from [Denver Open Data](https://opendata-geospatialdenver.hub.arcgis.com/)
- [ ] **Store in `frontend/public/data/denver-neighborhoods.geojson`**
- [ ] **Verify neighborhood names** match your charity data

---

### Custom Map Style

- [ ] **Create custom style in Mapbox Studio**
  - Match app's calm, trusted aesthetic
  - Muted colors, clean typography
  - Reduce visual clutter (hide unnecessary POIs)

- [ ] **Design cause-type marker icons**
  - 🏠 Housing
  - 🍎 Food/Hunger
  - 🐾 Animals
  - 🎨 Arts
  - 💚 Health
  - 👶 Youth
  - 🌱 Environment
  - 🤝 Community

---

### Frontend Components

- [ ] **Install dependencies**
  ```bash
  npm install react-map-gl mapbox-gl
  npm install @types/mapbox-gl --save-dev
  ```

- [ ] **Create `frontend/src/components/CharityMap.tsx`**
  - Display map centered on Denver
  - Show charity markers with cause icons
  - Click marker → show popup with name + donate link
  - Cluster nearby markers at low zoom

- [ ] **Create `frontend/src/components/NeighborhoodLayer.tsx`**
  - Overlay Denver neighborhood boundaries
  - Subtle fill color on hover
  - Show neighborhood name labels

- [ ] **Create `frontend/src/components/StreetViewPreview.tsx`**
  - Google Street View embed for charity detail page
  - Fallback if Street View unavailable

- [ ] **Create `frontend/src/components/CauseMarker.tsx`**
  - Custom marker component per cause type
  - Consistent sizing and styling

---

### Discovery Page Updates

- [ ] **Add map view toggle** to charity list page
  - List view (default) ↔ Map view

- [ ] **Add neighborhood filter**
  - Dropdown or clickable regions on map
  - "Charities in Capitol Hill (4)"

- [ ] **Add "Near Me" feature** (if user allows location)
  - Sort by distance
  - Show distance on charity cards

---

### Charity Detail Page

- [ ] **Add Street View section**
  - Show panorama of charity location
  - "See the neighborhood" context

- [ ] **Add mini-map**
  - Small map showing location
  - Link to directions (Google Maps)

- [ ] **Show neighborhood badge**
  - "Located in Five Points"

---

### GraphQL Queries

- [ ] **Update `charities` query** to support location filters
  ```graphql
  charities(
    tags: [String]
    search: String
    neighborhood: String
    nearLat: Float
    nearLng: Float
    radiusMiles: Float
  ): [Charity!]!
  ```

- [ ] **Add `neighborhoods` query**
  ```graphql
  neighborhoods: [Neighborhood!]!

  type Neighborhood {
    name: String!
    charityCount: Int!
  }
  ```

- [ ] **Add `causes` query** (for filter dropdowns)
  ```graphql
  causes: [Cause!]!

  type Cause {
    tag: String!
    charityCount: Int!
  }
  ```

---

### Verification

- [ ] Map loads without errors
- [ ] Charity markers appear at correct locations
- [ ] Clicking marker shows popup with charity info
- [ ] Neighborhood boundaries display correctly
- [ ] Neighborhood filter works
- [ ] Street View loads on detail page
- [ ] Custom map style matches app aesthetic
- [ ] Mobile responsive (map works on touch devices)

---

### Performance Considerations

- [ ] Lazy load map component (don't block initial page load)
- [ ] Use marker clustering for many charities
- [ ] Cache neighborhood GeoJSON
- [ ] Consider static map image for charity cards (faster than interactive)

---

### Future Enhancements

- [ ] "Charities along my commute" (route-based discovery)
- [ ] Heatmap of giving activity by neighborhood
- [ ] User location tracking (with permission)
- [ ] Directions/transit integration
- [ ] AR view ("Lens in Maps" style)

---

### Resources

- [react-map-gl docs](https://visgl.github.io/react-map-gl/)
- [Mapbox Studio](https://studio.mapbox.com/)
- [Denver Open Data](https://opendata-geospatialdenver.hub.arcgis.com/)
- [Google Street View API](https://developers.google.com/maps/documentation/javascript/streetview)
- [Maps Integration Research](/docs/Research/Maps-Integration.md)
