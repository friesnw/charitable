import { useState } from 'react';
import { Link } from 'react-router-dom';
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
  'RiNo',
  'Highland',
  'Capitol Hill',
  'LoDo',
  'Five Points',
  'City Park',
  'Cherry Creek',
  'Wash Park',
  'Baker',
  'Sunnyside',
];

const SURVEY_TAGS = [
  { slug: 'homelessness', label: 'Homelessness' },
  { slug: 'food-security', label: 'Food Security' },
  { slug: 'animals', label: 'Animals' },
  { slug: 'mental-health', label: 'Mental Health' },
  { slug: 'youth', label: 'Youth' },
  { slug: 'housing', label: 'Housing' },
  { slug: 'education', label: 'Education' },
  { slug: 'community', label: 'Community' },
];

const VALUE_PROP_CAUSES = [
  'homelessness',
  'food-security',
  'animals',
  'mental-health',
  'youth',
  'education',
];

const neighborhoodPills = HERO_NEIGHBORHOODS.map((name) => {
  const n = NEIGHBORHOODS.find((nb) => nb.name === name);
  return n ? { name, lat: n.lat, lng: n.lng } : null;
}).filter(Boolean) as { name: string; lat: number; lng: number }[];

export function Home() {
  const { isAuthenticated } = useAuth();
  const [selectedSurveyTag, setSelectedSurveyTag] = useState<string | null>(null);

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
        <div className="flex flex-col items-center justify-center h-full px-6 text-center">
          <h1 className="font-sans font-bold text-4xl md:text-5xl text-white leading-tight max-w-3xl">
            Donate to local charities and track your impact across Denver.
          </h1>
          <div className="flex items-center justify-center gap-4 mt-8 flex-wrap">
            <Link
              to="/explore"
              className="inline-flex items-center justify-center px-6 py-3 font-sans text-base font-medium rounded-md bg-brand-secondary text-white hover:opacity-90 transition-opacity"
            >
              Get started
            </Link>
            {!isAuthenticated && (
              <Link
                to="/login"
                className="inline-flex items-center justify-center px-6 py-3 font-sans text-base font-medium rounded-md bg-white/10 text-white border border-white/20 hover:bg-white/20 transition-opacity"
              >
                I already have an account
              </Link>
            )}
          </div>
        </div>

        {/* Neighborhood strip — pinned to bottom */}
        <div className="absolute bottom-0 left-0 right-0 px-4 pb-5">
          <p className="text-xs text-white/50 text-center mb-2 font-medium uppercase tracking-wider">
            Explore by neighborhood
          </p>
          <div className="flex gap-2 overflow-x-auto pb-1 justify-start md:justify-center">
            {neighborhoodPills.map(({ name, lat, lng }) => (
              <Link
                key={name}
                to={`/explore?lat=${lat}&lng=${lng}`}
                className="flex-shrink-0 text-sm px-3 py-1.5 rounded-full border border-white/20 bg-white/10 text-white/70 hover:border-brand-accent hover:text-brand-accent transition-colors"
              >
                {name}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Section 2 — Value prop */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center gap-12 md:gap-20">
          {/* Left: text */}
          <div className="flex-1">
            <h2 className="font-sans font-bold text-2xl md:text-3xl text-text-primary leading-snug">
              There's a good cause just around the corner.
            </h2>
            <p className="font-sans text-lg text-text-secondary mt-4">
              GoodLocal connects you to non-profits that make an impact in your community, so you can give better.
            </p>
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
              <Link
                to="/explore"
                className="inline-flex items-center justify-center px-6 py-3 font-sans text-base font-medium rounded-md bg-brand-secondary text-white hover:opacity-90 transition-opacity"
              >
                Get started
              </Link>
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
        <h2 className="font-sans font-bold text-2xl md:text-3xl text-text-primary max-w-xl mx-auto leading-snug">
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
          <Link
            to={`/charities?tag=${selectedSurveyTag ?? ''}`}
            className="inline-flex items-center gap-1 font-sans text-base font-medium text-brand-secondary hover:underline"
          >
            {charityCount !== null
              ? `Find ${charityCount} charities helping with ${selectedSurveyLabel} →`
              : `Find charities helping with ${selectedSurveyLabel} →`}
          </Link>
        </div>
      </section>
    </div>
  );
}
