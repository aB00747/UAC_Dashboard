import { useState, useEffect } from 'react';
import { settingsAPI, brandingAPI } from '../../api/core';
import { businessProfileAPI } from '../../api/businessProfile';
import { invoicesAPI } from '../../api/invoices';
import { useAuth } from '../../contexts/AuthContext';
import { useBranding } from '../../contexts/BrandingContext';
import toast from 'react-hot-toast';
import { Save, Plus, Upload, Image, Palette, Building2, FileText, Settings2 } from 'lucide-react';
import { Button } from '../../components/ui';
import { PageHeader, FormField } from '../../components/common';
import { PageSpinner } from '../../components/ui/Spinner';

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

function FileUploadField({ label, preview, onFileSelect, accept = 'image/*' }) {
  return (
    <div>
      <label className="block text-sm font-medium u-text-2 mb-2">{label}</label>
      <div className="flex items-center gap-4">
        {preview ? (
          <img src={preview} alt={label} className="h-16 w-16 rounded-lg object-cover border" style={{ borderColor: 'var(--border)' }} />
        ) : (
          <div className="h-16 w-16 rounded-lg u-bg-subtle flex items-center justify-center">
            <Image className="h-6 w-6 u-text-3" />
          </div>
        )}
        <label className="cursor-pointer flex items-center gap-1.5 px-3 py-2 u-bg-subtle u-text-2 text-sm rounded-lg hover:opacity-90">
          <Upload className="h-4 w-4" /> Upload
          <input type="file" accept={accept} className="hidden" onChange={onFileSelect} />
        </label>
      </div>
    </div>
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

  function handleFile(e, setFile, setPreview) {
    const file = e.target.files?.[0];
    if (file) { setFile(file); setPreview(URL.createObjectURL(file)); }
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
          <FileUploadField label="Logo" preview={logoPreview} onFileSelect={(e) => handleFile(e, setLogoFile, setLogoPreview)} />
          <FileUploadField label="Favicon" preview={faviconPreview} onFileSelect={(e) => handleFile(e, setFaviconFile, setFaviconPreview)} />
          <FileUploadField label="Login Background" preview={loginBgPreview} onFileSelect={(e) => handleFile(e, setLoginBgFile, setLoginBgPreview)} />
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

function BusinessTab({ isAdmin }) {
  const EMPTY = {
    name: '', address: '', email: '', phone: '', website: '',
    gstin: '', pan: '', state: '', state_code: '',
    bank_name: '', account_no: '', ifsc_code: '',
    currency: 'INR', timezone: 'Asia/Kolkata',
    language: 'en', date_format: 'DD/MM/YYYY', logo_base64: '',
  };
  const [form, setForm] = useState(EMPTY);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    businessProfileAPI.get()
      .then(({ data }) => setForm((prev) => ({ ...prev, ...data })))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  function set(field, val) { setForm((prev) => ({ ...prev, [field]: val })); }

  function handleLogoUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => set('logo_base64', reader.result);
    reader.readAsDataURL(file);
  }

  async function handleSave() {
    setSaving(true);
    try {
      await businessProfileAPI.update(form);
      toast.success('Business profile saved');
    } catch { toast.error('Failed to save'); }
    finally { setSaving(false); }
  }

  if (loading) return <PageSpinner />;

  return (
    <div className="u-card p-6 space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField label="Company Name" value={form.name} onChange={(v) => set('name', v)} />
        <FormField label="Email" type="email" value={form.email} onChange={(v) => set('email', v)} />
        <FormField label="Phone" value={form.phone} onChange={(v) => set('phone', v)} />
        <FormField label="Website" value={form.website} onChange={(v) => set('website', v)} />
      </div>
      <div>
        <label className="block text-sm font-medium u-text-2 mb-1">Address</label>
        <textarea
          className="u-input w-full px-3 py-2 rounded-lg text-sm"
          rows={3}
          value={form.address}
          onChange={(e) => set('address', e.target.value)}
        />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <FormField label="GSTIN" value={form.gstin} onChange={(v) => set('gstin', v)} />
        <FormField label="PAN" value={form.pan} onChange={(v) => set('pan', v)} />
        <FormField label="State" value={form.state} onChange={(v) => set('state', v)} />
        <FormField label="State Code" value={form.state_code} onChange={(v) => set('state_code', v)} />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <FormField label="Bank Name" value={form.bank_name} onChange={(v) => set('bank_name', v)} />
        <FormField label="Account No" value={form.account_no} onChange={(v) => set('account_no', v)} />
        <FormField label="IFSC Code" value={form.ifsc_code} onChange={(v) => set('ifsc_code', v)} />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-medium u-text-2 mb-1">Currency</label>
          <select className="u-input w-full px-3 py-2 rounded-lg text-sm" value={form.currency} onChange={(e) => set('currency', e.target.value)}>
            {[['INR','Indian Rupee'],['USD','US Dollar'],['EUR','Euro'],['GBP','British Pound'],['AED','UAE Dirham']].map(([v,l]) => (
              <option key={v} value={v}>{l}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium u-text-2 mb-1">Timezone</label>
          <select className="u-input w-full px-3 py-2 rounded-lg text-sm" value={form.timezone} onChange={(e) => set('timezone', e.target.value)}>
            {['Asia/Kolkata','Asia/Dubai','Europe/London','America/New_York','America/Los_Angeles','UTC'].map((tz) => (
              <option key={tz} value={tz}>{tz}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium u-text-2 mb-1">Language</label>
          <select className="u-input w-full px-3 py-2 rounded-lg text-sm" value={form.language} onChange={(e) => set('language', e.target.value)}>
            <option value="en">English</option>
            <option value="hi">Hindi</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium u-text-2 mb-1">Date Format</label>
          <select className="u-input w-full px-3 py-2 rounded-lg text-sm" value={form.date_format} onChange={(e) => set('date_format', e.target.value)}>
            <option value="DD/MM/YYYY">DD/MM/YYYY</option>
            <option value="MM/DD/YYYY">MM/DD/YYYY</option>
            <option value="YYYY-MM-DD">YYYY-MM-DD</option>
          </select>
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium u-text-2 mb-1">Invoice Logo</label>
        <input type="file" accept="image/*" onChange={handleLogoUpload} className="text-xs u-text-2" />
        {form.logo_base64 && (
          <img src={form.logo_base64} alt="logo" className="mt-2 h-10 object-contain" />
        )}
      </div>
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
