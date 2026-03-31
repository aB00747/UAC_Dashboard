import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { deliveriesAPI } from '../../../api/deliveries';
import { ordersAPI } from '../../../api/orders';
import toast from 'react-hot-toast';
import { Button, Modal } from '../../../components/ui';
import { FormField } from '../../../components/common';

const DEFAULT_FORM_STATE = {
  order: '',
  delivery_date: '',
  address: '',
  vehicle_number: '',
  driver_name: '',
  driver_phone: '',
  status: 'pending',
  tracking_number: '',
  notes: ''
};

export default function DeliveryFormModal({ initialData, onClose, onSuccess }) {
  const [form, setForm] = useState(initialData || DEFAULT_FORM_STATE);
  const [orders, setOrders] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const loadOrders = async () => {
      try {
        const { data } = await ordersAPI.list({ page_size: 200 });
        if (isMounted) setOrders(data.results || data || []);
      } catch {
        toast.error('Failed to load orders');
      }
    };
    loadOrders();
    return () => { isMounted = false; };
  }, []);

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (initialData?.id) {
        await deliveriesAPI.update(initialData.id, form);
        toast.success('Delivery updated');
      } else {
        await deliveriesAPI.create(form);
        toast.success('Delivery created');
      }
      onSuccess();
    } catch {
      toast.error('Save failed');
    } finally {
      setSaving(false);
    }
  };

  const modalTitle = initialData ? 'Edit' : 'Add';
  const buttonText = initialData ? 'Update' : 'Create';

  return (
    <Modal maxWidth="max-w-lg">
      <Modal.Header onClose={onClose}>
        {modalTitle} Delivery
      </Modal.Header>

      <form onSubmit={handleSave} className="p-5 space-y-4">
        <div>
          <label htmlFor='order' className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Order *</label>
          <select
            required
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            value={form.order}
            onChange={(e) => handleChange('order', e.target.value)}
          >
            <option value="">Select Order</option>
            {orders.map((o) => (
              <option key={o.id} value={o.id}>{o.order_number} - {o.customer_name}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField label="Delivery Date" type="date" value={form.delivery_date || ''} onChange={(v) => handleChange('delivery_date', v)} />
          <div>
            <label htmlFor='status' className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
            <select
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              value={form.status}
              onChange={(e) => handleChange('status', e.target.value)}
            >
              <option value="pending">Pending</option>
              <option value="in_transit">In Transit</option>
              <option value="delivered">Delivered</option>
              <option value="failed">Failed</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField label="Vehicle Number" value={form.vehicle_number} onChange={(v) => handleChange('vehicle_number', v)} />
          <FormField label="Tracking Number" value={form.tracking_number} onChange={(v) => handleChange('tracking_number', v)} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField label="Driver Name" value={form.driver_name} onChange={(v) => handleChange('driver_name', v)} />
          <FormField label="Driver Phone" value={form.driver_phone} onChange={(v) => handleChange('driver_phone', v)} />
        </div>

        <div>
          <label htmlFor='address' className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Address</label>
          <textarea
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            rows={2}
            value={form.address}
            onChange={(e) => handleChange('address', e.target.value)}
          />
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button variant="secondary" type="button" onClick={onClose} disabled={saving}>Cancel</Button>
          <Button type="submit" loading={saving}>{saving ? 'Saving...' : buttonText}</Button>
        </div>
      </form>
    </Modal>
  );
}

DeliveryFormModal.propTypes = {
  initialData: PropTypes.object,
  onClose: PropTypes.func,
  onSuccess: PropTypes.func
};
