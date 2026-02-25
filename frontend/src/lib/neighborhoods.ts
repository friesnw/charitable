import { distanceMiles } from './geo';

// If the nearest neighborhood centroid is farther than this, fall back to distance label.
const MAX_NEIGHBORHOOD_MILES = 8;

interface Neighborhood {
  name: string;
  lat: number;
  lng: number;
}

// Centroids for Denver neighborhoods and surrounding suburbs.
// Used to label charity locations and map cards by neighborhood instead of raw distance.
export const NEIGHBORHOODS: Neighborhood[] = [
  // Inner Denver — north to south
  { name: 'Sunnyside',        lat: 39.7826, lng: -105.0180 },
  { name: 'Berkeley',         lat: 39.7936, lng: -105.0489 },
  { name: 'RiNo',             lat: 39.7717, lng: -104.9807 },
  { name: 'Highland',         lat: 39.7714, lng: -105.0178 },
  { name: 'Jefferson Park',   lat: 39.7574, lng: -105.0280 },
  { name: 'Five Points',      lat: 39.7566, lng: -104.9757 },
  { name: 'Central Park',     lat: 39.7572, lng: -104.9094 },
  { name: 'Ballpark',         lat: 39.7561, lng: -104.9940 },
  { name: 'LoDo',             lat: 39.7527, lng: -104.9998 },
  { name: 'Sloan Lake',       lat: 39.7489, lng: -105.0464 },
  { name: 'City Park',        lat: 39.7458, lng: -104.9554 },
  { name: 'Park Hill',        lat: 39.7466, lng: -104.9320 },
  { name: 'Edgewater',        lat: 39.7452, lng: -105.0726 },
  { name: 'Capitol Hill',     lat: 39.7316, lng: -104.9758 },
  { name: 'Congress Park',    lat: 39.7315, lng: -104.9478 },
  { name: 'Cherry Creek',     lat: 39.7178, lng: -104.9544 },
  { name: 'Baker',            lat: 39.7134, lng: -104.9962 },
  { name: 'Wash Park',        lat: 39.6982, lng: -104.9683 },
  { name: 'Platt Park',       lat: 39.6887, lng: -104.9858 },

  // Suburbs
  { name: 'Commerce City',    lat: 39.8086, lng: -104.9341 },
  { name: 'Thornton',         lat: 39.8677, lng: -104.9719 },
  { name: 'Arvada',           lat: 39.8028, lng: -105.0875 },
  { name: 'Wheat Ridge',      lat: 39.7661, lng: -105.0897 },
  { name: 'Lakewood',         lat: 39.7047, lng: -105.0813 },
  { name: 'Aurora',           lat: 39.7247, lng: -104.8319 },
  { name: 'Englewood',        lat: 39.6486, lng: -104.9878 },
  { name: 'Littleton',        lat: 39.6133, lng: -105.0166 },
];

/**
 * Returns the name of the nearest neighborhood to the given coordinates,
 * or null if the nearest centroid is farther than MAX_NEIGHBORHOOD_MILES
 * (caller should fall back to a distance label in that case).
 */
export function nearestNeighborhood(lat: number, lng: number): string | null {
  let best: { name: string; distance: number } | null = null;
  for (const n of NEIGHBORHOODS) {
    const d = distanceMiles(lat, lng, n.lat, n.lng);
    if (best === null || d < best.distance) {
      best = { name: n.name, distance: d };
    }
  }
  if (!best || best.distance > MAX_NEIGHBORHOOD_MILES) return null;
  return best.name;
}
