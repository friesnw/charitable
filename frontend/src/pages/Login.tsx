import { useState } from 'react';
import { useMutation, gql } from '@apollo/client';

const REQUEST_MAGIC_LINK = gql`
  mutation RequestMagicLink($email: String!) {
    requestMagicLink(email: $email)
  }
`;

export function Login() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [requestMagicLink, { loading, error }] = useMutation(REQUEST_MAGIC_LINK);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    try {
      await requestMagicLink({ variables: { email } });
      setSubmitted(true);
    } catch {
      // Error is handled by Apollo error state
    }
  };

  if (submitted) {
    return (
      <div className="max-w-md mx-auto">
        <h1 className="text-xl font-bold text-text-primary mb-4">Check your email</h1>
        <p className="text-text-secondary">
          We sent a login link to <strong>{email}</strong>. Click the link to sign in.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto">
      <h1 className="text-xl font-bold text-text-primary mb-4">Log in</h1>
      <p className="text-text-secondary mb-6">
        Enter your email to receive a magic link.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-text-primary mb-1">
            Email
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
            className="w-full px-3 py-2 border border-brand-tertiary rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary"
          />
        </div>

        {error && (
          <p className="text-error">{error.message}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-brand-primary text-white px-4 py-2 rounded-md hover:opacity-90 disabled:opacity-50"
        >
          {loading ? 'Sending...' : 'Send magic link'}
        </button>
      </form>
    </div>
  );
}
