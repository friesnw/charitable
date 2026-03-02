import { lazy, Suspense, useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useQuery, useLazyQuery, gql } from '@apollo/client';
import { useAuth } from '../hooks/useAuth';
import { cloudinaryUrl } from '../lib/cloudinary';

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
      locations {
        id
        label
        description
        address
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
  locations: {
    id: string;
    label: string;
    description: string | null;
    address: string | null;
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
  const [selectedCharityId, setSelectedCharityId] = useState<string | null>(null);
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

  const allTags = Array.from(
    new Set(charities.flatMap((c) => c.causeTags))
  ).sort();

  if (viewMode === 'map') {
    return (
      <div className="flex flex-col" style={{ height: 'calc(100vh - 65px)' }}>
        {/* Top bar: title, search, tag filters, view toggle */}
        <div className="px-4 py-3 border-b border-brand-tertiary flex-shrink-0 space-y-3">
          <div className="flex items-center justify-between gap-4">
            <h1 className="text-xl font-bold text-text-primary flex-shrink-0">Find Charities</h1>
            <input
              type="text"
              placeholder="Search by name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 px-3 py-1.5 border border-brand-tertiary rounded-md text-text-primary focus:border-brand-primary outline-none text-sm"
            />
            <div className="flex rounded-md border border-brand-tertiary overflow-hidden flex-shrink-0">
              <button
                onClick={() => setViewMode('map')}
                className="text-sm px-3 py-1 bg-brand-accent text-white"
              >
                Map
              </button>
              <button
                onClick={() => setViewMode('list')}
                className="text-sm px-3 py-1 bg-bg-accent text-text-secondary hover:bg-brand-tertiary"
              >
                List
              </button>
            </div>
          </div>
          {allTags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedTag(null)}
                className={`text-sm px-2 py-1 rounded ${
                  !selectedTag
                    ? 'bg-brand-accent text-white'
                    : 'bg-bg-accent text-text-secondary hover:bg-brand-tertiary'
                }`}
              >
                All
              </button>
              {allTags.map((tag) => (
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
            </div>
          )}
        </div>

        {/* Split panel */}
        <div className="flex flex-1 overflow-hidden">
          {/* Left panel */}
          <div className="w-96 flex-shrink-0 flex flex-col border-r border-brand-tertiary bg-bg-primary">
            {/* Charity list */}
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
              {charities.map((charity) => {
                const isSelected = charity.id === selectedCharityId;
                return (
                  <button
                    key={charity.id}
                    onClick={() =>
                      setSelectedCharityId(isSelected ? null : charity.id)
                    }
                    className={`w-full text-left px-4 py-4 border-b border-brand-tertiary transition-colors ${
                      isSelected
                        ? 'bg-amber-50 border-l-4 border-l-amber-400'
                        : 'hover:bg-bg-accent'
                    }`}
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
                    {charity.primaryAddress && (
                      <p className="text-text-secondary text-xs mt-1">
                        {charity.primaryAddress}
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
                    <Link
                      to={`/charities/${charity.slug}`}
                      onClick={(e) => e.stopPropagation()}
                      className="text-xs text-brand-primary hover:underline mt-2 inline-block"
                    >
                      View details →
                    </Link>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Map */}
          <div className="flex-1 relative">
            {/* Persistent zip indicator — top right of map */}
            <div className="absolute top-3 right-3 z-10">
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
                  className="bg-white border border-brand-tertiary rounded-md shadow px-3 py-2 text-sm text-text-secondary hover:border-brand-primary hover:text-text-primary"
                >
                  {activeZip ? `Near ${activeZip}` : 'Set location'}
                </button>
              )}
            </div>
            <Suspense fallback={<p className="text-text-secondary p-4">Loading map...</p>}>
              <CharityMap
                charities={charities}
                selectedCharityId={selectedCharityId}
                initialCenter={initialCenter}
                className="w-full h-full"
              />
            </Suspense>
          </div>
        </div>
      </div>
    );
  }

  // List view
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold text-text-primary">Find Charities</h1>
        <div className="flex rounded-md border border-brand-tertiary overflow-hidden">
          <button
            onClick={() => setViewMode('map')}
            className="text-sm px-3 py-1 bg-bg-accent text-text-secondary hover:bg-brand-tertiary"
          >
            Map
          </button>
          <button
            onClick={() => setViewMode('list')}
            className="text-sm px-3 py-1 bg-brand-accent text-white"
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

        {allTags.length > 0 && (
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
            {allTags.map((tag) => (
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
