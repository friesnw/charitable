import { useState, useEffect } from 'react';
import { gql, useMutation, useQuery, useLazyQuery } from '@apollo/client';
import { useAuth } from '../hooks/useAuth';
import { Button } from '../components/ui/Button';
import { NEIGHBORHOODS } from '../lib/neighborhoods';

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

const CURATED_NAMES = ['Cap Hill','RiNo','Highland','LoDo','Five Points','City Park','Baker','Wash Park','Cherry Creek','Edgewater'];
const curatedNeighborhoods = NEIGHBORHOODS.filter((n) => CURATED_NAMES.includes(n.name));

export function Preferences() {
  const { user } = useAuth();
  const { data: prefsData, loading: queryLoading } = useQuery(MY_PREFERENCES);
  const [savePreferences, { loading: saving }] = useMutation(SAVE_PREFERENCES, {
    update(cache, { data }) {
      if (!data?.savePreferences) return;
      cache.writeQuery({
        query: MY_PREFERENCES,
        data: { myPreferences: data.savePreferences },
      });
    },
  });
  const [resolveZip, { loading: zipLooking }] = useLazyQuery(RESOLVE_ZIP);

  const [zipInput, setZipInput] = useState('');
  const [neighborhoodInput, setNeighborhoodInput] = useState('');
  const [zipInfo, setZipInfo] = useState<ZipInfo | null>(null);
  const [zipNotFound, setZipNotFound] = useState(false);
  const [saved, setSaved] = useState(false);

  const [locationQuery, setLocationQuery] = useState('');
  const [locationDropdownOpen, setLocationDropdownOpen] = useState(false);
  const hasLocation = !!(zipInput || neighborhoodInput);
  const [locationEditing, setLocationEditing] = useState(true);

  const isZipQuery = /^\d/.test(locationQuery);
  const locationSuggestions = !isZipQuery && locationQuery.trim().length > 0
    ? NEIGHBORHOODS.filter((n) => n.name.toLowerCase().includes(locationQuery.toLowerCase())).slice(0, 6)
    : [];

  // Populate zip input from saved preferences (priority) or localStorage fallback.
  // Waits for the preferences query to resolve before checking localStorage so the
  // saved zip always wins if present.
  useEffect(() => {
    const prefs = prefsData?.myPreferences;
    if (prefs?.zipCode) {
      setZipInput(prefs.zipCode);
      setNeighborhoodInput(prefs.neighborhood ?? '');
      setLocationEditing(false);
      resolveZip({ variables: { zip: prefs.zipCode } }).then(({ data }) => {
        if (data?.resolveZip) {
          setZipInfo(data.resolveZip);
          setZipNotFound(false);
        }
      });
    } else if (prefsData !== undefined) {
      // Preferences loaded but no saved zip — check for neighborhood or localStorage fallback
      if (prefsData.myPreferences?.neighborhood) {
        setNeighborhoodInput(prefsData.myPreferences.neighborhood);
        setLocationEditing(false);
      }
      const localZip = localStorage.getItem('userZip');
      if (localZip) {
        setZipInput(localZip);
        setLocationEditing(false);
        resolveZip({ variables: { zip: localZip } }).then(({ data }) => {
          if (data?.resolveZip) {
            setZipInfo(data.resolveZip);
            setZipNotFound(false);
          }
        });
      }
    }
  }, [prefsData]);

  const handleLocationQueryChange = (value: string) => {
    setLocationQuery(value);
    setLocationDropdownOpen(true);

    if (/^\d/.test(value)) {
      const digits = value.replace(/\D/g, '').slice(0, 5);
      setZipInput(digits);
      setNeighborhoodInput('');
      setZipInfo(null);
      setZipNotFound(false);
      if (digits.length === 5) {
        resolveZip({ variables: { zip: digits } }).then(({ data }) => {
          if (data?.resolveZip) {
            const info: ZipInfo = data.resolveZip;
            setZipInfo(info);
            setZipNotFound(false);
            setNeighborhoodInput(info.neighborhood ?? '');
            setLocationQuery('');
            setLocationDropdownOpen(false);
            setLocationEditing(false);
          } else {
            setZipNotFound(true);
          }
        });
      }
    } else {
      // Letter input — clear zip, we're picking neighborhood
      setZipInput('');
      setZipInfo(null);
      setZipNotFound(false);
    }
  };

  const handleNeighborhoodComboSelect = (name: string) => {
    setNeighborhoodInput(name);
    setZipInput('');
    setZipInfo(null);
    setZipNotFound(false);
    setLocationQuery('');
    setLocationDropdownOpen(false);
    setLocationEditing(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const hasValidZip = zipInput.length === 5 && !zipNotFound;
    const hasNeighborhood = !!neighborhoodInput;
    if (!hasValidZip && !hasNeighborhood) return;

    await savePreferences({
      variables: {
        zipCode: hasValidZip ? zipInput : null,
        neighborhood: neighborhoodInput || null,
      },
    });

    // Clear anonymous localStorage zip — it's now saved to their account
    if (hasValidZip) localStorage.removeItem('userZip');

    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const canSave = ((zipInput.length === 5 && !zipNotFound) || !!neighborhoodInput) && !zipLooking;

  if (queryLoading) {
    return (
      <div className="max-w-md mx-auto">
        <p className="text-text-secondary">Loading preferences...</p>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto">
      <h1 className="text-xl font-heading font-bold text-text-primary mb-6">Preferences</h1>

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

          {!locationEditing ? (
            /* Summary row */
            <div className="flex items-center justify-between p-3 border border-brand-tertiary rounded-md">
              <span className="text-text-primary text-sm">
                {zipInput && zipInfo
                  ? `${zipInput} · ${zipInfo.city}, ${zipInfo.state}${zipInfo.neighborhood ? ` · ${zipInfo.neighborhood}` : ''}`
                  : neighborhoodInput
                  ? `Near ${neighborhoodInput}`
                  : <span className="text-text-secondary">No location set</span>}
              </span>
              <button
                type="button"
                onClick={() => setLocationEditing(true)}
                className="text-sm text-brand-secondary hover:opacity-80 transition-opacity ml-3 flex-shrink-0"
              >
                Edit
              </button>
            </div>
          ) : (
            /* Edit mode: chips + combobox */
            <div className="space-y-3">
              {/* Neighborhood chips */}
              <div className="flex flex-wrap gap-2">
                {curatedNeighborhoods.map((n) => {
                  const isActive = neighborhoodInput === n.name;
                  return (
                    <button
                      key={n.name}
                      type="button"
                      onClick={() => handleNeighborhoodComboSelect(n.name)}
                      className="text-xs px-3 py-1.5 rounded-full font-medium transition-all border"
                      style={isActive
                        ? { backgroundColor: '#374151', color: 'white', borderColor: '#374151' }
                        : { backgroundColor: 'rgba(255,255,255,0.9)', color: '#374151', borderColor: '#e5e7eb' }}
                    >
                      {n.name}
                    </button>
                  );
                })}
              </div>

              {/* ZIP or neighborhood combobox */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="ZIP or neighborhood..."
                  value={locationQuery}
                  onChange={(e) => handleLocationQueryChange(e.target.value)}
                  onFocus={() => setLocationDropdownOpen(true)}
                  onBlur={() => setTimeout(() => setLocationDropdownOpen(false), 150)}
                  autoFocus
                  className="w-full px-3 py-2 border border-brand-tertiary rounded-md text-text-primary focus:border-brand-secondary outline-none"
                />

                {zipLooking && (
                  <p className="text-text-secondary text-sm mt-1.5">Looking up zip...</p>
                )}

                {!zipLooking && zipInfo && zipInfo.state === 'CO' && !locationDropdownOpen && (
                  <p className="text-text-secondary text-sm mt-1.5">
                    {zipInfo.city}, {zipInfo.state}{zipInfo.neighborhood ? ` · ${zipInfo.neighborhood}` : ''}
                  </p>
                )}

                {!zipLooking && zipInfo && zipInfo.state !== 'CO' && !locationDropdownOpen && (
                  <p className="text-text-secondary text-sm mt-1.5">
                    {zipInfo.city}, {zipInfo.state} — Just a heads up, currently this pilot only covers Denver. We hope to expand soon!
                  </p>
                )}

                {!zipLooking && zipNotFound && (
                  <p className="text-text-secondary text-sm mt-1.5">Zip code not recognized.</p>
                )}

                {locationDropdownOpen && locationSuggestions.length > 0 && (
                  <ul className="absolute left-0 right-0 top-full mt-0.5 bg-bg-primary border border-brand-tertiary rounded-xl shadow-lg overflow-hidden z-20">
                    {locationSuggestions.map((n) => (
                      <li key={n.name}>
                        <button
                          type="button"
                          onMouseDown={() => handleNeighborhoodComboSelect(n.name)}
                          className="w-full text-left px-4 py-2.5 text-sm text-text-primary hover:bg-bg-accent transition-colors"
                        >
                          {n.name}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}
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
