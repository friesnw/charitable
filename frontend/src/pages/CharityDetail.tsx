import { useParams } from 'react-router-dom';
import { useQuery, gql } from '@apollo/client';
import { CharityDetailStory } from '../components/CharityDetailStory';
import { useGeolocation, nearestLocation } from '../lib/geo';

const GET_CAUSES = gql`
  query GetCauses {
    causes {
      tag
      label
    }
  }
`;

const GET_CHARITY = gql`
  query GetCharity($slug: String!) {
    charity(slug: $slug) {
      id
      name
      slug
      description
      logoUrl
      websiteUrl
      volunteerUrl
      primaryAddress
      ein
      foundedYear
      everyOrgSlug
      causeTags
      locations {
        id
        label
        description
        address
        latitude
        longitude
        photoUrl
      }
    }
  }
`;

interface CharityLocation {
  id: string;
  label: string;
  description: string | null;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  photoUrl: string | null;
}

interface Charity {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  logoUrl: string | null;
  websiteUrl: string | null;
  volunteerUrl: string | null;
  primaryAddress: string | null;
  ein: string;
  foundedYear: number | null;
  everyOrgSlug: string | null;
  causeTags: string[];
  locations: CharityLocation[];
}

export function CharityDetail() {
  const { slug } = useParams<{ slug: string }>();

  const { loading, error, data } = useQuery(GET_CHARITY, {
    variables: { slug },
    skip: !slug,
  });

  const { data: causesData } = useQuery(GET_CAUSES);
  const userPos = useGeolocation();

  const tagLabels = new Map<string, string>(
    (causesData?.causes ?? []).map((c: { tag: string; label: string }) => [c.tag, c.label])
  );

  if (loading) {
    return <p className="text-text-secondary">Loading...</p>;
  }

  if (error) {
    return <p className="text-error">Error: {error.message}</p>;
  }

  const charity: Charity | null = data?.charity;

  if (!charity) {
    return <p className="text-text-secondary">Charity not found.</p>;
  }

  const userDistance = userPos
    ? nearestLocation(userPos, charity.locations)?.distance ?? null
    : null;

  return (
    <CharityDetailStory
      charity={charity}
      tagLabels={tagLabels}
      userDistance={userDistance}
    />
  );
}
