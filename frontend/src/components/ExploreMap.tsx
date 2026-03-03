import { useRef, useEffect } from 'react';
import Map, { Marker, MapRef } from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';
import { causeColor, causeIcon } from '../lib/causeColors';
import type { DrawerCharity } from './CharityPreviewDrawer';

interface ExploreCharity extends DrawerCharity {
  id: string;
}

interface ExploreMapProps {
  charities: ExploreCharity[];
  selectedCharityId: string | null;
  selectedLocationId: string | null;
  userPos: { lat: number; lng: number } | null;
  onMarkerClick: (charity: ExploreCharity, locationId: string) => void;
  onMapClick: () => void;
  initialCenter?: { lat: number; lng: number; zoom?: number };
}

const DENVER_CENTER = { longitude: -104.98832, latitude: 39.73669 };
const DEFAULT_ZOOM = 11;
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

function UserDot() {
  return (
    <div
      style={{
        width: 16,
        height: 16,
        borderRadius: '50%',
        backgroundColor: '#3B82F6',
        border: '3px solid white',
        boxShadow: '0 0 0 4px rgba(59,130,246,0.25)',
      }}
    />
  );
}

export function ExploreMap({
  charities,
  selectedCharityId,
  selectedLocationId,
  userPos,
  onMarkerClick,
  onMapClick,
  initialCenter,
}: ExploreMapProps) {
  const mapRef = useRef<MapRef>(null);
  const pendingCenterRef = useRef<{ lat: number; lng: number; zoom?: number } | null>(null);

  useEffect(() => {
    if (!initialCenter) return;
    if (mapRef.current?.isStyleLoaded()) {
      mapRef.current.flyTo({
        center: [initialCenter.lng, initialCenter.lat],
        zoom: (initialCenter.zoom ?? DEFAULT_ZOOM) + ZIP_ZOOM_OFFSET,
        duration: 800,
      });
    } else {
      pendingCenterRef.current = initialCenter;
    }
  }, [initialCenter]);

  function handleMapLoad() {
    const center = pendingCenterRef.current;
    if (center && mapRef.current) {
      mapRef.current.flyTo({
        center: [center.lng, center.lat],
        zoom: (center.zoom ?? DEFAULT_ZOOM) + ZIP_ZOOM_OFFSET,
        duration: 0,
      });
      pendingCenterRef.current = null;
    }
  }

  return (
    <Map
      ref={mapRef}
      mapboxAccessToken={import.meta.env.VITE_MAPBOX_TOKEN}
      initialViewState={{ ...DENVER_CENTER, zoom: DEFAULT_ZOOM }}
      style={{ width: '100%', height: '100%' }}
      mapStyle="mapbox://styles/mapbox/light-v11"
      onClick={onMapClick}
      onLoad={handleMapLoad}
    >
      {/* User location dot */}
      {userPos && (
        <Marker latitude={userPos.lat} longitude={userPos.lng} anchor="center">
          <UserDot />
        </Marker>
      )}

      {/* Charity markers */}
      {charities.flatMap((charity) =>
        charity.locations
          .filter((loc) => loc.latitude != null && loc.longitude != null)
          .map((loc) => {
            const isSelected =
              charity.id === selectedCharityId && loc.id === selectedLocationId;
            const isDimmed =
              selectedCharityId !== null && charity.id !== selectedCharityId;
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
                  onMarkerClick(charity, loc.id);
                  mapRef.current?.flyTo({
                    center: [loc.longitude!, loc.latitude!],
                    zoom: 14,
                    duration: 600,
                  });
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
  );
}
