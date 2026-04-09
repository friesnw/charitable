import { useRef, useEffect, useCallback, useState, useMemo } from 'react';
import MapGL, { Marker, MapRef } from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';
import { causeColor, causeIcon } from '../lib/causeColors';
import { cloudinaryUrl } from '../lib/cloudinary';
import { nearestNeighborhood } from '../lib/neighborhoods';

interface StoryLocation {
  id: string;
  label: string;
  description: string | null;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  photoUrl: string | null;
}

interface Props {
  locations: StoryLocation[];
  causeTags: string[];
  color: string;
  locationDescription: string | null;
  selectedLocationId: string | null;
  onSelectLocation: (id: string | null) => void;
}

function CauseDot({ color, icon, selected, hovered }: { color: string; icon: string; selected: boolean; hovered: boolean }) {
  return (
    <div
      style={{
        width: 32,
        height: 32,
        borderRadius: '50%',
        backgroundColor: color,
        border: '2.5px solid white',
        boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 14,
        lineHeight: 1,
        transform: selected ? 'scale(1.45)' : hovered ? 'scale(1.2)' : 'scale(1)',
        transition: 'transform 0.15s',
      }}
    >
      {icon}
    </div>
  );
}

export function CharityDetailMap({
  locations,
  causeTags,
  color,
  locationDescription,
  selectedLocationId,
  onSelectLocation,
}: Props) {
  const mapRef = useRef<MapRef>(null);
  const cardRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const isProgrammaticScroll = useRef(false);
  const [hoveredLocationId, setHoveredLocationId] = useState<string | null>(null);
  const icon = causeIcon(causeTags);
  const pinColor = causeColor(causeTags);

  const validLocs = useMemo(
    () => locations.filter((l) => l.latitude != null && l.longitude != null),
    [locations]
  );

  const fitAll = useCallback(() => {
    if (!mapRef.current || validLocs.length === 0) return;
    if (validLocs.length === 1) {
      mapRef.current.flyTo({
        center: [validLocs[0].longitude!, validLocs[0].latitude!],
        zoom: 14,
        duration: 0,
      });
    } else {
      const lngs = validLocs.map((l) => l.longitude!);
      const lats = validLocs.map((l) => l.latitude!);
      mapRef.current.fitBounds(
        [
          [Math.min(...lngs), Math.min(...lats)],
          [Math.max(...lngs), Math.max(...lats)],
        ],
        { padding: 60, maxZoom: 14, duration: 0 }
      );
    }
  }, [validLocs]);

  useEffect(() => {
    if (mapRef.current?.isStyleLoaded()) {
      fitAll();
    }
  }, [fitAll]);

  // Fly to selected location and scroll card into view whenever selection changes
  useEffect(() => {
    if (!selectedLocationId) return;
    const loc = validLocs.find((l) => l.id === selectedLocationId);
    if (loc && mapRef.current) {
      mapRef.current.flyTo({
        center: [loc.longitude!, loc.latitude!],
        zoom: 14,
        duration: 600,
      });
    }
    const card = cardRefs.current.get(selectedLocationId);
    if (card) {
      isProgrammaticScroll.current = true;
      card.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      setTimeout(() => { isProgrammaticScroll.current = false; }, 1000);
    }
  }, [selectedLocationId]); // eslint-disable-line react-hooks/exhaustive-deps

  // On mobile horizontal scroll end, select the most-centered card
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;
    const handleScrollEnd = () => {
      if (isProgrammaticScroll.current) return;
      // Only run for horizontal snap carousel (mobile); on desktop the container
      // has no horizontal overflow so scrollWidth === clientWidth.
      if (container.scrollWidth <= container.clientWidth) return;
      const containerCenter = container.scrollLeft + container.clientWidth / 2;
      let closest: string | null = null;
      let minDist = Infinity;
      for (const [id, el] of cardRefs.current) {
        const cardCenter = el.offsetLeft + el.offsetWidth / 2;
        const dist = Math.abs(cardCenter - containerCenter);
        if (dist < minDist) { minDist = dist; closest = id; }
      }
      if (closest) onSelectLocation(closest);
    };
    container.addEventListener('scrollend', handleScrollEnd);
    return () => container.removeEventListener('scrollend', handleScrollEnd);
  }, [onSelectLocation]);

  function handleCardSelect(loc: StoryLocation) {
    onSelectLocation(loc.id);
  }

  const cardList = (
    <div className="contents">
      {locations.map((loc) => {
        const locNeighborhood =
          loc.latitude != null && loc.longitude != null
            ? nearestNeighborhood(loc.latitude, loc.longitude)
            : null;
        const isSelected = loc.id === selectedLocationId;
        return (
          <div
            key={loc.id}
            ref={(el) => { if (el) cardRefs.current.set(loc.id, el); else cardRefs.current.delete(loc.id); }}
            className="snap-center shrink-0 w-[85vw] md:w-full rounded-lg overflow-hidden border bg-white transition-all cursor-pointer"
            style={{
              borderColor: isSelected ? color : '#e5e7eb',
              boxShadow: isSelected ? `0 0 0 2px ${color}` : undefined,
            }}
            onClick={() => handleCardSelect(loc)}
          >
            {loc.photoUrl ? (
              <img
                src={cloudinaryUrl(loc.photoUrl, { w: 800, h: 400, fit: 'fill' })}
                alt={`${loc.label}`}
                loading="lazy"
                className="w-full object-cover"
                style={{ height: 200 }}
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
  );

  return (
    <section>
      <h2 className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: 'var(--flair-sage)' }}>
        Locations
      </h2>
      {locationDescription && (
        <p className="text-gray-700 text-base leading-relaxed mb-4 max-w-lg">{locationDescription}</p>
      )}

      <div className="flex flex-col md:flex-row gap-6 items-start">
        {/* Map — top on mobile, sticky right on desktop. Rendered once to keep ref stable. */}
        {validLocs.length > 0 && (
          <div
            className="order-1 md:order-2 md:flex-1 w-full rounded-xl overflow-hidden h-[280px] md:h-[calc(100vh_-_120px)] md:sticky md:top-[88px] relative"
          >
            <MapGL
              ref={mapRef}
              mapboxAccessToken={import.meta.env.VITE_MAPBOX_TOKEN}
              initialViewState={{ longitude: -104.98832, latitude: 39.73915, zoom: 11 }}
              style={{ width: '100%', height: '100%' }}
              mapStyle="mapbox://styles/mapbox/light-v11"
              cooperativeGestures
              onClick={() => onSelectLocation(null)}
              onLoad={fitAll}
            >
              {validLocs.map((loc) => (
                <Marker
                  key={loc.id}
                  latitude={loc.latitude!}
                  longitude={loc.longitude!}
                  anchor="center"
                  onClick={(e) => {
                    e.originalEvent.stopPropagation();
                    handleCardSelect(loc);
                  }}
                >
                  <div
                    onMouseEnter={() => setHoveredLocationId(loc.id)}
                    onMouseLeave={() => setHoveredLocationId(null)}
                  >
                    <CauseDot
                      color={pinColor}
                      icon={icon}
                      selected={loc.id === selectedLocationId}
                      hovered={loc.id === hoveredLocationId}
                    />
                  </div>
                </Marker>
              ))}
            </MapGL>

            {/* Map controls */}
            <div className="absolute right-3 bottom-3 z-10 flex flex-col rounded-lg shadow-md overflow-hidden border border-gray-200">
              <button
                onClick={() => mapRef.current?.zoomIn()}
                className="w-9 h-9 bg-white hover:bg-gray-50 flex items-center justify-center text-gray-700 border-b border-gray-200"
                aria-label="Zoom in"
              >
                <svg viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5">
                  <path d="M8 2a.75.75 0 0 1 .75.75v4.5h4.5a.75.75 0 0 1 0 1.5h-4.5v4.5a.75.75 0 0 1-1.5 0v-4.5h-4.5a.75.75 0 0 1 0-1.5h4.5v-4.5A.75.75 0 0 1 8 2Z"/>
                </svg>
              </button>
              <button
                onClick={() => mapRef.current?.zoomOut()}
                className="w-9 h-9 bg-white hover:bg-gray-50 flex items-center justify-center text-gray-700 border-b border-gray-200"
                aria-label="Zoom out"
              >
                <svg viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5">
                  <path d="M3.25 7.25a.75.75 0 0 0 0 1.5h9.5a.75.75 0 0 0 0-1.5h-9.5Z"/>
                </svg>
              </button>
              <button
                onClick={fitAll}
                className="w-9 h-9 bg-white hover:bg-gray-50 flex items-center justify-center text-gray-700"
                aria-label="Recenter map"
              >
                <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="w-3.5 h-3.5">
                  <circle cx="8" cy="8" r="2.5"/>
                  <line x1="8" y1="1" x2="8" y2="4.5"/>
                  <line x1="8" y1="11.5" x2="8" y2="15"/>
                  <line x1="1" y1="8" x2="4.5" y2="8"/>
                  <line x1="11.5" y1="8" x2="15" y2="8"/>
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Card list — horizontal scroll on mobile, vertical on desktop */}
        <div
          ref={scrollContainerRef}
          className="order-2 md:order-1 w-full md:w-100 shrink-0 flex overflow-x-auto snap-x snap-mandatory gap-4 pb-2 md:flex-col md:overflow-x-visible md:overflow-y-auto md:snap-none md:max-h-[calc(100vh_-_120px)] md:pb-0"
        >
          {cardList}
        </div>
      </div>
    </section>
  );
}
