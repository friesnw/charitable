import { nearestNeighborhood } from '../../lib/neighborhoods';
import { causeColor } from '../../lib/causeColors';
import { cloudinaryUrl } from '../../lib/cloudinary';

interface QuickViewLocation {
  label: string;
  photoUrl: string | null;
  latitude: number | null;
  longitude: number | null;
  isSublocation: boolean;
}

interface QuickViewCharity {
  name: string;
  logoUrl: string | null;
  causeTags: string[];
  description: string | null;
}

interface QuickViewEntry {
  charity: QuickViewCharity;
  location: QuickViewLocation;
}

interface LocationQuickViewProps {
  group: {
    lat: number;
    lng: number;
    entries: QuickViewEntry[];
  };
  tagLabels: Map<string, string>;
  onExpand: () => void;
  onClose: () => void;
  /** When true, renders without the card container (for use inside a bottom sheet) */
  flat?: boolean;
}

export function LocationQuickView({ group, tagLabels, onExpand, onClose, flat = false }: LocationQuickViewProps) {
  const primaryEntry = [...group.entries].sort(
    (a, b) => Number(a.location.isSublocation) - Number(b.location.isSublocation)
  )[0];
  const { charity, location } = primaryEntry;
  const hood = nearestNeighborhood(group.lat, group.lng);
  const extraCount = group.entries.length - 1;

  const content = (
    <button
      onClick={onExpand}
      className={`w-full flex items-center gap-3 text-left ${flat ? 'px-4 py-3' : 'p-3'}`}
      aria-label={`View ${location.label}`}
    >
        {/* Thumbnail */}
        <div className="flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden">
          {location.photoUrl ? (
            <img
              src={cloudinaryUrl(location.photoUrl, { w: 160, h: 160, fit: 'fill' })}
              alt={location.label}
              className="w-full h-full object-cover"
            />
          ) : (
            <div
              className="w-full h-full"
              style={{ backgroundColor: causeColor(charity.causeTags) }}
            />
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0 pr-4">
          <p className="font-bold text-gray-900 text-sm leading-snug truncate">{location.label}</p>
          <p className="text-xs text-gray-500 truncate mb-1">{charity.name}</p>
          <div className="flex flex-wrap items-center gap-1 mb-1">
            {hood && (
              <span className="text-xs px-2 py-0.5 rounded-full border border-flair-green text-flair-green">
                {hood}
              </span>
            )}
            {extraCount > 0 && (
              <span className="text-xs text-gray-400">+{extraCount} more</span>
            )}
          </div>
          <div className="flex flex-wrap gap-1">
            {charity.causeTags.slice(0, 3).map((tag) => (
              <span key={tag} className="text-xs px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded">
                {tagLabels.get(tag) ?? tag}
              </span>
            ))}
          </div>
        </div>

        {/* Chevron */}
        <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-gray-400 flex-shrink-0">
          <path fillRule="evenodd" clipRule="evenodd" d="M7.21 14.77a.75.75 0 0 1 .02-1.06L11.168 10 7.23 6.29a.75.75 0 1 1 1.04-1.08l4.5 4.25a.75.75 0 0 1 0 1.08l-4.5 4.25a.75.75 0 0 1-1.06-.02Z" />
        </svg>
    </button>
  );

  if (flat) {
    return (
      <div className="relative">
        {content}
        <button
          onClick={(e) => { e.stopPropagation(); onClose(); }}
          className="absolute top-1/2 -translate-y-1/2 right-4 w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 text-xs transition-colors"
          aria-label="Close"
        >
          ✕
        </button>
      </div>
    );
  }

  return (
    <div className="relative bg-white rounded-2xl shadow-xl overflow-hidden">
      {content}
      {/* Close button */}
      <button
        onClick={(e) => { e.stopPropagation(); onClose(); }}
        className="absolute top-2 right-2 w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 text-xs transition-colors"
        aria-label="Close"
      >
        ✕
      </button>
    </div>
  );
}
