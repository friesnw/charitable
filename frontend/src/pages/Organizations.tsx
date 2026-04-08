import { useEffect, useMemo } from "react";
import { Link, Navigate, useSearchParams } from "react-router-dom";
import { useQuery, gql } from "@apollo/client";
import { cloudinaryUrl } from "../lib/cloudinary";
import { nearestNeighborhood } from "../lib/neighborhoods";
import { CauseFilterBar } from "../components/ui/CauseFilterBar";

const GET_CAUSES = gql`
  query GetCausesForBrowse {
    causes {
      tag
      label
      charityCount
    }
  }
`;
const GET_CHARITIES = gql`
  query GetCharitiesForBrowse {
    charities {
      id
      slug
      name
      description
      logoUrl
      coverPhotoUrl
      causeTags
      featured
      locations {
        id
        latitude
        longitude
        isSublocation
        photoUrl
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
  coverPhotoUrl: string | null;
  causeTags: string[];
  featured: boolean;
  locations: {
    id: string;
    latitude: number | null;
    longitude: number | null;
    isSublocation: boolean;
    photoUrl: string | null;
  }[];
}

interface Cause {
  tag: string;
  label: string;
  charityCount: number;
}

function primaryNeighborhood(charity: Charity): string | null {
  const primary =
    charity.locations.find(
      (l) => !l.isSublocation && l.latitude != null && l.longitude != null,
    ) ??
    charity.locations.find((l) => l.latitude != null && l.longitude != null);
  if (!primary || primary.latitude == null || primary.longitude == null)
    return null;
  return nearestNeighborhood(primary.latitude, primary.longitude);
}

function CharityCard({
  charity,
  tagLabels,
}: {
  charity: Charity;
  tagLabels: Map<string, string>;
}) {
  const heroLocation = charity.locations.find((l) => l.photoUrl) ?? charity.locations[0] ?? null;
  const featuredPhoto = charity.coverPhotoUrl ?? heroLocation?.photoUrl ?? null;

  return (
    <Link
      to={`/charities/${charity.slug}`}
      className="bg-bg-primary border border-brand-tertiary rounded-xl overflow-hidden flex flex-col hover:shadow-md hover:border-brand-secondary transition-all"
    >
      {/* Cover photo */}
      {featuredPhoto ? (
        <img
          src={cloudinaryUrl(featuredPhoto, { w: 600, h: 240, fit: "fill" })}
          alt=""
          className="w-full h-36 object-cover"
        />
      ) : (
        <div className="w-full h-36 bg-bg-accent" />
      )}

      {/* Card body */}
      <div className="p-4 flex flex-col gap-3 flex-1">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            {charity.logoUrl ? (
              <img
                src={cloudinaryUrl(charity.logoUrl, { w: 96, h: 96, fit: "fit" })}
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
            <h3 className="font-bold text-text-primary leading-snug">
              {charity.name}
            </h3>
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
                  className="text-xs px-1.5 py-0.5 bg-bg-accent text-text-secondary rounded"
                >
                  {tagLabels.get(tag) ?? tag}
                </span>
              ))}
            </div>
          )}
          </div>
        </div>

        {charity.description && (
          <p className="text-sm text-text-secondary line-clamp-4">
            {charity.description}
          </p>
        )}

        <div className="flex items-center justify-end mt-auto pt-1">
          <span className="text-sm font-medium text-brand-secondary">View →</span>
        </div>
      </div>
    </Link>
  );
}

function SkeletonCard() {
  return (
    <div className="bg-bg-primary border border-brand-tertiary rounded-xl overflow-hidden animate-pulse flex flex-col">
      <div className="w-full h-36 bg-bg-accent" />
      <div className="p-4 flex flex-col gap-3">
        <div>
          <div className="h-4 bg-bg-accent rounded w-3/5 mb-2" />
          <div className="flex gap-1">
            <div className="h-4 bg-bg-accent rounded w-14" />
            <div className="h-4 bg-bg-accent rounded w-16" />
          </div>
        </div>
        <div className="h-3 bg-bg-accent rounded w-full" />
        <div className="h-3 bg-bg-accent rounded w-4/5" />
        <div className="h-3 bg-bg-accent rounded w-full" />
        <div className="h-3 bg-bg-accent rounded w-3/5" />
      </div>
    </div>
  );
}

export function Organizations() {
  const [searchParams, setSearchParams] = useSearchParams();
  // tags= is comma-separated multi-select; 'all' means no filter
  const tagsParam = searchParams.get("tags");
  // Only redirect to /causes on first-ever visit (before they've picked causes)
  const hasPickedCauses = localStorage.getItem("hasPickedCauses") === "true";
  const showList = tagsParam !== null || hasPickedCauses;
  const selectedTags =
    tagsParam && tagsParam !== "all"
      ? tagsParam.split(",").filter(Boolean)
      : [];

  // Retroactively set flag for anyone who already has a tags param (existing users)
  useEffect(() => {
    if (tagsParam !== null) localStorage.setItem("hasPickedCauses", "true");
  }, [tagsParam]);

  const { data: causesData } = useQuery(GET_CAUSES);
  const { loading, data } = useQuery(GET_CHARITIES);

  const causes: Cause[] = causesData?.causes ?? [];
  const allCharities: Charity[] = data?.charities ?? [];

  const tagLabels = useMemo(
    () => new Map(causes.map((c) => [c.tag, c.label])),
    [causes],
  );

  const filteredCharities = useMemo(() => {
    const list =
      selectedTags.length > 0
        ? allCharities.filter((c) =>
            selectedTags.some((t) => c.causeTags.includes(t)),
          )
        : allCharities;
    return [...list].sort((a, b) => {
      if (a.featured && !b.featured) return -1;
      if (!a.featured && b.featured) return 1;
      return a.name.localeCompare(b.name);
    });
  }, [allCharities, selectedTags]);

  function updateSelectedTags(tags: string[]) {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set("tags", tags.length > 0 ? tags.join(",") : "all");
      return next;
    });
  }

  if (!showList) return <Navigate to="/causes" replace />;

  // List screen
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header row */}
      <div className="mb-5">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-2xl font-bold text-text-primary">
            Denver Nonprofits
          </h1>
          {!loading && (
            <span className="text-sm text-text-secondary">
              {filteredCharities.length}{" "}
              {filteredCharities.length === 1 ? "org" : "orgs"}
            </span>
          )}
        </div>

        {/* Cause filter bar */}
        <CauseFilterBar
          causes={causes.filter((c) => c.charityCount > 0)}
          selectedTags={selectedTags}
          onChange={updateSelectedTags}
        />
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : filteredCharities.length === 0 ? (
        <div className="text-center py-16 text-text-secondary">
          <p className="mb-3">No organizations match these causes.</p>
          <button
            type="button"
            onClick={() => updateSelectedTags([])}
            className="text-sm underline underline-offset-2 hover:text-text-primary"
          >
            Show all
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCharities.map((charity) => (
            <CharityCard
              key={charity.id}
              charity={charity}
              tagLabels={tagLabels}
            />
          ))}
        </div>
      )}

    </div>
  );
}
