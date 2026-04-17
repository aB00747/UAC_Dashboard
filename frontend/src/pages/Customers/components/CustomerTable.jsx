import PropTypes from 'prop-types';
import { Edit2, Trash2 } from 'lucide-react';
import { Badge } from '../../../components/ui';
import { Pagination } from '../../../components/common';

export default function CustomerTable({ customers, loading, page, totalPages, onPageChange, onSelect, onEdit, onDelete, getTypeName }) {
  return (
    <div className="u-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="u-bg-subtle border-b u-border-b">
            <tr>
              <th className="text-left py-3 px-4 font-medium u-text-3">Name</th>
              <th className="text-left py-3 px-4 font-medium u-text-3">Company</th>
              <th className="text-left py-3 px-4 font-medium u-text-3">Phone</th>
              <th className="text-left py-3 px-4 font-medium u-text-3">City</th>
              <th className="text-left py-3 px-4 font-medium u-text-3">Type</th>
              <th className="text-left py-3 px-4 font-medium u-text-3">Status</th>
              <th className="text-right py-3 px-4 font-medium u-text-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {(() => {
              if (loading) {
                return <tr><td colSpan={7} className="py-10 text-center"><div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2" style={{ borderBottomColor: 'var(--brand)' }} /></td></tr>;
              }
              if (customers.length === 0) {
                return <tr><td colSpan={7} className="py-10 text-center u-text-3">No customers found</td></tr>;
              }
              return customers.map((c) => (
                <tr key={c.id} className="border-b u-border-b hover:u-bg-subtle cursor-pointer" onClick={() => onSelect(c)}>
                  <td className="py-3 px-4">
                    <p className="font-medium u-text">{c.full_name}</p>
                    <p className="text-xs u-text-3">{c.email}</p>
                  </td>
                  <td className="py-3 px-4 u-text-2">{c.company_name || '-'}</td>
                  <td className="py-3 px-4 u-text-2">{c.phone || '-'}</td>
                  <td className="py-3 px-4 u-text-2">{c.city || '-'}</td>
                  <td className="py-3 px-4">
                    {getTypeName(c) && <Badge variant="brand">{getTypeName(c)}</Badge>}
                  </td>
                  <td className="py-3 px-4">
                    <Badge variant={c.is_active ? 'green' : 'red'}>{c.is_active ? 'Active' : 'Inactive'}</Badge>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button onClick={(e) => { e.stopPropagation(); onEdit(c); }} className="p-1.5 u-text-3 hover:u-text-brand hover:u-bg-brand-light rounded">
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); onDelete(c.id); }} className="p-1.5 u-text-3 hover:text-red-600 hover:bg-red-50 rounded">
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