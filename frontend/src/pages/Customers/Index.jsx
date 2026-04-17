import { useState, useEffect, useCallback } from 'react';
import { customersAPI, customerTypesAPI } from '../../api/customers';
import toast from 'react-hot-toast';
import { Plus, Download, RefreshCw } from 'lucide-react';
import { Button, Modal, Select } from '../../components/ui';
import { PageHeader, FilterBar, SearchInput } from '../../components/common';
import { classNames } from '../../utils/format';
import CustomerStats from './components/CustomerStats';
import CustomerTable from './components/CustomerTable';
import CustomerForm from './components/CustomerForm';
import CustomerImport from './components/CustomerImport';
import CustomerDetail from './components/CustomerDetail';

function emptyForm() {
  return {
    first_name: '',
    last_name: '',
    company_name: '',
    email: '',
    phone: '',
    alternate_phone: '',
    address_line1: '',
    address_line2: '',
    city: '',
    state: '',
    state_code: '',
    country: 'India',
    country_code: 'IN',
    pin_code: '',
    gstin: '',
    pan: '',
    customer_type: '',
    is_active: true,
  };
}

async function handleExport() {
  try {
    const { data } = await customersAPI.export();
    const url = globalThis.URL.createObjectURL(new Blob([data]));
    const a = document.createElement('a'); a.href = url; a.download = 'customers.csv'; a.click();
    globalThis.URL.revokeObjectURL(url);
  } catch { toast.error('Export failed'); }
}

async function handleTemplateDownload() {
  try {
    const { data } = await customersAPI.exportTemplate('xlsx');
    const url = globalThis.URL.createObjectURL(new Blob([data]));
    const a = document.createElement('a'); a.href = url; a.download = 'customer_template.xlsx'; a.click();
    globalThis.URL.revokeObjectURL(url);
  } catch { toast.error('Download failed'); }
}

function getTypeName(c) { return c.customer_type_detail?.name || ''; }

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [customerTypes, setCustomerTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({
      is_active: '',
      customer_type: '',
      page: 1
    });
  const [totalPages, setTotalPages] = useState(1);
  const [selected, setSelected] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState('create');
  const [activeTab, setActiveTab] = useState('manual');
  const [importFile, setImportFile] = useState(null);
  const [form, setForm] = useState(emptyForm());
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    customerTypesAPI.list().then(({ data }) => setCustomerTypes(data)).catch(() => {});
  }, []);

  const loadCustomers = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page: filters.page, search };
      if (filters.is_active !== '') params.is_active = filters.is_active;
      if (filters.customer_type) params.customer_type = filters.customer_type;
      const { data } = await customersAPI.list(params);
      setCustomers(data.results || data);
      setTotalPages(Math.ceil((data.count || 0) / 20) || 1);
    } catch { toast.error('Failed to load customers'); }
    finally { setLoading(false); }
  }, [filters, search]);

  useEffect(() => { loadCustomers(); }, [loadCustomers]);

  function openCreate() { setForm(emptyForm()); setDialogMode('create'); setActiveTab('manual'); setDialogOpen(true); }
  function openEdit(customer) {
    setForm({ ...customer, customer_type: customer.customer_type_detail?.id || customer.customer_type || '' });
    setDialogMode('edit'); setActiveTab('manual'); setDialogOpen(true);
  }

  async function handleSave(e) {
    e.preventDefault(); setSaving(true);
    try {
      const payload = { ...form }; if (!payload.customer_type) payload.customer_type = null;
      if (dialogMode === 'create') { await customersAPI.create(payload); toast.success('Customer created'); }
      else { await customersAPI.update(payload.id, payload); toast.success('Customer updated'); }
      setDialogOpen(false); loadCustomers();
    } catch (err) {
      const msg = err.response?.data;
      toast.error(msg && typeof msg === 'object' ? Object.values(msg).flat().join(', ') : 'Save failed');
    } finally { setSaving(false); }
  }

  async function handleDelete(id) {
    if (!confirm('Delete this customer?')) return;
    try { await customersAPI.delete(id); toast.success('Customer deleted'); setSelected(null); loadCustomers(); }
    catch { toast.error('Delete failed'); }
  }

  async function handleImport() {
    if (!importFile) return;
    setSaving(true);
    try {
      const { data } = await customersAPI.import(importFile);
      toast.success(data.message || `${data.created} customers imported`);
      setDialogOpen(false); setImportFile(null); loadCustomers();
    } catch (err) { toast.error(err.response?.data?.error || 'Import failed'); }
    finally { setSaving(false); }
  }

  return (
    <div className="space-y-4">
      <PageHeader title="Customers">
        <Button variant="secondary" icon={Download} onClick={handleExport}>Export</Button>
        <Button icon={Plus} onClick={openCreate}>Add Customer</Button>
      </PageHeader>

      <CustomerStats customers={customers} />

      <FilterBar>
        <SearchInput placeholder="Search customers..." value={search} onChange={(e) => { setSearch(e.target.value); setFilters({ ...filters, page: 1 }); }} />
        <Select value={filters.is_active} onChange={(e) => setFilters({ ...filters, is_active: e.target.value, page: 1 })} options={[{ value: 'true', label: 'Active' }, { value: 'false', label: 'Inactive' }]} placeholder="All Status" className="w-auto" />
        <Select value={filters.customer_type} onChange={(e) => setFilters({ ...filters, customer_type: e.target.value, page: 1 })} options={customerTypes.map((ct) => ({ value: ct.id, label: ct.name }))} placeholder="All Types" className="w-auto" />
        <button onClick={loadCustomers} className="p-2 u-text-3 hover:u-text hover:u-bg-subtle rounded-lg">
          <RefreshCw className="h-4 w-4" />
        </button>
      </FilterBar>

      <CustomerTable customers={customers} loading={loading} page={filters.page} totalPages={totalPages}
        onPageChange={(p) => setFilters({ ...filters, page: p })} onSelect={setSelected} onEdit={openEdit} onDelete={handleDelete} getTypeName={getTypeName} />

      {selected && <CustomerDetail customer={selected} onClose={() => setSelected(null)} onEdit={openEdit} onDelete={handleDelete} getTypeName={getTypeName} />}

      {dialogOpen && (
        <Modal maxWidth="max-w-2xl">
          <Modal.Header onClose={() => setDialogOpen(false)}>
            {dialogMode === 'create' ? 'Add Customer' : 'Edit Customer'}
          </Modal.Header>
          {dialogMode === 'create' && (
            <div className="flex border-b px-5" style={{ borderColor: 'var(--border)' }}>
              {['manual', 'excel'].map((tab) => (
                <button key={tab} onClick={() => setActiveTab(tab)}
                  className={classNames('px-4 py-3 text-sm font-medium border-b-2 -mb-px capitalize',
                    activeTab === tab ? 'u-text-brand' : 'border-transparent u-text-3 hover:u-text-2')}
                  style={activeTab === tab ? { borderBottomColor: 'var(--brand)' } : {}}>
                  {tab === 'excel' ? 'Excel Import' : 'Manual Entry'}
                </button>
              ))}
            </div>
          )}
          {activeTab === 'manual'
            ? <CustomerForm form={form} setForm={setForm} customerTypes={customerTypes} saving={saving} dialogMode={dialogMode} onSave={handleSave} onClose={() => setDialogOpen(false)} />
            : <CustomerImport importFile={importFile} setImportFile={setImportFile} saving={saving} onImport={handleImport} onClose={() => setDialogOpen(false)} onTemplateDownload={handleTemplateDownload} />
          }
        </Modal>
      )}
    </div>
  );
}
