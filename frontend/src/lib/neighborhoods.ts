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
  { name: 'Globeville',       lat: 39.7852, lng: -104.9998 },
  { name: 'Sunnyside',        lat: 39.7826, lng: -105.0180 },
  { name: 'Berkeley',         lat: 39.7936, lng: -105.0489 },
  { name: 'Elyria-Swansea',   lat: 39.7763, lng: -104.9552 },
  { name: 'RiNo',             lat: 39.7717, lng: -104.9807 },
  { name: 'Highland',         lat: 39.7714, lng: -105.0178 },
  { name: 'LoHi',             lat: 39.7620, lng: -105.0195 },
  { name: 'Curtis Park',      lat: 39.7630, lng: -104.9730 },
  { name: 'Cole',             lat: 39.7618, lng: -104.9618 },
  { name: 'Jefferson Park',   lat: 39.7574, lng: -105.0280 },
  { name: 'Five Points',      lat: 39.7566, lng: -104.9757 },
  { name: 'Central Park',     lat: 39.7572, lng: -104.9094 },
  { name: 'Ballpark',         lat: 39.7561, lng: -104.9940 },
  { name: 'LoDo',             lat: 39.7527, lng: -104.9998 },
  { name: 'Whittier',         lat: 39.7530, lng: -104.9625 },
  { name: 'Sloan Lake',       lat: 39.7489, lng: -105.0464 },
  { name: 'West Colfax',      lat: 39.7420, lng: -105.0400 },
  { name: 'City Park',        lat: 39.7458, lng: -104.9554 },
  { name: 'Park Hill',        lat: 39.7466, lng: -104.9320 },
  { name: 'Hale',             lat: 39.7222, lng: -104.9390 },
  { name: 'Montclair',        lat: 39.7163, lng: -104.9220 },
  { name: 'Edgewater',        lat: 39.7452, lng: -105.0726 },
  { name: 'Cap Hill',         lat: 39.7316, lng: -104.9758 },
  { name: 'Congress Park',    lat: 39.7315, lng: -104.9478 },
  { name: 'Lincoln Park',     lat: 39.7390, lng: -104.9980 },
  { name: 'Barnum',           lat: 39.7240, lng: -105.0270 },
  { name: 'Cherry Creek',     lat: 39.7178, lng: -104.9544 },
  { name: 'Baker',            lat: 39.7134, lng: -104.9962 },
  { name: 'Athmar Park',      lat: 39.7090, lng: -104.9950 },
  { name: 'Wash Park',        lat: 39.6982, lng: -104.9683 },
  { name: 'University Park',  lat: 39.6900, lng: -104.9550 },
  { name: 'Platt Park',       lat: 39.6887, lng: -104.9858 },
  { name: 'Ruby Hill',        lat: 39.6870, lng: -105.0060 },
  { name: 'Harvey Park',      lat: 39.6780, lng: -105.0380 },
  { name: 'Virginia Village', lat: 39.6940, lng: -104.9319 },
  { name: 'University Hills', lat: 39.6620, lng: -104.9550 },
  { name: 'Hampden',          lat: 39.6550, lng: -104.9600 },

  // Suburbs
  { name: 'Westminster',      lat: 39.8367, lng: -105.0372 },
  { name: 'Commerce City',    lat: 39.8086, lng: -104.9341 },
  { name: 'Northglenn',       lat: 39.8872, lng: -104.9808 },
  { name: 'Thornton',         lat: 39.8677, lng: -104.9719 },
  { name: 'Broomfield',       lat: 39.9205, lng: -105.0867 },
  { name: 'Louisville',       lat: 39.9778, lng: -105.1319 },
  { name: 'Lafayette',        lat: 39.9936, lng: -105.0897 },
  { name: 'Superior',         lat: 39.9528, lng: -105.1670 },
  { name: 'Boulder',          lat: 40.0150, lng: -105.2705 },
  { name: 'Arvada',           lat: 39.8028, lng: -105.0875 },
  { name: 'Golden',           lat: 39.7555, lng: -105.2211 },
  { name: 'Wheat Ridge',      lat: 39.7661, lng: -105.0897 },
  { name: 'Lakewood',         lat: 39.7047, lng: -105.0813 },
  { name: 'Glendale',         lat: 39.7047, lng: -104.9307 },
  { name: 'Aurora',           lat: 39.7247, lng: -104.8319 },
  { name: 'Englewood',        lat: 39.6486, lng: -104.9878 },
  { name: 'Centennial',       lat: 39.5786, lng: -104.8769 },
  { name: 'Littleton',        lat: 39.6133, lng: -105.0166 },
  { name: 'Highlands Ranch',  lat: 39.5500, lng: -104.9697 },
  { name: 'Parker',           lat: 39.5186, lng: -104.7614 },
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
