import { useEffect, useRef, useState } from 'react';
import Map, { Marker, Popup, MapRef } from 'react-map-gl/mapbox';
import { Link } from 'react-router-dom';
import 'mapbox-gl/dist/mapbox-gl.css';

interface CharityMapProps {
  charities: {
    id: string;
    name: string;
    slug: string;
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
  className?: string;
}

interface SelectedMarker {
  locationId: string;
  charityName: string;
  charitySlug: string;
  label: string;
  description: string | null;
  latitude: number;
  longitude: number;
}

const DENVER_CENTER = { longitude: -104.98832, latitude: 39.73669 };
const DEFAULT_ZOOM = 9.57;

const COLOR_DEFAULT = '#0EA5E9';
const COLOR_HIGHLIGHTED = '#EF4444';
const COLOR_DIMMED = '#CBD5E1';

export function CharityMap({ charities, selectedCharityId, className }: CharityMapProps) {
  const mapRef = useRef<MapRef>(null);
  const [selectedMarker, setSelectedMarker] = useState<SelectedMarker | null>(null);

  useEffect(() => {
    if (!selectedCharityId || !mapRef.current) return;

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
      });
    } else {
      const lngs = validLocs.map((l) => l.longitude!);
      const lats = validLocs.map((l) => l.latitude!);
      mapRef.current.fitBounds(
        [
          [Math.min(...lngs), Math.min(...lats)],
          [Math.max(...lngs), Math.max(...lats)],
        ],
        { padding: 80, maxZoom: 14, duration: 800 }
      );
    }
  }, [selectedCharityId, charities]);

  return (
    <div className={className} style={{ width: '100%', height: '100%' }}>
      <Map
        ref={mapRef}
        mapboxAccessToken={import.meta.env.VITE_MAPBOX_TOKEN}
        initialViewState={{
          ...DENVER_CENTER,
          zoom: DEFAULT_ZOOM,
        }}
        style={{ width: '100%', height: '100%' }}
        mapStyle="mapbox://styles/mapbox/streets-v12"
      >
        {charities.flatMap((charity) =>
          charity.locations
            .filter((loc) => loc.latitude != null && loc.longitude != null)
            .map((loc) => (
              <Marker
                key={`${loc.id}-${selectedCharityId == null ? 'none' : charity.id === selectedCharityId ? 'sel' : 'dim'}`}
                latitude={loc.latitude!}
                longitude={loc.longitude!}
                anchor="bottom"
                color={
                  selectedCharityId == null
                    ? COLOR_DEFAULT
                    : charity.id === selectedCharityId
                      ? COLOR_HIGHLIGHTED
                      : COLOR_DIMMED
                }
                onClick={(e) => {
                  e.originalEvent.stopPropagation();
                  setSelectedMarker({
                    locationId: loc.id,
                    charityName: charity.name,
                    charitySlug: charity.slug,
                    label: loc.label,
                    description: loc.description,
                    latitude: loc.latitude!,
                    longitude: loc.longitude!,
                  });
                }}
              />
            ))
        )}

        {selectedMarker && (
          <Popup
            latitude={selectedMarker.latitude}
            longitude={selectedMarker.longitude}
            anchor="top"
            onClose={() => setSelectedMarker(null)}
            closeOnClick={false}
          >
            <div style={{ maxWidth: 220 }}>
              <strong>{selectedMarker.label}</strong>
              <div style={{ fontSize: '0.9em', color: '#666' }}>
                {selectedMarker.charityName}
              </div>
              {selectedMarker.description && (
                <p style={{ margin: '6px 0', fontSize: '0.85em' }}>
                  {selectedMarker.description}
                </p>
              )}
              <Link to={`/charities/${selectedMarker.charitySlug}`}>
                View charity →
              </Link>
            </div>
          </Popup>
        )}
      </Map>
    </div>
  );
}
