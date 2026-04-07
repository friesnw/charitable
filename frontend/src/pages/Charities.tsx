import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useQuery, useLazyQuery, useMutation, gql } from "@apollo/client";
import { cloudinaryUrl } from "../lib/cloudinary";
import {
  causeColor,
  causeIcon,
  causeColorMuted,
  FEATURED_TAGS,
  causesToTagLabels,
} from "../lib/causeColors";
import { nearestNeighborhood, NEIGHBORHOODS } from "../lib/neighborhoods";
import { Icon } from "../components/ui/Icon";
import { Toast } from "../components/ui/Toast";
import { useAuth } from "../hooks/useAuth";
import Map, { MapRef, Marker } from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";
import useSupercluster from "use-supercluster";

const MY_PREFERENCES_ZIP = gql`
  query MyPreferencesZip {
    myPreferences {
      zipCode
      neighborhood
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

const SAVE_PREFERENCES = gql`
  mutation SavePreferencesFromMap($zipCode: String, $neighborhood: String) {
    savePreferences(zipCode: $zipCode, neighborhood: $neighborhood) {
      zipCode
      neighborhood
      onboardingCompleted
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
  query GetCharities($tags: [String]) {
    charities(tags: $tags) {
      id
      slug
      name
      description
      logoUrl
      causeTags
      donateUrl
      coverPhotoUrl
      locations {
        id
        label
        description
        address
        photoUrl
        latitude
        longitude
        isSublocation
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
  causeTags: string[];
  donateUrl: string | null;
  coverPhotoUrl: string | null;
  locations: {
    id: string;
    label: string;
    description: string | null;
    address: string | null;
    photoUrl: string | null;
    latitude: number | null;
    longitude: number | null;
    isSublocation: boolean;
  }[];
}

interface LocationEntry {
  charity: Charity;
  location: Charity["locations"][0];
}
interface LocationGroup {
  lat: number;
  lng: number;
  address: string | null;
  entries: LocationEntry[];
}

/** Group all charity locations by exact address match. Locations without an address fall back to their own group. */
function buildLocationGroups(charities: Charity[]): LocationGroup[] {
  const groups: LocationGroup[] = [];
  for (const charity of charities) {
    for (const loc of charity.locations) {
      if (loc.latitude == null || loc.longitude == null) continue;
      const normalizedAddress = loc.address?.trim().toLowerCase() ?? null;
      const existing = normalizedAddress
        ? groups.find(
            (g) => g.address != null && g.address === normalizedAddress,
          )
        : null;
      if (existing) {
        existing.entries.push({ charity, location: loc });
      } else {
        groups.push({
          lat: loc.latitude,
          lng: loc.longitude,
          address: normalizedAddress,
          entries: [{ charity, location: loc }],
        });
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

function snapZoom(zoom: number): number {
  if (zoom < 9.5) return 8; // full metro → max clusters
  if (zoom < 11) return 10; // large district clusters
  if (zoom < 12.5) return 11.5; // neighborhood clusters
  if (zoom < 14) return 13; // block-level clusters
  return 15; // individual pins
}

function CauseDot({
  color,
  icon,
  size = 32,
}: {
  color: string;
  icon: string;
  size?: number;
}) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        backgroundColor: color,
        border: "2.5px solid white",
        boxShadow: "0 2px 6px rgba(0,0,0,0.3)",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: size * 0.44,
        lineHeight: 1,
      }}
    >
      {icon}
    </div>
  );
}

function LocationDrawer({
  group,
  tagLabels,
  onClose,
}: {
  group: LocationGroup;
  tagLabels: Map<string, string>;
  onClose: () => void;
}) {
  const [visible, setVisible] = useState(false);
  const [drawerSnap, setDrawerSnap] = useState<"partial" | "full">("partial");
  const touchStartY = useRef<number>(0);
  const hood = nearestNeighborhood(group.lat, group.lng);
  const sorted = [...group.entries].sort(
    (a, b) =>
      Number(a.location.isSublocation) - Number(b.location.isSublocation),
  );

  useEffect(() => {
    const id = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(id);
  }, []);

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-30 transition-transform duration-300 ease-out lg:left-auto lg:right-4 lg:bottom-4 lg:w-[420px]"
      style={{ transform: visible ? "translateY(0)" : "translateY(100%)" }}
    >
      <div
        className={`bg-white rounded-t-2xl lg:rounded-2xl shadow-2xl overflow-hidden flex flex-col transition-[max-height] duration-300 ease-out ${drawerSnap === "partial" ? "max-h-[62vh] lg:max-h-[85vh]" : "max-h-[85vh]"}`}
      >
        {/* Drag handle — mobile only */}
        <div
          className="flex justify-center pt-3 pb-1 flex-shrink-0 lg:hidden"
          onTouchStart={(e) => {
            touchStartY.current = e.touches[0].clientY;
          }}
          onTouchEnd={(e) => {
            const delta = e.changedTouches[0].clientY - touchStartY.current;
            if (drawerSnap === "partial") {
              if (delta < -60) setDrawerSnap("full");
              else if (delta > 80) onClose();
            } else {
              if (delta > 60) setDrawerSnap("partial");
            }
          }}
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
                        <img
                          src={cloudinaryUrl(location.photoUrl, {
                            w: 800,
                            h: 224,
                            fit: "fill",
                          })}
                          alt={location.label}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                  )}
                  <div className="px-4 pt-3 pb-4">
                    <h3 className="text-base font-bold text-gray-900 leading-snug mb-1">
                      {location.label}
                    </h3>
                    {location.description && (
                      <p className="text-sm text-gray-700 mb-3">
                        {location.description}
                      </p>
                    )}
                    {/* Org section */}
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <div className="flex items-center gap-3 mb-3">
                        {charity.logoUrl ? (
                          <img
                            src={cloudinaryUrl(charity.logoUrl, {
                              w: 56,
                              h: 56,
                              fit: "fit",
                            })}
                            alt={charity.name}
                            className="w-10 h-10 rounded-full object-contain flex-shrink-0 border border-gray-100"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-sm font-bold text-gray-500 flex-shrink-0">
                            {charity.name.slice(0, 2).toUpperCase()}
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-900 text-sm truncate">
                            {charity.name}
                          </p>
                          {charity.description && (
                            <p className="text-xs text-gray-500 line-clamp-2 mt-0.5">
                              {charity.description}
                            </p>
                          )}
                        </div>
                      </div>
                      <Link
                        to={`/charities/${charity.slug}`}
                        className="block text-center py-2.5 rounded-lg text-sm font-medium text-white bg-brand-secondary hover:opacity-90 transition-opacity"
                      >
                        View charity →
                      </Link>
                    </div>
                  </div>
                </div>
              ) : (
                // Primary: full-bleed hero with gradient + neighborhood badge + close button
                <div>
                  <div className="relative w-full h-44 flex-shrink-0 overflow-hidden">
                    {location.photoUrl ? (
                      <img
                        src={cloudinaryUrl(location.photoUrl, {
                          w: 800,
                          h: 352,
                          fit: "fill",
                        })}
                        alt={location.label}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div
                        className="w-full h-full"
                        style={{
                          backgroundColor: causeColor(charity.causeTags),
                        }}
                      />
                    )}
                    <div
                      className="absolute inset-0"
                      style={{
                        background:
                          "linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 60%)",
                      }}
                    />
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
                    <h2 className="text-lg font-bold text-gray-900 leading-snug mb-1">
                      {location.label}
                    </h2>
                    {location.address && (
                      <p className="text-sm text-gray-500 mb-2">
                        {location.address}
                      </p>
                    )}
                    {location.description && (
                      <p className="text-sm text-gray-700 mb-3">
                        {location.description}
                      </p>
                    )}
                    {/* Org section */}
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <div className="flex items-center gap-3 mb-3">
                        {charity.logoUrl ? (
                          <img
                            src={cloudinaryUrl(charity.logoUrl, {
                              w: 56,
                              h: 56,
                              fit: "fit",
                            })}
                            alt={charity.name}
                            className="w-10 h-10 rounded-full object-contain flex-shrink-0 border border-gray-100"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-sm font-bold text-gray-500 flex-shrink-0">
                            {charity.name.slice(0, 2).toUpperCase()}
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-900 text-sm truncate">
                            {charity.name}
                          </p>
                          {charity.description && (
                            <p className="text-xs text-gray-500 line-clamp-2 mt-0.5">
                              {charity.description}
                            </p>
                          )}
                        </div>
                      </div>
                      <Link
                        to={`/charities/${charity.slug}`}
                        className="block text-center py-2.5 rounded-lg text-sm font-medium text-white bg-brand-secondary hover:opacity-90 transition-opacity"
                      >
                        View charity →
                      </Link>
                    </div>
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

const CURATED_NAMES = [
  "Cap Hill",
  "RiNo",
  "Highland",
  "LoDo",
  "Five Points",
  "City Park",
  "Baker",
  "Wash Park",
  "Cherry Creek",
  "Edgewater",
];
const curatedNeighborhoods = NEIGHBORHOODS.filter((n) =>
  CURATED_NAMES.includes(n.name),
);

function LocationIntro({
  onNeighborhoodSelect,
  onZipSubmit,
  onSkip,
}: {
  onNeighborhoodSelect: (name: string, lat: number, lng: number) => void;
  onZipSubmit: (zip: string) => void;
  onSkip: () => void;
}) {
  const [zipValue, setZipValue] = useState("");
  const [search, setSearch] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const matches =
    search.trim().length > 0
      ? NEIGHBORHOODS.filter((n) =>
          n.name.toLowerCase().includes(search.toLowerCase()),
        )
      : [];

  function handleZip() {
    const digits = zipValue.replace(/\D/g, "");
    if (digits.length === 5) onZipSubmit(digits);
  }

  return (
    <div className="absolute inset-0 z-20 bg-bg-primary overflow-y-auto flex flex-col items-center justify-start py-14 px-4">
      <div className="w-full max-w-2xl text-center">
        <h1 className="text-3xl font-bold text-text-primary mb-8">
          Where in Denver are you located?
        </h1>

        {/* ZIP input */}
        <div className="flex gap-2 justify-center mb-10">
          <input
            type="text"
            inputMode="numeric"
            placeholder="Enter ZIP code"
            value={zipValue}
            onChange={(e) =>
              setZipValue(e.target.value.replace(/\D/g, "").slice(0, 5))
            }
            onKeyDown={(e) => e.key === "Enter" && handleZip()}
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
          <span className="text-sm text-text-secondary">
            or pick your neighborhood
          </span>
          <div className="flex-1 h-px bg-brand-tertiary" />
        </div>

        {/* Neighborhood chips + inline search */}
        <div className="flex flex-wrap gap-2 justify-center mb-10">
          {curatedNeighborhoods.map((n) => (
            <button
              key={n.name}
              onClick={() => onNeighborhoodSelect(n.name, n.lat, n.lng)}
              className="flex-shrink-0 text-xs px-3 py-1.5 rounded-full shadow font-medium transition-all hover:ring-1 hover:ring-brand-secondary"
              style={{
                backgroundColor: "rgba(255,255,255,0.9)",
                color: "#374151",
                border: "1px solid #e5e7eb",
              }}
            >
              {n.name}
            </button>
          ))}
          <div className="relative flex-shrink-0">
            <input
              type="text"
              placeholder="More neighborhoods..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setDropdownOpen(true);
              }}
              onFocus={() => setDropdownOpen(true)}
              onBlur={() => setTimeout(() => setDropdownOpen(false), 150)}
              className="text-xs px-3 py-1.5 rounded-full shadow font-medium focus:outline-none"
              style={{
                backgroundColor: "rgba(255,255,255,0.9)",
                color: "#6b7280",
                border: "1px solid #e5e7eb",
                width: "160px",
              }}
            />
            {dropdownOpen && matches.length > 0 && (
              <ul className="absolute left-0 top-full mt-1 min-w-full bg-bg-primary border border-brand-tertiary rounded-xl shadow-lg overflow-hidden z-10 text-left">
                {matches.map((n) => (
                  <li key={n.name}>
                    <button
                      onMouseDown={() => {
                        onNeighborhoodSelect(n.name, n.lat, n.lng);
                      }}
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

function StackedPin({
  group,
  isSelected,
  isHovered,
  isDimmed,
  zoom,
}: {
  group: LocationGroup;
  isSelected: boolean;
  isHovered: boolean;
  isDimmed: boolean;
  zoom: number;
}) {
  const scale = isSelected ? 1.45 : isHovered ? 1.2 : 1;
  const { entries } = group;
  const size = pinSize(zoom);
  const isSmall = size < 22;
  const icon = isSmall ? "" : causeIcon(entries[0].charity.causeTags);

  if (entries.length === 1 || isSmall) {
    return (
      <div
        style={{
          transform: `scale(${scale})`,
          transition: "transform 0.15s, opacity 0.15s",
          opacity: isDimmed ? 0.35 : 1,
          animation: "cluster-pop 0.3s ease-out forwards",
        }}
      >
        <CauseDot
          color={causeColor(entries[0].charity.causeTags)}
          icon={icon}
          size={size}
        />
      </div>
    );
  }

  // Stacked overlapping dots
  const overlap = Math.round(size * 0.31);
  const totalWidth = size + (entries.length - 1) * (size - overlap);
  return (
    <div
      style={{
        transform: `scale(${scale})`,
        transition: "transform 0.15s, opacity 0.15s",
        opacity: isDimmed ? 0.35 : 1,
        position: "relative",
        width: totalWidth,
        height: size,
        animation: "cluster-pop 0.3s ease-out forwards",
      }}
    >
      {entries.map((entry, i) => (
        <div
          key={entry.location.id}
          style={{
            position: "absolute",
            left: i * (size - overlap),
            top: 0,
            zIndex: entries.length - i,
          }}
        >
          <CauseDot
            color={causeColor(entry.charity.causeTags)}
            icon={isSmall ? "" : causeIcon(entry.charity.causeTags)}
            size={size}
          />
        </div>
      ))}
    </div>
  );
}

function clusterPinSize(snappedZoom: number): number {
  if (snappedZoom <= 8) return 52;
  if (snappedZoom <= 10) return 48;
  if (snappedZoom <= 11.5) return 44;
  if (snappedZoom <= 13) return 38;
  return 32;
}

function ClusterPin({
  count,
  topCauseTags,
  snappedZoom,
  onClick,
}: {
  count: number;
  topCauseTags: string[];
  snappedZoom: number;
  onClick: () => void;
}) {
  const color = causeColor(topCauseTags);
  const size = clusterPinSize(snappedZoom);
  const fontSize = size <= 38 ? 11 : 13;
  return (
    <div
      onClick={onClick}
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        backgroundColor: color,
        border: "3px solid white",
        boxShadow: "0 2px 8px rgba(0,0,0,0.35)",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        animation: "cluster-pop 0.3s ease-out forwards",
      }}
    >
      <span
        style={{ color: "white", fontWeight: 700, fontSize, lineHeight: 1 }}
      >
        {count > 99 ? "99+" : count}
      </span>
    </div>
  );
}

const ZIP_ZOOM_OFFSET = -1;
const PEEK_HEIGHT = 220;

export function Charities() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  // Support new comma-separated ?tags= param and legacy single ?tag= for backward compat
  const selectedTags = (() => {
    const tagsParam = searchParams.get("tags");
    if (tagsParam) return tagsParam.split(",").filter(Boolean);
    const legacyTag = searchParams.get("tag");
    return legacyTag ? [legacyTag] : [];
  })();

  const tagStyle = searchParams.get("tagStyle") ?? "a";

  // URL params from homepage neighborhood navigation — center map without saving preferences
  const urlLat = parseFloat(searchParams.get("lat") ?? "");
  const urlLng = parseFloat(searchParams.get("lng") ?? "");
  const urlNeighborhood = searchParams.get("neighborhood");
  const hasUrlCenter = !isNaN(urlLat) && !isNaN(urlLng);

  const [zoom, setZoom] = useState(11.5);
  const [selectedGroupKey, setSelectedGroupKey] = useState<string | null>(null);
  const [selectedCharityId, setSelectedCharityId] = useState<string | null>(
    null,
  );
  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(
    null,
  );
  const [hoveredCharityId, setHoveredCharityId] = useState<string | null>(null);
  const [showAllTags, setShowAllTags] = useState(false);

  const [initialCenter, setInitialCenter] = useState<
    { longitude: number; latitude: number; zoom: number } | undefined
  >();
  const [activeZip, setActiveZip] = useState<string | null>(() =>
    localStorage.getItem("userZip"),
  );
  const [locationEditing, setLocationEditing] = useState(false);
  const [locationQuery, setLocationQuery] = useState("");

  const [mapVisible, setMapVisible] = useState(false);

  // Mobile-specific state
  const [sheetState, setSheetState] = useState<"peek" | "full">("peek");
  const [isDraggingSheet, setIsDraggingSheet] = useState(false);

  const mapRef = useRef<MapRef>(null);
  const sheetRef = useRef<HTMLDivElement>(null);
  const sheetTouchStartY = useRef(0);
  const savedView = useRef<{ center: [number, number]; zoom: number } | null>(
    null,
  );
  const pendingCenterRef = useRef<{
    longitude: number;
    latitude: number;
    zoom: number;
  } | null>(null);
  const awaitingInitialMove = useRef(false);
  const isInitiallyPositioned = useRef(false);
  const programmaticFlyRef = useRef(false);

  const [introSkipped, setIntroSkipped] = useState(true);
  const [activeNeighborhood, setActiveNeighborhood] = useState<string | null>(
    () => {
      const h = localStorage.getItem("userNeighborhood");
      return h ? (JSON.parse(h) as { name: string }).name : null;
    },
  );
  const [toast, setToast] = useState<{ message: string } | null>(null);

  const [resolveZip] = useLazyQuery(RESOLVE_ZIP);
  const [savePreferences] = useMutation(SAVE_PREFERENCES, {
    update(cache, { data }) {
      if (!data?.savePreferences) return;
      cache.writeQuery({
        query: MY_PREFERENCES_ZIP,
        data: {
          myPreferences: {
            zipCode: data.savePreferences.zipCode,
            neighborhood: data.savePreferences.neighborhood,
          },
        },
      });
    },
  });
  const { data: prefsData, loading: prefsLoading } = useQuery(
    MY_PREFERENCES_ZIP,
    { skip: !isAuthenticated },
  );
  const { loading, error, data } = useQuery(GET_CHARITIES, {
    variables: { tags: selectedTags.length ? selectedTags : undefined },
  });
  const { data: causesData } = useQuery(GET_CAUSES);

  const tagLabels = causesToTagLabels(causesData?.causes ?? []);
  const charities: Charity[] = data?.charities ?? [];
  const groups = useMemo(() => buildLocationGroups(charities), [charities]);

  const groupKey = (g: LocationGroup) => g.address ?? `${g.lat},${g.lng}`;

  const [bounds, setBounds] = useState<
    [number, number, number, number] | undefined
  >(undefined);

  const clusterPoints = useMemo(
    () =>
      groups.map((group, index) => ({
        type: "Feature" as const,
        geometry: {
          type: "Point" as const,
          coordinates: [group.lng, group.lat],
        },
        properties: { groupKey: groupKey(group), index },
      })),
    [groups],
  );

  const snappedZoom = snapZoom(zoom);
  const clusterRadius =
    snappedZoom <= 8
      ? 80
      : snappedZoom <= 10
        ? 70
        : snappedZoom <= 11.5
          ? 60
          : snappedZoom <= 13
            ? 50
            : 40;
  const { clusters, supercluster } = useSupercluster({
    points: clusterPoints,
    bounds,
    zoom: snappedZoom,
    options: { radius: clusterRadius, maxZoom: 14, minPoints: 2 },
  });

  const availableTags = Array.from(
    new Set(charities.flatMap((c) => c.causeTags)),
  );
  const featuredTags = FEATURED_TAGS.filter((t) => availableTags.includes(t));
  const remainingTags = availableTags
    .filter((t) => !FEATURED_TAGS.includes(t))
    .sort();
  const effectiveShowAll =
    showAllTags || selectedTags.some((t) => remainingTags.includes(t));
  const visibleTags = effectiveShowAll
    ? [...featuredTags, ...remainingTags]
    : featuredTags;

  const selectedGroup = selectedGroupKey
    ? (groups.find((g) => groupKey(g) === selectedGroupKey) ?? null)
    : null;

  function handleSheetTouchStart(e: React.TouchEvent) {
    sheetTouchStartY.current = e.touches[0].clientY;
    setIsDraggingSheet(true);
  }

  function handleSheetTouchMove(e: React.TouchEvent) {
    if (!sheetRef.current) return;
    const delta = e.touches[0].clientY - sheetTouchStartY.current;
    const base =
      sheetState === "peek" ? `calc(100% - ${PEEK_HEIGHT}px)` : "0px";
    sheetRef.current.style.transform = `translateY(calc(${base} + ${delta}px))`;
  }

  function handleSheetTouchEnd(e: React.TouchEvent) {
    const delta = e.changedTouches[0].clientY - sheetTouchStartY.current;
    if (sheetState === "peek" && delta < -60) {
      setSheetState("full");
    } else if (sheetState === "peek" && delta > 80) {
      updateSelectedTags([]);
    } else if (sheetState === "full" && delta > 60) {
      setSheetState("peek");
    }
    setIsDraggingSheet(false);
  }

  function updateSelectedTags(tags: string[]) {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (tags.length) next.set("tags", tags.join(","));
      else next.delete("tags");
      next.delete("tag"); // clear legacy param
      return next;
    });
  }

  // Location from auth preferences
  useEffect(() => {
    if (!isAuthenticated || !prefsData?.myPreferences) return;
    if (hasUrlCenter) return;
    const { zipCode, neighborhood } = prefsData.myPreferences;
    if (zipCode) {
      setActiveZip(zipCode);
      resolveZip({ variables: { zip: zipCode } }).then(({ data }) => {
        const info = data?.resolveZip;
        if (info?.state === "CO")
          setInitialCenter({
            longitude: info.longitude,
            latitude: info.latitude,
            zoom: info.zoom,
          });
      });
    } else if (neighborhood) {
      const hood = NEIGHBORHOODS.find((n) => n.name === neighborhood);
      if (hood) {
        setActiveNeighborhood(hood.name);
        setInitialCenter({ longitude: hood.lng, latitude: hood.lat, zoom: 14 });
      }
    }
  }, [isAuthenticated, prefsData]);

  // Resolve initial map position from localStorage for unauthenticated users.
  useEffect(() => {
    if (!isAuthenticated) {
      if (hasUrlCenter) return;
      const localZip = localStorage.getItem("userZip");
      if (localZip) {
        resolveZip({ variables: { zip: localZip } }).then(({ data }) => {
          const info = data?.resolveZip;
          if (info?.state === "CO")
            setInitialCenter({
              longitude: info.longitude,
              latitude: info.latitude,
              zoom: info.zoom,
            });
        });
        return;
      }
      const localHood = localStorage.getItem("userNeighborhood");
      if (localHood) {
        const parsed = JSON.parse(localHood) as {
          name: string;
          lat: number;
          lng: number;
        };
        setInitialCenter({
          longitude: parsed.lng,
          latitude: parsed.lat,
          zoom: 14,
        });
      }
    }
  }, [isAuthenticated]);

  // Center map on lat/lng URL params (e.g., from homepage neighborhood pills) — saves to localStorage but not auth prefs
  useEffect(() => {
    if (hasUrlCenter) {
      setInitialCenter({ longitude: urlLng, latitude: urlLat, zoom: 14 });
      if (urlNeighborhood) {
        setActiveNeighborhood(urlNeighborhood);
        localStorage.setItem(
          "userNeighborhood",
          JSON.stringify({ name: urlNeighborhood, lat: urlLat, lng: urlLng }),
        );
        localStorage.removeItem("userZip");
      }
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps — intentionally runs once on mount

  // Show intro when no location is set and user hasn't skipped.
  const showIntro =
    !introSkipped &&
    !authLoading &&
    activeZip === null &&
    activeNeighborhood === null &&
    (!isAuthenticated || !prefsLoading) &&
    !(
      prefsData?.myPreferences?.zipCode ||
      prefsData?.myPreferences?.neighborhood
    );

  const isZipMode = /^\d/.test(locationQuery);
  const locationSuggestions =
    !isZipMode && locationQuery.trim().length > 0
      ? NEIGHBORHOODS.filter((n) =>
          n.name.toLowerCase().includes(locationQuery.toLowerCase()),
        ).slice(0, 6)
      : [];

  function cancelEditing() {
    setLocationEditing(false);
    setLocationQuery("");
  }

  function handleNeighborhoodSelect(name: string, lat: number, lng: number) {
    setActiveNeighborhood(name);
    setInitialCenter({ longitude: lng, latitude: lat, zoom: 14 });
    setIntroSkipped(true);
    setToast({ message: `Near ${name}` });
    if (isAuthenticated) {
      savePreferences({ variables: { neighborhood: name, zipCode: null } });
    } else {
      localStorage.setItem(
        "userNeighborhood",
        JSON.stringify({ name, lat, lng }),
      );
    }
  }

  // Sidebar-only / pill: fly map, no toast, no preference save
  function handleSidebarNeighborhoodSelect(
    name: string,
    lat: number,
    lng: number,
  ) {
    setActiveNeighborhood(name);
    setActiveZip(null);
    setInitialCenter({ longitude: lng, latitude: lat, zoom: 14 });
    localStorage.setItem(
      "userNeighborhood",
      JSON.stringify({ name, lat, lng }),
    );
    localStorage.removeItem("userZip");
    cancelEditing();
  }

  function handleChangeLocation() {
    setActiveZip(null);
    setActiveNeighborhood(null);
    setIntroSkipped(false);
    setToast(null);
    localStorage.removeItem("userZip");
    localStorage.removeItem("userNeighborhood");
  }

  // When initial location resolves: jump instantly (first time) or fly (subsequent changes).
  useEffect(() => {
    if (!initialCenter) return;
    const view = {
      longitude: initialCenter.longitude,
      latitude: initialCenter.latitude,
      zoom: initialCenter.zoom + ZIP_ZOOM_OFFSET,
    };
    if (!isInitiallyPositioned.current) {
      isInitiallyPositioned.current = true;
      awaitingInitialMove.current = true;
      if (mapRef.current?.isStyleLoaded()) {
        mapRef.current.jumpTo({
          center: [view.longitude, view.latitude],
          zoom: view.zoom,
        });
      } else {
        pendingCenterRef.current = view;
      }
    } else {
      mapRef.current?.flyTo({
        center: [view.longitude, view.latitude],
        zoom: view.zoom,
        duration: 800,
      });
    }
  }, [initialCenter]);

  // Fly to selected pin or charity's pins, or return to saved view when deselected
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const pad = { top: 80, bottom: 60, left: 40, right: 40 };

    if (selectedGroupKey) {
      const group = groups.find((g) => groupKey(g) === selectedGroupKey);
      if (!group) return;
      const center = map.getCenter();
      savedView.current = {
        center: [center.lng, center.lat],
        zoom: map.getZoom(),
      };
      const isMobile = window.innerWidth < 1024;
      programmaticFlyRef.current = true;
      map.flyTo({
        center: [group.lng, group.lat],
        zoom: isMobile ? 13 : 14,
        duration: 600,
        padding: pad,
      });
    } else if (selectedLocationId) {
      const loc = charities
        .flatMap((c) => c.locations)
        .find((l) => l.id === selectedLocationId);
      if (!loc || loc.latitude == null || loc.longitude == null) return;
      programmaticFlyRef.current = true;
      map.flyTo({
        center: [loc.longitude, loc.latitude],
        zoom: 14,
        duration: 600,
        padding: pad,
      });
    } else if (selectedCharityId) {
      const charity = charities.find((c) => c.id === selectedCharityId);
      const locs =
        charity?.locations.filter(
          (l) => l.latitude != null && l.longitude != null,
        ) ?? [];
      if (locs.length === 0) return;
      const center = map.getCenter();
      savedView.current = {
        center: [center.lng, center.lat],
        zoom: map.getZoom(),
      };
      programmaticFlyRef.current = true;
      if (locs.length === 1) {
        map.flyTo({
          center: [locs[0].longitude!, locs[0].latitude!],
          zoom: 13,
          duration: 600,
          padding: pad,
        });
      } else {
        const lngs = locs.map((l) => l.longitude!);
        const lats = locs.map((l) => l.latitude!);
        map.fitBounds(
          [
            [Math.min(...lngs), Math.min(...lats)],
            [Math.max(...lngs), Math.max(...lats)],
          ],
          { padding: pad, maxZoom: 14, duration: 600 },
        );
      }
    } else if (savedView.current) {
      programmaticFlyRef.current = true;
      map.flyTo({
        center: savedView.current.center,
        zoom: savedView.current.zoom,
        duration: 600,
      });
      savedView.current = null;
    }
  }, [selectedCharityId, selectedGroupKey, selectedLocationId]);

  // Clear selection when the user manually zooms out past a cluster boundary.
  // Guarded by programmaticFlyRef so flyTo animations don't race-clear selection.
  const prevSnappedZoomRef = useRef(snappedZoom);
  useEffect(() => {
    if (
      snappedZoom < prevSnappedZoomRef.current &&
      selectedGroupKey &&
      !programmaticFlyRef.current
    ) {
      setSelectedGroupKey(null);
      setSelectedCharityId(null);
      setSelectedLocationId(null);
    }
    prevSnappedZoomRef.current = snappedZoom;
  }, [snappedZoom]);

  function handleMapLoad() {
    const center = pendingCenterRef.current;
    if (center && mapRef.current) {
      pendingCenterRef.current = null;
      mapRef.current.jumpTo({
        center: [center.longitude, center.latitude],
        zoom: center.zoom,
      });
    } else if (!awaitingInitialMove.current) {
      // No repositioning pending — show the map immediately at default Denver view
      setMapVisible(true);
    }
    const b = mapRef.current?.getBounds();
    if (b) setBounds([b.getWest(), b.getSouth(), b.getEast(), b.getNorth()]);
  }

  const locationLabel = activeZip
    ? `Near ${activeZip}`
    : activeNeighborhood
      ? `Near ${activeNeighborhood}`
      : "Set location";

  return (
    <div className="flex relative" style={{ height: "calc(100vh - 65px)" }}>
      {showIntro && (
        <LocationIntro
          onNeighborhoodSelect={handleNeighborhoodSelect}
          onZipSubmit={(zip) => {
            resolveZip({ variables: { zip } }).then(({ data }) => {
              const info = data?.resolveZip;
              if (!info) return;
              if (isAuthenticated) {
                savePreferences({
                  variables: { zipCode: zip, neighborhood: null },
                });
              } else {
                localStorage.setItem("userZip", zip);
                localStorage.removeItem("userNeighborhood");
              }
              setActiveZip(zip);
              setInitialCenter({
                longitude: info.longitude,
                latitude: info.latitude,
                zoom: info.zoom,
              });
              setIntroSkipped(true);
              setToast({ message: `Near ${zip}` });
            });
          }}
          onSkip={() => {
            setIntroSkipped(true);
            setMapVisible(true);
          }}
        />
      )}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar — desktop only */}
        <div className="hidden lg:flex flex-shrink-0 flex-col border-r border-brand-tertiary bg-bg-primary lg:w-96">
          {/* Location combobox row */}
          <div
            className={`relative flex-shrink-0 border-b px-4 py-2.5 flex items-center gap-2 ${locationEditing ? "border-brand-secondary" : "border-brand-tertiary"}`}
          >
            <Icon
              name="map-pin"
              className="w-4 h-4 text-text-secondary flex-shrink-0"
            />
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
                    const digits = val.replace(/\D/g, "");
                    if (/^\d/.test(val) && digits.length === 5) {
                      resolveZip({ variables: { zip: digits } }).then(
                        ({ data }) => {
                          const info = data?.resolveZip;
                          if (!info) return;
                          setActiveZip(digits);
                          setActiveNeighborhood(null);
                          setInitialCenter({
                            longitude: info.longitude,
                            latitude: info.latitude,
                            zoom: info.zoom,
                          });
                          localStorage.setItem("userZip", digits);
                          localStorage.removeItem("userNeighborhood");
                          cancelEditing();
                        },
                      );
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Escape") {
                      cancelEditing();
                      return;
                    }
                    if (e.key === "Enter" && locationSuggestions.length > 0) {
                      const n = locationSuggestions[0];
                      handleSidebarNeighborhoodSelect(n.name, n.lat, n.lng);
                    }
                  }}
                  onBlur={() => setTimeout(cancelEditing, 150)}
                  className="flex-1 min-w-0 outline-none text-sm text-text-primary bg-transparent"
                />
                <button
                  onClick={cancelEditing}
                  className="text-text-secondary hover:text-text-primary text-sm flex-shrink-0"
                >
                  ✕
                </button>
                {locationSuggestions.length > 0 && (
                  <ul className="absolute left-0 right-0 top-full mt-0 bg-bg-primary border border-brand-tertiary rounded-xl shadow-lg overflow-hidden z-20">
                    {locationSuggestions.map((n) => (
                      <li key={n.name}>
                        <button
                          onMouseDown={() =>
                            handleSidebarNeighborhoodSelect(
                              n.name,
                              n.lat,
                              n.lng,
                            )
                          }
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
                {locationLabel}
              </button>
            )}
          </div>

          {(selectedCharityId || selectedGroupKey) && (
            <button
              onClick={() => {
                setSelectedGroupKey(null);
                setSelectedCharityId(null);
                setSelectedLocationId(null);
              }}
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
              .filter(
                (c) => selectedCharityId === null || c.id === selectedCharityId,
              )
              .map((charity) => {
                const isSelected = charity.id === selectedCharityId;
                const validLocs = charity.locations.filter(
                  (l) => l.latitude != null && l.longitude != null,
                );
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
                            src={cloudinaryUrl(charity.coverPhotoUrl, {
                              w: 800,
                              h: 256,
                              fit: "fill",
                            })}
                            alt={charity.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <div className="px-4 py-3">
                        <div className="flex items-center gap-2 mb-1">
                          {charity.logoUrl ? (
                            <img
                              src={cloudinaryUrl(charity.logoUrl, {
                                w: 32,
                                h: 32,
                                fit: "fit",
                              })}
                              alt={charity.name}
                              className="w-8 h-8 rounded-full object-contain flex-shrink-0"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-bg-accent flex items-center justify-center text-xs font-bold text-text-secondary flex-shrink-0">
                              {charity.name.slice(0, 2).toUpperCase()}
                            </div>
                          )}
                          <span className="font-bold text-text-primary text-sm">
                            {charity.name}
                          </span>
                        </div>
                        {charity.description && (
                          <p className="text-text-secondary text-xs mt-1 line-clamp-3">
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
                          <div
                            className="flex gap-2 mt-3"
                            onClick={(e) => e.stopPropagation()}
                          >
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
                          const normalizedAddress =
                            loc.address?.trim().toLowerCase() ?? null;
                          const locGroup = normalizedAddress
                            ? groups.find(
                                (g) => g.address === normalizedAddress,
                              )
                            : groups.find(
                                (g) =>
                                  g.lat === loc.latitude &&
                                  g.lng === loc.longitude,
                              );
                          const isShared =
                            locGroup && locGroup.entries.length > 1;
                          return (
                            <button
                              key={loc.id}
                              onClick={() => {
                                const next = isHighlighted ? null : loc.id;
                                setSelectedLocationId(next);
                                if (locGroup)
                                  setSelectedGroupKey(
                                    next ? groupKey(locGroup) : null,
                                  );
                              }}
                              className={`w-full text-left transition-colors cursor-pointer ${
                                isHighlighted
                                  ? "bg-brand-accent/30 border-l-4 border-l-brand-accent"
                                  : "hover:bg-bg-accent"
                              } pl-8 pr-4 py-2.5 flex items-center gap-3`}
                            >
                              {loc.photoUrl ? (
                                <img
                                  src={cloudinaryUrl(loc.photoUrl, {
                                    w: 72,
                                    h: 72,
                                    fit: "fill",
                                  })}
                                  alt={loc.label}
                                  className="w-14 h-14 rounded object-cover flex-shrink-0"
                                />
                              ) : (
                                <div className="w-14 h-14 rounded bg-bg-accent border border-brand-tertiary flex-shrink-0 flex items-center justify-center text-text-secondary text-sm font-bold">
                                  {loc.label
                                    .trim()
                                    .split(/\s+/)
                                    .slice(0, 2)
                                    .map((w) => w[0])
                                    .join("")
                                    .toUpperCase()}
                                </div>
                              )}
                              <div className="min-w-0">
                                <div className="font-medium text-text-primary text-sm">
                                  {loc.label}
                                </div>
                                {loc.description && (
                                  <p className="text-text-secondary text-xs mt-0.5 truncate">
                                    {loc.description}
                                  </p>
                                )}
                                <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                                  {loc.latitude != null &&
                                    loc.longitude != null &&
                                    (() => {
                                      const hood = nearestNeighborhood(
                                        loc.latitude,
                                        loc.longitude,
                                      );
                                      return hood ? (
                                        <span className="text-xs px-2 py-0.5 rounded-full border border-flair-green text-flair-green">
                                          {hood}
                                        </span>
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

        {/* Map — always visible */}
        <div className="relative flex-1">
          {toast && (
            <Toast
              key={toast.message}
              message={toast.message}
              action={{ label: "Change", onClick: handleChangeLocation }}
              onDismiss={() => setToast(null)}
            />
          )}

          {/* Mobile top bar pill */}
          <div className="lg:hidden absolute top-3 left-1/2 -translate-x-1/2 z-10 w-[calc(100%-1.5rem)] max-w-sm">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 px-4 py-2 relative">
              {locationEditing ? (
                <div className="flex items-center gap-2">
                  <Icon
                    name="map-pin"
                    className="w-4 h-4 text-gray-400 flex-shrink-0"
                  />
                  <input
                    type="text"
                    placeholder="ZIP or neighborhood..."
                    value={locationQuery}
                    autoFocus
                    onChange={(e) => {
                      const val = e.target.value;
                      setLocationQuery(val);
                      const digits = val.replace(/\D/g, "");
                      if (/^\d/.test(val) && digits.length === 5) {
                        resolveZip({ variables: { zip: digits } }).then(
                          ({ data }) => {
                            const info = data?.resolveZip;
                            if (!info) return;
                            setActiveZip(digits);
                            setActiveNeighborhood(null);
                            setInitialCenter({
                              longitude: info.longitude,
                              latitude: info.latitude,
                              zoom: info.zoom,
                            });
                            if (!isAuthenticated) {
                              localStorage.setItem("userZip", digits);
                              localStorage.removeItem("userNeighborhood");
                            }
                            cancelEditing();
                          },
                        );
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Escape") {
                        cancelEditing();
                        return;
                      }
                      if (e.key === "Enter" && locationSuggestions.length > 0) {
                        const n = locationSuggestions[0];
                        handleSidebarNeighborhoodSelect(n.name, n.lat, n.lng);
                      }
                    }}
                    onBlur={() => setTimeout(cancelEditing, 150)}
                    className="flex-1 min-w-0 outline-none text-sm text-gray-800 bg-transparent"
                  />
                  <button
                    onClick={cancelEditing}
                    className="text-gray-400 hover:text-gray-600 text-sm flex-shrink-0"
                  >
                    ✕
                  </button>
                  {locationSuggestions.length > 0 && (
                    <ul className="absolute left-0 right-0 top-full mt-1 bg-white border border-gray-200 rounded-2xl shadow-xl overflow-hidden z-20">
                      {locationSuggestions.map((n) => (
                        <li key={n.name}>
                          <button
                            onMouseDown={() =>
                              handleSidebarNeighborhoodSelect(
                                n.name,
                                n.lat,
                                n.lng,
                              )
                            }
                            className="w-full text-left px-4 py-2.5 text-sm text-gray-800 hover:bg-gray-50 transition-colors"
                          >
                            {n.name}
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => setLocationEditing(true)}
                  className="w-full text-left text-sm font-medium text-gray-800 truncate"
                >
                  {locationLabel}
                </button>
              )}
            </div>
          </div>

          {/* Tag filters */}
          <div className="absolute z-10 pointer-events-none top-[4.25rem] left-1/2 -translate-x-1/2 w-[calc(100%-1.5rem)] max-w-sm lg:left-0 lg:right-0 lg:top-0 lg:p-3 lg:translate-x-0 lg:max-w-none lg:w-auto">
            <div className="pointer-events-auto flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              <button
                onClick={() => updateSelectedTags([])}
                className="flex-shrink-0 text-xs px-3 py-1.5 rounded-full shadow font-medium transition-colors"
                style={
                  selectedTags.length === 0
                    ? tagStyle === "b"
                      ? { backgroundColor: "var(--brand-secondary)", color: "white" }
                      : { backgroundColor: "#111827", color: "white" }
                    : { backgroundColor: "rgba(255,255,255,0.9)", color: "#374151", border: "1px solid #e5e7eb" }
                }
              >
                All
              </button>
              {visibleTags.map((tag) => {
                const isActive = selectedTags.includes(tag);
                return (
                  <button
                    key={tag}
                    onClick={() => {
                      setShowAllTags(false);
                      updateSelectedTags(
                        isActive
                          ? selectedTags.filter((t) => t !== tag)
                          : [...selectedTags, tag],
                      );
                    }}
                    className="flex-shrink-0 text-xs px-3 py-1.5 rounded-full shadow font-medium transition-all flex items-center gap-1"
                    style={
                      tagStyle === "b"
                        ? isActive
                          ? { backgroundColor: "var(--brand-secondary)", color: "white", border: "2px solid var(--brand-secondary)" }
                          : { backgroundColor: "rgba(255,255,255,0.9)", color: "var(--brand-secondary)", border: "1px solid var(--brand-secondary)" }
                        : isActive
                          ? { backgroundColor: causeColorMuted([tag]), color: "white", border: `2px solid ${causeColorMuted([tag])}` }
                          : { backgroundColor: "rgba(255,255,255,0.9)", color: causeColorMuted([tag]), border: `1px solid ${causeColorMuted([tag])}99` }
                    }
                  >
                    {tagStyle !== "b" && <span className="text-[8px] leading-none" aria-hidden>●</span>}
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
          </div>

          {/* Map controls */}
          <div
            className={`absolute right-3 z-10 flex flex-col rounded-lg shadow-md overflow-hidden border border-gray-200 lg:bottom-6 ${selectedTags.length > 0 ? "bottom-[240px]" : "bottom-6"}`}
          >
            <button
              onClick={() => mapRef.current?.zoomIn()}
              className="w-9 h-9 bg-white hover:bg-gray-50 flex items-center justify-center text-gray-700 border-b border-gray-200"
              aria-label="Zoom in"
            >
              <svg
                viewBox="0 0 16 16"
                fill="currentColor"
                className="w-3.5 h-3.5"
              >
                <path d="M8 2a.75.75 0 0 1 .75.75v4.5h4.5a.75.75 0 0 1 0 1.5h-4.5v4.5a.75.75 0 0 1-1.5 0v-4.5h-4.5a.75.75 0 0 1 0-1.5h4.5v-4.5A.75.75 0 0 1 8 2Z" />
              </svg>
            </button>
            <button
              onClick={() => mapRef.current?.zoomOut()}
              className="w-9 h-9 bg-white hover:bg-gray-50 flex items-center justify-center text-gray-700 border-b border-gray-200"
              aria-label="Zoom out"
            >
              <svg
                viewBox="0 0 16 16"
                fill="currentColor"
                className="w-3.5 h-3.5"
              >
                <path d="M3.25 7.25a.75.75 0 0 0 0 1.5h9.5a.75.75 0 0 0 0-1.5h-9.5Z" />
              </svg>
            </button>
            <button
              onClick={() => {
                if (initialCenter) {
                  mapRef.current?.flyTo({
                    center: [initialCenter.longitude, initialCenter.latitude],
                    zoom: initialCenter.zoom + ZIP_ZOOM_OFFSET,
                    duration: 600,
                  });
                } else {
                  mapRef.current?.flyTo({
                    center: [-104.98832, 39.73669],
                    zoom: 11.5,
                    duration: 600,
                  });
                }
              }}
              className="w-9 h-9 bg-white hover:bg-gray-50 flex items-center justify-center text-gray-700"
              aria-label="Recenter map"
            >
              <svg
                viewBox="0 0 16 16"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                className="w-3.5 h-3.5"
              >
                <circle cx="8" cy="8" r="2.5" />
                <line x1="8" y1="1" x2="8" y2="4.5" />
                <line x1="8" y1="11.5" x2="8" y2="15" />
                <line x1="1" y1="8" x2="4.5" y2="8" />
                <line x1="11.5" y1="8" x2="15" y2="8" />
              </svg>
            </button>
          </div>

          {/* Bottom sheet — mobile only, shown when a cause tag is selected */}
          {selectedTags.length > 0 && (
            <div
              ref={sheetRef}
              className="lg:hidden fixed bottom-0 left-0 right-0 z-20 bg-white rounded-t-2xl shadow-2xl flex flex-col"
              style={{
                height: "85vh",
                transform:
                  sheetState === "peek"
                    ? `translateY(calc(100% - ${PEEK_HEIGHT}px))`
                    : "translateY(0)",
                transition: isDraggingSheet
                  ? "none"
                  : "transform 0.3s ease-out",
              }}
              onTouchStart={handleSheetTouchStart}
              onTouchMove={handleSheetTouchMove}
              onTouchEnd={handleSheetTouchEnd}
            >
              {/* Drag handle */}
              <div className="flex justify-center pt-3 pb-2 flex-shrink-0">
                <div className="w-10 h-1 rounded-full bg-gray-300" />
              </div>

              {/* Count header */}
              <div className="px-4 pb-2 flex-shrink-0">
                <p className="text-sm font-semibold text-gray-700">
                  {loading ? "Loading..." : `${charities.length} charities`}
                </p>
              </div>
              {/* List */}
              <div className="overflow-y-auto flex-1">
                {loading && (
                  <>
                    <SkeletonCard />
                    <SkeletonCard />
                    <SkeletonCard />
                  </>
                )}
                {error && (
                  <p className="text-red-500 p-4 text-sm">
                    Error: {error.message}
                  </p>
                )}
                {charities.map((charity) => (
                  <Link
                    key={charity.id}
                    to={`/charities/${charity.slug}`}
                    className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 hover:bg-gray-50 transition-colors"
                  >
                    {charity.logoUrl ? (
                      <img
                        src={cloudinaryUrl(charity.logoUrl, {
                          w: 48,
                          h: 48,
                          fit: "fit",
                        })}
                        alt={charity.name}
                        className="w-10 h-10 rounded-full object-contain flex-shrink-0 border border-gray-100"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500 flex-shrink-0">
                        {charity.name.slice(0, 2).toUpperCase()}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 text-sm truncate">
                        {charity.name}
                      </p>
                      {charity.description && (
                        <p className="text-xs text-gray-500 line-clamp-2 mt-0.5">
                          {charity.description}
                        </p>
                      )}
                      {charity.causeTags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {charity.causeTags.slice(0, 3).map((tag) => (
                            <span
                              key={tag}
                              className="text-xs px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded"
                            >
                              {tagLabels.get(tag) ?? tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <svg
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      className="w-4 h-4 text-gray-300 flex-shrink-0"
                    >
                      <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M7.21 14.77a.75.75 0 0 1 .02-1.06L11.168 10 7.23 6.29a.75.75 0 1 1 1.04-1.08l4.5 4.25a.75.75 0 0 1 0 1.08l-4.5 4.25a.75.75 0 0 1-1.06-.02Z"
                      />
                    </svg>
                  </Link>
                ))}
              </div>
            </div>
          )}

          <div
            style={{
              visibility: mapVisible ? "visible" : "hidden",
              position: "absolute",
              inset: 0,
            }}
          >
            <Map
              ref={mapRef}
              mapboxAccessToken={import.meta.env.VITE_MAPBOX_TOKEN}
              initialViewState={{
                longitude: -104.98832,
                latitude: 39.73669,
                zoom: window.innerWidth < 1024 ? 10.5 : 11.5,
              }}
              style={{ width: "100%", height: "100%" }}
              mapStyle="mapbox://styles/mapbox/light-v11"
              onLoad={handleMapLoad}
              onMove={(e) => {
                setZoom(e.viewState.zoom);
                const b = mapRef.current?.getBounds();
                if (b)
                  setBounds([
                    b.getWest(),
                    b.getSouth(),
                    b.getEast(),
                    b.getNorth(),
                  ]);
              }}
              onMoveEnd={() => {
                programmaticFlyRef.current = false;
                if (awaitingInitialMove.current) {
                  awaitingInitialMove.current = false;
                  setMapVisible(true);
                }
              }}
            >
              {[...clusters]
                .sort((a) => {
                  const p = a.properties as { cluster?: boolean; index?: number };
                  if (p.cluster) return 0;
                  const g = groups[p.index!];
                  if (!g) return 0;
                  const gKey = groupKey(g);
                  return gKey === selectedGroupKey ||
                    (selectedGroupKey == null &&
                      selectedLocationId != null &&
                      g.entries.some((e) => e.location.id === selectedLocationId))
                    ? 1
                    : -1;
                })
                .map((feature) => {
                  const [lng, lat] = feature.geometry.coordinates;
                  const props = feature.properties as unknown as {
                    cluster: boolean;
                    point_count: number;
                    cluster_id: number;
                    index: number;
                  };

                if (props.cluster) {
                  const leaves =
                    supercluster?.getLeaves(props.cluster_id, 5) ?? [];
                  const topCauseTags = leaves.flatMap(
                    (leaf) =>
                      groups[(leaf.properties as { index: number }).index]
                        ?.entries[0]?.charity.causeTags ?? [],
                  );
                  return (
                    <Marker
                      key={`cluster-${props.cluster_id}`}
                      latitude={lat}
                      longitude={lng}
                      anchor="center"
                    >
                      <ClusterPin
                        count={props.point_count}
                        topCauseTags={topCauseTags}
                        snappedZoom={snappedZoom}
                        onClick={() => {
                          const expansionZoom = Math.min(
                            (supercluster?.getClusterExpansionZoom(
                              props.cluster_id,
                            ) ?? 14) + 0.5,
                            16,
                          );
                          mapRef.current?.flyTo({
                            center: [lng, lat],
                            zoom: expansionZoom,
                            duration: 500,
                          });
                        }}
                      />
                    </Marker>
                  );
                }

                const group = groups[props.index];
                if (!group) return null;
                const key = groupKey(group);
                const isSelected =
                  key === selectedGroupKey ||
                  (selectedGroupKey == null &&
                    selectedLocationId != null &&
                    group.entries.some(
                      (e) => e.location.id === selectedLocationId,
                    ));
                const isHovered = group.entries.some(
                  (e) => e.charity.id === hoveredCharityId,
                );
                const isDimmed =
                  selectedCharityId != null &&
                  !group.entries.some(
                    (e) => e.charity.id === selectedCharityId,
                  ) &&
                  !isHovered;
                const primaryEntry = [...group.entries].sort(
                  (a, b) =>
                    Number(a.location.isSublocation) -
                    Number(b.location.isSublocation),
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
                        setSheetState("peek");
                      }
                    }}
                  >
                    <StackedPin
                      group={group}
                      isSelected={isSelected}
                      isHovered={isHovered}
                      isDimmed={isDimmed}
                      zoom={zoom}
                    />
                  </Marker>
                );
              })}
            </Map>
          </div>
        </div>
      </div>

      {/* LocationDrawer — mobile and desktop */}
      {selectedGroup && (
        <LocationDrawer
          key={selectedGroupKey ?? ""}
          group={selectedGroup}
          tagLabels={tagLabels}
          onClose={() => {
            setSelectedGroupKey(null);
            setSelectedCharityId(null);
            setSelectedLocationId(null);
          }}
        />
      )}
    </div>
  );
}
