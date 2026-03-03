import { useState, useEffect } from 'react';
import { gql, useMutation, useQuery, useLazyQuery } from '@apollo/client';
import { useAuth } from '../hooks/useAuth';
import { Button } from '../components/ui/Button';

const MY_PREFERENCES = gql`
  query MyPreferences {
    myPreferences {
      zipCode
      neighborhood
    }
  }
`;

const RESOLVE_ZIP = gql`
  query ResolveZip($zip: String!) {
    resolveZip(zip: $zip) {
      zip
      city
      state
      neighborhood
      zoom
      latitude
      longitude
    }
  }
`;

const SAVE_PREFERENCES = gql`
  mutation SavePreferences($zipCode: String, $neighborhood: String) {
    savePreferences(zipCode: $zipCode, neighborhood: $neighborhood) {
      zipCode
      neighborhood
      onboardingCompleted
    }
  }
`;

type ZipInfo = {
  zip: string;
  city: string;
  state: string;
  neighborhood: string | null;
  zoom: number | null;
  latitude: number;
  longitude: number;
};

export function Preferences() {
  const { user } = useAuth();
  const { data: prefsData, loading: queryLoading } = useQuery(MY_PREFERENCES);
  const [savePreferences, { loading: saving }] = useMutation(SAVE_PREFERENCES);
  const [resolveZip, { loading: zipLooking }] = useLazyQuery(RESOLVE_ZIP);

  const [zipInput, setZipInput] = useState('');
  const [neighborhoodInput, setNeighborhoodInput] = useState('');
  const [zipInfo, setZipInfo] = useState<ZipInfo | null>(null);
  const [zipNotFound, setZipNotFound] = useState(false);
  const [saved, setSaved] = useState(false);

  // Populate from saved preferences on load
  useEffect(() => {
    if (prefsData?.myPreferences) {
      const prefs = prefsData.myPreferences;
      if (prefs.zipCode) {
        setZipInput(prefs.zipCode);
        setNeighborhoodInput(prefs.neighborhood ?? '');
        // Resolve the saved zip to show confirmation
        resolveZip({ variables: { zip: prefs.zipCode } }).then(({ data }) => {
          if (data?.resolveZip) {
            setZipInfo(data.resolveZip);
            setZipNotFound(false);
          }
        });
      }
    }
  }, [prefsData]);

  // Also pre-fill from localStorage (anonymous zip set on Charities page)
  useEffect(() => {
    if (!prefsData?.myPreferences?.zipCode) {
      const localZip = localStorage.getItem('userZip');
      if (localZip) {
        setZipInput(localZip);
        resolveZip({ variables: { zip: localZip } }).then(({ data }) => {
          if (data?.resolveZip) {
            setZipInfo(data.resolveZip);
            setZipNotFound(false);
          }
        });
      }
    }
  }, [prefsData]);

  const handleZipChange = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 5);
    setZipInput(digits);
    setZipInfo(null);
    setZipNotFound(false);
    setNeighborhoodInput('');

    if (digits.length === 5) {
      resolveZip({ variables: { zip: digits } }).then(({ data }) => {
        if (data?.resolveZip) {
          const info: ZipInfo = data.resolveZip;
          setZipInfo(info);
          setZipNotFound(false);
          setNeighborhoodInput(info.neighborhood ?? '');
        } else {
          setZipNotFound(true);
        }
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!zipInput || zipInput.length !== 5 || zipNotFound) return;

    await savePreferences({
      variables: {
        zipCode: zipInput,
        neighborhood: neighborhoodInput || null,
      },
    });

    // Clear anonymous localStorage zip — it's now saved to their account
    localStorage.removeItem('userZip');

    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const canSave = zipInput.length === 5 && !zipNotFound && !zipLooking;

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

          <div className="space-y-3">
            <div>
              <input
                type="text"
                inputMode="numeric"
                placeholder="Home zip code"
                value={zipInput}
                onChange={(e) => handleZipChange(e.target.value)}
                maxLength={5}
                className="w-full px-3 py-2 border border-brand-tertiary rounded-md text-text-primary focus:border-brand-primary outline-none"
              />

              {zipLooking && (
                <p className="text-text-secondary text-sm mt-1.5">Looking up zip...</p>
              )}

              {!zipLooking && zipInfo && zipInfo.state === 'CO' && (
                <p className="text-text-secondary text-sm mt-1.5">
                  {zipInfo.city}, {zipInfo.state}{zipInfo.neighborhood ? ` · ${zipInfo.neighborhood}` : ''}
                </p>
              )}

              {!zipLooking && zipInfo && zipInfo.state !== 'CO' && (
                <p className="text-text-secondary text-sm mt-1.5">
                  {zipInfo.city}, {zipInfo.state} — Just a heads up, currently this pilot only covers Denver. We hope to expand soon!
                </p>
              )}

              {!zipLooking && zipNotFound && (
                <p className="text-text-secondary text-sm mt-1.5">
                  Zip code not recognized.
                </p>
              )}
            </div>

            {zipInput.length === 5 && !zipNotFound && (
              <div>
                <input
                  type="text"
                  placeholder="Neighborhood (optional)"
                  value={neighborhoodInput}
                  onChange={(e) => setNeighborhoodInput(e.target.value)}
                  className="w-full px-3 py-2 border border-brand-tertiary rounded-md text-text-primary focus:border-brand-primary outline-none"
                />
              </div>
            )}
          </div>
        </div>

        <Button type="submit" disabled={!canSave} loading={saving} className="w-full">
          Save
        </Button>

        {saved && (
          <p className="text-sm text-green-600 text-center">Preferences saved.</p>
        )}
      </form>
    </div>
  );
}
