import { Document, Page, View, Text, StyleSheet } from '@react-pdf/renderer';
import { amountToWords } from '../../../../utils/invoiceUtils';

const s = StyleSheet.create({
  page: { fontSize: 8, fontFamily: 'Helvetica', padding: 20, backgroundColor: '#fff' },
  border: { border: `1pt solid #333` },
  // IRN block
  irnBox: { borderBottom: `1pt solid #333`, padding: '3 6', flexDirection: 'row', justifyContent: 'space-between' },
  irnLeft: { flex: 1 },
  irnRow: { flexDirection: 'row', marginBottom: 1.5 },
  irnLabel: { fontFamily: 'Helvetica-Bold', width: 55 },
  irnValue: { flex: 1, color: invoice => invoice?.irn ? '#000' : '#aaa' },
  qrBox: { width: 60, height: 60, border: `1pt solid #ccc`, justifyContent: 'center', alignItems: 'center', marginLeft: 8, backgroundColor: '#f5f5f5' },
  qrText: { fontSize: 6, color: '#aaa', textAlign: 'center' },
  // Header
  headerRow: { flexDirection: 'row', borderBottom: `1pt solid #333` },
  sellerBox: { flex: 1, padding: '4 6', borderRight: `1pt solid #333` },
  metaBox: { width: '40%', padding: 4 },
  companyName: { fontSize: 10, fontFamily: 'Helvetica-Bold' },
  companyDetail: { fontSize: 7.5, color: '#333', lineHeight: 1.4 },
  metaRow: { flexDirection: 'row', borderBottom: `0.5pt solid #ccc`, paddingVertical: 2 },
  metaLabel: { fontFamily: 'Helvetica-Bold', width: 90, fontSize: 7.5 },
  metaValue: { flex: 1, fontSize: 7.5 },
  // Title
  titleBox: { textAlign: 'center', padding: '4 0', fontFamily: 'Helvetica-Bold', fontSize: 10, borderBottom: `1pt solid #333` },
  // Buyer
  buyerBox: { padding: '4 6', borderBottom: `1pt solid #333` },
  buyerLabel: { fontFamily: 'Helvetica-Bold', marginBottom: 2 },
  // Table
  tableHeader: { flexDirection: 'row', backgroundColor: '#222', color: '#fff', fontFamily: 'Helvetica-Bold', fontSize: 7.5 },
  tableRow: { flexDirection: 'row', borderBottom: `0.5pt solid #ddd` },
  tableRowAlt: { flexDirection: 'row', borderBottom: `0.5pt solid #ddd`, backgroundColor: '#f9f9f9' },
  cellSl: { width: '5%', padding: '3 2', textAlign: 'center' },
  cellDesc: { flex: 1, padding: '3 4' },
  cellHsn: { width: '11%', padding: '3 2', textAlign: 'center' },
  cellQty: { width: '11%', padding: '3 2', textAlign: 'right' },
  cellRate: { width: '9%', padding: '3 2', textAlign: 'right' },
  cellPer: { width: '7%', padding: '3 2', textAlign: 'center' },
  cellAmt: { width: '13%', padding: '3 4', textAlign: 'right' },
  // Totals
  totalsRow: { flexDirection: 'row', borderTop: `1pt solid #333` },
  totalsLeft: { flex: 1, padding: '3 6', borderRight: `1pt solid #333` },
  totalsRight: { width: '30%', padding: '3 4' },
  totalLine: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 1.5 },
  grandLine: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: '#222', color: '#fff', padding: '3 4', marginTop: 2 },
  // HSN summary
  hsnHeader: { flexDirection: 'row', backgroundColor: '#555', color: '#fff', fontFamily: 'Helvetica-Bold', fontSize: 7 },
  hsnRow: { flexDirection: 'row', borderBottom: `0.5pt solid #ddd`, fontSize: 7 },
  hsnCell: { flex: 1, padding: '2 3', textAlign: 'right' },
  hsnCellFirst: { width: '15%', padding: '2 3' },
  // Footer
  footerSection: { padding: '4 6', borderTop: `1pt solid #333` },
  footerLabel: { fontFamily: 'Helvetica-Bold', marginBottom: 1 },
  signRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 },
  signBox: { width: 100, alignItems: 'center' },
  signLine: { borderTop: `0.5pt solid #333`, width: 80, marginTop: 16, marginBottom: 2 },
  computerGenerated: { textAlign: 'center', fontSize: 7, color: '#666', marginTop: 6, fontFamily: 'Helvetica-Oblique' },
});

export function GSTEInvoice({ invoice, profile }) {
  const items = invoice.line_items || [];
  const subtotal = parseFloat(invoice.subtotal) || 0;
  const cgst = parseFloat(invoice.cgst_amount) || 0;
  const sgst = parseFloat(invoice.sgst_amount) || 0;
  const grand = parseFloat(invoice.grand_total) || 0;
  const fmt = (n) => parseFloat(n || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 });
  const pending = <Text style={{ color: '#aaa', fontFamily: 'Helvetica-Oblique' }}>Pending</Text>;

  // Group line items by HSN for summary table
  const hsnMap = {};
  items.forEach((item) => {
    const k = item.hsn || '—';
    if (!hsnMap[k]) hsnMap[k] = { taxable: 0 };
    hsnMap[k].taxable += parseFloat(item.amount) || 0;
  });

  return (
    <Document>
      <Page size="A4" style={s.page}>
        {/* ── IRN block ── */}
        <View style={[s.border, { marginBottom: 0 }]}>
          <View style={s.irnBox}>
            <View style={s.irnLeft}>
              {[['IRN', invoice.irn], ['Ack No', invoice.ack_no], ['Ack Date', invoice.ack_date]].map(([label, val]) => (
                <View key={label} style={s.irnRow}>
                  <Text style={s.irnLabel}>{label}   :</Text>
                  <Text>{val || <Text style={{ color: '#bbb', fontFamily: 'Helvetica-Oblique' }}>Pending</Text>}</Text>
                </View>
              ))}
            </View>
            <View style={s.qrBox}>
              <Text style={s.qrText}>QR{'\n'}Code{'\n'}Pending</Text>
            </View>
          </View>

          {/* ── Seller / Meta ── */}
          <View style={s.headerRow}>
            <View style={s.sellerBox}>
              <Text style={s.companyName}>{profile?.name || 'GAYATRI ACID & CHEMICALS'}</Text>
              <Text style={s.companyDetail}>{profile?.address}</Text>
              {profile?.email && <Text style={s.companyDetail}>Email: {profile.email}</Text>}
              <Text style={s.companyDetail}>GSTIN/UIN: {profile?.gstin}</Text>
              <Text style={s.companyDetail}>State: {profile?.state}, Code: {profile?.state_code}</Text>
            </View>
            <View style={s.metaBox}>
              {[
                ['Invoice No', invoice.invoice_number],
                ['Dated', invoice.invoice_date],
                ['Delivery Note No', invoice.delivery_note_no || invoice.invoice_number],
                ['Motor Vehicle No', invoice.vehicle_no || '—'],
                ["Buyer's Order No", invoice.buyer_order_no || 'BY PHONE'],
              ].map(([label, val]) => (
                <View key={label} style={s.metaRow}>
                  <Text style={s.metaLabel}>{label}</Text>
                  <Text style={s.metaValue}>{val}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Title */}
          <Text style={s.titleBox}>TAX INVOICE</Text>

          {/* ── Buyer ── */}
          <View style={s.buyerBox}>
            <Text style={s.buyerLabel}>Buyer (Bill to):</Text>
            <Text style={{ fontFamily: 'Helvetica-Bold', fontSize: 8.5 }}>{invoice.buyer_name}</Text>
            <Text style={s.companyDetail}>{invoice.buyer_address}</Text>
            <Text style={s.companyDetail}>GSTIN/UIN: {invoice.buyer_gstin || '—'}</Text>
            <Text style={s.companyDetail}>State: {invoice.buyer_state}, Code: {invoice.buyer_state_code}</Text>
          </View>

          {/* ── Line Items ── */}
          <View style={s.tableHeader}>
            <Text style={s.cellSl}>Sl</Text>
            <Text style={s.cellDesc}>Description of Goods</Text>
            <Text style={s.cellHsn}>HSN/SAC</Text>
            <Text style={s.cellQty}>Quantity</Text>
            <Text style={s.cellRate}>Rate</Text>
            <Text style={s.cellPer}>Per</Text>
            <Text style={s.cellAmt}>Amount</Text>
          </View>
          {items.map((item, i) => (
            <View key={i} style={i % 2 === 0 ? s.tableRow : s.tableRowAlt}>
              <Text style={s.cellSl}>{i + 1}</Text>
              <Text style={s.cellDesc}>{item.description}</Text>
              <Text style={s.cellHsn}>{item.hsn}</Text>
              <Text style={s.cellQty}>{item.qty} {item.unit}</Text>
              <Text style={s.cellRate}>{fmt(item.rate)}</Text>
              <Text style={s.cellPer}>{item.unit}</Text>
              <Text style={s.cellAmt}>{fmt(item.amount)}</Text>
            </View>
          ))}

          {/* ── Totals ── */}
          <View style={s.totalsRow}>
            <View style={s.totalsLeft}>
              <Text style={{ fontFamily: 'Helvetica-Bold', marginBottom: 2 }}>Sub Total</Text>
            </View>
            <View style={s.totalsRight}>
              <View style={s.totalLine}><Text>Sub Total</Text><Text>{fmt(subtotal)}</Text></View>
              <View style={s.totalLine}><Text>Output CGST @ {invoice.cgst_rate}%</Text><Text>{fmt(cgst)}</Text></View>
              <View style={s.totalLine}><Text>Output SGST @ {invoice.sgst_rate}%</Text><Text>{fmt(sgst)}</Text></View>
              <View style={s.grandLine}>
                <Text style={{ fontFamily: 'Helvetica-Bold' }}>GRAND TOTAL (₹)</Text>
                <Text style={{ fontFamily: 'Helvetica-Bold' }}>{fmt(grand)}</Text>
              </View>
            </View>
          </View>

          {/* ── HSN Summary ── */}
          <View style={{ borderTop: `1pt solid #333`, padding: '3 6' }}>
            <Text style={{ fontFamily: 'Helvetica-Bold', marginBottom: 2 }}>HSN/SAC Summary</Text>
            <View style={s.hsnHeader}>
              <Text style={s.hsnCellFirst}>HSN/SAC</Text>
              <Text style={s.hsnCell}>Taxable Value</Text>
              <Text style={s.hsnCell}>CGST Rate</Text>
              <Text style={s.hsnCell}>CGST Amt</Text>
              <Text style={s.hsnCell}>SGST Rate</Text>
              <Text style={s.hsnCell}>SGST Amt</Text>
              <Text style={s.hsnCell}>Total Tax</Text>
            </View>
            {Object.entries(hsnMap).map(([hsn, data]) => {
              const cAmt = (data.taxable * parseFloat(invoice.cgst_rate)) / 100;
              const sAmt = (data.taxable * parseFloat(invoice.sgst_rate)) / 100;
              return (
                <View key={hsn} style={s.hsnRow}>
                  <Text style={s.hsnCellFirst}>{hsn}</Text>
                  <Text style={s.hsnCell}>{fmt(data.taxable)}</Text>
                  <Text style={s.hsnCell}>{invoice.cgst_rate}%</Text>
                  <Text style={s.hsnCell}>{fmt(cAmt)}</Text>
                  <Text style={s.hsnCell}>{invoice.sgst_rate}%</Text>
                  <Text style={s.hsnCell}>{fmt(sAmt)}</Text>
                  <Text style={s.hsnCell}>{fmt(cAmt + sAmt)}</Text>
                </View>
              );
            })}
          </View>

          {/* ── Footer ── */}
          <View style={s.footerSection}>
            <Text style={s.footerLabel}>Amount Chargeable (in words):</Text>
            <Text style={{ fontSize: 8, color: '#222' }}>{amountToWords(grand)}</Text>
            <Text style={[s.footerLabel, { marginTop: 4 }]}>
              Tax Amount (in words): {amountToWords(cgst + sgst)}
            </Text>
            {profile?.pan && <Text style={{ marginTop: 2 }}>Company PAN: {profile.pan}</Text>}
            <Text style={{ fontSize: 6.5, color: '#555', marginTop: 3, lineHeight: 1.4 }}>
              Declaration: We declare that this invoice shows the actual price of the goods described and that all
              particulars are true and correct. The tax amount is as per applicable GST rates.
            </Text>
            {profile?.bank_name && (
              <View style={{ marginTop: 4 }}>
                <Text style={s.footerLabel}>Bank Details:</Text>
                <Text>Bank: {profile.bank_name}   A/c No: {profile.account_no}   IFSC: {profile.ifsc_code}</Text>
              </View>
            )}
          </View>

          {/* Signatures */}
          <View style={[s.signRow, { padding: '0 6 6 6' }]}>
            <View style={s.signBox} />
            <View style={s.signBox}>
              <Text style={{ fontFamily: 'Helvetica-Bold', fontSize: 7.5 }}>
                For {(profile?.name || 'GAYATRI ACID & CHEMICALS').toUpperCase()}
              </Text>
              <View style={s.signLine} />
              <Text style={{ fontSize: 7, color: '#555' }}>Authorised Signatory</Text>
            </View>
          </View>

          <Text style={s.computerGenerated}>This is a Computer Generated Invoice</Text>
        </View>
      </Page>
    </Document>
  );
}
