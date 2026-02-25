# Maps Integration Research

## Goal

Create a charity discovery experience that feels **local and community-oriented** — helping users see charities as part of their neighborhood, not abstract organizations.

From Product Position:
> "People know their home best. And they are best suited to make an impact at home."
> "Proximity builds meaning."
> "Local charities are harder to evaluate—but often more impactful to donors' lived experience."

---

## How Maps Support the "Local Feel"

| Feature                     | Experience Impact                                |
| --------------------------- | ------------------------------------------------ |
| **Neighborhood boundaries** | "Charities in Capitol Hill" vs generic list      |
| **Custom markers**          | Branded pins with cause-type icons               |
| **Street View**             | See the actual building/location before visiting |
| **Custom styling**          | Match app's calm, trusted aesthetic              |
| **Proximity indicators**    | "0.8 miles from you"                             |
| **Clustering**              | Show density of giving opportunities             |

---

## Option 1: Mapbox

**Best for:** Full customization, branded experience, offline support

### Strengths

| Feature                 | How It Helps                                           |
| ----------------------- | ------------------------------------------------------ |
| **Mapbox Studio**       | Design maps matching your brand colors, typography     |
| **Custom markers**      | Create unique icons per cause (animals, housing, food) |
| **Neighborhood layers** | Overlay Denver neighborhood boundaries from GeoJSON    |
| **3D buildings**        | Show charity locations in context                      |
| **Terrain/atmosphere**  | Create a warm, inviting map aesthetic                  |
| **Vector tiles**        | Smooth zooming, fast performance                       |

### Visual Examples & Demos

**🔗 Live Examples:**
- [Mapbox Gallery](https://www.mapbox.com/gallery/) — Browse custom map styles
- [Mapbox Studio Examples](https://studio.mapbox.com/examples/) — Interactive styling demos
- [react-map-gl Examples](https://visgl.github.io/react-map-gl/examples) — React component demos

**What Neighborhood Highlighting Looks Like:**
- Custom fill colors per neighborhood polygon
- Hover effects (highlight on mouseover)
- Labels with neighborhood names
- Click to filter/zoom

### Customization Examples

```javascript
// Brand-matched map style
map.setStyle('mapbox://styles/charitable/your-custom-style');

// Custom marker per cause type
const marker = new mapboxgl.Marker({
  element: createCauseIcon('animals'), // Your custom SVG
  anchor: 'bottom'
}).setLngLat([charity.longitude, charity.latitude]);

// Neighborhood boundary overlay with highlighting
map.addSource('denver-neighborhoods', {
  type: 'geojson',
  data: '/data/denver-neighborhoods.geojson'
});

// Fill layer with hover effect
map.addLayer({
  id: 'neighborhood-fills',
  type: 'fill',
  source: 'denver-neighborhoods',
  paint: {
    'fill-color': [
      'case',
      ['boolean', ['feature-state', 'hover'], false],
      '#4A90A4',  // Highlighted color
      '#627BC1'   // Default color
    ],
    'fill-opacity': 0.2
  }
});

// Highlight on hover
map.on('mousemove', 'neighborhood-fills', (e) => {
  map.setFeatureState(
    { source: 'denver-neighborhoods', id: e.features[0].id },
    { hover: true }
  );
});
```

### Pricing
- **Free tier:** 50,000 map loads/month
- **Beyond free:** ~$0.60 per 1,000 loads

### Limitations
- No Street View equivalent
- POI data less comprehensive than Google
- Requires more setup for custom styling

---

## Option 2: Google Maps

**Best for:** Street View, built-in neighborhood boundaries, comprehensive POI data, familiar UX

### Strengths

| Feature | How It Helps |
|---------|--------------|
| **Data-driven styling** | Highlight neighborhoods with custom colors (no GeoJSON needed!) |
| **Built-in boundaries** | Google provides locality/postal code polygons |
| **Street View** | "See the neighborhood" before donating |
| **Immersive View** | 3D aerial previews of areas |
| **Places data** | Rich context about surrounding area |
| **Familiar interface** | Users already know how to use it |

### Visual Examples & Demos

**🔗 Live Examples:**
- [Data-Driven Styling Demo](https://storage.googleapis.com/gmp-maps-demos/data-driven-styling/index.html) — Interactive boundary highlighting
- [Boundary Polygon Example](https://developers.google.com/maps/documentation/javascript/examples/boundaries-simple) — Simple locality styling
- [Choropleth Map Example](https://developers.google.com/maps/documentation/javascript/dds-boundaries/choropleth-map) — Color regions by data

**What Neighborhood Highlighting Looks Like:**
| Example | Description |
|---------|-------------|
| **Locality highlighting** | Polygon outlines a neighborhood with custom fill/stroke |
| **Choropleth map** | Neighborhoods colored by charity density or donation amounts |
| **Interactive selection** | Click a region → returns Place ID and metadata |
| **Hover effects** | Mouse over → neighborhood name appears |

### Neighborhood Highlighting (Data-Driven Styling)

**Yes — Google Maps can highlight neighborhoods without custom GeoJSON!**

Google provides built-in administrative boundary polygons. You can:
- Style by locality, postal code, or other admin levels
- Customize fill color, stroke, opacity
- Target specific neighborhoods by Place ID
- Create choropleth maps (color by data)

```javascript
// Enable the LOCALITY feature layer
const featureLayer = map.getFeatureLayer('LOCALITY');

// Style all localities
featureLayer.style = (options) => {
  const placeId = options.feature.placeId;

  // Highlight specific neighborhoods
  if (placeId === 'ChIJ_CAPITOL_HILL_PLACE_ID') {
    return {
      fillColor: '#4285F4',
      fillOpacity: 0.3,
      strokeColor: '#4285F4',
      strokeWeight: 2
    };
  }

  // Default: subtle styling for other areas
  return {
    fillColor: '#grey',
    fillOpacity: 0.05,
    strokeWeight: 0.5
  };
};

// Interactive: click to get neighborhood info
featureLayer.addListener('click', (event) => {
  const feature = event.features[0];
  console.log('Clicked:', feature.displayName); // "Capitol Hill"
  console.log('Place ID:', feature.placeId);
  // Filter charities by this neighborhood
});
```

### Street View for Local Feel

```javascript
// Embed Street View of charity location
const panorama = new google.maps.StreetViewPanorama(
  document.getElementById('street-view'),
  {
    position: { lat: charity.latitude, lng: charity.longitude },
    pov: { heading: 165, pitch: 0 },
    zoom: 1
  }
);
```

### Pricing
- **Free tier:** $200/month credit (~28,500 loads)
- **Beyond free:** ~$7 per 1,000 loads (more expensive than Mapbox)

### Limitations
- Less custom styling flexibility than Mapbox (can't fully rebrand the base map)
- More expensive at scale
- Boundary data availability varies by region (need to verify Denver coverage)

---

## Option 3: OpenStreetMap + Leaflet

**Best for:** Zero cost, full control, open data

### Strengths

| Feature | How It Helps |
|---------|--------------|
| **Free forever** | No API costs |
| **Open data** | Community-maintained, can contribute back |
| **Full control** | Self-host tiles if needed |
| **Leaflet.js** | Lightweight, easy React integration |

### Limitations
- No Street View
- Must source/style your own tiles
- Less polished out of the box
- More development effort

---

## Denver Neighborhood Data

To show "Charities in [Neighborhood]", you need boundary data:

| Source | Format | Cost |
|--------|--------|------|
| [Denver Open Data Catalog](https://opendata-geospatialdenver.hub.arcgis.com/) | GeoJSON/Shapefile | Free |
| [SimpleMaps Denver](https://simplemaps.com/city/denver/neighborhoods) | GeoJSON | ~$99 one-time |
| [Stanford Neighborhoods Dataset](https://exhibits.stanford.edu/data/catalog/rq635hh7400) | GeoJSON | Free |

### Integration

```javascript
// Load Denver neighborhood boundaries
map.addSource('neighborhoods', {
  type: 'geojson',
  data: '/data/denver-neighborhoods.geojson'
});

// Style neighborhood fills
map.addLayer({
  id: 'neighborhood-fills',
  type: 'fill',
  source: 'neighborhoods',
  paint: {
    'fill-color': '#627BC1',
    'fill-opacity': 0.1
  }
});

// Add neighborhood labels
map.addLayer({
  id: 'neighborhood-labels',
  type: 'symbol',
  source: 'neighborhoods',
  layout: {
    'text-field': ['get', 'NBHD_NAME'],
    'text-size': 12
  }
});
```

---

## Recommendation

### For MVP: **Mapbox**

| Reason | Detail |
|--------|--------|
| **Brand alignment** | Custom styling matches "calm, trusted" aesthetic |
| **Free tier sufficient** | 50K loads/month covers early growth |
| **Neighborhood support** | Easy GeoJSON overlay for Denver areas |
| **React ecosystem** | `react-map-gl` is mature and well-documented |
| **Custom markers** | Cause-type icons reinforce categorization |

### Add Later: **Google Street View**

On charity detail pages, embed Street View to show the physical location. This creates an emotional connection:

> "This is the building where Denver Rescue Mission serves meals every day."

You can use both — Mapbox for the main discovery map, Google Street View for detail pages.

---

## Experience Concepts

### 1. Neighborhood-First Discovery

Instead of a generic list, show:
```
┌─────────────────────────────────────┐
│ [Map showing Capitol Hill]          │
│                                     │
│  Capitol Hill                       │
│  4 charities • 0.3 mi away         │
│                                     │
│  • Urban Peak (youth)               │
│  • Project Angel Heart (meals)      │
│  • ...                              │
└─────────────────────────────────────┘
```

### 2. "Near You" Emphasis
*Nick notes: I don't really think this gives that much*

```
┌─────────────────────────────────────┐
│  📍 Charities within 1 mile         │
│                                     │
│  [Interactive map with pins]        │
│                                     │
│  Tap a pin to learn more            │
└─────────────────────────────────────┘
```

### 3. Street View Preview
*Nick notes: I think the jury is way out on if street view is actually useful. lots of bland buildings and outdated things.* 

On charity detail page:
```
┌─────────────────────────────────────┐
│  Denver Rescue Mission              │
│  ─────────────────────────────────  │
│  [Street View panorama]             │
│                                     │
│  1130 Park Ave W, Denver            │
│  0.8 miles from you                 │
│                                     │
│  [Donate] [Get Directions]          │
└─────────────────────────────────────┘
```

### 4. Custom Cause Markers

```
🏠 Housing        🍎 Food/Hunger
🐾 Animals        🎨 Arts
💚 Health         👶 Youth
🌱 Environment    🤝 Community
```

---

## Data Requirements

To enable maps, add to `charities` table:

```sql
ALTER TABLE charities ADD COLUMN latitude DECIMAL(10,8);
ALTER TABLE charities ADD COLUMN longitude DECIMAL(11,8);
ALTER TABLE charities ADD COLUMN neighborhood VARCHAR(100);
ALTER TABLE charities ADD COLUMN address TEXT;
```

(Already captured in `Enrich-DB-Tables.md`)

---

## React Integration

### Mapbox with react-map-gl

```bash
npm install react-map-gl mapbox-gl
```

```tsx
import Map, { Marker, Popup } from 'react-map-gl';

function CharityMap({ charities }) {
  return (
    <Map
      mapboxAccessToken={MAPBOX_TOKEN}
      initialViewState={{
        longitude: -104.9903,
        latitude: 39.7392,
        zoom: 12
      }}
      style={{ width: '100%', height: 400 }}
      mapStyle="mapbox://styles/your-custom-style"
    >
      {charities.map(charity => (
        <Marker
          key={charity.id}
          longitude={charity.longitude}
          latitude={charity.latitude}
        >
          <CauseIcon type={charity.causeTags[0]} />
        </Marker>
      ))}
    </Map>
  );
}
```

---

## Next Steps

1. [ ] Sign up for Mapbox account (free tier)
2. [ ] Create custom map style in Mapbox Studio
3. [ ] Download Denver neighborhood GeoJSON
4. [ ] Add lat/lng to charity seed data
5. [ ] Build `CharityMap` component
6. [ ] Add neighborhood filter to discovery

---

## Sources

**Mapbox:**
- [Mapbox Gallery](https://www.mapbox.com/gallery/) — Visual style examples
- [Mapbox Studio](https://studio.mapbox.com/) — Custom map styling tool
- [Mapbox Custom Markers Tutorial](https://docs.mapbox.com/help/tutorials/custom-markers-gl-js/)
- [Mapbox Boundaries Guide](https://docs.mapbox.com/data/boundaries/guides/use-boundaries/)
- [react-map-gl Examples](https://visgl.github.io/react-map-gl/examples)

**Google Maps:**
- [Data-Driven Styling Demo](https://storage.googleapis.com/gmp-maps-demos/data-driven-styling/index.html) — Live interactive demo
- [Data-Driven Styling Blog](https://mapsplatform.google.com/resources/blog/introducing-data-driven-styling/) — Feature overview
- [Boundary Styling Docs](https://developers.google.com/maps/documentation/javascript/dds-boundaries/overview)
- [Google Street View API](https://developers.google.com/maps/documentation/javascript/streetview)

**Comparisons:**
- [Mapbox vs Google Maps Comparison](https://www.uptech.team/blog/mapbox-vs-google-maps-vs-openstreetmap)
- [Mapbox vs Google Maps API 2026](https://radar.com/blog/mapbox-vs-google-maps-api)

**Denver Data:**
- [Denver Open Data Catalog](https://opendata-geospatialdenver.hub.arcgis.com/)
- [Denver Neighborhoods Map](https://www.denvergov.org/maps/map/neighborhoods)
