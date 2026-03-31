import { useState, useEffect, useCallback } from 'react';
import { deliveriesAPI } from '../../api/deliveries';
import toast from 'react-hot-toast';
import { Plus } from 'lucide-react';
import { Button, Select } from '../../components/ui';
import { PageHeader, FilterBar } from '../../components/common';
import { PageSpinner } from '../../components/ui/Spinner';
import DeliveryCard from './components/DeliveryCard';
import DeliveryFormModal from './components/DeliveryFormModal';

export default function Deliveries() {
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingDelivery, setEditingDelivery] = useState(null);
  const [statusFilter, setStatusFilter] = useState('');

  const loadDeliveries = useCallback(async () => {
    setLoading(true);
    try {
      const params = {}; if (statusFilter) params.status = statusFilter;
      const { data } = await deliveriesAPI.list(params);
      setDeliveries(data.results || data || []);
    } catch { toast.error('Failed to load deliveries'); }
    finally { setLoading(false); }
  }, [statusFilter]);

  useEffect(() => { loadDeliveries(); }, [loadDeliveries]);

  function openDialog(delivery = null) {
    setEditingDelivery(delivery);
    setDialogOpen(true);
  }

  function handleSuccess() {
    setDialogOpen(false);
    setEditingDelivery(null);
    loadDeliveries();
  }

  if (loading) return <PageSpinner />;

  return (
    <div className="space-y-4">
      <PageHeader title="Deliveries">
        <Button icon={Plus} onClick={() => openDialog()}>Add Delivery</Button>
      </PageHeader>

      <FilterBar>
        <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
          options={[
            { value: 'pending', label: 'Pending' },
            { value: 'in_transit', label: 'In Transit' },
            { value: 'delivered', label: 'Delivered' },
            { value: 'failed', label: 'Failed' }
          ]}
          placeholder="All Status" className="w-auto" />
      </FilterBar>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {deliveries.map((d) => (
          <DeliveryCard key={d.id} delivery={d} onEdit={() => openDialog(d)} />
        ))}
        {deliveries.length === 0 && <div className="col-span-full text-center py-10 text-gray-500 dark:text-gray-400">No deliveries found</div>}
      </div>

      {dialogOpen && (
        <DeliveryFormModal
          initialData={editingDelivery}
          onClose={() => { setDialogOpen(false); setEditingDelivery(null); }}
          onSuccess={handleSuccess}
        />
      )}
    </div>
  );
}
