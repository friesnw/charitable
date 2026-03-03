import { useQuery, gql } from '@apollo/client';
import { NearbyCharityCard, type NearbyCharity } from '../components/NearbyCharityCard';
import { useGeolocation, nearestLocation } from '../lib/geo';
import { causesToTagLabels } from '../lib/causeColors';

const DENVER_CENTER = { lat: 39.73669, lng: -104.98832 };

const GET_CAUSES = gql`
  query GetCausesNearby {
    causes {
      tag
      label
    }
  }
`;

const GET_CHARITIES_NEARBY = gql`
  query GetCharitiesNearby {
    charities {
      id
      slug
      name
      description
      causeTags
      locations {
        id
        address
        photoUrl
        latitude
        longitude
      }
    }
  }
`;

interface CharityWithDistance {
  charity: NearbyCharity;
  distance: number | null;
}

export function Nearby() {
  const userPos = useGeolocation();

  const { data, loading, error } = useQuery(GET_CHARITIES_NEARBY);
  const { data: causesData } = useQuery(GET_CAUSES);

  const tagLabels = causesToTagLabels(causesData?.causes ?? []);

  const charities: NearbyCharity[] = data?.charities ?? [];

  // Sort by distance from userPos or Denver center
  const sortPos = userPos ?? DENVER_CENTER;
  const charitiesWithDistance: CharityWithDistance[] = charities.map((charity) => {
    const nearest = nearestLocation(sortPos, charity.locations);
    return { charity, distance: nearest?.distance ?? null };
  });

  charitiesWithDistance.sort((a, b) => {
    if (a.distance == null && b.distance == null) return 0;
    if (a.distance == null) return 1;
    if (b.distance == null) return -1;
    return a.distance - b.distance;
  });

  const hasGeo = userPos !== null;
  const headerLabel = hasGeo ? 'Charities near you' : 'Charities in Denver';
  const subLabel = hasGeo
    ? 'Sorted by distance from your location'
    : 'Showing distance from Denver center — allow location access for personalized sorting';

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{headerLabel}</h1>
        <p className="text-sm text-gray-500 mt-1">{subLabel}</p>
      </div>

      {loading && <p className="text-gray-500">Loading charities...</p>}
      {error && <p className="text-red-500">Error: {error.message}</p>}

      {!loading && !error && charitiesWithDistance.length === 0 && (
        <p className="text-gray-500">No charities found.</p>
      )}

      {/* Photo grid */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 md:grid-cols-3">
        {charitiesWithDistance.map(({ charity, distance }) => (
          <NearbyCharityCard
            key={charity.id}
            charity={charity}
            distance={distance}
            tagLabels={tagLabels}
          />
        ))}
      </div>
    </div>
  );
}
