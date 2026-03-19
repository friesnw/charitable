import { useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useQuery, gql } from '@apollo/client';
import { cloudinaryUrl } from '../lib/cloudinary';
import { causeColor, causeIcon } from '../lib/causeColors';
import { nearestNeighborhood } from '../lib/neighborhoods';
import { CauseFilterBar } from '../components/ui/CauseFilterBar';

const GET_CAUSES = gql`query GetCausesForBrowse { causes { tag label charityCount } }`;
const GET_CHARITIES = gql`
  query GetCharitiesForBrowse {
    charities {
      id slug name description logoUrl causeTags featured
      locations { id latitude longitude isSublocation }
    }
  }
`;

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

interface Cause {
  tag: string;
  label: string;
  charityCount: number;
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

export function Organizations() {
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedTag = searchParams.get('tag');
  const showList = selectedTag !== null;

  const { data: causesData } = useQuery(GET_CAUSES);
  const { loading, data } = useQuery(GET_CHARITIES);

  const causes: Cause[] = causesData?.causes ?? [];
  const allCharities: Charity[] = data?.charities ?? [];

  const tagLabels = useMemo(
    () => new Map(causes.map((c) => [c.tag, c.label])),
    [causes]
  );

  const filteredCharities = useMemo(() => {
    const list = selectedTag && selectedTag !== 'all'
      ? allCharities.filter((c) => c.causeTags.includes(selectedTag))
      : allCharities;
    return [...list].sort((a, b) => {
      if (a.featured && !b.featured) return -1;
      if (!a.featured && b.featured) return 1;
      return a.name.localeCompare(b.name);
    });
  }, [allCharities, selectedTag]);

  function setTag(tag: string | null) {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (tag) next.set('tag', tag);
      else next.delete('tag');
      return next;
    });
  }

  // Cause picker screen
  if (!showList) {
    return (
      <div className="min-h-[calc(100vh-65px)] flex flex-col items-center justify-center px-4 py-16">
        <div className="w-full max-w-2xl text-center">
          <h1 className="text-3xl font-bold text-text-primary mb-3">
            What causes matter to you?
          </h1>
          <p className="text-text-secondary mb-12 text-lg">
            Discover Denver nonprofits doing work you care about.
          </p>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {causes.filter((c) => c.charityCount > 0).map((cause) => (
              <button
                key={cause.tag}
                onClick={() => setTag(cause.tag)}
                className="flex flex-col items-center gap-2 p-5 rounded-2xl border border-brand-tertiary bg-bg-primary hover:border-brand-secondary hover:shadow-md transition-all text-center group"
              >
                <span
                  className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform"
                  style={{ backgroundColor: `${causeColor([cause.tag])}18` }}
                >
                  {causeIcon([cause.tag])}
                </span>
                <span className="font-semibold text-text-primary">{cause.label}</span>
                <span className="text-xs text-text-secondary">
                  {cause.charityCount} {cause.charityCount === 1 ? 'organization' : 'organizations'}
                </span>
              </button>
            ))}
          </div>

          <button
            onClick={() => setTag('all')}
            className="mt-10 text-sm text-text-secondary hover:text-text-primary underline underline-offset-2 transition-colors"
          >
            Browse all organizations →
          </button>
        </div>
      </div>
    );
  }

  // List screen
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-1">
          <h1 className="text-2xl font-bold text-text-primary">Denver Nonprofits</h1>
          {!loading && (
            <span className="text-sm text-text-secondary">{filteredCharities.length} {filteredCharities.length === 1 ? 'organization' : 'organizations'}</span>
          )}
        </div>
        <button
          onClick={() => setTag(null)}
          className="text-sm text-text-secondary hover:text-text-primary transition-colors"
        >
          ← Choose a different cause
        </button>
      </div>

      <div className="mb-6">
        <CauseFilterBar
          causes={causes}
          selectedTag={selectedTag === 'all' ? null : selectedTag}
          onChange={(tag) => setTag(tag ?? 'all')}
        />
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : filteredCharities.length === 0 ? (
        <div className="text-center py-16 text-text-secondary">
          <p className="mb-3">No organizations match this cause.</p>
          <button onClick={() => setTag(null)} className="text-sm underline underline-offset-2 hover:text-text-primary">
            Clear filter
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
