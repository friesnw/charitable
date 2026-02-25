import { Link } from 'react-router-dom';
import { cloudinaryUrl } from '../lib/cloudinary';
import { distanceLabel } from '../lib/geo';
import { causeColor } from '../lib/causeColors';
import { detectNeighborhood } from '../lib/neighborhoods';

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
  websiteUrl: string | null;
  volunteerUrl: string | null;
  primaryAddress: string | null;
  ein: string;
  foundedYear: number | null;
  everyOrgSlug: string | null;
  causeTags: string[];
  locations: StoryLocation[];
}

interface CharityDetailStoryProps {
  charity: StoryCharity;
  tagLabels: Map<string, string>;
  userDistance: number | null;
}

export function CharityDetailStory({ charity, tagLabels, userDistance }: CharityDetailStoryProps) {
  const heroLocation = charity.locations.find((l) => l.photoUrl) ?? charity.locations[0] ?? null;
  const heroPhoto = heroLocation?.photoUrl ?? null;
  const color = causeColor(charity.causeTags);

  // Detect neighborhood from primary address or first location address
  const neighborhood = detectNeighborhood(charity.primaryAddress)
    ?? detectNeighborhood(heroLocation?.address ?? null);

  return (
    <div className="-mx-4 -mt-4">
      {/* Back link */}
      <div className="px-4 pt-4 pb-2">
        <Link to="/charities" className="text-sm text-gray-500 hover:text-gray-700">
          &larr; Back to charities
        </Link>
      </div>

      {/* Hero */}
      <div className="relative w-full overflow-hidden" style={{ height: '45vh', minHeight: 240, maxHeight: 420 }}>
        {heroPhoto ? (
          <img
            src={cloudinaryUrl(heroPhoto, { w: 1200, h: 500, fit: 'fill' })}
            alt={charity.name}
            className="w-full h-full object-cover"
          />
        ) : charity.logoUrl ? (
          <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: `${color}22` }}>
            <img
              src={cloudinaryUrl(charity.logoUrl, { w: 160, h: 160, fit: 'fill' })}
              alt={charity.name}
              className="w-28 h-28 object-contain rounded-xl shadow-lg"
            />
          </div>
        ) : (
          <div className="w-full h-full" style={{ backgroundColor: color }} />
        )}

        {/* Gradient overlay */}
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.1) 60%, transparent 100%)',
          }}
        />

        {/* Overlaid text */}
        <div className="absolute bottom-0 left-0 right-0 px-4 pb-4">
          <div className="flex flex-wrap gap-2 mb-2">
            {neighborhood && (
              <span className="text-xs font-semibold text-white bg-white/20 backdrop-blur-sm px-2.5 py-1 rounded-full">
                Serving {neighborhood}
              </span>
            )}
            {userDistance !== null && (
              <span className="text-xs font-semibold text-white bg-white/20 backdrop-blur-sm px-2.5 py-1 rounded-full">
                {distanceLabel(userDistance)}
              </span>
            )}
          </div>
          <h1 className="text-2xl font-bold text-white leading-tight">{charity.name}</h1>
          {charity.causeTags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {charity.causeTags.map((tag) => (
                <span
                  key={tag}
                  className="text-xs px-2 py-0.5 rounded-full text-white/90 bg-white/20"
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
        {charity.description && (
          <section>
            <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">
              About this organization
            </h2>
            <p className="text-gray-800 leading-relaxed text-base">{charity.description}</p>
          </section>
        )}

        {charity.foundedYear && (
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span className="font-medium text-gray-700">Est. {charity.foundedYear}</span>
            <span>·</span>
            <span>EIN {charity.ein}</span>
          </div>
        )}

        {charity.locations.length > 0 && (
          <section>
            <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">
              Their locations
            </h2>
            <div className="space-y-3">
              {charity.locations.map((loc) => (
                <div key={loc.id} className="rounded-lg overflow-hidden border border-gray-200">
                  {loc.photoUrl && (
                    <img
                      src={cloudinaryUrl(loc.photoUrl, { w: 800, h: 160, fit: 'fill' })}
                      alt={loc.label}
                      className="w-full h-36 object-cover"
                    />
                  )}
                  <div className="p-3">
                    <p className="font-medium text-gray-900 text-sm">{loc.label}</p>
                    {loc.address && (
                      <p className="text-xs text-gray-500 mt-0.5">{loc.address}</p>
                    )}
                    {loc.description && (
                      <p className="text-xs text-gray-600 mt-1">{loc.description}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Sticky action buttons */}
      <div className="sticky bottom-0 bg-white border-t border-gray-200 px-4 py-3 flex gap-3">
        {charity.everyOrgSlug && (
          <a
            href={`https://www.every.org/${charity.everyOrgSlug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 text-center py-3 rounded-xl text-sm font-semibold text-white"
            style={{ backgroundColor: color }}
          >
            Donate
          </a>
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
