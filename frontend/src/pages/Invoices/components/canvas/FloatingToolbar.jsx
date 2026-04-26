const SWATCHES = ['#141413','#c96442','#8b0000','#1a237e','#2e7d32','#4a148c','#e65100','#ffffff','#faf9f5','transparent'];

function Swatch({ color, active, onClick }) {
  return (
    <div onClick={() => onClick(color)}
      style={{ width: 16, height: 16, background: color === 'transparent' ? 'none' : color, border: active ? '2px solid #c96442' : '1px solid #3d3d3a', borderRadius: 3, cursor: 'pointer', flexShrink: 0, backgroundImage: color === 'transparent' ? 'repeating-conic-gradient(#ccc 0% 25%, white 0% 50%) 0 0 / 8px 8px' : 'none' }}
    />
  );
}

export default function FloatingToolbar({ element, onUpdate, onDelete, onShowMore }) {
  if (!element) return null;
  const p = element.props;
  const isText = ['text', 'field', 'amountwords'].includes(element.type);

  return (
    <div onMouseDown={e => e.stopPropagation()}
      style={{ position: 'absolute', top: -48, left: '50%', transform: 'translateX(-50%)', zIndex: 9999, background: '#141413', border: '1px solid #3d3d3a', borderRadius: 8, padding: '5px 10px', display: 'flex', alignItems: 'center', gap: 8, boxShadow: '0 4px 16px rgba(0,0,0,.6)', whiteSpace: 'nowrap', pointerEvents: 'all' }}>

      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        <span style={{ color: '#87867f', fontSize: 8 }}>BG</span>
        {SWATCHES.map(c => <Swatch key={c} color={c} active={p.backgroundColor === c} onClick={col => onUpdate({ props: { backgroundColor: col } })} />)}
        <input type="color" value={p.backgroundColor === 'transparent' ? '#ffffff' : (p.backgroundColor || '#ffffff')}
          onChange={e => onUpdate({ props: { backgroundColor: e.target.value } })}
          style={{ width: 18, height: 18, border: '1px solid #3d3d3a', borderRadius: 3, cursor: 'pointer', padding: 0 }} title="Custom colour" />
      </div>

      <div style={{ width: 1, height: 18, background: '#30302e' }} />

      {isText && (
        <>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ color: '#87867f', fontSize: 8 }}>T</span>
            {['#141413','#ffffff','#faf9f5','#c96442','#1a237e','#8b0000'].map(c => <Swatch key={c} color={c} active={p.color === c} onClick={col => onUpdate({ props: { color: col } })} />)}
            <input type="color" value={p.color || '#141413'} onChange={e => onUpdate({ props: { color: e.target.value } })}
              style={{ width: 18, height: 18, border: '1px solid #3d3d3a', borderRadius: 3, cursor: 'pointer', padding: 0 }} />
          </div>
          <div style={{ width: 1, height: 18, background: '#30302e' }} />
          <input type="number" value={p.fontSize || 11} min={6} max={48}
            onChange={e => onUpdate({ props: { fontSize: parseInt(e.target.value) } })}
            style={{ background: '#1e1e1c', border: '1px solid #3d3d3a', color: '#e8e6dc', borderRadius: 4, padding: '2px 4px', fontSize: 9, width: 38, textAlign: 'center' }} />
          <button onClick={() => onUpdate({ props: { fontWeight: p.fontWeight === 'bold' ? 'normal' : 'bold' } })}
            style={{ background: p.fontWeight === 'bold' ? '#c96442' : '#1e1e1c', border: '1px solid #3d3d3a', color: p.fontWeight === 'bold' ? '#faf9f5' : '#b0aea5', borderRadius: 4, padding: '2px 6px', fontSize: 10, fontWeight: 'bold', cursor: 'pointer' }}>B</button>
        </>
      )}

      <div style={{ width: 1, height: 18, background: '#30302e' }} />
      <button onClick={onShowMore} style={{ background: '#1e1e1c', border: '1px solid #3d3d3a', color: '#b0aea5', borderRadius: 4, padding: '2px 8px', fontSize: 9, cursor: 'pointer' }}>More &rsaquo;</button>
      <button onClick={onDelete} style={{ background: 'transparent', border: 'none', color: '#5e5d59', cursor: 'pointer', fontSize: 13, lineHeight: 1 }}>&#128465;</button>
    </div>
  );
}
