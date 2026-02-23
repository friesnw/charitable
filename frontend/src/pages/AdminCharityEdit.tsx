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
  const [showAddLocation, setShowAddLocation] = useState(false);
  const [newLocForm, setNewLocForm] = useState<LocationForm>({ label: '', description: '', address: '', latitude: '', longitude: '' });
  const [uploadingField, setUploadingField] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

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
    } catch (e: unknown) {
      setSaveError(e instanceof Error ? e.message : 'Save failed');
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
        <button onClick={handleSaveCharity}
          disabled={!isDirty}
          className={`${btnCls} bg-brand-primary text-white hover:opacity-90 disabled:bg-brand-tertiary disabled:text-text-secondary disabled:cursor-not-allowed`}>
          Save Changes
        </button>

        {/* Locations */}
        <div>
          <h3 className="font-bold text-text-primary mb-3">Locations</h3>
          <div className="space-y-4">
            {charity.locations.map(loc => {
              const form = locationForms[loc.id];
              if (!form) return null;
              return (
                <div key={loc.id} className="border border-brand-tertiary rounded-lg p-4 space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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
                    <div className="col-span-1 md:col-span-2">
                      <label className={labelCls}>Description</label>
                      <input className={inputCls} value={form.description}
                        onChange={e => setLocationForms(f => ({ ...f, [loc.id]: { ...f[loc.id], description: e.target.value } }))} />
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
                  </div>

                  {/* Location photo */}
                  <div className="flex items-center gap-3">
                    {loc.photoUrl ? (
                      <img
                        src={cloudinaryUrl(loc.photoUrl, { w: 96, h: 64, fit: 'scale' })}
                        alt="Location"
                        className="h-16 w-24 object-cover rounded border border-brand-tertiary"
                      />
                    ) : (
                      <div className="h-16 w-24 bg-bg-accent rounded border border-brand-tertiary flex items-center justify-center text-text-secondary text-xs">
                        No photo
                      </div>
                    )}
                    <button
                      onClick={() => handleUploadLocationPhoto(loc.id)}
                      disabled={uploadingField === `photo-${loc.id}`}
                      className={`${btnCls} border border-brand-tertiary text-text-secondary hover:bg-bg-accent disabled:opacity-50 text-xs`}
                    >
                      {uploadingField === `photo-${loc.id}` ? 'Uploading...' : 'Upload photo'}
                    </button>
                  </div>

                  <div className="flex gap-2">
                    <button onClick={() => handleSaveLocation(loc.id)}
                      disabled={!isLocationDirty(loc.id)}
                      className={`${btnCls} bg-brand-primary text-white hover:opacity-90 disabled:bg-brand-tertiary disabled:text-text-secondary disabled:cursor-not-allowed`}>
                      Save
                    </button>
                    <button onClick={() => handleDeleteLocation(loc.id)}
                      className={`${btnCls} border border-brand-tertiary text-error hover:bg-bg-accent`}>
                      Delete
                    </button>
                  </div>
                </div>
              );
            })}

            {/* Add location */}
            {showAddLocation ? (
              <div className="border border-brand-tertiary border-dashed rounded-lg p-4 space-y-3">
                <h4 className="text-sm font-medium text-text-primary">New Location</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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
                  <div className="col-span-1 md:col-span-2">
                    <label className={labelCls}>Description</label>
                    <input className={inputCls} value={newLocForm.description}
                      onChange={e => setNewLocForm(f => ({ ...f, description: e.target.value }))} />
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
    </div>
  );
}
