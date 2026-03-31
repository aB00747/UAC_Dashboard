import PropTypes from 'prop-types';
import { Edit2, Trash2 } from 'lucide-react';
import { Badge } from '../../../components/ui';
import { formatDate } from '../../../utils/format';
import { roleBadgeColors } from '../../../constants/statusColors';

export default function UserTable({ users, loading, getRoleDisplay, onEdit, onDelete }) {
  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 flex justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
              <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Name</th>
              <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Email</th>
              <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Role</th>
              <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Status</th>
              <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Joined</th>
              <th className="text-right py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => {
              const role = getRoleDisplay(u);
              return (
                <tr key={u.id} className="border-b border-gray-100 dark:border-gray-700/50">
                  <td className="py-3 px-4">
                    <p className="font-medium text-gray-900 dark:text-white">
                      {u.first_name || u.last_name ? `${u.first_name} ${u.last_name}`.trim() : u.username}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">@{u.username}</p>
                  </td>
                  <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{u.email}</td>
                  <td className="py-3 px-4"><Badge colorMap={roleBadgeColors} value={role.name}>{role.label}</Badge></td>
                  <td className="py-3 px-4"><Badge variant={u.is_active ? 'green' : 'red'}>{u.is_active ? 'Active' : 'Inactive'}</Badge></td>
                  <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{formatDate(u.date_joined)}</td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => onEdit(u)} className="p-1.5 rounded-lg text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-gray-100 dark:hover:bg-gray-700"><Edit2 className="h-4 w-4" /></button>
                      <button onClick={() => onDelete(u)} className="p-1.5 rounded-lg text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"><Trash2 className="h-4 w-4" /></button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {users.length === 0 && (
              <tr><td colSpan={6} className="py-12 text-center text-gray-500 dark:text-gray-400">No users found</td></tr>
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