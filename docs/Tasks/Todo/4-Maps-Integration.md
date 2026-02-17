## Phase 8: Maps Integration

**Goal:** Create a neighborhood-first charity discovery experience using Mapbox.

---

### Step 1: Mapbox Setup

- [x] **Sign up for Mapbox** (free tier: 50K loads/month)
- [x] **Create Mapbox access token** and add to `.env`
- [x] **Add token to `backend/src/env.ts`** Zod schema

---


### Step 2: Set up Map

Install Dependencies

- [ ] **Install packages**
  ```bash
  npm install react-map-gl mapbox-gl
  npm install @types/mapbox-gl --save-dev
  ```

----


### Step 3: Focus map on Denver

- Center: [-104.98832, 39.73669]
- Zoom: 9.57


----




#### Step 4: Add Charity Markers

Reference doc: https://docs.mapbox.com/mapbox-gl-js/guides/add-your-data/markers/

Anchor should use *bottom* so that the tip of the pin points to the exact location on the map

- If lat long isn't present, dont display as a marker on the map
### Step 5: Add Marker Popups




### Step 2: Location Data

The `charity_locations` table (with `label`, `description`, `address`, `latitude`, `longitude`) is created in [Phase 2: Charity Seed](./2-Charity-Seed.md). Charities can have multiple locations; each maps back to one parent charity.

- [ ] **Backfill lat/lng** for any locations seeded without coordinates
- [ ] **Determine neighborhood from coordinates** — use Denver neighborhood GeoJSON boundaries to derive which neighborhood a charity falls in (computed from lat/lng + boundary polygons, not stored on any row)

---

### Step 3: Denver Neighborhood Data

- [ ] **Download Denver neighborhoods GeoJSON** from [Denver Open Data](https://opendata-geospatialdenver.hub.arcgis.com/)
- [ ] **Store in `frontend/public/data/denver-neighborhoods.geojson`**
- [ ] **Verify neighborhood names** match your charity data

---


---

### Step 6: Build Map Components

- [ ] **Create `frontend/src/components/CharityMap.tsx`**
  - Display map centered on Denver
  - Show charity markers with cause icons
  - Click marker → show popup with name + donate link
  - Cluster nearby markers at low zoom

- [ ] **Create `frontend/src/components/NeighborhoodLayer.tsx`**
  - Overlay Denver neighborhood boundaries
  - Subtle fill color on hover
  - Show neighborhood name labels

- [ ] **Create `frontend/src/components/CauseMarker.tsx`**
  - Custom marker component per cause type
  - Consistent sizing and styling

---

### Step 7: Update Discovery Page

- [ ] **Add map view toggle** to charity list page
  - List view (default) ↔ Map view

- [ ] **Add neighborhood filter**
  - Dropdown or clickable regions on map
  - "Charities in Capitol Hill (4)"



---

### Step 8: Update Charity Detail Page

- [ ] **Add mini-map**
  - Small Mapbox map showing charity location
  - Link to directions

- [ ] **Show neighborhood badge**
  - "Located in Five Points"

---

### Step 9: GraphQL Updates

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

### Step 10: Verification

- [ ] Map loads without errors
- [ ] Charity markers appear at correct locations
- [ ] Clicking marker shows popup with charity info
- [ ] Neighborhood boundaries display correctly
- [ ] Neighborhood filter works
- [ ] Custom map style matches app aesthetic
- [ ] Mobile responsive (map works on touch devices)

---

### Performance Considerations

- [ ] Lazy load map component (don't block initial page load)
- [ ] Caching to reduce cost:
	- [ ] Mapbox GL JS usage is billed by [map loads](https://docs.mapbox.com/help/glossary/map-loads/). A map load is incurred each time this component mounts and the Map's [`load`](https://docs.mapbox.com/mapbox-gl-js/api/map/#map.event:load) event fires. Depending on your app architecture and UX, you may want to persist the map component to avoid multiple map loads for a single user.
- [ ] Cache neighborhood GeoJSON
- [ ] Consider static map image for charity cards (faster than interactive)


---

### Resources

- [react-map-gl docs](https://visgl.github.io/react-map-gl/)
- [Mapbox Studio](https://studio.mapbox.com/)
- [Denver Open Data](https://opendata-geospatialdenver.hub.arcgis.com/)
- [Maps Integration Research](/docs/Research/Maps-Integration.md)




# Maps Part 2: Styling adjustments 
### 1. Customize the markers

### 2. Outline specific relevant neighborhoods based on research

# Maps Future Enhancements

- [ ] Performance drops after 100+ locations, so use marker clustering after this point:
	- Docs: https://docs.mapbox.com/mapbox-tiling-service/examples/mts-clustering/



Notes: 