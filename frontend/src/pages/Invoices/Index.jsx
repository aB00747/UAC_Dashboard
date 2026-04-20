import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Eye, Download, Copy, Trash2, FileText } from 'lucide-react';
import { pdf } from '@react-pdf/renderer';
import { Button, Badge, Modal } from '../../components/ui';
import { PageHeader, FilterBar, FormField } from '../../components/common';
import { PageSpinner } from '../../components/ui/Spinner';
import { AuditLogDrawer } from '../../components/common/AuditLogDrawer';
import { InvoiceDocument } from './components/InvoicePreview';
import { invoicesAPI } from '../../api/invoices';
import { formatDateTime } from '../../utils/format';
import toast from 'react-hot-toast';

const TYPE_LABELS = {
  gst_logo: 'GST Logo',
  challan: 'Challan',
  gst_einvoice: 'GST e-Invoice',
};

const TYPE_COLORS = {
  gst_logo:    'bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  challan:     'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  gst_einvoice:'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400',
};

const STATUS_COLORS = {
  draft: 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  final: 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400',
};

export default function InvoiceHistory() {
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ search: '', invoice_type: '', status: '' });
  const [previewInvoice, setPreviewInvoice] = useState(null);

  useEffect(() => { loadInvoices(); }, [filters]);

  async function loadInvoices() {
    setLoading(true);
    try {
      const params = {};
      if (filters.search) params.search = filters.search;
      if (filters.invoice_type) params.invoice_type = filters.invoice_type;
      if (filters.status) params.status = filters.status;
      const { data } = await invoicesAPI.list(params);
      setInvoices(data.results || data || []);
    } catch {
      toast.error('Failed to load invoices');
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id) {
    if (!confirm('Delete this invoice?')) return;
    try {
      await invoicesAPI.delete(id);
      toast.success('Invoice deleted');
      loadInvoices();
    } catch {
      toast.error('Delete failed');
    }
  }

  async function handleDuplicate(invoice) {
    navigate('/invoices/new', { state: { duplicate: invoice } });
  }

  async function handleDownloadPDF(invoice) {
    try {
      toast.loading('Generating PDF…', { id: `pdf-${invoice.id}` });
      const { data: full } = await invoicesAPI.get(invoice.id);
      const blob = await pdf(<InvoiceDocument invoice={full} profile={full.company_profile_data} />).toBlob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `invoice-${invoice.invoice_number}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Downloaded', { id: `pdf-${invoice.id}` });
    } catch {
      toast.error('PDF failed', { id: `pdf-${invoice.id}` });
    }
  }

  const fmt = (n) => parseFloat(n || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 });

  if (loading) return <PageSpinner />;

  return (
    <div className="space-y-4">
      <PageHeader title="Invoices">
        <Button icon={Plus} onClick={() => navigate('/invoices/new')}>New Invoice</Button>
      </PageHeader>

      <FilterBar>
        <input
          className="u-input px-3 py-1.5 rounded-lg text-sm w-48"
          placeholder="Search buyer / number…"
          value={filters.search}
          onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
        />
        <select className="u-input px-3 py-1.5 rounded-lg text-sm"
          value={filters.invoice_type} onChange={(e) => setFilters((f) => ({ ...f, invoice_type: e.target.value }))}>
          <option value="">All Types</option>
          {Object.entries(TYPE_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
        <select className="u-input px-3 py-1.5 rounded-lg text-sm"
          value={filters.status} onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value }))}>
          <option value="">All Status</option>
          <option value="draft">Draft</option>
          <option value="final">Final</option>
        </select>
      </FilterBar>

      {/* Table */}
      <div className="u-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left u-text-3 text-xs font-medium" style={{ borderColor: 'var(--border)' }}>
                <th className="px-4 py-3">Invoice No.</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Buyer</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3 text-right">Amount</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((inv) => (
                <tr key={inv.id} className="border-b hover:u-bg-surface-2 transition-colors" style={{ borderColor: 'var(--border)' }}>
                  <td className="px-4 py-3 font-medium u-text">{inv.invoice_number}</td>
                  <td className="px-4 py-3 u-text-2">{inv.invoice_date}</td>
                  <td className="px-4 py-3 u-text">{inv.buyer_name}</td>
                  <td className="px-4 py-3">
                    <Badge colorMap={TYPE_COLORS} value={inv.invoice_type}>
                      {TYPE_LABELS[inv.invoice_type] || inv.invoice_type}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-right font-medium u-text">₹ {fmt(inv.grand_total)}</td>
                  <td className="px-4 py-3">
                    <Badge colorMap={STATUS_COLORS} value={inv.status}>{inv.status}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => navigate(`/invoices/${inv.id}/edit`)}
                        className="p-1.5 u-text-3 hover:u-text rounded" title="Edit">
                        <Eye className="h-3.5 w-3.5" />
                      </button>
                      <button onClick={() => handleDownloadPDF(inv)}
                        className="p-1.5 u-text-3 hover:u-text rounded" title="Download PDF">
                        <Download className="h-3.5 w-3.5" />
                      </button>
                      <button onClick={() => handleDuplicate(inv)}
                        className="p-1.5 u-text-3 hover:u-text rounded" title="Duplicate">
                        <Copy className="h-3.5 w-3.5" />
                      </button>
                      <button onClick={() => handleDelete(inv.id)}
                        className="p-1.5 text-red-400 hover:text-red-600 rounded" title="Delete">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {invoices.length === 0 && (
            <div className="text-center py-12 u-text-3">
              <FileText className="h-10 w-10 mx-auto mb-2 opacity-20" />
              <p>No invoices yet</p>
              <Button className="mt-3" icon={Plus} onClick={() => navigate('/invoices/new')}>
                Create First Invoice
              </Button>
            </div>
          )}
        </div>
      </div>

      <AuditLogDrawer module="invoices" />
    </div>
  );
}
