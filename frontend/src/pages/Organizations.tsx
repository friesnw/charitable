import { useEffect, useMemo } from "react";
import { Navigate, useSearchParams } from "react-router-dom";
import { useQuery, gql } from "@apollo/client";
import { CauseFilterBar } from "../components/ui/CauseFilterBar";
import { CharityCard, SkeletonCard, type CharityForCard } from "../components/CharityCard";

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


interface Cause {
  tag: string;
  label: string;
  charityCount: number;
}


export function Organizations() {
  const [searchParams, setSearchParams] = useSearchParams();

  const tagsParam = searchParams.get("tags");
  const hasPickedCauses = localStorage.getItem("hasPickedCauses") === "true";
  const showList = tagsParam !== null || hasPickedCauses;
  const selectedTags =
    tagsParam && tagsParam !== "all"
      ? tagsParam.split(",").filter(Boolean)
      : [];

  useEffect(() => {
    if (tagsParam !== null) localStorage.setItem("hasPickedCauses", "true");
  }, [tagsParam]);

  const { data: causesData } = useQuery(GET_CAUSES);
  const { loading, data } = useQuery(GET_CHARITIES);

  const causes: Cause[] = causesData?.causes ?? [];
  const allCharities: CharityForCard[] = data?.charities ?? [];

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
