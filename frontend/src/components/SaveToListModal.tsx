import { useState } from 'react';
import { createPortal } from 'react-dom';
import { useMutation, gql } from '@apollo/client';
import { Button } from './ui/Button';
import { Icon } from './ui/Icon';

const REQUEST_MAGIC_LINK = gql`
  mutation RequestMagicLinkForFavorite($email: String!) {
    requestMagicLink(email: $email)
  }
`;

interface SaveToListModalProps {
  charityId: string;
  charityName: string;
  onClose: () => void;
}

export function SaveToListModal({ charityId, charityName, onClose }: SaveToListModalProps) {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [requestMagicLink, { loading, error }] = useMutation(REQUEST_MAGIC_LINK);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    try {
      localStorage.setItem('pendingFavorite', charityId);
      localStorage.setItem('pendingFavoritePath', window.location.pathname);
      await requestMagicLink({ variables: { email } });
      setSubmitted(true);
    } catch {
      localStorage.removeItem('pendingFavorite');
      localStorage.removeItem('pendingFavoritePath');
    }
  }

  const content = (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="absolute inset-0 bg-black/40" />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
          aria-label="Close"
        >
          <Icon name="close" className="w-5 h-5" />
        </button>

        {submitted ? (
          <div className="text-center py-2">
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-3">
              <Icon name="check-circle-solid" className="w-5 h-5 text-green-600" />
            </div>
            <h2 className="text-lg font-bold text-text-primary mb-2">Check your email</h2>
            <p className="text-sm text-text-secondary">
              We sent a link to <strong>{email}</strong>. Click it to confirm and save {charityName}.
            </p>
          </div>
        ) : (
          <>
            <div className="mb-5">
              <h2 className="text-lg font-bold text-text-primary mb-1">Save {charityName}</h2>
              <p className="text-sm text-text-secondary">
                Enter your email — if you're new, we'll send a link to confirm your account.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                autoFocus
                className="w-full px-3 py-2.5 border border-brand-tertiary rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary"
              />
              {error && <p className="text-xs text-error">{error.message}</p>}
              <Button type="submit" loading={loading} className="w-full">
                Send link
              </Button>
            </form>
          </>
        )}
      </div>
    </div>
  );

  return createPortal(content, document.body);
}
