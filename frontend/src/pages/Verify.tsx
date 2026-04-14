import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useMutation, gql } from '@apollo/client';
import { useAuth } from '../hooks/useAuth';
import { ButtonLink } from '../components/ui/Button';

const VERIFY_MAGIC_LINK = gql`
  mutation VerifyMagicLink($token: String!) {
    verifyMagicLink(token: $token) {
      token
      onboardingCompleted
      user {
        id
        email
        name
        isAdmin
      }
    }
  }
`;

const TOGGLE_FAVORITE = gql`
  mutation ToggleFavoriteAfterVerify($charityId: ID!) {
    toggleFavorite(charityId: $charityId) {
      charityId
      favorited
    }
  }
`;

export function Verify() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuth();
  const [error, setError] = useState<string | null>(null);

  const [verifyMagicLink] = useMutation(VERIFY_MAGIC_LINK);
  const [toggleFavorite] = useMutation(TOGGLE_FAVORITE);

  useEffect(() => {
    const token = searchParams.get('token');

    if (!token) {
      setError('No token provided');
      return;
    }

    verifyMagicLink({ variables: { token } })
      .then(async ({ data }) => {
        if (data?.verifyMagicLink) {
          login(data.verifyMagicLink.token, data.verifyMagicLink.user);

          const pendingCharityId = localStorage.getItem('pendingFavorite');
          const pendingPath = localStorage.getItem('pendingFavoritePath');

          if (pendingCharityId) {
            localStorage.removeItem('pendingFavorite');
            localStorage.removeItem('pendingFavoritePath');
            try {
              await toggleFavorite({ variables: { charityId: pendingCharityId } });
            } catch {
              // silently fail — don't block navigation
            }
          }

          const destination = !data.verifyMagicLink.onboardingCompleted
            ? '/preferences'
            : (pendingPath ?? '/map');
          navigate(destination, { replace: true });
        }
      })
      .catch((err) => {
        setError(err.message || 'Verification failed');
      });
  }, [searchParams, verifyMagicLink, toggleFavorite, login, navigate]);

  if (error) {
    return (
      <div className="max-w-md mx-auto text-center">
        <h1 className="text-xl font-heading font-bold text-text-primary mb-4">Verification failed</h1>
        <p className="text-error mb-4">{error}</p>
        <ButtonLink to="/login" variant="link">
          Try again
        </ButtonLink>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto text-center">
      <h1 className="text-xl font-heading font-bold text-text-primary mb-4">Verifying...</h1>
      <p className="text-text-secondary">Please wait while we verify your login.</p>
    </div>
  );
}
