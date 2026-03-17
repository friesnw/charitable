import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useQuery, gql } from '@apollo/client';
import { cloudinaryUrl } from '../lib/cloudinary';
import { causeColor, causeIcon } from '../lib/causeColors';
import { nearestNeighborhood } from '../lib/neighborhoods';
import { CauseFilterBar } from '../components/ui/CauseFilterBar';
import { Icon } from '../components/ui/Icon';

const GET_CAUSES = gql`query GetCausesForDirectory { causes { tag label charityCount } }`;
const GET_CHARITIES = gql`
  query GetCharitiesForDirectory {
    charities {
      id slug name description logoUrl causeTags featured
      locations { id latitude longitude isSublocation }
    }
  }
`;

type SortOption = 'az' | 'neighborhood';

interface Charity {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  logoUrl: string | null;
  causeTags: string[];
  featured: boolean;
  locations: { id: string; latitude: number | null; longitude: number | null; isSublocation: boolean }[];
}

function primaryNeighborhood(charity: Charity): string | null {
  const primary = charity.locations.find((l) => !l.isSublocation && l.latitude != null && l.longitude != null)
    ?? charity.locations.find((l) => l.latitude != null && l.longitude != null);
  if (!primary || primary.latitude == null || primary.longitude == null) return null;
  return nearestNeighborhood(primary.latitude, primary.longitude);
}

function CharityCard({ charity, tagLabels }: { charity: Charity; tagLabels: Map<string, string> }) {
  const hood = primaryNeighborhood(charity);
  return (
    <Link
      to={`/charities/${charity.slug}`}
      className="bg-bg-primary border border-brand-tertiary rounded-xl p-4 flex flex-col gap-3 hover:shadow-md hover:border-brand-secondary transition-all"
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          {charity.logoUrl ? (
            <img
              src={cloudinaryUrl(charity.logoUrl, { w: 96, h: 96, fit: 'fit' })}
              alt={charity.name}
              className="w-12 h-12 rounded-full object-contain border border-brand-tertiary"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-bg-accent flex items-center justify-center text-sm font-bold text-text-secondary">
              {charity.name.slice(0, 2).toUpperCase()}
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-bold text-text-primary leading-snug">{charity.name}</h3>
            {charity.featured && (
              <span className="text-xs px-1.5 py-0.5 rounded bg-brand-accent/15 text-brand-secondary font-semibold">
                Featured
              </span>
            )}
          </div>
          {charity.causeTags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1.5">
              {charity.causeTags.map((tag) => (
                <span
                  key={tag}
                  className="text-xs px-1.5 py-0.5 rounded-full font-medium"
                  style={{ backgroundColor: `${causeColor([tag])}18`, color: causeColor([tag]) }}
                >
                  {causeIcon([tag])} {tagLabels.get(tag) ?? tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {charity.description && (
        <p className="text-sm text-text-secondary line-clamp-2">{charity.description}</p>
      )}

      <div className="flex items-center justify-between mt-auto pt-1">
        {hood ? (
          <span className="text-xs px-2 py-0.5 rounded-full border border-flair-green text-flair-green">
            {hood}
          </span>
        ) : (
          <span />
        )}
        <span className="text-sm font-medium text-brand-secondary">View →</span>
      </div>
    </Link>
  );
}

function SkeletonCard() {
  return (
    <div className="bg-bg-primary border border-brand-tertiary rounded-xl p-4 animate-pulse flex flex-col gap-3">
      <div className="flex items-start gap-3">
        <div className="w-12 h-12 rounded-full bg-bg-accent flex-shrink-0" />
        <div className="flex-1">
          <div className="h-4 bg-bg-accent rounded w-3/5 mb-2" />
          <div className="flex gap-1">
            <div className="h-4 bg-bg-accent rounded w-14" />
            <div className="h-4 bg-bg-accent rounded w-16" />
          </div>
        </div>
      </div>
      <div className="h-3 bg-bg-accent rounded w-full" />
      <div className="h-3 bg-bg-accent rounded w-4/5" />
    </div>
  );
}

export function OrganizationsDirectory() {
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedTag = searchParams.get('tag');

  const [sort, setSort] = useState<SortOption>('az');
  const [searchQuery, setSearchQuery] = useState('');

  const { data: causesData } = useQuery(GET_CAUSES);
  const { loading, data } = useQuery(GET_CHARITIES);

  const causes = causesData?.causes ?? [];
  const allCharities: Charity[] = data?.charities ?? [];

  const tagLabels = useMemo(
    () => new Map(causes.map((c: { tag: string; label: string }) => [c.tag, c.label])),
    [causes]
  );

  const filteredCharities = useMemo(() => {
    let list = selectedTag
      ? allCharities.filter((c) => c.causeTags.includes(selectedTag))
      : allCharities;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter((c) => c.name.toLowerCase().includes(q));
    }

    return [...list].sort((a, b) => {
      if (sort === 'neighborhood') {
        const hoodA = primaryNeighborhood(a) ?? 'zzzz';
        const hoodB = primaryNeighborhood(b) ?? 'zzzz';
        const hoodCmp = hoodA.localeCompare(hoodB);
        if (hoodCmp !== 0) return hoodCmp;
      }
      // Featured orgs float to top within any sort
      if (a.featured && !b.featured) return -1;
      if (!a.featured && b.featured) return 1;
      return a.name.localeCompare(b.name);
    });
  }, [allCharities, selectedTag, sort, searchQuery]);

  function setTag(tag: string | null) {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (tag) next.set('tag', tag);
      else next.delete('tag');
      return next;
    });
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-text-primary mb-1">Denver Nonprofits</h1>
        <p className="text-text-secondary text-sm">Browse all local organizations doing good work in the community.</p>
      </div>

      {/* Controls */}
      <div className="flex flex-col gap-3 mb-6">
        {/* Search */}
        <div className="relative">
          <Icon name="search" className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none" />
          <input
            type="text"
            placeholder="Search organizations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-brand-tertiary bg-bg-primary text-text-primary placeholder-text-secondary text-sm focus:outline-none focus:border-brand-secondary"
          />
        </div>

        {/* Filter + Sort row */}
        <div className="flex items-center gap-3">
          <div className="flex-1 min-w-0">
            <CauseFilterBar causes={causes} selectedTag={selectedTag} onChange={setTag} />
          </div>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortOption)}
            className="flex-shrink-0 text-xs px-2.5 py-1.5 rounded-lg border border-brand-tertiary bg-bg-primary text-text-secondary focus:outline-none focus:border-brand-secondary"
          >
            <option value="az">A–Z</option>
            <option value="neighborhood">Neighborhood</option>
          </select>
        </div>
      </div>

      {/* Result count */}
      {!loading && (
        <p className="text-xs text-text-secondary mb-4">
          {filteredCharities.length} {filteredCharities.length === 1 ? 'organization' : 'organizations'}
          {selectedTag && ` in ${tagLabels.get(selectedTag) ?? selectedTag}`}
        </p>
      )}

      {/* Cards */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : filteredCharities.length === 0 ? (
        <div className="text-center py-16 text-text-secondary">
          <p className="mb-3">No organizations match your filters.</p>
          <button
            onClick={() => { setTag(null); setSearchQuery(''); }}
            className="text-sm underline underline-offset-2 hover:text-text-primary"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCharities.map((charity) => (
            <CharityCard key={charity.id} charity={charity} tagLabels={tagLabels} />
          ))}
        </div>
      )}
    </div>
  );
}
