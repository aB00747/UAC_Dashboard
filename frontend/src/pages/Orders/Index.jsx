import { useState, useEffect, useCallback } from 'react';
import { ordersAPI } from '../../api/orders';
import { customersAPI } from '../../api/customers';
import { chemicalsAPI } from '../../api/inventory';
import toast from 'react-hot-toast';
import { Plus } from 'lucide-react';
import { Button, Modal, Select } from '../../components/ui';
import { PageHeader, FilterBar } from '../../components/common';
import OrderTable from './components/OrderTable';
import OrderDetail from './components/OrderDetail';
import OrderForm from './components/OrderForm';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ status: '', payment_status: '', page: 1 });
  const [totalPages, setTotalPages] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewOrder, setViewOrder] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [chemicals, setChemicals] = useState([]);
  const [form, setForm] = useState({ customer: '', order_date: new Date().toISOString().slice(0, 10), expected_delivery_date: '', notes: '', items: [{ chemical: '', quantity: 1, unit_price: 0 }] });
  const [saving, setSaving] = useState(false);

  const loadOrders = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page: filters.page };
      if (filters.status) params.status = filters.status;
      if (filters.payment_status) params.payment_status = filters.payment_status;
      const { data } = await ordersAPI.list(params);
      setOrders(data.results || data);
      setTotalPages(Math.ceil((data.count || 0) / 20) || 1);
    } catch { toast.error('Failed to load orders'); }
    finally { setLoading(false); }
  }, [filters]);

  useEffect(() => { loadOrders(); }, [loadOrders]);

  async function openCreate() {
    try {
      const [custRes, chemRes] = await Promise.all([
        customersAPI.list({ page_size: 200 }),
        chemicalsAPI.list({ page_size: 200 }),
      ]);
      setCustomers(custRes.data.results || custRes.data || []);
      setChemicals(chemRes.data.results || chemRes.data || []);
      setForm({ customer: '', order_date: new Date().toISOString().slice(0, 10), expected_delivery_date: '', notes: '', discount_amount: 0, items: [{ chemical: '', quantity: 1, unit_price: 0 }] });
      setDialogOpen(true);
    } catch { toast.error('Failed to load form data'); }
  }

  async function viewDetails(id) {
    try { const { data } = await ordersAPI.get(id); setViewOrder(data); }
    catch { toast.error('Failed to load order'); }
  }

  async function handleSave(e) {
    e.preventDefault();
    if (!form.items.some((i) => i.chemical)) { toast.error('Add at least one item'); return; }
    setSaving(true);
    try {
      await ordersAPI.create({
        ...form,
        items: form.items.filter((i) => i.chemical).map((i) => ({
          chemical: Number.parseInt(i.chemical), quantity: Number.parseFloat(i.quantity), unit_price: Number.parseFloat(i.unit_price),
        })),
      });
      toast.success('Order created'); setDialogOpen(false); loadOrders();
    } catch (err) { toast.error(err.response?.data ? JSON.stringify(err.response.data) : 'Save failed'); }
    finally { setSaving(false); }
  }

  async function updateStatus(id, status) {
    try {
      await ordersAPI.updateStatus(id, status);
      toast.success('Status updated'); loadOrders();
      if (viewOrder?.id === id) viewDetails(id);
    } catch { toast.error('Update failed'); }
  }

  return (
    <div className="space-y-4">
      <PageHeader title="Orders">
        <Button icon={Plus} onClick={openCreate}>Create Order</Button>
      </PageHeader>

      <FilterBar>
        <Select value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value, page: 1 })}
          options={['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled']} placeholder="All Status" className="w-auto" />
        <Select value={filters.payment_status} onChange={(e) => setFilters({ ...filters, payment_status: e.target.value, page: 1 })}
          options={['unpaid', 'partial', 'paid', 'refunded']} placeholder="All Payment" className="w-auto" />
      </FilterBar>

      <OrderTable orders={orders} loading={loading} page={filters.page} totalPages={totalPages}
        onPageChange={(p) => setFilters({ ...filters, page: p })} onView={viewDetails} />

      {viewOrder && <OrderDetail order={viewOrder} onClose={() => setViewOrder(null)} onUpdateStatus={updateStatus} />}

      {dialogOpen && (
        <Modal maxWidth="max-w-3xl">
          <Modal.Header onClose={() => setDialogOpen(false)}>Create Order</Modal.Header>
          <OrderForm form={form} setForm={setForm} customers={customers} chemicals={chemicals} saving={saving} onSave={handleSave} onClose={() => setDialogOpen(false)} />
        </Modal>
      )}
    </div>
  );
}
