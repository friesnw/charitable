import { lazy, Suspense, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, gql } from '@apollo/client';

const CharityMap = lazy(() =>
  import('../components/CharityMap').then((m) => ({ default: m.CharityMap }))
);

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
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');

  const { loading, error, data } = useQuery(GET_CHARITIES, {
    variables: {
      tags: selectedTag ? [selectedTag] : undefined,
      search: search || undefined,
    },
  });

  const charities: Charity[] = data?.charities || [];

  // Collect all unique tags from results for the filter
  const allTags = Array.from(
    new Set(charities.flatMap((c) => c.causeTags))
  ).sort();

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold text-text-primary">Find Charities</h1>
        <div className="flex rounded-md border border-brand-tertiary overflow-hidden">
          <button
            onClick={() => setViewMode('list')}
            className={`text-sm px-3 py-1 ${
              viewMode === 'list'
                ? 'bg-brand-primary text-white'
                : 'bg-bg-accent text-text-secondary hover:bg-brand-tertiary'
            }`}
          >
            List
          </button>
          <button
            onClick={() => setViewMode('map')}
            className={`text-sm px-3 py-1 ${
              viewMode === 'map'
                ? 'bg-brand-primary text-white'
                : 'bg-bg-accent text-text-secondary hover:bg-brand-tertiary'
            }`}
          >
            Map
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
                {tag}
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

      {viewMode === 'map' ? (
        <Suspense fallback={<p className="text-text-secondary">Loading map...</p>}>
          <CharityMap charities={charities} />
        </Suspense>
      ) : (
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
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
