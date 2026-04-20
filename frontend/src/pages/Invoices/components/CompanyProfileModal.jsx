import { useState } from 'react';
import { Button, Modal } from '../../../components/ui';
import { FormField } from '../../../components/common';
import { invoicesAPI } from '../../../api/invoices';
import { Building2, Trash2, Star } from 'lucide-react';
import toast from 'react-hot-toast';

const EMPTY = {
  name: '', address: '', gstin: '', pan: '', state: 'Maharashtra', state_code: '27',
  email: '', bank_name: '', account_no: '', ifsc_code: '', logo_base64: '', is_default: false,
};

export function CompanyProfileModal({ profiles, onClose, onSaved }) {
  const [editing, setEditing] = useState(null);  // null = list, {} = new/edit form
  const [saving, setSaving] = useState(false);

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
      onSaved();
    } catch {
      toast.error('Failed to save profile');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    if (!confirm('Delete this profile?')) return;
    try {
      await invoicesAPI.profiles.delete(id);
      toast.success('Profile deleted');
      onSaved();
    } catch {
      toast.error('Failed to delete');
    }
  }

  function handleLogoUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setEditing((p) => ({ ...p, logo_base64: reader.result }));
    reader.readAsDataURL(file);
  }

  function set(field, val) { setEditing((p) => ({ ...p, [field]: val })); }

  return (
    <Modal maxWidth="max-w-lg">
      <Modal.Header onClose={onClose}>Company Profiles</Modal.Header>

      {editing ? (
        <form onSubmit={handleSave} className="p-5 space-y-3">
          <p className="text-sm font-medium u-text">{editing.id ? 'Edit Profile' : 'New Profile'}</p>
          <FormField label="Company Name *" value={editing.name} onChange={(v) => set('name', v)} required />
          <div>
            <label className="block text-sm font-medium u-text-2 mb-1">Address</label>
            <textarea className="u-input w-full px-3 py-2 rounded-lg text-sm" rows={2}
              value={editing.address} onChange={(e) => set('address', e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="GSTIN" value={editing.gstin} onChange={(v) => set('gstin', v)} />
            <FormField label="PAN" value={editing.pan} onChange={(v) => set('pan', v)} />
            <FormField label="State" value={editing.state} onChange={(v) => set('state', v)} />
            <FormField label="State Code" value={editing.state_code} onChange={(v) => set('state_code', v)} />
          </div>
          <FormField label="Email" type="email" value={editing.email} onChange={(v) => set('email', v)} />
          <div className="grid grid-cols-3 gap-3">
            <FormField label="Bank Name" value={editing.bank_name} onChange={(v) => set('bank_name', v)} />
            <FormField label="Account No" value={editing.account_no} onChange={(v) => set('account_no', v)} />
            <FormField label="IFSC Code" value={editing.ifsc_code} onChange={(v) => set('ifsc_code', v)} />
          </div>
          <div>
            <label className="block text-sm font-medium u-text-2 mb-1">Logo</label>
            <input type="file" accept="image/*" onChange={handleLogoUpload} className="text-xs u-text-2" />
            {editing.logo_base64 && (
              <img src={editing.logo_base64} alt="logo preview" className="mt-2 h-10 object-contain" />
            )}
          </div>
          <label className="flex items-center gap-2 text-sm u-text cursor-pointer">
            <input type="checkbox" checked={editing.is_default} onChange={(e) => set('is_default', e.target.checked)} />
            Set as default profile
          </label>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" type="button" onClick={() => setEditing(null)}>Cancel</Button>
            <Button type="submit" loading={saving}>Save Profile</Button>
          </div>
        </form>
      ) : (
        <div className="p-5 space-y-3">
          {profiles.map((p) => (
            <div key={p.id} className="flex items-center gap-3 p-3 rounded-lg u-bg-surface-2">
              <Building2 className="h-5 w-5 u-text-3 shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <p className="text-sm font-medium u-text truncate">{p.name}</p>
                  {p.is_default && <Star className="h-3 w-3 text-amber-500 fill-amber-500" />}
                </div>
                <p className="text-xs u-text-3 truncate">{p.gstin}</p>
              </div>
              <button onClick={() => setEditing(p)} className="text-xs u-text-brand hover:underline">Edit</button>
              <button onClick={() => handleDelete(p.id)} className="p-1 text-red-400 hover:text-red-600 rounded">
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
          {profiles.length === 0 && (
            <p className="text-sm u-text-3 text-center py-4">No profiles yet</p>
          )}
          <Button className="w-full" onClick={() => setEditing({ ...EMPTY })}>+ Add Profile</Button>
        </div>
      )}
    </Modal>
  );
}
