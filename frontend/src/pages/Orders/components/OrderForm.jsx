import PropTypes from 'prop-types';
import { Trash2 } from 'lucide-react';
import { Button } from '../../../components/ui';
import { FormField } from '../../../components/common';
import { formatCurrency } from '../../../utils/format';

export default function OrderForm({ form, setForm, customers, chemicals, saving, onSave, onClose }) {
  function addItem() {
    setForm({ ...form, items: [...form.items, { chemical: '', quantity: 1, unit_price: 0 }] });
  }

  function removeItem(i) {
    setForm({ ...form, items: form.items.filter((_, idx) => idx !== i) });
  }

  function updateItem(i, field, value) {
    const items = [...form.items];
    items[i] = { ...items[i], [field]: value };
    if (field === 'chemical') {
      const chem = chemicals.find((c) => c.id === Number.parseInt(value));
      if (chem) items[i].unit_price = chem.selling_price;
    }
    setForm({ ...form, items });
  }

  const subtotal = form.items.reduce((sum, i) => sum + (Number.parseFloat(i.quantity) || 0) * (Number.parseFloat(i.unit_price) || 0), 0);

  return (
    <form onSubmit={onSave} className="p-5 space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor='customer' className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Customer *</label>
          <select required className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white" value={form.customer} onChange={(e) => setForm({ ...form, customer: e.target.value })}>
            <option value="">Select Customer</option>
            {customers.map((c) => <option key={c.id} value={c.id}>{c.full_name} {c.company_name ? `(${c.company_name})` : ''}</option>)}
          </select>
        </div>
        <FormField label="Order Date" type="date" value={form.order_date} onChange={(v) => setForm({ ...form, order_date: v })} />
        <FormField label="Expected Delivery Date" type="date" value={form.expected_delivery_date} onChange={(v) => setForm({ ...form, expected_delivery_date: v })} />
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-sm font-semibold text-gray-900 dark:text-white">Order Items</h4>
          <button type="button" onClick={addItem} className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300">+ Add Item</button>
        </div>
        <div className="space-y-2">
          {form.items.map((item, i) => (
            <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <select className="flex-1 px-2 py-1.5 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white" value={item.chemical} onChange={(e) => updateItem(i, 'chemical', e.target.value)}>
                <option value="">Select Chemical</option>
                {chemicals.map((c) => <option key={c.id} value={c.id}>{c.chemical_name} ({formatCurrency(c.selling_price)})</option>)}
              </select>
              <input type="number" min="0.01" step="any" placeholder="Qty" className="w-20 px-2 py-1.5 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white" value={item.quantity} onChange={(e) => updateItem(i, 'quantity', e.target.value)} />
              <input type="number" min="0" step="any" placeholder="Price" className="w-28 px-2 py-1.5 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white" value={item.unit_price} onChange={(e) => updateItem(i, 'unit_price', e.target.value)} />
              <span className="w-28 text-sm font-medium text-right text-gray-900 dark:text-white">{formatCurrency((Number.parseFloat(item.quantity) || 0) * (Number.parseFloat(item.unit_price) || 0))}</span>
              {form.items.length > 1 && (
                <button type="button" onClick={() => removeItem(i)} className="p-1 text-red-400 hover:text-red-600"><Trash2 className="h-4 w-4" /></button>
              )}
            </div>
          ))}
        </div>
        <div className="text-right mt-2">
          <span className="text-sm text-gray-500 dark:text-gray-400">Subtotal: </span>
          <span className="text-lg font-bold text-gray-900 dark:text-white">{formatCurrency(subtotal)}</span>
        </div>
      </div>

      <div>
        <label htmlFor='notes' className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Notes</label>
        <textarea className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white" rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <Button variant="secondary" type="button" onClick={onClose}>Cancel</Button>
        <Button type="submit" loading={saving}>{saving ? 'Creating...' : 'Create Order'}</Button>
      </div>
    </form>
  );
}

OrderForm.propTypes = {
  form: PropTypes.object.isRequired,
  setForm: PropTypes.func.isRequired,
  chemicals: PropTypes.array.isRequired,
  saving: PropTypes.bool.isRequired,
  onSave: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  customers: PropTypes.array.isRequired,
};