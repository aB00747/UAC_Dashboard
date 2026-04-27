export default function TotalsElement({ props, liveData }) {
  const fmt = v => parseFloat(v || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 });
  const row = (label, value) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 6px', fontSize: props.fontSize, color: props.rowColor }}>
      <span>{label}</span><span>&#8377; {fmt(value)}</span>
    </div>
  );
  return (
    <div style={{ width: '100%', height: '100%', boxSizing: 'border-box' }}>
      {row('Subtotal', liveData?.subtotal)}
      {props.showCgst && row(`CGST @${liveData?.cgst_rate ?? 2.5}%`, liveData?.cgst_amount)}
      {props.showSgst && row(`SGST @${liveData?.sgst_rate ?? 2.5}%`, liveData?.sgst_amount)}
      {props.showIgst && row(`IGST @${liveData?.igst_rate ?? 0}%`, liveData?.igst_amount)}
      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 6px', fontSize: props.fontSize, fontWeight: 'bold', background: props.grandTotalBg, color: props.grandTotalColor, marginTop: 2, borderRadius: 2 }}>
        <span>Grand Total</span><span>&#8377; {fmt(liveData?.grand_total)}</span>
      </div>
    </div>
  );
}
