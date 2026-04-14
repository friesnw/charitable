import { useEffect, useMemo, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, gql } from '@apollo/client';
import { CharityDetail as CharityDetailView } from '../components/CharityDetail';
import { Toast } from '../components/ui/Toast';
import { SaveToListModal } from '../components/SaveToListModal';
import { causesToTagLabels } from '../lib/causeColors';
import { trackEvent } from '../utils/analytics';
import { useAuth } from '../hooks/useAuth';

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

const MY_FAVORITES_IDS = gql`
  query MyFavoritesIdsForDetail {
    myFavorites {
      id
    }
  }
`;

const TOGGLE_FAVORITE = gql`
  mutation ToggleFavoriteFromDetail($charityId: ID!) {
    toggleFavorite(charityId: $charityId) {
      charityId
      favorited
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
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  const { loading, error, data } = useQuery(GET_CHARITY, {
    variables: { slug },
    skip: !slug,
  });
  const { data: causesData } = useQuery(GET_CAUSES);
  const { data: favoritesData } = useQuery(MY_FAVORITES_IDS, {
    skip: !isAuthenticated,
  });

  const [toggleFavorite, { loading: favoriteLoading }] = useMutation(TOGGLE_FAVORITE);
  const [favorited, setFavorited] = useState(false);
  const [saveModal, setSaveModal] = useState(false);
  const [toast, setToast] = useState<{ id: number; message: string; action?: { label: string; onClick: () => void } } | null>(null);
  const toastIdRef = useRef(0);

  const tagLabels = causesToTagLabels(causesData?.causes ?? []);
  const charity: Charity | null = data?.charity ?? null;

  const favoritedIds = useMemo(
    () => new Set<string>((favoritesData?.myFavorites ?? []).map((c: { id: string }) => c.id)),
    [favoritesData],
  );

  // Sync favorited state once we have the charity id and favorites list
  const syncedRef = useRef(false);
  useEffect(() => {
    if (charity && favoritesData && !syncedRef.current) {
      syncedRef.current = true;
      setFavorited(favoritedIds.has(charity.id));
    }
  }, [charity, favoritesData, favoritedIds]);

  const lastTrackedId = useRef<string | null>(null);
  useEffect(() => {
    if (charity && charity.id !== lastTrackedId.current) {
      lastTrackedId.current = charity.id;
      trackEvent('charity_view', { charityId: charity.id, charityName: charity.name });
    }
  }, [charity?.id]);

  async function handleFavoriteClick() {
    if (!isAuthenticated) {
      setSaveModal(true);
      return;
    }
    if (!charity || favoriteLoading) return;

    const newFavorited = !favorited;
    setFavorited(newFavorited);
    try {
      await toggleFavorite({ variables: { charityId: charity.id } });
      const nextId = ++toastIdRef.current;
      if (newFavorited) {
        setToast({
          id: nextId,
          message: 'Saved to your list',
          action: user
            ? { label: 'View list', onClick: () => navigate('/favorites') }
            : undefined,
        });
      } else {
        setToast({
          id: nextId,
          message: 'Removed from your list',
          action: {
            label: 'Undo',
            onClick: async () => {
              setFavorited(true);
              setToast(null);
              await toggleFavorite({ variables: { charityId: charity.id } });
            },
          },
        });
      }
    } catch {
      setFavorited(!newFavorited); // revert on error
    }
  }

  if (loading) {
    return (
      <div className="-mx-4 -mt-8 -mb-8 animate-pulse">
        <div className="h-[220px] md:h-[300px] bg-gray-200" />
        <div className="px-4">
          <div className="mt-4 mb-2 space-y-2">
            <div className="h-7 bg-gray-200 rounded w-2/3" />
            <div className="h-4 bg-gray-100 rounded w-1/3" />
          </div>
          <div className="flex gap-2 mt-3">
            <div className="h-6 bg-gray-100 rounded-full w-20" />
            <div className="h-6 bg-gray-100 rounded-full w-24" />
          </div>
          <div className="mt-5 space-y-2">
            <div className="h-4 bg-gray-100 rounded w-full" />
            <div className="h-4 bg-gray-100 rounded w-full" />
            <div className="h-4 bg-gray-100 rounded w-3/4" />
          </div>
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
    <>
      <CharityDetailView
        charity={charity}
        tagLabels={tagLabels}
        favorited={favorited}
        favoriteLoading={favoriteLoading}
        onFavoriteClick={handleFavoriteClick}
      />
      {toast && (
        <Toast
          key={toast.id}
          message={toast.message}
          action={toast.action}
          onDismiss={() => setToast(null)}
          bottom={88}
        />
      )}
      {saveModal && charity && (
        <SaveToListModal
          charityId={charity.id}
          charityName={charity.name}
          onClose={() => setSaveModal(false)}
        />
      )}
    </>
  );
}
