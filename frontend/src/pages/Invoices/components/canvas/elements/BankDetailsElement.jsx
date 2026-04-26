export default function BankDetailsElement({ props, profile }) {
  const rows = [
    ['Bank', profile?.bank_name], ['A/C No.', profile?.bank_account],
    ['IFSC', profile?.bank_ifsc], ['Branch', profile?.bank_branch],
  ].filter(([, v]) => v);
  return (
    <div style={{ width: '100%', height: '100%', background: props.backgroundColor, border: props.border, padding: '4px 6px', fontSize: props.fontSize, boxSizing: 'border-box' }}>
      <div style={{ fontWeight: 'bold', color: props.labelColor, marginBottom: 3 }}>Bank Details</div>
      {rows.length === 0 ? (
        <div style={{ color: '#87867f', fontSize: 8 }}>Bank details from company profile</div>
      ) : rows.map(([l, v]) => (
        <div key={l} style={{ display: 'flex', gap: 4 }}>
          <span style={{ color: props.labelColor, minWidth: 50 }}>{l}:</span>
          <span style={{ color: props.valueColor }}>{v}</span>
        </div>
      ))}
    </div>
  );
}
