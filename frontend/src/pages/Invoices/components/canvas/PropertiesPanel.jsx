import { FIELD_LABELS } from './elements/DataFieldElement';

const inp = { background: '#1e1e1c', border: '1px solid #3d3d3a', color: '#e8e6dc', borderRadius: 5, padding: '3px 6px', fontSize: 9, width: '100%', boxSizing: 'border-box' };
const labelSt = { color: '#5e5d59', fontSize: 8, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 3 };
const section = { marginBottom: 12 };

function ColorRow({ label, value, onChange }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
      <span style={{ color: '#87867f', fontSize: 8, minWidth: 36 }}>{label}</span>
      <input type="color" value={value === 'transparent' ? '#ffffff' : (value || '#ffffff')} onChange={e => onChange(e.target.value)}
        style={{ width: 20, height: 20, border: '1px solid #3d3d3a', borderRadius: 3, cursor: 'pointer', padding: 0, flexShrink: 0 }} />
      <input value={value || ''} onChange={e => onChange(e.target.value)} style={{ ...inp, width: '100%' }} placeholder="#000000 or transparent" />
    </div>
  );
}

export default function PropertiesPanel({ element, onUpdate, onDelete, onBringForward, onSendBackward, snapGrid, onSnapChange, gridSize, onGridSizeChange }) {
  if (!element) {
    return (
      <div style={{ padding: 12, color: '#5e5d59', fontSize: 10, textAlign: 'center', paddingTop: 32 }}>
        <div style={{ marginBottom: 8, fontSize: 20 }}>&#8592;</div>
        Click an element to edit its properties
        <div style={{ ...section, marginTop: 20, textAlign: 'left' }}>
          <div style={labelSt}>Canvas</div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={{ color: '#b0aea5', fontSize: 9 }}>Snap to grid</span>
            <div onClick={onSnapChange} style={{ background: snapGrid ? '#c96442' : '#30302e', borderRadius: 8, width: 28, height: 14, position: 'relative', cursor: 'pointer' }}>
              <div style={{ position: 'absolute', width: 10, height: 10, background: '#faf9f5', borderRadius: '50%', top: 2, left: snapGrid ? 16 : 2, transition: 'left .15s' }} />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ color: '#b0aea5', fontSize: 9 }}>Grid size</span>
            <input type="number" value={gridSize} min={4} max={32} onChange={e => onGridSizeChange(parseInt(e.target.value))}
              style={{ ...inp, width: 44, textAlign: 'center' }} />
          </div>
        </div>
      </div>
    );
  }

  const p = element.props;
  const up = changes => onUpdate(element.id, changes);

  return (
    <div style={{ padding: 10, overflowY: 'auto', height: '100%', boxSizing: 'border-box' }}>
      <div style={{ color: '#d97757', fontSize: 9, fontWeight: 600, marginBottom: 10 }}>
        {element.type.charAt(0).toUpperCase() + element.type.slice(1)} Element
      </div>

      <div style={section}>
        <div style={labelSt}>Position</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4 }}>
          {[['X', 'x'], ['Y', 'y']].map(([l, k]) => (
            <div key={k}>
              <div style={{ color: '#87867f', fontSize: 8, marginBottom: 2 }}>{l}</div>
              <input type="number" value={element[k]} style={inp} onChange={e => up({ [k]: parseInt(e.target.value) || 0 })} />
            </div>
          ))}
        </div>
      </div>

      <div style={section}>
        <div style={labelSt}>Size</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4 }}>
          {[['Width', 'width'], ['Height', 'height']].map(([l, k]) => (
            <div key={k}>
              <div style={{ color: '#87867f', fontSize: 8, marginBottom: 2 }}>{l}</div>
              <input type="number" value={element[k]} style={inp} onChange={e => up({ [k]: parseInt(e.target.value) || 20 })} />
            </div>
          ))}
        </div>
      </div>

      <div style={section}>
        <div style={labelSt}>Colours</div>
        {p.backgroundColor !== undefined && <ColorRow label="BG" value={p.backgroundColor} onChange={v => up({ props: { backgroundColor: v } })} />}
        {p.color !== undefined && <ColorRow label="Text" value={p.color} onChange={v => up({ props: { color: v } })} />}
        {p.borderColor !== undefined && <ColorRow label="Border" value={p.borderColor} onChange={v => up({ props: { borderColor: v } })} />}
        {p.headerBg !== undefined && <ColorRow label="Header BG" value={p.headerBg} onChange={v => up({ props: { headerBg: v } })} />}
        {p.headerColor !== undefined && <ColorRow label="Header Text" value={p.headerColor} onChange={v => up({ props: { headerColor: v } })} />}
        {p.grandTotalBg !== undefined && <ColorRow label="Total BG" value={p.grandTotalBg} onChange={v => up({ props: { grandTotalBg: v } })} />}
        {p.grandTotalColor !== undefined && <ColorRow label="Total Text" value={p.grandTotalColor} onChange={v => up({ props: { grandTotalColor: v } })} />}
        {p.oddRowBg !== undefined && <ColorRow label="Row 1" value={p.oddRowBg} onChange={v => up({ props: { oddRowBg: v } })} />}
        {p.evenRowBg !== undefined && <ColorRow label="Row 2" value={p.evenRowBg} onChange={v => up({ props: { evenRowBg: v } })} />}
      </div>

      {p.fontSize !== undefined && (
        <div style={section}>
          <div style={labelSt}>Typography</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4, marginBottom: 4 }}>
            <div>
              <div style={{ color: '#87867f', fontSize: 8, marginBottom: 2 }}>Size</div>
              <input type="number" value={p.fontSize} min={6} max={48} style={inp} onChange={e => up({ props: { fontSize: parseInt(e.target.value) } })} />
            </div>
            <div>
              <div style={{ color: '#87867f', fontSize: 8, marginBottom: 2 }}>Weight</div>
              <select value={p.fontWeight || 'normal'} style={inp} onChange={e => up({ props: { fontWeight: e.target.value } })}>
                <option value="normal">Normal</option><option value="bold">Bold</option>
              </select>
            </div>
          </div>
          {p.textAlign !== undefined && (
            <div style={{ display: 'flex', gap: 3 }}>
              {['left','center','right'].map(a => (
                <button key={a} onClick={() => up({ props: { textAlign: a } })}
                  style={{ flex: 1, background: p.textAlign === a ? '#c96442' : '#1e1e1c', border: '1px solid #3d3d3a', color: p.textAlign === a ? '#faf9f5' : '#b0aea5', borderRadius: 4, padding: '3px 0', fontSize: 10, cursor: 'pointer' }}>
                  {a[0].toUpperCase()}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {element.type === 'field' && (
        <div style={section}>
          <div style={labelSt}>Bound Field</div>
          <select value={p.field || ''} style={inp} onChange={e => up({ props: { field: e.target.value } })}>
            {Object.entries(FIELD_LABELS).map(([k, l]) => <option key={k} value={k}>{l}</option>)}
          </select>
          <div style={{ color: '#87867f', fontSize: 8, marginTop: 4, marginBottom: 2 }}>Label prefix</div>
          <input value={p.label || ''} style={inp} onChange={e => up({ props: { label: e.target.value } })} placeholder="e.g. Invoice No." />
        </div>
      )}

      {element.type === 'table' && (
        <div style={section}>
          <div style={labelSt}>Visible Columns</div>
          {['description','hsn','qty','unit','rate','discount','amount'].map(col => (
            <label key={col} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 9, color: '#b0aea5', cursor: 'pointer', marginBottom: 3 }}>
              <input type="checkbox" checked={(p.columns || []).includes(col)} style={{ accentColor: '#c96442' }}
                onChange={e => {
                  const cols = p.columns || [];
                  up({ props: { columns: e.target.checked ? [...cols, col] : cols.filter(c => c !== col) } });
                }} />
              {col.charAt(0).toUpperCase() + col.slice(1)}
            </label>
          ))}
        </div>
      )}

      {element.type === 'totals' && (
        <div style={section}>
          <div style={labelSt}>Show Rows</div>
          {[['showCgst','CGST'], ['showSgst','SGST'], ['showIgst','IGST']].map(([k, l]) => (
            <label key={k} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 9, color: '#b0aea5', cursor: 'pointer', marginBottom: 3 }}>
              <input type="checkbox" checked={!!p[k]} style={{ accentColor: '#c96442' }} onChange={e => up({ props: { [k]: e.target.checked } })} /> {l}
            </label>
          ))}
        </div>
      )}

      <div style={{ ...section, borderTop: '1px solid #30302e', paddingTop: 10 }}>
        <div style={labelSt}>Layer</div>
        <div style={{ display: 'flex', gap: 4 }}>
          <button onClick={() => onBringForward(element.id)} style={{ flex: 1, background: '#1e1e1c', border: '1px solid #3d3d3a', color: '#b0aea5', borderRadius: 5, padding: '4px 0', fontSize: 9, cursor: 'pointer' }}>&#8593; Forward</button>
          <button onClick={() => onSendBackward(element.id)} style={{ flex: 1, background: '#1e1e1c', border: '1px solid #3d3d3a', color: '#b0aea5', borderRadius: 5, padding: '4px 0', fontSize: 9, cursor: 'pointer' }}>&#8595; Back</button>
        </div>
      </div>

      <button onClick={() => onDelete(element.id)} style={{ width: '100%', background: 'rgba(181,89,59,.15)', border: '1px solid rgba(181,89,59,.3)', color: '#b5593b', borderRadius: 6, padding: '5px 0', fontSize: 9, cursor: 'pointer', marginTop: 4 }}>
        &#128465; Delete Element
      </button>
    </div>
  );
}
