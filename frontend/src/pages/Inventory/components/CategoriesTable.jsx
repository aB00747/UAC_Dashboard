import PropTypes from 'prop-types';
import { Edit2, Trash2 } from 'lucide-react';

export default function CategoriesTable({ categories, onEdit, onDelete }) {
  return (
    <table className="w-full text-sm">
      <thead className="u-bg-subtle border-b u-border-b">
        <tr>
          <th className="text-left py-3 px-4 font-medium u-text-3">Name</th>
          <th className="text-left py-3 px-4 font-medium u-text-3">Description</th>
          <th className="text-right py-3 px-4 font-medium u-text-3">Actions</th>
        </tr>
      </thead>
      <tbody>
        {categories.map((c) => (
          <tr key={c.id} className="border-b u-border-b hover:u-bg-subtle">
            <td className="py-3 px-4 font-medium u-text">{c.name}</td>
            <td className="py-3 px-4 u-text-2">{c.description || '-'}</td>
            <td className="py-3 px-4 text-right">
              <button onClick={() => onEdit('category', c)} className="p-1.5 u-text-3 hover:u-text-brand rounded"><Edit2 className="h-4 w-4" /></button>
              <button onClick={() => onDelete('categories', c.id)} className="p-1.5 u-text-3 hover:text-red-600 rounded"><Trash2 className="h-4 w-4" /></button>
            </td>
          </tr>
        ))}
        {categories.length === 0 && <tr><td colSpan={3} className="py-10 text-center u-text-3">No categories</td></tr>}
      </tbody>
    </table>
  );
}

CategoriesTable.propTypes = {
  categories: PropTypes.array.isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
};
