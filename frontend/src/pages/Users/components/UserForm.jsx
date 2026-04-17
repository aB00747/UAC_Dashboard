import PropTypes from 'prop-types';
import { Button, Modal } from '../../../components/ui';
import { FormField } from '../../../components/common';

export default function UserForm({ form, setForm, editingUser, allowedRoles, saving, onSave, onClose }) {
  const buttonLabel = editingUser ? 'Update' : 'Create';

  return (
    <Modal maxWidth="max-w-lg">
      <Modal.Header onClose={onClose}>{editingUser ? 'Edit User' : 'Create User'}</Modal.Header>
      <div className="px-6 py-4 space-y-4 max-h-[70vh] overflow-y-auto">
        <div className="grid grid-cols-2 gap-4">
          <FormField label="First Name" value={form.first_name} onChange={(v) => setForm({ ...form, first_name: v })} />
          <FormField label="Last Name" value={form.last_name} onChange={(v) => setForm({ ...form, last_name: v })} />
        </div>
        <FormField label="Username *" value={form.username} onChange={(v) => setForm({ ...form, username: v })} disabled={!!editingUser} />
        <FormField label="Email *" type="email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} />
        <FormField label="Phone" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} />
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor='role' className="block text-sm font-medium u-text-2 mb-1">Role</label>
            <select
              className="u-input w-full px-3 py-2 rounded-lg text-sm"
              value={form.role}
              onChange={(e) => setForm({ ...form, role: Number(e.target.value) })}
            >
              {allowedRoles.map((r) => <option key={r.id} value={r.id}>{r.label}</option>)}
            </select>
          </div>
          <div className="flex items-end">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                className="h-4 w-4 rounded" style={{ accentColor: 'var(--brand)' }} />
              <span className="text-sm u-text-2">Active</span>
            </label>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium u-text-2 mb-1">
            Password {editingUser ? '(leave blank to keep current)' : '*'}
          </label>
          <input type="password"
            className="u-input w-full px-3 py-2 rounded-lg text-sm"
            value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
            placeholder={editingUser ? 'Leave blank to keep current' : 'Min 8 characters'} />
        </div>
      </div>
      <div className="flex justify-end gap-3 px-6 py-4 border-t" style={{ borderColor: 'var(--border)' }}>
        <Button variant="secondary" onClick={onClose}>Cancel</Button>
        <Button onClick={onSave} loading={saving}>{saving ? 'Saving...' : buttonLabel}</Button>
      </div>
    </Modal>
  );
}

UserForm.propTypes = {
  form: PropTypes.object.isRequired, setForm: PropTypes.func.isRequired, editingUser: PropTypes.object, allowedRoles: PropTypes.array,
  saving: PropTypes.bool, onSave: PropTypes.func.isRequired, onClose: PropTypes.func.isRequired,
};
