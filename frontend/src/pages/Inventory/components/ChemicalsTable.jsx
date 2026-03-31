import PropTypes from 'prop-types';
import { Edit2, Trash2, AlertTriangle } from 'lucide-react';
import { formatCurrency } from '../../../utils/format';

export default function ChemicalsTable({ chemicals, onEdit, onDelete }) {
  return (
    <table className="w-full text-sm">
      <thead className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
        <tr>
          <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Name</th>
          <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Code</th>
          <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Category</th>
          <th className="text-right py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Qty</th>
          <th className="text-right py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Price</th>
          <th className="text-right py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Actions</th>
        </tr>
      </thead>
      <tbody>
        {chemicals.map((c) => (
          <tr key={c.id} className="border-b border-gray-100 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/30">
            <td className="py-3 px-4">
              <div className="flex items-center gap-2">
                {c.is_low_stock && <AlertTriangle className="h-4 w-4 text-red-500 dark:text-red-400" />}
                <span className="font-medium text-gray-900 dark:text-white">{c.chemical_name}</span>
              </div>
            </td>
            <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{c.chemical_code}</td>
            <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{c.category_name || '-'}</td>
            <td className="py-3 px-4 text-right text-gray-900 dark:text-white">{c.quantity} {c.unit}</td>
            <td className="py-3 px-4 text-right text-gray-900 dark:text-white">{formatCurrency(c.selling_price)}</td>
            <td className="py-3 px-4 text-right">
              <button onClick={() => onEdit('chemical', c)} className="p-1.5 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded"><Edit2 className="h-4 w-4" /></button>
              <button onClick={() => onDelete('chemicals', c.id)} className="p-1.5 text-gray-400 hover:text-red-600 dark:hover:text-red-400 rounded"><Trash2 className="h-4 w-4" /></button>
            </td>
          </tr>
        ))}
        {chemicals.length === 0 && <tr><td colSpan={6} className="py-10 text-center text-gray-500 dark:text-gray-400">No chemicals</td></tr>}
      </tbody>
    </table>
  );
}

ChemicalsTable.propTypes = {
  chemicals: PropTypes.array.isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
};