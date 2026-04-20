import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { pdf } from '@react-pdf/renderer';
import { ArrowLeft, Eye, Download, Printer, Save, ChevronDown, Building2 } from 'lucide-react';
import { Button } from '../../components/ui';
import { PageHeader } from '../../components/common';
import { AuditLogDrawer } from '../../components/common/AuditLogDrawer';
import { InvoiceForm } from './components/InvoiceForm';
import { InvoicePreview, InvoiceDocument } from './components/InvoicePreview';
import { InvoicePreviewModal } from './components/InvoicePreviewModal';
import { CompanyProfileModal } from './components/CompanyProfileModal';
import { invoicesAPI } from '../../api/invoices';
import { calcTotals } from '../../utils/invoiceUtils';
import toast from 'react-hot-toast';

function defaultForm() {
  return {
    invoice_type: 'gst_logo',
    invoice_number: '',
    invoice_date: new Date().toISOString().split('T')[0],
    status: 'draft',
    company_profile: '',
    buyer_name: '',
    buyer_address: '',
    buyer_gstin: '',
    buyer_state: 'Maharashtra',
    buyer_state_code: '27',
    vehicle_no: '',
    buyer_order_no: '',
    delivery_note_no: '',
    irn: '', ack_no: '', ack_date: '',
    line_items: [{ description: '', hsn: '', qty: '', unit: 'kgs', rate: '', amount: '' }],
    cgst_rate: 2.5,
    sgst_rate: 2.5,
    igst_rate: 0,
    subtotal: 0,
    cgst_amount: 0,
    sgst_amount: 0,
    igst_amount: 0,
    grand_total: 0,
  };
}

export default function InvoiceBuilder() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(defaultForm());
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(!!id);
  const [saving, setSaving] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [showProfiles, setShowProfiles] = useState(false);
  const [showDownloadMenu, setShowDownloadMenu] = useState(false);

  const activeProfile = profiles.find((p) => p.id === parseInt(form.company_profile));

  useEffect(() => {
    loadProfiles();
    if (id) loadInvoice();
    else loadNextNumber();
  }, [id]);

  async function loadProfiles() {
    try {
      const { data } = await invoicesAPI.profiles.list();
      const list = data.results || data || [];
      setProfiles(list);
      if (!id && list.length > 0) {
        const def = list.find((p) => p.is_default) || list[0];
        setForm((f) => ({ ...f, company_profile: String(def.id) }));
      }
    } catch { /* ignore */ }
  }

  async function loadNextNumber() {
    try {
      const { data } = await invoicesAPI.nextNumber();
      setForm((f) => ({ ...f, invoice_number: data.next_number }));
    } catch { /* ignore */ }
  }

  async function loadInvoice() {
    try {
      const { data } = await invoicesAPI.get(id);
      setForm({ ...data, company_profile: String(data.company_profile) });
    } catch {
      toast.error('Failed to load invoice');
    } finally {
      setLoading(false);
    }
  }

  async function handleSave(status = 'draft') {
    setSaving(true);
    try {
      const payload = { ...form, status, company_profile: form.company_profile || null };
      if (id) {
        await invoicesAPI.update(id, payload);
      } else {
        const { data } = await invoicesAPI.create(payload);
        navigate(`/invoices/${data.id}/edit`, { replace: true });
      }
      toast.success(status === 'final' ? 'Invoice finalised' : 'Draft saved');
    } catch {
      toast.error('Failed to save invoice');
    } finally {
      setSaving(false);
    }
  }

  async function handleDownloadPDF() {
    setShowDownloadMenu(false);
    try {
      toast.loading('Generating PDF…', { id: 'pdf' });
      const blob = await pdf(<InvoiceDocument invoice={form} profile={activeProfile} />).toBlob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `invoice-${form.invoice_number || 'draft'}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('PDF downloaded', { id: 'pdf' });
      await handleSave('final');
      if (id) await invoicesAPI.finalise(id);
    } catch {
      toast.error('PDF generation failed', { id: 'pdf' });
    }
  }

  async function handleDownloadExcel() {
    setShowDownloadMenu(false);
    try {
      // Backend generates Excel — open as blob download
      const res = await fetch(`/api/invoices/${id}/excel/`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` },
      });
      if (!res.ok) throw new Error('Failed');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `invoice-${form.invoice_number || id}.xlsx`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Excel downloaded');
    } catch {
      toast.error('Excel download failed — save the invoice first');
    }
  }

  async function handlePrint() {
    try {
      const blob = await pdf(<InvoiceDocument invoice={form} profile={activeProfile} />).toBlob();
      const url = URL.createObjectURL(blob);
      const win = window.open(url);
      win?.addEventListener('load', () => { win.print(); URL.revokeObjectURL(url); });
    } catch {
      toast.error('Print failed');
    }
  }

  if (loading) return <div className="flex items-center justify-center h-64"><div className="u-spinner" /></div>;

  return (
    <div className="flex flex-col h-full min-h-0 space-y-0">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/invoices')} className="p-1.5 u-text-3 hover:u-text rounded">
            <ArrowLeft className="h-4 w-4" />
          </button>
          <h1 className="text-lg font-semibold u-text">
            {id ? `Edit Invoice ${form.invoice_number}` : 'New Invoice'}
          </h1>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button onClick={() => setShowProfiles(true)}
            className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg u-bg-surface-2 u-text-2 hover:u-text">
            <Building2 className="h-3.5 w-3.5" />
            {activeProfile?.name || 'No profile'}
          </button>
          <Button variant="secondary" icon={Eye} onClick={() => setShowPreviewModal(true)}>Preview</Button>
          <Button variant="secondary" icon={Save} onClick={() => handleSave('draft')} loading={saving}>
            Save Draft
          </Button>
          <div className="relative">
            <Button icon={Download} onClick={() => setShowDownloadMenu((v) => !v)}>
              Download <ChevronDown className="h-3.5 w-3.5 ml-0.5" />
            </Button>
            {showDownloadMenu && (
              <div className="absolute right-0 top-full mt-1 w-40 rounded-lg shadow-lg u-card py-1 z-30">
                <button onClick={handleDownloadPDF} className="w-full text-left px-4 py-2 text-sm u-text hover:u-bg-surface-2">
                  Download PDF
                </button>
                <button onClick={handleDownloadExcel} className="w-full text-left px-4 py-2 text-sm u-text hover:u-bg-surface-2">
                  Download Excel
                </button>
              </div>
            )}
          </div>
          <Button variant="secondary" icon={Printer} onClick={handlePrint}>Print</Button>
        </div>
      </div>

      {/* Split panel */}
      <div className="flex flex-1 gap-4 min-h-0 overflow-hidden" style={{ height: 'calc(100vh - 200px)' }}>
        {/* Form — 40% */}
        <div className="w-2/5 overflow-y-auto u-card p-4">
          <InvoiceForm value={form} onChange={setForm} profiles={profiles} />
        </div>
        {/* Preview — 60% */}
        <div className="flex-1 overflow-hidden rounded-lg" style={{ backgroundColor: 'var(--surface)' }}>
          <InvoicePreview invoice={form} profile={activeProfile} />
        </div>
      </div>

      <AuditLogDrawer module="invoices" />

      {showPreviewModal && (
        <InvoicePreviewModal invoice={form} profile={activeProfile} onClose={() => setShowPreviewModal(false)} />
      )}
      {showProfiles && (
        <CompanyProfileModal
          profiles={profiles}
          onClose={() => setShowProfiles(false)}
          onSaved={() => { loadProfiles(); setShowProfiles(false); }}
        />
      )}
    </div>
  );
}
