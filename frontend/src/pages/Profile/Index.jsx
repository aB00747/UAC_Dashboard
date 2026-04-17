import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { authAPI } from '../../api/auth';
import toast from 'react-hot-toast';
import { User, Save, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui';
import { FormField } from '../../components/common';

export default function Profile() {
  const { user, updateUser, logout } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || '',
  });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await authAPI.updateProfile(form);
      updateUser(data);
      toast.success('Profile updated');
    } catch (err) {
      toast.error(err.response?.data ? Object.values(err.response.data).flat().join(', ') : 'Update failed');
    } finally { setSaving(false); }
  }

  async function handleDelete() {
    if (!globalThis.confirm('Are you sure you want to delete your account? This cannot be undone.')) return;
    setDeleting(true);
    try {
      await authAPI.deleteProfile();
      await logout();
      navigate('/login');
      toast.success('Account deleted');
    } catch { toast.error('Delete failed'); }
    finally { setDeleting(false); }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="u-heading u-heading-lg u-text">Profile</h1>

      <div className="u-card p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="h-16 w-16 u-bg-brand-light rounded-full flex items-center justify-center">
            <User className="h-8 w-8 u-text-brand" />
          </div>
          <div>
            <h2 className="u-heading u-heading-sm u-text">
              {user?.first_name} {user?.last_name}
            </h2>
            <p className="text-sm u-text-3">@{user?.username} - {user?.role?.label}</p>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <FormField label="First Name" value={form.first_name} onChange={(v) => setForm({ ...form, first_name: v })} />
            <FormField label="Last Name" value={form.last_name} onChange={(v) => setForm({ ...form, last_name: v })} />
          </div>
          <FormField label="Email" type="email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} />
          <FormField label="Phone" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} />
          <div>
            <label htmlFor="address" className="block text-sm font-medium u-text-2 mb-1">Address</label>
            <textarea
              id="address"
              rows={3}
              className="u-input w-full px-3 py-2 text-sm rounded-lg"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
            />
          </div>
          <div className="flex justify-end">
            <Button type="submit" icon={Save} loading={saving}>
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </div>

      <div className="u-card p-6" style={{ borderColor: 'var(--red-border)' }}>
        <h2 className="u-heading u-heading-sm mb-2" style={{ color: 'var(--red-text)' }}>Danger Zone</h2>
        <p className="text-sm u-text-3 mb-4">
          Once you delete your account, there is no going back. Please be certain.
        </p>
        <Button variant="danger" icon={Trash2} onClick={handleDelete} loading={deleting}>
          {deleting ? 'Deleting...' : 'Delete Account'}
        </Button>
      </div>
    </div>
  );
}
