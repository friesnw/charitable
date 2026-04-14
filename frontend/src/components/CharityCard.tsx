import { Link } from 'react-router-dom';
import { cloudinaryUrl } from '../lib/cloudinary';

export interface CharityForCard {
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

interface CharityCardProps {
  charity: CharityForCard;
  tagLabels: Map<string, string>;
}

export function CharityCard({ charity, tagLabels }: CharityCardProps) {
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
          src={cloudinaryUrl(featuredPhoto, { w: 600, h: 240, fit: 'fill' })}
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
                src={cloudinaryUrl(charity.logoUrl, { w: 96, h: 96, fit: 'fit' })}
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

export function SkeletonCard() {
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
