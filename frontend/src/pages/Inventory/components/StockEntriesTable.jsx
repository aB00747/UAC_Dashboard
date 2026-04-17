import PropTypes from 'prop-types';
import { Trash2 } from 'lucide-react';
import { Badge } from '../../../components/ui';
import { formatCurrency } from '../../../utils/format';
import { stockEntryTypeColors } from '../../../constants/statusColors';

export default function StockEntriesTable({ stockEntries, onDelete }) {
  return (
    <table className="w-full text-sm">
      <thead className="u-bg-subtle border-b u-border-b">
        <tr>
          <th className="text-left py-3 px-4 font-medium u-text-3">Chemical</th>
          <th className="text-left py-3 px-4 font-medium u-text-3">Type</th>
          <th className="text-right py-3 px-4 font-medium u-text-3">Qty</th>
          <th className="text-right py-3 px-4 font-medium u-text-3">Rate</th>
          <th className="text-left py-3 px-4 font-medium u-text-3">Vendor</th>
          <th className="text-right py-3 px-4 font-medium u-text-3">Actions</th>
        </tr>
      </thead>
      <tbody>
        {stockEntries.map((s) => (
          <tr key={s.id} className="border-b u-border-b hover:u-bg-subtle">
            <td className="py-3 px-4 font-medium u-text">{s.chemical_name}</td>
            <td className="py-3 px-4"><Badge colorMap={stockEntryTypeColors} value={s.entry_type}>{s.entry_type}</Badge></td>
            <td className="py-3 px-4 text-right u-text">{s.quantity}</td>
            <td className="py-3 px-4 text-right u-text">{s.rate ? formatCurrency(s.rate) : '-'}</td>
            <td className="py-3 px-4 u-text-2">{s.vendor_name || '-'}</td>
            <td className="py-3 px-4 text-right">
              <button onClick={() => onDelete('stock', s.id)} className="p-1.5 u-text-3 hover:text-red-600 rounded"><Trash2 className="h-4 w-4" /></button>
            </td>
          </tr>
        ))}
        {stockEntries.length === 0 && <tr><td colSpan={6} className="py-10 text-center u-text-3">No stock entries</td></tr>}
      </tbody>
    </table>
  );
}

StockEntriesTable.propTypes = {
  stockEntries: PropTypes.array.isRequired,
  onDelete: PropTypes.func.isRequired,
};
