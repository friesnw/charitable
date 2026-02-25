import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { cloudinaryUrl } from '../lib/cloudinary';
import { distanceLabel } from '../lib/geo';
import { causeColor } from '../lib/causeColors';
import { nearestNeighborhood } from '../lib/neighborhoods';

export interface DrawerCharity {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  causeTags: string[];
  everyOrgSlug: string | null;
  locations: {
    id: string;
    label: string;
    address: string | null;
    photoUrl: string | null;
    latitude: number | null;
    longitude: number | null;
  }[];
}

interface CharityPreviewDrawerProps {
  charity: DrawerCharity | null;
  selectedLocationId: string | null;
  distance: number | null;
  tagLabels: Map<string, string>;
  onClose: () => void;
}

export function CharityPreviewDrawer({
  charity,
  selectedLocationId,
  distance,
  tagLabels,
  onClose,
}: CharityPreviewDrawerProps) {
  const isOpen = charity !== null;
  const selectedLocation = charity?.locations.find((l) => l.id === selectedLocationId)
    ?? charity?.locations[0]
    ?? null;

  const color = causeColor(charity?.causeTags ?? []);
  const photoUrl = selectedLocation?.photoUrl ?? null;

  const neighborhood = useMemo(() => {
    if (selectedLocation?.latitude != null && selectedLocation?.longitude != null) {
      return nearestNeighborhood(selectedLocation.latitude, selectedLocation.longitude);
    }
    return null;
  }, [selectedLocation]);

  return (
    <>
      {/* Backdrop — tapping outside closes drawer */}
      {isOpen && (
        <div
          className="fixed inset-0 z-20"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Drawer */}
      <div
        className="fixed bottom-0 left-0 right-0 z-30 transition-transform duration-300 ease-out"
        style={{ transform: isOpen ? 'translateY(0)' : 'translateY(100%)' }}
        role="dialog"
        aria-modal="true"
        aria-label={charity?.name ?? 'Charity details'}
      >
        <div className="bg-white rounded-t-2xl shadow-2xl overflow-hidden max-h-[85vh] flex flex-col">
          {/* Drag handle */}
          <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
            <div className="w-10 h-1 rounded-full bg-gray-300" />
          </div>

          {/* Hero photo */}
          <div className="relative w-full h-44 flex-shrink-0 overflow-hidden">
            {photoUrl ? (
              <img
                src={cloudinaryUrl(photoUrl, { w: 800, h: 176, fit: 'fill' })}
                alt={selectedLocation?.label ?? charity?.name ?? ''}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full" style={{ backgroundColor: color }} />
            )}
            {/* Gradient overlay */}
            <div
              className="absolute inset-0"
              style={{
                background: 'linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 60%)',
              }}
            />
            {/* Neighborhood or distance badge */}
            {(neighborhood ?? distance) !== null && (
              <span className="absolute bottom-3 left-3 text-white text-xs font-semibold bg-black/40 backdrop-blur-sm px-2 py-1 rounded-full">
                {neighborhood ?? distanceLabel(distance!)}
              </span>
            )}
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-3 right-3 w-7 h-7 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/50"
              aria-label="Close"
            >
              ✕
            </button>
          </div>

          {/* Content */}
          <div className="px-4 pt-3 pb-6 overflow-y-auto flex-1">
            <h2 className="text-lg font-bold text-gray-900 leading-snug mb-1">
              {charity?.name}
            </h2>

            {selectedLocation?.address && (
              <p className="text-sm text-gray-500 mb-2">{selectedLocation.address}</p>
            )}

            {charity?.description && (
              <p className="text-sm text-gray-700 line-clamp-2 mb-3">{charity.description}</p>
            )}

            {(charity?.causeTags?.length ?? 0) > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-4">
                {charity!.causeTags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600"
                  >
                    {tagLabels.get(tag) ?? tag}
                  </span>
                ))}
              </div>
            )}

            <div className="flex gap-3">
              <Link
                to={`/charities/${charity?.slug}`}
                className="flex-1 text-center py-2.5 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50"
                onClick={onClose}
              >
                Learn more →
              </Link>
              {charity?.everyOrgSlug && (
                <a
                  href={`https://www.every.org/${charity.everyOrgSlug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 text-center py-2.5 rounded-lg text-sm font-medium text-white"
                  style={{ backgroundColor: color }}
                >
                  Donate
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
