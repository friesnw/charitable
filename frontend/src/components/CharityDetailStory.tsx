import { Link } from 'react-router-dom';
import { cloudinaryUrl } from '../lib/cloudinary';
import { causeColor } from '../lib/causeColors';
import { nearestNeighborhood } from '../lib/neighborhoods';
import { DonateButton } from './ui/DonateButton';
import { Icon, ICON_NAMES } from './ui/Icon';

interface StoryLocation {
  id: string;
  label: string;
  description: string | null;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  photoUrl: string | null;
}

export interface StoryCharity {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  logoUrl: string | null;
  coverPhotoUrl: string | null;
  contentPhotoUrl1: string | null;
  contentPhotoUrl2: string | null;
  websiteUrl: string | null;
  volunteerUrl: string | null;
  primaryAddress: string | null;
  ein: string;
  foundedYear: number | null;
  donateUrl: string | null;
  causeTags: string[];
  impact: string | null;
  programHighlights: string | null;
  usageCredit: string | null;
  locationDescription: string | null;
  locations: StoryLocation[];
}

interface CharityDetailStoryProps {
  charity: StoryCharity;
  tagLabels: Map<string, string>;
}


function bareDomain(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}

function parseHighlights(raw: string): { icon: string | null; title: string | null; text: string }[] {
  return raw
    .split('\n')
    .map((line) => {
      let rest = line;
      let icon: string | null = null;
      const prefixed = rest.match(/^\((\w+)\)(.+)$/);
      if (prefixed) { icon = prefixed[1]; rest = prefixed[2].trim(); }
      else rest = rest.replace(/^-\s*/, '').trim();
      const bolded = rest.match(/^\*\*(.+?)\*\*\s*(.*)$/);
      if (bolded) return { icon, title: bolded[1], text: bolded[2].trim() };
      return { icon, title: null, text: rest };
    })
    .filter((h) => h.title || h.text.length > 0);
}

export function CharityDetailStory({ charity, tagLabels }: CharityDetailStoryProps) {
  const heroLocation = charity.locations.find((l) => l.photoUrl) ?? charity.locations[0] ?? null;
  const featuredPhoto = charity.coverPhotoUrl ?? heroLocation?.photoUrl ?? null;
  const contentPhoto1 = charity.contentPhotoUrl1 ?? null;
  const contentPhoto2 = charity.contentPhotoUrl2 ?? null;
  const color = causeColor(charity.causeTags);
  const highlights = charity.programHighlights ? parseHighlights(charity.programHighlights) : [];

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'NGO',
    name: charity.name,
    ...(charity.description && { description: charity.description }),
    ...(charity.websiteUrl && { url: charity.websiteUrl }),
    ...(charity.logoUrl && { logo: charity.logoUrl }),
    ...(charity.foundedYear && { foundingDate: String(charity.foundedYear) }),
    ...(charity.ein && { taxID: charity.ein }),
    ...(charity.primaryAddress && {
      address: { '@type': 'PostalAddress', streetAddress: charity.primaryAddress },
    }),
    ...(charity.locations.length > 0 && {
      location: charity.locations.map((loc) => ({
        '@type': 'Place',
        name: loc.label,
        ...(loc.address && { address: { '@type': 'PostalAddress', streetAddress: loc.address } }),
        ...(loc.latitude != null && loc.longitude != null && {
          geo: { '@type': 'GeoCoordinates', latitude: loc.latitude, longitude: loc.longitude },
        }),
      })),
    }),
  };

  return (
    <div className="-mx-4 -mt-4 -mb-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* Back link */}
      <div className="px-4 pt-4 pb-2">
        <Link to="/charities" className="text-sm text-gray-500 hover:text-gray-700">
          &larr; Back to charities
        </Link>
      </div>

      {/* Photo header — single full-width cover photo */}
      <div className="px-4 pt-2">
        {featuredPhoto ? (
          <div className="rounded-xl overflow-hidden" style={{ height: 260 }}>
            <img
              src={cloudinaryUrl(featuredPhoto, { w: 1800, h: 780, fit: 'fill' })}
              alt=""
              fetchPriority="high"
              className="w-full h-full object-cover"
            />
          </div>
        ) : charity.logoUrl ? (
          <div
            className="rounded-xl flex items-center justify-center"
            style={{ height: 180, backgroundColor: `${color}22` }}
          >
            <img
              src={cloudinaryUrl(charity.logoUrl, { w: 160, h: 160, fit: 'fit' })}
              alt={charity.name}
              className="w-32 h-32 object-contain rounded-full shadow"
            />
          </div>
        ) : null}

        {/* Title block */}
        <div className="mt-4 mb-2">
          <h1 className="text-2xl font-bold text-gray-900 leading-tight">{charity.name}</h1>
          <div className="flex items-center gap-4 mt-1 text-sm" style={{ color: 'var(--flair-sage)' }}>
            <span className="flex items-center gap-1.5 font-medium" style={{ color: 'var(--color-success)' }}>
              <Icon name="check-circle-solid" className="w-4 h-4 shrink-0" />
              Verified Non-Profit
            </span>
            {charity.ein && (
              <span className="flex items-center gap-1.5">
                <Icon name="fingerprint" className="w-4 h-4 shrink-0" />
                EIN: {charity.ein}
              </span>
            )}
            {charity.foundedYear && (
              <span className="flex items-center gap-1.5">
                <Icon name="flag" className="w-4 h-4 shrink-0" />
                Est. {charity.foundedYear}
              </span>
            )}
          </div>
          {charity.causeTags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {charity.causeTags.map((tag) => (
                <span
                  key={tag}
                  className="text-xs font-semibold uppercase tracking-wide px-3 py-1 rounded-full border"
                  style={{ color: 'var(--brand-secondary)', borderColor: 'var(--brand-secondary)', backgroundColor: 'rgba(237, 66, 19, 0.08)' }}
                >
                  {tagLabels.get(tag) ?? tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="px-4 py-6 pb-24 space-y-14">

        {/* Two-column: [About + Highlights] | [Impact + Photos] */}
        {(charity.description || highlights.length > 0 || charity.impact || contentPhoto1 || contentPhoto2) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-20 items-start">

            {/* Column 1: About + Program Highlights */}
            <div className="space-y-8">
              {charity.description && (
                <section>
                  <h2 className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: 'var(--flair-sage)' }}>
                    About this organization
                  </h2>
                  {charity.description.split('\n').filter(Boolean).map((para, i) => (
                    <p key={i} className="text-gray-800 leading-relaxed text-base mt-3 first:mt-0">{para}</p>
                  ))}
                </section>
              )}
              {highlights.length > 0 && (
                <section>
                  <h2 className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: 'var(--flair-sage)' }}>
                    Program Highlights
                  </h2>
                  <div className="space-y-5">
                    {highlights.map((h, i) => {
                      const iconName = h.icon && (ICON_NAMES as readonly string[]).includes(h.icon) ? h.icon as typeof ICON_NAMES[number] : 'star';
                      return (
                        <div key={i} className="flex items-start gap-3">
                          <div
                            className="w-12 h-12 rounded-full flex items-center justify-center shrink-0"
                            style={{ backgroundColor: '#607F7533', color: 'var(--flair-green)' }}
                          >
                            <Icon name={iconName} className="w-6 h-6" />
                          </div>
                          <div className="pt-1.5">
                            {h.title && <p className="text-base font-semibold text-gray-900 leading-snug">{h.title}</p>}
                            {h.text && <p className="text-base text-gray-700 leading-relaxed">{h.text}</p>}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>
              )}
            </div>

            {/* Column 2: Impact + staggered photos */}
            <div className="space-y-8">
              {charity.impact && (() => {
                const lines = charity.impact!.split('\n').map(l => l.replace(/^-\s*/, '').trim()).filter(Boolean);
                const statRegex = /^(\$?[\d,]+[%+kKmMbB]?)\s+(.+)$/;
                return (
                  <section>
                    <h2 className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: 'var(--flair-sage)' }}>
                      2025 Impact
                    </h2>
                    <div className="grid grid-cols-1 gap-3">
                      {lines.map((line, i) => {
                        const match = line.match(statRegex);
                        if (match) {
                          return (
                            <div key={i} className="rounded-xl border border-gray-200 bg-white p-4">
                              <p className="text-3xl font-bold" style={{ color: 'var(--brand-secondary)' }}>
                                {match[1]}
                              </p>
                              <p className="text-sm font-semibold text-gray-800 mt-1">{match[2]}</p>
                            </div>
                          );
                        }
                        return <p key={i} className="text-gray-800 leading-relaxed text-base">{line}</p>;
                      })}
                    </div>
                  </section>
                );
              })()}
              {(contentPhoto1 || contentPhoto2) && (
                <div className="flex gap-3 items-start">
                  {contentPhoto1 && (
                    <div className="flex-1 rounded-xl overflow-hidden" style={{ height: 200 }}>
                      <img
                        src={cloudinaryUrl(contentPhoto1, { w: 400, h: 400, fit: 'fill' })}
                        alt=""
                        loading="lazy"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  {contentPhoto2 && (
                    <div className="flex-1 rounded-xl overflow-hidden mt-6" style={{ height: 200 }}>
                      <img
                        src={cloudinaryUrl(contentPhoto2, { w: 400, h: 400, fit: 'fill' })}
                        alt=""
                        loading="lazy"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                </div>
              )}
            </div>

          </div>
        )}

        {/* Location cards */}
        {charity.locations.length > 0 && (
          <section>
            <h2 className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: 'var(--flair-sage)' }}>
              Locations
            </h2>
            {charity.locationDescription && (
              <p className="text-gray-700 text-base leading-relaxed mb-4 w-1/2">{charity.locationDescription}</p>
            )}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {charity.locations.map((loc) => {
                const locNeighborhood = loc.latitude != null && loc.longitude != null
                  ? nearestNeighborhood(loc.latitude, loc.longitude)
                  : null;
                return (
                  <div key={loc.id} className="rounded-lg overflow-hidden border border-gray-200 bg-white">
                    {loc.photoUrl ? (
                      <img
                        src={cloudinaryUrl(loc.photoUrl, { w: 800, h: 400, fit: 'fill' })}
                        alt={`${loc.label} — ${charity.name}`}
                        loading="lazy"
                        className="w-full object-cover" style={{ height: 200 }}
                      />
                    ) : (
                      <div className="w-full" style={{ height: 200, backgroundColor: color }} />
                    )}
                    <div className="p-3">
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-medium text-gray-900 text-sm">{loc.label}</p>
                        {locNeighborhood && (
                          <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full shrink-0">
                            {locNeighborhood}
                          </span>
                        )}
                      </div>
                      {loc.address && <p className="text-xs text-gray-500 mt-0.5">{loc.address}</p>}
                      {loc.description && <p className="text-xs text-gray-600 mt-1">{loc.description}</p>}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Usage credit */}
        {charity.usageCredit && (
          <div className="space-y-1">
            {charity.usageCredit.split('\n').filter(Boolean).map((line, i) => (
              <p key={i} className="text-xs uppercase tracking-widest text-gray-400 leading-relaxed">{line}</p>
            ))}
          </div>
        )}
      </div>

      {/* Sticky action buttons */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 py-3 z-10">
        <div className="flex gap-3 px-4 mx-auto w-full max-w-4xl">
          {charity.donateUrl && (
            <DonateButton
              donateUrl={charity.donateUrl}
              charityName={charity.name}
              color={color}
              className="flex-1"
            />
          )}
          {charity.volunteerUrl && (
            <a
              href={charity.volunteerUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <Icon name="volunteer" className="w-4 h-4 shrink-0" />
              Volunteer
            </a>
          )}
          {charity.websiteUrl && (
            <a
              href={charity.websiteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <Icon name="globe" className="w-4 h-4 shrink-0" />
              {bareDomain(charity.websiteUrl)}
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
