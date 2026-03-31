import { useState, useEffect } from 'react';
import { usersAPI, rolesAPI } from '../../api/auth';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';
import { Plus } from 'lucide-react';
import { Button, Select } from '../../components/ui';
import { PageHeader, SearchInput } from '../../components/common';
import UserTable from './components/UserTable';
import UserForm from './components/UserForm';

const emptyForm = { username: '', email: '', first_name: '', last_name: '', phone: '', role: '', password: '', is_active: true };

function getRoleDisplay(u) {
  const detail = u.role_detail || u.role;
  if (!detail) return { name: 'staff', label: 'Staff' };
  if (typeof detail === 'object') return detail;
  return { name: detail, label: detail };
}

export default function UsersPage() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [showDialog, setShowDialog] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const myLevel = currentUser?.role?.level || 0;
  const allowedRoles = roles.filter((r) => r.level < myLevel);

  useEffect(() => { rolesAPI.list().then(({ data }) => setRoles(data)).catch(() => {}); }, []);
  useEffect(() => { loadUsers(); }, [search, roleFilter]);

  async function loadUsers() {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (roleFilter) params.role__name = roleFilter;
      const { data } = await usersAPI.list(params);
      setUsers(data.results || data || []);
    } catch { toast.error('Failed to load users'); }
    finally { setLoading(false); }
  }

  function openCreate() {
    setEditingUser(null);
    setForm({ ...emptyForm, role: allowedRoles.length ? allowedRoles.at(-1).id : '' });
    setShowDialog(true);
  }

  function openEdit(u) {
    setEditingUser(u);
    setForm({ username: u.username, email: u.email, first_name: u.first_name, last_name: u.last_name, phone: u.phone || '', role: u.role_detail?.id || u.role, password: '', is_active: u.is_active });
    setShowDialog(true);
  }

  async function handleSave() {
    if (!form.username.trim() || !form.email.trim()) return toast.error('Username and email are required');
    if (!editingUser && !form.password) return toast.error('Password is required for new users');
    setSaving(true);
    try {
      const payload = { ...form }; if (!payload.password) delete payload.password;
      if (editingUser) { await usersAPI.update(editingUser.id, payload); toast.success('User updated'); }
      else { await usersAPI.create(payload); toast.success('User created'); }
      setShowDialog(false); loadUsers();
    } catch (err) {
      const msg = err.response?.data;
      if (msg && typeof msg === 'object') { const first = Object.values(msg).flat()[0]; toast.error(typeof first === 'string' ? first : 'Save failed'); }
      else toast.error('Save failed');
    } finally { setSaving(false); }
  }

  async function handleDelete(u) {
    if (!confirm(`Delete user "${u.username}"?`)) return;
    try { await usersAPI.delete(u.id); toast.success('User deleted'); loadUsers(); }
    catch { toast.error('Delete failed'); }
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Users">
        <Button icon={Plus} onClick={openCreate}>Add User</Button>
      </PageHeader>

      <div className="flex flex-col sm:flex-row gap-3">
        <SearchInput placeholder="Search users..." value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-sm" />
        <Select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}
          options={roles.map((r) => ({ value: r.name, label: r.label }))} placeholder="All Roles" className="w-auto" />
      </div>

      <UserTable users={users} loading={loading} getRoleDisplay={getRoleDisplay} onEdit={openEdit} onDelete={handleDelete} />

      {showDialog && (
        <UserForm form={form} setForm={setForm} editingUser={editingUser} allowedRoles={allowedRoles}
          saving={saving} onSave={handleSave} onClose={() => setShowDialog(false)} />
      )}
    </div>
  );
}
