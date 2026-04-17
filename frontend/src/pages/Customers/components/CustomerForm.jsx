import PropTypes from 'prop-types';
import { FormField } from '../../../components/common';
import { Button } from '../../../components/ui';

export default function CustomerForm({ form, setForm, customerTypes, saving, dialogMode, onSave, onClose }) {
  return (
    <form onSubmit={onSave} className="p-5 space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <FormField label="First Name *" value={form.first_name} onChange={(v) => setForm({ ...form, first_name: v })} required />
        <FormField label="Last Name" value={form.last_name} onChange={(v) => setForm({ ...form, last_name: v })} />
        <FormField label="Company Name" value={form.company_name} onChange={(v) => setForm({ ...form, company_name: v })} />
        <FormField label="Email" type="email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} />
        <FormField label="Phone" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} />
        <FormField label="Alt. Phone" value={form.alternate_phone} onChange={(v) => setForm({ ...form, alternate_phone: v })} />
      </div>
      <FormField label="Address Line 1" value={form.address_line1} onChange={(v) => setForm({ ...form, address_line1: v })} />
      <FormField label="Address Line 2" value={form.address_line2} onChange={(v) => setForm({ ...form, address_line2: v })} />
      <div className="grid grid-cols-3 gap-4">
        <FormField label="City" value={form.city} onChange={(v) => setForm({ ...form, city: v })} />
        <FormField label="State" value={form.state} onChange={(v) => setForm({ ...form, state: v })} />
        <FormField label="PIN Code" value={form.pin_code} onChange={(v) => setForm({ ...form, pin_code: v })} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <FormField label="GSTIN" value={form.gstin} onChange={(v) => setForm({ ...form, gstin: v })} />
        <FormField label="PAN" value={form.pan} onChange={(v) => setForm({ ...form, pan: v })} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium u-text-2 mb-1">Customer Type</label>
          <select
            className="u-input w-full px-3 py-2 rounded-lg text-sm"
            value={form.customer_type || ''}
            onChange={(e) => setForm({ ...form, customer_type: e.target.value ? Number(e.target.value) : '' })}
          >
            <option value="">Select Type</option>
            {customerTypes.map((ct) => (
              <option key={ct.id} value={ct.id}>{ct.name}</option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-2 pt-6">
          <input
            type="checkbox"
            checked={form.is_active}
            onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
            className="rounded"
          style={{ accentColor: 'var(--brand)' }}
          />
          <label className="text-sm u-text-2">Active</label>
        </div>
      </div>
      <div className="flex justify-end gap-3 pt-2">
        <Button variant="secondary" type="button" onClick={onClose}>Cancel</Button>
        <Button type="submit" loading={saving}>
          {saving ? 'Saving...' : dialogMode === 'create' ? 'Create' : 'Update'}
        </Button>
      </div>
    </form>
  );
}

CustomerForm.propTypes = {
  form: PropTypes.object.isRequired,
  setForm: PropTypes.func.isRequired,
  customerTypes: PropTypes.array.isRequired,
  saving: PropTypes.bool,
  dialogMode: PropTypes.string,
  onSave: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};