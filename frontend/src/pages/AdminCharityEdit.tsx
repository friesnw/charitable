import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, gql } from '@apollo/client';
import { cloudinaryUrl, pickAndUploadImage } from '../lib/cloudinary';

const GET_ADMIN_CHARITY = gql`
  query GetAdminCharity($id: ID!) {
    charity(id: $id) {
      id name slug ein description logoUrl websiteUrl volunteerUrl
      primaryAddress causeTags everyOrgSlug everyOrgClaimed foundedYear isActive
      locations {
        id label description address latitude longitude photoUrl
      }
    }
  }
`;

const GET_CAUSES = gql`
  query GetCauses {
    causes { tag label }
  }
`;

const UPDATE_CHARITY = gql`
  mutation UpdateCharity(
    $id: ID! $name: String $description: String $websiteUrl: String
    $volunteerUrl: String $primaryAddress: String $causeTags: [String!]
    $everyOrgSlug: String $everyOrgClaimed: Boolean $foundedYear: Int
    $isActive: Boolean $logoUrl: String
  ) {
    updateCharity(
      id: $id name: $name description: $description websiteUrl: $websiteUrl
      volunteerUrl: $volunteerUrl primaryAddress: $primaryAddress causeTags: $causeTags
      everyOrgSlug: $everyOrgSlug everyOrgClaimed: $everyOrgClaimed foundedYear: $foundedYear
      isActive: $isActive logoUrl: $logoUrl
    ) {
      id name slug ein description logoUrl websiteUrl volunteerUrl
      primaryAddress causeTags everyOrgSlug everyOrgClaimed foundedYear isActive
      locations { id label description address latitude longitude photoUrl }
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
      id label description address latitude longitude photoUrl
    }
  }
`;

const CREATE_LOCATION = gql`
  mutation CreateCharityLocation(
    $charityId: ID! $label: String! $description: String
    $address: String $latitude: Float $longitude: Float
  ) {
    createCharityLocation(
      charityId: $charityId label: $label description: $description
      address: $address latitude: $latitude longitude: $longitude
    ) {
      id label description address latitude longitude photoUrl
    }
  }
`;

const DELETE_LOCATION = gql`
  mutation DeleteCharityLocation($id: ID!) {
    deleteCharityLocation(id: $id)
  }
`;

interface LocationData {
  id: string;
  label: string;
  description: string | null;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  photoUrl: string | null;
}

interface CharityData {
  id: string;
  name: string;
  slug: string;
  ein: string;
  description: string | null;
  logoUrl: string | null;
  websiteUrl: string | null;
  volunteerUrl: string | null;
  primaryAddress: string | null;
  causeTags: string[];
  everyOrgSlug: string | null;
  everyOrgClaimed: boolean;
  foundedYear: number | null;
  isActive: boolean;
  locations: LocationData[];
}

interface EditForm {
  name: string;
  description: string;
  websiteUrl: string;
  volunteerUrl: string;
  primaryAddress: string;
  foundedYear: string;
  everyOrgSlug: string;
  everyOrgClaimed: boolean;
  isActive: boolean;
  causeTags: string[];
}

interface LocationForm {
  label: string;
  description: string;
  address: string;
  latitude: string;
  longitude: string;
}

function initEditForm(c: CharityData): EditForm {
  return {
    name: c.name,
    description: c.description ?? '',
    websiteUrl: c.websiteUrl ?? '',
    volunteerUrl: c.volunteerUrl ?? '',
    primaryAddress: c.primaryAddress ?? '',
    foundedYear: c.foundedYear?.toString() ?? '',
    everyOrgSlug: c.everyOrgSlug ?? '',
    everyOrgClaimed: c.everyOrgClaimed,
    isActive: c.isActive,
    causeTags: c.causeTags,
  };
}

function initLocationForm(loc: LocationData): LocationForm {
  return {
    label: loc.label,
    description: loc.description ?? '',
    address: loc.address ?? '',
    latitude: loc.latitude?.toString() ?? '',
    longitude: loc.longitude?.toString() ?? '',
  };
}

function Initials({ name, size = 40 }: { name: string; size?: number }) {
  const initials = name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  return (
    <div
      className="flex items-center justify-center rounded bg-bg-accent text-text-secondary text-xs font-bold flex-shrink-0"
      style={{ width: size, height: size }}
    >
      {initials}
    </div>
  );
}

export function AdminCharityEdit() {
  const { id } = useParams<{ id: string }>();

  const { data, loading, error } = useQuery(GET_ADMIN_CHARITY, {
    variables: { id },
    skip: !id,
  });
  const { data: causesData } = useQuery(GET_CAUSES);

  const [updateCharity] = useMutation(UPDATE_CHARITY);
  const [updateLocation] = useMutation(UPDATE_LOCATION, { refetchQueries: ['GetAdminCharity'] });
  const [createLocation] = useMutation(CREATE_LOCATION, { refetchQueries: ['GetAdminCharity'] });
  const [deleteLocation] = useMutation(DELETE_LOCATION, { refetchQueries: ['GetAdminCharity'] });

  const [editForm, setEditForm] = useState<EditForm | null>(null);
  const initialEditForm = useRef<EditForm | null>(null);
  const [locationForms, setLocationForms] = useState<Record<string, LocationForm>>({});
  const initialLocationForms = useRef<Record<string, LocationForm>>({});
  const [expandedLocId, setExpandedLocId] = useState<string | null>(null);
  const [showAddLocation, setShowAddLocation] = useState(false);
  const [newLocForm, setNewLocForm] = useState<LocationForm>({ label: '', description: '', address: '', latitude: '', longitude: '' });
  const [uploadingField, setUploadingField] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [savingLocId, setSavingLocId] = useState<string | null>(null);
  const [savedLocId, setSavedLocId] = useState<string | null>(null);

  const charity: CharityData | null = data?.charity ?? null;
  const causes: { tag: string; label: string }[] = causesData?.causes ?? [];

  useEffect(() => {
    if (charity) {
      const form = initEditForm(charity);
      setEditForm(form);
      initialEditForm.current = form;
      const forms: Record<string, LocationForm> = {};
      charity.locations.forEach(loc => { forms[loc.id] = initLocationForm(loc); });
      setLocationForms(forms);
      initialLocationForms.current = { ...forms };
    }
  }, [data]);

  async function handleSaveCharity() {
    if (!charity || !editForm) return;
    setSaveError(null);
    setSaving(true);
    setSaved(false);
    try {
      await updateCharity({
        variables: {
          id: charity.id,
          name: editForm.name,
          description: editForm.description || null,
          websiteUrl: editForm.websiteUrl || null,
          volunteerUrl: editForm.volunteerUrl || null,
          primaryAddress: editForm.primaryAddress || null,
          causeTags: editForm.causeTags,
          everyOrgSlug: editForm.everyOrgSlug || null,
          everyOrgClaimed: editForm.everyOrgClaimed,
          foundedYear: editForm.foundedYear ? parseInt(editForm.foundedYear) : null,
          isActive: editForm.isActive,
        },
      });
      initialEditForm.current = editForm;
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (e: unknown) {
      setSaveError(e instanceof Error ? e.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  }

  async function handleUploadLogo() {
    if (!charity) return;
    setUploadingField('logo');
    try {
      const url = await pickAndUploadImage();
      if (url) {
        await updateCharity({ variables: { id: charity.id, logoUrl: url } });
      }
    } finally {
      setUploadingField(null);
    }
  }

  async function handleSaveLocation(locId: string) {
    const form = locationForms[locId];
    if (!form) return;
    setSavingLocId(locId);
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
      initialLocationForms.current = { ...initialLocationForms.current, [locId]: form };
      setSavedLocId(locId);
      setTimeout(() => setSavedLocId(id => id === locId ? null : id), 2000);
    } finally {
      setSavingLocId(null);
    }
  }

  async function handleUploadLocationPhoto(locId: string) {
    setUploadingField(`photo-${locId}`);
    try {
      const url = await pickAndUploadImage();
      if (url) {
        await updateLocation({ variables: { id: locId, photoUrl: url } });
      }
    } finally {
      setUploadingField(null);
    }
  }

  async function handleDeleteLocation(locId: string) {
    if (!confirm('Delete this location?')) return;
    await deleteLocation({ variables: { id: locId } });
  }

  async function handleAddLocation() {
    if (!charity || !newLocForm.label) return;
    await createLocation({
      variables: {
        charityId: charity.id,
        label: newLocForm.label,
        description: newLocForm.description || null,
        address: newLocForm.address || null,
        latitude: newLocForm.latitude ? parseFloat(newLocForm.latitude) : null,
        longitude: newLocForm.longitude ? parseFloat(newLocForm.longitude) : null,
      },
    });
    setShowAddLocation(false);
    setNewLocForm({ label: '', description: '', address: '', latitude: '', longitude: '' });
  }

  const isDirty = editForm !== null && JSON.stringify(editForm) !== JSON.stringify(initialEditForm.current);
  const isLocationDirty = (locId: string) =>
    JSON.stringify(locationForms[locId]) !== JSON.stringify(initialLocationForms.current[locId]);

  const inputCls = 'w-full px-2 py-1.5 border border-brand-tertiary rounded text-sm text-text-primary focus:border-brand-primary outline-none bg-bg-primary';
  const labelCls = 'block text-xs text-text-secondary mb-0.5';
  const btnCls = 'px-3 py-1.5 text-sm rounded';

  if (loading) return <p className="text-text-secondary">Loading...</p>;
  if (error) return <p className="text-error">{error.message}</p>;
  if (!charity || !editForm) return <p className="text-text-secondary">Charity not found.</p>;

  return (
    <div>
      <Link to="/admin" className="text-sm text-text-secondary hover:text-text-primary inline-flex items-center gap-1 mb-6">
        ← All charities
      </Link>

      <div className="flex items-center gap-3 mb-6">
        {charity.logoUrl ? (
          <img
            src={cloudinaryUrl(charity.logoUrl, { w: 48, h: 48 })}
            alt={charity.name}
            className="w-12 h-12 object-cover rounded"
          />
        ) : (
          <Initials name={charity.name} size={48} />
        )}
        <div>
          <h1 className="text-xl font-bold text-text-primary">{charity.name}</h1>
          <span className={`text-xs px-1.5 py-0.5 rounded ${
            charity.isActive ? 'bg-green-100 text-green-700' : 'bg-bg-accent text-text-secondary'
          }`}>
            {charity.isActive ? 'Active' : 'Inactive'}
          </span>
        </div>
      </div>

      {saveError && <p className="text-error text-sm mb-4">{saveError}</p>}

      <div className="space-y-6">
        {/* Read-only identifiers */}
        <div className="grid grid-cols-2 gap-3 p-3 bg-bg-accent rounded border border-brand-tertiary">
          <div>
            <span className="text-xs text-text-secondary block mb-0.5">
              EIN <span className="italic">(not editable — legal identifier)</span>
            </span>
            <span className="text-sm text-text-primary font-mono">{charity.ein}</span>
          </div>
          <div>
            <span className="text-xs text-text-secondary block mb-0.5">
              Slug <span className="italic">(not editable — changing breaks URLs)</span>
            </span>
            <span className="text-sm text-text-primary font-mono">{charity.slug}</span>
          </div>
        </div>

        {/* Core fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>Name</label>
            <input className={inputCls} value={editForm.name}
              onChange={e => setEditForm(f => f && ({ ...f, name: e.target.value }))} />
          </div>
          <div>
            <label className={labelCls}>Founded Year</label>
            <input className={inputCls} type="number" value={editForm.foundedYear}
              onChange={e => setEditForm(f => f && ({ ...f, foundedYear: e.target.value }))} />
          </div>
          <div className="col-span-1 md:col-span-2">
            <label className={labelCls}>Description</label>
            <textarea className={inputCls} rows={3} value={editForm.description}
              onChange={e => setEditForm(f => f && ({ ...f, description: e.target.value }))} />
          </div>
          <div>
            <label className={labelCls}>Website URL</label>
            <input className={inputCls} value={editForm.websiteUrl}
              onChange={e => setEditForm(f => f && ({ ...f, websiteUrl: e.target.value }))} />
          </div>
          <div>
            <label className={labelCls}>Volunteer URL</label>
            <input className={inputCls} value={editForm.volunteerUrl}
              onChange={e => setEditForm(f => f && ({ ...f, volunteerUrl: e.target.value }))} />
          </div>
          <div>
            <label className={labelCls}>Primary Address</label>
            <input className={inputCls} value={editForm.primaryAddress}
              onChange={e => setEditForm(f => f && ({ ...f, primaryAddress: e.target.value }))} />
          </div>
          <div>
            <label className={labelCls}>Every.org Slug</label>
            <input className={inputCls} value={editForm.everyOrgSlug}
              onChange={e => setEditForm(f => f && ({ ...f, everyOrgSlug: e.target.value }))} />
          </div>
        </div>

        {/* Checkboxes */}
        <div className="flex gap-6">
          <label className="flex items-center gap-2 text-sm text-text-primary cursor-pointer">
            <input type="checkbox" checked={editForm.everyOrgClaimed}
              onChange={e => setEditForm(f => f && ({ ...f, everyOrgClaimed: e.target.checked }))} />
            Every.org claimed
          </label>
          <label className="flex items-center gap-2 text-sm text-text-primary cursor-pointer">
            <input type="checkbox" checked={editForm.isActive}
              onChange={e => setEditForm(f => f && ({ ...f, isActive: e.target.checked }))} />
            Active
          </label>
        </div>

        {/* Cause tags */}
        <div>
          <label className={labelCls}>Cause Tags</label>
          <div className="flex flex-wrap gap-2 mt-1">
            {causes.map(cause => {
              const active = editForm.causeTags.includes(cause.tag);
              return (
                <button key={cause.tag}
                  onClick={() => setEditForm(f => {
                    if (!f) return f;
                    const tags = active
                      ? f.causeTags.filter(t => t !== cause.tag)
                      : [...f.causeTags, cause.tag];
                    return { ...f, causeTags: tags };
                  })}
                  className={`text-xs px-2 py-1 rounded ${
                    active ? 'bg-brand-accent text-white' : 'bg-bg-accent text-text-secondary hover:bg-brand-tertiary'
                  }`}
                >
                  {cause.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Logo */}
        <div>
          <label className={labelCls}>Logo</label>
          <div className="flex items-center gap-3 mt-1">
            {charity.logoUrl ? (
              <img
                src={cloudinaryUrl(charity.logoUrl, { w: 64, h: 64 })}
                alt="Logo"
                className="w-16 h-16 object-cover rounded border border-brand-tertiary"
              />
            ) : (
              <Initials name={charity.name} size={64} />
            )}
            <button
              onClick={handleUploadLogo}
              disabled={uploadingField === 'logo'}
              className={`${btnCls} border border-brand-tertiary text-text-secondary hover:bg-bg-accent disabled:opacity-50`}
            >
              {uploadingField === 'logo' ? 'Uploading...' : 'Upload logo'}
            </button>
          </div>
        </div>

        {/* Save */}
        <div className="flex items-center gap-3">
          <button onClick={handleSaveCharity}
            disabled={!isDirty || saving}
            className={`${btnCls} bg-brand-primary text-white hover:opacity-90 disabled:bg-brand-tertiary disabled:text-text-secondary disabled:cursor-not-allowed`}>
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
          {saved && <span className="text-sm text-green-600">Saved</span>}
        </div>

        {/* Locations */}
        <div className="pt-4">
          <h3 className="font-bold text-text-primary mb-3">Locations</h3>

          <div className="border border-brand-tertiary rounded-lg overflow-hidden mb-3">
            <table className="w-full text-sm">
              <thead className="bg-bg-accent border-b border-brand-tertiary">
                <tr>
                  <th className="text-left px-3 py-2 text-text-secondary font-medium">Label</th>
                  <th className="text-left px-3 py-2 text-text-secondary font-medium hidden md:table-cell">Description</th>
                  <th className="text-left px-3 py-2 text-text-secondary font-medium hidden lg:table-cell">Address</th>
                  <th className="text-left px-3 py-2 text-text-secondary font-medium hidden xl:table-cell w-28">Lat / Lng</th>
                  <th className="text-left px-3 py-2 text-text-secondary font-medium w-16">Photo</th>
                </tr>
              </thead>
              <tbody>
                {charity.locations.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-3 py-4 text-text-secondary text-center text-sm">
                      No locations yet.
                    </td>
                  </tr>
                )}
                {charity.locations.map((loc, i) => {
                  const expanded = expandedLocId === loc.id;
                  const form = locationForms[loc.id];
                  if (!form) return null;
                  return (
                    <>
                      <tr
                        key={loc.id}
                        onClick={() => setExpandedLocId(expanded ? null : loc.id)}
                        className={`border-b border-brand-tertiary cursor-pointer transition-colors hover:bg-bg-accent ${
                          expanded ? 'bg-amber-50' : i % 2 === 0 ? 'bg-bg-primary' : 'bg-bg-accent/30'
                        }`}
                      >
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
                      </tr>

                      {expanded && (
                        <tr key={`${loc.id}-expanded`} className="bg-amber-50 border-b border-brand-tertiary">
                          <td colSpan={5} className="px-4 py-4">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                              <div>
                                <label className={labelCls}>Label</label>
                                <input className={inputCls} value={form.label}
                                  onChange={e => setLocationForms(f => ({ ...f, [loc.id]: { ...f[loc.id], label: e.target.value } }))} />
                              </div>
                              <div>
                                <label className={labelCls}>Address</label>
                                <input className={inputCls} value={form.address}
                                  onChange={e => setLocationForms(f => ({ ...f, [loc.id]: { ...f[loc.id], address: e.target.value } }))} />
                              </div>
                              <div>
                                <label className={labelCls}>Latitude</label>
                                <input className={inputCls} type="number" step="any" value={form.latitude}
                                  onChange={e => setLocationForms(f => ({ ...f, [loc.id]: { ...f[loc.id], latitude: e.target.value } }))} />
                              </div>
                              <div>
                                <label className={labelCls}>Longitude</label>
                                <input className={inputCls} type="number" step="any" value={form.longitude}
                                  onChange={e => setLocationForms(f => ({ ...f, [loc.id]: { ...f[loc.id], longitude: e.target.value } }))} />
                              </div>
                              <div className="col-span-2 md:col-span-4">
                                <label className={labelCls}>Description</label>
                                <textarea className={inputCls} rows={3} value={form.description}
                                  onChange={e => setLocationForms(f => ({ ...f, [loc.id]: { ...f[loc.id], description: e.target.value } }))} />
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
                                    onClick={e => { e.stopPropagation(); handleUploadLocationPhoto(loc.id); }}
                                    disabled={uploadingField === `photo-${loc.id}`}
                                    className={`${btnCls} border border-brand-tertiary text-text-secondary hover:bg-bg-accent disabled:opacity-50 text-xs`}
                                  >
                                    {uploadingField === `photo-${loc.id}` ? 'Uploading...' : loc.photoUrl ? 'Replace' : 'Upload'}
                                  </button>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={e => { e.stopPropagation(); handleSaveLocation(loc.id); }}
                                disabled={!isLocationDirty(loc.id) || savingLocId === loc.id}
                                className={`${btnCls} bg-brand-primary text-white hover:opacity-90 disabled:bg-brand-tertiary disabled:text-text-secondary disabled:cursor-not-allowed`}
                              >
                                {savingLocId === loc.id ? 'Saving...' : 'Save'}
                              </button>
                              {savedLocId === loc.id && (
                                <span className="text-sm text-green-600">Saved</span>
                              )}
                              <button
                                onClick={e => { e.stopPropagation(); handleDeleteLocation(loc.id); }}
                                className={`${btnCls} border border-red-300 text-red-600 hover:bg-red-50`}
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

          {/* Add location */}
          {showAddLocation ? (
            <div className="border border-brand-tertiary border-dashed rounded-lg p-4 space-y-3">
              <h4 className="text-sm font-medium text-text-primary">New Location</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div>
                  <label className={labelCls}>Label *</label>
                  <input className={inputCls} value={newLocForm.label}
                    onChange={e => setNewLocForm(f => ({ ...f, label: e.target.value }))} />
                </div>
                <div>
                  <label className={labelCls}>Address</label>
                  <input className={inputCls} value={newLocForm.address}
                    onChange={e => setNewLocForm(f => ({ ...f, address: e.target.value }))} />
                </div>
                <div>
                  <label className={labelCls}>Latitude</label>
                  <input className={inputCls} type="number" step="any" value={newLocForm.latitude}
                    onChange={e => setNewLocForm(f => ({ ...f, latitude: e.target.value }))} />
                </div>
                <div>
                  <label className={labelCls}>Longitude</label>
                  <input className={inputCls} type="number" step="any" value={newLocForm.longitude}
                    onChange={e => setNewLocForm(f => ({ ...f, longitude: e.target.value }))} />
                </div>
                <div className="col-span-2 md:col-span-4">
                  <label className={labelCls}>Description</label>
                  <textarea className={inputCls} rows={2} value={newLocForm.description}
                    onChange={e => setNewLocForm(f => ({ ...f, description: e.target.value }))} />
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={handleAddLocation}
                  disabled={!newLocForm.label}
                  className={`${btnCls} bg-brand-primary text-white hover:opacity-90 disabled:opacity-50`}>
                  Add
                </button>
                <button onClick={() => setShowAddLocation(false)}
                  className={`${btnCls} border border-brand-tertiary text-text-secondary hover:bg-bg-accent`}>
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button onClick={() => setShowAddLocation(true)}
              className="text-sm text-brand-primary hover:underline">
              + Add location
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
