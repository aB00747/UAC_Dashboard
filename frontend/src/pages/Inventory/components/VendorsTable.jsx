import PropTypes from 'prop-types';
import { Edit2, Trash2 } from 'lucide-react';

export default function VendorsTable({ vendors, onEdit, onDelete }) {
  return (
    <table className="w-full text-sm">
      <thead className="u-bg-subtle border-b u-border-b">
        <tr>
          <th className="text-left py-3 px-4 font-medium u-text-3">Name</th>
          <th className="text-left py-3 px-4 font-medium u-text-3">Contact</th>
          <th className="text-left py-3 px-4 font-medium u-text-3">Phone</th>
          <th className="text-left py-3 px-4 font-medium u-text-3">GSTIN</th>
          <th className="text-right py-3 px-4 font-medium u-text-3">Actions</th>
        </tr>
      </thead>
      <tbody>
        {vendors.map((v) => (
          <tr key={v.id} className="border-b u-border-b hover:u-bg-subtle">
            <td className="py-3 px-4 font-medium u-text">{v.vendor_name}</td>
            <td className="py-3 px-4 u-text-2">{v.contact_person || '-'}</td>
            <td className="py-3 px-4 u-text-2">{v.phone || '-'}</td>
            <td className="py-3 px-4 u-text-2">{v.gstin || '-'}</td>
            <td className="py-3 px-4 text-right">
              <button onClick={() => onEdit('vendor', v)} className="p-1.5 u-text-3 hover:u-text-brand rounded"><Edit2 className="h-4 w-4" /></button>
              <button onClick={() => onDelete('vendors', v.id)} className="p-1.5 u-text-3 hover:text-red-600 rounded"><Trash2 className="h-4 w-4" /></button>
            </td>
          </tr>
        ))}
        {vendors.length === 0 && <tr><td colSpan={5} className="py-10 text-center u-text-3">No vendors</td></tr>}
      </tbody>
    </table>
  );
}

VendorsTable.propTypes = {
  vendors: PropTypes.array.isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
};
