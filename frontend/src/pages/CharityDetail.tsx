import { useParams } from 'react-router-dom';
import { useQuery, gql } from '@apollo/client';
import { CharityDetailStory } from '../components/CharityDetailStory';
import { causesToTagLabels } from '../lib/causeColors';

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
      coverPhotoUrl
      contentPhotoUrl1
      contentPhotoUrl2
      websiteUrl
      volunteerUrl
      primaryAddress
      ein
      foundedYear
      donateUrl
      causeTags
      impact
      programHighlights
      usageCredit
      locationDescription
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
  coverPhotoUrl: string | null;
  contentPhotoUrl1: string | null;
  contentPhotoUrl2: string | null;
  websiteUrl: string | null;
  volunteerUrl: string | null;
  primaryAddress: string | null;
  ein: string;
  foundedYear: number | null;
  donateUrl: string | null;
  causeTags: string[];
  impact: string | null;
  programHighlights: string | null;
  usageCredit: string | null;
  locationDescription: string | null;
  locations: CharityLocation[];
}

export function CharityDetail() {
  const { slug } = useParams<{ slug: string }>();

  const { loading, error, data } = useQuery(GET_CHARITY, {
    variables: { slug },
    skip: !slug,
  });

  const { data: causesData } = useQuery(GET_CAUSES);
  const tagLabels = causesToTagLabels(causesData?.causes ?? []);

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

  return (
    <CharityDetailStory
      charity={charity}
      tagLabels={tagLabels}
    />
  );
}
