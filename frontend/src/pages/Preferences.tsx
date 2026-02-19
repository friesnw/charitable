import { useState, useEffect } from 'react';
import { gql, useMutation, useQuery } from '@apollo/client';
import { useAuth } from '../hooks/useAuth';

const MY_PREFERENCES = gql`
  query MyPreferences {
    myPreferences {
      location
    }
  }
`;

const SAVE_PREFERENCES = gql`
  mutation SavePreferences($location: String!) {
    savePreferences(location: $location) {
      location
      onboardingCompleted
    }
  }
`;

type Location = 'denver' | 'other';

export function Preferences() {
  const { user } = useAuth();
  const { data, loading: queryLoading } = useQuery(MY_PREFERENCES);
  const [savePreferences, { loading: saving }] = useMutation(SAVE_PREFERENCES);
  const [location, setLocation] = useState<Location | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (data?.myPreferences?.location) {
      setLocation(data.myPreferences.location as Location);
    }
  }, [data]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!location) return;

    await savePreferences({ variables: { location } });
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  if (queryLoading) {
    return (
      <div className="max-w-md mx-auto">
        <p className="text-text-secondary">Loading preferences...</p>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto">
      <h1 className="text-xl font-bold text-text-primary mb-6">Preferences</h1>

      <div className="mb-8">
        <h2 className="text-sm font-medium text-text-secondary mb-2">Profile</h2>
        <div className="p-4 border border-brand-tertiary rounded-md space-y-1">
          {user?.name && (
            <p className="text-text-primary">{user.name}</p>
          )}
          <p className="text-text-secondary text-sm">{user?.email}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <h2 className="text-sm font-medium text-text-secondary mb-2">Location</h2>
          <div className="space-y-2">
            <label className="flex items-center gap-3 p-3 border border-brand-tertiary rounded-md cursor-pointer hover:border-brand-primary">
              <input
                type="radio"
                name="location"
                value="denver"
                checked={location === 'denver'}
                onChange={() => setLocation('denver')}
                className="text-brand-primary"
              />
              <span className="text-text-primary">Denver, CO</span>
            </label>

            <label className="flex items-center gap-3 p-3 border border-brand-tertiary rounded-md cursor-pointer hover:border-brand-primary">
              <input
                type="radio"
                name="location"
                value="other"
                checked={location === 'other'}
                onChange={() => setLocation('other')}
                className="text-brand-primary"
              />
              <span className="text-text-primary">Other location</span>
            </label>
          </div>
        </div>

        <button
          type="submit"
          disabled={!location || saving}
          className="w-full bg-brand-primary text-white px-4 py-2 rounded-md hover:opacity-90 disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save'}
        </button>

        {saved && (
          <p className="text-sm text-green-600 text-center">Preferences saved successfully.</p>
        )}
      </form>
    </div>
  );
}
