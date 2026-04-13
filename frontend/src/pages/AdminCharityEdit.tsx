import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, gql } from '@apollo/client';
import { cloudinaryUrl, pickAndUploadImage, uploadToCloudinary } from '../lib/cloudinary';
import { Initials } from '../components/ui/Initials';
import { Icon, ICON_NAMES } from '../components/ui/Icon';
import { StreetViewPickerModal } from '../components/StreetViewPickerModal';

const GET_ADMIN_CHARITY = gql`
  query GetAdminCharity($slug: String!) {
    charity(slug: $slug) {
      id name slug ein description logoUrl coverPhotoUrl coverPhotoFocalPoint contentPhotoUrl1 contentPhotoUrl2 websiteUrl volunteerUrl
      primaryAddress causeTags donateUrl foundedYear isActive isReviewed approvedByCharity featured
      impact locationDescription programHighlights usageCredit ctaLabel ctaUrl
      locations {
        id label description address latitude longitude photoUrl isReviewed isSublocation displayOrder
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
    $donateUrl: String $foundedYear: Int
    $isActive: Boolean $approvedByCharity: Boolean $featured: Boolean $logoUrl: String $coverPhotoUrl: String $coverPhotoFocalPoint: String
    $contentPhotoUrl1: String $contentPhotoUrl2: String
    $impact: String $locationDescription: String
    $programHighlights: String $usageCredit: String
    $ctaLabel: String $ctaUrl: String
  ) {
    updateCharity(
      id: $id name: $name description: $description websiteUrl: $websiteUrl
      volunteerUrl: $volunteerUrl primaryAddress: $primaryAddress causeTags: $causeTags
      donateUrl: $donateUrl foundedYear: $foundedYear
      isActive: $isActive approvedByCharity: $approvedByCharity featured: $featured logoUrl: $logoUrl coverPhotoUrl: $coverPhotoUrl coverPhotoFocalPoint: $coverPhotoFocalPoint
      contentPhotoUrl1: $contentPhotoUrl1 contentPhotoUrl2: $contentPhotoUrl2
      impact: $impact locationDescription: $locationDescription
      programHighlights: $programHighlights usageCredit: $usageCredit
      ctaLabel: $ctaLabel ctaUrl: $ctaUrl
    ) {
      id name slug ein description logoUrl coverPhotoUrl coverPhotoFocalPoint contentPhotoUrl1 contentPhotoUrl2 websiteUrl volunteerUrl
      primaryAddress causeTags donateUrl foundedYear isActive
      impact locationDescription programHighlights usageCredit ctaLabel ctaUrl
      locations { id label description address latitude longitude photoUrl }
    }
  }
`;

const UPDATE_LOCATION = gql`
  mutation UpdateCharityLocationEdit(
    $id: ID! $label: String $description: String $address: String
    $latitude: Float $longitude: Float $photoUrl: String $isSublocation: Boolean $displayOrder: Int
  ) {
    updateCharityLocation(
      id: $id label: $label description: $description address: $address
      latitude: $latitude longitude: $longitude photoUrl: $photoUrl isSublocation: $isSublocation displayOrder: $displayOrder
    ) {
      id label description address latitude longitude photoUrl isReviewed isSublocation displayOrder
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
  isSublocation: boolean;
  displayOrder: number;
}

interface CharityData {
  id: string;
  name: string;
  slug: string;
  ein: string;
  description: string | null;
  logoUrl: string | null;
  coverPhotoUrl: string | null;
  coverPhotoFocalPoint: string | null;
  contentPhotoUrl1: string | null;
  contentPhotoUrl2: string | null;
  websiteUrl: string | null;
  volunteerUrl: string | null;
  primaryAddress: string | null;
  causeTags: string[];
  donateUrl: string | null;
  foundedYear: number | null;
  impact: string | null;
  locationDescription: string | null;
  programHighlights: string | null;
  usageCredit: string | null;
  ctaLabel: string | null;
  ctaUrl: string | null;
  isActive: boolean;
  isReviewed: boolean;
  approvedByCharity: boolean;
  featured: boolean;
  locations: LocationData[];
}

interface EditForm {
  name: string;
  description: string;
  logoUrl: string | null;
  coverPhotoUrl: string | null;
  coverPhotoFocalPoint: string | null;
  contentPhotoUrl1: string | null;
  contentPhotoUrl2: string | null;
  websiteUrl: string;
  volunteerUrl: string;
  primaryAddress: string;
  foundedYear: string;
  donateUrl: string;
  impact: string;
  locationDescription: string;
  programHighlights: string;
  usageCredit: string;
  ctaLabel: string;
  ctaUrl: string;
  isActive: boolean;
  approvedByCharity: boolean;
  featured: boolean;
  causeTags: string[];
}

interface LocationForm {
  label: string;
  description: string;
  address: string;
  latitude: string;
  longitude: string;
  isSublocation: boolean;
  displayOrder: string;
}

function initEditForm(c: CharityData): EditForm {
  return {
    name: c.name,
    description: c.description ?? '',
    logoUrl: c.logoUrl,
    coverPhotoUrl: c.coverPhotoUrl,
    coverPhotoFocalPoint: c.coverPhotoFocalPoint,
    contentPhotoUrl1: c.contentPhotoUrl1,
    contentPhotoUrl2: c.contentPhotoUrl2,
    websiteUrl: c.websiteUrl ?? '',
    volunteerUrl: c.volunteerUrl ?? '',
    primaryAddress: c.primaryAddress ?? '',
    foundedYear: c.foundedYear?.toString() ?? '',
    donateUrl: c.donateUrl ?? '',
    impact: c.impact ?? '',
    locationDescription: c.locationDescription ?? '',
    programHighlights: c.programHighlights ?? '',
    usageCredit: c.usageCredit ?? '',
    ctaLabel: c.ctaLabel ?? '',
    ctaUrl: c.ctaUrl ?? '',
    isActive: c.isActive,
    approvedByCharity: c.approvedByCharity,
    featured: c.featured,
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
    isSublocation: loc.isSublocation,
    displayOrder: loc.displayOrder.toString(),
  };
}

export function AdminCharityEdit() {
  const { slug } = useParams<{ slug: string }>();

  const { data, loading, error } = useQuery(GET_ADMIN_CHARITY, {
    variables: { slug },
    skip: !slug,
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
  const [newLocForm, setNewLocForm] = useState<LocationForm>({ label: '', description: '', address: '', latitude: '', longitude: '', isSublocation: false, displayOrder: '0' });
  const [uploadingField, setUploadingField] = useState<string | null>(null);
  const [streetViewPickerLocId, setStreetViewPickerLocId] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [showIconRef, setShowIconRef] = useState(false);
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
          logoUrl: editForm.logoUrl,
          websiteUrl: editForm.websiteUrl || null,
          volunteerUrl: editForm.volunteerUrl || null,
          primaryAddress: editForm.primaryAddress || null,
          causeTags: editForm.causeTags,
          donateUrl: editForm.donateUrl || null,
          foundedYear: editForm.foundedYear ? parseInt(editForm.foundedYear) : null,
          isActive: editForm.isActive,
          approvedByCharity: editForm.approvedByCharity,
          featured: editForm.featured,
          coverPhotoUrl: editForm.coverPhotoUrl,
          coverPhotoFocalPoint: editForm.coverPhotoFocalPoint,
          contentPhotoUrl1: editForm.contentPhotoUrl1,
          contentPhotoUrl2: editForm.contentPhotoUrl2,
          impact: editForm.impact || null,
          locationDescription: editForm.locationDescription || null,
          programHighlights: editForm.programHighlights || null,
          usageCredit: editForm.usageCredit || null,
          ctaLabel: editForm.ctaLabel || null,
          ctaUrl: editForm.ctaUrl || null,
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
    setUploadingField('logo');
    try {
      const url = await pickAndUploadImage();
      if (url) {
        setEditForm(f => f && ({ ...f, logoUrl: url }));
      }
    } finally {
      setUploadingField(null);
    }
  }

  async function handleUploadCoverPhoto() {
    setUploadingField('coverPhoto');
    try {
      const url = await pickAndUploadImage();
      if (url) setEditForm(f => f && ({ ...f, coverPhotoUrl: url }));
    } finally {
      setUploadingField(null);
    }
  }

  async function handleUploadContentPhoto(slot: 1 | 2) {
    setUploadingField(`contentPhoto${slot}`);
    try {
      const url = await pickAndUploadImage();
      if (url) setEditForm(f => f && ({ ...f, [`contentPhotoUrl${slot}`]: url }));
    } finally {
      setUploadingField(null);
    }
  }

  async function handleUseFavicon() {
    if (!editForm?.websiteUrl) return;
    setUploadingField('favicon');
    try {
      const domain = new URL(editForm.websiteUrl).hostname;
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/favicon?domain=${encodeURIComponent(domain)}`);
      if (!res.ok) throw new Error('Failed to fetch favicon');
      const blob = await res.blob();
      const file = new File([blob], 'favicon.png', { type: blob.type || 'image/png' });
      const url = await uploadToCloudinary(file);
      setEditForm(f => f && ({ ...f, logoUrl: url }));
    } catch (e) {
      console.error('Favicon fetch failed:', e);
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
          isSublocation: form.isSublocation,
          displayOrder: form.displayOrder !== '' ? parseInt(form.displayOrder, 10) : 0,
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

  async function handleRemoveLocationPhoto(locId: string) {
    await updateLocation({ variables: { id: locId, photoUrl: null } });
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
    setNewLocForm({ label: '', description: '', address: '', latitude: '', longitude: '', isSublocation: false, displayOrder: '0' });
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
            src={cloudinaryUrl(charity.logoUrl, { w: 40, h: 40, fit: 'fit' })}
            alt={charity.name}
            className="w-10 h-10 object-contain rounded-full"
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
          <div>
            <label className={labelCls}>Description</label>
            <textarea className={inputCls} rows={6} value={editForm.description}
              onChange={e => setEditForm(f => f && ({ ...f, description: e.target.value }))} />
          </div>
          <div>
            <label className={labelCls}>Impact <span className="text-text-secondary italic">(markdown — use - for bullet points)</span></label>
            <textarea className={inputCls} rows={6} value={editForm.impact}
              onChange={e => setEditForm(f => f && ({ ...f, impact: e.target.value }))} />
          </div>
          <div>
            <div className="flex items-center gap-1.5 mb-0.5">
              <label className={labelCls + ' mb-0'}>Program Highlights</label>
              <button
                type="button"
                onClick={() => setShowIconRef(v => !v)}
                className="text-text-secondary opacity-50 hover:opacity-100 transition-opacity"
                aria-label="Show icon reference"
              >
                <Icon name="info" className="w-3.5 h-3.5" />
              </button>
            </div>
            {showIconRef && (
              <div className="mb-1.5 p-2 rounded border border-brand-tertiary bg-bg-accent">
                <p className="text-xs text-text-secondary opacity-60 mb-1.5">
                  One highlight per line. Prefix with an icon: <code>(heart)text</code>. Bold a title: <code>**Title** body text</code>. Combine: <code>(heart)**Title** body text</code>.
                </p>
                <div className="flex flex-wrap gap-3">
                  {ICON_NAMES.map((name) => (
                    <span key={name} className="flex items-center gap-1 text-xs text-text-secondary">
                      <Icon name={name} className="w-3.5 h-3.5" />
                      {name}
                    </span>
                  ))}
                </div>
              </div>
            )}
            <textarea
              className={inputCls}
              rows={4}
              value={editForm.programHighlights}
              onChange={e => setEditForm(f => f && ({ ...f, programHighlights: e.target.value }))}
              onKeyDown={e => {
                if ((e.metaKey || e.ctrlKey) && e.key === 'b') {
                  e.preventDefault();
                  const el = e.currentTarget;
                  const start = el.selectionStart;
                  const end = el.selectionEnd;
                  const val = el.value;
                  const selected = val.slice(start, end);
                  const newVal = val.slice(0, start) + `**${selected}**` + val.slice(end);
                  setEditForm(f => f && ({ ...f, programHighlights: newVal }));
                  requestAnimationFrame(() => {
                    el.selectionStart = start + 2;
                    el.selectionEnd = end + 2;
                  });
                }
              }}
            />
            {/* Preview */}
            {editForm.programHighlights && (
              <div className="mt-2 p-2 rounded border border-brand-tertiary bg-bg-accent space-y-1.5">
                {editForm.programHighlights.split('\n').filter(Boolean).map((line, i) => {
                  const iconMatch = line.match(/^\((\w+)\)(.+)$/);
                  const text = iconMatch ? iconMatch[2].trim() : line.replace(/^-\s*/, '').trim();
                  const boldMatch = text.match(/^\*\*(.+?)\*\*\s*(.*)$/);
                  return (
                    <div key={i} className="text-xs text-text-primary">
                      {boldMatch
                        ? <><strong>{boldMatch[1]}</strong>{boldMatch[2] ? ' ' + boldMatch[2] : ''}</>
                        : text}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          <div>
            <label className={labelCls}>Location Description</label>
            <textarea className={inputCls} rows={4} value={editForm.locationDescription}
              onChange={e => setEditForm(f => f && ({ ...f, locationDescription: e.target.value }))} />
          </div>
          <div className="col-span-1 md:col-span-2">
            <label className={labelCls}>Usage Credit</label>
            <textarea className={inputCls} rows={2} value={editForm.usageCredit}
              onChange={e => setEditForm(f => f && ({ ...f, usageCredit: e.target.value }))} />
          </div>
          <div>
            <label className={labelCls}>CTA Label <span className="font-normal text-gray-400">(overrides website button label)</span></label>
            <input className={inputCls} value={editForm.ctaLabel}
              placeholder="e.g. Join a Garden"
              onChange={e => setEditForm(f => f && ({ ...f, ctaLabel: e.target.value }))} />
          </div>
          <div>
            <label className={labelCls}>CTA URL <span className="font-normal text-gray-400">(overrides website button URL)</span></label>
            <input className={inputCls} value={editForm.ctaUrl}
              placeholder="e.g. https://dug.org/gardens/join"
              onChange={e => setEditForm(f => f && ({ ...f, ctaUrl: e.target.value }))} />
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
            <label className={labelCls}>Donate URL</label>
            <input className={inputCls} value={editForm.donateUrl}
              onChange={e => setEditForm(f => f && ({ ...f, donateUrl: e.target.value }))} />
          </div>
        </div>

        {/* Checkboxes */}
        <div className="flex gap-6">
          <label className="flex items-center gap-2 text-sm text-text-primary cursor-pointer">
            <input type="checkbox" checked={editForm.isActive}
              onChange={e => setEditForm(f => f && ({ ...f, isActive: e.target.checked }))} />
            Active
          </label>
          <label className="flex items-center gap-2 text-sm text-text-primary cursor-pointer">
            <input type="checkbox" checked={editForm.approvedByCharity}
              onChange={e => setEditForm(f => f && ({ ...f, approvedByCharity: e.target.checked }))} />
            Approved by Charity
          </label>
          <label className="flex items-center gap-2 text-sm text-text-primary cursor-pointer">
            <input type="checkbox" checked={editForm.featured}
              onChange={e => setEditForm(f => f && ({ ...f, featured: e.target.checked }))} />
            Featured
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
            {editForm.logoUrl ? (
              <img
                src={cloudinaryUrl(editForm.logoUrl, { w: 80, h: 80, fit: 'fit' })}
                alt="Logo"
                className="w-20 h-20 object-contain rounded-full border border-brand-tertiary"
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
            {editForm.logoUrl && (
              <a
                href={editForm.logoUrl}
                download
                target="_blank"
                rel="noopener noreferrer"
                className={`${btnCls} border border-brand-tertiary text-text-secondary hover:bg-bg-accent flex items-center gap-1`}
              >
                <Icon name="download" className="w-3 h-3" />
              </a>
            )}
            {editForm.websiteUrl && (
              <button
                onClick={handleUseFavicon}
                disabled={!!uploadingField}
                className={`${btnCls} border border-brand-tertiary text-text-secondary hover:bg-bg-accent disabled:opacity-50`}
              >
                {uploadingField === 'favicon' ? 'Fetching...' : 'Use favicon'}
              </button>
            )}
          </div>
        </div>

        {/* Photos */}
        <div className="space-y-3">
          <label className={labelCls}>Photos</label>
          <div className="flex flex-wrap gap-4">
            {([
              { key: 'coverPhotoUrl', label: 'Featured Photo', field: 'coverPhoto', upload: handleUploadCoverPhoto },
              { key: 'contentPhotoUrl1', label: 'Content Photo 1', field: 'contentPhoto1', upload: () => handleUploadContentPhoto(1) },
              { key: 'contentPhotoUrl2', label: 'Content Photo 2', field: 'contentPhoto2', upload: () => handleUploadContentPhoto(2) },
            ] as const).map(({ key, label, field, upload }) => (
              <div key={key} className="flex flex-col gap-1.5">
                <span className="text-xs text-text-secondary">{label}</span>
                {editForm[key] ? (
                  <img
                    src={cloudinaryUrl(editForm[key]!, { w: 200, h: 80, fit: 'fill' })}
                    alt={label}
                    className="h-20 w-48 object-cover rounded border border-brand-tertiary"
                  />
                ) : (
                  <div className="h-20 w-48 rounded border border-dashed border-brand-tertiary bg-bg-accent flex items-center justify-center text-xs text-text-secondary">
                    No photo
                  </div>
                )}
                <div className="flex gap-2">
                  <button
                    onClick={upload}
                    disabled={!!uploadingField}
                    className={`${btnCls} border border-brand-tertiary text-text-secondary hover:bg-bg-accent disabled:opacity-50 text-xs`}
                  >
                    {uploadingField === field ? 'Uploading...' : editForm[key] ? 'Replace' : 'Upload'}
                  </button>
                  {editForm[key] && (
                    <a
                      href={editForm[key]!}
                      download
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`${btnCls} border border-brand-tertiary text-text-secondary hover:bg-bg-accent text-xs flex items-center gap-1`}
                    >
                      <Icon name="download" className="w-3 h-3" />
                    </a>
                  )}
                  {editForm[key] && (
                    <button
                      onClick={() => setEditForm(f => f && ({ ...f, [key]: null }))}
                      className={`${btnCls} border border-red-300 text-red-600 hover:bg-red-50 text-xs`}
                    >
                      Remove
                    </button>
                  )}
                </div>
                {key === 'coverPhotoUrl' && (
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-text-secondary">Focal point</span>
                    <select
                      value={editForm.coverPhotoFocalPoint ?? ''}
                      onChange={e => setEditForm(f => f && ({ ...f, coverPhotoFocalPoint: e.target.value || null }))}
                      className="text-xs border border-brand-tertiary rounded px-1.5 py-1 bg-bg-primary text-text-primary outline-none focus:border-brand-primary"
                    >
                      <option value="">Center (default)</option>
                      <option value="left">Left</option>
                      <option value="right">Right</option>
                      <option value="top">Top</option>
                      <option value="bottom">Bottom</option>
                    </select>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Save */}
        {isDirty && (
          <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-brand-tertiary px-6 py-3 flex items-center gap-3 shadow-lg">
            <button onClick={handleSaveCharity}
              disabled={saving}
              className={`${btnCls} bg-brand-secondary text-white hover:opacity-90 disabled:opacity-60`}>
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
            {saved && <span className="text-sm text-green-600">Saved</span>}
            <span className="text-xs text-text-secondary">You have unsaved changes</span>
          </div>
        )}

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
                                <label className={labelCls}>Display Order</label>
                                <input className={inputCls} type="number" value={form.displayOrder}
                                  onChange={e => setLocationForms(f => ({ ...f, [loc.id]: { ...f[loc.id], displayOrder: e.target.value } }))} />
                              </div>
                              <div className="col-span-2 md:col-span-4">
                                <label className="flex items-center gap-2 text-sm text-text-primary cursor-pointer">
                                  <input
                                    type="checkbox"
                                    checked={form.isSublocation}
                                    onChange={e => setLocationForms(f => ({ ...f, [loc.id]: { ...f[loc.id], isSublocation: e.target.checked } }))}
                                  />
                                  Sublocation <span className="text-xs text-text-secondary">(this org operates within another org's space at this address)</span>
                                </label>
                              </div>
                              <div>
                                <label className={labelCls}>Photo</label>
                                <div className="flex items-center gap-2 mt-1">
                                  {loc.photoUrl && (
                                    <img
                                      src={cloudinaryUrl(loc.photoUrl, { w: 480, h: 320, fit: 'scale' })}
                                      alt=""
                                      className="h-36 rounded border border-brand-tertiary"
                                    />
                                  )}
                                  <button
                                    onClick={e => { e.stopPropagation(); handleUploadLocationPhoto(loc.id); }}
                                    disabled={!!uploadingField}
                                    className={`${btnCls} border border-brand-tertiary text-text-secondary hover:bg-bg-accent disabled:opacity-50 text-xs`}
                                  >
                                    {uploadingField === `photo-${loc.id}` ? 'Uploading...' : loc.photoUrl ? 'Replace' : 'Upload'}
                                  </button>
                                  <button
                                    onClick={e => { e.stopPropagation(); setStreetViewPickerLocId(loc.id); }}
                                    className={`${btnCls} border border-brand-tertiary text-text-secondary hover:bg-bg-accent text-xs`}
                                  >
                                    Street View
                                  </button>
                                  {loc.photoUrl && (
                                    <a
                                      href={loc.photoUrl}
                                      download
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      onClick={e => e.stopPropagation()}
                                      className={`${btnCls} border border-brand-tertiary text-text-secondary hover:bg-bg-accent text-xs flex items-center gap-1`}
                                    >
                                      <Icon name="download" className="w-3 h-3" />
                                    </a>
                                  )}
                                  {loc.photoUrl && (
                                    <button
                                      onClick={e => { e.stopPropagation(); handleRemoveLocationPhoto(loc.id); }}
                                      disabled={!!uploadingField}
                                      className={`${btnCls} border border-red-300 text-red-600 hover:bg-red-50 disabled:opacity-50 text-xs`}
                                    >
                                      Remove
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center justify-between mt-1">
                              <button
                                onClick={e => { e.stopPropagation(); handleDeleteLocation(loc.id); }}
                                className={`${btnCls} border border-red-300 text-red-600 hover:bg-red-50`}
                              >
                                Delete location
                              </button>
                              <div className="flex items-center gap-2">
                                {savedLocId === loc.id && (
                                  <span className="text-sm text-green-600">Saved</span>
                                )}
                                <button
                                  onClick={e => { e.stopPropagation(); handleSaveLocation(loc.id); }}
                                  disabled={!isLocationDirty(loc.id) || savingLocId === loc.id}
                                  className={`${btnCls} bg-brand-secondary text-white hover:opacity-90 disabled:bg-brand-tertiary disabled:text-text-secondary disabled:cursor-not-allowed`}
                                >
                                  {savingLocId === loc.id ? 'Saving...' : 'Save'}
                                </button>
                              </div>
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
                  className={`${btnCls} bg-brand-secondary text-white hover:opacity-90 disabled:opacity-50`}>
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

      {streetViewPickerLocId && (() => {
        const loc = charity.locations.find(l => l.id === streetViewPickerLocId);
        if (!loc) return null;
        return (
          <StreetViewPickerModal
            locationId={loc.id}
            initialAddress={loc.address ?? ''}
            onSaved={(photoUrl) => {
              updateLocation({ variables: { id: loc.id, photoUrl } });
              setStreetViewPickerLocId(null);
            }}
            onClose={() => setStreetViewPickerLocId(null)}
          />
        );
      })()}
    </div>
  );
}
