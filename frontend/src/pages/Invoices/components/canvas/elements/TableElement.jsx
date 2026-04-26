const COL_LABELS = { description: 'Description', hsn: 'HSN', qty: 'Qty', unit: 'Unit', rate: 'Rate', amount: 'Amount', discount: 'Discount' };
const COL_WIDTHS = { description: '35%', hsn: '12%', qty: '10%', unit: '8%', rate: '12%', amount: '13%', discount: '10%' };

export default function TableElement({ props, liveData }) {
  const cols = props.columns || ['description', 'hsn', 'qty', 'rate', 'amount'];
  const items = liveData?.line_items || [{ description: 'Sample item', hsn: '2804', qty: '10', rate: '100.00', amount: '1,000.00' }];
  const hStyle = { background: props.headerBg, color: props.headerColor, fontSize: props.fontSize, fontWeight: 'bold', padding: '2px 4px', borderRight: `${props.borderWidth}px solid ${props.borderColor}` };
  const rowStyle = (i) => ({ background: i % 2 === 0 ? props.oddRowBg : props.evenRowBg, fontSize: props.fontSize, padding: '2px 4px', borderRight: `${props.borderWidth}px solid ${props.borderColor}`, borderBottom: `${props.borderWidth}px solid ${props.borderColor}` });

  return (
    <div style={{ width: '100%', height: '100%', overflow: 'hidden', border: `${props.borderWidth}px solid ${props.borderColor}`, boxSizing: 'border-box' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
        <thead>
          <tr>{cols.map(c => <th key={c} style={{ ...hStyle, width: COL_WIDTHS[c] }}>{COL_LABELS[c]}</th>)}</tr>
        </thead>
        <tbody>
          {items.map((item, i) => (
            <tr key={i}>{cols.map(c => <td key={c} style={rowStyle(i)}>{item[c] ?? ''}</td>)}</tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
