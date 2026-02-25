// Denver neighborhoods for proximity labeling on charity cards and detail pages.
// Detection is heuristic: match against location address strings.

export const DENVER_NEIGHBORHOODS = [
  'Five Points', 'Capitol Hill', 'LoDo', 'RiNo', 'Highlands', 'Curtis Park',
  'Stapleton', 'Central Park', 'Washington Park', 'Wash Park', 'Cheesman Park',
  'Baker', "Sloan's Lake", 'Park Hill', 'Congress Park', 'Montbello', 'Globeville',
  'Elyria-Swansea', 'Cole', 'City Park', 'South Park Hill', 'North Park Hill',
  'Virginia Village', 'Whittier', 'Sunnyside', 'Berkeley', 'Regis', 'Barnum',
  'Valverde', 'Ruby Hill', 'Harvey Park', 'Overland', 'Platt Park', 'Rosedale',
  'University Hills', 'Hampden', 'Windsor', 'Colfax', 'Swansea', 'Clayton',
  'Skyland', 'Hale', 'Montclair', 'Hilltop', 'Belcaro', 'Bonnie Brae', 'Cherry Creek',
  'Stapleton', 'Central Park', 'Globeville', 'Lincoln Park', 'Sun Valley',
  'Jefferson Park', 'Potter-Highlands', 'North Capitol Hill', 'Alamo Placita',
  'Country Club', 'Speer', 'West Colfax', 'Villa Park', 'Barnum West',
];

export function detectNeighborhood(address: string | null): string | null {
  if (!address) return null;
  const lower = address.toLowerCase();
  for (const n of DENVER_NEIGHBORHOODS) {
    if (lower.includes(n.toLowerCase())) return n;
  }
  return null;
}

// Returns unique neighborhoods from all of a charity's locations, deduped.
export function charityNeighborhoods(
  locations: { address?: string | null; label?: string }[]
): string[] {
  const found: string[] = [];
  for (const loc of locations) {
    const n = detectNeighborhood(loc.address ?? null);
    if (n && !found.includes(n)) found.push(n);
  }
  return found;
}
