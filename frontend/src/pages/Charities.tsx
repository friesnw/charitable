import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useQuery, useLazyQuery, useMutation, gql } from '@apollo/client';
import { cloudinaryUrl } from '../lib/cloudinary';
import { causeColor, causeIcon, FEATURED_TAGS, causesToTagLabels } from '../lib/causeColors';
import { nearestNeighborhood, NEIGHBORHOODS } from '../lib/neighborhoods';
import { Icon } from '../components/ui/Icon';
import { Toast } from '../components/ui/Toast';
import { useAuth } from '../hooks/useAuth';
import Map, { MapRef, Marker } from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';

const MY_PREFERENCES_ZIP = gql`
  query MyPreferencesZip {
    myPreferences { zipCode neighborhood }
  }
`;

const RESOLVE_ZIP = gql`
  query ResolveZipForMap($zip: String!) {
    resolveZip(zip: $zip) { latitude longitude zoom state }
  }
`;

const SAVE_PREFERENCES = gql`
  mutation SavePreferencesFromMap($zipCode: String, $neighborhood: String) {
    savePreferences(zipCode: $zipCode, neighborhood: $neighborhood) { zipCode neighborhood onboardingCompleted }
  }
`;

const GET_CAUSES = gql`query GetCauses { causes { tag label } }`;
const GET_CHARITIES = gql`
  query GetCharities($tags: [String]) {
    charities(tags: $tags) {
      id slug name description logoUrl causeTags donateUrl coverPhotoUrl
      locations { id label description address photoUrl latitude longitude isSublocation }
    }
  }
`;

interface Charity {
  id: string; slug: string; name: string; description: string | null;
  logoUrl: string | null; causeTags: string[]; donateUrl: string | null; coverPhotoUrl: string | null;
  locations: { id: string; label: string; description: string | null; address: string | null; photoUrl: string | null; latitude: number | null; longitude: number | null; isSublocation: boolean }[];
}

interface LocationEntry { charity: Charity; location: Charity['locations'][0]; }
interface LocationGroup { lat: number; lng: number; address: string | null; entries: LocationEntry[]; }


/** Group all charity locations by exact address match. Locations without an address fall back to their own group. */
function buildLocationGroups(charities: Charity[]): LocationGroup[] {
  const groups: LocationGroup[] = [];
  for (const charity of charities) {
    for (const loc of charity.locations) {
      if (loc.latitude == null || loc.longitude == null) continue;
      const normalizedAddress = loc.address?.trim().toLowerCase() ?? null;
      const existing = normalizedAddress
        ? groups.find((g) => g.address != null && g.address === normalizedAddress)
        : null;
      if (existing) {
        existing.entries.push({ charity, location: loc });
      } else {
        groups.push({ lat: loc.latitude, lng: loc.longitude, address: normalizedAddress, entries: [{ charity, location: loc }] });
      }
    }
  }
  return groups;
}

function SkeletonCard() {
  return (
    <div className="px-4 py-4 border-b border-brand-tertiary animate-pulse">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-8 h-8 rounded-full bg-bg-accent flex-shrink-0" />
        <div className="h-3.5 bg-bg-accent rounded w-2/5" />
      </div>
      <div className="h-2.5 bg-bg-accent rounded w-full mb-1.5" />
      <div className="h-2.5 bg-bg-accent rounded w-3/4 mb-3" />
      <div className="flex gap-1.5">
        <div className="h-4 bg-bg-accent rounded w-14" />
        <div className="h-4 bg-bg-accent rounded w-16" />
      </div>
    </div>
  );
}

function pinSize(zoom: number): number {
  if (zoom >= 15) return 44;
  if (zoom <= 9) return 10;
  return 10 + ((zoom - 9) / 6) * 34; // interpolate 10→44 over zoom 9–15
}

function CauseDot({ color, icon, size = 32 }: { color: string; icon: string; size?: number }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%', backgroundColor: color,
      border: '2.5px solid white', boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
      cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.44, lineHeight: 1,
    }}>
      {icon}
    </div>
  );
}


function LocationDrawer({ group, tagLabels, onClose }: { group: LocationGroup; tagLabels: Map<string, string>; onClose: () => void }) {
  const [visible, setVisible] = useState(false);
  const touchStartY = useRef<number>(0);
  const hood = nearestNeighborhood(group.lat, group.lng);
  const sorted = [...group.entries].sort((a, b) => Number(a.location.isSublocation) - Number(b.location.isSublocation));

  useEffect(() => {
    const id = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(id);
  }, []);

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-30 transition-transform duration-300 ease-out lg:left-auto lg:right-4 lg:bottom-4 lg:w-[420px]"
      style={{ transform: visible ? 'translateY(0)' : 'translateY(100%)' }}
    >
      <div className="bg-white rounded-t-2xl lg:rounded-2xl shadow-2xl overflow-hidden max-h-[85vh] flex flex-col">
        {/* Drag handle — mobile only */}
        <div
          className="flex justify-center pt-3 pb-1 flex-shrink-0 lg:hidden"
          onTouchStart={(e) => { touchStartY.current = e.touches[0].clientY; }}
          onTouchEnd={(e) => { if (e.changedTouches[0].clientY - touchStartY.current > 80) onClose(); }}
        >
          <div className="w-10 h-1 rounded-full bg-gray-300" />
        </div>

        <div className="overflow-y-auto flex-1 divide-y divide-gray-100">
          {sorted.map(({ charity, location }) => (
            <div key={`${charity.id}-${location.id}`}>
              {location.isSublocation ? (
                // Sublocation: padded shorter image
                <div>
                  {location.photoUrl && (
                    <div className="px-4 pt-4">
                      <div className="relative w-full h-28 rounded-xl overflow-hidden">
                        <img src={cloudinaryUrl(location.photoUrl, { w: 800, h: 224, fit: 'fill' })} alt={location.label} className="w-full h-full object-cover" />
                      </div>
                    </div>
                  )}
                  <div className="px-4 pt-3 pb-4">
                    <div className="flex items-center gap-2 mb-0.5">
                      {charity.logoUrl ? (
                        <img src={cloudinaryUrl(charity.logoUrl, { w: 28, h: 28, fit: 'fit' })} alt={charity.name} className="w-6 h-6 rounded-full object-contain flex-shrink-0 border border-gray-100" />
                      ) : null}
                      <p className="text-xs text-gray-500">{charity.name}</p>
                    </div>
                    <h3 className="text-base font-bold text-gray-900 leading-snug mb-1">{location.label}</h3>
                    {location.description && (
                      <p className="text-sm text-gray-700 mb-3">{location.description}</p>
                    )}
                    <Link to={`/charities/${charity.slug}`} className="block text-center py-2.5 rounded-lg text-sm font-medium text-white bg-brand-secondary hover:opacity-90 transition-opacity">View charity →</Link>
                  </div>
                </div>
              ) : (
                // Primary: full-bleed hero with gradient + neighborhood badge + close button
                <div>
                  <div className="relative w-full h-44 flex-shrink-0 overflow-hidden">
                    {location.photoUrl ? (
                      <img src={cloudinaryUrl(location.photoUrl, { w: 800, h: 352, fit: 'fill' })} alt={location.label} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full" style={{ backgroundColor: causeColor(charity.causeTags) }} />
                    )}
                    <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 60%)' }} />
                    {hood && (
                      <span className="absolute bottom-3 left-3 text-white text-xs font-semibold bg-black/40 backdrop-blur-sm px-2 py-1 rounded-full">
                        {hood}
                      </span>
                    )}
                    <button
                      onClick={onClose}
                      className="absolute top-3 right-3 w-7 h-7 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/50"
                      aria-label="Close"
                    >
                      ✕
                    </button>
                  </div>
                  <div className="px-4 pt-3 pb-4">
                    <div className="flex items-center gap-2 mb-0.5">
                      {charity.logoUrl ? (
                        <img src={cloudinaryUrl(charity.logoUrl, { w: 32, h: 32, fit: 'fit' })} alt={charity.name} className="w-7 h-7 rounded-full object-contain flex-shrink-0 border border-gray-100" />
                      ) : (
                        <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500 flex-shrink-0">
                          {charity.name.slice(0, 2).toUpperCase()}
                        </div>
                      )}
                      <p className="text-xs text-gray-500">{charity.name}</p>
                    </div>
                    <h2 className="text-lg font-bold text-gray-900 leading-snug mb-1">{location.label}</h2>
                    {location.address && (
                      <p className="text-sm text-gray-500 mb-2">{location.address}</p>
                    )}
                    {location.description && (
                      <p className="text-sm text-gray-700 mb-3">{location.description}</p>
                    )}
                    <Link to={`/charities/${charity.slug}`} className="block text-center py-2.5 rounded-lg text-sm font-medium text-white bg-brand-secondary hover:opacity-90 transition-opacity">View charity →</Link>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const CURATED_NAMES = ['Cap Hill','RiNo','Highland','LoDo','Five Points','City Park','Baker','Wash Park','Cherry Creek','Edgewater'];
const curatedNeighborhoods = NEIGHBORHOODS.filter((n) => CURATED_NAMES.includes(n.name));

function LocationIntro({
  onNeighborhoodSelect,
  onZipSubmit,
  onSkip,
}: {
  onNeighborhoodSelect: (name: string, lat: number, lng: number) => void;
  onZipSubmit: (zip: string) => void;
  onSkip: () => void;
}) {
  const [zipValue, setZipValue] = useState('');
  const [search, setSearch] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const matches = search.trim().length > 0
    ? NEIGHBORHOODS.filter((n) => n.name.toLowerCase().includes(search.toLowerCase()))
    : [];

  function handleZip() {
    const digits = zipValue.replace(/\D/g, '');
    if (digits.length === 5) onZipSubmit(digits);
  }

  return (
    <div className="absolute inset-0 z-20 bg-bg-primary overflow-y-auto flex flex-col items-center justify-start py-14 px-4">
      <div className="w-full max-w-2xl text-center">
        <h1 className="text-3xl font-bold text-text-primary mb-8">Where in Denver are you located?</h1>


        {/* ZIP input */}
        <div className="flex gap-2 justify-center mb-10">
          <input
            type="text"
            inputMode="numeric"
            placeholder="Enter ZIP code"
            value={zipValue}
            onChange={(e) => setZipValue(e.target.value.replace(/\D/g, '').slice(0, 5))}
            onKeyDown={(e) => e.key === 'Enter' && handleZip()}
            maxLength={5}
            className="w-44 px-4 py-3 rounded-xl border border-brand-tertiary bg-bg-primary text-text-primary placeholder-text-secondary text-base focus:outline-none focus:border-brand-secondary"
          />
          <button
            onClick={handleZip}
            disabled={zipValue.length !== 5}
            className="px-6 py-3 rounded-xl bg-brand-secondary text-white font-semibold disabled:opacity-40 hover:opacity-90 transition-opacity"
          >
            Go
          </button>
        </div>

        <div className="flex items-center gap-4 mb-10">
          <div className="flex-1 h-px bg-brand-tertiary" />
          <span className="text-sm text-text-secondary">or pick your neighborhood</span>
          <div className="flex-1 h-px bg-brand-tertiary" />
        </div>

        {/* Neighborhood chips + inline search */}
        <div className="flex flex-wrap gap-2 justify-center mb-10">
          {curatedNeighborhoods.map((n) => (
            <button
              key={n.name}
              onClick={() => onNeighborhoodSelect(n.name, n.lat, n.lng)}
              className="flex-shrink-0 text-xs px-3 py-1.5 rounded-full shadow font-medium transition-all hover:ring-1 hover:ring-brand-secondary"
              style={{ backgroundColor: 'rgba(255,255,255,0.9)', color: '#374151', border: '1px solid #e5e7eb' }}
            >
              {n.name}
            </button>
          ))}
          <div className="relative flex-shrink-0">
            <input
              type="text"
              placeholder="More neighborhoods..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setDropdownOpen(true); }}
              onFocus={() => setDropdownOpen(true)}
              onBlur={() => setTimeout(() => setDropdownOpen(false), 150)}
              className="text-xs px-3 py-1.5 rounded-full shadow font-medium focus:outline-none"
              style={{ backgroundColor: 'rgba(255,255,255,0.9)', color: '#6b7280', border: '1px solid #e5e7eb', width: '160px' }}
            />
            {dropdownOpen && matches.length > 0 && (
              <ul className="absolute left-0 top-full mt-1 min-w-full bg-bg-primary border border-brand-tertiary rounded-xl shadow-lg overflow-hidden z-10 text-left">
                {matches.map((n) => (
                  <li key={n.name}>
                    <button
                      onMouseDown={() => { onNeighborhoodSelect(n.name, n.lat, n.lng); }}
                      className="w-full text-left px-4 py-2.5 text-sm text-text-primary hover:bg-bg-accent transition-colors"
                    >
                      {n.name}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <button
          onClick={onSkip}
          className="text-sm text-text-secondary hover:text-text-primary underline underline-offset-2 transition-colors"
        >
          Explore all of Denver →
        </button>
      </div>
    </div>
  );
}

function StackedPin({ group, isSelected, isHovered, isDimmed, zoom }: { group: LocationGroup; isSelected: boolean; isHovered: boolean; isDimmed: boolean; zoom: number }) {
  const scale = isSelected ? 1.45 : isHovered ? 1.2 : 1;
  const { entries } = group;
  const size = pinSize(zoom);
  const isSmall = size < 22;
  const icon = isSmall ? '' : causeIcon(entries[0].charity.causeTags);

  if (entries.length === 1 || isSmall) {
    return (
      <div style={{ transform: `scale(${scale})`, transition: 'transform 0.15s, opacity 0.15s', opacity: isDimmed ? 0.35 : 1 }}>
        <CauseDot color={causeColor(entries[0].charity.causeTags)} icon={icon} size={size} />
      </div>
    );
  }

  // Stacked overlapping dots
  const overlap = Math.round(size * 0.31);
  const totalWidth = size + (entries.length - 1) * (size - overlap);
  return (
    <div style={{ transform: `scale(${scale})`, transition: 'transform 0.15s, opacity 0.15s', opacity: isDimmed ? 0.35 : 1, position: 'relative', width: totalWidth, height: size }}>
      {entries.map((entry, i) => (
        <div key={entry.location.id} style={{ position: 'absolute', left: i * (size - overlap), top: 0, zIndex: entries.length - i }}>
          <CauseDot color={causeColor(entry.charity.causeTags)} icon={isSmall ? '' : causeIcon(entry.charity.causeTags)} size={size} />
        </div>
      ))}
    </div>
  );
}

const ZIP_ZOOM_OFFSET = -1;

export function Charities() {
  const { isAuthenticated } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const selectedTag = searchParams.get('tag') ?? null;
  const viewMode = searchParams.get('view') === 'list' ? 'list' : 'map';

  const [zoom, setZoom] = useState(11.5);
  const [selectedGroupKey, setSelectedGroupKey] = useState<string | null>(null);
  const [selectedCharityId, setSelectedCharityId] = useState<string | null>(null);
  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(null);
  const [hoveredCharityId, setHoveredCharityId] = useState<string | null>(null);
  const [showAllTags, setShowAllTags] = useState(false);

  const [initialCenter, setInitialCenter] = useState<{ longitude: number; latitude: number; zoom: number } | undefined>();
  const [activeZip, setActiveZip] = useState<string | null>(null);
  const [locationEditing, setLocationEditing] = useState(false);
  const [locationQuery, setLocationQuery] = useState('');

  const [mapReady, setMapReady] = useState(false);

  const mapRef = useRef<MapRef>(null);
  const savedView = useRef<{ center: [number, number]; zoom: number } | null>(null);
  const pendingCenterRef = useRef<{ longitude: number; latitude: number; zoom: number } | null>(null);
  const hasPositioned = useRef(false);

  const [introSkipped, setIntroSkipped] = useState(false);
  const [activeNeighborhood, setActiveNeighborhood] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string } | null>(null);

  const [resolveZip] = useLazyQuery(RESOLVE_ZIP);
  const [savePreferences] = useMutation(SAVE_PREFERENCES, {
    update(cache, { data }) {
      if (!data?.savePreferences) return;
      cache.writeQuery({
        query: MY_PREFERENCES_ZIP,
        data: { myPreferences: { zipCode: data.savePreferences.zipCode, neighborhood: data.savePreferences.neighborhood } },
      });
    },
  });
  const { data: prefsData, loading: prefsLoading } = useQuery(MY_PREFERENCES_ZIP, { skip: !isAuthenticated });
  const { loading, error, data } = useQuery(GET_CHARITIES, { variables: { tags: selectedTag ? [selectedTag] : undefined } });
  const { data: causesData } = useQuery(GET_CAUSES);

  const tagLabels = causesToTagLabels(causesData?.causes ?? []);
  const charities: Charity[] = data?.charities ?? [];
  const groups = useMemo(() => buildLocationGroups(charities), [charities]);

  const availableTags = Array.from(new Set(charities.flatMap((c) => c.causeTags)));
  const featuredTags = FEATURED_TAGS.filter((t) => availableTags.includes(t));
  const remainingTags = availableTags.filter((t) => !FEATURED_TAGS.includes(t)).sort();
  const effectiveShowAll = showAllTags || (!!selectedTag && remainingTags.includes(selectedTag));
  const visibleTags = effectiveShowAll ? [...featuredTags, ...remainingTags] : featuredTags;

  const groupKey = (g: LocationGroup) => g.address ?? `${g.lat},${g.lng}`;
  const selectedGroup = selectedGroupKey ? groups.find((g) => groupKey(g) === selectedGroupKey) ?? null : null;

  function updateSelectedTag(tag: string | null) {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (tag) next.set('tag', tag); else next.delete('tag');
      return next;
    });
  }

  function updateViewMode(mode: 'list' | 'map') {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (mode === 'list') next.set('view', 'list'); else next.delete('view');
      return next;
    });
    if (mode === 'list') {
      setSelectedGroupKey(null);
      setSelectedCharityId(null);
      setSelectedLocationId(null);
    }
  }

  // Location from auth preferences
  useEffect(() => {
    if (!isAuthenticated || !prefsData?.myPreferences) return;
    const { zipCode, neighborhood } = prefsData.myPreferences;
    if (zipCode) {
      setActiveZip(zipCode);
      resolveZip({ variables: { zip: zipCode } }).then(({ data }) => {
        const info = data?.resolveZip;
        if (info?.state === 'CO') setInitialCenter({ longitude: info.longitude, latitude: info.latitude, zoom: info.zoom });
      });
    } else if (neighborhood) {
      const hood = NEIGHBORHOODS.find((n) => n.name === neighborhood);
      if (hood) {
        setActiveNeighborhood(hood.name);
        setInitialCenter({ longitude: hood.lng, latitude: hood.lat, zoom: 14 });
      }
    }
  }, [isAuthenticated, prefsData]);

  // Zip/neighborhood from localStorage for unauthenticated users
  useEffect(() => {
    if (!isAuthenticated) {
      const localZip = localStorage.getItem('userZip');
      if (localZip) {
        setActiveZip(localZip);
        resolveZip({ variables: { zip: localZip } }).then(({ data }) => {
          const info = data?.resolveZip;
          if (info?.state === 'CO') setInitialCenter({ longitude: info.longitude, latitude: info.latitude, zoom: info.zoom });
        });
        return;
      }
      const localHood = localStorage.getItem('userNeighborhood');
      if (localHood) {
        const parsed = JSON.parse(localHood) as { name: string; lat: number; lng: number };
        setActiveNeighborhood(parsed.name);
        setInitialCenter({ longitude: parsed.lng, latitude: parsed.lat, zoom: 14 });
      }
    }
  }, [isAuthenticated]);

  // Show intro when no location is set and user hasn't skipped.
  // Wait for preferences to finish loading before deciding (avoids flash for authed users with a zip).
  const showIntro =
    !introSkipped &&
    activeZip === null &&
    activeNeighborhood === null &&
    (!isAuthenticated || !prefsLoading);

  const isZipMode = /^\d/.test(locationQuery);
  const locationSuggestions = !isZipMode && locationQuery.trim().length > 0
    ? NEIGHBORHOODS.filter((n) => n.name.toLowerCase().includes(locationQuery.toLowerCase())).slice(0, 6)
    : [];

  function cancelEditing() { setLocationEditing(false); setLocationQuery(''); }

  function handleNeighborhoodSelect(name: string, lat: number, lng: number) {
    setActiveNeighborhood(name);
    setInitialCenter({ longitude: lng, latitude: lat, zoom: 14});
    setIntroSkipped(true);
    setToast({ message: `Near ${name}` });
    if (isAuthenticated) {
      savePreferences({ variables: { neighborhood: name, zipCode: null } });
    } else {
      localStorage.setItem('userNeighborhood', JSON.stringify({ name, lat, lng }));
    }
  }

  // Sidebar-only: fly map, no toast, no preference save
  function handleSidebarNeighborhoodSelect(name: string, lat: number, lng: number) {
    setActiveNeighborhood(name);
    setActiveZip(null);
    setInitialCenter({ longitude: lng, latitude: lat, zoom: 14});
    if (!isAuthenticated) localStorage.setItem('userNeighborhood', JSON.stringify({ name, lat, lng }));
    cancelEditing();
  }

  function handleChangeLocation() {
    setActiveZip(null);
    setActiveNeighborhood(null);
    setIntroSkipped(false);
    setToast(null);
    localStorage.removeItem('userZip');
    localStorage.removeItem('userNeighborhood');
  }

  // Fly to zip-based center when initialCenter changes
  useEffect(() => {
    if (!initialCenter) return;
    const isFirst = !hasPositioned.current;
    hasPositioned.current = true;
    if (mapRef.current?.isStyleLoaded()) {
      mapRef.current.flyTo({ center: [initialCenter.longitude, initialCenter.latitude], zoom: initialCenter.zoom + ZIP_ZOOM_OFFSET, duration: isFirst ? 0 : 800 });
      if (isFirst) setMapReady(true);
    } else {
      pendingCenterRef.current = initialCenter;
    }
  }, [initialCenter]);

  // If showIntro becomes true (no saved location), mark map as ready — intro covers it anyway
  useEffect(() => {
    if (showIntro && !hasPositioned.current) setMapReady(true);
  }, [showIntro]);

  function handleMapLoad() {
    const center = pendingCenterRef.current;
    if (center && mapRef.current) {
      hasPositioned.current = true;
      mapRef.current.flyTo({ center: [center.longitude, center.latitude], zoom: center.zoom + ZIP_ZOOM_OFFSET, duration: 0 });
      pendingCenterRef.current = null;
      setMapReady(true);
    }
  }

  // Fly to selected pin or charity's pins, or return to saved view when deselected
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const pad = { top: 80, bottom: 60, left: 40, right: 40 };

    if (selectedGroupKey) {
      const group = groups.find((g) => groupKey(g) === selectedGroupKey);
      if (!group) return;
      const center = map.getCenter();
      savedView.current = { center: [center.lng, center.lat], zoom: map.getZoom() };
      map.flyTo({ center: [group.lng, group.lat], zoom: 14, duration: 600, padding: pad });
    } else if (selectedCharityId) {
      const charity = charities.find((c) => c.id === selectedCharityId);
      const locs = charity?.locations.filter((l) => l.latitude != null && l.longitude != null) ?? [];
      if (locs.length === 0) return;
      const center = map.getCenter();
      savedView.current = { center: [center.lng, center.lat], zoom: map.getZoom() };
      if (locs.length === 1) {
        map.flyTo({ center: [locs[0].longitude!, locs[0].latitude!], zoom: 13, duration: 600, padding: pad });
      } else {
        const lngs = locs.map((l) => l.longitude!);
        const lats = locs.map((l) => l.latitude!);
        map.fitBounds([[Math.min(...lngs), Math.min(...lats)], [Math.max(...lngs), Math.max(...lats)]], { padding: pad, maxZoom: 14, duration: 600 });
      }
    } else if (savedView.current) {
      map.flyTo({ center: savedView.current.center, zoom: savedView.current.zoom, duration: 600 });
      savedView.current = null;
    }
  }, [selectedCharityId, selectedGroupKey]);

  return (
    <div className="flex relative" style={{ height: 'calc(100vh - 65px)' }}>
      {showIntro && (
        <LocationIntro
          onNeighborhoodSelect={handleNeighborhoodSelect}
          onZipSubmit={(zip) => {
            resolveZip({ variables: { zip } }).then(({ data }) => {
              const info = data?.resolveZip;
              if (!info) return;
              if (isAuthenticated) {
                savePreferences({ variables: { zipCode: zip, neighborhood: null } });
              } else {
                localStorage.setItem('userZip', zip);
                localStorage.removeItem('userNeighborhood');
              }
              setActiveZip(zip);
              setInitialCenter({ longitude: info.longitude, latitude: info.latitude, zoom: info.zoom });
              setIntroSkipped(true);
              setToast({ message: `Near ${zip}` });
            });
          }}
          onSkip={() => setIntroSkipped(true)}
        />
      )}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className={['flex-shrink-0 flex-col border-r border-brand-tertiary bg-bg-primary', 'lg:flex lg:w-96', viewMode === 'list' ? 'flex w-full' : 'hidden'].join(' ')}>
          {/* Location combobox row — fixed height, dropdown overflows absolutely */}
          <div className={`relative flex-shrink-0 border-b px-4 py-2.5 flex items-center gap-2 ${locationEditing ? 'border-brand-secondary' : 'border-brand-tertiary'}`}>
            <Icon name="map-pin" className="w-4 h-4 text-text-secondary flex-shrink-0" />
            {locationEditing ? (
              <>
                <input
                  type="text"
                  placeholder="ZIP or neighborhood..."
                  value={locationQuery}
                  autoFocus
                  onChange={(e) => {
                    const val = e.target.value;
                    setLocationQuery(val);
                    const digits = val.replace(/\D/g, '');
                    if (/^\d/.test(val) && digits.length === 5) {
                      resolveZip({ variables: { zip: digits } }).then(({ data }) => {
                        const info = data?.resolveZip;
                        if (!info) return;
                        setActiveZip(digits);
                        setActiveNeighborhood(null);
                        setInitialCenter({ longitude: info.longitude, latitude: info.latitude, zoom: info.zoom });
                        if (!isAuthenticated) { localStorage.setItem('userZip', digits); localStorage.removeItem('userNeighborhood'); }
                        cancelEditing();
                      });
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Escape') { cancelEditing(); return; }
                    if (e.key === 'Enter' && locationSuggestions.length > 0) {
                      const n = locationSuggestions[0];
                      handleSidebarNeighborhoodSelect(n.name, n.lat, n.lng);
                    }
                  }}
                  onBlur={() => setTimeout(cancelEditing, 150)}
                  className="flex-1 min-w-0 outline-none text-sm text-text-primary bg-transparent"
                />
                <button onClick={cancelEditing} className="text-text-secondary hover:text-text-primary text-sm flex-shrink-0">✕</button>
                {locationSuggestions.length > 0 && (
                  <ul className="absolute left-0 right-0 top-full mt-0 bg-bg-primary border border-brand-tertiary rounded-xl shadow-lg overflow-hidden z-20">
                    {locationSuggestions.map((n) => (
                      <li key={n.name}>
                        <button
                          onMouseDown={() => handleSidebarNeighborhoodSelect(n.name, n.lat, n.lng)}
                          className="w-full text-left px-4 py-2.5 text-sm text-text-primary hover:bg-bg-accent transition-colors"
                        >
                          {n.name}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </>
            ) : (
              <button
                onClick={() => setLocationEditing(true)}
                className="flex-1 min-w-0 text-left text-sm text-text-primary hover:text-brand-secondary transition-colors truncate"
              >
                {activeZip ? `Near ${activeZip}` : activeNeighborhood ? `Near ${activeNeighborhood}` : 'Set location'}
              </button>
            )}
          </div>

          {/* Mobile-only: switch to map view */}
          <div className="lg:hidden flex-shrink-0 border-b border-brand-tertiary">
            <button
              onClick={() => updateViewMode('map')}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold text-text-primary hover:bg-bg-accent transition-colors"
            >
              <Icon name="map-pin" className="w-4 h-4 text-text-secondary" />
              Show map
            </button>
          </div>

          {(selectedCharityId || selectedGroupKey) && (
            <button
              onClick={() => { setSelectedGroupKey(null); setSelectedCharityId(null); setSelectedLocationId(null); }}
              className="w-full text-left px-4 py-3 border-b border-brand-tertiary text-sm text-text-secondary hover:bg-bg-accent flex items-center gap-1 flex-shrink-0"
            >
              ← Back to all charities
            </button>
          )}

          <div className="overflow-y-auto flex-1">
            {loading && (
              <>
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard />
              </>
            )}
            {error && <p className="text-error p-4">Error: {error.message}</p>}
            {!loading && !error && charities.length === 0 && (
              <p className="text-text-secondary p-4">No charities found.</p>
            )}

            {charities
              .filter((c) => selectedCharityId === null || c.id === selectedCharityId)
              .map((charity) => {
                const isSelected = charity.id === selectedCharityId;
                const validLocs = charity.locations.filter((l) => l.latitude != null && l.longitude != null);
                return (
                  <div key={charity.id}>
                    <button
                      onClick={() => {
                        if (isSelected) {
                          setSelectedCharityId(null);
                          setSelectedLocationId(null);
                          setSelectedGroupKey(null);
                        } else {
                          setSelectedCharityId(charity.id);
                          setSelectedLocationId(null);
                          setSelectedGroupKey(null);
                        }
                      }}
                      onMouseEnter={() => setHoveredCharityId(charity.id)}
                      onMouseLeave={() => setHoveredCharityId(null)}
                      className="w-full text-left border-b border-brand-tertiary transition-colors hover:bg-bg-accent cursor-pointer"
                    >
                      {isSelected && charity.coverPhotoUrl && (
                        <div className="w-full h-32 overflow-hidden">
                          <img
                            src={cloudinaryUrl(charity.coverPhotoUrl, { w: 800, h: 256, fit: 'fill' })}
                            alt={charity.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <div className="px-4 py-3">
                      <div className="flex items-center gap-2 mb-1">
                        {charity.logoUrl ? (
                          <img src={cloudinaryUrl(charity.logoUrl, { w: 32, h: 32, fit: 'fit' })} alt={charity.name} className="w-8 h-8 rounded-full object-contain flex-shrink-0" />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-bg-accent flex items-center justify-center text-xs font-bold text-text-secondary flex-shrink-0">
                            {charity.name.slice(0, 2).toUpperCase()}
                          </div>
                        )}
                        <span className="font-bold text-text-primary text-sm">{charity.name}</span>
                      </div>
                      {charity.description && (
                        <p className={`text-text-secondary text-xs mt-1${isSelected ? '' : ' line-clamp-2'}`}>{charity.description}</p>
                      )}
                      {charity.causeTags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {charity.causeTags.map((tag) => (
                            <span key={tag} className="text-xs px-1.5 py-0.5 bg-bg-accent text-text-secondary rounded">
                              {tagLabels.get(tag) ?? tag}
                            </span>
                          ))}
                        </div>
                      )}
                      {isSelected && (
                        <div className="flex gap-2 mt-3" onClick={(e) => e.stopPropagation()}>
                          <Link
                            to={`/charities/${charity.slug}`}
                            className="flex-1 text-center py-2.5 rounded-lg text-sm font-medium text-white bg-brand-secondary hover:opacity-90 transition-opacity"
                          >
                            View charity →
                          </Link>
                        </div>
                      )}
                      </div>
                    </button>

                    {/* Inline location expansion */}
                    {isSelected && validLocs.length > 0 && (
                      <div className="border-b border-brand-tertiary">
                        <div className="px-4 pt-2 pb-1 text-xs font-semibold text-text-secondary uppercase tracking-wide">
                          Locations ({validLocs.length})
                        </div>
                        {validLocs.map((loc) => {
                          const isHighlighted = loc.id === selectedLocationId;
                          const normalizedAddress = loc.address?.trim().toLowerCase() ?? null;
                          const locGroup = normalizedAddress
                            ? groups.find((g) => g.address === normalizedAddress)
                            : groups.find((g) => g.lat === loc.latitude && g.lng === loc.longitude);
                          const isShared = locGroup && locGroup.entries.length > 1;
                          return (
                            <button
                              key={loc.id}
                              onClick={() => {
                                setSelectedLocationId(isHighlighted ? null : loc.id);
                                if (isShared && locGroup) setSelectedGroupKey(groupKey(locGroup));
                              }}
                              className={`w-full text-left transition-colors cursor-pointer ${
                                isHighlighted ? 'bg-brand-accent/30 border-l-4 border-l-brand-accent' : 'hover:bg-bg-accent'
                              } pl-8 pr-4 py-2.5 flex items-center gap-3`}
                            >
                              {loc.photoUrl ? (
                                <img src={cloudinaryUrl(loc.photoUrl, { w: 72, h: 72, fit: 'fill' })} alt={loc.label} className="w-14 h-14 rounded object-cover flex-shrink-0" />
                              ) : (
                                <div className="w-14 h-14 rounded bg-bg-accent border border-brand-tertiary flex-shrink-0 flex items-center justify-center text-text-secondary text-sm font-bold">
                                  {loc.label.trim().split(/\s+/).slice(0, 2).map((w) => w[0]).join('').toUpperCase()}
                                </div>
                              )}
                              <div className="min-w-0">
                                <div className="font-medium text-text-primary text-sm">{loc.label}</div>
                                {loc.description && <p className="text-text-secondary text-xs mt-0.5 truncate">{loc.description}</p>}
                                <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                                  {loc.latitude != null && loc.longitude != null && (() => {
                                    const hood = nearestNeighborhood(loc.latitude, loc.longitude);
                                    return hood ? (
                                      <span className="text-xs px-2 py-0.5 rounded-full border border-flair-green text-flair-green">{hood}</span>
                                    ) : null;
                                  })()}
                                </div>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
          </div>
        </div>

        {/* Map */}
        <div className={['relative', 'lg:block lg:flex-1', viewMode === 'list' ? 'hidden' : 'flex-1'].join(' ')}>
          {toast && (
            <Toast
              key={toast.message}
              message={toast.message}
              action={{ label: 'Change', onClick: handleChangeLocation }}
              onDismiss={() => setToast(null)}
            />
          )}
          {/* Tag filters */}
          <div className="absolute top-0 left-0 right-0 z-10 p-3 pointer-events-none">
            <div className="pointer-events-auto flex gap-2 overflow-x-auto pb-1">
              <button
                onClick={() => updateSelectedTag(null)}
                className={`flex-shrink-0 text-xs px-3 py-1.5 rounded-full shadow font-medium transition-colors ${!selectedTag ? 'bg-gray-900 text-white' : 'bg-white/90 backdrop-blur-sm text-gray-700 border border-gray-200 hover:bg-white'}`}
              >
                All
              </button>
              {visibleTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => { setShowAllTags(false); updateSelectedTag(tag === selectedTag ? null : tag); }}
                  className="flex-shrink-0 text-xs px-3 py-1.5 rounded-full shadow font-medium transition-all flex items-center gap-1"
                  style={tag === selectedTag
                    ? { backgroundColor: causeColor([tag]), color: 'white', border: `2px solid ${causeColor([tag])}` }
                    : { backgroundColor: 'rgba(255,255,255,0.9)', color: '#374151', border: '1px solid #e5e7eb' }}
                >
                  <span style={{ fontSize: 11 }}>{causeIcon([tag])}</span>
                  {tagLabels.get(tag) ?? tag}
                </button>
              ))}
              {!effectiveShowAll && remainingTags.length > 0 && (
                <button
                  onClick={() => setShowAllTags(true)}
                  className="flex-shrink-0 text-xs px-3 py-1.5 rounded-full shadow font-medium bg-white/90 backdrop-blur-sm text-gray-500 border border-gray-200 hover:bg-white"
                >
                  + {remainingTags.length} more
                </button>
              )}
            </div>
          </div>

          {/* Map/List toggle pill — mobile only */}
          <div className="lg:hidden absolute bottom-3 left-1/2 -translate-x-1/2 z-10">
            <div className="flex rounded-full shadow-lg border border-gray-200 bg-white/95 backdrop-blur-sm overflow-hidden">
              <button
                onClick={() => updateViewMode('map')}
                className="flex items-center gap-1.5 px-5 py-2.5 text-sm font-semibold transition-colors bg-gray-900 text-white"
              >
                Map
              </button>
              <button
                onClick={() => updateViewMode('list')}
                className="flex items-center gap-1.5 px-5 py-2.5 text-sm font-semibold transition-colors text-gray-600 hover:bg-gray-50"
              >
                List
              </button>
            </div>
          </div>

          {/* Loading overlay — fades out once initial position is set */}
          <div
            className="absolute inset-0 bg-bg-primary pointer-events-none"
            style={{ opacity: mapReady ? 0 : 1, transition: 'opacity 0.4s ease', zIndex: 8 }}
          />

          <Map
            ref={mapRef}
            mapboxAccessToken={import.meta.env.VITE_MAPBOX_TOKEN}
            initialViewState={{ longitude: -104.98832, latitude: 39.73669, zoom: 11.5 }}
            style={{ width: '100%', height: '100%' }}
            mapStyle="mapbox://styles/mapbox/light-v11"
            onLoad={handleMapLoad}
            onMove={(e) => setZoom(e.viewState.zoom)}
          >
            {groups.map((group) => {
              const key = groupKey(group);
              const isSelected = key === selectedGroupKey;
              const isHovered = group.entries.some((e) => e.charity.id === hoveredCharityId);
              const isDimmed = selectedCharityId != null && !group.entries.some((e) => e.charity.id === selectedCharityId) && !isHovered;
              const primaryEntry = [...group.entries].sort(
                (a, b) => Number(a.location.isSublocation) - Number(b.location.isSublocation)
              )[0];
              return (
                <Marker
                  key={key}
                  latitude={group.lat}
                  longitude={group.lng}
                  anchor="center"
                  onClick={(e) => {
                    e.originalEvent.stopPropagation();
                    if (isSelected) {
                      setSelectedGroupKey(null);
                      setSelectedCharityId(null);
                      setSelectedLocationId(null);
                    } else {
                      setSelectedGroupKey(key);
                      setSelectedCharityId(primaryEntry.charity.id);
                      setSelectedLocationId(primaryEntry.location.id);
                    }
                  }}
                >
                  <StackedPin group={group} isSelected={isSelected} isHovered={isHovered} isDimmed={isDimmed} zoom={zoom} />
                </Marker>
              );
            })}
          </Map>
        </div>
      </div>

      {selectedGroup && (
        <LocationDrawer
          group={selectedGroup}
          tagLabels={tagLabels}
          onClose={() => { setSelectedGroupKey(null); setSelectedCharityId(null); setSelectedLocationId(null); }}
        />
      )}

    </div>
  );
}
