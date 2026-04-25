import { Document, Page, View, Text, StyleSheet } from '@react-pdf/renderer';
import { amountToWords } from '../../../../utils/invoiceUtils';
import './pdfFonts';

const BLUE = '#1a3a7c';
const LIGHT_BLUE = '#e8edf8';

const s = StyleSheet.create({
  page: { fontSize: 8, fontFamily: 'Roboto', padding: 20, backgroundColor: '#fff' },
  header: { flexDirection: 'row', borderBottom: `2pt solid ${BLUE}`, paddingBottom: 6, marginBottom: 6 },
  leftBrand: { width: '35%', padding: '4 6', borderRight: `1pt solid #ccc` },
  brandName: { fontSize: 10, fontFamily: 'Roboto-Bold', color: BLUE, marginBottom: 2 },
  tagline: { fontSize: 9, fontFamily: 'Roboto-Bold', color: '#e74c3c', marginBottom: 3 },
  category: { fontSize: 7, color: BLUE, marginBottom: 1 },
  rightCompany: { flex: 1, paddingLeft: 10 },
  companyName: { fontSize: 10, fontFamily: 'Roboto-Bold', color: BLUE },
  companyTagline: { fontSize: 7, color: '#555', marginBottom: 2 },
  companyDetail: { fontSize: 7, color: '#333', lineHeight: 1.4 },
  docTitle: { textAlign: 'center', fontFamily: 'Roboto-Bold', fontSize: 10, color: BLUE, textDecoration: 'underline', marginVertical: 4 },
  custRow: { flexDirection: 'row', borderBottom: `1pt solid #ccc`, marginBottom: 4, paddingBottom: 4 },
  custLeft: { flex: 1, borderRight: `1pt solid #ccc`, paddingRight: 6 },
  custRight: { width: '40%', paddingLeft: 6 },
  fieldRow: { flexDirection: 'row', marginBottom: 2.5 },
  fieldLabel: { fontFamily: 'Roboto-Bold', width: 55, color: '#333', fontSize: 7.5 },
  fieldValue: { flex: 1, borderBottom: `0.5pt solid #aaa`, paddingBottom: 1 },
  tableHeader: { flexDirection: 'row', backgroundColor: BLUE, color: '#fff', fontFamily: 'Roboto-Bold', fontSize: 7.5 },
  tableRow: { flexDirection: 'row', borderBottom: `0.5pt solid #ddd` },
  tableRowAlt: { flexDirection: 'row', borderBottom: `0.5pt solid #ddd`, backgroundColor: LIGHT_BLUE },
  cellCode: { width: '10%', padding: '3 2', textAlign: 'center' },
  cellDesc: { flex: 1, padding: '3 4' },
  cellWt: { width: '13%', padding: '3 2', textAlign: 'right' },
  cellRate: { width: '12%', padding: '3 2', textAlign: 'right' },
  cellUnit: { width: '10%', padding: '3 2', textAlign: 'center' },
  cellAmt: { width: '15%', padding: '3 4', textAlign: 'right' },
  footerRow: { flexDirection: 'row', marginTop: 6 },
  termsBox: { flex: 1, paddingRight: 10 },
  termsTitle: { fontFamily: 'Roboto-Bold', fontSize: 7.5, marginBottom: 3, color: BLUE },
  termItem: { fontSize: 6.5, color: '#444', lineHeight: 1.4, marginBottom: 1 },
  totalsBox: { width: '42%' },
  totalLine: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 1.5, borderBottom: `0.5pt solid #eee` },
  grandLine: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: BLUE, color: '#fff', padding: '3 4', marginTop: 2, borderRadius: 2 },
  grandLabel: { fontFamily: 'Roboto-Bold' },
  amtWords: { marginTop: 4, fontSize: 7.5, fontFamily: 'Roboto-Bold' },
  containerTable: { marginTop: 8, border: `1pt solid ${BLUE}` },
  containerHeader: { flexDirection: 'row', backgroundColor: BLUE, color: '#fff', fontFamily: 'Roboto-Bold', fontSize: 7 },
  containerCell: { flex: 1, padding: '3 4', textAlign: 'center', borderRight: `0.5pt solid #ccc` },
  containerCellLast: { flex: 1.5, padding: '3 4', textAlign: 'center', backgroundColor: LIGHT_BLUE },
  signBox: { marginTop: 6, flexDirection: 'row', justifyContent: 'space-between' },
  signLabel: { fontSize: 7, color: '#555', borderTop: `0.5pt solid #888`, paddingTop: 2, width: 100, textAlign: 'center' },
});

const TERMS = [
  'Interest at 24% p.a. after due date.',
  'Containers supplied with our acid are returnable to Bhosari.',
  'Goods once sold cannot be taken back.',
  'Goods should be properly examined before delivery.',
  'Payment only A/c Payee Cheque / D.D.',
  'Sold Chemicals are not for medical use.',
  'Sold Chemicals should be tested before use.',
  'We are not responsible for breakage in transit.',
  'Subject to Pune Jurisdiction.',
  'We are not responsible for any losses or damages of any nature.',
  'If containers are broken or cracked ₹90/- per Carboy cost will be charged.',
];

export function ChallanInvoice({ invoice, profile }) {
  const items = invoice.line_items || [];
  const subtotal = parseFloat(invoice.subtotal) || 0;
  const cgst = parseFloat(invoice.cgst_amount) || 0;
  const sgst = parseFloat(invoice.sgst_amount) || 0;
  const grand = parseFloat(invoice.grand_total) || 0;
  const fmt = (n) => parseFloat(n || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 });

  return (
    <Document>
      <Page size="A4" style={s.page}>
        <View style={s.header}>
          {/* <View style={s.leftBrand}>
            <Text style={s.brandName}>|| श्री ||</Text>
            <Text style={s.tagline}>Sure Purity</Text>
            <Text style={s.category}>Acids</Text>
            <Text style={s.category}>Chemicals</Text>
            <Text style={s.category}>Solvents</Text>
          </View> */}
          <View style={s.rightCompany}>
            <Text style={s.companyName}>{profile?.name || 'RIDDHI CHEMICALS'}</Text>
            <Text style={s.companyTagline}>DEALERS IN ALL TYPE OF ACIDS &amp; CHEMICALS</Text>
            <Text style={s.companyDetail}>{profile?.address}</Text>
            {profile?.email && <Text style={s.companyDetail}>EMAIL: {profile.email}</Text>}
            <Text style={s.companyDetail}>GSTIN No.: {profile?.gstin}</Text>
            <Text style={s.companyDetail}>STATE: {profile?.state}   STATE CODE: {profile?.state_code}</Text>
            <Text style={s.companyDetail}>PAN No.: {profile?.pan}</Text>
          </View>
        </View>

        <Text style={s.docTitle}>CHALLAN CUM INVOICE</Text>

        <View style={s.custRow}>
          <View style={s.custLeft}>
            <View style={s.fieldRow}>
              <Text style={s.fieldLabel}>M/s:</Text>
              <Text style={[s.fieldValue, { fontFamily: 'Roboto-Bold' }]}>{invoice.buyer_name}</Text>
            </View>
            <Text style={{ fontSize: 7.5, marginLeft: 55, marginTop: 1 }}>{invoice.buyer_address}</Text>
          </View>
          <View style={s.custRight}>
            {[['Challan No:', invoice.challan_no || invoice.invoice_number], ['Dt:', invoice.invoice_date],
              ['Order No:', invoice.buyer_order_no || '—'], ['Vehicle No:', invoice.vehicle_no || '—']].map(([label, val]) => (
              <View key={label} style={s.fieldRow}>
                <Text style={s.fieldLabel}>{label}</Text>
                <Text style={s.fieldValue}>{val}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={{ border: `1pt solid ${BLUE}`, marginBottom: 4 }}>
          <View style={s.tableHeader}>
            <Text style={s.cellCode}>Item Code</Text>
            <Text style={s.cellDesc}>Description</Text>
            <Text style={s.cellWt}>Weight</Text>
            <Text style={s.cellRate}>Rate ₹</Text>
            <Text style={s.cellUnit}>Unit</Text>
            <Text style={s.cellAmt}>Amount ₹</Text>
          </View>
          {items.map((item, i) => (
            <View key={i} style={i % 2 === 0 ? s.tableRow : s.tableRowAlt}>
              <Text style={s.cellCode}>{item.hsn}</Text>
              <Text style={s.cellDesc}>{item.description}</Text>
              <Text style={s.cellWt}>{item.qty} {item.unit}</Text>
              <Text style={s.cellRate}>{fmt(item.rate)}</Text>
              <Text style={s.cellUnit}>{item.unit}</Text>
              <Text style={s.cellAmt}>{fmt(item.amount)}</Text>
            </View>
          ))}
        </View>

        <View style={s.footerRow}>
          <View style={s.termsBox}>
            <Text style={s.amtWords}>₹ {amountToWords(grand)}</Text>
            <Text style={[s.termsTitle, { marginTop: 6 }]}>Terms &amp; Conditions:</Text>
            {TERMS.map((t, i) => <Text key={i} style={s.termItem}>{i + 1}. {t}</Text>)}
          </View>
          <View style={s.totalsBox}>
            {[['Total Amount Before Tax', fmt(subtotal)],
              [`Add CGST ${invoice.cgst_rate}%`, fmt(cgst)],
              [`Add SGST ${invoice.sgst_rate}%`, fmt(sgst)],
              ['Tax Amount GST', fmt(cgst + sgst)]].map(([label, val]) => (
              <View key={label} style={s.totalLine}>
                <Text>{label}</Text><Text>{val}</Text>
              </View>
            ))}
            <View style={s.grandLine}>
              <Text style={s.grandLabel}>GRAND TOTAL:</Text>
              <Text style={s.grandLabel}>₹ {fmt(grand)}</Text>
            </View>
          </View>
        </View>

        <View style={s.containerTable}>
          <View style={s.containerHeader}>
            {['Opening Balance', 'Delivered', 'Empty Returned', 'Balance B/F'].map((h) => (
              <Text key={h} style={s.containerCell}>{h}</Text>
            ))}
            <Text style={s.containerCellLast}>For {(profile?.name || 'RIDDHI CHEMICALS').toUpperCase()}</Text>
          </View>
          <View style={{ flexDirection: 'row', minHeight: 20 }}>
            {[0, 1, 2, 3].map((i) => <View key={i} style={[s.containerCell, { minHeight: 20 }]} />)}
            <View style={[s.containerCellLast, { minHeight: 20 }]} />
          </View>
        </View>

        <View style={s.signBox}>
          <Text style={s.signLabel}>Receiver's Signature &amp; Stamp</Text>
          <Text style={[s.signLabel, { textAlign: 'right' }]}>For {profile?.name || 'RIDDHI CHEMICALS'}</Text>
        </View>
      </Page>
    </Document>
  );
}
