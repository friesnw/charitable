import { lazy, Suspense, useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useQuery, useLazyQuery, gql } from '@apollo/client';
import { useAuth } from '../hooks/useAuth';
import { cloudinaryUrl } from '../lib/cloudinary';
import { causeColor, causeIcon, FEATURED_TAGS } from '../lib/causeColors';
import { nearestNeighborhood } from '../lib/neighborhoods';
import { CharityPreviewDrawer } from '../components/CharityPreviewDrawer';

const CharityMap = lazy(() =>
  import('../components/CharityMap').then((m) => ({ default: m.CharityMap }))
);

const MY_PREFERENCES_ZIP = gql`
  query MyPreferencesZip {
    myPreferences {
      zipCode
    }
  }
`;

const RESOLVE_ZIP = gql`
  query ResolveZipForMap($zip: String!) {
    resolveZip(zip: $zip) {
      latitude
      longitude
      zoom
      state
    }
  }
`;

const GET_CAUSES = gql`
  query GetCauses {
    causes {
      tag
      label
    }
  }
`;

const GET_CHARITIES = gql`
  query GetCharities($tags: [String], $search: String) {
    charities(tags: $tags, search: $search) {
      id
      slug
      name
      description
      logoUrl
      primaryAddress
      foundedYear
      causeTags
      everyOrgSlug
      locations {
        id
        label
        description
        address
        photoUrl
        latitude
        longitude
      }
    }
  }
`;

interface Charity {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  logoUrl: string | null;
  primaryAddress: string | null;
  foundedYear: number | null;
  causeTags: string[];
  everyOrgSlug: string | null;
  locations: {
    id: string;
    label: string;
    description: string | null;
    address: string | null;
    photoUrl: string | null;
    latitude: number | null;
    longitude: number | null;
  }[];
}

export function Charities() {
  const { isAuthenticated } = useAuth();
  const [search, setSearch] = useState('');
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedTag, setSelectedTag] = useState<string | null>(
    searchParams.get('tag') ?? null
  );
  const [showAllTags, setShowAllTags] = useState(false);
  const [selectedCharityId, setSelectedCharityId] = useState<string | null>(null);
  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(null);
  const viewMode = searchParams.get('view') === 'list' ? 'list' : 'map';

  // Zip-based map centering
  const [initialCenter, setInitialCenter] = useState<{ longitude: number; latitude: number; zoom: number } | undefined>();
  const [activeZip, setActiveZip] = useState<string | null>(null);
  const [zipEditing, setZipEditing] = useState(false);
  const [zipInputValue, setZipInputValue] = useState('');
  const [zipFeedback, setZipFeedback] = useState<string | null>(null);
  const [resolveZip] = useLazyQuery(RESOLVE_ZIP);

  const { data: prefsData } = useQuery(MY_PREFERENCES_ZIP, { skip: !isAuthenticated });

  // For authenticated users: center on saved zip
  useEffect(() => {
    if (isAuthenticated && prefsData?.myPreferences?.zipCode) {
      const zip = prefsData.myPreferences.zipCode;
      setActiveZip(zip);
      resolveZip({ variables: { zip } }).then(({ data }) => {
        const info = data?.resolveZip;
        if (info?.state === 'CO') {
          setInitialCenter({ longitude: info.longitude, latitude: info.latitude, zoom: info.zoom });
        }
      });
    }
  }, [isAuthenticated, prefsData]);

  // For unauthenticated users: check localStorage
  useEffect(() => {
    if (!isAuthenticated) {
      const localZip = localStorage.getItem('userZip');
      if (localZip) {
        setActiveZip(localZip);
        resolveZip({ variables: { zip: localZip } }).then(({ data }) => {
          const info = data?.resolveZip;
          if (info?.state === 'CO') {
            setInitialCenter({ longitude: info.longitude, latitude: info.latitude, zoom: info.zoom });
          }
        });
      }
    }
  }, [isAuthenticated]);

  const handleZipSubmit = () => {
    const digits = zipInputValue.replace(/\D/g, '');
    if (digits.length !== 5) return;
    resolveZip({ variables: { zip: digits } }).then(({ data }) => {
      const info = data?.resolveZip;
      if (!info) return;
      if (!isAuthenticated) localStorage.setItem('userZip', digits);
      setActiveZip(digits);
      setInitialCenter({ longitude: info.longitude, latitude: info.latitude, zoom: info.zoom });
      setZipEditing(false);
    });
  };

  const setViewMode = (mode: 'list' | 'map') => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (mode === 'list') {
        next.set('view', 'list');
      } else {
        next.delete('view');
      }
      return next;
    });
    setSelectedCharityId(null);
    setSelectedLocationId(null);
  };

  const { loading, error, data } = useQuery(GET_CHARITIES, {
    variables: {
      tags: selectedTag ? [selectedTag] : undefined,
      search: search || undefined,
    },
  });

  const { data: causesData } = useQuery(GET_CAUSES);

  const tagLabels = new Map<string, string>(
    (causesData?.causes ?? []).map((c: { tag: string; label: string }) => [c.tag, c.label])
  );

  const charities: Charity[] = data?.charities || [];

  const availableTags = Array.from(new Set(charities.flatMap((c) => c.causeTags)));
  const featuredTags = FEATURED_TAGS.filter((t) => availableTags.includes(t));
  const remainingTags = availableTags.filter((t) => !FEATURED_TAGS.includes(t)).sort();
  const effectiveShowAll = showAllTags || (!!selectedTag && remainingTags.includes(selectedTag));
  const visibleTags = effectiveShowAll ? [...featuredTags, ...remainingTags] : featuredTags;

  if (viewMode === 'map') {
    return (
      <div className="flex" style={{ height: 'calc(100vh - 65px)' }}>

        {/* Split panel */}
        <div className="flex flex-1 overflow-hidden">
          {/* Left panel */}
          <div className="w-96 flex-shrink-0 flex flex-col border-r border-brand-tertiary bg-bg-primary">
            {selectedCharityId !== null && (
              <button
                onClick={() => { setSelectedCharityId(null); setSelectedLocationId(null); }}
                className="w-full text-left px-4 py-3 border-b border-brand-tertiary text-sm text-brand-secondary hover:bg-bg-accent flex items-center gap-1 flex-shrink-0"
              >
                ← Back to all charities
              </button>
            )}
            <div className="overflow-y-auto flex-1">
              {loading && (
                <p className="text-text-secondary p-4">Loading charities...</p>
              )}
              {error && (
                <p className="text-error p-4">Error: {error.message}</p>
              )}
              {!loading && !error && charities.length === 0 && (
                <p className="text-text-secondary p-4">No charities found.</p>
              )}
              {charities.filter((c) => selectedCharityId === null || c.id === selectedCharityId).map((charity) => {
                const isSelected = charity.id === selectedCharityId;
                const validLocs = charity.locations.filter(
                  (l) => l.latitude != null && l.longitude != null
                );
                return (
                  <div key={charity.id}>
                    {/* Charity card */}
                    <button
                      onClick={() => {
                        if (isSelected) {
                          setSelectedCharityId(null);
                          setSelectedLocationId(null);
                        } else {
                          setSelectedCharityId(charity.id);
                          setSelectedLocationId(null);
                        }
                      }}
                      className="w-full text-left px-4 py-4 border-b border-brand-tertiary transition-colors hover:bg-bg-accent"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        {charity.logoUrl ? (
                          <img
                            src={cloudinaryUrl(charity.logoUrl, { w: 40, h: 40 })}
                            alt={charity.name}
                            className="w-10 h-10 object-cover rounded flex-shrink-0"
                          />
                        ) : (
                          <div className="w-10 h-10 flex-shrink-0 rounded bg-bg-accent flex items-center justify-center text-text-secondary text-xs font-bold">
                            {charity.name.slice(0, 2).toUpperCase()}
                          </div>
                        )}
                        <div className="font-bold text-text-primary text-sm">
                          {charity.name}
                        </div>
                      </div>
                      {charity.foundedYear && (
                        <div className="text-text-secondary text-xs mt-0.5">
                          Founded {charity.foundedYear}
                        </div>
                      )}
                      {charity.description && (
                        <p className="text-text-secondary text-xs mt-1 line-clamp-2">
                          {charity.description}
                        </p>
                      )}
                      {charity.causeTags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {charity.causeTags.map((tag) => (
                            <span
                              key={tag}
                              className="text-xs px-1.5 py-0.5 bg-bg-accent text-text-secondary rounded"
                            >
                              {tagLabels.get(tag) ?? tag}
                            </span>
                          ))}
                        </div>
                      )}
                      {isSelected && (
                        <div className="flex gap-2 mt-3" onClick={(e) => e.stopPropagation()}>
                          <Link
                            to={`/charities/${charity.slug}`}
                            className="flex-1 text-center py-2 rounded-lg border border-gray-300 text-xs font-medium text-gray-700 hover:bg-gray-50"
                          >
                            Learn more →
                          </Link>
                          {charity.everyOrgSlug && (
                            <a
                              href={`https://www.every.org/${charity.everyOrgSlug}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex-1 text-center py-2 rounded-lg text-xs font-medium text-white bg-brand-secondary hover:opacity-90"
                            >
                              Donate
                            </a>
                          )}
                        </div>
                      )}
                    </button>

                    {/* Inline location expansion when selected */}
                    {isSelected && validLocs.length > 0 && (
                      <div className="border-b border-brand-tertiary">
                        <div className="px-4 pt-2 pb-1 text-xs font-semibold text-text-secondary uppercase tracking-wide">
                          Locations ({validLocs.length})
                        </div>
                        {validLocs.map((loc) => {
                          const isHighlighted = loc.id === selectedLocationId;
                          return (
                            <button
                              key={loc.id}
                              onClick={() => setSelectedLocationId(isHighlighted ? null : loc.id)}
                              className={`w-full text-left pl-8 pr-4 py-2.5 transition-colors flex items-center gap-3 ${
                                isHighlighted
                                  ? 'bg-brand-accent/30 border-l-4 border-l-brand-accent'
                                  : 'hover:bg-bg-accent'
                              }`}
                            >
                              {loc.photoUrl ? (
                                <img
                                  src={cloudinaryUrl(loc.photoUrl, { w: 72, h: 72, fit: 'fill' })}
                                  alt={loc.label}
                                  className="w-14 h-14 rounded object-cover flex-shrink-0"
                                />
                              ) : (
                                <div className="w-14 h-14 rounded bg-bg-accent border border-brand-tertiary flex-shrink-0 flex items-center justify-center text-text-secondary text-sm font-bold">
                                  {(() => {
                                    const words = loc.label.trim().split(/\s+/);
                                    return words.length > 1
                                      ? (words[0][0] + words[1][0]).toUpperCase()
                                      : words[0][0].toUpperCase();
                                  })()}
                                </div>
                              )}
                              <div className="min-w-0">
                                <div className="font-medium text-text-primary text-sm">
                                  {loc.label}
                                </div>
                                {loc.description && (
                                  <p className="text-text-secondary text-xs mt-0.5 truncate">{loc.description}</p>
                                )}
                                {loc.latitude != null && loc.longitude != null && (() => {
                                  const hood = nearestNeighborhood(loc.latitude, loc.longitude);
                                  return hood ? (
                                    <span className="inline-block mt-1 text-xs px-2 py-0.5 rounded-full border border-flair-green text-flair-green">{hood}</span>
                                  ) : null;
                                })()}
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
          <div className="flex-1 relative">
            {/* Floating controls — search, toggle, tag chips */}
            <div className="absolute top-0 left-0 right-0 z-10 p-3 flex flex-col gap-2 pointer-events-none">
              <div className="pointer-events-auto flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Search charities..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="flex-1 px-4 py-2.5 rounded-xl shadow-lg border border-gray-200 bg-white/90 backdrop-blur-sm text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
                <div className="flex rounded-xl overflow-hidden shadow-lg border border-gray-200 bg-white/90 backdrop-blur-sm flex-shrink-0">
                  <button
                    onClick={() => setViewMode('map')}
                    className="px-3 py-2.5 text-sm font-medium transition-colors bg-gray-900 text-white"
                  >
                    Map
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className="px-3 py-2.5 text-sm font-medium transition-colors text-gray-600 hover:bg-gray-100"
                  >
                    List
                  </button>
                </div>
              </div>
              {availableTags.length > 0 && (
                <div className="pointer-events-auto flex gap-2 overflow-x-auto pb-1">
                  <button
                    onClick={() => setSelectedTag(null)}
                    className={`flex-shrink-0 text-xs px-3 py-1.5 rounded-full shadow font-medium transition-colors ${
                      !selectedTag
                        ? 'bg-gray-900 text-white'
                        : 'bg-white/90 backdrop-blur-sm text-gray-700 border border-gray-200 hover:bg-white'
                    }`}
                  >
                    All
                  </button>
                  {visibleTags.map((tag) => {
                    const isActive = tag === selectedTag;
                    return (
                      <button
                        key={tag}
                        onClick={() => { setShowAllTags(false); setSelectedTag(tag === selectedTag ? null : tag); }}
                        className="flex-shrink-0 text-xs px-3 py-1.5 rounded-full shadow font-medium transition-all flex items-center gap-1"
                        style={
                          isActive
                            ? { backgroundColor: causeColor([tag]), color: 'white', border: `2px solid ${causeColor([tag])}` }
                            : { backgroundColor: 'rgba(255,255,255,0.9)', color: '#374151', border: '1px solid #e5e7eb', backdropFilter: 'blur(8px)' }
                        }
                      >
                        <span style={{ fontSize: 11 }}>{causeIcon([tag])}</span>
                        {tagLabels.get(tag) ?? tag}
                      </button>
                    );
                  })}
                  {!effectiveShowAll && remainingTags.length > 0 && (
                    <button
                      onClick={() => setShowAllTags(true)}
                      className="flex-shrink-0 text-xs px-3 py-1.5 rounded-full shadow font-medium bg-white/90 backdrop-blur-sm text-gray-500 border border-gray-200 hover:bg-white"
                    >
                      + {remainingTags.length} more
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Zip indicator — bottom right */}
            <div className="absolute bottom-3 right-3 z-10">
              {zipEditing ? (
                <div className="bg-white border border-brand-tertiary rounded-md shadow px-3 py-2 flex items-center gap-2 text-sm">
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="Zip code"
                    value={zipInputValue}
                    onChange={(e) => setZipInputValue(e.target.value.replace(/\D/g, '').slice(0, 5))}
                    onKeyDown={(e) => e.key === 'Enter' && handleZipSubmit()}
                    maxLength={5}
                    autoFocus
                    className="border border-brand-tertiary rounded px-2 py-1 w-24 outline-none focus:border-brand-primary"
                  />
                  <button
                    onClick={handleZipSubmit}
                    disabled={zipInputValue.length !== 5}
                    className="bg-brand-secondary text-white px-3 py-1 rounded disabled:opacity-50"
                  >
                    Go
                  </button>
                  <button
                    onClick={() => setZipEditing(false)}
                    className="text-text-secondary hover:text-text-primary"
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => { setZipInputValue(activeZip ?? ''); setZipEditing(true); }}
                  className="bg-white/90 backdrop-blur-sm border border-gray-200 rounded-full shadow px-3 py-1.5 text-sm text-gray-600 hover:bg-white"
                >
                  {activeZip ? `Near ${activeZip}` : 'Set location'}
                </button>
              )}
            </div>
            <Suspense fallback={<p className="text-text-secondary p-4">Loading map...</p>}>
              <CharityMap
                charities={charities}
                selectedCharityId={selectedCharityId}
                selectedLocationId={selectedLocationId}
                onMarkerClick={(charityId, locationId) => {
                  setSelectedCharityId(charityId);
                  setSelectedLocationId(locationId);
                }}
                initialCenter={initialCenter}
                className="w-full h-full"
              />
            </Suspense>
          </div>
        </div>

        {/* Bottom-right drawer on pin click — same as /explore */}
        {selectedLocationId !== null && selectedCharityId !== null && (() => {
          const fc = charities.find((c) => c.id === selectedCharityId);
          if (!fc) return null;
          return (
            <CharityPreviewDrawer
              charity={fc}
              selectedLocationId={selectedLocationId}
              distance={null}
              tagLabels={tagLabels}
              onClose={() => {
                setSelectedCharityId(null);
                setSelectedLocationId(null);
              }}
            />
          );
        })()}
      </div>
    );
  }

  // List view
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold text-text-primary">Find Charities</h1>
        <div className="flex rounded-xl overflow-hidden border border-gray-200">
          <button
            onClick={() => setViewMode('map')}
            className="text-sm px-3 py-1 font-medium transition-colors text-gray-600 hover:bg-gray-100"
          >
            Map
          </button>
          <button
            onClick={() => setViewMode('list')}
            className="text-sm px-3 py-1 font-medium transition-colors bg-gray-900 text-white"
          >
            List
          </button>
        </div>
      </div>

      <div className="mb-6 space-y-3">
        <input
          type="text"
          placeholder="Search by name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-3 py-2 border border-brand-tertiary rounded-md text-text-primary focus:border-brand-primary outline-none"
        />

        {availableTags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedTag(null)}
              className={`text-sm px-2 py-1 rounded ${
                !selectedTag
                  ? 'bg-brand-tertiary text-text-primary'
                  : 'bg-bg-accent text-text-secondary hover:bg-brand-tertiary'
              }`}
            >
              All
            </button>
            {visibleTags.map((tag) => (
              <button
                key={tag}
                onClick={() => setSelectedTag(tag === selectedTag ? null : tag)}
                className={`text-sm px-2 py-1 rounded ${
                  tag === selectedTag
                    ? 'bg-brand-accent text-white'
                    : 'bg-bg-accent text-text-secondary hover:bg-brand-tertiary'
                }`}
              >
                {tagLabels.get(tag) ?? tag}
              </button>
            ))}
            {!effectiveShowAll && remainingTags.length > 0 && (
              <button
                onClick={() => setShowAllTags(true)}
                className="text-sm px-2 py-1 rounded bg-bg-accent text-text-secondary hover:bg-brand-tertiary"
              >
                + {remainingTags.length} more
              </button>
            )}
          </div>
        )}
      </div>

      {loading && <p className="text-text-secondary">Loading charities...</p>}
      {error && <p className="text-error">Error: {error.message}</p>}

      {!loading && !error && charities.length === 0 && (
        <p className="text-text-secondary">No charities found.</p>
      )}

      <ul className="space-y-4">
        {charities.map((charity) => (
          <li key={charity.id}>
            <Link
              to={`/charities/${charity.slug}`}
              className="flex gap-3 p-4 border border-brand-tertiary rounded-lg hover:border-brand-primary"
            >
              {charity.logoUrl ? (
                <img
                  src={cloudinaryUrl(charity.logoUrl, { w: 40, h: 40 })}
                  alt={charity.name}
                  className="w-10 h-10 object-cover rounded flex-shrink-0 mt-0.5"
                />
              ) : (
                <div className="w-10 h-10 flex-shrink-0 rounded bg-bg-accent flex items-center justify-center text-text-secondary text-xs font-bold mt-0.5">
                  {charity.name.slice(0, 2).toUpperCase()}
                </div>
              )}
              <div className="flex-1 min-w-0">
              <h2 className="font-bold text-text-primary">{charity.name}</h2>
              {charity.foundedYear && (
                <p className="text-text-secondary text-sm">
                  Founded {charity.foundedYear}
                </p>
              )}
              {charity.description && (
                <p className="text-text-secondary mt-1 line-clamp-2">{charity.description}</p>
              )}
              {charity.primaryAddress && (
                <p className="text-text-secondary text-sm mt-1">{charity.primaryAddress}</p>
              )}
              {charity.causeTags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {charity.causeTags.map((tag) => (
                    <span
                      key={tag}
                      className="text-sm px-2 py-1 bg-bg-accent text-text-secondary rounded"
                    >
                      {tagLabels.get(tag) ?? tag}
                    </span>
                  ))}
                </div>
              )}
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
