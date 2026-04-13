import { useState, useEffect } from 'react';
import { useMutation, gql } from '@apollo/client';

const SAVE_STREET_VIEW_PHOTO = gql`
  mutation SaveStreetViewPhoto($locationId: ID!, $address: String!, $heading: Float!, $pitch: Float) {
    saveStreetViewPhoto(locationId: $locationId, address: $address, heading: $heading, pitch: $pitch) {
      id photoUrl
    }
  }
`;

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

const DIRECTIONS: { label: string; heading: number; gridRow: number; gridCol: number }[] = [
  { label: 'NW', heading: 315, gridRow: 1, gridCol: 1 },
  { label: 'N',  heading: 0,   gridRow: 1, gridCol: 2 },
  { label: 'NE', heading: 45,  gridRow: 1, gridCol: 3 },
  { label: 'W',  heading: 270, gridRow: 2, gridCol: 1 },
  { label: 'E',  heading: 90,  gridRow: 2, gridCol: 3 },
  { label: 'SW', heading: 225, gridRow: 3, gridCol: 1 },
  { label: 'S',  heading: 180, gridRow: 3, gridCol: 2 },
  { label: 'SE', heading: 135, gridRow: 3, gridCol: 3 },
];

// Fetches preview via JS (avoids ORB blocking of <img src> cross-origin requests)
function DirectionThumbnail({
  address,
  heading,
  label,
  selected,
  onClick,
}: {
  address: string;
  heading: number;
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let active = true;
    let objectUrl: string | null = null;
    setBlobUrl(null);
    setFailed(false);

    const params = new URLSearchParams({ address, heading: heading.toString(), pitch: '0' });
    fetch(`${API_URL}/api/street-view-preview?${params}`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.blob();
      })
      .then((blob) => {
        if (!active) return;
        objectUrl = URL.createObjectURL(blob);
        setBlobUrl(objectUrl);
      })
      .catch(() => { if (active) setFailed(true); });

    return () => {
      active = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [address, heading]);

  return (
    <button
      onClick={onClick}
      className={`relative rounded overflow-hidden border-2 transition-colors ${
        selected ? 'border-brand-primary' : 'border-transparent hover:border-brand-secondary'
      }`}
    >
      {blobUrl ? (
        <img src={blobUrl} alt={`${label} view`} className="w-full aspect-video object-cover block" />
      ) : (
        <div className="w-full aspect-video bg-bg-accent flex items-center justify-center">
          <span className="text-xs text-text-secondary">{failed ? '—' : '…'}</span>
        </div>
      )}
      <span className="absolute bottom-0 left-0 right-0 text-center text-xs font-medium text-white bg-black/40 py-0.5">
        {label}
      </span>
    </button>
  );
}

interface Props {
  locationId: string;
  initialAddress: string;
  onSaved: (photoUrl: string) => void;
  onClose: () => void;
}

export function StreetViewPickerModal({ locationId, initialAddress, onSaved, onClose }: Props) {
  const [address, setAddress] = useState(initialAddress);
  const [submittedAddress, setSubmittedAddress] = useState(initialAddress);
  const [selectedHeading, setSelectedHeading] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [savePhoto] = useMutation(SAVE_STREET_VIEW_PHOTO);

  function commitAddress() {
    const trimmed = address.trim();
    if (trimmed && trimmed !== submittedAddress) {
      setSubmittedAddress(trimmed);
      setSelectedHeading(null);
    }
  }

  async function handleSave() {
    if (selectedHeading === null) return;
    setSaving(true);
    setError(null);
    try {
      const result = await savePhoto({
        variables: { locationId, address: submittedAddress, heading: selectedHeading, pitch: 0 },
      });
      const photoUrl = result.data?.saveStreetViewPhoto?.photoUrl;
      if (photoUrl) onSaved(photoUrl);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save photo');
    } finally {
      setSaving(false);
    }
  }

  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') onClose(); }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-bg-primary border border-brand-tertiary rounded-lg shadow-xl w-full max-w-xl mx-4 p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-text-primary">Pick Street View Photo</h2>
          <button
            onClick={onClose}
            className="text-text-secondary hover:text-text-primary text-lg leading-none"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <div className="mb-4">
          <label className="block text-xs text-text-secondary mb-1">
            Address for photo lookup (not saved to the app)
          </label>
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            onBlur={commitAddress}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); commitAddress(); } }}
            className="w-full px-2 py-1.5 border border-brand-tertiary rounded text-sm text-text-primary focus:border-brand-primary outline-none bg-bg-primary"
            placeholder="e.g. 123 Main St, Denver, CO"
          />
        </div>

        {/* 3×3 compass grid */}
        <div
          className="grid gap-1 mb-4"
          style={{ gridTemplateColumns: 'repeat(3, 1fr)', gridTemplateRows: 'repeat(3, 1fr)' }}
        >
          {DIRECTIONS.map((dir) => (
            <div key={dir.label} style={{ gridRow: dir.gridRow, gridColumn: dir.gridCol }}>
              <DirectionThumbnail
                address={submittedAddress}
                heading={dir.heading}
                label={dir.label}
                selected={selectedHeading === dir.heading}
                onClick={() => setSelectedHeading(dir.heading)}
              />
            </div>
          ))}

          <div
            style={{ gridRow: 2, gridColumn: 2 }}
            className="rounded bg-bg-accent border border-brand-tertiary flex items-center justify-center aspect-video"
          >
            <span className="text-xs text-text-secondary">You</span>
          </div>
        </div>

        {error && <p className="text-xs text-red-500 mb-3">{error}</p>}

        <div className="flex items-center justify-between">
          <p className="text-xs text-text-secondary">
            {selectedHeading !== null
              ? `Selected: ${DIRECTIONS.find((d) => d.heading === selectedHeading)?.label}`
              : 'Click a direction to select it'}
          </p>
          <button
            onClick={handleSave}
            disabled={selectedHeading === null || saving}
            className="px-4 py-1.5 text-sm rounded bg-brand-secondary text-white hover:opacity-90 disabled:bg-brand-tertiary disabled:text-text-secondary disabled:cursor-not-allowed"
          >
            {saving ? 'Saving...' : 'Save as Photo'}
          </button>
        </div>
      </div>
    </div>
  );
}
