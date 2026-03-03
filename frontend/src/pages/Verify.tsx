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

export function Verify() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuth();
  const [error, setError] = useState<string | null>(null);

  const [verifyMagicLink] = useMutation(VERIFY_MAGIC_LINK);

  useEffect(() => {
    const token = searchParams.get('token');

    if (!token) {
      setError('No token provided');
      return;
    }

    verifyMagicLink({ variables: { token } })
      .then(({ data }) => {
        if (data?.verifyMagicLink) {
          login(data.verifyMagicLink.token, data.verifyMagicLink.user);
          const destination = data.verifyMagicLink.onboardingCompleted
            ? '/dashboard'
            : '/preferences';
          navigate(destination, { replace: true });
        }
      })
      .catch((err) => {
        setError(err.message || 'Verification failed');
      });
  }, [searchParams, verifyMagicLink, login, navigate]);

  if (error) {
    return (
      <div className="max-w-md mx-auto text-center">
        <h1 className="text-xl font-bold text-text-primary mb-4">Verification failed</h1>
        <p className="text-error mb-4">{error}</p>
        <ButtonLink to="/login" variant="link">
          Try again
        </ButtonLink>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto text-center">
      <h1 className="text-xl font-bold text-text-primary mb-4">Verifying...</h1>
      <p className="text-text-secondary">Please wait while we verify your login.</p>
    </div>
  );
}
