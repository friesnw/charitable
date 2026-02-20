import { lazy, Suspense, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useQuery, gql } from '@apollo/client';

const CharityMap = lazy(() =>
  import('../components/CharityMap').then((m) => ({ default: m.CharityMap }))
);

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
  const [search, setSearch] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [selectedCharityId, setSelectedCharityId] = useState<string | null>(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const viewMode = searchParams.get('view') === 'list' ? 'list' : 'map';

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
      // Break out of PageShell's px-4 and pb-8 to go full-width/height
      <div className="-mx-4 -mb-8 flex flex-col" style={{ height: 'calc(100vh - 65px)' }}>
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
                className="text-sm px-3 py-1 bg-brand-primary text-white"
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
                    ? 'bg-brand-primary text-white'
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
                      ? 'bg-brand-primary text-white'
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
                    <div className="font-bold text-text-primary text-sm">
                      {charity.name}
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
          <div className="flex-1">
            <Suspense fallback={<p className="text-text-secondary p-4">Loading map...</p>}>
              <CharityMap
                charities={charities}
                selectedCharityId={selectedCharityId}
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
    <div>
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
            className="text-sm px-3 py-1 bg-brand-primary text-white"
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
                  ? 'bg-brand-primary text-white'
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
                    ? 'bg-brand-primary text-white'
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
              className="block p-4 border border-brand-tertiary rounded-lg hover:border-brand-primary"
            >
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
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
