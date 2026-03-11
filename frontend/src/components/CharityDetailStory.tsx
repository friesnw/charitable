import { Link } from 'react-router-dom';
import { cloudinaryUrl } from '../lib/cloudinary';
import { causeColor } from '../lib/causeColors';
import { nearestNeighborhood } from '../lib/neighborhoods';
import { DonateButton } from './ui/DonateButton';

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
  locations: StoryLocation[];
}

interface CharityDetailStoryProps {
  charity: StoryCharity;
  tagLabels: Map<string, string>;
}

export function CharityDetailStory({ charity, tagLabels }: CharityDetailStoryProps) {
  const heroLocation = charity.locations.find((l) => l.photoUrl) ?? charity.locations[0] ?? null;
  const featuredPhoto = charity.coverPhotoUrl ?? heroLocation?.photoUrl ?? null;
  const contentPhoto1 = charity.contentPhotoUrl1 ?? null;
  const contentPhoto2 = charity.contentPhotoUrl2 ?? null;
  const hasPhotoGrid = featuredPhoto && (contentPhoto1 || contentPhoto2);
  const color = causeColor(charity.causeTags);

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
    <div className="-mx-4 -mt-4">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      {/* Back link */}
      <div className="px-4 pt-4 pb-2">
        <Link to="/charities" className="text-sm text-gray-500 hover:text-gray-700">
          &larr; Back to charities
        </Link>
      </div>

      {/* Photo header */}
      <div className="px-4 pt-2">
        {hasPhotoGrid ? (
          <div className="flex gap-2" style={{ height: 340 }}>
            {/* Featured photo — left, large */}
            <div className="flex-1 rounded-xl overflow-hidden">
              <img
                src={cloudinaryUrl(featuredPhoto!, { w: 900, h: 680, fit: 'fill' })}
                alt=""
                fetchPriority="high"
                className="w-full h-full object-cover"
              />
            </div>
            {/* Content photos — right column, stacked */}
            <div className="flex flex-col gap-2" style={{ width: 220 }}>
              {contentPhoto1 && (
                <div className="flex-1 rounded-xl overflow-hidden">
                  <img
                    src={cloudinaryUrl(contentPhoto1, { w: 440, h: 340, fit: 'fill' })}
                    alt=""
                    loading="lazy"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              {contentPhoto2 && (
                <div className="flex-1 rounded-xl overflow-hidden">
                  <img
                    src={cloudinaryUrl(contentPhoto2, { w: 440, h: 340, fit: 'fill' })}
                    alt=""
                    loading="lazy"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
            </div>
          </div>
        ) : featuredPhoto ? (
          <div className="rounded-xl overflow-hidden" style={{ height: 300 }}>
            <img
              src={cloudinaryUrl(featuredPhoto, { w: 1200, h: 600, fit: 'fill' })}
              alt=""
              fetchPriority="high"
              className="w-full h-full object-cover"
            />
          </div>
        ) : charity.logoUrl ? (
          <div className="rounded-xl flex items-center justify-center" style={{ height: 180, backgroundColor: `${color}22` }}>
            <img
              src={cloudinaryUrl(charity.logoUrl, { w: 160, h: 160, fit: 'fit' })}
              alt={charity.name}
              className="w-32 h-32 object-contain rounded-full shadow"
            />
          </div>
        ) : null}

        {/* Title + tags below photos */}
        <div className="mt-4 mb-2">
          <h1 className="text-2xl font-bold text-gray-900 leading-tight">{charity.name}</h1>
          {charity.causeTags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {charity.causeTags.map((tag) => (
                <span
                  key={tag}
                  className="text-sm px-3 py-1 rounded-full border border-gray-200 text-gray-600 bg-white"
                >
                  {tagLabels.get(tag) ?? tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="px-4 py-6 space-y-8">
        {(charity.description || charity.impact) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {charity.description && (
              <section>
                <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">
                  About this organization
                </h2>
                {charity.description.split('\n').filter(Boolean).map((para, i) => (
                  <p key={i} className="text-gray-800 leading-relaxed text-base mt-3 first:mt-0">{para}</p>
                ))}
              </section>
            )}
            {charity.impact && (
              <section>
                <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">
                  Impact
                </h2>
                {charity.impact.split('\n').filter(Boolean).map((para, i) => (
                  <p key={i} className="text-gray-800 leading-relaxed text-base mt-3 first:mt-0">{para}</p>
                ))}
              </section>
            )}
          </div>
        )}

        {charity.foundedYear && (
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span className="font-medium text-gray-700">Est. {charity.foundedYear}</span>
            <span>·</span>
            <span className="flex items-center gap-1.5">
              <span className="flex items-center justify-center w-4 h-4 rounded-full shrink-0" style={{ backgroundColor: 'var(--flair-green)' }}>
                <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                </svg>
              </span>
              EIN {charity.ein}
            </span>
          </div>
        )}

        {charity.locations.length > 0 && (
          <section>
            <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">
              Their locations
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              {charity.locations.map((loc) => {
                const locNeighborhood = loc.latitude != null && loc.longitude != null
                  ? nearestNeighborhood(loc.latitude, loc.longitude)
                  : null;
                return (
                <div key={loc.id} className="rounded-lg overflow-hidden border border-gray-200">
                  {loc.photoUrl ? (
                    <img
                      src={cloudinaryUrl(loc.photoUrl, { w: 800, h: 160, fit: 'fill' })}
                      alt={`${loc.label} — ${charity.name}`}
                      loading="lazy"
                      className="w-full h-36 object-cover"
                    />
                  ) : (
                    <div
                      className="w-full h-36 relative"
                      style={{ backgroundColor: color }}
                    >
                      <div
                        className="absolute inset-0"
                        style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.4) 0%, transparent 60%)' }}
                      />
                    </div>
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
                    {loc.address && (
                      <p className="text-xs text-gray-500 mt-0.5">{loc.address}</p>
                    )}
                    {loc.description && (
                      <p className="text-xs text-gray-600 mt-1">{loc.description}</p>
                    )}
                  </div>
                </div>
                );
              })}
            </div>
          </section>
        )}
      </div>

      {/* Sticky action buttons */}
      <div className="sticky bottom-0 bg-white border-t border-gray-200 px-4 py-3 flex gap-3">
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
            className="flex-1 text-center py-3 rounded-xl border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Volunteer
          </a>
        )}
        {charity.websiteUrl && (
          <a
            href={charity.websiteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 text-center py-3 rounded-xl border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Website
          </a>
        )}
      </div>
    </div>
  );
}
