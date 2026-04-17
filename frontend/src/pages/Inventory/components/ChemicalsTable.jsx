import PropTypes from 'prop-types';
import { Edit2, Trash2, AlertTriangle } from 'lucide-react';
import { formatCurrency } from '../../../utils/format';

export default function ChemicalsTable({ chemicals, onEdit, onDelete }) {
  return (
    <table className="w-full text-sm">
      <thead className="u-bg-subtle border-b u-border-b">
        <tr>
          <th className="text-left py-3 px-4 font-medium u-text-3">Name</th>
          <th className="text-left py-3 px-4 font-medium u-text-3">Code</th>
          <th className="text-left py-3 px-4 font-medium u-text-3">Category</th>
          <th className="text-right py-3 px-4 font-medium u-text-3">Qty</th>
          <th className="text-right py-3 px-4 font-medium u-text-3">Price</th>
          <th className="text-right py-3 px-4 font-medium u-text-3">Actions</th>
        </tr>
      </thead>
      <tbody>
        {chemicals.map((c) => (
          <tr key={c.id} className="border-b u-border-b hover:u-bg-subtle">
            <td className="py-3 px-4">
              <div className="flex items-center gap-2">
                {c.is_low_stock && <AlertTriangle className="h-4 w-4 text-red-500" />}
                <span className="font-medium u-text">{c.chemical_name}</span>
              </div>
            </td>
            <td className="py-3 px-4 u-text-2">{c.chemical_code}</td>
            <td className="py-3 px-4 u-text-2">{c.category_name || '-'}</td>
            <td className="py-3 px-4 text-right u-text">{c.quantity} {c.unit}</td>
            <td className="py-3 px-4 text-right u-text">{formatCurrency(c.selling_price)}</td>
            <td className="py-3 px-4 text-right">
              <button onClick={() => onEdit('chemical', c)} className="p-1.5 u-text-3 hover:u-text-brand rounded"><Edit2 className="h-4 w-4" /></button>
              <button onClick={() => onDelete('chemicals', c.id)} className="p-1.5 u-text-3 hover:text-red-600 rounded"><Trash2 className="h-4 w-4" /></button>
            </td>
          </tr>
        ))}
        {chemicals.length === 0 && <tr><td colSpan={6} className="py-10 text-center u-text-3">No chemicals</td></tr>}
      </tbody>
    </table>
  );
}

ChemicalsTable.propTypes = {
  chemicals: PropTypes.array.isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
};
