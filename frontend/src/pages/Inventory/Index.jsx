import { useState, useEffect } from 'react';
import { categoriesAPI, chemicalsAPI, vendorsAPI, stockEntriesAPI } from '../../api/inventory';
import { classNames } from '../../utils/format';
import toast from 'react-hot-toast';
import { Plus, Package, Layers, Truck, ClipboardList } from 'lucide-react';
import { Button, Modal } from '../../components/ui';
import { PageHeader } from '../../components/common';
import { PageSpinner } from '../../components/ui/Spinner';
import ChemicalsTable from './components/ChemicalsTable';
import CategoriesTable from './components/CategoriesTable';
import VendorsTable from './components/VendorsTable';
import StockEntriesTable from './components/StockEntriesTable';
import InventoryForm from './components/InventoryForm';

const TABS = [
  { key: 'chemicals', label: 'Chemicals', icon: Package },
  { key: 'categories', label: 'Categories', icon: Layers },
  { key: 'vendors', label: 'Vendors', icon: Truck },
  { key: 'stock', label: 'Stock Entries', icon: ClipboardList },
];

export default function Inventory() {
  const [tab, setTab] = useState('chemicals');
  const [chemicals, setChemicals] = useState([]);
  const [categories, setCategories] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [stockEntries, setStockEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState('');
  const [form, setForm] = useState({});
  const [editId, setEditId] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => { loadAll(); }, []);

  async function loadAll() {
    setLoading(true);
    try {
      const [catRes, chemRes, vendRes, stockRes] = await Promise.all([
        categoriesAPI.list(), chemicalsAPI.list({ page_size: 100 }),
        vendorsAPI.list({ page_size: 100 }), stockEntriesAPI.list({ page_size: 100 }),
      ]);
      setCategories(catRes.data.results || catRes.data || []);
      setChemicals(chemRes.data.results || chemRes.data || []);
      setVendors(vendRes.data.results || vendRes.data || []);
      setStockEntries(stockRes.data.results || stockRes.data || []);
    } catch { toast.error('Failed to load inventory data'); }
    finally { setLoading(false); }
  }

  function openDialog(type, item = null) {
    setDialogType(type); setEditId(item?.id || null);
    if (type === 'chemical') setForm(item || { chemical_name: '', chemical_code: '', category: '', description: '', unit: 'KG', quantity: 0, min_quantity: 0, purchase_price: 0, selling_price: 0, gst_percentage: 18 });
    else if (type === 'category') setForm(item || { name: '', description: '' });
    else if (type === 'vendor') setForm(item || { vendor_name: '', contact_person: '', phone: '', email: '', address: '', gstin: '' });
    else if (type === 'stock') setForm(item || { chemical: '', entry_type: 'purchase', quantity: 0, rate: 0, vendor: '', reference_note: '' });
    setDialogOpen(true);
  }

  async function handleSave(e) {
    e.preventDefault(); setSaving(true);
    try {
      const api = { chemical: chemicalsAPI, category: categoriesAPI, vendor: vendorsAPI, stock: stockEntriesAPI }[dialogType];
      if (editId) { await api.update(editId, form); toast.success('Updated successfully'); }
      else { await api.create(form); toast.success('Created successfully'); }
      setDialogOpen(false); loadAll();
    } catch (err) { toast.error(err.response?.data ? Object.values(err.response.data).flat().join(', ') : 'Save failed'); }
    finally { setSaving(false); }
  }

  async function handleDelete(type, id) {
    if (!confirm('Delete this item?')) return;
    try {
      const api = { chemicals: chemicalsAPI, categories: categoriesAPI, vendors: vendorsAPI, stock: stockEntriesAPI }[type];
      await api.delete(id); toast.success('Deleted'); loadAll();
    } catch { toast.error('Delete failed'); }
  }

  if (loading) return <PageSpinner />;

  const getDialogType = () => {
    if (tab === 'stock') return 'stock';
    if (tab === 'chemicals') return 'chemical';
    if (tab === 'categories') return 'category';
    return 'vendor';
  };

  const getButtonLabel = () => {
    if (tab === 'stock') return 'Stock Entry';
    return tab.slice(0, -1);
  };

  return (
    <div className="space-y-4">
      <PageHeader title="Inventory">
        <Button icon={Plus} onClick={() => openDialog(getDialogType())}>
          Add {getButtonLabel()}
        </Button>
      </PageHeader>

      <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg w-fit">
        {TABS.map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={classNames('flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-md transition-colors',
              tab === t.key ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300')}>
            <t.icon className="h-4 w-4" /> {t.label}
          </button>
        ))}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        {tab === 'chemicals' && <ChemicalsTable chemicals={chemicals} onEdit={openDialog} onDelete={handleDelete} />}
        {tab === 'categories' && <CategoriesTable categories={categories} onEdit={openDialog} onDelete={handleDelete} />}
        {tab === 'vendors' && <VendorsTable vendors={vendors} onEdit={openDialog} onDelete={handleDelete} />}
        {tab === 'stock' && <StockEntriesTable stockEntries={stockEntries} onDelete={handleDelete} />}
      </div>

      {dialogOpen && (
        <Modal maxWidth="max-w-lg">
          <Modal.Header onClose={() => setDialogOpen(false)}>
            {editId ? 'Edit' : 'Add'} {dialogType.charAt(0).toUpperCase() + dialogType.slice(1)}
          </Modal.Header>
          <InventoryForm dialogType={dialogType} form={form} setForm={setForm} categories={categories} chemicals={chemicals} vendors={vendors} saving={saving} editId={editId} onSave={handleSave} onClose={() => setDialogOpen(false)} />
        </Modal>
      )}
    </div>
  );
}
