import { Link } from 'react-router-dom';
import { cloudinaryUrl } from '../lib/cloudinary';
import { distanceLabel } from '../lib/geo';
import { causeColor } from '../lib/causeColors';
import { charityNeighborhoods } from '../lib/neighborhoods';

export interface NearbyCharity {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  causeTags: string[];
  locations: {
    id: string;
    address?: string | null;
    photoUrl: string | null;
    latitude: number | null;
    longitude: number | null;
  }[];
}

interface NearbyCharityCardProps {
  charity: NearbyCharity;
  distance: number | null;
  tagLabels: Map<string, string>;
}

export function NearbyCharityCard({ charity, distance, tagLabels }: NearbyCharityCardProps) {
  const photoUrl = charity.locations.find((l) => l.photoUrl)?.photoUrl ?? null;
  const color = causeColor(charity.causeTags);
  const initials = charity.name.slice(0, 2).toUpperCase();

  // Neighborhood chips: up to 2, then "+N more"
  const neighborhoods = charityNeighborhoods(charity.locations);
  const displayNeighborhoods = neighborhoods.slice(0, 2);
  const extraCount = neighborhoods.length - 2;

  // Fall back to distance badge if no neighborhoods detected
  const showNeighborhoods = neighborhoods.length > 0;

  return (
    <Link to={`/charities/${charity.slug}`} className="block group">
      <div className="rounded-xl overflow-hidden border border-gray-200 hover:border-gray-400 transition-colors shadow-sm">
        {/* Photo */}
        <div className="relative w-full h-44 overflow-hidden">
          {photoUrl ? (
            <img
              src={cloudinaryUrl(photoUrl, { w: 600, h: 176, fit: 'fill' })}
              alt={charity.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div
              className="w-full h-full flex items-center justify-center"
              style={{ backgroundColor: color }}
            >
              <span className="text-3xl font-bold text-white/80">{initials}</span>
            </div>
          )}
          {/* Gradient overlay */}
          <div
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(to top, rgba(0,0,0,0.4) 0%, transparent 55%)',
            }}
          />
          {/* Location badges at bottom of photo */}
          <div className="absolute bottom-2 left-2 right-2 flex flex-wrap gap-1">
            {showNeighborhoods ? (
              <>
                {displayNeighborhoods.map((n) => (
                  <span
                    key={n}
                    className="text-white text-xs font-semibold bg-black/45 backdrop-blur-sm px-2 py-0.5 rounded-full"
                  >
                    {n}
                  </span>
                ))}
                {extraCount > 0 && (
                  <span className="text-white text-xs font-semibold bg-black/45 backdrop-blur-sm px-2 py-0.5 rounded-full">
                    +{extraCount} more
                  </span>
                )}
              </>
            ) : distance !== null ? (
              <span className="text-white text-xs font-semibold bg-black/45 backdrop-blur-sm px-2 py-0.5 rounded-full">
                {distanceLabel(distance)}
              </span>
            ) : null}
          </div>
        </div>

        {/* Info */}
        <div className="p-3">
          <h3 className="font-bold text-gray-900 text-sm leading-snug mb-1 line-clamp-1">
            {charity.name}
          </h3>
          {charity.description && (
            <p className="text-xs text-gray-500 line-clamp-2 mb-2">{charity.description}</p>
          )}
          {charity.causeTags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {charity.causeTags.slice(0, 2).map((tag) => (
                <span
                  key={tag}
                  className="text-xs px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded-full"
                >
                  {tagLabels.get(tag) ?? tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
