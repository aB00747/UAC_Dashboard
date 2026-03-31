import PropTypes from 'prop-types';
import { Edit2, Trash2 } from 'lucide-react';

export default function VendorsTable({ vendors, onEdit, onDelete }) {
  return (
    <table className="w-full text-sm">
      <thead className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
        <tr>
          <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Name</th>
          <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Contact</th>
          <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Phone</th>
          <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">GSTIN</th>
          <th className="text-right py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Actions</th>
        </tr>
      </thead>
      <tbody>
        {vendors.map((v) => (
          <tr key={v.id} className="border-b border-gray-100 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/30">
            <td className="py-3 px-4 font-medium text-gray-900 dark:text-white">{v.vendor_name}</td>
            <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{v.contact_person || '-'}</td>
            <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{v.phone || '-'}</td>
            <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{v.gstin || '-'}</td>
            <td className="py-3 px-4 text-right">
              <button onClick={() => onEdit('vendor', v)} className="p-1.5 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded"><Edit2 className="h-4 w-4" /></button>
              <button onClick={() => onDelete('vendors', v.id)} className="p-1.5 text-gray-400 hover:text-red-600 dark:hover:text-red-400 rounded"><Trash2 className="h-4 w-4" /></button>
            </td>
          </tr>
        ))}
        {vendors.length === 0 && <tr><td colSpan={5} className="py-10 text-center text-gray-500 dark:text-gray-400">No vendors</td></tr>}
      </tbody>
    </table>
  );
}

VendorsTable.propTypes = {
  vendors: PropTypes.array.isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
};