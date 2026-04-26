import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Star, Trash2 } from 'lucide-react';
import { templatesAPI } from '../../api/invoiceTemplates';
import toast from 'react-hot-toast';

export default function TemplateManager() {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    try {
      const { data } = await templatesAPI.list();
      setTemplates(data.results || data || []);
    } catch { toast.error('Failed to load templates'); }
    finally { setLoading(false); }
  }

  async function handleDelete(id) {
    if (!confirm('Delete this template?')) return;
    try { await templatesAPI.delete(id); load(); toast.success('Deleted'); }
    catch { toast.error('Delete failed'); }
  }

  async function handleDuplicate(id) {
    try { await templatesAPI.duplicate(id); load(); toast.success('Duplicated'); }
    catch { toast.error('Duplicate failed'); }
  }

  async function handleSetDefault(id) {
    try { await templatesAPI.setDefault(id); load(); toast.success('Set as default'); }
    catch { toast.error('Failed'); }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 style={{ fontFamily: 'Georgia, serif', fontSize: 22, margin: 0 }} className="u-text">Invoice Templates</h1>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 60, color: '#87867f', fontSize: 13 }}>Loading…</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 style={{ fontFamily: 'Georgia, serif', fontSize: 22, margin: 0 }} className="u-text">Invoice Templates</h1>
        <button onClick={() => navigate('/invoices/templates/new')}
          style={{ background: 'var(--brand)', border: 'none', color: 'var(--brand-fg, #faf9f5)', padding: '8px 16px', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
          <Plus size={14} /> New Template
        </button>
      </div>

      {templates.length === 0 ? (
        <div className="u-card" style={{ padding: 48, textAlign: 'center' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>📋</div>
          <p className="u-text-3" style={{ marginBottom: 16 }}>No templates yet. Create one or upload an invoice image.</p>
          <button onClick={() => navigate('/invoices/templates/new')}
            style={{ background: 'var(--brand)', border: 'none', color: 'var(--brand-fg, #faf9f5)', padding: '8px 16px', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <Plus size={14} /> Create First Template
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
          {templates.map(t => (
            <div key={t.id} className="u-card" style={{ overflow: 'hidden', border: t.is_default ? '2px solid var(--brand)' : '1px solid var(--border)' }}>
              <div style={{ height: 120, background: 'var(--bg-surface-2, #1e1e1c)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', cursor: 'pointer' }}
                onClick={() => navigate(`/invoices/templates/${t.id}`)}>
                {t.thumbnail
                  ? <img src={t.thumbnail} alt={t.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                  : <div style={{ fontSize: 40, opacity: .3 }}>📄</div>
                }
                {t.is_default && (
                  <span style={{ position: 'absolute', top: 6, left: 6, background: 'var(--brand)', color: 'var(--brand-fg, #faf9f5)', fontSize: 9, padding: '2px 7px', borderRadius: 4, fontWeight: 700 }}>Default</span>
                )}
              </div>
              <div style={{ padding: '10px 12px' }}>
                <div className="u-text" style={{ fontWeight: 600, fontSize: 13, marginBottom: 2 }}>{t.name}</div>
                <div className="u-text-3" style={{ fontSize: 11, marginBottom: 10 }}>Updated {new Date(t.updated_at).toLocaleDateString('en-IN')}</div>
                <div style={{ display: 'flex', gap: 4 }}>
                  <button onClick={() => navigate(`/invoices/templates/${t.id}`)}
                    className="u-text-2" style={{ flex: 1, fontSize: 11, padding: '4px 0', borderRadius: 6, background: 'var(--bg-surface-2)', border: '1px solid var(--border)', cursor: 'pointer' }}>Edit</button>
                  <button onClick={() => handleDuplicate(t.id)}
                    className="u-text-2" style={{ flex: 1, fontSize: 11, padding: '4px 0', borderRadius: 6, background: 'var(--bg-surface-2)', border: '1px solid var(--border)', cursor: 'pointer' }}>Copy</button>
                  {!t.is_default && (
                    <button onClick={() => handleSetDefault(t.id)} title="Set as default"
                      className="u-text-3" style={{ padding: '4px 8px', borderRadius: 6, background: 'var(--bg-surface-2)', border: '1px solid var(--border)', cursor: 'pointer' }}><Star size={12} /></button>
                  )}
                  <button onClick={() => handleDelete(t.id)}
                    style={{ padding: '4px 8px', borderRadius: 6, background: 'rgba(220,38,38,.08)', border: '1px solid rgba(220,38,38,.2)', color: '#dc2626', cursor: 'pointer' }}><Trash2 size={12} /></button>
                </div>
              </div>
            </div>
          ))}

          <div onClick={() => navigate('/invoices/templates/new')}
            className="u-card" style={{ minHeight: 200, border: '1.5px dashed var(--border)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', gap: 8 }}>
            <div style={{ width: 36, height: 36, background: 'rgba(201,100,66,.1)', border: '1.5px dashed var(--brand)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--brand)', fontSize: 20 }}>+</div>
            <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--brand)' }}>New Template</div>
            <div className="u-text-3" style={{ fontSize: 11, textAlign: 'center', padding: '0 16px' }}>Start blank or upload an image</div>
          </div>
        </div>
      )}
    </div>
  );
}
