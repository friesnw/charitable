import { useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useQuery, gql } from '@apollo/client';
import { CharityCard, SkeletonCard } from '../components/CharityCard';
import { useAuth } from '../hooks/useAuth';

const USER_FAVORITES = gql`
  query UserFavoritesPage($shareToken: String!) {
    userFavorites(shareToken: $shareToken) {
      userName
      charities {
        id
        slug
        name
        description
        logoUrl
        coverPhotoUrl
        causeTags
        featured
        locations {
          id
          latitude
          longitude
          isSublocation
          photoUrl
        }
      }
    }
  }
`;

const MY_FAVORITES = gql`
  query MyFavoritesPage {
    myFavorites {
      id
      slug
      name
      description
      logoUrl
      coverPhotoUrl
      causeTags
      featured
      locations {
        id
        latitude
        longitude
        isSublocation
        photoUrl
      }
    }
  }
`;

const GET_CAUSES = gql`
  query GetCausesForFavorites {
    causes {
      tag
      label
    }
  }
`;

function possessive(name: string): string {
  return name.endsWith('s') ? `${name}'` : `${name}'s`;
}

export function Favorites() {
  const { shareToken } = useParams<{ shareToken: string }>();
  const { user } = useAuth();
  const isOwnList = !shareToken;

  const { loading: ownLoading, data: ownData } = useQuery(MY_FAVORITES, {
    skip: !!shareToken,
    fetchPolicy: 'network-only',
  });
  const { loading: sharedLoading, data: sharedData } = useQuery(USER_FAVORITES, {
    variables: { shareToken },
    skip: !shareToken,
    fetchPolicy: 'network-only',
  });
  const { data: causesData } = useQuery(GET_CAUSES);

  const loading = isOwnList ? ownLoading : sharedLoading;

  const tagLabels = useMemo(
    () => new Map<string, string>((causesData?.causes ?? []).map((c: { tag: string; label: string }) => [c.tag, c.label] as [string, string])),
    [causesData],
  );

  const userName: string = isOwnList ? (user?.name ?? '') : (sharedData?.userFavorites?.userName ?? '');
  const charities = isOwnList ? (ownData?.myFavorites ?? []) : (sharedData?.userFavorites?.charities ?? []);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="h-8 bg-bg-accent rounded w-64 mb-2 animate-pulse" />
        <div className="h-4 bg-bg-accent rounded w-40 mb-8 animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-text-primary">
          {userName ? `${possessive(userName)} favorite nonprofits` : 'Favorite nonprofits'}
        </h1>
        {charities.length > 0 && (
          <p className="text-sm text-text-secondary mt-1">
            {charities.length} saved {charities.length === 1 ? 'nonprofit' : 'nonprofits'}
          </p>
        )}
      </div>

      {charities.length === 0 ? (
        <div className="text-center py-16 text-text-secondary">
          {isOwnList ? (
            <>
              <p className="mb-2 font-medium text-text-primary">No saved nonprofits yet</p>
              <p className="text-sm">
                Tap the bookmark on any nonprofit to save it here.{' '}
                <Link to="/list" className="underline underline-offset-2 hover:text-text-primary">Browse nonprofits</Link>
              </p>
            </>
          ) : (
            <p>No saved nonprofits yet.</p>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {charities.map((charity: Parameters<typeof CharityCard>[0]['charity']) => (
            <CharityCard
              key={charity.id}
              charity={charity}
              tagLabels={tagLabels}
            />
          ))}
        </div>
      )}
    </div>
  );
}
