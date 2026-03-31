import PropTypes from 'prop-types';
import { Trash2 } from 'lucide-react';
import { Badge } from '../../../components/ui';
import { formatCurrency } from '../../../utils/format';
import { stockEntryTypeColors } from '../../../constants/statusColors';

export default function StockEntriesTable({ stockEntries, onDelete }) {
  return (
    <table className="w-full text-sm">
      <thead className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
        <tr>
          <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Chemical</th>
          <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Type</th>
          <th className="text-right py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Qty</th>
          <th className="text-right py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Rate</th>
          <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Vendor</th>
          <th className="text-right py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Actions</th>
        </tr>
      </thead>
      <tbody>
        {stockEntries.map((s) => (
          <tr key={s.id} className="border-b border-gray-100 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/30">
            <td className="py-3 px-4 font-medium text-gray-900 dark:text-white">{s.chemical_name}</td>
            <td className="py-3 px-4"><Badge colorMap={stockEntryTypeColors} value={s.entry_type}>{s.entry_type}</Badge></td>
            <td className="py-3 px-4 text-right text-gray-900 dark:text-white">{s.quantity}</td>
            <td className="py-3 px-4 text-right text-gray-900 dark:text-white">{s.rate ? formatCurrency(s.rate) : '-'}</td>
            <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{s.vendor_name || '-'}</td>
            <td className="py-3 px-4 text-right">
              <button onClick={() => onDelete('stock', s.id)} className="p-1.5 text-gray-400 hover:text-red-600 dark:hover:text-red-400 rounded"><Trash2 className="h-4 w-4" /></button>
            </td>
          </tr>
        ))}
        {stockEntries.length === 0 && <tr><td colSpan={6} className="py-10 text-center text-gray-500 dark:text-gray-400">No stock entries</td></tr>}
      </tbody>
    </table>
  );
}

StockEntriesTable.propTypes = {
  stockEntries: PropTypes.array.isRequired,
  onDelete: PropTypes.func.isRequired,
};