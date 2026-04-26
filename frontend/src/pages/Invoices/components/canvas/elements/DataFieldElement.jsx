export const FIELD_LABELS = {
  invoice_number: 'Invoice No.', invoice_date: 'Date', buyer_name: 'Buyer Name',
  buyer_gstin: 'Buyer GSTIN', buyer_address: 'Buyer Address', buyer_state: 'State',
  vehicle_no: 'Vehicle No.', challan_no: 'Challan No.', grand_total: 'Grand Total',
  company_name: 'Company Name', irn: 'IRN', ack_no: 'Ack No.', ack_date: 'Ack Date',
};

export default function DataFieldElement({ props, liveData }) {
  const value = liveData?.[props.field] ?? `{${props.field}}`;
  const style = {
    width: '100%', height: '100%', fontSize: props.fontSize,
    fontWeight: props.fontWeight, color: props.color,
    background: props.backgroundColor, textAlign: props.textAlign,
    padding: 3, boxSizing: 'border-box', display: 'flex', alignItems: 'center',
    overflow: 'hidden',
  };
  const label = props.label ? `${props.label}: ` : '';
  return <div style={style}><span style={{ opacity: 0.6, marginRight: 2 }}>{label}</span>{value}</div>;
}
