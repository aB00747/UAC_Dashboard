import PropTypes from 'prop-types';
import { Edit2, Trash2 } from 'lucide-react';
import { Badge } from '../../../components/ui';
import { Pagination } from '../../../components/common';

export default function CustomerTable({ customers, loading, page, totalPages, onPageChange, onSelect, onEdit, onDelete, getTypeName }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
            <tr>
              <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Name</th>
              <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Company</th>
              <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Phone</th>
              <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">City</th>
              <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Type</th>
              <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Status</th>
              <th className="text-right py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Actions</th>
            </tr>
          </thead>
          <tbody>
            {(() => {
              if (loading) {
                return <tr><td colSpan={7} className="py-10 text-center"><div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600" /></td></tr>;
              }
              if (customers.length === 0) {
                return <tr><td colSpan={7} className="py-10 text-center text-gray-500 dark:text-gray-400">No customers found</td></tr>;
              }
              return customers.map((c) => (
                <tr key={c.id} className="border-b border-gray-100 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/30 cursor-pointer" onClick={() => onSelect(c)}>
                  <td className="py-3 px-4">
                    <p className="font-medium text-gray-900 dark:text-white">{c.full_name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{c.email}</p>
                  </td>
                  <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{c.company_name || '-'}</td>
                  <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{c.phone || '-'}</td>
                  <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{c.city || '-'}</td>
                  <td className="py-3 px-4">
                    {getTypeName(c) && <Badge variant="indigo">{getTypeName(c)}</Badge>}
                  </td>
                  <td className="py-3 px-4">
                    <Badge variant={c.is_active ? 'green' : 'red'}>{c.is_active ? 'Active' : 'Inactive'}</Badge>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button onClick={(e) => { e.stopPropagation(); onEdit(c); }} className="p-1.5 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded">
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); onDelete(c.id); }} className="p-1.5 text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))
            })()}
          </tbody>
        </table>
      </div>
      <Pagination page={page} totalPages={totalPages} onPrev={() => onPageChange(page - 1)} onNext={() => onPageChange(page + 1)} />
    </div>
  );
}

CustomerTable.propTypes = {
  customers: PropTypes.array.isRequired,
  loading: PropTypes.bool.isRequired,
  page: PropTypes.number.isRequired,
  totalPages: PropTypes.number.isRequired,
  onPageChange: PropTypes.func.isRequired,
  onSelect: PropTypes.func.isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  getTypeName: PropTypes.func.isRequired,
};