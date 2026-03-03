import { useEffect, useRef } from 'react';
import Map, { Marker, MapRef } from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';
import { causeColor, causeIcon } from '../lib/causeColors';

interface CharityMapProps {
  charities: {
    id: string;
    name: string;
    slug: string;
    causeTags: string[];
    locations: {
      id: string;
      label: string;
      description: string | null;
      address: string | null;
      latitude: number | null;
      longitude: number | null;
    }[];
  }[];
  selectedCharityId?: string | null;
  selectedLocationId?: string | null;
  onMarkerClick?: (charityId: string, locationId: string) => void;
  initialCenter?: { longitude: number; latitude: number; zoom: number };
  className?: string;
}

const DENVER_CENTER = { longitude: -104.98832, latitude: 39.73669 };
const DEFAULT_ZOOM = 9.57;
// Zip-level zoom is slightly tighter than ideal for a city map view
const ZIP_ZOOM_OFFSET = -1;

function CauseDot({ color, icon }: { color: string; icon: string }) {
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
      }}
    >
      {icon}
    </div>
  );
}

export function CharityMap({
  charities,
  selectedCharityId,
  selectedLocationId,
  onMarkerClick,
  initialCenter,
  className,
}: CharityMapProps) {
  const mapRef = useRef<MapRef>(null);
  const pendingCenterRef = useRef<{ longitude: number; latitude: number; zoom: number } | null>(null);

  // When initialCenter changes: fly immediately if map is ready, otherwise queue it
  useEffect(() => {
    if (!initialCenter) return;
    if (mapRef.current?.isStyleLoaded()) {
      mapRef.current.flyTo({
        center: [initialCenter.longitude, initialCenter.latitude],
        zoom: initialCenter.zoom + ZIP_ZOOM_OFFSET,
        duration: 800,
      });
    } else {
      pendingCenterRef.current = initialCenter;
    }
  }, [initialCenter]);

  // Apply any queued center once the map style has loaded
  function handleMapLoad() {
    const center = pendingCenterRef.current;
    if (center && mapRef.current) {
      mapRef.current.flyTo({
        center: [center.longitude, center.latitude],
        zoom: center.zoom + ZIP_ZOOM_OFFSET,
        duration: 0,
      });
      pendingCenterRef.current = null;
    }
  }

  // Fly to selected location, or fit bounds of selected charity's locations
  useEffect(() => {
    if (!mapRef.current) return;

    // Extra top padding to clear the floating search/chip bar
    const floatingPad = { top: 120, bottom: 40, left: 40, right: 40 };

    if (selectedLocationId && selectedCharityId) {
      const charity = charities.find((c) => c.id === selectedCharityId);
      const loc = charity?.locations.find((l) => l.id === selectedLocationId);
      if (loc?.latitude != null && loc?.longitude != null) {
        mapRef.current.flyTo({
          center: [loc.longitude, loc.latitude],
          zoom: 13,
          duration: 800,
          padding: floatingPad,
        });
      }
      return;
    }

    if (!selectedCharityId) return;

    const charity = charities.find((c) => c.id === selectedCharityId);
    const validLocs = charity?.locations.filter(
      (l) => l.latitude != null && l.longitude != null
    ) ?? [];
    if (validLocs.length === 0) return;

    if (validLocs.length === 1) {
      mapRef.current.flyTo({
        center: [validLocs[0].longitude!, validLocs[0].latitude!],
        zoom: 13,
        duration: 800,
        padding: floatingPad,
      });
    } else {
      const lngs = validLocs.map((l) => l.longitude!);
      const lats = validLocs.map((l) => l.latitude!);
      mapRef.current.fitBounds(
        [
          [Math.min(...lngs), Math.min(...lats)],
          [Math.max(...lngs), Math.max(...lats)],
        ],
        { padding: floatingPad, maxZoom: 14, duration: 800 }
      );
    }
  }, [selectedCharityId, selectedLocationId, charities]);

  return (
    <div className={className} style={{ width: '100%', height: '100%' }}>
      <Map
        ref={mapRef}
        mapboxAccessToken={import.meta.env.VITE_MAPBOX_TOKEN}
        initialViewState={{ ...DENVER_CENTER, zoom: DEFAULT_ZOOM }}
        style={{ width: '100%', height: '100%' }}
        mapStyle="mapbox://styles/mapbox/standard"
        onLoad={handleMapLoad}
      >
        {charities.flatMap((charity) =>
          charity.locations
            .filter((loc) => loc.latitude != null && loc.longitude != null)
            .map((loc) => {
              const isSelected =
                charity.id === selectedCharityId && loc.id === selectedLocationId;
              const isDimmed =
                selectedCharityId != null && charity.id !== selectedCharityId;
              const color = causeColor(charity.causeTags);
              const icon = causeIcon(charity.causeTags);

              return (
                <Marker
                  key={`${loc.id}-${selectedCharityId ?? 'none'}`}
                  latitude={loc.latitude!}
                  longitude={loc.longitude!}
                  anchor="center"
                  onClick={(e) => {
                    e.originalEvent.stopPropagation();
                    onMarkerClick?.(charity.id, loc.id);
                  }}
                >
                  <div
                    style={{
                      opacity: isDimmed ? 0.35 : 1,
                      transform: isSelected ? 'scale(1.35)' : 'scale(1)',
                      transition: 'transform 0.15s, opacity 0.15s',
                    }}
                  >
                    <CauseDot color={color} icon={icon} />
                  </div>
                </Marker>
              );
            })
        )}
      </Map>
    </div>
  );
}
