import { Document, Page, View, Text, Image, StyleSheet } from '@react-pdf/renderer';
import { amountToWords } from '../../../../utils/invoiceUtils';
import './pdfFonts';

const MAROON = '#8b0000';
const CREAM = '#fff8f0';
const BORDER = '#c0392b';

const s = StyleSheet.create({
  page: { fontSize: 8, fontFamily: 'Roboto', padding: 20, backgroundColor: '#fff' },
  // Header
  header: { flexDirection: 'row', borderBottom: `2pt solid ${MAROON}`, marginBottom: 4, alignItems: 'stretch' },
  logoBox: { width: '22%', padding: 6, justifyContent: 'center', alignItems: 'center', borderRight: `1pt solid ${BORDER}` },
  logo: { width: 70, height: 36, objectFit: 'contain' },
  titleBox: { width: '30%', justifyContent: 'center', alignItems: 'center', padding: 6 },
  titleText: { fontSize: 11, fontFamily: 'Roboto-Bold', color: MAROON },
  companyBox: { flex: 1, backgroundColor: CREAM, padding: 6, borderLeft: `1pt solid ${BORDER}` },
  companyName: { fontSize: 10, fontFamily: 'Roboto-Bold', color: MAROON },
  companyTagline: { fontSize: 7, color: '#555', marginBottom: 2 },
  companyDetail: { fontSize: 7, color: '#333', lineHeight: 1.4 },
  // Reference block
  refRow: { flexDirection: 'row', borderBottom: `1pt solid #ccc`, marginBottom: 4 },
  refLeft: { flex: 1, padding: '4 6', borderRight: `1pt solid #ccc` },
  refRight: { width: '40%', padding: 4 },
  refGrid: { flexDirection: 'row', marginBottom: 2 },
  refLabel: { width: 70, fontFamily: 'Roboto-Bold', color: '#333' },
  refValue: { flex: 1, borderBottom: `0.5pt solid #999`, paddingBottom: 1 },
  // Fields
  fieldRow: { flexDirection: 'row', marginBottom: 2 },
  fieldLabel: { fontFamily: 'Roboto-Bold', marginRight: 3, color: '#333' },
  fieldValue: { flex: 1, borderBottom: `0.5pt solid #999` },
  // Table
  tableHeader: { flexDirection: 'row', backgroundColor: MAROON, color: '#fff', fontFamily: 'Roboto-Bold', fontSize: 7.5 },
  tableRow: { flexDirection: 'row', borderBottom: `0.5pt solid #ddd` },
  tableRowAlt: { flexDirection: 'row', borderBottom: `0.5pt solid #ddd`, backgroundColor: '#fff5f5' },
  cellSr: { width: '6%', padding: '3 2', textAlign: 'center' },
  cellDesc: { flex: 1, padding: '3 4' },
  cellHsn: { width: '13%', padding: '3 2', textAlign: 'center' },
  cellQty: { width: '10%', padding: '3 2', textAlign: 'right' },
  cellRate: { width: '10%', padding: '3 2', textAlign: 'right' },
  cellAmtHead: { width: '18%', flexDirection: 'row', padding: '3 2' },
  cellAmtRs: { flex: 1, textAlign: 'right' },
  cellAmtPs: { width: 18, textAlign: 'right', borderLeft: `0.5pt solid #ccc` },
  // Footer
  footerRow: { flexDirection: 'row', marginTop: 6 },
  footerLeft: { flex: 1 },
  footerRight: { width: '45%' },
  totalLine: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 1.5 },
  totalLabel: { fontFamily: 'Roboto-Bold', fontSize: 7.5 },
  totalValue: { fontFamily: 'Roboto-Bold', fontSize: 7.5, textAlign: 'right', minWidth: 70 },
  grandTotalRow: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: MAROON, color: '#fff', padding: '3 4', marginTop: 2, borderRadius: 2 },
  bankBox: { marginTop: 6, padding: '4 6', border: `1pt solid #dcc`, backgroundColor: CREAM },
  bankLabel: { fontFamily: 'Roboto-Bold', marginBottom: 2, color: MAROON },
  bottomBar: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8, borderTop: `1pt solid ${MAROON}`, paddingTop: 4 },
  gstinBox: { flex: 1, fontSize: 7, color: '#333' },
  signBox: { width: '35%', alignItems: 'center' },
  signLabel: { fontFamily: 'Roboto-Bold', fontSize: 8, color: MAROON },
  signLine: { borderTop: `0.5pt solid #888`, width: 80, marginTop: 18, marginBottom: 2 },
  declarationText: { fontSize: 6, color: '#555', marginTop: 4, lineHeight: 1.4 },
});

export function GSTLogoInvoice({ invoice, profile }) {
  const items = invoice.line_items || [];
  const subtotal = parseFloat(invoice.subtotal) || 0;
  const cgst = parseFloat(invoice.cgst_amount) || 0;
  const sgst = parseFloat(invoice.sgst_amount) || 0;
  const igst = parseFloat(invoice.igst_amount) || 0;
  const grand = parseFloat(invoice.grand_total) || 0;

  const fmtMoney = (n) => parseFloat(n || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 });

  return (
    <Document>
      <Page size="A4" style={s.page}>

        {/* ── Header ── */}
        <View style={s.header}>
          <View style={s.logoBox}>
            {profile?.logo_base64 ? (
              <Image style={s.logo} src={profile.logo_base64} />
            ) : (
              <Image style={s.logo} src="/KILTON.jpeg" />
            )}
          </View>
          <View style={s.titleBox}>
            <Text style={s.titleText}>GST TAX INVOICE</Text>
          </View>
          <View style={s.companyBox}>
            <Text style={s.companyName}>{profile?.name || 'PARTH CHEM'}</Text>
            <Text style={s.companyTagline}>DEALERS IN ALL TYPE OF ACIDS &amp; CHEMICALS</Text>
            <Text style={s.companyDetail}>{profile?.address}</Text>
            {profile?.email && <Text style={s.companyDetail}>Email: {profile.email}</Text>}
          </View>
        </View>

        {/* ── Reference block ── */}
        <View style={s.refRow}>
          <View style={s.refLeft}>
            <View style={s.fieldRow}>
              <Text style={s.fieldLabel}>To:</Text>
              <Text style={[s.fieldValue, { fontFamily: 'Roboto-Bold' }]}>{invoice.buyer_name}</Text>
            </View>
            <Text style={{ marginTop: 2, fontSize: 7.5 }}>{invoice.buyer_address}</Text>
            <View style={[s.fieldRow, { marginTop: 4 }]}>
              <Text style={s.fieldLabel}>GSTIN No:</Text>
              <Text style={s.fieldValue}>{invoice.buyer_gstin || '—'}</Text>
            </View>
            <View style={s.fieldRow}>
              <Text style={s.fieldLabel}>State:</Text>
              <Text style={s.fieldValue}>{invoice.buyer_state}</Text>
              <Text style={[s.fieldLabel, { marginLeft: 8 }]}>State Code:</Text>
              <Text style={[s.fieldValue, { maxWidth: 30 }]}>{invoice.buyer_state_code}</Text>
            </View>
          </View>
          <View style={s.refRight}>
            {[
              ['Invoice No:', invoice.invoice_number],
              ['Date:', invoice.invoice_date],
              ['Challan No:', invoice.delivery_note_no || '—'],
              ['P.O. No:', invoice.buyer_order_no || '—'],
            ].map(([label, val]) => (
              <View key={label} style={s.refGrid}>
                <Text style={s.refLabel}>{label}</Text>
                <Text style={s.refValue}>{val}</Text>
              </View>
            ))}
            <View style={s.refGrid}>
              <Text style={s.refLabel}>Delivery To:</Text>
              <Text style={s.refValue}>{invoice.vehicle_no || '—'}</Text>
            </View>
          </View>
        </View>

        {/* ── Line Items Table ── */}
        <View style={{ border: `1pt solid ${MAROON}`, marginBottom: 4 }}>
          <View style={s.tableHeader}>
            <Text style={s.cellSr}>Sr.</Text>
            <Text style={s.cellDesc}>Particulars</Text>
            <Text style={s.cellHsn}>HSN Code</Text>
            <Text style={s.cellQty}>Qty.</Text>
            <Text style={s.cellRate}>Rate</Text>
            <View style={s.cellAmtHead}>
              <Text style={[s.cellAmtRs, { color: '#fff' }]}>Amount Rs.</Text>
              <Text style={[s.cellAmtPs, { color: '#fff', borderLeft: 'none' }]}>Ps.</Text>
            </View>
          </View>
          {items.map((item, i) => (
            <View key={i} style={i % 2 === 0 ? s.tableRow : s.tableRowAlt}>
              <Text style={s.cellSr}>{i + 1}</Text>
              <Text style={s.cellDesc}>{item.description}</Text>
              <Text style={s.cellHsn}>{item.hsn}</Text>
              <Text style={s.cellQty}>{item.qty} {item.unit}</Text>
              <Text style={s.cellRate}>{fmtMoney(item.rate)}</Text>
              <View style={s.cellAmtHead}>
                <Text style={s.cellAmtRs}>{fmtMoney(parseFloat(item.amount || 0)).split('.')[0]}</Text>
                <Text style={s.cellAmtPs}>{(parseFloat(item.amount || 0).toFixed(2)).split('.')[1]}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* ── Footer ── */}
        <View style={s.footerRow}>
          <View style={s.footerLeft}>
            <Text style={{ fontSize: 7.5, fontFamily: 'Roboto-Bold', marginBottom: 2 }}>Rupees:</Text>
            <Text style={{ fontSize: 7.5, fontFamily: 'Roboto-Bold', color: MAROON }}>{amountToWords(grand)}</Text>
          </View>
          <View style={s.footerRight}>
            {[
              ['Total Amount Before Tax', fmtMoney(subtotal)],
              [`Add CGST ${invoice.cgst_rate}%`, fmtMoney(cgst)],
              [`Add SGST ${invoice.sgst_rate}%`, fmtMoney(sgst)],
              ...(igst > 0 ? [[`Add IGST ${invoice.igst_rate}%`, fmtMoney(igst)]] : []),
            ].map(([label, val]) => (
              <View key={label} style={s.totalLine}>
                <Text>{label}</Text>
                <Text>{val}</Text>
              </View>
            ))}
            <View style={s.grandTotalRow}>
              <Text style={s.totalLabel}>Grand Total:</Text>
              <Text style={s.totalValue}>₹ {fmtMoney(grand)}</Text>
            </View>
          </View>
        </View>

        {/* Bank details */}
        {profile?.bank_name && (
          <View style={s.bankBox}>
            <Text style={s.bankLabel}>Bank Detail:</Text>
            <Text>Bank Name : {profile.bank_name}</Text>
            <Text>Ac No.    : {profile.account_no}</Text>
            <Text>IFS Code  : {profile.ifsc_code}</Text>
          </View>
        )}

        {/* Bottom bar */}
        <View style={s.bottomBar}>
          <View style={s.gstinBox}>
            <Text style={{ fontFamily: 'Roboto-Bold' }}>
              GSTIN No.: {profile?.gstin}{'   '}STATE: {profile?.state?.toUpperCase()}{'   '}STATE CODE: {profile?.state_code}
            </Text>
            <Text>PAN No.: {profile?.pan}</Text>
            <Text style={s.declarationText}>
              Declaration: We certify that our registration certificate under GST Act 2017 is in force on the date on which
              the supply of goods specified in this invoice is made by us and the transaction of supply covered by this invoice
              has been effected by us. The tax amount is true and correct.
            </Text>
          </View>
          <View style={s.signBox}>
            <Text style={s.signLabel}>FOR {(profile?.name || 'PARTH CHEM').toUpperCase()}</Text>
            <View style={s.signLine} />
            <Text style={{ fontSize: 7, color: '#555' }}>Proprietor</Text>
          </View>
        </View>

      </Page>
    </Document>
  );
}
