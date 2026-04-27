import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { templatesAPI } from '../../../api/invoiceTemplates';
import toast from 'react-hot-toast';

export default function TemplatePickerModal({ currentId, onSelect, onClose }) {
  const [templates, setTemplates] = useState([]);
  const [selected, setSelected] = useState(currentId || null);

  useEffect(() => {
    templatesAPI.list()
      .then(({ data }) => setTemplates(data.results || data || []))
      .catch(() => toast.error('Failed to load templates'));
  }, []);

  function handleConfirm() {
    const tmpl = templates.find(t => t.id === selected);
    onSelect(tmpl || null);
    onClose();
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.5)', zIndex: 9998, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="u-card" style={{ width: 560, maxHeight: '80vh', display: 'flex', flexDirection: 'column', padding: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <h2 style={{ margin: 0, fontSize: 15, fontFamily: 'Georgia,serif' }} className="u-text">Choose a Template</h2>
          <button onClick={onClose} className="u-text-3" style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={18} /></button>
        </div>
        <p className="u-text-3" style={{ fontSize: 12, marginBottom: 16, marginTop: 0 }}>Your invoice will use this layout. You can change it later.</p>

        {templates.length === 0 ? (
          <div style={{ padding: 32, textAlign: 'center', color: '#87867f', fontSize: 13 }}>
            No templates yet. <a href="/invoices/templates/new" style={{ color: 'var(--brand)' }}>Create one first</a>.
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, overflowY: 'auto', flex: 1, marginBottom: 14 }}>
            {templates.map(t => (
              <div key={t.id} onClick={() => setSelected(t.id)}
                style={{ border: selected === t.id ? '2px solid var(--brand)' : '1px solid var(--border)', borderRadius: 8, overflow: 'hidden', cursor: 'pointer' }}>
                <div style={{ height: 80, background: 'var(--bg-surface-2, #f5f4ed)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {t.thumbnail
                    ? <img src={t.thumbnail} alt={t.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                    : <span style={{ fontSize: 28, opacity: .3 }}>📄</span>
                  }
                </div>
                <div style={{ padding: '5px 8px' }}>
                  <div className="u-text" style={{ fontSize: 11, fontWeight: 600 }}>{t.name} {t.is_default ? '★' : ''}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button onClick={() => { onSelect(null); onClose(); }} className="u-text-3" style={{ background: 'none', border: 'none', fontSize: 12, cursor: 'pointer' }}>
            Skip — use default
          </button>
          <button onClick={handleConfirm} disabled={!selected}
            style={{ background: 'var(--brand)', border: 'none', color: 'var(--brand-fg, #faf9f5)', padding: '6px 18px', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: selected ? 'pointer' : 'not-allowed', opacity: selected ? 1 : .5 }}>
            Use Selected →
          </button>
        </div>
      </div>
    </div>
  );
}
