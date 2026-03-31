import PropTypes from 'prop-types';
import { Button } from '../../../components/ui';
import { FormField } from '../../../components/common';

export default function InventoryForm({ dialogType, form, setForm, categories, chemicals, vendors, saving, editId, onSave, onClose }) {
  return (
    <form onSubmit={onSave} className="p-5 space-y-4">
      {dialogType === 'chemical' && (
        <>
          <FormField label="Chemical Name *" value={form.chemical_name} onChange={(v) => setForm({ ...form, chemical_name: v })} required />
          <FormField label="Code *" value={form.chemical_code} onChange={(v) => setForm({ ...form, chemical_code: v })} required />
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
            <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white" value={form.category || ''} onChange={(e) => setForm({ ...form, category: e.target.value || null })}>
              <option value="">None</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <FormField label="Unit" value={form.unit} onChange={(v) => setForm({ ...form, unit: v })} />
            <FormField label="Quantity" type="number" value={form.quantity} onChange={(v) => setForm({ ...form, quantity: v })} />
            <FormField label="Min Qty" type="number" value={form.min_quantity} onChange={(v) => setForm({ ...form, min_quantity: v })} />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <FormField label="Purchase Price" type="number" value={form.purchase_price} onChange={(v) => setForm({ ...form, purchase_price: v })} />
            <FormField label="Selling Price" type="number" value={form.selling_price} onChange={(v) => setForm({ ...form, selling_price: v })} />
            <FormField label="GST %" type="number" value={form.gst_percentage} onChange={(v) => setForm({ ...form, gst_percentage: v })} />
          </div>
        </>
      )}
      {dialogType === 'category' && (
        <>
          <FormField label="Name *" value={form.name} onChange={(v) => setForm({ ...form, name: v })} required />
          <FormField label="Description" value={form.description} onChange={(v) => setForm({ ...form, description: v })} />
        </>
      )}
      {dialogType === 'vendor' && (
        <>
          <FormField label="Vendor Name *" value={form.vendor_name} onChange={(v) => setForm({ ...form, vendor_name: v })} required />
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Contact Person" value={form.contact_person} onChange={(v) => setForm({ ...form, contact_person: v })} />
            <FormField label="Phone" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} />
          </div>
          <FormField label="Email" type="email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} />
          <FormField label="Address" value={form.address} onChange={(v) => setForm({ ...form, address: v })} />
          <FormField label="GSTIN" value={form.gstin} onChange={(v) => setForm({ ...form, gstin: v })} />
        </>
      )}
      {dialogType === 'stock' && (
        <>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Chemical *</label>
            <select required className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white" value={form.chemical} onChange={(e) => setForm({ ...form, chemical: e.target.value })}>
              <option value="">Select Chemical</option>
              {chemicals.map((c) => <option key={c.id} value={c.id}>{c.chemical_name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Type *</label>
            <select required className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white" value={form.entry_type} onChange={(e) => setForm({ ...form, entry_type: e.target.value })}>
              <option value="purchase">Purchase</option>
              <option value="sale">Sale</option>
              <option value="adjustment">Adjustment</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Quantity *" type="number" value={form.quantity} onChange={(v) => setForm({ ...form, quantity: v })} required />
            <FormField label="Rate" type="number" value={form.rate} onChange={(v) => setForm({ ...form, rate: v })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Vendor</label>
            <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white" value={form.vendor || ''} onChange={(e) => setForm({ ...form, vendor: e.target.value || null })}>
              <option value="">None</option>
              {vendors.map((v) => <option key={v.id} value={v.id}>{v.vendor_name}</option>)}
            </select>
          </div>
          <FormField label="Reference Note" value={form.reference_note} onChange={(v) => setForm({ ...form, reference_note: v })} />
        </>
      )}
      <div className="flex justify-end gap-3 pt-2">
        <Button variant="secondary" type="button" onClick={onClose}>Cancel</Button>
        <Button type="submit" loading={saving}>{saving ? 'Saving...' : editId ? 'Update' : 'Create'}</Button>
      </div>
    </form>
  );
}

InventoryForm.propTypes = {
  form: PropTypes.object.isRequired,
  setForm: PropTypes.func.isRequired,
  dialogType: PropTypes.string.isRequired,
  chemicals: PropTypes.array.isRequired,
  vendors: PropTypes.array.isRequired,
  saving: PropTypes.bool.isRequired,
  editId: PropTypes.number,
  onSave: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};