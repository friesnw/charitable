import { useState, useEffect } from 'react';

const EARTH_RADIUS_MILES = 3958.8;

export function distanceMiles(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return EARTH_RADIUS_MILES * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function distanceLabel(miles: number): string {
  if (miles < 0.5) return 'In your neighborhood';
  if (miles < 10) return `${miles.toFixed(1)} mi away`;
  return `${Math.round(miles)} mi away`;
}

export function useGeolocation(): { lat: number; lng: number } | null {
  const [pos, setPos] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    if (!navigator.geolocation) return;
    const id = navigator.geolocation.watchPosition(
      ({ coords }) => setPos({ lat: coords.latitude, lng: coords.longitude }),
      () => setPos(null),
      { enableHighAccuracy: false, timeout: 8000 }
    );
    return () => navigator.geolocation.clearWatch(id);
  }, []);

  return pos;
}

export function nearestLocation<T extends { latitude: number | null; longitude: number | null }>(
  userPos: { lat: number; lng: number },
  locations: T[]
): { distance: number; location: T } | null {
  let best: { distance: number; location: T } | null = null;
  for (const loc of locations) {
    if (loc.latitude == null || loc.longitude == null) continue;
    const d = distanceMiles(userPos.lat, userPos.lng, loc.latitude, loc.longitude);
    if (best == null || d < best.distance) {
      best = { distance: d, location: loc };
    }
  }
  return best;
}
