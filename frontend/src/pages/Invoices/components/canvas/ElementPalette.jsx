const GROUPS = [
  {
    label: 'Layout',
    items: [
      { type: 'box',  icon: '□', label: 'Box / Container' },
      { type: 'line', icon: '─', label: 'Divider Line' },
    ],
  },
  {
    label: 'Content',
    items: [
      { type: 'text',  icon: 'T', label: 'Text Block' },
      { type: 'image', icon: '🖼', label: 'Image / Logo' },
      { type: 'field', icon: '≡', label: 'Data Field', highlight: true },
    ],
  },
  {
    label: 'Invoice',
    items: [
      { type: 'table',       icon: '⊞', label: 'Line Items Table' },
      { type: 'totals',      icon: '₹', label: 'Totals Block' },
      { type: 'amountwords', icon: '✍', label: 'Amount in Words' },
      { type: 'bankdetails', icon: '🏦', label: 'Bank Details' },
      { type: 'qrcode',      icon: '⬛', label: 'QR Code' },
    ],
  },
];

const STARTER_TEMPLATES = [
  { label: 'GST Logo',  key: 'gst_logo' },
  { label: 'Challan',   key: 'challan' },
  { label: 'e-Invoice', key: 'gst_einvoice' },
];

export default function ElementPalette({ onAddElement, onLoadStarter }) {
  return (
    <div style={{ background: '#141413', borderRight: '1px solid #30302e', padding: '12px 10px', overflowY: 'auto', height: '100%', width: 200, flexShrink: 0 }}>
      <div style={{ color: '#5e5d59', fontSize: 10, fontWeight: 700, letterSpacing: 1.5, marginBottom: 12, textTransform: 'uppercase' }}>Elements</div>

      {GROUPS.map(group => (
        <div key={group.label} style={{ marginBottom: 14 }}>
          <div style={{ color: '#87867f', fontSize: 11, fontWeight: 600, marginBottom: 6 }}>{group.label}</div>
          {group.items.map(item => (
            <div key={item.type}
              draggable
              onDragEnd={() => onAddElement(item.type)}
              onClick={() => onAddElement(item.type)}
              style={{
                background: item.highlight ? 'rgba(201,100,66,0.15)' : '#1e1e1c',
                border: item.highlight ? '1px solid rgba(201,100,66,0.4)' : '1px solid #30302e',
                borderRadius: 7, padding: '8px 10px', marginBottom: 5,
                fontSize: 13, color: item.highlight ? '#d97757' : '#e8e6dc',
                cursor: 'grab', display: 'flex', alignItems: 'center', gap: 9,
                fontWeight: item.highlight ? 600 : 400,
                userSelect: 'none',
                transition: 'background .12s',
              }}
              onMouseEnter={e => e.currentTarget.style.background = item.highlight ? 'rgba(201,100,66,0.25)' : '#2a2a28'}
              onMouseLeave={e => e.currentTarget.style.background = item.highlight ? 'rgba(201,100,66,0.15)' : '#1e1e1c'}
            >
              <span style={{ color: item.highlight ? '#d97757' : '#87867f', fontSize: 15, lineHeight: 1 }}>{item.icon}</span>
              {item.label}
            </div>
          ))}
        </div>
      ))}

      <div style={{ borderTop: '1px solid #30302e', paddingTop: 12 }}>
        <div style={{ color: '#87867f', fontSize: 11, fontWeight: 600, marginBottom: 6 }}>Start From</div>
        {STARTER_TEMPLATES.map(t => (
          <div key={t.key} onClick={() => onLoadStarter(t.key)}
            style={{ border: '1px dashed #3d3d3a', borderRadius: 7, padding: '8px 10px', marginBottom: 5, fontSize: 13, color: '#87867f', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}
            onMouseEnter={e => e.currentTarget.style.background = '#1e1e1c'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            <span style={{ color: '#c96442', fontSize: 15 }}>📋</span> {t.label}
          </div>
        ))}
      </div>
    </div>
  );
}
