import { lazy, Suspense, useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery, useLazyQuery, gql } from '@apollo/client';
import { useAuth } from '../hooks/useAuth';
import { CharityPreviewDrawer, type DrawerCharity } from '../components/CharityPreviewDrawer';
import { NearbyCharityCard } from '../components/NearbyCharityCard';
import { useGeolocation, nearestLocation } from '../lib/geo';
import { causeColor, causeIcon } from '../lib/causeColors';

const ExploreMap = lazy(() =>
  import('../components/ExploreMap').then((m) => ({ default: m.ExploreMap }))
);

const MY_PREFERENCES_ZIP_EXPLORE = gql`
  query MyPreferencesZipExplore {
    myPreferences {
      zipCode
    }
  }
`;

const RESOLVE_ZIP_EXPLORE = gql`
  query ResolveZipExplore($zip: String!) {
    resolveZip(zip: $zip) {
      latitude
      longitude
      zoom
      state
    }
  }
`;

const GET_CAUSES = gql`
  query GetCausesExplore {
    causes {
      tag
      label
    }
  }
`;

const GET_CHARITIES_EXPLORE = gql`
  query GetCharitiesExplore($tags: [String], $search: String) {
    charities(tags: $tags, search: $search) {
      id
      slug
      name
      description
      causeTags
      everyOrgSlug
      locations {
        id
        label
        address
        photoUrl
        latitude
        longitude
      }
    }
  }
`;

type ExploreCharity = DrawerCharity & { id: string };

const TOP_CAUSE_COUNT = 5;

export function Explore() {
  const [searchParams] = useSearchParams();
  const { isAuthenticated } = useAuth();

  // URL params take priority (e.g. deep-linked map position)
  const urlLat = searchParams.get('lat');
  const urlLng = searchParams.get('lng');
  const [initialCenter, setInitialCenter] = useState<{ lat: number; lng: number; zoom?: number } | undefined>(
    urlLat && urlLng ? { lat: parseFloat(urlLat), lng: parseFloat(urlLng), zoom: 13 } : undefined
  );

  const { data: prefsData } = useQuery(MY_PREFERENCES_ZIP_EXPLORE, { skip: !isAuthenticated });
  const [resolveZip] = useLazyQuery(RESOLVE_ZIP_EXPLORE);

  // Authenticated: center on saved home zip
  useEffect(() => {
    if (urlLat || !isAuthenticated || !prefsData?.myPreferences?.zipCode) return;
    resolveZip({ variables: { zip: prefsData.myPreferences.zipCode } }).then(({ data }) => {
      const info = data?.resolveZip;
      if (info?.state === 'CO') {
        setInitialCenter({ lat: info.latitude, lng: info.longitude, zoom: info.zoom ?? 13 });
      }
    });
  }, [isAuthenticated, prefsData]);

  // Unauthenticated: center on localStorage zip
  useEffect(() => {
    if (urlLat || isAuthenticated) return;
    const localZip = localStorage.getItem('userZip');
    if (localZip) {
      resolveZip({ variables: { zip: localZip } }).then(({ data }) => {
        const info = data?.resolveZip;
        if (info?.state === 'CO') {
          setInitialCenter({ lat: info.latitude, lng: info.longitude, zoom: info.zoom ?? 13 });
        }
      });
    }
  }, [isAuthenticated]);

  const [search, setSearch] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [selectedCharityId, setSelectedCharityId] = useState<string | null>(null);
  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'map' | 'grid'>('map');

  const userPos = useGeolocation();

  const { data, loading } = useQuery(GET_CHARITIES_EXPLORE, {
    variables: {
      tags: selectedTag ? [selectedTag] : undefined,
      search: search || undefined,
    },
  });

  const { data: causesData } = useQuery(GET_CAUSES);

  const tagLabels = new Map<string, string>(
    (causesData?.causes ?? []).map((c: { tag: string; label: string }) => [c.tag, c.label])
  );

  const charities: ExploreCharity[] = data?.charities ?? [];

  // Compute top N cause tags by frequency across loaded charities
  const causeCounts = new Map<string, number>();
  for (const charity of charities) {
    for (const tag of charity.causeTags) {
      causeCounts.set(tag, (causeCounts.get(tag) ?? 0) + 1);
    }
  }
  const topCauses = [...causeCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, TOP_CAUSE_COUNT)
    .map(([tag]) => tag);

  const selectedCharity = charities.find((c) => c.id === selectedCharityId) ?? null;

  const selectedLocation = selectedCharity?.locations.find((l) => l.id === selectedLocationId) ?? null;
  const distance =
    userPos && selectedLocation?.latitude != null && selectedLocation?.longitude != null
      ? nearestLocation(userPos, [selectedLocation])?.distance ?? null
      : null;

  // For grid view: sort charities by distance from user (or as-is if no geo)
  const charitiesForGrid = [...charities].sort((a, b) => {
    if (!userPos) return 0;
    const dA = nearestLocation(userPos, a.locations)?.distance ?? Infinity;
    const dB = nearestLocation(userPos, b.locations)?.distance ?? Infinity;
    return dA - dB;
  });

  function handleMarkerClick(charity: ExploreCharity, locationId: string) {
    setSelectedCharityId(charity.id);
    setSelectedLocationId(locationId);
  }

  function handleClose() {
    setSelectedCharityId(null);
    setSelectedLocationId(null);
  }

  function handleTagToggle(tag: string) {
    setSelectedTag(tag === selectedTag ? null : tag);
    handleClose();
  }

  return (
    <div
      className="relative overflow-hidden"
      style={{ height: 'calc(100vh - 65px)' }}
    >
      {/* Floating controls overlay */}
      <div className="absolute top-0 left-0 right-0 z-10 p-3 flex flex-col gap-2 pointer-events-none">
        {/* Search + view toggle row */}
        <div className="pointer-events-auto flex items-center gap-2">
          <input
            type="text"
            placeholder="Search charities..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 px-4 py-2.5 rounded-xl shadow-lg border border-gray-200 bg-white/90 backdrop-blur-sm text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          {/* Map / Grid toggle */}
          <div className="flex rounded-xl overflow-hidden shadow-lg border border-gray-200 bg-white/90 backdrop-blur-sm flex-shrink-0">
            <button
              onClick={() => setViewMode('map')}
              className={`px-3 py-2.5 text-sm font-medium transition-colors ${
                viewMode === 'map'
                  ? 'bg-gray-900 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Map
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-2.5 text-sm font-medium transition-colors ${
                viewMode === 'grid'
                  ? 'bg-gray-900 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              List
            </button>
          </div>
        </div>

        {/* Top cause chips */}
        {topCauses.length > 0 && (
          <div className="pointer-events-auto flex gap-2 overflow-x-auto pb-1">
            <button
              onClick={() => { setSelectedTag(null); handleClose(); }}
              className={`flex-shrink-0 text-xs px-3 py-1.5 rounded-full shadow font-medium transition-colors ${
                !selectedTag
                  ? 'bg-gray-900 text-white'
                  : 'bg-white/90 backdrop-blur-sm text-gray-700 border border-gray-200 hover:bg-white'
              }`}
            >
              All
            </button>
            {topCauses.map((tag) => {
              const isActive = tag === selectedTag;
              const color = causeColor([tag]);
              const icon = causeIcon([tag]);
              return (
                <button
                  key={tag}
                  onClick={() => handleTagToggle(tag)}
                  className="flex-shrink-0 text-xs px-3 py-1.5 rounded-full shadow font-medium transition-all flex items-center gap-1"
                  style={
                    isActive
                      ? { backgroundColor: color, color: 'white', border: `2px solid ${color}` }
                      : { backgroundColor: 'rgba(255,255,255,0.9)', color: '#374151', border: '1px solid #e5e7eb', backdropFilter: 'blur(8px)' }
                  }
                >
                  <span style={{ fontSize: 11 }}>{icon}</span>
                  {tagLabels.get(tag) ?? tag}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Loading indicator */}
      {loading && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-10 bg-white/90 backdrop-blur-sm text-sm text-gray-600 px-3 py-1.5 rounded-full shadow">
          Loading...
        </div>
      )}

      {/* Map view */}
      {viewMode === 'map' && (
        <Suspense fallback={<div className="w-full h-full bg-gray-100" />}>
          <ExploreMap
            charities={charities}
            selectedCharityId={selectedCharityId}
            selectedLocationId={selectedLocationId}
            userPos={userPos}
            onMarkerClick={handleMarkerClick}
            onMapClick={handleClose}
            initialCenter={initialCenter}
          />
        </Suspense>
      )}

      {/* Grid view */}
      {viewMode === 'grid' && (
        <div
          className="absolute inset-0 bg-white overflow-y-auto"
          style={{ paddingTop: topCauses.length > 0 ? 112 : 68 }}
        >
          <div className="px-4 pb-6">
            {!loading && charitiesForGrid.length === 0 && (
              <p className="text-gray-500 text-sm">No charities found.</p>
            )}
            <div className="grid grid-cols-2 gap-4">
              {charitiesForGrid.map((charity) => {
                const d = userPos
                  ? nearestLocation(userPos, charity.locations)?.distance ?? null
                  : null;
                return (
                  <NearbyCharityCard
                    key={charity.id}
                    charity={charity}
                    distance={d}
                    tagLabels={tagLabels}
                  />
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Bottom drawer (map mode only) — only mounted when a charity is selected */}
      {viewMode === 'map' && selectedCharity !== null && (
        <CharityPreviewDrawer
          charity={selectedCharity}
          selectedLocationId={selectedLocationId}
          distance={distance}
          tagLabels={tagLabels}
          onClose={handleClose}
        />
      )}
    </div>
  );
}
