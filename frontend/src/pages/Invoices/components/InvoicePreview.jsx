import { PDFViewer } from '@react-pdf/renderer';
import { GSTLogoInvoice } from './templates/GSTLogoInvoice';
import { ChallanInvoice } from './templates/ChallanInvoice';
import { GSTEInvoice } from './templates/GSTEInvoice';
import { FileText } from 'lucide-react';

function TemplateComponent({ invoice, profile }) {
  switch (invoice?.invoice_type) {
    case 'gst_logo':     return <GSTLogoInvoice invoice={invoice} profile={profile} />;
    case 'challan':      return <ChallanInvoice invoice={invoice} profile={profile} />;
    case 'gst_einvoice': return <GSTEInvoice invoice={invoice} profile={profile} />;
    default:             return null;
  }
}

export function InvoicePreview({ invoice, profile }) {
  const ready = invoice?.invoice_type && invoice?.buyer_name;

  if (!ready) {
    return (
      <div className="flex flex-col items-center justify-center h-full u-text-3 gap-3">
        <FileText className="h-12 w-12 opacity-20" />
        <p className="text-sm">Fill in the form to see a live preview</p>
      </div>
    );
  }

  return (
    <PDFViewer width="100%" height="100%" showToolbar={false} style={{ border: 'none' }}>
      <TemplateComponent invoice={invoice} profile={profile} />
    </PDFViewer>
  );
}

// Re-export for use in download/print
export { TemplateComponent as InvoiceDocument };
