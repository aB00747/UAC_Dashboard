import { useState, useEffect } from 'react';
import { Plus, Trash2, ChevronRight, ChevronLeft } from 'lucide-react';
import { Button } from '../../../components/ui';
import { FormField } from '../../../components/common';
import { invoicesAPI } from '../../../api/invoices';
import { calcTotals } from '../../../utils/invoiceUtils';
import toast from 'react-hot-toast';

const INVOICE_TYPES = [
  { value: 'gst_logo', label: 'GST Tax Invoice with Logo (Parth Chem / KIL-TON)' },
  { value: 'challan', label: 'Challan Cum Invoice (Riddhi Chemicals)' },
  { value: 'gst_einvoice', label: 'GST Tax Invoice e-Invoice (Gayatri Acid)' },
];

const UNITS = ['kgs', 'ltr', 'nos', 'pcs', 'mtr', 'box'];

function emptyItem() {
  return { description: '', hsn: '', qty: '', unit: 'kgs', rate: '', amount: '' };
}

export function InvoiceForm({ value, onChange, profiles }) {
  const [step, setStep] = useState(1);

  function update(field, val) {
    const next = { ...value, [field]: val };
    if (['line_items', 'cgst_rate', 'sgst_rate', 'igst_rate'].includes(field)) {
      const totals = calcTotals(
        next.line_items || [],
        parseFloat(next.cgst_rate) || 0,
        parseFloat(next.sgst_rate) || 0,
        parseFloat(next.igst_rate) || 0,
      );
      Object.assign(next, {
        subtotal: totals.subtotal,
        cgst_amount: totals.cgstAmount,
        sgst_amount: totals.sgstAmount,
        igst_amount: totals.igstAmount,
        grand_total: totals.grandTotal,
      });
    }
    onChange(next);
  }

  function updateItem(index, field, val) {
    const items = [...(value.line_items || [])];
    items[index] = { ...items[index], [field]: val };
    if (field === 'qty' || field === 'rate') {
      const qty = parseFloat(field === 'qty' ? val : items[index].qty) || 0;
      const rate = parseFloat(field === 'rate' ? val : items[index].rate) || 0;
      items[index].amount = (qty * rate).toFixed(2);
    }
    update('line_items', items);
  }

  function addItem() { update('line_items', [...(value.line_items || []), emptyItem()]); }
  function removeItem(i) {
    const items = (value.line_items || []).filter((_, idx) => idx !== i);
    update('line_items', items);
  }

  const fmt = (n) => n ? parseFloat(n).toLocaleString('en-IN', { minimumFractionDigits: 2 }) : '0.00';

  const steps = [
    { label: 'Type', num: 1 },
    { label: 'Details', num: 2 },
    { label: 'Buyer', num: 3 },
    { label: 'Items', num: 4 },
    { label: 'Tax', num: 5 },
  ];

  return (
    <div className="flex flex-col h-full">
      {/* Step indicator */}
      <div className="flex items-center gap-1 mb-4 flex-wrap">
        {steps.map((s, i) => (
          <div key={s.num} className="flex items-center gap-1">
            <button
              onClick={() => setStep(s.num)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                step === s.num ? 'u-bg-brand u-text-brand-contrast' : step > s.num ? 'bg-green-100 text-green-700' : 'u-bg-surface-2 u-text-3'
              }`}
            >
              <span className="w-4 h-4 rounded-full flex items-center justify-center text-xs">{s.num}</span>
              {s.label}
            </button>
            {i < steps.length - 1 && <ChevronRight className="h-3 w-3 u-text-3" />}
          </div>
        ))}
      </div>

      {/* Step content */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1">

        {/* Step 1 */}
        {step === 1 && (
          <>
            <div>
              <label className="block text-sm font-medium u-text-2 mb-1">Invoice Type</label>
              <select className="u-input w-full px-3 py-2 rounded-lg text-sm" value={value.invoice_type || ''}
                onChange={(e) => update('invoice_type', e.target.value)}>
                <option value="">Select type…</option>
                {INVOICE_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium u-text-2 mb-1">Seller Profile</label>
              <select className="u-input w-full px-3 py-2 rounded-lg text-sm" value={value.company_profile || ''}
                onChange={(e) => update('company_profile', e.target.value)}>
                <option value="">Select profile…</option>
                {(profiles || []).map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
          </>
        )}

        {/* Step 2 */}
        {step === 2 && (
          <>
            <FormField label="Invoice Number" value={value.invoice_number || ''} onChange={(v) => update('invoice_number', v)} />
            <FormField label="Invoice Date" type="date" value={value.invoice_date || ''} onChange={(v) => update('invoice_date', v)} />
            <FormField label="Vehicle Number" value={value.vehicle_no || ''} onChange={(v) => update('vehicle_no', v)} />
            <FormField label="Buyer's Order No" value={value.buyer_order_no || ''} onChange={(v) => update('buyer_order_no', v)} />
            <FormField label="Delivery Note No" value={value.delivery_note_no || ''} onChange={(v) => update('delivery_note_no', v)} />
            {value.invoice_type === 'gst_einvoice' && (
              <div className="p-3 rounded-lg u-bg-surface-2 space-y-3">
                <p className="text-xs font-medium u-text-2">e-Invoice Fields (fill after portal submission)</p>
                <FormField label="IRN" value={value.irn || ''} onChange={(v) => update('irn', v)} placeholder="Pending — paste after portal" />
                <FormField label="Ack No" value={value.ack_no || ''} onChange={(v) => update('ack_no', v)} placeholder="Pending" />
                <FormField label="Ack Date" type="date" value={value.ack_date || ''} onChange={(v) => update('ack_date', v)} />
              </div>
            )}
          </>
        )}

        {/* Step 3 */}
        {step === 3 && (
          <>
            <FormField label="Buyer Company Name" value={value.buyer_name || ''} onChange={(v) => update('buyer_name', v)} />
            <div>
              <label className="block text-sm font-medium u-text-2 mb-1">Buyer Address</label>
              <textarea className="u-input w-full px-3 py-2 rounded-lg text-sm" rows={3}
                value={value.buyer_address || ''} onChange={(e) => update('buyer_address', e.target.value)} />
            </div>
            <FormField label="Buyer GSTIN" value={value.buyer_gstin || ''} onChange={(v) => update('buyer_gstin', v)} placeholder="27XXXXX0000X1ZX" />
            <div className="grid grid-cols-2 gap-3">
              <FormField label="State" value={value.buyer_state || ''} onChange={(v) => update('buyer_state', v)} />
              <FormField label="State Code" value={value.buyer_state_code || ''} onChange={(v) => update('buyer_state_code', v)} />
            </div>
          </>
        )}

        {/* Step 4 */}
        {step === 4 && (
          <div className="space-y-2">
            {(value.line_items || []).map((item, i) => (
              <div key={i} className="p-3 rounded-lg u-bg-surface-2 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium u-text-2">Item {i + 1}</span>
                  <button onClick={() => removeItem(i)} className="p-1 text-red-400 hover:text-red-600 rounded">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
                <FormField label="Description" value={item.description} onChange={(v) => updateItem(i, 'description', v)} />
                <div className="grid grid-cols-2 gap-2">
                  <FormField label="HSN Code" value={item.hsn} onChange={(v) => updateItem(i, 'hsn', v)} />
                  <div>
                    <label className="block text-xs font-medium u-text-2 mb-1">Unit</label>
                    <select className="u-input w-full px-2 py-1.5 rounded text-xs" value={item.unit}
                      onChange={(e) => updateItem(i, 'unit', e.target.value)}>
                      {UNITS.map((u) => <option key={u}>{u}</option>)}
                    </select>
                  </div>
                  <FormField label="Quantity" type="number" value={item.qty} onChange={(v) => updateItem(i, 'qty', v)} />
                  <FormField label="Rate (₹)" type="number" value={item.rate} onChange={(v) => updateItem(i, 'rate', v)} />
                </div>
                <div className="text-right text-sm font-medium u-text">
                  Amount: ₹ {fmt(item.amount)}
                </div>
              </div>
            ))}
            <Button variant="secondary" icon={Plus} onClick={addItem} className="w-full">Add Item</Button>
          </div>
        )}

        {/* Step 5 */}
        {step === 5 && (
          <>
            <div className="grid grid-cols-3 gap-3">
              <FormField label="CGST %" type="number" value={value.cgst_rate ?? 2.5} onChange={(v) => update('cgst_rate', v)} />
              <FormField label="SGST %" type="number" value={value.sgst_rate ?? 2.5} onChange={(v) => update('sgst_rate', v)} />
              <FormField label="IGST %" type="number" value={value.igst_rate ?? 0} onChange={(v) => update('igst_rate', v)} />
            </div>
            <div className="p-4 rounded-lg u-bg-surface-2 space-y-2 text-sm">
              {[
                ['Sub Total', fmt(value.subtotal)],
                [`CGST ${value.cgst_rate || 0}%`, fmt(value.cgst_amount)],
                [`SGST ${value.sgst_rate || 0}%`, fmt(value.sgst_amount)],
                ...(parseFloat(value.igst_amount) > 0 ? [[`IGST ${value.igst_rate || 0}%`, fmt(value.igst_amount)]] : []),
              ].map(([label, val]) => (
                <div key={label} className="flex justify-between u-text-2">
                  <span>{label}</span><span>₹ {val}</span>
                </div>
              ))}
              <div className="flex justify-between font-bold u-text border-t pt-2" style={{ borderColor: 'var(--border)' }}>
                <span>Grand Total</span><span>₹ {fmt(value.grand_total)}</span>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Navigation */}
      <div className="flex justify-between pt-3 mt-3 border-t" style={{ borderColor: 'var(--border)' }}>
        <Button variant="secondary" icon={ChevronLeft} onClick={() => setStep((s) => Math.max(1, s - 1))} disabled={step === 1}>
          Back
        </Button>
        {step < 5 ? (
          <Button icon={ChevronRight} onClick={() => setStep((s) => Math.min(5, s + 1))}>Next</Button>
        ) : (
          <span className="text-xs u-text-3 self-center">Use buttons above to save / download</span>
        )}
      </div>
    </div>
  );
}
