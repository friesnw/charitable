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

- [ ] **Create `frontend/src/components/CharityMap.tsx`**


- [ ] **Add map view toggle** to charity list page
  - List view (default) ↔ Map view



----


### Step 3: Focus map on Denver

   Display map centered on Denver
- Center: [-104.98832, 39.73669]
- Zoom: 9.57


----


### Step 4: Add Charity Markers

Reference doc: https://docs.mapbox.com/mapbox-gl-js/guides/add-your-data/markers/

Anchor should use *bottom* so that the tip of the pin points to the exact location on the map

- If lat long isn't present, dont display as a marker on the map


### Step 5: Add Marker Popups

- [x] display charity location name, parent charity name, location description, link to charity page

---

### Step 9: GraphQL Updates

- [ ] **Update `charities` query** to support location filters
  ```graphql
  charities(
    tags: [String]
    search: String
    nearLat: Float
    nearLng: Float
  ): [Charity!]!
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

# Maps Part 2: Styling adjustments 
### 1. Customize the markers

### 2. Outline specific relevant neighborhoods based on research

- [ ] Display Denver Neighborhood Data
	- [ ] **Download Denver neighborhoods GeoJSON** from [Denver Open Data](https://opendata-geospatialdenver.hub.arcgis.com/)
	- [ ] **Store in `frontend/public/data/denver-neighborhoods.geojson`**
	- [ ] **Verify neighborhood names** match your charity data

- [ ] **Add neighborhood filter**
  - Dropdown or clickable regions on map
  - "Charities in Capitol Hill (4)"

- [ ] Backfill neighborhood data for charity locations to display on popup
- [ ]  **Determine neighborhood from coordinates** — use Denver neighborhood GeoJSON boundaries to derive which neighborhood a charity falls in (computed from lat/lng + boundary polygons, not stored on any row)
- [ ] graphql updates



# Maps Future Enhancements

- [ ] Performance drops after 100+ locations, so use marker clustering after this point:
	- Docs: https://docs.mapbox.com/mapbox-tiling-service/examples/mts-clustering/



Notes: 





### Resources

- [react-map-gl docs](https://visgl.github.io/react-map-gl/)
- [Mapbox Studio](https://studio.mapbox.com/)
- [Denver Open Data](https://opendata-geospatialdenver.hub.arcgis.com/)
- [Maps Integration Research](/docs/Research/Maps-Integration.md)

