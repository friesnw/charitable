/**
 * POC 2 — Location-First Sidebar
 *
 * Problem: The current design is charity-first — you pick an org, then see its
 * locations. But for "what's happening near me?", the natural unit is the place.
 *
 * This POC explores:
 * - Sidebar organized around physical locations (not charities)
 * - Each location card gets a full panel — big photo, neighborhood as the hero
 *   label, address, and then the orgs operating there as secondary info
 * - Co-located charities are naturally surfaced: "2 orgs here"
 * - The map pin click scrolls the sidebar to that location (location is always
 *   the primary anchor)
 *
 * Visit at: /charities/poc-2
 */

import { useRef, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, gql } from '@apollo/client';
import Map, { Marker } from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';
import { cloudinaryUrl } from '../lib/cloudinary';
import { causeColor, causeIcon, FEATURED_TAGS, causesToTagLabels } from '../lib/causeColors';
import { nearestNeighborhood } from '../lib/neighborhoods';

const GET_CAUSES = gql`query GetCauses { causes { tag label } }`;
const GET_CHARITIES = gql`
  query GetCharitiesPOC2($tags: [String]) {
    charities(tags: $tags) {
      id slug name description logoUrl causeTags donateUrl
      locations { id label description address photoUrl latitude longitude }
    }
  }
`;

interface Charity {
  id: string; slug: string; name: string; description: string | null;
  logoUrl: string | null; causeTags: string[]; donateUrl: string | null;
  locations: { id: string; label: string; description: string | null; address: string | null; photoUrl: string | null; latitude: number | null; longitude: number | null }[];
}

interface PlaceGroup {
  key: string;
  lat: number;
  lng: number;
  neighborhood: string | null;
  entries: Array<{ charity: Charity; location: Charity['locations'][0] }>;
}

function buildPlaces(charities: Charity[]): PlaceGroup[] {
  const groups: PlaceGroup[] = [];
  for (const charity of charities) {
    for (const loc of charity.locations) {
      if (loc.latitude == null || loc.longitude == null) continue;
      const normalizedAddress = loc.address?.trim().toLowerCase() ?? null;
      const existing = normalizedAddress
        ? groups.find((g) => g.key === normalizedAddress)
        : null;
      if (existing) {
        existing.entries.push({ charity, location: loc });
      } else {
        groups.push({
          key: normalizedAddress ?? `${loc.latitude},${loc.longitude}`,
          lat: loc.latitude,
          lng: loc.longitude,
          neighborhood: nearestNeighborhood(loc.latitude, loc.longitude),
          entries: [{ charity, location: loc }],
        });
      }
    }
  }
  return groups;
}

function CauseDot({ color, icon }: { color: string; icon: string }) {
  return (
    <div style={{
      width: 32, height: 32, borderRadius: '50%', backgroundColor: color,
      border: '2.5px solid white', boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
      cursor: 'pointer', display: 'flex', alignItems: 'center',
      justifyContent: 'center', fontSize: 14, lineHeight: 1,
    }}>
      {icon}
    </div>
  );
}

function PlaceCard({
  place,
  isSelected,
  tagLabels,
  onSelect,
}: {
  place: PlaceGroup;
  isSelected: boolean;
  tagLabels: Map<string, string>;
  onSelect: () => void;
}) {
  const primaryEntry = place.entries[0];
  const photoUrl = place.entries.find((e) => e.location.photoUrl)?.location.photoUrl ?? null;
  const allTags = Array.from(new Set(place.entries.flatMap((e) => e.charity.causeTags)));

  return (
    <div
      id={`place-${place.key}`}
      className={`border-b border-brand-tertiary transition-colors ${isSelected ? 'bg-brand-accent/10 border-l-4 border-l-brand-accent' : ''}`}
    >
      <button className="w-full text-left" onClick={onSelect}>
        {/* Photo banner */}
        <div className="relative w-full h-36 overflow-hidden bg-bg-accent">
          {photoUrl ? (
            <img
              src={cloudinaryUrl(photoUrl, { w: 600, h: 300, fit: 'fill' })}
              alt={primaryEntry.location.label}
              className="w-full h-full object-cover"
            />
          ) : (
            <div
              className="w-full h-full"
              style={{ background: `linear-gradient(135deg, ${causeColor(allTags)} 0%, ${causeColor(allTags)}88 100%)` }}
            />
          )}

          {/* Overlay badges */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
            <div>
              {place.neighborhood && (
                <span className="block text-white text-xs font-semibold mb-0.5 opacity-90">
                  {place.neighborhood}
                </span>
              )}
              <span className="text-white/70 text-xs">{primaryEntry.location.address}</span>
            </div>
            {place.entries.length > 1 && (
              <span className="flex-shrink-0 bg-white text-gray-900 text-xs font-bold px-2 py-0.5 rounded-full shadow">
                {place.entries.length} orgs
              </span>
            )}
          </div>
        </div>

        {/* Location name + cause icons */}
        <div className="px-4 pt-3 pb-2">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="font-semibold text-text-primary text-sm leading-snug">
                {place.entries.length === 1
                  ? primaryEntry.location.label
                  : place.entries.map((e) => e.location.label).join(' · ')}
              </h3>
              {primaryEntry.location.description && (
                <p className="text-xs text-text-secondary mt-0.5 line-clamp-2">{primaryEntry.location.description}</p>
              )}
            </div>
            {/* Cause dot(s) */}
            <div className="flex -space-x-1 flex-shrink-0">
              {place.entries.slice(0, 3).map((e) => (
                <div key={e.charity.id} style={{ width: 22, height: 22, borderRadius: '50%', backgroundColor: causeColor(e.charity.causeTags), border: '2px solid white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10 }}>
                  {causeIcon(e.charity.causeTags)}
                </div>
              ))}
            </div>
          </div>
        </div>
      </button>

      {/* Expanded org list when selected */}
      {isSelected && (
        <div className="px-4 pb-4">
          <div className="border-t border-brand-tertiary pt-3 space-y-3">
            {place.entries.map(({ charity, location }) => (
              <div key={`${charity.id}-${location.id}`} className="flex items-start gap-3">
                {charity.logoUrl ? (
                  <img src={cloudinaryUrl(charity.logoUrl, { w: 40, h: 40, fit: 'fit' })} alt={charity.name} className="w-10 h-10 rounded-full object-contain flex-shrink-0 border border-gray-100 bg-white" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-bg-accent flex items-center justify-center text-xs font-bold text-text-secondary flex-shrink-0">
                    {charity.name.slice(0, 2).toUpperCase()}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-1">
                    <p className="text-sm font-semibold text-text-primary leading-snug">{charity.name}</p>
                    <Link to={`/charities/${charity.slug}`} className="text-xs font-semibold text-brand-secondary hover:underline flex-shrink-0">View →</Link>
                  </div>
                  <p className="text-xs text-text-secondary mt-0.5 line-clamp-2">{location.description ?? charity.description}</p>
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {charity.causeTags.map((tag) => (
                      <span key={tag} className="text-xs px-1.5 py-0.5 bg-bg-accent text-text-secondary rounded">
                        {tagLabels.get(tag) ?? tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function CharitiesLocationFirstPOC() {
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [selectedPlaceKey, setSelectedPlaceKey] = useState<string | null>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);

  const { loading, data } = useQuery(GET_CHARITIES, { variables: { tags: selectedTag ? [selectedTag] : undefined } });
  const { data: causesData } = useQuery(GET_CAUSES);
  const tagLabels = causesToTagLabels(causesData?.causes ?? []);
  const charities: Charity[] = data?.charities ?? [];

  const places = useMemo(() => buildPlaces(charities), [charities]);

  const availableTags = Array.from(new Set(charities.flatMap((c) => c.causeTags)));
  const featuredTags = FEATURED_TAGS.filter((t) => availableTags.includes(t));

  function selectPlace(key: string) {
    setSelectedPlaceKey(key === selectedPlaceKey ? null : key);
    // Scroll sidebar to the card
    setTimeout(() => {
      const el = document.getElementById(`place-${key}`);
      el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);
  }

  return (
    <div className="flex" style={{ height: 'calc(100vh - 65px)' }}>
      {/* POC label */}
      <div className="absolute top-16 left-1/2 -translate-x-1/2 z-50 bg-violet-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow">
        POC 2 — Location-First
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar — location cards */}
        <div className="flex-shrink-0 flex flex-col border-r border-brand-tertiary bg-bg-primary lg:flex lg:w-96 w-full" ref={sidebarRef}>
          <div className="px-4 py-3 border-b border-brand-tertiary flex-shrink-0">
            <p className="text-xs font-semibold text-text-secondary uppercase tracking-wide">
              {places.length} places nearby
            </p>
          </div>
          <div className="overflow-y-auto flex-1">
            {loading && <div className="p-4 text-sm text-text-secondary animate-pulse">Loading…</div>}
            {places.map((place) => (
              <PlaceCard
                key={place.key}
                place={place}
                isSelected={place.key === selectedPlaceKey}
                tagLabels={tagLabels}
                onSelect={() => selectPlace(place.key)}
              />
            ))}
          </div>
        </div>

        {/* Map */}
        <div className="relative lg:block lg:flex-1 flex-1">
          {/* Tag filters */}
          <div className="absolute top-0 left-0 right-0 z-10 p-3 pointer-events-none">
            <div className="pointer-events-auto flex gap-2 overflow-x-auto pb-1">
              <button
                onClick={() => setSelectedTag(null)}
                className={`flex-shrink-0 text-xs px-3 py-1.5 rounded-full shadow font-medium transition-colors ${!selectedTag ? 'bg-gray-900 text-white' : 'bg-white/90 backdrop-blur-sm text-gray-700 border border-gray-200 hover:bg-white'}`}
              >
                All
              </button>
              {featuredTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => setSelectedTag(tag === selectedTag ? null : tag)}
                  className="flex-shrink-0 text-xs px-3 py-1.5 rounded-full shadow font-medium transition-all flex items-center gap-1"
                  style={tag === selectedTag
                    ? { backgroundColor: causeColor([tag]), color: 'white', border: `2px solid ${causeColor([tag])}` }
                    : { backgroundColor: 'rgba(255,255,255,0.9)', color: '#374151', border: '1px solid #e5e7eb' }}
                >
                  <span style={{ fontSize: 11 }}>{causeIcon([tag])}</span>
                  {tagLabels.get(tag) ?? tag}
                </button>
              ))}
            </div>
          </div>

          <Map
            mapboxAccessToken={import.meta.env.VITE_MAPBOX_TOKEN}
            initialViewState={{ longitude: -104.98832, latitude: 39.73669, zoom: 11.5 }}
            style={{ width: '100%', height: '100%' }}
            mapStyle="mapbox://styles/mapbox/light-v11"
          >
            {places.map((place) => {
              const isSelected = place.key === selectedPlaceKey;
              const primaryEntry = place.entries[0];
              const color = causeColor(primaryEntry.charity.causeTags);
              const icon = causeIcon(primaryEntry.charity.causeTags);
              const isShared = place.entries.length > 1;
              return (
                <Marker
                  key={place.key}
                  latitude={place.lat}
                  longitude={place.lng}
                  anchor="center"
                  onClick={(e) => {
                    e.originalEvent.stopPropagation();
                    selectPlace(place.key);
                  }}
                >
                  <div style={{
                    transform: isSelected ? 'scale(1.45)' : 'scale(1)',
                    transition: 'transform 0.15s',
                    position: 'relative',
                  }}>
                    <CauseDot color={color} icon={icon} />
                  </div>
                </Marker>
              );
            })}
          </Map>
        </div>
      </div>
    </div>
  );
}
