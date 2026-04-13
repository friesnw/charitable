import { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, gql } from '@apollo/client';
import { cloudinaryUrl, pickAndUploadImage } from '../lib/cloudinary';
import { Initials } from '../components/ui/Initials';
import { StreetViewPickerModal } from '../components/StreetViewPickerModal';

// ── Queries & mutations ──────────────────────────────────────────────────────

const GET_ADMIN_CHARITIES = gql`
  query GetAdminCharities {
    charities {
      id name slug logoUrl causeTags isActive isReviewed
      locations { id }
    }
  }
`;

const GET_CAUSES = gql`
  query GetCauses {
    causes { tag label }
  }
`;

const GET_ADMIN_LOCATIONS = gql`
  query GetAdminLocations {
    charities {
      id name slug
      locations {
        id label description address latitude longitude photoUrl isReviewed
      }
    }
  }
`;

const GET_ADMIN_CAUSES = gql`
  query GetAdminCauses {
    causes {
      tag
      label
      charityCount
    }
  }
`;

const UPDATE_CAUSE = gql`
  mutation UpdateCause($tag: String!, $label: String!) {
    updateCause(tag: $tag, label: $label) {
      tag label charityCount
    }
  }
`;

const DELETE_CAUSE = gql`
  mutation DeleteCause($tag: String!) {
    deleteCause(tag: $tag)
  }
`;

const GET_USERS = gql`
  query GetAdminUsers {
    users {
      id
      name
      email
      isAdmin
      createdAt
    }
  }
`;

const CREATE_CHARITY = gql`
  mutation CreateCharity(
    $name: String! $ein: String! $slug: String! $description: String
    $websiteUrl: String $volunteerUrl: String $primaryAddress: String
    $causeTags: [String!] $donateUrl: String $foundedYear: Int
  ) {
    createCharity(
      name: $name ein: $ein slug: $slug description: $description
      websiteUrl: $websiteUrl volunteerUrl: $volunteerUrl primaryAddress: $primaryAddress
      causeTags: $causeTags donateUrl: $donateUrl foundedYear: $foundedYear
    ) {
      id name slug
    }
  }
`;

const UPDATE_CHARITY_REVIEWED = gql`
  mutation UpdateCharityReviewed($id: ID!, $isReviewed: Boolean!) {
    updateCharity(id: $id, isReviewed: $isReviewed) {
      id isReviewed
    }
  }
`;

const UPDATE_LOCATION = gql`
  mutation UpdateCharityLocation(
    $id: ID! $label: String $description: String $address: String
    $latitude: Float $longitude: Float $photoUrl: String
  ) {
    updateCharityLocation(
      id: $id label: $label description: $description address: $address
      latitude: $latitude longitude: $longitude photoUrl: $photoUrl
    ) {
      id label description address latitude longitude photoUrl isReviewed
    }
  }
`;

const UPDATE_LOCATION_REVIEWED = gql`
  mutation UpdateLocationReviewed($id: ID!, $isReviewed: Boolean!) {
    updateCharityLocation(id: $id, isReviewed: $isReviewed) {
      id isReviewed
    }
  }
`;

// ── Types ────────────────────────────────────────────────────────────────────

type Tab = 'charities' | 'locations' | 'cause-tags' | 'users' | 'analytics';

interface CharityRow {
  id: string;
  name: string;
  slug: string;
  logoUrl: string | null;
  causeTags: string[];
  isActive: boolean;
  isReviewed: boolean;
  locations: { id: string }[];
}

interface FlatLocation {
  id: string;
  charityId: string;
  charityName: string;
  charitySlug: string;
  label: string;
  description: string | null;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  photoUrl: string | null;
  isReviewed: boolean;
}

interface LocationForm {
  label: string;
  description: string;
  address: string;
  latitude: string;
  longitude: string;
}

interface CreateForm {
  name: string;
  ein: string;
  slug: string;
  description: string;
  donateUrl: string;
}

const EMPTY_CREATE_FORM: CreateForm = {
  name: '', ein: '', slug: '', description: '', donateUrl: '',
};

// ── Helpers ──────────────────────────────────────────────────────────────────

function slugify(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function initLocForm(loc: FlatLocation): LocationForm {
  return {
    label: loc.label,
    description: loc.description ?? '',
    address: loc.address ?? '',
    latitude: loc.latitude?.toString() ?? '',
    longitude: loc.longitude?.toString() ?? '',
  };
}

// ── Sub-components ───────────────────────────────────────────────────────────

function TabBar({ active, onChange }: { active: Tab; onChange: (t: Tab) => void }) {
  const tabs: { id: Tab; label: string }[] = [
    { id: 'charities', label: 'Charities' },
    { id: 'locations', label: 'Charity Locations' },
    { id: 'cause-tags', label: 'Cause Tags' },
    { id: 'users', label: 'Users' },
    { id: 'analytics', label: 'Analytics' },
  ];
  return (
    <div className="flex gap-1 border-b border-brand-tertiary mb-6">
      {tabs.map(tab => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
            active === tab.id
              ? 'border-brand-primary text-text-primary'
              : 'border-transparent text-text-secondary hover:text-text-primary'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

function LocationsTab() {
  const { data, loading, error } = useQuery(GET_ADMIN_LOCATIONS);
  const [updateLocation] = useMutation(UPDATE_LOCATION, { refetchQueries: ['GetAdminLocations'] });
  const [updateLocationReviewed] = useMutation(UPDATE_LOCATION_REVIEWED, { refetchQueries: ['GetAdminLocations'] });

  const [locSearch, setLocSearch] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [locForms, setLocForms] = useState<Record<string, LocationForm>>({});
  const initialLocForms = useRef<Record<string, LocationForm>>({});
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [savedId, setSavedId] = useState<string | null>(null);
  const [reviewedOverrides, setReviewedOverrides] = useState<Record<string, boolean>>({});
  const [savingReviewed, setSavingReviewed] = useState(false);
  const [locationReviewNote, setLocationReviewNote] = useState<string>(
    () => localStorage.getItem('location-review-note') ?? ''
  );
  const [streetViewPickerId, setStreetViewPickerId] = useState<string | null>(null);

  const flatLocations: FlatLocation[] = (data?.charities ?? []).flatMap(
    (c: { id: string; name: string; slug: string; locations: FlatLocation[] }) =>
      c.locations.map(loc => ({ ...loc, charityId: c.id, charityName: c.name, charitySlug: c.slug }))
  );

  const filtered = flatLocations.filter(loc =>
    loc.label.toLowerCase().includes(locSearch.toLowerCase()) ||
    loc.charityName.toLowerCase().includes(locSearch.toLowerCase()) ||
    (loc.address ?? '').toLowerCase().includes(locSearch.toLowerCase())
  );

  function handleExpand(loc: FlatLocation) {
    if (expandedId === loc.id) {
      setExpandedId(null);
      return;
    }
    setExpandedId(loc.id);
    if (!locForms[loc.id]) {
      const form = initLocForm(loc);
      setLocForms(f => ({ ...f, [loc.id]: form }));
      initialLocForms.current[loc.id] = form;
    }
  }

  async function handleSave(locId: string) {
    const form = locForms[locId];
    if (!form) return;
    setSavingId(locId);
    try {
      await updateLocation({
        variables: {
          id: locId,
          label: form.label,
          description: form.description || null,
          address: form.address || null,
          latitude: form.latitude ? parseFloat(form.latitude) : null,
          longitude: form.longitude ? parseFloat(form.longitude) : null,
        },
      });
      initialLocForms.current = { ...initialLocForms.current, [locId]: form };
      setSavedId(locId);
      setTimeout(() => setSavedId(id => id === locId ? null : id), 2000);
    } finally {
      setSavingId(null);
    }
  }

  async function handleUploadPhoto(locId: string) {
    setUploadingId(locId);
    try {
      const url = await pickAndUploadImage();
      if (url) {
        await updateLocation({ variables: { id: locId, photoUrl: url } });
      }
    } finally {
      setUploadingId(null);
    }
  }

  const isDirty = (locId: string) =>
    JSON.stringify(locForms[locId]) !== JSON.stringify(initialLocForms.current[locId]);

  const reviewedDirtyIds = Object.keys(reviewedOverrides);

  async function handleSaveReviewed() {
    setSavingReviewed(true);
    try {
      await Promise.all(
        reviewedDirtyIds.map(id =>
          updateLocationReviewed({ variables: { id, isReviewed: reviewedOverrides[id] } })
        )
      );
      setReviewedOverrides({});
    } finally {
      setSavingReviewed(false);
    }
  }

  const inputCls = 'w-full px-2 py-1.5 border border-brand-tertiary rounded text-sm text-text-primary focus:border-brand-primary outline-none bg-bg-primary';
  const labelCls = 'block text-xs text-text-secondary mb-0.5';
  const btnCls = 'px-3 py-1.5 text-sm rounded';

  if (loading) return <p className="text-text-secondary text-sm">Loading...</p>;
  if (error) return <p className="text-error text-sm">{error.message}</p>;

  return (
    <div>
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search by charity, label, or address..."
          value={locSearch}
          onChange={e => setLocSearch(e.target.value)}
          className="w-full px-3 py-1.5 border border-brand-tertiary rounded text-sm text-text-primary focus:border-brand-primary outline-none"
        />
      </div>

      <div className="border border-brand-tertiary rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-bg-accent border-b border-brand-tertiary">
            <tr>
              <th className="text-left px-3 py-2 text-text-secondary font-medium">Charity</th>
              <th className="text-left px-3 py-2 text-text-secondary font-medium">Label</th>
              <th className="text-left px-3 py-2 text-text-secondary font-medium hidden md:table-cell">Description</th>
              <th className="text-left px-3 py-2 text-text-secondary font-medium hidden lg:table-cell">Address</th>
              <th className="text-left px-3 py-2 text-text-secondary font-medium hidden xl:table-cell w-28">Lat / Lng</th>
              <th className="text-left px-3 py-2 text-text-secondary font-medium w-16">Photo</th>
              <th className="px-3 py-2 text-text-secondary font-medium w-36 text-center">
                Reviewed
                <textarea
                  rows={2}
                  placeholder="Notes..."
                  value={locationReviewNote}
                  onChange={e => { setLocationReviewNote(e.target.value); localStorage.setItem('location-review-note', e.target.value); }}
                  className="mt-1 w-full px-1.5 py-1 border border-brand-tertiary rounded text-xs text-text-primary focus:border-brand-primary outline-none bg-bg-primary resize-none font-normal block"
                />
              </th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((loc, i) => {
              const expanded = expandedId === loc.id;
              const form = locForms[loc.id];
              return (
                <>
                  <tr
                    key={loc.id}
                    onClick={() => handleExpand(loc)}
                    className={`border-b border-brand-tertiary cursor-pointer transition-colors hover:bg-bg-accent ${
                      expanded ? 'bg-amber-50' : i % 2 === 0 ? 'bg-bg-primary' : 'bg-bg-accent/30'
                    }`}
                  >
                    <td className="px-3 py-2">
                      <Link
                        to={`/admin/charities/${loc.charitySlug}`}
                        onClick={e => e.stopPropagation()}
                        className="text-brand-primary hover:underline text-xs"
                      >
                        {loc.charityName}
                      </Link>
                    </td>
                    <td className="px-3 py-2 font-medium text-text-primary">{loc.label}</td>
                    <td className="px-3 py-2 text-text-secondary hidden md:table-cell max-w-xs">
                      <span className="line-clamp-1">{loc.description ?? '—'}</span>
                    </td>
                    <td className="px-3 py-2 text-text-secondary hidden lg:table-cell">{loc.address ?? '—'}</td>
                    <td className="px-3 py-2 text-text-secondary hidden xl:table-cell font-mono text-xs">
                      {loc.latitude != null ? `${loc.latitude.toFixed(4)}, ${loc.longitude?.toFixed(4)}` : '—'}
                    </td>
                    <td className="px-3 py-2">
                      {loc.photoUrl ? (
                        <img
                          src={cloudinaryUrl(loc.photoUrl, { w: 40, h: 32, fit: 'scale' })}
                          alt=""
                          className="w-10 h-8 object-cover rounded"
                        />
                      ) : (
                        <span className="text-text-secondary text-xs">—</span>
                      )}
                    </td>
                    <td className="px-3 py-2 text-center" onClick={e => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={reviewedOverrides[loc.id] ?? loc.isReviewed}
                        onChange={e => setReviewedOverrides(r => ({ ...r, [loc.id]: e.target.checked }))}
                        className="w-4 h-4 accent-brand-primary cursor-pointer"
                      />
                    </td>
                  </tr>

                  {expanded && form && (
                    <tr key={`${loc.id}-expanded`} className="bg-amber-50 border-b border-brand-tertiary">
                      <td colSpan={7} className="px-4 py-4">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                          <div>
                            <label className={labelCls}>Label</label>
                            <input className={inputCls} value={form.label}
                              onChange={e => setLocForms(f => ({ ...f, [loc.id]: { ...f[loc.id], label: e.target.value } }))} />
                          </div>
                          <div>
                            <label className={labelCls}>Address</label>
                            <input className={inputCls} value={form.address}
                              onChange={e => setLocForms(f => ({ ...f, [loc.id]: { ...f[loc.id], address: e.target.value } }))} />
                          </div>
                          <div>
                            <label className={labelCls}>Latitude</label>
                            <input className={inputCls} type="number" step="any" value={form.latitude}
                              onChange={e => setLocForms(f => ({ ...f, [loc.id]: { ...f[loc.id], latitude: e.target.value } }))} />
                          </div>
                          <div>
                            <label className={labelCls}>Longitude</label>
                            <input className={inputCls} type="number" step="any" value={form.longitude}
                              onChange={e => setLocForms(f => ({ ...f, [loc.id]: { ...f[loc.id], longitude: e.target.value } }))} />
                          </div>
                          <div className="col-span-2 md:col-span-4">
                            <label className={labelCls}>Description</label>
                            <textarea className={inputCls} rows={3} value={form.description}
                              onChange={e => setLocForms(f => ({ ...f, [loc.id]: { ...f[loc.id], description: e.target.value } }))} />
                          </div>
                          <div>
                            <label className={labelCls}>Photo</label>
                            <div className="flex items-center gap-2 mt-1">
                              {loc.photoUrl && (
                                <img
                                  src={cloudinaryUrl(loc.photoUrl, { w: 64, h: 40, fit: 'scale' })}
                                  alt=""
                                  className="h-10 rounded border border-brand-tertiary"
                                />
                              )}
                              <button
                                onClick={e => { e.stopPropagation(); handleUploadPhoto(loc.id); }}
                                disabled={uploadingId === loc.id}
                                className={`${btnCls} border border-brand-tertiary text-text-secondary hover:bg-bg-accent disabled:opacity-50 text-xs`}
                              >
                                {uploadingId === loc.id ? 'Uploading...' : loc.photoUrl ? 'Replace' : 'Upload'}
                              </button>
                              <button
                                onClick={e => { e.stopPropagation(); setStreetViewPickerId(loc.id); }}
                                className={`${btnCls} border border-brand-tertiary text-text-secondary hover:bg-bg-accent text-xs`}
                              >
                                Street View
                              </button>
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={e => { e.stopPropagation(); handleSave(loc.id); }}
                          disabled={!isDirty(loc.id) || savingId === loc.id}
                          className={`${btnCls} bg-brand-secondary text-white hover:opacity-90 disabled:bg-brand-tertiary disabled:text-text-secondary disabled:cursor-not-allowed`}
                        >
                          {savingId === loc.id ? 'Saving...' : 'Save'}
                        </button>
                        {savedId === loc.id && (
                          <span className="text-sm text-green-600">Saved</span>
                        )}
                      </td>
                    </tr>
                  )}
                </>
              );
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="px-3 py-4 text-text-secondary text-center text-sm">
                  No locations found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <p className="text-text-secondary text-xs mt-2">{filtered.length} location{filtered.length !== 1 ? 's' : ''}</p>

      {reviewedDirtyIds.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-3 bg-bg-primary border-t border-brand-tertiary shadow-lg">
          <span className="text-sm text-text-secondary">
            {reviewedDirtyIds.length} location{reviewedDirtyIds.length !== 1 ? 's' : ''} changed
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setReviewedOverrides({})}
              className="px-3 py-1.5 text-sm rounded border border-brand-tertiary text-text-secondary hover:bg-bg-accent"
            >
              Discard
            </button>
            <button
              onClick={handleSaveReviewed}
              disabled={savingReviewed}
              className="px-3 py-1.5 text-sm rounded bg-brand-secondary text-white hover:opacity-90 disabled:opacity-50"
            >
              {savingReviewed ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      )}

      {streetViewPickerId && (() => {
        const loc = flatLocations.find(l => l.id === streetViewPickerId);
        if (!loc) return null;
        return (
          <StreetViewPickerModal
            locationId={loc.id}
            initialAddress={loc.address ?? ''}
            onSaved={() => {
              setStreetViewPickerId(null);
            }}
            onClose={() => setStreetViewPickerId(null)}
          />
        );
      })()}
    </div>
  );
}

function CauseTagsTab() {
  const { data, loading, error } = useQuery(GET_ADMIN_CAUSES);
  const [updateCause] = useMutation(UPDATE_CAUSE, { refetchQueries: ['GetAdminCauses'] });
  const [deleteCause] = useMutation(DELETE_CAUSE, { refetchQueries: ['GetAdminCauses'] });

  const [expandedTag, setExpandedTag] = useState<string | null>(null);
  const [forms, setForms] = useState<Record<string, string>>({});
  const initialForms = useRef<Record<string, string>>({});
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const causes: { tag: string; label: string; charityCount: number }[] = data?.causes ?? [];

  function handleExpand(tag: string, label: string) {
    if (expandedTag === tag) { setExpandedTag(null); return; }
    setExpandedTag(tag);
    setDeleteError(null);
    if (!forms[tag]) {
      setForms(f => ({ ...f, [tag]: label }));
      initialForms.current[tag] = label;
    }
  }

  async function handleSave(tag: string) {
    await updateCause({ variables: { tag, label: forms[tag] } });
    initialForms.current = { ...initialForms.current, [tag]: forms[tag] };
  }

  async function handleDelete(tag: string) {
    setDeleteError(null);
    try {
      await deleteCause({ variables: { tag } });
      setExpandedTag(null);
    } catch (e: unknown) {
      setDeleteError(e instanceof Error ? e.message : 'Delete failed');
    }
  }

  const isDirty = (tag: string) => forms[tag] !== initialForms.current[tag];

  const inputCls = 'w-full px-2 py-1.5 border border-brand-tertiary rounded text-sm text-text-primary focus:border-brand-primary outline-none bg-bg-primary';
  const labelCls = 'block text-xs text-text-secondary mb-0.5';
  const btnCls = 'px-3 py-1.5 text-sm rounded';

  if (loading) return <p className="text-text-secondary text-sm">Loading...</p>;
  if (error) return <p className="text-error text-sm">{error.message}</p>;

  return (
    <div>
      <div className="border border-brand-tertiary rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-bg-accent border-b border-brand-tertiary">
            <tr>
              <th className="text-left px-3 py-2 text-text-secondary font-medium">Tag</th>
              <th className="text-left px-3 py-2 text-text-secondary font-medium">Label</th>
              <th className="text-left px-3 py-2 text-text-secondary font-medium w-28 text-right pr-4">Charities</th>
            </tr>
          </thead>
          <tbody>
            {causes.map((cause, i) => {
              const expanded = expandedTag === cause.tag;
              return (
                <>
                  <tr
                    key={cause.tag}
                    onClick={() => handleExpand(cause.tag, cause.label)}
                    className={`border-b border-brand-tertiary cursor-pointer transition-colors hover:bg-bg-accent ${
                      expanded ? 'bg-amber-50' : i % 2 === 0 ? 'bg-bg-primary' : 'bg-bg-accent/30'
                    }`}
                  >
                    <td className="px-3 py-2 font-mono text-xs text-text-secondary">{cause.tag}</td>
                    <td className="px-3 py-2 font-medium text-text-primary">{cause.label}</td>
                    <td className="px-3 py-2 text-right pr-4 text-text-secondary">{cause.charityCount}</td>
                  </tr>

                  {expanded && (
                    <tr key={`${cause.tag}-expanded`} className="bg-amber-50 border-b border-brand-tertiary">
                      <td colSpan={3} className="px-4 py-4">
                        <div className="grid grid-cols-2 gap-3 mb-3 max-w-lg">
                          <div>
                            <label className={labelCls}>Tag (identifier — read only)</label>
                            <input className={`${inputCls} opacity-50 cursor-not-allowed`} value={cause.tag} readOnly />
                          </div>
                          <div>
                            <label className={labelCls}>Label</label>
                            <input
                              className={inputCls}
                              value={forms[cause.tag] ?? cause.label}
                              onChange={e => setForms(f => ({ ...f, [cause.tag]: e.target.value }))}
                            />
                          </div>
                        </div>
                        {deleteError && <p className="text-error text-xs mb-2">{deleteError}</p>}
                        <div className="flex gap-2">
                          <button
                            onClick={e => { e.stopPropagation(); handleSave(cause.tag); }}
                            disabled={!isDirty(cause.tag)}
                            className={`${btnCls} bg-brand-secondary text-white hover:opacity-90 disabled:bg-brand-tertiary disabled:text-text-secondary disabled:cursor-not-allowed`}
                          >
                            Save
                          </button>
                          <button
                            onClick={e => { e.stopPropagation(); handleDelete(cause.tag); }}
                            disabled={cause.charityCount > 0}
                            title={cause.charityCount > 0 ? `Used by ${cause.charityCount} ${cause.charityCount === 1 ? 'charity' : 'charities'}` : 'Delete tag'}
                            className={`${btnCls} border border-red-300 text-red-600 hover:bg-red-50 disabled:border-brand-tertiary disabled:text-text-secondary disabled:cursor-not-allowed`}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="text-text-secondary text-xs mt-2">{causes.length} cause tag{causes.length !== 1 ? 's' : ''}</p>
    </div>
  );
}

function UsersTab() {
  const { data, loading, error } = useQuery(GET_USERS);
  const users: { id: string; name: string; email: string; isAdmin: boolean; createdAt: string | null }[] =
    data?.users ?? [];

  if (loading) return <p className="text-text-secondary text-sm">Loading...</p>;
  if (error) return <p className="text-error text-sm">{error.message}</p>;

  return (
    <div>
      <div className="border border-brand-tertiary rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-bg-accent border-b border-brand-tertiary">
            <tr>
              <th className="text-left px-3 py-2 text-text-secondary font-medium">Name</th>
              <th className="text-left px-3 py-2 text-text-secondary font-medium">Email</th>
              <th className="text-left px-3 py-2 text-text-secondary font-medium w-20">Role</th>
              <th className="text-left px-3 py-2 text-text-secondary font-medium hidden md:table-cell">Joined</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user, i) => (
              <tr
                key={user.id}
                className={`border-b border-brand-tertiary last:border-0 ${
                  i % 2 === 0 ? 'bg-bg-primary' : 'bg-bg-accent/30'
                }`}
              >
                <td className="px-3 py-2 font-medium text-text-primary">{user.name}</td>
                <td className="px-3 py-2 text-text-secondary">{user.email}</td>
                <td className="px-3 py-2">
                  {user.isAdmin ? (
                    <span className="text-xs px-1.5 py-0.5 rounded bg-amber-100 text-amber-700">Admin</span>
                  ) : (
                    <span className="text-xs px-1.5 py-0.5 rounded bg-bg-accent text-text-secondary">User</span>
                  )}
                </td>
                <td className="px-3 py-2 text-text-secondary hidden md:table-cell">
                  {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '—'}
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td colSpan={4} className="px-3 py-4 text-text-secondary text-center text-sm">
                  No users found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <p className="text-text-secondary text-xs mt-2">{users.length} user{users.length !== 1 ? 's' : ''}</p>
    </div>
  );
}

// ── Analytics tab ────────────────────────────────────────────────────────────

const GET_ANALYTICS = gql`
  query GetAnalyticsOverview {
    analyticsOverview {
      totalEvents
      uniqueVisitors
      eventCounts { eventName count }
      dailyPageViews { date count }
      topCharities { label count }
      topCauseTags { label count }
      topNeighborhoods { label count }
    }
  }
`;

function Bar({ count, max }: { count: number; max: number }) {
  const pct = max > 0 ? Math.round((count / max) * 100) : 0;
  return (
    <div className="flex items-center gap-2 w-full">
      <div className="flex-1 h-2 bg-bg-accent rounded-full overflow-hidden">
        <div className="h-full bg-brand-secondary rounded-full" style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs text-text-secondary w-8 text-right">{count}</span>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="border border-brand-tertiary rounded-lg px-4 py-3">
      <p className="text-xs text-text-secondary">{label}</p>
      <p className="text-2xl font-bold text-text-primary mt-0.5">{value}</p>
    </div>
  );
}

const EVENT_LABELS: Record<string, string> = {
  page_view: 'Page view',
  charity_view: 'Charity view',
  donate_click: 'Donate click',
  volunteer_click: 'Volunteer click',
  website_click: 'Website click',
  map_pin_click: 'Map pin click',
  filter_tag: 'Filter tag',
  onboarding_cause_select: 'Onboarding cause select',
  neighborhood_select: 'Neighborhood select',
  zip_select: 'ZIP select',
  sign_in_start: 'Sign-in start',
  sign_in_complete: 'Sign-in complete',
  account_created: 'Account created',
};

function TopList({ title, items }: { title: string; items: { label: string; count: number }[] }) {
  const max = items[0]?.count ?? 0;
  return (
    <div>
      <h3 className="text-sm font-semibold text-text-primary mb-3">{title}</h3>
      {items.length === 0 ? (
        <p className="text-xs text-text-secondary">No data</p>
      ) : (
        <div className="space-y-2">
          {items.map((item) => (
            <div key={item.label}>
              <div className="flex justify-between mb-0.5">
                <span className="text-xs text-text-primary truncate max-w-[160px]">{item.label}</span>
              </div>
              <Bar count={item.count} max={max} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function AnalyticsTab() {
  const { data, loading, error } = useQuery(GET_ANALYTICS);
  const overview = data?.analyticsOverview;

  if (loading) return <p className="text-text-secondary text-sm">Loading...</p>;
  if (error) return <p className="text-error text-sm">Error: {error.message}</p>;
  if (!overview) return null;

  const pageViews = overview.eventCounts.find((e: { eventName: string; count: number }) => e.eventName === 'page_view')?.count ?? 0;
  const signIns = overview.eventCounts.find((e: { eventName: string; count: number }) => e.eventName === 'sign_in_complete')?.count ?? 0;
  const newAccounts = overview.eventCounts.find((e: { eventName: string; count: number }) => e.eventName === 'account_created')?.count ?? 0;
  const donateClicks = overview.eventCounts.find((e: { eventName: string; count: number }) => e.eventName === 'donate_click')?.count ?? 0;

  // Fill in missing days for the daily chart
  const dailyMap: Record<string, number> = {};
  overview.dailyPageViews.forEach((d: { date: string; count: number }) => { dailyMap[d.date] = d.count; });
  const days: { date: string; count: number }[] = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    days.push({ date: key, count: dailyMap[key] ?? 0 });
  }
  const maxDaily = Math.max(...days.map((d) => d.count), 1);

  return (
    <div className="space-y-8">
      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="Total events (30d)" value={overview.totalEvents} />
        <StatCard label="Page views (30d)" value={pageViews} />
        <StatCard label="Unique visitors (30d)" value={overview.uniqueVisitors} />
        <StatCard label="Donate clicks (30d)" value={donateClicks} />
      </div>

      {/* Daily page views */}
      <div>
        <h3 className="text-sm font-semibold text-text-primary mb-3">Page views — last 14 days</h3>
        <div className="flex items-end gap-1 h-20">
          {days.map((d) => (
            <div key={d.date} className="flex-1 flex flex-col items-center gap-1 group relative">
              <div
                className="w-full bg-brand-secondary rounded-sm"
                style={{ height: `${Math.round((d.count / maxDaily) * 64)}px`, minHeight: d.count > 0 ? '3px' : '0' }}
              />
              <span className="text-[9px] text-text-secondary">{d.date.slice(5)}</span>
              {d.count > 0 && (
                <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[10px] bg-bg-accent border border-brand-tertiary rounded px-1 opacity-0 group-hover:opacity-100 whitespace-nowrap pointer-events-none">
                  {d.count}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Top lists */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <TopList title="Top charities viewed (30d)" items={overview.topCharities} />
        <TopList title="Top cause tags (30d)" items={overview.topCauseTags} />
        <TopList title="Top neighborhoods (30d)" items={overview.topNeighborhoods} />
      </div>

      {/* Event breakdown */}
      <div>
        <h3 className="text-sm font-semibold text-text-primary mb-3">Events by type (30d)</h3>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-brand-tertiary text-left">
              <th className="pb-2 text-xs font-medium text-text-secondary">Event</th>
              <th className="pb-2 text-xs font-medium text-text-secondary text-right">Count</th>
            </tr>
          </thead>
          <tbody>
            {overview.eventCounts.map((e: { eventName: string; count: number }) => (
              <tr key={e.eventName} className="border-b border-brand-tertiary/50">
                <td className="py-1.5 text-text-primary">{EVENT_LABELS[e.eventName] ?? e.eventName}</td>
                <td className="py-1.5 text-text-secondary text-right">{e.count}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Main component ───────────────────────────────────────────────────────────

export function Admin() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>('charities');
  const [adminSearch, setAdminSearch] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createForm, setCreateForm] = useState<CreateForm>(EMPTY_CREATE_FORM);
  const [createError, setCreateError] = useState<string | null>(null);

  const { data, loading, error } = useQuery(GET_ADMIN_CHARITIES);
  const { data: causesData } = useQuery(GET_CAUSES);
  const [createCharity] = useMutation(CREATE_CHARITY, { refetchQueries: ['GetAdminCharities'] });
  const [updateCharityReviewed] = useMutation(UPDATE_CHARITY_REVIEWED, { refetchQueries: ['GetAdminCharities'] });
  const [charityReviewedOverrides, setCharityReviewedOverrides] = useState<Record<string, boolean>>({});
  const [savingCharityReviewed, setSavingCharityReviewed] = useState(false);
  const [charityReviewNote, setCharityReviewNote] = useState<string>(
    () => localStorage.getItem('charity-review-note') ?? ''
  );

  const charities: CharityRow[] = data?.charities ?? [];
  const causes: { tag: string; label: string }[] = causesData?.causes ?? [];

  const filtered = charities.filter(c =>
    c.name.toLowerCase().includes(adminSearch.toLowerCase())
  );

  async function handleCreateCharity() {
    if (!createForm.name || !createForm.ein || !createForm.slug) return;
    setCreateError(null);
    try {
      const result = await createCharity({
        variables: {
          name: createForm.name,
          ein: createForm.ein,
          slug: createForm.slug,
          description: createForm.description || null,
          donateUrl: createForm.donateUrl || null,
        },
      });
      setCreateForm(EMPTY_CREATE_FORM);
      setShowCreateForm(false);
      const slug = result.data?.createCharity?.slug;
      if (slug) navigate(`/admin/charities/${slug}`);
    } catch (e: unknown) {
      setCreateError(e instanceof Error ? e.message : 'Create failed');
    }
  }

  const charityReviewedDirtyIds = Object.keys(charityReviewedOverrides);

  async function handleSaveCharityReviewed() {
    setSavingCharityReviewed(true);
    try {
      await Promise.all(
        charityReviewedDirtyIds.map(id =>
          updateCharityReviewed({ variables: { id, isReviewed: charityReviewedOverrides[id] } })
        )
      );
      setCharityReviewedOverrides({});
    } finally {
      setSavingCharityReviewed(false);
    }
  }

  const inputCls = 'w-full px-2 py-1.5 border border-brand-tertiary rounded text-sm text-text-primary focus:border-brand-primary outline-none bg-bg-primary';
  const labelCls = 'block text-xs text-text-secondary mb-0.5';
  const btnCls = 'px-3 py-1.5 text-sm rounded';

  return (
    <div>
      <h1 className="text-xl font-bold text-text-primary mb-4">Admin</h1>

      <TabBar active={activeTab} onChange={setActiveTab} />

      {/* ── Charities tab ── */}
      {activeTab === 'charities' && (
        <>
          <div className="flex items-center gap-3 mb-4">
            <input
              type="text"
              placeholder="Search charities..."
              value={adminSearch}
              onChange={e => setAdminSearch(e.target.value)}
              className="flex-1 px-3 py-1.5 border border-brand-tertiary rounded text-sm text-text-primary focus:border-brand-primary outline-none"
            />
            <button
              onClick={() => setShowCreateForm(!showCreateForm)}
              className={`${btnCls} bg-brand-secondary text-white hover:opacity-90 flex-shrink-0`}
            >
              + Add Charity
            </button>
          </div>

          {showCreateForm && (
            <div className="mb-4 p-4 border border-brand-tertiary rounded-lg bg-bg-accent space-y-3">
              <h2 className="font-bold text-text-primary text-sm">New Charity</h2>
              {createError && <p className="text-error text-sm">{createError}</p>}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>Name *</label>
                  <input className={inputCls} value={createForm.name}
                    onChange={e => {
                      const name = e.target.value;
                      setCreateForm(f => ({ ...f, name, slug: slugify(name) }));
                    }} />
                </div>
                <div>
                  <label className={labelCls}>EIN *</label>
                  <input className={inputCls} placeholder="XX-XXXXXXX" value={createForm.ein}
                    onChange={e => setCreateForm(f => ({ ...f, ein: e.target.value }))} />
                </div>
                <div>
                  <label className={labelCls}>Slug * (auto-generated)</label>
                  <input className={inputCls} value={createForm.slug}
                    onChange={e => setCreateForm(f => ({ ...f, slug: e.target.value }))} />
                </div>
                <div>
                  <label className={labelCls}>Donate URL</label>
                  <input className={inputCls} value={createForm.donateUrl}
                    onChange={e => setCreateForm(f => ({ ...f, donateUrl: e.target.value }))} />
                </div>
                <div className="col-span-2">
                  <label className={labelCls}>Description</label>
                  <textarea className={inputCls} rows={2} value={createForm.description}
                    onChange={e => setCreateForm(f => ({ ...f, description: e.target.value }))} />
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={handleCreateCharity}
                  disabled={!createForm.name || !createForm.ein || !createForm.slug}
                  className={`${btnCls} bg-brand-secondary text-white hover:opacity-90 disabled:opacity-50`}>
                  Create
                </button>
                <button onClick={() => { setShowCreateForm(false); setCreateForm(EMPTY_CREATE_FORM); }}
                  className={`${btnCls} border border-brand-tertiary text-text-secondary hover:bg-bg-accent`}>
                  Cancel
                </button>
              </div>
            </div>
          )}

          {loading && <p className="text-text-secondary text-sm">Loading...</p>}
          {error && <p className="text-error text-sm">{error.message}</p>}

          <div className="border border-brand-tertiary rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-bg-accent border-b border-brand-tertiary">
                <tr>
                  <th className="text-left px-3 py-2 text-text-secondary font-medium w-16"></th>
                  <th className="text-left px-3 py-2 text-text-secondary font-medium">Name</th>
                  <th className="text-left px-3 py-2 text-text-secondary font-medium hidden md:table-cell">Tags</th>
                  <th className="text-left px-3 py-2 text-text-secondary font-medium w-24 hidden sm:table-cell">Locations</th>
                  <th className="text-left px-3 py-2 text-text-secondary font-medium w-20">Status</th>
                  <th className="px-3 py-2 text-text-secondary font-medium w-36 text-center">
                    Reviewed
                    <textarea
                      rows={2}
                      placeholder="Notes..."
                      value={charityReviewNote}
                      onChange={e => { setCharityReviewNote(e.target.value); localStorage.setItem('charity-review-note', e.target.value); }}
                      className="mt-1 w-full px-1.5 py-1 border border-brand-tertiary rounded text-xs text-text-primary focus:border-brand-primary outline-none bg-bg-primary resize-none font-normal block"
                    />
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((charity, i) => (
                  <tr
                    key={charity.id}
                    onClick={() => navigate(`/admin/charities/${charity.slug}`)}
                    className={`border-b border-brand-tertiary last:border-0 cursor-pointer transition-colors hover:bg-bg-accent ${
                      i % 2 === 0 ? 'bg-bg-primary' : 'bg-bg-accent/30'
                    }`}
                  >
                    <td className="px-3 py-2">
                      {charity.logoUrl ? (
                        <img
                          src={cloudinaryUrl(charity.logoUrl, { w: 40, h: 40, fit: 'fit' })}
                          alt={charity.name}
                          className="w-10 h-10 object-contain rounded-full"
                        />
                      ) : (
                        <Initials name={charity.name} size={40} />
                      )}
                    </td>
                    <td className="px-3 py-2">
                      <div className="font-medium text-text-primary">{charity.name}</div>
                      <div className="text-text-secondary text-xs">{charity.slug}</div>
                    </td>
                    <td className="px-3 py-2 hidden md:table-cell">
                      <div className="flex flex-wrap gap-1">
                        {charity.causeTags.slice(0, 3).map(tag => (
                          <span key={tag} className="text-xs px-1.5 py-0.5 bg-bg-accent text-text-secondary rounded">
                            {causes.find(c => c.tag === tag)?.label ?? tag}
                          </span>
                        ))}
                        {charity.causeTags.length > 3 && (
                          <span className="text-xs text-text-secondary">+{charity.causeTags.length - 3}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-3 py-2 hidden sm:table-cell text-text-secondary">
                      {charity.locations.length}
                    </td>
                    <td className="px-3 py-2">
                      <span className={`text-xs px-1.5 py-0.5 rounded ${
                        charity.isActive ? 'bg-green-100 text-green-700' : 'bg-bg-accent text-text-secondary'
                      }`}>
                        {charity.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-center" onClick={e => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={charityReviewedOverrides[charity.id] ?? charity.isReviewed}
                        onChange={e => setCharityReviewedOverrides(r => ({ ...r, [charity.id]: e.target.checked }))}
                        className="w-4 h-4 accent-brand-primary cursor-pointer"
                      />
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && !loading && (
                  <tr>
                    <td colSpan={6} className="px-3 py-4 text-text-secondary text-center text-sm">
                      No charities found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {charityReviewedDirtyIds.length > 0 && activeTab === 'charities' && (
        <div className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-3 bg-bg-primary border-t border-brand-tertiary shadow-lg">
          <span className="text-sm text-text-secondary">
            {charityReviewedDirtyIds.length} {charityReviewedDirtyIds.length !== 1 ? 'charities' : 'charity'} changed
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setCharityReviewedOverrides({})}
              className="px-3 py-1.5 text-sm rounded border border-brand-tertiary text-text-secondary hover:bg-bg-accent"
            >
              Discard
            </button>
            <button
              onClick={handleSaveCharityReviewed}
              disabled={savingCharityReviewed}
              className="px-3 py-1.5 text-sm rounded bg-brand-secondary text-white hover:opacity-90 disabled:opacity-50"
            >
              {savingCharityReviewed ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      )}

      {/* ── Locations tab ── */}
      {activeTab === 'locations' && <LocationsTab />}

      {/* ── Cause Tags tab ── */}
      {activeTab === 'cause-tags' && <CauseTagsTab />}

      {/* ── Users tab ── */}
      {activeTab === 'users' && <UsersTab />}

      {/* ── Analytics tab ── */}
      {activeTab === 'analytics' && <AnalyticsTab />}
    </div>
  );
}
