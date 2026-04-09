import { useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, gql } from '@apollo/client';
import { CharityDetail as CharityDetailView } from '../components/CharityDetail';
import { causesToTagLabels } from '../lib/causeColors';
import { trackEvent } from '../utils/analytics';

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
      coverPhotoFocalPoint
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
      approvedByCharity
      ctaLabel
      ctaUrl
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
  coverPhotoFocalPoint: string | null;
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
  approvedByCharity: boolean;
  ctaLabel: string | null;
  ctaUrl: string | null;
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

  const charity: Charity | null = data?.charity ?? null;
  const lastTrackedId = useRef<string | null>(null);
  useEffect(() => {
    if (charity && charity.id !== lastTrackedId.current) {
      lastTrackedId.current = charity.id;
      trackEvent('charity_view', { charityId: charity.id, charityName: charity.name });
    }
  }, [charity?.id]);

  if (loading) {
    return (
      <div className="-mx-4 -mt-8 -mb-8 animate-pulse">
        {/* Hero */}
        <div className="h-[220px] md:h-[300px] bg-gray-200" />
        <div className="px-4">
          {/* Title */}
          <div className="mt-4 mb-2 space-y-2">
            <div className="h-7 bg-gray-200 rounded w-2/3" />
            <div className="h-4 bg-gray-100 rounded w-1/3" />
          </div>
          {/* Cause tags */}
          <div className="flex gap-2 mt-3">
            <div className="h-6 bg-gray-100 rounded-full w-20" />
            <div className="h-6 bg-gray-100 rounded-full w-24" />
          </div>
          {/* Description */}
          <div className="mt-5 space-y-2">
            <div className="h-4 bg-gray-100 rounded w-full" />
            <div className="h-4 bg-gray-100 rounded w-full" />
            <div className="h-4 bg-gray-100 rounded w-3/4" />
          </div>
          {/* Donate button */}
          <div className="mt-6 h-11 bg-gray-200 rounded-xl w-full" />
        </div>
      </div>
    );
  }

  if (error) {
    return <p className="text-error">Error: {error.message}</p>;
  }

  if (!charity) {
    return <p className="text-text-secondary">Charity not found.</p>;
  }

  return (
    <CharityDetailView
      charity={charity}
      tagLabels={tagLabels}
    />
  );
}
