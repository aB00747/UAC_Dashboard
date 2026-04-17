import PropTypes from 'prop-types';
import { Edit2, Trash2 } from 'lucide-react';
import { Badge } from '../../../components/ui';
import { formatDate } from '../../../utils/format';
import { roleBadgeColors } from '../../../constants/statusColors';

export default function UserTable({ users, loading, getRoleDisplay, onEdit, onDelete }) {
  if (loading) {
    return (
      <div className="u-card flex justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderBottomColor: 'var(--brand)' }} />
      </div>
    );
  }

  return (
    <div className="u-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b u-border-b u-bg-subtle">
              <th className="text-left py-3 px-4 font-medium u-text-3">Name</th>
              <th className="text-left py-3 px-4 font-medium u-text-3">Email</th>
              <th className="text-left py-3 px-4 font-medium u-text-3">Role</th>
              <th className="text-left py-3 px-4 font-medium u-text-3">Status</th>
              <th className="text-left py-3 px-4 font-medium u-text-3">Joined</th>
              <th className="text-right py-3 px-4 font-medium u-text-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => {
              const role = getRoleDisplay(u);
              return (
                <tr key={u.id} className="border-b u-border-b">
                  <td className="py-3 px-4">
                    <p className="font-medium u-text">
                      {u.first_name || u.last_name ? `${u.first_name} ${u.last_name}`.trim() : u.username}
                    </p>
                    <p className="text-xs u-text-3">@{u.username}</p>
                  </td>
                  <td className="py-3 px-4 u-text-2">{u.email}</td>
                  <td className="py-3 px-4"><Badge colorMap={roleBadgeColors} value={role.name}>{role.label}</Badge></td>
                  <td className="py-3 px-4"><Badge variant={u.is_active ? 'green' : 'red'}>{u.is_active ? 'Active' : 'Inactive'}</Badge></td>
                  <td className="py-3 px-4 u-text-2">{formatDate(u.date_joined)}</td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button data-testid="edit-user-btn" onClick={() => onEdit(u)} className="p-1.5 rounded-lg u-text-3 hover:u-text-brand hover:u-bg-subtle"><Edit2 className="h-4 w-4" /></button>
                      <button onClick={() => onDelete(u)} className="p-1.5 rounded-lg u-text-3 hover:text-red-600 hover:bg-red-50"><Trash2 className="h-4 w-4" /></button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {users.length === 0 && (
              <tr><td colSpan={6} className="py-12 text-center u-text-3">No users found</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

UserTable.propTypes = {
  users: PropTypes.array.isRequired,
  loading: PropTypes.bool.isRequired,
  getRoleDisplay: PropTypes.func.isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
};
