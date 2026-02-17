import { useState } from 'react';
import Map, { Marker, Popup } from 'react-map-gl/mapbox';
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

export function CharityMap({ charities }: CharityMapProps) {
  const [selectedMarker, setSelectedMarker] = useState<SelectedMarker | null>(null);

  return (
    <Map
      mapboxAccessToken={import.meta.env.VITE_MAPBOX_TOKEN}
      initialViewState={{
        ...DENVER_CENTER,
        zoom: DEFAULT_ZOOM,
      }}
      style={{ width: '100%', height: '500px' }}
      mapStyle="mapbox://styles/mapbox/streets-v12"
    >
      {charities.flatMap((charity) =>
        charity.locations
          .filter((loc) => loc.latitude != null && loc.longitude != null)
          .map((loc) => (
            <Marker
              key={loc.id}
              latitude={loc.latitude!}
              longitude={loc.longitude!}
              anchor="bottom"
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
  );
}
