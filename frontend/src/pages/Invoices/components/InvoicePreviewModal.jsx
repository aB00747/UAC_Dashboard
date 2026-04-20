import { PDFViewer } from '@react-pdf/renderer';
import { X } from 'lucide-react';
import { InvoiceDocument } from './InvoicePreview';

export function InvoicePreviewModal({ invoice, profile, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col" style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}>
      <div className="flex items-center justify-between px-4 py-2 bg-gray-900 text-white">
        <span className="text-sm font-medium">Invoice Preview — {invoice?.invoice_number}</span>
        <button onClick={onClose} className="p-1.5 hover:bg-gray-700 rounded">
          <X className="h-4 w-4" />
        </button>
      </div>
      <div className="flex-1">
        <PDFViewer width="100%" height="100%" style={{ border: 'none' }}>
          <InvoiceDocument invoice={invoice} profile={profile} />
        </PDFViewer>
      </div>
    </div>
  );
}
