import { useState, useEffect, useRef } from 'react';
import { settingsAPI, brandingAPI } from '../../api/core';
import { businessProfileAPI } from '../../api/businessProfile';
import { invoicesAPI } from '../../api/invoices';
import { useAuth } from '../../contexts/AuthContext';
import { useBranding } from '../../contexts/BrandingContext';
import toast from 'react-hot-toast';
import { Save, Plus, Upload, Image, Palette, Building2, FileText, Settings2, AlertCircle, Crop } from 'lucide-react';
import { Button } from '../../components/ui';
import { PageHeader, FormField } from '../../components/common';
import { PageSpinner } from '../../components/ui/Spinner';
import ImageCropModal from '../../components/common/ImageCropModal';

const PRESET_COLORS = [
  '#6366f1', '#3b82f6', '#10b981', '#f59e0b',
  '#ef4444', '#8b5cf6', '#ec4899', '#0ea5e9',
];

const TABS = [
  { id: 'branding', label: 'Branding', icon: Palette },
  { id: 'business', label: 'Business Info', icon: Building2 },
  { id: 'invoice', label: 'Invoice', icon: FileText },
  { id: 'app', label: 'App Settings', icon: Settings2 },
];

function ColorPicker({ label, value, onChange }) {
  return (
    <div>
      <label className="block text-sm font-medium u-text-2 mb-2">{label}</label>
      <div className="flex items-center gap-2 flex-wrap">
        {PRESET_COLORS.map((color) => (
          <button
            key={color}
            type="button"
            onClick={() => onChange(color)}
            className="w-7 h-7 rounded-full border-2 transition-transform hover:scale-110"
            style={{
              background: color,
              borderColor: value === color ? 'var(--text)' : 'transparent',
            }}
          />
        ))}
        <label className="flex items-center gap-1.5 px-2 py-1 u-bg-subtle rounded-lg text-xs u-text-2 cursor-pointer">
          Custom
          <input
            type="color"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-5 h-5 rounded cursor-pointer border-0 bg-transparent"
          />
        </label>
        <span className="text-xs u-text-3 font-mono">{value}</span>
      </div>
    </div>
  );
}

function FileUploadField({ label, preview, onFileCommit, accept = 'image/*', aspect = 1, cropTitle }) {
  const inputRef = useRef(null);
  const [cropSrc, setCropSrc] = useState(null);   // raw data-URL for crop modal
  const [rawFile, setRawFile] = useState(null);    // original File object

  function handleChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    // Reset input so same file can be re-selected
    e.target.value = '';

    const isSvg = file.type === 'image/svg+xml';
    const reader = new FileReader();
    reader.onload = () => {
      if (isSvg) {
        // SVG: skip crop, commit immediately with a blob URL as preview
        const blob = new Blob([reader.result], { type: 'image/svg+xml' });
        const url = URL.createObjectURL(blob);
        onFileCommit(file, url);
      } else {
        // Raster: open crop modal
        setRawFile(file);
        setCropSrc(reader.result);
      }
    };
    isSvg ? reader.readAsText(file) : reader.readAsDataURL(file);
  }

  function handleCropConfirm(blob, previewUrl) {
    // Convert blob back to a File so FormData upload works
    const croppedFile = new File([blob], rawFile?.name || 'image.png', { type: 'image/png' });
    onFileCommit(croppedFile, previewUrl);
    setCropSrc(null);
    setRawFile(null);
  }

  return (
    <>
      <div>
        <label className="block text-sm font-medium u-text-2 mb-2">{label}</label>
        <div className="flex flex-col items-start gap-3">
          {/* Preview */}
          <div
            className="h-20 w-20 rounded-xl border-2 flex items-center justify-center overflow-hidden u-bg-subtle"
            style={{ borderColor: preview ? 'var(--brand-primary)' : 'var(--border)' }}
          >
            {preview
              ? <img src={preview} alt={label} className="h-full w-full object-cover" />
              : <Image className="h-7 w-7 u-text-3" />
            }
          </div>
          {/* Buttons */}
          <div className="flex gap-2">
            <label className="flex items-center gap-1.5 px-3 py-1.5 u-bg-subtle u-text-2 text-xs rounded-lg hover:opacity-80 cursor-pointer">
              <Upload className="h-3.5 w-3.5" /> Upload
              <input ref={inputRef} type="file" accept={accept} className="hidden" onChange={handleChange} />
            </label>
            {preview && (
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="flex items-center gap-1.5 px-3 py-1.5 u-bg-subtle u-text-2 text-xs rounded-lg hover:opacity-80"
              >
                <Crop className="h-3.5 w-3.5" /> Re-crop
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Crop modal */}
      {cropSrc && (
        <ImageCropModal
          imageSrc={cropSrc}
          aspect={aspect}
          title={cropTitle || `Crop ${label}`}
          onConfirm={handleCropConfirm}
          onCancel={() => { setCropSrc(null); setRawFile(null); }}
        />
      )}
    </>
  );
}

function BrandingTab({ isAdmin }) {
  const {
    systemName: currentSystemName,
    logoUrl: currentLogoUrl,
    faviconUrl: currentFaviconUrl,
    loginBgUrl: currentLoginBgUrl,
    primaryColor: currentPrimary,
    secondaryColor: currentSecondary,
    darkModeDefault: currentDarkMode,
    refreshBranding,
  } = useBranding();

  const [name, setName] = useState('');
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState('');
  const [faviconFile, setFaviconFile] = useState(null);
  const [faviconPreview, setFaviconPreview] = useState('');
  const [loginBgFile, setLoginBgFile] = useState(null);
  const [loginBgPreview, setLoginBgPreview] = useState('');
  const [primaryColor, setPrimaryColor] = useState('#6366f1');
  const [secondaryColor, setSecondaryColor] = useState('#10b981');
  const [darkMode, setDarkMode] = useState('system');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setName(currentSystemName);
    setLogoPreview(currentLogoUrl);
    setFaviconPreview(currentFaviconUrl);
    setLoginBgPreview(currentLoginBgUrl);
    setPrimaryColor(currentPrimary);
    setSecondaryColor(currentSecondary);
    setDarkMode(currentDarkMode);
  }, [currentSystemName, currentLogoUrl, currentFaviconUrl, currentLoginBgUrl, currentPrimary, currentSecondary, currentDarkMode]);

  function handleFile(setFile, setPreview) {
    return (file, previewUrl) => { setFile(file); setPreview(previewUrl); };
  }

  async function handleSave() {
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append('system_name', name);
      formData.append('primary_color', primaryColor);
      formData.append('secondary_color', secondaryColor);
      formData.append('dark_mode_default', darkMode);
      if (logoFile) formData.append('logo', logoFile);
      if (faviconFile) formData.append('favicon', faviconFile);
      if (loginBgFile) formData.append('login_bg', loginBgFile);
      await brandingAPI.update(formData);
      await refreshBranding();
      setLogoFile(null); setFaviconFile(null); setLoginBgFile(null);
      toast.success('Branding updated');
    } catch { toast.error('Failed to update branding'); }
    finally { setSaving(false); }
  }

  if (!isAdmin) {
    return <p className="text-sm u-text-3 text-center py-8">Only admins can edit branding.</p>;
  }

  return (
    <div className="space-y-6">
      <div className="u-card p-6 space-y-5">
        <div>
          <label className="block text-sm font-medium u-text-2 mb-1">Company Display Name</label>
          <input
            type="text"
            className="u-input w-full max-w-md px-3 py-2 rounded-lg text-sm"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <FileUploadField label="Logo" preview={logoPreview} onFileCommit={handleFile(setLogoFile, setLogoPreview)} aspect={1} cropTitle="Crop Logo" />
          <FileUploadField label="Favicon" preview={faviconPreview} onFileCommit={handleFile(setFaviconFile, setFaviconPreview)} aspect={1} cropTitle="Crop Favicon" />
          <FileUploadField label="Login Background" preview={loginBgPreview} onFileCommit={handleFile(setLoginBgFile, setLoginBgPreview)} aspect={16/9} cropTitle="Crop Login Background" />
        </div>
        <ColorPicker label="Primary Color" value={primaryColor} onChange={setPrimaryColor} />
        <ColorPicker label="Secondary Color" value={secondaryColor} onChange={setSecondaryColor} />
        <div>
          <label className="block text-sm font-medium u-text-2 mb-2">Default Theme</label>
          <div className="flex gap-3">
            {['light', 'dark', 'system'].map((mode) => (
              <label key={mode} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="darkMode"
                  value={mode}
                  checked={darkMode === mode}
                  onChange={() => setDarkMode(mode)}
                  className="accent-[var(--brand-primary)]"
                />
                <span className="text-sm u-text capitalize">{mode}</span>
              </label>
            ))}
          </div>
        </div>
        <Button icon={Save} onClick={handleSave} loading={saving}>
          {saving ? 'Saving...' : 'Save Branding'}
        </Button>
      </div>
    </div>
  );
}

// ── Validation rules (mirrors backend) ────────────────────────────────────
const GSTIN_RE = /^\d{2}[A-Z]{5}\d{4}[A-Z][A-Z\d]Z[A-Z\d]$/;
const PAN_RE   = /^[A-Z]{5}\d{4}[A-Z]$/;
const IFSC_RE  = /^[A-Z]{4}0[A-Z0-9]{6}$/;
const PHONE_RE = /^\+?[\d\s\-()]{7,20}$/;
const ACCT_RE  = /^\d{9,18}$/;
const SC_RE    = /^\d{1,2}$/;
const LOGO_MAX = 750_000;

function validateBusinessForm(form) {
  const e = {};
  if (!form.name?.trim())              e.name       = 'Company name is required.';
  else if (form.name.trim().length < 2) e.name      = 'Company name must be at least 2 characters.';

  if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
                                        e.email      = 'Enter a valid email address.';
  if (form.phone && !PHONE_RE.test(form.phone))
                                        e.phone      = 'Use digits, spaces, +, - or ( ) — 7 to 20 characters.';
  if (form.website && !/^https?:\/\/.+/.test(form.website))
                                        e.website    = 'Website must start with http:// or https://';
  if (form.gstin && !GSTIN_RE.test(form.gstin.toUpperCase()))
                                        e.gstin      = 'Invalid GSTIN — expected format: 22AAAAA0000A1Z5';
  if (form.pan && !PAN_RE.test(form.pan.toUpperCase()))
                                        e.pan        = 'Invalid PAN — expected format: ABCDE1234F';
  if (form.state_code && !SC_RE.test(form.state_code))
                                        e.state_code = 'State code must be a 1–2 digit number (e.g. 27).';
  if (form.account_no && !ACCT_RE.test(form.account_no))
                                        e.account_no = 'Account number must be 9–18 digits only.';
  if (form.ifsc_code && !IFSC_RE.test(form.ifsc_code.toUpperCase()))
                                        e.ifsc_code  = 'Invalid IFSC — expected format: SBIN0001234';
  if (form.logo_base64 && form.logo_base64.length > LOGO_MAX)
                                        e.logo_base64 = 'Logo is too large. Maximum size is 500 KB.';
  return e;
}

// ── Field wrapper with inline error ───────────────────────────────────────
function BField({ label, error, required, children }) {
  return (
    <div>
      <label className="block text-sm font-medium u-text-2 mb-1">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
      {error && (
        <p className="flex items-center gap-1 text-xs text-red-500 mt-1">
          <AlertCircle className="h-3 w-3 shrink-0" />{error}
        </p>
      )}
    </div>
  );
}

function inputCls(error) {
  return `u-input w-full px-3 py-2 rounded-lg text-sm ${error ? 'border-red-500 focus:ring-red-400' : ''}`;
}

function BusinessTab({ isAdmin }) {
  const EMPTY = {
    name: '', address: '', email: '', phone: '', website: '',
    gstin: '', pan: '', state: '', state_code: '',
    bank_name: '', account_no: '', ifsc_code: '',
    currency: 'INR', timezone: 'Asia/Kolkata',
    language: 'en', date_format: 'DD/MM/YYYY', logo_base64: '',
  };
  const [form, setForm]       = useState(EMPTY);
  const [errors, setErrors]   = useState({});
  const [touched, setTouched] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);

  useEffect(() => {
    businessProfileAPI.get()
      .then(({ data }) => setForm((prev) => ({ ...prev, ...data })))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  function set(field, val) {
    const updated = { ...form, [field]: val };
    setForm(updated);
    // Live-clear error once user fixes the field
    if (touched[field]) {
      const e = validateBusinessForm(updated);
      setErrors((prev) => ({ ...prev, [field]: e[field] }));
    }
  }

  function touch(field) {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const e = validateBusinessForm(form);
    setErrors((prev) => ({ ...prev, [field]: e[field] }));
  }

  const [logoCropSrc, setLogoCropSrc] = useState(null);

  function handleLogoUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    e.target.value = '';
    if (file.size > 500_000) {
      setErrors((prev) => ({ ...prev, logo_base64: 'Logo is too large. Maximum size is 500 KB.' }));
      setTouched((prev) => ({ ...prev, logo_base64: true }));
      return;
    }
    const isSvg = file.type === 'image/svg+xml';
    const reader = new FileReader();
    reader.onload = () => {
      if (isSvg) {
        set('logo_base64', `data:image/svg+xml;base64,${btoa(reader.result)}`);
        setErrors((prev) => ({ ...prev, logo_base64: undefined }));
      } else {
        setLogoCropSrc(reader.result);
      }
    };
    isSvg ? reader.readAsText(file) : reader.readAsDataURL(file);
  }

  function handleLogoCropConfirm(blob) {
    const reader = new FileReader();
    reader.onload = () => {
      set('logo_base64', reader.result);
      setErrors((prev) => ({ ...prev, logo_base64: undefined }));
    };
    reader.readAsDataURL(blob);
    setLogoCropSrc(null);
  }

  async function handleSave() {
    // Touch all fields so errors show
    const allTouched = Object.fromEntries(Object.keys(EMPTY).map((k) => [k, true]));
    setTouched(allTouched);
    const e = validateBusinessForm(form);
    setErrors(e);
    if (Object.keys(e).length > 0) {
      toast.error('Please fix the errors before saving.');
      return;
    }

    setSaving(true);
    try {
      const payload = { ...form, gstin: form.gstin.toUpperCase(), pan: form.pan.toUpperCase(), ifsc_code: form.ifsc_code.toUpperCase() };
      await businessProfileAPI.update(payload);
      toast.success('Business profile saved');
      setTouched({});
    } catch (err) {
      // Map server-side field errors back to the form
      const serverErrors = err?.response?.data;
      if (serverErrors && typeof serverErrors === 'object') {
        const mapped = {};
        Object.entries(serverErrors).forEach(([field, msgs]) => {
          mapped[field] = Array.isArray(msgs) ? msgs[0] : msgs;
        });
        setErrors(mapped);
        setTouched(allTouched);
        toast.error('Please fix the highlighted errors.');
      } else {
        toast.error('Failed to save. Please try again.');
      }
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <PageSpinner />;

  const E = errors;   // shorthand
  const T = touched;  // show error only if field was touched

  return (
    <div className="u-card p-6 space-y-5">
      {/* Basic info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <BField label="Company Name" error={T.name && E.name} required>
          <input className={inputCls(T.name && E.name)} value={form.name}
            onChange={(e) => set('name', e.target.value)} onBlur={() => touch('name')}
            placeholder="e.g. Shree Chemicals Pvt. Ltd." />
        </BField>
        <BField label="Email" error={T.email && E.email}>
          <input type="email" className={inputCls(T.email && E.email)} value={form.email}
            onChange={(e) => set('email', e.target.value)} onBlur={() => touch('email')}
            placeholder="e.g. info@shreechem.com" />
        </BField>
        <BField label="Phone" error={T.phone && E.phone}>
          <input className={inputCls(T.phone && E.phone)} value={form.phone}
            onChange={(e) => set('phone', e.target.value)} onBlur={() => touch('phone')}
            placeholder="e.g. +91 98765 43210" />
        </BField>
        <BField label="Website" error={T.website && E.website}>
          <input className={inputCls(T.website && E.website)} value={form.website}
            onChange={(e) => set('website', e.target.value)} onBlur={() => touch('website')}
            placeholder="e.g. https://shreechem.com" />
        </BField>
      </div>

      {/* Address */}
      <BField label="Address" error={T.address && E.address}>
        <textarea className={`${inputCls(T.address && E.address)}`} rows={3}
          value={form.address} onChange={(e) => set('address', e.target.value)}
          onBlur={() => touch('address')} placeholder="Full registered address" />
      </BField>

      {/* Tax info */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <BField label="GSTIN" error={T.gstin && E.gstin}>
          <input className={inputCls(T.gstin && E.gstin)} value={form.gstin}
            onChange={(e) => set('gstin', e.target.value.toUpperCase())} onBlur={() => touch('gstin')}
            maxLength={15} placeholder="22AAAAA0000A1Z5" />
        </BField>
        <BField label="PAN" error={T.pan && E.pan}>
          <input className={inputCls(T.pan && E.pan)} value={form.pan}
            onChange={(e) => set('pan', e.target.value.toUpperCase())} onBlur={() => touch('pan')}
            maxLength={10} placeholder="ABCDE1234F" />
        </BField>
        <BField label="State" error={T.state && E.state}>
          <input className={inputCls(T.state && E.state)} value={form.state}
            onChange={(e) => set('state', e.target.value)} onBlur={() => touch('state')}
            placeholder="e.g. Maharashtra" />
        </BField>
        <BField label="State Code" error={T.state_code && E.state_code}>
          <input className={inputCls(T.state_code && E.state_code)} value={form.state_code}
            onChange={(e) => set('state_code', e.target.value)} onBlur={() => touch('state_code')}
            maxLength={2} placeholder="27" />
        </BField>
      </div>

      {/* Bank info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <BField label="Bank Name" error={T.bank_name && E.bank_name}>
          <input className={inputCls(T.bank_name && E.bank_name)} value={form.bank_name}
            onChange={(e) => set('bank_name', e.target.value)} onBlur={() => touch('bank_name')}
            placeholder="e.g. State Bank of India" />
        </BField>
        <BField label="Account No" error={T.account_no && E.account_no}>
          <input className={inputCls(T.account_no && E.account_no)} value={form.account_no}
            onChange={(e) => set('account_no', e.target.value)} onBlur={() => touch('account_no')}
            placeholder="e.g. 123456789012" />
        </BField>
        <BField label="IFSC Code" error={T.ifsc_code && E.ifsc_code}>
          <input className={inputCls(T.ifsc_code && E.ifsc_code)} value={form.ifsc_code}
            onChange={(e) => set('ifsc_code', e.target.value.toUpperCase())} onBlur={() => touch('ifsc_code')}
            maxLength={11} placeholder="SBIN0001234" />
        </BField>
      </div>

      {/* Locale */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <BField label="Currency">
          <select className="u-input w-full px-3 py-2 rounded-lg text-sm" value={form.currency} onChange={(e) => set('currency', e.target.value)}>
            {[['INR','Indian Rupee'],['USD','US Dollar'],['EUR','Euro'],['GBP','British Pound'],['AED','UAE Dirham']].map(([v,l]) => (
              <option key={v} value={v}>{l}</option>
            ))}
          </select>
        </BField>
        <BField label="Timezone">
          <select className="u-input w-full px-3 py-2 rounded-lg text-sm" value={form.timezone} onChange={(e) => set('timezone', e.target.value)}>
            {['Asia/Kolkata','Asia/Dubai','Europe/London','America/New_York','America/Los_Angeles','UTC'].map((tz) => (
              <option key={tz} value={tz}>{tz}</option>
            ))}
          </select>
        </BField>
        <BField label="Language">
          <select className="u-input w-full px-3 py-2 rounded-lg text-sm" value={form.language} onChange={(e) => set('language', e.target.value)}>
            <option value="en">English</option>
            <option value="hi">Hindi</option>
          </select>
        </BField>
        <BField label="Date Format">
          <select className="u-input w-full px-3 py-2 rounded-lg text-sm" value={form.date_format} onChange={(e) => set('date_format', e.target.value)}>
            <option value="DD/MM/YYYY">DD/MM/YYYY</option>
            <option value="MM/DD/YYYY">MM/DD/YYYY</option>
            <option value="YYYY-MM-DD">YYYY-MM-DD</option>
          </select>
        </BField>
      </div>

      {/* Invoice logo */}
      <BField label="Invoice Logo" error={T.logo_base64 && E.logo_base64}>
        <div className="flex flex-col items-start gap-2">
          <div
            className="h-20 w-20 rounded-xl border-2 flex items-center justify-center overflow-hidden u-bg-subtle"
            style={{ borderColor: form.logo_base64 ? 'var(--brand-primary)' : 'var(--border)' }}
          >
            {form.logo_base64
              ? <img src={form.logo_base64} alt="logo" className="h-full w-full object-contain" />
              : <Image className="h-7 w-7 u-text-3" />
            }
          </div>
          <label className="flex items-center gap-1.5 px-3 py-1.5 u-bg-subtle u-text-2 text-xs rounded-lg hover:opacity-80 cursor-pointer">
            <Upload className="h-3.5 w-3.5" /> Upload Logo
            <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
          </label>
          <p className="text-xs u-text-3">Max 500 KB · SVG, PNG, JPG · Used on invoice headers.</p>
        </div>
      </BField>

      {logoCropSrc && (
        <ImageCropModal
          imageSrc={logoCropSrc}
          aspect={3 / 1}
          title="Crop Invoice Logo"
          onConfirm={handleLogoCropConfirm}
          onCancel={() => setLogoCropSrc(null)}
        />
      )}

      {isAdmin && (
        <Button icon={Save} onClick={handleSave} loading={saving}>
          {saving ? 'Saving...' : 'Save Business Info'}
        </Button>
      )}
    </div>
  );
}

function InvoiceTab() {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);

  const EMPTY_PROFILE = {
    name: '', address: '', gstin: '', pan: '', state: 'Maharashtra', state_code: '27',
    email: '', bank_name: '', account_no: '', ifsc_code: '', logo_base64: '', is_default: false,
  };

  useEffect(() => { loadProfiles(); }, []);

  async function loadProfiles() {
    setLoading(true);
    try {
      const { data } = await invoicesAPI.profiles.list();
      setProfiles(data.results || data || []);
    } catch { toast.error('Failed to load profiles'); }
    finally { setLoading(false); }
  }

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing.id) {
        await invoicesAPI.profiles.update(editing.id, editing);
      } else {
        await invoicesAPI.profiles.create(editing);
      }
      toast.success('Profile saved');
      setEditing(null);
      loadProfiles();
    } catch { toast.error('Failed to save profile'); }
    finally { setSaving(false); }
  }

  async function handleDelete(id) {
    if (!confirm('Delete this profile?')) return;
    try {
      await invoicesAPI.profiles.delete(id);
      toast.success('Profile deleted');
      loadProfiles();
    } catch { toast.error('Failed to delete'); }
  }

  function handleLogoUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setEditing((p) => ({ ...p, logo_base64: reader.result }));
    reader.readAsDataURL(file);
  }

  function set(field, val) { setEditing((p) => ({ ...p, [field]: val })); }

  if (loading) return <PageSpinner />;

  if (editing) {
    return (
      <div className="u-card p-6">
        <h3 className="text-sm font-semibold u-text mb-4">{editing.id ? 'Edit Profile' : 'New Invoice Profile'}</h3>
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="Company Name *" value={editing.name} onChange={(v) => set('name', v)} required />
            <FormField label="Email" type="email" value={editing.email} onChange={(v) => set('email', v)} />
          </div>
          <div>
            <label className="block text-sm font-medium u-text-2 mb-1">Address</label>
            <textarea className="u-input w-full px-3 py-2 rounded-lg text-sm" rows={2}
              value={editing.address} onChange={(e) => set('address', e.target.value)} />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <FormField label="GSTIN" value={editing.gstin} onChange={(v) => set('gstin', v)} />
            <FormField label="PAN" value={editing.pan} onChange={(v) => set('pan', v)} />
            <FormField label="State" value={editing.state} onChange={(v) => set('state', v)} />
            <FormField label="State Code" value={editing.state_code} onChange={(v) => set('state_code', v)} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField label="Bank Name" value={editing.bank_name} onChange={(v) => set('bank_name', v)} />
            <FormField label="Account No" value={editing.account_no} onChange={(v) => set('account_no', v)} />
            <FormField label="IFSC Code" value={editing.ifsc_code} onChange={(v) => set('ifsc_code', v)} />
          </div>
          <div>
            <label className="block text-sm font-medium u-text-2 mb-1">Logo</label>
            <input type="file" accept="image/*" onChange={handleLogoUpload} className="text-xs u-text-2" />
            {editing.logo_base64 && <img src={editing.logo_base64} alt="logo" className="mt-2 h-10 object-contain" />}
          </div>
          <label className="flex items-center gap-2 text-sm u-text cursor-pointer">
            <input type="checkbox" checked={editing.is_default} onChange={(e) => set('is_default', e.target.checked)} />
            Set as default profile
          </label>
          <div className="flex gap-3">
            <Button variant="secondary" type="button" onClick={() => setEditing(null)}>Cancel</Button>
            <Button type="submit" loading={saving}>Save Profile</Button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {profiles.map((p) => (
        <div key={p.id} className="u-card flex items-center gap-3 p-4">
          <Building2 className="h-5 w-5 u-text-3 shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <p className="text-sm font-medium u-text truncate">{p.name}</p>
              {p.is_default && <span className="text-xs bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300 px-1.5 rounded">Default</span>}
            </div>
            <p className="text-xs u-text-3 truncate">{p.gstin}</p>
          </div>
          <button onClick={() => setEditing(p)} className="text-xs u-text-brand hover:underline">Edit</button>
          <button onClick={() => handleDelete(p.id)} className="text-xs text-red-400 hover:text-red-600">Delete</button>
        </div>
      ))}
      {profiles.length === 0 && <p className="text-sm u-text-3 text-center py-4">No invoice profiles yet.</p>}
      <Button onClick={() => setEditing({ ...EMPTY_PROFILE })}>+ Add Profile</Button>
    </div>
  );
}

function AppSettingsTab({ isAdmin }) {
  const [settings, setSettings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newKey, setNewKey] = useState('');
  const [newValue, setNewValue] = useState('');
  const [newDesc, setNewDesc] = useState('');

  useEffect(() => { loadSettings(); }, []);

  async function loadSettings() {
    setLoading(true);
    try {
      const { data } = await settingsAPI.list();
      setSettings(data.results || data || []);
    } catch { toast.error('Failed to load settings'); }
    finally { setLoading(false); }
  }

  function updateSetting(key, field, value) {
    setSettings((prev) => prev.map((s) => (s.key === key ? { ...s, [field]: value } : s)));
  }

  async function handleUpdate(setting) {
    try { await settingsAPI.update(setting.key, setting); toast.success('Setting updated'); }
    catch { toast.error('Update failed'); }
  }

  async function handleAdd() {
    if (!newKey.trim()) return toast.error('Key is required');
    try {
      const { default: client } = await import('../../api/client');
      await client.post('/settings/', { key: newKey, value: newValue, description: newDesc });
      toast.success('Setting added');
      setNewKey(''); setNewValue(''); setNewDesc('');
      loadSettings();
    } catch { toast.error('Add failed'); }
  }

  if (loading) return <PageSpinner />;

  return (
    <div className="space-y-6">
      <div className="u-card p-6">
        <h2 className="text-sm font-semibold u-text mb-4">Application Settings</h2>
        <div className="space-y-3">
          {settings.map((s) => (
            <div key={s.key} className="flex items-end gap-4 p-4 u-bg-subtle rounded-lg">
              <div className="flex-1">
                <label className="block text-xs font-medium u-text-3 mb-1">{s.key}</label>
                <input type="text"
                  className="u-input w-full px-3 py-2 rounded-lg text-sm"
                  value={s.value}
                  onChange={(e) => updateSetting(s.key, 'value', e.target.value)}
                  disabled={!isAdmin}
                />
                {s.description && <p className="text-xs u-text-3 opacity-75 mt-1">{s.description}</p>}
              </div>
              {isAdmin && <Button icon={Save} size="sm" onClick={() => handleUpdate(s)}>Save</Button>}
            </div>
          ))}
          {settings.length === 0 && <p className="text-sm u-text-3 text-center py-4">No settings configured</p>}
        </div>
      </div>

      {isAdmin && (
        <div className="u-card p-6">
          <h2 className="text-sm font-semibold u-text mb-4">Add New Setting</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField label="Key" value={newKey} onChange={setNewKey} placeholder="e.g., company_name" />
            <FormField label="Value" value={newValue} onChange={setNewValue} placeholder="e.g., Vardhan ERP" />
            <FormField label="Description" value={newDesc} onChange={setNewDesc} placeholder="Optional description" />
          </div>
          <Button icon={Plus} className="mt-4" onClick={handleAdd}>Add Setting</Button>
        </div>
      )}
    </div>
  );
}

export default function SettingsPage() {
  const { user } = useAuth();
  const isAdmin = user?.role?.name === 'super_admin' || user?.role?.name === 'admin';
  const [activeTab, setActiveTab] = useState('branding');

  return (
    <div className="space-y-6">
      <PageHeader title="Company Settings" />

      <div className="flex gap-1 p-1 u-bg-subtle rounded-xl w-fit">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === id
                ? 'u-bg-surface u-text shadow-sm'
                : 'u-text-3 hover:u-text-2'
            }`}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </div>

      {activeTab === 'branding' && <BrandingTab isAdmin={isAdmin} />}
      {activeTab === 'business' && <BusinessTab isAdmin={isAdmin} />}
      {activeTab === 'invoice' && <InvoiceTab />}
      {activeTab === 'app' && <AppSettingsTab isAdmin={isAdmin} />}
    </div>
  );
}
