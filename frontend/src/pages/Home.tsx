import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Map, { MapRef } from 'react-map-gl/mapbox';
import { ButtonLink, Button } from '../components/ui/Button';
import { useQuery, gql } from '@apollo/client';
import { useAuth } from '../hooks/useAuth';
import { NEIGHBORHOODS } from '../lib/neighborhoods';
import { causeIcon, causeColor } from '../lib/causeColors';

const GET_CHARITY_COUNT = gql`
  query GetCharityCountForTag($tags: [String]) {
    charities(tags: $tags) {
      id
    }
  }
`;

const HERO_NEIGHBORHOODS = [
  'Cap Hill',
  'RiNo',
  'Highland',
  'LoDo',
  'Five Points',
  'City Park',
  'Baker',
  'Wash Park',
  'Cherry Creek',
  'Edgewater',
];

const SURVEY_TAGS = [
  { slug: 'housing', label: 'Housing' },
  { slug: 'hunger', label: 'Hunger' },
  { slug: 'animals', label: 'Animals' },
  { slug: 'mental-health', label: 'Mental Health' },
  { slug: 'youth', label: 'Youth' },
  { slug: 'education', label: 'Education' },
  { slug: 'environment', label: 'Environment' },
  { slug: 'families', label: 'Families' },
];

const VALUE_PROP_CAUSES = [
  'housing',
  'hunger',
  'animals',
  'mental-health',
  'youth',
  'education',
];

const neighborhoodPills = HERO_NEIGHBORHOODS.map((name) => {
  const n = NEIGHBORHOODS.find((nb) => nb.name === name);
  return n ? { name, lat: n.lat, lng: n.lng } : null;
}).filter(Boolean) as { name: string; lat: number; lng: number }[];

const PAN_STOPS = [
  { longitude: -104.9903, latitude: 39.7392 }, // Downtown
  { longitude: -104.9719, latitude: 39.7508 }, // RiNo
  { longitude: -104.9842, latitude: 39.7554 }, // Highland
  { longitude: -104.9628, latitude: 39.7318 }, // Capitol Hill
  { longitude: -104.9738, latitude: 39.7483 }, // Five Points
  { longitude: -104.9509, latitude: 39.7207 }, // Cherry Creek
];

export function Home() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [selectedNeighborhood, setSelectedNeighborhood] = useState<{ name: string; lat: number; lng: number } | null>(null);
  const [selectedSurveyTag, setSelectedSurveyTag] = useState<string | null>(null);
  const [mapReady, setMapReady] = useState(false);
  const mapRef = useRef<MapRef>(null);
  const stopIndexRef = useRef(0);

  const panToNext = useCallback(() => {
    const map = mapRef.current;
    if (!map) return;
    stopIndexRef.current = (stopIndexRef.current + 1) % PAN_STOPS.length;
    const { longitude, latitude } = PAN_STOPS[stopIndexRef.current];
    map.easeTo({ center: [longitude, latitude], duration: 18000, easing: (t) => t });
  }, []);

  useEffect(() => {
    const interval = setInterval(panToNext, 20000);
    return () => clearInterval(interval);
  }, [panToNext]);

  const selectedSurveyLabel = SURVEY_TAGS.find((t) => t.slug === selectedSurveyTag)?.label;

  const { data: countData } = useQuery(GET_CHARITY_COUNT, {
    variables: { tags: selectedSurveyTag ? [selectedSurveyTag] : undefined },
    skip: !selectedSurveyTag,
  });
  const charityCount: number | null = countData?.charities?.length ?? null;

  return (
    <div>
      {/* Section 1 — Hero */}
      <section
        className="relative bg-brand-primary"
        style={{ height: 'calc(100vh - 65px)' }}
      >
        {/* Map background */}
        <div className="absolute inset-0 pointer-events-none">
          <Map
            ref={mapRef}
            mapboxAccessToken={import.meta.env.VITE_MAPBOX_TOKEN}
            initialViewState={{ longitude: -104.9903, latitude: 39.7392, zoom: 12 }}
            mapStyle="mapbox://styles/mapbox/dark-v11"
            interactive={false}
            attributionControl={false}
            style={{ width: '100%', height: '100%' }}
            onLoad={(e) => {
              e.target.getStyle().layers.forEach((layer) => {
                if (layer.type === 'symbol') {
                  e.target.setLayoutProperty(layer.id, 'visibility', 'none');
                }
              });
              setMapReady(true);
              panToNext();
            }}
          />
          {/* Solid cover fades out after labels are suppressed, preventing flicker */}
          <div
            className="absolute inset-0 transition-opacity duration-700"
            style={{ backgroundColor: '#343D47', opacity: mapReady ? 0 : 1, pointerEvents: 'none' }}
          />
          {/* Radial vignette — dark at edges, map visible in center */}
          <div
            className="absolute inset-0"
            style={{
              background: 'radial-gradient(ellipse 60% 55% at 50% 50%, rgba(52,61,71,0.35) 0%, rgba(52,61,71,0.70) 55%, rgba(52,61,71,0.97) 100%)',
            }}
          />
          {/* Bottom fade to #2B323B */}
          <div
            className="absolute inset-x-0 bottom-0"
            style={{ height: '28%', background: 'linear-gradient(to bottom, transparent, #22282F)' }}
          />
        </div>

        <div className="relative flex flex-col items-center justify-center h-full px-6 text-center">
          <h1 className="font-heading font-bold text-4xl md:text-5xl text-white leading-tight max-w-6xl">
            There's a good cause just around the corner
          </h1>
          <p className="font-sans text-xl text-white/80 mt-4 max-w-xl">
            Discover and support high-impact Denver charities.
          </p>
          <div className="flex items-center justify-center gap-4 mt-8 flex-wrap">
            <ButtonLink to="/charities" variant="primary">
              Get started
            </ButtonLink>
          </div>
        </div>

        {/* Neighborhood strip — pinned to bottom */}
        <div className="absolute bottom-0 left-0 right-0 px-4 pb-5">
          <p className="text-sm text-white/50 text-center mb-2 font-subheading font-medium">
            Explore by neighborhood
          </p>
          <div className="flex gap-2 overflow-x-auto pb-1 justify-start md:justify-center">
            {neighborhoodPills.map(({ name, lat, lng }) => {
              const isSelected = selectedNeighborhood?.name === name;
              return (
                <button
                  key={name}
                  onClick={() => setSelectedNeighborhood(isSelected ? null : { name, lat, lng })}
                  className={`flex-shrink-0 text-sm px-3 py-1.5 rounded-full border transition-colors ${
                    isSelected
                      ? 'border-brand-accent bg-brand-accent/20 text-brand-accent'
                      : 'border-white/20 bg-white/10 text-white/70 hover:border-brand-accent hover:text-brand-accent'
                  }`}
                >
                  {name}
                </button>
              );
            })}
          </div>
          <div className="flex justify-center mt-3">
            <Button
              variant="primary"
              disabled={!selectedNeighborhood}
              onClick={() => {
                if (selectedNeighborhood) {
                  navigate(`/charities?lat=${selectedNeighborhood.lat}&lng=${selectedNeighborhood.lng}`);
                }
              }}
            >
              {selectedNeighborhood ? `Explore ${selectedNeighborhood.name}` : 'Select a neighborhood'}
            </Button>
          </div>
        </div>
      </section>

      {/* Section 2 — Value prop */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center gap-12 md:gap-20">
          {/* Left: text */}
          <div className="flex-1">
            <h2 className="font-heading font-bold text-2xl md:text-3xl text-text-primary leading-snug">
             A connection to non-profits in our community, so we can give better.
            </h2>
            <ol className="mt-8 flex flex-col gap-4">
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-7 h-7 rounded-full bg-brand-secondary text-white text-sm font-bold flex items-center justify-center">
                  1
                </span>
                <span className="font-sans text-text-primary pt-0.5">Find trusted local charities in your neighborhood</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-7 h-7 rounded-full bg-brand-secondary text-white text-sm font-bold flex items-center justify-center">
                  2
                </span>
                <span className="font-sans text-text-primary pt-0.5">
                  Track your giving to see your impact
                </span>
              </li>
            </ol>
            <div className="mt-10">
              <ButtonLink to="/charities" variant="primary">
                Get started
              </ButtonLink>
            </div>
          </div>

          {/* Right: cause category visual */}
          <div className="flex-1 grid grid-cols-2 gap-3 w-full">
            {VALUE_PROP_CAUSES.map((slug) => {
              const color = causeColor([slug]);
              const icon = causeIcon([slug]);
              const label = SURVEY_TAGS.find((t) => t.slug === slug)?.label ?? slug;
              return (
                <div
                  key={slug}
                  className="flex items-center gap-3 px-4 py-4 rounded-2xl"
                  style={{ backgroundColor: `${color}18` }}
                >
                  <span
                    className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                    style={{ backgroundColor: `${color}30` }}
                  >
                    {icon}
                  </span>
                  <span className="font-sans text-sm font-medium text-text-primary">{label}</span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Section 3 — Survey */}
      <section className="py-20 text-center px-6 bg-bg-accent">
        <h2 className="font-heading font-bold text-2xl md:text-3xl text-text-primary max-w-xl mx-auto leading-snug">
          Where could Denver use the most support?
        </h2>
        <div className="mt-8 flex flex-wrap gap-3 justify-center max-w-lg mx-auto">
          {SURVEY_TAGS.map(({ slug, label }) => {
            const isSelected = slug === selectedSurveyTag;
            return (
              <button
                key={slug}
                onClick={() => setSelectedSurveyTag(isSelected ? null : slug)}
                className={`px-5 py-2.5 rounded-full font-sans text-sm font-medium border transition-colors ${
                  isSelected
                    ? 'bg-brand-secondary text-white border-brand-secondary'
                    : 'bg-bg-primary text-text-secondary border-brand-tertiary hover:border-brand-secondary hover:text-text-primary'
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
        <div
          className={`mt-8 transition-opacity duration-300 ${
            selectedSurveyTag ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        >
          <ButtonLink to={`/charities?tag=${selectedSurveyTag ?? ''}`} variant="link">
            {charityCount !== null
              ? `Find ${charityCount} charities helping with ${selectedSurveyLabel} →`
              : `Find charities helping with ${selectedSurveyLabel} →`}
          </ButtonLink>
        </div>
      </section>
    </div>
  );
}
